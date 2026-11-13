(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const root=$('experience'), brain=$('brain-layer'), artery=$('artery-layer'), focus=$('vascular-focus');
  const tabs=[...document.querySelectorAll('.step-tab')], reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=window.matchMedia('(max-width: 700px)');
  const scenes=[
    {name:'Мозг', title:'Память требует энергии',copy:'Кровь доставляет кислород и питательные вещества, необходимые для работы нервных клеток.',view:'Общий вид',tag:'Сосудистая сеть',action:'Рассмотреть сосуды',note:'Общая учебная иллюстрация'},
    {name:'Сосуды',title:'От артерий к мелким сосудам',copy:'Артерии разветвляются. Через сеть более мелких сосудов кровь достигает разных участков мозга.',view:'Сосудистая сеть',tag:'Выбранная область',action:'Открыть модель артерии',note:'Выделена область поверхностных сосудов. Далее: отдельная модель артерии.'},
    {name:'Внутри сосуда',title:'Кровь несёт кислород',copy:'Эритроциты переносят кислород. Дальше, в капиллярах, он поступает к окружающим тканям.',view:'Отдельная учебная модель',tag:'Артерия в разрезе',action:'Вернуться к мозгу',note:'Учебная модель, не точный разрез выбранного сосуда. Масштаб условный.'}
  ];
  let position=0, current=0, playback=false, isStatic=reduced.matches, animation=null, animationFrame=0, sequenceTime=0, lastTime=0, sequenceFrame=0;
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
  function showLabels(index){
    current=index;root.dataset.step=String(index);const s=scenes[index];
    $('detail-index').innerHTML=`0${index+1} <span>/</span> ${s.name}`;
    $('detail-title').textContent=s.title;$('detail-copy').textContent=s.copy;
    $('view-label').textContent=s.view;$('view-scale').textContent=`0${index+1} / 03`;
    $('tag-text').textContent=s.tag;$('explore-text').textContent=s.action;$('scale-note').textContent=s.note;
    $('explore').setAttribute('aria-label',s.action);
    tabs.forEach((t,i)=>t.setAttribute('aria-pressed',String(i===index)));
    $('previous').disabled=index===0;$('next').disabled=index===2;
    brain.setAttribute('aria-hidden',String(index===2));artery.setAttribute('aria-hidden',String(index!==2));
    $('anatomy').setAttribute('aria-label',`Учебная анатомическая иллюстрация. ${s.view}. Используйте стрелки влево и вправо для смены этапа.`);
  }
  function render(value){
    position=clamp(value,0,2);
    const label=position<.42?0:position<1.55?1:2;if(label!==current)showLabels(label);
    const a=smooth(position), model=smooth((position-1.55)/.45), zoom=1+a*.36;
    const shiftX=a*(mobile.matches?9:8), shiftY=a*2;
    brain.style.transform=`translate(calc(-50% + ${shiftX}%),calc(-50% + ${shiftY}%)) scale(${zoom})`;
    // Stop the zoom at the selected area, then leave that view before revealing
    // the independent model. No morph between two different anatomical images.
    brain.style.opacity=String(1-smooth((position-1.2)/.3));
    artery.style.opacity=String(model);
    artery.style.transform=`translate(-50%,-50%) scale(${.97+model*.03})`;
    focus.style.opacity=String(smooth((position-.25)/.6));
    $('context-bridge').style.opacity=String(smooth((position-1.18)/.22));
    $('anatomy-tag').style.opacity=String(smooth((position-.58)/.4));
    $('progress-fill').style.width=`${position*50}%`;
  }
  function cancelTween(){if(animationFrame)cancelAnimationFrame(animationFrame);animationFrame=0;animation=null;}
  function tween(target){
    cancelTween();if(isStatic){render(target);return;}
    const from=position,start=performance.now(), throughNetwork=Math.abs(target-from)>1.1;
    const duration=throughNetwork?4400:target===2?2200:1650;
    animation={from,target};
    const tick=now=>{
      const t=clamp((now-start)/duration);
      const value=throughNetwork?(t<.39?from+(1-from)*smooth(t/.39):t<.57?1:1+(target-1)*smooth((t-.57)/.43)):from+(target-from)*smooth(t);
      render(value);
      if(t<1)animationFrame=requestAnimationFrame(tick);else{animationFrame=0;animation=null;updatePlay()}
    };
    animationFrame=requestAnimationFrame(tick);
  }
  function updatePlay(){
    root.classList.toggle('paused',!playback);
    $('play-text').textContent=isStatic?'Статичный просмотр':playback?'Пауза':position>=1.99?'Повторить переход':'Смотреть переход';
    $('play').disabled=isStatic;
    $('play').setAttribute('aria-label',isStatic?'Анимация отключена':playback?'Приостановить просмотр':position>=1.99?'Повторить последовательный просмотр':'Начать последовательный просмотр');
    $('play-icon').innerHTML=playback?'<path d="M4 3h3v10H4zm5 0h3v10H9z" fill="currentColor"/>':'<path d="M5 3.5 12 8 5 12.5Z" fill="currentColor"/>';
  }
  function pause(){playback=false;if(sequenceFrame)cancelAnimationFrame(sequenceFrame);sequenceFrame=0;updatePlay();}
  function select(index,focusTab=false){pause();cancelTween();index=clamp(index,0,2);tween(index);sequenceTime=index===0?0:index===1?6500:14000;if(focusTab)tabs[index].focus();updatePlay();}
  function run(now){
    if(!playback)return;sequenceTime+=Math.min(now-lastTime,80);lastTime=now;
    let p=sequenceTime<1800?0:sequenceTime<5200?smooth((sequenceTime-1800)/3400):sequenceTime<8500?1:sequenceTime<11900?1+smooth((sequenceTime-8500)/3400):2;
    render(p);
    if(sequenceTime>=14600){pause();return;}sequenceFrame=requestAnimationFrame(run);
  }
  function play(){
    if(isStatic)return;if(playback){pause();return;}const wasTweening=Boolean(animation);cancelTween();
    if(position>=1.99){sequenceTime=0;render(0);showLabels(0)}
    else if(wasTweening){let lo=0,hi=1;const fraction=position>1?position-1:position;for(let i=0;i<22;i++){const m=(lo+hi)/2;if(smooth(m)<fraction)lo=m;else hi=m}sequenceTime=(position>1?8500:1800)+(lo+hi)/2*3400;}
    playback=true;lastTime=performance.now();updatePlay();sequenceFrame=requestAnimationFrame(run);
  }
  function setStatic(value){isStatic=value;pause();cancelTween();root.classList.toggle('static-mode',value);$('motion').setAttribute('aria-pressed',String(value));$('motion').title=value?'Включить анимацию':'Выключить анимацию';$('motion').setAttribute('aria-label',$('motion').title);$('motion-text').textContent=value?'Без движения':'Движение';render(current);sequenceTime=current===0?0:current===1?6500:14000;updatePlay()}
  tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(i));t.addEventListener('keydown',e=>{let dest;if(e.key==='ArrowRight')dest=(i+1)%3;if(e.key==='ArrowLeft')dest=(i+2)%3;if(e.key==='Home')dest=0;if(e.key==='End')dest=2;if(dest!==undefined){e.preventDefault();select(dest,true)}})});
  const requestedStep=()=>animation?animation.target:current;
  $('play').addEventListener('click',play);$('previous').addEventListener('click',()=>select(requestedStep()-1));$('next').addEventListener('click',()=>select(requestedStep()+1));$('explore').addEventListener('click',()=>select((requestedStep()+1)%3));$('motion').addEventListener('click',()=>setStatic(!isStatic));
  $('anatomy').addEventListener('keydown',e=>{if(e.target!==$('anatomy'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();select(current+(e.key==='ArrowRight'?1:-1))}});
  let pointer=null;
  $('anatomy').addEventListener('pointerdown',e=>{if(e.isPrimary===false||e.button>0||e.target.closest('button')){pointer=null;return;}pointer={id:e.pointerId,x:e.clientX,y:e.clientY}});
  $('anatomy').addEventListener('pointerup',e=>{if(!pointer||e.pointerId!==pointer.id)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)select(requestedStep()+(dx<0?1:-1))});
  $('anatomy').addEventListener('pointercancel',()=>pointer=null);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();cancelTween();render(current)}});
  reduced.addEventListener('change',e=>setStatic(e.matches));mobile.addEventListener('change',()=>render(position));
  root.classList.add('js');showLabels(0);render(0);setStatic(isStatic);
})();
