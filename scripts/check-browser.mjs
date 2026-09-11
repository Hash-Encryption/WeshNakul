import { createServer } from 'vite';

const mock=`
import {CITYWIDE_STAPLES} from '/src/data/fallbackStaples.ts';
const decks=[CITYWIDE_STAPLES.slice(0,7),CITYWIDE_STAPLES.slice(0,3).map(item=>({...item,id:item.id+'-gen1'}))];
export const state={votes:{},version:0,generation:0,stage:'swiping',failNext:false};
const summary=()=>({status:'voting',deckId:'deck-'+state.generation,generation:state.generation,eligibleParticipantCount:1,completedParticipantCount:0,cards:decks[state.generation].map((r,i)=>({position:i+1,restaurantId:r.id,yesCount:state.votes[r.id]==='YES'?1:0,noCount:state.votes[r.id]==='NO'?1:0,laterCount:state.votes[r.id]==='LATER'?1:0})),participantProgress:[],tiedRestaurantIds:[]});
export async function fetchDeckRestaurants(){return {deckId:'deck-'+state.generation,generation:state.generation,restaurants:decks[state.generation]};}
export async function getRoomDecisionState(){return {room:{stage:state.stage,version:state.version,restaurant_summary:summary()},myVotes:{...state.votes}};}
export async function submitRestaurantVote(_room,_token,version,_deck,restaurant,vote){if(state.failNext||version!==state.version){state.failNext=false;throw Object.assign(new Error('stale'),{code:'PT409'});}state.version++;state.votes[restaurant]=vote;return getRoomDecisionState();}
export function externalRefresh(){state.version++;}
export function staleNext(){state.failNext=true;}
export function advanceGeneration(){state.generation=1;state.votes={};state.version++;}
`;
const test=`
import React,{act,useState} from 'react';import{createRoot}from'react-dom/client';
import{useRestaurantSwiper}from'/src/hooks/useRestaurantSwiper.ts';import{state,externalRefresh,staleNext,advanceGeneration}from'virtual:phase3-api';
window.IS_REACT_ACT_ENVIRONMENT=true;let hook,checks=0;const assert=(v,m)=>{if(!v)throw new Error(m);checks++};
let refresh;function Harness(){const[version,setVersion]=useState(0);refresh=()=>setVersion(state.version);hook=useRestaurantSwiper({roomId:'room',participantId:'participant',sessionToken:'session-token-0000',version,category:'burger',stage:state.stage,onRefresh:async()=>refresh()});return null;}
const settle=async action=>act(async()=>{await action();await new Promise(r=>setTimeout(r,40));});
const root=createRoot(document.getElementById('root'));
try{await act(async()=>{root.render(React.createElement(Harness));await new Promise(r=>setTimeout(r,80));});
assert(hook.deck.length===7,'authoritative Gen0 deck loaded');const gen0Ids=hook.deck.map(x=>x.id),first=gen0Ids[0],second=gen0Ids[1];
await settle(()=>hook.recordVote('LATER'));assert(state.votes[first]==='LATER','Later is persisted');assert(hook.deck[0].id===second&&hook.deck.at(-1).id===first,'Later rotates behind untouched cards after refresh');
externalRefresh();await settle(async()=>refresh());assert(hook.deck[0].id===second,'realtime version refresh preserves traversal');
staleNext();await settle(()=>hook.recordVote('YES'));assert(hook.deck[0].id===second&&state.votes[second]===undefined,'PT409 refresh preserves current card');
await settle(()=>hook.recordVote('LATER'));assert(hook.deck[0].id!==first&&hook.deck[0].id!==second,'multiple Later cards advance deterministically');assert(hook.deck.slice(-2).map(x=>x.id).join()===first+','+second,'deferred order remains stable');
for(let i=0;i<5;i++)await settle(()=>hook.recordVote(i?'NO':'YES'));
assert(hook.deck[hook.currentIndex].id===first,'first deferred card resurfaces after untouched cards');
await settle(()=>hook.recordVote('YES'));assert(state.votes[first]==='YES'&&hook.deck[hook.currentIndex].id===second,'Later can change to one authoritative YES');
await settle(()=>hook.recordVote('NO'));assert(state.votes[second]==='NO','second Later can change to NO');
advanceGeneration();await settle(async()=>refresh());assert(hook.deck.length===3&&hook.currentIndex===0&&!gen0Ids.includes(hook.deck[0].id),'Gen1 resets stale Gen0 traversal');
document.getElementById('result').textContent='PASS: '+checks+' browser checks: Later rotation, refresh, stale recovery, resurfacing, replacement and Gen1 reset.';
}catch(error){document.getElementById('result').textContent='FAIL: '+error.stack;}finally{await act(async()=>root.unmount());}
`;
const server=await createServer({server:{host:'127.0.0.1',port:5187,strictPort:true},plugins:[{
  name:'phase3-browser-fixtures',enforce:'pre',resolveId(source,importer){if(source==='virtual:phase3-browser'||source==='virtual:phase3-api')return'\0'+source;if(source==='../lib/supabase'&&importer?.replaceAll('\\','/').endsWith('/hooks/useRestaurantSwiper.ts'))return'\0virtual:phase3-api';},
  load(id){if(id==='\0virtual:phase3-browser')return test;if(id==='\0virtual:phase3-api')return mock;},
  configureServer(server){server.middlewares.use('/phase3-tests',async(_req,res)=>{res.setHeader('Content-Type','text/html');res.end(await server.transformIndexHtml('/phase3-tests','<html><body><pre id="result">Running...</pre><div id="root"></div><script type="module" src="/@id/__x00__virtual:phase3-browser"></script></body></html>'));});}
}]});
await server.listen();console.log('Open http://127.0.0.1:5187/phase3-tests for isolated browser regressions. No live backend writes.');
