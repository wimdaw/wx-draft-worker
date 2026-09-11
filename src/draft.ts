/**
 * wx-draft-worker · 推送核心
 * 供业务 API（POST /api/draft）与后台在线试用共用；每次推送都会落库记录。
 */
import type { Env, DraftRequest } from './types'
import { ok, fail, makeDigest, truncate } from './utils'
import { WeChat } from './wechat'
import { renderMarkdown } from './markdown'
import { addDraftRecord, resolveAccount } from './storage'

/** 内容渲染：contentType=html 原样；markdown 渲染；未指定时自动识别（无 HTML 标签则按 Markdown 处理） */
function renderIfNeeded(content: string, contentType?: string): string {
  if (contentType === 'html') return content
  if (contentType === 'markdown') return renderMarkdown(content)
  return /<[a-z][^>]*>/i.test(content) ? content : renderMarkdown(content)
}

/** 执行一次草稿推送并返回响应（自动记录成功/失败） */
export async function pushDraft(
  env: Env,
  body: DraftRequest,
  tokenName: string | null,
  accountId?: string | null,
): Promise<Response> {
  const started = Date.now()
  // 解析本次要推送到的公众号：显式指定 > 默认账号 > 环境变量凭据
  let account: { id: string; name: string; appid: string; appsecret: string } | null = null
  try {
    account = await resolveAccount(env, accountId ?? body?.accountId ?? null)
  } catch {
    /* 解析异常按「未配置公众号」处理，下面会给出明确提示 */
  }
  const accountName = account?.name ?? null
  const title = truncate(String(body?.title || '未命名文章'), 64)
  const author = truncate(String(body?.author || ''), 8)
  const contentLen = String(body?.content ?? '').length
  let images = 0

  try {
    if (!account) {
      throw new Error('尚未添加公众号：请到后台「公众号管理」添加 AppID / AppSecret，或配置 WECHAT_APPID 与 WECHAT_APPSECRET 环境变量')
    }

    let content = body?.content
    if (!content) throw new Error('缺少 content（正文）')
    content = renderIfNeeded(content, body.contentType)

    const wx = new WeChat(account.appid, account.appsecret)

    // 1) 正文图片转存到微信域名
    const loc = await wx.localizeImages(content)
    content = loc.html
    images = loc.localized ?? 0

    // 2) 解析封面 → thumb_media_id（缺省取正文首图）
    const thumbMediaId = await wx.resolveCover(body.cover, content)
    if (!thumbMediaId) {
      throw new Error('无法生成封面：请传入 cover，或在正文中至少包含一张图片')
    }

    // 3) 组装并提交草稿
    const mediaId = await wx.addDraft({
      title,
      author,
      digest: truncate(String(body.digest || makeDigest(content)), 120),
      content,
      thumb_media_id: thumbMediaId,
      need_open_comment: body.needOpenComment === 0 ? 0 : 1,
      only_fans_can_comment: body.onlyFansCanComment ? 1 : 0,
      ...(body.contentSourceUrl ? { content_source_url: body.contentSourceUrl } : {}),
    })

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
    })

    return ok({ media_id: mediaId, title, images: loc.localized, failed_images: loc.failed, account: accountName })
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
    })
    return fail(message, 500)
  }
}
