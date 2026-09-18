# 自由曾在此 · 文档站

ASJ 英东物理社数字纪念馆 —— 以 **Zensical** 为基层、以**文档站**为中心重构的站点。

原线上站（<https://pm.079682.xyz/>）是手写的沉浸式单页站；本项目把它重构为一套
内容可维护、结构可导航、可自动构建部署、中英双语的文档站。

---

## 技术栈

| 项 | 选型 |
| --- | --- |
| 静态站点生成器 | [Zensical](https://zensical.org/) 0.0.62 |
| 依赖管理 | [uv](https://docs.astral.sh/uv/) |
| 内容格式 | Markdown（YAML 前置元数据）+ `zensical.toml` |
| 主题 | Zensical `modern`（浅色 `default` / 深色 `slate`） |
| 公式 | MathJax 3（`pymdownx.arithmatex` generic 模式） |
| 语言 | 中文（默认，`/`）与英文（`/en/`） |

## 快速开始

```bash
uv sync                 # 按 uv.lock 建好 .venv

make serve              # 生成内容树 → 本地预览 http://127.0.0.1:8000
make build              # 生成 → 构建 → 翻译度检查
make check              # 只跑翻译度检查
make gen                # 只重新生成 docs/ 与导航
```

`uv run zensical build` 单独执行也能出站，但**不会**先从 `content/` 生成 `docs/`；
日常请用 `make`。`zensical build -s/--strict` 在 0.0.62 尚不支持。

---

## 分层：手写层与构建层

这是本项目最需要先理解的一件事。

```
content/          ← 唯一手写层。文件名带语言后缀
  index.zh.md         story/egg-drop.zh.md
  index.en.md         story/egg-drop.en.md
        │
        │  tools/docsgen.py
        ▼
docs/             ← 构建层。.md 是生成物；assets/ 等仍是手写的
  index.md            story/egg-drop.md         ← 中文
  en/index.md         en/story/egg-drop.md      ← 英文
```

**同名不同语言后缀的两个文件是同一篇的两个语种。** 产物路径规则：

| 源文件 | 产物 | 网址 |
| --- | --- | --- |
| `content/story/index.zh.md` | `docs/story/index.md` | `/story/` |
| `content/story/index.en.md` | `docs/en/story/index.md` | `/en/story/` |

语言后缀只认**裸语言码**（`zh` / `en`），不用 `zh-CN`、`zh-HK`、`zh-TW` 这类地区标签。

### 为什么要有这一层

Zensical 没有 i18n 插件，也没有按语言分导航的机制（官方[语言文档](https://github.com/zensical/docs/blob/master/docs/setup/language.md)
只提供 `extra.alternate`）。同时：

- Zensical **不支持文件名语言后缀**——实测 `index.zh.md` 会被当成页面名，
  产出 `/index.zh/` 而不是 `/story/`；
- `config.nav`、`config.site_name`、`config.theme.language` 都是**全站唯一**的。

所以命名约定与构建产物分开：命名按 `name.lang.md` 写，产物按 Zensical 能吃的
目录结构生成。这层生成同时解决了共享资产的问题（见下）。

### 不要手改 `docs/` 下的 `.md`

每个生成的 Markdown 在前置元数据里带一行 `# ⚠️ 由 tools/docsgen.py 从 … 生成`。
改了会在下次 `make gen` 时被覆盖。**要改内容请改 `content/`。**

`docs/assets/`、`docs/stylesheets/`、`docs/javascripts/`、`docs/*.html`（旧的扁平
URL 跳转桩）都是手写的，生成器不碰。

### 共享资产

图片只有一份，放在 `docs/assets/`，两种语言共用。`content/` 里的相对链接按
**内容根**解析，落点在 `assets/` 之下就判定为共享资产；英文产物比中文深一层，
生成器会自动多补一个 `../`：

| 源（`content/story/index.zh.md`） | 中文产物 | 英文产物 |
| --- | --- | --- |
| `../assets/x.jpg` | `../assets/x.jpg` | `../../assets/x.jpg` |

其余相对链接指向的是**镜像页面**（两棵树结构一致），原样保留即可。

---

## 工具

| 工具 | 作用 |
| --- | --- |
| `tools/docsgen.py` | 从 `content/` 生成 `docs/`；改写共享资产路径；清理失效产物（`.docsgen.json` 记manifest） |
| `tools/navgen.py` | 从文件树生成各目录的 `.nav.yml` |
| `tools/i18n_check.py` | 翻译度检查，产出 `i18n-report.json` / `i18n-report.md` |

三个工具都支持 `--check` / `--quiet` 之类的只读模式，可以挂到 CI 上。

### 导航从文件树生成

**导航不手写。** 一个目录的导航元数据就写在它自己的 `index.md` 前置元数据里：

```yaml
---
nav_label: "社团故事"        # 在上一级导航里显示的名字（缺省用 title）
title: 社团故事 · 概览        # 页面标题
nav: ["egg-drop", "ipc-2026", "gathering-0421", "festival-0430", "suspension-0529"]
---
```

- `nav` 按名字列出该目录的子项顺序；未列出的按文件名排在末尾并给出告警；
- 子项是目录时写目录名，是文件时写去掉 `.md` 的文件名；
- 英文树同理，元数据写在 `content/**/index.en.md` 里。

`tools/navgen.py` 读取这棵生成出来的 `docs/` 树，为每个目录写一个 `.nav.yml`。
**`.nav.yml` 是生成物，不要手改。**

### 翻译度检查器

```bash
uv run python tools/i18n_check.py          # 检查，有活要干时退出码非零
uv run python tools/i18n_check.py --sync   # 为缺失的译文建立骨架
```

它做三件事：

1. **漏翻** —— 中文有的篇目，英文有没有；
2. **过期** —— 译文是不是照着当前的中文版翻的。译文在前置元数据里记
   `source_sha256: <原文 sha256>`，原文一改指纹就对不上，自动标为 `stale`，
   不需要人工维护清单；
3. **结构对不上** —— 标题层级、表格行数、提示框数、卡片数、代码块数、图片数、
   链接目标是否与原文一一对应。漏一段、少一行表格，光看字符数是看不出来的。

另外会检查正文的中文字符占比（超过 8% 报「疑似未翻译」，可在前置元数据里用
`allow_cjk: true` 豁免），以及英文页的 `title` / `description` 是否补上。

产出的 `i18n-report.md` 是一张表，每条待办都写清了「读哪个文件、写到哪个文件、
把 `source_sha256` 设成什么」，可以直接交给 agent 执行。落地页那一对模板
（`overrides/partials/landing.html` ↔ `landing.en.html`）也在同一套机制里。

写作规范见 [`TRANSLATION-GUIDE.md`](TRANSLATION-GUIDE.md)。

---

## 模板覆盖

`overrides/` 下每一个文件都是在主题原版基础上做最小改动，文件头都标明了
「主题升级时需同步」。

| 文件 | 为什么需要 |
| --- | --- |
| `main.html` | 注入落地页（中英各一份）、分语言的 `<title>` 与站点 meta、接管首页容器 |
| `partials/landing.html` / `landing.en.html` | 落地页正文，两份逐标签同构 |
| `partials/language.html` | **界面文案按页面选语言包**（连 `<html lang>` 都跟着走） |
| `partials/nav.html` | 按语言过滤主导航 |
| `partials/header.html` | 页眉里的站名与徽标落点分语言 |
| `partials/logo.html` | 徽标的 alt 分语言 |
| `partials/footer.html` | 三段式纪念页脚（分语言）+ 上一页/下一页**不跨语言** |
| `partials/alternate.html` | 语言切换器指向**对应页**而非语言首页 |
| `partials/palette.html` | 深浅色切换按钮的提示文案分语言 |
| `partials/path.html` | 面包屑分语言：根指向 `/en/`，并去掉语言分区那一层 |

## 多语言

| 机制 | 位置 |
| --- | --- |
| 语言声明与页眉语言选择器 | `zensical.toml` 的 `[[project.extra.alternate]]` |
| 内容分语言 | `content/**/name.zh.md` 与 `name.en.md` |
| 界面文案分语言 | `overrides/partials/language.html` |
| 站名 / 版权分语言 | `zensical.toml` 的 `[project.extra]` |
| 主导航分语言 | `overrides/partials/nav.html` |
| 语言切换器指向对应页 | `overrides/partials/alternate.html` |
| 落地页分语言 | `overrides/main.html` + `partials/landing.html` / `landing.en.html` |

几个实现要点：

- **界面文案按页面选语言包。** 主题 `base.html` 用
  `{% raw %}{% import "partials/language.html" as lang with context %}{% endraw %}`
  取文案，所以覆盖这一个文件就够——连 `<html lang>` 都会跟着页面走
  （主题里写的是 `<html lang="{{ lang.t('language') }}">`）。
  语言包回退链保持主题原样：当前语言包 → 英文包 → 键名本身。
- **主导航按语言过滤。** `nav.html` 里同一棵树同时挂着中文与英文分区
  （根 `.nav.yml` 末尾一项是 `English: en`），模板按 `page.url` 前缀只渲染其中一支；
  英文页直接铺开英文分区的子项，不显示「English」这一层。
- **语言切换器指向对应页**而不是语言首页：两棵树结构镜像，把路径换个前缀即可。
- **站名与版权是全站唯一的配置**，所以英文版放在 `[project.extra]` 里由模板取用。

!!! 注意
    MiniJinja 没有字符串的 `startswith`。判断语言用切片：
    `{% raw %}{% set is_en = (page.url | default("", true))[:3] == "en/" %}{% endraw %}`

---

## 主题与落地页

**站点主体使用 Material 默认主题**：浅色优先、跟随系统、无衬线字体。

**落地页**（`/` 与 `/en/`）通过 `overrides/main.html` 注入原站的沉浸式内容，
但**沿用文档站的页眉、导航、页脚与配色**——落地页自带的 header/footer 已移除。
两份落地页 partial 标签结构逐一致，只有文案与资源路径不同；资源路径走
`{{ 'assets/…' | url }}` 过滤器，因此在任意深度都能解析正确。

融合方式见 `docs/stylesheets/landing.css`，它做四件事：

1. 把落地页的设计令牌 `--ink / --paper / --accent / --muted / --line` 映射到
   `--md-*` 主题变量，落地页因此跟随深浅色切换；
2. 字体统一为文档站的无衬线栈（取消原站的宋体标题）；
3. 抹掉主题在落地页残留的布局约束；
4. **反相区域单独处理**（见下）。

### 配色与对比度的几处修正

站点保留 Material 默认配色，只做了必要的无障碍修正，全部集中且带注释：

- **强调色按色调各调一档**（`stylesheets/extra.css`）。Material 默认的
  `#526cfe` 对白底只有 4.26:1、对导航当前项底色 3.76:1，不够正文使用；
  浅色改 `#4358d0`（5.92:1），深色改 `#8291f5`（6.82:1），色相与饱和度不变。
- **反相区域自己管文字色**（`stylesheets/landing.css`）。落地页有两类底色与页面
  相反的区块：绸面段落（WebGL 深蓝画布，两种色调下都是深底）与反相卡片
  （底色就是 `--md-default-fg-color`）。它们整组替换前景色令牌，否则会出现
  浅色模式下深字压深底、深色模式下浅字压浅底。
- **标题色收进 `--heading` 令牌**。Material 的 slate 配色有一条全局规则
  `[data-md-color-scheme="slate"] h1…h6 { color: 纯白 }`，会击穿反相区域里的标题。
- **影像段落的遮罩加厚**。幕字压在亮度不可控的照片上，底部渐变要在纯白照片上
  也达到 4.5:1，遮罩 alpha 需 ≥ .55。

!!! 注意
    自定义属性里的 `var()` 是在**声明它的元素**处完成替换的，之后原样继承。
    声明在 `:root` 上，`--md-default-fg-color--light` 取到的永远是浅色值，
    深色模式下不会更新。所以令牌要声明在 `[data-md-color-scheme]`（即 `body`）上。

---

## 目录结构

```
physics-club-docs/
├── zensical.toml            # 站点配置：身份、主题、插件、Markdown 扩展
├── Makefile                 # 构建流程
├── TRANSLATION-GUIDE.md     # 中英翻译规范（语气、术语表、结构要求、验收）
├── content/                 # 手写层：index.zh.md / index.en.md
│   ├── index.*.md           #   序章（正文由落地页承载）
│   ├── story/               #   社团故事：概览 + 五篇正文
│   ├── flight/              #   飞行计划：总览 / 执行流程 / 采购与物料
│   ├── gatherings/          #   集会原稿：概览 + 三份逐页实录
│   ├── design/              #   设计原档
│   ├── archive/             #   影像档案
│   ├── governance/          #   制度与名单：会费与贡献积分 / 组织架构
│   ├── merit/               #   功勋系统：概览 / 规则全文 / 模型 / 术语 / 边界
│   ├── sources/             #   资料出处
│   └── thanks/              #   致谢与后记
├── docs/                    # 构建层（.md 为生成物）
│   ├── assets/              #   手写：图片、原站落地页 CSS/JS、下载文档
│   ├── stylesheets/         #   手写：extra.css（站点微调）/ landing.css（落地页适配）
│   ├── javascripts/         #   手写：mathjax.js
│   └── *.html               #   手写：旧扁平 URL 的跳转桩
├── overrides/               # 主题模板覆盖（custom_dir）
│   ├── main.html            #   落地页注入、<title>、容器接管
│   └── partials/            #   见下表「模板覆盖」
├── tools/                   # docsgen / navgen / i18n_check
└── site/                    # 构建产物（已 gitignore）
```

---

## 插件与扩展

| 插件 | 作用 |
| --- | --- |
| `awesome-nav` | 读取各目录的 `.nav.yml`（生成物） |
| `glightbox` | 图片灯箱：原档与照片点击放大 |
| `minify` | 构建产物压缩 |

`search` 默认启用。

!!! 注意
    Zensical 会**静默丢弃**不认识的插件名（见 `config.py` 的
    `_PLUGIN_UNSUPPORTED_OPTIONS`），写错插件名不会报错，只是无效。

## 站点信息架构

| # | 章节 | 说明 |
| --- | --- | --- |
| 01 | 序章 | 纪念站入口（沉浸式落地页） |
| 02 | 社团故事 | 理念、时间线、五篇正文 |
| 03 | 飞行计划 | 活动总览、执行流程、采购与物料 |
| 04 | 集会原稿 | 概览 + 04.21 / 04.27 / 05.12 三份逐页实录 |
| 05 | 设计原档 | 社牌参数化设计工程、组别标识、SVG 模板 |
| 06 | 影像档案 | 留存照片，按场景归类 + 原始件时间清单 |
| 07 | 制度与名单 | 会费与贡献积分、组织架构与分组名单 |
| 08 | 功勋系统 | 会员侧规则全文、资金流转模型、术语表、公开边界 |
| 09 | 资料出处 | 逐份原始件清单与编后说明 |
| 10 | 致谢与后记 | 致谢名单与资料编后说明 |

新增页面：在 `content/` 下建 `name.zh.md`，把名字加进所属目录 `index.zh.md`
的 `nav:` 列表，然后 `make gen`。

---

## 内容维护约定

**内容一律以 `资料/` 原始件为准，不使用二手转述。**

**记述原则（重要）**：本站只记录留存材料中可以确认的片段。

- 不补写未知的停摆原因与结束日期；
- 材料之间口径冲突时（时间、赛制、每组人数、金奖率），**并列保留各版本**，不合并、不推定；
- 过期设计目录中的草案**仅作草案存档**，不推定为实际发放版本；
- **不公布赛果**：三份现场表单均为空白模板，没有实际成绩记录；
- **功勋系统的公开边界**严格执行 `物理社功勋系统对话史料整理_纪念网站版.docx` 附录 C 的
  三层留存建议：公开网页 / 下载文档 / 内部档案。含后台参数与争议性措辞的三份原始件
  （`功勋制度.docx`、`稳定.docx`、`法律条文与定义.docx`）归入内部档案，**不进入本站公开内容**。

英文版必须保持同样的记述原则——翻译不是改写，见 `TRANSLATION-GUIDE.md`。

## 引用锚点

中文标题自动生成的锚点是 `_1`、`_2` 这类不稳定值。
**需要被跨页引用的标题请显式声明锚点**：

```markdown
## 准备物料 { #materials }
```

然后以 `runbook.md#materials` 引用。中英两版的锚点应保持一致。

## 资源说明

`docs/assets/` 下的图片、PDF、SVG 与视频均来自社团留存资料，已针对网页浏览做过
尺寸与格式优化。`docs/assets/originals/` 保留的是原始导出件（社牌、海报、PPT 逐页图、PDF）。
`docs/assets/landing/original/` 是落地页两张样式表**主题化转换前**的原始文件。

## 其他已知坑

- **TOML 表的作用域**：`extra_css` / `extra_javascript` / `[project.extra]` 必须写在
  任何 `[[project.*]]` 数组表**之前**，否则会被 TOML 归入那张表，配置静默失效。
- **`page.is_homepage` 在 Zensical 的模板上下文里未定义**（主题自己也依赖它为空）。
  判别首页请用 `page.url`。
- **`theme.palette.accent` 只接受 Material 的颜色名**。写十六进制会被原样塞进
  `data-md-color-accent` 属性而匹配不到任何规则，反而丢掉强调色。
- **Zensical 构建会清空 `site_dir`**，因此不能把两个语言拆成两次构建写进同一个目录。
- **`redirects` 插件**在承接旧扁平 URL（`story.html`）时会报
  `redirect output collides with a page`，因为 `/story.html` 会被规范化成
  `/story/index.html`。本站改用**静态跳转桩**：`docs/*.html` 六个 meta-refresh 文件。
- **snippets 片段文件若用 `.md` 后缀**，会被当成页面构建到 `/includes/`。需要片段时用 `.txt`。

## 部署

`make build` 产出的 `site/` 是纯静态文件，可直接部署到任意静态托管。
仓库内已含 `.github/workflows/docs.yml`，推送到 `main` 后由 GitHub Actions
自动构建并发布到 Pages。若在 CI 里做多语言校验，可以加一步
`uv run python tools/i18n_check.py`（未完成时会以非零码退出）。
