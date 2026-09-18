# 自由曾在此 · 文档站

ASJ 英东物理社数字纪念馆 —— 以 **Zensical** 为基层、以**文档站**为中心重构的站点。

原线上站（<https://pm.079682.xyz/>）是手写的 7 页沉浸式单页站；本项目把它重构为一套
内容可维护、结构可导航、可自动构建部署的文档站。

## 技术栈

| 项 | 选型 |
| --- | --- |
| 静态站点生成器 | [Zensical](https://zensical.org/) |
| 依赖管理 | [uv](https://docs.astral.sh/uv/) |
| 内容格式 | Markdown + `zensical.toml` |
| 主题 | Zensical `modern`（浅色 `default` / 深色 `slate`） |
| 公式 | MathJax 3（`pymdownx.arithmatex` generic 模式） |

## 快速开始

```bash
# 安装依赖（uv 会按 uv.lock 建好 .venv）
uv sync

# 本地预览（默认 http://localhost:8000，支持热重载）
uv run zensical serve

# 指定地址
uv run zensical serve -a 127.0.0.1:8000

# 生产构建，产物在 site/
uv run zensical build

# 新增依赖
uv add <package>
```

!!! 注意
    `zensical build -s/--strict` 在 0.0.62 尚不支持，构建请直接看 stderr 的 `Warning` 输出。

## 目录结构

```
physics-club-docs/
├── zensical.toml            # 站点配置：身份、导航、主题、Markdown 扩展
├── pyproject.toml           # Python 依赖声明（uv）
├── uv.lock                  # 锁定版本
├── docs/                    # 内容根目录（docs_dir）
│   ├── index.md             # 序章
│   ├── story/               # 社团故事
│   ├── flight/              # 飞行计划
│   ├── gatherings/          # 集会原稿
│   ├── design/              # 设计原档
│   ├── archive/             # 影像档案
│   ├── governance/          # 制度与名单
│   ├── thanks/              # 致谢与后记
│   ├── stylesheets/extra.css
│   ├── javascripts/mathjax.js
│   └── assets/              # 图片、PDF、SVG、视频等原件
└── site/                    # 构建产物（已 gitignore）
```

## 站点信息架构

导航对应原站的 7 个章节，另增「制度与名单」「功勋系统」「资料出处」承载后期文档化内容：

| # | 章节 | 说明 |
| --- | --- | --- |
| 01 | 序章 | 纪念馆入口与记述原则 |
| 02 | 社团故事 | 理念、时间线、五篇正文 |
| 03 | 飞行计划 | A4 纸飞行节总览与执行流程 |
| 04 | 影像档案 | 留存照片，按场景归类 |
| 05 | 设计原档 | 社牌、组别标识、SVG 模板 |
| 06 | 集会原稿 | 04.21 / 04.27 / 05.12 三份演示文稿 |
| 07 | 制度与名单 | 会费与贡献积分、组织架构与 85 人分组名单 |
| 08 | 功勋系统 | 资金流转模型、术语表、白皮书谱系与公开边界 |
| 09 | 资料出处 | 逐份原始件清单与编后说明 |
| 10 | 致谢与后记 | 致谢名单与资料编后说明 |

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

新增页面后，记得在 `zensical.toml` 的 `nav` 中登记，否则会从导航树中漏掉。

## 引用锚点

中文标题自动生成的锚点是 `_1`、`_2` 这类不稳定值。
**需要被跨页引用的标题请显式声明锚点**：

```markdown
## 准备物料 { #materials }
```

然后以 `runbook.md#materials` 引用。

## 资源说明

`docs/assets/` 下的图片、PDF、SVG 与视频均来自社团留存资料，已针对网页浏览做过尺寸与格式优化。
`docs/assets/originals/` 保留的是原始导出件（社牌、海报、PPT 逐页图、PDF）。

## 部署

`uv run zensical build` 产出的 `site/` 目录是纯静态文件，可直接部署到任意静态托管。
仓库内已含 `.github/workflows/docs.yml`，推送到 `main` 后由 GitHub Actions 自动构建并发布到 Pages。
