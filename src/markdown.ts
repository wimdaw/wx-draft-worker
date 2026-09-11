/**
 * 极简 Markdown → HTML 渲染器（微信公众号草稿可用）
 * 支持：标题 / 粗体 / 斜体 / 行内代码 / 代码块 / 链接 / 图片 / 引用 / 列表 / 分割线 / 段落
 */
import { escapeHtml } from './utils'

export function renderMarkdown(md: string): string {
  let s = md.replace(/\r\n/g, '\n').trim()

  // 1) 先抽出代码块，避免内部被二次解析
  const blocks: string[] = []
  s = s.replace(/```([\w+-]*)\n([\s\S]*?)```/g, (_m, lang: string, code: string) => {
    const i = blocks.length
    const cls = lang ? ` class="language-${escapeHtml(lang)}"` : ''
    blocks.push(`<pre><code${cls}>${escapeHtml(code)}</code></pre>`)
    return `\u0000B${i}\u0000`
  })

  // 2) 行内元素（先图后链接，避免冲突）
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    (_m, alt: string, src: string) => `<img src="${src}" alt="${escapeHtml(alt)}">`,
  )
  s = s.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, text: string, href: string) => `<a href="${href}">${text}</a>`,
  )
  s = s.replace(/`([^`]+)`/g, (_m, code: string) => `<code>${escapeHtml(code)}</code>`)
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')

  // 3) 块级元素（逐行处理）
  const lines = s.split('\n')
  const out: string[] = []
  let inList: 'ul' | 'ol' | null = null

  const closeList = () => {
    if (inList) {
      out.push(`</${inList}>`)
      inList = null
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    // 占位代码块
    const ph = /^\u0000B(\d+)\u0000$/.exec(line.trim())
    if (ph) {
      closeList()
      out.push(blocks[Number(ph[1])])
      continue
    }

    if (/^\s*$/.test(line)) {
      closeList()
      continue
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line)
    if (h) {
      closeList()
      const lv = h[1].length
      out.push(`<h${lv}>${h[2]}</h${lv}>`)
      continue
    }
    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      closeList()
      out.push('<hr>')
      continue
    }
    const quote = /^>\s?(.*)$/.exec(line)
    if (quote) {
      closeList()
      out.push(`<blockquote>${quote[1]}</blockquote>`)
      continue
    }
    const ul = /^[-*+]\s+(.*)$/.exec(line)
    if (ul) {
      if (inList !== 'ul') {
        closeList()
        out.push('<ul>')
        inList = 'ul'
      }
      out.push(`<li>${ul[1]}</li>`)
      continue
    }
    const ol = /^\d+[.)]\s+(.*)$/.exec(line)
    if (ol) {
      if (inList !== 'ol') {
        closeList()
        out.push('<ol>')
        inList = 'ol'
      }
      out.push(`<li>${ol[1]}</li>`)
      continue
    }
    closeList()
    out.push(`<p>${line}</p>`)
  }
  closeList()

  return out.join('\n')
}
