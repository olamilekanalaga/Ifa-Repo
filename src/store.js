export const STORAGE_KEY='ifagrithm-demo-v1';
export function initialState(){return {version:1,currentCreator:'creator-0001',session:false,memberships:{},applications:[],events:[],rules:{},days:{},finalized:{},nextEvent:1,tourSeen:false,historicalSpecs:[]};}
export function loadState(storage){
  try{const s=JSON.parse(storage.getItem(STORAGE_KEY));if(s?.version===1&&Array.isArray(s.events)&&Array.isArray(s.applications)&&s.memberships&&s.rules&&s.days&&s.finalized&&typeof s.nextEvent==='number')return {...initialState(),...s};}catch{}
  return initialState();
}
export function persistState(storage,state){try{storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}}
