const assert = require('node:assert/strict');
const { mkdir, writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium, webkit, devices } = require(process.env.MEMORY_PLAYWRIGHT || 'playwright');

const base = process.env.MEMORY_SCROLL_URL || 'http://127.0.0.1:4175/';
const evidence = resolve(__dirname, '../output/scroll-qa');
const widths = [320, 375, 390, 430, 768, 1440, 1920];
const css = (page, topic) => page.locator('#' + topic);

async function scrollTo(page, topic, beat, phase = .5, visibleBeat = beat) {
  const target = await page.evaluate(async ({ topic, beat, phase }) => {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const section = document.getElementById(topic);
    const distance = section.querySelector('.scroll-distance').offsetHeight;
    const count = section.querySelectorAll('.shot').length;
    const sticky = parseFloat(getComputedStyle(section.querySelector('.scroll-panel')).top) || 0;
    const top = section.getBoundingClientRect().top + scrollY - sticky;
    const y = Math.round(top + distance * (beat + phase) / count);
    window.scrollTo(0, y);
    return { y };
  }, { topic, beat, phase });
  try { await page.waitForFunction(({ topic, beat, y }) => {
    const section = document.getElementById(topic);
    const bar = section.querySelector('.progress > div');
    const sticky = parseFloat(getComputedStyle(section.querySelector('.scroll-panel')).top) || 0;
    const distance = section.querySelector('.scroll-distance').offsetHeight;
    const progress = (sticky - section.getBoundingClientRect().top) / distance;
    const scale = Number(bar.style.transform.match(/scaleX\(([^)]+)\)/)?.[1]);
    return Math.abs(scrollY - y) <= 16 && Math.abs(scale - progress) <= .0015 && section.dataset.beat === String(beat);
  }, { topic, beat: visibleBeat, ...target }, { timeout: 5000 }); }
  catch (error) {
    const actual = await page.locator('#' + topic).evaluate(section => ({
      y: scrollY, top: section.getBoundingClientRect().top, beat: section.dataset.beat,
      transform: section.querySelector('.progress > div').style.transform,
      distance: section.querySelector('.scroll-distance').offsetHeight,
    }));
    throw Error(JSON.stringify({ topic, beat, phase, target, actual }), { cause: error });
  }
}

async function verifyLayout(browser, device, label, chapters) {
  const page = await browser.newPage({ ...device });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const extraneous = [];
  page.on('request', req => {
    if (!req.url().startsWith(base) && !req.url().startsWith('data:')) extraneous.push(req.url());
  });
  await page.goto(base);
  await page.locator('.chapter').last().waitFor({ state: 'attached' });
  await page.locator('.shot img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  assert.equal(await page.locator('button').count(), 0);
  const checks = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width >= 1440 ? 900 : 844 });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    for (const { id: topic, beats } of chapters) {
      for (const [beat, expected] of beats.entries()) {
        await scrollTo(page, topic, beat);
        const result = await css(page, topic).evaluate(section => {
          const panel = section.querySelector('.scroll-panel').getBoundingClientRect();
          const view = section.querySelector('.viewport').getBoundingClientRect();
          const heading = section.querySelector('.beat-copy').getBoundingClientRect();
          const explanation = section.querySelector('.beat-explanation').getBoundingClientRect();
          const visible = [...section.querySelectorAll('.shot')].filter(shot => Number(shot.style.opacity) > .001);
          const target = visible.at(-1);
          const tag = target.querySelector('.annotation');
          const mark = target.querySelector('.particle circle');
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            pinned: Math.abs(panel.top - (parseFloat(getComputedStyle(section.firstElementChild).top) || 0)) < 2,
            fits: panel.bottom <= innerHeight + 1 && heading.top >= -1 && heading.bottom <= innerHeight + 1,
            heading: [Math.round(heading.top), Math.round(heading.bottom)],
            panelBottom: Math.round(panel.bottom),
            viewport: Math.round(view.height),
            loaded: target.querySelector('img').naturalWidth > 0,
            copy: section.querySelector('.beat-copy').textContent,
            explanation: section.querySelector('.beat-explanation').textContent,
            explains: explanation.top >= heading.bottom && explanation.bottom <= panel.bottom &&
              (innerWidth >= 700 || explanation.bottom <= view.top),
            mode: target.dataset.mode,
            altered: target.dataset.altered === 'true',
            tagFits: !tag || tag.hidden || tag.getBoundingClientRect().right <= view.right + 1,
            marked: !!(mark || target.querySelector('svg circle')),
          };
        });
        assert.ok(!result.overflow && result.pinned && result.fits && result.viewport >= 260 &&
          result.loaded && result.tagFits && result.explains && (result.marked || ['portrait', 'overview'].includes(expected.mode)),
          label + ' ' + width + ' ' + topic + ':' + beat + ' ' + JSON.stringify(result));
        assert.equal(result.copy, expected.title);
        assert.equal(result.explanation, expected.explanation);
        assert.equal(result.mode, expected.mode);
        assert.equal(result.altered, Boolean(expected.altered));
        checks.push([width, topic, beat]);
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const particle = css(page, 'vessels').locator('.shot[data-mode="oxygen"] .particle').first();
  await scrollTo(page, 'vessels', 2, .2);
  const p1 = await particle.getAttribute('transform');
  await page.waitForTimeout(220);
  assert.equal(await particle.getAttribute('transform'), p1, 'Motion must stop when the finger stops');
  await scrollTo(page, 'vessels', 2, .62);
  assert.notEqual(await particle.getAttribute('transform'), p1);
  await scrollTo(page, 'vessels', 2, .2);
  assert.equal(await particle.getAttribute('transform'), p1, 'The same scroll position must produce the same frame');

  for (const { id, beats } of chapters) {
    for (let i = 0; i < beats.length; i++) await scrollTo(page, id, i);
  }
  for (const { id, beats } of [...chapters].reverse()) {
    for (let i = beats.length - 1; i >= 0; i--) {
      await scrollTo(page, id, i);
      assert.equal(await css(page, id).locator('.scroll-panel .beat-copy').textContent(), beats[i].title);
    }
  }
  await scrollTo(page, 'microcirculation', 0, .86);
  assert.equal(await css(page, 'microcirculation').locator('.scroll-panel .beat-copy').textContent(), chapters[3].beats[0].title);
  await scrollTo(page, 'microcirculation', 0, .95, 1);
  assert.equal(await css(page, 'microcirculation').locator('.scroll-panel .beat-copy').textContent(), chapters[3].beats[1].title);
  await scrollTo(page, 'microcirculation', 0, .86);
  assert.equal(await css(page, 'microcirculation').locator('.scroll-panel .beat-copy').textContent(), chapters[3].beats[0].title);
  for (const [topic, beat, name] of [
    ['person', 0, '01-person'], ['memory', 1, '02-attention'], ['vessels', 1, '03-network'],
    ['vessels', 2, '04-oxygen'], ['microcirculation', 0, '05-arteriole-normal'],
    ['microcirculation', 1, '06-arteriole-changed'], ['microcirculation', 2, '07-tissue'],
    ['b12', 1, '08-myelin'], ['b12', 2, '09-b12'], ['conclusion', 2, '10-conclusion'],
  ]) {
    await scrollTo(page, topic, beat, .67);
    await page.screenshot({ path: resolve(evidence, label + '-mobile-' + name + '.png') });
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await scrollTo(page, 'vessels', 2, .67);
  await page.screenshot({ path: resolve(evidence, label + '-desktop-oxygen.png') });
  await scrollTo(page, 'conclusion', 2, .67);
  await page.screenshot({ path: resolve(evidence, label + '-desktop-conclusion.png') });

  const stillPage = await browser.newPage({ ...device, reducedMotion: 'reduce' });
  await stillPage.goto(base);
  await stillPage.waitForFunction(() => document.body.classList.contains('motion-off'));
  const staticCards = stillPage.locator('.static-story figure .viewport');
  assert.equal(await staticCards.count(), chapters.reduce((total, chapter) => total + chapter.beats.length, 0));
  assert.equal(await stillPage.locator('.scroll-panel:visible').count(), 0);
  const staticOxygen = css(stillPage, 'vessels').locator('.static-story figure').last();
  const staticSignal = staticOxygen.locator('.particle').first();
  const staticTransform = await staticSignal.getAttribute('transform');
  await staticOxygen.scrollIntoViewIfNeeded();
  assert.equal(await staticSignal.getAttribute('transform'), staticTransform);
  await stillPage.close();
  await page.locator('summary').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('details').getAttribute('open'), '');
  assert.deepEqual(errors, []);
  assert.deepEqual(extraneous, []);
  await page.close();
  return { layoutCases: checks.length, engineVersion: browser.version() };
}

async function touchAndTiming(browser) {
  const page = await browser.newPage({ ...devices['iPhone 15'] });
  const cdp = await page.context().newCDPSession(page);
  await page.goto(base);
  await page.locator('.shot img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  async function gesture(from, to) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: from }] });
    for (let i = 1; i <= 16; i++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: from + (to - from) * i / 16 }] });
      await page.waitForTimeout(22);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(180);
  }
  await scrollTo(page, 'memory', 0, .05);
  await gesture(699, 248);
  await page.waitForFunction(() => document.getElementById('memory').dataset.beat === '1');
  await gesture(230, 730);
  await page.waitForFunction(() => document.getElementById('memory').dataset.beat === '0');

  // Cross each chapter boundary using the native gesture, with no clicks in the story.
  const boundaries = [
    ['person', 0, 'memory'], ['memory', 3, 'vessels'], ['vessels', 2, 'microcirculation'],
    ['microcirculation', 2, 'b12'], ['b12', 2, 'conclusion'],
  ];
  for (const [from, last, to] of boundaries) {
    await scrollTo(page, from, last, .98);
    const panelTop = id => page.locator('#' + id + ' .scroll-panel').evaluate(panel => panel.getBoundingClientRect().top);
    const before = await panelTop(to);
    await gesture(714, 250);
    assert.ok(await panelTop(to) < before - 300, 'Touch should enter ' + to);
    await gesture(228, 745);
    assert.ok(await panelTop(to) > before - 120, 'Reverse touch should return toward ' + from);
  }

  await scrollTo(page, 'vessels', 2, .08);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const metrics = await page.evaluate(async () => {
    const frames = [];
    const beginning = performance.now();
    let previous = beginning;
    const startY = scrollY;
    await new Promise(resolve => {
      const tick = now => {
        frames.push(now - previous);
        previous = now;
        window.scrollTo(0, startY + (now - beginning) * .14);
        if (now - beginning < 1700) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    frames.shift();
    const total = frames.reduce((sum, n) => sum + n, 0);
    frames.sort((a, b) => a - b);
    return { averageFps: Math.round(1000 * frames.length / total), p95FrameMs: Math.round(frames[Math.floor(frames.length * .95)]),
      loadedMs: Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd) };
  });
  await page.close();
  return metrics;
}

(async () => {
  const { chapters } = await import('./story.js');
  await mkdir(evidence, { recursive: true });
  const report = {};
  const chrome = await chromium.launch({ channel: 'chrome' });
  try {
    report.chrome = await verifyLayout(chrome, devices['iPhone 15'], 'chrome', chapters);
    report.touchAndTiming = await touchAndTiming(chrome);
    const offline = await chrome.newPage();
    await offline.goto(pathToFileURL(resolve(__dirname, '../output/Memory-Scroll-Review.html')).href);
    await scrollTo(offline, 'b12', 2);
    assert.equal(await offline.locator('#b12 [data-altered="true"] img').evaluate(img => img.complete && img.naturalWidth > 0), true);
    await offline.close();
    report.offlineHtml = true;
    console.log('Chrome', report.chrome, report.touchAndTiming);
  } finally { await chrome.close(); }
  const safariEngine = await webkit.launch();
  try {
    report.webkit = await verifyLayout(safariEngine, devices['iPhone 15'], 'webkit', chapters);
    console.log('WebKit', report.webkit);
  } finally { await safariEngine.close(); }
  await writeFile(resolve(evidence, 'report.json'), JSON.stringify(report, null, 2) + '\n');
})().catch(error => { console.error(error); process.exitCode = 1; });

