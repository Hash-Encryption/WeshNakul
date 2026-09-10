import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();
const migration = file => readFileSync(`supabase/migrations/${file}`, 'utf8').replace(/^\uFEFF/, '');
const query = async sql => (await db.query(sql)).rows;
let checks = 0;
const check = value => { assert(value); checks++; };
const brandIds = ['section_b','california_burger','century_burger','chefs_burger','sign_burger','nora_burger','wbj','lou_burger','pplr','smash_me'];
const ids = brandIds.map(id => `'${id}'`).join(',');

try {
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');
  for (const file of [
    '20260902_initial_schema.sql','002_food_consensus.sql','003_restaurant_swipes.sql','005_create_and_seed_restaurants.sql',
    '20260908000100_restaurant_intelligence.sql','20260908000200_restaurant_legacy_provenance.sql','20260908000300_room_host_coordinates.sql'
  ]) await db.exec(migration(file).replace('create extension if not exists "pgcrypto";', ''));
  await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE (room_id, session_token);');
  for (const file of ['20260909000100_private_restaurant_decks.sql','20260909000200_private_participant_sessions.sql','20260910000100_jeddah_geography_intelligence.sql','20260911000100_jeddah_burger_google_verified_catalog.sql']) await db.exec(migration(file));

  assert.equal((await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${ids})`))[0].n, 10); checks++;
  assert.deepEqual(await query(`SELECT research_use,count(*)::int n FROM restaurants WHERE id IN (${ids}) GROUP BY research_use ORDER BY research_use`), [{research_use:'production_ready',n:9},{research_use:'usable_with_caution',n:1}]); checks++;
  assert.equal((await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${ids})`))[0].n, 33); checks++;
  assert.equal((await query(`SELECT count(*)::int n FROM restaurant_best_sellers WHERE restaurant_id IN (${ids})`))[0].n, 11); checks++;
  assert.equal((await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${ids}) AND google_maps_url IS NOT NULL AND google_place_id IS NOT NULL AND latitude IS NOT NULL AND address_en IS NOT NULL AND google_rating IS NOT NULL AND google_review_count IS NOT NULL`))[0].n, 33); checks++;
  assert.equal((await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${ids}) AND district IS NOT NULL`))[0].n, 30); checks++;
  assert.equal((await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${ids}) AND (google_price_level IS NOT NULL OR google_price_range_display IS NOT NULL)`))[0].n, 8); checks++;
  assert.equal((await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${ids}) GROUP BY google_place_id HAVING count(*)>1`)).length, 0); checks++;
  assert.equal((await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${ids}) GROUP BY google_maps_url HAVING count(*)>1`)).length, 0); checks++;
  assert.equal((await query(`SELECT count(*)::int n FROM restaurant_branches b WHERE b.restaurant_id IN (${ids}) AND b.district IS NOT NULL AND NOT EXISTS (SELECT 1 FROM private.district_geography d WHERE d.district_id=b.district)`))[0].n, 0); checks++;
  assert.equal((await query(`SELECT count(*)::int n FROM restaurant_branches WHERE (restaurant_id='sign_burger' AND branch_name_en IN ('Al Zahra','Al Balad')) OR (restaurant_id='nora_burger' AND branch_name_en IN ('Abhur','Al Muhammadiyyah')) OR (restaurant_id='smash_me' AND branch_name_en IN ('Rawdah','An Naseem'))`))[0].n, 0); checks++;
  assert.equal((await query(`SELECT count(*)::int n FROM restaurants WHERE id IN (${ids}) AND primary_category='burger' AND operating_status='open' AND research_use IN ('production_ready','usable_with_caution')`))[0].n, 10); checks++;

  const room='10000000-0000-4000-8000-000000000011', host='20000000-0000-4000-8000-000000000011', token='burger-host';
  await db.exec(`INSERT INTO rooms(id,code,status,eating_mode,city,neighborhood,language,host_participant_id,current_stage,stage,winning_category,swiping_started_at) VALUES ('${room}','B011','restaurant_selection','dine_in','jeddah','Al-Rawdah','en','${host}','swiping','swiping','burger','2026-09-11T12:00:00Z'); INSERT INTO participants(id,room_id,session_token,nickname,player_color,player_shape,is_host) VALUES ('${host}','${room}','${token}','Host','#55B96A','circle',true); SELECT public.set_room_location('${room}','${host}','${token}',21.56,39.16);`);
  await db.exec('SET ROLE anon');
  const first=(await query(`SELECT public.get_or_create_restaurant_deck('${room}','${host}','${token}',NULL) deck`))[0].deck;
  const second=(await query(`SELECT public.get_or_create_restaurant_deck('${room}','${host}','${token}','${first.deckId}') deck`))[0].deck;
  check(first.generation===0 && first.restaurants.length===7);
  check(new Set(first.restaurants.map(x=>x.id)).size===7 && first.restaurants.every(x=>x.categories.includes('burger') && x.selectedBranch?.googleMapsUrl && x.selectedBranch?.distanceKm!=null));
  check(second.generation===1 && second.restaurants.length===3 && second.restaurants.every(x=>!first.restaurants.some(y=>y.id===x.id)));
  check(!JSON.stringify(first).match(/latitude|longitude/i));
  await db.exec('RESET ROLE');

  const cityRoom='10000000-0000-4000-8000-000000000012', cityHost='20000000-0000-4000-8000-000000000012';
  await db.exec(`INSERT INTO rooms(id,code,status,eating_mode,city,neighborhood,language,host_participant_id,current_stage,stage,winning_category,swiping_started_at) VALUES ('${cityRoom}','B012','restaurant_selection','dine_in','jeddah',NULL,'en','${cityHost}','swiping','swiping','burger','2026-09-11T12:00:00Z'); INSERT INTO participants(id,room_id,session_token,nickname,player_color,player_shape,is_host) VALUES ('${cityHost}','${cityRoom}','city-host','Host','#55B96A','circle',true);`);
  await db.exec('SET ROLE anon');
  const city=(await query(`SELECT public.get_or_create_restaurant_deck('${cityRoom}','${cityHost}','city-host',NULL) deck`))[0].deck;
  check(city.restaurants.length===7 && city.restaurants.every(x=>x.categories.includes('burger') && x.selectedBranch?.googleMapsUrl));
  await db.exec('RESET ROLE');
  assert.equal((await query('SELECT private.haversine_km(21.56,39.16,21.56,39.16) value'))[0].value,0); checks++;

  await db.exec(migration('20260911000100_jeddah_burger_google_verified_catalog.sql'));
  assert.equal((await query(`SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN (${ids})`))[0].n,33); checks++;
  assert.equal((await query(`SELECT count(*)::int n FROM restaurant_sources WHERE restaurant_id IN (${ids}) GROUP BY restaurant_id,source_url,branch_id,best_seller_id HAVING count(*)>1`)).length,0); checks++;
  console.log(`PASS: ${checks} burger catalog DB checks; 10 brands, 33 branches, gen0/gen1, GPS, district and citywide modes.`);
} finally { await db.close(); }
