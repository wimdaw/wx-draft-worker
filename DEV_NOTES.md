# 开发与验证记录（DEV NOTES）

> 本项目：`wx-draft-worker` —— 基于 Cloudflare Workers + Hono 的微信公众号草稿推送网关。
> 本文记录**实现方式、验证结论、踩坑经验**，供后续维护/接手参考。

---

## 1. 双版本设计

项目刻意提供两份等价实现，面向不同使用场景：

| 版本 | 路径 | 特点 | 适用 |
|---|---|---|---|
| TypeScript 模块版 | `src/*.ts` | 分模块（index/utils/auth/wechat/images/markd
...[Truncated]...
件版。

### ✅ 验证结果（全部通过）

| 检查项 | 命令 | 结果 |
|---|---|---|
| 单文件版语法 | `node --check dist/worker.js` | ✅ 通过 |
| TS 类型检查 | `npx tsc --noEmit` | ✅ 0 错误 |
| 官方打包 | `npx wrangler deploy --dry-run --outdir .dry-run` | ✅ Total Upload 103.88 KiB / gzip 26
...[Truncated]...
同**，安全。

### 本地一键自测

```bash
npm install
npx tsc --noEmit                                  # 类型检查
node scripts/smoke.mjs                            # 冒烟：单文件版
npx esbuild src/index.ts --bundle --format=esm --platform=neutral \
  --outfile=.node-test/index.mjs                  # 纯净打包 TS 源码
node scripts/smoke.mjs ../.node-test/index.mjs    # 冒烟：TS 版
```

---

## 4. 踩坑记录（重要，勿重蹈）

1. **wrangler 4.130 要求 Node ≥ 22**。Node 20 会直接报错退出；CI 里 `node-version` 必须是 22。
2. **`@cloudflare/workers-types` 必须用 v5**（`5.2026xxxx.x`）。配 v4 + wrangler@4 会触发 npm `ERESOLVE` 安装失败。
3. **不要用裸 Node 加载 `wrangler` 的打包产物做测试**：wrangler 会注入 `unenv` 的 `node:stream`/`node:events` polyfill，
   它在 Node 下会接管 `process.stdout`，导致 **脚本 rc=0 但完全没有输出**（输出的黑洞，极易误判为代码 hang）。
   ✅ 正确做法：用 `esbuild --platform=neutral --format=esm` 纯净打包 `src/index.ts` 后再测。
4. **两份实现的响应契约必须锁定为唯一基准**：`dist/worker.js` + `API.md` 是基准，`src/` 必须与其逐字段一致。
   本项目曾出现 `{code:0}` vs `{ok:true,data}` 的分叉，已统一为后者。
5. 冒烟测试中涉及**微信配置**的用例要带上假密钥（`WECHAT_APPID/WECHAT_APPSECRET`），
   否则请求会先被「服务端未配置」拦截，测不到后面的参数校验分支。

---

## 5. 线上部署记录（✅ 已完成）

- 部署命令：`npx wrangler deploy`（需 Node ≥ 22）
- Worker 名称：`wx-draft-worker`，账户：`00c5e26f...`（xwse）
- **线上地址：https://wx-draft-worker.xwse.workers.dev**
- Version ID：`2a1e9de5-11df-4c21-a4f2-1dd963903b83`（Startup 11 ms；上传 103.88 KiB / gzip 26.69 KiB）

### 线上实测结果（全部符合预期）

| 请求 | 实测结果 |
|---|---|
| `GET /`、`GET /api/health` | 200 `{"ok":true,"data":{...,"appid_configured":false,...}}` |
| `GET /nope` | 404 `{"ok":false,"error":"接口不存在"}` |
| `POST /api/draft`（浏览器 UA） | 500 `服务端未配置 WECHAT_APPID / WECHAT_APPSECRET` |
| `GET /api/drafts`、`DELETE /api/drafts/:id` | 500（同上，未配凭据） |
| `OPTIONS /api/draft` | 204 + `Access-Control-Allow-Origin: *` |

### ⚠️ 线上踩坑：Cloudflare 1010（重要）

`*.workers.dev` 共享域**默认开启 Bot 检测且无法关闭**。UA 为非浏览器标识时，请求在到达 Worker 前即被拦：

```
403 error code: 1010
```

对照实验（同一 POST，仅 UA 不同）：`Python-urllib/3.11` → **403/1010**；`curl/8.7.1` → 放行；浏览器 UA → 放行。

✅ 解决：客户端带**浏览器 UA**。`scripts/draft_push.py` 已内置默认浏览器 UA 并可 `--ua` 覆盖，且识别 1010 给出中文提示。

## 6. 端到端联调进展（2026-09-11）

已用**真实微信凭据**完成到微信 API 的链路验证：

| 环节 | 结果 |
|---|---|
| 凭据写入 CF 加密变量（`secret_text`，经 CF API，未落盘） | ✅ `WECHAT_APPID`、`WECHAT_APPSECRET` |
| `GET /api/health` | ✅ `appid_configured: true, secret_configured: true` |
| `POST /api/draft`（正文无图、未传 cover） | ✅ 500 `无法生成封面：请传入 cover，或在正文中至少包含一张图片`（业务校验正确） |
| `POST /api/draft`（真实封面图 + 内嵌 data URI 图） | ⚠️ 首次 `40164 invalid ip ...` → 加入白名单后 **✅ HTTP 200** |

### ✅ 最终结果：草稿真实创建成功（2026-09-11）

```
[+] HTTP 200
[+] 草稿已创建, media_id = JYYmKckE1u7_3GykmLNiJFXyWPJriKORMOFT4r5zXbctF0HSKi4QzZML-rTwyQGT
```

并已通过 `GET /api/drafts` 在草稿箱列表中**交叉核实**到该草稿（标题「端到端推送测试 · wx-draft-worker」，作者 Su）。
→ **整条链路已完全打通：Worker → 微信 access_token → 图片转存到微信域名 → 封面转永久素材 → 草稿箱。**

**结论**：Worker 全链路（读凭据 → 调微信 `access_token` → 错误码映射为中文提示）**均正常**。

## 7. 尚未完成 / 下一步

- [x] ~~加入 Cloudflare IP 白名单~~（**已完成**，白名单生效后推送立即成功）
- [x] ~~配置 `DRAFT_API_KEY` 开启鉴权~~（**已完成**：无 key → 401，带 key → 200）
- [x] ~~清理测试草稿~~（**已完成**，`DELETE /api/drafts/:mediaId` 返回 200，用户原创草稿未受影响）
- [x] ~~推送 GitHub~~（**已完成** → https://github.com/wimdaw/wx-draft-worker ，19/20 文件）

### ⚠️ 唯一遗留项：CI 工作流文件未上传

`.github/workflows/deploy.yml` 推送失败（HTTP 404）—— 你的 GitHub token 缺少 **`workflow`** scope，
GitHub 会对此类路径直接返回 404。该文件仅用于「push 到 main 自动部署」（可选功能），**不影响任何实际运行**。

补齐方式（任选其一）：
1. 在 GitHub 网页上手动新建该文件（内容见本地项目 `.github/workflows/deploy.yml`）；
2. 给 token 加上 `workflow` scope 后让我重推；
3. 不用也没关系——日常改动用 `wrangler deploy` 手动部署即可。

## 8. 交付状态总览（2026-09-11 全部完成）

| 项目 | 状态 |
|---|---|
| 代码（TS + Hono，CF Workers） | ✅ 单文件 `dist/worker.js`，已部署 |
| 线上地址 | ✅ https://wx-draft-worker.xwse.workers.dev |
| 微信凭据（加密变量） | ✅ `WECHAT_APPID` / `WECHAT_APPSECRET` |
| IP 白名单 | ✅ 已加 CF 段 |
| **端到端真实推送** | ✅ **成功**（media_id `JYYmKckE…wyQGT`，已交叉核实，测试草稿已删） |
| 接口鉴权 | ✅ `DRAFT_API_KEY` 已启用（`auth_enabled: true`） |
| GitHub 仓库 | ✅ https://github.com/wimdaw/wx-draft-worker （19/20 文件；缺 CI 工作流文件） |
- [ ] 可选：配置 `DRAFT_API_KEY` 开启调用鉴权
- [ ] 可选：绑定自定义域名（可关闭 Bot 检测，不依赖 UA 规避）
- [ ] 可选：CI 自动跑冒烟测试（`.github/workflows/deploy.yml` 已含 typecheck）

---

# v2.0.0 改造记录 —— 对齐 ai-gateway：产品首页 + 管理后台 + 令牌体系

**日期**：2026-09-11 ｜ **线上**：https://wx-draft-worker.xwse.workers.dev ｜ D1：`wx-draft-db` (16d52b86-df4a-4f7d-81c0-7f6d54dfb204)

## 1. 改造内容

| 维度 | v1.0.0 | v2.0.0 |
|------|--------|--------|
| 首页 | 一段 JSON 健康检查 | **产品首页**（Hero / 特性 / 快速开始 / 接口文档，SSR） |
| 后台 | 无 | **管理后台 SPA**（概览 / 令牌 / 记录 / 草稿箱 / 试用 / 文档 / 设置） |
| 鉴权 | 单一 `DRAFT_API_KEY` | **多令牌**（`wxk_*`，可启停/统计）+ 旧密钥自动迁移 |
| 数据 | 无状态 | **D1**：tokens / drafts(记录) / settings / sessions，首次访问自动建表 |
| 可观测 | 无 | 统计看板 + 每次推送落库（状态/耗时/图片数/失败原因/token 归属） |

**新增文件**：`src/admin.ts`（后台 API 子应用，挂载 `/admin/api`）、`src/admin_app.ts`（后台前端 JS，单文件 SPA，由 `/admin/app.js` 输出）、`src/pages.ts`（SSR 首页/登录页/后台骨架）、`src/pages.css.ts`（深色设计系统）、`src/storage.ts`（D1 存储层）。

## 2. 线上验证清单（全部实测通过）

1. 公开路由：`GET /` 200、`/admin/login` 200、`/admin/app.js` 200、`/api/health` 200（`db_connected: true`）
2. 会话鉴权：未登录访问 `/admin` → 302 到登录页；`/admin/api/*` → 401 JSON
3. 登录：JSON 与表单两种方式均返回 302/`{redirect:"/admin"}`，Cookie `wxd_session`（HttpOnly ✓）
4. 带会话访问 `/admin` 200，页面骨架完整（`</html>` 正常闭合）
5. 后台 API：`stats` / `tokens`(GET+POST) / `records` / `settings` / `wx-drafts` 全 200
6. 业务鉴权：无令牌 401、错误令牌 401、缺 `content` 400
7. **真实推送**：`POST /api/draft` → 200 `media_id`，微信草稿箱可见（`/admin/api/wx-drafts` 交叉验证）
8. **正文图本地化**：Markdown 正文中的外链图被转存微信域名（`images: 1`）
9. **封面自动回退**：未传 `cover` 时自动取正文首图并上传成功
10. **失败也落库**：图片下载失败的请求被记录（状态/原因/耗时），统计随之变化
11. **DELETE 草稿**：`DELETE /api/drafts/:mediaId` 200，草稿箱数量减少
12. **后台前端无白屏**：`/admin/app.js` 经 `node --check` 语法校验（exit 0），7 个视图函数与绑定函数齐全
13. **后台渲染**：用 mock fetch 数据 + headless Edge `--dump-dom` 验证 —— 侧栏 7 项、真实令牌名、记录标题、统计卡片均渲染成功

## 3. 本次踩坑（重要）

1. **`contentType` 语义**：`images: 0` 一度被误判为「图片本地化失效」，真实原因是我测试请求**漏传 `contentType: "markdown"`**，正文按 HTML 原样提交，自然没有 `<img>` 可转存。
   → 顺手加了**自动识别**：未指定 `contentType` 时，正文不含 HTML 标签即按 Markdown 渲染（`src/draft.ts` 的 `renderIfNeeded`）。文档里务必写清「`images` = 被转存到微信域名的正文图数量」。
2. **Cloudflare 会拦掉无 UA 的请求**：`*.workers.dev` 共享域对 `Python-urllib/3.11` 这类 UA 直接返回 **403 error 1010**（请求根本到不了 Worker）。所有脚本/文档示例都必须带浏览器 UA 或 `curl` 的默认 UA。
3. **外部图源可能拒绝 Cloudflare 出口**：`upload.wikimedia.org` 对 CF 出口返回 **HTTP 400**（下载图片失败: … HTTP 400）。测试图片请用 `picsum.photos` 等友好图源。
4. **`http.cookiejar` 的 `Cookie` 对象没有 `httpOnly` 属性**：判断 HttpOnly 要用 `c.has_nonstandard_attr('HttpOnly')`（wrangler 侧看 Set-Cookie 亦可）。
5. **部署耗时超 600s 工具上限**：`wrangler deploy` 需以子进程后台启动 + 轮询日志（Proxy 警告是正常的，最终 `Deployed … Current Version ID` 才算成功）。
6. **写文档必须对着源码核对字段名**：本次文档初稿出现 3 处臆造（称会话为 HMAC 签名、`stats.trend`、`settings.auth_enabled`），实际分别为「D1 随机会话 ID」、「`daily`」、「无该字段」。**凡文档提到的字段/机制，一律回源码确认。**

## 4. 关键实现要点（便于后续维护）

- **会话**：`createSession` 生成随机 ID 存 D1 `sessions` 表，Cookie 只放 ID；`purgeExpiredSessions` 每次登录时清理过期记录，有效期 7 天。
- **密码校验**：`safeEqual` 先对两侧做 SHA-256 摘要再逐字符异或累加比较，长度恒定，规避时序攻击。
- **密码优先级**：D1 `settings.admin_password` > `env.ADMIN_PASSWORD` > 默认 `admin`（后台「设置」页可改密码）。
- **令牌**：业务侧优先匹配 D1 `tokens`（可启停），未命中再比对 `env.DRAFT_API_KEY`；命中后 `touchToken` 累加调用次数，并在推送记录里留下 token 名称。
- **打包**：`dist/worker.js` 为 esbuild 打包的单文件版（v2 需在控制台自行绑定变量名为 `DB` 的 D1）。

---

## 5. 视觉风格：与 AI Gateway 统一（v2.1.0）

本次把整站样式切换为与姊妹项目 **AI Gateway**（`wimdaw/ai-gateway`）完全一致的设计系统。

### 做法（三段式）

| 层 | 文件 | 说明 |
|---|---|---|
| 设计令牌 + 组件库 | `src/pages.css.ts` 上半部分 | 原样取自 AI Gateway 的 `src/pages.css.ts` 中 `CSS_CONTENT`（oklch 令牌、`--color-paper/ink/accent…`、topbar / home-hero / endpoint-box / request-panel / metrics-strip / directory / auth-shell / admin-shell / panel / badge / btn 等） |
| 本项目业务适配层 | `src/pages.css.ts` 末尾 | 只用同一套令牌补本项目特有组件：`.tb` 数据表格、`.method` 请求方法徽标、`.notice/.notice.info/.notice.warn` 提示块、`.panel/.panel-head/panel-flush/panel-body`、`.stat-grid/.stat`、`.bars/.bar-col/.bar-track/.bar-fill`、`.mono-out`、`.copy-key/.mask-key`、`.field/.row/.toasts/.toast`、`.sp` 等；另有少量**旧类名别名**（`.card/.btn-sm/.btn-primary/.input/.grid-*`）保证后台视图不破相 |
| 页面骨架 | `src/pages.ts` / `src/admin_app.ts` | 类名与 AI Gateway 同名（`topbar`、`brand`、`home-hero`、`shell`、`auth-shell`、`admin-shell`、`admin-rail`、`admin-nav__link`、`admin-main`、`admin-content`、`panel`…） |

### 外部资源

- 字体：Google Fonts `Inter`（正文）、`Space Grotesk`（标题，`h1/h2/h3`）、`JetBrains Mono`（代码）
- 图标：Font Awesome 6.7.2（`cdnjs`，与 AI Gateway 相同 CDN），页面用 `<i class="fas fa-…">`
- 以上均与原项目一致；断网时页面仍可正常阅读（字体/图标降级）

### 验证方式（可复用）

无图形界面时用 **CDP 直连 headless Edge** 取「计算样式」做硬校验，比截图/肉眼更可靠：

```bash
# 1) 起无头浏览器（必须加 --remote-allow-origins，否则 CDP WebSocket 握手 403）
msedge.exe --headless=new --remote-debugging-port=9335 --remote-allow-origins=* \
  --user-data-dir=<临时目录> --window-size=1440,1200 about:blank
# 2) http://127.0.0.1:9335/json/list 取 webSocketDebuggerUrl
#    Network.setCookie 注入 wxd_session 后 Page.navigate('/admin')，可校验登录后才能看到的后台
# 3) Runtime.evaluate 读 getComputedStyle(...)：确认 body 背景为 oklch、h1 为 Space Grotesk、
#    .admin-rail 宽 240px、.stat-grid 为 grid 等——即样式真的生效，而非只有 class 名对
```

实测结论（线上 `https://wx-draft-worker.xwse.workers.dev`）：

- 首页：`body` 背景 `oklch(0.985 0.004 250)`、`h1` 字体 `Space Grotesk 72px`、`.shell` 宽 1184px、`.request-panel` 深色底 `oklch(0.22 0.016 260)`、`.notice.warn` 暖黄底，字体加载 `document.fonts.check('16px Inter') === true`
- 后台（带会话）：`.admin-rail` 240px、`.admin-nav__link` 高 44px 且当前项 `is-active` 有底色、`.stat-grid` 网格、`.bars` 柱图渲染，概览数据正常输出
- 静态兜底：线上 HTML 中出现的 class 与 `pages.css.ts` 中定义的 257 个类名做差集，仅剩 Font Awesome 的 `fa-*`（由 CDN 提供）与 1 个纯勾子类

### 单文件版同步

`dist/worker.js` 由 src 重新打包（模板字符串的样式随之一并更新）：

```bash
node node_modules/esbuild/bin/esbuild src/index.ts --bundle --format=esm --target=es2022 \
  --minify --outfile=dist/_worker.tmp.js
# 手工补回文件头注释后写入 dist/worker.js，再 node --check 校验
```


## 6. 令牌脱敏展示（v2.2.0，2026-09-11）

需求：令牌管理列表不再展示完整令牌，中间用星号代替；「复制」按钮仍复制**完整**令牌。

实现（服务端脱敏 + 按需取全值，参考 ai-gateway 的 maskedKeys 思路并补齐"复制完整"）：

- `GET /admin/api/tokens` 只返回掩码：`maskToken()` 保留前 8 后 4，中间 8 个 `*`（如 `wxk_3068********31f6`）
- 新增 `GET /admin/api/tokens/:id/key`：按 id 返回完整密钥，专供前端「显示/隐藏」与「复制」按需调用（未登录 401 / 不存在 404）
- 列表单元格：`<code class="mask-key" data-act="reveal" data-id data-mask data-vis>`，点击切换显示完整值 / 收起为掩码
- 复制按钮：`data-act="copy-key" data-id`，先取全值再写剪贴板；`copy()` 增加 `execCommand('copy')` 兜底（剪贴板 API 不可用或非安全上下文时仍能复制）
- 样式：`.mask-key` 等宽字体 + 虚线下划线 + hover 变色，提示可点击

线上实测（无头 Edge + CDP）：

- 列表初始为掩码：`wxk_3068********31f6`、`wxw_f268********709d`
- 点击掩码 → 显示完整 36 位；再点击 → 恢复掩码（`data-vis` 0/1 与 `.show` 类同步）
- 点击「复制」（测试中 hook 剪贴板强制失败以触发兜底路径）→ **捕获到的复制内容与 `/tokens/:id/key` 返回值逐字一致**（两枚令牌均通过），toast 显示"已复制到剪贴板"
- 边界：未登录访问新接口 401、不存在的 id 404

版本：`618ebba0-058c-45bf-adbf-f71403dc2d37`

## 7. 多公众号管理（v2.3.0，2026-09-11）

需求：① 后台「在线试用」改为「公众号管理」（可增删改 AppID / AppSecret）；② 草稿箱按公众号分类；③ 后台登录页增加「账号」字段。

### 数据层（storage.ts）

- 新表 `accounts(id, name, appid, appsecret, enabled, is_default, created_at)`，由 `ensureSchema` 自建（D1 老库无需手工 SQL）
- 迁移兼容：`drafts` 表新增 `account_id` / `account_name` 列（ALTER TABLE 自动补列）
- 种子迁移：accounts 为空且存在 `WECHAT_APPID / WECHAT_APPSECRET` 时，自动写入一条「默认公众号」——老部署升级后无感
- CRUD：`listAccounts / getAccountById / createAccount / updateAccount / deleteAccount / setDefaultAccount / resolveAccount`
- 关键保护：**删除默认账号时自动把创建时间最早的一条补为默认**；表为空时新建的第一个账号自动成为默认；同一 AppID 不允许重复添加（409）

### 推送链路

- `resolveAccount(env, id)`：显式 id > 默认账号 > 回落环境变量凭据（兼容旧部署）
- `pushDraft(env, body, tokenName, accountId)`：请求体可带 `accountId` 指定目标公众号，未带则用默认账号
- ⚠️ 顺手修掉一个隐藏缺陷：`wechat.ts` 的 access_token 缓存由「全局单例」改为「按 appid 分别缓存」，否则多公众号并发推送会互相顶掉 token

### 后台 API（admin.ts）

- `GET /admin/api/accounts`、`POST /admin/api/accounts`（入库前真实调微信 `getToken` + 读草稿列表校验，回显「AppID 无效 / IP 白名单」等可读原因）
- `PUT /admin/api/accounts/:id`、`DELETE /admin/api/accounts/:id`、`POST /admin/api/accounts/:id/test`（真实连通性测试）
- `POST /admin/api/accounts/:id/default`
- `GET /admin/api/wx-drafts?account_id=`（按账号取草稿）、`DELETE /admin/api/wx-drafts/:mediaId?account_id=`

### 登录

- `handleLogin` 支持 JSON 与表单的 `username`（默认 `admin`，可由 `ADMIN_USER` 或后台设置覆盖）；**只传密码仍可登录**（兼容旧客户端）
- 登录页新增「管理员账号」输入框（默认填 `admin`、autofocus），错误文案改为「账号或密码不正确」

### 前端（admin_app.ts / pages.ts）

- 导航「在线试用」→「公众号管理」（视图 key `accounts`）；旧链接 `#try` / `#tryit` 自动重定向到 `#accounts`
- 公众号管理视图：列表（AppSecret 掩码展示）+ 添加/编辑表单 + 测试连通 / 设为默认 / 删除
- 草稿箱视图：并发拉取每个账号的草稿并分区展示（分区标题含账号名与「默认」标记）
- 概览「快速入口」与推送记录空态文案同步更新

### 线上验证（Worker 版本 `12fb7e96-5838-4659-b936-9014fc573392`）

- 接口：登录（账号+密码 200 / 错误账号 401 / 仅密码兼容 200）、账号列表、真实凭据 `test`（草稿 2 篇）、按账号取草稿（2 篇）、不存在账号 404、假凭据新增 400（回显微信 `40013 invalid appid`）、重复 AppID 409
- **默认转交**：D1 插入临时账号 → 设为默认 → 删除 → 默认自动回到原账号（实测通过，最终状态与初始一致）
- 前端（无头 Edge + CDP，真实登录态）：`#accounts` 渲染出「公众号管理」标题 / 导航高亮 / 表单 / 账号表格（掩码 `54e9****dad9`），无 JS 报错；`go('try')` 落到 `#accounts`；草稿箱渲染出「默认公众号」分区（2 行）；登录页账号框存在、默认值 `admin`、autofocus 生效
- `node --check` 校验线上 app.js 通过；`tsc --noEmit` 通过
- 备注：D1 表结构变更由 `ensureSchema` 在首次请求时自动完成，本次部署后首次访问即已完成迁移

---

# v2.4.0 改造记录 —— 支持 Cloudflare Pages 部署 + 鉴权漏洞修复（2026-09-11）

## 1. 新增：Cloudflare Pages 部署形态

同一份 Hono 应用，除了跑在 Workers，也可以跑在 Cloudflare Pages（高级模式）。

- 入口约定：Pages 在站点根目录寻找 `_worker.js`，由它接管全部请求；本项目 `src/index.ts` 的
  `export default app`（Hono 应用）天然兼容——Pages 从 `fetch` 属性调用，绑定以 `env` 传入。
- 构建：`scripts/build.mjs`（`npm run build`）一次产出两个文件

  ```bash
  npm run build
  #  dist/worker.js         → Workers（wrangler deploy / Dashboard 粘贴）
  #  dist/pages/_worker.js  → Pages（构建输出目录设为 dist/pages）
  ```

- 部署与绑定：

  ```bash
  npx wrangler pages deploy dist/pages --project-name=wx-draft-worker
  ```

  Pages 项目里需在 Settings → Functions 添加 **D1 绑定**（变量名 `DB` → `wx-draft-db`），
  并在 Variables and Secrets 补上与 Worker 相同的变量（`WECHAT_APPSECRET` / `ADMIN_PASSWORD` 等）。
  ⚠️ **绑定是部署级配置，改完必须重新部署一次才生效**（实测首次部署未带 D1 时 `/api/health` 返回 `db_connected:false`，
  用 `PATCH /accounts/{acct}/pages/projects/{name}` 的 `deployment_configs.production.d1_databases` 配好后重新部署即恢复）。

- 实测结果（Pages 站点 `https://wx-draft-worker.pages.dev`）：
  首页 / `/admin/login` / `/api/health` 均 200，`db_connected:true`；后台令牌、草稿分类、业务 API 全部可用。

- ⚠️ 小坑：`wrangler pages deploy` 会提示 `wrangler.toml` 缺少 `pages_build_output_dir` 并忽略该配置——
  这是预期行为（`wrangler.toml` 是给 Workers 用的），不影响部署；D1/变量请在 Pages 项目设置里配。

## 2. 修复：开放模式下的匿名调用漏洞（真问题）

`apiTokenAuth` 的「开放模式」判定原先只看 `env.DRAFT_API_KEY`：

```ts
if (!provided) {
  if (expected) return fail(..., 401)   // ❌ expected 为空就直接放行
  return next()
}
```

于是**没设 `DRAFT_API_KEY`、但已在后台创建过业务令牌**的部署（典型就是 Pages：没有 env 变量），
匿名请求可以绕过鉴权直接调 `/api/draft`（实测 Pages 站无 key 时返回的是 500 业务错误，而不是 401）。

修复：无 key 时，只要「env 里有密钥」**或**「D1 里存在启用中的令牌」就必须鉴权：

```ts
if (!provided) {
  if (expected || (await hasEnabledToken(c.env))) {
    return fail('未授权：请在请求头携带 X-API-Key，或使用 ?key= 查询参数', 401)
  }
  return next()
}
```

`hasEnabledToken` 用最小查询 `SELECT COUNT(*) AS n FROM tokens WHERE enabled = 1`，
并在异常时 `console.error` 后按未配置处理（D1 未绑定也不至于把纯静态部署锁死）。

修复后线上实测（Worker 与 Pages 两个站点）：

| 请求 | 结果 |
|------|------|
| 无 key `POST /api/draft` | **401**（修复前 Worker→401 靠 env，Pages→500 漏洞） |
| `?key=<后台令牌>` | 通过鉴权，进入业务校验（400 缺 content，符合预期） |
| `?key=wrong` | 401 |
| `GET /api/health` | 200（公开端点不受影响） |

## 3. 冒烟测试扩容（20 项，两入口全绿）

`scripts/smoke.mjs` 新增 6 条鉴权边界断言，并用 mock D1（按 SQL 与绑定参数返回）覆盖：

```bash
node scripts/build.mjs
node scripts/smoke.mjs ../dist/worker.js
node scripts/smoke.mjs ../dist/pages/_worker.js
# 结果: 20 通过 / 0 失败（两个入口都是）
```

> 踩坑：mock 的 `first()` 若不校验 `bind()` 传入的参数，`?key=wrong` 也会被放行，
> 导致用例假失败（实测踩到，用例期望 401 却拿到 400）。

## 4. CI：新增 Pages 工作流

`.github/workflows/pages.yml`：push 到 `main`（且改动 `src/**`、构建脚本、`package.json`、本工作流）时，
`npm run build` → `wrangler pages deploy dist/pages --project-name=wx-draft-worker --branch=main`，
复用既有的 `CF_API_TOKEN` / `CF_ACCOUNT_ID` 仓库 Secret（与 `deploy.yml` 相同）。

---

## 5. v2.5.0：公众号名称自动识别 + 表单样式修复

**需求**：公众号管理里只填 AppID / AppSecret 就应自动识别出公众号名字（不必再手填备注名）；「设为默认公众号」的复选框被撑得过大。

**实现**
- `src/wechat.ts` 新增 `getAccountNickName()`：`GET /cgi-bin/account/getaccountbasicinfo?access_token=…` → 取 `nick_name`。
  ⚠️ 该接口对未认证 / 无权限的号会返回 `48001` 之类错误，因此实现为**失败返回 `null` 而不抛异常**，以免把「凭据有效但读不到昵称」误判成校验失败。
- `src/admin.ts`：`probeAccount()` 返回 `{ draftTotal, nickName }`（原来是裸的草稿数）；
  `POST /accounts`、`PUT /accounts/:id` 的命名优先级 = **用户填写 > 微信昵称 > `公众号 <appid 后 6 位>`**；
  `POST /accounts/:id/test` 除探测连通外还会把读到的新昵称**回写数据库**（老数据里的「公众号 1」点一次「测试连通」即自动纠正）。
- `src/admin_app.ts`：表单改为 AppID + AppSecret 并排、名称降级为「名称（可选）」并注明「留空则自动读取公众号昵称」；
  列表框表头改「公众号名称」；提示文案同步；复选框套用新的 `.check-inline`。
- `src/pages.css.ts`：**根因修复**——全局规则
  `input, textarea, select { width: 100%; height: var(--control-h); border: … }`
  会把 `type=checkbox` 的复选框也撑成整行大方框。新增：
  ```css
  input[type='checkbox'], input[type='radio'] {
    width: 1rem; height: 1rem; min-height: 0; padding: 0; border: 0; border-radius: 0; background: none;
  }
  .check-inline { display: inline-flex; align-items: center; gap: var(--space-3xs); min-height: var(--control-h); }
  ```

**验证（均为实测，非推断）**
- `tsc --noEmit` rc=0；冒烟 `20 通过 / 0 失败` × 两个入口（`dist/worker.js`、`dist/pages/_worker.js`）。
- 线上真机：登录后台 → `POST /admin/api/accounts/<id>/test` → `{"account":"百晓文苑","nickname":"百晓文苑","draft_total":2,…}`，随后列表接口的 `name` 已从「默认公众号」变为「百晓文苑」→ 证明**自动识别与回写都真的生效**。
- 样式硬验证（CDP 直连 headless Edge，带登录 Cookie 打开 `#accounts` 视图读 `getComputedStyle`）：
  `#acc-default` → `16×16px / min-height:0px / border-width:0px`，`.check-inline` → `display:flex; align-items:center`，
  表头 `["公众号名称","AppID","AppSecret","状态","添加时间","操作"]`，输入框 `acc-appid / acc-secret / acc-name(留空则自动读取公众号昵称)`。

**踩坑**
- `scripts/smoke.mjs` 的 D1 mock 对 `FROM tokens` 返回 `{ total, enabled }`，而实现用的是 `SELECT COUNT(*) AS n …` 取 `row.n`
  → 判定「无令牌」进入开放模式，用例假失败（期望 401 得到 400）。**mock 必须与实现的字段名严格一致**；已补 `n: 1`。
- 修改文案时注意：`admin_app.ts` 里的 HTML 是**逐行字符串拼接**，`old_content` 不能凭印象补引号（首次 patch 因多加一个 `'` 而失败）。
- 线上 Worker 必须用**浏览器 UA** 访问（`*.workers.dev` 的 1010 Bot 检测无法关闭），脚本请求务必带 Chrome UA。
