/**
 * wx-draft-worker · D1 存储层
 * 表：settings / tokens / drafts / sessions
 */
import type { Env, Token, DraftRecord, Stats, Account } from './types'

let schemaReady = false

/** 建表（幂等，每 isolate 首次调用执行一次） */
export async function ensureSchema(env: Env): Promise<void> {
  if (schemaReady) return
  await env.DB.batch([
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
    ),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS tokens (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        key TEXT NOT NULL UNIQUE,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        last_used_at TEXT,
        use_count INTEGER NOT NULL DEFAULT 0
      )`,
    ),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS drafts (
        id TEXT PRIMARY KEY,
        media_id TEXT,
        title TEXT NOT NULL,
        author TEXT,
        status TEXT NOT NULL,
        error TEXT,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        images INTEGER NOT NULL DEFAULT 0,
        content_len INTEGER NOT NULL DEFAULT 0,
        token_name TEXT,
        created_at TEXT NOT NULL
      )`,
    ),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )`,
    ),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_drafts_created ON drafts(created_at DESC)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_tokens_key ON tokens(key)`),
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        appid TEXT NOT NULL,
        appsecret TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )`,
    ),
  ])
  // 增量迁移：老库补列（列已存在时会报错，忽略即可）
  for (const sql of [
    'ALTER TABLE drafts ADD COLUMN account_id TEXT',
    'ALTER TABLE drafts ADD COLUMN account_name TEXT',
  ]) {
    try {
      await env.DB.prepare(sql).run()
    } catch {
      /* 该列已存在 */
    }
  }
  schemaReady = true
}

/** 首次初始化：种子数据 + 兼容旧版 DRAFT_API_KEY */
export async function seedInitialData(env: Env): Promise<void> {
  await ensureSchema(env)
  try {
    const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM tokens').first<{ n: number }>()
    const n = row?.n ?? 0
    if (n === 0 && env.DRAFT_API_KEY) {
      await env.DB.prepare(
        'INSERT INTO tokens (id, name, key, enabled, created_at, use_count) VALUES (?, ?, ?, 1, ?, 0)',
      )
        .bind(newId(), '默认令牌（由 DRAFT_API_KEY 迁移）', env.DRAFT_API_KEY, now())
        .run()
    }
  } catch {
    /* 种子失败不阻塞请求 */
  }

  // 公众号账号：首次初始化时把原有环境变量凭据迁移成「默认公众号」，升级后行为不变
  try {
    const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM accounts').first<{ n: number }>()
    const n = row?.n ?? 0
    if (n === 0 && env.WECHAT_APPID && env.WECHAT_APPSECRET) {
      await env.DB.prepare(
        'INSERT INTO accounts (id, name, appid, appsecret, enabled, is_default, created_at) VALUES (?, ?, ?, ?, 1, 1, ?)',
      )
        .bind(newId(), '默认公众号', env.WECHAT_APPID, env.WECHAT_APPSECRET, now())
        .run()
    } else if (n > 0) {
      const d = await env.DB.prepare('SELECT COUNT(*) AS n FROM accounts WHERE is_default = 1').first<{ n: number }>()
      if ((d?.n ?? 0) === 0) {
        await env.DB.prepare(
          'UPDATE accounts SET is_default = 1 WHERE id = (SELECT id FROM accounts ORDER BY created_at ASC LIMIT 1)',
        ).run()
      }
    }
  } catch {
    /* 账号迁移失败不阻塞请求 */
  }
}

// ==================== 公众号账号 ====================

export async function listAccounts(env: Env): Promise<Account[]> {
  const r = await env.DB.prepare('SELECT * FROM accounts ORDER BY is_default DESC, created_at ASC').all<Account>()
  return r.results ?? []
}

export async function getAccountById(env: Env, id: string): Promise<Account | null> {
  const row = await env.DB.prepare('SELECT * FROM accounts WHERE id = ?').bind(id).first<Account>()
  return row ?? null
}

export async function createAccount(
  env: Env,
  input: { name?: string; appid: string; appsecret: string; is_default?: boolean },
): Promise<Account> {
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM accounts').first<{ n: number }>()
  const count = row?.n ?? 0
  const makeDefault = input.is_default === true || count === 0
  const acc: Account = {
    id: newId(),
    name: String(input.name ?? '').trim() || `公众号 ${count + 1}`,
    appid: String(input.appid ?? '').trim(),
    appsecret: String(input.appsecret ?? '').trim(),
    enabled: 1,
    is_default: makeDefault ? 1 : 0,
    created_at: now(),
  }
  if (makeDefault) await env.DB.prepare('UPDATE accounts SET is_default = 0').run()
  await env.DB.prepare(
    'INSERT INTO accounts (id, name, appid, appsecret, enabled, is_default, created_at) VALUES (?, ?, ?, ?, 1, ?, ?)',
  )
    .bind(acc.id, acc.name, acc.appid, acc.appsecret, acc.is_default, acc.created_at)
    .run()
  return acc
}

export async function updateAccount(
  env: Env,
  id: string,
  patch: { name?: string; appid?: string; appsecret?: string; enabled?: number },
): Promise<boolean> {
  const sets: string[] = []
  const vals: unknown[] = []
  if (typeof patch.name === 'string' && patch.name.trim()) {
    sets.push('name = ?')
    vals.push(patch.name.trim())
  }
  if (typeof patch.appid === 'string' && patch.appid.trim()) {
    sets.push('appid = ?')
    vals.push(patch.appid.trim())
  }
  if (typeof patch.appsecret === 'string' && patch.appsecret.trim()) {
    sets.push('appsecret = ?')
    vals.push(patch.appsecret.trim())
  }
  if (typeof patch.enabled === 'number') {
    sets.push('enabled = ?')
    vals.push(patch.enabled ? 1 : 0)
  }
  if (!sets.length) return true
  vals.push(id)
  const r = await env.DB.prepare(`UPDATE accounts SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...vals)
    .run()
  return (r.meta?.changes ?? 0) > 0
}

/** 设为默认公众号（推送未指定账号时使用） */
export async function setDefaultAccount(env: Env, id: string): Promise<boolean> {
  await env.DB.prepare('UPDATE accounts SET is_default = 0').run()
  const r = await env.DB.prepare('UPDATE accounts SET is_default = 1 WHERE id = ?').bind(id).run()
  return (r.meta?.changes ?? 0) > 0
}

/** 删除公众号；若删掉的是默认账号，自动把最早的一条补为默认 */
export async function deleteAccount(env: Env, id: string): Promise<boolean> {
  const acc = await getAccountById(env, id)
  if (!acc) return false
  const r = await env.DB.prepare('DELETE FROM accounts WHERE id = ?').bind(id).run()
  if (acc.is_default) {
    await env.DB.prepare(
      'UPDATE accounts SET is_default = 1 WHERE id = (SELECT id FROM accounts ORDER BY created_at ASC LIMIT 1)',
    ).run()
  }
  return (r.meta?.changes ?? 0) > 0
}

/**
 * 解析推送要用的公众号凭据：
 * 指定 id → 该账号；未指定 → 默认账号；都没有 → 回落环境变量凭据（兼容旧部署）
 */
export async function resolveAccount(
  env: Env,
  id?: string | null,
): Promise<{ id: string; name: string; appid: string; appsecret: string } | null> {
  try {
    await ensureSchema(env)
    if (id) {
      const acc = await getAccountById(env, id)
      if (acc) return { id: acc.id, name: acc.name, appid: acc.appid, appsecret: acc.appsecret }
    }
    const acc =
      (await env.DB.prepare('SELECT * FROM accounts WHERE is_default = 1 LIMIT 1').first<Account>()) ??
      (await env.DB.prepare('SELECT * FROM accounts WHERE enabled = 1 ORDER BY created_at ASC LIMIT 1').first<Account>())
    if (acc) return { id: acc.id, name: acc.name, appid: acc.appid, appsecret: acc.appsecret }
  } catch {
    // D1 未绑定或建表失败（本地冒烟 / 只配环境变量的旧部署）：忽略，继续走下面的环境变量回落
  }
  if (env.WECHAT_APPID && env.WECHAT_APPSECRET) {
    return { id: '', name: '环境变量凭据', appid: env.WECHAT_APPID, appsecret: env.WECHAT_APPSECRET }
  }
  return null
}

// ==================== 令牌 ====================

const now = (): string => new Date().toISOString()
const newId = (): string => crypto.randomUUID()

/** 生成 API 令牌（wxk_ + 32 位十六进制） */
export function generateTokenKey(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return 'wxk_' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** 生成会话 ID */
export function generateSessionId(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ==================== 设置 ====================

export async function getSettings(env: Env): Promise<Record<string, string>> {
  const r = await env.DB.prepare('SELECT key, value FROM settings').all<{ key: string; value: string }>()
  const out: Record<string, string> = {}
  for (const row of r.results ?? []) out[row.key] = row.value
  return out
}

export async function setSetting(env: Env, key: string, value: string): Promise<void> {
  await env.DB.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  )
    .bind(key, value)
    .run()
}

// ==================== 令牌 ====================

export async function listTokens(env: Env): Promise<Token[]> {
  const r = await env.DB.prepare('SELECT * FROM tokens ORDER BY created_at DESC').all<Token>()
  return r.results ?? []
}

export async function createToken(env: Env, name: string): Promise<Token> {
  const token: Token = {
    id: newId(),
    name: name.trim() || '未命名令牌',
    key: generateTokenKey(),
    enabled: 1,
    created_at: now(),
    last_used_at: null,
    use_count: 0,
  }
  await env.DB.prepare(
    'INSERT INTO tokens (id, name, key, enabled, created_at, last_used_at, use_count) VALUES (?, ?, ?, 1, ?, NULL, 0)',
  )
    .bind(token.id, token.name, token.key, token.created_at)
    .run()
  return token
}

export async function updateToken(
  env: Env,
  id: string,
  patch: { name?: string; enabled?: number },
): Promise<boolean> {
  const sets: string[] = []
  const vals: unknown[] = []
  if (typeof patch.name === 'string') {
    sets.push('name = ?')
    vals.push(patch.name.trim() || '未命名令牌')
  }
  if (patch.enabled !== undefined) {
    sets.push('enabled = ?')
    vals.push(patch.enabled ? 1 : 0)
  }
  if (!sets.length) return false
  vals.push(id)
  const r = await env.DB.prepare(`UPDATE tokens SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...vals)
    .run()
  return (r.meta?.changes ?? 0) > 0
}

export async function deleteToken(env: Env, id: string): Promise<boolean> {
  const r = await env.DB.prepare('DELETE FROM tokens WHERE id = ?').bind(id).run()
  return (r.meta?.changes ?? 0) > 0
}

/** 按 id 查令牌（返回完整密钥，仅供后台「显示 / 复制」按需调用） */
export async function getTokenById(env: Env, id: string): Promise<Token | null> {
  const row = await env.DB.prepare('SELECT * FROM tokens WHERE id = ?').bind(id).first<Token>()
  return row ?? null
}

/** 按密钥查令牌（含仅启用状态） */
export async function findTokenByKey(env: Env, key: string): Promise<Token | null> {
  const row = await env.DB.prepare('SELECT * FROM tokens WHERE key = ? AND enabled = 1')
    .bind(key)
    .first<Token>()
  return row ?? null
}

export async function touchToken(env: Env, id: string): Promise<void> {
  await env.DB.prepare('UPDATE tokens SET last_used_at = ?, use_count = use_count + 1 WHERE id = ?')
    .bind(now(), id)
    .run()
}

// ==================== 推送记录 ====================

export interface DraftRecordInput {
  media_id: string | null
  title: string
  author: string
  status: 'success' | 'failed'
  error: string | null
  duration_ms: number
  images: number
  content_len: number
  token_name: string | null
  account_id?: string | null
  account_name?: string | null
}

export async function addDraftRecord(env: Env, r: DraftRecordInput): Promise<void> {
  try {
    await env.DB.prepare(
      `INSERT INTO drafts (id, media_id, title, author, status, error, duration_ms, images, content_len, token_name, account_id, account_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        newId(),
        r.media_id,
        r.title,
        r.author,
        r.status,
        r.error,
        r.duration_ms,
        r.images,
        r.content_len,
        r.token_name,
        r.account_id ?? null,
        r.account_name ?? null,
        now(),
      )
      .run()
  } catch {
    /* 记录失败不影响主流程 */
  }
}

export async function listDraftRecords(env: Env, limit = 50, offset = 0): Promise<DraftRecord[]> {
  const r = await env.DB.prepare('SELECT * FROM drafts ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(Math.min(Math.max(limit, 1), 200), Math.max(offset, 0))
    .all<DraftRecord>()
  return r.results ?? []
}

export async function deleteDraftRecord(env: Env, id: string): Promise<boolean> {
  const r = await env.DB.prepare('DELETE FROM drafts WHERE id = ?').bind(id).run()
  return (r.meta?.changes ?? 0) > 0
}

export async function clearDraftRecords(env: Env): Promise<void> {
  await env.DB.prepare('DELETE FROM drafts').run()
}

/** 概览统计 */
export async function getStats(env: Env): Promise<Stats> {
  const t = await env.DB.prepare(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) AS success,
            COALESCE(SUM(CASE WHEN status = 'failed'  THEN 1 ELSE 0 END), 0) AS failed,
            COALESCE(AVG(duration_ms), 0) AS avg_duration
     FROM drafts`,
  ).first<{ total: number; success: number; failed: number; avg_duration: number }>()

  const todayRow = await env.DB.prepare(
    `SELECT COUNT(*) AS n FROM drafts WHERE date(created_at) = date('now')`,
  ).first<{ n: number }>()

  const tk = await env.DB.prepare(
    `SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN enabled = 1 THEN 1 ELSE 0 END), 0) AS enabled FROM tokens`,
  ).first<{ total: number; enabled: number }>()

  const dailyRows = await env.DB.prepare(
    `SELECT date(created_at) AS date,
            COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) AS success
     FROM drafts
     WHERE created_at >= datetime('now', '-7 days')
     GROUP BY date(created_at)
     ORDER BY date ASC`,
  ).all<{ date: string; total: number; success: number }>()

  const total = t?.total ?? 0
  const success = t?.success ?? 0

  // 补齐最近 7 天（含无数据的日期）
  const map = new Map<string, { total: number; success: number }>()
  for (const row of dailyRows.results ?? []) map.set(row.date, { total: row.total, success: row.success })
  const daily: Array<{ date: string; total: number; success: number }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    const v = map.get(d) ?? { total: 0, success: 0 }
    daily.push({ date: d, total: v.total, success: v.success })
  }

  return {
    total,
    success,
    failed: t?.failed ?? 0,
    success_rate: total ? Math.round((success / total) * 1000) / 10 : 0,
    avg_duration_ms: Math.round(t?.avg_duration ?? 0),
    today: todayRow?.n ?? 0,
    tokens: tk?.total ?? 0,
    tokens_enabled: tk?.enabled ?? 0,
    appid_configured: !!env.WECHAT_APPID,
    secret_configured: !!env.WECHAT_APPSECRET,
    daily,
  }
}

// ==================== 会话 ====================

const SESSION_TTL_MS = 7 * 86400000

export async function createSession(env: Env): Promise<{ id: string; expires_at: string }> {
  const id = generateSessionId()
  const expires = new Date(Date.now() + SESSION_TTL_MS).toISOString()
  await env.DB.prepare('INSERT INTO sessions (id, created_at, expires_at) VALUES (?, ?, ?)')
    .bind(id, now(), expires)
    .run()
  return { id, expires_at: expires }
}

export async function getSession(env: Env, id: string): Promise<boolean> {
  if (!id) return false
  const row = await env.DB.prepare('SELECT expires_at FROM sessions WHERE id = ?')
    .bind(id)
    .first<{ expires_at: string }>()
  if (!row) return false
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await deleteSession(env, id)
    return false
  }
  return true
}

export async function deleteSession(env: Env, id: string): Promise<void> {
  await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run()
}

export async function purgeExpiredSessions(env: Env): Promise<void> {
  await env.DB.prepare(`DELETE FROM sessions WHERE expires_at < ?`).bind(now()).run()
}
