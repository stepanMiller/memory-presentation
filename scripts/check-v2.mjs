import {readFile,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const root=new URL('../',import.meta.url);
for(const name of ['app.js','anatomy.js','software-renderer.js','media.js']){const r=spawnSync(process.execPath,['--check',new URL('v2/'+name,root).pathname],{encoding:'utf8'});if(r.status)throw Error(r.stderr);}
for(const side of ['left','right']){const b=await readFile(new URL(`v2/models/brain-${side}.bin`,root));if(b.length!==368664)throw Error('Invalid surface length');for(let i=0;i<122904;i+=4)if(!Number.isFinite(b.readFloatLE(i)))throw Error('Nonfinite anatomical coordinate');for(let i=122904;i<b.length;i+=4){const n=b.readInt32LE(i);if(n<0||n>=10242)throw Error('Invalid surface topology');}}
for(const name of ['man-50','axon','axon-changed','tissue-normal','tissue-changed','brain'])if((await stat(new URL('v2/assets/'+name+'.webp',root))).size<1000)throw Error('Empty anatomical asset');
for(const name of ['index.html','app.js','anatomy.js','software-renderer.js']){const t=await readFile(new URL('v2/'+name,root),'utf8');if(/setInterval\(|autoplay\s*[=>]/i.test(t))throw Error('Autoplay or recurring timer prohibited');}
const app=await readFile(new URL('v2/app.js',root),'utf8');if(!app.includes('cancelAnimationFrame(plateFrame)')||!app.includes("visibilitychange"))throw Error('Missing local process cleanup');
console.log('V2 checks passed: JS, both anatomical meshes, assets, manual navigation and finite process cleanup.');
