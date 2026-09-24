#!/usr/bin/env python3
"""标签索引分语种过滤：让每个语言的标签页只列出该语言的页面。

为什么需要它
------------
`<!-- material/tags -->` 占位符由 tags 插件在**构建时**展开，而插件扫的是整个
`docs/` 目录——三棵树都在里面。于是简体页的标签索引把 `zh-hant/` 与 `en/` 的篇目
也一并列了出来：读者选了简体，却在标签页上读到「04.21 集會暨招生 · 逐頁實錄」。

插件本身没有语言概念，也没法按语言收窄扫描范围，所以只能在产物上补一刀：
遍历 `site/**/tags/index.html`，丢掉指向别的语言树的条目，并把因此空掉的标签
分组一并删掉。

判据是 href 解析后的站点内路径：
    site/tags/…              → zh-hans（默认语言不带前缀）
    site/en/tags/…           → en
    site/zh-hant/tags/…      → zh-hant

放在构建之后、`make build` 里紧跟 zensical 之后执行。
本脚本可重复执行：已经是过滤后的产物时不会再改动。

    uv run python tools/tagfilter.py
"""

from __future__ import annotations

import posixpath
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"

LI_RE = re.compile(r"<li>\s*<a href=\"([^\"]+)\"[^>]*>.*?</a>\s*</li>", re.S)
SECTION_RE = re.compile(r"(<h2 id=\"tag:[^\"]*\">.*?</h2>\s*)(<ul>.*?</ul>)", re.S)


def lang_of(site_rel: str) -> str:
    """站点内路径 → 语言。默认语言不带前缀。"""
    if site_rel.startswith("en/"):
        return "en"
    if site_rel.startswith("zh-hant/"):
        return "zh-hant"
    return "zh-hans"


def filter_page(path: Path) -> tuple[int, int]:
    html = path.read_text(encoding="utf-8")
    page_dir = path.parent.relative_to(SITE).as_posix()
    page_dir = "" if page_dir == "." else page_dir + "/"
    page_lang = lang_of(page_dir)

    dropped_items = 0
    dropped_sections = 0

    def keep_item(m: re.Match) -> str:
        nonlocal dropped_items
        href = m.group(1)
        if href.startswith(("#", "http:", "https:", "mailto:")):
            return m.group(0)
        resolved = posixpath.normpath(posixpath.join(page_dir, href))
        if lang_of(resolved + "/") == page_lang:
            return m.group(0)
        dropped_items += 1
        return ""

    def filter_section(m: re.Match) -> str:
        nonlocal dropped_sections
        head, ul = m.group(1), m.group(2)
        new_items = LI_RE.sub(keep_item, ul)
        if "<li>" not in new_items:
            dropped_sections += 1
            return ""
        return head + new_items

    new_html = SECTION_RE.sub(filter_section, html)

    if new_html != html:
        path.write_text(new_html, encoding="utf-8")
    return dropped_items, dropped_sections


def main() -> int:
    pages = sorted(SITE.rglob("tags/index.html"))
    if not pages:
        print("没有找到标签索引页（site/**/tags/index.html）——先构建再跑本脚本。",
              file=sys.stderr)
        return 1

    total_items = total_sections = 0
    for page in pages:
        items, sections = filter_page(page)
        total_items += items
        total_sections += sections
        rel = page.relative_to(SITE).as_posix()
        if items or sections:
            print(f"  {rel:28s} 去掉 {items} 条（{sections} 个空标签组）")
        else:
            print(f"  {rel:28s} 已符合本语言，未改动")
    print(f"标签索引过滤完成：共去掉 {total_items} 条、{total_sections} 个空标签组")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
