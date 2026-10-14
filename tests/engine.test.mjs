import test from 'node:test';
import assert from 'node:assert/strict';
import {creators,campaigns,campaignById,creatorById} from '../src/data.js';
import {fit,score,odu,ranking,addEvent,outcomeTotals,finalize,advanceDay,membership} from '../src/engine.js';
import {initialState,loadState,persistState,STORAGE_KEY} from '../src/store.js';
const c=campaignById.phantom,id=creators[0].id;
const joined=()=>{const s=initialState();s.memberships[c.id+':'+id]='joined';return s;};
test('dataset contains exactly 1,000 unique synthetic profiles and 10 campaigns',()=>{
 assert.equal(creators.length,1000);assert.equal(new Set(creators.map(c=>c.id)).size,1000);assert.equal(new Set(creators.map(c=>c.handle)).size,1000);assert.equal(campaigns.length,10);assert.ok(campaigns.every(c=>c.pool>0));
});
test('default creator can join wallets, apply for trading and cannot join NFTs',()=>{
 assert.equal(fit(creators[0],c),'strong');assert.equal(fit(creators[0],campaignById.jupiter),'weak');assert.equal(fit(creators[0],campaignById.opensea),'locked');
 assert.equal(fit({...creators[0],evidence:'limited'},c),'weak');
});
test('100 sign-ups at equal volume earn a modest breadth advantage; points remain uncapped',()=>{
 const a=score({signup:100,activation:1,volume:1000},c.rules),b=score({signup:1,activation:1,volume:1000},c.rules);
 assert.equal(a,129);assert.equal(b,110);assert.equal(score({signup:1000},c.rules),20);assert.equal(odu(1600),256);assert.ok(score({volume:100000},c.rules)>800);
});
test('ten sign-ups equal one sign-up plus activation before volume',()=>{
 assert.equal(score({signup:10},c.rules),score({signup:1,activation:1},c.rules));
});
test('all reward pools conserve every cent',()=>{
 for(const campaign of campaigns){const rows=ranking(campaign,initialState());assert.ok(rows.length>50);assert.equal(rows.reduce((n,r)=>n+Math.round(r.reward*100),0),campaign.pool*100);assert.ok(Math.abs(rows.reduce((n,r)=>n+r.share,0)-1)<1e-12);assert.ok(rows.every((r,i)=>i===0||rows[i-1].points>=r.points));}
});
test('unjoined, self-referral, orphan activation and duplicate milestones rejected',()=>{
 const s=joined();assert.equal(addEvent(initialState(),c,id,'signup',1,'u').ok,false);assert.equal(addEvent(s,c,id,'signup',1,id).ok,false);assert.equal(addEvent(s,c,id,'activation',1,'u').ok,false);
 assert.equal(addEvent(s,c,id,'signup',1,'u').ok,true);assert.equal(addEvent(s,c,id,'signup',1,'u').ok,false);assert.equal(addEvent(s,c,id,'volume',100,'u').ok,false);
 assert.equal(addEvent(s,c,id,'activation',1,'u').ok,true);assert.equal(addEvent(s,c,id,'volume',100,'u','verified','tx1').ok,true);assert.equal(addEvent(s,c,id,'volume',100,'u','verified','tx1').ok,false);
});
test('pending and rejected events do not earn rewards',()=>{
 const s=joined();addEvent(s,c,id,'signup',1,'pending','pending');addEvent(s,c,id,'signup',1,'rejected','rejected');assert.equal(outcomeTotals(c,id,s).signup,0);assert.equal(ranking(c,s).find(r=>r.creator.id===id).reward,0);
});
test('one customer cannot be attributed to two creators in one campaign',()=>{
 const s=joined(),other=ranking(c,s)[0].creator.id;assert.equal(addEvent(s,c,id,'signup',1,'same').ok,true);assert.equal(addEvent(s,c,other,'signup',1,'same').ok,false);
});
test('complete customer journey changes rank, Odu and money',()=>{
 const s=joined();for(const [t,n] of [['signup',1],['activation',1],['volume',100],['retention',1]])assert.equal(addEvent(s,c,id,t,n,'u').ok,true);
 const row=ranking(c,s).find(r=>r.creator.id===id);assert.equal(row.points,25);assert.equal(row.odu,8);assert.ok(row.reward>0);assert.equal(row.outcomes.retention,1);
});
test('negative and nonfinite events and zero scoring rules rejected',()=>{
 const s=joined();assert.equal(addEvent(s,c,id,'signup',-1,'u').ok,false);assert.equal(addEvent(s,c,id,'signup',NaN,'u').ok,false);assert.equal(addEvent(s,c,id,'signup',2,'u').ok,false);assert.throws(()=>score({}, {...c.rules,volumeUnit:0}));assert.throws(()=>score({}, {...c.rules,signup:0,activation:0,volume:0,retention:0}));
});
test('more contributions elsewhere can lower an existing estimate',()=>{
 const s=joined();addEvent(s,c,id,'signup',1,'mine');const before=ranking(c,s).find(r=>r.creator.id===id).share;advanceDay(s,c);const after=ranking(c,s).find(r=>r.creator.id===id).share;assert.ok(after<before);
});
test('finalization locks events and snapshots conserved allocations',()=>{
 const s=joined();assert.equal(finalize(s,c),true);const snapshot=structuredClone(s.finalized[c.id]);assert.equal(finalize(s,c),false);assert.equal(addEvent(s,c,id,'signup',1,'new').ok,false);assert.equal(advanceDay(s,c),false);assert.deepEqual(s.finalized[c.id],snapshot);assert.equal(snapshot.rows.reduce((n,r)=>n+Math.round(r.reward*100),0),c.pool*100);
});
test('browser state persists and corrupt storage falls back safely',()=>{
 const m=new Map(),storage={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)},s=joined();s.session=true;assert.equal(persistState(storage,s),true);assert.deepEqual(loadState(storage),s);m.set(STORAGE_KEY,'broken');assert.deepEqual(loadState(storage),initialState());assert.equal(persistState({setItem(){throw Error('quota');}},s),false);
});
