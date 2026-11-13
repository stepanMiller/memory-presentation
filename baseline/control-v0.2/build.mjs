import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const base=path.dirname(fileURLToPath(import.meta.url));
await mkdir(path.join(base,'dist'),{recursive:true});
await cp(path.join(base,'src'),path.join(base,'dist'),{recursive:true});
let html=await readFile(path.join(base,'src/index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+await readFile(path.join(base,'src/styles.css'),'utf8')+'\n</style>');
html=html.replace('<script src="app.js"></script>','<script>\n'+await readFile(path.join(base,'src/app.js'),'utf8')+'\n</script>');
for(const name of ['brain.webp','artery.webp']){
 const b=await readFile(path.join(base,'src/assets',name));
 html=html.replaceAll('assets/'+name,'data:image/webp;base64,'+b.toString('base64'));
}
await writeFile(path.join(base,'Memory_Control_01.html'),html);
console.log('Built dist/ and Memory_Control_01.html; '+Buffer.byteLength(html)+' bytes. No publication.');
