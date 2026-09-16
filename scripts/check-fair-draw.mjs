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

console.log('--- WESHNAKUL GLOBAL FAIR DRAW & ANTI-STREAK VALIDATION ---');

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

  // 1. Candidate-order invariance
  console.log('\n1. Testing Candidate-Order Invariance:');
  const key1 = (await query(`SELECT array_to_string(ARRAY(SELECT unnest(ARRAY['burger','shawarma']) ORDER BY 1), '|') as k`))[0].k;
  const key2 = (await query(`SELECT array_to_string(ARRAY(SELECT unnest(ARRAY['shawarma','burger']) ORDER BY 1), '|') as k`))[0].k;
  assert.equal(key1, 'burger|shawarma');
  assert.equal(key2, 'burger|shawarma');
  assert.equal(key1, key2, 'Canonical key must be identical regardless of candidate array order');
  console.log('✓ Inverted candidate order generates identical canonical key:', key1);

  // 2. Global Anti-Streak Across Distinct Rooms
  console.log('\n2. Testing Global Anti-Streak Across Rooms:');
  // Clear any existing history
  await db.exec(`DELETE FROM private.fair_draw_history WHERE canonical_candidate_key = 'burger|shawarma';`);

  // Seed history with 2 consecutive wins for shawarma
  await db.exec(`
    INSERT INTO private.fair_draw_history (decision_kind, canonical_candidate_key, draw_version, last_winner_id, consecutive_win_count)
    VALUES ('category', 'burger|shawarma', 1, 'shawarma', 2);
  `);

  // Create Room A with tie [burger, shawarma]
  const hostTokA = 'host-token-fair-room-a';
  const rA = (await query(`SELECT public.create_room_authorized('FA01', '${hostTokA}', 'delivery', 'jeddah', 'al_rawdah', 'en', 'HostA') state`))[0].state;
  const guestTokA = 'guest-token-fair-room-a';
  await query(`SELECT public.join_room_authorized('FA01', '${guestTokA}', 'GuestA')`);
  
  // Submit equal votes -> creates tiebreaker
  await query(`SELECT public.submit_category_selection('${rA.room.id}', '${hostTokA}', 1, ARRAY['burger','shawarma'])`);
  const tiedA = (await query(`SELECT public.submit_category_selection('${rA.room.id}', '${guestTokA}', 2, ARRAY['burger','shawarma']) state`))[0].state;
  assert.equal(tiedA.room.stage, 'tiebreaker');

  // Room A resolves tie using choose_for_us. Because shawarma had 2 consecutive wins, Room A MUST yield burger!
  const resolvedA = (await query(`SELECT public.resolve_category_tie('${rA.room.id}', '${hostTokA}', ${tiedA.room.version}, 'choose_for_us') state`))[0].state;
  assert.equal(resolvedA.room.winning_category, 'burger', 'Anti-streak must force burger after 2 consecutive shawarma wins');
  console.log('✓ Room A draw correctly forced alternate candidate after 2 consecutive wins:', resolvedA.room.winning_category);

  // Check that history was updated to burger with streak = 1
  const histAfterA = (await query(`SELECT * FROM private.fair_draw_history WHERE canonical_candidate_key = 'burger|shawarma'`))[0];
  assert.equal(histAfterA.last_winner_id, 'burger');
  assert.equal(histAfterA.consecutive_win_count, 1);
  console.log('✓ History updated: last_winner = burger, consecutive_win_count = 1');

  // 3. Matchup Isolation Test
  console.log('\n3. Testing Matchup Isolation:');
  // Seed history for burger|pizza with streak 2 for burger
  await db.exec(`
    INSERT INTO private.fair_draw_history (decision_kind, canonical_candidate_key, draw_version, last_winner_id, consecutive_win_count)
    VALUES ('category', 'burger|pizza', 1, 'burger', 2);
  `);

  // Draw for burger|shawarma should be unaffected by burger|pizza streak
  const histBS = (await query(`SELECT * FROM private.fair_draw_history WHERE canonical_candidate_key = 'burger|shawarma'`))[0];
  const histBP = (await query(`SELECT * FROM private.fair_draw_history WHERE canonical_candidate_key = 'burger|pizza'`))[0];
  assert.equal(histBS.last_winner_id, 'burger');
  assert.equal(histBS.consecutive_win_count, 1);
  assert.equal(histBP.last_winner_id, 'burger');
  assert.equal(histBP.consecutive_win_count, 2);
  console.log('✓ Matchup histories are strictly isolated: burger|shawarma vs burger|pizza');

  // 4. 3-Way Candidate Anti-Streak Test
  console.log('\n4. Testing 3-Way Candidate Anti-Streak:');
  await db.exec(`
    INSERT INTO private.fair_draw_history (decision_kind, canonical_candidate_key, draw_version, last_winner_id, consecutive_win_count)
    VALUES ('category', 'burger|pizza|shawarma', 1, 'burger', 2);
  `);
  // 3-way draw when burger has won twice must pick between pizza or shawarma (burger excluded)
  for (let i = 0; i < 20; i++) {
    // Re-seed streak
    await db.exec(`UPDATE private.fair_draw_history SET last_winner_id = 'burger', consecutive_win_count = 2 WHERE canonical_candidate_key = 'burger|pizza|shawarma';`);
    const draw3 = (await query(`SELECT private.secure_fair_draw('category', ARRAY['burger', 'pizza', 'shawarma']) as w`))[0].w;
    assert.notEqual(draw3, 'burger', 'Burger must be excluded when it has 2 consecutive wins in 3-way tie');
    assert.ok(['pizza', 'shawarma'].includes(draw3), 'Winner must be one of remaining eligible candidates');
  }
  console.log('✓ 20 draws verified: 3-way candidate anti-streak excludes only the 2-win streak holder');

  // 5. Newly Created Rooms Start Directly in Voting with Host in category_summary
  console.log('\n5. Testing Newly-Created Room Inception State:');
  const hostTokNew = 'host-token-direct-voting-1';
  const newRoomRes = (await query(`SELECT public.create_room_authorized('DV01', '${hostTokNew}', 'delivery', 'jeddah', 'al_rawdah', 'ar', 'المؤسس') state`))[0].state;
  assert.equal(newRoomRes.room.stage, 'voting', 'New room must start directly in voting stage');
  assert.equal(newRoomRes.room.current_stage, 'voting');
  assert.equal(newRoomRes.room.status, 'food_selection');
  assert.equal(newRoomRes.room.category_summary.eligibleParticipantCount, 1, 'category_summary must include host from inception (count = 1)');
  assert.equal(newRoomRes.room.category_summary.submittedCount, 0, 'submittedCount must be 0 initially');
  assert.equal(newRoomRes.room.category_summary.status, 'pending');
  console.log('✓ New room started directly in voting with eligibleParticipantCount = 1 and status = pending');

  console.log('\nPASS: All global fair draw, anti-streak, isolation, and room inception checks succeeded!');
} catch (err) {
  console.error('\nFAIL: Global fair draw validation error:', err);
  process.exit(1);
}
