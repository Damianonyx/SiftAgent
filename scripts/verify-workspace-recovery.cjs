/* Mobile reviews and recovery against the real bot, with isolated synthetic data. */
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
  const origin='http://127.0.0.1:4181';
  const f=await fixture({root:path.resolve(__dirname,'../dist/app'),origin,port:4181});
  const browser=await chromium.launch({headless:true,...(existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});
  const artifacts=path.resolve(__dirname,'../artifacts/workspace');await fs.mkdir(artifacts,{recursive:true});
  const context=await browser.newContext({...devices['Pixel 7']});const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const settled=()=>page.waitForFunction(()=>document.querySelector('#report-dialog').getAttribute('aria-busy')!=='true');
  const click=async label=>{await page.getByRole('button',{name:label,exact:true}).click();await settled();};
  const close=async()=>{await settled();await page.locator('#close-report').click();};
  const login=async id=>{const link=f.server.telegram(input('/web',id),f.allowedUserIds).reply_markup.inline_keyboard[0][0].url;await page.goto(link);await page.waitForSelector('.connection.connected',{state:'attached'});};
  const refresh=async()=>{
    const response=page.waitForResponse(r=>r.url().endsWith('/api/workspace'));
    await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await response;
  };
  try{
    const original='Require 100% liquidity protection with six months remaining, or verified LP burns. Require developer still holds tokens; allow partial sales but flag them; report transfers separately from sales; exclude confirmed bundles or coordinated buying; flag suspicions; unknown required checks must not qualify.';
    const market=[{field:'marketCap',mode:'require',min:10000,max:100000},{field:'liquidityUsd',mode:'require',value:15000}];
    const saved={revision:1,approved:null,draft:{name:'Strict scout',step:6,rules:market,pendingRequirements:[original]}};
    f.agents.put(42,saved);
    await login(42);
    assert(await page.locator('#mobile-nav').isVisible());assert(!await page.locator('.sidebar').isVisible());
    assert(await page.getByText('Your draft needs clarification.',{exact:true}).isVisible());
    await page.locator('#criteria-form button').click();await settled();
    assert(!await page.getByRole('button',{name:'Approve rules',exact:true}).count());
    await click('Review supported mappings');
    await click('Selected pool — preview');assert.deepEqual(f.agents.get(42),saved);
    assert.match(await page.locator('#report-content').textContent(),/Other pools may be unprotected/);
    await click('Back to scope choices');await click('All pools — preview');assert.deepEqual(f.agents.get(42),saved);
    await click('Apply mapping to draft');
    const mapped=f.agents.get(42);assert.equal(mapped.approved,null);assert.deepEqual(mapped.draft.rules.slice(0,2),market);
    assert.equal(mapped.draft.mappedExtras.originalText,original);assert.equal(mapped.draft.mappedExtras.liquidityScope,'all');
    await click('Approve rules');await close();
    const approved=f.agents.get(42).approved;assert.equal(approved.rules.length,5);assert.equal(f.agents.discoveryGet(42).state,'stopped');
    assert(await page.getByText('Required evidence is unavailable.',{exact:true}).isVisible());
    await page.locator('#account').click();await page.getByRole('button',{name:'My agent',exact:true}).click();
    await click('Scan controls');await click('Start discovery');await close();
    await f.discovery.cycle();assert.equal(f.sent.length,0);
    await page.locator('#mobile-nav [data-view="discover"]').click();await refresh();
    await page.getByRole('button',{name:/Needs evidence: review saved check/}).click();
    assert.match(await page.locator('#report-content').textContent(),/UNKNOWN.*All pools/s);await close();
    assert.deepEqual(f.agents.get(42).approved,approved);
    console.log('PASS phone layout, explicit scope preview/apply/approval, retained requirements, separate scan activation and no alert with unknown required evidence');

    // A refresh must not replace a field the user is editing, including its caret.
    await page.locator('#mobile-nav [data-view="watchlist"]').click();
    await page.locator('#watch-form [name=ca]').fill(CA);await page.locator('#watch-form [name=drop]').fill('25');await page.locator('#watch-form [name=hours]').fill('12');
    await page.locator('#watch-form [name=ca]').focus();
    await page.evaluate(()=>{window.typedField=document.querySelector('#watch-form [name=ca]');window.typedField.setSelectionRange(5,9);});
    await refresh();
    assert(await page.evaluate(()=>document.querySelector('#watch-form [name=ca]')===window.typedField&&document.activeElement===window.typedField&&window.typedField.selectionStart===5&&window.typedField.selectionEnd===9));
    await page.locator('#mobile-nav [data-view="alerts"]').click();await page.locator('#mobile-nav [data-view="watchlist"]').click();
    assert.equal(await page.locator('#watch-form [name=ca]').inputValue(),CA);
    const outage=route=>route.abort('internetdisconnected');await page.route('**/api/workspace',outage);
    await page.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));
    await page.waitForSelector('#sync-notice:visible');assert.equal(await page.locator('.connection.connected').count(),0);
    assert.equal(await page.locator('#watch-form [name=drop]').inputValue(),'25');
    await page.screenshot({path:path.join(artifacts,'mobile-connection-recovery.png'),fullPage:true});
    await page.unroute('**/api/workspace',outage);await page.locator('#retry-sync').click();
    await page.waitForSelector('.connection.connected',{state:'attached'});assert(!await page.locator('#sync-notice').isVisible());
    assert.equal(await page.locator('#watch-form [name=hours]').inputValue(),'12');
    console.log('PASS typed monitor inputs and cursor survive refresh, navigation, connection failure and recovery');

    // Let the server finish, but hold its response while the user closes the dialog.
    let release,received;const held=new Promise(r=>release=r),responseReceived=new Promise(r=>received=r);
    const delay=async route=>{const response=await route.fetch();received();await held;await route.fulfill({response});};
    await page.route('**/api/command',delay);
    await page.getByRole('button',{name:'Monitor controls',exact:true}).click();await responseReceived;
    await page.locator('#close-report').click();await page.locator('#account').click();
    release();await settled();assert.equal(await page.locator('#report-title').textContent(),'Your account');
    await page.unroute('**/api/command',delay);await close();
    assert.deepEqual(f.agents.get(42).approved,approved);
    console.log('PASS a late command response does not reopen a dismissed dialog or replace a newer dialog');

    // Revocation removes private state and unsaved form values before another sign-in.
    await page.locator('#account').click();
    f.server.telegram(input('/web logout'),f.allowedUserIds);await refresh();
    await page.waitForSelector('#watch-form',{state:'detached'});assert.equal(await page.locator('.connection.connected').count(),0);
    assert(!await page.locator('#report-dialog').isVisible());assert.equal(await page.locator('#report-content').textContent(),'');
    const simpler={name:'Market scout',rules:[market[0],{field:'liquidityUsd',mode:'warn',value:15000}],pendingRequirements:[]};
    f.agents.put(57,{revision:1,approved:simpler,draft:null});
    const key=criteriaKey(simpler),at=Date.now(),snapshot=(cap,liquidity)=>({selected:{marketCap:cap,liquidityUsd:liquidity}});
    const observations=[
      [CA,evaluateAgent(simpler,snapshot(40000,35000))],
      ['11111111111111111111111111111114',evaluateAgent(simpler,snapshot(200000,null))],
      ['11111111111111111111111111111115',evaluateAgent(simpler,snapshot(null,35000))],
      ['11111111111111111111111111111116',{matches:false,issue:'MARKET_UNAVAILABLE'}],
      ['11111111111111111111111111111117',evaluateAgent(simpler,snapshot(40000,null))],
    ];
    for(const [token,result] of observations)f.agents.discoveryRecord(57,key,token,at,result);
    await login(57);
    for(const label of ['Rules matched','Rules not met','Needs evidence','Source unavailable','Matched · warnings']){
      const result=page.getByRole('button',{name:new RegExp('^'+label+': review saved check')});assert(await result.isVisible());
      await result.click();assert(await page.locator('#report-content').getByText(label,{exact:true}).isVisible());
      if(label==='Rules not met')assert.match(await page.locator('#report-content').textContent(),/FAIL.*Market cap.*Observed: \$200,000/s);
      if(label==='Matched · warnings')assert.match(await page.locator('#report-content').textContent(),/Warning only; this does not block a match/);
      if(label==='Source unavailable')assert.match(await page.locator('#report-content').textContent(),/Required rules were not verified/);
      await close();
    }
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:path.join(artifacts,'mobile-saved-checks.png'),fullPage:true});
    await page.locator('#mobile-nav [data-view="watchlist"]').click();
    for(const name of ['ca','drop','hours'])assert.equal(await page.locator(`#watch-form [name=${name}]`).inputValue(),'');
    assert.equal(f.agents.get(57).draft,null);assert.deepEqual(f.agents.get(57).approved,simpler);assert.deepEqual(errors,[]);
    console.log('PASS revoked-session cleanup, isolated user forms, accurate screening statuses and read-only saved evidence');
  }catch(e){await page.screenshot({path:path.join(artifacts,'recovery-failure.png'),fullPage:true}).catch(()=>{});throw e;}
  finally{await browser.close();await f.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
