// Campaign Impact MVP - demo-only browser-local evidence processor.
// No production provider credentials or remote uploads.
export const IMPACT_KEY = 'ifagrithm-impact-mvp-v1';
export const DEFAULT_CAMPAIGN = {name:'Consumer App Activation — Example',start:'2026-01-01',end:'2026-03-31',followDays:30};
const socialFields=['impressions','likes','replies','reposts'];
const productFields=['active_wallets','transactions','volume_usd','fees_usd'];
const attributionFields=['visits','new_wallets'];
const day = value => new Date(`${value}T00:00:00Z`);
const iso = value => new Date(value).toISOString().slice(0,10);
const addDays = (s,n) => iso(day(s).getTime()+n*86400000);
export const periodName=(date,c)=>date<c.start?'before':date>c.end?'after':'during';
export function campaignPeriods(c){
 const days=Math.round((day(c.end)-day(c.start))/86400000)+1;
 return {before:{start:addDays(c.start,-c.followDays),end:addDays(c.start,-1)},during:{start:c.start,end:c.end},after:{start:addDays(c.end,1),end:addDays(c.end,c.followDays)},days};
}
export function validateCampaign(c){
 if(!c||typeof c.name!=='string'||!c.name.trim()||c.name.length>120)throw Error('Give the campaign a name (up to 120 characters).');
 for(const value of [c.start,c.end])if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(day(value).getTime())||iso(day(value))!==value)throw Error('Use valid campaign dates.');
 const diff=Math.round((day(c.end)-day(c.start))/86400000);
 if(diff<0||diff>366)throw Error('Campaign must last between 1 and 367 days.');
 if(!Number.isSafeInteger(c.followDays)||c.followDays<7||c.followDays>90)throw Error('Comparison periods must be 7–90 days.');
 return c;
}
export function parseCsv(text){
 if(typeof text!=='string'||text.length>1048576)throw Error('CSV must be below 1 MiB.');
 const rows=[],r=[];let cell='',quote=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];
  if(ch==='"'){if(quote&&text[i+1]==='"'){cell+='"';i++;}else if(!quote&&cell)throw Error('Unexpected quote in CSV.');else quote=!quote;}
  else if(ch===','&&!quote){r.push(cell);cell='';}
  else if((ch==='\r'||ch==='\n')&&!quote){if(ch==='\r'&&text[i+1]==='\n')i++;r.push(cell);if(r.some(v=>v.trim()))rows.push(r.splice(0));else r.length=0;cell='';}
  else cell+=ch;
 }
 if(quote)throw Error('Unclosed quoted CSV field.');r.push(cell);if(r.some(v=>v.trim()))rows.push(r);
 if(rows.length>6001)throw Error('Demo CSV limit is 6,000 rows.');
 return rows;
}
function columns(text,required){
 const rows=parseCsv(text);if(rows.length<2)throw Error('CSV needs a header and at least one record.');
 const header=rows.shift().map(x=>x.trim().replace(/^\uFEFF/,''));
 if(header.length!==required.length||header.some((h,i)=>h!==required[i]))throw Error(`Expected CSV columns: ${required.join(', ')}`);
 return rows.map((a,i)=>{if(a.length!==required.length)throw Error(`Incorrect column count on row ${i+2}.`);return Object.fromEntries(header.map((h,j)=>[h,a[j].trim()]));});
}
function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(day(value).getTime())&&iso(day(value))===value;}
function number(raw,label,{integer=true,nullable=false}={}){
 if(raw===''&&nullable)return null;
 if(raw===''||!Number.isFinite(Number(raw))||Number(raw)<0||Number(raw)>Number.MAX_SAFE_INTEGER||(integer&&!Number.isSafeInteger(Number(raw))))throw Error(`${label} requires a nonnegative ${integer?'integer':'number'} within the safe numeric range. Blank is not zero.`);
 return Number(raw);
}
function required(r,k){if(!r[k]||r[k].length>300)throw Error(`Missing or invalid ${k}.`);return r[k];}
function safeRef(r){if(!r.source||r.source.length>250)throw Error('Every row needs a source reference, up to 250 characters.');return r.source;}
export function parseSocial(text){
 const rows=columns(text,['post_id','creator','published_at','captured_at','impressions','likes','replies','reposts','post_url','source']);
 const seen=new Set(),identity=new Map();return rows.map(r=>{
  for(const k of ['post_id','creator'])required(r,k);
  if(!validDate(r.published_at)||!validDate(r.captured_at)||r.captured_at<r.published_at)throw Error('Invalid post publication or observation date.');
  const match=/^https:\/\/(x\.com|twitter\.com)\/[^/?#]+\/status\/(\d+)(?:[/?#].*)?$/i.exec(r.post_url);
  if(!match)throw Error('Use a valid X post URL as the source reference.');
  if(match[2]!==r.post_id)throw Error('The post ID must match the ID in its X source URL.');
  const previous=identity.get(r.post_id);if(previous&&(previous.creator!==r.creator||previous.published_at!==r.published_at))throw Error('Snapshots of the same post must have the same creator and publication date.');identity.set(r.post_id,r);
  const key=r.post_id+':'+r.captured_at;if(seen.has(key))throw Error('Duplicate snapshot for a post and capture date.');seen.add(key);
  return {...r,source:safeRef(r),...Object.fromEntries(socialFields.map(k=>[k,number(r[k],k,{nullable:true})]))};
 });
}
export function parseProduct(text){
 const rows=columns(text,['date','active_wallets','transactions','volume_usd','fees_usd','source']);
 const seen=new Set();return rows.map(r=>{
  if(!validDate(r.date))throw Error('Invalid product activity date.');if(seen.has(r.date))throw Error('Duplicate daily on-chain date.');seen.add(r.date);
  return {...r,source:safeRef(r),...Object.fromEntries(productFields.map(k=>[k,number(r[k],k,{integer:!k.endsWith('_usd'),nullable:true})]))};
 });
}
export function parseAttribution(text){
 const rows=columns(text,['date','visits','new_wallets','source']);const seen=new Set();
 return rows.map(r=>{if(!validDate(r.date))throw Error('Invalid attribution date.');if(seen.has(r.date))throw Error('Duplicate attribution date.');seen.add(r.date);
 return {...r,source:safeRef(r),...Object.fromEntries(attributionFields.map(k=>[k,number(r[k],k,{nullable:true})]))};});
}
function total(rows,k){const observed=rows.filter(r=>r[k]!==null&&r[k]!==undefined),value=observed.length?observed.reduce((s,r)=>s+r[k],0):null;if(value!==null&&(!Number.isFinite(value)||value>Number.MAX_SAFE_INTEGER))throw Error('Combined metric exceeds the safe numeric range.');return {value,observed:observed.length,all:rows.length};}
function avg(rows,k){const result=total(rows,k);return result.value===null?null:result.value/result.observed;}
function dateRange(a,b){const range=[];for(let t=day(a).getTime();t<=day(b).getTime();t+=86400000)range.push(iso(t));return range;}
function phaseProduct(rows,p){const selected=rows.filter(r=>r.date>=p.start&&r.date<=p.end),unique=new Set(selected.map(r=>r.date));const byMetric=Object.fromEntries(productFields.map(k=>[k,total(selected,k)]));return {days:dateRange(p.start,p.end).length,observedDays:unique.size,activeDays:byMetric.active_wallets.observed,activeAverage:avg(selected,'active_wallets'),transactions:byMetric.transactions,volume:byMetric.volume_usd,fees:byMetric.fees_usd,metrics:byMetric};}
const pct=(n,base)=>n===null||base===null||base===0?null:100*(n/base-1);
export function analyseImpact(state){
 const {campaign}=state,p=campaignPeriods(campaign),social=state.social.filter(r=>r.published_at>=campaign.start&&r.published_at<=campaign.end);
 const newest=new Map();for(const r of social){const prev=newest.get(r.post_id);if(!prev||r.captured_at>prev.captured_at)newest.set(r.post_id,r);}
 const posts=[...newest.values()],creators=[...new Set(posts.map(p=>p.creator))],soc=Object.fromEntries(socialFields.map(k=>[k,total(posts,k)]));
 const byCreator=creators.map(creator=>{const records=posts.filter(r=>r.creator===creator);return {creator,posts:records.length,impressions:total(records,'impressions'),likes:total(records,'likes'),replies:total(records,'replies'),reposts:total(records,'reposts')};}).sort((a,b)=>(b.impressions.value??-1)-(a.impressions.value??-1));
 const phases=Object.fromEntries(['before','during','after'].map(k=>[k,phaseProduct(state.product,p[k])]));
 const attr=state.attribution.filter(r=>r.date>=campaign.start&&r.date<=campaign.end);
 const daily=new Map(state.product.map(r=>[r.date,r]));
 const engagements=['likes','replies','reposts'].every(k=>posts.length&&soc[k].observed===posts.length)?['likes','replies','reposts'].reduce((sum,k)=>sum+soc[k].value,0):null;
 return {campaign,periods:p,social:{posts:posts.length,creators:creators.length,metrics:soc,byCreator,engagements},phases,attribution:{visits:total(attr,'visits'),newWallets:total(attr,'new_wallets')},
  duringVsBefore:pct(phases.during.activeAverage,phases.before.activeAverage),afterVsDuring:pct(phases.after.activeAverage,phases.during.activeAverage),
  daily:dateRange(p.before.start,p.after.end).map(date=>daily.get(date)||{date,active_wallets:null,transactions:null,volume_usd:null,fees_usd:null,source:null}),
  excluded:{social:state.social.length-social.length,product:state.product.filter(r=>r.date<p.before.start||r.date>p.after.end).length,attribution:state.attribution.length-attr.length},status:{...state.mode}};
}
function sampleData(){
 const campaign={...DEFAULT_CAMPAIGN};const periods=campaignPeriods(campaign),product=[];
 for(const d of dateRange(periods.before.start,periods.after.end)){
  const idx=Math.round((day(d)-day(periods.before.start))/86400000),phase=periodName(d,campaign);
  const active=Math.round((phase==='before'?92:phase==='during'?182:133)+Math.sin(idx/3)*17+(idx%7)*4);
  product.push({date:d,active_wallets:active,transactions:Math.round(active*1.65),volume_usd:active*34,fees_usd:Math.round(active*0.21*100)/100,source:'SYNTHETIC Dune-style daily events'});
 }
 const social=Array.from({length:18},(_,i)=>{
  const dayNo=7+i*4,creator=['Sample Researcher','Sample Educator','Sample Creator'][i%3],imp=21000+(i%4)*8700+i*125;
  return {post_id:String(100000+i),creator,published_at:addDays(campaign.start,dayNo),captured_at:addDays(campaign.end,2),impressions:imp,likes:Math.round(imp*.04),replies:Math.round(imp*.005),reposts:Math.round(imp*.012),post_url:`https://x.com/example/status/${100000+i}`,source:'SYNTHETIC X-style post snapshot'};
 });
 const attribution=Array.from({length:40},(_,i)=>({date:addDays(campaign.start,i*2),visits:82+(i%5)*7,new_wallets:7+(i%4),source:'SYNTHETIC Formo-style acquisition export'}));
 return {version:1,campaign,social,product,attribution,mode:{social:'sample',product:'sample',attribution:'sample'}};
}
export function createCampaignImpact(storage,getPrincipal=null){
 let state,loadedKey;
 function load(){
  const user=getPrincipal?.();if(getPrincipal&&(!user?.demo||!(user.roles?.includes('admin')||(user.roles?.includes('founder')&&user.founderStatus==='approved'&&user.orgId))))throw Error('Approved founder or administrator demo access is required.');
  const key=getPrincipal?IMPACT_KEY+':'+(user.roles.includes('admin')?'org-wallet':user.orgId):IMPACT_KEY;
  if(key===loadedKey)return;
  let saved;try{const a=JSON.parse(storage.getItem(key));validateCampaign(a?.campaign);if(a?.version===1&&a.mode&&['social','product','attribution'].every(k=>Array.isArray(a[k])&&['sample','provided','missing'].includes(a.mode[k])))saved=a;}catch{}
  state=saved||sampleData();loadedKey=key;
 }
 const save=next=>{analyseImpact(next);storage.setItem(loadedKey,JSON.stringify(next));state=next;};
 const importRows=(kind,text)=>{const parsed={social:parseSocial,product:parseProduct,attribution:parseAttribution}[kind];if(!parsed)throw Error('Unsupported evidence source.');const records=parsed(text);
  load();const next=structuredClone(state);
  // Mixing real imports with a fictional series is misleading. Discard all fixtures at first import.
  if(Object.values(next.mode).includes('sample')){next.social=[];next.product=[];next.attribution=[];next.mode={social:'missing',product:'missing',attribution:'missing'};}
  next[kind]=records;next.mode[kind]='provided';save(next);return records.length;
 };
 return {read(){load();return structuredClone({...state,analysis:analyseImpact(state)});},importRows,configure(c){load();validateCampaign(c);save({...state,campaign:{...c}});},reset(){load();save(sampleData());},exportJson(){load();return JSON.stringify({reportType:'Campaign evidence demo, not causal attribution',...state,analysis:analyseImpact(state)},null,2);}};
}
