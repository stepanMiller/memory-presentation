const $=id=>document.getElementById(id);
const stage=$('stage'),paths=$('paths'),oxygen=$('oxygen'),light=$('cell-light');
const svgNS='http://www.w3.org/2000/svg';
const parts={
 capillary:{n:'01',title:'Капилляр: обмен между кровью и тканью.',copy:'Эритроциты переносят кислород внутри сосуда. Кислород проходит через его тонкую стенку к окружающей ткани.',x:920,y:350,r:66},
 neuron:{n:'02',title:'Нервным клеткам нужна энергия.',copy:'Кислород нужен клеткам для получения энергии. Кровоснабжение поддерживает их постоянную работу.',x:1325,y:480,r:115},
 myelin:{n:'03',title:'Миелин окружает нервные волокна.',copy:'Эта оболочка помогает проводить электрический сигнал. Волокна связывают разные участки нервной системы.',x:1270,y:780,r:74}
};
let frame=0,finishTimer=0,running=false,finished=false;
const dots=Array.from({length:12},(_,i)=>{const g=document.createElementNS(svgNS,'g');const halo=document.createElementNS(svgNS,'circle');halo.setAttribute('r','12');halo.setAttribute('fill','#fff2cb');halo.setAttribute('filter','url(#soft-glow)');halo.setAttribute('opacity','.5');const core=document.createElementNS(svgNS,'circle');core.setAttribute('r','4');core.setAttribute('fill','#fff8df');g.append(halo,core);g.setAttribute('opacity','0');oxygen.append(g);return{el:g,path:$(['o-a','o-b','o-c'][i%3]),delay:Math.floor(i/3)*.28};});
function text(step,title,copy){$('step').textContent=step;$('detail-title').textContent=title;$('detail-copy').textContent=copy;}
function stop(){clearTimeout(finishTimer);cancelAnimationFrame(frame);running=false;stage.classList.remove('is-running');}
function clear(){stop();dots.forEach(d=>d.el.setAttribute('opacity','0'));paths.setAttribute('opacity','0');light.setAttribute('opacity','0');stage.classList.remove('has-played');$('focus-ring').setAttribute('opacity','0');document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed','false'));}
function reset(){clear();finished=false;$('reset').hidden=true;$('play-label').textContent='Показать путь кислорода';text('01 / Рассмотреть','Сосуд и нервная ткань работают рядом.','Нажмите на подпись, чтобы рассмотреть структуру. Затем проследите путь кислорода.');}
document.querySelectorAll('[data-part]').forEach(button=>button.addEventListener('click',()=>{clear();finished=false;const p=parts[button.dataset.part];button.setAttribute('aria-pressed','true');const ring=$('focus-ring');for(const [key,val]of Object.entries({cx:p.x,cy:p.y,r:p.r,opacity:1}))ring.setAttribute(key,String(val));text(`${p.n} / Рассмотреть`,p.title,p.copy);$('reset').hidden=false;$('play-label').textContent='Показать путь кислорода';}));
function end(){stop();finished=true;stage.classList.add('has-played');paths.setAttribute('opacity','.55');light.setAttribute('opacity','1');dots.forEach((d,i)=>{const p=d.path.getPointAtLength(d.path.getTotalLength()*(.24+(i%4)*.2));d.el.setAttribute('transform',`translate(${p.x} ${p.y})`);d.el.setAttribute('opacity',i<6?'.85':'0');});text('03 / Кислород достигает ткани','Из крови, через стенку, к клеткам.','Так кровоснабжение поддерживает работу нервной ткани. Эритроциты остаются внутри капилляра.');$('play-label').textContent='Посмотреть ещё раз';}
$('play').addEventListener('click',()=>{
 if(running){end();return;}
 clear();finished=false;running=true;$('reset').hidden=false;stage.classList.add('is-running');$('play-label').textContent='Показать итог';text('02 / Доставка кислорода','Кислород переходит из крови к ткани.','Проследите за светлыми метками: они проходят через стенку капилляра и расходятся в окружающую ткань.');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){end();return;}
 finishTimer=setTimeout(end,6400);
 const start=performance.now();
 function tick(now){if(!running)return;const t=(now-start)/1000;paths.setAttribute('opacity',String(Math.min(t*.3,.35)));dots.forEach(d=>{const phase=(t-d.delay)/2.8;if(phase<0||phase>1.9){d.el.setAttribute('opacity','0');return;}const p=phase%1;const point=d.path.getPointAtLength(d.path.getTotalLength()*p);d.el.setAttribute('transform',`translate(${point.x} ${point.y})`);d.el.setAttribute('opacity',String(Math.sin(Math.PI*p)*.95));});light.setAttribute('opacity',String(Math.min(Math.max((t-1.9)/2.3,0),1)));if(t>=6.4){end();return;}frame=requestAnimationFrame(tick);}
 frame=requestAnimationFrame(tick);
});
$('reset').addEventListener('click',reset);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)end();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(e.matches&&running)end();});
