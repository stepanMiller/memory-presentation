// Rendered QA for a machine with Playwright and Chromium. Do not confuse this
// suite with qa/logic.cjs. Screenshots and a pass report exist only after a run.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/lib/chromium/chromium',args:['--no-sandbox']});
 const report={cases:[],errors:[],externalRequests:[]};
 const source='file://'+path.resolve(__dirname,'../Memory_Control_01.html');
 const rect=async(p,s)=>p.locator(s).evaluate(e=>e.getBoundingClientRect().toJSON());
 for(const [width,height] of [[320,568],[375,667],[390,844],[430,932],[768,1024],[1024,768],[1280,720],[1440,900],[1920,1080]]){
  const c=await browser.newContext({viewport:{width,height},isMobile:width<700,hasTouch:width<700});
  const p=await c.newPage();p.on('pageerror',e=>report.errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url()))report.externalRequests.push(r.url())});
  await p.goto(source);await p.locator('#brain-image').evaluate(im=>im.decode());
  await p.locator('#motion').click();
  for(let step=0;step<3;step++){
   await p.locator('#step-'+step).click();
   const dimensions=await p.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight}));
   assert(dimensions.scrollWidth<=width,`Horizontal overflow at ${width}, step ${step}`);
   const caption=await rect(p,'.figure-caption'),controls=await rect(p,'.controls'),explanation=await rect(p,'.explanation'),footer=await rect(p,'.footer');
   assert(caption.bottom<=controls.top+1,`Caption overlaps navigation at ${width}`);
   assert(explanation.bottom<=controls.top+1,`Text overlaps navigation at ${width}`);
   assert(controls.bottom<=footer.top+1,`Navigation overlaps footer at ${width}`);
   for(const id of ['motion','explore','step-0','step-1','step-2','play','previous','next']){
    const r=await rect(p,'#'+id);assert(r.height>=44&&r.width>=44,`Small touch target: ${id} at ${width}`);
   }
   if(width<700){
    assert(caption.bottom<=explanation.top+1,'Mobile caption overlaps explanation');
    assert(Number(await p.locator('#detail-copy').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)))>=15,'Mobile body too small');
    if(height<=667)assert(dimensions.scrollHeight>height,'Short phone should scroll naturally');
    await p.locator('.footer').scrollIntoViewIfNeeded();assert(await p.evaluate(()=>scrollY)>0,'Vertical scroll unavailable');
   }
   if([390,1440].includes(width)){await p.evaluate(()=>scrollTo(0,0));await p.screenshot({path:path.join(__dirname,`${width}-step-${step}.png`),fullPage:true});}
   report.cases.push({width,height,step,dimensions,caption,controls});
  }
  await c.close();
 }
 const c=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await c.newPage();await p.goto(source);
 assert.equal(await p.locator('#motion').getAttribute('aria-pressed'),'true');await p.locator('#step-2').click();assert.equal(await p.locator('#artery-layer').evaluate(e=>getComputedStyle(e).opacity),'1');report.reducedMotion='passed';await c.close();
 const nc=await browser.newContext({viewport:{width:390,height:844},javaScriptEnabled:false});const np=await nc.newPage();await np.goto(source);assert((await np.locator('noscript').innerText()).includes('Кровь поступает'));report.noJavaScript='passed';await nc.close();
 const ac=await browser.newContext({viewport:{width:1440,height:900}});const ap=await ac.newPage();await ap.goto(source);await ap.locator('#play').click();await ap.waitForTimeout(3000);const before=await ap.locator('#brain-layer').getAttribute('style');await ap.waitForTimeout(400);assert.notEqual(await ap.locator('#brain-layer').getAttribute('style'),before);await ap.locator('#play').click();const paused=await ap.locator('#brain-layer').getAttribute('style');await ap.waitForTimeout(300);assert.equal(await ap.locator('#brain-layer').getAttribute('style'),paused);await ap.locator('#play').click();await ap.waitForTimeout(13000);assert.equal(await ap.locator('#artery-layer').evaluate(e=>getComputedStyle(e).opacity),'1');report.playPauseResume='passed';await ac.close();
 assert.equal(report.errors.length,0);assert.equal(report.externalRequests.length,0);await browser.close();report.status='passed';fs.writeFileSync(path.join(__dirname,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,cases:report.cases.length,errors:report.errors},null,2));
})().catch(e=>{fs.writeFileSync(path.join(__dirname,'browser-report.json'),JSON.stringify({status:'blocked_or_failed',error:e.message},null,2));console.error(e.message);process.exit(1)});
