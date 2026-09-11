# API 文档

Base URL 示例：`https://wx-draft-worker.<你的子域>.workers.dev`

所有接口返回 JSON。鉴权方式（当配置了 `DRAFT_API_KEY` 时）：

- 请求头：`X-API-Key: <你的密钥>`
- 或查询参数：`?key=<你的密钥>`

---

## GET /
健康检查。

**响应**
```json
{ "ok": true, "data": { "service": "wx-draft-worker", "version": "1.0.0", "time": "2026-09-11T05:00:00.000Z" } }
```

## GET /api/health
配置检查，用于确认环境变量是否就绪。

**响应**
```json
{
  "ok": true,
  "data": {
    "service": "wx-draft-worker",
    "version": "1.0.0",
    "appid_configured": true,
    "secret_configured": true,
    "auth_enabled": true,
    "time": "2026-09-11T05:00:00.000Z"
  }
}
```

---

## POST /api/draft
新建公众号草稿。

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 标题（≤64 字，超长自动截断） |
| `content` | string | ✅ | 正文 HTML（`contentType=markdown` 时为 Markdown 源码） |
| `author` | string | ❌ | 作者（≤8 字） |
| `digest` | string | ❌ | 摘要（≤120 字；缺省由正文自动生成） |
| `cover` | string | ❌ | 封面：data URI / 远程图片 URL；缺省自动取正文第一张图 |
| `contentType` | `"html"` \| `"markdown"` | ❌ | 默认 `html` |
| `contentSourceUrl` | string | ❌ | 原文链接（阅读原文） |
| `needOpenComment` | 0 \| 1 | ❌ | 是否开启评论，默认 1 |
| `onlyFansCanComment` | 0 \| 1 | ❌ | 仅粉丝可评论，默认 0 |

**响应**
```json
{ "ok": true, "data": { "media_id": "MEDIA_ID_xxx", "title": "今日 AI 日报", "images": 3 } }
```

**错误响应**
```json
{ "ok": false, "error": "上传封面素材失败：invalid ip 1.2.3.4, not in whitelist [40164]" }
```

**curl 示例**
```bash
curl -X POST "https://wx-draft-worker.xxx.workers.dev/api/draft" \
  -H "X-API-Key: 你的密钥" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "今日 AI 日报",
    "author": "Su",
    "contentType": "markdown",
    "content": "# 标题\n\n正文 **加粗**。\n\n![图](https://example.com/a.png)"
  }'
```

---

## GET /api/drafts
获取草稿列表。

| 查询参数 | 说明 |
|----------|------|
| `offset` | 偏移，默认 0 |
| `count` | 数量，默认 20（最大 20） |
| `noContent` | `1` 时不返回正文 |

**响应**
```json
{
  "ok": true,
  "data": {
    "total_count": 5,
    "item_count": 5,
    "item": [
      { "media_id": "xxx", "content": { "news_item": [ { "title": "标题", "author": "Su", "digest": "…", "url": "…", "thumb_url": "…" } ] } }
    ]
  }
}
```

---

## DELETE /api/drafts/:mediaId
删除指定草稿。

**响应**
```json
{ "ok": true, "data": { "media_id": "xxx" } }
```

---

## 常见错误码

| errcode | 含义 | 处理 |
|---------|------|------|
| `40164` | IP 不在白名单 | 把 Cloudflare 全部 IPv4 段加入公众号 IP 白名单（见 README） |
| `40001` | AppSecret 无效 | 检查 `WECHAT_APPSECRET` |
| `40013` | AppID 无效 | 检查 `WECHAT_APPID` |
| `45009` | 接口调用超限 | 稍后重试（token 已做缓存） |
| `53500` | 无草稿权限 | 需已认证公众号 |
| `1010` | Cloudflare 边缘拦截 | 关闭 Bot Fight Mode / Browser Integrity Check |

微信原始 `errcode` 会附在错误信息末尾的 `[…]` 中。
