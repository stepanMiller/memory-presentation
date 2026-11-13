const story = document.getElementById('story');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const defaultNote = 'Учебная иллюстрация · условные метки';
let frame = 0;

function createChapter(chapter) {
  const section = document.createElement('section');
  section.className = 'chapter';
  section.id = chapter.id;
  section.dataset.beat = '0';
  section.innerHTML = `
    <div class="scroll-panel" aria-hidden="true">
      <div class="scene-header">
        <p class="chapter-name"></p>
        <p class="beat-copy"></p>
        <p class="beat-explanation"></p>
      </div>
      <div class="viewport"></div>
      <div class="scene-foot"><p class="scene-note"></p></div>
      <div class="progress"><div></div></div>
    </div>
    <div class="scroll-distance" aria-hidden="true"></div>
    <div class="static-story"><h2 id="heading-${chapter.id}"></h2></div>`;
  section.setAttribute('aria-labelledby', 'heading-' + chapter.id);
  const viewport = section.querySelector('.viewport');
  const panel = section.querySelector('.scroll-panel');
  const distance = section.querySelector('.scroll-distance');
  const text = section.querySelector('.beat-copy');
  const explanation = section.querySelector('.beat-explanation');
  const note = section.querySelector('.scene-note');
  const progress = section.querySelector('.progress > div');
  const transcript = section.querySelector('.static-story');
  section.querySelector('.chapter-name').textContent = chapter.name;
  transcript.querySelector('h2').textContent = chapter.name;

  const figures = chapter.beats.map(beat => {
    const figure = document.createElement('figure');
    const caption = document.createElement('figcaption');
    const line = document.createElement('h3');
    line.className = 'beat-copy';
    line.textContent = beat.title;
    const context = document.createElement('p');
    context.className = 'beat-explanation';
    context.textContent = beat.explanation;
    const description = document.createElement('p');
    description.className = 'visually-hidden';
    description.textContent = beat.alt;
    caption.append(line, context, description);
    if (beat.cue || beat.tag || beat.note) {
      const extra = document.createElement('span');
      extra.className = 'scene-note';
      extra.textContent = [beat.cue, beat.tag, beat.note].filter(Boolean).join(' · ');
      caption.append(extra);
    }
    figure.append(caption);
    transcript.append(figure);
    return figure;
  });

  const visuals = chapter.beats.map(beat => {
    const visual = createVisual(chapter.id, beat);
    visual.shot.style.opacity = '0';
    viewport.append(visual.shot);
    return visual;
  });
  let previous = new Set();
  let active = -1;
  let lastPosition = -1;
  let span = 1;
  let stickyTop = 0;

  function layout() {
    const screen = Math.max(300, document.documentElement.clientHeight);
    span = Math.round(Math.min(490, Math.max(215, screen * .48)));
    distance.style.height = span * chapter.beats.length + 'px';
    stickyTop = parseFloat(getComputedStyle(panel).top) || 0;
    // Keep zoom and SVG coordinates aligned with the plate at every viewport size.
    const bounds = viewport.getBoundingClientRect();
    viewport.style.setProperty('--scene-width', bounds.width + 'px');
    viewport.style.setProperty('--scene-height', bounds.height + 'px');
  }

  function showStatic(still) {
    for (const [index, visual] of visuals.entries()) {
      if (still && visual.shot.parentElement === viewport) {
        const card = document.createElement('div');
        card.className = 'viewport';
        card.append(visual.shot);
        figures[index].prepend(card);
        visual.shot.style.opacity = '1';
        visual.paint(index === chapter.beats.length - 1 ? .78 : .66, true);
      } else if (!still && visual.shot.parentElement !== viewport) {
        const card = visual.shot.parentElement;
        viewport.append(visual.shot);
        card.remove();
        visual.shot.style.opacity = '0';
      }
    }
    active = -1;
    lastPosition = -1;
    previous = new Set();
  }

  function paint(position) {
    if (lastPosition === position) return;
    lastPosition = position;
    const last = visuals.length - 1;
    const index = Math.min(last, Math.floor(position));
    const fraction = position - index;
    const alpha = index < last ? ease((fraction - .80) / .20) : 0;
    const main = alpha >= .5 ? index + 1 : index;
    const visible = new Set([index]);
    if (alpha > 0) visible.add(index + 1);
    for (const old of previous) if (!visible.has(old)) visuals[old].shot.style.opacity = '0';
    const current = visuals[index];
    current.shot.style.opacity = '1';
    current.shot.style.zIndex = '1';
    current.paint(clamp(fraction / .80));
    if (alpha > 0) {
      const next = visuals[index + 1];
      // An undecoded image keeps the preceding visual and its caption in view.
      const ready = next.img.complete && next.img.naturalWidth > 0;
      next.shot.style.opacity = ready ? alpha : '0';
      next.shot.style.zIndex = '2';
      if (ready) next.paint(0);
    }
    previous = visible;
    const selected = visuals[main].img.complete && visuals[main].img.naturalWidth > 0 ? main : index;
    if (active !== selected) {
      active = selected;
      updateCaption(selected);
    }
    progress.style.transform = `scaleX(${position / visuals.length})`;
  }

  for (const { img } of visuals) {
    img.addEventListener('load', () => { lastPosition = -1; requestPaint(); }, { once: true });
  }
  function updateCaption(index) {
    const beat = chapter.beats[index];
    section.dataset.beat = String(index);
    section.dataset.mode = beat.mode;
    text.textContent = beat.title;
    explanation.textContent = beat.explanation;
    note.textContent = beat.note || defaultNote;
  }

  updateCaption(0);
  function position() {
    return Math.min(visuals.length, Math.max(0, (stickyTop - section.getBoundingClientRect().top) / span));
  }

  return { section, panel, layout, showStatic, paint, position };
}

const panels = chapters.map(createChapter);
story.append(...panels.map(item => item.section));

const sources = document.getElementById('sources');
for (const chapter of chapters) {
  if (!chapter.note) continue;
  const heading = document.createElement('h2');
  heading.textContent = chapter.name;
  const text = document.createElement('p');
  text.textContent = chapter.note;
  const links = document.createElement('ul');
  for (const [name, url] of chapter.sources) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.textContent = name;
    link.href = url;
    item.append(link);
    links.append(item);
  }
  sources.append(heading, text, links);
}
const reading = document.getElementById('reading');
reading.hidden = false;

function draw() {
  frame = 0;
  if (motionPreference.matches) return;
  // Read all positions before mutating any visual state.
  const positions = panels.map(panel => panel.position());
  panels.forEach((panel, index) => panel.paint(positions[index]));
}

function requestPaint() {
  if (!frame && !motionPreference.matches) frame = requestAnimationFrame(draw);
}

function relayout() {
  if (!motionPreference.matches) {
    panels.forEach(panel => panel.layout());
    const finalPanel = panels.at(-1).panel;
    reading.style.setProperty('--final-panel-height', finalPanel.getBoundingClientRect().height + 'px');
  }
  requestPaint();
}

function syncMotion() {
  const still = motionPreference.matches;
  document.body.classList.toggle('motion-off', still);
  panels.forEach(panel => panel.showStatic(still));
  relayout();
}

addEventListener('scroll', requestPaint, { passive: true });
addEventListener('resize', relayout, { passive: true });
addEventListener('pageshow', relayout);
motionPreference.addEventListener('change', syncMotion);
syncMotion();

