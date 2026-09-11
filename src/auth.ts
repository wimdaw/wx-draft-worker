/**
 * wx-draft-worker · 鉴权
 * - 后台：会话 Cookie（登录后 7 天有效）
 * - 业务 API：X-API-Key / ?key= / Authorization: Bearer
 *   优先匹配 DB 令牌（后台可管理），兼容旧的 DRAFT_API_KEY 环境变量
 */
import type { Context, MiddlewareHandler } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { Env } from './types'
import { fail, ok } from './utils'
import { renderLoginPage } from './pages'
import {
  findTokenByKey,
  touchToken,
  createSession,
  getSession,
  deleteSession,
  purgeExpiredSessions,
} from './storage'

export const SESSION_COOKIE = 'wxd_session'

/** 固定长度比较，避免时序泄露 */
async function digestHex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function safeEqual(a: string, b: string): Promise<boolean> {
  const [x, y] = await Promise.all([digestHex(a), digestHex(b)])
  let diff = 0
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i)
  return diff === 0
}

/** 管理员密码：后台设置 > 环境变量 > 默认口令 */
export async function getAdminPassword(env: Env): Promise<string> {
  try {
    const row = await env.DB.prepare(`SELECT value FROM settings WHERE key = 'admin_password'`).first<{
      value: string
    }>()
    if (row?.value) return row.value
  } catch {
    /* 表未就绪时回落到环境变量 */
  }
  return env.ADMIN_PASSWORD || 'admin'
}

export async function verifyAdminPassword(env: Env, password: string): Promise<boolean> {
  return safeEqual(password, await getAdminPassword(env))
}

/** 管理员账号：数据库设置 > 环境变量 > 默认 admin */
export async function getAdminUser(env: Env): Promise<string> {
  try {
    const row = await env.DB.prepare(`SELECT value FROM settings WHERE key = 'admin_user'`).first<{
      value: string
    }>()
    if (row?.value) return row.value
  } catch {
    /* 表未就绪时回落到环境变量 */
  }
  return env.ADMIN_USER || 'admin'
}

/** 校验后台登录：账号 + 密码都需匹配 */
export async function verifyAdminCredentials(env: Env, user: string, password: string): Promise<boolean> {
  const [okUser, okPw] = await Promise.all([
    safeEqual(String(user).trim(), await getAdminUser(env)),
    verifyAdminPassword(env, password),
  ])
  return okUser && okPw
}

/** 是否仍在使用默认口令（页面提示用） */
export async function usingDefaultPassword(env: Env): Promise<boolean> {
  return (await getAdminPassword(env)) === 'admin'
}

// ==================== 后台会话 ====================

export const adminAuthMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const sid = getCookie(c, SESSION_COOKIE) ?? ''
  const valid = sid ? await getSession(c.env, sid) : false
  if (!valid) {
    if (c.req.path.startsWith('/admin/api/')) return fail('未登录或会话已过期，请重新登录', 401)
    return c.redirect('/admin/login')
  }
  return next()
}

export async function handleLogin(c: Context<{ Bindings: Env }>): Promise<Response> {
  const ct = c.req.header('content-type') ?? ''
  let username = ''
  let password = ''
  let asJson = false
  if (ct.includes('application/json')) {
    asJson = true
    const body = (await c.req.json().catch(() => ({}))) as { username?: string; user?: string; password?: string }
    username = String(body.username ?? body.user ?? '')
    password = String(body.password ?? '')
  } else {
    const form = await c.req.parseBody()
    username = String(form.username ?? form.user ?? '')
    password = String(form.password ?? '')
  }

  // 账号留空时按默认账号处理，兼容旧客户端只用密码登录
  if (!(await verifyAdminCredentials(c.env, username || 'admin', password))) {
    return asJson ? fail('账号或密码错误', 401) : c.html(loginErrorPage(), 401)
  }

  await purgeExpiredSessions(c.env)
  const session = await createSession(c.env)
  const secure = new URL(c.req.url).protocol === 'https:'
  setCookie(c, SESSION_COOKIE, session.id, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure,
    maxAge: 7 * 86400,
  })
  return asJson ? ok({ redirect: '/admin' }) : c.redirect('/admin')
}

export async function handleLogout(c: Context<{ Bindings: Env }>): Promise<Response> {
  const sid = getCookie(c, SESSION_COOKIE) ?? ''
  if (sid) await deleteSession(c.env, sid)
  deleteCookie(c, SESSION_COOKIE, { path: '/' })
  return c.redirect('/admin/login')
}

function loginErrorPage(): string {
  // 复用统一设计系统的登录页（error 态），保持全站视觉一致
  return renderLoginPage({ error: true, baseUrl: '' })
}

// ==================== 业务 API 令牌 ====================

type ApiAuthResult =
  | { ok: true; tokenName: string | null }
  | { ok: false; response: Response }

/** D1 里是否存在启用中的业务令牌（用于判断是否处于「开放模式」） */
async function hasEnabledToken(env: Env): Promise<boolean> {
  try {
    const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM tokens WHERE enabled = 1')
      .first<{ n: number }>()
    return (row?.n ?? 0) > 0
  } catch (err) {
    // D1 未绑定 / 查询失败：按未配置处理，避免把纯静态部署一刀切锁死
    console.error('令牌状态探测失败:', err)
    return false
  }
}

async function verifyApiKey(env: Env, provided: string): Promise<ApiAuthResult> {
  if (env.DRAFT_API_KEY && (await safeEqual(provided, env.DRAFT_API_KEY))) {
    return { ok: true, tokenName: '环境变量密钥' }
  }
  const token = await findTokenByKey(env, provided)
  if (token) {
    await touchToken(env, token.id)
    return { ok: true, tokenName: token.name }
  }
  return { ok: false, response: fail('令牌无效或已被禁用', 401) }
}

/**
 * 业务 API 鉴权：
 * - 携带密钥 → 校验（DB 令牌 或 DRAFT_API_KEY）
 * - 未携带密钥 → 仅当系统完全没有配置任何密钥时放行（开放模式）
 */
export const apiTokenAuth: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  // 公开端点：健康检查无需令牌
  if (c.req.path === '/api/health') return next()

  const expected = c.env.DRAFT_API_KEY
  const provided =
    c.req.header('X-API-Key') ??
    c.req.query('key') ??
    (c.req.header('Authorization')?.replace(/^Bearer\s+/i, '') || '')

  if (!provided) {
    // 只有「任何鉴权手段都没配置」时才放行（开放模式）：
    // 环境变量密钥未设 ≠ 未配置，后台创建过令牌同样意味着必须鉴权
    if (expected || (await hasEnabledToken(c.env))) {
      return fail('未授权：请在请求头携带 X-API-Key，或使用 ?key= 查询参数', 401)
    }
    return next()
  }

  const result = await verifyApiKey(c.env, provided)
  if (!result.ok) return result.response
  c.set('tokenName' as never, result.tokenName as never)
  return next()
}
