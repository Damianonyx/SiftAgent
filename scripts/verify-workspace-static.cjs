// Standalone frontend checks; no bot, Telegram or provider credentials.
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {existsSync}=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff':'font/woff'};
const server=http.createServer(async(req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+(name.endsWith('/')?name+'index.html':name));
  if(!file.startsWith(root+path.sep)){res.writeHead(404).end();return;}
  try{const data=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'}).end(data);}catch{res.writeHead(404).end();}
});
(async()=>{
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const browser=await chromium.launch({headless:true,...(existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{}),args:['--no-sandbox']});
  const dir=path.resolve(__dirname,'../artifacts/workspace');await fs.mkdir(dir,{recursive:true});
  try{
    const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const url=`http://127.0.0.1:${server.address().port}/app/`;
    await page.goto(url);await page.waitForSelector('.mascot-card.ready');
    for(const width of [320,390,768,1440]){
      await page.setViewportSize({width,height:900});await page.waitForTimeout(100);
      const mascotBox=await page.locator('#mascot-canvas').boundingBox();
      assert(mascotBox.width>200&&mascotBox.height>200,`Mascot collapsed at ${width}`);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await page.screenshot({path:path.join(dir,`signed-out-${width}.png`),fullPage:true});
    }
    const yellow=await page.locator('#mascot-canvas').evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>200&&d[i+1]>150&&d[i+2]<100&&d[i+3]>150)n++;return n;});
    assert(yellow>3000,'Rabbit silhouette must be visible, not only particles');
    await page.locator('#connect').click();assert(await page.getByText('Connect your Telegram agent',{exact:true}).isVisible());await page.keyboard.press('Escape');
    await page.locator('#desktop-nav [data-view="groups"]').click();assert(await page.getByText('Connect your agent first.').isVisible());
    assert.deepEqual(errors,[]);
    console.log('PASS signed-out workspace, responsive layouts, visible pixel rabbit, navigation and sign-in instructions');
  }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
