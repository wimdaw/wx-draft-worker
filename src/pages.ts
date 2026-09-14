/**
 * wx-draft-worker · 页面渲染（服务端直出 HTML）
 * 视觉风格：复用 AI Gateway 设计系统（design.md · modern-minimal / Cloud Workbench）
 * 类名体系与 ai-gateway 保持一致：topbar / brand / home-hero / endpoint-box / request-panel /
 * metrics-strip / directory / section-heading / panel / tb / admin-shell / admin-rail 等
 */
import { CSS } from './pages.css'
import { escapeHtml } from './utils'

const ASSETS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=JetBrains+Mono:wght@400;500;600&amp;family=Space+Grotesk:wght@500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">`

function shell(title: string, body: string, bodyClass = 'site-page'): string {
  return `<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0f1115">
<meta name="description" content="把 Markdown / HTML 文章通过一行 API 推送进微信公众号草稿箱，图片自动转存，草稿由你确认后发布。">
<title>${escapeHtml(title)}</title>
${ASSETS}
<style>${CSS}</style>
</head><body class="${bodyClass}">${body}</body></html>`
}

/** 顶部导航（与 ai-gateway 同款 .topbar 结构） */
const TOPBAR = (loggedIn: boolean): string => `
<header class="topbar"><div class="shell topbar__inner">
  <a class="brand" href="/" aria-label="草稿推送网关首页">
    <span class="brand__mark" aria-hidden="true"><i class="fas fa-paper-plane"></i></span>
    <span class="brand__name">草稿推送网关</span>
    <span class="brand__descriptor">WECHAT DRAFT API</span>
  </a>
  <nav class="topbar__actions" aria-label="主导航">
    <a class="btn btn-gh" href="/#docs"><i class="fas fa-book" aria-hidden="true"></i>接口文档</a>
    <a class="btn btn-gh" href="/#start"><i class="fas fa-bolt" aria-hidden="true"></i>快速开始</a>
    <a class="btn btn-p" href="${loggedIn ? '/admin' : '/admin/login'}"><i class="fas fa-sliders-h" aria-hidden="true"></i>${loggedIn ? '进入后台' : '后台登录'}</a>
  </nav>
</div></header>`

const FOOTER = `<footer class="site-footer"><div class="shell site-footer__inner">
  <span>草稿推送网关 · Cloudflare Workers + Hono</span>
  <span>数据存储于自有 D1 数据库 · 仅创建草稿，不自动发布</span>
</div></footer>`

const COPY_SCRIPT = `<script>
(function () {
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var label = btn.querySelector('span');
      var done = function () {
        if (!label) return;
        var old = label.textContent;
        label.textContent = '已复制';
        setTimeout(function () { label.textContent = old; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else { done(); }
    });
  });
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
</script>`

/** 产品首页 */
export function renderHomePage(baseUrl: string): string {
  const curl = `curl -X POST ${baseUrl}/api/draft \\
  -H "X-API-Key: wxk_你的令牌" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "我的第一篇文章",
    "author": "小编",
    "contentType": "markdown",
    "content": "# 标题\\n\\n正文支持 **Markdown**，图片会自动转存",
    "cover": "https://example.com/cover.png"
  }'`

  const py = `import requests

r = requests.post(
    "${baseUrl}/api/draft",
    headers={"X-API-Key": "wxk_你的令牌"},
    json={
        "title": "我的第一篇文章",
        "author": "小编",
        "contentType": "markdown",
        "content": "# 标题\\n\\n正文里的外链图片会被自动转存到微信域名",
        "cover": "https://example.com/cover.png",
    },
    timeout=120,
)
print(r.json())   # {"ok": true, "data": {"media_id": "...", ...}}`

  const js = `const res = await fetch("${baseUrl}/api/draft", {
  method: "POST",
  headers: {
    "X-API-Key": "wxk_你的令牌",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "我的第一篇文章",
    contentType: "markdown",
    content: "## Hello\\n\\n这是正文",
    cover: "https://example.com/cover.png",
  }),
})
console.log(await res.json())`

  return shell(
    '草稿推送网关 · 一行 API 把文章送进公众号草稿箱',
    `${TOPBAR(false)}
<main>
  <section class="shell home-hero">
    <div class="home-hero__copy">
      <p class="eyebrow"><span aria-hidden="true"></span>CLOUDFLARE WORKERS · 微信公众号草稿 API</p>
      <h1 id="home-title">一行 API，把文章送进公众号草稿箱。</h1>
      <p class="home-hero__lede">传入 Markdown 或 HTML，服务自动完成外链图片转存、封面素材上传与草稿创建。
        排版与发布仍由你在公众号后台人工确认，安全可控。</p>
      <div class="endpoint-box" aria-label="接口地址">
        <span class="endpoint-box__label">DRAFT ENDPOINT</span>
        <code>${escapeHtml(baseUrl)}/api/draft</code>
        <button class="icon-btn" type="button" data-copy="${escapeHtml(baseUrl)}/api/draft" aria-label="复制接口地址">
          <i class="far fa-copy" aria-hidden="true"></i><span>复制</span>
        </button>
      </div>
      <div class="topbar__actions" style="margin-block-start:var(--space-md)">
        <a class="btn btn-p" href="#start"><i class="fas fa-bolt" aria-hidden="true"></i>立即接入</a>
        <a class="btn btn-s" href="/admin"><i class="fas fa-sliders-h" aria-hidden="true"></i>管理控制台</a>
      </div>
    </div>
    <figure class="request-panel" aria-labelledby="req-cap">
      <figcaption id="req-cap"><span>POST /api/draft</span>
        <span class="protocol-state"><i aria-hidden="true"></i>MARKDOWN / HTML</span></figcaption>
      <pre><code>${escapeHtml(curl)}</code></pre>
      <div class="request-panel__foot"><span>返回</span><code>{"ok":true,"data":{"media_id":"..."}}</code></div>
    </figure>
    <div class="endpoint-box endpoint-box--list" aria-label="全部接口">
      <span class="endpoint-box__label">ALL ENDPOINTS</span>
      <div class="endpoint-list">
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /api/draft</code><small>新建草稿</small></div>
        <div class="ep-item"><code><span class="endpoint-method">GET</span> /api/drafts</code><small>草稿箱列表</small></div>
        <div class="ep-item"><code><span class="endpoint-method">DELETE</span> /api/drafts/:mediaId</code><small>删除草稿</small></div>
        <div class="ep-item"><code><span class="endpoint-method">GET</span> /api/health</code><small>配置自检</small></div>
      </div>
    </div>
  </section>

  <section class="shell metrics-strip" aria-label="服务能力">
    <div class="metric"><span class="metric__value">4</span><span class="metric__label">业务接口</span></div>
    <div class="metric"><span class="metric__value">自动</span><span class="metric__label">图片转存</span></div>
    <div class="metric"><span class="metric__value">D1</span><span class="metric__label">记录存储</span></div>
    <div class="metric"><span class="metric__value">0</span><span class="metric__label">服务器依赖</span></div>
  </section>

  <section class="shell directory" id="start" aria-labelledby="start-title">
    <div class="section-heading">
      <div>
        <h2 id="start-title">快速开始</h2>
        <p>三步：领取令牌 → 调用接口 → 到公众号后台确认草稿。整个过程不需要服务器与备案。</p>
      </div>
    </div>

    <div class="hero-grid">
      <article class="hero-card">
        <h3><i class="fas fa-image icon-lg" aria-hidden="true"></i> 图片自动转存</h3>
        <p>正文中的外链图、Base64 图自动上传到微信域名，解决草稿里图片不显示的问题。</p>
      </article>
      <article class="hero-card">
        <h3><i class="fas fa-code icon-lg" aria-hidden="true"></i> Markdown 直传</h3>
        <p><code>contentType</code> 设为 <code>markdown</code> 即可，标题、列表、代码块、引用自动转成微信可用 HTML。</p>
      </article>
      <article class="hero-card">
        <h3><i class="fas fa-key icon-lg" aria-hidden="true"></i> 令牌与后台</h3>
        <p>多令牌签发、随时禁用；推送记录、成功率、耗时统计一屏掌握。</p>
      </article>
      <article class="hero-card">
        <h3><i class="fas fa-bolt icon-lg" aria-hidden="true"></i> 零运维</h3>
        <p>跑在 Cloudflare 边缘网络，冷启动毫秒级，全球可用，无需自备服务器。</p>
      </article>
      <article class="hero-card">
        <h3><i class="fas fa-flask icon-lg" aria-hidden="true"></i> 在线试用</h3>
        <p>后台粘贴标题与正文即可一键推送，不用写代码就能验证排版效果。</p>
      </article>
      <article class="hero-card">
        <h3><i class="fas fa-database icon-lg" aria-hidden="true"></i> 数据自持</h3>
        <p>记录存放于你自己的 D1 数据库，不经过任何第三方中转，密钥仅存于 Worker 加密变量。</p>
      </article>
    </div>

    <div class="section-heading" style="margin-block-start:var(--space-2xl)">
      <div>
        <h2>调用示例</h2>
        <p>在请求头携带 <code>X-API-Key</code>，也可使用 <code>Authorization: Bearer</code> 或 <code>?key=</code> 查询参数。</p>
      </div>
    </div>
    <div class="request-panel" style="margin-block-end:var(--space-md)">
      <figcaption><span>cURL</span></figcaption>
      <pre style="min-height:auto"><code>${escapeHtml(curl)}</code></pre>
    </div>
    <div class="request-panel" style="margin-block-end:var(--space-md)">
      <figcaption><span>Python</span></figcaption>
      <pre style="min-height:auto"><code>${escapeHtml(py)}</code></pre>
    </div>
    <div class="request-panel">
      <figcaption><span>JavaScript</span></figcaption>
      <pre style="min-height:auto"><code>${escapeHtml(js)}</code></pre>
    </div>

    <div class="notice warn" style="margin-block-start:var(--space-lg)">
      <strong><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> 使用前必做：把 Cloudflare 出口 IP 段加入公众号白名单</strong>
      <p>Worker 每次调用的出口 IP 都可能不同，没有加白名单时微信会直接拒绝，报错
        <code>40164 invalid ip … not in whitelist</code>。</p>
      <p>请到「公众号后台 → 设置与开发 → 基本配置（或安全中心）→ IP 白名单」，把下面
        <strong>全部 15 个 IPv4 段</strong>一次性粘进去（每行一段），保存后约 1~5 分钟生效：</p>
      <details open>
        <summary>展开 / 收起 Cloudflare 全部 IPv4 段（15 段）</summary>
        <pre class="mono-out" style="margin-block-start:var(--space-2xs)">173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22</pre>
      </details>
      <p><small>另注：调用方须携带浏览器 UA，否则会被 Cloudflare 边缘拦截（<code>403 error 1010</code>）；
      若绑定了自定义域名，还要在域名安全性里关闭 Bot Fight Mode 与浏览器完整性检查。</small></p>
    </div>
  </section>

  <section class="shell directory" id="docs" aria-labelledby="docs-title">
    <div class="section-heading">
      <div>
        <h2 id="docs-title">接口文档</h2>
        <p>业务接口均需携带令牌；返回统一为 <code>{ ok: true, data: {...} }</code> 或 <code>{ ok: false, error: "..." }</code>。</p>
      </div>
    </div>
    <div class="panel panel-flush">
      <table class="tb">
        <thead><tr><th style="width:90px">方法</th><th style="width:230px">路径</th><th>说明</th></tr></thead>
        <tbody>
          <tr><td><span class="method post">POST</span></td><td><code>/api/draft</code></td>
            <td>新建草稿。字段：<code>title</code> / <code>author</code>（≤8 字）/ <code>digest</code> / <code>content</code>（必填）/
            <code>cover</code> / <code>contentType</code>（html|markdown）/ <code>contentSourceUrl</code> /
            <code>needOpenComment</code> / <code>onlyFansCanComment</code>；传 <code>articles[]</code> 可一次发多图文（≤8 篇）</td></tr>
          <tr><td><span class="method get">GET</span></td><td><code>/api/drafts</code></td>
            <td>微信草稿箱列表，参数 <code>offset</code> / <code>count</code>（≤20）</td></tr>
          <tr><td><span class="method del">DELETE</span></td><td><code>/api/drafts/:mediaId</code></td>
            <td>删除指定草稿</td></tr>
          <tr><td><span class="method post">POST</span></td><td><code>/api/material</code></td>
            <td>上传图片为永久素材（<code>url</code> 或 <code>dataUri</code>）→ 返回 <code>media_id</code> 与微信域名 <code>url</code>，可复用</td></tr>
          <tr><td><span class="method get">GET</span></td><td><code>/api/health</code></td>
            <td>配置自检：公众号凭据、鉴权状态、数据库连通性</td></tr>
        </tbody>
      </table>
    </div>
    <div class="notice info" style="margin-block-start:var(--space-md)">
      推送成功返回 <code>media_id</code>，即草稿编号。请到「公众号后台 → 草稿箱」查看，
      确认排版无误后再群发 —— 本服务只创建草稿，绝不自动发布。
    </div>
  </section>
</main>
${FOOTER}
${COPY_SCRIPT}`,
    'site-page home-page',
  )
}

/** 登录页 */
export function renderLoginPage(opts: { error?: boolean; baseUrl: string } = { baseUrl: '' }): string {
  return shell(
    '后台登录 · 草稿推送网关',
    `<header class="topbar topbar--auth"><div class="shell topbar__inner">
  <a class="brand" href="/" aria-label="草稿推送网关首页">
    <span class="brand__mark" aria-hidden="true"><i class="fas fa-paper-plane"></i></span>
    <span class="brand__name">草稿推送网关</span>
  </a>
  <a class="btn btn-gh" href="/"><i class="fas fa-arrow-left" aria-hidden="true"></i>返回首页</a>
</div></header>
<main class="auth-shell">
  <section class="auth-context">
    <p class="eyebrow"><span aria-hidden="true"></span>CONTROL PANEL ACCESS</p>
    <h1>管理令牌、记录与草稿。</h1>
    <p class="auth-context__lede">登录后可以签发 / 停用 API 令牌，查看每一次推送的成功率与耗时，管理多个公众号凭据，并直接查看各公众号的草稿箱。</p>
    <div class="auth-facts">
      <div><i class="fas fa-key" aria-hidden="true"></i><div><strong>令牌管理</strong><span>多令牌签发与撤销</span></div></div>
      <div><i class="fas fa-chart-simple" aria-hidden="true"></i><div><strong>推送记录</strong><span>成功率与耗时统计</span></div></div>
      <div><i class="fas fa-inbox" aria-hidden="true"></i><div><strong>草稿箱</strong><span>查看与删除草稿</span></div></div>
      <div><i class="fas fa-shield-halved" aria-hidden="true"></i><div><strong>数据自持</strong><span>存储于自有 D1 库</span></div></div>
    </div>
  </section>
  <section class="auth-form-wrap">
    <form class="auth-form" method="post" action="/admin/login" novalidate>
      <div class="auth-form__heading">
        <span class="auth-form__icon" aria-hidden="true"><i class="fas fa-lock"></i></span>
        <div><h2>账号登录</h2><p>输入用户名与密码继续。</p></div>
      </div>
      ${opts.error ? '<div class="al al-e"><i class="fas fa-circle-exclamation" aria-hidden="true"></i><span>账号或密码不正确，请重新输入。</span></div>' : ''}
      <div class="fg">
        <label for="user">用户名</label>
        <div class="input-wrap">
          <i class="fas fa-user" aria-hidden="true"></i>
          <input id="user" name="username" type="text" placeholder="请输入用户名"
                 autocomplete="username" required autofocus aria-required="true" value="admin">
        </div>
      </div>
      <div class="fg">
        <label for="pw">密码</label>
        <div class="input-wrap">
          <i class="fas fa-key" aria-hidden="true"></i>
          <input id="pw" name="password" type="password" placeholder="请输入密码"
                 autocomplete="current-password" required aria-required="true">
          <button class="password-toggle" id="pw-toggle" type="button" aria-label="显示密码">
            <i class="far fa-eye" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <p class="form-helper">首个管理员账号默认 <code>admin</code>，由部署时的 <code>ADMIN_PASSWORD</code> 决定；成员账号请在后台「用户管理」中创建。</p>
      <button class="btn btn-p btn-submit" type="submit">
        <span class="button-label"><i class="fas fa-right-to-bracket" aria-hidden="true"></i>登录控制台</span>
      </button>
    </form>
  </section>
</main>
${FOOTER}
<script>
(function () {
  var input = document.getElementById('pw');
  var toggle = document.getElementById('pw-toggle');
  if (!toggle || !input) return;
  toggle.addEventListener('click', function () {
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.innerHTML = show
      ? '<i class="far fa-eye-slash" aria-hidden="true"></i>'
      : '<i class="far fa-eye" aria-hidden="true"></i>';
    toggle.setAttribute('aria-label', show ? '隐藏密码' : '显示密码');
    input.focus();
  });
})();
</script>`,
    'site-page auth-page',
  )
}

/** 后台单页骨架（数据由 /admin/app.js 拉取渲染） */
export function renderAdminPage(opts: { baseUrl: string; user?: { username: string; role: string } }): string {
  const navLink = (view: string, icon: string, label: string) =>
    `<a class="admin-nav__link" data-view="${view}" href="#${view}"><i class="${icon}" aria-hidden="true"></i><span>${label}</span></a>`

  const mobileNav = (view: string, label: string) =>
    `<a data-view="${view}" href="#${view}">${label}</a>`

  const isAdmin = opts.user?.role === 'admin'
  const username = opts.user?.username ?? ''
  const role = opts.user?.role ?? 'member'

  return shell(
    '控制台 · 草稿推送网关',
    `<div class="admin-shell">
  <aside class="admin-rail" aria-label="控制台导航">
    <div class="admin-rail__head">
      <a class="brand admin-rail__brand" href="/" aria-label="草稿推送网关首页">
        <span class="brand__mark" aria-hidden="true"><i class="fas fa-paper-plane"></i></span>
        <span><strong>草稿推送网关</strong><small>CONTROL PANEL</small></span>
      </a>
    </div>
    <nav class="admin-nav" aria-label="功能导航">
      ${navLink('dashboard', 'fas fa-chart-pie', '概览')}
      ${navLink('accounts', 'fas fa-layer-group', '账号管理')}
      ${navLink('records', 'fas fa-receipt', '推送记录')}
      ${navLink('drafts', 'fas fa-inbox', '草稿箱')}
      ${navLink('tokens', 'fas fa-key', '令牌管理')}
      ${navLink('docs', 'fas fa-book', '接口文档')}
      ${isAdmin ? navLink('audit', 'fas fa-clipboard-list', '操作日志') : ''}
      ${isAdmin ? navLink('users', 'fas fa-users-gear', '用户管理') : ''}
      ${isAdmin ? navLink('settings', 'fas fa-gear', '设置') : ''}
    </nav>
    <div class="admin-rail__foot">
      <button class="admin-nav__link rail-toggle" type="button" id="rail-toggle">
        <i class="fas fa-angles-left" aria-hidden="true"></i><span>收缩侧边栏</span>
      </button>
      <a class="admin-nav__link" href="/"><i class="fas fa-arrow-left" aria-hidden="true"></i><span>返回首页</span></a>
      <a class="admin-nav__link" href="/admin/logout"><i class="fas fa-right-from-bracket" aria-hidden="true"></i><span>退出登录</span></a>
    </div>
  </aside>
  <div class="admin-main">
    <header class="admin-topbar">
      <a class="brand" href="/" aria-label="草稿推送网关首页">
        <span class="brand__mark" aria-hidden="true"><i class="fas fa-paper-plane"></i></span>
        <span class="brand__name">草稿推送网关</span>
      </a>
      <nav aria-label="移动端功能导航">
        ${mobileNav('dashboard', '概览')}
        ${mobileNav('accounts', '账号')}
        ${mobileNav('records', '记录')}
        ${mobileNav('drafts', '草稿')}
        ${mobileNav('tokens', '令牌')}
        ${mobileNav('docs', '文档')}
        ${isAdmin ? mobileNav('audit', '日志') : ''}
        ${isAdmin ? mobileNav('users', '用户') : ''}
        ${isAdmin ? mobileNav('settings', '设置') : ''}
      </nav>
      <a class="icon-btn" href="/admin/logout" aria-label="退出登录">
        <i class="fas fa-right-from-bracket" aria-hidden="true"></i>
      </a>
    </header>
    <main class="admin-content">
      <div id="view"><div class="empty-state">加载中…</div></div>
    </main>
    ${FOOTER}
  </div>
</div>
<div class="toasts" id="toasts"></div>
<script>window.__BASE__ = ${JSON.stringify(opts.baseUrl)};</script>
<script>window.__ME__ = ${JSON.stringify({ username, role })};</script>
<script src="/admin/app.js"></script>
<script>
(function () {
  var btn = document.getElementById('rail-toggle');
  var shellEl = document.querySelector('.admin-shell');
  if (!btn || !shellEl) return;
  btn.addEventListener('click', function () { shellEl.classList.toggle('is-collapsed'); });
})();
</script>`,
    'site-page admin-page',
  )
}
