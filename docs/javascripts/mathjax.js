// MathJax 配置：配合 pymdownx.arithmatex 的 generic 模式。
// 物理社的文档里会出现公式，所以这里必须显式配置，
// 否则 arithmatex 输出的 \( \) 与 \[ \] 不会被渲染。
window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex",
  },
};

document$.subscribe(() => {
  MathJax.startup.output.clearCache();
  MathJax.typesetClear();
  MathJax.texReset();
  MathJax.typesetPromise();
});
