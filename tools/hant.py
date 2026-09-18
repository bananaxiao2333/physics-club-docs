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

另外把几个「古体异写」归一为现代通行的繁体写法。这些差异不是地区差异
（两岸三地都更常用右边那个），只是转换表偏古：
    爲→為  羣→群  啓→啟  祕→秘  峯→峰  衆→眾
像 裏/裡、賬/帳 这类**确实存在地区分歧**的字，保持转换表原样，不替读者选边。
"""

from __future__ import annotations

import re

import zhconv

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
    """转换一行，跳过反引号内的内容。"""
    parts = line.split("`")
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
