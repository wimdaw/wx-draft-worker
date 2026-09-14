/**
 * wx-draft-worker · 推送核心
 * 供业务 API（POST /api/draft）与后台在线试用共用；每次推送都会落库记录。
 * 支持单图文与多图文（articles[]，1~8 篇）。
 */
import type { Env, DraftRequest, DraftArticleInput, WxArticle } from './types'
import { ok, fail, makeDigest, truncate } from './utils'
import { WeChat } from './wechat'
import { renderMarkdown } from './markdown'
import { addDraftRecord, resolveAccount } from './storage'

/** 微信单次草稿最多 8 篇 */
const MAX_ARTICLES = 8

/** 内容渲染：contentType=html 原样；markdown 渲染；未指定时自动识别（无 HTML 标签则按 Markdown 处理） */
function renderIfNeeded(content: string, contentType?: string): string {
  if (contentType === 'html') return content
  if (contentType === 'markdown') return renderMarkdown(content)
  return /<[a-z][^>]*>/i.test(content) ? content : renderMarkdown(content)
}

/** 把请求归一化为待推送的篇目列表；顶层字段作为各篇缺省值 */
function normalizeArticles(body: DraftRequest): DraftArticleInput[] {
  const raw: DraftArticleInput[] =
    Array.isArray(body.articles) && body.articles.length
      ? body.articles
      : [
          {
            title: body.title,
            author: body.author,
            digest: body.digest,
            content: body.content,
            cover: body.cover,
            contentType: body.contentType,
            contentSourceUrl: body.contentSourceUrl,
            needOpenComment: body.needOpenComment,
            onlyFansCanComment: body.onlyFansCanComment,
          },
        ]
  return raw.slice(0, MAX_ARTICLES).map((a) => ({
    title: a.title ?? body.title,
    author: a.author ?? body.author,
    digest: a.digest,
    content: a.content ?? body.content,
    cover: a.cover ?? body.cover,
    contentType: a.contentType ?? body.contentType,
    contentSourceUrl: a.contentSourceUrl ?? body.contentSourceUrl,
    needOpenComment: a.needOpenComment ?? body.needOpenComment,
    onlyFansCanComment: a.onlyFansCanComment ?? body.onlyFansCanComment,
  }))
}

/** 执行一次草稿推送并返回响应（自动记录成功/失败） */
export async function pushDraft(
  env: Env,
  body: DraftRequest,
  tokenName: string | null,
  accountId?: string | null,
  ownerId?: string | null,
): Promise<Response> {
  const started = Date.now()
  // 解析本次要推送到的公众号：显式指定 > 默认账号 > 环境变量凭据
  // ownerId 非空时（会员令牌 / 会员登录）只在该用户名下的公众号中查找
  let account: { id: string; name: string; appid: string; appsecret: string } | null = null
  try {
    account = await resolveAccount(env, accountId ?? body?.accountId ?? null, ownerId ?? null)
  } catch {
    /* 解析异常按「未配置公众号」处理，下面会给出明确提示 */
  }
  const accountName = account?.name ?? null

  const articles = normalizeArticles(body ?? {})
  const articleCount = articles.length
  const first = articles[0] ?? {}
  const title = truncate(String(first.title || '未命名文章'), 64)
  const author = truncate(String(first.author || ''), 8)
  const contentLen = articles.reduce((n, a) => n + String(a.content ?? '').length, 0)
  let images = 0

  try {
    if (!account) {
      throw new Error(
        ownerId
          ? '尚未添加公众号：请到后台「账号管理」添加 AppID / AppSecret'
          : '尚未添加公众号：请到后台「账号管理」添加 AppID / AppSecret，或配置 WECHAT_APPID 与 WECHAT_APPSECRET 环境变量',
      )
    }
    if (!articleCount) throw new Error('缺少 content（正文）')

    const wx = new WeChat(account.appid, account.appsecret)
    const built: WxArticle[] = []
    const failedImages: string[] = []

    for (let i = 0; i < articles.length; i++) {
      const a = articles[i]
      const raw = String(a.content ?? '')
      if (!raw.trim()) {
        throw new Error(articleCount > 1 ? `第 ${i + 1} 篇缺少 content（正文）` : '缺少 content（正文）')
      }

      // 1) 正文渲染 + 图片转存到微信域名
      const loc = await wx.localizeImages(renderIfNeeded(raw, a.contentType))
      images += loc.localized ?? 0
      if (loc.failed?.length) failedImages.push(...loc.failed)

      // 2) 封面 → thumb_media_id（缺省取该篇正文首图）
      const thumbMediaId = await wx.resolveCover(a.cover, loc.html)
      if (!thumbMediaId) {
        throw new Error(
          articleCount > 1
            ? `无法生成封面：第 ${i + 1} 篇请传入 cover，或在正文中至少包含一张图片`
            : '无法生成封面：请传入 cover，或在正文中至少包含一张图片',
        )
      }

      built.push({
        title: truncate(String(a.title || '未命名文章'), 64),
        author: truncate(String(a.author || ''), 8),
        digest: truncate(String(a.digest || makeDigest(loc.html)), 120),
        content: loc.html,
        thumb_media_id: thumbMediaId,
        need_open_comment: a.needOpenComment === 0 ? 0 : 1,
        only_fans_can_comment: a.onlyFansCanComment ? 1 : 0,
        ...(a.contentSourceUrl ? { content_source_url: a.contentSourceUrl } : {}),
      })
    }

    // 3) 一次性提交（多图文则含多篇）
    const mediaId = await wx.addDraft(built)

    await addDraftRecord(env, {
      media_id: mediaId,
      title,
      author,
      status: 'success',
      error: null,
      duration_ms: Date.now() - started,
      images,
      content_len: contentLen,
      token_name: tokenName,
      account_id: account.id || null,
      account_name: accountName,
      user_id: ownerId ?? null,
      article_count: articleCount,
    })

    return ok({
      media_id: mediaId,
      title,
      article_count: articleCount,
      images,
      failed_images: failedImages,
      account: accountName,
    })
  } catch (e) {
    const message = String((e as Error)?.message ?? e)
    await addDraftRecord(env, {
      media_id: null,
      title,
      author,
      status: 'failed',
      error: message,
      duration_ms: Date.now() - started,
      images,
      content_len: contentLen,
      token_name: tokenName,
      account_id: account?.id || null,
      account_name: accountName,
      user_id: ownerId ?? null,
      article_count: articleCount,
    })
    return fail(message, 500)
  }
}
