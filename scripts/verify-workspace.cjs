/* Browser-to-bot integration using an isolated, in-memory fixture. No live calls. */
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {existsSync}=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

(async()=>{
  const bot=path.resolve(process.env.SIFT_BOT_ROOT||'../sift-agent-build');
  const {fixture,input,CA}=await import(pathToFileURL(path.join(bot,'test/web-fixture.js')));
  const origin='http://127.0.0.1:4179';
  const f=await fixture({root:path.resolve(__dirname,'../dist/app'),origin,port:4179});
  const browser=await chromium.launch({headless:true,...(existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});
  const artifacts=path.resolve(__dirname,'../artifacts/workspace');await fs.mkdir(artifacts,{recursive:true});
  try {
    const errors=[];const context=await browser.newContext({viewport:{width:1440,height:1000},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('/api/session'))errors.push(`${r.status()} ${new URL(r.url()).pathname}`);});
    await page.goto(origin+'/app/');await page.waitForSelector('.mascot-card.ready');
    assert(await page.getByText('A place for your discoveries.').isVisible());
    assert(!await page.getByText('AstroMog').count());
    await page.locator('#connect').click();assert(await page.getByText('Connect your Telegram agent',{exact:true}).isVisible());await page.locator('#close-report').click();
    await page.screenshot({path:path.join(artifacts,'desktop-disconnected.png'),fullPage:true});
    const link=f.server.telegram(input('/web'),f.allowedUserIds).reply_markup.inline_keyboard[0][0].url;
    await page.goto(link);await page.waitForSelector('.connection.connected');
    assert(!page.url().includes('login='));assert.equal(await page.evaluate(()=>document.cookie),'');
    await page.locator('#criteria').fill('market cap between $20k and $60k');
    await page.locator('#criteria-form button').click();
    await page.getByRole('button',{name:'Use interpreted draft',exact:true}).click();
    await page.locator('#close-report').click();
    await page.locator('#criteria-form button').click();
    await page.getByRole('button',{name:'Approve rules',exact:true}).click();
    await page.locator('#close-report').click();
    assert(f.agents.get(42).approved);assert.equal(f.agents.discoveryGet(42).state,'stopped');
    await page.getByRole('button',{name:/Scan controls/}).click();
    await page.getByRole('button',{name:'Start discovery',exact:true}).click();await page.locator('#close-report').click();
    assert.equal(f.agents.discoveryGet(42).state,'active');
    await f.discovery.cycle();await page.locator('#refresh').click();await page.waitForSelector('.observation-row');
    await page.getByRole('button',{name:'Copy CA',exact:true}).first().click();assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),CA);
    console.log('PASS sign-in, HTTP-only cookie, criteria review, approval, separate activation, shared runner result and Copy CA');
    for(const view of ['agent','watchlist','alerts','performance','groups']){await page.locator(`#desktop-nav [data-view="${view}"]`).click();assert(await page.locator('#detail-heading').isVisible());}
    await page.locator('#profile').click();assert.equal(await page.locator('#detail-heading').textContent(),'Make it yours.');
    await page.locator('#desktop-nav [data-view="watchlist"]').click();
    await page.locator('[name="ca"]').fill(CA);await page.locator('[name="drop"]').fill('20');await page.locator('[name="hours"]').fill('24');await page.getByRole('button',{name:'Review →',exact:true}).click();
    await page.getByRole('button',{name:'Start market monitoring',exact:true}).click();await page.locator('#close-report').click();assert.equal(f.agents.watchList(42)[0].state,'active');
    console.log('PASS all workspace views and monitor review/start using bot handlers');
    await page.locator('#desktop-nav [data-view="discover"]').click();
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:width<650?844:1000});
      await page.waitForTimeout(150);
      const mascotBox=await page.locator('#mascot-canvas').boundingBox();
      assert(mascotBox.width>200&&mascotBox.height>200,`Mascot collapsed at ${width}`);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Horizontal overflow at ${width}`);
      await page.screenshot({path:path.join(artifacts,`workspace-${width}.png`),fullPage:true});
    }
    const image=()=>page.locator('#mascot-canvas').evaluate(c=>c.toDataURL());
    const moving=await image();await page.waitForTimeout(150);assert.notEqual(await image(),moving);
    await page.locator('#motion').click();const paused=await image();await page.waitForTimeout(150);assert.equal(await image(),paused);await page.locator('#motion').click();
    await page.setViewportSize({width:390,height:844});await page.locator('#mobile-nav [data-view="settings"]').click();await page.getByRole('button',{name:'Groups',exact:true}).click();assert.equal(await page.locator('#detail-heading').textContent(),'Your communities');
    const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});const rp=await reduced.newPage();await rp.goto(origin+'/app/');await rp.waitForSelector('.mascot-card.ready');assert.equal(await rp.locator('#motion').getAttribute('aria-pressed'),'true');
    await page.setViewportSize({width:1440,height:1000});await page.locator('#account').click();await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.waitForSelector('#connection-banner:visible');assert(!await page.locator('.observation-row').count());
    assert.deepEqual(errors,[]);
    console.log('PASS responsive 320/390/768/1440, mascot motion/pause/reduced motion, mobile routing, sign-out and no JS/CSP errors');
  } finally {await browser.close();await f.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
