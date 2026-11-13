/* Shared browser DOM assertions. Loaded only by the QA harness. */
window.auditMemoryLayout=function(w){
 const d=w.document,failures=[],rect=e=>e.getBoundingClientRect();
 const check=(ok,message)=>{if(!ok)failures.push(message);};
 check(d.documentElement.scrollWidth<=w.innerWidth+1,'horizontal overflow');
 const mobile=w.innerWidth<=700;
 for(const section of d.querySelectorAll('.chapter')){
  const id=section.id;
  const controls=rect(section.querySelector('.controls')),caption=rect(section.querySelector('.figure-caption')),nav=rect(section.querySelector('.chapter-nav')),copy=rect(section.querySelector('.explanation'));
  check(caption.bottom<=controls.top+1,`${id}: caption overlaps controls`);
  check(controls.bottom<=nav.top+1,`${id}: controls overlap next navigation`);
  if(mobile)check(copy.bottom<=controls.top+1,`${id}: copy overlaps controls`);
  const title=section.querySelector('.scene-title');
  check(title.scrollWidth<=title.clientWidth+2,`${id}: title overflows`);
  for(const button of section.querySelectorAll('button')){
   const r=rect(button);check(r.height>=43.5,`${id}: touch target shorter than 44 px`);
   check(r.width>=43.5,`${id}: touch target narrower than 44 px`);
  }
  check(parseFloat(w.getComputedStyle(section.querySelector('.detail-copy')).fontSize)>=15,`${id}: body type below 15 px`);
  check(section.querySelectorAll('.step-tab[aria-pressed="true"]').length===1,`${id}: ambiguous selected state`);
 }
 return failures;
};
