/* Local HTTPS tunnel regression. No live Telegram, providers or credentials. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { existsSync } = require('node:fs');
const { execFileSync } = require('node:child_process');
const http = require('node:http');
const https = require('node:https');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sift-proxy-test-'));
  let proxy, fixture, browser;
  try {
    // Self-signed TLS is confined to this disposable localhost test server.
    execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
      '-keyout', path.join(directory, 'key.pem'), '-out', path.join(directory, 'cert.pem'),
      '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'],
    { stdio:'ignore', timeout:10000 });
    const observations = [];
    proxy = https.createServer({ key:await fs.readFile(path.join(directory,'key.pem')), cert:await fs.readFile(path.join(directory,'cert.pem')) }, (req,res) => {
      if (req.url === '/_test-attacker') {
        res.writeHead(200,{'Content-Type':'text/html'}).end('<!doctype html><title>Isolated cross-origin test</title>');
        return;
      }
      const headers = { ...req.headers, host:'localhost:3000' };
      if (headers.origin) headers.origin = 'http://localhost:3000';
      const upstream = http.request(fixture.url + req.url, { method:req.method, headers }, response => {
        observations.push({ method:req.method, path:req.url.split('?')[0], site:req.headers['sec-fetch-site'],
          originalOrigin:req.headers.origin, rewrittenOrigin:headers.origin, status:response.statusCode });
        res.writeHead(response.statusCode,response.headers);
        response.pipe(res);
      });
      upstream.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
      req.pipe(upstream);
    });
    await new Promise(resolve => proxy.listen(0,'127.0.0.1',resolve));
    const origin = `https://localhost:${proxy.address().port}`;
    const bot = path.resolve(process.env.SIFT_BOT_ROOT || '../sift-agent-build');
    const { fixture:createFixture, input } = await import(pathToFileURL(path.join(bot,'test/web-fixture.js')));
    fixture = await createFixture({ root:path.resolve(__dirname,'../dist/app'), origin,
      webConfig:{ secure:true, codespaceLocalHosts:['localhost:3000'] } });
    browser = await chromium.launch({ headless:true,
      ...(existsSync('/usr/bin/chromium') ? { executablePath:'/usr/bin/chromium' } : {}), args:['--no-sandbox'] });
    const context = await browser.newContext({ ignoreHTTPSErrors:true });
    const page = await context.newPage();
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    const link = fixture.server.telegram(input('/web'),fixture.allowedUserIds).reply_markup.inline_keyboard[0][0].url;
    await page.goto(link);
    await page.waitForSelector('.connection.connected');
    assert(!page.url().includes('login='));
    assert.equal(await page.evaluate(() => document.cookie), '');
    const cookie = (await context.cookies(origin)).find(c => c.name === '__Host-sift');
    assert(cookie?.secure && cookie.httpOnly && cookie.sameSite === 'Strict');
    assert(observations.some(r => r.path === '/api/login' && r.status === 200 && r.site === 'same-origin' &&
      r.originalOrigin === origin && r.rewrittenOrigin === 'http://localhost:3000'));
    const changed = await page.evaluate(async () => {
      const session = await (await fetch('/api/session')).json();
      return (await fetch('/api/command', { method:'POST',
        headers:{'Content-Type':'application/json','X-Sift-CSRF':session.csrf},
        body:JSON.stringify({requestId:crypto.randomUUID(),text:'/preferences follow 24'}) })).status;
    });
    assert.equal(changed,200);
    assert.equal(fixture.agents.preferences(42).followHours,24);
    console.log('PASS HTTPS browser sign-in, Secure/HttpOnly cookie and authenticated command through Host + Origin rewrites');

    const attackPage = await context.newPage();
    await attackPage.goto(`https://127.0.0.1:${proxy.address().port}/_test-attacker`);
    const attackerLink = fixture.server.telegram(input('/web',57),fixture.allowedUserIds).reply_markup.inline_keyboard[0][0].url;
    await attackPage.evaluate(async ({origin,code}) => {
      await fetch(origin+'/api/login', {method:'POST',mode:'no-cors',credentials:'include',
        headers:{'Content-Type':'text/plain'},body:JSON.stringify({code})});
    }, {origin,code:new URL(attackerLink).hash.slice(7)});
    const attack = observations.findLast(r => r.path === '/api/login');
    assert.equal(attack.site,'cross-site');
    assert.equal(attack.rewrittenOrigin,'http://localhost:3000');
    assert.equal(attack.status,403);
    console.log('PASS cross-origin browser login stays blocked even when the proxy rewrites its Origin');

    const logout = await page.evaluate(async () => {
      const session = await (await fetch('/api/session')).json();
      return (await fetch('/api/logout',{method:'POST',headers:{'Content-Type':'application/json','X-Sift-CSRF':session.csrf},body:'{}'})).status;
    });
    assert.equal(logout,200);
    assert(!(await context.cookies(origin)).some(c => c.name === '__Host-sift'));
    assert.equal(await page.evaluate(async () => (await fetch('/api/workspace')).status),401);
    assert.deepEqual(errors,[]);
    console.log('PASS logout, private-data protection and no page JavaScript errors');
  } finally {
    if (browser) await browser.close();
    if (proxy) await new Promise(resolve => proxy.close(resolve));
    if (fixture) await fixture.close();
    await fs.rm(directory,{recursive:true,force:true});
  }
})().catch(error => { console.error(error); process.exitCode=1; });
