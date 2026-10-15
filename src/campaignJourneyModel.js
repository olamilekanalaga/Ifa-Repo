import {creators,creatorById} from './data.js';
import {CREATOR_SECTORS,sectorPercentages,historicalContent} from './creatorDirectory.js';
import {parseSocial,parseProduct,parseAttribution,analyseImpact,validateCampaign} from './campaignImpactModel.js';
import {parseWalletLinks,parseProductEvents,contributionSummary,CONTRIBUTION_RANKINGS} from './productContribution.js';

export const JOURNEY_KEY='ifagrithm-campaign-journey-v1';
export const METRICS=['impressions','likes','replies','reposts'];
export const STAGES=['brief','creators','execution','evidence','contribution','report'];
const clone=value=>structuredClone(value);
const fail=(check,message)=>{if(!check)throw Error(message);};
const clean=(value,max=3000)=>String(value??'').trim().slice(0,max);
export const shiftDay=(date,n)=>new Date(Date.parse(date+'T00:00:00Z')+n*86400000).toISOString().slice(0,10);
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const numeric=value=>{if(value==null||String(value).trim()==='')return null;const n=Number(value);fail(Number.isFinite(n)&&n>=0&&n<=Number.MAX_SAFE_INTEGER,'Use a non-negative amount within the safe numeric range.');return n;};
const sum=values=>{if(!values.length)return null;const n=values.reduce((s,v)=>s+v,0);fail(Number.isFinite(n)&&Math.abs(n)<=Number.MAX_SAFE_INTEGER,'Combined metric exceeds the safe numeric range.');return n;};
const csvCell=value=>'"'+String(value??'').replaceAll('"','""')+'"';
const identity=value=>clean(value).replace(/^@/,'').toLowerCase();
function clearSampleStreams(c){if(Object.values(c.origins).includes('sample')){c.social=[];c.product=[];c.attribution=[];c.origins={social:'missing',product:'missing',attribution:'missing'};}}
function eligible(c,id){return c.roster.some(p=>p.creatorId===id&&p.status==='participating');}

export function matchCreators(c,{query='',minimum=20}={}){
 const term=query.trim().toLowerCase();
 return creators.map(p=>({...p,share:sectorPercentages(p)[c.sector]||0,reason:historicalContent(p)}))
  .filter(p=>p.share>=minimum&&`${p.name} ${p.handle} ${p.reason}`.toLowerCase().includes(term))
  .sort((a,b)=>b.share-a.share||a.id.localeCompare(b.id));
}
function blankCampaign(id=''){return {id,name:'',client:'',sector:'Lending',start:'2026-09-01',end:'2026-09-30',followDays:7,status:'Draft',budget:null,spend:null,objective:'',customer:'',motivation:'',barrier:'',hypothesis:'',success:'',measurement:'',notes:'',roster:[],applications:[],referrals:[],walletLinks:[],productEvents:[],contributionRules:{minimumDepositUSD:100,returnDays:7,requireSignup:false,ranking:'depositors'},deliverables:[],content:[],social:[],product:[],attribution:[],origins:{social:'missing',product:'missing',attribution:'missing'},reports:[],audit:[]};}
export function seedJourney(){
 const c={...blankCampaign('lending-pilot'),name:'Lending Education & Adoption',client:'Example Lending Co',budget:5000,spend:3200,status:'Active',objective:'Introduce the product to relevant users and evaluate eligible product activity.',customer:'People researching collateralised borrowing and DeFi lending.',motivation:'Understand how to access liquidity and compare product terms.',barrier:'Unclear collateral requirements, risk and onboarding steps.',hypothesis:'Relevant educators explaining product mechanics may help interested users evaluate whether the product suits them.',success:'Track published explainers and founder-defined eligible first actions. Daily active wallets are a separate aggregate observation.',measurement:'Dated social snapshots; Dune-style daily contract activity; referral attribution only when provided. Review source definitions before comparing.',notes:'Investigate onboarding questions and missing attribution before increasing spend.'};
 c.roster=matchCreators(c,{minimum:40}).slice(0,5).map(p=>({creatorId:p.id,status:'participating',fee:400,reason:`${p.share}% demo lending content; ${p.reason}`,availability:'Confirmed in fictional example'}));
 for(let i=0;i<5;i++){
  const p=c.roster[i],creator=creatorById[p.creatorId],published=shiftDay(c.start,i+1),postId=String(900001+i);
  c.deliverables.push({id:'delivery-'+i,creatorId:p.creatorId,title:'Explain the product and record audience questions',due:shiftDay(c.start,i+5),status:i<3?'Delivered':'In progress'});
  c.content.push({postId,creatorId:p.creatorId,kind:'managed',url:`https://x.com/${creator.handle}/status/${postId}`,publishedAt:published,sample:true});
  for(let d=published;d<=c.end;d=shiftDay(d,1)){
   const age=(Date.parse(d)-Date.parse(published))/86400000+1,impressions=age*(900+i*170);
   c.social.push({post_id:postId,creator:creator.handle,published_at:published,captured_at:d,impressions,likes:age*(20+i*3),replies:age*(2+i),reposts:age*(4+i),post_url:c.content.at(-1).url,source:'Fictional daily snapshot',kind:'managed',creatorId:p.creatorId});
  }
 }
 c.content.push({postId:'999001',creatorId:'',kind:'wider',creator:'ExampleOrganicVoice',url:'https://x.com/ExampleOrganicVoice/status/999001',publishedAt:'2026-09-15',sample:true});
 c.social.push({post_id:'999001',creator:'ExampleOrganicVoice',published_at:'2026-09-15',captured_at:c.end,impressions:8000,likes:130,replies:10,reposts:20,post_url:'https://x.com/ExampleOrganicVoice/status/999001',source:'Fictional organic mention',kind:'wider',creatorId:''});
 for(let d=shiftDay(c.start,-7);d<=shiftDay(c.end,7);d=shiftDay(d,1)){
  const index=(Date.parse(d)-Date.parse(c.start))/86400000;
  const active=90+(index>=0&&index<30?60:0)+(Math.abs(index)%5)*6;
  c.product.push({date:d,active_wallets:active,transactions:active*2,volume_usd:active*40,fees_usd:active*.2,source:'Fictional Dune-style daily observation'});
 }
 c.origins={social:'sample',product:'sample',attribution:'missing'};
 c.referrals=c.roster.map((p,i)=>({creatorId:p.creatorId,code:'LEND'+String(i+1).padStart(2,'0')}));
 return {version:1,campaigns:[c]};
}
export function measurementWindow(c,preset='7',end=c.end,start=''){
 fail(validDate(end),'Choose a valid UTC end date.');
 const days={24:1,7:7,30:30};
 if(preset==='custom'){fail(validDate(start)&&start<=end,'Choose valid custom dates in order.');}
 else {fail(Object.hasOwn(days,preset),'Choose 24 hours, 7 days, 30 days or custom.');start=shiftDay(end,1-days[preset]);}
 fail(start>=c.start&&end<=c.end,'The report window must be inside the campaign dates.');
 return {preset,start,end,granularity:'UTC calendar days; 24 hours means one UTC day, not a rolling hourly window'};
}
function defaultWindow(c){return measurementWindow(c,(Date.parse(c.end)-Date.parse(c.start))/86400000>=6?'7':'custom',c.end,c.start);}
function socialWindow(c,kind,window){
 const eligibleRows=c.social.filter(r=>r.kind===kind&&r.published_at>=c.start&&r.published_at<=window.end&&r.captured_at<=window.end);
 const latest=new Map();for(const r of eligibleRows)if(!latest.has(r.post_id)||latest.get(r.post_id).captured_at<r.captured_at)latest.set(r.post_id,r);
 const posts=[...latest.values()];
 const metrics=Object.fromEntries(METRICS.map(k=>[k,{value:sum(posts.filter(p=>p[k]!=null).map(p=>p[k])),observed:posts.filter(p=>p[k]!=null).length,all:posts.length}]));
 const changes=Object.fromEntries(METRICS.map(k=>{
  let corrections=0;const values=[];
  for(const p of posts){const rows=eligibleRows.filter(r=>r.post_id===p.post_id),before=rows.find(r=>r.captured_at===shiftDay(window.start,-1)),after=rows.find(r=>r.captured_at===window.end);
   if(before?.[k]!=null&&after?.[k]!=null){if(after[k]<before[k])corrections++;else values.push(after[k]-before[k]);}
  }
  return [k,{value:sum(values),observed:values.length,all:posts.length,corrections}];
 }));
 const handles=[...new Set(posts.map(p=>p.creator))];
 return {posts,metrics,changes,byCreator:handles.map(creator=>({creator,impressions:sum(posts.filter(p=>p.creator===creator&&p.impressions!=null).map(p=>p.impressions)),posts:posts.filter(p=>p.creator===creator).length})),engagements:METRICS.slice(1).every(k=>posts.length&&metrics[k].observed===posts.length)?sum(METRICS.slice(1).map(k=>metrics[k].value)):null};
}
export function journeyAnalysis(c,window=defaultWindow(c)){
 measurementWindow(c,'custom',window.end,window.start);
 const baseline=analyseImpact({campaign:{id:c.id,name:c.name,start:window.start,end:window.end,followDays:c.followDays},social:[],product:c.product,attribution:c.attribution,mode:c.origins});
 const managed=socialWindow(c,'managed',window),wider=socialWindow(c,'wider',window);
 const findings=[];
 if(!c.objective||!c.motivation||!c.barrier||!c.success)findings.push({title:'Complete the research brief',reason:'Missing objective, customer motivation, barrier or qualifying-action definition.',action:'Agree these definitions with the client before expanding distribution.'});
 const participating=c.roster.filter(p=>p.status==='participating').length;
 if(!participating)findings.push({title:'Confirm creator participation',reason:'No creator is marked participating.',action:'Review suitability, availability and terms. Shortlisting alone does not confirm delivery.'});
 const outstanding=c.deliverables.filter(t=>t.status!=='Delivered').length;
 if(outstanding)findings.push({title:'Resolve outstanding deliverables',reason:`${outstanding} campaign activities are not marked delivered.`,action:'Check deadlines with the creators and record the actual status.'});
 if(managed.changes.impressions.observed<managed.changes.impressions.all||!managed.posts.length)findings.push({title:'Improve snapshot coverage',reason:'Some posts lack exact observations at the selected window boundaries.',action:'Capture dated metrics consistently. Do not reconstruct an unobserved historical curve.'});
 if(METRICS.some(k=>managed.changes[k].corrections))findings.push({title:'Review metric corrections',reason:'Some cumulative counts fell between boundary observations.',action:'Investigate source revisions before interpreting those differences as performance.'});
 if(['before','during','after'].some(k=>baseline.phases[k].activeDays<baseline.phases[k].days))findings.push({title:'Complete product observation coverage',reason:'Some comparison days have no active-wallet measurement.',action:'Request missing observations; current averages describe observed days only.'});
 if(baseline.attribution.newWallets.value==null)findings.push({title:'Attribution unavailable',reason:'No campaign-linked new-wallet observations are supplied for this window.',action:'Agree referral identifiers and founder/provider evidence before claiming campaign conversions.'});
 if(c.spend!=null&&c.budget!=null&&c.spend>c.budget)findings.push({title:'Reconcile the budget variance',reason:'Recorded spend exceeds the approved plan.',action:'Confirm costs with the client before increasing the next campaign budget.'});
 const creatorFees=sum(c.roster.filter(p=>p.status==='participating'&&p.fee!=null).map(p=>p.fee));if(c.creatorBudgetUSD!=null&&creatorFees!=null&&creatorFees>c.creatorBudgetUSD)findings.push({title:'Review creator compensation funding',reason:'Recorded participant fees exceed the creator compensation allocation.',action:'Reconcile the agreed terms and available budget. A ranking is not payment approval.'});
 findings.push({title:'Test the next decision',reason:'Social distribution and aggregate product activity are parallel observations, not proof of causal lift or same-wallet retention.',action:c.notes||'Review onboarding, attribution and one controlled follow-up test with the founder.'});
 const contributions=contributionSummary(c,window);
 if(contributions.pendingLinks||contributions.pendingEvents)findings.push({title:'Review product attribution evidence',reason:`${contributions.pendingLinks} wallet mappings and ${contributions.pendingEvents} events await review.`,action:'Reconcile the client/provider records before approving them. Pending evidence cannot rank creators.'});
 if(contributions.unlinkedApprovedEvents)findings.push({title:'Keep unlinked events unassigned',reason:`${contributions.unlinkedApprovedEvents} approved events have no eligible reviewed referral mapping.`,action:'Request the original referral-to-wallet record. Never infer a creator from simultaneous activity.'});
 return {window,managed,wider,product:baseline,contributions,findings,participating,delivered:c.deliverables.filter(t=>t.status==='Delivered').length};
}

export function createCampaignJourney(storage,getPrincipal){
 let state,key;
 function load(creatorAccess=false){const u=getPrincipal();fail(u?.demo&&(u.roles?.includes('admin')||(u.roles?.includes('founder')&&u.founderStatus==='approved'&&u.orgId)||(creatorAccess&&u.roles?.includes('creator')&&creatorById[u.creatorId])),'Approved founder or IFAGRITHM demo access is required.');
  const nextKey=JOURNEY_KEY+':'+(u.roles.includes('admin')?'org-wallet':u.orgId||'org-wallet');if(key===nextKey)return;
  let saved;try{saved=JSON.parse(storage.getItem(nextKey));if(saved?.version!==1||!Array.isArray(saved.campaigns))saved=null;}catch{}
  state=saved||seedJourney();state.campaigns=state.campaigns.map(c=>({...blankCampaign(c.id),...c}));key=nextKey;
 }
 function save(next){storage.setItem(key,JSON.stringify(next));state=next;}
 function campaign(id){load();const c=state.campaigns.find(c=>c.id===id);fail(c,'Campaign not found in this organisation.');return c;}
 return {list(){load();return clone(state.campaigns.map(c=>({id:c.id,name:c.name,client:c.client,status:c.status,start:c.start,end:c.end,sector:c.sector,participants:c.roster.filter(p=>p.status==='participating').length,reports:c.reports.length})));},read(id){return clone(campaign(id));},analyse(id,window){const c=campaign(id);return clone(journeyAnalysis(c,window||defaultWindow(c)));},
  act(id,action,data={}){
   load();const next=clone(state);let c=next.campaigns.find(c=>c.id===id);if(action!=='create')fail(c,'Campaign not found in this organisation.');
   if(action==='create'||action==='brief'){
    if(action==='create')c=blankCampaign(crypto.randomUUID());
    for(const k of ['name','client','objective','customer','motivation','barrier','hypothesis','success','measurement','notes'])c[k]=clean(data[k],k==='name'?120:3000);
    c.start=data.start;c.end=data.end;c.followDays=Number(data.followDays);validateCampaign(c);fail(c.client,'Provide the client / product name.');fail(CREATOR_SECTORS.some(s=>s.key===data.sector),'Select a valid product sector.');c.sector=data.sector;
    fail(['Draft','Planning','Active','Review','Closed'].includes(data.status),'Choose a valid campaign status.');c.status=data.status;c.budget=numeric(data.budget);c.spend=numeric(data.spend);
    for(const k of ['serviceFeeUSD','creatorBudgetUSD','incentivesUSD','externalCostsUSD'])c[k]=numeric(data[k]);const allocated=sum(['serviceFeeUSD','creatorBudgetUSD','incentivesUSD','externalCostsUSD'].filter(k=>c[k]!=null).map(k=>c[k]));fail(c.budget==null||allocated==null||allocated<=c.budget,'Budget allocations exceed the total campaign budget.');
    fail(c.content.every(p=>p.publishedAt>=c.start&&p.publishedAt<=c.end),'Dates must include registered campaign posts.');fail(c.deliverables.every(t=>t.due>=c.start&&t.due<=c.end),'Dates must include assigned deadlines.');
    if(action==='create')next.campaigns.push(c);
   }else if(action==='application-review'){
    const application=c.applications.find(p=>p.creatorId===data.creatorId);fail(application?.status==='pending','Choose a pending creator application.');fail(['approved','rejected'].includes(data.decision),'Choose approve or reject.');fail(clean(data.note),'Record the eligibility decision basis.');application.status=data.decision;application.reviewNote=clean(data.note);
    if(data.decision==='approved'&&!c.roster.some(p=>p.creatorId===data.creatorId))c.roster.push({creatorId:data.creatorId,status:'approved',fee:null,reason:clean(data.note),availability:'Creator acceptance pending'});
   }else if(action==='shortlist'){
    fail(creatorById[data.creatorId],'Choose an existing creator.');fail(!c.roster.some(p=>p.creatorId===data.creatorId),'Creator already shortlisted.');const p=creatorById[data.creatorId];c.roster.push({creatorId:p.id,status:'shortlisted',fee:null,reason:`${sectorPercentages(p)[c.sector]||0}% demo ${c.sector} content; ${historicalContent(p)}`,availability:'Not confirmed'});
   }else if(action==='participant'){
    const p=c.roster.find(p=>p.creatorId===data.creatorId);fail(p,'Shortlist the creator first.');fail(['shortlisted','approved','participating','declined'].includes(data.status),'Invalid participation status.');
    fail(data.status==='participating'||(!c.content.some(r=>r.creatorId===p.creatorId)&&!c.deliverables.some(t=>t.creatorId===p.creatorId)),'Keep participants with assigned work or evidence active; create a note about the change.');
    p.status=data.status;p.fee=numeric(data.fee);p.availability=clean(data.availability,300);p.reason=clean(data.reason,1000);
   }else if(action==='deliverable'){
    fail(eligible(c,data.creatorId),'Choose a participating creator.');fail(clean(data.title),'Describe the deliverable.');fail(validDate(data.due)&&data.due>=c.start&&data.due<=c.end,'Deadline must be inside campaign dates.');c.deliverables.push({id:crypto.randomUUID(),creatorId:data.creatorId,title:clean(data.title,500),due:data.due,status:'Planned'});
   }else if(action==='delivery-status'){
    const t=c.deliverables.find(t=>t.id===data.id);fail(t,'Deliverable not found.');fail(['Planned','In progress','Delivered'].includes(data.status),'Invalid delivery status.');t.status=data.status;
   }else if(action==='content'){
    fail(['managed','wider'].includes(data.kind),'Choose managed content or wider discussion.');if(data.kind==='managed')fail(eligible(c,data.creatorId),'Choose a participating creator.');
    const handle=data.kind==='managed'?creatorById[data.creatorId].handle:clean(data.creator,100);fail(handle,'Provide the account handle.');
    const row={post_id:clean(data.postId,100),creator:handle,published_at:data.publishedAt,captured_at:data.publishedAt,impressions:'',likes:'',replies:'',reposts:'',post_url:clean(data.url,1000),source:'Post registration'};
    const header=['post_id','creator','published_at','captured_at',...METRICS,'post_url','source'];parseSocial(header.join(',')+'\n'+header.map(k=>csvCell(row[k])).join(','));
    fail(row.published_at>=c.start&&row.published_at<=c.end,'Post publication must be inside the campaign.');fail(!c.content.some(p=>p.postId===row.post_id),'Post already registered in this campaign.');
    c.content.push({postId:row.post_id,creatorId:data.kind==='managed'?data.creatorId:'',creator:handle,kind:data.kind,url:row.post_url,publishedAt:row.published_at,sample:false});
   }else if(action==='import'){
    const parser={social:parseSocial,product:parseProduct,attribution:parseAttribution}[data.source];fail(parser,'Unsupported source.');let rows=parser(String(data.csv||''));
    if(data.source==='social'){
     rows=rows.map(r=>{const post=c.content.find(p=>p.postId===r.post_id);fail(post,'Register post '+r.post_id+' under Execution before importing its snapshots.');
      const expected=post.kind==='managed'?creatorById[post.creatorId].handle:post.creator;fail(identity(r.creator)===identity(expected)&&r.published_at===post.publishedAt,'Post creator and publication date must match its registered content.');
      return {...r,kind:post.kind,creatorId:post.creatorId};});
    }
    clearSampleStreams(c);
    if(data.source==='social'){
     const map=new Map(c.social.map(r=>[r.post_id+':'+r.captured_at,r]));for(const r of rows){const k=r.post_id+':'+r.captured_at,old=map.get(k);fail(!old||JSON.stringify(old)===JSON.stringify(r),'A different snapshot already exists for this post/date. Remove the source dataset before correcting that observation.');map.set(k,r);}c.social=[...map.values()];
    }else c[data.source]=rows;
    c.origins[data.source]='provided';
   }else if(action==='referral'){
    fail(eligible(c,data.creatorId),'Confirm creator participation before assigning a code.');const code=clean(data.code,32).toUpperCase();fail(/^[A-Z0-9_-]{3,32}$/.test(code),'Use a referral code of 3–32 letters, numbers, underscores or hyphens.');
    fail(!next.campaigns.some(other=>other.referrals.some(r=>r.code===code&&(other.id!==c.id||r.creatorId!==data.creatorId))),'Referral code is already assigned.');
    const existing=c.referrals.find(r=>r.creatorId===data.creatorId);fail(!existing||existing.code===code||!c.walletLinks.some(l=>l.code===existing.code),'Do not change a referral code after wallet evidence is recorded.');c.referrals=c.referrals.filter(r=>r.creatorId!==data.creatorId);c.referrals.push({creatorId:data.creatorId,code});
   }else if(action==='load-product-example'){
    fail(!c.walletLinks.length&&!c.productEvents.length,'Load the example only into an empty product contribution dataset.');const ref=c.referrals.find(r=>eligible(c,r.creatorId));fail(ref,'Assign a referral code to a participating creator first.');fail((Date.parse(c.end)-Date.parse(c.start))/86400000>=11,'The example needs a campaign of at least 12 days.');const address='0x'+('1'.repeat(40)),at=n=>shiftDay(c.end,n)+'T12:00:00Z';
    c.walletLinks=[{id:address,wallet:address,code:ref.code,creatorId:ref.creatorId,linkedAt:at(-11),source:'Fictional referral capture example',status:'pending',reviewNote:''}];
    c.productEvents=[['signup',-10,null],['deposit',-9,200],['deposit',-5,150],['return',0,null]].map(([type,d,amount],i)=>({id:'example:'+c.id+':'+i,wallet:address,type,occurredAt:at(d),amountUSD:amount,source:'Fictional product-event example',status:'pending',reviewNote:''}));c.productExample=true;
   }else if(action==='clear-product-evidence'){
    c.walletLinks=[];c.productEvents=[];c.productExample=false;
   }else if(action==='wallet-import'){
    fail(!c.productExample,'Clear fictional referral evidence before importing supplied records.');
    const rows=parseWalletLinks(String(data.csv||''),c),map=new Map(c.walletLinks.map(r=>[r.wallet,r]));for(const r of rows){const old=map.get(r.wallet);fail(!old||(old.code===r.code&&old.linkedAt===r.linkedAt),'Conflicting referral-to-wallet attribution. Reconcile the evidence instead of assigning both creators.');if(!old)map.set(r.wallet,r);}c.walletLinks=[...map.values()];
    clearSampleStreams(c);
   }else if(action==='event-import'){
    fail(!c.productExample,'Clear fictional referral evidence before importing supplied records.');
    const rows=parseProductEvents(String(data.csv||''),c),map=new Map(c.productEvents.map(e=>[e.id,e]));
    for(const row of rows){fail(!next.campaigns.some(other=>other.id!==c.id&&other.productEvents.some(e=>e.id===row.id)),'Source event ID is already recorded in another campaign.');const old=map.get(row.id);fail(!old||['wallet','type','occurredAt','amountUSD','source'].every(k=>old[k]===row[k]),'Conflicting duplicate source event ID.');if(!old)map.set(row.id,row);}c.productEvents=[...map.values()];clearSampleStreams(c);
   }else if(action==='product-review'){
    const list=data.kind==='wallet'?c.walletLinks:data.kind==='event'?c.productEvents:null;fail(list,'Choose wallet or event evidence.');const row=list.find(r=>r.id===data.id);fail(row,'Evidence record not found.');fail(['approved','rejected'].includes(data.decision),'Choose an evidence decision.');fail(data.confirm==='yes'&&clean(data.note),'Confirm the source review and provide a note. This is demo review, not independent verification.');row.status=data.decision;row.reviewNote=clean(data.note);
   }else if(action==='contribution-rules'){
    const minimum=numeric(data.minimumDepositUSD),days=Number(data.returnDays);fail(minimum!==null&&Number.isSafeInteger(days)&&days>=1&&days<=90,'Set a minimum deposit and a return interval of 1–90 days.');fail(Object.hasOwn(CONTRIBUTION_RANKINGS,data.ranking),'Choose a product-outcome ranking metric.');c.contributionRules={minimumDepositUSD:minimum,returnDays:days,requireSignup:data.requireSignup==='yes',ranking:data.ranking};
   }else if(action==='clear-source'){
    fail(['social','product','attribution'].includes(data.source),'Unsupported source.');c[data.source]=[];c.origins[data.source]='missing';
 }else if(action==='report'){
    const window=measurementWindow(c,data.preset||'7',data.end||c.end,data.start||'');const source=clone(c);delete source.reports;
    c.reports.push({id:crypto.randomUUID(),campaignId:c.id,version:c.reports.length+1,createdAt:new Date().toISOString(),environment:'browser-local-demo',campaign:source,analysis:journeyAnalysis(c,window)});
 }else throw Error('Unknown campaign action.');
   fail(c.social.length<=6000&&c.product.length<=6000&&c.attribution.length<=6000&&c.walletLinks.length<=6000&&c.productEvents.length<=6000,'Limit each evidence source to 6,000 observations.');
   // Validate the complete campaign window before persisting; blank and short campaigns use a custom window.
   journeyAnalysis(c,measurementWindow(c,'custom',c.end,c.start));
   c.audit.push({action,at:new Date().toISOString()});save(next);return clone(c);
  },creatorView(){load(true);const u=getPrincipal();fail(u.roles.includes('creator')&&creatorById[u.creatorId],'Creator demo identity required.');return clone(state.campaigns.filter(c=>['Planning','Active'].includes(c.status)||c.roster.some(p=>p.creatorId===u.creatorId)).map(c=>{const own=c.roster.find(p=>p.creatorId===u.creatorId),contribution=contributionSummary(c,defaultWindow(c)).rows.find(p=>p.creatorId===u.creatorId);return {id:c.id,name:c.name,client:c.client,sector:c.sector,objective:c.objective,start:c.start,end:c.end,application:c.applications.find(p=>p.creatorId===u.creatorId)||null,participation:own||null,referral:c.referrals.find(p=>p.creatorId===u.creatorId)||null,deliverables:c.deliverables.filter(p=>p.creatorId===u.creatorId),contribution:contribution||null,rewardStatus:'No payment authorised; agreed compensation and settlement are separate.'};}));},
  creatorAction(id,action,data={}){load(true);const u=getPrincipal();fail(u.roles.includes('creator')&&creatorById[u.creatorId],'Creator demo identity required.');const next=clone(state),c=next.campaigns.find(c=>c.id===id);fail(c&&['Planning','Active'].includes(c.status),'This campaign is not accepting participation.');
   if(action==='apply'){fail(!c.roster.some(p=>p.creatorId===u.creatorId),'You already have a campaign shortlist or participation record.');fail(!c.applications.some(p=>p.creatorId===u.creatorId),'An application already exists.');c.applications.push({creatorId:u.creatorId,status:'pending',note:clean(data.note),submittedAt:new Date().toISOString()});}
   else if(action==='accept'){const p=c.roster.find(p=>p.creatorId===u.creatorId);fail(p?.status==='approved'&&data.accept==='yes','Founder approval and explicit creator acceptance are required.');p.status='participating';p.availability='Accepted by demo creator';}
   else throw Error('Unknown creator action.');c.audit.push({action:'creator-'+action,creatorId:u.creatorId,at:new Date().toISOString()});save(next);return this.creatorView();
  },reset(){load();save(seedJourney());},exportReport(id,window,reportId=''){const c=campaign(id);if(reportId){const report=c.reports.find(r=>r.id===reportId);fail(report,'Saved report not found in this campaign.');return clone(report);}const source=clone(c);delete source.reports;return clone({environment:'browser-local-demo',campaign:source,analysis:journeyAnalysis(c,window||defaultWindow(c))});}
 };
}
