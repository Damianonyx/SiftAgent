/* Workspace features against the real bot web server, with an isolated,
 * synthetic, in-memory fixture. No Telegram, providers or credentials. */
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {existsSync}=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium,devices}=require('playwright');

(async()=>{
  const bot=path.resolve(process.env.SIFT_BOT_ROOT||'../sift-agent-build');
  const load=file=>import(pathToFileURL(path.join(bot,file)));
  const {fixture,input,CA}=await load('test/web-fixture.js');
  const {criteriaKey}=await load('src/discovery-store.js');
  const {evaluateAgent}=await load('src/rules.js');
  const {seedWorkspace}=await import(pathToFileURL(path.join(__dirname,'workspace-seed.mjs')));
  const origin='http://127.0.0.1:4183';
  const f=await fixture({root:path.resolve(__dirname,'../dist/app'),origin,port:4183});
  seedWorkspace(f,{criteriaKey,evaluateAgent,CA});
  const browser=await chromium.launch({headless:true,...(existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});
  const artifacts=path.resolve(__dirname,'../artifacts/workspace');await fs.mkdir(artifacts,{recursive:true});
  const link=id=>f.server.telegram(input('/web',id),f.allowedUserIds).reply_markup.inline_keyboard[0][0].url;
  const errors=[];
  const watch=page=>{page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/401/.test(m.text()))errors.push(m.text());});};
  try{
    const context=await browser.newContext({viewport:{width:1440,height:950},permissions:['clipboard-read','clipboard-write']});
    const page=await context.newPage();watch(page);
    await page.goto(link(42));await page.waitForSelector('.connection.connected');

    // Dashboard summary derived from saved data.
    const kpis=page.locator('#kpis .kpi');assert.equal(await kpis.count(),4);
    assert.match(await kpis.nth(0).textContent(),/active/i);
    assert.match(await kpis.nth(1).textContent(),/^.*9.*5 matched/s);
    assert.match(await kpis.nth(3).textContent(),/75%.*3\/4/s);
    assert.equal(await page.locator('.observation-row').count(),8);
    await page.getByRole('button',{name:'Show all 9 checks'}).click();assert.equal(await page.locator('.observation-row').count(),9);
    // Sorting by market cap, descending then ascending (unknown values last).
    const caps=()=>page.locator('.observation-row .metrics-group .metric:first-child').evaluateAll(n=>n.map(x=>x.textContent.replace(/^Cap\s*/,'')));
    await page.locator('.column-head .sort',{hasText:'Market cap'}).click();
    assert.deepEqual((await caps()).slice(0,2),['$420K','$182K']);assert.match((await caps()).at(-1),/—|Unknown/);
    await page.locator('.column-head .sort',{hasText:'Market cap'}).click();
    assert.equal((await caps())[0],'$12K');
    console.log('PASS dashboard summary, show-all and sortable saved checks');

    // Copy feedback.
    const copy=page.locator('.observation-row .copy').first();await copy.click();
    await page.waitForSelector('.observation-row .copy.copied');assert.equal(await copy.textContent(),'Copied');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()).then(t=>t.length>30),true);

    // Command palette: navigation, fuzzy filtering and contract detection.
    await page.keyboard.press('Control+k');await page.waitForSelector('#palette[open]');
    await page.keyboard.type('perf');assert.equal(await page.locator('.palette-item[aria-selected=true] .label').textContent(),'Performance');
    await page.keyboard.press('Enter');assert.equal(await page.locator('#detail-heading').textContent(),'A clearer track record.');
    assert(await page.locator('.chart').first().isVisible());assert.equal(await page.locator('.matrix tbody tr').count(),4);
    assert.match(await page.locator('.matrix').textContent(),/missed/);
    await page.keyboard.press('/');await page.keyboard.type(CA);
    assert.match(await page.locator('.palette-item').first().textContent(),/Check market snapshot/);
    await page.locator('.palette-item',{hasText:'Monitor liquidity'}).click();
    assert.equal(await page.locator('#watch-form [name=ca]').inputValue(),CA);
    await page.getByRole('button',{name:'24h'}).click();assert.equal(await page.locator('#watch-form [name=hours]').inputValue(),'24');
    assert.match(await page.locator('#ca-help').textContent(),/valid Solana address/);
    // Choosing a different contract while the Watchlist is already open updates the form itself.
    const other='So11111111111111111111111111111111111111112';
    await page.keyboard.press('Control+k');await page.keyboard.type(other);
    await page.locator('.palette-item',{hasText:'Monitor liquidity'}).click();
    assert.equal(await page.locator('#watch-form [name=ca]').inputValue(),other);
    console.log('PASS command palette navigation, filtering, contract actions and monitor presets');

    // Keyboard navigation and shortcuts dialog.
    await page.locator('body').click({position:{x:5,y:500}});
    await page.keyboard.press('g');await page.keyboard.press('l');assert.equal(await page.locator('#detail-heading').textContent(),'Your alerts');
    assert(await page.locator('.timeline .event').count()>=5);assert(await page.getByText('Monitor #1 · Liquidity drop').isVisible());
    await page.keyboard.press('g');await page.keyboard.press('a');assert.equal(await page.locator('#detail-heading').textContent(),'My agent');
    assert.equal(await page.locator('.rule-card').count(),3);assert.match(await page.locator('.rule-card').first().textContent(),/\$20K – \$250K/);
    await page.keyboard.press('Shift+?');assert.equal(await page.locator('#report-title').textContent(),'Keyboard shortcuts');await page.keyboard.press('Escape');
    console.log('PASS keyboard navigation, alerts timeline, rule cards and shortcut help');

    // Theme persists across reloads and is available in the account dialog.
    await page.keyboard.press('t');const theme=await page.evaluate(()=>document.documentElement.dataset.theme);assert(['dark','light'].includes(theme));
    await page.reload();await page.waitForSelector('.connection.connected');assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),theme);
    await page.locator('#account').click();await page.getByRole('button',{name:'System'}).click();
    assert.equal(await page.evaluate(()=>document.documentElement.hasAttribute('data-theme')),false);await page.locator('#close-report').click();
    await page.screenshot({path:path.join(artifacts,'features-desktop.png'),fullPage:true});
    console.log('PASS theme toggle, persistence and system preference');

    // Phone: dock search, bottom sheet and carousel summary without page overflow.
    const phone=await browser.newContext({...devices['iPhone 13']});const mp=await phone.newPage();watch(mp);
    await mp.goto(link(42));await mp.waitForSelector('.connection.connected',{state:'attached'});
    assert(await mp.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await mp.getByRole('button',{name:'Search and commands'}).click();await mp.waitForSelector('#palette[open]');await mp.keyboard.press('Escape');
    await mp.getByRole('button',{name:/^Needs evidence: review saved check/}).click();
    await mp.waitForTimeout(450);const sheet=await mp.locator('#report-dialog').boundingBox(),vh=mp.viewportSize().height;
    assert(Math.abs(sheet.y+sheet.height-vh)<2,'Dialog should be a bottom sheet on phones');
    await mp.screenshot({path:path.join(artifacts,'features-phone-sheet.png')});
    await phone.close();
    console.log('PASS phone dock command menu, bottom-sheet dialog and no horizontal overflow');
    assert.deepEqual(errors,[]);
  }finally{await browser.close();await f.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
