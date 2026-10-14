import test from 'node:test';
import assert from 'node:assert/strict';
import {breshnaHistorical as c} from '../src/breshnaHistorical.js';
import {evaluateFixedReferral,evaluateCampaign} from '../src/campaignRuleEngine.js';
import {unavailable,historicalPage} from '../src/historicalStudio.js';
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
test('report distinguishes campaign budget and game-creating users from creators',()=>{assert.equal(c.report.budgetUSD,100000);assert.equal(c.report.gameCreatingUsers,100000);assert.equal(c.report.participatingCreators,null);assert.equal(c.metrics.paidRewardsUSD,null);assert.match(historicalPage(),/not participating creators/);assert.doesNotMatch(historicalPage(),/historical-spec-form/)});
test('model dispatcher preserves synthetic points pools and rejects ranking historical cases',()=>{assert.equal(campaigns.length,10);for(const campaign of campaigns){assert.equal(campaign.campaignModel,'points_pool');const rows=evaluateCampaign(campaign,[],{pointsPool:campaign=>ranking(campaign,initialState())});assert.equal(Math.round(rows.reduce((n,r)=>n+r.reward,0)*100),campaign.pool*100)}assert.throws(()=>ranking(c,initialState()),/Points pool/)});
