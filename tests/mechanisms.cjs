const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {chromium,webkit}=require('playwright');
const base=(process.env.PREVIEW_URL||'http://127.0.0.1:4173')+'/review/mechanisms/index.html';
const widths=[320,375,390,430,768,1024,1440];
(async()=>{
 await fs.mkdir('test-results/mechanisms',{recursive:true});const report=[];
 for(const [engine,type]of [['chromium',chromium],['webkit',webkit]]){
  const browser=await type.launch();const context=await browser.newContext({viewport:{width:390,height:844},isMobile:engine==='webkit',hasTouch:engine==='webkit'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  page.setDefaultTimeout(15000);console.log('Checking engine',engine);await page.goto(base);await page.waitForFunction(()=>window.MemoryMechanisms);
  for(const width of widths){
   console.log('Checking width',engine,width);await page.setViewportSize({width,height:900});
   for(const topic of ['memory','vessels','b12']){
    await page.locator(`.topics a[data-topic=${topic}]`).click();
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
  for(const [topic,step]of [['memory',3],['vessels',2],['vessels',3],['b12',1],['b12',2]]){
   await page.locator(`.topics a[data-topic=${topic}]`).click();await page.locator('#steps button').nth(step).click();
   if(step===3&&topic==='vessels'||step===2&&topic==='b12')await page.locator('#compare').click();
   await page.locator('#play').click();await page.waitForFunction(()=>document.querySelector('#stage').dataset.complete==='true',{},{timeout:8500});
   assert.equal(await page.evaluate(()=>MemoryMechanisms.getState().step),step);assert.equal(await page.evaluate(()=>MemoryMechanisms.getState().topic),topic);
   await page.screenshot({path:`test-results/mechanisms/${engine}-${topic}-${step}.png`,fullPage:true});
  }
  await page.locator('.topics a[data-topic=memory]').click();await page.locator('#play').click();await page.locator('.topics a[data-topic=b12]').click();await page.waitForTimeout(3900);assert.equal(await page.evaluate(()=>MemoryMechanisms.getState().topic),'b12');assert.equal(await page.locator('#stage').getAttribute('data-complete'),'false');
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#steps button').nth(1).click();await page.locator('#play').click();assert.equal(await page.locator('#stage').getAttribute('data-complete'),'true');
  await page.locator('#reset').click();assert.equal(await page.locator('#stage').getAttribute('data-complete'),'false');
  assert.deepEqual(errors,[]);await browser.close();
 }
 await fs.writeFile('test-results/mechanisms/report.json',JSON.stringify(report,null,2));
 const failures=report.filter(r=>r.overflow||!r.image||r.labels.some(l=>!l.fits));assert.deepEqual(failures,[]);
 console.log(`PASS: ${report.length} layout cases across Chromium and WebKit, image comparisons, finite animations, cancellation, reduced motion and reset.`);
})().catch(e=>{console.error(e);process.exit(1);});
