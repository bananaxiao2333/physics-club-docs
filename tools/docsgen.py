#!/usr/bin/env python3
"""从 content/ 生成构建树 docs/。

分层
----
    content/     唯一手写层。文件名带语言后缀：story/index.zh-hans.md、story/index.en.md
    docs/        构建层。.md 由本脚本产出；assets/、stylesheets/、*.html 仍是手写的

同名不同语言后缀的文件是**同一篇**的不同语种：

    content/story/egg-drop.zh-hans.md  ─┐
    content/story/egg-drop.en.md       ─┴─ 同一篇，两个语种

产物路径
--------
    默认语言 zh-hans  →  docs/<名字>.md
    其它语言 en       →  docs/en/<名字>.md
    其它语言 zh-hant  →  docs/zh-hant/<名字>.md

于是简中在 /story/，英文在 /en/story/，繁中在 /zh-hant/story/。

语言代码用**文字**标签（zh-hans / zh-hant），不用 zh-CN / zh-TW 这类**地区**标签：
地区标签会把用词一起改掉（激光→雷射、链接→連結），那是替读者选边。

派生语言
--------
繁体不是翻译，是简体的**脚本转换**，因此不单独手写，由本脚本从
`content/**/*.zh-hans.md` 派生（见 tools/hant.py）。落地页同理：
`overrides/partials/landing.zh-hant.html` 由 `landing.html` 派生。
派生意味着不可能出现「简体改了、繁体没跟上」。

共享资产
--------
`docs/assets/` 只有一份，三种语言共用。content/ 里的相对链接按**内容根**解析，
落点在 assets/ 之下的就是共享资产；非默认语言的产物深一层，因此这些链接要多补
一个 `../`。其余链接指向镜像页面，保持原样即可。

    uv run python tools/docsgen.py
    uv run python tools/docsgen.py --check     # 只比对，不写盘
"""

from __future__ import annotations

import argparse
import json
import posixpath
import re
import sys
from pathlib import Path
from typing import Callable

from hant import to_hant
from langs import CONTENT, DEFAULT_LANG, DERIVATIONS, LANG_RE, ROOT

DOCS = ROOT / "docs"
MANIFEST = ROOT / ".docsgen.json"

#: 派生语言 → 转换函数。派生关系本身定义在 tools/langs.py，
#: 那里是「本站有哪几种语言」的唯一出处；这里只负责绑定转换实现。
DERIVED_CONVERTERS: dict[str, Callable[[str], str]] = {
    "zh-hant": to_hant,
}
DERIVATIONS = [(dst, src, DERIVED_CONVERTERS[dst]) for dst, src in DERIVATIONS.items()
               if dst in DERIVED_CONVERTERS]

#: 由简体派生的落地页模板
LANDING_SRC = ROOT / "overrides/partials/landing.html"
LANDING_DERIVED = ROOT / "overrides/partials/landing.zh-hant.html"

#: 内容根下这些前缀指向共享资产，而不是镜像页面。
SHARED_PREFIXES = ("assets/",)

BANNER_FMT = "# ⚠️ 由 tools/docsgen.py 从 {source} 生成，请勿手改；要改请改 content/ 下的源文件。"
DERIVED_BANNER = "（本页由 {source_lang} 版脚本转换而来，不是另译）"

_LINK = re.compile(r'(\]\(|(?:\bsrc|\bhref)=")(?P<target>[^")\s]+)')


# ── 路径 ──────────────────────────────────────────────────────────────────

def split_lang(stem: str) -> tuple[str, str] | None:
    """把 `index.zh-hans` 拆成 ('index', 'zh-hans')；不是语言后缀的文件返回 None。"""
    match = LANG_RE.match(stem)
    return (match["name"], match["lang"]) if match else None


def depth_of(lang: str) -> int:
    """产物相对 docs/ 下沉几层。默认语言 0，其余 1。"""
    return 0 if lang == DEFAULT_LANG else 1


def is_shared(target: str, base: str) -> bool:
    """该相对链接是否指向共享资产（而非镜像页面）。"""
    if not target or target.startswith(("http://", "https://", "mailto:", "/", "#", "data:")):
        return False
    path = target.split("#", 1)[0].split("?", 1)[0]
    if not path:
        return False
    return any(posixpath.normpath(posixpath.join(base, path)).startswith(p)
               for p in SHARED_PREFIXES)


def rewrite_shared(body: str, base: str, depth: int) -> str:
    """非默认语言多下沉一层，共享资产的相对链接要多补 depth 个 `../`。"""
    if depth == 0:
        return body

    def patch(match: re.Match[str]) -> str:
        target = match["target"]
        if not is_shared(target, base):
            return match.group(0)
        return f"{match.group(1)}{'../' * depth}{target}"

    return _LINK.sub(patch, body)


# ── 生成 ──────────────────────────────────────────────────────────────────

def sources() -> list[tuple[Path, str, str]]:
    """(源文件, 名字, 语言)，按路径排序。名字是相对 content/ 的路径，含子目录。"""
    found = []
    for path in sorted(CONTENT.rglob("*.md")):
        rel = path.relative_to(CONTENT)
        parts = split_lang(rel.stem)
        if not parts:
            print(f"warn: {path.relative_to(ROOT)} 没有语言后缀，已跳过", file=sys.stderr)
            continue
        stem, lang = parts
        found.append((path, (rel.parent / stem).as_posix(), lang))
    return found


def insert_banner(text: str, source: Path, note: str = "") -> str:
    banner = BANNER_FMT.format(source=source.relative_to(ROOT).as_posix()) + note
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end == -1:
            raise SystemExit(f"{source}: 前置元数据没有闭合")
        return f"{text[: end + 1]}{banner}\n{text[end + 1:]}"
    return f"<!-- {banner.lstrip('# ')} -->\n\n{text}"


def render(source: Path, lang: str, *, depth: int, convert: Callable[[str], str] | None = None,
           note: str = "") -> str:
    text = source.read_text(encoding="utf-8")
    base = source.parent.relative_to(CONTENT).as_posix()
    base = "" if base == "." else base
    text = insert_banner(text, source, note)
    text = rewrite_shared(text, base, depth)
    return convert(text) if convert else text


def output_of(name: str, lang: str) -> Path:
    prefix = DOCS if lang == DEFAULT_LANG else DOCS / lang
    return prefix / f"{name}.md"


def prune(previous: set[str], current: set[str]) -> list[Path]:
    """删掉上一次生成、这次不再存在的文件，并清掉空目录。"""
    removed = []
    for rel in sorted(previous - current):
        path = ROOT / rel
        if path.exists():
            path.unlink()
            removed.append(path)
    for rel in sorted(previous - current, reverse=True):
        directory = (ROOT / rel).parent
        while directory not in (DOCS, ROOT) and directory.exists() and not any(directory.iterdir()):
            directory.rmdir()
            directory = directory.parent
    return removed


def main() -> int:
    parser = argparse.ArgumentParser(description="从 content/ 生成构建树 docs/")
    parser.add_argument("--check", action="store_true", help="只比对，不写盘")
    args = parser.parse_args()

    previous: set[str] = set()
    if MANIFEST.exists():
        previous = set(json.loads(MANIFEST.read_text(encoding="utf-8")).get("generated", []))

    current: set[str] = set()
    changed: list[Path] = []
    errors: list[str] = []

    def emit(target: Path, content: str) -> None:
        current.add(target.relative_to(ROOT).as_posix())
        existing = target.read_text(encoding="utf-8") if target.exists() else None
        if existing == content:
            return
        changed.append(target)
        if not args.check:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")

    seen: dict[Path, Path] = {}

    for source, name, lang in sources():
        target = output_of(name, lang)
        if target in seen:
            errors.append(f"{source} 与 {seen[target]} 都要生成 {target}")
        seen[target] = source
        emit(target, render(source, lang, depth=depth_of(lang)))

        # 由这一族语言派生的其它语言（如 zh-hans → zh-hant）
        for dst_lang, src_lang, convert in DERIVATIONS:
            if lang != src_lang:
                continue
            note = " " + DERIVED_BANNER.format(source_lang=src_lang)
            emit(
                output_of(name, dst_lang),
                render(source, lang, depth=depth_of(dst_lang), convert=convert, note=note),
            )

    # 落地页模板的派生版本：结构必须与原版逐标签一致，只有文案不同
    if LANDING_SRC.exists():
        for dst_lang, src_lang, convert in DERIVATIONS:
            if dst_lang != "zh-hant":
                continue
            banner = ("{#-\n"
                      f"  本文件由 tools/docsgen.py 从 {LANDING_SRC.name} 脚本转换而来，请勿手改。\n"
                      f"  对应语言：{dst_lang}（源为 {src_lang}）。\n"
                      "-#}\n")
            emit(LANDING_DERIVED, banner + convert(LANDING_SRC.read_text(encoding="utf-8")))

    stale = previous - current

    if not args.check:
        prune(previous, current)
        MANIFEST.write_text(
            json.dumps({"generated": sorted(current)}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    for warning in errors:
        print(f"error: {warning}", file=sys.stderr)

    verb = "需要更新" if args.check else "已生成"
    print(f"{verb} {len(changed)} / {len(current)} 个文件")
    for path in changed[:20]:
        print(f"  {path.relative_to(ROOT)}")
    if len(changed) > 20:
        print(f"  … 另有 {len(changed) - 20} 个")
    if stale:
        print(f"{'将删除' if args.check else '已删除'} {len(stale)} 个已失效的产物")
        for rel in sorted(stale)[:10]:
            print(f"  {rel}")

    return 1 if (args.check and (changed or stale)) else (1 if errors else 0)


if __name__ == "__main__":
    raise SystemExit(main())
