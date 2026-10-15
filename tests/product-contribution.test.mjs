import test from 'node:test';
import assert from 'node:assert/strict';
import {createCampaignJourney,measurementWindow} from '../src/campaignJourneyModel.js';
const disk=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};};
const founder={demo:true,roles:['founder'],founderStatus:'approved',orgId:'org-wallet'};
const id='lending-pilot',wallet='0x'+'1'.repeat(40);
const setup=()=>createCampaignJourney(disk(),()=>founder);
const walletCSV=(code='LEND01')=>'campaign_id,referral_code,wallet,linked_at,source,authorised\n'+`${id},${code},${wallet},2026-09-19T12:00:00Z,Authorised test export,yes`;
const eventsCSV=(rows)=>'campaign_id,event_id,wallet,event_type,occurred_at,amount_usd,source\n'+rows.map(([event,type,date,amount])=>`${id},${event},${wallet},${type},${date},${amount??''},Test product export`).join('\n');
const review=(api,kind,recordId)=>api.act(id,'product-review',{kind,id:recordId,decision:'approved',confirm:'yes',note:'Fictional source reviewed for this test'});
test('referral to wallet to reviewed product action to report works without social reward inputs',()=>{
 const api=setup();api.act(id,'wallet-import',{csv:walletCSV()});const csv=eventsCSV([['signup','signup','2026-09-20T12:00:00Z'],['deposit','deposit','2026-09-25T12:00:00Z',200]]);api.act(id,'event-import',{csv});
 assert.equal(api.analyse(id).contributions.attributionAvailable,false);review(api,'wallet',wallet);review(api,'event','signup');review(api,'event','deposit');
 let a=api.analyse(id);assert.equal(a.contributions.attributionAvailable,true);assert.equal(a.contributions.rows[0].depositors,1);assert.equal(a.contributions.rows[0].signups,0); // sign-up outside selected seven days
 api.act(id,'clear-source',{source:'social'});assert.equal(api.analyse(id).contributions.rows[0].depositors,1);
 api.act(id,'report',{preset:'30',end:'2026-09-30'});assert.equal(api.read(id).reports[0].analysis.contributions.rows[0].signups,1);
});
test('duplicate events and links do not duplicate credit; conflicting creator attribution is rejected',()=>{
 const api=setup(),csv=eventsCSV([['deposit','deposit','2026-09-25T12:00:00Z',200]]);api.act(id,'wallet-import',{csv:walletCSV()});api.act(id,'wallet-import',{csv:walletCSV()});api.act(id,'event-import',{csv});api.act(id,'event-import',{csv});review(api,'wallet',wallet);review(api,'event','deposit');assert.equal(api.read(id).walletLinks.length,1);assert.equal(api.read(id).productEvents.length,1);assert.equal(api.analyse(id).contributions.rows[0].depositors,1);
 assert.throws(()=>api.act(id,'wallet-import',{csv:walletCSV('LEND02')}),/Conflicting referral/);
 assert.throws(()=>api.act(id,'event-import',{csv:csv.replace(',200,',',900,')}),/Conflicting duplicate/);
 assert.throws(()=>api.act(id,'referral',{creatorId:api.read(id).roster[0].creatorId,code:'NEWCODE'}),/Do not change/);
});
test('unlinked, pre-referral, pending, rejected and below-threshold events receive no qualifying deposit credit',()=>{
 const api=setup();api.act(id,'wallet-import',{csv:walletCSV()});api.act(id,'event-import',{csv:eventsCSV([['early','deposit','2026-09-18T12:00:00Z',200],['small','deposit','2026-09-25T12:00:00Z',99],['pending','deposit','2026-09-26T12:00:00Z',500]])});review(api,'wallet',wallet);review(api,'event','early');review(api,'event','small');assert.equal(api.analyse(id).contributions.rows[0].depositors,0);assert.equal(api.analyse(id).contributions.pendingEvents,1);assert.equal(api.analyse(id).contributions.unlinkedApprovedEvents,1);
 api.act(id,'product-review',{kind:'event',id:'pending',decision:'rejected',confirm:'yes',note:'Rejected demo claim'});assert.equal(api.analyse(id).contributions.rows[0].depositors,0);
});
test('returning depositors require elapsed time and remain distinct from funds-held retention',()=>{
 const api=setup();api.act(id,'wallet-import',{csv:walletCSV()});api.act(id,'event-import',{csv:eventsCSV([['d','deposit','2026-09-20T12:00:00Z',200],['r0','return','2026-09-26T12:00:00Z'],['r1','return','2026-09-27T12:00:00Z']])});review(api,'wallet',wallet);for(const e of ['d','r0','r1'])review(api,'event',e);assert.equal(api.analyse(id).contributions.rows[0].returningDepositors,1);
 api.act(id,'contribution-rules',{minimumDepositUSD:100,returnDays:8,ranking:'returningDepositors'});assert.equal(api.analyse(id).contributions.rows[0].returningDepositors,0);assert.throws(()=>api.act(id,'contribution-rules',{minimumDepositUSD:100,returnDays:7,ranking:'impressions'}),/product-outcome/);
});
test('content niche never prevents applying, and founder approval plus creator acceptance determine participation',()=>{
 let user={demo:true,roles:['creator'],creatorId:'creator-0001'};const api=createCampaignJourney(disk(),()=>user);api.creatorAction(id,'apply',{note:'I have relevant experience despite a broader content mix'});assert.equal(api.creatorView()[0].application.status,'pending');assert.throws(()=>api.creatorAction(id,'accept',{accept:'yes'}),/approval/);assert.throws(()=>api.read(id),/access/);
 user=founder;api.act(id,'application-review',{creatorId:'creator-0001',decision:'approved',note:'Relevant proposal reviewed'});assert.equal(api.read(id).roster.find(r=>r.creatorId==='creator-0001').status,'approved');user={demo:true,roles:['creator'],creatorId:'creator-0001'};api.creatorAction(id,'accept',{accept:'yes'});const own=api.creatorView()[0];assert.equal(own.participation.status,'participating');assert.equal(own.budget,undefined);assert.equal(own.walletLinks,undefined);assert.equal(own.productEvents,undefined);assert.equal(own.reports,undefined);
});
test('source review is explicit; fictional example is pending and cannot overwrite supplied attribution',()=>{
 const api=setup();api.act(id,'load-product-example');assert.equal(api.analyse(id).contributions.attributionAvailable,false);assert.equal(api.read(id).productEvents.length,4);assert.throws(()=>api.act(id,'load-product-example'),/empty product/);assert.throws(()=>api.act(id,'product-review',{kind:'event',id:api.read(id).productEvents[0].id,decision:'approved',note:'No confirmation'}),/Confirm/);
});
test('supplied attribution clears fictional social/product streams and cannot mix with example events',()=>{
 const api=setup();api.act(id,'wallet-import',{csv:walletCSV()});assert.equal(api.read(id).social.length,0);assert.equal(api.read(id).product.length,0);assert.equal(api.read(id).origins.social,'missing');
 const example=setup();example.act(id,'load-product-example');assert.throws(()=>example.act(id,'wallet-import',{csv:walletCSV()}),/Clear fictional/);example.act(id,'clear-product-evidence');example.act(id,'wallet-import',{csv:walletCSV()});assert.equal(example.read(id).walletLinks.length,1);
});
test('source event IDs cannot receive credit under two campaigns',()=>{
 const api=setup();api.act(id,'event-import',{csv:eventsCSV([['global-source-event','deposit','2026-09-25T12:00:00Z',200]])});
 const c=api.act('','create',{...api.read(id),name:'Another campaign',client:'Other client',status:'Active'});assert.throws(()=>api.act(c.id,'event-import',{csv:eventsCSV([['global-source-event','deposit','2026-09-25T12:00:00Z',200]]).replaceAll(id,c.id)}),/another campaign/);
});
test('campaign budget is separate from fees, creator compensation and external costs',()=>{
 const api=setup(),c=api.read(id);assert.throws(()=>api.act(id,'brief',{...c,serviceFeeUSD:2000,creatorBudgetUSD:4000}),/allocations exceed/);api.act(id,'brief',{...c,serviceFeeUSD:1000,creatorBudgetUSD:2500,incentivesUSD:0,externalCostsUSD:500});assert.equal(api.read(id).budget,5000);assert.equal(api.read(id).serviceFeeUSD,1000);assert.equal(api.read(id).creatorBudgetUSD,2500);
});
