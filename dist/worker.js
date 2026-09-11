/**
 * wx-draft-worker · 单文件版
 * Cloudflare Worker（无依赖），可直接粘贴到控制台编辑器运行。
 *
 * 环境变量：
 *   WECHAT_APPID     公众号 AppID
 *   WECHAT_APPSECRET 公众号 AppSecret（机密）
 *   DRAFT_API_KEY    调用密钥（可选，留空则不鉴权）
 *
 * 接口：
 *   GET    /                     健康检查
 *   GET    /api/health           配置检查
 *   POST   /api/draft            新建草稿
 *   GET    /api/drafts           草稿列表
 *   DELETE /api/drafts/:mediaId  删除草稿
 */
const VERSION = '1.0.0'
const WX_BASE = 'https://api.weixin.qq.com'
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
const TOKEN_CACHE_MS = 7000 * 1000
const KEY_HEADER = 'x-api-' + 'key'

let tokenCache = { value: null, expireAt: 0 }

/* ============ 响应工具 ============ */
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: Object.assign(
      { 'content-type': 'application/json; charset=utf-8' },
      extraHeaders,
    ),
  })
}
function ok(data, status = 200) {
  return json({ ok: true, data }, status)
}
function fail(message, status = 400) {
  return json({ ok: false, error: message }, status)
}

/* ============ 微信错误码映射 ============ */
const WX_ERRORS = {
  40001: 'AppSecret 无效，请检查 WECHAT_APPSECRET',
  40013: 'AppID 无效，请检查 WECHAT_APPID',
  40164: '调用方 IP 不在白名单：请把 Cloudflare 全部 IPv4 段加入公众号 IP 白名单',
  41001: '缺少 access_token',
  42001: 'access_token 已过期',
  43001: '需要 GET 请求',
  44002: 'POST 数据包为空',
  45009: '接口调用超限，请稍后重试',
  48001: '接口未授权（可能账号类型不支持该接口）',
  53500: '无草稿权限：draft/add 需要已认证的公众号',
}

function wxError(action, data) {
  const code = data && data.errcode
  const hint = WX_ERRORS[code]
  const base = (data && data.errmsg) || '未知错误'
  return `${action}失败：${hint || base}${hint ? `（${base}）` : ''} [${code}]`
}

function throwIfWxError(action, data) {
  if (!data || typeof data !== 'object') {
    throw new Error(`${action}失败：响应异常`)
  }
  if (data.errcode) throw new Error(wxError(action, data))
}

/* ============ 文本工具 ============ */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
function stripTags(html) {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
function makeDigest(content, max = 120) {
  const t = stripTags(content)
  return t.length > max ? t.slice(0, max) : t
}
function truncate(s, max) {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

/* ============ 图片工具 ============ */
function dataUriToBlob(dataUri) {
  const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUri)
  if (!m) return null
  const mime = m[1]
  const bin = atob(m[2].replace(/\s+/g, ''))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: mime })
}

function mimeExt(mime) {
  if (!mime) return 'png'
  if (mime.indexOf('jpeg') >= 0 || mime.indexOf('jpg') >= 0) return 'jpg'
  if (mime.indexOf('gif') >= 0) return 'gif'
  if (mime.indexOf('webp') >= 0) return 'webp'
  if (mime.indexOf('png') >= 0) return 'png'
  return 'png'
}

async function urlToBlob(url) {
  const resp = await fetch(url, {
    headers: {
      'user-agent': BROWSER_UA,
      accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
    },
  })
  if (!resp.ok) throw new Error(`下载图片失败 HTTP ${resp.status}: ${url}`)
  const blob = await resp.blob()
  if (!blob.type || blob.type.indexOf('image/') !== 0) {
    // 有些 CDN 返回 octet-stream，仍按二进制处理
    return new Blob([await blob.arrayBuffer()], { type: 'image/png' })
  }
  return blob
}

async function sourceToBlob(src) {
  if (!src) return null
  if (src.indexOf('data:') === 0) return dataUriToBlob(src)
  if (/^https?:\/\//i.test(src)) return urlToBlob(src)
  return null
}

function isWxImageUrl(src) {
  return !!src && src.indexOf('mmbiz.qpic.cn') >= 0
}

function extractImgSrcs(html) {
  const out = []
  const re = /<img[^>]+src\s*=\s*["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html))) out.push(m[1])
  return out
}

/* ============ Markdown → HTML（极简） ============ */
function renderMarkdown(md) {
  let s = String(md).replace(/\r\n/g, '\n').trim()
  const blocks = []
  s = s.replace(/```([\w+-]*)\n([\s\S]*?)```/g, function (_m, lang, code) {
    const i = blocks.length
    blocks.push(
      '<pre style="background:#f6f8fa;padding:12px;border-radius:6px;overflow:auto;"><code>' +
        escapeHtml(code.replace(/\n$/, '')) +
        '</code></pre>',
    )
    return '\u0000B' + i + '\u0000'
  })

  const lines = s.split('\n')
  const out = []
  let inList = null
  function closeList() {
    if (inList) {
      out.push('</' + inList + '>')
      inList = null
    }
  }

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim()
    if (!line) {
      closeList()
      continue
    }
    const ph = /^\u0000B(\d+)\u0000$/.exec(line)
    if (ph) {
      closeList()
      out.push(blocks[Number(ph[1])])
      continue
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      closeList()
      out.push('<hr/>')
      continue
    }
    let m = /^(#{1,6})\s+(.*)$/.exec(line)
    if (m) {
      closeList()
      const level = m[1].length
      out.push('<h' + level + '>' + inline(m[2]) + '</h' + level + '>')
      continue
    }
    if (/^>\s?/.test(line)) {
      closeList()
      out.push(
        '<blockquote style="border-left:4px solid #ddd;padding-left:12px;color:#666;">' +
          inline(line.replace(/^>\s?/, '')) +
          '</blockquote>',
      )
      continue
    }
    const ul = /^[-*+]\s+(.*)$/.exec(line)
    if (ul) {
      if (inList !== 'ul') {
        closeList()
        out.push('<ul>')
        inList = 'ul'
      }
      out.push('<li>' + inline(ul[1]) + '</li>')
      continue
    }
    const ol = /^\d+[.)]\s+(.*)$/.exec(line)
    if (ol) {
      if (inList !== 'ol') {
        closeList()
        out.push('<ol>')
        inList = 'ol'
      }
      out.push('<li>' + inline(ol[1]) + '</li>')
      continue
    }
    closeList()
    out.push('<p>' + inline(line) + '</p>')
  }
  closeList()
  return out.join('\n')

  function inline(text) {
    let t = escapeHtml(text)
    t = t.replace(
      /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g,
      '<img src="$2" alt="$1"/>',
    )
    t = t.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2">$1</a>',
    )
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>')
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>')
    return t
  }
}

/* ============ 微信 API ============ */
async function getToken(env) {
  const now = Date.now()
  if (tokenCache.value && now < tokenCache.expireAt) return tokenCache.value
  if (!env.WECHAT_APPID || !env.WECHAT_APPSECRET) {
    throw new Error('服务端未配置 WECHAT_APPID / WECHAT_APPSECRET')
  }
  const resp = await fetch(WX_BASE + '/cgi-bin/stable_token', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credential',
      appid: env.WECHAT_APPID,
      secret: env.WECHAT_APPSECRET,
    }),
  })
  const data = await resp.json()
  throwIfWxError('获取 access_token', data)
  tokenCache = {
    value: data.access_token,
    expireAt: now + TOKEN_CACHE_MS,
  }
  return data.access_token
}

/** 正文图 → 微信域名（uploadimg，不占永久素材） */
async function uploadContentImage(env, imgSrc) {
  const blob = await sourceToBlob(imgSrc)
  if (!blob) throw new Error('无法识别的图片地址: ' + imgSrc)
  const token = await getToken(env)
  const fd = new FormData()
  fd.append('media', blob, 'image.' + mimeExt(blob.type))
  const resp = await fetch(
    WX_BASE + '/cgi-bin/media/uploadimg?access_token=' + encodeURIComponent(token),
    { method: 'POST', body: fd },
  )
  const data = await resp.json()
  if (!data.url) throw new Error('上传正文图失败: ' + JSON.stringify(data))
  return data.url
}

/** 封面图 → 永久素材，返回 media_id */
async function uploadCoverMaterial(env, blob, filename) {
  const token = await getToken(env)
  const fd = new FormData()
  fd.append('media', blob, filename || 'cover.png')
  const resp = await fetch(
    WX_BASE +
      '/cgi-bin/material/add_material?access_token=' +
      encodeURIComponent(token) +
      '&type=image',
    { method: 'POST', body: fd },
  )
  const data = await resp.json()
  if (!data.media_id) throw new Error('上传封面素材失败: ' + JSON.stringify(data))
  return data.media_id
}

/** 正文内非微信图片批量转存 */
async function localizeImages(env, html) {
  const srcs = extractImgSrcs(html)
  if (!srcs.length) return { html, count: 0 }
  let out = html
  let count = 0
  let firstWxUrl = null
  for (const src of srcs) {
    if (isWxImageUrl(src)) continue
    try {
      const wxUrl = await uploadContentImage(env, src)
      out = out.split(src).join(wxUrl)
      if (!firstWxUrl) firstWxUrl = wxUrl
      count++
    } catch (e) {
      // 单图失败不阻断整体流程
      console.error('图片转存失败:', src, e && e.message)
    }
  }
  return { html: out, count, firstWxUrl }
}

/** 提取正文第一张图（用于封面兜底） */
function firstImgSrc(html) {
  const srcs = extractImgSrcs(html)
  return srcs.length ? srcs[0] : null
}

/* ============ 核心：创建草稿 ============ */
async function createDraft(env, body) {
  if (!env.WECHAT_APPID || !env.WECHAT_APPSECRET) {
    throw new Error('服务端未配置 WECHAT_APPID / WECHAT_APPSECRET')
  }
  let content = body.content
  if (!content) throw new Error('缺少 content（正文）')
  if (body.contentType === 'markdown') content = renderMarkdown(content)

  // 1) 正文图片转存
  const loc = await localizeImages(env, content)
  content = loc.html

  // 2) 封面
  let thumbMediaId
  const cover = body.cover
  const coverSrc = cover || firstImgSrc(content)
  if (coverSrc) {
    const blob = await sourceToBlob(coverSrc)
    if (blob) {
      thumbMediaId = await uploadCoverMaterial(
        env,
        blob,
        'cover.' + mimeExt(blob.type),
      )
    }
  }
  if (!thumbMediaId) {
    throw new Error('无法生成封面：请传入 cover，或在正文中至少包含一张图片')
  }

  // 3) 组装并提交
  const title = truncate(String(body.title || '未命名文章'), 64)
  const article = {
    title,
    author: truncate(String(body.author || ''), 8),
    digest: truncate(String(body.digest || makeDigest(content)), 120),
    content,
    thumb_media_id: thumbMediaId,
    need_open_comment: body.needOpenComment === 0 ? 0 : 1,
    only_fans_can_comment: body.onlyFansCanComment ? 1 : 0,
  }
  if (body.contentSourceUrl) article.content_source_url = body.contentSourceUrl

  const token = await getToken(env)
  const resp = await fetch(
    WX_BASE + '/cgi-bin/draft/add?access_token=' + encodeURIComponent(token),
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ articles: [article] }),
    },
  )
  const data = await resp.json()
  throwIfWxError('创建草稿', data)
  if (!data.media_id) throw new Error('创建草稿失败: ' + JSON.stringify(data))
  return { media_id: data.media_id, title, images: loc.count }
}

/* ============ 微信草稿列表 / 删除 ============ */
async function listDrafts(env, offset, count) {
  const token = await getToken(env)
  const resp = await fetch(
    WX_BASE + '/cgi-bin/draft/batchget?access_token=' + encodeURIComponent(token),
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ offset, count, no_content: 0 }),
    },
  )
  const data = await resp.json()
  throwIfWxError('获取草稿列表', data)
  return data
}

async function deleteDraft(env, mediaId) {
  const token = await getToken(env)
  const resp = await fetch(
    WX_BASE + '/cgi-bin/draft/delete?access_token=' + encodeURIComponent(token),
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ media_id: mediaId }),
    },
  )
  const data = await resp.json()
  throwIfWxError('删除草稿', data)
}

/* ============ 入口 ============ */
export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method.toUpperCase()

    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
      'access-control-allow-headers': 'content-type,' + KEY_HEADER,
      'access-control-max-age': '86400',
    }
    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders })

    try {
      // 健康检查（无需鉴权）
      if ((path === '/' || path === '/api/health') && (method === 'GET' || method === 'HEAD')) {
        return json(
          {
            ok: true,
            data: {
              service: 'wx-draft-worker',
              version: VERSION,
              appid_configured: !!env.WECHAT_APPID,
              secret_configured: !!env.WECHAT_APPSECRET,
              auth_enabled: !!env.DRAFT_API_KEY,
              time: new Date().toISOString(),
            },
          },
          200,
          corsHeaders,
        )
      }

      // 鉴权（其余接口）
      if (env.DRAFT_API_KEY) {
        const provided = request.headers.get(KEY_HEADER) || url.searchParams.get('key') || ''
        if (provided !== env.DRAFT_API_KEY) {
          return fail('未授权：请在请求头携带 X-API-Key，或使用 ?key= 查询参数', 401)
        }
      }

      if (path === '/api/draft' && method === 'POST') {
        let body
        try {
          body = await request.json()
        } catch (e) {
          return fail('请求体不是合法 JSON', 400)
        }
        const data = await createDraft(env, body)
        return ok(data, 200)
      }

      if (path === '/api/drafts' && method === 'GET') {
        const offset = Number(url.searchParams.get('offset') || 0)
        const count = Math.min(Number(url.searchParams.get('count') || 20), 20)
        const data = await listDrafts(env, offset, count)
        return ok(data, 200)
      }

      const del = /^\/api\/drafts\/(.+)$/.exec(path)
      if (del && method === 'DELETE') {
        const mediaId = decodeURIComponent(del[1])
        await deleteDraft(env, mediaId)
        return ok({ media_id: mediaId }, 200)
      }

      return fail('接口不存在', 404)
    } catch (e) {
      return fail(String((e && e.message) || e), 500)
    }
  },
}
