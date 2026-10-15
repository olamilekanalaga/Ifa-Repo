import test from 'node:test';
import assert from 'node:assert/strict';
import {createDemoWorkspaceApi,routeAllowed} from '../src/workspaceModel.js';
import {workspacePage,workspaceNav} from '../src/workspaceUi.js';
const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)}};
const setup=()=>createDemoWorkspaceApi(storage());
const login=(api,persona)=>api.request('POST','/demo/session',{persona});
const status=(fn,expected)=>assert.throws(fn,error=>error.status===expected);
const draft=()=>({title:'A qualifying product action',objective:'Acquire accounts who complete a useful product action.',topic:'Wallets',activationLabel:'First product use',eligibility:'Reviewed relevant creators',qualifyingEvents:['activation'],startDate:'2026-10-01',endDate:'2026-12-31',pool:100,rules:{signup:1,activation:9,volume:10,retention:5,breadthCap:20,volumeUnit:100}});

test('anonymous, creator and pending identities cannot access private founder or admin APIs',()=>{
 const api=setup();status(()=>api.request('GET','/founder/reports'),401);
 login(api,'creator');const user=api.getSession().user;assert.equal(routeAllowed(user,'/studio'),false);assert.equal(routeAllowed(user,'/founder/reports'),false);
 status(()=>api.request('GET','/founder/campaigns'),403);status(()=>api.request('GET','/admin/applications'),403);status(()=>api.request('GET','/creator/outcomes?creatorId=creator-0002'),403);
 assert.doesNotMatch(workspaceNav(api,{name:'discover'}),/founder\/|admin\//);
 assert.doesNotMatch(workspacePage(api,{name:'founder',id:'reports'}),/Attributed product events|ws-first-action|sample-user-a/);
 login(api,'founder_pending');status(()=>api.request('GET','/founder/reports'),403);assert.match(workspacePage(api,{name:'founder',id:'campaigns'}),/under review/);assert.doesNotMatch(workspacePage(api,{name:'founder',id:'campaigns'}),/data-ws-form="campaign"/);
});
test('creator registration ignores attempted client-side role and approval assignment',()=>{
 const api=setup();const result=api.request('POST','/creator/register',{name:'A new creator',email:'new@example.com',roles:['admin','founder'],founderStatus:'approved',orgId:'org-wallet'});
 assert.deepEqual(result.user.roles,['creator']);assert.equal(result.user.founderStatus,null);assert.equal(result.user.orgId,undefined);status(()=>api.request('GET','/founder/settings'),403);
});
test('founder application creates a pending approval with complete company information',()=>{
 const api=setup();const app=api.request('POST','/founder/applications',{name:'New founder',companyName:'New product',workEmail:'newfounder@example.com',website:'https://example.net',description:'A real product description for a local demo.',social:'@newproduct',status:'approved',roles:['admin']});
 assert.equal(app.status,'pending');assert.equal(api.getSession().user.founderStatus,'pending');assert.equal(api.getSession().user.roles.includes('admin'),false);status(()=>api.request('POST','/admin/applications/'+app.id,{action:'approve',note:'Attempted self approval'}),403);status(()=>api.request('GET','/founder/campaigns'),403);
});
test('only admin approval enables founder access; suspension and revocation remove it immediately',()=>{
 const api=setup();login(api,'admin');status(()=>api.request('POST','/admin/applications/application-pending',{action:'approve',note:''}),422);
 api.request('POST','/admin/applications/application-pending',{action:'approve',note:'Company reviewed in this simulation.'});
 let app=api.request('GET','/admin/applications').applications.find(a=>a.id==='application-pending');assert.equal(app.status,'approved');assert.equal(app.history.at(-1).action,'approve_founder');assert.match(app.history.at(-1).note,/Company reviewed/);
 login(api,'founder_pending');assert.equal(api.getSession().user.founderStatus,'approved');assert.equal(api.request('GET','/founder/campaigns').campaigns.length,0);assert.equal(api.request('GET','/founder/application').history,undefined);
 login(api,'admin');api.request('POST','/admin/applications/application-pending',{action:'suspend',note:'Suspended after review.'});login(api,'founder_pending');status(()=>api.request('GET','/founder/reports'),403);
 login(api,'admin');api.request('POST','/admin/applications/application-pending',{action:'revoke',note:'Access revoked.'});login(api,'founder_pending');assert.equal(api.getSession().user.founderStatus,'revoked');status(()=>api.request('GET','/founder/settings'),403);
});
test('rejection persists and review notes remain administrator-only',()=>{const api=setup();login(api,'admin');api.request('POST','/admin/applications/application-pending',{action:'reject',note:'Internal-only review context.'});login(api,'founder_pending');const own=api.request('GET','/founder/application');assert.equal(own.status,'rejected');assert.doesNotMatch(JSON.stringify(own),/Internal-only/);status(()=>api.request('GET','/admin/applications'),403)});
test('organisation scope applies to listing, direct campaign IDs, reports and mutations',()=>{
 const api=setup();login(api,'founder_approved');assert.deepEqual(api.request('GET','/founder/campaigns').campaigns.map(c=>c.id),['ws-first-action']);
 status(()=>api.request('GET','/founder/reports?campaignId=ws-other-campaign'),403);
 status(()=>api.request('POST','/founder/campaigns/ws-other-campaign/transition',{action:'pause'}),403);
 status(()=>api.request('PATCH','/founder/campaigns/ws-other-campaign',draft()),403);
 assert.doesNotMatch(JSON.stringify(api.request('GET','/founder/settings')),/Other Demo Organisation/);
});
test('draft → review → admin approval → launch → pause → close → finalise',()=>{
 const api=setup();login(api,'founder_approved');const campaign=api.request('POST','/founder/campaigns',draft());assert.equal(campaign.status,'draft');
 api.request('POST',`/founder/campaigns/${campaign.id}/transition`,{action:'submit'});status(()=>api.request('POST',`/founder/campaigns/${campaign.id}/transition`,{action:'launch'}),409);
 status(()=>api.request('PATCH','/founder/campaigns/'+campaign.id,draft()),409);
 login(api,'admin');api.request('POST','/admin/campaigns/'+campaign.id,{action:'approve',note:'Reviewed the rules and product objective.'});
 login(api,'founder_approved');for(const action of ['launch','pause','resume','close'])api.request('POST',`/founder/campaigns/${campaign.id}/transition`,{action});
 const final=api.request('POST',`/founder/campaigns/${campaign.id}/finalise`);assert.equal(final.isPayoutAuthorization,false);assert.deepEqual(final.rows,[]);status(()=>api.request('POST',`/founder/campaigns/${campaign.id}/finalise`),409);
});
test('only founder-scoped product events contribute; duplicate rewards and attribution conflicts fail closed',()=>{
 const api=setup();login(api,'founder_approved');const payload={id:'test-signup',creatorId:'creator-0001',customerId:'test-customer',type:'signup',status:'verified',amount:1,occurredAt:'2026-10-14T12:00:00Z'};
 api.request('POST','/founder/campaigns/ws-first-action/events',payload);
 status(()=>api.request('POST','/founder/campaigns/ws-first-action/events',payload),409);
 status(()=>api.request('POST','/founder/campaigns/ws-first-action/events',{...payload,id:'test-other',creatorId:'creator-0002',type:'activation'}),409);
 status(()=>api.request('POST','/founder/campaigns/ws-first-action/events',{...payload,id:'self',customerId:'creator-0001'}),422);
 status(()=>api.request('POST','/founder/campaigns/ws-first-action/events',{...payload,id:'social',type:'likes'}),422);
 const before=api.request('GET','/founder/reports').metrics.creatorPoints;
 api.request('POST','/founder/campaigns/ws-first-action/events',{...payload,id:'test-activation',type:'activation',status:'pending'});
 assert.equal(api.request('GET','/founder/reports').metrics.creatorPoints,before);
 api.request('POST','/founder/campaigns/ws-first-action/review-event',{id:'test-activation',status:'verified',note:'Verified in simulation.'});
 assert.equal(api.request('GET','/founder/reports').metrics.creatorPoints,before+9);
});
test('reports filter campaign, creator, date, product event and verification without redistributing rewards',()=>{
 const api=setup();login(api,'founder_approved');const all=api.request('GET','/founder/reports');assert.equal(all.metrics.attributedUsers,3);assert.equal(all.metrics.verifiedQualifyingActions,2);assert.equal(all.metrics.conversionRate,2/3);assert.equal(all.metrics.returningUsers,1);assert.equal(all.metrics.expenditureUSD,null);
 const mine=api.request('GET','/founder/reports?campaignId=ws-first-action&creatorId=creator-0001');assert.equal(mine.rows.length,1);assert.equal(mine.metrics.estimatedRewardsUSD,500);assert.ok(mine.events.every(e=>e.creatorId==='creator-0001'));
 const filtered=api.request('GET','/founder/reports?startDate=2026-10-12&endDate=2026-10-12&eventType=retention&status=verified');assert.equal(filtered.events.length,1);assert.equal(filtered.metrics.returningUsers,1);assert.equal(filtered.metrics.conversionRate,null);assert.equal(filtered.metrics.estimatedRewardsUSD,all.metrics.estimatedRewardsUSD);
});
test('finalised campaign allocations conserve cents and cannot change with later events',()=>{const api=setup();login(api,'founder_approved');api.request('POST','/founder/campaigns/ws-first-action/transition',{action:'close'});const final=api.request('POST','/founder/campaigns/ws-first-action/finalise');assert.equal(Math.round(final.rows.reduce((n,r)=>n+r.reward,0)*100),100000);status(()=>api.request('POST','/founder/campaigns/ws-first-action/review-event',{id:'ws-e5',status:'verified',note:'Late review'}),409);assert.equal(api.request('GET','/founder/reports').metrics.finalisedRewardsUSD,1000)});
test('team invitations do not approve identities or grant memberships',()=>{const api=setup();login(api,'founder_approved');const invitation=api.request('POST','/founder/invitations',{email:'pending@example.org',role:'admin',status:'approved'});assert.equal(invitation.status,'pending_identity_verification');login(api,'founder_pending');status(()=>api.request('GET','/founder/settings'),403)});
test('demo sessions and approval history persist independently of legacy campaign state',()=>{const memory=storage(),api=createDemoWorkspaceApi(memory);login(api,'admin');api.request('POST','/admin/applications/application-pending',{action:'approve',note:'Saved review history.'});const restored=createDemoWorkspaceApi(memory);assert.equal(restored.getSession().user.roles[0],'admin');assert.equal(restored.request('GET','/admin/applications').applications.find(a=>a.id==='application-pending').status,'approved');api.logout();status(()=>api.request('GET','/admin/applications'),401)});
