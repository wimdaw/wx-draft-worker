/**
 * wx-draft-worker · 后台 API
 * 全部挂在 /admin/api 下，由 adminAuthMiddleware 保护（未登录返回 401）
 * 资源按归属隔离：管理员看全部；会员只看得到自己的令牌 / 公众号 / 推送记录
 */
import { Hono } from 'hono'
import type { Context } from 'hono'
import type { Env, DraftRequest, UserRole, SessionUser } from './types'
import { ok, fail } from './utils'
import {
  listTokens,
  getTokenById,
  createToken,
  updateToken,
  deleteToken,
  rotateToken,
  listDraftRecords,
  deleteDraftRecord,
  clearDraftRecords,
  getStats,
  getSettings,
  setSetting,
  listAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  setDefaultAccount,
  resolveAccount,
  listUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  setUserPassword,
  countAdmins,
  deleteUserSessions,
  reassignOwnership,
  addAuditLog,
  listAuditLogs,
  clearAuditLogs,
} from './storage'
import { pushDraft } from './draft'
import { WeChat } from './wechat'
import { verifyPassword } from './password'
import { currentUser, ownerScope, requireAdmin, usingDefaultPassword } from './auth'

export const adminApi = new Hono<{ Bindings: Env }>()

/** 当前登录用户（中间件已保证存在） */
function me(c: Context): SessionUser {
  return currentUser(c) as SessionUser
}

/** 请求来源 IP（Cloudflare 边缘注入） */
function clientIp(c: Context): string | null {
  return c.req.header('cf-connecting-ip') ?? c.req.header('x-real-ip') ?? null
}

/** 记一条操作审计（动作 + 目标 + 摘要），失败不阻塞业务 */
async function audit(
  c: Context,
  action: string,
  targetType?: string,
  targetId?: string,
  detail?: string,
): Promise<void> {
  const u = currentUser(c)
  await addAuditLog(c.env, {
    userId: u?.id ?? null,
    username: u?.username ?? null,
    action,
    targetType: targetType ?? null,
    targetId: targetId ?? null,
    detail: detail ? String(detail).slice(0, 300) : null,
    ip: clientIp(c),
  })
}

/**
 * 敏感操作二次确认：校验当前登录用户的密码（管理员即管理员密码）。
 * 密码由请求头 X-Confirm-Password 传入；缺失或错误一律拒绝并记审计。
 */
async function confirmSensitive(c: Context): Promise<Response | null> {
  const u = currentUser(c)
  if (!u) return fail('未登录', 401)
  const provided = c.req.header('x-confirm-password') ?? ''
  if (!provided) {
    await audit(c, 'confirm.missing', 'sensitive')
    return fail('该操作需要验证密码：请重新输入登录密码', 403)
  }
  const row = await getUserById(c.env, u.id)
  if (!row) return fail('用户不存在', 404)
  if (!(await verifyPassword(provided, row.password_hash, row.salt))) {
    await audit(c, 'confirm.failed', 'sensitive', undefined, `${c.req.method} ${c.req.path}`)
    return fail('密码不正确，操作已取消', 403)
  }
  return null
}

/** 归属校验：管理员（scope=null）放行；会员仅限自己的资源 */
function owns(scope: string | null, rowUserId?: string | null): boolean {
  return scope === null || rowUserId === scope
}

// ==================== 当前用户 ====================

adminApi.get('/me', (c) => ok({ user: me(c) }))

// ==================== 概览 ====================

adminApi.get('/stats', async (c) => {
  try {
    return ok(await getStats(c.env, ownerScope(c)))
  } catch (e) {
    return fail(`统计查询失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

// ==================== 令牌管理 ====================

adminApi.get('/tokens', async (c) => {
  try {
    // 列表只回脱敏密钥；完整密钥由 GET /tokens/:id/key 按需单独提供
    const tokens = (await listTokens(c.env, ownerScope(c))).map((t) => ({ ...t, key: maskToken(t.key) }))
    return ok({ tokens })
  } catch (e) {
    return fail(`令牌查询失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

/** 取完整令牌密钥（后台「显示 / 隐藏」与「复制」按钮按需调用） */
adminApi.get('/tokens/:id/key', async (c) => {
  try {
    const token = await getTokenById(c.env, c.req.param('id'))
    if (!token || !owns(ownerScope(c), token.user_id)) return fail('令牌不存在', 404)
    return ok({ id: token.id, key: token.key })
  } catch (e) {
    return fail(`读取令牌失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.post('/tokens', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const body = (await c.req.json().catch(() => ({}))) as { name?: string }
    const token = await createToken(c.env, String(body.name ?? ''), me(c).id)
    await audit(c, 'token.create', 'token', token.id, token.name)
    return ok({ token })
  } catch (e) {
    return fail(`创建令牌失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.patch('/tokens/:id', async (c) => {
  try {
    const token = await getTokenById(c.env, c.req.param('id'))
    if (!token || !owns(ownerScope(c), token.user_id)) return fail('令牌不存在', 404)
    const body = (await c.req.json().catch(() => ({}))) as { name?: string; enabled?: boolean | number }
    const changed = await updateToken(c.env, token.id, {
      ...(body.name !== undefined ? { name: String(body.name) } : {}),
      ...(body.enabled !== undefined ? { enabled: body.enabled ? 1 : 0 } : {}),
    })
    if (changed) {
      await audit(
        c,
        'token.update',
        'token',
        token.id,
        [body.name !== undefined ? `名称=${String(body.name)}` : '', body.enabled !== undefined ? `启用=${body.enabled ? 1 : 0}` : '']
          .filter(Boolean)
          .join(' '),
      )
    }
    return changed ? ok({ updated: true }) : fail('没有需要修改的字段', 400)
  } catch (e) {
    return fail(`更新令牌失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.delete('/tokens/:id', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const token = await getTokenById(c.env, c.req.param('id'))
    if (!token || !owns(ownerScope(c), token.user_id)) return fail('令牌不存在', 404)
    await deleteToken(c.env, token.id)
    await audit(c, 'token.delete', 'token', token.id, token.name)
    return ok({ deleted: true })
  } catch (e) {
    return fail(`删除令牌失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

/** 刷新令牌：重新生成密钥并返回新密钥（仅此一次完整展示） */
adminApi.post('/tokens/:id/rotate', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const token = await getTokenById(c.env, c.req.param('id'))
    if (!token || !owns(ownerScope(c), token.user_id)) return fail('令牌不存在', 404)
    const rotated = await rotateToken(c.env, token.id)
    if (!rotated) return fail('令牌不存在', 404)
    await audit(c, 'token.rotate', 'token', token.id, token.name)
    return ok({ id: rotated.id, key: rotated.key })
  } catch (e) {
    return fail(`刷新令牌失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

// ==================== 推送记录 ====================

adminApi.get('/records', async (c) => {
  try {
    const limit = Number(c.req.query('limit') ?? 50) || 50
    const offset = Number(c.req.query('offset') ?? 0) || 0
    return ok({ records: await listDraftRecords(c.env, limit, offset, ownerScope(c)) })
  } catch (e) {
    return fail(`记录查询失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

/** 导出推送记录为 CSV（Excel 可直接打开，含 UTF-8 BOM） */
adminApi.get('/records/export', async (c) => {
  try {
    const records = await listDraftRecords(c.env, 200, 0, ownerScope(c))
    const cell = (v: unknown): string => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = ['时间', '标题', '作者', '结果', '草稿ID', '篇数', '图片数', '耗时(ms)', '令牌', '公众号', '错误']
    const rows = records.map((r) =>
      [
        r.created_at,
        r.title,
        r.author,
        r.status === 'success' ? '成功' : '失败',
        r.media_id ?? '',
        r.article_count ?? 1,
        r.images,
        r.duration_ms,
        r.token_name ?? '',
        r.account_name ?? '',
        r.error ?? '',
      ]
        .map(cell)
        .join(','),
    )
    const csv = '\ufeff' + [header.map(cell).join(','), ...rows].join('\r\n')
    const day = new Date().toISOString().slice(0, 10)
    return c.body(csv, 200, {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="push-records-${day}.csv"`,
      'cache-control': 'no-store',
    })
  } catch (e) {
    return fail(`导出记录失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.delete('/records/:id', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const deleted = await deleteDraftRecord(c.env, c.req.param('id'), ownerScope(c))
    if (deleted) await audit(c, 'record.delete', 'record', c.req.param('id'))
    return deleted ? ok({ deleted: true }) : fail('记录不存在', 404)
  } catch (e) {
    return fail(`删除记录失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.delete('/records', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    await clearDraftRecords(c.env, ownerScope(c))
    await audit(c, 'record.clear', 'record', undefined, ownerScope(c) ? '清空本人记录' : '清空全部记录')
    return ok({ cleared: true })
  } catch (e) {
    return fail(`清空记录失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

// ==================== 操作审计日志（仅管理员） ====================

adminApi.use('/audit', requireAdmin)
adminApi.use('/audit/*', requireAdmin)

adminApi.get('/audit', async (c) => {
  try {
    const limit = Number(c.req.query('limit') ?? 80) || 80
    const offset = Number(c.req.query('offset') ?? 0) || 0
    return ok({ logs: await listAuditLogs(c.env, limit, offset, null) })
  } catch (e) {
    return fail(`审计日志查询失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.delete('/audit', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    await clearAuditLogs(c.env)
    await audit(c, 'audit.clear', 'audit')
    return ok({ cleared: true })
  } catch (e) {
    return fail(`清空审计日志失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

// ==================== 设置（仅管理员） ====================

adminApi.use('/settings', requireAdmin)
adminApi.use('/settings/*', requireAdmin)

adminApi.get('/settings', async (c) => {
  try {
    const settings = await getSettings(c.env)
    const accounts = await listAccounts(c.env)
    return ok({
      settings,
      using_default_password: await usingDefaultPassword(c.env),
      accounts_count: accounts.length,
      accounts_default: accounts.find((a) => a.is_default)?.name ?? null,
      appid_configured: !!c.env.WECHAT_APPID,
      secret_configured: !!c.env.WECHAT_APPSECRET,
      appid_masked: mask(c.env.WECHAT_APPID),
      legacy_key_configured: !!c.env.DRAFT_API_KEY,
    })
  } catch (e) {
    return fail(`设置读取失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.put('/settings', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    const allowed = ['default_author', 'default_content_type', 'default_need_open_comment']
    let n = 0
    for (const k of allowed) {
      if (body[k] !== undefined) {
        await setSetting(c.env, k, String(body[k]))
        n++
      }
    }
    if (n) await audit(c, 'settings.update', 'settings', undefined, Object.keys(body).filter((k) => allowed.includes(k)).join(','))
    return n ? ok({ updated: n }) : fail('没有可更新的设置项', 400)
  } catch (e) {
    return fail(`设置保存失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

// ==================== 修改本人密码 ====================

adminApi.put('/password', async (c) => {
  try {
    const user = await getUserById(c.env, me(c).id)
    if (!user) return fail('用户不存在', 404)
    const body = (await c.req.json().catch(() => ({}))) as { old?: string; new?: string }
    if (!(await verifyPassword(String(body.old ?? ''), user.password_hash, user.salt))) {
      return fail('当前密码错误', 400)
    }
    const next = String(body.new ?? '')
    if (next.length < 6) return fail('新密码至少 6 位', 400)
    await setUserPassword(c.env, user.id, next)
    await audit(c, 'password.change', 'user', user.id, user.username)
    return ok({ updated: true })
  } catch (e) {
    return fail(`修改密码失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

// ==================== 用户管理（仅管理员） ====================

adminApi.use('/users', requireAdmin)
adminApi.use('/users/*', requireAdmin)

/** 对外安全视图：绝不返回 password_hash / salt */
function safeUser(u: {
  id: string
  username: string
  role: UserRole
  enabled: number
  created_at: string
  last_login_at: string | null
}): Record<string, unknown> {
  return {
    id: u.id,
    username: u.username,
    role: u.role,
    enabled: u.enabled,
    created_at: u.created_at,
    last_login_at: u.last_login_at,
  }
}

const USERNAME_RE = /^[A-Za-z0-9_.-]{3,32}$/

adminApi.get('/users', async (c) => {
  try {
    const self = me(c).id
    const users = (await listUsers(c.env)).map((u) => ({ ...safeUser(u), is_self: u.id === self }))
    return ok({ users, self })
  } catch (e) {
    return fail(`用户查询失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.post('/users', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const body = (await c.req.json().catch(() => ({}))) as {
      username?: string
      password?: string
      role?: string
    }
    const username = String(body.username ?? '').trim()
    const password = String(body.password ?? '')
    const role: UserRole = body.role === 'admin' ? 'admin' : 'member'
    if (!USERNAME_RE.test(username)) {
      return fail('用户名需为 3-32 位字母、数字、下划线、点或连字符', 400)
    }
    if (password.length < 6) return fail('密码至少 6 位', 400)
    if (await getUserByUsername(c.env, username)) return fail('该用户名已存在', 409)
    const user = await createUser(c.env, { username, password, role, createdBy: me(c).id })
    await audit(c, 'user.create', 'user', user.id, `${username} (${role})`)
    return ok({ user: safeUser(user) })
  } catch (e) {
    return fail(`创建用户失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.patch('/users/:id', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const id = c.req.param('id')
    const target = await getUserById(c.env, id)
    if (!target) return fail('用户不存在', 404)
    const body = (await c.req.json().catch(() => ({}))) as { role?: string; enabled?: boolean | number }
    const nextRole = body.role === 'admin' ? 'admin' : body.role === 'member' ? 'member' : undefined
    const nextEnabled = body.enabled === undefined ? undefined : body.enabled ? 1 : 0
    if (id === me(c).id && (nextRole !== undefined || nextEnabled === 0)) {
      return fail('不能修改自己的角色或停用自己', 400)
    }
    // 保护最后一个启用中的管理员：不允许降级或停用
    const losingAdmin =
      target.role === 'admin' && target.enabled === 1 && (nextRole === 'member' || nextEnabled === 0)
    if (losingAdmin && (await countAdmins(c.env)) <= 1) {
      return fail('至少需要保留一个启用状态的管理员', 400)
    }
    const changed = await updateUser(c.env, id, { role: nextRole, enabled: nextEnabled })
    if (nextEnabled === 0) await deleteUserSessions(c.env, id)
    if (changed) {
      await audit(
        c,
        'user.update',
        'user',
        id,
        `${target.username} ${[nextRole ? `角色=${nextRole}` : '', nextEnabled !== undefined ? `启用=${nextEnabled}` : ''].filter(Boolean).join(' ')}`,
      )
    }
    return changed ? ok({ updated: true }) : fail('没有需要修改的字段', 400)
  } catch (e) {
    return fail(`更新用户失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.put('/users/:id/password', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const id = c.req.param('id')
    const target = await getUserById(c.env, id)
    if (!target) return fail('用户不存在', 404)
    const body = (await c.req.json().catch(() => ({}))) as { password?: string }
    const next = String(body.password ?? '')
    if (next.length < 6) return fail('新密码至少 6 位', 400)
    await setUserPassword(c.env, id, next)
    // 强制该用户重新登录
    await deleteUserSessions(c.env, id)
    await audit(c, 'user.password', 'user', id, target.username)
    return ok({ updated: true })
  } catch (e) {
    return fail(`重置密码失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.delete('/users/:id', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const id = c.req.param('id')
    const target = await getUserById(c.env, id)
    if (!target) return fail('用户不存在', 404)
    if (id === me(c).id) return fail('不能删除自己', 400)
    if (target.role === 'admin' && target.enabled === 1 && (await countAdmins(c.env)) <= 1) {
      return fail('至少需要保留一个启用状态的管理员', 400)
    }
    // 名下资源转交操作者（管理员），避免令牌 / 公众号变成无主
    const operator = me(c).id
    await reassignOwnership(c.env, id, operator)
    await deleteUserSessions(c.env, id)
    await deleteUser(c.env, id)
    await audit(c, 'user.delete', 'user', id, target.username)
    return ok({ deleted: true, reassigned_to: operator })
  } catch (e) {
    return fail(`删除用户失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

// ==================== 在线试用（直接推送到草稿箱） ====================

adminApi.post('/try', async (c) => {
  let body: DraftRequest | null = null
  try {
    body = (await c.req.json()) as DraftRequest
  } catch {
    return fail('请求体必须是合法 JSON', 400)
  }
  if (!body?.content && !(Array.isArray(body?.articles) && body.articles.some((a) => String(a?.content ?? '').trim()))) {
    return fail('正文（content）不能为空', 400)
  }
  return pushDraft(c.env, body, '后台试用', body?.accountId ?? null, ownerScope(c))
})

// ==================== 账号管理 ====================

/**
 * 公众号凭据是否可用：拿 token + 试读一次草稿列表（顺带暴露 IP 白名单问题）
 * 同时尽量读取公众号昵称（未认证号可能无权限 → 返回 null，不视为失败）
 */
async function probeAccount(
  appid: string,
  appsecret: string,
): Promise<{ draftTotal: number; nickName: string | null }> {
  const wx = new WeChat(appid, appsecret)
  await wx.getToken(true)
  const drafts = await wx.batchGetDrafts(0, 1)
  const nickName = await wx.getAccountNickName()
  return { draftTotal: drafts.total_count ?? 0, nickName }
}

adminApi.get('/accounts', async (c) => {
  try {
    const accounts = await listAccounts(c.env, ownerScope(c))
    return ok({
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        appid: a.appid,
        secret_masked: mask(a.appsecret),
        enabled: a.enabled,
        is_default: a.is_default,
        created_at: a.created_at,
      })),
    })
  } catch (e) {
    return fail(`公众号列表读取失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.post('/accounts', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const body = (await c.req.json().catch(() => ({}))) as {
      name?: string
      appid?: string
      appsecret?: string
      is_default?: boolean
    }
    const appid = String(body.appid ?? '').trim()
    const appsecret = String(body.appsecret ?? '').trim()
    if (!appid) return fail('AppID 不能为空', 400)
    if (!appsecret) return fail('AppSecret 不能为空', 400)
    if (appid.length < 10) return fail('AppID 格式不正确（应为 wx 开头的 18 位字符）', 400)
    if (appsecret.length < 16) return fail('AppSecret 格式不正确（应为 32 位字符）', 400)
    const exist = (await listAccounts(c.env)).find((a) => a.appid === appid)
    if (exist) return fail('该 AppID 已被添加', 409)

    // 先向微信验证凭据，避免把无效配置存进库（顺带尝试读取公众号昵称）
    let info: { draftTotal: number; nickName: string | null }
    try {
      info = await probeAccount(appid, appsecret)
    } catch (e) {
      return fail(
        `凭据校验未通过：${String((e as Error)?.message ?? e)}（请核对 AppID/AppSecret，并确认已把 Cloudflare 出口 IP 加入微信白名单）`,
        400,
      )
    }

    const acc = await createAccount(
      c.env,
      {
        // 名称优先级：用户填写 > 微信自动读取的昵称 > 兜底
        name: String(body.name ?? '').trim() || info.nickName || `公众号 ${appid.slice(-6)}`,
        appid,
        appsecret,
        is_default: body.is_default,
      },
      me(c).id,
    )
    await audit(c, 'account.create', 'account', acc.id, acc.name)
    return ok({
      account: { id: acc.id, name: acc.name, appid: acc.appid, is_default: acc.is_default },
      nickname: info.nickName,
      draft_total: info.draftTotal,
    })
  } catch (e) {
    return fail(`添加公众号失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.put('/accounts/:id', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const id = c.req.param('id')
    const acc = await getAccountById(c.env, id)
    if (!acc || !owns(ownerScope(c), acc.user_id)) return fail('公众号不存在', 404)
    const body = (await c.req.json().catch(() => ({}))) as {
      name?: string
      appid?: string
      appsecret?: string
      enabled?: boolean | number
    }
    const nextAppid = String(body.appid ?? '').trim() || acc.appid
    const nextSecret = String(body.appsecret ?? '').trim() || acc.appsecret
    const changedCred = nextAppid !== acc.appid || nextSecret !== acc.appsecret
    let nickName: string | null = null
    if (changedCred) {
      if (nextAppid !== acc.appid) {
        const dup = (await listAccounts(c.env)).find((a) => a.appid === nextAppid && a.id !== id)
        if (dup) return fail('该 AppID 已被添加', 409)
      }
      try {
        const info = await probeAccount(nextAppid, nextSecret)
        nickName = info.nickName
      } catch (e) {
        return fail(`凭据校验未通过：${String((e as Error)?.message ?? e)}`, 400)
      }
    }
    await updateAccount(c.env, id, {
      // 名称：用户显式填写优先；换凭据后若未填，则用微信读到的昵称补齐
      name: String(body.name ?? '').trim() || nickName || undefined,
      appid: body.appid,
      appsecret: body.appsecret,
      enabled: typeof body.enabled === 'boolean' ? (body.enabled ? 1 : 0) : (body.enabled as number | undefined),
    })
    await audit(c, 'account.update', 'account', id, acc.name)
    return ok({ updated: true })
  } catch (e) {
    return fail(`更新公众号失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.delete('/accounts/:id', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const acc = await getAccountById(c.env, c.req.param('id'))
    if (!acc || !owns(ownerScope(c), acc.user_id)) return fail('公众号不存在', 404)
    await deleteAccount(c.env, acc.id)
    await audit(c, 'account.delete', 'account', acc.id, acc.name)
    return ok({ deleted: true })
  } catch (e) {
    return fail(`删除公众号失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.post('/accounts/:id/default', async (c) => {
  try {
    const acc = await getAccountById(c.env, c.req.param('id'))
    if (!acc || !owns(ownerScope(c), acc.user_id)) return fail('公众号不存在', 404)
    await setDefaultAccount(c.env, acc.id, ownerScope(c))
    await audit(c, 'account.default', 'account', acc.id, acc.name)
    return ok({ is_default: true })
  } catch (e) {
    return fail(`设置默认公众号失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.post('/accounts/:id/test', async (c) => {
  try {
    const acc = await getAccountById(c.env, c.req.param('id'))
    if (!acc || !owns(ownerScope(c), acc.user_id)) return fail('公众号不存在', 404)
    const info = await probeAccount(acc.appid, acc.appsecret)
    // 顺带把新读到的昵称补写进库（老数据可能还是「公众号 x」这类兜底名）
    if (info.nickName && info.nickName !== acc.name) {
      await updateAccount(c.env, acc.id, { name: info.nickName })
    }
    return ok({
      account: info.nickName || acc.name,
      nickname: info.nickName,
      appid: acc.appid,
      draft_total: info.draftTotal,
      message: '凭据可用，可正常读取草稿箱',
    })
  } catch (e) {
    return fail(String((e as Error)?.message ?? e), 400)
  }
})

// ==================== 微信真实草稿箱 ====================

adminApi.get('/wx-drafts', async (c) => {
  try {
    const accountId = c.req.query('account_id') || null
    if (accountId) {
      const target = await getAccountById(c.env, accountId)
      if (!target || !owns(ownerScope(c), target.user_id)) return fail('指定的公众号不存在', 404)
    }
    const account = await resolveAccount(c.env, accountId, ownerScope(c))
    if (!account) throw new Error('尚未添加公众号：请到后台「账号管理」添加 AppID / AppSecret')
    const offset = Math.max(Number(c.req.query('offset') ?? 0) || 0, 0)
    const count = Math.min(Math.max(Number(c.req.query('count') ?? 20) || 20, 1), 20)
    const q = (c.req.query('q') ?? '').trim()
    const wx = new WeChat(account.appid, account.appsecret)
    const accountInfo = { id: account.id, name: account.name, appid: account.appid }

    // 微信无搜索接口：按页扫描前 N 条，按标题 / 作者过滤（有上限，避免拖垮请求）
    if (q) {
      const MAX_SCAN = 200
      const needle = q.toLowerCase()
      const matched: unknown[] = []
      let total = 0
      let scanned = 0
      for (let off = 0; off < MAX_SCAN; off += 20) {
        const page = await wx.batchGetDrafts(off, 20)
        total = page.total_count ?? total
        const items = page.item ?? []
        if (!items.length) break
        scanned += items.length
        for (const it of items) {
          const ni = it.content?.news_item?.[0] ?? {}
          if (`${ni.title ?? ''} ${ni.author ?? ''}`.toLowerCase().includes(needle)) matched.push(it)
        }
        if (scanned >= total) break
      }
      return ok({
        account: accountInfo,
        query: q,
        offset: 0,
        count: matched.length,
        total_count: total,
        scanned,
        item_count: matched.length,
        item: matched,
      })
    }

    const data = await wx.batchGetDrafts(offset, count)
    return ok({
      account: accountInfo,
      offset,
      count,
      total_count: data.total_count ?? 0,
      item_count: data.item_count ?? 0,
      item: data.item ?? [],
    })
  } catch (e) {
    return fail(String((e as Error)?.message ?? e), 500)
  }
})

adminApi.delete('/wx-drafts/:mediaId', async (c) => {
  try {
    const denied = await confirmSensitive(c)
    if (denied) return denied
    const account = await resolveAccount(c.env, c.req.query('account_id') || null, ownerScope(c))
    if (!account) throw new Error('尚未添加公众号：请到后台「账号管理」添加 AppID / AppSecret')
    const wx = new WeChat(account.appid, account.appsecret)
    const mediaId = c.req.param('mediaId')
    await wx.deleteDraft(mediaId)
    await audit(c, 'wx-draft.delete', 'draft', mediaId, account.name)
    return ok({ media_id: mediaId, account: account.name })
  } catch (e) {
    return fail(String((e as Error)?.message ?? e), 500)
  }
})

/** 令牌脱敏：保留前 8 后 4，中间以 * 代替 */
function maskToken(key: string): string {
  const s = String(key ?? '')
  if (s.length <= 12) return `${s.slice(0, 3)}${'*'.repeat(Math.max(1, s.length - 3))}`
  return `${s.slice(0, 8)}${'*'.repeat(8)}${s.slice(-4)}`
}

/** 脱敏显示：保留前 4 后 4 */
function mask(s?: string): string {
  if (!s) return ''
  if (s.length <= 8) return s.slice(0, 2) + '***'
  return `${s.slice(0, 4)}****${s.slice(-4)}`
}
