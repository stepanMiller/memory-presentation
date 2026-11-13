/* MEMORY review. Shared image/SVG coordinates and a single pausable clock,
   extended from the approved oxygen control and review/mechanisms/app.js.
   No exact neuronal map, simulated haemodynamics, or diagnostic image is implied. */
(()=>{'use strict';
const SOURCES={man:'../../v2/assets/man-50.webp',brain:'../mechanisms/assets/brain-surface.webp',cutaway:'../mechanisms/assets/brain-cutaway.webp',micro:'../vascular/assets/microvascular.webp',artery:'../mechanisms/assets/arteriole-normal.webp',artery_change:'../mechanisms/assets/arteriole-changed.webp',nerve:'../mechanisms/assets/nerve-normal.webp',nerve_change:'../mechanisms/assets/nerve-changed.webp'};
const CHAPTERS=['Человек и память','Как работает память','Кровоснабжение','Мелкие сосуды','Нервные волокна','Вместе с врачом'];
const beat=(at,title,description,conclusion,label='',anchor=null)=>({at,title,description,conclusion,label,anchor});
const EPISODES=[
 {id:1,chapter:0,sourceFrames:[1],kind:'portrait',asset:'man',duration:10,focus:[1080,450],note:'Собирательный образ · не история болезни',beats:[
  beat(0,'Во сколько мы договорились?','Завтра встреча. Но время приходится уточнить.','Посмотрим, как работает память.') ]},
 {id:2,chapter:1,sourceFrames:[2,3],kind:'attention',asset:'brain',alternate:'cutaway',duration:18,focus:[1080,420],note:'Учебная модель · не карта нейронных путей',beats:[
  beat(0,'Сначала услышать','«Завтра в десять, у входа в парк». Мозг воспринимает информацию.','Всё начинается с обычного разговора.'),
  beat(8,'Выделить главное','Внимание помогает выделить время и место встречи.','10:00. Вход в парк. Две важные детали.') ]},
 {id:3,chapter:1,sourceFrames:[4,5],kind:'recall',asset:'cutaway',duration:22,focus:[1090,420],note:'Пример встречи · не тест памяти',beats:[
  beat(0,'Связать и сохранить','Мозг связывает новые детали между собой и с тем, что уже знакомо.','В памяти участвует совместная работа разных областей.'),
  beat(11,'Подсказка помогает вспомнить','Знакомый вопрос помогает вернуться к договорённости.','Вспомнить: восстановить уже знакомую связь.') ]},
 {id:4,chapter:2,sourceFrames:[6,7],kind:'supply',asset:'brain',duration:18,focus:[1100,440],note:'Учебная схема · масштабы различаются',beats:[
  beat(0,'Мозгу нужен кислород','Для работы нервных клеток необходим постоянный приток крови.','Кровоснабжение поддерживает работу мозга.'),
  beat(8,'От ветвей к капиллярам','Сосуды разветвляются. Самые тонкие подходят близко к клеткам.','Дальше посмотрим на сосуд в окружающей ткани.') ]},
 {id:5,chapter:2,sourceFrames:[8],kind:'oxygen',asset:'micro',duration:24,focus:[1000,400],note:'Учебная модель · не обследование',beats:[
  beat(0,'Кровь приносит кислород','Его переносит кровь внутри капилляра.','Эритроциты остаются в сосуде.','Капилляр',[908,380]),
  beat(7,'Из крови в ткань','Кислород проходит через стенку капилляра к окружающим клеткам.','Светлые метки условно обозначают кислород.','Стенка капилляра',[958,400]),
  beat(15,'Клеткам нужен кислород','Он необходим клеткам мозга для их работы.','Кровоснабжение поддерживает работу нервной ткани.','Нервная клетка',[1285,430]) ]},
 {id:6,chapter:3,sourceFrames:[9,10,11],kind:'vessel',asset:'artery',alternate:'artery_change',duration:27,focus:[1000,455],note:'Сравнение учебных состояний · не диагноз',beats:[
  beat(0,'Внутри маленькой артерии','Теперь другой масштаб: артериола. Кровь движется по её просвету.','Рядом с сосудом находятся нервные волокна.','Просвет сосуда',[1030,440]),
  beat(9,'Стенка может меняться','Один из возможных вариантов: стенка толще, а просвет уже.','Это пример возможного изменения, не ваш снимок.','Стенка артериолы',[1000,548]),
  beat(18,'Почему это важно для памяти','Нарушения мелких сосудов могут затрагивать ткань, связывающую области мозга.','Это может влиять на внимание, мышление и память.','Нервные волокна',[1150,735]) ]},
 {id:7,chapter:4,sourceFrames:[12,13,14],kind:'nerve',asset:'nerve',alternate:'nerve_change',duration:28,focus:[800,480],note:'Учебная модель · электрический процесс показан условно',beats:[
  beat(0,'Оболочка вокруг волокна','Внутри проходит аксон. Вокруг него расположены слои миелина.','Миелин покрывает волокно отдельными участками.','Слои миелина',[535,620]),
  beat(9,'Миелин помогает сигналу','Между участками оболочки остаются короткие промежутки. Здесь сигнал обновляется.','Так импульс быстро распространяется по волокну.','Промежуток',[1118,360]),
  beat(19,'Если подтверждён дефицит B12','Он может сопровождаться нарушениями работы нервной системы.','Жалоба на память сама по себе не доказывает дефицит.','Учебное сравнение',[1000,425]) ]},
 {id:8,chapter:5,sourceFrames:[15],kind:'overview',asset:'brain',duration:12,focus:[1080,430],note:'Причина определяется индивидуально',beats:[
  beat(0,'Похожие жалобы. Разные причины.','На память могут влиять сон, эмоциональное состояние, лекарства и заболевания.','Одинаковая жалоба не означает одинаковую причину.') ]},
 {id:9,chapter:5,sourceFrames:[16,17],kind:'ending',asset:'man',duration:20,focus:[1080,450],note:'Образовательная история · не назначение лечения',beats:[
  beat(0,'Ваш опыт важен','Если раньше на фоне препарата вы ощущали улучшение, расскажите об этом врачу.','Это важное наблюдение, но оно не определяет диагноз.'),
  beat(9,'Разобраться вместе с врачом','Сопоставить ваши наблюдения, обследования и возможные причины.','Выбрать дальнейшие действия вместе.') ]}
];
const $=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const escapeHTML=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function stateAt(ep,time){let n=0;ep.beats.forEach((b,i)=>{if(time>=b.at)n=i;});return n;}
function svgNode(tag,attrs,parent){const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));parent.append(e);return e;}
function build(ep){
 const section=document.createElement('section');section.className='frame';section.id='episode-'+ep.id;section.dataset.kind=ep.kind;section.setAttribute('aria-label',`Эпизод ${ep.id} из 9. ${ep.beats[0].title}`);
 const alt=ep.asset==='man'?'Собирательный образ мужчины.':ep.kind==='oxygen'?'Учебный разрез капилляра: эритроциты внутри, нервная клетка в окружающей ткани.':ep.kind==='nerve'?'Учебный разрез: непрерывный аксон, слои миелина и промежутки между сегментами.':'Учебная анатомическая иллюстрация: '+ep.beats[0].title;
 const heading=ep.id===1?'h1':'h2';
 section.innerHTML=`<div class="world"><img class="plate" src="${SOURCES[ep.asset]}" alt="${alt}" decoding="async" ${ep.id===1?'fetchpriority="high"':'loading="lazy"'}>${ep.alternate?`<img class="alternate" src="${SOURCES[ep.alternate]}" alt="" aria-hidden="true" decoding="async" loading="lazy">`:''}<svg class="marks" viewBox="0 0 1672 941" aria-hidden="true"><g class="motion-marks"></g><path class="leader" fill="none" stroke="#fff7e9" stroke-width="1.4" opacity=".8"/><circle class="anchor" r="3" fill="#fff7e9"/></svg></div>
 <div class="shade"></div><div class="top"><span class="brand">Память</span><span class="chapter-count">${String(ep.chapter+1).padStart(2,'0')} / 06</span></div>
 <div class="chapter-lines" aria-hidden="true">${CHAPTERS.map((_,i)=>`<i class="${i<=ep.chapter?'passed':''}"></i>`).join('')}</div>
 <div class="copy"><p class="kicker">${CHAPTERS[ep.chapter].toUpperCase()}</p><div class="words"><${heading}>${ep.beats[0].title}</${heading}><p class="description">${ep.beats[0].description}</p></div></div>
 <div class="callout"></div><div class="semantic" hidden></div><div class="network" hidden><svg viewBox="0 0 350 130" aria-hidden="true"><path d="M10 20 L100 20 Q140 20 160 50 L205 80 M100 20 Q140 20 160 5 L205 5 M205 80 L255 60 M205 80 L255 100 M205 5 L255 25 M255 25 L325 15 M255 25 L325 40 M255 60 L325 55 M255 60 L325 80 M255 100 L325 100 M255 100 L325 120" pathLength="1"/><text x="0" y="55">Ветви</text><text x="240" y="50">Капилляры</text></svg><p>Схема разветвления · не анатомическая карта</p></div>
 <div class="compare-controls" hidden><button data-compare="0">Исходный вид</button><button data-compare="1">Возможное изменение</button></div>
 ${ep.id===1?'<div class="opening-action"><button class="primary" id="start-film">Смотреть историю <span aria-hidden="true">↓</span></button><p>Около 3 минут. Можно листать самому.</p></div>':''}
 ${ep.id===9?'<div class="ending" hidden><a href="#medical">Источники и пояснения</a><button class="open-chapters">Вернуться к главам ↑</button></div>':''}
 <p class="takeaway">${ep.beats[0].conclusion}</p>
 <footer class="transport"><p class="note">${ep.note}</p><div class="controls"><button class="previous" aria-label="Предыдущее состояние">←</button><span class="state-count">1 / ${ep.beats.length}</span><button class="next" aria-label="Следующее состояние">→</button><button class="play" aria-label="Поставить на паузу">Пауза <span aria-hidden="true">Ⅱ</span></button><a class="next-episode" href="${ep.id<9?'#episode-'+(ep.id+1):'#medical'}">${ep.id<9?'Дальше ↓':'Источники ↓'}</a></div><div class="progress" role="progressbar" aria-label="Ход эпизода" aria-valuemin="0" aria-valuemax="${ep.duration}" aria-valuenow="0"><span></span></div><div class="sr" aria-live="polite"></div></footer>`;
 $('story').append(section);
 const q=s=>section.querySelector(s);
 const model={ep,section,q,time:0,step:-1,visited:false,ready:false,failed:false,paused:false,done:false,forceComparison:null,copyTimer:0,ratio:0};
 model.world=q('.world');model.plate=q('.plate');model.alternate=q('.alternate');model.motion=q('.motion-marks');model.dots=[];model.rings=[];
 if(ep.kind==='oxygen')for(let i=0;i<12;i++)model.dots.push(svgNode('circle',{r:3.5+(i%3)*.4,fill:'#ede9cb',opacity:0},model.motion));
 if(ep.kind==='nerve')for(const[x,y]of [[824,500],[1118,360],[1405,220]])model.rings.push(svgNode('ellipse',{cx:x,cy:y,rx:29,ry:23,fill:'none',stroke:'#e0e6ca','stroke-width':4,opacity:0},model.motion));
 if(ep.kind==='vessel')model.tissue=svgNode('ellipse',{cx:1150,cy:735,rx:155,ry:65,transform:'rotate(-22 1150 735)',fill:'none',stroke:'#d2d4b5','stroke-width':2,opacity:0},model.motion);
 q('.previous').onclick=()=>seek(model,Math.max(0,model.step-1));q('.next').onclick=()=>seek(model,Math.min(ep.beats.length-1,model.step+1));
 q('.play').onclick=()=>{if(model.done||reduced.matches)return;if(active!==model)activate(model);model.paused=!model.paused;if(model.paused)disableContinuous();sync(model);schedule();};
 q('.next-episode').onclick=()=>disableContinuous();
 q('.compare-controls').querySelectorAll('button').forEach(b=>b.onclick=()=>{model.paused=true;disableContinuous();model.forceComparison=Number(b.dataset.compare);if(ep.kind==='vessel')model.time=model.forceComparison?9:0;else model.time=model.forceComparison?19:0;model.step=-1;render(model,true);sync(model);});
 q('.open-chapters')?.addEventListener('click',openContents);
 return model;
}
const models=EPISODES.map(build);
// Avoid scroll anchoring to the source footer while scenes are inserted above it.
const initialTarget=document.getElementById(location.hash.slice(1))||models[0].section;
initialTarget.scrollIntoView({behavior:'instant',block:'start'});
document.documentElement.classList.add('is-ready');
let active=null,raf=0,lastStamp=null,continuous=false,autoTarget=null,dialogPaused=false;
function sync(m){
 const b=m.q('.play');b.disabled=m.done||reduced.matches||!m.ready;
 b.innerHTML=!m.ready?'Загрузка…':m.done?'Готово ✓':reduced.matches?'Без движения':m.paused?'Продолжить <span aria-hidden="true">▷</span>':'Пауза <span aria-hidden="true">Ⅱ</span>';
 b.setAttribute('aria-label',m.done?'Эпизод завершён':m.paused?'Продолжить эпизод':'Поставить на паузу');
 m.q('.previous').disabled=m.step<=0;m.q('.next').disabled=m.step>=m.ep.beats.length-1;
 m.q('.state-count').textContent=`${m.step+1} / ${m.ep.beats.length}`;
}
function changeWords(m,immediate){
 const n=stateAt(m.ep,m.time);if(n===m.step)return;m.step=n;const b=m.ep.beats[n];clearTimeout(m.copyTimer);
 const apply=()=>{m.q('h1,h2').textContent=b.title;m.q('.description').textContent=b.description;m.q('.takeaway').textContent=b.conclusion;m.q('.callout').textContent=b.label;m.q('.words').classList.remove('changing');};
 if(immediate||reduced.matches)apply();else{m.q('.words').classList.add('changing');m.copyTimer=setTimeout(apply,160);}
 m.q('.sr').textContent=`${n+1} из ${m.ep.beats.length}. ${b.title}`;sync(m);
 // Semantic examples stay distinct from anatomical coordinates: no false map of memory.
 const semantic=m.q('.semantic');semantic.hidden=!['attention','recall','overview'].includes(m.ep.kind);
 if(m.ep.kind==='attention')semantic.innerHTML=n===0?'<p class="memory-quote">«Завтра в десять,<br>у входа в парк»</p><small>Одна фраза из обычного разговора</small>':'<p class="memory-quote"><span class="dim">Завтра</span> в <strong>10:00</strong>,<br>у <strong>входа в парк</strong></p><small>Внимание выделяет важные детали</small>';
 if(m.ep.kind==='recall')semantic.innerHTML=n===0?'<p class="memory-quote">Одна встреча</p><div class="memory-facts"><span>10:00</span><span>Вход в парк</span></div><small>Связь деталей показана условно</small>':'<p class="memory-quote">«Во сколько встречаемся?»</p><div class="memory-facts"><span>10:00</span><span>Вход в парк</span></div><small>Знакомая подсказка возвращает к деталям</small>';
 if(m.ep.kind==='overview')semantic.innerHTML='<p class="memory-quote">Понять свою причину</p><small>Наблюдения + обследования + разговор с врачом</small>';
 m.q('.network').hidden=!(m.ep.kind==='supply'&&n===1);
 m.q('.compare-controls').hidden=!['vessel','nerve'].includes(m.ep.kind)||(m.ep.kind==='nerve'&&n<2);
 if(m.ep.kind==='ending')m.q('.ending').hidden=n!==1;
}
function render(m,immediate=false){
 changeWords(m,immediate);const{ep,time:t,step:n}=m,w=m.section.clientWidth,h=m.section.clientHeight,mobile=w<=700;
 let scale,x,y;const drift=reduced.matches?0:ease(t/ep.duration);
 if(ep.kind==='oxygen'){
  // Preserve the camera, timing, copy and markers of the approved control episode.
  if(mobile){scale=.67*(w/390);x=(-430-150*ease((t-4)/5)-30*ease((t-13)/4))*(w/390);y=Math.max(168,h*.22);scale=Math.max(scale,(h-y)/941);x=x/(.67*(w/390))*scale;}
  else{scale=Math.max(w/1672,h/941)*1.02;x=(w-1672*scale)/2-18*ease((t-5)/10);y=(h-941*scale)/2;}
 }else if(mobile){
  const base=ep.kind==='nerve'?.54:ep.kind==='vessel'?.59:ep.asset==='man'?.70:.46;
  scale=base*(w/390);y=Math.max(210,h*.255);
  let focusX=ep.focus[0];
  if(ep.kind==='nerve')focusX=720+280*ease((t-7)/8);
  if(ep.kind==='vessel')focusX=1000+70*ease((t-18)/5);
  if(ep.kind==='portrait'||ep.kind==='ending')y=Math.max(180,h*.22);
  x=w*.54-focusX*scale;
  // A small pan in one plate; comparisons remain registered until the tissue beat.
  if(!['vessel','nerve'].includes(ep.kind)){x-=12*drift;y-=5*drift;}
 }else{
  scale=Math.max(w/1672,h/941)*1.02;x=(w-1672*scale)/2;y=(h-941*scale)/2;
  if(!['vessel','nerve'].includes(ep.kind))x-=16*drift;
 }
 m.world.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
 let comparison=0;if(ep.kind==='attention')comparison=ease((t-8)/.65);if(ep.kind==='vessel')comparison=ease((t-9)/.65);if(ep.kind==='nerve')comparison=ease((t-19)/.65);if(m.forceComparison!==null)comparison=m.forceComparison;
 if(m.alternate)m.alternate.style.opacity=String(comparison);
 m.q('.compare-controls').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.compare)===(comparison>.5?1:0))));
 if(ep.kind==='oxygen'){
  const destinations=[[1080,405],[1120,445],[1178,493],[1110,525],[1220,550],[1180,395],[1245,610],[1305,650],[1400,480],[1370,580],[1080,485],[1170,570]];
  m.dots.forEach((e,i)=>{const p=ease((t-7-i*.15)/5.5),sx=900+(i%3)*13,sy=371+(i%4)*12,[ex,ey]=destinations[i];e.setAttribute('cx',sx+(ex-sx)*p);e.setAttribute('cy',sy+(ey-sy)*p+Math.sin(p*Math.PI)*(i%2?10:-10));e.style.opacity=String((t<2?0:1)*(n===0?(i<3?.85:0):.82));});
 }
 if(ep.kind==='nerve')m.rings.forEach((e,i)=>{const p=(t-10)/6;const opacity=n===1?(reduced.matches?.7:clamp(1-Math.abs(p-i*.3)*5)):0;e.setAttribute('opacity',String(opacity));});
 if(m.tissue)m.tissue.setAttribute('opacity',String(.65*ease((t-18)/3)));
 if(ep.kind==='recall'){
  const facts=m.q('.memory-facts');if(facts)facts.style.opacity=String(n===0?1-.8*ease((t-7)/2):ease((t-13)/2));
 }
 if(ep.kind==='supply'&&n===1){const p=m.q('.network path');p.style.strokeDasharray='1';p.style.strokeDashoffset=String(1-ease((t-8)/5));}
 let anchor=ep.beats[n].anchor;const label=m.q('.callout'),leader=m.q('.leader'),dot=m.q('.anchor');
 if(anchor){
  let lx=mobile?24:Math.max(w*.50,x+anchor[0]*scale-180),ly=mobile?Math.max(m.q('.copy').offsetTop+m.q('.copy').offsetHeight+22,h*.40):Math.max(125,y+anchor[1]*scale-105);
  if(ep.kind==='oxygen'&&mobile){lx=n===0?w*.57:24;ly=Math.max(ly,h*(n===2?.42:.39));}
  const ax=x+anchor[0]*scale,ay=y+anchor[1]*scale;
  const visible=ax>8&&ax<w-8&&ay>m.q('.copy').offsetTop+m.q('.copy').offsetHeight&&ay<h-190&&ly<h-260;
  label.classList.toggle('visible',visible);leader.style.opacity=visible?'.7':'0';dot.style.opacity=visible?'1':'0';
  label.style.left=lx+'px';label.style.top=ly+'px';dot.setAttribute('cx',anchor[0]);dot.setAttribute('cy',anchor[1]);
  const sx=(lx+32-x)/scale,sy=(ly+34-y)/scale;leader.setAttribute('d',`M${sx} ${sy} L${sx} ${sy+18} L${anchor[0]} ${anchor[1]}`);
 }else{label.classList.remove('visible');leader.style.opacity='0';dot.style.opacity='0';}
 m.q('.progress span').style.transform=`scaleX(${t/ep.duration})`;m.q('.progress').setAttribute('aria-valuenow',String(Math.floor(t)));
}
function disableContinuous(){continuous=false;autoTarget=null;$('autoplay').checked=false;}
function seek(m,index){disableContinuous();m.paused=true;m.done=false;m.forceComparison=null;const start=m.ep.beats[index].at,end=m.ep.beats[index+1]?.at??m.ep.duration;m.time=reduced.matches?Math.max(start,end-.01):start;m.step=-1;render(m,true);sync(m);}
async function prepare(m){
 if(m.ready)return;const imgs=[m.plate,m.alternate].filter(Boolean);imgs.forEach(img=>img.loading='eager');
 const results=await Promise.allSettled(imgs.map(img=>img.decode()));m.failed=results.some(r=>r.status==='rejected');m.ready=true;
 if(m.failed)m.q('.note').textContent='Изображение не загрузилось. Проверьте соединение и обновите страницу.';
 sync(m);if(active===m){lastStamp=null;schedule();}
}
function activate(m){
 if(active===m)return;if(active){active.section.classList.remove('active');active.paused=true;sync(active);}
 active=m;m.section.classList.add('active');lastStamp=null;
 if(!m.visited){m.visited=true;m.paused=false;if(reduced.matches){m.time=m.ep.duration;m.done=true;m.paused=true;}}
 else if(continuous&&autoTarget===m.ep.id){m.paused=false;}
 if(autoTarget===m.ep.id)autoTarget=null;
 render(m,true);prepare(m);sync(m);schedule();
}
function schedule(){cancelAnimationFrame(raf);raf=0;lastStamp=null;if(active&&!active.paused&&!active.done&&active.ready&&!document.hidden&&!dialogPaused&&!reduced.matches)raf=requestAnimationFrame(tick);}
function nextAutomatic(m){if(!continuous||m.ep.id===9)return;const next=models[m.ep.id];autoTarget=next.ep.id;next.section.scrollIntoView({behavior:'smooth',block:'start'});}
function tick(stamp){
 const m=active;if(!m||m.paused||m.done||document.hidden||dialogPaused||reduced.matches){raf=0;lastStamp=null;return;}
 if(lastStamp!==null)m.time=clamp(m.time+(stamp-lastStamp)/1000,0,m.ep.duration);lastStamp=stamp;render(m);
 if(m.time>=m.ep.duration){m.done=true;m.paused=true;sync(m);lastStamp=null;raf=0;nextAutomatic(m);return;}
 raf=requestAnimationFrame(tick);
}
const observer=new IntersectionObserver(entries=>{
 for(const entry of entries){const m=models.find(m=>m.section===entry.target);m.ratio=entry.intersectionRatio;}
 const best=models.reduce((a,b)=>a.ratio>b.ratio?a:b);
 if(best.ratio>.48)activate(best);else if(active&&active.ratio<.30){active.paused=true;sync(active);schedule();}
},{threshold:[0,.3,.48,.6,.8,1]});models.forEach(m=>{render(m,true);observer.observe(m.section);});
// Native scroll remains native. Manual navigation opts out of automatic advancement.
window.addEventListener('wheel',()=>disableContinuous(),{passive:true});
window.addEventListener('touchmove',()=>disableContinuous(),{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden){disableContinuous();if(active){active.paused=true;sync(active);}schedule();}});
window.addEventListener('resize',()=>models.forEach(m=>render(m,true)));
reduced.addEventListener('change',()=>{disableContinuous();models.forEach(m=>{m.paused=true;if(reduced.matches){m.time=m.ep.duration;m.done=true;}render(m,true);sync(m);});schedule();});
document.addEventListener('keydown',e=>{if($('contents').open||e.target.closest('button,a,input,summary')||!active)return;if(e.code==='Space'){e.preventDefault();active.q('.play').click();}else if(e.code==='ArrowRight'){e.preventDefault();active.q('.next').click();}else if(e.code==='ArrowLeft'){e.preventDefault();active.q('.previous').click();}});
function openContents(){dialogPaused=true;schedule();$('contents').showModal();}
$('contents-open').onclick=openContents;$('contents-close').onclick=()=>$('contents').close();
$('contents').addEventListener('close',()=>{dialogPaused=false;schedule();});
$('autoplay').onchange=()=>{continuous=$('autoplay').checked&&!reduced.matches;$('autoplay').checked=continuous;if(continuous&&active){active.paused=false;if(active.done)nextAutomatic(active);sync(active);}schedule();};
$('autoplay').disabled=reduced.matches;
CHAPTERS.forEach((title,i)=>{const m=models.find(m=>m.ep.chapter===i),a=document.createElement('a');a.href='#episode-'+m.ep.id;a.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>${escapeHTML(title)}`;a.onclick=()=>{disableContinuous();$('contents').close();};$('chapter-links').append(a);});
$('medical-link').onclick=()=>{disableContinuous();$('contents').close();};
$('start-film').onclick=()=>{if(reduced.matches){models[1].section.scrollIntoView({behavior:'auto'});return;}models.slice(1).forEach(m=>{m.time=0;m.done=false;m.paused=false;m.forceComparison=null;m.step=-1;render(m,true);sync(m);});continuous=true;$('autoplay').checked=true;autoTarget=2;models[1].section.scrollIntoView({behavior:'smooth',block:'start'});};
// Internal history/hash links preserve each episode's time rather than reversing physiology.
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{if(a.id!=='start-film')disableContinuous();}));
// A minimal read-only QA surface for deterministic state inspection.
window.MemoryStory={getState:()=>({active:active?.ep.id,continuous,reduced:reduced.matches,episodes:models.map(m=>({id:m.ep.id,time:m.time,step:m.step,paused:m.paused,done:m.done,ready:m.ready,failed:m.failed}))}),version:'1.0-review'};
})();
