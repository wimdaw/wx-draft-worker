/**
 * wx-draft-worker · 类型定义
 */

/** Worker 绑定与环境变量 */
export interface Env {
  /** 公众号 AppID */
  WECHAT_APPID: string
  /** 公众号 AppSecret（机密） */
  WECHAT_APPSECRET: string
  /** 调用鉴权密钥；留空/未设置表示不鉴权 */
  DRAFT_API_KEY?: string
}

/** POST /api/draft 请求体 */
export interface DraftRequest {
  /** 标题；缺省为「未命名文章」 */
  title?: string
  /** 作者（微信限制 ≤ 8 字） */
  author?: string
  /** 摘要；缺省由正文自动生成（≤ 120 字） */
  digest?: string
  /** 正文（必填） */
  content?: string
  /** 封面：远程 URL / data URI；缺省取正文第一张图 */
  cover?: string
  /** 正文格式：html（默认）或 markdown */
  contentType?: 'html' | 'markdown'
  /** 原文链接 */
  contentSourceUrl?: string
  /** 0 = 不开启评论；其它值开启（默认开启） */
  needOpenComment?: 0 | 1
  /** 1 = 仅粉丝可评论（默认 0） */
  onlyFansCanComment?: 0 | 1
}

/** 微信 API 通用响应字段 */
export interface WxBaseResponse {
  errcode?: number
  errmsg?: string
}

/** stable_token 响应 */
export interface WxTokenResponse extends WxBaseResponse {
  access_token?: string
  expires_in?: number
}

/** media/uploadimg 响应 */
export interface WxUploadImgResponse extends WxBaseResponse {
  url?: string
}

/** material/add_material 响应 */
export interface WxMaterialResponse extends WxBaseResponse {
  media_id?: string
  url?: string
}

/** draft/add 响应 */
export interface WxDraftAddResponse extends WxBaseResponse {
  media_id?: string
}

/** 草稿列表条目 */
export interface WxDraftItem {
  media_id: string
  update_time?: number
  content?: {
    news_item?: Array<{
      title?: string
      digest?: string
      url?: string
      thumb_url?: string
    }>
  }
}

/** draft/batchget 响应 */
export interface WxDraftBatchResponse extends WxBaseResponse {
  total_count?: number
  item_count?: number
  item?: WxDraftItem[]
}

/** 提交给微信的草稿文章对象 */
export interface WxArticle {
  title: string
  author?: string
  digest?: string
  content: string
  content_source_url?: string
  thumb_media_id: string
  need_open_comment?: 0 | 1
  only_fans_can_comment?: 0 | 1
}
