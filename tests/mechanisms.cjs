const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {chromium,webkit}=require('playwright');
const base=(process.env.PREVIEW_URL||'http://127.0.0.1:4173')+'/review/mechanisms/index.html';
const widths=[320,375,390,430,768,1024,1440];
(async()=>{
 await fs.mkdir('test-results/mechanisms',{recursive:true});const report=[];
 for(const [engine,type]of [['chromium',chromium],['webkit',webkit]]){
  const browser=await type.launch(engine==='chromium'&&process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});const context=await browser.newContext({viewport:{width:390,height:844},isMobile:engine==='webkit',hasTouch:engine==='webkit'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.setDefaultTimeout(15000);console.log('Checking engine',engine);await page.goto(base);await page.waitForFunction(()=>window.MemoryMechanisms);
  for(const width of widths){
   console.log('Checking width',engine,width);await page.setViewportSize({width,height:900});
   for(const topic of ['memory','vessels','b12']){
    await page.locator(`.topics a[data-topic=${topic}]`).click();await page.waitForFunction(t=>MemoryMechanisms.getState().topic===t,topic);
    const n=await page.locator('#steps button').count();
    for(let i=0;i<n;i++){
     await page.locator('#steps button').nth(i).click();await page.locator('#plate').evaluate(img=>img.decode());
     const geometry=await page.evaluate(()=>{const stage=document.querySelector('#stage').getBoundingClientRect();return{overflow:document.documentElement.scrollWidth>innerWidth,labels:[...document.querySelectorAll('.label')].map(b=>{const r=b.getBoundingClientRect();return{text:b.textContent,fits:r.left>=-.5&&r.right<=innerWidth+.5&&r.top>=stage.top-.5&&r.bottom<=stage.bottom+.5};}),image:document.querySelector('#plate').naturalWidth>0};});
     report.push({engine,width,topic,step:i,...geometry});
     if(await page.locator('#compare').isVisible()){await page.locator('#compare').click();await page.locator('#changed-plate').evaluate(img=>img.decode());assert.equal(await page.locator('#compare').getAttribute('aria-pressed'),'true');assert.notEqual(await page.locator('#plate').getAttribute('src'),await page.locator('#changed-plate').getAttribute('src'));await page.locator('#compare').click();assert.equal(await page.locator('#compare').getAttribute('aria-pressed'),'false');}
    }
   }
  }
  await page.setViewportSize({width:390,height:844});
  await page.clock.install();
  const state=()=>page.evaluate(()=>MemoryMechanisms.getState());
  const choose=async topic=>{await page.locator(`.topics a[data-topic=${topic}]`).click();await page.waitForFunction(t=>MemoryMechanisms.getState().topic===t,topic);await page.locator('#steps button').first().click();};
  const advance=async milliseconds=>{await page.clock.runFor(milliseconds);await page.locator('#plate').evaluate(img=>img.decode());};
  // A topic must not start on load, and a single click must finish all its beats.
  for(const topic of ['memory','vessels','b12']){
   console.log('Checking continuous topic',engine,topic);await choose(topic);await advance(10000);assert.equal((await state()).step,0);assert.equal((await state()).tour.active,false);
   await page.locator('#play').click();
   const seen=new Set();
   for(let i=0;i<70;i++){await advance(1000);const s=await state();seen.add(s.step+':'+s.changed);if(s.tour.done)break;}
   const final=await state();assert.equal(final.tour.done,true);assert.equal(final.topic,topic);assert.equal(final.step,topic==='b12'?2:3);
   for(let i=0;i<=final.step;i++)assert.ok(seen.has(i+':false'),'Missed stage '+topic+':'+i);
   if(topic!=='memory'){assert.ok(seen.has(final.step+':true'));assert.equal(await page.locator('#compare').getAttribute('aria-pressed'),'true');}
   await advance(10000);assert.equal((await state()).topic,topic);assert.equal((await state()).tour.active,false);
   await page.screenshot({path:`test-results/mechanisms/${engine}-${topic}-continuous.png`,fullPage:true});
  }
  // Pause must freeze both the signal and the wait before the next stage.
  await choose('memory');await page.locator('#play').click();await advance(1000);await page.locator('#play').click();
  const frozen=await page.locator('#moving-marks').innerHTML();await advance(12000);assert.equal((await state()).step,0);assert.equal(await page.locator('#moving-marks').innerHTML(),frozen);assert.equal((await state()).tour.paused,true);
  await page.locator('#play').click();await advance(3500);assert.equal((await state()).completed,true);await page.locator('#play').click();await advance(10000);assert.equal((await state()).step,0);await page.locator('#play').click();await advance(3500);assert.equal((await state()).step,1);
  // Manual navigation cancels queued transitions, including a crossfade.
  await page.locator('#steps button').nth(2).click();await advance(12000);assert.equal((await state()).step,2);assert.equal((await state()).tour.active,false);
  await page.locator('#play').click();await choose('b12');await advance(12000);assert.equal((await state()).topic,'b12');assert.equal((await state()).step,0);assert.equal((await state()).tour.active,false);
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#play').click();assert.equal(await page.locator('#stage').getAttribute('data-complete'),'true');
  await page.locator('#play').click();await advance(8000);assert.equal((await state()).step,0);
  await page.locator('#reset').click();assert.equal(await page.locator('#stage').getAttribute('data-complete'),'false');assert.equal((await state()).tour.active,false);
  assert.deepEqual(errors,[]);await browser.close();
 }
 await fs.writeFile('test-results/mechanisms/report.json',JSON.stringify(report,null,2));
 const failures=report.filter(r=>r.overflow||!r.image||r.labels.some(l=>!l.fits));assert.deepEqual(failures,[]);
 console.log(`PASS: ${report.length} layout cases across Chromium and WebKit, image comparisons, single-click topic sequences, automatic comparisons, pause/resume, manual cancellation, reduced motion and reset.`);
})().catch(e=>{console.error(e);process.exit(1);});

