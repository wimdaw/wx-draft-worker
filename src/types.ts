/**
 * wx-draft-worker · 类型定义
 */

/** Worker 绑定与环境变量 */
export interface Env {
  /** D1 数据库（令牌 / 推送记录 / 设置 / 会话） */
  DB: D1Database
  /** 公众号 AppID */
  WECHAT_APPID: string
  /** 公众号 AppSecret（机密） */
  WECHAT_APPSECRET: string
  /** 后台管理员密码；未设置时回落到默认值（首次登录后请尽快修改） */
  ADMIN_PASSWORD?: string
  /** 后台管理员账号；未设置时回落到默认值 admin */
  ADMIN_USER?: string
  /** 旧版单一调用密钥；设置后兼容校验（等价于一把内置令牌） */
  DRAFT_API_KEY?: string
}

/** 用户角色：admin 管理全部；member 只能管理自己的令牌 / 公众号 / 记录 */
export type UserRole = 'admin' | 'member'

/** 后台用户 */
export interface User {
  id: string
  username: string
  password_hash: string
  salt: string
  role: UserRole
  enabled: number
  created_at: string
  last_login_at: string | null
  /** 由哪个用户创建（首个管理员为 null） */
  created_by: string | null
}

/** 会话中携带的用户身份（不含密码字段） */
export interface SessionUser {
  id: string
  username: string
  role: UserRole
}

/** API 令牌 */
export interface Token {
  id: string
  name: string
  key: string
  enabled: number
  created_at: string
  last_used_at: string | null
  use_count: number
  /** 归属用户；null 表示旧数据 / 环境变量密钥（视为管理员） */
  user_id?: string | null
}

/** 推送记录 */
export interface DraftRecord {
  id: string
  media_id: string | null
  title: string
  author: string
  status: 'success' | 'failed'
  error: string | null
  duration_ms: number
  images: number
  content_len: number
  token_name: string | null
  /** 推送所用的公众号名（多公众号分类） */
  account_name?: string | null
  /** 归属用户 */
  user_id?: string | null
  /** 本次草稿包含的文章篇数（多图文 > 1） */
  article_count?: number
  created_at: string
}

/** 公众号账号（后台可添加多个，草稿箱按此分类） */
export interface Account {
  id: string
  name: string
  appid: string
  appsecret: string
  enabled: number
  is_default: number
  created_at: string
  /** 归属用户；null 表示旧数据（归管理员） */
  user_id?: string | null
}

/** 后台概览统计 */
export interface Stats {
  total: number
  success: number
  failed: number
  success_rate: number
  avg_duration_ms: number
  today: number
  tokens: number
  tokens_enabled: number
  appid_configured: boolean
  secret_configured: boolean
  daily: Array<{ date: string; total: number; success: number }>
}

/** POST /api/draft 请求体 */
export interface DraftRequest {
  /** 标题；缺省为「未命名文章」 */
  title?: string
  /** 作者（微信限制 ≤ 8 字） */
  author?: string
  /** 摘要；缺省由正文自动生成（≤ 120 字） */
  digest?: string
  /** 正文（必填，单图文时） */
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
  /** 目标公众号账号 id（缺省用后台设置的默认公众号） */
  accountId?: string
  /**
   * 多图文：提供后按篇推送（1~8 篇）。
   * 每篇未填的字段回落到顶层同名字段（author / needOpenComment / onlyFansCanComment 等）。
   */
  articles?: DraftArticleInput[]
}

/** 多图文草稿中的单篇 */
export interface DraftArticleInput {
  title?: string
  author?: string
  digest?: string
  content?: string
  cover?: string
  contentType?: 'html' | 'markdown'
  contentSourceUrl?: string
  needOpenComment?: 0 | 1
  onlyFansCanComment?: 0 | 1
}

/** 操作审计日志 */
export interface AuditLog {
  id: string
  user_id: string | null
  username: string | null
  /** 动作标识，如 token.create / account.delete / user.password */
  action: string
  target_type: string | null
  target_id: string | null
  detail: string | null
  ip: string | null
  created_at: string
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
      author?: string
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
