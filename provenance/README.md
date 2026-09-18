# provenance/ —— 原始件（不出现在站点里）

这里放的是**实现层面的原始件**，不是内容：落地页两张样式表在主题化转换之前的原件。

| 文件 | 说明 |
| --- | --- |
| `style.css` | 原站落地页样式表原件。现行版在 `docs/assets/landing/style.css`，已把写死的深色配色改写成 Material 主题变量 |
| `exhibition.css` | 同上，对应 `docs/assets/landing/exhibition.css` |

**为什么放在这里而不是 `docs/` 下：** 放在 `docs/` 下的任何东西都会被原样发布到站点，
而这两份文件没有任何页面引用，等于给每个访客白送 35KB。放在仓库根下既留下了
「改写前的样子」这条线索，又不进发布产物。

内容层面的一手材料另有一套：`docs/assets/originals/`（社牌、海报、PPT 逐页图、PDF），
那是有意发布的。参见 README 的「资源说明」。
