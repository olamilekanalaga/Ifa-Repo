import {fit} from './engine.js';
import {campaignById} from './data.js';
const themes={Wallets:'Wallets, swaps, general DeFi education',Payments:'Stablecoin payments, transfers, consumer apps',Trading:'Memecoins, token launches, speculative trading',Lending:'DeFi lending, borrowing, collateral, Aave',NFTs:'NFT collecting, marketplaces, digital ownership',Gaming:'Web3 games, player onboarding, game reviews',Music:'Music discovery, artists, streaming',Social:'Social apps, community participation, creator tools'};
export function historicalContent(creator){const top=Object.entries(creator.topics).sort((a,b)=>b[1]-a[1])[0]?.[0];return themes[top]||'General Web3 education';}
export function lendingFit(creator){return {strong:'Strong fit',weak:'Potential fit; review needed',locked:'Not eligible'}[fit(creator,campaignById.aave)];}

export function creatorSegments(creator){const top=Object.entries(creator.topics).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,3);const total=top.reduce((sum,[,v])=>sum+v,0);let used=0;return top.map(([category,value],i)=>{const percentage=i===top.length-1?100-used:Math.round(value/total*100);used+=percentage;return {category,percentage};});}
export function creatorXUrl(creator){return creator.id==='creator-0001'?'https://x.com/Ola_Crrypt':null;}
