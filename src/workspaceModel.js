import {outcomeFunnel} from './campaignIntelligence.js';
import {ranking,validateRules} from './engine.js';
import {creatorById} from './data.js';

export const WORKSPACE_KEY='ifagrithm-workspace-demo-v1';
export const PRODUCT_EVENTS=['visit','signup','activation','deposit','volume','retention'];
export class ApiError extends Error{constructor(status,message){super(message);this.status=status;}}
const deny=(message='Access denied')=>{throw new ApiError(403,message);};
const clone=value=>structuredClone(value);
const text=(value,label,max=2000)=>{if(typeof value!=='string'||!value.trim()||value.trim().length>max)throw new ApiError(422,`${label} is required (maximum ${max} characters).`);return value.trim();};
const email=value=>{const result=text(value,'Email',254);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))throw new ApiError(422,'Enter a valid email.');return result.toLowerCase();};
const website=value=>{let url;try{url=new URL(value);}catch{throw new ApiError(422,'Enter a valid product website.');}if(!['http:','https:'].includes(url.protocol))throw new ApiError(422,'Website must use HTTP or HTTPS.');return url.href;};
const now=()=>new Date().toISOString();
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(new Date(value+'T00:00:00Z').getTime())&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
const defaultRules=()=>({signup:1,activation:9,volume:10,retention:5,breadthCap:20,volumeUnit:100});

export function initialWorkspace(){
 const company={id:'org-wallet',name:'Sample Wallet Co',website:'https://example.com',description:'A fictional product for testing founder workflows.',social:'@sample_wallet',workEmail:'founder@example.com'};
 const pending={id:'org-pending',name:'Pending Product Co',website:'https://example.org',description:'A fictional company awaiting manual review.',social:'@pending_product',workEmail:'pending@example.org'};
 const users=[{id:'demo-creator',name:'⭕️La_Crrypt💰₿',email:'creator@example.com',roles:['creator'],creatorId:'creator-0001'},
  {id:'demo-pending',name:'Pending founder',email:'pending@example.org',roles:['creator','founder'],creatorId:'creator-0003',orgId:pending.id},
  {id:'demo-founder',name:'Approved founder',email:'founder@example.com',roles:['creator','founder'],creatorId:'creator-0002',orgId:company.id},
  {id:'demo-other-founder',name:'Other organisation founder',email:'other@example.net',roles:['founder'],orgId:'org-other'},
  {id:'demo-admin',name:'IFAGRITHM administrator',email:'admin@example.com',roles:['admin']}];
 const applications=[{id:'application-approved',userId:'demo-founder',orgId:company.id,status:'approved',submittedAt:'2026-10-01T09:00:00Z'},
  {id:'application-pending',userId:'demo-pending',orgId:pending.id,status:'pending',submittedAt:'2026-10-10T10:00:00Z'},
  {id:'application-other',userId:'demo-other-founder',orgId:'org-other',status:'approved',submittedAt:'2026-10-01T09:00:00Z'}];
 const campaign={id:'ws-first-action',orgId:company.id,title:'First useful wallet action',objective:'Help referred users complete their first qualifying product action.',topic:'Wallets',activationLabel:'First qualifying wallet action',qualifyingEvents:['activation'],eligibility:'Reviewed creators with relevant product experience',startDate:'2026-10-01',endDate:'2026-12-31',pool:1000,campaignModel:'points_pool',rules:defaultRules(),status:'live',version:1,published:true,createdAt:'2026-10-01T09:00:00Z'};
 const events=[];
 const add=(id,creatorId,customerId,type,day,status='verified',amount=1)=>events.push({id,campaignId:campaign.id,orgId:company.id,creatorId,customerId,type,amount,status,occurredAt:`2026-10-${day}T12:00:00Z`,source:'simulated_product_event'});
 add('ws-e1','creator-0001','sample-user-a','signup','05');add('ws-e2','creator-0001','sample-user-a','activation','05');add('ws-e3','creator-0001','sample-user-a','retention','12');
 add('ws-e4','creator-0001','sample-user-b','signup','06');add('ws-e5','creator-0001','sample-user-b','activation','06','pending');
 add('ws-e6','creator-0002','sample-user-c','signup','07');add('ws-e7','creator-0002','sample-user-c','activation','07');add('ws-e8','creator-0002','sample-user-c','volume','07','verified',100);
 return {version:1,nextId:1,sessionUserId:null,users,organisations:[company,pending,{...company,id:'org-other',name:'Other Demo Organisation'}],applications,campaigns:[campaign,{...campaign,id:'ws-other-campaign',orgId:'org-other',title:'Other organisation private sample'}],events,invites:[],audit:[{id:'seed-review',actorId:'demo-admin',targetId:'application-approved',action:'approve_founder',note:'Seeded approval for the explicitly simulated approved-founder experience.',at:'2026-10-01T09:00:00Z'}],finalisations:[]};
}

export function principal(store){const user=store.users.find(u=>u.id===store.sessionUserId);if(!user)return null;const application=store.applications.find(a=>a.userId===user.id);return {...user,founderStatus:application?.status||null,applicationId:application?.id||null,demo:true};}
export function isApprovedFounder(user){return !!user?.roles.includes('founder')&&user.founderStatus==='approved';}
export function isAdmin(user){return !!user?.roles.includes('admin');}
export function permitOrganisation(user,orgId){if(!isApprovedFounder(user)||user.orgId!==orgId)deny('Approved founder membership in this organisation is required.');}
export function routeAllowed(user,path){
 if(!user)return false;
 if(path.startsWith('/admin'))return isAdmin(user);
 if(path.startsWith('/founder'))return isApprovedFounder(user);
 if(path==='/studio')return isApprovedFounder(user)||isAdmin(user);
 return user.roles.includes('creator')||isApprovedFounder(user)||isAdmin(user);
}

function allocations(campaign,events){
 if(campaign.campaignModel==='fixed_per_qualified_referral'){
  const verified=events.filter(e=>e.campaignId===campaign.id&&e.status==='verified');
  return [...new Set(events.filter(e=>e.campaignId===campaign.id).map(e=>e.creatorId))].map(creatorId=>{const own=verified.filter(e=>e.creatorId===creatorId);const registered=new Set(own.filter(e=>e.type==='signup').map(e=>e.customerId));const qualified=new Set(own.filter(e=>campaign.qualifyingEvents.includes(e.type)&&registered.has(e.customerId)).map(e=>e.customerId));return {creatorId,name:creatorById[creatorId]?.name||'Sample creator',points:0,reward:qualified.size*Math.round(campaign.fixedRewardUSD*100)/100,qualifiedAccounts:qualified.size,outcomes:Object.fromEntries(PRODUCT_EVENTS.map(t=>[t,own.filter(e=>e.type===t).reduce((n,e)=>n+e.amount,0)]))};});
 }

 const allocationId=`workspace-allocation:${campaign.id}`;
 const ids=[...new Set(events.filter(e=>e.campaignId===campaign.id).map(e=>e.creatorId))];
 // An empty synthetic-topic seed keeps workspace allocations exclusively event-backed.
 const state={events:events.filter(e=>campaign.qualifyingEvents.includes(e.type)).map(e=>({...e,campaignId:allocationId})),memberships:Object.fromEntries(ids.map(id=>[`${allocationId}:${id}`,'joined'])),rules:{},days:{},finalized:{}};
 return ranking({...campaign,id:allocationId,topic:'Workspace product-event ledger',campaignModel:'points_pool',oduTarget:800},state).map(r=>({creatorId:r.creator.id,name:r.creator.name,points:r.points,reward:r.reward,outcomes:r.outcomes}));
}

export function buildReport(store,user,filters={}){
 if(!isApprovedFounder(user))deny('Founder approval is required.');
 let campaigns=store.campaigns.filter(c=>c.orgId===user.orgId);
 if(filters.campaignId){const selected=store.campaigns.find(c=>c.id===filters.campaignId);if(!selected)throw new ApiError(404,'Campaign not found.');permitOrganisation(user,selected.orgId);campaigns=campaigns.filter(c=>c.id===filters.campaignId);}
 for(const key of ['startDate','endDate'])if(filters[key]&&!validDate(filters[key]))throw new ApiError(422,'Invalid date filter.');
 if(filters.startDate&&filters.endDate&&filters.startDate>filters.endDate)throw new ApiError(422,'Start date must precede end date.');
 if(filters.eventType&&!PRODUCT_EVENTS.includes(filters.eventType))throw new ApiError(422,'Unsupported product event.');
 if(filters.status&&!['verified','pending','rejected'].includes(filters.status))throw new ApiError(422,'Invalid verification status.');
 const ids=new Set(campaigns.map(c=>c.id));
 let events=store.events.filter(e=>e.orgId===user.orgId&&ids.has(e.campaignId));
 const lifetimeEvents=events;
 events=events.filter(e=>(!filters.creatorId||e.creatorId===filters.creatorId)&&(!filters.startDate||e.occurredAt.slice(0,10)>=filters.startDate)&&(!filters.endDate||e.occurredAt.slice(0,10)<=filters.endDate)&&(!filters.eventType||e.type===filters.eventType)&&(!filters.status||e.status===filters.status));
 const verified=events.filter(e=>e.status==='verified');
 const distinct=rows=>new Set(rows.map(e=>`${e.campaignId}:${e.customerId}`));
 const signups=distinct(verified.filter(e=>e.type==='signup'));
 const qualifying=verified.filter(e=>campaigns.find(c=>c.id===e.campaignId)?.qualifyingEvents.includes(e.type));
 const activated=distinct(qualifying),converted=[...activated].filter(id=>signups.has(id)).length;
 const rewards=campaigns.flatMap(c=>{const final=store.finalisations.find(f=>f.campaignId===c.id);return (final?.rows||allocations(c,lifetimeEvents.filter(e=>e.campaignId===c.id))).map(row=>({...row,campaignId:c.id,campaignTitle:c.title,allocationStatus:final?'finalised':'estimated'}));}).filter(r=>!filters.creatorId||r.creatorId===filters.creatorId);
 return {funnel:outcomeFunnel(events),demo:true,scope:'organisation',campaigns:campaigns.map(c=>({id:c.id,title:c.title,status:c.status})),filters,metrics:{budgetShortfallUSD:campaigns.reduce((sum,c)=>sum+Math.max(0,(store.finalisations.find(f=>f.campaignId===c.id)?.rows||allocations(c,lifetimeEvents.filter(e=>e.campaignId===c.id))).reduce((n,r)=>n+Math.round(r.reward*100),0)-Math.round(c.pool*100))/100,0),attributedUsers:distinct(events).size,verifiedQualifyingActions:qualifying.length,verifiedRegistrations:signups.size,conversionRate:signups.size?converted/signups.size:null,returningUsers:distinct(verified.filter(e=>e.type==='retention')).size,pendingEvents:events.filter(e=>e.status==='pending').length,creatorPoints:rewards.reduce((n,r)=>n+r.points,0),estimatedRewardsUSD:rewards.filter(r=>r.allocationStatus==='estimated').reduce((n,r)=>n+r.reward,0),finalisedRewardsUSD:rewards.filter(r=>r.allocationStatus==='finalised').reduce((n,r)=>n+r.reward,0),expenditureUSD:null},rows:rewards,events:events.map(e=>({...e,creatorName:creatorById[e.creatorId]?.name||'Sample creator'})),allocationBasis:'Lifetime verified events: points models share a pool; fixed rates are not redistributed. Event filters do not change lifetime allocations.',conversionBasis:'Verified referred accounts with both registration and a qualifying action inside the selected filters. Accounts are counted per campaign.'};
}

export function createDemoWorkspaceApi(storage){
 let store;try{const saved=JSON.parse(storage.getItem(WORKSPACE_KEY));if(saved?.version===1&&['users','organisations','applications','campaigns','events','audit','finalisations','invites'].every(k=>Array.isArray(saved[k])))store=saved;}catch{}
 store ||= initialWorkspace();
 const persist=()=>storage.setItem(WORKSPACE_KEY,JSON.stringify(store));
 const id=prefix=>`${prefix}-${store.nextId++}`;
 const audit=(actor,targetId,action,note)=>store.audit.push({id:id('audit'),actorId:actor.id,targetId,action,note,at:now()});
 const requireUser=()=>{const user=principal(store);if(!user)throw new ApiError(401,'Choose a demo identity first.');return user;};
 const requireAdmin=()=>{const user=requireUser();if(!isAdmin(user))deny('IFAGRITHM administrator access is required.');return user;};
 const ownCampaign=(user,campaignId)=>{const campaign=store.campaigns.find(c=>c.id===campaignId);if(!campaign)throw new ApiError(404,'Campaign not found.');permitOrganisation(user,campaign.orgId);return campaign;};
 const publicApplication=application=>{const {id,userId,orgId,status,submittedAt}=application;return {id,userId,orgId,status,submittedAt,company:clone(store.organisations.find(o=>o.id===orgId))};};
 function request(method,path,body={}){
  const url=new URL(path,'https://demo.invalid'),parts=url.pathname.split('/').filter(Boolean),filters=Object.fromEntries(url.searchParams);
  if(method==='GET'&&url.pathname==='/session')return clone({demo:true,productionAuthenticated:false,user:principal(store)});
  if(method==='GET'&&url.pathname==='/demo/identities')return clone({demo:true,identities:store.users.filter(u=>u.id.startsWith('user-')).map(u=>({id:u.id,name:u.name,founderStatus:store.applications.find(a=>a.userId===u.id)?.status||null}))});
  if(method==='POST'&&url.pathname==='/demo/session'){
   const allowed={creator:'demo-creator',founder_pending:'demo-pending',founder_approved:'demo-founder',admin:'demo-admin'};
   const selected=allowed[body.persona]||(body.userId&&store.users.find(u=>u.id===body.userId)?.id);
   if(!selected)throw new ApiError(422,'Unknown demo experience.');
   store.sessionUserId=selected;persist();return request('GET','/session');
  }
  if(method==='DELETE'&&url.pathname==='/session'){store.sessionUserId=null;persist();return {demo:true};}
  if(method==='POST'&&url.pathname==='/creator/register'){
   const address=email(body.email),name=text(body.name,'Name',100);
   if(store.users.some(u=>u.email===address))throw new ApiError(409,'This demo email is already registered. Use an existing demo identity.');
   const creatorId=`creator-${String(10+store.users.length).padStart(4,'0')}`;
   if(!creatorById[creatorId])throw new ApiError(422,'Demo identity limit reached.');
   const user={id:id('user'),name,email:address,roles:['creator'],creatorId};store.users.push(user);store.sessionUserId=user.id;persist();return request('GET','/session');
  }
  if(method==='POST'&&url.pathname==='/founder/applications'){
   const address=email(body.workEmail),company={id:id('org'),name:text(body.companyName,'Company name',150),website:website(body.website),workEmail:address,description:text(body.description,'Product description'),social:text(body.social,'Relevant social account',300)};
   let user=principal(store);
   if(user){if(isAdmin(user))deny('Use a creator identity to submit a founder application.');if(store.applications.some(a=>a.userId===user.id))throw new ApiError(409,'This identity already has a founder application.');if(user.email!==address)throw new ApiError(422,'Use the signed-in identity email for this demo application.');user=store.users.find(u=>u.id===user.id);}
   else{if(store.users.some(u=>u.email===address))throw new ApiError(409,'Use the existing demo identity before applying.');user={id:id('user'),name:text(body.name,'Your name',100),email:address,roles:['creator'],creatorId:`creator-${String(10+store.users.length).padStart(4,'0')}`};store.users.push(user);store.sessionUserId=user.id;}
   user.roles=[...new Set([...user.roles,'founder'])];user.orgId=company.id;store.organisations.push(company);
   const application={id:id('application'),userId:user.id,orgId:company.id,status:'pending',submittedAt:now()};store.applications.push(application);audit(user,application.id,'submit_founder','Submitted for manual review.');persist();return publicApplication(application);
  }
  const user=requireUser();
  if(method==='GET'&&url.pathname==='/founder/application'){const application=store.applications.find(a=>a.userId===user.id);if(!application)throw new ApiError(404,'No founder application.');return publicApplication(application);}
  if(parts[0]==='admin'){
   const admin=requireAdmin();
   if(method==='GET'&&parts[1]==='applications')return clone({applications:store.applications.map(a=>({...publicApplication(a),applicant:store.users.find(u=>u.id===a.userId)?.name,history:store.audit.filter(h=>h.targetId===a.id)}))});
   if(method==='POST'&&parts[1]==='applications'&&parts[2]){
    const application=store.applications.find(a=>a.id===parts[2]);if(!application)throw new ApiError(404,'Application not found.');
    const transitions={approve:['pending','rejected','suspended','revoked'],reject:['pending'],suspend:['approved'],revoke:['approved','suspended']};
    if(!transitions[body.action]?.includes(application.status))throw new ApiError(409,'Invalid approval transition.');
    const note=text(body.note,'Internal review note');application.status={approve:'approved',reject:'rejected',suspend:'suspended',revoke:'revoked'}[body.action];audit(admin,application.id,`${body.action}_founder`,note);persist();return {status:application.status};
   }
   if(method==='GET'&&parts[1]==='campaigns')return clone({campaigns:store.campaigns.filter(c=>c.status==='pending_review')});
   if(method==='POST'&&parts[1]==='campaigns'&&parts[2]){
    const campaign=store.campaigns.find(c=>c.id===parts[2]);if(!campaign)throw new ApiError(404,'Campaign not found.');if(campaign.status!=='pending_review')throw new ApiError(409,'Campaign is not awaiting review.');
    if(!['approve','reject'].includes(body.action))throw new ApiError(422,'Invalid campaign review action.');const note=text(body.note,'Review note');campaign.status=body.action==='approve'?'approved':'rejected';audit(admin,campaign.id,`${body.action}_campaign`,note);persist();return clone(campaign);
   }
   throw new ApiError(404,'Administrator endpoint not found.');
  }
  if(parts[0]==='creator'){
   if(!user.roles.includes('creator'))deny('Creator access required.');
   if(method==='GET'&&parts[1]==='campaigns')return clone({campaigns:store.campaigns.filter(c=>c.published).map(c=>({id:c.id,title:c.title,objective:c.objective,topic:c.topic,pool:c.pool,status:c.status,activationLabel:c.activationLabel,eligibility:c.eligibility,startDate:c.startDate,endDate:c.endDate,qualifyingEvents:c.qualifyingEvents,rules:c.rules,campaignModel:c.campaignModel,fixedRewardUSD:c.fixedRewardUSD}))});
   if(method==='GET'&&parts[1]==='outcomes'){
    if(filters.creatorId&&filters.creatorId!==user.creatorId)deny('Other creators’ private attribution records are unavailable.');
    return clone({events:store.events.filter(e=>e.creatorId===user.creatorId),rewards:store.campaigns.flatMap(c=>{const final=store.finalisations.find(f=>f.campaignId===c.id);return (final?.rows||allocations(c,store.events.filter(e=>e.campaignId===c.id))).filter(r=>r.creatorId===user.creatorId).map(r=>({...r,campaignId:c.id,status:final?'finalised':'estimated'}));})});
   }
  }
  if(parts[0]==='founder'){
   if(!isApprovedFounder(user))deny('Your founder application must be approved before accessing founder tools.');
   if(method==='GET'&&parts[1]==='overview'){const report=buildReport(store,user);return clone({organisation:store.organisations.find(o=>o.id===user.orgId),campaignCount:report.campaigns.length,budgetUSD:store.campaigns.filter(c=>c.orgId===user.orgId).reduce((n,c)=>n+c.pool,0),pendingCampaignReviews:report.campaigns.filter(c=>c.status==='pending_review').length,metrics:report.metrics});}
   if(method==='GET'&&parts[1]==='reports')return clone(buildReport(store,user,filters));
   if(method==='GET'&&parts[1]==='creators')return clone({creators:[...new Set(store.events.filter(e=>e.orgId===user.orgId).map(e=>e.creatorId))].map(id=>({id,name:creatorById[id]?.name||'Sample creator'}))});
   if(parts[1]==='settings'){
    if(method==='GET')return clone({company:store.organisations.find(o=>o.id===user.orgId),members:store.users.filter(u=>u.orgId===user.orgId).map(u=>({id:u.id,name:u.name,email:u.email,approvalStatus:store.applications.find(a=>a.userId===u.id)?.status||'pending'})),invitations:store.invites.filter(i=>i.orgId===user.orgId),integrations:[{name:'Product events',status:'Simulated only'},{name:'On-chain events',status:'Not connected'},{name:'X content classification',status:'Not connected; separate from rewards'}]});
    if(method==='PATCH'){const company=store.organisations.find(o=>o.id===user.orgId);const next={name:text(body.name,'Company name',150),website:website(body.website),description:text(body.description,'Product description'),social:text(body.social,'Social account',300)};Object.assign(company,next);audit(user,company.id,'update_company','Company profile updated.');persist();return clone(company);}
   }
   if(method==='POST'&&parts[1]==='invitations'){const address=email(body.email);if(store.invites.some(i=>i.orgId===user.orgId&&i.email===address))throw new ApiError(409,'Invitation already exists.');const invite={id:id('invite'),orgId:user.orgId,email:address,status:'pending_identity_verification',createdAt:now()};store.invites.push(invite);audit(user,invite.id,'invite_member','Demo invitation only; no email or access granted.');persist();return clone(invite);}
   if(method==='GET'&&parts[1]==='campaigns')return clone({campaigns:store.campaigns.filter(c=>c.orgId===user.orgId)});
   if((method==='POST'&&parts.length===2&&parts[1]==='campaigns')||(method==='PATCH'&&parts[1]==='campaigns'&&parts[2])){
    const existing=parts[2]?ownCampaign(user,parts[2]):null;
    if(existing&&!['draft','rejected'].includes(existing.status))throw new ApiError(409,'Reviewed campaign rules are locked.');
    const pool=Number(body.pool);if(!Number.isFinite(pool)||pool<=0||Math.abs(pool*100-Math.round(pool*100))>1e-8)throw new ApiError(422,'Budget must be positive with at most two decimals.');
    if(!validDate(body.startDate)||!validDate(body.endDate)||body.startDate>body.endDate)throw new ApiError(422,'Provide valid start and end dates.');
    if(!Array.isArray(body.qualifyingEvents)||!body.qualifyingEvents.length||body.qualifyingEvents.some(e=>!PRODUCT_EVENTS.includes(e)||e==='visit'))throw new ApiError(422,'Choose qualifying product events; social engagement is excluded.');
    const campaignModel=body.campaignModel||existing?.campaignModel||'points_pool';if(!['points_pool','fixed_per_qualified_referral'].includes(campaignModel))throw new ApiError(422,'Unsupported reward model.');const fixedRewardUSD=Number(body.fixedRewardUSD||0);if(campaignModel==='fixed_per_qualified_referral'&&(!Number.isFinite(fixedRewardUSD)||fixedRewardUSD<=0||fixedRewardUSD>pool||Math.abs(fixedRewardUSD*100-Math.round(fixedRewardUSD*100))>1e-8||body.qualifyingEvents.length!==1||['volume','retention'].includes(body.qualifyingEvents[0])))throw new ApiError(422,'Fixed referral rewards require one milestone, a positive cent-precision rate and sufficient budget.');
    let rules;try{rules=validateRules({...body.rules});}catch(error){throw new ApiError(422,error.message);}
    const data={campaignModel,fixedRewardUSD:campaignModel==='fixed_per_qualified_referral'?fixedRewardUSD:null,title:text(body.title,'Campaign title',160),objective:text(body.objective,'Product objective'),topic:text(body.topic,'Product category',80),activationLabel:text(body.activationLabel,'Qualifying action label',160),eligibility:text(body.eligibility,'Creator eligibility rules'),qualifyingEvents:[...new Set(body.qualifyingEvents)],startDate:body.startDate,endDate:body.endDate,pool,rules};
    const campaign=existing||{id:id('campaign'),orgId:user.orgId,createdAt:now(),campaignModel:'points_pool',published:false,status:'draft',version:0};Object.assign(campaign,data,{status:'draft',version:campaign.version+1});if(!existing)store.campaigns.push(campaign);audit(user,campaign.id,'save_campaign','Draft specification saved.');persist();return clone(campaign);
   }
   if(parts[1]==='campaigns'&&parts[2]){
    const campaign=ownCampaign(user,parts[2]);
    if(method==='POST'&&parts[3]==='transition'){
     const transitions={submit:['draft','rejected'],launch:['approved'],pause:['live'],resume:['paused'],close:['live','paused']};
     if(!transitions[body.action]?.includes(campaign.status))throw new ApiError(409,'Invalid campaign lifecycle transition.');
     campaign.status={submit:'pending_review',launch:'live',pause:'paused',resume:'live',close:'closed'}[body.action];if(body.action==='launch')campaign.published=true;if(body.action==='close')campaign.published=false;audit(user,campaign.id,body.action+'_campaign','Lifecycle transition.');persist();return clone(campaign);
    }
    if(method==='POST'&&parts[3]==='finalise'){
     if(campaign.status!=='closed')throw new ApiError(409,'Close the campaign before finalising.');if(store.finalisations.some(f=>f.campaignId===campaign.id))throw new ApiError(409,'Already finalised.');
     const allocationRows=allocations(campaign,store.events.filter(e=>e.campaignId===campaign.id));if(allocationRows.reduce((n,r)=>n+Math.round(r.reward*100),0)>Math.round(campaign.pool*100))throw new ApiError(422,'Fixed reward liability exceeds the campaign budget. Resolve the shortfall before finalising.');
     const final={campaignModel:campaign.campaignModel,fixedRewardUSD:campaign.fixedRewardUSD,id:id('allocation'),campaignId:campaign.id,orgId:user.orgId,rules:clone(campaign.rules),rows:allocationRows,at:now(),isPayoutAuthorization:false};store.finalisations.push(final);campaign.status='finalised';audit(user,campaign.id,'finalise_campaign','Allocation snapshot locked; no funds paid.');persist();return clone(final);
    }
    if(method==='POST'&&parts[3]==='events'){
     if(campaign.status!=='live')throw new ApiError(409,'Only live demo campaigns accept simulated product events.');
     const type=body.type,status=body.status||'pending',amount=Number(body.amount??1),customerId=text(body.customerId,'Referred account ID',150),creatorId=body.creatorId;
     if(!PRODUCT_EVENTS.includes(type)||!['verified','pending','rejected'].includes(status)||!creatorById[creatorId])throw new ApiError(422,'Invalid product event, creator or verification status.');
     if(!Number.isFinite(amount)||amount<=0||(type!=='volume'&&amount!==1))throw new ApiError(422,'Invalid event amount.');if(customerId===creatorId)throw new ApiError(422,'Self-referrals do not qualify.');
     const related=store.events.filter(e=>e.campaignId===campaign.id&&e.customerId===customerId&&e.status!=='rejected');
     if(related.some(e=>e.creatorId!==creatorId))throw new ApiError(409,'Conflicting creator attribution.');
     const eventId=text(body.id,'Unique event ID',150);if(store.events.some(e=>e.orgId===user.orgId&&e.id===eventId))throw new ApiError(409,'Duplicate event ID.');
     if(type!=='volume'&&related.some(e=>e.type===type))throw new ApiError(409,'Duplicate customer milestone.');
     if(!['visit','signup'].includes(type)&&!related.some(e=>e.type==='signup'&&e.status==='verified'))throw new ApiError(422,'Verified registration is required first.');
     if(['deposit','volume','retention'].includes(type)&&!related.some(e=>e.type==='activation'&&e.status==='verified'))throw new ApiError(422,'Verified activation is required first.');
     const occurredAt=new Date(body.occurredAt||now());if(!Number.isFinite(occurredAt.getTime())||occurredAt.toISOString().slice(0,10)<campaign.startDate||occurredAt.toISOString().slice(0,10)>campaign.endDate)throw new ApiError(422,'Event date must be inside the campaign window.');
     const event={id:eventId,campaignId:campaign.id,orgId:user.orgId,creatorId,customerId,type,status,amount,occurredAt:occurredAt.toISOString(),source:'simulated_product_event'};store.events.push(event);audit(user,campaign.id,'record_demo_event','Simulated event only.');persist();return clone(event);
    }
    if(method==='POST'&&parts[3]==='review-event'){
     if(!['live','paused','closed'].includes(campaign.status))throw new ApiError(409,'Event review is locked.');const event=store.events.find(e=>e.campaignId===campaign.id&&e.id===body.id);if(!event)throw new ApiError(404,'Event not found.');if(event.status!=='pending'||!['verified','rejected'].includes(body.status))throw new ApiError(409,'Invalid event review.');const note=text(body.note,'Review note');event.status=body.status;audit(user,campaign.id,'review_event',note);persist();return clone(event);
    }
   }
  }
  throw new ApiError(404,'Endpoint not found.');
 }
 return {mode:'demo',request,getSession:()=>request('GET','/session'),logout:()=>request('DELETE','/session')};
}
