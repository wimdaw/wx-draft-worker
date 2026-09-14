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

/** 模块级 token 缓存：按 appid 分开存（多公众号各自独立），避免反复获取触发频率限制 */
const tokenCache = new Map<string, { token: string; exp: number }>()

export class WeChat {
  constructor(
    private readonly appid: string,
    private readonly secret: string,
  ) {}

  /** 获取 access_token（优先使用未过期的缓存） */
  async getToken(force = false): Promise<string> {
    const now = Date.now()
    const hit = tokenCache.get(this.appid)
    if (!force && hit && now < hit.exp) return hit.token

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

    // 提前 200 秒过期，规避边界失效
    tokenCache.set(this.appid, {
      token: data.access_token,
      exp: now + ((data.expires_in ?? 7200) - 200) * 1000,
    })
    return data.access_token
  }

  /**
   * 读取公众号昵称（账号基本信息接口）
   * 需账号具备该接口权限：未认证 / 未授权的号可能返回 48001 等错误
   * → 因此这里不抛异常，失败时返回 null，由调用方决定兜底名称
   */
  async getAccountNickName(): Promise<string | null> {
    try {
      const token = await this.getToken()
      const resp = await fetch(
        `${WX_BASE}/cgi-bin/account/getaccountbasicinfo?access_token=${encodeURIComponent(token)}`,
      )
      const data = (await resp.json()) as WxBaseResponse & { nick_name?: string; nickname?: string }
      if ((data as { errcode?: number }).errcode) return null
      const nick = String(data.nick_name ?? data.nickname ?? '').trim()
      return nick || null
    } catch {
      return null
    }
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

  /** 上传图片为永久素材 → 返回 media_id 与微信域名 URL（可用于正文复用） */
  async uploadPermanentImage(blob: Blob, filename = 'image.png'): Promise<{ media_id: string; url: string | null }> {
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
    throwIfWxError('上传永久素材', data)
    if (!data.media_id) throw new Error('上传永久素材失败：未返回 media_id')
    return { media_id: data.media_id, url: data.url ?? null }
  }

  /** 上传封面为永久素材 → 返回 thumb_media_id */
  async uploadMaterialImage(blob: Blob, filename = 'cover.png'): Promise<string> {
    return (await this.uploadPermanentImage(blob, filename)).media_id
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
        // HTML 里 src 可能以 &amp; 实体形式出现：两种形式都要替换成微信域名图
        const encodedSrc = src.replace(/&/g, '&amp;')
        out = out.split(src).join(url).split(encodedSrc).join(url)
        localized++
      } catch (e) {
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

  /** 新建草稿（支持多图文，1~8 篇）→ 返回草稿 media_id */
  async addDraft(articles: WxArticle[]): Promise<string> {
    const token = await this.getToken()
    const resp = await fetch(
      `${WX_BASE}/cgi-bin/draft/add?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ articles }),
      },
    )
    const data = (await resp.json()) as WxDraftAddResponse
    throwIfWxError('新建草稿', data)
    if (!data.media_id) throw new Error('新建草稿失败：未返回 media_id')
    return data.media_id
  }

  /**
   * 获取草稿列表。
   * 注意：必须 no_content=0，否则微信不返回 content.news_item，标题会缺失。
   */
  async batchGetDrafts(offset = 0, count = 20): Promise<WxDraftBatchResponse> {
    const token = await this.getToken()
    const resp = await fetch(
      `${WX_BASE}/cgi-bin/draft/batchget?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ offset, count, no_content: 0 }),
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
