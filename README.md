# wx-draft-worker

基于 **Cloudflare Workers + Hono** 的微信公众号草稿推送网关 —— 免服务器、免备案、长期有效。

把一篇文章（标题 + 正文 + 封面）POST 给它，它会自动：

1. 获取微信 `access_token`（带缓存，避免触发频率限制）
2. 把正文里的**外链图 / base64 图**转存到微信域名（否则草稿里图片不显示）
3. 上传**封面**为永久素材，拿到 `thumb_media_id`
4. 调用草稿箱接口**新建草稿**，返回 `media_id`

> 本项目沿用 [ai-gateway](https://github.com/wimdaw/ai-gateway) 的技术栈与工程规范：
> TypeScript + Hono + Cloudflare Workers + GitHub Actions 自动部署。

---

## 功能特性

- **一条 API 建草稿** —— `POST /api/draft`，字段与云托管版/Flask 版完全一致
- **图片自动转存** —— 正文外链图、data URI 图自动上传到微信域名
- **封面智能回退** —— 未传 `cover` 时自动取正文第一张图作为封面
- **Markdown 支持** —— `contentType: "markdown"` 时自动转 HTML
- **简单鉴权** —— `X-API-Key` 请求头或 `?key=` 查询参数（可留空开放）
- **配套接口** —— 草稿列表 `GET /api/drafts`、删除草稿 `DELETE /api/drafts/:mediaId`
- **错误可读** —— 微信 `errcode` 映射为中文提示（如 40164 → IP 不在白名单）
- **零依赖构建** —— 无打包步骤，`wrangler` 直接部署 TS

## 目录结构

```
wx-draft-worker/
├── src/
│   ├── index.ts     # Hono 应用与路由
│   ├── types.ts     # 类型定义（Env / 请求体 / 微信响应）
│   ├── wechat.ts    # 微信 API 客户端（token/上传/草稿）
│   ├── auth.ts      # API Key 鉴权中间件
│   ├── images.ts    # 图片处理（data URI / URL → Blob）
│   ├── markdown.ts  # 极简 Markdown → HTML
│   └── utils.ts     # 响应封装、微信错误码映射
├── dist/
│   └── worker.js      # ⭐ 单文件版（零依赖，可直接粘贴到 CF 控制台编辑器）
├── scripts/
│   ├── draft_push.py  # 本地推送脚本（可直接对接本 Worker）
│   └── smoke.mjs      # 冒烟测试（本地执行 Worker 逻辑，无需账号/网络）
├── examples/
│   └── article.md     # 示例文章
├── .github/workflows/deploy.yml
├── API.md             # 接口文档（含请求/响应示例）
├── DEV_NOTES.md       # 开发与验证记录（含踩坑经验）
├── wrangler.toml.example
├── package.json
└── tsconfig.json
```

## 快速开始

### 方式一：Cloudflare 控制台（免安装）

1. Workers & Pages → Create → Workers → 名称填 `wx-draft-worker` → Create
2. 进入在线编辑器（Quick Edit），粘贴 `src/` 下代码（或打包后的单文件，见下）
3. Settings → Variables and Secrets 添加：
   - `WECHAT_APPID` = 你的 AppID（普通变量）
   - `WECHAT_APPSECRET` = 你的 AppSecret（**Encrypt**）
   - `DRAFT_API_KEY` = 一串自定义密钥（**Encrypt**，可留空）
4. **加完变量后再点一次 Deploy**，否则 `env` 读不到

### 方式二：Wrangler CLI

```bash
npm install
cp wrangler.toml.example wrangler.toml   # 按需修改 name
npx wrangler secret put WECHAT_APPSECRET
npx wrangler secret put DRAFT_API_KEY
npx wrangler deploy
```

### 方式三：GitHub Actions 自动部署

1. 推送代码到 GitHub 仓库 `main` 分支
2. 仓库 Settings → Secrets and variables → Actions 添加：
   - `CF_API_TOKEN` — Cloudflare API Token（需 **Workers Scripts: Edit** 权限）
   - `CF_ACCOUNT_ID` — Cloudflare 账户 ID
3. 之后每次 push 自动部署（也可在 Actions 页手动 Run workflow）

> 机密变量（AppSecret / API Key）请在 **Cloudflare 控制台** 的 Variables and Secrets 里配置，
> 不要写进仓库。若用 wrangler CLI，可用 `--secret` 注入。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `WECHAT_APPID` | ✅ | 公众号 AppID |
| `WECHAT_APPSECRET` | ✅ | 公众号 AppSecret（机密） |
| `DRAFT_API_KEY` | ❌ | 调用鉴权密钥，留空则不鉴权 |

## 接口一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 健康检查 |
| GET | `/api/health` | 配置检查（是否已配 AppID/Secret/鉴权） |
| POST | `/api/draft` | 推送草稿 |
| GET | `/api/drafts` | 草稿列表 |
| DELETE | `/api/drafts/:mediaId` | 删除草稿 |

详见 [API.md](./API.md)。

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
export WX_DRAFT_KEY="你的DRAFT_API_KEY"

python scripts/draft_push.py \
  --file article.md \
  --cover cover.png \
  --title "今日 AI 日报" \
  --author "Su"
```

`scripts/draft_push.py` 支持的字段：`title / author / digest / content / cover`
（封面支持 data URI、远程图 URL、本地路径；正文 `<img>` 自动转微信域名）。

## 本地自测（无需 Cloudflare 账号 / 无需网络）

```bash
npm install
npx tsc --noEmit                 # ① 类型检查
node scripts/smoke.mjs           # ② 冒烟测试：单文件版 dist/worker.js

# ③ 冒烟测试：TypeScript 版（esbuild 纯净打包后执行，16 项断言）
npx esbuild src/index.ts --bundle --format=esm --platform=neutral \
  --outfile=.node-test/index.mjs
node scripts/smoke.mjs ../.node-test/index.mjs
```

> 要求 Node.js **≥ 22**（wrangler 4.x 的硬性要求）。
> 覆盖：路由/健康检查/404/参数校验/鉴权(401)/CORS/OPTIONS 等 16 项断言，两版实现均全绿。

## 说明

- 个人订阅号**不能自动群发**，推到草稿箱后仍需到公众号后台**手动点「发表」**。
- `draft/add` 需要**已认证**的公众号（服务号或认证订阅号）；未认证账号调用会返回 `53500`。

## License

MIT
