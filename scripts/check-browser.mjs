import { createServer } from 'vite';

const mock=`
import {CITYWIDE_STAPLES} from '/src/data/fallbackStaples.ts';
export const state={votes:{},calls:0};
const restaurants=CITYWIDE_STAPLES.slice(0,3),summary={status:'voting',deckId:'deck-0',generation:0,eligibleParticipantCount:1,completedParticipantCount:0,cards:restaurants.map((r,i)=>({position:i+1,restaurantId:r.id,yesCount:0,noCount:0,laterCount:0})),participantProgress:[],tiedRestaurantIds:[]};
export async function fetchDeckRestaurants(){return {deckId:'deck-0',generation:0,restaurants};}
export async function getRoomDecisionState(){return {room:{stage:'swiping',version:state.calls,restaurant_summary:summary},myVotes:{...state.votes}};}
export async function submitRestaurantVote(_room,_token,_version,_deck,restaurant,vote){state.calls++;state.votes[restaurant]=vote;return getRoomDecisionState();}
`;
const test=`
import React,{act} from 'react';import{createRoot}from'react-dom/client';
import{useRestaurantSwiper}from'/src/hooks/useRestaurantSwiper.ts';import{state}from'virtual:phase3-api';
window.IS_REACT_ACT_ENVIRONMENT=true;let hook,checks=0;const assert=(v,m)=>{if(!v)throw new Error(m);checks++};
function Harness(){hook=useRestaurantSwiper({roomId:'room',participantId:'participant',sessionToken:'session-token-0000',version:0,category:'burger',stage:'swiping',onRefresh:async()=>{}});return null;}
const root=createRoot(document.getElementById('root'));
try{await act(async()=>{root.render(React.createElement(Harness));await new Promise(r=>setTimeout(r,80));});
assert(hook.deck.length===3,'authoritative deck loaded');const first=hook.deck[0].id;
await act(async()=>hook.recordVote('LATER'));assert(state.votes[first]==='LATER','Later is persisted');assert(hook.deck.at(-1).id===first,'Later resurfaces');
await act(async()=>hook.recordVote('YES'));assert(Object.values(state.votes).includes('YES'),'Yes is persisted');
await act(async()=>hook.recordVote('NO'));assert(Object.values(state.votes).includes('NO'),'No is persisted');
document.getElementById('result').textContent='PASS: '+checks+' browser checks: authoritative deck and YES/NO/LATER lifecycle.';
}catch(error){document.getElementById('result').textContent='FAIL: '+error.stack;}finally{await act(async()=>root.unmount());}
`;
const server=await createServer({server:{host:'127.0.0.1',port:5187,strictPort:true},plugins:[{
  name:'phase3-browser-fixtures',enforce:'pre',resolveId(source,importer){if(source==='virtual:phase3-browser'||source==='virtual:phase3-api')return'\0'+source;if(source==='../lib/supabase'&&importer?.replaceAll('\\','/').endsWith('/hooks/useRestaurantSwiper.ts'))return'\0virtual:phase3-api';},
  load(id){if(id==='\0virtual:phase3-browser')return test;if(id==='\0virtual:phase3-api')return mock;},
  configureServer(server){server.middlewares.use('/phase3-tests',async(_req,res)=>{res.setHeader('Content-Type','text/html');res.end(await server.transformIndexHtml('/phase3-tests','<html><body><pre id="result">Running...</pre><div id="root"></div><script type="module" src="/@id/__x00__virtual:phase3-browser"></script></body></html>'));});}
}]});
await server.listen();console.log('Open http://127.0.0.1:5187/phase3-tests for isolated browser regressions. No live backend writes.');
