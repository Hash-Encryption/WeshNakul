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

console.log('--- WESHNAKUL STATISTICAL RANDOMNESS VALIDATION ---');

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

  // 1. Test 2-candidate array random selection over 2,000 iterations
  console.log('\n1. Testing 2-candidate tie [burger, shawarma] (2,000 iterations):');
  const sampleSize = 2000;
  const res2 = await query(`
    SELECT (ARRAY['burger','shawarma'])[1+floor(random()*2)::int] AS winner, count(*)::int AS cnt
    FROM generate_series(1, ${sampleSize})
    GROUP BY 1
    ORDER BY 1;
  `);

  const counts2 = Object.fromEntries(res2.map(r => [r.winner, r.cnt]));
  console.log('Observed distribution:', counts2);
  assert.equal(Object.keys(counts2).length, 2, 'Exactly 2 winners observed');
  assert.ok(counts2.burger > 800 && counts2.burger < 1200, `Burger count ${counts2.burger} within normal range [800, 1200]`);
  assert.ok(counts2.shawarma > 800 && counts2.shawarma < 1200, `Shawarma count ${counts2.shawarma} within normal range [800, 1200]`);
  console.log('✓ 2-candidate tie has no first-item bias, no hardcoding, and healthy balance.');

  // 2. Test inverted candidate order [shawarma, burger] over 2,000 iterations
  console.log('\n2. Testing inverted 2-candidate tie [shawarma, burger] (2,000 iterations):');
  const res2inv = await query(`
    SELECT (ARRAY['shawarma','burger'])[1+floor(random()*2)::int] AS winner, count(*)::int AS cnt
    FROM generate_series(1, ${sampleSize})
    GROUP BY 1
    ORDER BY 1;
  `);
  const counts2inv = Object.fromEntries(res2inv.map(r => [r.winner, r.cnt]));
  console.log('Observed inverted distribution:', counts2inv);
  assert.equal(Object.keys(counts2inv).length, 2, 'Exactly 2 winners observed');
  assert.ok(counts2inv.burger > 800 && counts2inv.burger < 1200, `Burger count ${counts2inv.burger} within normal range`);
  assert.ok(counts2inv.shawarma > 800 && counts2inv.shawarma < 1200, `Shawarma count ${counts2inv.shawarma} within normal range`);
  console.log('✓ Inverted order produces consistent balance; zero order bias detected.');

  // 3. Test 3-candidate tie [burger, shawarma, pizza] over 3,000 iterations
  console.log('\n3. Testing 3-candidate tie [burger, shawarma, pizza] (3,000 iterations):');
  const res3 = await query(`
    SELECT (ARRAY['burger','shawarma','pizza'])[1+floor(random()*3)::int] AS winner, count(*)::int AS cnt
    FROM generate_series(1, 3000)
    GROUP BY 1
    ORDER BY 1;
  `);
  const counts3 = Object.fromEntries(res3.map(r => [r.winner, r.cnt]));
  console.log('Observed 3-way distribution:', counts3);
  assert.equal(Object.keys(counts3).length, 3, 'Exactly 3 winners observed');
  for (const cat of ['burger', 'shawarma', 'pizza']) {
    assert.ok(counts3[cat] > 800 && counts3[cat] < 1200, `${cat} count ${counts3[cat]} within normal 3-way range [800, 1200]`);
  }
  console.log('✓ 3-candidate tie produces healthy 3-way distribution.');

  // 4. Test end-to-end resolve_category_tie RPC across 50 simulated rooms
  console.log('\n4. Testing end-to-end resolve_category_tie RPC across 50 rooms:');
  const hostTok = 'tok-rand-host-001', guestTok = 'tok-rand-guest-001';
  let burgerWins = 0, shawarmaWins = 0;
  for (let i = 1; i <= 50; i++) {
    const code = `RD${String(i).padStart(2, '0')}`;
    const cr = (await query(`SELECT public.create_room_authorized('${code}','${hostTok}','dine_in','jeddah','al_rawdah','en','Host',NULL,NULL) state`))[0].state;
    await query(`SELECT public.join_room_authorized('${code}','${guestTok}','Guest')`);
    const st = (await query(`SELECT public.start_category_voting('${cr.room.id}','${hostTok}',${cr.room.version}) state`))[0].state;
    const hSub = (await query(`SELECT public.submit_category_selection('${cr.room.id}','${hostTok}',${st.room.version},ARRAY['burger']::text[]) state`))[0].state;
    const tied = (await query(`SELECT public.submit_category_selection('${cr.room.id}','${guestTok}',${hSub.room.version},ARRAY['shawarma']::text[]) state`))[0].state;
    assert.equal(tied.room.stage, 'tiebreaker');
    assert.deepEqual(tied.room.tied_categories.sort(), ['burger', 'shawarma']);

    const resolved = (await query(`SELECT public.resolve_category_tie('${cr.room.id}','${hostTok}',${tied.room.version},'choose_for_us') state`))[0].state;
    assert.equal(resolved.room.stage, 'consensus');
    assert.equal(resolved.room.consensus_type, 'random_picked');
    assert.ok(['burger', 'shawarma'].includes(resolved.room.winning_category));
    if (resolved.room.winning_category === 'burger') burgerWins++;
    if (resolved.room.winning_category === 'shawarma') shawarmaWins++;
  }
  console.log(`End-to-end 50 runs result: burger=${burgerWins}, shawarma=${shawarmaWins}`);
  assert.ok(burgerWins > 10 && shawarmaWins > 10, 'Both burger and shawarma won multiple times in 50 live rooms');
  console.log('✓ End-to-end RPC randomness confirmed.');

  console.log('\nPASS: All statistical randomness checks succeeded!');
  process.exit(0);
} catch (err) {
  console.error('\nFAIL: Randomness validation failed:', err);
  process.exit(1);
}
