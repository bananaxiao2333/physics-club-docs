# provenance/ —— 原始件（不出现在站点里）

这里放的是**实现层面的原始件**，不是内容：落地页样式表在主题化转换之前的原件，
以及为网页性能做过转码的两个媒体的**转码前母本**。

| 文件 | 说明 |
| --- | --- |
| `style.css` | 原站落地页样式表原件。现行版在 `docs/assets/landing/style.css`，已把写死的深色配色改写成 Material 主题变量 |
| `exhibition.css` | 同上，对应 `docs/assets/landing/exhibition.css` |
| `system-demo.mp4` | 功勋系统演示录屏母本（10.35 MB，HEVC）。站点发布的是 H.264 转码（5.10 MB）：CDN 单文件上限 10 MB，而 HEVC 在 Chrome / Firefox 上多半根本播不出来 |
| `club-logo.png` | 社徽母本（1504 × 875，5.03 MB，**未压缩**存储）。站点发布的是 WebP（121 KB，q=88）与 180 × 180 的 PNG 站点图标；无损重压后的 PNG 兜底留在 `docs/assets/club-logo.png`（371 KB）供结构化数据使用 |

**为什么放在这里而不是 `docs/` 下：** 放在 `docs/` 下的任何东西都会被原样发布到站点。
样式表那两份没有任何页面引用，等于给每个访客白送 35KB；两个母本则直接超过
CDN 的单文件上限、或远超它在页面上实际需要的体积。放在仓库根下既留下了
「转码前的样子」这条线索，又不进发布产物。

内容层面的一手材料另有一套：`docs/assets/originals/`（社牌、海报、PPT 逐页图、PDF），
那是有意发布的。参见 README 的「资源说明」。
