/**
 * wx-draft-worker —— 微信公众号草稿推送网关
 * 基于 Cloudflare Workers + Hono，免服务器 / 免备案
 *
 * 接口：
 *   GET    /                     健康检查
 *   GET    /api/health           配置检查
 *   POST   /api/draft            新建草稿
 *   GET    /api/drafts           草稿列表
 *   DELETE /api/drafts/:mediaId  删除草稿
 */
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import type { Env, DraftRequest } from './types'
import { ok, fail, makeDigest, truncate } from './utils'
import { apiKeyAuth } from './auth'
import { WeChat } from './wechat'
import { renderMarkdown } from './markdown'

const NAME = 'wx-draft-worker'
const VERSION = '1.0.0'

const app = new Hono<{ Bindings: Env }>()

// ===== 全局中间件 =====
app.use('*', cors({ origin: '*' }))
app.use('*', logger())
app.use('*', apiKeyAuth)

// ===== 健康检查（无需鉴权） =====
app.get('/', (c) =>
  ok({
    service: NAME,
    version: VERSION,
    appid_configured: !!c.env.WECHAT_APPID,
    secret_configured: !!c.env.WECHAT_APPSECRET,
    auth_enabled: !!c.env.DRAFT_API_KEY,
    time: new Date().toISOString(),
  }),
)

app.get('/api/health', (c) =>
  ok({
    service: NAME,
    version: VERSION,
    appid_configured: !!c.env.WECHAT_APPID,
    secret_configured: !!c.env.WECHAT_APPSECRET,
    auth_enabled: !!c.env.DRAFT_API_KEY,
    time: new Date().toISOString(),
  }),
)

// ===== 新建草稿 =====
app.post('/api/draft', async (c) => {
  let body: DraftRequest
  try {
    body = await c.req.json<DraftRequest>()
  } catch {
    return fail('请求体不是合法 JSON', 400)
  }

  try {
    if (!c.env.WECHAT_APPID || !c.env.WECHAT_APPSECRET) {
      throw new Error('服务端未配置 WECHAT_APPID / WECHAT_APPSECRET')
    }
    let content = body?.content
    if (!content) throw new Error('缺少 content（正文）')
    if (body.contentType === 'markdown') content = renderMarkdown(content)

    const wx = new WeChat(c.env.WECHAT_APPID, c.env.WECHAT_APPSECRET)

    // 1) 正文图片转存到微信域名
    const loc = await wx.localizeImages(content)
    content = loc.html

    // 2) 解析封面 → thumb_media_id（缺省取正文首图）
    const thumbMediaId = await wx.resolveCover(body.cover, content)
    if (!thumbMediaId) {
      throw new Error('无法生成封面：请传入 cover，或在正文中至少包含一张图片')
    }

    // 3) 组装并提交草稿
    const title = truncate(String(body.title || '未命名文章'), 64)
    const mediaId = await wx.addDraft({
      title,
      author: truncate(String(body.author || ''), 8),
      digest: truncate(String(body.digest || makeDigest(content)), 120),
      content,
      thumb_media_id: thumbMediaId,
      need_open_comment: body.needOpenComment === 0 ? 0 : 1,
      only_fans_can_comment: body.onlyFansCanComment ? 1 : 0,
      ...(body.contentSourceUrl ? { content_source_url: body.contentSourceUrl } : {}),
    })

    return ok({ media_id: mediaId, title, images: loc.localized })
  } catch (e) {
    return fail(String((e as Error)?.message ?? e), 500)
  }
})

// ===== 草稿列表 =====
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

// ===== 删除草稿 =====
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

// ===== 404 =====
app.notFound((c) => fail('接口不存在', 404))

export default app
