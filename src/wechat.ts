/**
 * 微信公众平台 API 客户端
 * 封装：stable_token（含缓存）/ 正文图上传 / 封面永久素材 / 草稿增删查
 */
import type {
  WxArticle,
  WxTokenResponse,
  WxUploadImgResponse,
  WxMaterialResponse,
  WxDraftAddResponse,
  WxDraftBatchResponse,
  WxBaseResponse,
} from './types'
import { throwIfWxError } from './utils'
import { isWxImageUrl, sourceToBlob, extractImgSrcs, firstImgSrc } from './images'

const WX_BASE = 'https://api.weixin.qq.com'

/** 模块级 token 缓存：同一 isolate 生命周期内复用，避免反复获取触发频率限制 */
let cachedToken: string | null = null
let cachedExp = 0

export class WeChat {
  constructor(
    private readonly appid: string,
    private readonly secret: string,
  ) {}

  /** 获取 access_token（优先使用未过期的缓存） */
  async getToken(force = false): Promise<string> {
    const now = Date.now()
    if (!force && cachedToken && now < cachedExp) return cachedToken

    const resp = await fetch(`${WX_BASE}/cgi-bin/stable_token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credential',
        appid: this.appid,
        secret: this.secret,
        force_refresh: false,
      }),
    })
    const data = (await resp.json()) as WxTokenResponse
    throwIfWxError('获取 access_token', data)
    if (!data.access_token) throw new Error('获取 access_token 失败：响应为空')

    cachedToken = data.access_token
    // 提前 200 秒过期，规避边界失效
    cachedExp = now + ((data.expires_in ?? 7200) - 200) * 1000
    return cachedToken
  }

  /** 上传正文图片 → 返回可用于正文的微信域名 URL（临时素材） */
  async uploadContentImage(blob: Blob, filename = 'image.png'): Promise<string> {
    const token = await this.getToken()
    const fd = new FormData()
    fd.append('media', blob, filename)
    const resp = await fetch(
      `${WX_BASE}/cgi-bin/media/uploadimg?access_token=${encodeURIComponent(token)}`,
      { method: 'POST', body: fd },
    )
    const data = (await resp.json()) as WxUploadImgResponse
    throwIfWxError('上传正文图片', data)
    if (!data.url) throw new Error('上传正文图片失败：未返回 url')
    return data.url
  }

  /** 上传封面为永久素材 → 返回 thumb_media_id */
  async uploadMaterialImage(blob: Blob, filename = 'cover.png'): Promise<string> {
    const token = await this.getToken()
    const fd = new FormData()
    fd.append('media', blob, filename)
    const resp = await fetch(
      `${WX_BASE}/cgi-bin/material/add_material?access_token=${encodeURIComponent(
        token,
      )}&type=image`,
      { method: 'POST', body: fd },
    )
    const data = (await resp.json()) as WxMaterialResponse
    throwIfWxError('上传封面素材', data)
    if (!data.media_id) throw new Error('上传封面素材失败：未返回 media_id')
    return data.media_id
  }

  /**
   * 将正文中所有外链图 / base64 图转存到微信域名
   * （微信草稿的外链图片不显示，必须换成本站域名）
   */
  async localizeImages(
    html: string,
  ): Promise<{ html: string; localized: number; failed: string[] }> {
    const srcs = extractImgSrcs(html)
    let out = html
    let localized = 0
    const failed: string[] = []

    for (const src of srcs) {
      if (isWxImageUrl(src)) continue
      try {
        const blob = await sourceToBlob(src)
        if (!blob) continue
        const url = await this.uploadContentImage(blob)
        out = out.split(src).join(url)
        localized++
      } catch {
        // 单张失败不影响整体，记录下来供调用方排查
        failed.push(src)
      }
    }
    return { html: out, localized, failed }
  }

  /** 解析封面：优先 cover 指定图，其次正文第一张图；返回 thumb_media_id */
  async resolveCover(
    cover: string | undefined,
    content: string,
  ): Promise<string | null> {
    if (cover) {
      const blob = await sourceToBlob(cover)
      if (blob) return this.uploadMaterialImage(blob)
    }
    const first = firstImgSrc(content)
    if (first) {
      const blob = await sourceToBlob(first)
      if (blob) return this.uploadMaterialImage(blob)
    }
    return null
  }

  /** 新建草稿 → 返回草稿 media_id */
  async addDraft(article: WxArticle): Promise<string> {
    const token = await this.getToken()
    const resp = await fetch(
      `${WX_BASE}/cgi-bin/draft/add?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ articles: [article] }),
      },
    )
    const data = (await resp.json()) as WxDraftAddResponse
    throwIfWxError('新建草稿', data)
    if (!data.media_id) throw new Error('新建草稿失败：未返回 media_id')
    return data.media_id
  }

  /** 获取草稿列表 */
  async batchGetDrafts(offset = 0, count = 20): Promise<WxDraftBatchResponse> {
    const token = await this.getToken()
    const resp = await fetch(
      `${WX_BASE}/cgi-bin/draft/batchget?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ offset, count, no_content: 1 }),
      },
    )
    const data = (await resp.json()) as WxDraftBatchResponse
    throwIfWxError('获取草稿列表', data)
    return data
  }

  /** 删除草稿 */
  async deleteDraft(mediaId: string): Promise<void> {
    const token = await this.getToken()
    const resp = await fetch(
      `${WX_BASE}/cgi-bin/draft/delete?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ media_id: mediaId }),
      },
    )
    const data = (await resp.json()) as WxBaseResponse
    throwIfWxError('删除草稿', data)
  }
}
