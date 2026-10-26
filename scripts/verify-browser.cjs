/* Verify the public visitor journey, local artwork and accessible motion. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../dist');
const artifacts = path.resolve(__dirname, '../artifacts/browser');
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.jpg':'image/jpeg', '.woff':'font/woff' };
const server = http.createServer(async (req,res) => {
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname.endsWith('/') ? pathname+'index.html' : pathname));
  if (!file.startsWith(root+path.sep)) { res.writeHead(403).end(); return; }
  try { const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(data); }
  catch { res.writeHead(404).end(); }
});
(async () => {
  await fs.mkdir(artifacts,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin=`http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined});
  try {
    const page=await browser.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/api/session'))errors.push(`${r.status()} ${r.url()}`);});
    for(const width of [320,390,650,768,1024,1440]){
      await page.setViewportSize({width,height:1000});
      assert.equal((await page.goto(origin)).status(),200);
      await page.waitForSelector('.mascot-card.ready');await page.evaluate(()=>document.fonts.ready);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}px`);
      assert.match(await page.locator('h1').innerText(),/Find coins that\s+match your rules\./);
      const bounds=await page.locator('#hero-title').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width,`Heading clipped at ${width}px`);
      assert(await page.locator('.header-actions a[href="/app/"]').isVisible(),'Open app must stay visible on mobile');
      assert(await page.locator('#motion').isVisible());
      await page.screenshot({path:path.join(artifacts,`sift-${width}.png`),fullPage:true});
      console.log(`PASS layout, heading and app entry point ${width}px`);
    }
    await page.locator('.mascot-card').scrollIntoViewIfNeeded();await page.waitForTimeout(400);
    const pixels=()=>page.locator('#mascot-canvas').evaluate(c=>c.toDataURL());
    const moving=await pixels();await page.waitForTimeout(160);assert.notEqual(await pixels(),moving);
    await page.locator('#motion').click();await page.waitForTimeout(350);
    assert.equal(await page.locator('#motion').getAttribute('aria-pressed'),'true');
    const paused=await pixels();await page.waitForTimeout(180);assert.equal(await pixels(),paused);
    await page.locator('#motion').click();await page.waitForTimeout(350);assert.notEqual(await pixels(),paused);
    const yellow=await page.locator('#mascot-canvas').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>200&&d[i+1]>150&&d[i+2]<100)n++;return n;});
    assert(yellow>3000,'Rabbit artwork must be visible');console.log('PASS original rabbit artwork, animation, pause and resume');
    const invalidAnchors=await page.locator('a[href^="#"]').evaluateAll(links=>links.map(a=>a.getAttribute('href')).filter(href=>!document.getElementById(href.slice(1))));assert.deepEqual(invalidAnchors,[]);
    await page.locator('.faq-list summary').first().click();assert(await page.locator('.faq-list details').first().getAttribute('open')!==null);
    await page.setViewportSize({width:390,height:844});await page.goto(origin);
    await page.locator('.menu-toggle').click();assert(await page.locator('#navigation').isVisible());await page.keyboard.press('Escape');assert(!await page.locator('#navigation').isVisible());
    await page.locator('.menu-toggle').click();await page.locator('#navigation a[href="#product"]').click();assert(!await page.locator('#navigation').isVisible());
    await page.locator('.menu-toggle').click();await page.setViewportSize({width:1440,height:1000});await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
    for(const selector of ['.header-actions a[href="/app/"]','.welcome-actions a[href="/app/"]','.product-window a[href="/app/"]','.closing-actions a[href="/app/"]']){
      await page.goto(origin);await page.locator(selector).click();await page.waitForURL(u=>u.pathname==='/app/');assert(await page.locator('#criteria-form').isVisible());
    }
    console.log('PASS mobile menu, FAQ, internal links and website-to-app navigation');
    const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});const rp=await reduced.newPage();await rp.goto(origin);await rp.waitForSelector('.mascot-card.ready');assert.equal(await rp.locator('#motion').getAttribute('aria-pressed'),'true');
    const fallback=await browser.newContext();await fallback.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=()=>null;});const fp=await fallback.newPage();await fp.goto(origin);assert(await fp.locator('.scene-fallback').isVisible());assert(!await fp.locator('#motion').isVisible());
    const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const np=await noJS.newPage();await np.goto(origin);assert(await np.locator('#hero-title').isVisible());assert(await np.locator('.scene-fallback').isVisible());assert(await np.locator('.header-actions a[href="/app/"]').isVisible());assert(!await np.locator('#motion').isVisible());
    assert.deepEqual(errors,[]);console.log('PASS reduced motion, no-canvas/no-JS fallbacks and no browser errors or missing assets');
  } finally {await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
