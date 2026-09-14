/**
 * wx-draft-worker —— 微信公众号草稿推送网关
 * 基于 Cloudflare Workers + Hono，免服务器 / 免备案
 *
 * 路由：
 *   /                       产品首页
 *   /admin/login            后台登录（GET 页面 / POST 提交）
 *   /admin                  后台控制台（需登录）
 *   /admin/app.js           后台前端脚本
 *   /admin/api/*            后台 API（需登录）
 *   /api/draft              新建草稿（需令牌）
 *   /api/drafts             草稿列表（需令牌）
 *   /api/drafts/:mediaId    删除草稿（需令牌）
 *   /api/health             健康检查（公开）
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Env, DraftRequest } from './types'
import { ok, fail } from './utils'
import { apiTokenAuth, adminAuthMiddleware, handleLogin, handleLogout, currentUser } from './auth'
import { WeChat } from './wechat'
import { pushDraft } from './draft'
import { adminApi } from './admin'
import { renderHomePage, renderLoginPage, renderAdminPage } from './pages'
import { ADMIN_JS } from './admin_app'
import { seedInitialData, resolveAccount } from './storage'
import { sourceToBlob } from './images'
import { CSS } from './pages.css'

const NAME = 'wx-draft-worker'
const VERSION = '2.1.0'  // 2.1.0: img src HTML 实体解码，修复外链图转存 400（图丢失）

const app = new Hono<{ Bindings: Env }>()

// ===== 全局中间件 =====
app.use('*', logger())
app.use('*', cors({ origin: '*' }))

// 首次请求时建表 + 迁移旧版密钥（失败不阻塞）
let booted = false
app.use('*', async (c, next) => {
  if (!booted && c.env.DB) {
    try {
      await seedInitialData(c.env)
      booted = true
    } catch (e) {
      console.error('初始化失败:', e)
    }
  }
  await next()
})

const origin = (c: { req: { url: string } }): string => {
  try {
    return new URL(c.req.url).origin
  } catch {
    return ''
  }
}

/** 是否至少有一篇正文：单图文看 content，多图文看 articles 中是否有非空 content */
function hasAnyContent(body?: DraftRequest | null): boolean {
  if (!body) return false
  if (String(body.content ?? '').trim()) return true
  return Array.isArray(body.articles) && body.articles.some((a) => String(a?.content ?? '').trim())
}

// ==================== 首页 ====================
app.get('/', (c) => c.html(renderHomePage(origin(c))))

// ==================== 后台登录（必须在鉴权中间件之前注册） ====================
app.get('/admin/login', (c) => {
  const failed = c.req.query('error') === '1'
  return c.html(renderLoginPage({ error: failed, baseUrl: origin(c) }))
})
app.post('/admin/login', handleLogin)
app.get('/admin/logout', handleLogout)
app.post('/admin/logout', handleLogout)

// ==================== 后台静态资源 ====================
app.get('/admin/app.js', (c) =>
  c.body(ADMIN_JS, 200, {
    'content-type': 'application/javascript; charset=utf-8',
    'cache-control': 'no-store',
  }),
)

// ==================== 后台 API（需登录） ====================
app.use('/admin/api/*', adminAuthMiddleware)
app.route('/admin/api', adminApi)

// ==================== 后台页面（需登录） ====================
app.use('/admin', adminAuthMiddleware)
app.get('/admin', (c) => {
  const user = currentUser(c)
  return c.html(
    renderAdminPage({
      baseUrl: origin(c),
      user: user ? { username: user.username, role: user.role } : undefined,
    }),
  )
})

// ==================== 健康检查（公开） ====================
app.get('/api/health', async (c) => {
  let dbConnected = false
  try {
    await c.env.DB.prepare('SELECT 1 AS ok').first()
    dbConnected = true
  } catch {
    /* 数据库不可用 */
  }
  return ok({
    service: NAME,
    version: VERSION,
    appid_configured: !!c.env.WECHAT_APPID,
    secret_configured: !!c.env.WECHAT_APPSECRET,
    auth_enabled: !!c.env.DRAFT_API_KEY,
    db_connected: dbConnected,
    time: new Date().toISOString(),
  })
})

// ==================== 业务 API（需令牌） ====================
app.use('/api/*', apiTokenAuth)

// 新建草稿
app.post('/api/draft', async (c) => {
  let body: DraftRequest
  try {
    body = (await c.req.json()) as DraftRequest
  } catch {
    return fail('请求体必须是合法 JSON', 400)
  }
  if (!hasAnyContent(body)) return fail('缺少 content（正文）', 400)
  const tokenName = (c.get('tokenName' as never) as string | null) ?? null
  const ownerId = (c.get('apiOwnerId' as never) as string | null) ?? null
  return pushDraft(c.env, body, tokenName, body?.accountId ?? null, ownerId)
})

// 草稿列表
app.get('/api/drafts', async (c) => {
  try {
    const ownerId = (c.get('apiOwnerId' as never) as string | null) ?? null
    const account = await resolveAccount(c.env, null, ownerId)
    if (!account) throw new Error('尚未配置公众号：请在后台添加 AppID / AppSecret')
    const offset = Number(c.req.query('offset') ?? 0) || 0
    const count = Math.min(Number(c.req.query('count') ?? 20) || 20, 20)
    const wx = new WeChat(account.appid, account.appsecret)
    const data = await wx.batchGetDrafts(offset, count)
    return ok({
      account: account.name,
      total_count: data.total_count ?? 0,
      item_count: data.item_count ?? 0,
      item: data.item ?? [],
    })
  } catch (e) {
    return fail(String((e as Error)?.message ?? e), 500)
  }
})

// 删除草稿
app.delete('/api/drafts/:mediaId', async (c) => {
  try {
    const ownerId = (c.get('apiOwnerId' as never) as string | null) ?? null
    const account = await resolveAccount(c.env, null, ownerId)
    if (!account) throw new Error('尚未配置公众号：请在后台添加 AppID / AppSecret')
    const mediaId = c.req.param('mediaId')
    const wx = new WeChat(account.appid, account.appsecret)
    await wx.deleteDraft(mediaId)
    return ok({ media_id: mediaId, account: account.name })
  } catch (e) {
    return fail(String((e as Error)?.message ?? e), 500)
  }
})

// 上传图片为永久素材（返回 media_id 与微信域名 URL，可在正文 / 封面中复用）
app.post('/api/material', async (c) => {
  let body: { url?: string; dataUri?: string; filename?: string }
  try {
    body = (await c.req.json()) as { url?: string; dataUri?: string; filename?: string }
  } catch {
    return fail('请求体必须是合法 JSON', 400)
  }
  const source = String(body.dataUri || body.url || '').trim()
  if (!source) return fail('缺少 url 或 dataUri', 400)
  try {
    const ownerId = (c.get('apiOwnerId' as never) as string | null) ?? null
    const account = await resolveAccount(c.env, null, ownerId)
    if (!account) throw new Error('尚未配置公众号：请在后台添加 AppID / AppSecret')
    const blob = await sourceToBlob(source)
    if (!blob) throw new Error('无法读取图片：请提供可访问的图片 URL 或 data URI')
    const wx = new WeChat(account.appid, account.appsecret)
    const up = await wx.uploadPermanentImage(blob, String(body.filename || 'image.png'))
    return ok({ media_id: up.media_id, url: up.url, account: account.name })
  } catch (e) {
    return fail(String((e as Error)?.message ?? e), 500)
  }
})

/** 统一风格的错误页（沿用首页设计系统的令牌与字体） */
function errorPageHtml(code: string, title: string, desc: string): string {
  return `<!DOCTYPE html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${code} · ${title} · 草稿推送网关</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Space+Grotesk:wght@500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<style>${CSS}</style></head>
<body class="site-page"><main class="auth-shell" style="grid-template-columns:minmax(0,1fr)">
  <section class="auth-form-wrap" style="text-align:center;align-items:center;justify-content:center">
    <p class="eyebrow" style="justify-content:center"><span aria-hidden="true"></span>ERROR ${code}</p>
    <h1 style="font-size:clamp(2.5rem,8vw,4rem)">${code}</h1>
    <p style="max-width:48ch;margin-block:var(--space-sm) var(--space-lg);color:var(--color-muted)">${desc}</p>
    <div class="sp" style="justify-content:center">
      <a class="btn btn-p" href="/"><i class="fas fa-house" aria-hidden="true"></i>返回首页</a>
      <a class="btn btn-s" href="/admin"><i class="fas fa-sliders-h" aria-hidden="true"></i>管理控制台</a>
    </div>
  </section>
</main></body></html>`
}

// ===== 404 =====
app.notFound((c) => {
  if (c.req.path.startsWith('/api/') || c.req.path.startsWith('/admin/api/')) return fail('接口不存在', 404)
  return c.html(errorPageHtml('404', '页面不存在', '你访问的地址不存在或已被移动，请检查链接是否正确。'), 404)
})

// ===== 错误处理 =====
app.onError((err, c) => {
  console.error('未捕获的错误:', err)
  if (c.req.path.startsWith('/api/') || c.req.path.startsWith('/admin/api/')) {
    return fail('服务器内部错误', 500)
  }
  return c.html(errorPageHtml('500', '服务器内部错误', '服务暂时出了点问题，请稍后重试；若持续出现请检查 Worker 日志。'), 500)
})

export default app
