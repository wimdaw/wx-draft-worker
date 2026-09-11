/**
 * API Key 鉴权中间件
 * 支持请求头 X-API-Key，或查询参数 ?key=
 * - 未配置 DRAFT_API_KEY 时不鉴权（开放模式）
 * - 健康检查（/ 与 /api/health）始终放行
 */
import type { MiddlewareHandler } from 'hono'
import type { Env } from './types'
import { fail } from './utils'

export const apiKeyAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const path = c.req.path
  if (path === '/' || path === '/api/health') return next()

  const expected = c.env.DRAFT_API_KEY
  if (!expected) return next()

  const provided = c.req.header('X-API-Key') ?? c.req.query('key') ?? ''
  if (provided !== expected) {
    return fail('未授权：请在请求头携带 X-API-Key，或使用 ?key= 查询参数', 401)
  }
  return next()
}
