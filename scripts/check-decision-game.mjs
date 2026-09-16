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
const check = (value, message) => { assert.ok(value, message); checks++; };
const rejects = async (sql, code) => {
  await assert.rejects(() => db.exec(sql), error => {
    assert.equal(error.code, code, `Expected error code ${code}, got ${error.code}: ${error.message}`);
    return true;
  });
  checks++;
};

try {
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');
  for (const file of [
    '20260902_initial_schema.sql', '002_food_consensus.sql', '003_restaurant_swipes.sql', '005_create_and_seed_restaurants.sql',
    '006_squad_order_scratchpad.sql', '007_room_expiration_and_cleanup.sql', '20260908000100_restaurant_intelligence.sql',
    '20260908000200_restaurant_legacy_provenance.sql', '20260908000300_room_host_coordinates.sql'
  ]) {
    await db.exec(migration(file).replace('create extension if not exists "pgcrypto";', ''));
  }
  await db.exec('ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_session_token_key; ALTER TABLE participants ADD CONSTRAINT participants_room_session_unique UNIQUE(room_id,session_token);');
  for (const file of [
    '20260909000100_private_restaurant_decks.sql', '20260909000200_private_participant_sessions.sql',
    '20260910000100_jeddah_geography_intelligence.sql', '20260911000100_jeddah_burger_google_verified_catalog.sql',
    '20260911000200_remove_legacy_public_room_coordinates.sql', '20260911000300_phase3_authoritative_consensus.sql',
    '20260912000100_allow_voting_stage_joins.sql', '20260913000100_decision_game_and_tie_corrections.sql',
    '20260916000100_global_fair_draw_and_immediate_flow.sql'
  ]) {
    await db.exec(migration(file));
  }

  const esc = value => String(value).replaceAll("'", "''");
  const state = rows => rows[0].state;
  const rpc = async sql => state(await query(`SELECT ${sql} state`));
  const create = async (code, token, nickname = 'Host', city = 'jeddah', district = 'al_rawdah') =>
    rpc(`public.create_room_authorized('${code}','${token}','dine_in','${city}','${district}','en','${nickname}',NULL,NULL)`);
  const joinRoom = async (code, token, nickname) => rpc(`public.join_room_authorized('${code}','${token}','${nickname}')`);
  const start = async (room, token, version) => rpc(`public.start_category_voting('${room}','${token}',${version})`);
  const category = async (room, token, version, categories) =>
    rpc(`public.submit_category_selection('${room}','${token}',${version},ARRAY[${categories.map(x => `'${x}'`).join(',')}]::text[])`);
  const begin = async (room, token, version) => rpc(`public.begin_restaurant_voting('${room}','${token}',${version})`);
  const vote = async (room, token, version, deck, restaurant, value) =>
    rpc(`public.submit_restaurant_vote('${room}','${token}',${version},'${deck}','${esc(restaurant)}','${value}')`);
  const tie = async (room, token, version, method, restaurant = null) =>
    rpc(`public.resolve_restaurant_tie('${room}','${token}',${version},'${method}',${restaurant ? `'${esc(restaurant)}'` : 'NULL'})`);

  await db.exec('SET ROLE anon');

  // 1. Strict Wildcard Payload Validation: reject mixed payloads
  const hostTok1 = 'token-dg-host-001', guestTok1 = 'token-dg-guest-01';
  let r1 = await create('DG01', hostTok1);
  await joinRoom('DG01', guestTok1, 'Guest');
  r1 = await start(r1.room.id, hostTok1, r1.room.version);

  // Rejects mixed wildcard + concrete category
  await rejects(`SELECT public.submit_category_selection('${r1.room.id}','${hostTok1}',${r1.room.version},ARRAY['flexible','burger']::text[])`, '22023');
  await rejects(`SELECT public.submit_category_selection('${r1.room.id}','${hostTok1}',${r1.room.version},ARRAY['burger','flexible']::text[])`, '22023');
  await rejects(`SELECT public.submit_category_selection('${r1.room.id}','${hostTok1}',${r1.room.version},ARRAY['pizza','flexible','shawarma']::text[])`, '22023');

  // Accepts pure flexible wildcard
  r1 = await category(r1.room.id, hostTok1, r1.room.version, ['flexible']);
  check(r1.myCategorySelection.selected_categories.length === 1 && r1.myCategorySelection.selected_categories[0] === 'flexible', 'pure flexible is accepted');

  // Case B: 1 Concrete + 1 Wildcard -> Concrete category wins directly
  r1 = await category(r1.room.id, guestTok1, r1.room.version, ['shawarma']);
  check(r1.room.stage === 'consensus', 'stage reached consensus');
  check(r1.room.winning_category === 'shawarma', 'concrete category won over wildcard');
  check(r1.room.category_summary.allWildcard === false, 'allWildcard is false for Case B');

  // 2. Case C: 2 Concrete (different) + 1 Wildcard -> Exact tie between the concrete picks
  const hostTok2 = 'token-dg-host-002', g2a = 'token-dg-g2a-0001', g2b = 'token-dg-g2b-0002';
  let r2 = await create('DG02', hostTok2);
  await joinRoom('DG02', g2a, 'G1');
  await joinRoom('DG02', g2b, 'G2');
  r2 = await start(r2.room.id, hostTok2, r2.room.version);
  r2 = await category(r2.room.id, hostTok2, r2.room.version, ['burger']);
  r2 = await category(r2.room.id, g2a, r2.room.version, ['pizza']);
  r2 = await category(r2.room.id, g2b, r2.room.version, ['flexible']);
  check(r2.room.stage === 'tiebreaker', 'Case C creates tiebreaker stage');
  check(r2.room.winning_category === null, 'winning category is null in tie');
  check(r2.room.tied_categories.length === 2, 'tied categories has exactly 2 elements');
  check(r2.room.tied_categories.includes('burger') && r2.room.tied_categories.includes('pizza'), 'tied categories are burger and pizza');
  check(r2.room.category_summary.allWildcard === false, 'allWildcard is false for Case C');

  // 3. Case D: Everyone Chooses Anything -> Canonical allWildcard tiebreaker with derived room categories
  const hostTok3 = 'token-dg-host-003', g3a = 'token-dg-g3a-0001';
  let r3 = await create('DG03', hostTok3, 'Host3', 'jeddah', 'al_rawdah');
  await joinRoom('DG03', g3a, 'Guest3');
  r3 = await start(r3.room.id, hostTok3, r3.room.version);
  r3 = await category(r3.room.id, hostTok3, r3.room.version, ['flexible']);
  r3 = await category(r3.room.id, g3a, r3.room.version, ['flexible']);
  check(r3.room.stage === 'tiebreaker', 'Everyone flexible produces tiebreaker');
  check(r3.room.winning_category === null, 'winning_category is null in all-flexible tie');
  check(r3.room.category_summary.allWildcard === true, 'canonical allWildcard flag is true');
  check(r3.room.tied_categories.length >= 2, 'tied_categories derived for room has at least 2 real categories');
  check(!r3.room.tied_categories.includes('flexible'), 'tied_categories contains NO wildcard placeholder');

  // Resolve category tie via choose_for_us
  r3 = await rpc(`public.resolve_category_tie('${r3.room.id}','${hostTok3}',${r3.room.version},'choose_for_us')`);
  check(r3.room.stage === 'consensus', 'resolved category tie reached consensus');
  check(Boolean(r3.room.winning_category), 'winning category is selected');
  check(r3.room.winning_category !== 'flexible', 'selected winning category is a real food category');

  // Restaurant deck can begin from that derived category
  const deck3 = await begin(r3.room.id, hostTok3, r3.room.version);
  check(deck3.room.stage === 'swiping', 'room transitioned to swiping');
  check(Array.isArray(deck3.deck.restaurants), 'deck generated with restaurant array');

  // 4. Restaurant Tie Invariant: Top tied restaurants -> NO WINNER EXISTS YET
  const hostTok4 = 'token-dg-host-004', g4a = 'token-dg-g4a-0001';
  let r4 = await create('DG04', hostTok4);
  await joinRoom('DG04', g4a, 'Guest4');
  r4 = await start(r4.room.id, hostTok4, r4.room.version);
  r4 = await category(r4.room.id, hostTok4, r4.room.version, ['burger']);
  r4 = await category(r4.room.id, g4a, r4.room.version, ['burger']);
  const deckData4 = await begin(r4.room.id, hostTok4, r4.room.version);
  const deck4 = deckData4.deck;
  const dId4 = deck4.deckId;
  r4 = deckData4;

  // Cast swipes to produce a tie between card 0 and card 1:
  // Host votes: Card 0 YES, Card 1 YES, Card 2 NO
  // Guest votes: Card 0 YES, Card 1 YES, Card 2 NO
  for (let pos = 1; pos <= 7; pos++) {
    const card = deck4.restaurants[pos - 1];
    const voteHost = pos <= 2 ? 'YES' : 'NO';
    r4 = await vote(r4.room.id, hostTok4, r4.room.version, dId4, card.id, voteHost);
  }
  for (let pos = 1; pos <= 7; pos++) {
    const card = deck4.restaurants[pos - 1];
    const voteGuest = pos <= 2 ? 'YES' : 'NO';
    r4 = await vote(r4.room.id, g4a, r4.room.version, dId4, card.id, voteGuest);
  }

  check(r4.room.restaurant_state === 'tie', 'restaurant state is tie');
  check(r4.room.winning_restaurant_id === null, 'CRITICAL INVARIANT: winning_restaurant_id must be NULL when tied');
  check(r4.room.restaurant_summary.status === 'tie', 'restaurant summary status is tie');
  check(r4.room.restaurant_summary.tiedRestaurantIds.length === 2, 'tiedRestaurantIds contains both tied restaurants');
  const tiedRest0 = deck4.restaurants[0].id;
  const tiedRest1 = deck4.restaurants[1].id;
  const nonTiedRest = deck4.restaurants[2].id;

  // Authorization & Validation of tie resolution
  await rejects(`SELECT public.resolve_restaurant_tie('${r4.room.id}','${g4a}',${r4.room.version},'sudden_death','${tiedRest0}')`, '42501');
  await rejects(`SELECT public.resolve_restaurant_tie('${r4.room.id}','${hostTok4}',${r4.room.version},'sudden_death','${nonTiedRest}')`, '22023');
  await rejects(`SELECT public.resolve_restaurant_tie('${r4.room.id}','${hostTok4}',${r4.room.version},'invalid_method','${tiedRest0}')`, '22023');

  // 5. Sudden Death Resolution: method 'sudden_death' on tied candidate
  r4 = await tie(r4.room.id, hostTok4, r4.room.version, 'sudden_death', tiedRest0);
  check(r4.room.stage === 'matched', 'room stage is matched after sudden death');
  check(r4.room.winning_restaurant_id === tiedRest0, 'winning restaurant matches sudden death winner');
  check(r4.room.winning_resolution_method === 'sudden_death', 'winning_resolution_method is sudden_death');
  check(Boolean(r4.room.winning_branch_id), 'exact branch id preserved in sudden death');

  // Double resolution protection
  await rejects(`SELECT public.resolve_restaurant_tie('${r4.room.id}','${hostTok4}',${r4.room.version},'host_pick','${tiedRest1}')`, 'PT409');

  // 6. Choose for us restaurant resolution on another room
  const hostTok5 = 'token-dg-host-005', g5a = 'token-dg-g5a-0001';
  let r5 = await create('DG05', hostTok5);
  await joinRoom('DG05', g5a, 'G5');
  r5 = await start(r5.room.id, hostTok5, r5.room.version);
  r5 = await category(r5.room.id, hostTok5, r5.room.version, ['burger']);
  r5 = await category(r5.room.id, g5a, r5.room.version, ['burger']);
  const deckData5 = await begin(r5.room.id, hostTok5, r5.room.version);
  const deck5 = deckData5.deck;
  r5 = deckData5;
  for (let pos = 1; pos <= 7; pos++) {
    const card = deck5.restaurants[pos - 1];
    r5 = await vote(r5.room.id, hostTok5, r5.room.version, deck5.deckId, card.id, pos <= 2 ? 'YES' : 'NO');
  }
  for (let pos = 1; pos <= 7; pos++) {
    const card = deck5.restaurants[pos - 1];
    r5 = await vote(r5.room.id, g5a, r5.room.version, deck5.deckId, card.id, pos <= 2 ? 'YES' : 'NO');
  }
  check(r5.room.restaurant_state === 'tie', 'room 5 reached tie');
  r5 = await tie(r5.room.id, hostTok5, r5.room.version, 'choose_for_us');
  check(r5.room.stage === 'matched', 'choose_for_us reached matched');
  check(r5.room.winning_resolution_method === 'choose_for_us', 'winning resolution method is choose_for_us');
  check([deck5.restaurants[0].id, deck5.restaurants[1].id].includes(r5.room.winning_restaurant_id), 'winner chosen strictly from tied candidates');

  // 7. Host pick restaurant resolution on another room
  const hostTok6 = 'token-dg-host-006', g6a = 'token-dg-g6a-0001';
  let r6 = await create('DG06', hostTok6);
  await joinRoom('DG06', g6a, 'G6');
  r6 = await start(r6.room.id, hostTok6, r6.room.version);
  r6 = await category(r6.room.id, hostTok6, r6.room.version, ['burger']);
  r6 = await category(r6.room.id, g6a, r6.room.version, ['burger']);
  const deckData6 = await begin(r6.room.id, hostTok6, r6.room.version);
  const deck6 = deckData6.deck;
  r6 = deckData6;
  for (let pos = 1; pos <= 7; pos++) {
    const card = deck6.restaurants[pos - 1];
    r6 = await vote(r6.room.id, hostTok6, r6.room.version, deck6.deckId, card.id, pos <= 2 ? 'YES' : 'NO');
  }
  for (let pos = 1; pos <= 7; pos++) {
    const card = deck6.restaurants[pos - 1];
    r6 = await vote(r6.room.id, g6a, r6.room.version, deck6.deckId, card.id, pos <= 2 ? 'YES' : 'NO');
  }
  check(r6.room.restaurant_state === 'tie', 'room 6 reached tie');
  r6 = await tie(r6.room.id, hostTok6, r6.room.version, 'host_pick', deck6.restaurants[1].id);
  check(r6.room.stage === 'matched', 'host_pick reached matched');
  check(r6.room.winning_restaurant_id === deck6.restaurants[1].id, 'host picked second tied candidate');
  check(r6.room.winning_resolution_method === 'host_pick', 'resolution method is host_pick');

  console.log(`PASS: ${checks} decision game, wildcard consensus, and restaurant tie / sudden-death checks.`);
} catch (error) {
  console.error('Test failed with error:', error);
  process.exit(1);
} finally {
  await db.close();
}
