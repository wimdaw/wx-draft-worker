#!/usr/bin/env python3
"""生成推送自检物料（封面图 + 内嵌图 + Markdown 正文）到 .push-test/。
用法: python scripts/make_test_assets.py
"""
import zlib, struct, os, base64

def make_png(w, h, rgb, path):
    raw = b"".join(b"\x00" + bytes(rgb) * w for _ in range(h))
    def chunk(t, data):
        c = t + data
        return struct.pack(">I", len(data)) + c + struct.pack(">I", zlib.crc32(c) & 0xffffffff)
    png = (b"\x89PNG\r\n\x1a\n"
           + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw))
           + chunk(b"IEND", b""))
    open(path, "wb").write(png)

def main():
    d = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".push-test")
    os.makedirs(d, exist_ok=True)
    make_png(900, 383, (60, 130, 246), os.path.join(d, "cover.png"))
    make_png(120, 120, (250, 204, 21), os.path.join(d, "inline.png"))
    b64 = base64.b64encode(open(os.path.join(d, "inline.png"), "rb").read()).decode()
    md = ("# 推送自检 · wx-draft-worker\n\n这是一篇用于自检的测试文章。\n\n"
          "## 段落\n\n- 列表项 A\n- 列表项 B\n\n"
          "![内嵌图](data:image/png;base64," + b64 + ")\n")
    open(os.path.join(d, "article.md"), "w", encoding="utf-8").write(md)
    print("已生成测试物料:", os.path.abspath(d))

if __name__ == "__main__":
    main()
