/**
 * wx-draft-worker · 鉴权
 * - 后台：会话 Cookie（登录后 7 天有效），会话绑定用户，支持 admin / member 角色
 * - 业务 API：X-API-Key / ?key= / Authorization: Bearer
 *   优先匹配 DB 令牌（后台可管理），兼容旧的 DRAFT_API_KEY 环境变量
 */
import type { Context, MiddlewareHandler } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import type { Env, SessionUser } from './types'
import { fail, ok } from './utils'
import { renderLoginPage } from './pages'
import {
  findTokenByKey,
  touchToken,
  createSession,
  getSessionUser,
  deleteSession,
  purgeExpiredSessions,
  getUserByUsername,
  createUser,
  touchUserLogin,
  getSettings,
  addAuditLog,
} from './storage'
import { verifyPassword } from './password'

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

// ==================== 上下文身份 ====================

/** 当前登录用户（由 adminAuthMiddleware 注入） */
export function currentUser(c: Context): SessionUser | null {
  return ((c.get('user' as never) as SessionUser | null | undefined) ?? null) as SessionUser | null
}

/**
 * 资源归属范围：管理员返回 null（可看/管全部），会员返回自身 id。
 * 业务 API 侧由令牌归属推导，见 apiTokenAuth。
 */
export function ownerScope(c: Context): string | null {
  const u = currentUser(c)
  return u && u.role !== 'admin' ? u.id : null
}

// ==================== 旧口令兼容 ====================

/** 旧版管理员账号：settings > 环境变量 > 默认 admin */
export async function getAdminUser(env: Env): Promise<string> {
  try {
    const s = await getSettings(env)
    if (s.admin_user) return s.admin_user
  } catch {
    /* 表未就绪 */
  }
  return env.ADMIN_USER || 'admin'
}

/** 旧版管理员口令是否仍为默认值（页面提示用） */
export async function usingDefaultPassword(env: Env): Promise<boolean> {
  if (env.ADMIN_PASSWORD) return false
  try {
    const s = await getSettings(env)
    return !s.admin_password
  } catch {
    return true
  }
}

/** 校验是否匹配旧版（环境变量 / settings）管理员口令 */
async function legacyAdminMatch(env: Env, username: string, password: string): Promise<boolean> {
  let user = env.ADMIN_USER || 'admin'
  let pw = env.ADMIN_PASSWORD || 'admin'
  try {
    const s = await getSettings(env)
    if (s.admin_user) user = s.admin_user
    if (s.admin_password) pw = s.admin_password
  } catch {
    /* 表未就绪时用环境变量 */
  }
  const [okUser, okPw] = await Promise.all([safeEqual(username, user), safeEqual(password, pw)])
  return okUser && okPw
}

// ==================== 后台会话中间件 ====================

export const adminAuthMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const sid = getCookie(c, SESSION_COOKIE) ?? ''
  const user = sid ? await getSessionUser(c.env, sid) : null
  if (!user) {
    if (c.req.path.startsWith('/admin/api/')) return fail('未登录或会话已过期，请重新登录', 401)
    return c.redirect('/admin/login')
  }
  c.set('user' as never, user as never)
  return next()
}

/** 仅管理员可访问（须挂在 adminAuthMiddleware 之后） */
export const requireAdmin: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const user = currentUser(c)
  if (!user) return fail('未登录', 401)
  if (user.role !== 'admin') return fail('需要管理员权限', 403)
  return next()
}

// ==================== 登录 / 登出 ====================

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
  const uname = (username || 'admin').trim()
  const denied = () => (asJson ? fail('账号或密码错误', 401) : c.html(loginErrorPage(), 401))

  let user = await getUserByUsername(c.env, uname)
  let valid = !!user && !!user.enabled && (await verifyPassword(password, user.password_hash, user.salt))

  // 兼容通道：首次部署尚未种下管理员，或口令仍配置在环境变量 / settings 里
  if (!valid && (await legacyAdminMatch(c.env, uname, password))) {
    if (!user) {
      user = await createUser(c.env, { username: uname, password, role: 'admin' })
    }
    valid = !!user && !!user.enabled
  }

  if (!valid || !user) return denied()

  await touchUserLogin(c.env, user.id)
  await addAuditLog(c.env, {
    userId: user.id,
    username: user.username,
    action: 'login',
    targetType: 'user',
    targetId: user.id,
    ip: c.req.header('cf-connecting-ip') ?? null,
  })
  await purgeExpiredSessions(c.env)
  const session = await createSession(c.env, { id: user.id, username: user.username, role: user.role })
  const secure = new URL(c.req.url).protocol === 'https:'
  setCookie(c, SESSION_COOKIE, session.id, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    secure,
    maxAge: 7 * 86400,
  })
  return asJson ? ok({ redirect: '/admin', role: user.role }) : c.redirect('/admin')
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
  | { ok: true; tokenName: string | null; ownerId: string | null }
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
    return { ok: true, tokenName: '环境变量密钥', ownerId: null }
  }
  const token = await findTokenByKey(env, provided)
  if (token) {
    await touchToken(env, token.id)
    return { ok: true, tokenName: token.name, ownerId: token.user_id ?? null }
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
  c.set('apiOwnerId' as never, result.ownerId as never)
  return next()
}
