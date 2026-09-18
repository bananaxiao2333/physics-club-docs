# 自由曾在此 · 构建流程
#
#   content/   唯一手写层：story/index.zh.md、story/index.en.md
#   docs/      构建层：.md 由 tools/docsgen.py 生成，assets/ 等仍是手写的
#
#   make gen     从 content/ 生成 docs/，并从文件树重新生成导航
#   make check   翻译度检查：漏翻 / 过期 / 译文结构对不上，产出 agent 可读报告
#   make build   生成 → 构建站点 → 翻译度检查
#   make serve   本地预览 http://127.0.0.1:8000
#   make sync    为缺失的译文建立骨架，然后重新生成

UV ?= uv

.PHONY: gen docs nav check build serve sync clean

gen: docs nav

docs:
	$(UV) run python tools/docsgen.py

nav: docs
	$(UV) run python tools/navgen.py

check:
	$(UV) run python tools/i18n_check.py

# 与 .github/workflows/docs.yml 用同一条命令：本地过得去就等于 CI 过得去。
# ⚠️ --clean 会清空 site/，所以 serve 还开着的时候不要跑这个目标。
build: gen
	$(UV) run zensical build --clean --strict
	$(UV) run python tools/i18n_check.py

serve: gen
	$(UV) run zensical serve -a 127.0.0.1:8000

sync:
	$(UV) run python tools/i18n_check.py --sync
	$(MAKE) gen

clean:
	rm -rf site
