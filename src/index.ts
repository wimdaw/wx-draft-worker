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
import { apiTokenAuth, adminAuthMiddleware, handleLogin, handleLogout } from './auth'
import { WeChat } from './wechat'
import { pushDraft } from './draft'
import { adminApi } from './admin'
import { renderHomePage, renderLoginPage, renderAdminPage } from './pages'
import { ADMIN_JS } from './admin_app'
import { seedInitialData } from './storage'
import { CSS } from './pages.css'

const NAME = 'wx-draft-worker'
const VERSION = '2.0.0'

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
app.get('/admin', (c) => c.html(renderAdminPage({ baseUrl: origin(c) })))

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
  if (!body?.content) return fail('缺少 content（正文）', 400)
  const tokenName = (c.get('tokenName' as never) as string | null) ?? null
  return pushDraft(c.env, body, tokenName)
})

// 草稿列表
app.get('/api/drafts', async (c) => {
  try {
    if (!c.env.WECHAT_APPID || !c.env.WECHAT_APPSECRET) {
      throw new Error('服务端未配置 WECHAT_APPID / WECHAT_APPSECRET')
    }
    const offset = Number(c.req.query('offset') ?? 0) || 0
    const count = Math.min(Number(c.req.query('count') ?? 20) || 20, 20)
    const wx = new WeChat(c.env.WECHAT_APPID, c.env.WECHAT_APPSECRET)
    const data = await wx.batchGetDrafts(offset, count)
    return ok({
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
    if (!c.env.WECHAT_APPID || !c.env.WECHAT_APPSECRET) {
      throw new Error('服务端未配置 WECHAT_APPID / WECHAT_APPSECRET')
    }
    const mediaId = c.req.param('mediaId')
    const wx = new WeChat(c.env.WECHAT_APPID, c.env.WECHAT_APPSECRET)
    await wx.deleteDraft(mediaId)
    return ok({ media_id: mediaId })
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
