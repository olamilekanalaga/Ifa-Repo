// Fictional fixtures ported from the user-supplied identity prototype.
// No score is derived from X, a wallet provider or real participant data.
export const IDENTITY_KEY='ifagrithm-identity-preview-v1';
export const ECONOMIES=[{key:'Trenches',label:'Trenches'},{key:'Web3',label:'Traditional Web3'},{key:'Hybrid',label:'Hybrid'}];
export const DIMENSIONS={social:'Social contribution',onchain:'On-chain participation'};
export const SAMPLE_PROFILES=[
 {id:'1',handle:'@chainobserver',name:'Chain Observer',initials:'CO',accent:'#A6A2FF',segment:'Trenches',speciality:'Early narrative research',network:'Solana',social:78,onchain:92,tags:['Narrative scout','Active trader'],bio:'Fictional example of narrative research and wallet participation interests across Solana.'},
 {id:'2',handle:'@defiatlas',name:'DeFi Atlas',initials:'DA',accent:'#68DCC2',segment:'Web3',speciality:'DeFi education & research',network:'Multi-chain',social:91,onchain:76,tags:['Research creator','DeFi'],bio:'Fictional example of protocol research and accessible education.'},
 {id:'3',handle:'@mintpilot',name:'Mint Pilot',initials:'MP',accent:'#FFB97D',segment:'Hybrid',speciality:'Creator & on-chain contributor',network:'Solana',social:86,onchain:81,tags:['Community builder','Trader'],bio:'Illustrative combination of community distribution and on-chain participation. No wallet ownership proof has been collected.'},
 {id:'4',handle:'@liquiditylens',name:'Liquidity Lens',initials:'LL',accent:'#7EC8FF',segment:'Trenches',speciality:'Token flow analysis',network:'Solana',social:63,onchain:95,tags:['On-chain analyst','Active trader'],bio:'Fictional example of interest in liquidity flows and token participation, not a profit claim.'},
 {id:'5',handle:'@growtharc',name:'Growth Arc',initials:'GA',accent:'#F5A9D2',segment:'Web3',speciality:'Campaign & community strategy',network:'EVM',social:94,onchain:52,tags:['Campaign creator','Community'],bio:'Fictional example of campaigns, community contributions and education.'},
 {id:'6',handle:'@walletpath',name:'Wallet Path',initials:'WP',accent:'#D4C77B',segment:'Hybrid',speciality:'Wallet intelligence',network:'Multi-chain',social:71,onchain:89,tags:['Data researcher','Creator'],bio:'Fictional example of explaining wallet activity for creator and ecosystem research.'}
].map(p=>Object.freeze({...p,tags:Object.freeze(p.tags),fictional:true,verified:false,evidence:'Prototype fixture only'}));
export const AREAS=[...new Set(SAMPLE_PROFILES.flatMap(p=>p.tags))].sort();
export const CONCEPT_NEEDS=[
 {name:'Verified community researchers',type:'Research',segment:'Hybrid',desc:'Concept: discover participants who combine thoughtful research with appropriately evidenced on-chain participation.'},
 {name:'Active Solana participants',type:'Community',segment:'Trenches',desc:'Concept: find people familiar with memecoin culture who can explain participation and its risks responsibly.'},
 {name:'DeFi educational creators',type:'Creator',segment:'Web3',desc:'Concept: discover creators with evidence of protocol knowledge and sustained educational contribution.'}
];
const clone=value=>structuredClone(value);
const blank=()=>({version:1,social:null,wallet:null,timeline:[]});
const handle=value=>{const s=String(value||'').trim().replace(/^@/,'');if(!/^[A-Za-z0-9_]{1,15}$/.test(s))throw Error('Use a public X username of 1–15 letters, numbers or underscores. Do not enter passwords.');return s;};
const address=value=>{const s=String(value||'').trim();if(!/^0x[0-9a-fA-F]{40}$/.test(s)&&!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(s))throw Error('Use a public EVM or Solana-format address. Private keys, seed phrases and ownership claims are not accepted.');return s;};
export function selectIdentityProfiles({query='',economy='All',area='All'}={}){
 const q=String(query).trim().toLowerCase();return SAMPLE_PROFILES.filter(p=>(economy==='All'||p.segment===economy)&&(area==='All'||p.tags.includes(area))&&`${p.name} ${p.handle} ${p.speciality} ${p.tags.join(' ')}`.toLowerCase().includes(q));
}
export function rankIdentityProfiles({economy,dimension,query='',area='All'}){
 if(!ECONOMIES.some(e=>e.key===economy)||!Object.hasOwn(DIMENSIONS,dimension))throw Error('Choose one economy and one disclosed dimension. There is no global identity score.');
 const sorted=selectIdentityProfiles({economy,query,area}).sort((a,b)=>b[dimension]-a[dimension]||a.name.localeCompare(b.name));
 return sorted.map((p,i)=>({...p,rank:i&&sorted[i-1][dimension]===p[dimension]?sorted.findIndex(x=>x[dimension]===p[dimension])+1:i+1,value:p[dimension],dimension,economy}));
}
export function resolveIdentityRoute(hash,pathname='/',legacy=false){
 if(legacy)return {identity:false};const path=String(hash||'').replace(/^#/,'').replace(/\/+$/,'')||'/';
 const aliases={'/':'home','/overview':'overview','/discover':'discover','/rankings':'rankings','/identity':'identity','/opportunities':'opportunities'};
 if(path==='/access')return {identity:true,page:'home'};
 if(path.startsWith('/access/'))return {identity:true,page:'identity',redirect:'/identity'};
 if(!hash&&pathname!=='/'&&pathname!=='/index.html'){
  if(pathname==='/access')return {identity:true,page:'home'};
  if(pathname.startsWith('/access/'))return {identity:true,page:'identity',redirect:'/identity'};
  if(aliases[pathname])return {identity:true,page:aliases[pathname],redirect:pathname};
 }
 if(Object.hasOwn(aliases,path))return {identity:true,page:aliases[path]};
 const legacyRoutes=new Set(['founder-demo','founder','admin','creators','profile','rewards','studio','historical-studio','campaign','evidence','analytics','reports','campaign-records','campaign-impact','campaign-workflow','creator-campaigns','my-campaigns','r']);
 return legacyRoutes.has(path.split('/')[1])?{identity:false}:{identity:true,page:'not-found'};
}
export function createIdentityStore(storage,now=()=>new Date().toISOString()){
 let state=blank(),warning='';try{const saved=JSON.parse(storage.getItem(IDENTITY_KEY));if(saved?.version===1){
  if(saved.social){handle(saved.social.value);if(saved.social.consent!==true)throw Error('Missing consent');}
  if(saved.wallet){address(saved.wallet.value);if(saved.wallet.consent!==true)throw Error('Missing consent');}
  state={...blank(),social:saved.social?{...saved.social,verified:false}:null,wallet:saved.wallet?{...saved.wallet,verified:false}:null,timeline:Array.isArray(saved.timeline)?saved.timeline.slice(-40).map(e=>({kind:['social','wallet'].includes(e.kind)?e.kind:'identity',action:['added','removed'].includes(e.action)?e.action:'removed',at:String(e.at).slice(0,30)})):[]};
 }}catch{warning='Local identity preview could not be read. No identity has been verified; you can reset the preview.';}
 const save=next=>{try{storage.setItem(IDENTITY_KEY,JSON.stringify(next));}catch{throw Error('This browser could not save the identity preview. Check storage permissions; no connection was made.');}state=next;warning='';};
 return {read(){return clone({...state,warning,classification:null,confidence:null,authenticated:false,ownershipVerified:false});},add(kind,value,consent){if(!['social','wallet'].includes(kind))throw Error('Unknown identity layer.');if(consent!==true)throw Error('Explicit consent to local demo storage is required.');const normalized=kind==='social'?handle(value):address(value);const next=clone(state);next[kind]={value:normalized,consent:true,verified:false,source:'User-entered demo identifier',at:now()};next.timeline.push({kind,action:'added',at:now()});next.timeline=next.timeline.slice(-40);save(next);},remove(kind){if(!['social','wallet'].includes(kind))throw Error('Unknown identity layer.');const next=clone(state);next[kind]=null;next.timeline.push({kind,action:'removed',at:now()});save(next);},reset(){try{storage.removeItem(IDENTITY_KEY);}catch{throw Error('Could not clear local identity data. Check browser storage permissions.');}state=blank();warning='';}};
}
