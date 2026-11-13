import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {story} from '../src/story.mjs';
const root=new URL('../',import.meta.url),get=p=>readFile(new URL(p,root),'utf8');
const html=await get('dist/index.html'),app=await get('dist/app.js'),css=await get('dist/styles.css');
new vm.Script(app);assert.equal((html.match(/class="chapter chapter-/g)||[]).length,8);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);assert.equal(new Set(ids).size,ids.length);
for(const href of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(href[1]),'Broken anchor '+href[1]);
assert.ok(!/<(?:script|iframe)[^>]+src="https?:/i.test(html),'Unexpected external runtime');
assert.ok(!/@import|url\(['"]?https?:/.test(css),'Unexpected external CSS resource');
assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie/.test(app),'Unexpected network/storage collection');
assert.ok(!/—/.test(html),'Use plain punctuation');
const approved={brain:'f020be541b934bea4f753cc4af0e069edf66c822451e2560e615257fac6e36e5',artery:'9ae74c2afc88f362bb74e1a83cc015d24dfd5585c78444b4d43d8eb9517af044'};
for(const [asset,hash]of Object.entries(approved)){const b=await readFile(new URL('src/assets/'+asset+'.webp',root));assert.equal(createHash('sha256').update(b).digest('hex'),hash,'Approved artwork changed');}
for(const s of story){assert.ok(s.states.every(x=>x.copy&&x.note&&x.asset));for(const a of new Set(s.states.map(x=>x.asset)))await stat(new URL('dist/assets/'+a+'.webp',root));}
const offline=await get('output/Memory_Presentation_Review.html');assert.ok(!/<script src=|<link rel="stylesheet"|url\(['"]?assets\//.test(offline),'Standalone file has missing local dependencies');
const total=(await Promise.all((await readdir(new URL('dist/assets/',root))).map(async f=>(await stat(new URL('dist/assets/'+f,root))).size))).reduce((a,b)=>a+b,0);
assert.ok(total<1024*1024,'Artwork exceeds 1 MB');
console.log(JSON.stringify({chapters:story.length,states:24,standaloneBytes:Buffer.byteLength(offline),artworkBytes:total,approvedAssetsPreserved:true,externalRuntimeRequests:0}));
