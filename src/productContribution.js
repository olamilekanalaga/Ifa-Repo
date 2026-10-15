import {parseCsv} from './campaignImpactModel.js';

export const CONTRIBUTION_RANKINGS={signups:'Attributed sign-ups',depositors:'Qualifying depositors',returningDepositors:'Returning depositors'};
const fail=(condition,message)=>{if(!condition)throw Error(message);};
const wallet=value=>{fail(/^0x[0-9a-fA-F]{40}$/.test(value||''),'Use an EVM wallet address (0x plus 40 hexadecimal characters).');return value.toLowerCase();};
const timestamp=value=>{fail(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value||'')&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().replace('.000Z','Z')===value,'Use an exact UTC timestamp: YYYY-MM-DDTHH:mm:ssZ.');return value;};
const source=value=>{fail(value&&value.length<=250,'Provide a source reference up to 250 characters.');return value;};
function rows(csv,header){const parsed=parseCsv(csv);fail(parsed.length>=2,'Include headers and at least one data row.');const fields=parsed.shift().map(v=>v.replace(/^\uFEFF/,'').trim());fail(JSON.stringify(fields)===JSON.stringify(header),'Expected CSV columns: '+header.join(','));return parsed.map(cells=>{fail(cells.length===header.length,'CSV column count mismatch.');return Object.fromEntries(header.map((h,i)=>[h,cells[i].trim()]));});}
export function parseWalletLinks(csv,c){return rows(csv,['campaign_id','referral_code','wallet','linked_at','source','authorised']).map(r=>{
 fail(r.campaign_id===c.id,'Wallet mapping must reference the selected campaign ID.');const ref=(c.referrals||[]).find(p=>p.code===r.referral_code);fail(ref,'Unknown campaign referral code.');fail(c.roster.some(p=>p.creatorId===ref.creatorId&&p.status==='participating'),'The referral creator must be participating.');fail(r.authorised==='yes','Record authorised=yes only for appropriately supplied mapping records.');
 timestamp(r.linked_at);fail(r.linked_at.slice(0,10)>=c.start&&r.linked_at.slice(0,10)<=c.end,'Referral capture must fall inside the campaign.');
 return {id:wallet(r.wallet),wallet:wallet(r.wallet),code:r.referral_code,creatorId:ref.creatorId,linkedAt:r.linked_at,source:source(r.source),status:'pending',reviewNote:''};
});}
export function parseProductEvents(csv,c){return rows(csv,['campaign_id','event_id','wallet','event_type','occurred_at','amount_usd','source']).map(r=>{
 fail(r.campaign_id===c.id,'Event must reference the selected campaign ID.');fail(r.event_id&&r.event_id.length<=200,'Provide a stable source event ID, including chain/transaction/log identity where relevant.');fail(['signup','deposit','return'].includes(r.event_type),'Supported event types: signup, deposit, return.');timestamp(r.occurred_at);fail(r.occurred_at.slice(0,10)>=c.start&&r.occurred_at.slice(0,10)<=c.end,'Event time must fall inside the campaign.');
 const amount=r.amount_usd===''?null:Number(r.amount_usd);fail(amount===null||(Number.isFinite(amount)&&amount>=0&&amount<=Number.MAX_SAFE_INTEGER),'Use a safe non-negative USD amount.');fail(r.event_type!=='deposit'||amount!==null,'Deposits require an amount in USD under the source valuation definition.');
 return {id:r.event_id,wallet:wallet(r.wallet),type:r.event_type,occurredAt:r.occurred_at,amountUSD:amount,source:source(r.source),status:'pending',reviewNote:''};
});}
export function contributionSummary(c,window){
 const rules=c.contributionRules||{minimumDepositUSD:100,returnDays:7,requireSignup:false,ranking:'depositors'};
 const all=c.productEvents||[],links=c.walletLinks||[],roster=c.roster.filter(p=>p.status==='participating');
 const contributions=roster.map(p=>{
  const own=links.filter(l=>l.creatorId===p.creatorId&&l.status==='approved');
  const signups=new Set(),deposits=new Set(),returning=new Set();
  for(const link of own){
   const events=all.filter(e=>e.wallet===link.wallet&&e.status==='approved'&&e.occurredAt>=link.linkedAt).sort((a,b)=>a.occurredAt.localeCompare(b.occurredAt));
   const qualifying=events.filter(e=>e.type==='deposit'&&e.amountUSD>=rules.minimumDepositUSD&&(!rules.requireSignup||events.some(s=>s.type==='signup'&&s.occurredAt<=e.occurredAt)));
   for(const e of events.filter(e=>e.occurredAt.slice(0,10)>=window.start&&e.occurredAt.slice(0,10)<=window.end)){
    if(e.type==='signup')signups.add(link.wallet);
    if(qualifying.includes(e))deposits.add(link.wallet);
    if(e.type==='return'&&qualifying.some(d=>Date.parse(e.occurredAt)-Date.parse(d.occurredAt)>=rules.returnDays*86400000))returning.add(link.wallet);
   }
  }
  return {creatorId:p.creatorId,signups:signups.size,depositors:deposits.size,returningDepositors:returning.size,approvedWallets:own.length};
 }).sort((a,b)=>b[rules.ranking]-a[rules.ranking]||a.creatorId.localeCompare(b.creatorId));
 const approvedLinks=links.filter(l=>l.status==='approved'&&roster.some(p=>p.creatorId===l.creatorId));
 const unlinked=all.filter(e=>e.status==='approved'&&!approvedLinks.some(l=>l.wallet===e.wallet&&l.linkedAt<=e.occurredAt)).length;
 return {rules,rows:contributions,pendingLinks:links.filter(l=>l.status==='pending').length,pendingEvents:all.filter(e=>e.status==='pending').length,approvedEvents:all.filter(e=>e.status==='approved').length,unlinkedApprovedEvents:unlinked,
  attributionAvailable:approvedLinks.length>0&&all.some(e=>e.status==='approved'&&approvedLinks.some(l=>l.wallet===e.wallet&&l.linkedAt<=e.occurredAt)),
  label:'Demo-reviewed client records; not independent blockchain verification or distinct human customers'};
}
