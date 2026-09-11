#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
本地推送公众号草稿 —— 对接 wx-draft-worker

用法:
    export WX_DRAFT_URL="https://wx-draft-worker.xxx.workers.dev/api/draft"
    export WX_DRAFT_KEY="你的 DRAFT_API_KEY"

    python draft_push.py --file article.md --cover cover.png \
        --title "今日 AI 日报" --author "Su" --markdown

封面支持: 本地路径 / 远程 URL / data URI；不传则由服务端取正文首图。
"""
import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request

KEY_HEADER = "X-API-" + "Key"

# Cloudflare 的 *.workers.dev 默认开启 Bot 检测，非浏览器 UA 会被拦截（403 / error 1010），
# 且该策略在 workers.dev 共享域上无法关闭。因此默认携带浏览器 UA，可用 --ua 覆盖。
DEFAULT_UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")


def to_data_uri(path: str) -> str:
    """本地图片 → data URI"""
    mime = mimetypes.guess_type(path)[0] or "image/png"
    with open(path, "rb") as f:
        raw = f.read()
    return "data:%s;base64,%s" % (mime, base64.b64encode(raw).decode())


def guess_cover(cover: str) -> str:
    """把 --cover 参数归一化：本地文件 → data URI，其余原样返回"""
    if not cover:
        return ""
    if cover.startswith(("data:", "http://", "https://")):
        return cover
    if os.path.isfile(cover):
        return to_data_uri(cover)
    sys.exit("[!] 封面文件不存在: %s" % cover)


def first_heading(path: str, md: bool) -> str:
    """从文件里猜标题"""
    try:
        with open(path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                if md and line.startswith("#"):
                    return line.lstrip("#").strip()
                return line[:64]
    except OSError:
        pass
    return os.path.splitext(os.path.basename(path))[0]


def main() -> int:
    ap = argparse.ArgumentParser(description="推送公众号草稿到 wx-draft-worker")
    ap.add_argument("--url", default=os.environ.get("WX_DRAFT_URL", ""),
                    help="Worker 草稿接口地址 (默认取环境变量 WX_DRAFT_URL)")
    ap.add_argument("--key", default=os.environ.get("WX_DRAFT_KEY", ""),
                    help="DRAFT_API_KEY (默认取环境变量 WX_DRAFT_KEY)")
    ap.add_argument("--file", required=True, help="正文文件 (md/html)")
    ap.add_argument("--cover", default="", help="封面: 本地文件 / URL / data URI")
    ap.add_argument("--title", default="", help="标题 (默认取文件首个标题)")
    ap.add_argument("--author", default="", help="作者")
    ap.add_argument("--digest", default="", help="摘要 (默认由服务端生成)")
    ap.add_argument("--markdown", action="store_true", help="正文按 Markdown 解析")
    ap.add_argument("--ua", default=os.environ.get("WX_DRAFT_UA", DEFAULT_UA),
                    help="User-Agent（默认浏览器 UA，用于绕过 Cloudflare 1010 拦截）")
    args = ap.parse_args()

    if not args.url:
        sys.exit("[!] 缺少 --url，或先设置环境变量 WX_DRAFT_URL")

    with open(args.file, "r", encoding="utf-8") as f:
        content = f.read()

    payload = {
        "title": args.title or first_heading(args.file, args.markdown),
        "content": content,
        "contentType": "markdown" if args.markdown else "html",
    }
    if args.author:
        payload["author"] = args.author
    if args.digest:
        payload["digest"] = args.digest
    cover = guess_cover(args.cover)
    if cover:
        payload["cover"] = cover

    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(args.url, data=body, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("User-Agent", args.ua)
    if args.key:
        req.add_header(KEY_HEADER, args.key)

    print("[*] POST %s  (title=%s, %d bytes)" % (args.url, payload["title"], len(body)))
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            text = resp.read().decode("utf-8", "replace")
            print("[+] HTTP %s" % resp.status)
    except urllib.error.HTTPError as e:
        text = e.read().decode("utf-8", "replace")
        print("[-] HTTP %s" % e.code)
        if e.code == 403 and "1010" in text:
            print("    提示: 被 Cloudflare Bot 检测拦截 (error 1010)。")
            print("    解决: 换用浏览器 UA（--ua \"Mozilla/5.0 ...\"），或改用自定义域名。")
    except Exception as e:  # noqa: BLE001
        print("[-] 请求失败:", type(e).__name__, e)
        return 1

    try:
        data = json.loads(text)
    except ValueError:
        print(text)
        return 0

    if data.get("ok"):
        print("[+] 草稿已创建, media_id =", data.get("data", {}).get("media_id"))
        print("    请到公众号后台草稿箱手动发表。")
        return 0
    print("[-] 失败:", data.get("error") or text)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
