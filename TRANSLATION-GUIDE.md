# 翻译规范（中 → 英）

本文件是 `content/**/*.en.md` 的写作与验收依据。翻译这座纪念网站的英文版时，
先读本文件，再读要译的那一篇。

---

## 〇、先看这里：哪些语言要手写

| 语言 | 代码 | 谁来做 |
| --- | --- | --- |
| 简体中文 | `zh-hans` | **手写原文**，是唯一的源 |
| English | `en` | **手写翻译**，本规范的全部要求都针对它 |
| 繁體中文 | `zh-hant` | **不用手写**：由 `tools/docsgen.py` 从简体脚本转换（`tools/hant.py`） |

所以本文件说的「翻译」只针对英文。繁体如果发现用字不对，改
`tools/hant.py` 的转换规则，**不要直接改 `docs/zh-hant/` 或 `overrides/partials/landing.zh-hant.html`**
——那两个都是生成物，下次 `make gen` 会被覆盖。

## 一、这是什么

ASJ 英东物理社（一所中学的物理社团）已经解散。这个站点是它的数字纪念馆：
把留存下来的讲稿、活动方案、设计原稿与照片整理归档。

**它不是宣传册，是一座档案室。** 读者是当年的社员、他们的老师，以及后来
偶然找到这里的人。

## 二、语气

| 要 | 不要 |
| --- | --- |
| 克制、平实、陈述 | 煽情、感叹、营销腔 |
| 短句，一句一件事 | 长串从句堆叠 |
| 具体到日期、页数、文件名 | 模糊的「曾经」「许多」 |
| 承认材料缺口：「留存材料未见记载」 | 补写合理但无据的细节 |
| 并列保留互相矛盾的说法 | 替读者裁定哪个版本正确 |

中文原文本身已经很有分寸。**英文不要比中文更热情，也不要更冷淡。**

## 三、结构与格式（硬性要求）

1. **逐段对应。** 原文有几节、几张表、几个提示框，译文就有几节、几张表、
   几个提示框。不合并、不拆分、不增删。
2. **保留 Markdown 结构**：`##` / `###` 层级、表格行列、`!!! note/warning/info`
   提示框、`<div class="grid cards">` 卡片、`<p class="memorial-kicker">` 小标、
   行内 `<span style="color:#910000">■</span>` 色块。
3. **链接目标原样保留**（它们是镜像的相对路径）：`story/index.md`、
   `../governance/roster.md`、`../assets/originals/badge-president.jpg` 等，
   一个字符都不要改。链接**文字**才翻译。
4. **专名与文件名保持原样**：`资料/物理社集会0427.pptx`、
   `物理社功勋系统对话史料整理_纪念网站版.docx` 是真实文件名，写在反引号里
   原样保留；必要时在括号里补一句英文说明。
5. **表格表头要译**；`---` 分隔行、数字、日期、色值（`#910000`）不要动。
6. 原文用「方括号引号」`「」` 时，英文用弯引号 `“ ”`。
7. 繁体原文校注（如「孔耀聰」「脈衝星」）按原文保留在引号或反引号内，
   并说明该处为繁体原文。

## 四、术语表

以下译法必须一致。表格里没有的，按上下文判断，但同一篇内保持一致。

| 中文 | English |
| --- | --- |
| ASJ 英东物理社 | ASJ Yingdong Physics Club |
| 数字纪念馆 / 纪念站 | digital memorial / memorial site |
| 自由曾在此 | Freedom Was Here |
| 集会 | assembly |
| 招新 | recruitment |
| 社牌 | club badge |
| 社徽 | club emblem |
| 管理层 | officers |
| 社长 / 副社长 | president / vice-president |
| 顾问 | advisor |
| 奇点 / 星云 / 脉冲星 / 磁陀星 | Singularity / Nebula / Pulsar / Magnetar |
| 组别 / 组员 | group / group member |
| 会费 / 社费 | membership dues / club dues |
| 贡献积分 | contribution credits |
| 功勋 | merit |
| 功勋系统 | the merit system |
| 资金池 | fund pool |
| 固定资金池 | fixed fund pool |
| 流动资金池 | circulating fund pool |
| 项目待结算 | pending project settlement |
| 奖励池 | reward pool |
| 公开账本 | public ledger |
| 多签 | multi-signature |
| 总账恒等式 | ledger identity |
| 白皮书 | white paper |
| 留存边界 | retention boundary |
| 会计 / 出纳 | treasurer / cashier |
| 停摆 | suspension |
| 原档 / 原件 | original archive / original |
| 设计原档 | Design Archive |
| 影像档案 | Photo Archive |
| 集会原稿 / 集会放映室 | assembly scripts / the Assembly Room |
| 飞行计划 | the Flight Project |
| A4 纸飞行节 | A4 Paper Flight Festival |
| 纸飞机挑战赛 | paper plane challenge |
| 激光测距 | laser ranging |
| 实时投屏 | live projection |
| 执行流程 | run of show |
| 采购与物料明细 | purchasing and materials list |
| 逐页实录 | page-by-page record |
| 资料出处 | Sources |
| 致谢与后记 | Thanks and Afterword |
| 记述原则 | how this site records things |
| 留存材料 | surviving material |
| 未见记载 | not recorded in the surviving material |

## 四之二、引文政策（重要）

「集会原稿」这一章是**逐页转录**：把原始幻灯片的文字**逐字保留原文**
（含繁体与原始标点），页间说明才是本站写的。中文页在 info 提示框里
明确声明了这一点——`引文一律保留原文`、`引文保留原文`。

**英文版必须保持同一政策**：

1. 原文引文**逐字保留**，不译、不改标点、不转简体；
2. 紧随其后给出英文转写，用一行 `**English rendering.**` 起头，让英文读者能读懂；
3. 幻灯片本身已经印了中英两行的（例如封面），**照印好的两行抄**，不要再另加；
4. info 提示框里那句政策声明要如实译出（"quotations preserve the original wording"），
   并补一句「英文转写为本站所加」（English renderings are added by this site）；
5. 这类页面**应当**加 `allow_cjk: true`，并在文件里写清理由。

!!! warning "反面示例"
    把引文全部译成英文，再把提示框里的政策改成「引文以英文呈现」——
    那不是翻译，是替纪念站改了一条编务声明。**不要这样做。**
    名录里的中文姓名同理：没有记载罗马字的，保留中文，不要替人拼写。

## 五、前置元数据（硬性要求）

译文文件的前置元数据必须包含：

```yaml
---
title: <英文标题>
description: <英文描述，一句话>
source_sha256: <原文的 sha256，见下方获取方式>
translated: <今天的日期 YYYY-MM-DD>
---
```

* `nav_label`、`nav`、`icon` 等键**原样保留**（它们是导航用的）。
* `source_sha256` 必须是**你翻译时所依据的那一版原文**的指纹。
  取值方式（在仓库根目录执行）：

  ```bash
  shasum -a 256 content/<路径>.zh.md
  ```

* 若译文必须大量引用中文原文（例如整段引文），在元数据里加 `allow_cjk: true`，
  否则检查器会因中文字符占比过高而报「疑似未翻译」。默认不要加。

## 六、验收

译完之后在仓库根目录跑：

```bash
make gen        # 生成 docs/ 与导航
uv run python tools/i18n_check.py
```

检查器会逐页比对：

* **结构**：标题层级、表格行数、提示框数、卡片数、代码块数、图片数、链接目标
  ——必须与原文一致；
* **指纹**：`source_sha256` 必须等于当前原文的 sha256，否则报「已过期」；
* **语言**：正文中文字符占比超过 8% 会报「疑似未翻译」。

目标是把该页从「待翻译」变成「已同步」。**报告里任何一条关于你负责页面的
告警都要修掉**，不要留给下一个人。

## 七、常见错误

1. 把 `../assets/...` 链接改成了 `assets/...` —— 不要动链接目标。
2. 少译一行表格 —— 检查器会报「表格行数对不上」。
3. 把两个短段落合并成一段 —— 结构对不上。
4. 忘了 `source_sha256` —— 报「未记录指纹」。
5. 为了压 CJK 比例把逐字引文译掉 —— 见第四之二节。该加 `allow_cjk` 就加。
5. 擅自补写原文没有的日期、人数、金额 —— 这是这座站点最忌讳的事。
