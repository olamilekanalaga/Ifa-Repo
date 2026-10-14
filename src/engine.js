import {creators,creatorById,rng,TOPICS} from './data.js';
export function fit(creator,campaign){
  const score=creator.topics[campaign.topic]||0;
  return score>=65&&creator.evidence!=='limited'?'strong':score>=25?'weak':'locked';
}
export const emptyOutcomes=()=>({signup:0,activation:0,volume:0,retention:0});
export function validateRules(r){
  for(const k of ['signup','activation','volume','retention','breadthCap','volumeUnit']) if(!Number.isFinite(r[k])||r[k]<0) throw new Error('Rule values must be finite and non-negative.');
  if(r.volumeUnit<=0||r.breadthCap<=0) throw new Error('Volume unit and sign-up cap must be positive.');
  if(r.signup+r.activation+r.volume+r.retention===0) throw new Error('At least one outcome must earn points.');
  return r;
}
export function score(out,r){
  validateRules(r);
  const n=k=>Math.max(0,Number.isFinite(out[k])?out[k]:0);
  return Math.round((Math.min(n('signup'),r.breadthCap)*r.signup+n('activation')*r.activation+n('volume')/r.volumeUnit*r.volume+n('retention')*r.retention)*100)/100;
}
export function odu(points,target=800){ return Math.min(256,Math.floor(Math.max(0,points)/target*256)); }
export function seedParticipants(campaign){
  const eligible=creators.filter(c=>c.id!=='creator-0001'&&fit(c,campaign)==='strong');
  return eligible.slice(0,100).map(c=>{
    const r=rng(c.seed*139+campaign.id.length*173), signup=3+Math.floor(r()*160),activation=Math.floor(signup*(.08+r()*.5)),retention=Math.floor(activation*r()*.7);
    return {creatorId:c.id,outcomes:{signup,activation,volume:Math.round(activation*r()*220),retention}};
  });
}
const baseCache=new Map();
export function baseParticipants(campaign){if(campaign.campaignModel!=='points_pool')throw new Error('Points pool required');if(!baseCache.has(campaign.id))baseCache.set(campaign.id,seedParticipants(campaign));return baseCache.get(campaign.id);}
export function campaignRules(campaign,state){return state.rules[campaign.id]||campaign.rules;}
export function outcomeTotals(campaign,creatorId,state){
  const out={...(baseParticipants(campaign).find(p=>p.creatorId===creatorId)?.outcomes||emptyOutcomes())};
  for(const e of state.events) if(e.campaignId===campaign.id&&e.creatorId===creatorId&&e.status==='verified')out[e.type]+=e.amount;
  return out;
}
export function ranking(campaign,state){
  const ids=new Set(baseParticipants(campaign).map(p=>p.creatorId));
  for(const [key,value] of Object.entries(state.memberships))if(value==='joined'&&key.startsWith(campaign.id+':'))ids.add(key.slice(campaign.id.length+1));
  const rules=campaignRules(campaign,state);
  const rows=[...ids].map(id=>{const outcomes=outcomeTotals(campaign,id,state);return {creator:creatorById[id],outcomes,points:score(outcomes,rules)};}).filter(r=>r.creator);
  rows.sort((a,b)=>b.points-a.points||a.creator.id.localeCompare(b.creator.id));
  const total=rows.reduce((n,r)=>n+r.points,0);
  // Largest-remainder allocation conserves every cent, including final payouts.
  const poolCents=Math.round(campaign.pool*100);
  const parts=rows.map((r,index)=>{const raw=total?r.points/total*poolCents:0;return {index,cents:Math.floor(raw),fraction:raw-Math.floor(raw)};});
  let remainder=total?poolCents-parts.reduce((n,p)=>n+p.cents,0):0;
  for(const p of [...parts].sort((a,b)=>b.fraction-a.fraction||a.index-b.index)){if(remainder-->0)p.cents++;}
  return rows.map((r,i)=>({...r,rank:i+1,share:total?r.points/total:0,reward:parts[i].cents/100,odu:odu(r.points,campaign.oduTarget)}));
}
export function myRow(campaign,id,state){return ranking(campaign,state).find(r=>r.creator.id===id)||{rank:'—',points:0,reward:0,share:0,odu:0,outcomes:emptyOutcomes()};}
export function membership(campaign,id,state){return state.memberships[campaign.id+':'+id]||(baseParticipants(campaign).some(p=>p.creatorId===id)?'joined':'none');}
export function addEvent(state,campaign,creatorId,type,amount,customerId,status='verified',eventId){
  if(state.finalized[campaign.id])return {ok:false,message:'This campaign is finalized. Reset the demo to run it again.'};
  if(membership(campaign,creatorId,state)!=='joined')return {ok:false,message:'Join the campaign before adding outcomes.'};
  if(!campaign.eligibleActions.includes(type))return {ok:false,message:'Unsupported outcome.'};
  if(!['verified','pending','rejected'].includes(status))return {ok:false,message:'Invalid verification status.'};
  if(!Number.isFinite(amount)||amount<=0||(type!=='volume'&&amount!==1))return {ok:false,message:'Enter a positive amount. Each customer milestone counts once.'};
  if(!customerId?.trim())return {ok:false,message:'A demo customer ID is required.'};
  if(customerId===creatorId)return {ok:false,message:'Self-referrals do not qualify.'};
  const all=state.events.filter(e=>e.campaignId===campaign.id&&e.customerId===customerId&&e.status!=='rejected');
  if(all.some(e=>e.creatorId!==creatorId))return {ok:false,message:'This customer is already attributed to another creator.'};
  if(type!=='signup'&&!all.some(e=>e.type==='signup'&&e.status==='verified'))return {ok:false,message:'Verify this customer’s sign-up first.'};
  if(['volume','retention'].includes(type)&&!all.some(e=>e.type==='activation'&&e.status==='verified'))return {ok:false,message:'Verify this customer’s first qualifying action first.'};
  if(type!=='volume'&&all.some(e=>e.type===type))return {ok:false,message:'This customer milestone has already been recorded.'};
  const id=eventId||`event-${state.nextEvent}`;
  if(state.events.some(e=>e.id===id))return {ok:false,message:'Duplicate event ignored.'};
  state.events.push({id,campaignId:campaign.id,creatorId,type,amount,customerId,status,day:state.days[campaign.id]||campaign.day,source:'Demo event simulator'});
  state.nextEvent++;
  return {ok:true,message:status==='verified'?'Verified outcome added. Reward share recalculated.':'Event added for review.'};
}
export function finalize(state,campaign){
  if(state.finalized[campaign.id])return false;
  state.finalized[campaign.id]={day:state.days[campaign.id]||campaign.day,rows:ranking(campaign,state).map(r=>({creatorId:r.creator.id,reward:r.reward,points:r.points,odu:r.odu})),rules:{...campaignRules(campaign,state)}};
  return true;
}
export function advanceDay(state,campaign){
  if(state.finalized[campaign.id])return false;
  if((state.days[campaign.id]||campaign.day)>=campaign.duration)return false;
  state.days[campaign.id]=Math.min(campaign.duration,(state.days[campaign.id]||campaign.day)+1);
  const day=state.days[campaign.id],r=rng(day*711+campaign.id.length),participants=ranking(campaign,state).slice(0,35);
  for(const row of participants){if(r()>.6)continue;const customer=`day-${day}-${row.creator.id}-${state.nextEvent}`;addEvent(state,campaign,row.creator.id,'signup',1,customer);if(r()>.4){addEvent(state,campaign,row.creator.id,'activation',1,customer);addEvent(state,campaign,row.creator.id,'volume',Math.round(10+r()*500),customer);}}
  return true;
}
