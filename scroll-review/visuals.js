const SVG_NS = 'http://www.w3.org/2000/svg';
const memoryPoints = [[770, 370], [1135, 165], [1400, 360], [1175, 540]];
const memoryLoop = 'M770 370 Q900 240 1135 165 Q1390 160 1400 360 Q1410 540 1175 540 Q960 590 770 370';
const oxygenRoutes = [
  'M810 480 Q955 490 1060 520 T1250 485',
  'M860 415 Q1020 425 1115 440 T1250 460',
  'M770 560 Q875 660 1025 645 T1195 600',
];
const clamp = value => Math.min(1, Math.max(0, value));
const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
let overlayId = 0;

function svgNode(tag, attrs, parent) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
  parent.append(element);
  return element;
}

function samplePath(path) {
  const length = path.getTotalLength();
  const last = 120;
  const points = Array.from({ length: last + 1 }, (_, i) => path.getPointAtLength(i * length / last));
  return fraction => {
    const p = clamp(fraction) * last;
    const i = Math.min(last - 1, Math.floor(p));
    const a = points[i];
    const b = points[i + 1];
    return `translate(${(a.x + (b.x - a.x) * (p - i)).toFixed(2)} ${(a.y + (b.y - a.y) * (p - i)).toFixed(2)})`;
  };
}

function createVisual(chapter, beat) {
  const shot = document.createElement('div');
  shot.className = 'shot';
  shot.dataset.mode = beat.mode;
  if (beat.altered) shot.dataset.altered = 'true';

  const world = document.createElement('div');
  world.className = 'world';
  const img = new Image(1672, 941);
  img.alt = '';
  img.decoding = 'async';
  img.src = artAssets[beat.asset];
  world.append(img);
  shot.append(world);

  const mode = beat.mode;
  if (mode === 'portrait' || mode === 'overview') {
    const end = mode === 'portrait' ? 1.025 : 1;
    const start = mode === 'portrait' ? 1 : 1.12;
    return { shot, img, paint(progress, still) {
      world.style.transform = `scale(${still ? 1 : start + (end - start) * ease(progress)})`;
    } };
  }

  const svg = svgNode('svg', { viewBox: '0 0 1672 941', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, world);
  const defs = svgNode('defs', {}, svg);
  const id = ++overlayId;
  const gradient = svgNode('radialGradient', { id: `halo-${id}` }, defs);
  svgNode('stop', { 'stop-color': '#fff2c4', 'stop-opacity': .7 }, gradient);
  svgNode('stop', { offset: 1, 'stop-color': '#fff2c4', 'stop-opacity': 0 }, gradient);
  const glow = (cx, cy, r, opacity) => svgNode('circle', { cx, cy, r, fill: `url(#halo-${id})`, opacity }, svg);
  const ring = (cx, cy, r, opacity) => svgNode('circle', { cx, cy, r, fill: 'none', stroke: '#fff2cd', 'stroke-width': 3, opacity }, svg);
  const trace = (d, attrs = {}) => svgNode('path', { d, fill: 'none', stroke: '#fff0c6', 'stroke-width': 3, ...attrs }, svg);

  let routes = [];
  const glows = [];
  const nodes = [];
  const fibers = [];
  let focus;
  let startZoom = 1;
  let endZoom = 1;
  if (chapter === 'memory') {
    if (mode === 'hear') {
      for (let i = 0; i < 3; i++) trace(`M${575 + i * 35} 390 Q${615 + i * 35} 435 ${575 + i * 35} 480`, { opacity: .3 + i * .15 });
      routes = [trace('M590 435 Q690 400 770 370', { opacity: .65 })];
    } else {
      const points = mode === 'attention' ? memoryPoints.slice(0, 2) : memoryPoints;
      points.forEach(([x, y]) => { glows.push(glow(x, y, 125, .6)); ring(x, y, 22, .7); });
      const route = mode === 'attention' ? 'M770 370 Q900 240 1135 165' : memoryLoop;
      routes = [trace(route, { opacity: .55, 'stroke-dasharray': '5 13' })];
    }
    endZoom = 1.04;
  } else if (mode === 'brainSupply' || mode === 'network') {
    focus = ring(1040, 380, mode === 'network' ? 165 : 90, .9);
    glow(1040, 380, 170, .35);
    routes = [trace('M1110 685 Q995 560 1020 430 Q1120 300 1275 210', { opacity: .45 })];
    world.style.setProperty('--origin', '63% 41%');
    startZoom = mode === 'network' ? 1.12 : 1;
    endZoom = mode === 'network' ? 1.48 : 1.12;
  } else if (mode === 'oxygen') {
    routes = oxygenRoutes.map(d => trace(d, { opacity: .46, 'stroke-dasharray': '3 10' }));
  } else if (mode === 'smallVessel') {
    const lumen = beat.altered ? 'M440 711 C680 550 924 478 1230 280' : 'M320 770 C575 625 895 475 1195 270';
    routes = [trace(lumen, { opacity: .22 })];
    if (beat.altered) focus = ring(970, 430, 80, .8);
  } else if (mode === 'tissue') {
    world.style.setProperty('--origin', '64% 74%');
    endZoom = 1.09;
    const strands = [
      'M548 883 Q786 820 1000 744 T1595 515',
      'M671 932 Q890 874 1144 789 T1664 603',
      'M832 930 Q1028 884 1238 817 T1666 697',
    ];
    for (const d of strands) {
      const strand = trace(d, { opacity: .12, 'stroke-width': 4, 'stroke-dasharray': '8 11' });
      fibers.push(strand);
    }
    glows.push(glow(1130, 765, 184, .42));
  } else if (mode === 'structure') {
    focus = ring(540, 600, 155, .9);
    glow(540, 600, 190, .5);
    world.style.setProperty('--origin', '37% 59%');
    endZoom = 1.12;
  } else {
    routes = [trace('M40 817 C365 690 595 605 840 475 S1340 270 1635 126', { opacity: .48 })];
    for (const [x, y] of [[810, 495], [1120, 360], [1410, 225]]) nodes.push(ring(x, y, 26, .24));
    if (beat.altered) focus = ring(1000, 410, 85, .84);
  }

  const count = mode === 'oxygen' ? 9 : mode === 'smallVessel' ? (beat.altered ? 3 : 6) : routes.length;
  let dots;
  function getDots() {
    if (dots) return dots;
    const paths = routes.map(samplePath);
    dots = Array.from({ length: count }, (_, i) => {
      const element = svgNode('g', { class: 'particle' }, svg);
      svgNode('circle', { r: mode === 'smallVessel' ? 21 : 31, fill: `url(#halo-${id})`, opacity: .85 }, element);
      svgNode('circle', { r: mode === 'smallVessel' ? 6 : 7, fill: '#fff8dc' }, element);
      return { element, path: paths[i % paths.length], offset: i / count };
    });
    return dots;
  }

  const tag = document.createElement('span');
  tag.className = 'annotation';
  tag.hidden = !beat.tag;
  tag.textContent = beat.cue || beat.tag || '';
  shot.append(tag);

  function paint(progress, still = false) {
    const p = ease(progress);
    world.style.transform = `scale(${still && mode !== 'network' ? 1 : startZoom + (endZoom - startZoom) * p})`;
    if (focus) focus.setAttribute('opacity', still ? .85 : .38 + p * .5);
    for (const [i, mark] of glows.entries()) {
      mark.setAttribute('opacity', still ? .72 : .32 + .55 * Math.max(0, Math.sin(p * Math.PI * 2 - i)));
    }
    for (const [i, strand] of fibers.entries()) {
      strand.setAttribute('opacity', still ? .66 : .16 + .56 * ease((p - i * .13) / .56));
    }
    for (const [i, mark] of nodes.entries()) {
      const phase = beat.altered ? p * .71 : p;
      mark.setAttribute('opacity', still ? .65 : .24 + .76 * Math.max(0, 1 - Math.abs(phase - (.43 + i * .22)) * 7));
    }
    for (const { element, path, offset } of getDots()) {
      let q = count === 1 ? (beat.altered ? progress * .72 : progress) : (progress * (beat.altered ? .55 : 1) + offset) % 1;
      if (mode === 'recall') q = 1 - q;
      element.setAttribute('transform', path(q));
      element.setAttribute('opacity', still ? .83 : Math.max(.25, Math.sin(Math.PI * q)));
    }
    if (beat.cue) tag.textContent = still || progress >= .62 ? beat.tag : beat.cue;
  }

  return { shot, img, paint };
}

