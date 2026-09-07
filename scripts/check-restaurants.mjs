import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createClient } from '@supabase/supabase-js';

const store = new Map();
globalThis.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key,value) => store.set(key,String(value)), removeItem: key => store.delete(key) };
const server = await createServer({ server: { middlewareMode: true }, define: {
  'import.meta.env.VITE_SUPABASE_URL': '""', 'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
} });
let checks = 0;
try {
  for (const file of readdirSync('src/lib/__tests__').filter(f => f.endsWith('.test.ts'))) await server.ssrLoadModule(`/src/lib/__tests__/${file}`);
  const { mapLegacyRestaurant, projectRestaurant, fetchRestaurantPool, getCachedRestaurant } = await server.ssrLoadModule('/src/lib/restaurantRepository.ts');
  const { CITYWIDE_STAPLES } = await server.ssrLoadModule('/src/data/fallbackStaples.ts');
  const { getDeckForRoom } = await server.ssrLoadModule('/src/data/restaurants.ts');
  const item = CITYWIDE_STAPLES[0];
  const row = {
    id:item.id,name_ar:item.nameAr,name_en:item.nameEn,categories:item.categories,is_city_wide:item.isCityWide,
    branches:item.branches,dining_mode:item.diningMode,time_slots:item.timeSlots,closing_time_ar:item.closingTimeAr,
    is_open_late:item.isOpenLate,is_24_hours:item.is24Hours,avg_prep_minutes:item.avgPrepMinutes,tier:item.tier,
    price_tier:item.priceTier,signature_dish_ar:item.signatureDishAr,signature_dish_en:item.signatureDishEn,
    vibe_tags_ar:item.vibeTagsAr,vibe_tags_en:item.vibeTagsEn,rating:String(item.rating),platforms:item.platforms,links:item.links,
  };
  assert.deepEqual(mapLegacyRestaurant(row), item); checks++;
  const projected = projectRestaurant(item);
  assert.equal(projected.selectedBranch,null); assert.equal(projected.branchRating,null); assert.equal(projected.reviewCount,null); checks++;
  assert.equal(projected.editorialRole,null); assert.equal(projected.trendStatus,'unknown'); checks++;
  assert.deepEqual(projected.intelligence.deliveryListings,[]); checks++;
  const calls = [];
  let mode = 'legacy';
  const client = createClient('https://fixture.supabase.co','test-key',{auth:{persistSession:false},global:{fetch:async input => {
    const url = new URL(String(input)); calls.push(url);
    if (mode === 'offline') throw new TypeError('Failed to fetch');
    const table = url.pathname.split('/').at(-1);
    if (mode === 'empty') return Response.json([]);
    if (mode === 'partial' && table === 'restaurant_sources') return Response.json({message:'missing table',code:'42P01'},{status:404});
    const brand = {...row,intelligence_origin:'legacy_seed',editorial_role:'discovery',trend_status:'rising'};
    const tables = {
      restaurants: mode === 'legacy' ? [row] : [brand,brand],
      restaurant_branches: [{id:'branch-a',restaurant_id:row.id,google_place_id:null,google_rating:null},{id:'branch-b',restaurant_id:row.id,google_rating:4.2,rating_source:'google_derived_secondary'}],
      restaurant_best_sellers: [],
      delivery_platform_listings: [{id:'listing',restaurant_id:row.id,platform:'jahez',direct_url:null,matched_branch_id:null,status:'unknown'}],
      restaurant_sources: [], restaurant_trend_signals: [],
    };
    return Response.json(tables[table] ?? []);
  }}});
  let pool = await fetchRestaurantPool(client,'burger');
  assert.equal(pool[0].intelligenceStatus,'legacy_schema'); assert.equal(calls.length,1); checks++;
  assert.equal(calls[0].searchParams.get('categories'),'cs.{burger}'); checks++;
  assert.equal(pool[0].rating,item.rating); checks++;
  mode='normalized'; calls.length=0;
  pool=await fetchRestaurantPool(client,'burger');
  assert.equal(pool.length,1); assert.equal(pool[0].intelligence.branches.length,2); assert.equal(calls.length,6); checks++;
  assert.equal(pool[0].editorialRole,'discovery'); assert.equal(pool[0].trendStatus,'rising'); checks++;
  assert.equal(pool[0].intelligence.deliveryListings[0].matched_branch_id,null); checks++;
  assert.deepEqual(pool[0].links,item.links); assert.equal(pool[0].rating,item.rating); checks++;
  assert.equal(getCachedRestaurant(item.id),pool[0]); checks++;
  assert.deepEqual(getDeckForRoom('burger','jeddah','al_rawdah',[item]).map(r=>r.id),getDeckForRoom('burger','jeddah','al_rawdah',pool).map(r=>r.id)); checks++;
  mode='partial'; pool=await fetchRestaurantPool(client,'burger');
  assert.equal(pool[0].intelligenceStatus,'unavailable'); assert.equal(pool[0].id,item.id); assert.deepEqual(pool[0].intelligence.branches,[]); checks++;
  for (mode of ['empty','offline']) {
    pool=await fetchRestaurantPool(client,'unknown-category');
    assert.equal(pool.length,CITYWIDE_STAPLES.length); assert(pool.every(r=>r.intelligenceStatus==='fallback')); checks++;
  }
  assert((await fetchRestaurantPool(null,'burger')).every(r=>r.categories.includes('burger'))); checks++;

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
    const sparse = {...projected,signatureDishAr:'',signatureDishEn:'',links:{},platforms:{hungerstation:false,jahez:false,keeta:false}};
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
  console.log(`PASS: ${checks} repository, compatibility, fallback and bilingual SSR checks, plus all four existing assertion suites.`);
} finally { await server.close(); }
