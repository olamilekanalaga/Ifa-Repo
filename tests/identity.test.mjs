import test from 'node:test';
import assert from 'node:assert/strict';
import {IDENTITY_KEY,SAMPLE_PROFILES,selectIdentityProfiles,rankIdentityProfiles,resolveIdentityRoute,createIdentityStore} from '../src/identityModel.js';
import {createIdentityExperience} from '../src/identityUi.js';
const storage=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};};
test('prototype fixtures remain fictional, unverified and filterable by economy and participation area',()=>{
 assert.equal(SAMPLE_PROFILES.length,6);assert(SAMPLE_PROFILES.every(p=>p.fictional&&!p.verified));assert.equal(selectIdentityProfiles({economy:'Trenches'}).length,2);assert.equal(selectIdentityProfiles({area:'DeFi'})[0].id,'2');assert.equal(selectIdentityProfiles({query:'wallet intelligence'})[0].id,'6');assert.equal(selectIdentityProfiles({query:'no such example'}).length,0);
});
test('rankings require one economy and one disclosed dimension rather than a global signal score',()=>{
 assert.throws(()=>rankIdentityProfiles({economy:'All',dimension:'social'}),/no global/);assert.throws(()=>rankIdentityProfiles({economy:'Hybrid',dimension:'signal'}),/no global/);
 const social=rankIdentityProfiles({economy:'Trenches',dimension:'social'}),chain=rankIdentityProfiles({economy:'Trenches',dimension:'onchain'});assert.equal(social[0].id,'1');assert.equal(chain[0].id,'4');assert(chain.every(p=>p.segment==='Trenches'&&p.dimension==='onchain'));assert.equal(chain[0].rank,1);
});
test('home and access preserve the chooser; subsequent onboarding and legacy routes remain connected',()=>{
 for(const hash of ['#/access/founder','#/access/creator','#/access/signin'])assert.equal(resolveIdentityRoute(hash).redirect,'/identity');
 assert.equal(resolveIdentityRoute('','/access').page,'home');assert.equal(resolveIdentityRoute('#/access').page,'home');assert.equal(resolveIdentityRoute('','/rankings').page,'rankings');assert.equal(resolveIdentityRoute('').page,'home');assert.equal(resolveIdentityRoute('#/discover').page,'discover');assert.equal(resolveIdentityRoute('#/access','/',true).identity,false);assert.equal(resolveIdentityRoute('#/campaign-workflow/lending-pilot/report').identity,false);assert.equal(resolveIdentityRoute('#/missing-view').page,'not-found');
});
test('local inputs require consent and never become authenticated, linked, analysed or ownership-verified',()=>{
 const disk=storage(),s=createIdentityStore(disk,()=> '2026-10-22T12:00:00Z');assert.throws(()=>s.add('social','example_creator',false),/consent/);s.add('social','@example_creator',true);s.add('wallet','0x'+'1'.repeat(40),true);const result=s.read();assert.equal(result.authenticated,false);assert.equal(result.ownershipVerified,false);assert.equal(result.classification,null);assert.equal(result.confidence,null);assert.equal(result.social.verified,false);assert.equal(result.wallet.verified,false);assert.equal(result.timeline.length,2);assert.equal(createIdentityStore(disk).read().social.value,'example_creator');
});
test('invalid inputs and persistence failures preserve prior state; reset affects only the identity namespace',()=>{
 const disk=storage();disk.setItem('ifagrithm-demo-v1','old campaign data');const s=createIdentityStore(disk);s.add('social','example_creator',true);assert.throws(()=>s.add('wallet','my seed phrase goes here',true),/public EVM or Solana/);assert.throws(()=>s.add('wallet','0x'+'1'.repeat(64),true),/public EVM or Solana/);assert.throws(()=>s.add('social','<script>',true),/public X username/);
 const before=s.read();disk.setItem=()=>{throw Error('Quota');};assert.throws(()=>s.add('wallet','0x'+'2'.repeat(40),true),/could not save/);assert.deepEqual(s.read(),before);s.reset();assert.equal(s.read().social,null);assert.equal(disk.getItem('ifagrithm-demo-v1'),'old campaign data');assert.equal(disk.getItem(IDENTITY_KEY),null);
});
test('tampered stored verification flags cannot become proof, while corrupt records show an error state',()=>{
 const disk=storage();disk.setItem(IDENTITY_KEY,JSON.stringify({version:1,social:{value:'example_creator',consent:true,verified:true},wallet:null,timeline:[]}));assert.equal(createIdentityStore(disk).read().social.verified,false);disk.setItem(IDENTITY_KEY,'{broken');const s=createIdentityStore(disk);assert.match(s.read().warning,/could not be read/);assert.equal(s.read().social,null);
});
test('screens expose disabled live connections, unknown categorisation and no unqualified composite rank',()=>{
 const experience=createIdentityExperience(storage());const identity=experience.render('identity');assert.match(identity,/Connect X.*coming soon/);assert.match(identity,/Connect wallet.*coming soon/);assert.match(identity,/disabled/);assert.match(identity,/Not analysed/);assert.match(identity,/No evidence collected/);
 const rank=experience.render('rankings');assert.match(rank,/Ranking scope/);assert.doesNotMatch(rank,/Composite|Signal score/);assert.match(rank,/arbitrary demo indices/);const ops=experience.render('opportunities');assert.match(ops,/not funded briefs/);assert.match(ops,/Brief publishing.*not available/);
});
test('integration status has loading, unavailable and retry recovery without enabling provider controls',async()=>{
 const experience=createIdentityExperience(storage());const pending=experience.load(async()=>{throw Error('Network down');});assert.equal(experience.view.status,'loading');await pending;assert.equal(experience.view.status,'error');assert.match(experience.render('identity'),/Retry status check/);await experience.load(async()=>({ok:true,json:async()=>({mode:'production',authenticationConfigured:false})}));assert.equal(experience.view.status,'ready');assert.match(experience.render('identity'),/disabled/);
});
