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
const stacks=[...document.querySelectorAll('.stack-scroll')].map(section=>({section,cards:[...section.querySelectorAll('.stack-card')],dots:[...section.querySelectorAll('.stack-track i')]}));
function sectionProgress(section){const r=section.getBoundingClientRect();return clamp(-r.top/Math.max(1,r.height-innerHeight));}
function layoutOrbits(){for(const o of orbitData){const width=Math.min(innerWidth*.44,innerHeight*.245,255);const height=width*1.444;const radius=width/(2*Math.tan(Math.PI/o.cards.length))+36;o.ring.style.setProperty('--card-width',width+'px');o.ring.style.setProperty('--card-height',height+'px');o.ring.style.setProperty('--radius',radius+'px');}}
function seekOrbit(o,index){index=clamp(index,0,o.cards.length-1);const y=scrollY+o.section.getBoundingClientRect().top;window.scrollTo({top:y+(o.section.offsetHeight-innerHeight)*(index/(o.cards.length-1)),behavior:reduce.matches?'auto':'smooth'});}
for(const o of orbitData){o.section.querySelector('.orbit-prev').addEventListener('click',()=>seekOrbit(o,Math.max(0,o.index-1)));o.section.querySelector('.orbit-next').addEventListener('click',()=>seekOrbit(o,Math.min(o.cards.length-1,o.index+1)));}
let scheduled=false;
function update(){scheduled=false;if(reduce.matches)return;
 for(const w of words){const p=sectionProgress(w.section);const count=w.chars.length;w.chars.forEach((char,i)=>{const local=clamp((p*1.3-i/count)*7);char.style.opacity=.1+local*.9;char.style.transform=`translateY(${(1-local)*10}px)`;});}
 for(const o of orbitData){const p=sectionProgress(o.section);o.progress=p;const angle=p*(o.cards.length-1)*45;o.ring.style.transform=`rotateX(-6deg) rotateY(${-angle}deg)`;const current=Math.round(p*(o.cards.length-1));if(current!==o.index){o.index=current;o.cards.forEach((card,i)=>{card.classList.toggle('front',i===current);card.querySelector('a').tabIndex=i===current?0:-1;});const currentCard=o.cards[current];o.section.querySelector('.orbit-count').textContent=String(current+1).padStart(2,'0')+' / '+String(o.cards.length).padStart(2,'0');o.section.querySelector('.orbit-title').textContent=currentCard.querySelector('a').dataset.title;o.section.querySelector('.orbit-source').textContent=currentCard.lastElementChild.textContent.split(' / ').slice(1).join(' / ');o.section.querySelector('.orbit-prev').disabled=current===0;o.section.querySelector('.orbit-next').disabled=current===o.cards.length-1;}}
 for(const s of stacks){const p=sectionProgress(s.section)*(s.cards.length-1);s.cards.forEach((card,i)=>{const arrived=clamp(p-i+1);const covered=clamp(p-i);const y=i===0?0:(1-arrived)*112;const scale=1-covered*.045;card.style.transform=`translateY(${y}%) scale(${scale}) translateZ(${-covered*25}px)`;card.style.opacity=1;card.style.pointerEvents=Math.round(p)===i?'auto':'none';card.querySelectorAll('a').forEach(a=>a.tabIndex=Math.round(p)===i?0:-1);});const n=Math.min(s.cards.length-1,Math.round(p));s.section.querySelector('.stack-count').textContent=String(n+1).padStart(2,'0')+' / 0'+s.cards.length;s.dots.forEach((d,i)=>d.classList.toggle('active',i===n));}
}
function request(){if(!scheduled){scheduled=true;requestAnimationFrame(update);}}
addEventListener('scroll',request,{passive:true});addEventListener('resize',()=>{layoutOrbits();request();});layoutOrbits();update();
// Native scroll-snap: no wheel interception, touch and keyboard use normal scrolling.
for(const shell of document.querySelectorAll('.snap-shell')){const reel=shell.querySelector('.snap-exhibition'),buttons=[...shell.querySelectorAll('[data-snap-index]')];buttons.forEach((button,i)=>button.addEventListener('click',()=>reel.scrollTo({top:i*reel.clientHeight,behavior:reduce.matches?'auto':'smooth'})));const sync=()=>{const n=Math.round(reel.scrollTop/reel.clientHeight);buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===n)));};reel.addEventListener('scroll',sync,{passive:true});reel.addEventListener('keydown',e=>{if(e.target!==reel)return;let next;if(e.key==='ArrowDown'||e.key==='PageDown')next=Math.round(reel.scrollTop/reel.clientHeight)+1;if(e.key==='ArrowUp'||e.key==='PageUp')next=Math.round(reel.scrollTop/reel.clientHeight)-1;if(next!==undefined){e.preventDefault();reel.scrollTo({top:clamp(next,0,3)*reel.clientHeight,behavior:reduce.matches?'auto':'smooth'});}});}
// Pause original videos when they leave the viewport; never start sound automatically.
const films=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)e.target.pause();}),{threshold:0});document.querySelectorAll('video').forEach(v=>films.observe(v));
})();
