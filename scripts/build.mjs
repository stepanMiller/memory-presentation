import {readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {story,sources} from '../src/story.mjs';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>s.replace(/<[^>]*>/g,' ');
const alt={brain:'Объёмная учебная иллюстрация мозга с поверхностными сосудами и условным разрезом белого вещества.',artery:'Отдельная увеличенная учебная модель артерии в продольном разрезе с эритроцитами.',axon:'Увеличенная учебная модель нервного волокна: сплошной аксон внутри сегментов миелиновой оболочки.',microvessels:'Условный фрагмент мозговой ткани в разрезе с сосудами и пучками нервных волокон.'};
const outline='<ellipse cx="540" cy="545" rx="172" ry="166" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4 8"/><circle cx="540" cy="545" r="7" fill="#f3f1eb" stroke="currentColor" stroke-width="2"/>';
const connections='<path class="connection-line" d="M405 450 Q650 150 1010 275 Q1175 510 640 675 Q340 620 405 450"/><circle cx="405" cy="450" r="11"/><circle cx="1010" cy="275" r="11"/><circle cx="640" cy="675" r="11"/>';
function overlay(s,asset){
 let content='',cl='';
 if(s.kind==='vascular'&&asset==='brain'){content=outline;cl='vascular-focus';}
 if(s.kind==='vascular'&&asset==='artery'){content='<path class="signal-line" d="M350 745 C590 568 800 444 1130 304"/>';cl='blood-flow';}
 if(s.kind==='connections'&&asset==='brain'){content=connections;cl='connection-map';}
 if(s.kind==='microvascular'&&asset==='microvessels'){content='<ellipse class="vessel-zone" cx="815" cy="390" rx="270" ry="190"/><ellipse class="fiber-zone" cx="830" cy="740" rx="320" ry="145"/>';cl='micro-focus';}
 if(s.kind==='myelin'&&asset==='axon'){content='<ellipse class="myelin-ring" cx="465" cy="665" rx="250" ry="200" transform="rotate(-28 465 665)"/><path class="signal-line" d="M105 823 Q645 544 1450 160"/>';cl='myelin-focus';}
 return content?`<svg class="anatomy-overlay ${cl}" viewBox="0 0 1536 1024" aria-hidden="true">${content}</svg>`:'';
}
function scene(s,i){
 const a=s.states[0],assets=[...new Set(s.states.map(x=>x.asset))];
 return `<section class="chapter chapter-${s.kind}" id="${s.id}" data-scene="${i}" data-step="0" aria-labelledby="title-${i}">
 <div class="chapter-inner">
  <div class="intro"><p class="eyebrow"><span>${String(i+1).padStart(2,'0')}</span>${esc(s.eyebrow)}</p><h${i?2:1} class="scene-title" id="title-${i}" tabindex="-1">${s.title}</h${i?2:1}><p class="lead">${esc(s.lead)}</p>${i===0?'<div class="opening-actions"><a class="primary-link" href="#connections">Начать историю <span aria-hidden="true">↓</span></a><button class="text-button start-guide" type="button">Автопросмотр · 4½ минуты</button></div>':''}</div>
  <figure class="anatomy" tabindex="0" aria-label="${esc(s.eyebrow)}. Стрелки влево и вправо меняют этап объяснения.">
   <div class="image-stage">
    ${assets.map((asset,n)=>`<div class="art-layer" data-asset="${asset}" style="opacity:${n?0:1}" aria-hidden="${n?'true':'false'}"><div class="asset-image asset-${asset}" role="img" aria-label="${esc(alt[asset])}"></div>${overlay(s,asset)}</div>`).join('')}
    <div class="anatomy-vignette" aria-hidden="true"></div>
    <div class="view-meta" aria-hidden="true"><span class="view-label">${esc(a.label)}</span><span class="view-line"></span><span class="view-count">01 / ${String(s.states.length).padStart(2,'0')}</span></div>
    ${s.kind==='vascular'?`<div class="context-bridge" aria-hidden="true"><div class="context-image asset-brain"><svg viewBox="0 0 1536 1024"><ellipse cx="540" cy="545" rx="172" ry="166" fill="none" stroke="#58684f" stroke-width="13"/></svg></div><span>Область примера</span></div>`:''}
    ${s.kind==='factors'?'<div class="factor-markers" aria-hidden="true"><span>Кровоснабжение</span><span>Нервные связи</span><span>Общее состояние</span></div>':''}
   </div>
   <figcaption class="figure-caption"><span class="image-tag">${esc(a.label)}</span><p class="scale-note">${esc(a.note)}</p></figcaption>
  </figure>
  <div class="explanation"><div class="live-detail" aria-live="polite" aria-atomic="true"><p class="detail-index">${String(i+1).padStart(2,'0')} <span>/</span> <span class="detail-label">${esc(a.label)}</span></p><h3 class="detail-title">${esc(a.title)}</h3><p class="detail-copy">${esc(a.copy)}</p></div>${s.extra?`<details class="extra"><summary>${esc(s.extra.title)}</summary><p>${esc(s.extra.copy)}</p></details>`:''}</div>
  <div class="controls" aria-label="Этапы: ${esc(s.eyebrow)}"><div class="step-tabs" role="group" aria-label="Этапы объяснения">${s.states.map((x,n)=>`<button class="step-tab" type="button" data-target="${n}" aria-pressed="${n===0}" aria-controls="${s.id}"><span>${String(n+1).padStart(2,'0')}</span>${esc(x.label)}</button>`).join('')}</div><div class="transport"><button class="local-play" type="button" aria-label="Показать объяснение: ${esc(s.eyebrow)}"><span class="play-symbol" aria-hidden="true">▷</span><span class="play-label">Показать по шагам</span></button><div class="local-progress" aria-hidden="true"><span></span></div><button class="replay icon-button" type="button" aria-label="Вернуться к началу этой сцены">↺</button></div></div>
  <nav class="chapter-nav" aria-label="Переход между частями"><span>${String(i+1).padStart(2,'0')} / 08</span>${i<7?`<a href="#${story[i+1].id}" class="next-chapter">${esc(['Как работает память','К кровоснабжению','Что может измениться','О роли B12','Собрать картину','Выбор помощи','Следующий шаг'][i])} <span aria-hidden="true">↓</span></a>`:'<a href="#experience" class="next-chapter">Вернуться к началу <span aria-hidden="true">↑</span></a>'}</nav>
 </div>
 <noscript><div class="no-script">${s.states.slice(1).map(x=>`<h3>${esc(x.title)}</h3><p>${esc(x.copy)}</p>`).join('')}</div></noscript>
 </section>`;
}
const html=`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f3f1eb"><meta name="color-scheme" content="light"><meta name="robots" content="noindex,nofollow"><meta name="description" content="Спокойная интерактивная история о возможных механизмах изменений памяти."><title>Память. Понять, что меняется</title><link rel="stylesheet" href="styles.css"></head><body>
<a class="skip-link" href="#experience">К истории</a>
<header class="masthead"><a class="wordmark" href="#experience">Память<span>Понять, что меняется</span></a><div class="header-actions"><button id="guide" class="guide-toggle" type="button" aria-label="Начать автоматический просмотр истории" aria-pressed="false"><span class="guide-symbol" aria-hidden="true">▷</span><span class="guide-label">Автопросмотр</span></button><button id="motion" class="motion-switch" type="button" aria-pressed="false" aria-label="Выключить анимацию"><span class="motion-label">Движение</span><span class="switch-dot" aria-hidden="true"></span></button><button id="menu-open" class="menu-toggle" type="button" aria-label="Открыть содержание" aria-haspopup="dialog"><span id="chapter-count">01 / 08</span><span aria-hidden="true">☰</span></button></div><div class="guide-progress" aria-hidden="true"><span id="guide-fill"></span></div></header>
<main>${story.map(scene).join('\n')}</main>
<footer class="story-footer"><p class="closing-line">Ваш опыт важен.<br><em>Разбираться можно вместе.</em></p><p>Общие медицинские механизмы, не индивидуальный диагноз.<br>Материал для согласования с врачом перед передачей пациенту.</p><button class="text-button start-guide" type="button">Повторить всю историю ↺</button><details class="sources"><summary>Источники и пояснения</summary><p>Учебные иллюстрации условны. Они не являются МРТ, микрофотографиями или результатами обследования. Медицинские формулировки требуют согласования с врачом.</p><ul>${sources.map(([t,u])=>`<li><a href="${u}" target="_blank" rel="noopener noreferrer">${esc(t)}</a></li>`).join('')}</ul><p>Редакция для просмотра: 1.0 · 13 ноября 2026.</p></details></footer>
<dialog id="contents" aria-labelledby="contents-title"><div class="dialog-top"><h2 id="contents-title">Восемь шагов<br><em>к пониманию</em></h2><button id="menu-close" class="icon-button" aria-label="Закрыть содержание" type="button">×</button></div><nav aria-label="Содержание истории">${story.map((s,i)=>`<a href="#${s.id}"><span>${String(i+1).padStart(2,'0')}</span>${esc(plain(s.title))}</a>`).join('')}</nav><p>Около 4–5 минут. Можно идти в своём темпе.</p></dialog>
<p class="sr-only" id="guide-status" role="status"></p>
<script>window.MEMORY_STORY=${JSON.stringify(story).replace(/</g,'\\u003c')};</script><script src="app.js"></script></body></html>`;
await rm(path.join(base,'dist'),{recursive:true,force:true});
await mkdir(path.join(base,'dist/assets'),{recursive:true});await mkdir(path.join(base,'output'),{recursive:true});
await cp(path.join(base,'src/assets'),path.join(base,'dist/assets'),{recursive:true});
let css=await readFile(path.join(base,'src/styles.css'),'utf8');
let motion=await readFile(path.join(base,'src/motion.mjs'),'utf8');motion=motion.replace(/export /g,'');
let app='(()=>{\n'+motion+'\n'+(await readFile(path.join(base,'src/app.js'),'utf8')).replace(/^import .*?;\n/,'')+'\n})();';
await writeFile(path.join(base,'src/index.html'),html.replace('<script src="app.js"></script>','<script type="module" src="app.js"></script>'));await writeFile(path.join(base,'dist/index.html'),html);
await writeFile(path.join(base,'dist/styles.css'),css);await writeFile(path.join(base,'dist/app.js'),app);
for(const asset of Object.keys(alt)){const bytes=await readFile(path.join(base,'src/assets',asset+'.webp'));css=css.replaceAll('assets/'+asset+'.webp','data:image/webp;base64,'+bytes.toString('base64'));}
const offline=html.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>').replace('<script src="app.js"></script>','<script>'+app+'</script>');
await writeFile(path.join(base,'output/Memory_Presentation_Review.html'),offline);
console.log(`Built ${story.length} chapters, ${story.reduce((n,s)=>n+s.states.length,0)} states, ${Buffer.byteLength(offline)} bytes standalone. No deployment.`);
