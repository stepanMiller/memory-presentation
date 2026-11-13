import {topics} from './data.js?v=1';
const $=id=>document.getElementById(id),ns='http://www.w3.org/2000/svg',order=Object.keys(topics);
const state={topic:'memory',step:0,changed:false,running:false,completed:false};
let frame=0,timer=0,renderToken=0;
const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const current=()=>topics[state.topic].steps[state.step];
function node(tag,attrs={},parent=$('static-marks')){const e=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));parent.append(e);return e;}
function stop(){cancelAnimationFrame(frame);clearTimeout(timer);state.running=false;$('stage').dataset.running='false';$('stage').classList.remove('is-running');}
function setCopy(title,copy){$('detail-title').textContent=title;$('detail-copy').textContent=copy;}
function ring(x,y,r=65,opacity=.8){return node('circle',{cx:x,cy:y,r,fill:'none',stroke:'#fff2cd','stroke-width':2,opacity});}
function glow(x,y,r=115,opacity=.55,parent=$('static-marks')){return node('circle',{cx:x,cy:y,r,fill:'url(#halo)',opacity},parent);}
function path(d,attrs={}){return node('path',{d,fill:'none',stroke:'#fff0c6','stroke-width':2,...attrs});}
function label(text,x,y,cx,cy,title,copy,mobileX=x){const b=document.createElement('button');b.className='label';b.style.left=(matchMedia('(max-width:600px)').matches?mobileX:x)+'%';b.style.top=y+'%';b.innerHTML=text+' <b aria-hidden="true">+</b>';b.setAttribute('aria-pressed','false');b.dataset.x=x;b.dataset.mx=mobileX;b.onclick=()=>{stop();$('labels').querySelectorAll('button').forEach(el=>el.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');$('static-marks').querySelector('.selected-ring')?.remove();const mark=ring(cx,cy,65,1);mark.classList.add('selected-ring');setCopy(title,copy);$('reset').hidden=false;$('play-label').textContent=current().play;};$('labels').append(b);}
function src(s,changed=false){return s.external?'../vascular/assets/microvascular.webp':'assets/'+(changed?s.changed:s.image)+'.webp';}
const memoryPoints=[[770,370],[1135,165],[1400,360],[1175,540]];
function drawStatic(){
 const s=current();$('static-marks').replaceChildren();$('moving-marks').replaceChildren();$('labels').replaceChildren();
 if(state.topic==='memory'){
  if(state.step===0){for(let i=0;i<3;i++)path(`M${575+i*35} 390 Q${615+i*35} 435 ${575+i*35} 480`,{'stroke-width':3,opacity:.3+i*.15});}
  else{const n=state.step===1?2:4;memoryPoints.slice(0,n).forEach(([x,y])=>{glow(x,y,95,.7);ring(x,y,22,.7);});if(state.step>=2)path('M770 370 Q900 240 1135 165 Q1390 160 1400 360 Q1410 540 1175 540 Q960 590 770 370',{'stroke-dasharray':'5 13',opacity:.48});}
  label('Кора мозга',73,12,1135,165,'В памяти участвует сеть областей.','Выделения помогают увидеть совместную работу. Это не точная карта нейронных цепей.',62);
 }else if(s.mode==='brainSupply'||s.mode==='network'){
  ring(1040,380,s.mode==='network'?165:90,.9);glow(1040,380,170,.35);
  if(s.mode==='brainSupply')label('Сосудистые ветви',62,55,1040,380,'Сосуды образуют разветвлённую сеть.','От крупных ветвей кровь проходит к всё более мелким сосудам.',57);
 }else if(s.mode==='oxygen'){
  label('Капилляр',56,17,920,350,'Капилляр: место обмена с тканью.','Кислород проходит через тонкую стенку. Эритроциты остаются внутри сосуда.',48);
  label('Нервная клетка',78,25,1325,480,'Нервной клетке постоянно нужна энергия.','Кровоснабжение поддерживает её работу.',56);
  label('Миелин',79,72,1270,780,'Оболочка вокруг нервного волокна.','Миелин помогает передаче сигнала. К этому перейдём в следующей теме.',67);
 }else if(s.mode==='smallVessel'){
  label(state.changed?'Стенка утолщена':'Стенка артериолы',58,23,985,320,state.changed?s.changedHeading:s.heading,state.changed?s.changedCopy:s.copy,49);
  label('Нервные волокна',70,73,1150,740,'Белое вещество связывает области мозга.','Болезнь мелких сосудов может затрагивать окружающие нервные волокна.',58);
  if(state.changed)ring(970,430,80,.85);
 }else{
  label('Слои миелина',38,38,540,590,'Миелин многослойно окружает аксон.','Здесь оболочка условно открыта, чтобы увидеть её строение.',26);
  label('Промежуток',66,24,1118,358,'Между сегментами остаётся короткий промежуток.','В этих участках электрический сигнал обновляется при распространении по волокну.',55);
  if(state.changed)ring(1000,410,85,.85);
 }
}
function render({focus=false}={}){
 stop();renderToken++;state.completed=false;const topic=topics[state.topic],s=current();
 $('stage').dataset.topic=state.topic;$('stage').dataset.mode=s.mode;$('stage').dataset.step=state.step;$('stage').dataset.running='false';$('stage').dataset.complete='false';$('stage').classList.toggle('is-changed',state.changed);$('stage').classList.remove('is-complete');
 $('eyebrow').textContent=topic.number+' / '+topic.name;$('scene-title').innerHTML=s.title;$('intro-copy').textContent=s.intro;
 $('plate').src=src(s);$('plate').alt=state.topic==='memory'?'Учебная иллюстрация мозга и условное участие областей в работе памяти.':state.topic==='b12'?'Непрерывный аксон, сегменты миелина и промежутки между ними.':'Учебная иллюстрация: '+s.tab+'.';
 $('changed-plate').src=src(s,!!s.changed);$('changed-plate').hidden=!s.changed;
 $('world').style.transform=`scale(${s.zoom||1})`;
 $('life').hidden=state.topic!=='memory';$('quote').textContent=s.quote||'';$('life-note').textContent=s.life||'';
 $('image-note').textContent=state.topic==='memory'?'Участие областей показано условно, это не карта нервных путей.':state.topic==='b12'?'Учебная модель. Световая метка обозначает электрический процесс.':s.mode==='smallVessel'?'Артериола и белое вещество. Условный масштаб. Сравнение, не лечение.':'Учебная анатомическая иллюстрация. Масштаб условен.';
 $('state-badge').hidden=!s.changed;$('state-badge').textContent=state.changed?'Возможное изменение':'Исходный вид для сравнения';
 $('scene-message').hidden=true;
 $('step-kicker').textContent=`${String(state.step+1).padStart(2,'0')} / ${s.tab}`;setCopy(state.changed?s.changedHeading:s.heading,state.changed?s.changedCopy:s.copy);
 $('caution').hidden=!s.caution;$('caution').textContent=s.caution||'';$('play-label').textContent=s.play;
 $('reset').hidden=true;$('compare').hidden=!s.changed;$('compare').textContent=state.changed?'Сравнить с исходным видом':s.compare||'';$('compare').setAttribute('aria-pressed',String(state.changed));
 $('steps').replaceChildren();topic.steps.forEach((v,i)=>{const b=document.createElement('button');b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>${v.tab}`;if(i===state.step)b.setAttribute('aria-current','step');b.onclick=()=>selectStep(i);$('steps').append(b);});
 document.querySelectorAll('[data-topic]').forEach(el=>{if(el.matches('.topics a')){if(el.dataset.topic===state.topic)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');}});
 $('previous').disabled=state.topic==='memory'&&state.step===0;$('chapter-count').textContent=topic.number+' / 03';$('next').textContent=state.step<topic.steps.length-1?'Дальше: '+topic.steps[state.step+1].tab+' →':topic.next+' →';
 $('medical-note').textContent=topic.note;$('sources').replaceChildren();for(const[name,url]of topic.sources){const a=document.createElement('a');a.textContent=name;a.href=url;a.target='_blank';a.rel='noopener noreferrer';$('sources').append(a);}
 $('takeaway').hidden=state.topic!=='b12'||state.step!==2;drawStatic();
 if(focus){$('scene-title').focus({preventScroll:true});$('main').scrollIntoView({behavior:'auto',block:'start'});}
}
function selectStep(i,focus=false){state.step=i;state.changed=false;render({focus});}
function selectTopic(id,focus=false){if(!topics[id])id='memory';state.topic=id;state.step=0;state.changed=false;render({focus});}
function finish(){
 stop();state.completed=true;const s=current();$('stage').dataset.running='false';$('stage').dataset.complete='true';$('stage').classList.add('is-complete');$('play-label').textContent='Посмотреть ещё раз';$('reset').hidden=false;
 setCopy(state.changed?s.changedEnd:s.endTitle,state.changed?s.changedEndCopy:s.endCopy);
 if(state.topic==='memory'){
  const msg=['Слова услышаны','Завтра · 10:00 · парк','Детали связаны','Завтра в 10, у входа в парк'][state.step];$('scene-message').textContent=msg;$('scene-message').hidden=false;
  if(state.step===3){$('quote').textContent='«Завтра в 10, у входа в парк». ';$('life-note').textContent='Подсказка помогла вернуться к договорённости.';}
 }
}
function run(){
 const s=current();if(s.mode==='network'){selectStep(2);return;}if(state.running){finish();return;}
 stop();drawStatic();$('scene-message').hidden=true;state.running=true;state.completed=false;$('stage').dataset.running='true';$('stage').dataset.complete='false';$('stage').classList.add('is-running');$('stage').classList.remove('is-complete');$('play-label').textContent='Показать итог';$('reset').hidden=false;
 setCopy(state.changed?s.changedHeading:s.heading,state.changed?s.changedCopy:s.copy);
 const layer=$('moving-marks'),duration=state.topic==='b12'?(state.changed?5700:3400):state.topic==='memory'?3600:5200;
 let routes=[];
 if(state.topic==='memory'){
  routes=[path(state.step===0?'M590 435 Q690 400 770 370':state.step===1?'M770 370 Q900 240 1135 165':'M770 370 Q900 240 1135 165 Q1390 160 1400 360 Q1410 540 1175 540 Q960 590 770 370',{opacity:.65,'stroke-width':3})];
 }else if(s.mode==='brainSupply'){routes=[path('M1110 685 Q995 560 1020 430 Q1120 300 1275 210',{opacity:.45,'stroke-width':3})];}
 else if(s.mode==='oxygen'){
  routes=['M810 480 Q955 490 1060 520 T1250 485','M860 415 Q1020 425 1115 440 T1250 460','M770 560 Q875 660 1025 645 T1195 600'].map(d=>path(d,{opacity:.35,'stroke-dasharray':'3 10'}));
 }else if(s.mode==='smallVessel'){routes=[path('M320 770 C575 625 895 475 1195 270',{opacity:.15,'stroke-width':3})];}
 else if(s.mode==='structure'){
  ring(540,600,155,.9);glow(540,600,190,.5);$('world').style.transform='scale(1.12)';
 }else{routes=[path('M40 817 C365 690 595 605 840 475 S1340 270 1635 126',{opacity:.48,'stroke-width':3})];}
 const count=s.mode==='oxygen'?9:s.mode==='smallVessel'?(state.changed?3:6):routes.length?1:0;
 const dots=Array.from({length:count},(_,i)=>{const g=node('g',{},layer);node('circle',{r:s.mode==='smallVessel'?14:19,fill:'#fff0bb',filter:'url(#soft)',opacity:.85},g);node('circle',{r:s.mode==='smallVessel'?6:7,fill:'#fff8dc'},g);return{g,route:routes[i%routes.length],offset:i/count};});
 const token=renderToken;
 function paint(p){
  dots.forEach((d,i)=>{let q=count===1?p:(p*(state.changed?.55:1)+d.offset)%1;if(state.topic==='memory'&&state.step===3)q=1-q;const point=d.route.getPointAtLength(q*d.route.getTotalLength());d.g.setAttribute('transform',`translate(${point.x} ${point.y})`);d.g.setAttribute('opacity',p===1?.7:Math.max(.2,Math.sin(Math.PI*q)));});
  if(state.topic==='memory'&&state.step>0)memoryPoints.slice(0,state.step===1?2:4).forEach(([x,y],i)=>{let mark=layer.querySelector(`[data-glow="${i}"]`);if(!mark){mark=glow(x,y,125,.5,layer);mark.dataset.glow=i;}mark.setAttribute('opacity',String(.25+.6*Math.max(0,Math.sin(p*Math.PI*2-i))));});
  if(state.topic==='b12'&&s.mode!=='structure'){[[810,495],[1120,360],[1410,225]].forEach(([x,y],i)=>{let mark=layer.querySelector(`[data-node="${i}"]`);if(!mark){mark=node('circle',{cx:x,cy:y,r:26,fill:'none',stroke:'#fff3cd','stroke-width':3},layer);mark.dataset.node=i;}mark.setAttribute('opacity',String(Math.max(0,1-Math.abs(p-(.43+i*.22))*7)));});}
 }
 const done=()=>{if(token!==renderToken)return;paint(1);finish();};
 if(reduce()){paint(1);done();return;}
 timer=setTimeout(done,duration);const start=performance.now();function tick(now){if(!state.running||token!==renderToken)return;const p=Math.min((now-start)/duration,1);paint(p);if(p>=1){done();return;}frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);
}
$('play').addEventListener('click',run);
$('compare').addEventListener('click',()=>{state.changed=!state.changed;render();$('reset').hidden=false;});
$('reset').addEventListener('click',()=>{state.changed=false;render();});
$('next').addEventListener('click',()=>{if(state.step<topics[state.topic].steps.length-1)selectStep(state.step+1,true);else location.hash=order[(order.indexOf(state.topic)+1)%order.length];});
$('previous').addEventListener('click',()=>{if(state.step>0)selectStep(state.step-1,true);else{const n=order.indexOf(state.topic);if(n>0)location.hash=order[n-1];}});
window.addEventListener('hashchange',()=>selectTopic(location.hash.slice(1),true));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.running)finish();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches&&state.running)finish();});
window.addEventListener('resize',()=>document.querySelectorAll('.label').forEach(b=>b.style.left=(matchMedia('(max-width:600px)').matches?b.dataset.mx:b.dataset.x)+'%'));
selectTopic(location.hash.slice(1));
window.MemoryMechanisms={getState:()=>({...state}),topics:order};
