import test from 'node:test';
import assert from 'node:assert/strict';
import {createCampaignImpact,parseSocial,parseProduct,parseAttribution,parseCsv,analyseImpact,campaignPeriods} from '../src/campaignImpactModel.js';
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};};
const social='post_id,creator,published_at,captured_at,impressions,likes,replies,reposts,post_url,source\n123,Analyst,2026-02-02,2026-04-03,1000,100,10,30,https://x.com/example/status/123,Export\n';
const product='date,active_wallets,transactions,volume_usd,fees_usd,source\n2025-12-15,100,100,2000,25,Dune query 123\n2026-02-10,200,300,4000,32,Dune query 123\n2026-04-15,150,220,3500,28,Dune query 123\n';
test('campaign windows are before, during and after, no overlap',()=>{let c={name:'A',start:'2026-01-01',end:'2026-03-31',followDays:30};let p=campaignPeriods(c);assert.equal(p.before.end,'2025-12-31');assert.equal(p.after.start,'2026-04-01');});
test('X post captures are counted once by most recent snapshot',()=>{const s=createCampaignImpact(storage());s.importRows('social',social+ '123,Analyst,2026-02-02,2026-04-04,1300,120,20,35,https://x.com/example/status/123,Export2\n');const a=s.read().analysis;assert.equal(a.social.posts,1);assert.equal(a.social.metrics.impressions.value,1300);assert.equal(s.read().mode.product,'missing');});
test('on-chain counts compare mean daily wallets and distinguish observation coverage',()=>{const s=createCampaignImpact(storage());s.importRows('product',product);const a=s.read().analysis;assert.equal(a.phases.before.activeAverage,100);assert.equal(a.phases.during.activeAverage,200);assert.equal(a.phases.after.activeAverage,150);assert.equal(a.duringVsBefore,100);assert.equal(a.afterVsDuring,-25);assert.equal(a.phases.during.observedDays,1);assert.equal(a.phases.during.days,90);});
test('missing attribution stays missing and never derives from Dune',()=>{const s=createCampaignImpact(storage());s.importRows('product',product);assert.equal(s.read().analysis.attribution.newWallets.value,null);});
test('partial imported data never mixes with fictional fixture',()=>{const s=createCampaignImpact(storage());s.importRows('social',social);assert.equal(s.read().product.length,0);assert.equal(s.read().mode.product,'missing');s.importRows('product',product);assert.equal(s.read().product.length,3);s.reset();assert.equal(s.read().mode.product,'sample');});
test('reject bad rows, duplicate daily records, and negative metrics',()=>{assert.throws(()=>parseProduct(product+product.split('\n')[1]+'\n'),/Duplicate/);assert.throws(()=>parseSocial(social.replace(',1000,',',-10,')),/nonnegative/);assert.equal(parseAttribution('date,visits,new_wallets,source\n2026-02-01,,3,F\n')[0].visits,null);assert.equal(parseCsv('a,b\n"hello, world",2').length,2);});

test('rendered founder report contains charts, import controls, and clear sample warning', async()=>{
 const {impactPage}=await import('../src/campaignImpactUi.js');const html=impactPage(createCampaignImpact(storage()));
 assert.match(html,/FICTIONAL DEMONSTRATION/);assert.match(html,/On-chain activity across periods/);assert.match(html,/<svg/);assert.match(html,/data-impact-form="social"/);assert.match(html,/data-impact-form="product"/);assert.match(html,/data-impact-form="attribution"/);
});

test('partial metric coverage stays explicit and missing days become timeline gaps',()=>{
 const s=createCampaignImpact(storage());s.importRows('product',product.replace('2026-02-10,200,300','2026-02-10,,300'));
 const a=s.read().analysis;assert.equal(a.phases.during.observedDays,1);assert.equal(a.phases.during.activeDays,0);assert.equal(a.phases.during.activeAverage,null);assert.equal(a.duringVsBefore,null);
 assert.equal(a.daily.length,150);assert.equal(a.daily.find(r=>r.date==='2026-02-11').active_wallets,null);assert.equal(a.phases.during.transactions.value,300);
});
test('incomplete engagement components are never presented as a complete engagement total',()=>{
 const s=createCampaignImpact(storage());s.importRows('social',social+'124,Analyst,2026-02-03,2026-04-03,2000,,5,5,https://x.com/example/status/124,Export\n');
 const a=s.read().analysis;assert.equal(a.social.metrics.likes.value,100);assert.equal(a.social.metrics.likes.observed,1);assert.equal(a.social.metrics.likes.all,2);assert.equal(a.social.engagements,null);
});
test('post references and creator identity agree across snapshots',()=>{
 assert.throws(()=>parseSocial(social.replace('/status/123','/status/999')),/must match/);
 assert.throws(()=>parseSocial(social+'123,OtherCreator,2026-02-02,2026-04-04,1300,120,20,35,https://x.com/example/status/123,Export2\n'),/same creator/);
});
test('invalid imports and storage failures preserve existing data; reads cannot mutate store',()=>{
 const disk=storage(),s=createCampaignImpact(disk);const before=s.exportJson();assert.throws(()=>s.importRows('product','bad'),/header/);assert.equal(s.exportJson(),before);
 const copy=s.read();copy.social[0].impressions=0;assert.notEqual(s.read().social[0].impressions,0);
 disk.setItem=()=>{throw Error('Quota exceeded');};assert.throws(()=>s.importRows('social',social),/Quota/);assert.equal(s.exportJson(),before);
});
test('approved demo organisations remain isolated and creator/pending/production identities are refused',()=>{
 let user={demo:true,roles:['founder'],founderStatus:'approved',orgId:'org-wallet'};
 const s=createCampaignImpact(storage(),()=>user);s.importRows('social',social);assert.equal(s.read().social.length,1);
 user={...user,orgId:'org-other'};assert.equal(s.read().mode.social,'sample');
 user={demo:true,roles:['admin']};assert.equal(s.read().social.length,1);
 for(const denied of [null,{demo:true,roles:['creator']},{demo:true,roles:['founder'],founderStatus:'pending',orgId:'org-wallet'},{demo:false,roles:['founder'],founderStatus:'approved',orgId:'org-wallet'}]){
  user=denied;assert.throws(()=>s.read(),/access is required/);assert.throws(()=>s.exportJson(),/access is required/);assert.throws(()=>s.importRows('social',social),/access is required/);
 }
});

test('metric overflow is rejected before altering the saved report',()=>{
 const s=createCampaignImpact(storage());const before=s.exportJson();
 const huge=social.replace(',1000,',','+Number.MAX_SAFE_INTEGER+',')+'124,Analyst,2026-02-03,2026-04-03,100,0,0,0,https://x.com/example/status/124,Export\n';
 assert.throws(()=>s.importRows('social',huge),/safe numeric range/);assert.equal(s.exportJson(),before);
});
test('rendered imported observations are escaped and source coverage reflects missing counts',async()=>{
 const {impactPage}=await import('../src/campaignImpactUi.js');const s=createCampaignImpact(storage());s.importRows('social',social.replace(',Export',',<img src=x onerror=alert(1)>'));
 const html=impactPage(s);assert.doesNotMatch(html,/<img src=x/);assert.match(html,/&lt;img/);assert.match(html,/Inspect source observations/);assert.match(html,/coverage is incomplete/);
});
