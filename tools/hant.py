#!/usr/bin/env python3
"""简体 → 繁体（脚本转换）。

这里做的是**文字转换**，不是翻译：把简体字转成繁体字，用词与句式一概不动。
语言代码用 `zh-hant`（文字），不用 `zh-TW` / `zh-HK` 这类**地区**标签——
地区标签会把词汇也改掉（激光→雷射、链接→連結、文件→檔案），
那是替读者选了某一地的用法，本站不做这个选择。

三处不转换
----------
1. **逐字引文**（以 `>` 开头的块引用）：中文页声明「引文一律保留原文」，
   这些是原始幻灯片上的繁体原文，改动它们等于篡改原件。
2. **反引号内的内容**：那些是真实文件名，必须逐字保留。
   （否则 zhconv 会把 `签到表` 转成 `籤到表`——连繁体都转错了，
   因为它不知道这里该是「簽到」。）
3. **代码块**内的整段内容。

另加一处：**链接与图片的目标**（`](…)`、`src=`、`href=`、裸 URL、参考式定义）。
目标里的中文是**路径**，磁盘上的文件名是简体，转换它等于把链接指向不存在的文件。
（曾如此：zh-hant 的下载链接被转成「物理社功勳系統对话史料整理_纪念网站版.docx」，
而文件实际叫「物理社功勋系统对话史料整理_纪念网站版.docx」，链接直接取不到。）

另外把几个「古体异写」归一为现代通行的繁体写法。这些差异不是地区差异
（两岸三地都更常用右边那个），只是转换表偏古：
    爲→為  羣→群  啓→啟  祕→秘  峯→峰  衆→眾
像 裏/裡、賬/帳 这类**确实存在地区分歧**的字，保持转换表原样，不替读者选边。
"""

from __future__ import annotations

import re

import zhconv

#: 不能转换的「路径位」。中文出现在这些地方是文件名/网址，不是文案。
PROTECTED = re.compile(
    r"\]\([^)\n]*\)"                      # 行内链接与图片的目标
    r"|\b(?:src|href|poster)=\"[^\"]*\""  # HTML 属性里的路径
    r"|^\s{0,3}\[[^\]]+\]:\s*\S+"         # 参考式链接定义
    r"|https?://\S+"                      # 裸 URL
    r"|\bdata-(?:photo|caption|original)=\"[^\"]*\"",
    re.M,
)

#: 转换表里偏古或前后不一致的写法，统一到现代通行繁体。
#: 这些都不是地区差异（两岸三地通用），只是正字法与一致性问题：
#:   古体异写  爲→為  羣→群  啓→啟  祕→秘  峯→峰  衆→眾
#:   同字混用  裏→裡（转换表对「这里/哪里」给裡，对「教室里」给裏，同一篇里混着）
NORMALIZE = str.maketrans({
    "爲": "為",
    "羣": "群",
    "啓": "啟",
    "祕": "秘",
    "峯": "峰",
    "衆": "眾",
    "裏": "裡",
})

#: 「签」作签署、签名、签到、多签用时是「簽」，不是「籤」（籤只用于抽籤一类）。
#: 转换表一律给「籤」，这里按下文改回来；「抽籤」保持不动。
SIGN_FIX = re.compile(r"(?<!抽)籤")


def convert_span(text: str) -> str:
    """转换一段不含代码与引文的文本。"""
    converted = zhconv.convert(text, "zh-hant").translate(NORMALIZE)
    return SIGN_FIX.sub("簽", converted)


def convert_line(line: str) -> str:
    """转换一行：跳过后引号内容，以及落在「路径位」上的片段。"""
    out: list[str] = []
    pos = 0
    for match in PROTECTED.finditer(line):
        out.append(_convert_backticks(line[pos:match.start()]))
        out.append(match.group(0))  # 路径原样保留
        pos = match.end()
    out.append(_convert_backticks(line[pos:]))
    return "".join(out)


def _convert_backticks(chunk: str) -> str:
    parts = chunk.split("`")
    return "`".join(part if i % 2 else convert_span(part) for i, part in enumerate(parts))


def to_hant(text: str) -> str:
    """整份文件转换：跳过引文行与代码块。"""
    out: list[str] = []
    in_fence = False
    for line in text.split("\n"):
        stripped = line.lstrip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            out.append(line)
            continue
        if in_fence or stripped.startswith(">"):
            out.append(line)
            continue
        out.append(convert_line(line))
    return "\n".join(out)


__all__ = ["to_hant", "convert_span", "convert_line"]
