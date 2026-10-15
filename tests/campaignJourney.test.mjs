import test from 'node:test';
import assert from 'node:assert/strict';
import {createCampaignJourney,measurementWindow,matchCreators,journeyAnalysis} from '../src/campaignJourneyModel.js';
import {creatorById} from '../src/data.js';
import {routeAllowed} from '../src/workspaceModel.js';
import {downloadableReport,journeyPage} from '../src/campaignJourneyUi.js';
const disk=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};};
const founder={demo:true,roles:['founder'],founderStatus:'approved',orgId:'org-wallet'};
const setup=()=>createCampaignJourney(disk(),()=>founder);
const headers='post_id,creator,published_at,captured_at,impressions,likes,replies,reposts,post_url,source\n';
const row=(post,creator,date,imp,source='Test export')=>`${post},${creator},2026-09-01,${date},${imp},10,1,2,https://x.com/${creator}/status/${post},${source}\n`;
const create=api=>api.act('','create',{...api.read('lending-pilot'),name:'New lending campaign',client:'Client B',start:'2026-09-01',end:'2026-09-30',status:'Draft',followDays:7,budget:1000,spend:''});
const participate=(api,id,creatorId)=>{api.act(id,'shortlist',{creatorId});api.act(id,'participant',{creatorId,status:'participating',fee:100,availability:'Demo confirmed',reason:'Relevant demo content'});};
test('seed proves one campaign with five participants, managed snapshots, organic separation and missing attribution',()=>{
 const api=setup(),c=api.read('lending-pilot'),a=api.analyse(c.id);assert.equal(c.roster.length,5);assert.equal(a.participating,5);assert.equal(a.managed.posts.length,5);assert.equal(a.wider.posts.length,1);assert.equal(a.managed.changes.impressions.observed,5);assert.equal(a.product.attribution.newWallets.value,null);assert(a.findings.some(f=>f.title==='Attribution unavailable'));
 assert.match(journeyPage(api,{id:c.id,ref:'report'}),/Managed campaign vs wider discussion/);
});
test('new campaign connects brief-specific shortlist, participation, assignment and registered content',()=>{
 const api=setup(),c=create(api);assert.equal(c.social.length,0);assert.equal(c.reports.length,0);assert.equal(c.spend,null);
 const matches=matchCreators(c,{minimum:40});assert(matches.length);assert(matches.every(p=>p.share>=40));const p=matches[0];
 api.act(c.id,'shortlist',{creatorId:p.id});assert.throws(()=>api.act(c.id,'deliverable',{creatorId:p.id,title:'Explain product',due:'2026-09-10'}),/participating/);
 api.act(c.id,'participant',{creatorId:p.id,status:'participating',fee:100,availability:'Yes',reason:'Demo relevance'});
 api.act(c.id,'deliverable',{creatorId:p.id,title:'Explain product',due:'2026-09-10'});const task=api.read(c.id).deliverables[0];api.act(c.id,'delivery-status',{id:task.id,status:'Delivered'});
 api.act(c.id,'content',{kind:'managed',creatorId:p.id,postId:'123',publishedAt:'2026-09-01',url:`https://x.com/${p.handle}/status/123`});assert.equal(api.analyse(c.id).delivered,1);
 assert.throws(()=>api.act(c.id,'participant',{creatorId:p.id,status:'declined'}),/assigned work/);
});
test('snapshots append without double-counting and exact boundaries define differences',()=>{
 const api=setup(),c=create(api),p=matchCreators(c,{minimum:40})[0];participate(api,c.id,p.id);api.act(c.id,'content',{kind:'managed',creatorId:p.id,postId:'123',publishedAt:'2026-09-01',url:`https://x.com/${p.handle}/status/123`});
 const csv=headers+row('123',p.handle,'2026-09-23',10000)+row('123',p.handle,'2026-09-30',45000);
 api.act(c.id,'import',{source:'social',csv});api.act(c.id,'import',{source:'social',csv});const a=api.analyse(c.id);assert.equal(a.managed.metrics.impressions.value,45000);assert.equal(a.managed.changes.impressions.value,35000);assert.equal(api.read(c.id).social.length,2);
 const missing=api.analyse(c.id,measurementWindow(c,'24',c.end));assert.equal(missing.managed.metrics.impressions.value,45000);assert.equal(missing.managed.changes.impressions.value,null);
 const past=api.analyse(c.id,measurementWindow(c,'custom','2026-09-23','2026-09-01'));assert.equal(past.managed.metrics.impressions.value,10000);
 assert.throws(()=>api.act(c.id,'import',{source:'social',csv:headers+row('123',p.handle,'2026-09-30',99999)}),/different snapshot/);
 assert.equal(api.analyse(c.id).managed.metrics.impressions.value,45000);
});
test('imports require registered creator identity; organic mentions do not become managed contributions',()=>{
 const api=setup(),c=create(api);assert.throws(()=>api.act(c.id,'import',{source:'social',csv:headers+row('123','Organic','2026-09-30',100)}),/Register post/);
 api.act(c.id,'content',{kind:'wider',creator:'Organic',postId:'123',publishedAt:'2026-09-01',url:'https://x.com/Organic/status/123'});
 api.act(c.id,'import',{source:'social',csv:headers+row('123','Organic','2026-09-30',100)});const a=api.analyse(c.id);assert.equal(a.managed.metrics.impressions.value,null);assert.equal(a.wider.metrics.impressions.value,100);
 assert.throws(()=>api.act(c.id,'import',{source:'social',csv:headers+row('123','Spoof','2026-09-29',20)}),/must match/);
});
test('first evidence import clears all sample streams and does not create attribution',()=>{
 const api=setup();api.act('lending-pilot','import',{source:'product',csv:'date,active_wallets,transactions,volume_usd,fees_usd,source\n2026-09-30,100,200,1000,5,Test query'});
 const c=api.read('lending-pilot');assert.equal(c.social.length,0);assert.equal(c.product.length,1);assert.equal(c.attribution.length,0);const a=api.analyse(c.id);assert.equal(a.product.phases.during.activeDays,1);assert.equal(a.product.phases.during.days,7);assert.equal(a.product.attribution.newWallets.value,null);
});
test('24h, 7d, 30d and custom windows are explicit and constrained to the campaign',()=>{
 const c=setup().read('lending-pilot');assert.equal(measurementWindow(c,'24').start,c.end);assert.equal(measurementWindow(c,'7').start,'2026-09-24');assert.equal(measurementWindow(c,'30').start,c.start);assert.equal(measurementWindow(c,'custom','2026-09-10','2026-09-03').start,'2026-09-03');assert.throws(()=>measurementWindow(c,'7','2026-09-02'),/inside the campaign/);assert.throws(()=>measurementWindow(c,'custom','2026-09-01','2026-09-02'),/valid custom/);
});
test('saved report freezes the selected window, brief and inputs while later evidence changes',()=>{
 const api=setup(),c=api.read('lending-pilot');api.act(c.id,'report',{preset:'7',end:c.end});const version=api.read(c.id).reports[0],before=api.exportReport(c.id,null,version.id);
 api.act(c.id,'brief',{...c,name:'Changed campaign',notes:'Changed finding'});api.act(c.id,'clear-source',{source:'social'});
 assert.deepEqual(api.exportReport(c.id,null,version.id),before);assert.equal(api.exportReport(c.id).campaign.name,'Changed campaign');assert.match(downloadableReport(before),/Lending Education/);assert.match(downloadableReport(before),/Source observations/);
});
test('organisation, campaign and production identity isolation is enforced on reads, actions and exports',()=>{
 const storage=disk();let user=founder;const api=createCampaignJourney(storage,()=>user),c=create(api);user={...founder,orgId:'other'};assert.throws(()=>api.read(c.id),/not found/);assert.throws(()=>api.exportReport(c.id),/not found/);
 user={demo:true,roles:['admin']};assert.equal(api.read(c.id).name,c.name);
 for(const denied of [null,{demo:true,roles:['creator']},{...founder,founderStatus:'pending'},{...founder,demo:false}]){user=denied;assert.throws(()=>api.list(),/access/);assert.throws(()=>api.act(c.id,'clear-source',{source:'social'}),/access/);if(user?.demo!==false)assert.equal(routeAllowed(user,'/campaign-workflow/'+c.id),false);}
});
test('metric decreases are flagged instead of reported as negative acquired impressions',()=>{
 const api=setup(),c=api.read('lending-pilot');const p=c.content[0],handle=creatorById[p.creatorId].handle;
 // Use the registered publication date rather than the helper's date.
 const csv=(headers+row(p.postId,handle,'2026-09-23',10000)+row(p.postId,handle,'2026-09-30',9000)).replaceAll(',2026-09-01,',','+p.publishedAt+',');api.act(c.id,'import',{source:'social',csv});const a=api.analyse(c.id);assert.equal(a.managed.changes.impressions.value,null);assert.equal(a.managed.changes.impressions.corrections,1);assert(a.findings.some(f=>f.title==='Review metric corrections'));
});
test('failed persistence preserves the previous state, and one-day campaigns report without an invalid default range',()=>{
 const storage=disk(),api=createCampaignJourney(storage,()=>founder),c=api.read('lending-pilot');const before=api.read(c.id);storage.setItem=()=>{throw Error('Quota full');};assert.throws(()=>api.act(c.id,'brief',{...c,name:'Unsaved'}),/Quota/);assert.deepEqual(api.read(c.id),before);
 const one=setup(),tiny=one.act('','create',{...c,name:'One day',client:'Example',start:'2026-09-01',end:'2026-09-01',followDays:7,status:'Draft'});assert.equal(one.analyse(tiny.id).window.start,'2026-09-01');
});
