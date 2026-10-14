import test from 'node:test';
import assert from 'node:assert/strict';
import {breshnaHistorical as c} from '../src/breshnaHistorical.js';
import {evaluateFixedReferral,evaluateCampaign} from '../src/campaignRuleEngine.js';
import {unavailable,specificationFromForm,historicalPage} from '../src/historicalStudio.js';
import {campaigns} from '../src/data.js';
import {ranking} from '../src/engine.js';
import {initialState,loadState,persistState} from '../src/store.js';
const event=(type,id,extra={})=>({campaignId:c.id,customerId:'customer',referrerId:'referrer',status:'verified',type,id,...extra});
const signup=event('account_registered','a'),game=event('first_game_created','b');
for(const [name,events,expected] of [
 ['signup alone pays zero',[signup],0],['first game after signup pays once',[signup,game],1],
 ['duplicate first-game events do not double-pay',[signup,game,game,{...game,id:'c'}],1],
 ['missing referral pays zero',[{...signup,referrerId:null},{...game,referrerId:null}],0],
 ['self-referral pays zero',[{...signup,referrerId:'customer'},{...game,referrerId:'customer'}],0],
 ['conflicting attribution pays zero',[signup,{...game,referrerId:'other'}],0],
 ['unverified events pay zero',[signup,{...game,status:'pending'}],0],
 ['game before signup does not qualify',[game,signup],0],
 ['foreign campaign does not qualify',[signup,{...game,campaignId:'foreign'}],0],
 ['conflicting duplicate IDs invalidate evidence',[signup,game,{...game,referrerId:'other'}],0]
])test(name,()=>{const result=evaluateFixedReferral(c,events);assert.equal(result.totalEstimatedUSD,expected);assert.equal(result.isPayoutAuthorization,false)});
test('historical unknowns remain null and display Not available',()=>{for(const metric of Object.values(c.metrics))assert.equal(metric,null);assert.equal(c.measurement.attributionWindowDays,null);assert.equal(unavailable(null),'Not available');assert.match(historicalPage(initialState()),/Creators|creator accounts/);assert.match(historicalPage(initialState()),/Operator recollections/)});
test('model dispatcher preserves synthetic points pools and rejects ranking historical cases',()=>{assert.equal(campaigns.length,10);for(const campaign of campaigns){assert.equal(campaign.campaignModel,'points_pool');const rows=evaluateCampaign(campaign,[],{pointsPool:campaign=>ranking(campaign,initialState())});assert.equal(Math.round(rows.reduce((n,r)=>n+r.reward,0)*100),campaign.pool*100)}assert.throws(()=>ranking(c,initialState()),/Points pool/)});
test('human review, evidence, nullable fields and persisted versions',()=>{const d=new FormData();for(const [key,value] of Object.entries({brief:'Referral campaign',objective:'Create games',amount:'1',reviewed:'on',adminEvidence:'Operator recollection, unverified'}))d.set(key,value);const s=initialState(),one=specificationFromForm(d,s);assert.equal(one.measurement.attributionWindowDays,null);assert.equal(one.specVersion,1);s.historicalSpecs=[one];const two=specificationFromForm(d,s);s.historicalSpecs.push(two);assert.equal(two.specVersion,2);assert.equal(one.reward.amount,1);const storage={setItem(k,v){this.value=v},getItem(){return this.value}};persistState(storage,s);assert.equal(loadState(storage).historicalSpecs.length,2);d.delete('reviewed');assert.throws(()=>specificationFromForm(d,s),/human review/)});
