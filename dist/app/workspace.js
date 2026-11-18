import { startMascot } from './mascot.js';

/* ============================================================
   Sift workspace client. Static, dependency-free, CSP-safe.
   All account data comes from the bot's same-origin /api.
   ============================================================ */

const paths={
  search:'M21 21l-4.3-4.3M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z',
  refresh:'M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4',
  discover:'M5 6h4l1 10H2L5 6Zm10 0h4l3 10h-8l1-10ZM6 3v3M18 3v3M10 12h4M2 16a4 4 0 0 0 8 0M14 16a4 4 0 0 0 8 0',
  agent:'M12 2v4M5 7h14v13H5zM8 12h1M15 12h1M9 16h6M2 11v5M22 11v5',
  watch:'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  alerts:'M6 9a6 6 0 0 1 12 0c0 6 3 7 3 7H3s3-1 3-7M10 20a2 2 0 0 0 4 0',
  performance:'M3 3v18h18M7 15l4-4 3 3 6-6',
  groups:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.1a4 4 0 0 1 0 7.8M22 21v-2a4 4 0 0 0-3-3.9M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  book:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14ZM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  droplet:'M12 2.7s-7 7.6-7 12.3a7 7 0 0 0 14 0c0-4.7-7-12.3-7-12.3Z',
  coins:'M9 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM18.1 10.4A6 6 0 1 1 10.4 18.1M8 6h1v4',
  shield:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10ZM9 12l2 2 4-4',
  sparkles:'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z',
  info:'M12 16v-5M12 8h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  pause:'M9 5v14M15 5v14',
  close:'m6 6 12 12M18 6 6 18',
  copy:'M9 9h11v11H9zM5 15H4V4h11v1',
  clock:'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  check:'M20 6 9 17l-5-5',
  arrow:'M5 12h14M13 6l6 6-6 6',
  chevrons:'m7 15 5 5 5-5M7 9l5-5 5 5',
  sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon:'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
  system:'M3 4h18v12H3zM8 20h8M12 16v4',
  send:'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z',
  external:'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  plus:'M12 5v14M5 12h14',
  clipboard:'M9 3h6v4H9zM8 5H5v16h14V5h-3',
  logout:'M15 4h4v16h-4M10 17l5-5-5-5M15 12H3',
  keyboard:'M2 6h20v12H2zM6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10',
  alert:'M12 3 2 21h20L12 3ZM12 10v5M12 18h.01',
  pulse:'M3 12h4l3-8 4 16 3-8h4',
  sort:'m7 15 5 5 5-5',
  user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0',
  play:'m8 5 11 7-11 7Z',
  layers:'m12 2 10 5-10 5L2 7l10-5ZM2 17l10 5 10-5M2 12l10 5 10-5',
};
const $=s=>document.querySelector(s);
const SVG='http://www.w3.org/2000/svg';
const icon=name=>{const s=document.createElementNS(SVG,'svg');s.setAttribute('class','icon');s.setAttribute('aria-hidden','true');s.setAttribute('viewBox','0 0 24 24');const p=document.createElementNS(SVG,'path');p.setAttribute('d',paths[name]||paths.agent);s.append(p);return s;};
function el(tag,attrs={},...children){
  const n=document.createElement(tag);
  for(const [key,val] of Object.entries(attrs)){
    if(val===false||val===null||val===undefined)continue;
    if(key==='class')n.className=val;else if(key.startsWith('on'))n.addEventListener(key.slice(2),val);else n.setAttribute(key,val===true?'':val);
  }
  for(const c of children.flat())if(c!==null&&c!==undefined&&c!==false)n.append(c instanceof Node?c:document.createTextNode(String(c)));
  return n;
}
function svg(tag,attrs={},...children){const n=document.createElementNS(SVG,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);for(const c of children.flat())if(c!=null)n.append(c instanceof Node?c:document.createTextNode(String(c)));return n;}
const button=(label,fn,style='outline',extra={})=>el('button',{class:`button ${style}`,type:'button',onclick:fn,...extra},label);
const commandButton=(label,cmd,style='outline')=>button(label,()=>runCommand(cmd,label),style);

/* ---------- Formatting ---------- */
const date=t=>Number.isFinite(t)?new Date(t).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'No observation yet';
const short=ca=>typeof ca==='string'?`${ca.slice(0,6)}…${ca.slice(-5)}`:'Unknown token';
const fmt=(n,digits=0)=>Number.isFinite(n)?new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',minimumFractionDigits:0,maximumFractionDigits:digits}).format(n):'Unknown';
const compact=n=>Number.isFinite(n)?new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',notation:'compact',maximumFractionDigits:n<1e4?1:n<1e6?1:2}).format(n):'Unknown';
const pct=(n,sign=true)=>Number.isFinite(n)?`${sign&&n>0?'+':''}${n.toFixed(Math.abs(n)>=100?0:1)}%`:'—';
const plural=(n,word)=>`${n} ${word}${n===1?'':'s'}`;
function relative(t){
  if(!Number.isFinite(t))return 'never';
  const diff=t-Date.now(),abs=Math.abs(diff),future=diff>0;
  if(abs<45_000)return future?'in a moment':'just now';
  const units=[['d',86_400_000],['h',3_600_000],['m',60_000]];
  for(const [u,ms] of units)if(abs>=ms){const v=Math.round(abs/ms);return future?`in ${v}${u}`:`${v}${u} ago`;}
  return 'just now';
}
const timeEl=(t,prefix='')=>el('time',{'data-time':Number.isFinite(t)?String(t):false,'data-prefix':prefix||false,datetime:Number.isFinite(t)?new Date(t).toISOString():false,title:Number.isFinite(t)?date(t):false},prefix+relative(t));
const isAddress=s=>typeof s==='string'&&/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s.trim());
const dayLabel=t=>{const d=new Date(t),today=new Date();const start=x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime();const days=Math.round((start(today)-start(d))/86_400_000);return days===0?'Today':days===1?'Yesterday':d.toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'});};

/* Deterministic pixel identicon for a contract address (decorative). */
function identicon(seed,large=false){
  let h=2166136261;for(const ch of String(seed||'?')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}
  const hue=h%360,s=svg('svg',{class:`identicon${large?' lg':''}`,viewBox:'0 0 5 5','aria-hidden':'true',shapeRendering:'crispEdges'});
  s.append(svg('rect',{width:5,height:5,fill:`hsl(${hue} 62% 90%)`}));
  let bits=h^(h>>>7);
  for(let y=0;y<5;y++)for(let x=0;x<3;x++){
    if(bits&1){const fill=`hsl(${(hue+((x+y)%2?18:0))%360} 58% ${y%2?34:42}%)`;s.append(svg('rect',{x,y,width:1,height:1,fill}));if(x<2)s.append(svg('rect',{x:4-x,y,width:1,height:1,fill}));}
    bits=(bits>>>1)|((bits&1)<<31);bits^=bits>>>3;
  }
  return s;
}

/* ---------- State ---------- */
let csrf=null,workspace=null,view='discover',pending=false,refreshTimer,authGeneration=0,dialogVersion=0,refreshSequence=0,connectionState='loading';
let watchDraft={ca:'',drop:'',hours:''};
let sort={key:'checked',dir:'desc'},showAll=false,lastDiscoverKey='',lastDetailKey='';
const nav=[['discover','Discover','discover','D'],['agent','My agent','agent','A'],['watchlist','Watchlist','watch','W'],['alerts','Alerts','alerts','L'],['performance','Performance','performance','P'],['groups','Groups','groups','G']];
const HORIZONS=[15,60,360,1440];
const horizonLabel=h=>h<60?`${h}m`:h<1440?`${h/60}h`:`${h/1440}d`;
const store={get(k){try{return localStorage.getItem(k);}catch{return null;}},set(k,v){try{localStorage.setItem(k,v);}catch{}}};

/* ---------- Toasts ---------- */
function toast(text,kind='info'){
  const region=$('#toast');
  while(region.children.length>=3)region.firstChild.remove();
  const node=el('div',{class:`toast ${kind}`},icon(kind==='success'?'check':kind==='error'?'alert':'info'),el('span',{},text));
  region.append(node);
  setTimeout(()=>{node.classList.add('leaving');setTimeout(()=>node.remove(),260);},4500);
}

/* ---------- Session & API ---------- */
function clearSession(){
  authGeneration++;csrf=null;workspace=null;watchDraft={ca:'',drop:'',hours:''};connectionState='loading';
  $('#criteria').value='';$('#reply').value='';$('#reply-form').hidden=true;updateCount();
  $('#report-dialog').close();$('#report-content').replaceChildren();$('#report-actions').replaceChildren();render();
}
async function api(path,body){
  const generation=authGeneration;
  const response=await fetch(`/api/${path}`,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json','X-Sift-CSRF':csrf||''}:{},...(body?{body:JSON.stringify(body)}:{signal:AbortSignal.timeout(15000)})});
  let data;try{data=await response.json();}catch{throw Error('The web backend is not connected at this address. Open the workspace link sent by /web in Telegram.');}
  if(!response.ok){if(response.status===401&&generation===authGeneration)clearSession();throw Error(data.error||'Sift is unavailable. Please try again.');}return data;
}
function setBusy(value){pending=value;$('#report-dialog').setAttribute('aria-busy',String(value));document.querySelectorAll('#report-actions button,#criteria-form button,#reply-form button').forEach(b=>b.disabled=value);$('#criteria-form button').classList.toggle('loading',value&&$('#report-dialog').open===false);}
function dialog(title){
  dialogVersion++;$('#report-title').textContent=title;$('#report-content').replaceChildren();$('#report-actions').replaceChildren();$('#reply-form').hidden=true;
  closePalette();
  if(!$('#report-dialog').open)$('#report-dialog').showModal();$('#report-dialog').scrollTop=0;document.body.classList.add('sheet-open');
}

/* ---------- Theme ---------- */
function themeMode(){return store.get('sift-theme')||'system';}
function applyTheme(mode){
  const root=document.documentElement;
  if(mode==='light'||mode==='dark')root.setAttribute('data-theme',mode);else root.removeAttribute('data-theme');
  store.set('sift-theme',mode);
  const dark=mode==='dark'||(mode==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name=theme-color]').forEach(m=>{if(mode==='system')m.setAttribute('content',m.media.includes('dark')?'#0c0c0b':'#f6f5f0');else m.setAttribute('content',dark?'#0c0c0b':'#f6f5f0');});
  const t=$('#theme-toggle');t.replaceChildren(icon(dark?'sun':'moon'));t.setAttribute('aria-label',dark?'Switch to light theme':'Switch to dark theme');
  document.querySelectorAll('[data-theme-option]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeOption===mode)));
}
function toggleTheme(){const dark=document.documentElement.getAttribute('data-theme')==='dark'||(!document.documentElement.hasAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches);applyTheme(dark?'light':'dark');}
const themeControl=()=>el('div',{class:'segmented',role:'group','aria-label':'Colour theme'},...[['light','Light','sun'],['dark','Dark','moon'],['system','System','system']].map(([mode,label,glyph])=>el('button',{type:'button','data-theme-option':mode,'aria-pressed':String(themeMode()===mode),onclick:()=>applyTheme(mode)},icon(glyph),label)));

/* ---------- Account dialog ---------- */
function accountOptions(content){
  content.append(el('div',{class:'toolbar'},...nav.filter(n=>['agent','performance','groups'].includes(n[0])).map(([key,label])=>button(label,()=>{$('#report-dialog').close();navigate(key);}))));
  content.append(el('div',{class:'setting-row'},el('strong',{},'Appearance'),themeControl()));
  if(!workspace)return;
  const p=workspace.preferences;
  const pref=(title,description,fields,make)=>{
    const form=el('form',{onsubmit:e=>{e.preventDefault();runCommand(make(new FormData(form)),title);}},...fields,el('button',{class:'button yellow'},'Save preference →'));
    return section(title,el('p',{},description),form);
  };
  content.append(el('details',{class:'advanced-options'},el('summary',{},'Notification preferences'),
    el('p',{class:'report-text'},'Your current preferences stay in place. Change these only when you need to.'),
    pref('Follow-up notifications','Applies to future calls. Setting 0 also stops existing follow-ups.',[el('label',{},'Hours (0–168)',el('input',{name:'hours',type:'number',inputmode:'numeric',min:'0',max:'168',required:'',value:p.followHours}))],d=>`/preferences follow ${d.get('hours')}`),
    pref('Quiet hours · UTC','Suppress discovery and follow-up notifications. Market monitors retain their own controls.',[el('div',{class:'grid-2'},el('label',{},'Start hour (0–23)',el('input',{name:'start',type:'number',inputmode:'numeric',min:'0',max:'23',required:'',...(p.quietStart!==null?{value:p.quietStart}:{})})),el('label',{},'End hour (0–23)',el('input',{name:'end',type:'number',inputmode:'numeric',min:'0',max:'23',required:'',...(p.quietEnd!==null?{value:p.quietEnd}:{})})))],d=>`/preferences quiet ${d.get('start')} ${d.get('end')}`),
    toolbar(commandButton('Turn quiet hours off','/preferences quiet off'),commandButton('All preferences','/preferences'))));
}
function connect(){
  dialog(csrf?'Your account':'Connect your Telegram agent');const content=$('#report-content');
  if(csrf){
    const name=workspace?.user?.name||'A private tester';
    content.append(el('div',{class:'account-head'},el('span',{class:'avatar','aria-hidden':'true'},name[0].toUpperCase()),el('div',{},el('strong',{},name),el('small',{},'Private tester · Signed in through Telegram'))));
    content.append(el('p',{class:'report-text'},`Signed in as ${workspace?.user?.name||'a private tester'}. Your web app and Telegram agent share the same rules and saved observations.`));
    accountOptions(content);
    $('#report-actions').append(button('Sign out',async()=>{try{await api('logout',{});clearSession();$('#report-dialog').close();toast('Signed out. Your scans and rules are unchanged.','success');}catch(e){toast(e.message,'error');}}));return;
  }
  content.append(el('ol',{class:'steps-list'},
    ...[['Open Sift on Telegram','Use the button below or search @SiftAgentbot.'],['Send /web','Your bot replies with a private one-time link.'],['Tap the link','It opens this workspace signed in. It expires in five minutes.']]
      .map(([t,d],i)=>el('li',{class:'step-item'},el('span',{class:'step-num'},String(i+1)),el('div',{},el('strong',{},t),el('small',{},d))))));
  content.append(el('p',{class:'report-text'},'Only configured private testers can sign in. Keep that link private. If /web is unavailable, the operator needs to enable the web backend first.'));
  accountOptions(content);
  $('#report-actions').append(el('a',{class:'button yellow',href:'https://t.me/SiftAgentbot?start=web',target:'_blank',rel:'noopener noreferrer'},icon('send'),'Open Sift on Telegram →'));
}

/* ---------- Commands & reports ---------- */
function showReport(report,title){
  dialog(title);$('#report-content').append(el('div',{class:'report-text'},report.text));
  for(const b of report.buttons??[]){
    if(b.action)$('#report-actions').append(button(b.label,()=>runAction(b.action,title),'yellow'));
    else if(b.copy)$('#report-actions').append(button(b.label,e=>copyCA(b.copy,e.currentTarget)));
    else if(b.url&&b.url.startsWith('https://'))$('#report-actions').append(el('a',{class:'button outline',href:b.url,target:'_blank',rel:'noopener noreferrer'},b.label));
  }
  const draft=workspace?.agent?.draft;if(draft&&draft.step<6){$('#reply-form').hidden=false;$('#reply').value='';}
  if(report.notice)toast(report.notice,'success');
}
async function execute(payload,title){
  if(!csrf){connect();return;}if(pending){toast('Please wait for the current check.');return;}
  dialog(title);const version=dialogVersion,identity=csrf;
  $('#report-content').append(el('div',{class:'busy-line'},el('span',{class:'spinner','aria-hidden':'true'}),el('p',{class:'report-text'},'Checking with your agent…')));setBusy(true);
  const visible=()=>$('#report-dialog').open&&dialogVersion===version;
  try{
    const report=await api('command',{...payload,requestId:crypto.randomUUID()});
    if(csrf!==identity)return;
    await refresh();
    if(csrf!==identity){if(visible())connect();return;}
    if(visible())showReport(report,title);
    else toast('Request finished. Review the saved state for the result.');
  }catch(e){
    if(visible()){
      dialog('Request could not finish');$('#report-content').append(el('div',{class:'notice-line warn'},icon('alert'),el('p',{class:'report-text'},e.message)));
      $('#report-actions').append(csrf?button('Refresh saved state',async()=>{if(await refresh())$('#report-dialog').close();}):button('Get a new sign-in link',connect,'yellow'));
    }else toast(e.message,'error');
  }finally{setBusy(false);}
}
const runCommand=(text,title='Agent review')=>execute({text},title);
const runAction=(action,title)=>execute({action},title);
async function copyCA(ca,target){
  try{
    await navigator.clipboard.writeText(ca);toast('CA copied','success');navigator.vibrate?.(8);
    if(target instanceof HTMLElement&&target.classList.contains('copy')){const before=[...target.childNodes];target.classList.add('copied');target.replaceChildren(icon('check'),'Copied');setTimeout(()=>{target.classList.remove('copied');target.replaceChildren(...before);},1600);}
  }catch{dialog('Copy contract address');const input=el('input',{value:ca,readonly:'','aria-label':'Contract address'});$('#report-content').append(input);input.focus();input.select();toast('Select and copy this address.');}
}
const copyButton=ca=>el('button',{class:'copy',type:'button',onclick:e=>copyCA(ca,e.currentTarget)},icon('copy'),'Copy CA');
function empty(title,text,action,glyph='discover'){return el('div',{class:'empty'},el('span',{class:'empty-visual'},icon(glyph)),el('h3',{},title),el('p',{},text),action??null);}
function section(title,...children){return el('section',{class:'card detail-card'},el('h2',{},title),...children);}
function toolbar(...buttons){return el('div',{class:'toolbar'},...buttons);}

/* ---------- Navigation ---------- */
function navigate(name,{focus=false}={}){
  const next=nav.some(n=>n[0]===name)?name:'discover';const changed=next!==view;view=next;
  if(location.hash!==`#${view}`)history.replaceState(null,'',`#${view}`);
  if(changed){lastDetailKey='';window.scrollTo({top:0,behavior:'instant'});}
  render();
  if(changed){const target=view==='discover'?$('#discover-view'):$('#detail-view');target.classList.remove('view-enter');void target.offsetWidth;target.classList.add('view-enter');if(focus)$('#main').focus({preventScroll:true});}
}
function buildNav(){
  for(const [key,label,glyph,k] of nav)$('#desktop-nav').append(el('a',{href:`#${key}`,class:'nav-item','data-view':key,'aria-label':label,title:`${label} (G then ${k})`,onclick:e=>{e.preventDefault();navigate(key,{focus:true});}},icon(glyph),el('span',{},label),el('span',{class:'nav-count','data-count':key,hidden:true}),el('kbd',{class:'nav-key','aria-hidden':'true'},`G ${k}`)));
  const dock=$('#mobile-nav');
  const item=key=>{const [,label,glyph]=nav.find(n=>n[0]===key);return el('a',{href:`#${key}`,class:'dock-item','data-view':key,'aria-label':label,onclick:e=>{e.preventDefault();navigate(key,{focus:true});}},el('span',{class:'dock-circle'},icon(glyph)),el('span',{},label),key==='alerts'?el('span',{class:'badge-dot','data-alert-dot':'',hidden:true}):null);};
  dock.append(item('discover'),item('watchlist'),
    el('button',{class:'dock-item dock-fab',type:'button','aria-label':'Search and commands',onclick:openPalette},el('span',{class:'dock-circle'},icon('search'))),
    item('alerts'),
    el('button',{class:'dock-item','data-account':'',type:'button','aria-label':'Your account',onclick:connect},el('span',{class:'dock-circle'},icon('user')),el('span',{},'Account')));
}

/* ---------- Screening helpers ---------- */
function resultStatus(result){
  const checks=result.checks??[],required=checks.filter(c=>c.mode==='require');
  if(result.issue)return {label:'Source unavailable',tone:'neutral',key:'neutral'};
  if(required.some(c=>c.state==='fail'))return {label:'Rules not met',tone:'failed',key:'failed'};
  if(result.unresolved||required.some(c=>c.state!=='pass'))return {label:'Needs evidence',tone:'',key:'evidence'};
  if(result.matches===true&&required.length)return checks.some(c=>c.mode==='warn'&&c.state!=='pass')
    ? {label:'Matched · warnings',tone:'',key:'warn'}:{label:'Rules matched',tone:'passed',key:'passed'};
  return {label:'Not qualified',tone:'neutral',key:'neutral'};
}
const observed=(row,field)=>(row.result.checks??[]).find(c=>c.field===field)?.valueObserved;
const fieldMeta={marketCap:['Market cap','coins'],liquidityUsd:['Pool liquidity','droplet'],volume1h:['1h volume','pulse'],poolAgeMinutes:['Pool age','clock']};
const fieldLabel=f=>fieldMeta[f]?.[0]||String(f).replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
function ruleValue(rule){
  const money=n=>compact(n);
  if(rule.field==='marketCap'){if(Number.isFinite(rule.min)&&Number.isFinite(rule.max))return `${money(rule.min)} – ${money(rule.max)}`;if(Number.isFinite(rule.min))return `≥ ${money(rule.min)}`;if(Number.isFinite(rule.max))return `≤ ${money(rule.max)}`;}
  if(rule.field==='poolAgeMinutes'&&Number.isFinite(rule.value))return `≤ ${rule.value} min`;
  if(['liquidityUsd','volume1h'].includes(rule.field)&&Number.isFinite(rule.value))return `≥ ${money(rule.value)}`;
  return rule.mode==='require'?'Evidence required':'Flag if found';
}
function statusCounts(checks){const c={passed:0,warn:0,evidence:0,failed:0,neutral:0};for(const row of checks)c[resultStatus(row.result).key]++;return c;}
function perfStats(calls){
  const sent=(calls??[]).filter(c=>c.delivery==='sent');
  const by=HORIZONS.map(h=>{
    const rows=sent.map(c=>(c.outcomes??[]).find(o=>o.horizon===h)).filter(Boolean);
    const valid=rows.filter(o=>o.state==='observed'&&Number.isFinite(o.data?.netPct));
    return {h,observed:valid.length,wins:valid.filter(o=>o.data.netPct>0).length,mean:valid.length?valid.reduce((s,o)=>s+o.data.netPct,0)/valid.length:null,
      missed:rows.filter(o=>o.state==='missed').length,unavailable:rows.filter(o=>o.state==='unavailable').length,pending:sent.length-rows.length};
  });
  return {sent,by};
}

/* ---------- Discover ---------- */
function discoveryEmpty(){
  if(!csrf)return empty('A place for your discoveries.','Connect your Telegram agent to see its saved checks. No sample coins are shown.',button('Connect Telegram →',connect,'yellow'));
  if(!workspace)return el('div',{'aria-busy':'true','aria-label':'Loading saved checks'},...[0,1,2].map(()=>el('div',{class:'skeleton-row'},el('span'),el('span',{class:'w40'}),el('span'),el('span'))));
  const {draft,approved}=workspace.agent;
  if(!approved&&draft)return empty(draft.pendingRequirements?.length?'Your draft needs clarification.':'Your draft is waiting for review.',
    'Review the saved draft before discovery can start. Your requirements stay in place.',commandButton('Review saved draft →','/agent','yellow'),'sparkles');
  if(!approved)return empty('Your next discovery starts here.','Describe your criteria above, then review and approve them.',null,'sparkles');
  const limited=approved.rules.some(r=>r.mode==='require'&&(r.field==='buyingCoordination'||r.field==='liquidityProtection'&&r.scope==='all'));
  if(limited)return empty('Required evidence is unavailable.','Your saved policy needs complete coverage that Sift cannot currently establish. Unknown checks will continue to block qualifying alerts.',commandButton('Review coverage limits →','/why'),'shield');
  return empty(workspace.scan.state==='active'?'Waiting for saved checks.':'Discovery is '+workspace.scan.state+'.',
    'Completed checks will appear here. Use scan controls to review the current state.',commandButton('Review scan →','/scan'),'pulse');
}
function kpi({label,glyph,value,small,foot,tone,extra,onclick}){
  const body=[el('div',{class:'kpi-top'},icon(glyph),label,onclick?el('span',{class:'kpi-go'},icon('arrow')):null),el('div',{class:`kpi-value${tone?' '+tone:''}`},value,small?el('small',{},small):null),extra??null,el('div',{class:'kpi-foot'},foot)];
  return onclick?el('button',{class:'kpi',type:'button',onclick},...body):el('div',{class:'kpi'},...body);
}
function renderKpis(){
  const row=$('#kpis');row.replaceChildren();
  if(!csrf||!workspace?.agent?.approved){
    // Guided onboarding until rules are approved.
    const draft=workspace?.agent?.draft;
    const steps=[
      ['Connect Telegram','Sign in with a one-time link',Boolean(csrf),connect,'send'],
      ['Describe criteria','Plain English, any detail',Boolean(draft),()=>{navigate('discover');$('#criteria').focus();},'sparkles'],
      ['Review & approve','Nothing runs until you approve',false,()=>csrf?runCommand('/agent','Review saved draft'):connect(),'shield'],
      ['Start discovery','A separate, explicit switch',false,()=>csrf?runCommand('/scan','Scan controls'):connect(),'play'],
    ];
    const current=steps.findIndex(s=>!s[2]);
    steps.forEach(([title,desc,done,fn,glyph],i)=>row.append(el('button',{class:`kpi step${done?' done':''}${i===current?' current':''}`,type:'button',onclick:fn,'aria-label':`Step ${i+1}: ${title}${done?' (done)':''}`},
      el('div',{class:'kpi-top'},el('span',{class:'step-badge'},done?icon('check'):String(i+1)),`Step ${i+1}`,el('span',{class:'kpi-go'},icon('arrow'))),
      el('div',{class:'step-title'},icon(glyph),title),el('div',{class:'kpi-foot'},desc))));
    return;
  }
  const scan=workspace.scan,checks=workspace.candidateChecks??[],counts=statusCounts(checks);
  const active=workspace.monitors.filter(m=>m.state==='active').length,review=workspace.monitors.filter(m=>m.state==='review').length;
  const {sent,by}=perfStats(workspace.calls),h60=by[1];
  const bar=el('div',{class:'stackbar',role:'img','aria-label':`${counts.passed} matched, ${counts.warn} matched with warnings, ${counts.evidence} need evidence, ${counts.failed} not met, ${counts.neutral} unavailable`},
    ...[['passed','seg-passed'],['warn','seg-warn'],['evidence','seg-evidence'],['failed','seg-failed'],['neutral','seg-neutral']].filter(([k])=>counts[k]).map(([k,c])=>{const s=el('span',{class:c});s.style.flexGrow=String(counts[k]);return s;}));
  const means=by.map(b=>b.mean),spark=sparkline(means);
  row.append(
    kpi({label:'Discovery',glyph:'pulse',value:el('span',{class:'kpi-state'},el('span',{class:`pulse-dot${scan.state==='active'?' on':scan.state==='paused'?' warn':''}`}),scan.state),foot:scan.last_run?timeEl(scan.last_run,'Last cycle '):'No cycle completed yet',onclick:()=>navigate('agent',{focus:true})}),
    kpi({label:'Saved checks',glyph:'layers',value:String(checks.length),small:`${counts.passed+counts.warn} matched`,extra:checks.length?bar:null,foot:checks.length?`${counts.evidence} need evidence · ${counts.failed} not met`:'None recorded yet',onclick:()=>$('.candidates-card').scrollIntoView({behavior:'smooth',block:'start'})}),
    kpi({label:'Watchlist',glyph:'watch',value:String(active),small:active===1?'monitor live':'monitors live',foot:review?`${review} awaiting review`:workspace.monitors.length?`${workspace.monitors.length} recent monitors`:'No monitors yet',onclick:()=>navigate('watchlist',{focus:true})}),
    kpi({label:'Paper win rate · 1h',glyph:'performance',value:h60.observed?`${Math.round(h60.wins/h60.observed*100)}%`:'—',small:h60.observed?`${h60.wins}/${h60.observed}`:'',tone:'',extra:means.some(Number.isFinite)?spark:null,foot:`${plural(sent.length,'sent call')} · not actual returns`,onclick:()=>navigate('performance',{focus:true})}),
  );
}
function sparkline(values){
  const pts=values.map((v,i)=>[i,v]).filter(([,v])=>Number.isFinite(v));
  const s=svg('svg',{class:'spark',viewBox:'0 0 100 28',preserveAspectRatio:'none','aria-hidden':'true'});
  if(pts.length<1)return s;
  const max=Math.max(...pts.map(p=>Math.abs(p[1])),1),x=i=>4+i*(92/(values.length-1||1)),y=v=>14-v/max*11;
  s.append(svg('line',{class:'zero',x1:0,x2:100,y1:14,y2:14}));
  s.append(svg('path',{d:pts.map(([i,v],k)=>`${k?'L':'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(''),'vector-effect':'non-scaling-stroke'}));
  const [li,lv]=pts.at(-1);s.append(svg('circle',{cx:x(li),cy:y(lv),r:2.6,'vector-effect':'non-scaling-stroke'}));
  return s;
}
function sortedChecks(){
  const rows=[...(workspace?.candidateChecks??[])];
  const rank={passed:0,warn:1,evidence:2,failed:3,neutral:4};
  const val=row=>sort.key==='checked'?row.checked_at:sort.key==='status'?rank[resultStatus(row.result).key]:observed(row,sort.key);
  rows.sort((a,b)=>{const x=val(a),y=val(b);const fx=Number.isFinite(x),fy=Number.isFinite(y);if(!fx&&!fy)return 0;if(!fx)return 1;if(!fy)return -1;return sort.dir==='asc'?x-y:y-x;});
  return rows;
}
function sortHeader(label,key,cls=''){
  const active=sort.key===key;
  return el('span',{class:cls,role:'columnheader','aria-sort':active?(sort.dir==='asc'?'ascending':'descending'):false},
    el('button',{class:'sort',type:'button','aria-sort':active?(sort.dir==='asc'?'ascending':'descending'):false,onclick:()=>{sort=active?{key,dir:sort.dir==='asc'?'desc':'asc'}:{key,dir:key==='status'?'asc':'desc'};lastDiscoverKey='';render();}},label,icon('sort')));
}
function renderCandidates(){
  const list=$('#candidates'),checks=workspace?.candidateChecks??[];
  $('#candidate-count').textContent=checks.length?`${checks.length} saved check${checks.length===1?'':'s'}`:'Saved checks';
  const key=JSON.stringify([Boolean(csrf),Boolean(workspace),checks,sort,showAll,workspace?.agent?.draft?.pendingRequirements?.length,workspace?.agent?.approved?.rules,workspace?.scan?.state,Boolean(workspace?.agent?.draft)]);
  if(key===lastDiscoverKey)return;lastDiscoverKey=key;
  list.replaceChildren();
  if(!checks.length){list.append(discoveryEmpty());return;}
  list.append(el('div',{class:'column-head',role:'row'},sortHeader('Token','checked'),sortHeader('Market cap','marketCap'),sortHeader('Liquidity','liquidityUsd'),sortHeader('Pool age','poolAgeMinutes','age-column'),el('span',{class:'rules-col',role:'columnheader'},'Rules'),sortHeader('Status','status'),el('span',{role:'columnheader'},el('span',{class:'sr-only'},'Actions'))));
  const rows=sortedChecks(),visible=showAll?rows:rows.slice(0,8);
  visible.forEach((row,i)=>{
    const age=observed(row,'poolAgeMinutes'),status=resultStatus(row.result),cap=observed(row,'marketCap'),liq=observed(row,'liquidityUsd');
    const metric=(label,value,text,cls='')=>Number.isFinite(value)?el('span',{class:`metric${cls?' '+cls:''}`},el('span',{class:'metric-label'},label),text):el('span',{class:`metric unknown${cls?' '+cls:''}`,title:'Unknown'},el('span',{class:'metric-label'},label),el('span',{'aria-hidden':'true'},'—'),el('span',{class:'sr-only'},'Unknown'));
    const r=el('div',{class:'candidate-row observation-row',role:'row'},
      el('div',{class:'token-cell'},identicon(row.token),el('div',{},el('strong',{title:row.token},short(row.token)),el('small',{},timeEl(row.checked_at)))),
      el('div',{class:'metrics-group'},
        metric('Cap ',cap,compact(cap)),metric('Liquidity ',liq,compact(liq)),
        metric('Pool age',age,Number.isFinite(age)?`${Math.round(age)}m`:'Unknown','age-column'),
        el('span',{class:'pips rules-col','aria-label':(row.result.checks??[]).map(c=>`${fieldLabel(c.field)} ${c.state}`).join(', ')||'No rule results'},...(row.result.checks??[]).map(c=>el('span',{class:`pip ${c.state}${c.mode==='warn'?' warn':''}`,title:`${c.state.toUpperCase()} · ${c.description||c.field}`})))),
      el('div',{class:'status-col'},el('button',{class:`badge result-button ${status.tone}`,type:'button','aria-label':`${status.label}: review saved check for ${short(row.token)}`,onclick:()=>candidateReport(row)},status.label)),
      el('div',{class:'row-actions'},copyButton(row.token)));
    r.style.animationDelay=`${Math.min(i,10)*28}ms`;list.append(r);
  });
  if(rows.length>8)list.append(el('div',{class:'show-more'},button(showAll?'Show fewer':`Show all ${rows.length} checks`,()=>{showAll=!showAll;lastDiscoverKey='';render();},'ghost small')));
  list.append(el('div',{class:'legend','aria-hidden':'true'},el('span',{},el('span',{class:'pip pass'}),'Pass'),el('span',{},el('span',{class:'pip fail'}),'Fail'),el('span',{},el('span',{class:'pip unknown'}),'Unknown'),el('span',{},el('span',{class:'pip pass warn'}),'Warning rule')));
}
function candidateReport(row){
  dialog('Saved screening result');
  const content=$('#report-content'),result=row.result,status=resultStatus(result);
  content.append(el('div',{class:'token-head'},identicon(row.token,true),el('div',{},el('span',{class:'mono'},row.token),el('small',{},'Checked ',timeEl(row.checked_at))),),
    el('span',{class:`badge ${status.tone}`},status.label),
    el('p',{class:'report-text'},`Checked ${date(row.checked_at)} against your approved rules. This is a saved observation, not a fresh check or a safety verdict.`));
  if(result.issue)content.append(el('p',{class:'report-text'},result.issue==='MARKET_UNAVAILABLE'?'The market source could not supply this check. Required rules were not verified.':`Source issue: ${result.issue}`));
  for(const check of result.checks??[]){
    const value=Number.isFinite(check.valueObserved)?(check.field==='poolAgeMinutes'?`${Number(check.valueObserved.toFixed(2))} minutes`:fmt(check.valueObserved,6)):null;
    content.append(el('div',{class:'saved-check'},el('span',{class:`pip ${check.state}${check.mode==='warn'?' warn':''}`,'aria-hidden':'true'}),el('strong',{},`${check.state.toUpperCase()} · ${check.description||check.field}`),
      el('p',{},value!==null?el('span',{},'Observed: ',el('span',{class:'obs'},value)):check.state==='unknown'?'Evidence unavailable or incomplete.':'Saved evidence result.'),
      check.mode==='warn'&&check.state!=='pass'?el('p',{},'Warning only; this does not block a match.'):null));
  }
  if(result.unresolved)content.append(el('p',{class:'report-text'},'Unresolved requirements prevented qualification.'));
  if(workspace?.agent?.draft)content.append(el('p',{class:'report-text'},'Your unapproved draft was not used for this check.'));
  if(isAddress(row.token))content.append(el('div',{class:'link-row'},
    el('a',{class:'ext-link',href:`https://solscan.io/token/${row.token}`,target:'_blank',rel:'noopener noreferrer'},'Solscan',icon('external')),
    el('a',{class:'ext-link',href:`https://dexscreener.com/solana/${row.token}`,target:'_blank',rel:'noopener noreferrer'},'DexScreener',icon('external'))));
  $('#report-actions').append(button('Copy CA',e=>copyCA(row.token,e.currentTarget)),button('Check token now',()=>runCommand(`/check ${row.token}`,'Token evidence'),'yellow'));
}

/* ---------- Chrome (shared across views) ---------- */
function greeting(){const h=new Date().getHours();return h<5?'Late night':h<12?'Good morning':h<18?'Good afternoon':'Good evening';}
function alertKey(){if(!workspace)return null;const calls=Math.max(0,...workspace.calls.map(c=>c.id)),mons=Math.max(0,...(workspace.monitoringAlerts??[]).map(a=>a.id));return `${calls}:${mons}`;}
function updateAlertDot(){
  const key=alertKey(),name=`sift-seen:${workspace?.user?.name||''}`;let show=false;
  if(key){const seen=store.get(name);if(seen===null||view==='alerts')store.set(name,key);else show=seen!==key;}
  $('#alert-dot').hidden=!show;document.querySelectorAll('[data-alert-dot]').forEach(n=>n.hidden=!show);
}
function render(){
  document.querySelectorAll('[data-view]').forEach(n=>{if(n.dataset.view===view)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');});
  const title=nav.find(n=>n[0]===view)?.[1]||'Discover';$('#breadcrumb').textContent=title;document.title=view==='discover'?'Sift':`${title} · Sift`;
  $('#discover-view').hidden=view!=='discover';$('#detail-view').hidden=view==='discover';
  $('#connection-banner').hidden=Boolean(csrf);$('#connection').hidden=!csrf;
  $('#connection').classList.toggle('connected',Boolean(csrf)&&connectionState==='connected');
  $('#connection').replaceChildren(el('i'),connectionState==='connected'?'Backend connected':connectionState==='unavailable'?'Connection interrupted':'Loading workspace');
  $('#sync-notice').hidden=!csrf||connectionState!=='unavailable';
  $('#sync-notice p').textContent=workspace?`Connection interrupted. Showing data last loaded ${date(workspace.serverTime)}.`:'Connection interrupted. Your workspace could not be loaded.';
  $('#profile-name').textContent=workspace?.user?.name||'Your workspace';$('#profile-sub').textContent=csrf?'Private tester':'Not signed in';
  const name=workspace?.user?.name||'S';document.querySelectorAll('.avatar').forEach(n=>n.textContent=name[0].toUpperCase());
  const saved=workspace?.agent,current=saved?.draft??saved?.approved;
  $('#agent-name').textContent=current?.name||'Your Sift';
  $('#agent-status').textContent=saved?.draft?'Draft · review required':saved?.approved?`Scan ${workspace.scan.state}`:csrf?'Not configured':'Not connected';
  $('#agent-status').classList.toggle('live',workspace?.scan?.state==='active'&&!saved?.draft);
  $('#mascot-caption').textContent=saved?.draft?'Awaiting your review.':workspace?.scan?.state==='active'?'Your agent is set to scout.':'A curious little companion.';
  $('#sidebar-agent').hidden=!workspace;
  if(workspace){$('#sidebar-agent-name').textContent=current?.name||'Not configured';$('#sidebar-agent-state').textContent=saved?.draft?'Draft · review required':saved?.approved?`Discovery ${workspace.scan.state}`:'No rules yet';$('#sidebar-dot').className=`pulse-dot${workspace.scan.state==='active'&&saved?.approved?' on':saved?.draft?' warn':''}`;}
  const counts={watchlist:workspace?.monitors.filter(m=>['active','review','paused'].includes(m.state)).length,groups:workspace?.groups.length};
  document.querySelectorAll('[data-count]').forEach(n=>{const v=counts[n.dataset.count];n.hidden=!v;n.textContent=v||'';});
  const first=workspace?.user?.name?.split(/\s+/)[0];
  $('#today').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  $('#hero-sub').textContent=first?`${greeting()}, ${first}. Sift through the noise. Find your signal.`:'Sift through the noise. Find your signal.';
  const submit=$('#criteria-form button');submit.firstChild.textContent=saved?.draft?'Review saved draft ':'Review criteria ';
  $('#criteria').disabled=Boolean(saved?.draft);
  $('#criteria').placeholder=saved?.draft?'Your saved draft is waiting. Review it before preparing a new strategy.':'Describe the coins you want to find. Include your market cap range, liquidity and risk requirements.';
  $('#last-cycle').replaceChildren(workspace?.scan?.last_run?timeEl(workspace.scan.last_run,'Last cycle · '):csrf?'No cycle completed yet':'Connect to load your scan');
  renderKpis();renderCandidates();updateAlertDot();
  if(view!=='discover')renderDetail();
}

/* ---------- Detail views ---------- */
function monitorCards(content){
  content.replaceChildren();
  if(!workspace.monitors.length){content.append(section('Your monitors',empty('Nothing on watch yet.','Add a contract address above to prepare a monitor.',null,'watch')));return;}
  const now=Date.now();
  for(const row of workspace.monitors){
    const base=row.baseline?.selected?.liquidityUsd,latest=row.observation?.selected?.liquidityUsd,drop=row.config.dropPercent;
    const change=Number.isFinite(base)&&Number.isFinite(latest)&&base>0?(latest-base)/base*100:null;
    const card=el('section',{class:'card detail-card monitor-card'},
      el('div',{class:'card-head'},identicon(row.token,true),el('div',{},el('h2',{},`Monitor #${row.id}`),el('span',{class:'mono subtle',title:row.token},short(row.token))),el('span',{class:`pill-state ${row.state}`},row.state)),
      el('div',{class:'split-title'},el('span',{class:'subtle'},'Fixed pool · liquidity drop alert'),copyButton(row.token)),
      el('p',{},`${short(row.token)} · ${drop}% liquidity drop · ${row.config.hours} hours`),
      el('div',{class:'facts'},
        el('div',{class:'fact'},el('small',{},'Alert threshold'),el('strong',{},`−${drop}%`)),
        el('div',{class:'fact'},el('small',{},'Baseline liquidity'),el('strong',{},compact(base))),
        el('div',{class:'fact'},el('small',{},'Latest reported'),el('strong',{},compact(latest))),
        el('div',{class:'fact'},el('small',{},'Change vs baseline'),el('strong',{class:Number.isFinite(change)?(change<0?'neg':'pos'):''},pct(change)))));
    if(Number.isFinite(change)){
      const scale=Math.max(drop*1.5,Math.abs(Math.min(change,0)),1),needle=el('span',{class:'needle'}),mark=el('span',{class:'threshold'});
      needle.style.left=`${Math.min(100,Math.max(0,-Math.min(change,0)/scale*100))}%`;mark.style.left=`${drop/scale*100}%`;
      card.append(el('div',{class:'gauge',role:'img','aria-label':`Liquidity change ${pct(change)} against a −${drop}% threshold`},mark,needle),el('div',{class:'progress-meta'},el('span',{},'No drop'),el('span',{},`Threshold −${drop}%`)));
    }
    if(Number.isFinite(row.started_at)&&Number.isFinite(row.ends_at)){
      const done=Math.min(1,Math.max(0,(now-row.started_at)/(row.ends_at-row.started_at))),bar=el('span');bar.style.width=`${done*100}%`;
      card.append(el('div',{class:'progress',role:'progressbar','aria-label':'Monitoring window','aria-valuemin':'0','aria-valuemax':'100','aria-valuenow':String(Math.round(done*100))},bar),
        el('div',{class:'progress-meta'},el('span',{},timeEl(row.started_at,'Started ')),el('span',{},row.ends_at>now?timeEl(row.ends_at,'Ends '):timeEl(row.ends_at,'Ended '))));
    } else if(row.state==='review')card.append(el('div',{class:'notice-line warn'},icon('info'),el('span',{},'Awaiting your review. The baseline is captured only when you start monitoring.')));
    card.append(...[el('p',{},`Last attempt: ${date(row.last_check)}. Latest reported liquidity: ${fmt(latest)}.`),row.issue?el('div',{class:'notice-line warn'},icon('alert'),el('span',{},`Issue: ${row.issue}`)):null,commandButton('Review controls →','/watchlist')].filter(Boolean));
    content.append(card);
  }
}
function detailKey(){
  if(!workspace)return 'none';
  const w=workspace;
  return JSON.stringify([view,w.agent,w.ruleDescriptions,w.scan,w.calls,w.monitors,w.groups,w.performance,w.monitoringAlerts,w.preferences]);
}
function renderDetail(){
  const meta={agent:['My agent','One set of rules. Shared with your Telegram agent.'],watchlist:['Your watchlist','Fixed-pool market monitors. Protection and developer activity are separate checks.'],alerts:['Your alerts','Saved reports and delivery attempts, including uncertain and failed sends.'],performance:['A clearer track record.','Paper observations with missing data kept visible. These are not actual trading returns.'],groups:['Your communities','Private configuration. Explicit admin approval before any group receives alerts.']}[view];
  $('#detail-heading').textContent=meta[0];$('#detail-subtitle').textContent=meta[1];const content=$('#detail-content');
  // Keep the form nodes, focus and cursor intact during background refreshes.
  if(workspace&&view==='watchlist'&&$('#watch-form')){monitorCards($('#monitor-list'));syncPresets();return;}
  const key=detailKey();if(key===lastDetailKey&&content.childElementCount)return;lastDetailKey=key;
  content.replaceChildren();
  if(!workspace){content.append(section('Your private workspace',empty('Connect your agent first.','Your rules and saved data are loaded only after Telegram sign-in.',button('Connect Telegram →',connect,'yellow'),'user')));return;}
  ({agent:agentView,watchlist:watchView,alerts:alertsView,performance:performanceView,groups:groupsView})[view](content);
}
function agentView(content){
  const {draft,approved}=workspace.agent,current=draft??approved,scan=workspace.scan;
  const state=draft?'draft':current?'approved':'stopped';
  content.append(el('section',{class:'card agent-hero'},
    el('div',{class:'agent-glyph','aria-hidden':'true'},el('span',{class:'brand-rabbit'})),
    el('div',{},el('h2',{},current?.name||'Set up your agent'),el('div',{class:'meta'},el('span',{class:`pill-state ${state}`},draft?'Draft · review required':current?'Approved':'Not configured'),el('span',{},`Revision ${workspace.agent.revision??0}`),el('span',{},'·'),el('span',{},`Discovery ${scan.state}`))),
    toolbar(commandButton('Review agent →','/agent','yellow'),commandButton('Scan controls','/scan'),commandButton('Why no matches?','/why'),commandButton('Rule history','/audit'))));
  const rules=current?.rules??[];
  const rulesCard=el('section',{class:'card detail-card'},el('div',{class:'split-title'},el('h2',{},'Screening rules'),el('span',{class:'small-tag'},`${rules.filter(r=>r.mode==='require').length} required · ${rules.filter(r=>r.mode==='warn').length} warning`)));
  if(!rules.length)rulesCard.append(empty('No rules yet.','Describe a strategy in plain English, then review and approve it.',button('Describe a strategy →',()=>{navigate('discover');$('#criteria').focus();},'yellow'),'sparkles'));
  else rulesCard.append(el('div',{class:'rule-grid'},...rules.map((rule,i)=>{const [label,glyph]=fieldMeta[rule.field]??[fieldLabel(rule.field),'shield'];const c=el('article',{class:'rule-card'},el('header',{},el('span',{},icon(glyph),label),el('span',{class:`mode ${rule.mode}`},rule.mode==='require'?'Required':'Warning')),el('div',{class:'rule-value'},ruleValue(rule)),el('p',{},workspace.ruleDescriptions[i]??''));c.style.animationDelay=`${i*40}ms`;return c;})));
  if(current?.pendingRequirements?.length)rulesCard.append(el('div',{class:'unresolved'},el('h3',{},icon('alert'),'Instructions still need review'),...current.pendingRequirements.map(t=>el('p',{},t)),commandButton('Review supported mappings →','/mapextras')));
  rulesCard.append(el('div',{class:'notice-line'},icon('info'),el('span',{},workspace.coverage)));
  content.append(rulesCard);
  content.append(el('div',{class:'grid-2'},
    el('section',{class:'card detail-card'},el('h2',{},'Discovery health'),el('div',{class:'facts'},
      el('div',{class:'fact'},el('small',{},'State'),el('strong',{class:'plain cap'},scan.state)),
      el('div',{class:'fact'},el('small',{},'Last cycle'),el('strong',{class:'plain'},scan.last_run?timeEl(scan.last_run):'Not yet')),
      el('div',{class:'fact'},el('small',{},'Checked'),el('strong',{},String(scan.checked??0))),
      el('div',{class:'fact'},el('small',{},'Matched'),el('strong',{},String(scan.matched??0)))),
      scan.issue?el('div',{class:'notice-line warn'},icon('alert'),el('span',{},scan.issue)):el('p',{class:'subtle'},'Counts describe the latest completed cycle.')),
    el('section',{class:'card detail-card'},el('h2',{},'Controls'),el('p',{},'Changes apply to the agent you share with Telegram. Pausing does not delete rules or history.'),
      toolbar(commandButton('Guided setup','/setup'),button('Describe a strategy',()=>{navigate('discover');$('#criteria').focus();}),commandButton('Pause all activity','/pause'),commandButton('Resume discovery','/resume')))));
}
function syncPresets(){document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(watchDraft[b.dataset.preset]===b.dataset.value)));const help=$('#ca-help');if(help){const v=watchDraft.ca.trim();help.className=`field-help${v?isAddress(v)?' ok':' bad':''}`;help.textContent=!v?'Solana token mint, 32–44 characters.':isAddress(v)?'Looks like a valid Solana address.':'This does not look like a Solana address.';}}
function watchView(content){
  const field=attrs=>el('input',{...attrs,value:watchDraft[attrs.name],oninput:e=>{watchDraft[attrs.name]=e.target.value;syncPresets();}});
  const preset=(name,values,suffix)=>el('div',{class:'presets',role:'group','aria-label':`${name==='drop'?'Drop':'Duration'} presets`},...values.map(v=>el('button',{type:'button',class:'preset','data-preset':name,'data-value':String(v),'aria-pressed':'false',onclick:()=>{watchDraft[name]=String(v);form.querySelector(`[name=${name}]`).value=String(v);syncPresets();}},`${v}${suffix}`)));
  const paste=el('button',{type:'button',class:'paste',onclick:async()=>{try{const t=(await navigator.clipboard.readText()).trim();if(!t)return;watchDraft.ca=t;form.querySelector('[name=ca]').value=t;syncPresets();}catch{toast('Clipboard unavailable. Paste with your keyboard.');}}},icon('clipboard'),'Paste');
  const form=el('form',{id:'watch-form',class:'form-grid',onsubmit:e=>{e.preventDefault();const data=new FormData(form);runCommand(`/watch ${data.get('ca')} ${data.get('drop')} ${data.get('hours')}`,'Review monitor');}},
    el('label',{},'Solana contract address',el('div',{class:'field-wrap'},field({name:'ca',required:'',maxlength:'44',placeholder:'Paste CA',autocomplete:'off',spellcheck:'false',autocapitalize:'off'}),paste),el('span',{id:'ca-help',class:'field-help'},'Solana token mint, 32–44 characters.')),
    el('label',{},'Liquidity drop (%)',field({name:'drop',type:'number',inputmode:'decimal',required:'',min:'.1',max:'100',step:'.1',placeholder:'e.g. 20'}),preset('drop',[10,20,35,50],'%')),
    el('label',{},'Hours to monitor',field({name:'hours',type:'number',inputmode:'numeric',required:'',min:'1',max:'168',placeholder:'e.g. 24'}),preset('hours',[6,24,72,168],'h')),
    el('button',{class:'button yellow'},'Review →'));
  content.append(section('Follow a coin',el('p',{},'Choose your own threshold and duration. Review the baseline before starting.'),form),toolbar(commandButton('Monitor controls','/watchlist'),commandButton('Monitoring alerts','/watchalerts')));
  const monitors=el('div',{id:'monitor-list',class:'grid-2'});content.append(monitors);monitorCards(monitors);syncPresets();
}
function alertsView(content){
  content.append(toolbar(commandButton('Saved discovery reports','/alerts','yellow'),commandButton('Monitoring reports','/watchalerts'),commandButton('Older calls','/calls')));
  const items=[...workspace.calls.map(c=>({kind:'call',at:c.at,data:c})),...(workspace.monitoringAlerts??[]).map(a=>({kind:'monitor',at:a.created_at,data:a}))].sort((a,b)=>b.at-a.at);
  if(!workspace.calls.length)content.append(section('Delivery history',empty('No calls recorded yet.','A source connection is not a qualifying match. Reports appear after screening and a delivery attempt.',null,'alerts')));
  if(!items.length)return;
  const timeline=el('div',{class:'timeline'});let day='';
  items.forEach((item,i)=>{
    const label=dayLabel(item.at);if(label!==day){day=label;timeline.append(el('div',{class:'day-label'},label));}
    let node;
    if(item.kind==='call'){
      const call=item.data,outs=HORIZONS.map(h=>(call.outcomes??[]).find(o=>o.horizon===h));
      node=el('article',{class:'event'},identicon(call.token),
        el('div',{class:'event-body'},el('div',{class:'event-title'},`Call #${call.id}`,el('span',{class:`pill-state ${call.delivery}`},call.delivery)),
          el('div',{class:'event-meta'},el('span',{class:'mono',title:call.token},short(call.token)),timeEl(call.at),el('span',{},`Recorded market cap: ${fmt(call.snapshot?.selected?.marketCap)}`)),
          outs.some(Boolean)?el('div',{class:'horizons','aria-label':'Paper outcomes by horizon'},...HORIZONS.map((h,j)=>{const o=outs[j],v=o?.state==='observed'?o.data?.netPct:null;return el('span',{class:`horizon${Number.isFinite(v)?(v>0?' pos':' neg'):''}`,title:o?o.state:'pending'},`${horizonLabel(h)} ${Number.isFinite(v)?pct(v):o?o.state==='missed'?'missed':'n/a':'…'}`);})):null),
        el('div',{class:'event-actions'},copyButton(call.token),commandButton('View call evidence →',`/performance ${call.id}`)));
    }else{
      const a=item.data;
      node=el('article',{class:'event'},el('span',{class:'event-icon'},icon('droplet')),
        el('div',{class:'event-body'},el('div',{class:'event-title'},`Monitor #${a.watch_id} · ${a.kind==='drop'?'Liquidity drop':a.kind.replace(/_/g,' ')}`,el('span',{class:`pill-state ${a.state}`},a.state)),el('div',{class:'event-meta'},timeEl(a.created_at),el('span',{},'Monitoring report'))),
        el('div',{class:'event-actions'},commandButton('Open report →','/watchalerts')));
    }
    node.style.animationDelay=`${Math.min(i,12)*25}ms`;timeline.append(node);
  });
  content.append(timeline);
}
function performanceView(content){
  const {sent,by}=perfStats(workspace.calls),calls=workspace.calls;
  const h60=by[1],observedTotal=by.reduce((s,b)=>s+b.observed,0),gaps=by.reduce((s,b)=>s+b.missed+b.unavailable,0);
  content.append(el('div',{class:'stats-row'},...[
    [calls.length,'Recent calls loaded','Latest 20 calls',''],
    [counts(calls,'sent'),'Confirmed sends',`${calls.length-counts(calls,'sent')} other delivery states`,''],
    [h60.observed?`${Math.round(h60.wins/h60.observed*100)}%`:'—','Paper win rate · 1h',h60.observed?`${h60.wins} of ${h60.observed} observed`:'No observations yet',''],
    [pct(h60.mean),'Mean paper net · 1h',`${gaps} missing horizon${gaps===1?'':'s'} kept visible`,Number.isFinite(h60.mean)?(h60.mean>=0?'pos':'neg'):''],
  ].map(([v,t,s,tone])=>el('div',{class:'stat'},el('small',{},t),el('strong',{class:tone},String(v)),el('small',{},s)))));
  if(sent.length&&observedTotal){
    content.append(el('div',{class:'grid-2'},
      el('section',{class:'card detail-card'},el('div',{class:'split-title'},el('h2',{},'Mean paper net by horizon'),el('span',{class:'small-tag'},'Sent calls only')),horizonChart(by),el('p',{class:'subtle'},'Fees and slippage frozen at each call. Network fees, MEV and market impact excluded.')),
      el('section',{class:'card detail-card'},el('div',{class:'split-title'},el('h2',{},'Horizon coverage'),el('span',{class:'small-tag'},`${plural(sent.length,'call')}`)),coverageChart(by,sent.length),el('p',{class:'subtle'},'Missed and unavailable horizons are never treated as zero.'))));
    content.append(el('section',{class:'card detail-card'},el('div',{class:'split-title'},el('h2',{},'Call outcomes'),el('span',{class:'small-tag'},'Paper net %')),outcomeMatrix(sent)));
  }
  content.append(el('section',{class:'card detail-card'},el('details',{class:'methodology',open:!observedTotal},el('summary',{},el('h2',{},'All-call observations')),el('div',{class:'report-text'},workspace.performance))),toolbar(commandButton('Browse call history','/calls'),commandButton('Paper-cost settings','/preferences')));
}
const counts=(calls,state)=>calls.filter(c=>c.delivery===state).length;
function horizonChart(by){
  const W=360,H=214,top=24,bottom=44,mid=(H-bottom+top)/2,max=Math.max(5,...by.map(b=>Math.abs(b.mean??0)))*1.15,bw=44,gap=(W-bw*4)/4;
  const s=svg('svg',{class:'chart',viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':by.map(b=>`${horizonLabel(b.h)}: ${b.mean===null?'no observations':pct(b.mean)}`).join('; ')});
  const yOf=v=>mid-v/max*(mid-top);
  s.append(svg('line',{class:'grid',x1:0,x2:W,y1:top,y2:top}),svg('line',{class:'grid',x1:0,x2:W,y1:H-bottom,y2:H-bottom}),svg('line',{class:'axis',x1:0,x2:W,y1:mid,y2:mid}));
  by.forEach((b,i)=>{
    const x=gap/2+i*(bw+gap);
    if(b.mean===null){s.append(svg('rect',{class:'bar-empty',x,y:mid-2,width:bw,height:4,rx:2}),svg('text',{x:x+bw/2,y:mid-10,'text-anchor':'middle'},'—'));}
    else{const y=yOf(b.mean),h=Math.max(2,Math.abs(y-mid));s.append(svg('rect',{class:b.mean>=0?'bar-pos':'bar-neg',x,y:b.mean>=0?y:mid,width:bw,height:h,rx:6}),svg('text',{class:'value',x:x+bw/2,y:b.mean>=0?y-7:mid+h+15,'text-anchor':'middle'},pct(b.mean)));}
    s.append(svg('text',{x:x+bw/2,y:H-22,'text-anchor':'middle'},horizonLabel(b.h)),svg('text',{class:'win',x:x+bw/2,y:H-6,'text-anchor':'middle'},b.observed?`${b.wins}/${b.observed} wins`:''));
  });
  return s;
}
function coverageChart(by,total){
  const W=360,row=36,H=by.length*row+8,lw=40;
  const s=svg('svg',{class:'chart',viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':by.map(b=>`${horizonLabel(b.h)}: ${b.observed} observed, ${b.missed} missed, ${b.unavailable} unavailable, ${b.pending} pending`).join('; ')});
  by.forEach((b,i)=>{
    const y=i*row+6;let x=lw;const w=W-lw-44;
    s.append(svg('text',{x:0,y:y+17},horizonLabel(b.h)));
    [['observed','bar-pos'],['missed','bar-neg'],['unavailable','bar-empty'],['pending','bar-empty']].forEach(([k,c])=>{const width=total?b[k]/total*w:0;if(width>0){const r=svg('rect',{class:c,x,y,width:Math.max(width-2,1),height:22,rx:5});if(k==='pending')r.setAttribute('opacity','.5');s.append(r);x+=width;}});
    s.append(svg('text',{class:'win',x:W-4,y:y+16,'text-anchor':'end'},`${b.observed}/${total}`));
  });
  return s;
}
function outcomeMatrix(sent){
  const table=el('table',{class:'matrix'},el('thead',{},el('tr',{},el('th',{scope:'col'},'Call'),...HORIZONS.map(h=>el('th',{scope:'col'},horizonLabel(h))))));
  const body=el('tbody');
  for(const call of sent){
    body.append(el('tr',{},el('td',{},el('div',{class:'row-token'},identicon(call.token),el('div',{},el('span',{class:'mono'},`#${call.id} · ${short(call.token)}`),el('small',{},timeEl(call.at))))),
      ...HORIZONS.map(h=>{const o=(call.outcomes??[]).find(x=>x.horizon===h),v=o?.data?.netPct;
        if(!o)return el('td',{class:'cell-pending',title:'Not yet due or not yet observed'},'pending');
        if(o.state!=='observed'||!Number.isFinite(v))return el('td',{class:'cell-missed',title:o.data?.reason||o.state},o.state==='missed'?'missed':'n/a');
        const td=el('td',{class:v>=0?'cell-pos':'cell-neg'},pct(v));const a=Math.min(.32,.06+Math.abs(v)/150);td.style.backgroundColor=`color-mix(in srgb, var(${v>=0?'--pos':'--neg'}) ${Math.round(a*100)}%, transparent)`;return td;})));
  }
  table.append(body);return el('div',{class:'matrix-wrap'},table);
}
function groupsView(content){
  content.append(el('section',{class:'card detail-card'},el('h2',{},'Let your agent join the conversation.'),el('p',{},'Add @SiftAgentbot to your group, then send /group@SiftAgentbot connect there. The bot verifies your admin permissions. Return here to review the destination and explicitly enable alerts.'),
    el('ol',{class:'steps-list inline'},...['Add @SiftAgentbot to the group','Send /group@SiftAgentbot connect','Review here and enable'].map((t,i)=>el('li',{class:'step-item'},el('span',{class:'step-num'},String(i+1)),el('div',{},el('strong',{},t))))),
    commandButton('Review group destinations →','/groups','yellow')));
  if(!workspace.groups.length){content.append(section('Connected groups',empty('No destinations connected.','Adding Sift to a group alone does not enable posting.',null,'groups')));return;}
  const grid=el('div',{class:'grid-2'});
  for(const group of workspace.groups)grid.append(el('section',{class:'card detail-card'},
    el('div',{class:'card-head'},el('span',{class:'event-icon'},icon('groups')),el('div',{},el('h2',{},`Group ${group.chat_id}`),el('small',{},group.settings.strategy?'Group strategy':'Follows your private rules')),el('span',{class:`pill-state ${group.state}`},group.state)),
    el('p',{},`Up to ${group.settings.max_per_cycle} alerts per cycle · Minimum ${group.settings.interval_minutes} minutes between attempts.`),
    group.state==='review'&&Number.isFinite(group.expires_at)?el('div',{class:'notice-line warn'},icon('clock'),el('span',{},'Review window ',timeEl(group.expires_at,'closes '),'. Alerts stay off until you enable them.')):null,
    group.issue?el('div',{class:'notice-line warn'},icon('alert'),el('span',{},group.issue)):null,
    toolbar(commandButton('Review & enable','/groups'),commandButton('Group strategy',`/groupstrategy ${group.chat_id}`),commandButton('Pause group',`/grouppause ${group.chat_id}`))));
  content.append(grid);
}

/* ---------- Refresh ---------- */
async function refresh(){
  if(!csrf)return false;const identity=csrf,sequence=++refreshSequence;
  $('#refresh').classList.add('spinning');
  try{const data=await api('workspace');if(csrf!==identity||sequence!==refreshSequence)return false;workspace=data;connectionState='connected';render();return true;}
  catch(e){if(csrf===identity&&sequence===refreshSequence){connectionState='unavailable';render();}return false;}
  finally{if(sequence===refreshSequence)$('#refresh').classList.remove('spinning');}
}
function tokenCheck(prefill=''){
  dialog('Take a closer look');
  const form=el('form',{onsubmit:e=>{e.preventDefault();const values=new FormData(form);runCommand(`/${values.get('kind')} ${values.get('ca')}`,'Token evidence');}},
    el('label',{},'Solana contract address',el('input',{name:'ca',required:'',maxlength:'44',placeholder:'Paste the full CA',autocomplete:'off',spellcheck:'false',autocapitalize:'off',value:prefill})),
    el('p',{class:'report-text'},'Start with a market snapshot and your approved rules.'),
    el('details',{class:'advanced-options'},el('summary',{},'More evidence options'),el('label',{},'Evidence to request',el('select',{name:'kind'},...['check','risk','liquidity','verify','poolcoverage'].map(k=>el('option',{value:k},({check:'Market snapshot',risk:'Risk evidence',liquidity:'Liquidity protection',verify:'Compare market sources',poolcoverage:'Indexed pool coverage'})[k]))))),
    el('div',{class:'dialog-actions'},el('button',{class:'button yellow'},'Check token →')));
  $('#report-content').append(form);
  if(!prefill)setTimeout(()=>form.querySelector('[name=ca]').focus(),50);
}

/* ---------- Command palette ---------- */
let paletteItems=[],paletteIndex=0;
function paletteCommands(query){
  const q=query.trim(),out=[];
  if(isAddress(q)){
    out.push({group:'Token',label:`Check market snapshot · ${short(q)}`,glyph:'search',run:()=>csrf?runCommand(`/check ${q}`,'Token evidence'):connect(),always:true});
    out.push({group:'Token',label:`Request risk evidence · ${short(q)}`,glyph:'shield',run:()=>csrf?runCommand(`/risk ${q}`,'Token evidence'):connect(),always:true});
    out.push({group:'Token',label:`Monitor liquidity · ${short(q)}`,glyph:'watch',run:()=>{watchDraft.ca=q;navigate('watchlist');setTimeout(()=>$('#watch-form [name=drop]')?.focus(),60);},always:true});
    out.push({group:'Token',label:`Copy address · ${short(q)}`,glyph:'copy',run:()=>copyCA(q),always:true});
  }
  for(const [key,label,glyph,k] of nav)out.push({group:'Go to',label,glyph,hint:`G ${k}`,run:()=>navigate(key,{focus:true})});
  const cmd=(label,text,glyph,title=label)=>({group:'Agent',label,glyph,run:()=>runCommand(text,title)});
  out.push({group:'Agent',label:'Check a token',glyph:'search',hint:'C',run:()=>csrf?tokenCheck():connect()},
    {group:'Agent',label:'Describe new criteria',glyph:'sparkles',hint:'N',run:()=>{navigate('discover');setTimeout(()=>$('#criteria').focus(),30);}},
    cmd('Review agent','/agent','agent'),cmd('Scan controls','/scan','pulse'),cmd('Why no matches?','/why','info'),cmd('Source status','/sources','layers'),cmd('Rule history','/audit','clock'),cmd('Guided setup','/setup','sparkles'),
    cmd('Saved discovery reports','/alerts','alerts'),cmd('Monitoring reports','/watchalerts','droplet'),cmd('Call history','/calls','performance'),cmd('Preferences','/preferences','user'),
    cmd('Pause all activity','/pause','pause'),cmd('Resume discovery','/resume','play'));
  out.push({group:'Workspace',label:'Refresh workspace',glyph:'refresh',hint:'R',run:()=>csrf?refresh().then(ok=>toast(ok?'Workspace refreshed':'Refresh failed',ok?'success':'error')):connect()},
    {group:'Workspace',label:'Toggle dark mode',glyph:'moon',hint:'T',run:toggleTheme},
    {group:'Workspace',label:'Keyboard shortcuts',glyph:'keyboard',hint:'?',run:shortcuts},
    {group:'Workspace',label:csrf?'Account':'Connect Telegram',glyph:'user',run:connect},
    {group:'Workspace',label:'Open Sift on Telegram',glyph:'send',run:()=>window.open('https://t.me/SiftAgentbot','_blank','noopener,noreferrer')},
    {group:'Workspace',label:'Documentation',glyph:'book',run:()=>window.open('https://siftagent.gitbook.io/sift/','_blank','noopener,noreferrer')});
  for(const row of (workspace?.candidateChecks??[]).slice(0,30))out.push({group:'Saved checks',label:`${short(row.token)} · ${resultStatus(row.result).label}`,search:row.token,glyph:'layers',run:()=>candidateReport(row)});
  if(!q)return out.filter(c=>c.group!=='Saved checks');
  const lower=q.toLowerCase();
  return out.map(c=>{if(c.always)return {...c,score:1000};const hay=(c.label+' '+(c.search||'')+' '+c.group).toLowerCase();const at=hay.indexOf(lower);if(at>=0)return {...c,score:500-at,match:c.label.toLowerCase().indexOf(lower)};let i=0;for(const ch of hay){if(ch===lower[i])i++;if(i===lower.length)break;}return i===lower.length?{...c,score:100}:null;}).filter(Boolean).sort((a,b)=>b.score-a.score);
}
function renderPalette(){
  const list=$('#palette-list'),q=$('#palette-input').value;paletteItems=paletteCommands(q);paletteIndex=Math.min(paletteIndex,Math.max(0,paletteItems.length-1));
  list.replaceChildren();
  if(!paletteItems.length){list.append(el('div',{class:'palette-empty'},`No results for “${q}”.`));return;}
  let group='';
  paletteItems.forEach((c,i)=>{
    if(c.group!==group){group=c.group;list.append(el('div',{class:'palette-group',role:'presentation'},group));}
    let label=c.label;if(Number.isInteger(c.match)&&c.match>=0){const n=q.trim().length;label=[c.label.slice(0,c.match),el('mark',{},c.label.slice(c.match,c.match+n)),c.label.slice(c.match+n)];}
    list.append(el('button',{class:'palette-item',type:'button',role:'option',id:`pal-${i}`,'aria-selected':String(i===paletteIndex),onmousemove:()=>{if(paletteIndex!==i){paletteIndex=i;highlightPalette();}},onclick:()=>runPalette(i)},icon(c.glyph),el('span',{class:'label'},label),c.hint?el('kbd',{class:'kbd'},c.hint):null));
  });
  $('#palette-input').setAttribute('aria-activedescendant',`pal-${paletteIndex}`);
}
function highlightPalette(){document.querySelectorAll('.palette-item').forEach((n,i)=>n.setAttribute('aria-selected',String(i===paletteIndex)));const cur=$(`#pal-${paletteIndex}`);cur?.scrollIntoView({block:'nearest'});$('#palette-input').setAttribute('aria-activedescendant',`pal-${paletteIndex}`);}
function runPalette(i){const c=paletteItems[i];if(!c)return;closePalette();c.run();}
function openPalette(){if($('#report-dialog').open)$('#report-dialog').close();const p=$('#palette');$('#palette-input').value='';paletteIndex=0;renderPalette();if(!p.open)p.showModal();document.body.classList.add('palette-open');$('#palette-input').focus();}
function closePalette(){const p=$('#palette');if(p.open)p.close();}
$('#palette').addEventListener('close',()=>{document.body.classList.remove('palette-open');$('#palette-list').replaceChildren();});
$('#palette').addEventListener('click',e=>{if(e.target===$('#palette'))closePalette();});
$('#palette-input').addEventListener('input',()=>{paletteIndex=0;renderPalette();});
$('#palette-input').addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'){e.preventDefault();paletteIndex=(paletteIndex+1)%Math.max(1,paletteItems.length);highlightPalette();}
  else if(e.key==='ArrowUp'){e.preventDefault();paletteIndex=(paletteIndex-1+paletteItems.length)%Math.max(1,paletteItems.length);highlightPalette();}
  else if(e.key==='Enter'){e.preventDefault();runPalette(paletteIndex);}
});

/* ---------- Keyboard shortcuts ---------- */
const mod=document.documentElement.classList.contains('is-apple')?'⌘':'Ctrl';
function shortcuts(){
  dialog('Keyboard shortcuts');
  const row=(label,...keys)=>el('div',{class:'shortcut'},el('span',{},label),el('span',{},...keys.map(k=>el('kbd',{class:'kbd'},k))));
  $('#report-content').append(el('div',{class:'shortcuts'},row('Command menu',mod,'K'),row('Command menu','/'),row('Check a token','C'),row('Describe new criteria','N'),row('Refresh workspace','R'),row('Toggle dark mode','T'),
    ...nav.map(([,label,,k])=>row(`Go to ${label}`,'G',k)),row('Review criteria from the composer',mod,'↵'),row('Show this list','?')));
}
let gPressed=0;
document.addEventListener('keydown',e=>{
  const k=e.key;
  if((e.metaKey||e.ctrlKey)&&k.toLowerCase()==='k'){e.preventDefault();$('#palette').open?closePalette():openPalette();return;}
  const t=e.target,typing=t instanceof HTMLElement&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  if(typing||e.metaKey||e.ctrlKey||e.altKey||$('#report-dialog').open||$('#palette').open)return;
  if(gPressed&&Date.now()-gPressed<1200){const target=nav.find(n=>n[3].toLowerCase()===k.toLowerCase());gPressed=0;if(target){e.preventDefault();navigate(target[0],{focus:true});return;}}
  if(k==='g'){gPressed=Date.now();return;}
  if(k==='/'){e.preventDefault();openPalette();}
  else if(k==='?'){e.preventDefault();shortcuts();}
  else if(k==='r'){e.preventDefault();csrf?refresh():connect();}
  else if(k==='t'){e.preventDefault();toggleTheme();}
  else if(k==='c'){e.preventDefault();csrf?tokenCheck():connect();}
  else if(k==='n'){e.preventDefault();navigate('discover');if(!$('#criteria').disabled)$('#criteria').focus();}
});

/* ---------- Wiring ---------- */
function updateCount(){const n=$('#criteria').value.length;const c=$('#criteria-count');c.textContent=`${n} / 800`;c.classList.toggle('near',n>700);}
document.querySelectorAll('[data-icon]').forEach(n=>n.prepend(icon(n.dataset.icon)));
document.querySelectorAll('[data-mod-key]').forEach(n=>{n.textContent=n.textContent.replace('⌘',mod==='⌘'?'⌘':'Ctrl ');});
document.querySelectorAll('[data-command]').forEach(n=>n.addEventListener('click',()=>runCommand(n.dataset.command,n.textContent.replace('→','').trim())));
$('#connect').addEventListener('click',connect);$('#account').addEventListener('click',connect);$('#profile').addEventListener('click',connect);
$('#notifications').addEventListener('click',()=>navigate('alerts',{focus:true}));$('#search-button').addEventListener('click',()=>csrf?tokenCheck():connect());
$('#palette-trigger').addEventListener('click',openPalette);$('#theme-toggle').addEventListener('click',toggleTheme);$('#shortcuts-link').addEventListener('click',shortcuts);
$('#close-report').addEventListener('click',()=>$('#report-dialog').close());
$('#report-dialog').addEventListener('close',()=>document.body.classList.remove('sheet-open'));
$('#report-dialog').addEventListener('click',e=>{if(e.target===$('#report-dialog')&&!pending)$('#report-dialog').close();});
$('#criteria').addEventListener('input',updateCount);
$('#criteria').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey)){e.preventDefault();$('#criteria-form').requestSubmit();}});
$('#criteria-form').addEventListener('submit',e=>{e.preventDefault();if(workspace?.agent?.draft)return runCommand('/agent','Review saved draft');const text=$('#criteria').value.trim();if(!text){toast('Describe your criteria first.');$('#criteria').focus();return;}runCommand(`/describe ${text}`,'Review your criteria');});
$('#reply-form').addEventListener('submit',e=>{e.preventDefault();const value=$('#reply').value.trim();if(value)runCommand(value,'Guided setup');});
$('#refresh').addEventListener('click',()=>csrf?refresh():connect());
$('#retry-sync').addEventListener('click',async()=>{const b=$('#retry-sync');b.disabled=true;try{await refresh();}finally{b.disabled=false;}});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>applyTheme(themeMode()));
window.addEventListener('scroll',()=>$('.topbar').classList.toggle('scrolled',scrollY>4),{passive:true});
window.addEventListener('online',()=>{toast('Back online','success');if(csrf)refresh();});
window.addEventListener('offline',()=>toast('You are offline. Showing saved data.','error'));
setInterval(()=>document.querySelectorAll('time[data-time]').forEach(n=>{n.textContent=(n.dataset.prefix||'')+relative(Number(n.dataset.time));}),30_000);

async function loadSession(code){
  if(code){history.replaceState(null,'',location.pathname+'#discover');clearSession();navigate('discover');}
  const generation=++authGeneration;
  try{const session=await api(code?'login':'session',code?{code}:undefined);if(generation!==authGeneration)return;csrf=session.csrf;render();const loaded=await refresh();if(code&&loaded)toast('Connected to your Telegram agent.','success');}
  catch(e){if(code){dialog('Sign-in needs attention');$('#report-content').append(el('div',{class:'notice-line warn'},icon('alert'),el('p',{class:'report-text'},e.message)));$('#report-actions').append(button('Get a new sign-in link',connect,'yellow'));}}
}
window.addEventListener('hashchange',()=>{const code=new URLSearchParams(location.hash.slice(1)).get('login');if(code)loadSession(code);else navigate(location.hash.slice(1));});
document.addEventListener('visibilitychange',()=>{clearInterval(refreshTimer);if(!document.hidden){if(!pending)refresh();refreshTimer=setInterval(()=>{if(!pending)refresh();},30_000);}});
buildNav();applyTheme(themeMode());startMascot();updateCount();
const login=new URLSearchParams(location.hash.slice(1)).get('login');
if(login)history.replaceState(null,'',location.pathname+'#discover');
navigate(login?'discover':location.hash.slice(1));
await loadSession(login);
refreshTimer=setInterval(()=>{if(!pending&&!document.hidden)refresh();},30_000);
