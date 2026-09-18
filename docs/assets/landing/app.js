const clampBlend=v=>Math.max(0,Math.min(1,v));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
// 落地页没有自己的页眉与移动端菜单了——一律用 Material 的页眉，
// 所以原先那套 .menu-toggle / nav.open / Escape 收起菜单的逻辑已随之删除。
const story=document.querySelector('.scroll-story'),frame=document.querySelector('.expanding-frame'),caption=document.querySelector('.stage-caption');
const scenes=(()=>{const n=document.querySelector('script[type="application/json"][data-scene-captions]');if(!n)return [];try{return JSON.parse(n.textContent)||[]}catch{return []}})();
let current=-1,queued=false;
function update(){queued=false;const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.reading-progress').style.width=(max>0?scrollY/max*100:0)+'%';if(!story||reduced.matches)return;const r=story.getBoundingClientRect();const p=Math.max(0,Math.min(1,-r.top/(r.height-innerHeight)));const expand=Math.min(1,p/.22);const edge=innerWidth<=720?7:14;frame.style.left=frame.style.right=(edge*(1-expand))+'%';frame.style.top=10*(1-expand)+'%';frame.style.bottom=14*(1-expand)+'%';frame.style.setProperty('--frame-radius',18*(1-expand)+'px');document.querySelectorAll('.scene-image').forEach((img,i)=>{let alpha=i===0?1-clampBlend((p-.32)/.1):i===1?clampBlend((p-.32)/.1)*(1-clampBlend((p-.65)/.1)):clampBlend((p-.65)/.1);img.style.opacity=alpha;img.style.transform='scale('+(1.06-.06*expand)+')';});caption.style.opacity=Math.max(0,Math.min(1,(p-.04)*7));caption.style.transform=`translateY(${(1-expand)*20}px)`;const index=p<.38?0:p<.7?1:2;if(index!==current){current=index;document.querySelectorAll('.scene-image').forEach((el,i)=>el.classList.toggle('active',i===index));document.querySelectorAll('.scene-rail i').forEach((el,i)=>el.classList.toggle('active',i===index));caption.querySelector('.eyebrow').textContent=scenes[index][0];caption.querySelector('h2').innerHTML=scenes[index][1];caption.querySelector('p').textContent=scenes[index][2];document.querySelector('.scene-counter').textContent=`0${index+1} / 03`;}}
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
