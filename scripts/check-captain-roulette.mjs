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

console.log('--- EXECUTING CAPTAIN ROULETTE VERIFICATION & HARDENING SUITE ---');

let checks = 0;
const check = (desc, fn) => {
  try {
    fn();
    checks++;
  } catch (err) {
    console.error(`FAILED: "${desc}"`);
    throw err;
  }
};

try {
  // Setup database schema in PGlite
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

  // Load captain roulette migrations
  await db.exec(migration('20261010000100_captain_roulette.sql'));
  await db.exec(migration('20261010000200_audit_and_harden_captain_roulette.sql'));
  await db.exec(migration('20261010000300_captain_roulette_minimum_players.sql'));

  // Mock gen_random_bytes in PGlite test environment
  await db.exec(`
    CREATE OR REPLACE FUNCTION public.gen_random_bytes(p_len int) RETURNS bytea
    LANGUAGE sql VOLATILE AS $$
      SELECT decode(substr(replace(gen_random_uuid()::text, '-', ''), 1, p_len * 2), 'hex')
    $$;
  `);

  // ==========================================
  // Test Suite 1: Pure Weight Formula & 14-Day Recovery
  // ==========================================
  console.log('\n1. Verifying Pure Weight Calculations & 14-Day Expiry Boundaries:');

  // 1.1 Player with no history has weight 100.0
  const noHistoryWeight = (await query("SELECT private.calculate_player_captain_weight('newbie-user') as w;"))[0].w;
  check('1.1 Player with no history has weight 100.0', () => {
    assert.equal(Number(noHistoryWeight), 100.0);
  });

  // Seed a room for test history
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city)
    VALUES ('a0000000-0000-0000-0000-000000000001', 'TST1', 'delivery', 'riyadh');
  `);

  // 1.2 Recent win (0 days old) produces weight 20.0
  await db.exec(`
    INSERT INTO private.captain_history (room_id, event_id, participant_id, stable_player_id, nickname, created_at)
    VALUES ('a0000000-0000-0000-0000-000000000001', 'ev-recent-1', gen_random_uuid(), 'player-recent', 'Omar', now());
  `);
  const recentWeight = (await query("SELECT private.calculate_player_captain_weight('player-recent') as w;"))[0].w;
  check('1.2 Recent win produces weight 20.0', () => {
    assert.ok(Math.abs(Number(recentWeight) - 20.0) < 0.01, `Expected ~20.0, got ${recentWeight}`);
  });

  // 1.3 Win from 7 days ago produces weight 33.333
  await db.exec(`
    INSERT INTO private.captain_history (room_id, event_id, participant_id, stable_player_id, nickname, created_at)
    VALUES ('a0000000-0000-0000-0000-000000000001', 'ev-7d-1', gen_random_uuid(), 'player-7d', 'Saad', now() - interval '7 days');
  `);
  const weight7d = (await query("SELECT private.calculate_player_captain_weight('player-7d') as w;"))[0].w;
  check('1.3 Win from 7 days ago produces weight ~33.333', () => {
    assert.ok(Math.abs(Number(weight7d) - 33.333) < 0.1, `Expected ~33.333, got ${weight7d}`);
  });

  // 1.4 Controlled test clock boundary precision:
  // Win at fixed timestamp: '2026-10-01 00:00:00+00'
  const winTimestamp = '2026-10-01 00:00:00+00';
  await db.exec(`
    INSERT INTO private.captain_history (room_id, event_id, participant_id, stable_player_id, nickname, created_at)
    VALUES ('a0000000-0000-0000-0000-000000000001', 'ev-bound-1', gen_random_uuid(), 'player-bound', 'BoundaryUser', '${winTimestamp}');
  `);

  // (a) Just before 14 days (13.99 days old = 2026-10-14 23:45:36+00): weight ≈ 50.0
  const clockBefore14 = '2026-10-14 23:45:36+00';
  const weightBefore14 = (await query(`SELECT private.calculate_player_captain_weight('player-bound', '${clockBefore14}'::timestamptz) as w;`))[0].w;
  check('1.4 Just before 14 days produces expected weight ~50.0', () => {
    assert.ok(Math.abs(Number(weightBefore14) - 50.0) < 0.2, `Expected ~50.0 just before 14 days, got ${weightBefore14}`);
  });

  // (b) Exactly 14.0 days old (2026-10-15 00:00:00+00): weight is exactly 100.0 (penalty = 0)
  const clockExact14 = '2026-10-15 00:00:00+00';
  const weightExact14 = (await query(`SELECT private.calculate_player_captain_weight('player-bound', '${clockExact14}'::timestamptz) as w;`))[0].w;
  check('1.5 Exactly 14.0 days old refreshes to 100.0', () => {
    assert.equal(Number(weightExact14), 100.0, `Expected exactly 100.0 at 14.0 days, got ${weightExact14}`);
  });

  // (c) Older than 14 days (14.01 days old = 2026-10-15 00:15:00+00): weight is 100.0
  const clockAfter14 = '2026-10-15 00:15:00+00';
  const weightAfter14 = (await query(`SELECT private.calculate_player_captain_weight('player-bound', '${clockAfter14}'::timestamptz) as w;`))[0].w;
  check('1.6 Older than 14 days refreshes to 100.0', () => {
    assert.equal(Number(weightAfter14), 100.0, `Expected 100.0 after 14 days, got ${weightAfter14}`);
  });

  // 1.7 Multiple independent wins accumulate penalty
  await db.exec(`
    INSERT INTO private.captain_history (room_id, event_id, participant_id, stable_player_id, nickname, created_at)
    VALUES
      ('a0000000-0000-0000-0000-000000000001', 'ev-multi-1', gen_random_uuid(), 'player-multi', 'Yara', now()),
      ('a0000000-0000-0000-0000-000000000001', 'ev-multi-2', gen_random_uuid(), 'player-multi', 'Yara', now() - interval '7 days');
  `);
  const weightMulti = (await query("SELECT private.calculate_player_captain_weight('player-multi') as w;"))[0].w;
  check('1.7 Multiple wins accumulate penalties independently', () => {
    const expected = 100 / 7;
    assert.ok(Math.abs(Number(weightMulti) - expected) < 0.1, `Expected ~${expected}, got ${weightMulti}`);
  });

  // 1.8 Never zero weight: recent winners retain nonzero chance
  check('1.8 Recent winners retain strictly positive weight', () => {
    assert.ok(Number(recentWeight) > 0, 'Weight must be strictly positive');
    assert.ok(Number(weightMulti) > 0, 'Weight must be strictly positive');
  });

  // ==========================================
  // Test Suite 2: Cross-Room Identity & Nickname Collision Isolation
  // ==========================================
  console.log('\n2. Verifying Cross-Room Identity & Nickname Collision Isolation:');

  // Room Alpha: Host Alice creates room with stable_player_id
  const stableAlice = 'stable-device-token-alice';
  const roomAlphaRes = (await query(`
    SELECT public.create_room_authorized(
      'ALPH', 'room-alpha-alice-token', 'delivery', 'riyadh', NULL, 'ar', 'Alice', NULL, NULL, '${stableAlice}'
    ) as res;
  `))[0].res;
  const roomAlphaId = roomAlphaRes.room.id;
  const aliceAlphaPartId = roomAlphaRes.participant.id;

  // Bob joins Room Alpha with stable_player_id
  const stableBob = 'stable-device-token-bob';
  const bobAlphaRes = (await query(`
    SELECT public.join_room_authorized(
      'ALPH', 'room-alpha-bob-token', 'Bob', '${stableBob}'
    ) as res;
  `))[0].res;
  const bobAlphaPartId = bobAlphaRes.participant.id;

  // Carol joins Room Alpha to satisfy the 3-player minimum for captain selection
  const stableCarol = 'stable-device-token-carol';
  await query(`
    SELECT public.join_room_authorized(
      'ALPH', 'room-alpha-carol-token', 'Carol', '${stableCarol}'
    ) as res;
  `);

  // Verify participants have stable_player_id stored
  const alphaParts = await query(`SELECT id, session_token, stable_player_id FROM public.participants WHERE room_id = '${roomAlphaId}';`);
  check('2.1 Participants store canonical stable_player_id on room entry', () => {
    const a = alphaParts.find(p => p.id === aliceAlphaPartId);
    assert.equal(a.stable_player_id, stableAlice);
    const b = alphaParts.find(p => p.id === bobAlphaPartId);
    assert.equal(b.stable_player_id, stableBob);
  });

  // Alice wins captain in Room Alpha (record win in captain_history)
  await db.exec(`
    INSERT INTO private.captain_history (room_id, event_id, participant_id, stable_player_id, nickname, created_at)
    VALUES ('${roomAlphaId}', 'ev-alpha-1', '${aliceAlphaPartId}', '${stableAlice}', 'Alice', now());
  `);

  // Room Beta: Alice joins Room Beta with a completely DIFFERENT room session token, but the SAME stable_player_id
  const roomBetaRes = (await query(`
    SELECT public.create_room_authorized(
      'BETA', 'room-beta-charlie-token', 'delivery', 'jeddah', NULL, 'ar', 'Charlie', NULL, NULL, 'stable-device-token-charlie'
    ) as res;
  `))[0].res;
  const roomBetaId = roomBetaRes.room.id;

  // Alice joins Beta
  const aliceBetaRes = (await query(`
    SELECT public.join_room_authorized(
      'BETA', 'room-beta-alice-different-token', 'Alice', '${stableAlice}'
    ) as res;
  `))[0].res;
  const aliceBetaPartId = aliceBetaRes.participant.id;

  // Another user named 'Alice' joins Beta with DIFFERENT stable device identity
  const stableAliceImposter = 'stable-device-token-alice-other';
  const alice2BetaRes = (await query(`
    SELECT public.join_room_authorized(
      'BETA', 'room-beta-alice2-token', 'Alice', '${stableAliceImposter}'
    ) as res;
  `))[0].res;

  // 2.2 Alice in Room Beta has decayed weight 20.0 from her Room Alpha win
  const startBeta = (await query(`
    SELECT public.start_captain_selection('${roomBetaId}', 'room-beta-charlie-token', 'stable-device-token-charlie') as res;
  `))[0].res;

  check('2.2 Returning player carries captain history penalty into new room via stable identity', () => {
    const candidateAlice = startBeta.candidates.find(c => c.id === aliceBetaPartId);
    assert.ok(candidateAlice, 'Alice is a candidate in Room Beta');
    assert.ok(Math.abs(Number(candidateAlice.weight) - 20.0) < 0.01, `Alice expected weight 20.0, got ${candidateAlice.weight}`);
  });

  // 2.3 Other user with identical nickname 'Alice' retains fresh weight 100.0
  check('2.3 Two players with identical nicknames have independent histories', () => {
    const candidateAlice2 = startBeta.candidates.find(c => c.id === alice2BetaRes.participant.id);
    assert.ok(candidateAlice2, 'Second Alice is a candidate');
    assert.equal(Number(candidateAlice2.weight), 100.0, `Second Alice expected weight 100.0, got ${candidateAlice2.weight}`);
  });

  // 2.4 Established participant identity cannot be altered via start_captain_selection
  const originalStable = 'stable-device-token-alice';
  await query(`
    SELECT public.start_captain_selection('${roomAlphaId}', 'room-alpha-alice-token', 'stolen-victim-identity-override') as res;
  `);

  const aliceStableCheck = (await query(`
    SELECT stable_player_id FROM public.participants WHERE id = '${aliceAlphaPartId}';
  `))[0].stable_player_id;

  check('2.4 Established participant identity cannot be altered via start_captain_selection', () => {
    assert.equal(aliceStableCheck, originalStable, 'start_captain_selection must not overwrite stable_player_id');
  });

  // 2.5 Established participant identity cannot be altered by re-joining room with different stable ID
  await query(`
    SELECT public.join_room_authorized(
      'ALPH', 'room-alpha-bob-token', 'Bob', 'attempted-fake-bob-stable-id'
    ) as res;
  `);

  const bobStableCheck = (await query(`
    SELECT stable_player_id FROM public.participants WHERE id = '${bobAlphaPartId}';
  `))[0].stable_player_id;

  check('2.5 Established participant identity cannot be altered by re-joining with different stable ID', () => {
    assert.equal(bobStableCheck, stableBob, 'join_room_authorized must keep original established stable ID');
  });

  // ==========================================
  // Test Suite 3: Voting Thresholds (floor(N/2) + 1) & Tie-Breaker
  // ==========================================
  console.log('\n3. Verifying Voting Thresholds & Strict Majority (Tie Rejection):');

  const testThresholds = [
    { n: 2, expected: 2 },
    { n: 3, expected: 2 },
    { n: 4, expected: 3 },
    { n: 5, expected: 3 },
    { n: 6, expected: 4 },
    { n: 8, expected: 5 },
  ];

  for (const { n, expected } of testThresholds) {
    const calc = Math.floor(n / 2) + 1;
    check(`3.1 Threshold for N=${n} is ${expected}`, () => {
      assert.equal(calc, expected);
    });
  }

  check('3.2 For N=4, tie (2 approve vs 2 reject) fails required threshold of 3', () => {
    const n = 4;
    const req = Math.floor(n / 2) + 1;
    const approvals = 2;
    assert.ok(approvals < req, 'Tie does not meet strict majority threshold, so reroll is rejected');
  });

  // ==========================================
  // Test Suite 4: End-to-End Authoritative Flow with Real Room Participants
  // ==========================================
  console.log('\n4. Verifying End-to-End Flow & RPCs in Database:');

  const testRoomId = 'c0000000-0000-0000-0000-000000000003';
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city)
    VALUES ('${testRoomId}', 'CAP1', 'delivery', 'riyadh');
  `);

  // Add 4 participants (3 active, 1 away to verify inactive exclusion)
  const p1 = '11111111-0000-0000-0000-000000000001';
  const p2 = '22222222-0000-0000-0000-000000000002';
  const p3 = '33333333-0000-0000-0000-000000000003';
  const p4_away = '44444444-0000-0000-0000-000000000004';

  await db.exec(`
    INSERT INTO public.participants (id, room_id, session_token, stable_player_id, nickname, player_color, player_shape, is_host, status)
    VALUES
      ('${p1}', '${testRoomId}', 'token-p1', 'stable-p1', 'Omar', '#55B96A', 'circle', true, 'active'),
      ('${p2}', '${testRoomId}', 'token-p2', 'stable-p2', 'Lina', '#F0443E', 'squircle', false, 'active'),
      ('${p3}', '${testRoomId}', 'token-p3', 'stable-p3', 'Saad', '#FFD75A', 'diamond', false, 'active'),
      ('${p4_away}', '${testRoomId}', 'token-p4-away', 'stable-p4', 'AwayGhost', '#73C8EA', 'circle', false, 'away');
  `);

  // 4.1 Start captain selection: active participants only, initials generated
  const startRes = (await query(`
    SELECT public.start_captain_selection('${testRoomId}', 'token-p1', 'stable-p1') as res;
  `))[0].res;

  const eventId = startRes.eventId;
  check('4.1 Initial selection generates provisional captain and 10s objection window', () => {
    assert.ok(eventId, 'Event ID generated');
    assert.equal(startRes.status, 'initial_result_provisional');
    assert.ok(startRes.provisionalCaptainId);
    assert.equal(startRes.frozenVoterIds.length, 3, 'Only 3 active voters, away excluded');
    assert.ok(!startRes.frozenVoterIds.includes(p4_away), 'Away participant excluded');
  });

  // Verify candidate initials
  check('4.2 Initials are correctly extracted for each player', () => {
    assert.equal(startRes.candidates.length, 3);
    const omar = startRes.candidates.find(c => c.nickname === 'Omar');
    assert.equal(omar.initial, 'O');
    const lina = startRes.candidates.find(c => c.nickname === 'Lina');
    assert.equal(lina.initial, 'L');
  });

  // 4.3 Provisional selection does not count toward history yet
  const historyBefore = (await query(`SELECT count(*) as cnt FROM private.captain_history WHERE event_id = '${eventId}';`))[0].cnt;
  check('4.3 Provisional selection does not count toward history', () => {
    assert.equal(Number(historyBefore), 0);
  });

  // 4.4 Reroll request: requester automatically votes approve
  const rerollRes = (await query(`
    SELECT public.request_captain_reroll('${testRoomId}', '${eventId}', 'token-p2') as res;
  `))[0].res;

  check('4.4 Reroll request opens vote and auto-casts 1 approval for requester', () => {
    assert.equal(rerollRes.status, 'reroll_vote_open');
    assert.equal(rerollRes.requesterParticipantId, p2);
    assert.equal(rerollRes.votes[p2], 'approve');
    assert.equal(rerollRes.requiredApprovals, 2, 'For N=3, required is 2');
    assert.equal(rerollRes.hasRerolled, true);
  });

  // 4.5 Second reroll request is rejected (at most 1 reroll per event)
  let secondRerollFailed = false;
  try {
    await query(`SELECT public.request_captain_reroll('${testRoomId}', '${eventId}', 'token-p3') as res;`);
  } catch (err) {
    secondRerollFailed = err.message.includes('WSH_REROLL_ALREADY_USED') || err.message.includes('WSH_INVALID_EVENT_STAGE');
  }
  check('4.5 Second reroll request is strictly rejected by server', () => {
    assert.ok(secondRerollFailed, 'Second reroll request must throw error');
  });

  // 4.6 Duplicate vote from same participant rejected
  let duplicateVoteFailed = false;
  try {
    await query(`SELECT public.cast_captain_vote('${testRoomId}', '${eventId}', 'token-p2', 'reject') as res;`);
  } catch (err) {
    duplicateVoteFailed = err.message.includes('WSH_ALREADY_VOTED');
  }
  check('4.6 Duplicate vote from same participant rejected', () => {
    assert.ok(duplicateVoteFailed, 'Duplicate vote must be rejected');
  });

  // 4.7 Cast second approve vote -> meets threshold 2 approvals for N=3 -> triggers approved reroll
  const voteRes = (await query(`
    SELECT public.cast_captain_vote('${testRoomId}', '${eventId}', 'token-p1', 'approve') as res;
  `))[0].res;

  check('4.7 Approval threshold reached triggers 2nd draw excluding provisional captain', () => {
    assert.equal(voteRes.status, 'finalized');
    assert.equal(voteRes.finalDecision, 'approved');
    assert.ok(voteRes.finalCaptainId);
    assert.notEqual(voteRes.finalCaptainId, startRes.provisionalCaptainId, 'Provisional captain excluded from 2nd draw');
  });

  // 4.8 Only the second captain has a recorded win with stable_player_id
  const historyRows = await query(`
    SELECT * FROM private.captain_history WHERE event_id = '${eventId}';
  `);
  check('4.8 Exactly one captain win recorded for final winner with stable_player_id', () => {
    assert.equal(historyRows.length, 1);
    assert.equal(historyRows[0].participant_id, voteRes.finalCaptainId);
    assert.equal(historyRows[0].was_reroll, true);
    assert.ok(historyRows[0].stable_player_id.startsWith('stable-'), 'Stable ID recorded');
  });

  // 4.9 Idempotent finalization: duplicate resolution calls cannot create extra history rows
  await query(`SELECT public.resolve_captain_event('${testRoomId}', '${eventId}', 'token-p1');`);
  const historyAfterIdempotent = await query(`
    SELECT count(*) as cnt FROM private.captain_history WHERE event_id = '${eventId}';
  `);
  check('4.9 Reconnect / resolve cannot duplicate history rows', () => {
    assert.equal(Number(historyAfterIdempotent[0].cnt), 1);
  });

  // ==========================================
  // Test Suite 5: Security Authorization, Premature Resolution & Deadline Enforcement
  // ==========================================
  console.log('\n5. Verifying Security Authorization, Premature Resolution & Deadlines:');

  const secRoomId = 'd0000000-0000-0000-0000-000000000004';
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city)
    VALUES ('${secRoomId}', 'SEC1', 'delivery', 'riyadh');
    INSERT INTO public.participants (id, room_id, session_token, stable_player_id, nickname, player_color, player_shape, is_host, status)
    VALUES
      (gen_random_uuid(), '${secRoomId}', 'sec-user-1', 'stable-sec-1', 'User1', '#55B96A', 'circle', true, 'active'),
      (gen_random_uuid(), '${secRoomId}', 'sec-user-2', 'stable-sec-2', 'User2', '#F0443E', 'circle', false, 'active'),
      (gen_random_uuid(), '${secRoomId}', 'sec-user-3', 'stable-sec-3', 'User3', '#FFD75A', 'circle', false, 'active');
  `);

  const secStart = (await query(`SELECT public.start_captain_selection('${secRoomId}', 'sec-user-1') as res;`))[0].res;
  const secEventId = secStart.eventId;

  // 5.1 Unauthorized caller rejected in resolve_captain_event
  let unauthResolveFailed = false;
  try {
    await query(`SELECT public.resolve_captain_event('${secRoomId}', '${secEventId}', 'rogue-imposter-token');`);
  } catch (err) {
    unauthResolveFailed = err.message.includes('WSH_UNAUTHORIZED');
  }
  check('5.1 resolve_captain_event rejects unauthorized callers', () => {
    assert.ok(unauthResolveFailed, 'Unauthorized caller must be rejected');
  });

  // 5.2 Unauthorized caller rejected in get_captain_event_state
  let unauthGetFailed = false;
  try {
    await query(`SELECT public.get_captain_event_state('${secRoomId}', 'rogue-imposter-token');`);
  } catch (err) {
    unauthGetFailed = err.message.includes('WSH_UNAUTHORIZED');
  }
  check('5.2 get_captain_event_state rejects unauthorized callers', () => {
    assert.ok(unauthGetFailed, 'Unauthorized caller must be rejected');
  });

  // 5.3 Premature resolve during active objection window does NOT finalize
  const prematureRes = (await query(`
    SELECT public.resolve_captain_event('${secRoomId}', '${secEventId}', 'sec-user-1') as res;
  `))[0].res;
  check('5.3 Premature call before objection deadline does not finalize event', () => {
    assert.notEqual(prematureRes.status, 'finalized');
    assert.equal(prematureRes.message, 'OBJECTION_WINDOW_ACTIVE');
  });

  // Simulate objection window expiry: update objection_ends_at to past
  await db.exec(`UPDATE public.captain_events SET objection_ends_at = now() - interval '1 second' WHERE id = '${secEventId}';`);

  // 5.4 Legitimate timeout resolution after deadline passes finalizes uncontested
  const postDeadlineRes = (await query(`
    SELECT public.resolve_captain_event('${secRoomId}', '${secEventId}', 'sec-user-1') as res;
  `))[0].res;
  check('5.4 Legitimate timeout after deadline passes finalizes uncontested winner', () => {
    assert.equal(postDeadlineRes.status, 'finalized');
    assert.equal(postDeadlineRes.finalDecision, 'uncontested');
    assert.equal(postDeadlineRes.finalCaptainId, secStart.provisionalCaptainId);
  });

  // 5.5 Premature resolution during active voting window does NOT finalize
  const voteRoomId = 'e0000000-0000-0000-0000-000000000005';
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city)
    VALUES ('${voteRoomId}', 'VOT1', 'delivery', 'riyadh');
    INSERT INTO public.participants (id, room_id, session_token, stable_player_id, nickname, player_color, player_shape, is_host, status)
    VALUES
      (gen_random_uuid(), '${voteRoomId}', 'v-user-1', 'stable-v1', 'Voter1', '#55B96A', 'circle', true, 'active'),
      (gen_random_uuid(), '${voteRoomId}', 'v-user-2', 'stable-v2', 'Voter2', '#F0443E', 'circle', false, 'active'),
      (gen_random_uuid(), '${voteRoomId}', 'v-user-3', 'stable-v3', 'Voter3', '#FFD75A', 'circle', false, 'active');
  `);

  const voteStart = (await query(`SELECT public.start_captain_selection('${voteRoomId}', 'v-user-1') as res;`))[0].res;
  const voteEvId = voteStart.eventId;

  // Open reroll vote
  await query(`SELECT public.request_captain_reroll('${voteRoomId}', '${voteEvId}', 'v-user-2');`);

  // Premature resolve during vote
  const prematureVoteRes = (await query(`
    SELECT public.resolve_captain_event('${voteRoomId}', '${voteEvId}', 'v-user-1') as res;
  `))[0].res;
  check('5.5 Premature call during active voting window does not finalize event', () => {
    assert.notEqual(prematureVoteRes.status, 'finalized');
    assert.equal(prematureVoteRes.message, 'VOTING_WINDOW_ACTIVE');
  });

  // ==========================================
  // Test Suite 6: Minimum Players & Fresh Round Selection
  // ==========================================
  console.log('\n6. Verifying Minimum Players & Fresh Round Handling:');

  const minRoomId = 'f0000000-0000-0000-0000-000000000006';
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city)
    VALUES ('${minRoomId}', 'MIN1', 'delivery', 'riyadh');
    INSERT INTO public.participants (id, room_id, session_token, stable_player_id, nickname, player_color, player_shape, is_host, status)
    VALUES
      (gen_random_uuid(), '${minRoomId}', 'solo-user', 'stable-solo', 'SoloUser', '#55B96A', 'circle', true, 'active'),
      (gen_random_uuid(), '${minRoomId}', 'away-user', 'stable-away', 'AwayUser', '#F0443E', 'circle', false, 'away');
  `);

  // 6.1 Exactly 1 active player (ignoring away) rejected with WSH_INSUFFICIENT_ACTIVE_PLAYERS
  let minPlayers1Failed = false;
  try {
    await query(`SELECT public.start_captain_selection('${minRoomId}', 'solo-user') as res;`);
  } catch (err) {
    minPlayers1Failed = err.message.includes('WSH_INSUFFICIENT_ACTIVE_PLAYERS');
  }
  check('6.1 Single active player (ignoring away) throws WSH_INSUFFICIENT_ACTIVE_PLAYERS', () => {
    assert.ok(minPlayers1Failed, 'Single active player must be rejected');
  });

  // 6.1b Exactly 2 active players: selection succeeds, becomes immediately final, and disables rerolls
  await db.exec(`
    INSERT INTO public.participants (id, room_id, session_token, stable_player_id, nickname, player_color, player_shape, is_host, status)
    VALUES
      (gen_random_uuid(), '${minRoomId}', 'user-2', 'stable-2', 'User2', '#3B82F6', 'circle', false, 'active'),
      (gen_random_uuid(), '${minRoomId}', 'disc-user', 'stable-disc', 'DiscUser', '#EAB308', 'circle', false, 'disconnected');
  `);
  const twoPlayerRes = (await query(`SELECT public.start_captain_selection('${minRoomId}', 'solo-user') as res;`))[0].res;
  check('6.1b Exactly 2 active players succeeds and immediately finalizes without objection window', () => {
    assert.ok(twoPlayerRes.eventId, 'Event created');
    assert.equal(twoPlayerRes.status, 'finalized', 'Status must be finalized immediately');
    assert.ok(twoPlayerRes.finalCaptainId, 'Final captain selected');
    assert.equal(twoPlayerRes.objectionEndsAt, null, 'No objection window for 2 players');
    assert.equal(twoPlayerRes.candidates.length, 2, 'Exactly 2 candidates');
  });

  // Exactly 2 players records win in captain_history immediately
  const twoPlayerHist = await query(`SELECT * FROM private.captain_history WHERE event_id = '${twoPlayerRes.eventId}';`);
  check('6.1c Two-player win recorded immediately in captain_history', () => {
    assert.equal(twoPlayerHist.length, 1, 'Exactly one win recorded');
    assert.equal(twoPlayerHist[0].participant_id, twoPlayerRes.finalCaptainId);
    assert.equal(twoPlayerHist[0].was_reroll, false);
  });

  // Reroll is strictly disallowed for 2-player events
  let rerollDisallowed = false;
  try {
    await query(`SELECT public.request_captain_reroll('${minRoomId}', '${twoPlayerRes.eventId}', 'solo-user') as res;`);
  } catch (err) {
    rerollDisallowed = err.message.includes('WSH_REROLL_NOT_ALLOWED') || err.message.includes('WSH_INVALID_EVENT_STAGE');
  }
  check('6.1d Reroll requests strictly disallowed for 2-player games', () => {
    assert.ok(rerollDisallowed, 'Reroll must be rejected for 2-player events');
  });

  // 6.1e Adding third active player satisfies requirement for full provisional flow
  await db.exec(`
    INSERT INTO public.participants (id, room_id, session_token, stable_player_id, nickname, player_color, player_shape, is_host, status)
    VALUES
      (gen_random_uuid(), '${minRoomId}', 'user-3', 'stable-3', 'User3', '#8B5CF6', 'circle', false, 'active');
  `);
  const threePlayerRes = (await query(`SELECT public.start_captain_selection('${minRoomId}', 'solo-user') as res;`))[0].res;
  check('6.1e Three active players generates provisional selection with objection window', () => {
    assert.ok(threePlayerRes.eventId, '3 active players creates event');
    assert.equal(threePlayerRes.status, 'initial_result_provisional', 'Status is provisional');
    assert.ok(threePlayerRes.objectionEndsAt, 'Objection window is active');
    assert.equal(threePlayerRes.candidates.length, 3, 'Exactly 3 candidates');
  });

  // Reroll is allowed for 3-player provisional event
  const threePlayerReroll = (await query(`SELECT public.request_captain_reroll('${minRoomId}', '${threePlayerRes.eventId}', 'user-2') as res;`))[0].res;
  check('6.1f Three-player game allows reroll request and opens voting', () => {
    assert.equal(threePlayerReroll.status, 'reroll_vote_open');
    assert.equal(threePlayerReroll.approvals, 1);
  });

  // 6.2 Fresh round after finalized event generates new event with new event ID
  // In secRoomId, the event was finalized. Calling start_captain_selection must create a NEW event!
  const freshEventRes = (await query(`
    SELECT public.start_captain_selection('${secRoomId}', 'sec-user-1') as res;
  `))[0].res;

  check('6.2 Calling start_captain_selection after finalized round generates fresh event', () => {
    assert.ok(freshEventRes.eventId, 'New event ID generated');
    assert.notEqual(freshEventRes.eventId, secEventId, 'New event ID differs from finalized event');
    assert.equal(freshEventRes.status, 'initial_result_provisional');
    assert.equal(freshEventRes.hasRerolled, false);
  });

  // 6.3 Calling start_captain_selection while event is active returns current event (idempotency)
  const concurrentCallRes = (await query(`
    SELECT public.start_captain_selection('${secRoomId}', 'sec-user-2') as res;
  `))[0].res;

  check('6.3 Calling start_captain_selection while event is in progress returns active event', () => {
    assert.equal(concurrentCallRes.eventId, freshEventRes.eventId, 'Returns same active event without duplicating');
  });

  // ==========================================
  // Test Suite 7: Detailed Voting Scenarios (Early Rejection, Ties, Vote Timeout, Uncontested)
  // ==========================================
  console.log('\n7. Verifying Detailed Voting Scenarios (Rejection, Ties, Timeouts):');

  // 7.1 Early Rejection when approval is mathematically impossible (N=4, threshold=3)
  const rejRoomId = '70000000-0000-0000-0000-000000000007';
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city)
    VALUES ('${rejRoomId}', 'REJ1', 'delivery', 'riyadh');
    INSERT INTO public.participants (id, room_id, session_token, stable_player_id, nickname, player_color, player_shape, is_host, status)
    VALUES
      (gen_random_uuid(), '${rejRoomId}', 'rej-p1', 'stable-rej-1', 'RejP1', '#55B96A', 'circle', true, 'active'),
      (gen_random_uuid(), '${rejRoomId}', 'rej-p2', 'stable-rej-2', 'RejP2', '#F0443E', 'circle', false, 'active'),
      (gen_random_uuid(), '${rejRoomId}', 'rej-p3', 'stable-rej-3', 'RejP3', '#FFD75A', 'circle', false, 'active'),
      (gen_random_uuid(), '${rejRoomId}', 'rej-p4', 'stable-rej-4', 'RejP4', '#73C8EA', 'circle', false, 'active');
  `);

  const rejStart = (await query(`SELECT public.start_captain_selection('${rejRoomId}', 'rej-p1') as res;`))[0].res;
  const rejEvId = rejStart.eventId;

  // p1 requests reroll -> 1 approval (needed: 3)
  await query(`SELECT public.request_captain_reroll('${rejRoomId}', '${rejEvId}', 'rej-p1');`);

  // p2 votes reject -> approvals: 1, rejections: 1, uncast: 2. (1 + 2 = 3 >= 3, still possible)
  const voteP2 = (await query(`SELECT public.cast_captain_vote('${rejRoomId}', '${rejEvId}', 'rej-p2', 'reject') as res;`))[0].res;
  check('7.1a Vote remains open while approval is still mathematically possible', () => {
    assert.equal(voteP2.status, 'reroll_vote_open');
  });

  // p3 votes reject -> approvals: 1, rejections: 2, uncast: 1. (1 + 1 = 2 < 3! mathematically IMPOSSIBLE)
  const voteP3 = (await query(`SELECT public.cast_captain_vote('${rejRoomId}', '${rejEvId}', 'rej-p3', 'reject') as res;`))[0].res;
  check('7.1b Mathematical impossibility triggers early rejection and preserves provisional captain', () => {
    assert.equal(voteP3.status, 'finalized');
    assert.equal(voteP3.finalDecision, 'rejected');
    assert.equal(voteP3.finalCaptainId, rejStart.provisionalCaptainId, 'Provisional captain retained');
  });

  // Exactly one history entry recorded for rejected vote
  const rejHist = await query(`SELECT count(*) as cnt FROM private.captain_history WHERE event_id = '${rejEvId}';`);
  check('7.1c Exactly one captain win recorded for provisional captain on rejection', () => {
    assert.equal(Number(rejHist[0].cnt), 1);
  });

  // 7.2 Tie Outcome: N=4, 2 approve vs 2 reject at vote timeout
  const tieRoomId = '80000000-0000-0000-0000-000000000008';
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city)
    VALUES ('${tieRoomId}', 'TIE1', 'delivery', 'riyadh');
    INSERT INTO public.participants (id, room_id, session_token, stable_player_id, nickname, player_color, player_shape, is_host, status)
    VALUES
      (gen_random_uuid(), '${tieRoomId}', 'tie-p1', 'stable-tie-1', 'TieP1', '#55B96A', 'circle', true, 'active'),
      (gen_random_uuid(), '${tieRoomId}', 'tie-p2', 'stable-tie-2', 'TieP2', '#F0443E', 'circle', false, 'active'),
      (gen_random_uuid(), '${tieRoomId}', 'tie-p3', 'stable-tie-3', 'TieP3', '#FFD75A', 'circle', false, 'active'),
      (gen_random_uuid(), '${tieRoomId}', 'tie-p4', 'stable-tie-4', 'TieP4', '#73C8EA', 'circle', false, 'active');
  `);

  const tieStart = (await query(`SELECT public.start_captain_selection('${tieRoomId}', 'tie-p1') as res;`))[0].res;
  const tieEvId = tieStart.eventId;

  // p1 requests reroll -> 1 approval
  await query(`SELECT public.request_captain_reroll('${tieRoomId}', '${tieEvId}', 'tie-p1');`);
  // p2 votes approve -> 2 approvals
  await query(`SELECT public.cast_captain_vote('${tieRoomId}', '${tieEvId}', 'tie-p2', 'approve');`);
  // p3 votes reject -> 1 rejection
  await query(`SELECT public.cast_captain_vote('${tieRoomId}', '${tieEvId}', 'tie-p3', 'reject');`);
  // p4 does not vote in time, vote expires
  await db.exec(`UPDATE public.captain_events SET vote_ends_at = now() - interval '1 second' WHERE id = '${tieEvId}';`);

  // Resolution at timeout: approvals = 2, required = 3 -> strict majority fails!
  const tieRes = (await query(`SELECT public.resolve_captain_event('${tieRoomId}', '${tieEvId}', 'tie-p1') as res;`))[0].res;
  check('7.2 Tie / insufficient approval at timeout retains provisional captain', () => {
    assert.equal(tieRes.status, 'finalized');
    assert.equal(tieRes.finalDecision, 'rejected');
    assert.equal(tieRes.finalCaptainId, tieStart.provisionalCaptainId);
  });

  // 7.3 Pure Uncontested Objection Expiry (no reroll requested, timer expires)
  const uncontestedRoomId = '90000000-0000-0000-0000-000000000009';
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city)
    VALUES ('${uncontestedRoomId}', 'UNC1', 'delivery', 'riyadh');
    INSERT INTO public.participants (id, room_id, session_token, stable_player_id, nickname, player_color, player_shape, is_host, status)
    VALUES
      (gen_random_uuid(), '${uncontestedRoomId}', 'unc-p1', 'stable-unc-1', 'UncP1', '#55B96A', 'circle', true, 'active'),
      (gen_random_uuid(), '${uncontestedRoomId}', 'unc-p2', 'stable-unc-2', 'UncP2', '#F0443E', 'circle', false, 'active'),
      (gen_random_uuid(), '${uncontestedRoomId}', 'unc-p3', 'stable-unc-3', 'UncP3', '#FFD75A', 'circle', false, 'active');
  `);

  const uncStart = (await query(`SELECT public.start_captain_selection('${uncontestedRoomId}', 'unc-p1') as res;`))[0].res;
  const uncEvId = uncStart.eventId;

  // Let 10s objection window expire without any reroll request
  await db.exec(`UPDATE public.captain_events SET objection_ends_at = now() - interval '1 second' WHERE id = '${uncEvId}';`);

  const uncFinal = (await query(`SELECT public.resolve_captain_event('${uncontestedRoomId}', '${uncEvId}', 'unc-p2') as res;`))[0].res;
  check('7.3 Uncontested objection expiration finalizes original provisional captain', () => {
    assert.equal(uncFinal.status, 'finalized');
    assert.equal(uncFinal.finalDecision, 'uncontested');
    assert.equal(uncFinal.finalCaptainId, uncStart.provisionalCaptainId);
    assert.equal(uncFinal.hasRerolled, false);
  });

  const uncHist = await query(`SELECT * FROM private.captain_history WHERE event_id = '${uncEvId}';`);
  check('7.4 Uncontested history records exactly 1 win with was_reroll = false', () => {
    assert.equal(uncHist.length, 1);
    assert.equal(uncHist[0].was_reroll, false);
    assert.equal(uncHist[0].participant_id, uncStart.provisionalCaptainId);
  });

  // ==========================================
  // Test Suite 8: Security Boundary & Forged Tokens
  // ==========================================
  console.log('\n8. Verifying Security Boundary & Forged Session Tokens:');

  const forgedToken = 'attacker-forged-session-token-999';

  // 8.1 start_captain_selection rejects forged session token
  let forgeStartFailed = false;
  try {
    await query(`SELECT public.start_captain_selection('${uncontestedRoomId}', '${forgedToken}') as res;`);
  } catch (err) {
    forgeStartFailed = err.message.includes('WSH_UNAUTHORIZED');
  }
  check('8.1 start_captain_selection rejects forged session token', () => {
    assert.ok(forgeStartFailed, 'Must reject forged token');
  });

  // 8.2 request_captain_reroll rejects forged session token
  let forgeRerollFailed = false;
  try {
    await query(`SELECT public.request_captain_reroll('${uncontestedRoomId}', '${uncEvId}', '${forgedToken}') as res;`);
  } catch (err) {
    forgeRerollFailed = err.message.includes('WSH_UNAUTHORIZED');
  }
  check('8.2 request_captain_reroll rejects forged session token', () => {
    assert.ok(forgeRerollFailed, 'Must reject forged token');
  });

  // 8.3 cast_captain_vote rejects forged session token
  let forgeVoteFailed = false;
  try {
    await query(`SELECT public.cast_captain_vote('${uncontestedRoomId}', '${uncEvId}', '${forgedToken}', 'approve') as res;`);
  } catch (err) {
    forgeVoteFailed = err.message.includes('WSH_UNAUTHORIZED');
  }
  check('8.3 cast_captain_vote rejects forged session token', () => {
    assert.ok(forgeVoteFailed, 'Must reject forged token');
  });

  // 8.4 Concurrent duplicate vote race condition
  // In tieRoomId, p1 already requested reroll. What if p2 sends two concurrent votes?
  const raceRoomId = 'a1000000-0000-0000-0000-000000000010';
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city)
    VALUES ('${raceRoomId}', 'RAC1', 'delivery', 'riyadh');
    INSERT INTO public.participants (id, room_id, session_token, stable_player_id, nickname, player_color, player_shape, is_host, status)
    VALUES
      (gen_random_uuid(), '${raceRoomId}', 'rac-p1', 'stable-rac-1', 'RacP1', '#55B96A', 'circle', true, 'active'),
      (gen_random_uuid(), '${raceRoomId}', 'rac-p2', 'stable-rac-2', 'RacP2', '#F0443E', 'circle', false, 'active'),
      (gen_random_uuid(), '${raceRoomId}', 'rac-p3', 'stable-rac-3', 'RacP3', '#FFD75A', 'circle', false, 'active');
  `);

  const raceStart = (await query(`SELECT public.start_captain_selection('${raceRoomId}', 'rac-p1') as res;`))[0].res;
  await query(`SELECT public.request_captain_reroll('${raceRoomId}', '${raceStart.eventId}', 'rac-p1');`);

  // p2 attempts two simultaneous votes
  const raceVotes = await Promise.allSettled([
    query(`SELECT public.cast_captain_vote('${raceRoomId}', '${raceStart.eventId}', 'rac-p2', 'approve') as res;`),
    query(`SELECT public.cast_captain_vote('${raceRoomId}', '${raceStart.eventId}', 'rac-p2', 'reject') as res;`),
  ]);

  const fulfilled = raceVotes.filter(r => r.status === 'fulfilled');
  const rejected = raceVotes.filter(r => r.status === 'rejected');
  check('8.4 Concurrent race of duplicate votes results in exactly one win and one rejection', () => {
    assert.equal(fulfilled.length, 1, 'Exactly one vote accepted');
    assert.equal(rejected.length, 1, 'Concurrent second vote rejected');
    assert.ok(rejected[0].reason.message.includes('WSH_ALREADY_VOTED') || rejected[0].reason.message.includes('WSH_VOTE_CLOSED'));
  });

  console.log(`\nPASS: All ${checks} Captain Roulette database and algorithm checks passed!`);
} catch (error) {
  console.error('\nEXECUTION FAILED MESSAGE:', error.message);
  console.error('\nEXECUTION FAILED STACK:', error.stack);
  process.exit(1);
}
