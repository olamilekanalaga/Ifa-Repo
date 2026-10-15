import {portfolioProjects} from './portfolioProjects.js';
export const TOPICS = ['Wallets','Payments','Trading','Lending','NFTs','Gaming','Music','Social'];
export function rng(seed) { let s=seed>>>0; return () => { s=(Math.imul(1664525,s)+1013904223)>>>0; return s/4294967296; }; }
const first=['Amara','Tunde','Maya','Kai','Zara','Felix','Nia','Arjun','Lena','Kofi','Yuki','Noor','Diego','Ada','Sofia','Leo','Imani','Chen','Priya','Kwame','Sade','Jules','Sam','Emeka','Ria','Ayo','Iris','Dara','Remi','Jin','Kemi','Tao'];
const last=['Stone','Okafor','Reed','Adebayo','Park','Mensah','Silva','Chen','Patel','Cole','Santos','Kim','Ali','Walker','Tanaka','Morgan','Bello','Cruz','Lee','Reyes','Adeyemi','James','Shah','Blake','Costa','Obi','Khan','Sato','Nwosu','Wells','Diaz','Ellis'];
const regions=['West Africa','United Kingdom','North America','Southeast Asia','Europe','Latin America'];
export const creators = Array.from({length:1000},(_,i)=>{
  const r=rng(9101+i*83), a=i%8,b=(a+1+(i%3))%8,c=(a+4)%8;
  const topics=Object.fromEntries(TOPICS.map(t=>[t,5]));
  topics[TOPICS[a]]=70+Math.floor(r()*25); topics[TOPICS[b]]=30+Math.floor(r()*28); topics[TOPICS[c]]=12+Math.floor(r()*12);
  const name=i===0?'⭕️La_Crrypt💰₿':`${first[i%32]} ${last[Math.floor(i/32)%32]}`;
  if(i===0) Object.assign(topics,{Wallets:91,Payments:82,Trading:44,Lending:23,NFTs:10,Gaming:7,Music:4,Social:18});
  return {id:`creator-${String(i+1).padStart(4,'0')}`,name,avatarPath:i===0?'/assets/avatars/la-crrypt.jpg':null,handle:i===0?'Ola_Crrypt':`${name.toLowerCase().replaceAll(' ','_')}_${i+1}`,topics,region:i===0?'United Kingdom':regions[i%6],followers:i===0?66000:Math.round(900+r()*98000),posts:i===0?null:8+Math.floor(r()*95),avatarIndex:i%24,evidence:i%11===0&&i!==0?'limited':'established',bio:i===0?'Lead Researcher at IFAGRITHM':`Exploring ${TOPICS[a].toLowerCase()} through useful stories and practical guides.`,seed:i+1};
});
const seeds=[
 ['phantom','Phantom','Make the first wallet feel easy','Wallets','Help new users set up a wallet and take their first useful action.',6000,'#bcb3ff','First wallet action','https://phantom.com'],
 ['jupiter','Jupiter','Turn discovery into a first swap','Trading','Introduce eligible new users to swaps and meaningful repeat activity.',8500,'#b7ee95','First qualifying swap','https://jup.ag'],
 ['metamask','MetaMask','A better first step into Web3','Wallets','Bring new users through wallet setup, activation and repeat use.',5000,'#ffc17a','First wallet action','https://metamask.io'],
 ['uniswap','Uniswap','Build a habit beyond the first swap','Trading','Find new swappers who come back and make useful transactions.',7500,'#ffb3d6','First qualifying swap','https://uniswap.org'],
 ['aave','Aave','Understand before your first supply','Lending','Help suitable users learn the product and complete a qualifying supply.',4500,'#adc6ef','First qualifying supply','https://aave.com'],
 ['opensea','OpenSea','Bring collectors to their first find','NFTs','Introduce new collectors to discovery, a first purchase and a return visit.',5000,'#9ed3fc','First qualifying purchase','https://opensea.io'],
 ['magic-eden','Magic Eden','Help new collectors find their people','NFTs','Connect new collectors with experiences worth returning to.',4000,'#ffb3ea','First qualifying purchase','https://magiceden.io'],
 ['axie','Axie Infinity','From curious visitor to returning player','Gaming','Introduce new players who complete their first session and keep playing.',3500,'#9ee5dc','First completed session','https://axieinfinity.com'],
 ['audius','Audius','Help listeners discover a new favourite','Music','Bring new listeners to a full listening session and a return visit.',2500,'#cab2fd','First listening session','https://audius.co'],
 ['zora','Zora','Bring curious people into creation','Social','Help new users explore, create and return to the community.',3000,'#f6b99c','First creation','https://zora.co'],
];
seeds.push(...portfolioProjects.map(p=>[p.id,p.brand,'Explore the product and return',p.topic,'Sample brief: help new users discover the product, complete a useful first action and return. Fictional budget and outcomes.',p.pool,'#e8bd54','First qualifying product action',p.website]));
export const campaigns=seeds.map((s,i)=>({id:s[0],campaignModel:'points_pool',brand:s[1],logoPath:portfolioProjects.find(p=>p.id===s[0])?.logoPath,simulation:true,title:s[2],topic:s[3],description:s[4],pool:s[5],color:s[6],activationLabel:s[7],website:s[8],duration:28,day:8+i%6,oduTarget:800,featured:i<3,rules:{signup:1,activation:9,volume:10,retention:5,breadthCap:20,volumeUnit:100},eligibleActions:['signup','activation','volume','retention']})).sort((a,b)=>Number(Boolean(b.logoPath))-Number(Boolean(a.logoPath)));
export const creatorById=Object.fromEntries(creators.map(c=>[c.id,c]));
export const campaignById=Object.fromEntries(campaigns.map(c=>[c.id,c]));
