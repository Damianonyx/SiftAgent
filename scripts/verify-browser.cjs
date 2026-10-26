/* Real-browser regression checks for the static website. Run with Playwright installed. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../dist');
const artifacts = path.resolve(__dirname, '../artifacts/browser');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.woff': 'font/woff' };
const server = http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try { const data = await fs.readFile(file); res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }).end(data); }
  catch { res.writeHead(404).end(); }
});
(async () => {
  await fs.mkdir(artifacts, { recursive: true });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    for (const width of [320, 390, 650, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal((await page.goto(url)).status(), 200);
      await page.waitForSelector('.canvas-ready');
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
      assert(overflow.scroll <= width, `Horizontal overflow at ${width}px: ${overflow.scroll}`);
      const collisions = await page.evaluate(() => {
        const a = document.querySelector('.welcome-copy').getBoundingClientRect();
        const b = document.querySelector('.simulation').getBoundingClientRect();
        return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      });
      assert.equal(collisions, false, `Hero overlap at ${width}px`);
      assert(await page.locator('#hero-title').isVisible());
      const headlineFits = await page.evaluate(() => {
        const text = document.querySelector('#hero-title em').getBoundingClientRect();
        const copy = document.querySelector('.welcome-copy').getBoundingClientRect();
        return text.right <= copy.right + 2;
      });
      assert(headlineFits, `Headline is clipped at ${width}px`);
      await page.screenshot({ path: path.join(artifacts, `sift-${width}.png`), fullPage: true });
      console.log(`PASS responsive layout ${width}px`);
    }
    // The canvas must remain a working simulation rather than a static replacement.
    await page.locator('.simulation').scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);
    const pixels = () => page.locator('#signal-canvas').evaluate(c => c.toDataURL());
    const before = await pixels(); await page.waitForTimeout(150); assert.notEqual(await pixels(), before);
    await page.locator('#toggle-motion').click();
    assert.equal(await page.locator('#toggle-motion').getAttribute('aria-pressed'), 'true');
    assert(await page.locator('#scatter-pixels').isDisabled());
    const paused = await pixels(); await page.waitForTimeout(180); assert.equal(await pixels(), paused);
    await page.locator('#toggle-motion').click();
    assert.equal(await page.locator('#toggle-motion').getAttribute('aria-pressed'), 'false');
    await page.locator('#scatter-pixels').click(); await page.waitForTimeout(150); assert.notEqual(await pixels(), paused);
    await page.waitForTimeout(3500);
    await page.mouse.move(20, 20);
    await page.screenshot({ path: path.join(artifacts, 'hero-desktop.png') });
    console.log('PASS simulation animates, pauses, resumes and scatters');
    for (const [id, panel] of [['tab-evidence', 'panel-evidence'], ['tab-monitor', 'panel-monitor'], ['tab-rules', 'panel-rules']]) {
      await page.locator(`#${id}`).click();
      assert.equal(await page.locator(`#${id}`).getAttribute('aria-selected'), 'true');
      assert(await page.locator(`#${panel}`).isVisible());
      assert.equal(await page.locator('[role=tabpanel]:visible').count(), 1);
    }
    await page.locator('#tab-rules').focus(); await page.keyboard.press('ArrowDown');
    assert.equal(await page.locator('#tab-evidence').getAttribute('aria-selected'), 'true');
    await page.locator('#next-step').click(); assert(await page.locator('#panel-monitor').isVisible());
    await page.locator('[data-demo-step="1"]').click(); assert(await page.locator('#panel-evidence').isVisible());
    await page.locator('.terminal').screenshot({ path: path.join(artifacts, 'walkthrough.png') });
    await page.locator('.faq-list summary').first().click();
    assert(await page.locator('.faq-list details').first().getAttribute('open') !== null);
    console.log('PASS walkthrough tabs, arrow keys, next button, feature shortcuts and FAQ');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(url); await page.waitForSelector('.canvas-ready');
    await page.locator('.menu-toggle').click(); assert(await page.locator('#navigation').isVisible());
    await page.keyboard.press('Escape'); assert(!(await page.locator('#navigation').isVisible()));
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.locator('.menu-toggle').click(); await page.locator('#navigation a[href="#about"]').click();
    assert(!(await page.locator('#navigation').isVisible()));
    await page.locator('.menu-toggle').click();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    console.log('PASS mobile navigation: open, Escape, anchor close and resize reset');
    const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
    const r = await reduced.newPage(); await r.goto(url); await r.waitForSelector('.canvas-ready');
    assert.equal(await r.locator('#toggle-motion').getAttribute('aria-pressed'), 'true');
    assert(await r.locator('#scatter-pixels').isDisabled());
    await r.screenshot({ path: path.join(artifacts, 'mobile-reduced-motion.png'), fullPage: true });
    await r.screenshot({ path: path.join(artifacts, 'hero-mobile.png') });
    const fallback = await browser.newContext();
    await fallback.addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; });
    const f = await fallback.newPage(); await f.goto(url);
    assert(await f.locator('#mascot-source').isVisible()); assert(!(await f.locator('#motion-controls').isVisible()));
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const n = await noJS.newPage(); await n.goto(url);
    assert(await n.locator('#mascot-source').isVisible()); assert(await n.locator('#hero-title').isVisible());
    assert.equal(await n.locator('a[href="https://siftagent.gitbook.io/sift/"]').count() > 0, true);
    console.log('PASS reduced motion, unavailable canvas and JavaScript-disabled fallback');
    assert.deepEqual(errors, [], 'Browser errors or failed local resources');
    console.log('PASS no browser errors or missing local assets');
    // Optional external reference capture stays separate from local assertions.
    if (process.env.CAPTURE_REFERENCE === '1') {
      const reference = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      try {
        await reference.goto('https://www.gloam.trade/', { waitUntil: 'networkidle', timeout: 30000 });
        await reference.screenshot({ path: path.join(artifacts, 'gloam-reference.jpg'), fullPage: true, quality: 70 });
        await reference.screenshot({ path: path.join(artifacts, 'gloam-hero.jpg'), quality: 75 });
      } catch (error) { console.log(`Reference capture unavailable: ${error.message.split('\n')[0]}`); }
    }
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
