const clampBlend=v=>Math.max(0,Math.min(1,v));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
// 落地页没有自己的页眉与移动端菜单了——一律用 Material 的页眉，
// 所以原先那套 .menu-toggle / nav.open / Escape 收起菜单的逻辑已随之删除。
const story=document.querySelector('.scroll-story'),frame=document.querySelector('.expanding-frame'),caption=document.querySelector('.stage-caption');
const scenes=(()=>{const n=document.querySelector('script[type="application/json"][data-scene-captions]');if(!n)return [];try{return JSON.parse(n.textContent)||[]}catch{return []}})();
/* 序章底下那三条轨道。它一直看着像可以左右拖的进度条，却完全点不动——
   正确做法不是把轨道画得更不像控件，而是让它真的能用：每条都是 <button>，
   点击跳到那一幕，键盘的 ←/→、Home/End 在组内移动并同样生效。
   命中区靠 CSS 的 ::after 撑到 24px，可见的仍是那条 2px 的轨。 */
const sceneDots=[...document.querySelectorAll('.scene-rail [data-scene-index]')];
// 每一幕的停留范围是 p<.38 / <.7 / 其余，取各自中点作为跳转落点。
const sceneTargets=[.19,.54,.85];
function seekScene(i){if(!story)return;const y=scrollY+story.getBoundingClientRect().top+(story.offsetHeight-innerHeight)*sceneTargets[i];window.scrollTo({top:y,behavior:reduced.matches?'auto':'smooth'});}
sceneDots.forEach((button,i)=>{button.addEventListener('click',()=>seekScene(i));button.addEventListener('keydown',e=>{const last=sceneDots.length-1;const next=e.key==='ArrowRight'?Math.min(last,i+1):e.key==='ArrowLeft'?Math.max(0,i-1):e.key==='Home'?0:e.key==='End'?last:undefined;if(next===undefined||next===i)return;e.preventDefault();seekScene(next);sceneDots[next].focus();});});
let current=-1,queued=false;
function update(){queued=false;const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.reading-progress').style.width=(max>0?scrollY/max*100:0)+'%';if(!story||reduced.matches)return;const r=story.getBoundingClientRect();const p=Math.max(0,Math.min(1,-r.top/(r.height-innerHeight)));const expand=Math.min(1,p/.22);const edge=innerWidth<=720?7:14;frame.style.left=frame.style.right=(edge*(1-expand))+'%';frame.style.top=10*(1-expand)+'%';frame.style.bottom=14*(1-expand)+'%';frame.style.setProperty('--frame-radius',18*(1-expand)+'px');document.querySelectorAll('.scene-image').forEach((img,i)=>{let alpha=i===0?1-clampBlend((p-.32)/.1):i===1?clampBlend((p-.32)/.1)*(1-clampBlend((p-.65)/.1)):clampBlend((p-.65)/.1);img.style.opacity=alpha;img.style.transform='scale('+(1.06-.06*expand)+')';});caption.style.opacity=Math.max(0,Math.min(1,(p-.04)*7));caption.style.transform=`translateY(${(1-expand)*20}px)`;const index=p<.38?0:p<.7?1:2;if(index!==current){current=index;document.querySelectorAll('.scene-image').forEach((el,i)=>el.classList.toggle('active',i===index));sceneDots.forEach((el,i)=>el.setAttribute('aria-current',String(i===index)));caption.querySelector('.eyebrow').textContent=scenes[index][0];caption.querySelector('h2').innerHTML=scenes[index][1];caption.querySelector('p').textContent=scenes[index][2];document.querySelector('.scene-counter').textContent=`0${index+1} / 03`;}}
function requestUpdate(){if(!queued){queued=true;requestAnimationFrame(update);}}addEventListener('scroll',requestUpdate,{passive:true});addEventListener('resize',requestUpdate);reduced.addEventListener('change',()=>location.reload());update();
if(!reduced.matches&&'IntersectionObserver'in window){document.documentElement.classList.add('js-motion');const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.manifesto,.chapter').forEach(el=>{el.classList.add('reveal');io.observe(el);});}
// Locally rendered blue silk. No external animation or image requests.
const silkTargets=[...document.querySelectorAll('.opening,.closing')];
const vertex='attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';
const fragment=`precision mediump float;
uniform vec2 resolution;uniform float time;
float noise(vec2 p){return sin(p.x*1.34+sin(p.y*1.91))*.5+sin(p.y*1.73+cos(p.x*.93))*.5;}
void main(){vec2 uv=gl_FragCoord.xy/resolution;vec2 p=uv*vec2(resolution.x/resolution.y,1.);float t=time*.16;
float bend=noise(p*1.5+vec2(t*.18,-t*.25));float fold=p.x*3.8+p.y*2.3+bend*1.4+t;
float a=sin(fold*3.+sin(p.y*4.-t)*.85);float b=sin(fold*3.+.65+sin(p.y*4.-t)*.85);
float soft=pow(max(0.,a*.5+.5),3.);float edge=pow(max(0.,b*.5+.5),17.);
float lighting=.4+.6*smoothstep(-.4,1.,noise(p*.7+vec2(t*.12,0.)));
vec3 col=vec3(.018,.044,.083)+vec3(.025,.15,.29)*soft*lighting+vec3(.12,.4,.59)*edge*lighting*.4;
col*=.66+.34*sin(uv.x*3.14159);gl_FragColor=vec4(col,1.);}`;
let motionPaused=reduced.matches;const silk=[];
for(const target of silkTargets){const canvas=document.createElement('canvas');canvas.className='silk-canvas';canvas.setAttribute('aria-hidden','true');target.prepend(canvas);const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl){target.classList.add('silk-fallback');canvas.remove();continue;}try{const compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Shader unavailable');return s;};const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Program unavailable');gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);silk.push({canvas,gl,program,res:gl.getUniformLocation(program,'resolution'),clock:gl.getUniformLocation(program,'time'),target,visible:true});}catch{canvas.remove();target.classList.add('silk-fallback');}}
const visibility=new IntersectionObserver(entries=>entries.forEach(entry=>{const item=silk.find(s=>s.target===entry.target);if(item)item.visible=entry.isIntersecting;}));silk.forEach(s=>visibility.observe(s.target));
let lastTime=0,elapsed=0,raf=0;
function drawSilk(now,force=false){if(document.hidden&&!force)return;const delta=lastTime?Math.min(now-lastTime,80):0;lastTime=now;if(!motionPaused)elapsed+=delta/1000;silk.forEach(s=>{if(!s.visible&&!force)return;const width=Math.max(1,Math.round(s.target.clientWidth*.65)),height=Math.max(1,Math.round(s.target.clientHeight*.65));if(s.canvas.width!==width||s.canvas.height!==height){s.canvas.width=width;s.canvas.height=height;s.gl.viewport(0,0,width,height);}s.gl.useProgram(s.program);s.gl.uniform2f(s.res,width,height);s.gl.uniform1f(s.clock,elapsed);s.gl.drawArrays(s.gl.TRIANGLES,0,6);});}
let lastFrame=0;function animateSilk(now){if(now-lastFrame>32){drawSilk(now);lastFrame=now;}if(!motionPaused&&!document.hidden)raf=requestAnimationFrame(animateSilk);}
drawSilk(performance.now(),true);if(!motionPaused)raf=requestAnimationFrame(animateSilk);
document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);lastTime=0;if(!document.hidden&&!motionPaused)raf=requestAnimationFrame(animateSilk);});addEventListener('resize',()=>{if(motionPaused)drawSilk(performance.now(),true);});

// 首页标签栏：滚下来才滑出，回到顶部再收起。
// 主题把 tabs 排在 hero 之后，落地页整页都在 hero 里，标签栏因此原本落在
// 15000px 之外——读者滚完首页也不知道这个站有十个分区。这里按滚动位置揭开它。
// 窄屏不做：那里靠页眉的抽屉进导航（CSS 里 .landing-tabs 直接 display:none）。
const landingTabs=document.querySelector('[data-landing-tabs]');
if(landingTabs){
  // 宽度每次判断，不只在加载时判断一次——窗口是可以中途变宽变窄的。
  // 窄屏另有 CSS 的 display:none 兜着，多设一个 data-visible 也不会露出来。
  const wide=matchMedia('(min-width: 60em)');
  const syncTabs=()=>{landingTabs.toggleAttribute('data-visible',wide.matches&&scrollY>innerHeight*.7);};
  addEventListener('scroll',syncTabs,{passive:true});
  wide.addEventListener('change',syncTabs);syncTabs();
}

// ── 滚动吸附：停手后收拢到最近的落点 ──────────────────────────────
// 页面上只有四幕原档写了 scroll-snap-align:start，而页面从来没有
// scroll-snap-type——那一条一直空转（原站也是），所以「吸附约等于没有」。
// 不用 CSS 的 scroll-snap-type：它一停手就吸附，人还在读就把画面拽走。
//
// 落点 = 每个区块的顶部；滚动驱动的区段另算——序章三幕、原稿叠层四页、
// 环形展台八件、逐字展开两页，各自取分段中点或等分点，因此相邻落点很近，
// 一次吸附最多挪大半屏，不会把人甩到别处去。
//
// 手感按「跟手」来定（Apple《Designing Fluid Interfaces》的几条）：
//   · 延迟要短。停手后先等一秒再动，是输入路径上的纯延迟——直接感就是
//     在这一类等待里掉下去的。这里 220ms 起步（触控板的惯性本身还要
//     再走一段，所以体感上紧接着就动）。
//   · 收拢由自己驱动，时长随距离 160–320ms、ease-out，不用
//     behavior:'smooth'——它的时长随距离线性增长，远距离能拖过半秒。
//   · 随时可打断：任何真实输入（滚轮、触摸、按键、指针）立刻停手，
//     把控制权交还用户，绝不在动画期间屏蔽输入。
//   · 每次都从当前的 scrollY 起步，不从上次记下的目标值起步，
//     所以被打断后再收拢不会跳。
// prefers-reduced-motion 下整个不启用：自动滚动属于用户没有要求的运动。
const SNAP_RATIOS=[['.scroll-story',[.19,.54,.85]],['.word-scroll',[0,1]]];
function snapBeats(){
  const max=Math.max(0,document.documentElement.scrollHeight-innerHeight),beats=[];
  const add=y=>{if(y>=0&&y<=max)beats.push(y);};
  // 减去页眉高度：区块顶部要停在新版页眉的下沿，而不是被页眉盖住。
  const header=document.querySelector('.md-header');
  const offset=header?header.offsetHeight:0;
  for(const el of document.querySelectorAll('#main > section')){
    const top=scrollY+el.getBoundingClientRect().top-offset,span=Math.max(0,el.offsetHeight-innerHeight);
    const rule=SNAP_RATIOS.find(([sel])=>el.matches(sel));
    if(rule){rule[1].forEach(r=>add(top+span*r));continue;}
    const cards=el.querySelectorAll('.orbit-card,.stack-card').length;
    if(cards>1){for(let i=0;i<cards;i++)add(top+span*i/(cards-1));}
    else add(top);
  }
  return beats;
}
const SNAP_IDLE=220;
let snapTimer=0,snapRaf=0,gliding=false;
function stopGlide(){if(snapRaf){cancelAnimationFrame(snapRaf);snapRaf=0;}gliding=false;}
function glideTo(target){
  const start=scrollY,delta=target-start;
  if(Math.abs(delta)<1)return;
  const duration=Math.max(160,Math.min(320,160+Math.abs(delta)*.25)),t0=performance.now();
  gliding=true;
  const step=now=>{
    const p=Math.min(1,(now-t0)/duration),eased=1-Math.pow(1-p,3);
    // behavior:'instant' 不能省：页面设了 scroll-behavior:smooth，
    // 两参数写法会被那条规则接管，变成一段时长不可控的动画。
    window.scrollTo({top:start+delta*eased,behavior:'instant'});
    snapRaf=p<1?requestAnimationFrame(step):0;
    if(p>=1)gliding=false;
  };
  snapRaf=requestAnimationFrame(step);
}
function settle(){
  const y=scrollY;let best=null,bestD=Infinity;
  for(const b of snapBeats()){const d=Math.abs(b-y);if(d<bestD){bestD=d;best=b;}}
  if(best===null||bestD<6)return;             // 已经落在落点上，不动
  glideTo(best);
}
// 任何真实输入都立刻中断收拢——动画期间绝不扣住输入。
for(const type of ['wheel','touchstart','pointerdown','keydown'])addEventListener(type,()=>{stopGlide();clearTimeout(snapTimer);},{passive:true});
addEventListener('scroll',e=>{
  // 嵌套滚动容器不该牵动整页；自己驱动的收拢也不该给自己排下一轮。
  if(e.target!==document&&e.target!==document.scrollingElement)return;
  if(gliding)return;
  clearTimeout(snapTimer);
  if(reduced.matches)return;
  snapTimer=setTimeout(settle,SNAP_IDLE);
},{passive:true});
