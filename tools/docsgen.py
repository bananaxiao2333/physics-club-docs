#!/usr/bin/env python3
"""从 content/ 生成构建树 docs/。

分层
----
    content/     唯一手写层。文件名带语言后缀：story/index.zh.md、story/index.en.md
    docs/        构建层。.md 由本脚本产出；assets/、stylesheets/、*.html 仍是手写的

同名不同语言的文件视为**同一篇**的两个语种：

    content/story/egg-drop.zh.md  ─┐
    content/story/egg-drop.en.md  ─┴─ 同一篇，两个语种

产物路径
--------
    默认语言 zh  →  docs/<名字>.md
    其它语言 en  →  docs/en/<名字>.md

于是中文在 /story/，英文在 /en/story/。

共享资产
--------
`docs/assets/` 只有一份，两种语言共用。content/ 里的相对链接按下述方式判定：
把链接相对**内容根**解析，落点在 assets/ 之下的就是共享资产。非默认语言的
产物比默认语言深一层，因此这些链接需要多补一个 `../`。其余链接指向的是
镜像页面，保持原样即可。

    uv run python tools/docsgen.py
    uv run python tools/docsgen.py --check     # 只比对，不写盘
"""

from __future__ import annotations

import argparse
import json
import posixpath
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
DOCS = ROOT / "docs"
MANIFEST = ROOT / ".docsgen.json"

DEFAULT_LANG = "zh"
#: 语言后缀：index.zh.md / index.en.md。只认裸语言码，不用 zh-CN、zh-TW 这类地区标签。
LANG_RE = re.compile(r"^(?P<name>.+)\.(?P<lang>[a-z]{2,3})$")

#: 内容根下这些前缀指向共享资产，而不是镜像页面。
SHARED_PREFIXES = ("assets/",)

BANNER_FMT = "# ⚠️ 由 tools/docsgen.py 从 {source} 生成，请勿手改；要改请改 content/ 下的源文件。"

_LINK = re.compile(r'(\]\(|(?:\bsrc|\bhref)=")(?P<target>[^")\s]+)')


# ── 路径 ──────────────────────────────────────────────────────────────────

def split_lang(stem: str) -> tuple[str, str] | None:
    """把 `index.zh` 拆成 ('index', 'zh')；不是语言后缀的文件返回 None。"""
    match = LANG_RE.match(stem)
    return (match["name"], match["lang"]) if match else None


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
    """(源文件, 名字, 语言)，按路径排序。"""
    found = []
    for path in sorted(CONTENT.rglob("*.md")):
        rel = path.relative_to(CONTENT)
        parts = split_lang(rel.stem)
        if not parts:
            print(f"warn: {path.relative_to(ROOT)} 没有语言后缀，已跳过", file=sys.stderr)
            continue
        stem, lang = parts
        # name 是相对 content/ 的路径，含子目录：story/index、flight/runbook
        name = (rel.parent / stem).as_posix()
        found.append((path, name, lang))
    return found


def render(source: Path, name: str, lang: str) -> str:
    text = source.read_text(encoding="utf-8")
    base = source.parent.relative_to(CONTENT).as_posix()
    base = "" if base == "." else base
    depth = 0 if lang == DEFAULT_LANG else 1

    banner = BANNER_FMT.format(source=source.relative_to(ROOT).as_posix())
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end == -1:
            raise SystemExit(f"{source}: 前置元数据没有闭合")
        head, body = text[: end + 1], text[end + 1 :]
        text = f"{head}{banner}\n{body}" if not head.endswith("\n") else f"{head}{banner}\n{body}"
    else:
        text = f"<!-- {banner.lstrip('# ')} -->\n\n{text}"

    return rewrite_shared(text, base, depth)


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
        while directory != DOCS and directory.exists() and not any(directory.iterdir()):
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
    written: list[Path] = []
    changed: list[Path] = []
    errors: list[str] = []

    for source, name, lang in sources():
        target = output_of(name, lang)
        rel = target.relative_to(ROOT).as_posix()
        current.add(rel)
        content = render(source, name, lang)
        existing = target.read_text(encoding="utf-8") if target.exists() else None
        if existing == content:
            continue
        changed.append(target)
        written.append(target)
        if not args.check:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(content, encoding="utf-8")

    # 同名同语言重复
    seen: dict[Path, Path] = {}
    for source, name, lang in sources():
        target = output_of(name, lang)
        if target in seen:
            errors.append(f"{source} 与 {seen[target]} 都要生成 {target}")
        seen[target] = source

    stale = previous - current

    if not args.check:
        removed = prune(previous, current)
        MANIFEST.write_text(
            json.dumps({"generated": sorted(current)}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
    else:
        removed = []

    for warning in errors:
        print(f"error: {warning}", file=sys.stderr)

    verb = "需要更新" if args.check else "已生成"
    print(f"{verb} {len(changed)} / {len(current)} 个页面")
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
