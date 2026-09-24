(()=>{
'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const originals=document.querySelector('.original-dialog');
let opener=null;
/* 缩放按钮的两种文案由页面提供（见 overrides/partials/landing*.html 的
   data-label-zoom / data-label-fit），JS 不再写死任意一种语言。 */
const sizeBtn=originals.querySelector('.original-size');
const zoomLabel=sizeBtn.dataset.labelZoom||sizeBtn.textContent.trim();
const fitLabel=sizeBtn.dataset.labelFit||zoomLabel;
for(const link of document.querySelectorAll('[data-original]'))link.addEventListener('click',e=>{
 if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
 e.preventDefault();opener=link;
 const image=originals.querySelector('.original-dialog-image img');image.src=link.href;image.alt=link.dataset.title;
 originals.querySelector('.original-dialog-title').textContent=link.dataset.title;
 originals.querySelector('.original-file').href=link.href;
 originals.querySelector('.original-dialog-image').classList.remove('zoomed');
 sizeBtn.setAttribute('aria-pressed','false');
 sizeBtn.textContent=zoomLabel;
 originals.showModal();document.body.style.overflow='hidden';
});
originals.querySelector('.original-close').addEventListener('click',()=>originals.close());
originals.querySelector('.original-size').addEventListener('click',e=>{const zoom=originals.querySelector('.original-dialog-image').classList.toggle('zoomed');e.currentTarget.setAttribute('aria-pressed',String(zoom));e.currentTarget.textContent=zoom?fitLabel:zoomLabel;});
originals.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus({preventScroll:true});});
originals.addEventListener('click',e=>{if(e.target===originals){const r=originals.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)originals.close();}});
/* 逐字动画的切分规则：中文按字，拉丁文按词。
   原因：这些字符会被包成 display:inline-block 的 span（零宽的空格会被吞掉，
   因此整句英文会挤成一坨）；而空格本身必须留作普通文本节点，
   否则行内块之间没有换行机会，长句会溢出容器。
   中文没有词间空格，逐字包裹的行为与原来完全一致。 */
const CJK_RE=/[\u3400-\u4dbf\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/;
const WS_RE=/^\s+$/;
const tokenize=(text)=>text.match(/\s+|[^\s]+/g)||[];
const unitsOf=(token)=>CJK_RE.test(token)?[...token]:[token];
// Preserve accessible sentences while each visual character receives its own timing.
const enterObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('entered');enterObserver.unobserve(e.target);}}),{threshold:.15});
for(const el of document.querySelectorAll('[data-enter],.opening h1,.page-intro h1')){
 if(reduce.matches)continue;
 el.setAttribute('aria-label',el.textContent);let index=0;
 const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const texts=[];while(walker.nextNode())texts.push(walker.currentNode);
 for(const text of texts){const fragment=document.createDocumentFragment();for(const token of tokenize(text.textContent)){if(WS_RE.test(token)){fragment.append(document.createTextNode(token));continue;}for(const unit of unitsOf(token)){const span=document.createElement('span');span.className='enter-char';span.style.setProperty('--i',index++);span.setAttribute('aria-hidden','true');span.textContent=unit;fragment.append(span);}}text.replaceWith(fragment);}
 enterObserver.observe(el);
}
const words=[...document.querySelectorAll('[data-split]')].map(el=>{el.setAttribute('aria-label',el.textContent);const text=el.textContent;el.textContent='';for(const token of tokenize(text)){if(WS_RE.test(token)){el.append(document.createTextNode(token));continue;}for(const unit of unitsOf(token)){const span=document.createElement('span');span.className='char';span.setAttribute('aria-hidden','true');span.textContent=unit;el.append(span);}}return {el,section:el.closest('.word-scroll'),chars:[...el.children]};});
const orbitData=[...document.querySelectorAll('.orbit-scroll')].map(section=>({section,stage:section.querySelector('.orbit-stage'),ring:section.querySelector('.orbit-ring'),cards:[...section.querySelectorAll('.orbit-card')],index:-1,progress:0}));
/* 四幕原档。原先它是一只自带吸附的内层滚动盒（overflow:auto + scroll-snap），
   要先把指针移进盒子里滚——和页面滚动是两套动作，读者只会以为「滚不动」。
   现在改成与「一页，一页，留下来」同一套：整段拉高、舞台吸顶、由页面滚动
   推动四幕依次上移。底部那条四格切换栏已按使用反馈删除，四幕只由页面滚动
   推进；随滚动把当前幕之外的链接移出 Tab 顺序（与叠层那一段同一处理）。 */
const snapShows=[...document.querySelectorAll('.snap-shell')].map(section=>({section,cards:[...section.querySelectorAll('.snap-scene')]}));
const stacks=[...document.querySelectorAll('.stack-scroll')].map(section=>({section,cards:[...section.querySelectorAll('.stack-card')],dots:[...section.querySelectorAll('.stack-track [data-stack-index]')]}));
function sectionProgress(section){const r=section.getBoundingClientRect();return clamp(-r.top/Math.max(1,r.height-innerHeight));}
function layoutOrbits(){for(const o of orbitData){const width=Math.min(innerWidth*.44,innerHeight*.245,255);const height=width*1.444;const radius=width/(2*Math.tan(Math.PI/o.cards.length))+36;o.ring.style.setProperty('--card-width',width+'px');o.ring.style.setProperty('--card-height',height+'px');o.ring.style.setProperty('--radius',radius+'px');}}
/* 分组控件：点击生效，←/→、Home/End 在组内移动并同样生效。
   页面上那几条「分段轨道」以前只是装饰——看着像可以左右拖的进度条却点不动，
   既然做成了控件的样子，就让它真的能当控件用。 */
function groupNav(buttons,activate){buttons.forEach((button,i)=>{button.addEventListener('click',()=>activate(i));button.addEventListener('keydown',e=>{const last=buttons.length-1;const next=e.key==='ArrowRight'?Math.min(last,i+1):e.key==='ArrowLeft'?Math.max(0,i-1):e.key==='Home'?0:e.key==='End'?last:undefined;if(next===undefined||next===i)return;e.preventDefault();activate(next);buttons[next].focus();});});}
function seekTo(section,ratio){const y=scrollY+section.getBoundingClientRect().top;window.scrollTo({top:y+(section.offsetHeight-innerHeight)*ratio,behavior:reduce.matches?'auto':'smooth'});}
function seekOrbit(o,index){index=clamp(index,0,o.cards.length-1);seekTo(o.section,index/(o.cards.length-1));}
for(const o of orbitData){o.section.querySelector('.orbit-prev').addEventListener('click',()=>seekOrbit(o,Math.max(0,o.index-1)));o.section.querySelector('.orbit-next').addEventListener('click',()=>seekOrbit(o,Math.min(o.cards.length-1,o.index+1)));}
for(const s of stacks)groupNav(s.dots,i=>seekTo(s.section,i/(s.cards.length-1)));
let scheduled=false;
function update(){scheduled=false;if(reduce.matches)return;
 for(const w of words){const p=sectionProgress(w.section);const count=w.chars.length;w.chars.forEach((char,i)=>{const local=clamp((p*1.3-i/count)*7);char.style.opacity=.1+local*.9;char.style.transform=`translateY(${(1-local)*10}px)`;});}
 for(const o of orbitData){const p=sectionProgress(o.section);o.progress=p;const angle=p*(o.cards.length-1)*45;o.ring.style.transform=`rotateX(-6deg) rotateY(${-angle}deg)`;const current=Math.round(p*(o.cards.length-1));if(current!==o.index){o.index=current;o.cards.forEach((card,i)=>{card.classList.toggle('front',i===current);card.querySelector('a').tabIndex=i===current?0:-1;});const currentCard=o.cards[current];o.section.querySelector('.orbit-count').textContent=String(current+1).padStart(2,'0')+' / '+String(o.cards.length).padStart(2,'0');o.section.querySelector('.orbit-title').textContent=currentCard.querySelector('a').dataset.title;o.section.querySelector('.orbit-source').textContent=currentCard.lastElementChild.textContent.split(' / ').slice(1).join(' / ');o.section.querySelector('.orbit-prev').disabled=current===0;o.section.querySelector('.orbit-next').disabled=current===o.cards.length-1;}}
 for(const s of stacks){const p=sectionProgress(s.section)*(s.cards.length-1);s.cards.forEach((card,i)=>{const arrived=clamp(p-i+1);const covered=clamp(p-i);const y=i===0?0:(1-arrived)*112;const scale=1-covered*.045;card.style.transform=`translateY(${y}%) scale(${scale}) translateZ(${-covered*25}px)`;card.style.opacity=1;card.style.pointerEvents=Math.round(p)===i?'auto':'none';card.querySelectorAll('a').forEach(a=>a.tabIndex=Math.round(p)===i?0:-1);});const n=Math.min(s.cards.length-1,Math.round(p));s.section.querySelector('.stack-count').textContent=String(n+1).padStart(2,'0')+' / 0'+s.cards.length;s.dots.forEach((d,i)=>d.setAttribute('aria-current',String(i===n)));}
 for(const s of snapShows){const p=sectionProgress(s.section)*(s.cards.length-1);const n=Math.min(s.cards.length-1,Math.round(p));s.cards.forEach((card,i)=>{const arrived=clamp(p-i+1);card.style.transform=`translateY(${i===0?0:(1-arrived)*112}%)`;card.style.pointerEvents=i===n?'auto':'none';card.querySelectorAll('a').forEach(a=>a.tabIndex=i===n?0:-1);});}
}
function request(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
addEventListener('scroll',request,{passive:true});addEventListener('resize',()=>{layoutOrbits();request();});layoutOrbits();update();
// Pause original videos when they leave the viewport; never start sound automatically.
const films=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)e.target.pause();}),{threshold:0});document.querySelectorAll('video').forEach(v=>films.observe(v));
})();
