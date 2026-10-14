export function evaluateFixedReferral(campaign, events = []) {
  if (campaign.campaignModel !== 'fixed_per_qualified_referral') throw new Error('Unsupported campaign model');
  if (!Number.isFinite(campaign.reward.amount) || campaign.reward.amount <= 0) throw new Error('Reward must be positive');
  const customers = new Map(), ids = new Map(), invalid = new Set();
  for (const e of events) {
    if (!e || e.campaignId !== campaign.id || !e.id || !e.customerId) continue;
    const signature = JSON.stringify([e.customerId,e.referrerId,e.type,e.status]);
    if (ids.has(e.id)) { if(ids.get(e.id).signature !== signature){invalid.add(e.customerId);invalid.add(ids.get(e.id).customerId);} continue; }
    ids.set(e.id,{signature,customerId:e.customerId});
    if(e.status !== 'verified' || !campaign.events.some(t=>t.key===e.type)) continue;
    const r=customers.get(e.customerId)||{types:new Set(),referrers:new Set(),missing:false};
    if(e.type!=='first_game_created'||r.types.has('account_registered'))r.types.add(e.type);
    if(e.referrerId) r.referrers.add(e.referrerId); else r.missing=true;
    customers.set(e.customerId,r);
  }
  const rewards=new Map();let qualifyingCustomers=0;
  for(const [customerId,r] of customers){
    const [referrer]=r.referrers;
    if(invalid.has(customerId)||r.missing||r.referrers.size!==1||referrer===customerId||!campaign.qualification.requires.every(t=>r.types.has(t)))continue;
    qualifyingCustomers++;rewards.set(referrer,(rewards.get(referrer)||0)+Math.round(campaign.reward.amount*100));
  }
  return {qualifyingCustomers,estimatedRewards:[...rewards].map(([referrerId,cents])=>({referrerId,amountUSD:cents/100})),totalEstimatedUSD:[...rewards.values()].reduce((a,b)=>a+b,0)/100,isPayoutAuthorization:false};
}
export function evaluateCampaign(campaign,events,{pointsPool}={}){
  if(campaign.campaignModel==='fixed_per_qualified_referral')return evaluateFixedReferral(campaign,events);
  if(campaign.campaignModel==='points_pool'&&pointsPool)return pointsPool(campaign);
  throw new Error('Unsupported campaign model');
}
