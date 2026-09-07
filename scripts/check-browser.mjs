import { createServer } from 'vite';
const mock = `
export const supabase = null;
export const state = { swipes: [], commits: [], fetches: 0 };
export async function fetchDeckRestaurants() { state.fetches++; return (await import('/src/data/fallbackStaples.ts')).CITYWIDE_STAPLES; }
export async function getRestaurantSwipes() { return [...state.swipes]; }
export async function insertRestaurantSwipe(roomId, participantId, restaurantId, liked) {
 const swipe = {id:participantId+restaurantId,roomId,participantId,restaurantId,liked,createdAt:new Date().toISOString()};
 state.swipes = [...state.swipes.filter(s=>s.id!==swipe.id),swipe]; return swipe;
}
export async function updateRoomStage(...args) { state.commits.push(args); }
`;
const test = `
import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {useRestaurantSwiper} from '/src/hooks/useRestaurantSwiper.ts';
import {state} from 'virtual:phase1-api';
import {LocaleProvider} from '/src/context/LocaleContext.tsx';
import {SwipeCard} from '/src/components/swiping/SwipeCard.tsx';
import {DeliveryLauncher} from '/src/components/orders/DeliveryLauncher.tsx';
window.IS_REACT_ACT_ENVIRONMENT=true;
let hook, checks=0;
const assert=(value,message)=>{if(!value)throw new Error(message); checks++;};
function Harness(props) {hook=useRestaurantSwiper(props); return null;}
let root;
const mount=async(stage='swiping')=>{
 if(root)await act(async()=>root.unmount());
 state.swipes=[];state.commits=[];state.fetches=0;
 root=createRoot(document.getElementById('root'));
 await act(async()=>{root.render(React.createElement(Harness,{roomId:'fixture-room',participantId:'fixture-player',isHost:true,totalParticipants:1,category:'burger',city:'jeddah',stage}));});
};
try {
 await mount('lobby'); assert(state.fetches===0,'must defer fetch outside swiping');
 await mount(); assert(state.fetches===1,'must fetch in swiping');
 const first=hook.currentItem.id, initial=hook.deck.map(r=>r.id);
 await act(async()=>hook.skipCard());
 assert(hook.currentIndex===0,'Later preserves index'); assert(hook.deck.at(-1).id===first,'Later moves card to end');
 assert(state.swipes.length===0,'Later records no vote'); assert(hook.deck[0].id===initial[1],'Later advances visible card');
 await act(async()=>hook.recordSwipe(true)); assert(state.swipes[0].liked===true,'Yes persists true'); assert(hook.currentIndex===1,'Yes advances');
 await act(async()=>hook.recordSwipe(false)); assert(state.swipes[1].liked===false,'No persists false');
 await mount(); const size=hook.totalCards;
 for(let i=0;i<size;i++)await act(async()=>hook.recordSwipe(false));
 assert(hook.currentIndex===0,'all-No restarts'); assert(hook.showRoundTwoToast,'all-No toast'); assert(!hook.isDeckFinished,'all-No deck active');
 assert(state.swipes.length===size,'all-No votes preserved');
 await act(async()=>hook.recordSwipe(true)); assert(state.swipes.length===size,'replay upserts vote'); assert(hook.allSwipes.filter(s=>s.liked).length===1,'replay tracks changed vote');
 const winner=hook.deck[0]; await act(async()=>{await hook.commitWinner(winner);await hook.commitWinner(winner);});
 assert(state.commits.length===1,'winner committed once'); assert(state.commits[0][2].winning_restaurant_id===winner.id,'winner uses brand ID');
 await act(async()=>root.unmount());
 for(const locale of ['ar','en']) {
  localStorage.setItem('wsh_locale',locale); root=createRoot(document.getElementById('root'));
  await act(async()=>root.render(React.createElement(LocaleProvider,null,
   React.createElement(SwipeCard,{restaurant:winner,isFront:true,onSwipe:()=>{}}),
   React.createElement(DeliveryLauncher,{restaurant:{...winner,links:{}},orders:[],roomCode:'TEST'})
  )));
  assert(document.documentElement.lang===locale,'language effect'); assert(document.documentElement.dir===(locale==='ar'?'rtl':'ltr'),'direction effect');
  assert(document.body.textContent.includes(locale==='ar'?winner.nameAr:winner.nameEn),'localized name');
  assert(document.querySelectorAll('a[href]').length>=3,'launcher links render without direct URLs');
  await act(async()=>root.unmount());
 }
 document.getElementById('result').textContent='PASS: '+checks+' browser checks (real React lifecycle; mocked Supabase): deferred load, Yes/No/Later, replay, winner, Arabic/English/RTL and launcher.';
} catch(error) {document.getElementById('result').textContent='FAIL: '+error.stack;}
`;
const server=await createServer({server:{host:'127.0.0.1',port:5187,strictPort:true},plugins:[{
 name:'phase1-browser-fixtures',enforce:'pre',
 resolveId(source,importer){
  if(source==='virtual:phase1-browser'||source==='virtual:phase1-api')return '\0'+source;
  if(source==='../lib/supabase'&&importer?.replaceAll('\\','/').endsWith('/hooks/useRestaurantSwiper.ts'))return '\0virtual:phase1-api';
 },
 load(id){if(id==='\0virtual:phase1-browser')return test;if(id==='\0virtual:phase1-api')return mock;},
 configureServer(server){server.middlewares.use('/phase1-tests',async (_req,res)=>{res.setHeader('Content-Type','text/html');res.end(await server.transformIndexHtml('/phase1-tests','<html><body><pre id="result">Running...</pre><div id="root"></div><script type="module" src="/@id/__x00__virtual:phase1-browser"></script></body></html>'));});},
}]});
await server.listen(); console.log('Open http://127.0.0.1:5187/phase1-tests for isolated browser regressions. No live backend writes.');
