import {spawnSync} from 'node:child_process';
import {cp,mkdtemp,rm,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function run(script){const r=spawnSync(process.execPath,[script],{cwd:root,stdio:'inherit'});if(r.status!==0)throw Error(`Failed: ${script}`);}
const archive=await mkdtemp(path.join(tmpdir(),'memory-v1-pages-'));
try{
 run('scripts/build.mjs');
 run('scripts/check.mjs');
 await cp(path.join(root,'dist'),archive,{recursive:true});
 run('scripts/check-v2.mjs');
 run('scripts/build-v2.mjs');
 await cp(archive,path.join(root,'dist/v1'),{recursive:true});
 await cp(path.join(root,'review'),path.join(root,'dist/review'),{recursive:true,filter:source=>!source.endsWith('.md')});
 // Keep the approved male portrait at its source-relative path for the cinematic review.
 await mkdir(path.join(root,'dist/v2/assets'),{recursive:true});
 await cp(path.join(root,'v2/assets/man-50.webp'),path.join(root,'dist/v2/assets/man-50.webp'));
 console.log('GitHub Pages build ready: V2 at /; preserved V1 at /v1/.');
}finally{await rm(archive,{recursive:true,force:true});}
