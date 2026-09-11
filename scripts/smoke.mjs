/**
 * 冒烟测试：直接加载 Worker 导出并调用 fetch()，验证路由 / 鉴权 / 错误处理
 * 运行：
 *   node scripts/smoke.mjs                                      # 测 dist/worker.js（单文件版）
 *   WORKER_ENTRY=../.dry-run/index.js node scripts/smoke.mjs     # 测 TS 打包产物
 */
const entry = process.argv[2] || process.env.WORKER_ENTRY || '../dist/worker.js'
const { default: worker } = await import(new URL(entry, import.meta.url))

let pass = 0
let fail = 0

function check(name, cond, extra = '') {
  if (cond) {
    pass++
    console.log('  [PASS]', name)
  } else {
    fail++
    console.log('  [FAIL]', name, extra)
  }
}

async function call(path, opts = {}, env = {}) {
  const req = new Request('https://worker.test' + path, opts)
  const resp = await worker.fetch(req, env)
  let body = null
  try {
    body = await resp.json()
  } catch (e) {
    body = null
  }
  return { status: resp.status, body, headers: resp.headers }
}

console.log('== wx-draft-worker 冒烟测试 ==\n')

// 1) 健康检查
let r = await call('/')
check('GET / 返回 200', r.status === 200, JSON.stringify(r.body))
check('service 名称正确', r.body?.data?.service === 'wx-draft-worker')
check('未配置 AppID 时 appid_configured=false', r.body?.data?.appid_configured === false)

r = await call('/api/health')
check('GET /api/health 返回 200', r.status === 200)
check('secret_configured=false', r.body?.data?.secret_configured === false)

// 2) 路由 404
r = await call('/nope')
check('未知路径返回 404', r.status === 404)

// 3) 参数校验（带上假密钥，才能走到 content 校验分支）
const envFake = { WECHAT_APPID: 'wx-test', WECHAT_APPSECRET: 'test-secret' }
r = await call('/api/draft', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ title: 'x' }),
}, envFake)
check('缺少 content 报错', r.status === 500 && /content/.test(r.body?.error || ''))

r = await call('/api/draft', { method: 'POST', body: '{bad json' })
check('非法 JSON 返回 400', r.status === 400)

// 4) 鉴权
const envKey = { DRAFT_API_KEY: 'secret-key', WECHAT_APPID: '', WECHAT_APPSECRET: '' }
r = await call('/api/draft', { method: 'POST', body: '{}' }, envKey)
check('未带 key 返回 401', r.status === 401)

r = await call('/api/draft', { method: 'POST', body: '{}' }, envKey)
check('鉴权响应含提示', /未授权/.test(r.body?.error || ''))

r = await call('/api/draft?key=secret-key', { method: 'POST', body: '{}' }, envKey)
check('query key 通过鉴权(进到业务层)', r.status === 500)

r = await call('/api/draft', {
  method: 'POST',
  headers: { 'x-api-key': 'secret-key' },
  body: '{}',
}, envKey)
check('请求头 key 通过鉴权', r.status === 500)

r = await call('/', {}, envKey)
check('健康检查无需鉴权', r.status === 200)

// 5) CORS 预检
r = await call('/api/draft', { method: 'OPTIONS' })
check('OPTIONS 返回 204', r.status === 204)
check('CORS 头存在', !!r.headers.get('access-control-allow-origin'))

// 6) 未配置公众号密钥
r = await call('/api/draft', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ title: 't', content: '<p>hi</p>' }),
})
check('未配置 AppID 时报配置错误', r.status === 500 && /WECHAT_APPID/.test(r.body?.error || ''))

console.log(`\n结果: ${pass} 通过 / ${fail} 失败`)
process.exit(fail ? 1 : 0)
