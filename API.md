# API 文档

Base URL 示例：`https://wx-draft-worker.<你的子域>.workers.dev`

所有接口返回 JSON。

| 类型 | 鉴权方式 |
|------|----------|
| **业务接口**（`/api/*`） | 请求头 `X-API-Key: wxk_xxx`；兼容 `?key=xxx` 与 `Authorization: Bearer xxx`。**未携带密钥时**，仅当系统未配置任何密钥才放行（开放模式） |
| **后台接口**（`/admin/api/*`） | 登录会话 Cookie（`wxd_session`），未登录返回 `401 {"error":"未登录或会话已过期，请重新登录"}` |

> 令牌在**管理后台 → 令牌管理**创建/启停。旧版 `DRAFT_API_KEY` 会被自动迁移为一枚令牌，也可继续直接使用。

---

## GET /
产品首页（HTML，非 JSON）。

## GET /api/health
健康检查，无需鉴权。

```json
{ "ok": true, "data": { "service": "wx-draft-worker", "version": "2.0.0",
  "appid_configured": true, "secret_configured": true,
  "auth_enabled": true, "db_connected": true, "time": "2026-09-11T05:00:00.000Z" } }
```

---

## POST /api/draft
新建公众号草稿。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 标题（≤64 字，超长自动截断） |
| `content` | string | ✅ | 正文（HTML 或 Markdown 源码） |
| `author` | string | ❌ | 作者（≤8 字） |
| `digest` | string | ❌ | 摘要（≤120 字；缺省由正文自动生成） |
| `cover` | string | ❌ | 封面：data URI / 远程图片 URL；缺省自动取正文第一张图 |
| `contentType` | `"html"` \| `"markdown"` | ❌ | **可省略**：省略时自动识别 —— 含 HTML 标签按 HTML 处理，否则按 Markdown 渲染 |
| `contentSourceUrl` | string | ❌ | 原文链接（阅读原文） |
| `needOpenComment` | 0 \| 1 | ❌ | 是否开启评论，默认 1 |
| `onlyFansCanComment` | 0 \| 1 | ❌ | 仅粉丝可评论，默认 0 |

**成功响应**
```json
{ "ok": true, "data": { "media_id": "MEDIA_ID_xxx", "title": "今日 AI 日报", "images": 3, "failed_images": [] } }
```
`images` 为**正文中被转存到微信域名**的图片数量。

**失败响应**
```json
{ "ok": false, "error": "上传封面素材失败：invalid ip 1.2.3.4, not in whitelist [40164]" }
```
每次调用（无论成败）都会写入后台「推送记录」，含耗时、图片数、失败原因。

**curl 示例**
```bash
curl -X POST "https://wx-draft-worker.xxx.workers.dev/api/draft" \
  -H "X-API-Key: wxk_你的令牌" \
  -H "User-Agent: Mozilla/5.0" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "今日 AI 日报",
    "author": "Su",
    "content": "# 标题\n\n正文 **加粗**。\n\n![图](https://example.com/a.png)"
  }'
```
> 注意：`*.workers.dev` 共享域有 Bot 检测，非浏览器 UA 会被拦截，**务必带浏览器 UA**（见 README）。

---

## GET /api/drafts
获取微信草稿列表。

| 查询参数 | 说明 |
|----------|------|
| `offset` | 偏移，默认 0 |
| `count` | 数量，默认 20（最大 20） |
| `noContent` | `1` 时不返回正文 |

```json
{ "ok": true, "data": { "total_count": 5, "item_count": 5,
  "item": [ { "media_id": "xxx", "content": { "news_item": [ { "title": "标题", "author": "Su", "digest": "…", "url": "…", "thumb_url": "…" } ] } } ] } }
```

## DELETE /api/drafts/:mediaId
删除指定微信草稿。成功返回 `{ "ok": true, "data": { "media_id": "xxx" } }`。

---

# 后台接口（`/admin/api/*`，需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/admin/login` | 登录。支持表单（`password`）或 JSON；成功返回 `{ok:true,data:{redirect:"/admin"}}` 并下发 Cookie；密码错误 `401` |
| GET | `/admin/logout` | 退出并清 Cookie |
| GET | `/admin/api/stats` | `{total,success,failed,success_rate,avg_duration_ms,today,tokens,tokens_enabled,appid_configured,secret_configured,daily:[{date,count},…]}` |
| GET | `/admin/api/tokens` | 令牌列表（密钥脱敏，仅创建时返回完整 key） |
| POST | `/admin/api/tokens` | 创建令牌：`{name, note?}` → `{ok:true,data:{token:{…,key:"wxk_…"}}}` |
| PATCH | `/admin/api/tokens/:id` | 启停令牌：`{enabled: true\|false}` |
| DELETE | `/admin/api/tokens/:id` | 删除令牌 |
| GET | `/admin/api/records` | 推送记录（`?limit=`） |
| DELETE | `/admin/api/records` / `/records/:id` | 清空全部 / 删除单条 |
| GET | `/admin/api/settings` | `{settings, using_default_password, appid_configured, secret_configured, appid_masked, legacy_key_configured}` |
| PUT | `/admin/api/settings` | 更新默认值：`default_author` / `default_content_type` / `default_need_open_comment` |
| GET | `/admin/api/password` | 密码状态 |
| PUT | `/admin/api/password` | 修改后台密码 `{password}`（写入 D1，优先于环境变量） |
| POST | `/admin/api/try` | 在线试用：与 `POST /api/draft` 同参数，走真实推送并落库 |
| GET | `/admin/api/wx-drafts` | 微信草稿箱 |
| DELETE | `/admin/api/wx-drafts/:mediaId` | 删除微信草稿 |

> 后台密码优先级：**D1 中的 `admin_password` 设置** > 环境变量 `ADMIN_PASSWORD` > 默认 `admin`（请务必修改）。
> 会话有效期 7 天，过期自动清理；修改密码不会使已有会话立即失效（可在设置中提示）。

---

## 常见错误码

| errcode / HTTP | 含义 | 处理 |
|---------|------|------|
| `40164` | IP 不在白名单 | 把 Cloudflare 全部 IPv4 段加入公众号 IP 白名单（见 README） |
| `40001` | AppSecret 无效 | 检查 `WECHAT_APPSECRET` |
| `40013` | AppID 无效 | 检查 `WECHAT_APPID` |
| `45009` | 接口调用超限 | 稍后重试（token 已做缓存） |
| `53500` | 无草稿权限 | 需已认证公众号 |
| `1010` (403) | Cloudflare 边缘拦截 | 请求带浏览器 UA；或自定义域关闭 Bot Fight Mode |
| `401` | 令牌无效/未登录 | 检查 `X-API-Key` 或在后台重新登录 |

微信原始 `errcode` 会附在错误信息末尾的 `[…]` 中。
