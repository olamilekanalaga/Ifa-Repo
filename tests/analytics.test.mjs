import test from 'node:test';
import assert from 'node:assert/strict';
import {evidenceRows,campaignAnalytics} from '../src/campaignAnalytics.js';
import {sendHistorical} from '../src/sendHistorical.js';
test('project charts preserve distinct measures, ranges and missing values',()=>{assert.equal(sendHistorical.topic,'Wallets');assert.deepEqual(evidenceRows.map(r=>r.financialUSD),[100000,200000,5000]);assert.deepEqual(evidenceRows.map(r=>r.financialMeasure),['Campaign budget','Estimated annual creator token rewards','Advertised competition payout cap']);assert.equal(evidenceRows[2].users,null);assert.equal(evidenceRows[1].creatorsMin,200);assert.equal(evidenceRows[1].creatorsMax,300);assert.match(campaignAnalytics(),/Download chart data/);assert.match(campaignAnalytics(),/not summed into paid rewards/)});
