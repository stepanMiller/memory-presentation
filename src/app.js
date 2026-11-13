import {clamp,smooth,vascularFrame,manualPosition,gestureDirection,timelinePosition} from './motion.mjs';

const data=window.MEMORY_STORY;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const body=document.body;
body.classList.add('js');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let still=reduced.matches,userMotion=false,current=0,lastTime=0,raf=0,scrollFrame=0;
let guide={active:false,paused:false,scene:0,elapsed:0,view:''};
const total=data.reduce((n,s)=>n+s.duration,0);
const controllers=$$('.chapter').map((el,index)=>({el,index,data:data[index],position:0,step:-1,elapsed:0,playing:false,transition:null}));

function detail(c,step){
 if(c.step===step)return;
 c.step=step;c.el.dataset.step=step;
 const s=c.data.states[step];
 $('.detail-label',c.el).textContent=s.label;
 $('.detail-title',c.el).textContent=s.title;
 $('.detail-copy',c.el).textContent=s.copy;
 $('.image-tag',c.el).textContent=s.label;
 $('.scale-note',c.el).textContent=s.note;
 $('.view-label',c.el).textContent=s.label;
 $('.view-count',c.el).textContent=String(step+1).padStart(2,'0')+' / '+String(c.data.states.length).padStart(2,'0');
 $$('.step-tab',c.el).forEach((b,i)=>b.setAttribute('aria-pressed',String(i===step)));
}
function frame(c,position){
 c.position=clamp(position,0,c.data.states.length-1);
 const layers=$$('.art-layer',c.el);
 if(c.data.kind==='vascular'){
  const f=vascularFrame(c.position,innerWidth<=700);
  const brain=layers.find(l=>l.dataset.asset==='brain'),artery=layers.find(l=>l.dataset.asset==='artery');
  brain.style.opacity=f.brainOpacity;
  brain.style.transform=`translate(calc(-50% + ${f.shiftX}%),calc(-50% + ${f.shiftY}%)) scale(${f.brainZoom})`;
  artery.style.opacity=f.arteryOpacity;
  artery.style.transform=`translate(-50%,-50%) scale(${f.modelZoom})`;
  $('.vascular-focus',c.el).style.opacity=f.focus;
  $('.context-bridge',c.el).style.opacity=f.context;
  brain.setAttribute('aria-hidden',String(f.step===2));artery.setAttribute('aria-hidden',String(f.step!==2));
  detail(c,f.step);
 }else{
  const step=Math.round(c.position),a=Math.floor(c.position),b=Math.ceil(c.position),mix=c.position-a;
  const from=c.data.states[a].asset,to=c.data.states[b].asset;
  layers.forEach(l=>{
   const active=l.dataset.asset;
   l.style.opacity=from===to?Number(active===from):active===from?1-mix:active===to?mix:0;
   const z=still?1:1+.025*smooth(c.position/(c.data.states.length-1));
   l.style.transform=`translate(-50%,-50%) scale(${z})`;
   l.setAttribute('aria-hidden',String(active!==c.data.states[step].asset));
  });
  detail(c,step);
 }
 $('.local-progress span',c.el).style.width=(100*c.elapsed/(c.data.duration*1000))+'%';
}
function transport(c){
 c.el.classList.toggle('is-playing',c.playing&&!still);
 const p=$('.local-play',c.el);
 $('.play-label',p).textContent=still?'Следующий этап':c.playing?'Пауза':c.elapsed>0&&c.elapsed<c.data.duration*1000?'Продолжить':'Показать по шагам';
 $('.play-symbol',p).textContent=c.playing?'Ⅱ':'▷';
 p.setAttribute('aria-label',still?'Следующий этап объяснения':c.playing?'Приостановить объяснение':'Показать объяснение: '+c.data.eyebrow);
 p.setAttribute('aria-pressed',String(c.playing));
}
function header(){
 body.classList.toggle('guide-active',guide.active);body.classList.toggle('guide-paused',guide.paused);
 $('#guide').setAttribute('aria-pressed',String(guide.active));
 $('#guide').disabled=still;
 $('.guide-symbol').textContent=guide.active?'Ⅱ':'▷';
 $('.guide-label').textContent=guide.active?'Пауза':guide.paused?'Продолжить':'Автопросмотр';
 $('#guide').setAttribute('aria-label',still?'Автопросмотр недоступен в режиме без анимации':guide.active?'Приостановить всю историю':guide.paused?'Продолжить автоматический просмотр':'Начать автоматический просмотр истории');
 const elapsed=data.slice(0,guide.scene).reduce((n,s)=>n+s.duration,0)+guide.elapsed/1000;
 $('#guide-fill').style.width=clamp(elapsed/total)*100+'%';
 $('.motion-label').textContent=still?'Без движения':'Движение';
 $('#motion').setAttribute('aria-pressed',String(still));
 $('#motion').setAttribute('aria-label',still?'Включить анимацию':'Выключить анимацию');
 $$('.start-guide').forEach(b=>{b.disabled=still;b.title=still?'Включите движение для автопросмотра':'';});
}
function pauseGuide(announce=false){
 if(!guide.active)return;
 guide.active=false;guide.paused=true;
 controllers[guide.scene].playing=false;transport(controllers[guide.scene]);header();
 if(announce)$('#guide-status').textContent='Просмотр на паузе. Продолжайте в своём темпе.';
}
function stopLocal(except=null){controllers.forEach(c=>{if(c!==except){c.playing=false;c.transition=null;transport(c);}});}
function requestTick(){if(!raf){lastTime=performance.now();raf=requestAnimationFrame(tick);}}
function go(c,target){
 pauseGuide();stopLocal();
 target=clamp(target,0,c.data.states.length-1);
 c.elapsed=(target/c.data.states.length)*c.data.duration*1000;
 if(still){frame(c,target);transport(c);return;}
 c.transition={from:c.position,to:target,elapsed:0,duration:c.data.kind==='vascular'&&Math.abs(target-c.position)>1.1?2700:1150};
 transport(c);requestTick();
}
function play(c){
 pauseGuide();stopLocal(c);
 if(still){go(c,(c.step+1)%c.data.states.length);return;}
 c.transition=null;
 if(c.playing)c.playing=false;
 else{if(c.elapsed>=c.data.duration*1000)c.elapsed=0;c.playing=true;requestTick();}
 transport(c);
}
function scrollToScene(i,focus=false){
 const c=controllers[i];
 c.el.scrollIntoView({behavior:still?'instant':'smooth',block:'start'});
 if(focus)$('.scene-title',c.el).focus({preventScroll:true});
 current=i;$('#chapter-count').textContent=String(i+1).padStart(2,'0')+' / 08';
}
function startGuide(restart=false){
 if(still)return;
 if(guide.active&&!restart){pauseGuide(true);return;}
 stopLocal();
 if(restart||!guide.paused){guide.scene=restart?0:current;guide.elapsed=0;guide.view='';}
 guide.active=true;guide.paused=false;
 const c=controllers[guide.scene];c.elapsed=guide.elapsed;c.playing=true;transport(c);
 scrollToScene(guide.scene);header();requestTick();
 $('#guide-status').textContent='Автопросмотр. Прокрутка или касание управления ставят историю на паузу.';
}
function guideMobileView(c){
 if(innerWidth>700)return;
 const elapsed=guide.elapsed/1000,segment=c.data.duration/c.data.states.length;
 const state=Math.min(c.data.states.length-1,Math.floor(elapsed/segment));
 let view='intro';
 if(elapsed>4)view=innerHeight<720&&elapsed%segment>segment*.55?'explanation':'anatomy';
 const key=c.index+':'+view;
 if(guide.view===key)return;
 guide.view=key;
 if(view!=='intro')$('.'+view,c.el).scrollIntoView({behavior:'smooth',block:'start'});
}
function tick(now){
 raf=0;const delta=Math.min(1000,now-lastTime);lastTime=now;let active=false;
 if(guide.active){
  guide.elapsed+=delta;
  let c=controllers[guide.scene];
  if(guide.elapsed>=c.data.duration*1000){
   c.elapsed=c.data.duration*1000;c.playing=false;frame(c,c.data.states.length-1);transport(c);
   if(guide.scene===controllers.length-1){guide.active=false;guide.paused=false;$('#guide-status').textContent='История завершена. Можно вернуться к любой части.';}
   else{guide.scene++;guide.elapsed=0;c=controllers[guide.scene];c.playing=true;transport(c);scrollToScene(guide.scene);}
  }
  if(guide.active){c.elapsed=guide.elapsed;frame(c,timelinePosition(c.elapsed,c.data.states.length,c.data.duration*1000));guideMobileView(c);active=true;}
  header();
 }
 controllers.forEach(c=>{
  if(guide.active&&c.index===guide.scene)return;
  if(c.transition){
   const t=c.transition;t.elapsed+=delta;
   frame(c,manualPosition(t.from,t.to,t.elapsed,t.duration));
   if(t.elapsed>=t.duration)c.transition=null;else active=true;
  }else if(c.playing){
   c.elapsed=Math.min(c.elapsed+delta,c.data.duration*1000);
   frame(c,timelinePosition(c.elapsed,c.data.states.length,c.data.duration*1000));
   if(c.elapsed>=c.data.duration*1000){c.playing=false;transport(c);}else active=true;
  }
 });
 if(active)raf=requestAnimationFrame(tick);
}
function setMotion(value){
 pauseGuide();stopLocal();still=value;
 document.documentElement.classList.toggle('no-motion',still);
 controllers.forEach(c=>{frame(c,Math.round(c.position));transport(c);});header();
}
controllers.forEach(c=>{
 frame(c,0);transport(c);
 $$('.step-tab',c.el).forEach(b=>b.addEventListener('click',()=>go(c,Number(b.dataset.target))));
 $('.local-play',c.el).addEventListener('click',()=>play(c));
 $('.replay',c.el).addEventListener('click',()=>{pauseGuide();stopLocal();c.elapsed=0;frame(c,0);transport(c);});
 const art=$('.anatomy',c.el);let touch=null;
 art.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();go(c,e.key==='Home'?0:e.key==='End'?c.data.states.length-1:c.step+(e.key==='ArrowRight'?1:-1));}});
 art.addEventListener('touchstart',e=>{touch=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;},{passive:true});
 art.addEventListener('touchend',e=>{if(!touch||!e.changedTouches.length)return;const t=e.changedTouches[0],direction=gestureDirection(t.clientX-touch.x,t.clientY-touch.y);touch=null;if(direction)go(c,c.step+direction);},{passive:true});
 art.addEventListener('touchcancel',()=>touch=null,{passive:true});
});
$('#guide').addEventListener('click',()=>startGuide());
$$('.start-guide').forEach(b=>b.addEventListener('click',()=>startGuide(true)));
$('#motion').addEventListener('click',()=>{userMotion=true;setMotion(!still);});
reduced.addEventListener('change',e=>{if(!userMotion)setMotion(e.matches);});
const dialog=$('#contents');
function closeContents(){dialog.close();body.classList.remove('dialog-open');}
$('#menu-open').addEventListener('click',()=>{pauseGuide();stopLocal();dialog.showModal();body.classList.add('dialog-open');});
$('#menu-close').addEventListener('click',closeContents);
dialog.addEventListener('close',()=>body.classList.remove('dialog-open'));
dialog.addEventListener('cancel',()=>body.classList.remove('dialog-open'));
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeContents();}});
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
 const i=data.findIndex(s=>'#'+s.id===a.getAttribute('href'));if(i<0)return;
 e.preventDefault();pauseGuide();stopLocal();if(dialog.open)closeContents();scrollToScene(i,true);
 try{history.replaceState(null,'','#'+data[i].id);}catch{}
}));
function scrollObserver(){
 scrollFrame=0;
 let nearest=0,distance=Infinity;
 controllers.forEach(c=>{const r=c.el.getBoundingClientRect();const d=Math.abs(r.top-80);if(r.top<=innerHeight*.4&&r.bottom>innerHeight*.25){nearest=c.index;distance=-1;}else if(distance!==-1&&d<distance){distance=d;nearest=c.index;}
  if((r.bottom<64||r.top>innerHeight)&&c.playing&&!(guide.active&&guide.scene===c.index)){c.playing=false;transport(c);}
 });
 current=nearest;$('#chapter-count').textContent=String(current+1).padStart(2,'0')+' / 08';
}
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(scrollObserver);},{passive:true});
addEventListener('wheel',()=>pauseGuide(true),{passive:true});
addEventListener('touchmove',()=>pauseGuide(true),{passive:true});
addEventListener('keydown',e=>{if(['PageDown','PageUp','ArrowDown','ArrowUp',' '].includes(e.key)&&!e.target.closest('button,summary,dialog'))pauseGuide(true);});
addEventListener('resize',()=>{controllers.forEach(c=>frame(c,c.position));scrollObserver();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseGuide();stopLocal();}});
setMotion(still);scrollObserver();
window.MemoryPresentation={version:'1.0.0-review.1',get state(){return {still,current,guide:{...guide},scenes:controllers.map(c=>({position:c.position,step:c.step,playing:c.playing,elapsed:c.elapsed}))};}};
