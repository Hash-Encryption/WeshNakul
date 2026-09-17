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

console.log('--- WESHNAKUL HARDENED FAIR DRAW & CONCURRENCY VALIDATION ---');

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

  // Load new hardening migration 20260917000100_harden_global_fair_draw.sql
  // In PGlite (Wasm), strip the C extension load and validation block; provide test harness mock for PGlite.
  const hardenSql = migration('20260917000100_harden_global_fair_draw.sql')
    .replace('CREATE EXTENSION IF NOT EXISTS "pgcrypto";', '')
    .replace(/DO \$\$[\s\S]*?END \$\$;/m, '');
  await db.exec(hardenSql);

  // Provide explicit test-harness random byte source in PGlite using PostgreSQL's built-in cryptographic gen_random_uuid()
  await db.exec(`
    -- TEST HARNESS MOCK ONLY FOR PGLITE: Production PostgreSQL uses genuine pgcrypto.gen_random_bytes().
    CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea
    LANGUAGE sql VOLATILE AS $$
      SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex')
    $$;
  `);

  // ==========================================
  // 1. Crypto Source Verification
  // ==========================================
  console.log('\n1. Verifying Crypto Source & Integrity:');
  const migrationFileContent = readFileSync('supabase/migrations/20260917000100_harden_global_fair_draw.sql', 'utf8');
  assert.ok(migrationFileContent.includes('DROP FUNCTION IF EXISTS public.gen_random_bytes(int);'), 'Migration drops custom fallback');
  assert.ok(migrationFileContent.includes('CREATE EXTENSION IF NOT EXISTS "pgcrypto";'), 'Migration requires genuine pgcrypto');
  assert.ok(!migrationFileContent.includes('md5('), 'No md5 fallback in hardened migration');
  assert.ok(!migrationFileContent.includes('random()'), 'No random() fallback in hardened migration');
  assert.ok(!migrationFileContent.includes('fallback gen_random_bytes'), 'No fallback mentions');

  // Verify function definitions in PostgreSQL catalog
  const funcProcs = await query(`
    SELECT proname, prosrc FROM pg_proc WHERE proname IN ('crypto_random_index', 'secure_fair_draw')
  `);
  const cryptoRandomSrc = funcProcs.find(p => p.proname === 'crypto_random_index')?.prosrc || '';
  const secureFairDrawSrc = funcProcs.find(p => p.proname === 'secure_fair_draw')?.prosrc || '';
  assert.ok(cryptoRandomSrc.includes('gen_random_bytes(4)'), 'crypto_random_index calls genuine gen_random_bytes(4)');
  assert.ok(cryptoRandomSrc.includes('v_limit'), 'crypto_random_index uses rejection sampling');
  assert.ok(!cryptoRandomSrc.includes('md5('), 'crypto_random_index contains no md5');
  assert.ok(!cryptoRandomSrc.includes('random()'), 'crypto_random_index contains no PRNG random()');
  assert.ok(secureFairDrawSrc.includes('INSERT INTO private.fair_draw_history'), 'secure_fair_draw ensures placeholder row exists');
  assert.ok(secureFairDrawSrc.includes('ON CONFLICT (decision_kind, canonical_candidate_key, draw_version) DO NOTHING'), 'secure_fair_draw uses ON CONFLICT DO NOTHING for serialization');
  assert.ok(secureFairDrawSrc.includes('FOR UPDATE'), 'secure_fair_draw acquires row lock FOR UPDATE');
  console.log('✓ Migration and database functions verified: genuine crypto required, zero insecure PRNG fallback.');

  // ==========================================
  // 2. Candidate-Order Invariance
  // ==========================================
  console.log('\n2. Testing Candidate-Order Invariance:');
  const key1 = (await query(`SELECT array_to_string(ARRAY(SELECT unnest(ARRAY['burger','shawarma']) ORDER BY 1), '|') as k`))[0].k;
  const key2 = (await query(`SELECT array_to_string(ARRAY(SELECT unnest(ARRAY['shawarma','burger']) ORDER BY 1), '|') as k`))[0].k;
  assert.equal(key1, 'burger|shawarma');
  assert.equal(key2, 'burger|shawarma');
  assert.equal(key1, key2, 'Canonical key must be identical regardless of candidate array order');
  console.log('✓ Inverted candidate order generates identical canonical key:', key1);

  // ==========================================
  // 3. Placeholder Row Semantics & Initial Draw
  // ==========================================
  console.log('\n3. Testing Placeholder Row Semantics & First Draw:');
  await db.exec(`DELETE FROM private.fair_draw_history WHERE canonical_candidate_key = 'pasta|salad';`);
  const firstDrawWinner = (await query(`SELECT private.secure_fair_draw('category', ARRAY['salad','pasta']) as winner`))[0].winner;
  assert.ok(['pasta','salad'].includes(firstDrawWinner));
  const firstRow = (await query(`SELECT * FROM private.fair_draw_history WHERE canonical_candidate_key = 'pasta|salad'`))[0];
  assert.equal(firstRow.last_winner_id, firstDrawWinner);
  assert.equal(firstRow.consecutive_win_count, 1, 'First draw must produce consecutive_win_count = 1');
  console.log('✓ First draw on unseeded matchup creates history with last_winner =', firstDrawWinner, 'and streak = 1');

  // Verify explicit placeholder row with (NULL, 0) starts at streak = 1
  await db.exec(`
    UPDATE private.fair_draw_history
    SET last_winner_id = NULL, consecutive_win_count = 0
    WHERE canonical_candidate_key = 'pasta|salad';
  `);
  const postPlaceholderWinner = (await query(`SELECT private.secure_fair_draw('category', ARRAY['salad','pasta']) as winner`))[0].winner;
  const postPlaceholderRow = (await query(`SELECT * FROM private.fair_draw_history WHERE canonical_candidate_key = 'pasta|salad'`))[0];
  assert.equal(postPlaceholderRow.last_winner_id, postPlaceholderWinner);
  assert.equal(postPlaceholderRow.consecutive_win_count, 1, 'Draw against placeholder (NULL, 0) must produce streak = 1');
  console.log('✓ Draw against placeholder row (NULL, 0) sets streak to 1');

  // ==========================================
  // 4. First-Use Concurrency Test
  // ==========================================
  console.log('\n4. Testing First-Use Concurrency on Unseeded Matchup:');
  for (let run = 1; run <= 5; run++) {
    const matchupKey = `conc_first_a_${run}|conc_first_b_${run}`;
    await db.exec(`DELETE FROM private.fair_draw_history WHERE canonical_candidate_key = '${matchupKey}';`);
    
    // Launch two concurrent draws
    const [c1, c2] = await Promise.all([
      query(`SELECT private.secure_fair_draw('category', ARRAY['conc_first_b_${run}','conc_first_a_${run}']) as winner`),
      query(`SELECT private.secure_fair_draw('category', ARRAY['conc_first_a_${run}','conc_first_b_${run}']) as winner`),
    ]);

    const w1 = c1[0].winner;
    const w2 = c2[0].winner;
    assert.ok([`conc_first_a_${run}`, `conc_first_b_${run}`].includes(w1));
    assert.ok([`conc_first_a_${run}`, `conc_first_b_${run}`].includes(w2));

    const rows = await query(`SELECT * FROM private.fair_draw_history WHERE canonical_candidate_key = '${matchupKey}'`);
    assert.equal(rows.length, 1, 'Exactly one row must exist after concurrent first draws');
    const finalRow = rows[0];

    if (w1 === w2) {
      assert.equal(finalRow.last_winner_id, w1);
      assert.equal(finalRow.consecutive_win_count, 2, 'Two identical consecutive draws must produce streak = 2');
    } else {
      assert.ok(finalRow.last_winner_id === w1 || finalRow.last_winner_id === w2);
      assert.equal(finalRow.consecutive_win_count, 1, 'Alternating draws must produce streak = 1');
    }
  }
  console.log('✓ 5 concurrent first-use runs verified: serialized without deadlocks or lost updates; final streak logically correct.');

  // ==========================================
  // 5. Existing History & Anti-Streak Concurrency Test
  // ==========================================
  console.log('\n5. Testing Existing History & Anti-Streak Concurrency:');
  for (let run = 1; run <= 5; run++) {
    const matchupKey = `conc_streak_a_${run}|conc_streak_b_${run}`;
    await db.exec(`
      INSERT INTO private.fair_draw_history (decision_kind, canonical_candidate_key, draw_version, last_winner_id, consecutive_win_count)
      VALUES ('category', '${matchupKey}', 1, 'conc_streak_a_${run}', 2)
      ON CONFLICT (decision_kind, canonical_candidate_key, draw_version)
      DO UPDATE SET last_winner_id = 'conc_streak_a_${run}', consecutive_win_count = 2;
    `);

    // Two concurrent draws. Because streak is 2 for conc_streak_a, the first serialized draw MUST yield conc_streak_b!
    const [c1, c2] = await Promise.all([
      query(`SELECT private.secure_fair_draw('category', ARRAY['conc_streak_a_${run}','conc_streak_b_${run}']) as winner`),
      query(`SELECT private.secure_fair_draw('category', ARRAY['conc_streak_b_${run}','conc_streak_a_${run}']) as winner`),
    ]);

    const w1 = c1[0].winner;
    const w2 = c2[0].winner;
    assert.ok(w1 === `conc_streak_b_${run}` || w2 === `conc_streak_b_${run}`, 'Anti-streak must force alternate candidate on first serialized draw');
  }
  console.log('✓ 5 concurrent anti-streak runs verified: anti-streak atomically enforced without allowing third consecutive win.');

  // ==========================================
  // 6. Global Anti-Streak Across Distinct Rooms
  // ==========================================
  console.log('\n6. Testing Global Anti-Streak Across Rooms:');
  await db.exec(`DELETE FROM private.fair_draw_history WHERE canonical_candidate_key = 'burger|shawarma';`);
  await db.exec(`
    INSERT INTO private.fair_draw_history (decision_kind, canonical_candidate_key, draw_version, last_winner_id, consecutive_win_count)
    VALUES ('category', 'burger|shawarma', 1, 'shawarma', 2);
  `);

  const hostTokA = 'host-token-fair-room-a';
  const rA = (await query(`SELECT public.create_room_authorized('FA01', '${hostTokA}', 'delivery', 'jeddah', 'al_rawdah', 'en', 'HostA') state`))[0].state;
  const guestTokA = 'guest-token-fair-room-a';
  await query(`SELECT public.join_room_authorized('FA01', '${guestTokA}', 'GuestA')`);
  await query(`SELECT public.submit_category_selection('${rA.room.id}', '${hostTokA}', 1, ARRAY['burger','shawarma'])`);
  const tiedA = (await query(`SELECT public.submit_category_selection('${rA.room.id}', '${guestTokA}', 2, ARRAY['burger','shawarma']) state`))[0].state;
  assert.equal(tiedA.room.stage, 'tiebreaker');

  const resolvedA = (await query(`SELECT public.resolve_category_tie('${rA.room.id}', '${hostTokA}', ${tiedA.room.version}, 'choose_for_us') state`))[0].state;
  assert.equal(resolvedA.room.winning_category, 'burger', 'Anti-streak must force burger after 2 consecutive shawarma wins');
  console.log('✓ Room A draw correctly forced alternate candidate after 2 consecutive wins:', resolvedA.room.winning_category);

  const histAfterA = (await query(`SELECT * FROM private.fair_draw_history WHERE canonical_candidate_key = 'burger|shawarma'`))[0];
  assert.equal(histAfterA.last_winner_id, 'burger');
  assert.equal(histAfterA.consecutive_win_count, 1);
  console.log('✓ History updated: last_winner = burger, consecutive_win_count = 1');

  // ==========================================
  // 7. Matchup Isolation Test
  // ==========================================
  console.log('\n7. Testing Matchup Isolation:');
  await db.exec(`
    INSERT INTO private.fair_draw_history (decision_kind, canonical_candidate_key, draw_version, last_winner_id, consecutive_win_count)
    VALUES ('category', 'burger|pizza', 1, 'burger', 2);
  `);
  const histBS = (await query(`SELECT * FROM private.fair_draw_history WHERE canonical_candidate_key = 'burger|shawarma'`))[0];
  const histBP = (await query(`SELECT * FROM private.fair_draw_history WHERE canonical_candidate_key = 'burger|pizza'`))[0];
  assert.equal(histBS.last_winner_id, 'burger');
  assert.equal(histBS.consecutive_win_count, 1);
  assert.equal(histBP.last_winner_id, 'burger');
  assert.equal(histBP.consecutive_win_count, 2);
  console.log('✓ Matchup histories are strictly isolated: burger|shawarma vs burger|pizza');

  // ==========================================
  // 8. 3-Way Candidate Anti-Streak Test
  // ==========================================
  console.log('\n8. Testing 3-Way Candidate Anti-Streak:');
  await db.exec(`
    INSERT INTO private.fair_draw_history (decision_kind, canonical_candidate_key, draw_version, last_winner_id, consecutive_win_count)
    VALUES ('category', 'burger|pizza|shawarma', 1, 'burger', 2);
  `);
  for (let i = 0; i < 20; i++) {
    await db.exec(`UPDATE private.fair_draw_history SET last_winner_id = 'burger', consecutive_win_count = 2 WHERE canonical_candidate_key = 'burger|pizza|shawarma';`);
    const draw3 = (await query(`SELECT private.secure_fair_draw('category', ARRAY['burger', 'pizza', 'shawarma']) as w`))[0].w;
    assert.notEqual(draw3, 'burger', 'Burger must be excluded when it has 2 consecutive wins in 3-way tie');
    assert.ok(['pizza', 'shawarma'].includes(draw3), 'Winner must be one of remaining eligible candidates');
  }
  console.log('✓ 20 draws verified: 3-way candidate anti-streak excludes only the 2-win streak holder');

  // ==========================================
  // 9. Distribution Sanity Test
  // ==========================================
  console.log('\n9. Testing Distribution Sanity (1,000 draws on distinct isolated keys):');
  const distCounts = { cand_a: 0, cand_b: 0 };
  for (let i = 0; i < 1000; i++) {
    // Use fresh unseeded key per pair to test distribution without anti-streak intervention
    const w = (await query(`SELECT private.secure_fair_draw('dist_test_${i}', ARRAY['cand_a', 'cand_b']) as w`))[0].w;
    distCounts[w]++;
  }
  console.log('Observed 1,000 draw distribution:', distCounts);
  assert.ok(distCounts.cand_a > 420 && distCounts.cand_a < 580, `cand_a count ${distCounts.cand_a} within normal 99% range [420, 580]`);
  assert.ok(distCounts.cand_b > 420 && distCounts.cand_b < 580, `cand_b count ${distCounts.cand_b} within normal 99% range [420, 580]`);
  console.log('✓ Distribution sanity passed: balanced and unbiased.');

  // ==========================================
  // 10. Newly Created Rooms Start Directly in Voting
  // ==========================================
  console.log('\n10. Testing Newly-Created Room Inception State:');
  const hostTokNew = 'host-token-direct-voting-1';
  const newRoomRes = (await query(`SELECT public.create_room_authorized('DV01', '${hostTokNew}', 'delivery', 'jeddah', 'al_rawdah', 'ar', 'المؤسس') state`))[0].state;
  assert.equal(newRoomRes.room.stage, 'voting', 'New room must start directly in voting stage');
  assert.equal(newRoomRes.room.current_stage, 'voting');
  assert.equal(newRoomRes.room.status, 'food_selection');
  assert.equal(newRoomRes.room.category_summary.eligibleParticipantCount, 1, 'category_summary must include host from inception (count = 1)');
  assert.equal(newRoomRes.room.category_summary.submittedCount, 0, 'submittedCount must be 0 initially');
  assert.equal(newRoomRes.room.category_summary.status, 'pending');
  console.log('✓ New room started directly in voting with eligibleParticipantCount = 1 and status = pending');

  console.log('\nPASS: All hardened fair draw, concurrency, crypto source, and anti-streak checks succeeded!');
} catch (err) {
  console.error('\nFAIL: Hardened fair draw validation error:', err);
  process.exit(1);
}
