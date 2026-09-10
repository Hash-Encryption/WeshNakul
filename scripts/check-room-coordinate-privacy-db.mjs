import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const runtime=process.env.PGLITE_MODULE||join(tmpdir(),'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const {PGlite}=await import(pathToFileURL(runtime).href),db=new PGlite();
const migration=file=>readFileSync(`supabase/migrations/${file}`,'utf8').replace(/^\uFEFF/,''),query=async sql=>(await db.query(sql)).rows;
let checks=0;const check=value=>{assert(value);checks++},rejects=async(sql,code)=>{await assert.rejects(()=>db.exec(sql),error=>error.code===code);checks++};
const room='10000000-0000-4000-8000-000000000021',host='20000000-0000-4000-8000-000000000021',token='privacy-host';
try{
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');
  for(const file of ['20260902_initial_schema.sql','002_food_consensus.sql','003_restaurant_swipes.sql','005_create_and_seed_restaurants.sql','20260908000100_restaurant_intelligence.sql','20260908000200_restaurant_legacy_provenance.sql','20260908000300_room_host_coordinates.sql'])await db.exec(migration(file).replace('create extension if not exists "pgcrypto";',''));
  await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE (room_id, session_token);');
  for(const file of ['20260909000100_private_restaurant_decks.sql','20260909000200_private_participant_sessions.sql','20260910000100_jeddah_geography_intelligence.sql','20260911000100_jeddah_burger_google_verified_catalog.sql'])await db.exec(migration(file));

  // Reproduce the certified production drift, including one complete legacy pair that must be preserved.
  await db.exec(`ALTER TABLE rooms ADD COLUMN latitude double precision, ADD COLUMN longitude double precision;
    INSERT INTO rooms(id,code,status,eating_mode,city,neighborhood,language,host_participant_id,current_stage,stage,winning_category,swiping_started_at,latitude,longitude)
    VALUES ('${room}','P021','restaurant_selection','dine_in','jeddah','Al-Rawdah','en','${host}','swiping','swiping','burger','2026-09-11T12:00:00Z',21.56,39.16);
    INSERT INTO participants(id,room_id,session_token,nickname,player_color,player_shape,is_host)
    VALUES ('${host}','${room}','${token}','Host','#55B96A','circle',true);`);
  await db.exec(migration('20260911000200_remove_legacy_public_room_coordinates.sql'));
  assert.equal((await query("SELECT count(*)::int n FROM information_schema.columns WHERE table_schema='public' AND table_name='rooms' AND column_name IN ('latitude','longitude')"))[0].n,0);checks++;
  assert.deepEqual(await query(`SELECT latitude,longitude FROM private.room_locations WHERE room_id='${room}'`),[{latitude:21.56,longitude:39.16}]);checks++;

  // Supabase grants public-schema table access to API roles; mirror that in disposable PostgreSQL.
  await db.exec('GRANT SELECT,INSERT,UPDATE,DELETE ON public.rooms TO anon,authenticated;');
  await db.exec('SET ROLE anon');
  await rejects(`SELECT latitude FROM public.rooms WHERE id='${room}'`,'42703');
  await rejects(`SELECT longitude FROM public.rooms WHERE id='${room}'`,'42703');
  await rejects("INSERT INTO public.rooms(id,code,eating_mode,city,latitude) VALUES ('30000000-0000-4000-8000-000000000021','P022','dine_in','jeddah',21.56)",'42703');
  await rejects(`UPDATE public.rooms SET longitude=39.16 WHERE id='${room}'`,'42703');
  const payload=(await query(`SELECT row_to_json(r) value FROM public.rooms r WHERE id='${room}'`))[0].value;
  check(!('latitude' in payload)&&!('longitude' in payload));
  await rejects('SELECT * FROM private.room_locations','42501');
  await rejects(`SELECT session_token FROM public.participants WHERE id='${host}'`,'42501');
  const participants=(await query(`SELECT public.get_room_participants('${room}','wrong-token',NULL) value`))[0].value;
  check(participants.every(x=>x.session_token===''));
  await db.exec(`SELECT public.set_room_location('${room}','${host}','${token}',21.57,39.17)`);
  const gen0=(await query(`SELECT public.get_or_create_restaurant_deck('${room}','${host}','${token}',NULL) value`))[0].value;
  const gen1=(await query(`SELECT public.get_or_create_restaurant_deck('${room}','${host}','${token}','${gen0.deckId}') value`))[0].value;
  check(gen0.generation===0&&gen0.restaurants.length===7&&gen0.restaurants.every(x=>x.categories.includes('burger')&&x.selectedBranch?.distanceKm!=null));
  check(gen1.generation===1&&gen1.restaurants.length===3&&gen1.restaurants.every(x=>!gen0.restaurants.some(y=>y.id===x.id)));
  check(!JSON.stringify([gen0,gen1]).match(/latitude|longitude|candidate_score|weight|seed/i));
  await db.exec('RESET ROLE');
  assert.deepEqual(await query(`SELECT latitude,longitude FROM private.room_locations WHERE room_id='${room}'`),[{latitude:21.57,longitude:39.17}]);checks++;
  assert.equal((await query("SELECT count(*)::int n FROM restaurants WHERE primary_category='burger' AND operating_status='open' AND research_use IN ('production_ready','usable_with_caution') AND id IN ('section_b','california_burger','century_burger','chefs_burger','sign_burger','nora_burger','wbj','lou_burger','pplr','smash_me')"))[0].n,10);checks++;
  assert.equal((await query("SELECT count(*)::int n FROM restaurant_branches WHERE restaurant_id IN ('section_b','california_burger','century_burger','chefs_burger','sign_burger','nora_burger','wbj','lou_burger','pplr','smash_me') AND branch_status NOT IN ('temporarily_closed','permanently_closed')"))[0].n,33);checks++;

  const cityRoom='10000000-0000-4000-8000-000000000022',cityHost='20000000-0000-4000-8000-000000000022';
  await db.exec(`INSERT INTO rooms(id,code,status,eating_mode,city,neighborhood,language,host_participant_id,current_stage,stage,winning_category,swiping_started_at) VALUES ('${cityRoom}','P023','restaurant_selection','dine_in','jeddah',NULL,'en','${cityHost}','swiping','swiping','burger','2026-09-11T12:00:00Z');INSERT INTO participants(id,room_id,session_token,nickname,player_color,player_shape,is_host) VALUES ('${cityHost}','${cityRoom}','city-privacy','Host','#55B96A','circle',true);`);
  await db.exec('SET ROLE anon');
  const city=(await query(`SELECT public.get_or_create_restaurant_deck('${cityRoom}','${cityHost}','city-privacy',NULL) value`))[0].value;
  check(city.restaurants.length===7&&city.restaurants.every(x=>x.categories.includes('burger')&&x.selectedBranch?.distanceKm==null));
  await db.exec('RESET ROLE');
  await db.exec(migration('20260911000200_remove_legacy_public_room_coordinates.sql'));
  assert.equal((await query("SELECT count(*)::int n FROM information_schema.columns WHERE table_schema='public' AND table_name='rooms' AND column_name IN ('latitude','longitude')"))[0].n,0);checks++;
  console.log(`PASS: ${checks} public-coordinate privacy checks; legacy values preserved privately, public read/write removed, RPC/decks/session privacy intact.`);
}finally{await db.close()}
