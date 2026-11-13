import {execFileSync} from 'node:child_process';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {deflateRawSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);await mkdir('output',{recursive:true});
if(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim())throw Error('Commit the source changes before packaging the Git bundle.');
execFileSync('git',['bundle','create','output/memory-history.bundle','--all']);
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(b){let n=0xffffffff;for(const x of b)n=crcTable[(n^x)&255]^(n>>>8);return (n^0xffffffff)>>>0;}
async function files(dir){const a=[];for(const f of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())a.push(...await files(p));else a.push(p);}return a;}
async function zip(name,list){
 const parts=[],central=[];let offset=0;const date=((2026-1980)<<9)|(11<<5)|13;
 for(const [file,label]of list){const b=await readFile(file),packed=deflateRawSync(b,{level:9}),n=Buffer.from(label),c=crc(b),h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(8,8);h.writeUInt16LE(date,12);h.writeUInt32LE(c,14);h.writeUInt32LE(packed.length,18);h.writeUInt32LE(b.length,22);h.writeUInt16LE(n.length,26);parts.push(h,n,packed);
  const d=Buffer.alloc(46);d.writeUInt32LE(0x02014b50);d.writeUInt16LE(20,4);d.writeUInt16LE(20,6);d.writeUInt16LE(0x800,8);d.writeUInt16LE(8,10);d.writeUInt16LE(date,14);d.writeUInt32LE(c,16);d.writeUInt32LE(packed.length,20);d.writeUInt32LE(b.length,24);d.writeUInt16LE(n.length,28);d.writeUInt32LE(offset,42);central.push(d,n);offset+=h.length+n.length+packed.length;
 }
 const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(list.length,8);end.writeUInt16LE(list.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);await writeFile(name,Buffer.concat([...parts,directory,end]));console.log(name);
}
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const built=(await files('dist')).filter(f=>!f.endsWith('review.html')&&!f.endsWith('layout-check.js'));
await zip('output/Memory_Presentation_Source.zip',[...tracked,...built,'output/Memory_Presentation_Review.html','output/memory-history.bundle'].map(f=>[f,'memory-presentation/'+f]));
await zip('output/Memory_Web_Build.zip',built.map(f=>[f,f.slice(5)]));
