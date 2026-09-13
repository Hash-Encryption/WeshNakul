import { createServer } from 'vite';

const mock=`
import {CITYWIDE_STAPLES} from '/src/data/fallbackStaples.ts';
const decks=[CITYWIDE_STAPLES.slice(0,7),CITYWIDE_STAPLES.slice(0,3).map(item=>({...item,id:item.id+'-gen1'}))];
export const state={votes:{},version:0,generation:0,stage:'swiping',failCount:0,delayNext:false};
const summary=()=>({status:'voting',deckId:'deck-'+state.generation,generation:state.generation,eligibleParticipantCount:1,completedParticipantCount:0,cards:decks[state.generation].map((r,i)=>({position:i+1,restaurantId:r.id,yesCount:state.votes[r.id]==='YES'?1:0,noCount:state.votes[r.id]==='NO'?1:0,laterCount:state.votes[r.id]==='LATER'?1:0})),participantProgress:[],tiedRestaurantIds:[]});
export async function fetchDeckRestaurants(){return {deckId:'deck-'+state.generation,generation:state.generation,restaurants:decks[state.generation]};}
export async function getRoomDecisionState(){return {room:{stage:state.stage,version:state.version,restaurant_summary:summary()},myVotes:{...state.votes}};}
export async function submitRestaurantVote(_room,_token,version,_deck,restaurant,vote){if(state.delayNext){state.delayNext=false;await new Promise(r=>setTimeout(r,80));}if(state.failCount||version!==state.version){if(state.failCount)state.failCount--;throw Object.assign(new Error('stale'),{code:'PT409'});}state.version++;state.votes[restaurant]=vote;return getRoomDecisionState();}
export function externalRefresh(){state.version++;}
export function staleNext(count=1){state.failCount=count;}
export function delayNext(){state.delayNext=true;}
export function advanceGeneration(){state.generation=1;state.votes={};state.version++;}
`;
const roomMock=`
import React from'react';let spin=null,listeners=new Set();const emit=()=>listeners.forEach(fn=>fn());
export function useRoom(){React.useSyncExternalStore(fn=>(listeners.add(fn),()=>listeners.delete(fn)),()=>spin,()=>spin);return{currentRoom:{id:'room',tied_categories:['burger','pizza']},isHost:true,participants:[],decisionSpin:spin,startCategoryRoulette:async()=>{const now=Date.now();spin={spinId:'server-spin',kind:'category',candidateIds:['burger','pizza'],startedAt:now,plannedRevealAt:now+30};emit();await new Promise(r=>setTimeout(r,10));spin={...spin,winnerId:'burger',revealAt:Date.now()+20,completeAt:Date.now()+80};emit();}}}
`;
const localeMock=`export function useLocale(){return{locale:'en',t:key=>key}};export function LocaleProvider({children}){return children}`;
const test=`
import React,{act,useState} from 'react';import{createRoot}from'react-dom/client';
import{useRestaurantSwiper}from'/src/hooks/useRestaurantSwiper.ts';import{state,externalRefresh,staleNext,delayNext,advanceGeneration}from'virtual:phase3-api';
window.IS_REACT_ACT_ENVIRONMENT=true;let hook,checks=0;const assert=(v,m)=>{if(!v)throw new Error(m);checks++};
let refresh;function Harness(){const[version,setVersion]=useState(0);refresh=()=>setVersion(state.version);hook=useRestaurantSwiper({roomId:'room',participantId:'participant',sessionToken:'session-token-0000',version,category:'burger',stage:state.stage,summary:{deckId:'deck-'+state.generation},onRefresh:async()=>refresh()});return null;}
const settle=async action=>act(async()=>{await action();await new Promise(r=>setTimeout(r,40));});
const root=createRoot(document.getElementById('root'));
try{await act(async()=>{root.render(React.createElement(Harness));await new Promise(r=>setTimeout(r,80));});
assert(hook.deck.length===7,'authoritative Gen0 deck loaded');const gen0Ids=hook.deck.map(x=>x.id),first=gen0Ids[0],second=gen0Ids[1];
delayNext();let delayed;await act(async()=>{delayed=hook.recordVote('LATER');await new Promise(r=>setTimeout(r,5));});assert(state.votes[first]===undefined&&hook.deck[0].id===second,'card advances before authoritative request completes');await settle(()=>delayed);assert(state.votes[first]==='LATER','Later is persisted');assert(hook.deck[0].id===second&&hook.deck.at(-1).id===first,'Later rotates behind untouched cards after refresh');
externalRefresh();await settle(()=>hook.recordVote('YES'));assert(state.votes[second]==='YES','one PT409 refreshes canonical version and retries once');
const third=hook.deck[hook.currentIndex].id;staleNext(2);await settle(()=>hook.recordVote('YES'));assert(hook.deck[hook.currentIndex].id===third&&state.votes[third]===undefined,'repeated PT409 preserves current card');
await settle(()=>hook.recordVote('LATER'));assert(hook.deck[hook.currentIndex].id!==first&&hook.deck[hook.currentIndex].id!==third,'multiple Later cards advance deterministically');assert(hook.deck.slice(-2).map(x=>x.id).join()===first+','+third,'deferred order remains stable');
for(let i=0;i<4;i++)await settle(()=>hook.recordVote(i?'NO':'YES'));
assert(hook.deck[hook.currentIndex].id===first,'first deferred card resurfaces after untouched cards');
await settle(()=>hook.recordVote('YES'));assert(state.votes[first]==='YES'&&hook.deck[hook.currentIndex].id===third,'Later can change to one authoritative YES');
await settle(()=>hook.recordVote('NO'));assert(state.votes[third]==='NO','second Later can change to NO');
advanceGeneration();await act(async()=>{refresh();await new Promise(r=>setTimeout(r,120));});assert(hook.deck.length===3&&hook.currentIndex===0&&!gen0Ids.includes(hook.deck[0]?.id),'Gen1 resets stale Gen0 traversal: '+hook.deck.length+'/'+hook.currentIndex+'/'+hook.deck[0]?.id);
document.getElementById('result').textContent='PASS: '+checks+' browser checks: Later rotation, refresh, stale recovery, resurfacing, replacement and Gen1 reset.';
await act(async()=>root.unmount());const{TiebreakerScreen}=await import('/src/components/voting/TiebreakerScreen.tsx');const ui=createRoot(document.getElementById('root'));await act(async()=>ui.render(React.createElement(TiebreakerScreen)));assert(!document.body.innerText.includes('Shawarma'),'roulette contains tied candidates only');await act(async()=>{document.querySelector('button')?.dispatchEvent(new MouseEvent('click',{bubbles:true}));await new Promise(r=>setTimeout(r,5));});assert(document.body.innerText.includes('rouletteSpinning'),'roulette starts before winner resolves');await act(async()=>new Promise(r=>setTimeout(r,60)));assert(document.body.innerText.includes('Burger'),'roulette consumes authoritative winner');await act(async()=>ui.unmount());document.getElementById('result').textContent='PASS: '+checks+' browser checks: immediate voting, Later lifecycle, Gen1 reset and authoritative roulette presentation.';
}catch(error){document.getElementById('result').textContent='FAIL: '+error.stack;}
`;
const server=await createServer({server:{host:'127.0.0.1',port:5187,strictPort:true},plugins:[{
  name:'phase3-browser-fixtures',enforce:'pre',resolveId(source,importer){if(source==='virtual:phase3-browser'||source==='virtual:phase3-api'||source==='virtual:room-context'||source==='virtual:locale-context')return'\0'+source;const path=importer?.replaceAll('\\','/');if(source==='../lib/supabase'&&path?.endsWith('/hooks/useRestaurantSwiper.ts'))return'\0virtual:phase3-api';if(source==='../../context/RoomContext'&&path?.endsWith('/components/voting/TiebreakerScreen.tsx'))return'\0virtual:room-context';if(source==='../../context/LocaleContext'&&path?.includes('/components/'))return'\0virtual:locale-context';},
  load(id){if(id==='\0virtual:phase3-browser')return test;if(id==='\0virtual:phase3-api')return mock;if(id==='\0virtual:room-context')return roomMock;if(id==='\0virtual:locale-context')return localeMock;},
  configureServer(server){server.middlewares.use('/phase3-tests',async(_req,res)=>{res.setHeader('Content-Type','text/html');res.end(await server.transformIndexHtml('/phase3-tests','<html><body><pre id="result">Running...</pre><div id="root"></div><script type="module" src="/@id/__x00__virtual:phase3-browser"></script></body></html>'));});}
}]});
await server.listen();console.log('Open http://127.0.0.1:5187/phase3-tests for isolated browser regressions. No live backend writes.');
