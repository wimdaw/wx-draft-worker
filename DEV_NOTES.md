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
