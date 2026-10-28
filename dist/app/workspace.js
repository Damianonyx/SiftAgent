import { startMascot } from './mascot.js';

const paths={search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',refresh:'M20 7v5h-5M4 17v-5h5M6 7a7 7 0 0 1 12-2l2 4M4 15l2 4a7 7 0 0 0 12-2',discover:'M5 6h4l1 10H2L5 6Zm10 0h4l3 10h-8l1-10ZM6 3v3M18 3v3M10 12h4M2 16a4 4 0 0 0 8 0M14 16a4 4 0 0 0 8 0',agent:'M12 2v4M5 7h14v13H5zM8 12h1M15 12h1M9 16h6M2 11v5M22 11v5',watch:'m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z',alerts:'M6 9a6 6 0 0 1 12 0c0 6 3 7 3 7H3s3-1 3-7M9 20h6',performance:'M4 21V11M10 21V3M16 21V7M22 21V15',groups:'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M16 4a4 4 0 0 1 0 8M18 14a4 4 0 0 1 4 4v3M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',settings:'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',book:'M4 3h14v18H4V3ZM4 17h14M8 7h6M8 11h6',sliders:'M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6',droplet:'M12 2S4 10 4 15a8 8 0 0 0 16 0C20 10 12 2 12 2Z',shield:'m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4ZM12 8v5M12 16h.01',sparkles:'m12 2 2 7 7 3-7 2-2 8-3-8-7-2 7-3Z',info:'M12 10v7M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',pause:'M9 5v14M15 5v14',close:'m6 6 12 12M18 6 6 18',copy:'M9 4h11v14H9zM5 8H3v14h12v-2',clock:'M12 7v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0'};
const $=s=>document.querySelector(s);
const icon=name=>{const wrap=document.createElement('span');wrap.innerHTML=`<svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="${paths[name]||paths.agent}"/></svg>`;return wrap.firstChild;};
function el(tag,attrs={},...children){const n=document.createElement(tag);for(const [key,val] of Object.entries(attrs)){if(key==='class')n.className=val;else if(key.startsWith('on'))n.addEventListener(key.slice(2),val);else n.setAttribute(key,val);}for(const c of children.flat())if(c!==null&&c!==undefined)n.append(c instanceof Node?c:document.createTextNode(String(c)));return n;}
const button=(label,fn,style='outline')=>el('button',{class:`button ${style}`,onclick:fn},label);
const commandButton=(label,cmd,style='outline')=>button(label,()=>runCommand(cmd,label),style);
const date=t=>Number.isFinite(t)?new Date(t).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'No observation yet';
const short=ca=>typeof ca==='string'?`${ca.slice(0,6)}…${ca.slice(-5)}`:'Unknown token';
const fmt=(n,digits=0)=>Number.isFinite(n)?new Intl.NumberFormat(undefined,{style:'currency',currency:'USD',minimumFractionDigits:0,maximumFractionDigits:digits}).format(n):'Unknown';
let csrf=null,workspace=null,view='discover',pending=false,toastTimer,refreshTimer,authGeneration=0,dialogVersion=0,refreshSequence=0,connectionState='loading';
let watchDraft={ca:'',drop:'',hours:''};
const nav=[['discover','Discover','discover'],['agent','My agent','agent'],['watchlist','Watchlist','watch'],['alerts','Alerts','alerts'],['performance','Performance','performance'],['groups','Groups','groups']];

function toast(text){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,4500);}
function clearSession(){
  authGeneration++;csrf=null;workspace=null;watchDraft={ca:'',drop:'',hours:''};connectionState='loading';
  $('#criteria').value='';$('#reply').value='';$('#reply-form').hidden=true;
  $('#report-dialog').close();$('#report-content').replaceChildren();$('#report-actions').replaceChildren();render();
}
async function api(path,body){
  const generation=authGeneration;
  const response=await fetch(`/api/${path}`,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json','X-Sift-CSRF':csrf||''}:{},...(body?{body:JSON.stringify(body)}:{signal:AbortSignal.timeout(15000)})});
  let data;try{data=await response.json();}catch{throw Error('The web backend is not connected at this address. Open the workspace link sent by /web in Telegram.');}
  if(!response.ok){if(response.status===401&&generation===authGeneration)clearSession();throw Error(data.error||'Sift is unavailable. Please try again.');}return data;
}
function setBusy(value){pending=value;$('#report-dialog').setAttribute('aria-busy',String(value));document.querySelectorAll('#report-actions button,#criteria-form button,#reply-form button').forEach(b=>b.disabled=value);}
function dialog(title){dialogVersion++;$('#report-title').textContent=title;$('#report-content').replaceChildren();$('#report-actions').replaceChildren();$('#reply-form').hidden=true;if(!$('#report-dialog').open)$('#report-dialog').showModal();$('#report-dialog').scrollTop=0;}
function accountOptions(content) {
  content.append(toolbar(...nav.filter(n=>['agent','performance','groups'].includes(n[0])).map(([key,label])=>button(label,()=>{$('#report-dialog').close();navigate(key);})))) ;
  if(!workspace)return;
  const p=workspace.preferences;
  const pref=(title,description,fields,make)=>{
    const form=el('form',{onsubmit:e=>{e.preventDefault();runCommand(make(new FormData(form)),title);}},...fields,el('button',{class:'button yellow'},'Save preference →'));
    return section(title,el('p',{},description),form);
  };
  content.append(el('details',{class:'advanced-options'},el('summary',{},'Notification preferences'),
    el('p',{class:'report-text'},'Your current preferences stay in place. Change these only when you need to.'),
    pref('Follow-up notifications','Applies to future calls. Setting 0 also stops existing follow-ups.',[el('label',{},'Hours (0–168)',el('input',{name:'hours',type:'number',min:'0',max:'168',required:'',value:p.followHours}))],d=>`/preferences follow ${d.get('hours')}`),
    pref('Quiet hours · UTC','Suppress discovery and follow-up notifications. Market monitors retain their own controls.',[el('label',{},'Start hour (0–23)',el('input',{name:'start',type:'number',min:'0',max:'23',required:'',...(p.quietStart!==null?{value:p.quietStart}:{})})),el('label',{},'End hour (0–23)',el('input',{name:'end',type:'number',min:'0',max:'23',required:'',...(p.quietEnd!==null?{value:p.quietEnd}:{})}))],d=>`/preferences quiet ${d.get('start')} ${d.get('end')}`),
    toolbar(commandButton('Turn quiet hours off','/preferences quiet off'),commandButton('All preferences','/preferences'))));
}
function connect(){
  dialog(csrf?'Your account':'Connect your Telegram agent');const content=$('#report-content');
  if(csrf){
    content.append(el('p',{class:'report-text'},`Signed in as ${workspace?.user?.name||'a private tester'}. Your web app and Telegram agent share the same rules and saved observations.`));
    accountOptions(content);
    $('#report-actions').append(button('Sign out',async()=>{try{await api('logout',{});clearSession();$('#report-dialog').close();toast('Signed out. Your scans and rules are unchanged.');}catch(e){toast(e.message);}}));return;
  }
  content.append(el('p',{class:'report-text'},'Open Sift in Telegram and send /web. Your bot will send a one-time link to this workspace, signed in to your account.\n\nOnly configured private testers can sign in. Keep that link private. If /web is unavailable, the operator needs to enable the web backend first.'));
  accountOptions(content);
  $('#report-actions').append(el('a',{class:'button yellow',href:'https://t.me/SiftAgentbot?start=web',target:'_blank',rel:'noopener noreferrer'},'Open Sift on Telegram →'));
}
function showReport(report,title){dialog(title);$('#report-content').append(el('div',{class:'report-text'},report.text));for(const b of report.buttons??[]){if(b.action)$('#report-actions').append(button(b.label,()=>runAction(b.action,title),'yellow'));else if(b.copy)$('#report-actions').append(button(b.label,()=>copyCA(b.copy)));else if(b.url&&b.url.startsWith('https://'))$('#report-actions').append(el('a',{class:'button outline',href:b.url,target:'_blank',rel:'noopener noreferrer'},b.label));}const draft=workspace?.agent?.draft;if(draft&&draft.step<6){$('#reply-form').hidden=false;$('#reply').value='';}if(report.notice)toast(report.notice);}
async function execute(payload,title){
  if(!csrf){connect();return;}if(pending){toast('Please wait for the current check.');return;}
  dialog(title);const version=dialogVersion,identity=csrf;
  $('#report-content').append(el('p',{class:'report-text'},'Checking with your agent…'));setBusy(true);
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
      dialog('Request could not finish');$('#report-content').append(el('p',{class:'report-text'},e.message));
      $('#report-actions').append(csrf?button('Refresh saved state',async()=>{if(await refresh())$('#report-dialog').close();}):button('Get a new sign-in link',connect,'yellow'));
    }else toast(e.message);
  }finally{setBusy(false);}
}
const runCommand=(text,title='Agent review')=>execute({text},title);
const runAction=(action,title)=>execute({action},title);
async function copyCA(ca){try{await navigator.clipboard.writeText(ca);toast('CA copied');}catch{dialog('Copy contract address');const input=el('input',{value:ca,readonly:'', 'aria-label':'Contract address'});$('#report-content').append(input);input.focus();input.select();toast('Select and copy this address.');}}
function empty(title,text,action){return el('div',{class:'empty'},el('span',{class:'empty-visual'},icon('discover')),el('h3',{},title),el('p',{},text),action??null);}
function navigate(name){view=nav.some(n=>n[0]===name)?name:'discover';if(location.hash!==`#${view}`)history.replaceState(null,'',`#${view}`);render();}
function buildNav(){
  for(const [key,label,glyph] of nav)$('#desktop-nav').append(el('a',{href:`#${key}`,class:'nav-item','data-view':key,'aria-label':label,onclick:e=>{e.preventDefault();navigate(key);}},icon(glyph),el('span',{},label)));
  for(const key of ['discover','watchlist','alerts']){const [,label,glyph]=nav.find(n=>n[0]===key);$('#mobile-nav').append(el('a',{href:`#${key}`,class:'dock-item','data-view':key,onclick:e=>{e.preventDefault();navigate(key);}},el('span',{class:'dock-circle'},icon(glyph)),el('span',{},label)));}
  $('#mobile-nav').append(el('button',{class:'dock-item','data-account':'','aria-label':'Your account',onclick:connect},el('span',{class:'dock-circle'},icon('agent')),el('span',{},'Account')));
}
function resultStatus(result){
  const checks=result.checks??[],required=checks.filter(c=>c.mode==='require');
  if(result.issue)return {label:'Source unavailable',tone:'neutral'};
  if(required.some(c=>c.state==='fail'))return {label:'Rules not met',tone:'failed'};
  if(result.unresolved||required.some(c=>c.state!=='pass'))return {label:'Needs evidence',tone:''};
  if(result.matches===true&&required.length)return checks.some(c=>c.mode==='warn'&&c.state!=='pass')
    ? {label:'Matched · warnings',tone:''}:{label:'Rules matched',tone:'passed'};
  return {label:'Not qualified',tone:'neutral'};
}
function candidateReport(row){
  dialog('Saved screening result');
  const content=$('#report-content'),result=row.result,status=resultStatus(result);
  content.append(el('span',{class:`badge ${status.tone}`},status.label),el('p',{class:'report-text'},`${row.token}\nChecked ${date(row.checked_at)} against your approved rules. This is a saved observation, not a fresh check or a safety verdict.`));
  if(result.issue)content.append(el('p',{class:'report-text'},result.issue==='MARKET_UNAVAILABLE'?'The market source could not supply this check. Required rules were not verified.':`Source issue: ${result.issue}`));
  for(const check of result.checks??[]){
    const value=Number.isFinite(check.valueObserved)?(check.field==='poolAgeMinutes'?`${Number(check.valueObserved.toFixed(2))} minutes`:fmt(check.valueObserved,6)):null;
    content.append(el('div',{class:'saved-check'},el('strong',{},`${check.state.toUpperCase()} · ${check.description||check.field}`),
      el('p',{},value!==null?`Observed: ${value}`:check.state==='unknown'?'Evidence unavailable or incomplete.':'Saved evidence result.'),
      check.mode==='warn'&&check.state!=='pass'?el('p',{},'Warning only; this does not block a match.'):null));
  }
  if(result.unresolved)content.append(el('p',{class:'report-text'},'Unresolved requirements prevented qualification.'));
  if(workspace?.agent?.draft)content.append(el('p',{class:'report-text'},'Your unapproved draft was not used for this check.'));
  $('#report-actions').append(button('Copy CA',()=>copyCA(row.token)),button('Check token now',()=>runCommand(`/check ${row.token}`,'Token evidence'),'yellow'));
}
function discoveryEmpty(){
  if(!csrf)return empty('A place for your discoveries.','Connect your Telegram agent to see its saved checks. No sample coins are shown.');
  if(!workspace)return empty('Loading your workspace.','Your saved rules and checks will appear when the connection is available.');
  const {draft,approved}=workspace.agent;
  if(!approved&&draft)return empty(draft.pendingRequirements?.length?'Your draft needs clarification.':'Your draft is waiting for review.',
    'Review the saved draft before discovery can start. Your requirements stay in place.',commandButton('Review saved draft →','/agent','yellow'));
  if(!approved)return empty('Your next discovery starts here.','Describe your criteria above, then review and approve them.');
  const limited=approved.rules.some(r=>r.mode==='require'&&(r.field==='buyingCoordination'||r.field==='liquidityProtection'&&r.scope==='all'));
  if(limited)return empty('Required evidence is unavailable.','Your saved policy needs complete coverage that Sift cannot currently establish. Unknown checks will continue to block qualifying alerts.',commandButton('Review coverage limits →','/why'));
  return empty(workspace.scan.state==='active'?'Waiting for saved checks.':'Discovery is '+workspace.scan.state+'.',
    'Completed checks will appear here. Use scan controls to review the current state.',commandButton('Review scan →','/scan'));
}
function render(){document.querySelectorAll('[data-view]').forEach(n=>{if(n.dataset.view===view)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');});$('#breadcrumb').textContent=nav.find(n=>n[0]===view)?.[1]||'Discover';$('#discover-view').hidden=view!=='discover';$('#detail-view').hidden=view==='discover';$('#connection-banner').hidden=Boolean(csrf);$('#connection').hidden=!csrf;$('#connection').classList.toggle('connected',Boolean(csrf)&&connectionState==='connected');$('#connection').replaceChildren(el('i'),connectionState==='connected'?'Backend connected':connectionState==='unavailable'?'Connection interrupted':'Loading workspace');$('#sync-notice').hidden=!csrf||connectionState!=='unavailable';$('#sync-notice p').textContent=workspace?`Connection interrupted. Showing data last loaded ${date(workspace.serverTime)}.`:'Connection interrupted. Your workspace could not be loaded.';$('#profile-name').textContent=workspace?.user?.name||'Your workspace';const name=workspace?.user?.name||'S';document.querySelectorAll('.avatar').forEach(n=>n.textContent=name[0].toUpperCase());
  const saved=workspace?.agent,current=saved?.draft??saved?.approved;$('#agent-name').textContent=current?.name||'Your Sift';$('#agent-status').textContent=saved?.draft?'Draft · review required':saved?.approved?`Scan ${workspace.scan.state}`:'Not configured';$('#mascot-caption').textContent=saved?.draft?'Awaiting your review.':workspace?.scan?.state==='active'?'Your agent is set to scout.':'A curious little companion.';
  $('#criteria-form button').firstChild.textContent=saved?.draft?'Review saved draft ':'Review criteria ';$('#criteria').disabled=Boolean(saved?.draft);$('#criteria').placeholder=saved?.draft?'Your saved draft is waiting. Review it before preparing a new strategy.':'Describe the coins you want to find. Include your market cap range, liquidity and risk requirements.';
  $('#last-cycle').textContent=workspace?.scan?.last_run?`Last cycle · ${date(workspace.scan.last_run)}`:csrf?'No cycle completed yet':'Connect to load your scan';const list=$('#candidates');list.replaceChildren();const checks=workspace?.candidateChecks??[];
  if(!checks.length)list.append(discoveryEmpty());
  else {
    list.append(el('div',{class:'column-head'},el('span',{},'Token'),el('span',{},'Market cap'),el('span',{},'Liquidity'),el('span',{class:'age-column'},'Pool age'),el('span',{},'Status'),el('span')));
    for(const row of checks.slice(0,8)){
      const checks=row.result.checks??[], observed=field=>checks.find(c=>c.field===field)?.valueObserved;
      const age=observed('poolAgeMinutes'),status=resultStatus(row.result);
      list.append(el('div',{class:'candidate-row observation-row'},el('div',{},el('strong',{},short(row.token)),el('small',{},date(row.checked_at))),
        el('span',{class:'metric'},el('span',{class:'metric-label'},'Cap '),fmt(observed('marketCap'))),
        el('span',{class:'metric'},el('span',{class:'metric-label'},'Liquidity '),fmt(observed('liquidityUsd'))),
        el('span',{class:'metric age-column'},Number.isFinite(age)?`${Math.round(age)}m`:'Unknown'),
        el('button',{class:`badge result-button ${status.tone}`,'aria-label':`${status.label}: review saved check for ${short(row.token)}`,onclick:()=>candidateReport(row)},status.label),
        el('button',{class:'copy',onclick:()=>copyCA(row.token)},icon('copy'),'Copy CA')));
    }
  }
  if(view!=='discover')renderDetail();
}
function section(title,...children){return el('section',{class:'card detail-card'},el('h2',{},title),...children);}
function toolbar(...buttons){return el('div',{class:'toolbar'},...buttons);}
function monitorCards(content){
  content.replaceChildren();
  if(!workspace.monitors.length)content.append(section('Your monitors',empty('Nothing on watch yet.','Add a contract address above to prepare a monitor.')));
  for(const row of workspace.monitors)content.append(section(`Monitor #${row.id}`,el('div',{class:'split-title'},el('span',{class:'pill-state'},row.state),el('button',{class:'copy',onclick:()=>copyCA(row.token)},icon('copy'),'Copy CA')),el('p',{},`${short(row.token)} · ${row.config.dropPercent}% liquidity drop · ${row.config.hours} hours`),el('p',{},`Last attempt: ${date(row.last_check)}. Latest reported liquidity: ${fmt(row.observation?.selected?.liquidityUsd)}.`),row.issue?el('p',{},`Issue: ${row.issue}`):null,commandButton('Review controls →','/watchlist')));
}
function renderDetail(){const meta={agent:['My agent','One set of rules. Shared with your Telegram agent.'],watchlist:['Your watchlist','Fixed-pool market monitors. Protection and developer activity are separate checks.'],alerts:['Your alerts','Saved reports and delivery attempts, including uncertain and failed sends.'],performance:['A clearer track record.','Paper observations with missing data kept visible. These are not actual trading returns.'],groups:['Your communities','Private configuration. Explicit admin approval before any group receives alerts.']}[view];$('#detail-heading').textContent=meta[0];$('#detail-subtitle').textContent=meta[1];const content=$('#detail-content');
  // Keep the form nodes, focus and cursor intact during background refreshes.
  if(workspace&&view==='watchlist'&&$('#watch-form')){monitorCards($('#monitor-list'));return;}
  content.replaceChildren();
  if(!workspace){content.append(section('Your private workspace',empty('Connect your agent first.','Your rules and saved data are loaded only after Telegram sign-in.',button('Connect Telegram →',connect,'yellow'))));return;}
  if(view==='agent'){
    const current=workspace.agent.draft??workspace.agent.approved;
    content.append(toolbar(commandButton('Review agent →','/agent','yellow'),commandButton('Scan controls','/scan'),commandButton('Why no matches?','/why'),commandButton('Rule history','/audit')));
    content.append(section(current?.name||'Set up your agent',el('span',{class:'pill-state'},workspace.agent.draft?'Draft · review required':current?'Approved':'Not configured'),el('ul',{class:'rule-list'},workspace.ruleDescriptions.map(d=>el('li',{},d))),current?.pendingRequirements?.length?el('div',{class:'unresolved'},el('h3',{},'Instructions still need review'),...current.pendingRequirements.map(t=>el('p',{},t)),commandButton('Review supported mappings →','/mapextras')):null,el('p',{},workspace.coverage)));
    content.append(toolbar(commandButton('Guided setup','/setup'),button('Describe a strategy',()=>{navigate('discover');$('#criteria').focus();}),commandButton('Pause all activity','/pause'),commandButton('Resume discovery','/resume')));
  } else if(view==='watchlist'){
    const field=attrs=>el('input',{...attrs,value:watchDraft[attrs.name],oninput:e=>{watchDraft[attrs.name]=e.target.value;}});
    const form=el('form',{id:'watch-form',class:'form-grid',onsubmit:e=>{e.preventDefault();const data=new FormData(form);runCommand(`/watch ${data.get('ca')} ${data.get('drop')} ${data.get('hours')}`,'Review monitor');}},el('label',{},'Solana contract address',field({name:'ca',required:'',maxlength:'44',placeholder:'Paste CA'})),el('label',{},'Liquidity drop (%)',field({name:'drop',type:'number',required:'',min:'.1',max:'100',step:'.1',placeholder:'e.g. 20'})),el('label',{},'Hours to monitor',field({name:'hours',type:'number',required:'',min:'1',max:'168',placeholder:'e.g. 24'})),el('button',{class:'button yellow'},'Review →'));
    content.append(section('Follow a coin',el('p',{},'Choose your own threshold and duration. Review the baseline before starting.'),form),toolbar(commandButton('Monitor controls','/watchlist'),commandButton('Monitoring alerts','/watchalerts')));
    const monitors=el('div',{id:'monitor-list'});content.append(monitors);monitorCards(monitors);
  } else if(view==='alerts'){
    content.append(toolbar(commandButton('Saved discovery reports','/alerts','yellow'),commandButton('Monitoring reports','/watchalerts'),commandButton('Older calls','/calls')));
    if(!workspace.calls.length)content.append(section('Delivery history',empty('No calls recorded yet.','A source connection is not a qualifying match. Reports appear after screening and a delivery attempt.')));
    for(const call of workspace.calls)content.append(section(`Call #${call.id}`,el('div',{class:'split-title'},el('span',{class:'badge neutral'},call.delivery),el('button',{class:'copy',onclick:()=>copyCA(call.token)},icon('copy'),'Copy CA')),el('p',{},`${short(call.token)} · ${date(call.at)}`),el('p',{},`Recorded market cap: ${fmt(call.snapshot?.selected?.marketCap)}. This is a saved observation.`),commandButton('View call evidence →',`/performance ${call.id}`)));
  } else if(view==='performance'){
    const counts=workspace.calls;content.append(el('div',{class:'stats-row'},...[[counts.length,'Recent calls loaded'],[counts.filter(c=>c.delivery==='sent').length,'Confirmed sends'],[counts.filter(c=>c.delivery!=='sent').length,'Other delivery states']].map(([v,t])=>el('div',{class:'stat'},el('small',{},t),el('strong',{},v),el('small',{},'Latest 20 calls')))),section('All-call observations',el('div',{class:'report-text'},workspace.performance)),toolbar(commandButton('Browse call history','/calls'),commandButton('Paper-cost settings','/preferences')));
  } else if(view==='groups'){
    content.append(section('Let your agent join the conversation.',el('p',{},'Add @SiftAgentbot to your group, then send /group@SiftAgentbot connect there. The bot verifies your admin permissions. Return here to review the destination and explicitly enable alerts.'),commandButton('Review group destinations →','/groups','yellow')));
    if(!workspace.groups.length)content.append(section('Connected groups',empty('No destinations connected.','Adding Sift to a group alone does not enable posting.')));
    for(const group of workspace.groups)content.append(section(`Group ${group.chat_id}`,el('span',{class:'pill-state'},group.state),el('p',{},`Up to ${group.settings.max_per_cycle} alerts per cycle · Minimum ${group.settings.interval_minutes} minutes between attempts.`),toolbar(commandButton('Review & enable','/groups'),commandButton('Group strategy',`/groupstrategy ${group.chat_id}`),commandButton('Pause group',`/grouppause ${group.chat_id}`))));
  }
}
async function refresh(){
  if(!csrf)return false;const identity=csrf,sequence=++refreshSequence;
  try{const data=await api('workspace');if(csrf!==identity||sequence!==refreshSequence)return false;workspace=data;connectionState='connected';render();return true;}
  catch(e){if(csrf===identity&&sequence===refreshSequence){connectionState='unavailable';render();}return false;}
}
function tokenCheck(){
  dialog('Take a closer look');
  const form=el('form',{onsubmit:e=>{e.preventDefault();const values=new FormData(form);runCommand(`/${values.get('kind')} ${values.get('ca')}`,'Token evidence');}},
    el('label',{},'Solana contract address',el('input',{name:'ca',required:'',maxlength:'44',placeholder:'Paste the full CA'})),
    el('p',{class:'report-text'},'Start with a market snapshot and your approved rules.'),
    el('details',{class:'advanced-options'},el('summary',{},'More evidence options'),el('label',{},'Evidence to request',el('select',{name:'kind'},...['check','risk','liquidity','verify','poolcoverage'].map(k=>el('option',{value:k},({check:'Market snapshot',risk:'Risk evidence',liquidity:'Liquidity protection',verify:'Compare market sources',poolcoverage:'Indexed pool coverage'})[k]))))),
    el('div',{class:'dialog-actions'},el('button',{class:'button yellow'},'Check token →')));
  $('#report-content').append(form);
}
document.querySelectorAll('[data-icon]').forEach(n=>n.append(icon(n.dataset.icon)));
document.querySelectorAll('[data-command]').forEach(n=>n.addEventListener('click',()=>runCommand(n.dataset.command,n.textContent.trim())));
$('#connect').addEventListener('click',connect);$('#account').addEventListener('click',connect);$('#profile').addEventListener('click',connect);$('#notifications').addEventListener('click',()=>navigate('alerts'));$('#search-button').addEventListener('click',()=>csrf?tokenCheck():connect());$('#close-report').addEventListener('click',()=>$('#report-dialog').close());
$('#criteria-form').addEventListener('submit',e=>{e.preventDefault();if(workspace?.agent?.draft)return runCommand('/agent','Review saved draft');const text=$('#criteria').value.trim();if(!text){toast('Describe your criteria first.');$('#criteria').focus();return;}runCommand(`/describe ${text}`,'Review your criteria');});
$('#reply-form').addEventListener('submit',e=>{e.preventDefault();const value=$('#reply').value.trim();if(value)runCommand(value,'Guided setup');});
$('#refresh').addEventListener('click',()=>csrf?refresh():connect());
$('#retry-sync').addEventListener('click',async()=>{const b=$('#retry-sync');b.disabled=true;try{await refresh();}finally{b.disabled=false;}});
async function loadSession(code){
  if(code){history.replaceState(null,'',location.pathname+'#discover');clearSession();navigate('discover');}
  const generation=++authGeneration;
  try{const session=await api(code?'login':'session',code?{code}:undefined);if(generation!==authGeneration)return;csrf=session.csrf;const loaded=await refresh();if(code&&loaded)toast('Connected to your Telegram agent.');}
  catch(e){if(code){dialog('Sign-in needs attention');$('#report-content').append(el('p',{class:'report-text'},e.message));$('#report-actions').append(button('Get a new sign-in link',connect,'yellow'));}}
}
window.addEventListener('hashchange',()=>{const code=new URLSearchParams(location.hash.slice(1)).get('login');if(code)loadSession(code);else navigate(location.hash.slice(1));});
document.addEventListener('visibilitychange',()=>{clearInterval(refreshTimer);if(!document.hidden){if(!pending)refresh();refreshTimer=setInterval(()=>{if(!pending)refresh();},30_000);}});
buildNav();startMascot();
const login=new URLSearchParams(location.hash.slice(1)).get('login');
if(login)history.replaceState(null,'',location.pathname+'#discover');
navigate(login?'discover':location.hash.slice(1));
await loadSession(login);
refreshTimer=setInterval(()=>{if(!pending&&!document.hidden)refresh();},30_000);
