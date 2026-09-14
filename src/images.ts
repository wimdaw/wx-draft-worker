/**
 * 图片处理：data URI / 远程 URL → Blob；提取正文图片、判断微信域名
 */

/** 模拟浏览器 UA，兼容部分图床/CDN 的防盗链与 Cloudflare 边缘校验 */
export const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

const DATA_URI_RE = /^data:([^;]+);base64,(.*)$/s

/** data URI → Blob */
export function dataUriToBlob(dataUri: string): Blob | null {
  const m = DATA_URI_RE.exec(dataUri)
  if (!m) return null
  const bin = atob(m[2].replace(/\s/g, ''))
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return new Blob([arr], { type: m[1] })
}

/** 远程 URL → Blob */
export async function urlToBlob(url: string): Promise<Blob> {
  const resp = await fetch(url, {
    headers: { 'User-Agent': BROWSER_UA, Accept: 'image/*,*/*;q=0.8' },
    redirect: 'follow',
  })
  if (!resp.ok) {
    throw new Error(`下载图片失败: ${url} (HTTP ${resp.status})`)
  }
  return resp.blob()
}

/** 是否已经是微信域名图片（无需转存） */
export function isWxImageUrl(url: string): boolean {
  return (
    url.startsWith('https://mmbiz.qpic.cn') ||
    url.startsWith('http://mmbiz.qpic.cn')
  )
}

/** 解码 HTML 属性中的常见实体（&amp; 按字面拉取会导致图床 400） */
export function decodeAttrEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
}

/** 提取 HTML 中所有 <img src>（返回值已解码实体，可直接用于下载） */
export function extractImgSrcs(html: string): string[] {
  const re = /<img\s+[^>]*?src=["']([^"']+)["'][^>]*>/gi
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) out.push(decodeAttrEntities(m[1]))
  return out
}

/** 取正文第一张图 */
export function firstImgSrc(html: string): string | null {
  return extractImgSrcs(html)[0] ?? null
}

/** 通用：data URI / http(s) URL → Blob（其它返回 null） */
export async function sourceToBlob(src: string): Promise<Blob | null> {
  if (src.startsWith('data:')) return dataUriToBlob(src)
  if (/^https?:\/\//i.test(src)) return urlToBlob(src)
  return null
}
