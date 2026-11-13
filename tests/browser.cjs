// Full-browser regression suite. Install playwright separately or use the provided runtime.
const path=require('node:path'),fs=require('node:fs/promises'),assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright');}catch{playwright=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'playwright'));}
const dimensions=[[320,568],[360,640],[375,667],[390,844],[430,932],[768,1024],[1024,768],[1440,900],[1920,1080]];
(async()=>{
 const browser=await playwright.chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
 const errors=[],results=[];const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.PREVIEW_URL||'http://127.0.0.1:4173';
 for(const [width,height]of dimensions){
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);
  await page.addScriptTag({path:path.join(__dirname,'layout-check.js')});
  const chapters=page.locator('.chapter');
  for(let i=0;i<8;i++){const c=chapters.nth(i),tabs=c.locator('.step-tab');for(let j=0;j<await tabs.count();j++){
   await tabs.nth(j).click();const failures=await page.evaluate(()=>auditMemoryLayout(window));results.push({width,height,scene:i+1,state:j+1,failures});
  }}
 }
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base);
 await page.locator('#guide').click();await page.waitForTimeout(600);assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('guide-active')));
 await page.locator('#guide').click();const paused=await page.evaluate(()=>MemoryPresentation.state.guide.elapsed);await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>MemoryPresentation.state.guide.elapsed),paused);
 await page.locator('#menu-open').click();assert.ok(await page.locator('dialog').evaluate(e=>e.open));await page.keyboard.press('Escape');assert.ok(!(await page.locator('dialog').evaluate(e=>e.open)));
 await page.locator('#motion').click();assert.ok(await page.locator('#guide').isDisabled());
 const c=page.locator('#blood-supply');await c.locator('.step-tab').nth(2).click();assert.equal(await c.getAttribute('data-step'),'2');assert.equal(await c.locator('.context-bridge').evaluate(e=>getComputedStyle(e).opacity),'1');
 await fs.mkdir('test-results',{recursive:true});await fs.writeFile('test-results/browser.json',JSON.stringify({engine:await browser.version(),errors,results},null,2));
 await browser.close();assert.equal(errors.length,0);assert.equal(results.filter(x=>x.failures.length).length,0);console.log('PASS: 216 layout cases, pause/resume, menu, reduced motion, model context.');
})().catch(e=>{console.error(e);process.exitCode=1;});
