import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chapters } from './story.js';

const root = new URL('../', import.meta.url);
const here = new URL('./', import.meta.url);
const read = (name, encoding = 'utf8') => readFile(new URL(name, here), encoding);
const assets = Object.fromEntries(await Promise.all(
  [...new Set(chapters.flatMap(chapter => chapter.beats.map(beat => beat.asset)))].map(async path => {
    const bytes = await readFile(new URL(path, root));
    return [path, 'data:image/webp;base64,' + bytes.toString('base64')];
  }),
));
const embedded = value => JSON.stringify(value).replaceAll('<', '\\u003c');
const story = chapters.map(({ id, name, note, sources, beats }) => ({ id, name, note, sources, beats }));
const [template, style, visuals, app] = await Promise.all([
  read('index.html'), read('style.css'), read('visuals.js'), read('app.js'),
]);
const html = template
  .replace('<!-- styles -->', () => '<style>\n' + style + '</style>')
  .replace('<!-- script -->', () => '<script>\n"use strict";\nconst chapters = ' + embedded(story)
    + ';\nconst artAssets = ' + embedded(assets) + ';\n' + visuals + '\n' + app + '\n</script>');
const output = new URL('../output/Memory-Scroll-Review.html', import.meta.url);
await mkdir(new URL('.', output), { recursive: true });
await writeFile(output, html);
console.log(fileURLToPath(output));

