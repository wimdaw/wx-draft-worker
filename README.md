# wx-draft-worker

基于 **Cloudflare Workers + Hono + D1** 的**微信公众号草稿推送网关 + 可视化管理后台** —— 免服务器、免备案、长期有效。

把一篇文章（标题 + 正文 + 封面）POST 给它，它会自动：

1. 获取微信 `access_token`（带缓存，避免触发频率限制）
2. 把正文里的**外链图 / base64 图**转存到微信域名（否则草稿里图片不显示）
3. 上传**封面**为永久素材，拿到 `thumb_media_id`
4. 调用草稿箱接口**新建草稿**，返回 `media_id`

> 本项目沿用 [ai-gateway](https://github.com/wimdaw/ai-gateway) 的技术栈与工程规范：
> TypeScript + Hono + Cloudflare Workers，并在 **v2.0.0** 起对齐其「产品首页 + 管理后台 + API 令牌」的完整形态。

| 线上地址 | https://wx-draft-worker.xwse.workers.dev |
|---|---|
| 产品首页 | `GET /` |
| 管理后台 | `GET /admin`（登录页 `/admin/login`） |

---

## 功能特性

### 推送能力
- **一条 API 建草稿** —— `POST /api/draft`，字段与云托管版/Flask 版完全一致
- **图片自动转存** —— 正文外链图、data URI 图自动上传到微信域名
- **封面智能回退** —— 未传 `cover` 时自动取正文第一张图作为封面
- **内容格式自动识别** —— `contentType` 可省略：含 HTML 标签原样使用，否则按 Markdown 渲染
- **配套接口** —— 草稿列表 `GET /api/drafts`、删除草稿 `DELETE /api/drafts/:mediaId`
- **错误可读** —— 微信 `errcode` 映射为中文提示（如 40164 → IP 不在白名单）

### 管理后台（v2.0.0 新增，ai-gateway 同款）
- **产品首页** —— Hero、特性介绍、快速开始、接口文档，可对外展示
- **密码登录** —— 会话 ID 存于 D1（随机生成，7 天过期自动清理），Cookie 为 HttpOnly / SameSite=Lax / HTTPS 时 Secure；密码比较先做 SHA-256 摘要再定长比较，防时序攻击
- **概览看板** —— 累计推送 / 成功 / 失败 / 成功率 / 今日推送 / 平均耗时 / 令牌数 + 近 7 天趋势
- **令牌管理** —— 创建 / 启停 / 删除 API 令牌，支持备注与调用次数统计
- **推送记录** —— 每次推送的状态、耗时、图片数、内容长度、token 归属、失败原因，可清空
- **微信草稿箱** —— 直接读取公众号草稿箱并支持删除
- **在线试用** —— 在后台直接填标题/正文/封面发起真实推送，即时看结果
- **设置** —— 公众号 AppID 脱敏展示、鉴权开关、后台改密码

### 令牌体系（ai-gateway 同款）
- 业务接口用 **`X-API-Key: wxk_xxx`** 鉴权（兼容旧 `?key=` 与旧 `DRAFT_API_KEY`）
- 旧密钥会在首次访问时**自动迁移**为一个可用令牌，无需改调用方
- 令牌可随时在后台禁用，禁用后立即失效

---

## 目录结构

```
wx-draft-worker/
├── src/
│   ├── index.ts      # Hono 应用与路由挂载
│   ├── types.ts      # 类型定义（Env / 请求体 / 微信响应）
│   ├── wechat.ts     # 微信 API 客户端（token/素材/草稿）
│   ├── auth.ts       # 后台会话登录 + API 令牌鉴权中间件
│   ├── draft.ts      # 推送核心流程（渲染 → 图片本地化 → 封面 → 建草稿 → 落库）
│   ├── storage.ts    # D1 存储层（令牌/记录/设置/统计，首次访问自动建表）
│   ├── admin.ts      # 后台 API（Hono 子应用，挂载于 /admin/api）
│   ├── admin_app.ts  # 后台前端 JS（单文件 SPA，由 /admin/app.js 输出）
│   ├── pages.ts      # 服务端渲染页面（首页 / 登录页 / 后台骨架）
│   ├── pages.css.ts  # 设计系统 CSS（深色主题）
│   ├── images.ts     # 图片处理（data URI / URL → Blob）
│   ├── markdown.ts   # 极简 Markdown → 微信内联样式 HTML
│   └── utils.ts      # 响应封装、微信错误码映射
├── dist/
│   ├── worker.js         # ⭐ 单文件版（零依赖，可直接粘贴到 CF 控制台编辑器）
│   └── pages/_worker.js  # ⭐ Pages 版（Cloudflare Pages 高级模式入口）
├── scripts/
│   ├── build.mjs         # 构建：一次产出上面两个产物（npm run build）
│   ├── build-pages.mjs   # 只构建 Pages 产物（npm run build:pages）
│   ├── draft_push.py     # 本地推送脚本（可直接对接本 Worker）
│   └── smoke.mjs         # 冒烟测试（本地执行 Worker 逻辑，无需账号/网络）
├── examples/
│   └── article.md      # 示例文章
├── .github/workflows/
│   ├── deploy.yml      # 自动部署到 Cloudflare Workers
│   └── pages.yml       # 自动部署到 Cloudflare Pages
├── API.md              # 接口文档（业务 API + 后台 API）
├── DEV_NOTES.md        # 开发与验证记录（含踩坑经验）
├── wrangler.toml.example
├── package.json
└── tsconfig.json
```

## 快速开始

### 1. 建库（D1）

```bash
npx wrangler d1 create wx-draft-db
# 把输出的 database_id 填进 wrangler.toml 的 [[d1_databases]]
```

> 数据表由程序在**首次请求时自动创建**，无需手工执行 SQL。

### 2. 配密钥

```bash
npx wrangler secret put WECHAT_APPSECRET    # 公众号 AppSecret
npx wrangler secret put ADMIN_PASSWORD      # 后台登录密码（v2.0.0 新增）
npx wrangler secret put DRAFT_API_KEY       # 旧版密钥（可选，会自动迁移为令牌）
```

`WECHAT_APPID` 可写在 `wrangler.toml` 的 `[vars]` 里（非机密）。

### 3. 部署

**方式 A：Cloudflare Workers（默认）**

```bash
npm install
npm run deploy          # 等价于 npx wrangler deploy
```

部署后访问 `https://<你的子域>.workers.dev/admin`，用 `ADMIN_PASSWORD` 登录。

**方式 B：Cloudflare Pages（同一份代码，多一个入口域名）**

```bash
npm run build           # 产出 dist/worker.js 与 dist/pages/_worker.js
npx wrangler pages deploy dist/pages --project-name=wx-draft-worker
```

Pages 项目需在控制台补两处配置（与 Worker 完全一致）：

1. **D1 绑定**：Pages 项目 → Settings → Functions → *D1 database bindings* → 变量名 `DB` → 选择 `wx-draft-db`
2. **变量**：同一页面的 *Variables and Secrets* → 添加 `WECHAT_APPSECRET`、`ADMIN_PASSWORD` 等

> ⚠️ 绑定/变量属于**部署级配置**，改完必须**重新部署一次**才生效。
> ⚠️ `wrangler pages deploy` 会提示 `wrangler.toml` 缺少 `pages_build_output_dir` 并忽略该文件——这是预期行为，不影响部署。

> 也可用 Cloudflare 控制台（Quick Edit 粘贴 `dist/worker.js`）或 GitHub Actions 自动部署，
> 详见下方「部署方式详解」。

## 管理后台

| 页面 | 路径 |
|------|------|
| 产品首页 | `/` |
| 登录 | `/admin/login` |
| 概览 | `/admin#/` |
| 令牌管理 | `/admin#/tokens` |
| 推送记录 | `/admin#/records` |
| 微信草稿箱 | `/admin#/drafts` |
| 在线试用 | `/admin#/try` |
| 接口文档 | `/admin#/docs` |
| 设置 | `/admin#/settings` |

**首次登录后建议**：到「设置」里确认 AppID 已识别、「鉴权开关」符合预期；
到「令牌管理」创建一枚自己的令牌（也可直接用自动迁移生成的那枚）。

## 接口一览

### 业务接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/` | — | 产品首页 |
| GET | `/api/health` | — | 健康检查（含 D1 连通状态） |
| POST | `/api/draft` | 令牌 | 推送草稿 |
| GET | `/api/drafts` | 令牌 | 微信草稿列表 |
| DELETE | `/api/drafts/:mediaId` | 令牌 | 删除微信草稿 |

### 后台接口（需登录会话）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/admin/login` | 登录（表单或 JSON），成功下发会话 Cookie |
| GET | `/admin/logout` | 退出 |
| GET | `/admin/api/stats` | 概览统计（含近 7 天趋势） |
| GET / POST | `/admin/api/tokens` | 令牌列表 / 创建 |
| PATCH / DELETE | `/admin/api/tokens/:id` | 启停 / 删除令牌 |
| GET | `/admin/api/records` | 推送记录 |
| DELETE | `/admin/api/records`、`/records/:id` | 清空 / 删除单条记录 |
| GET / PUT | `/admin/api/settings` | 读取 / 更新设置 |
| GET / PUT | `/admin/api/password` | 读取密码状态 / 修改密码 |
| POST | `/admin/api/try` | 在线试用（真实推送） |
| GET | `/admin/api/wx-drafts` | 微信草稿箱 |
| DELETE | `/admin/api/wx-drafts/:mediaId` | 删除微信草稿 |

详见 [API.md](./API.md)。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `WECHAT_APPID` | ✅ | 公众号 AppID（可放 `[vars]`） |
| `WECHAT_APPSECRET` | ✅ | 公众号 AppSecret（**机密**） |
| `ADMIN_PASSWORD` | ✅ | 后台登录密码（**机密**，v2.0.0 新增） |
| `DRAFT_API_KEY` | ❌ | 旧版调用密钥；存在且库中无令牌时自动迁移为一枚令牌 |
| `DB` | ✅ | D1 数据库绑定（`[[d1_databases]]`） |

## ⚠️ 两个必须做的配置（否则报错）

### 1. 公众号 IP 白名单 → 加入 Cloudflare 全部 IPv4 段

Worker 出口 IP 每次都可能不同，微信会拒绝。到
**公众号后台 → 设置与开发 → 基本配置（或安全中心）→ IP 白名单**，粘贴以下 15 段：

```
173.245.48.0/20
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
131.0.72.0/22
```

### 2. Bot 检测（403 / error 1010）——`*.workers.dev` 无法关闭

`*.workers.dev` 是 Cloudflare **共享域，默认开启 Bot 检测且无法关闭**（它不是 zone 级开关）。
非浏览器 UA（如 `Python-urllib/3.11`、`python-requests/2.x`）的请求会在**到达 Worker 之前**被拦：

```
403 error code: 1010
```

✅ **解决办法：客户端携带浏览器 UA**（`scripts/draft_push.py` 已内置，可用 `--ua` 覆盖）。
若绑定了**自定义域名**，则可到 控制台 → 域名 → 安全性 → 机器人 关闭 Bot Fight Mode 与浏览器完整性检查。

> 实测对照（同一请求，仅 UA 不同）：`Python-urllib/3.11` → 403/1010；`curl/8.7.1` → 放行；浏览器 UA → 放行。

## 本地推送示例

```bash
export WX_DRAFT_URL="https://你的域名/api/draft"
export WX_DRAFT_KEY="wxk_你的令牌"

python scripts/draft_push.py \
  --file article.md \
  --cover cover.png \
  --title "今日 AI 日报" \
  --author "Su"
```

`scripts/draft_push.py` 支持的字段：`title / author / digest / content / cover`
（封面支持 data URI、远程图 URL、本地路径；正文 `<img>` 自动转微信域名）。

> `contentType` 可省略：正文里没有 HTML 标签时，会自动按 Markdown 渲染。

## 本地自测（无需 Cloudflare 账号 / 无需网络）

```bash
npm install
npm run build                    # ① 产出 dist/worker.js + dist/pages/_worker.js
npx tsc --noEmit                 # ② 类型检查

# ③ 冒烟测试：Workers 版 / Pages 版（各 20 项断言，两版实现均全绿）
node scripts/smoke.mjs ../dist/worker.js
node scripts/smoke.mjs ../dist/pages/_worker.js
```

> 要求 Node.js **≥ 22**（wrangler 4.x 的硬性要求）。
> 覆盖：路由 / 健康检查 / 404 / 参数校验 / 鉴权(401) / CORS / OPTIONS / 开放模式边界
> 等 **20 项断言**。

## 部署方式详解

| 方式 | 适用场景 | 步骤 |
|------|----------|------|
| **A. Workers（CLI）** | 本地有 Node 环境，最常用 | `npm install && npm run deploy` |
| **B. Pages（CLI）** | 想要 Pages 域名 / 静态托管生态，或作为 Workers 的备份入口 | `npm run build && npx wrangler pages deploy dist/pages --project-name=<项目名>` |
| **C. Cloudflare 控制台** | 免安装、纯网页操作 | Workers & Pages → Create → 粘贴 `dist/worker.js`（Pages 则粘贴/上传 `dist/pages/_worker.js`）→ 配变量与 D1 → 再点一次 Deploy |
| **D. GitHub Actions** | push 即自动部署 | 见下 |

### GitHub Actions 自动部署（两种形态都已内置）

- `.github/workflows/deploy.yml` → 自动部署 **Workers**
- `.github/workflows/pages.yml` → 自动部署 **Pages**

仓库 Settings → Secrets and variables → Actions 添加两个 Secret：

| Secret | 说明 |
|--------|------|
| `CF_API_TOKEN` | Cloudflare API 令牌：需 *Workers Scripts: Edit*；要部署 Pages 还需 *Cloudflare Pages: Edit* |
| `CF_ACCOUNT_ID` | Cloudflare 账户 ID |

之后 push 到 `main` 即自动构建并部署。Pages 项目名在 `pages.yml` 的 `--project-name=` 处修改（首次执行会自动创建项目）。

> 💡 CI 运行需要三个仓库 Secret（Settings → Secrets and variables → Actions）：
> `CF_API_TOKEN`（权限含 *Workers Scripts: Edit* 与 *Cloudflare Pages: Edit*）、`CF_ACCOUNT_ID`、
> `D1_DATABASE_ID`（`npx wrangler d1 create` 输出的 uuid；**不配则部署出的 Worker 没有数据库绑定**）。
> 配置后 push 到 `main` 即自动构建并部署。
> ⚠️ 若你改用脚本 / API 推送代码，写入 `.github/workflows/*` 需要 Token 具备 **workflow** 权限（否则恒返回 404，
> 网页端上传则不受限）；仓库根目录 **`ci-templates/`** 保留了两份工作流副本，方便网页端直接复制使用。

### Pages 与 Workers 的差异（务必了解）

| 项 | Workers | Pages |
|----|---------|-------|
| 入口 | `dist/worker.js`（`wrangler.toml` 的 `main`） | `dist/pages/_worker.js`（高级模式固定文件名） |
| 配置来源 | `wrangler.toml` + `wrangler secret put` | 控制台 Pages 项目 → Settings → Functions / Variables |
| D1 绑定 | `[[d1_databases]]`（变量名 `DB`） | Settings → Functions → **D1 database bindings**，变量名 `DB` |
| 改完配置 | 重新 `wrangler deploy` | 绑定/变量属部署级配置，需**重新部署**才生效 |
| 访问域名 | `<子域>.workers.dev` / 自定义域 | `<项目名>.pages.dev` / 自定义域 |
| 代码 | 完全相同（同一份 Hono 应用，两种产物只是打包路径不同） | 同上 |

## 多公众号（后台管理）

后台「公众号管理」可添加任意数量的公众号（AppID + AppSecret），保存时会**真实调用微信接口校验**；其中标「默认」的一个用于未显式指定目标的推送。

- 推送时若要指定公众号：请求体加 `accountId`（后台列表接口 / 页面可见）
- 草稿箱页按公众号分区展示，可分别刷新与删除
- 删除默认公众号后，系统会自动把最早添加的一个补为默认
- 登录后台需要「管理员账号 + 密码」（账号默认 `admin`，可用环境变量 `ADMIN_USER` 或后台「设置」修改）

## 说明

- 个人订阅号**不能自动群发**，推到草稿箱后仍需到公众号后台**手动点「发表」**。
- `draft/add` 需要**已认证**的公众号（服务号或认证订阅号）；未认证账号调用会返回 `53500`。
- 后台密码、AppSecret 等机密只存于 Cloudflare Secrets，仓库内不含任何凭据。

## License

MIT
