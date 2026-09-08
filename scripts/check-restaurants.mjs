import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const store = new Map();
globalThis.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key,value) => store.set(key,String(value)), removeItem: key => store.delete(key) };
const server = await createServer({ server: { middlewareMode: true }, define: {
  'import.meta.env.VITE_SUPABASE_URL': '""', 'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
} });
let checks = 0;
try {
  for (const file of readdirSync('src/lib/__tests__').filter(f => f.endsWith('.test.ts'))) await server.ssrLoadModule(`/src/lib/__tests__/${file}`);
  const { cacheDeckRestaurants, getCachedRestaurant } = await server.ssrLoadModule('/src/lib/restaurantRepository.ts');
  const { CITYWIDE_STAPLES } = await server.ssrLoadModule('/src/data/fallbackStaples.ts');
  const item = CITYWIDE_STAPLES[0];
  const authoritative = {...item, id:'server-deck-item', selectedBranch:null};
  cacheDeckRestaurants([authoritative]);
  assert.equal(getCachedRestaurant(authoritative.id), authoritative); checks++;

  // Real React SSR rendering; no claims about browser layout or backend persistence.
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');
  const { DeliveryLauncher, formatWhatsAppOrder } = await server.ssrLoadModule('/src/components/orders/DeliveryLauncher.tsx');
  const { SwipeCard } = await server.ssrLoadModule('/src/components/swiping/SwipeCard.tsx');
  const { LeaderboardView } = await server.ssrLoadModule('/src/components/swiping/LeaderboardView.tsx');
  const { ConfirmWinnerModal } = await server.ssrLoadModule('/src/components/swiping/ConfirmWinnerModal.tsx');
  const { SwipingDeck } = await server.ssrLoadModule('/src/components/swiping/SwipingDeck.tsx');
  const noop = () => {};
  for (const locale of ['ar','en']) {
    store.set('wsh_locale',locale);
    const sparse = {...item,signatureDishAr:'',signatureDishEn:'',links:{},platforms:{hungerstation:false,jahez:false,keeta:false}};
    const render = (Component,props) => renderToStaticMarkup(createElement(LocaleProvider,null,createElement(Component,props)));
    for (const [Component,props] of [
      [SwipeCard,{restaurant:sparse,isFront:true,onSwipe:noop}],
      [DeliveryLauncher,{restaurant:sparse,orders:[],roomCode:'TEST'}],
      [LeaderboardView,{restaurants:[sparse,item],swipes:[],participants:[],isHost:true,totalCards:2,onConfirmPick:noop,onTriggerSuddenDeath:noop,onTriggerRoulette:noop}],
      [ConfirmWinnerModal,{restaurant:sparse,isOpen:true,onClose:noop,onConfirm:noop}],
      [SwipingDeck,{deck:[sparse],currentIndex:0,totalCards:1,isLoading:false,onSwipe:noop,onSkip:noop}],
    ]) {
      const html=render(Component,props); assert(Component === DeliveryLauncher ? html.includes('href=') : html.includes(locale==='ar'?item.nameAr:item.nameEn), locale + ' ' + Component.name); assert(!html.includes('NaN')); checks++;
    }
  }
  const text=formatWhatsAppOrder('Fixture',[{participantName:'Guest',itemName:'Dish',notes:' No onions '}],'TEST');
  assert(text.includes('Guest') && text.includes('Dish') && text.includes('No onions') && text.includes('TEST')); checks++;
  console.log(`PASS: ${checks} authoritative deck cache and bilingual SSR checks, plus all existing assertion suites.`);
} finally { await server.close(); }
