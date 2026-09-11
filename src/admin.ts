/**
 * wx-draft-worker · 后台 API
 * 全部挂在 /admin/api 下，由 adminAuthMiddleware 保护（未登录返回 401）
 */
import { Hono } from 'hono'
import type { Env, DraftRequest } from './types'
import { ok, fail } from './utils'
import {
  listTokens,
  getTokenById,
  createToken,
  updateToken,
  deleteToken,
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
} from './storage'
import { pushDraft } from './draft'
import { WeChat } from './wechat'
import { verifyAdminPassword, getAdminPassword, getAdminUser, usingDefaultPassword } from './auth'

export const adminApi = new Hono<{ Bindings: Env }>()

// ==================== 概览 ====================

adminApi.get('/stats', async (c) => {
  try {
    return ok(await getStats(c.env))
  } catch (e) {
    return fail(`统计查询失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

// ==================== 令牌管理 ====================

adminApi.get('/tokens', async (c) => {
  try {
    // 列表只回脱敏密钥；完整密钥由 GET /tokens/:id/key 按需单独提供
    const tokens = (await listTokens(c.env)).map((t) => ({ ...t, key: maskToken(t.key) }))
    return ok({ tokens })
  } catch (e) {
    return fail(`令牌查询失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

/** 取完整令牌密钥（后台「显示 / 隐藏」与「复制」按钮按需调用） */
adminApi.get('/tokens/:id/key', async (c) => {
  try {
    const token = await getTokenById(c.env, c.req.param('id'))
    return token ? ok({ id: token.id, key: token.key }) : fail('令牌不存在', 404)
  } catch (e) {
    return fail(`读取令牌失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.post('/tokens', async (c) => {
  try {
    const body = (await c.req.json().catch(() => ({}))) as { name?: string }
    const token = await createToken(c.env, String(body.name ?? ''))
    return ok({ token })
  } catch (e) {
    return fail(`创建令牌失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.patch('/tokens/:id', async (c) => {
  try {
    const body = (await c.req.json().catch(() => ({}))) as { name?: string; enabled?: boolean | number }
    const changed = await updateToken(c.env, c.req.param('id'), {
      ...(body.name !== undefined ? { name: String(body.name) } : {}),
      ...(body.enabled !== undefined ? { enabled: body.enabled ? 1 : 0 } : {}),
    })
    return changed ? ok({ updated: true }) : fail('令牌不存在或没有需要修改的字段', 404)
  } catch (e) {
    return fail(`更新令牌失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.delete('/tokens/:id', async (c) => {
  try {
    const deleted = await deleteToken(c.env, c.req.param('id'))
    return deleted ? ok({ deleted: true }) : fail('令牌不存在', 404)
  } catch (e) {
    return fail(`删除令牌失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

// ==================== 推送记录 ====================

adminApi.get('/records', async (c) => {
  try {
    const limit = Number(c.req.query('limit') ?? 50) || 50
    const offset = Number(c.req.query('offset') ?? 0) || 0
    return ok({ records: await listDraftRecords(c.env, limit, offset) })
  } catch (e) {
    return fail(`记录查询失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.delete('/records/:id', async (c) => {
  try {
    const deleted = await deleteDraftRecord(c.env, c.req.param('id'))
    return deleted ? ok({ deleted: true }) : fail('记录不存在', 404)
  } catch (e) {
    return fail(`删除记录失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.delete('/records', async (c) => {
  try {
    await clearDraftRecords(c.env)
    return ok({ cleared: true })
  } catch (e) {
    return fail(`清空记录失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

// ==================== 设置 ====================

adminApi.get('/settings', async (c) => {
  try {
    const settings = await getSettings(c.env)
    const accounts = await listAccounts(c.env)
    return ok({
      settings,
      using_default_password: await usingDefaultPassword(c.env),
      admin_user: await getAdminUser(c.env),
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
    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>
    const allowed = ['default_author', 'default_content_type', 'default_need_open_comment']
    let n = 0
    for (const k of allowed) {
      if (body[k] !== undefined) {
        await setSetting(c.env, k, String(body[k]))
        n++
      }
    }
    return n ? ok({ updated: n }) : fail('没有可更新的设置项', 400)
  } catch (e) {
    return fail(`设置保存失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

// ==================== 管理员密码 ====================

adminApi.put('/password', async (c) => {
  try {
    const body = (await c.req.json().catch(() => ({}))) as { old?: string; new?: string }
    if (!(await verifyAdminPassword(c.env, String(body.old ?? '')))) {
      return fail('当前密码错误', 400)
    }
    const next = String(body.new ?? '')
    if (next.length < 6) return fail('新密码至少 6 位', 400)
    await setSetting(c.env, 'admin_password', next)
    return ok({ updated: true })
  } catch (e) {
    return fail(`修改密码失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.get('/password', async (c) => {
  const pw = await getAdminPassword(c.env)
  return ok({ using_default: pw === 'admin', length: pw.length })
})

// ==================== 在线试用（直接推送到草稿箱） ====================

adminApi.post('/try', async (c) => {
  let body: DraftRequest | null = null
  try {
    body = (await c.req.json()) as DraftRequest
  } catch {
    return fail('请求体必须是合法 JSON', 400)
  }
  if (!body?.content) return fail('正文（content）不能为空', 400)
  return pushDraft(c.env, body, '后台试用', body?.accountId ?? null)
})

// ==================== 公众号管理 ====================

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
    const accounts = await listAccounts(c.env)
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
    if (exist) return fail(`该 AppID 已存在（${exist.name}）`, 409)

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

    const acc = await createAccount(c.env, {
      // 名称优先级：用户填写 > 微信自动读取的昵称 > 兜底
      name: String(body.name ?? '').trim() || info.nickName || `公众号 ${appid.slice(-6)}`,
      appid,
      appsecret,
      is_default: body.is_default,
    })
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
    const id = c.req.param('id')
    const acc = await getAccountById(c.env, id)
    if (!acc) return fail('公众号不存在', 404)
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
        if (dup) return fail(`该 AppID 已被「${dup.name}」占用`, 409)
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
    return ok({ updated: true })
  } catch (e) {
    return fail(`更新公众号失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.delete('/accounts/:id', async (c) => {
  try {
    const okDel = await deleteAccount(c.env, c.req.param('id'))
    return okDel ? ok({ deleted: true }) : fail('公众号不存在', 404)
  } catch (e) {
    return fail(`删除公众号失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.post('/accounts/:id/default', async (c) => {
  try {
    const okSet = await setDefaultAccount(c.env, c.req.param('id'))
    return okSet ? ok({ is_default: true }) : fail('公众号不存在', 404)
  } catch (e) {
    return fail(`设置默认公众号失败：${String((e as Error)?.message ?? e)}`, 500)
  }
})

adminApi.post('/accounts/:id/test', async (c) => {
  try {
    const acc = await getAccountById(c.env, c.req.param('id'))
    if (!acc) return fail('公众号不存在', 404)
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
      if (!target) return fail('指定的公众号不存在', 404)
    }
    const account = await resolveAccount(c.env, accountId)
    if (!account) throw new Error('尚未添加公众号：请到后台「公众号管理」添加 AppID / AppSecret')
    const offset = Number(c.req.query('offset') ?? 0) || 0
    const count = Math.min(Number(c.req.query('count') ?? 20) || 20, 20)
    const wx = new WeChat(account.appid, account.appsecret)
    const data = await wx.batchGetDrafts(offset, count)
    return ok({
      account: { id: account.id, name: account.name, appid: account.appid },
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
    const account = await resolveAccount(c.env, c.req.query('account_id') || null)
    if (!account) throw new Error('尚未添加公众号：请到后台「公众号管理」添加 AppID / AppSecret')
    const wx = new WeChat(account.appid, account.appsecret)
    await wx.deleteDraft(c.req.param('mediaId'))
    return ok({ media_id: c.req.param('mediaId'), account: account.name })
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
