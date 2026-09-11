/**
 * 通用工具：响应封装 / 微信错误码映射 / 文本处理
 * 响应契约（与 dist/worker.js 单文件版保持一致）：
 *   成功 { ok: true,  data: {...} }
 *   失败 { ok: false, error: "..." }
 */
import type { WxBaseResponse } from './types'

/** 返回 JSON 响应 */
export function json(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...extraHeaders },
  })
}

/** 统一成功响应 */
export function ok(data: unknown = {}, status = 200): Response {
  return json({ ok: true, data }, status)
}

/** 统一失败响应 */
export function fail(message: string, status = 400): Response {
  return json({ ok: false, error: message }, status)
}

/** 微信常见错误码 → 人类可读说明 */
const WX_ERRORS: Record<number, string> = {
  40001: 'AppSecret 无效，请检查 WECHAT_APPSECRET',
  40002: '不合法的凭证类型',
  40007: '不合法的 media_id',
  40013: 'AppID 无效，请检查 WECHAT_APPID',
  40014: '不合法的 access_token',
  40164: '调用方 IP 不在白名单：请把 Cloudflare 全部 IPv4 段加入公众号 IP 白名单',
  41001: '缺少 access_token',
  42001: 'access_token 已过期',
  43001: '需要 GET 请求',
  44002: 'POST 数据包为空',
  45009: '接口调用超限，请稍后重试',
  48001: '接口未授权（可能账号类型不支持该接口）',
  53500: '无草稿权限：draft/add 需要已认证的公众号',
  53503: '不合法的封面图 media_id',
}

/** 由微信响应生成可读错误信息 */
export function wxError(action: string, data: WxBaseResponse): string {
  const code = data?.errcode
  const hint = code !== undefined ? WX_ERRORS[code] : undefined
  const base = data?.errmsg || '未知错误'
  return `${action}失败：${hint || base}${hint ? `（${base}）` : ''} [${code}]`
}

/** 若响应含 errcode 则抛出错误 */
export function throwIfWxError(action: string, data: WxBaseResponse): void {
  if (!data || typeof data !== 'object') {
    throw new Error(`${action}失败：响应异常`)
  }
  if (data.errcode) throw new Error(wxError(action, data))
}

/** HTML 转义 */
export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 去除 HTML 标签并压缩空白 */
export function stripTags(html: string): string {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 按最大长度截断（含省略号） */
export function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

/** 由正文生成摘要（去标签、压空白） */
export function makeDigest(content: string, max = 120): string {
  const text = stripTags(content)
  return text.length > max ? text.slice(0, max) : text
}
