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
const rejects = async (sql, code) => assert.rejects(() => db.exec(sql), error => error.code === code);
let checks = 0;

try {
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;');
  await db.exec('CREATE PUBLICATION supabase_realtime;');
  for (const file of [
    '20260902_initial_schema.sql',
    '002_food_consensus.sql',
    '003_restaurant_swipes.sql',
    '005_create_and_seed_restaurants.sql',
    '20260908000100_restaurant_intelligence.sql',
    '20260908000200_restaurant_legacy_provenance.sql',
    '20260908000300_room_host_coordinates.sql',
  ]) {
    const sql = migration(file).replace('create extension if not exists "pgcrypto";', '');
    await db.exec(sql);
  }
  await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE (room_id, session_token);');

  const roomId = '10000000-0000-4000-8000-000000000001';
  const hostId = '20000000-0000-4000-8000-000000000001';
  const token = 'host-secret';
  const started = '2026-09-09T12:00:00Z';
  await db.exec(`
    INSERT INTO rooms(id,code,status,eating_mode,city,neighborhood,language,host_participant_id,current_stage,stage,winning_category,swiping_started_at,latitude,longitude)
    VALUES ('${roomId}','D001','restaurant_selection','dine_in','jeddah','Al-Rawdah','ar','${hostId}','swiping','swiping','burger','${started}',21.5600,39.1600);
    INSERT INTO participants(id,room_id,session_token,nickname,player_color,player_shape,is_host)
    VALUES ('${hostId}','${roomId}','${token}','Host','#55B96A','circle',true);
  `);

  const fixtureIds = (await query("SELECT id FROM restaurants ORDER BY id LIMIT 17")).map(row => row.id);
  const burgerIds = fixtureIds.slice(0, 16);
  for (const [index, id] of burgerIds.entries()) {
    const role = index < 4 ? 'staple' : index < 8 ? 'popular' : index < 11 ? 'discovery' : 'popular';
    const trend = index >= 11 && index < 14 ? 'rising' : 'none';
    const price = index % 3 === 0 ? 'budget' : index % 3 === 1 ? 'standard' : 'premium';
    await db.exec(`
      UPDATE restaurants SET city='jeddah', categories=ARRAY['burger'], primary_category='burger', secondary_categories='{}',
        operating_status='open', research_use='production_ready', overall_confidence='high', editorial_role='${role}',
        trend_status='${trend}', trend_confidence='high', price_position='${price}', dining_mode_summary='both'
      WHERE id='${id.replaceAll("'", "''")}';
      INSERT INTO restaurant_branches(restaurant_id,branch_name_en,branch_status,branch_type,district,latitude,longitude,
        maps_lookup_status,google_place_id,google_maps_url,google_rating,google_review_count,rating_source,dine_in,branch_identity_confidence)
      VALUES ('${id.replaceAll("'", "''")}','Near branch','open','full_dine_in','al_rawdah',
        ${21.5601 + index / 10000},${39.1601 + index / 10000},'verified','fixture-${index}',
        'https://maps.google.com/?cid=${index}',${index === 0 ? 4.9 : 4.6},${index === 0 ? 20 : 8000},'google_maps_direct',true,'high');
    `);
  }
  await db.exec(`
    INSERT INTO restaurant_branches(restaurant_id,branch_name_en,branch_status,branch_type,district,latitude,longitude,
      maps_lookup_status,google_place_id,google_maps_url,google_rating,google_review_count,rating_source,dine_in,branch_identity_confidence)
    VALUES ('${burgerIds[0].replaceAll("'", "''")}','Far branch','open','full_dine_in','abhur_al_shamaliyah',
      21.7500,39.1200,'verified','fixture-far','https://maps.google.com/?cid=far',4.9,9000,'google_maps_direct',true,'high');
  `);

  const indianId = fixtureIds[16].replaceAll("'", "''");
  await db.exec(`
    UPDATE restaurants SET city='jeddah',categories=ARRAY['indian'],primary_category='indian',secondary_categories='{}',
      operating_status='open',research_use='production_ready',overall_confidence='high',editorial_role='popular',dining_mode_summary='both'
    WHERE id='${indianId}';
    INSERT INTO restaurant_branches(restaurant_id,branch_status,branch_type,district,dine_in,branch_identity_confidence)
    VALUES ('${indianId}','open','full_dine_in','al_rawdah',true,'high');
  `);

  await db.exec(migration('20260909000100_private_restaurant_decks.sql'));

  assert.equal((await query("SELECT count(*)::int n FROM information_schema.columns WHERE table_schema='public' AND table_name='rooms' AND column_name IN ('latitude','longitude')"))[0].n, 0); checks++;
  assert.deepEqual(await query(`SELECT latitude,longitude FROM private.room_locations WHERE room_id='${roomId}'`), [{latitude:21.56,longitude:39.16}]); checks++;
  await db.exec('SET ROLE anon');
  await rejects('SELECT * FROM private.room_locations', '42501'); checks++;

  const call = (after = 'NULL') => query(`SELECT public.get_or_create_restaurant_deck('${roomId}','${hostId}','${token}',${after}) AS deck`);
  const concurrent = await Promise.all(Array.from({length: 5}, () => call()));
  const first = concurrent[0][0].deck;
  assert(concurrent.every(result => result[0].deck.deckId === first.deckId)); checks++;
  assert.equal(first.generation, 0); assert.equal(first.restaurants.length, 7); checks++;
  assert.equal(new Set(first.restaurants.map(item => item.id)).size, first.restaurants.length); checks++;
  assert(first.restaurants.every(item => item.categories.includes('burger'))); checks++;
  assert(!JSON.stringify(first).match(/candidate_score|overall_score|weight|seed|probability|diversity/i)); checks++;
  const near = first.restaurants.find(item => item.id === burgerIds[0]);
  if (near) assert.equal(near.selectedBranch.nameEn, 'Near branch');
  checks++;
  assert.deepEqual((await call())[0].deck, first); checks++;

  const nextCalls = await Promise.all(Array.from({length: 5}, () => call(`'${first.deckId}'`)));
  const second = nextCalls[0][0].deck;
  assert(nextCalls.every(result => result[0].deck.deckId === second.deckId)); checks++;
  assert.equal(second.generation, 1); checks++;
  assert(second.restaurants.every(item => !first.restaurants.some(old => old.id === item.id))); checks++;
  assert(second.restaurants.length <= 7); checks++;

  await rejects(`SELECT public.get_or_create_restaurant_deck('30000000-0000-4000-8000-000000000001','${hostId}','${token}',NULL)`, '42501'); checks++;
  await rejects(`SELECT public.set_room_location('${roomId}','${hostId}','${token}',91,0)`, '23514'); checks++;
  await rejects(`SELECT public.set_room_location('${roomId}','${hostId}','${token}',-91,0)`, '23514'); checks++;
  await rejects(`SELECT public.set_room_location('${roomId}','${hostId}','${token}',0,181)`, '23514'); checks++;
  await rejects(`SELECT public.set_room_location('${roomId}','${hostId}','${token}',0,-181)`, '23514'); checks++;
  await rejects(`SELECT public.set_room_location('${roomId}','${hostId}','${token}',NULL,39.2)`, '22023'); checks++;
  await rejects(`SELECT public.set_room_location('${roomId}','${hostId}','${token}',21.6,NULL)`, '22023'); checks++;
  await db.exec(`SELECT public.set_room_location('${roomId}','${hostId}','${token}',21.6,39.2)`); checks++;

  await db.exec('RESET ROLE');
  const established = (await query("SELECT private.reputation_weight(4.6,8000) established,private.reputation_weight(4.9,20) tiny"))[0];
  assert(established.established > established.tiny); checks++;

  const noGpsRoom = '10000000-0000-4000-8000-000000000002';
  const noGpsHost = '20000000-0000-4000-8000-000000000002';
  await db.exec(`
    INSERT INTO rooms(id,code,status,eating_mode,city,neighborhood,language,host_participant_id,current_stage,stage,winning_category,swiping_started_at)
    VALUES ('${noGpsRoom}','D002','restaurant_selection','dine_in','jeddah','Al-Rawdah','en','${noGpsHost}','swiping','swiping','indian','${started}');
    INSERT INTO participants(id,room_id,session_token,nickname,player_color,player_shape,is_host)
    VALUES ('${noGpsHost}','${noGpsRoom}','no-gps-secret','Host','#55B96A','circle',true);
  `);
  await db.exec('SET ROLE anon');
  const indian = (await query(`SELECT public.get_or_create_restaurant_deck('${noGpsRoom}','${noGpsHost}','no-gps-secret',NULL) deck`))[0].deck;
  assert.equal(indian.restaurants.length, 1); checks++;
  assert(indian.restaurants.every(item => item.categories.includes('indian'))); checks++;
  await db.exec('RESET ROLE');

  const geoRoom = '10000000-0000-4000-8000-000000000003';
  const geoHost = '20000000-0000-4000-8000-000000000003';
  await db.exec(`
    UPDATE restaurants SET categories=array_append(categories,'geo_test'),secondary_categories=array_append(secondary_categories,'geo_test') WHERE id='${burgerIds[0].replaceAll("'", "''")}';
    INSERT INTO rooms(id,code,status,eating_mode,city,neighborhood,language,host_participant_id,current_stage,stage,winning_category,swiping_started_at)
    VALUES ('${geoRoom}','D003','restaurant_selection','dine_in','jeddah','Al-Rawdah','en','${geoHost}','swiping','swiping','geo_test','${started}');
    INSERT INTO participants(id,room_id,session_token,nickname,player_color,player_shape,is_host)
    VALUES ('${geoHost}','${geoRoom}','geo-secret','Host','#55B96A','circle',true);
    SELECT public.set_room_location('${geoRoom}','${geoHost}','geo-secret',21.56,39.16);
  `);
  await db.exec('SET ROLE anon');
  const geoDeck = (await query(`SELECT public.get_or_create_restaurant_deck('${geoRoom}','${geoHost}','geo-secret',NULL) deck`))[0].deck;
  assert.equal(geoDeck.restaurants.length, 1); checks++;
  assert.equal(geoDeck.restaurants[0].selectedBranch.nameEn, 'Near branch'); checks++;
  await db.exec(`SELECT public.set_room_location('${geoRoom}','${geoHost}','geo-secret',NULL,NULL)`); checks++;
  await db.exec('RESET ROLE');
  assert.equal((await query(`SELECT count(*)::int n FROM private.room_locations WHERE room_id='${geoRoom}'`))[0].n, 0); checks++;
  const distance = (await query('SELECT private.haversine_km(21.56,39.16,21.56,39.16) value'))[0].value;
  assert.equal(distance, 0); checks++;

  assert.equal((await query(`SELECT count(*)::int n FROM private.room_restaurant_decks WHERE room_id='${roomId}' AND round_started_at='${started}'`))[0].n, 2); checks++;
  console.log(`PASS: ${checks} Phase 2 PostgreSQL checks for privacy, coordinates, membership, geography, reliability, deterministic concurrency, persistence, exclusions and category correctness.`);
} finally {
  await db.close();
}
