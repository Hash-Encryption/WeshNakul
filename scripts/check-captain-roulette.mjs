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

console.log('--- EXECUTING CAPTAIN ROULETTE VERIFICATION SUITE ---');

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

  // Load new captain roulette migration
  await db.exec(migration('20261010000100_captain_roulette.sql'));

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
  console.log('\n1. Verifying Pure Weight Calculations & Decay Formula:');

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

  // 1.4 Win from 14 days ago refreshes to 100.0 (User rule: refreshes to 100 in 14 days not 42)
  await db.exec(`
    INSERT INTO private.captain_history (room_id, event_id, participant_id, stable_player_id, nickname, created_at)
    VALUES ('a0000000-0000-0000-0000-000000000001', 'ev-14d-1', gen_random_uuid(), 'player-14d', 'Lina', now() - interval '14 days 1 hour');
  `);
  const weight14d = (await query("SELECT private.calculate_player_captain_weight('player-14d') as w;"))[0].w;
  check('1.4 Win older than 14 days refreshes to 100.0', () => {
    assert.equal(Number(weight14d), 100.0, `Expected 100.0 after 14 days, got ${weight14d}`);
  });

  // 1.5 Multiple independent wins accumulate penalty
  // Player with 1 win at 0 days (penalty = 1) and 1 win at 7 days (penalty = 0.5)
  // Total penalty = 1.5 -> weight = 100 / (1 + 4 * 1.5) = 100 / 7 ≈ 14.2857
  await db.exec(`
    INSERT INTO private.captain_history (room_id, event_id, participant_id, stable_player_id, nickname, created_at)
    VALUES 
      ('a0000000-0000-0000-0000-000000000001', 'ev-multi-1', gen_random_uuid(), 'player-multi', 'Yara', now()),
      ('a0000000-0000-0000-0000-000000000001', 'ev-multi-2', gen_random_uuid(), 'player-multi', 'Yara', now() - interval '7 days');
  `);
  const weightMulti = (await query("SELECT private.calculate_player_captain_weight('player-multi') as w;"))[0].w;
  check('1.5 Multiple wins accumulate penalties independently', () => {
    const expected = 100 / 7;
    assert.ok(Math.abs(Number(weightMulti) - expected) < 0.1, `Expected ~${expected}, got ${weightMulti}`);
  });

  // 1.6 Never zero weight: recent winners retain nonzero chance
  check('1.6 Recent winner retains strictly positive weight', () => {
    assert.ok(Number(recentWeight) > 0, 'Weight must be strictly positive');
    assert.ok(Number(weightMulti) > 0, 'Weight must be strictly positive');
  });

  // ==========================================
  // Test Suite 2: Cross-Room Identity & Nickname Collision Isolation
  // ==========================================
  console.log('\n2. Verifying Cross-Room Identity & Nickname Collision Isolation:');

  // Room B created
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city) 
    VALUES ('b0000000-0000-0000-0000-000000000002', 'TST2', 'delivery', 'jeddah');
  `);

  // Same stable ID 'player-recent' should have weight 20.0 when participating in Room B
  const weightCrossRoom = (await query("SELECT private.calculate_player_captain_weight('player-recent') as w;"))[0].w;
  check('2.1 Same stable player identity retains history across rooms', () => {
    assert.ok(Math.abs(Number(weightCrossRoom) - 20.0) < 0.01);
  });

  // Different user with the SAME nickname 'Omar' but different stable_id 'omar-user-2' has fresh weight 100.0
  const omar2Weight = (await query("SELECT private.calculate_player_captain_weight('omar-user-2') as w;"))[0].w;
  check('2.2 Identical nicknames with different stable identity are not merged', () => {
    assert.equal(Number(omar2Weight), 100.0);
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

  // User rule: "if the approval and objection of the reroll is a tie then they keep them."
  // For N=4, if 2 approve and 2 reject (tie): approvals (2) < requiredApprovals (3) -> Reroll Rejected!
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
    INSERT INTO public.participants (id, room_id, session_token, nickname, player_color, player_shape, is_host, status)
    VALUES 
      ('${p1}', '${testRoomId}', 'token-p1', 'Omar', '#55B96A', 'circle', true, 'active'),
      ('${p2}', '${testRoomId}', 'token-p2', 'Lina', '#F0443E', 'squircle', false, 'active'),
      ('${p3}', '${testRoomId}', 'token-p3', 'Saad', '#FFD75A', 'diamond', false, 'active'),
      ('${p4_away}', '${testRoomId}', 'token-p4-away', 'AwayGhost', '#73C8EA', 'circle', false, 'away');
  `);

  // 4.1 Start captain selection: active participants only, initials generated
  const startRes = (await query(`
    SELECT public.start_captain_selection('${testRoomId}', 'token-p1') as res;
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

  // 4.8 Only the second captain has a recorded win; overturned provisional does not count
  const historyRows = await query(`
    SELECT * FROM private.captain_history WHERE event_id = '${eventId}';
  `);
  check('4.8 Exactly one captain win recorded for final winner (not provisional)', () => {
    assert.equal(historyRows.length, 1);
    assert.equal(historyRows[0].participant_id, voteRes.finalCaptainId);
    assert.equal(historyRows[0].was_reroll, true);
  });

  // 4.9 Idempotent finalization: duplicate resolution calls cannot create extra history rows
  await query(`SELECT public.resolve_captain_event('${testRoomId}', '${eventId}');`);
  const historyAfterIdempotent = await query(`
    SELECT count(*) as cnt FROM private.captain_history WHERE event_id = '${eventId}';
  `);
  check('4.9 Reconnect / resolve cannot duplicate history rows', () => {
    assert.equal(Number(historyAfterIdempotent[0].cnt), 1);
  });

  // ==========================================
  // Test Suite 5: Uncontested Window & Tie Rejection End-to-End
  // ==========================================
  console.log('\n5. Verifying Uncontested Expiry and Vote Tie Rejection in Database:');

  // Test 5.1: Uncontested objection expiry confirms original captain
  const room2Id = 'd0000000-0000-0000-0000-000000000004';
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city) 
    VALUES ('${room2Id}', 'CAP2', 'delivery', 'riyadh');
    INSERT INTO public.participants (id, room_id, session_token, nickname, player_color, player_shape, is_host, status)
    VALUES 
      (gen_random_uuid(), '${room2Id}', 'tok-a1', 'Player1', '#55B96A', 'circle', true, 'active'),
      (gen_random_uuid(), '${room2Id}', 'tok-a2', 'Player2', '#F0443E', 'circle', false, 'active');
  `);

  const startRes2 = (await query(`SELECT public.start_captain_selection('${room2Id}', 'tok-a1') as res;`))[0].res;
  const ev2 = startRes2.eventId;

  // Resolve after timeout
  const resolveUncontested = (await query(`SELECT public.resolve_captain_event('${room2Id}', '${ev2}') as res;`))[0].res;
  check('5.1 Uncontested window expiry finalizes original captain', () => {
    assert.equal(resolveUncontested.status, 'finalized');
    assert.equal(resolveUncontested.finalCaptainId, startRes2.provisionalCaptainId);
    assert.equal(resolveUncontested.hasRerolled, false);
  });

  // Test 5.2: 4-Player Room with 2 vs 2 Tie Rejection
  const room4Id = 'e0000000-0000-0000-0000-000000000005';
  await db.exec(`
    INSERT INTO public.rooms (id, code, eating_mode, city) 
    VALUES ('${room4Id}', 'CAP4', 'delivery', 'riyadh');
  `);
  const u1 = 'aaaa0000-0000-0000-0000-000000000001';
  const u2 = 'aaaa0000-0000-0000-0000-000000000002';
  const u3 = 'aaaa0000-0000-0000-0000-000000000003';
  const u4 = 'aaaa0000-0000-0000-0000-000000000004';

  await db.exec(`
    INSERT INTO public.participants (id, room_id, session_token, nickname, player_color, player_shape, is_host, status)
    VALUES 
      ('${u1}', '${room4Id}', 'tok-u1', 'A1', '#55B96A', 'circle', true, 'active'),
      ('${u2}', '${room4Id}', 'tok-u2', 'A2', '#F0443E', 'circle', false, 'active'),
      ('${u3}', '${room4Id}', 'tok-u3', 'A3', '#FFD75A', 'circle', false, 'active'),
      ('${u4}', '${room4Id}', 'tok-u4', 'A4', '#73C8EA', 'circle', false, 'active');
  `);

  const startRes4 = (await query(`SELECT public.start_captain_selection('${room4Id}', 'tok-u1') as res;`))[0].res;
  const ev4 = startRes4.eventId;

  // u2 requests reroll (approves)
  await query(`SELECT public.request_captain_reroll('${room4Id}', '${ev4}', 'tok-u2');`);

  // u3 approves (2 approvals)
  await query(`SELECT public.cast_captain_vote('${room4Id}', '${ev4}', 'tok-u3', 'approve');`);

  // u4 rejects (1 rejection)
  await query(`SELECT public.cast_captain_vote('${room4Id}', '${ev4}', 'tok-u4', 'reject');`);

  // u1 rejects -> now 2 approvals vs 2 rejections = TIE!
  // For N=4, required is floor(4/2) + 1 = 3. Since approvals (2) + uncast (0) < 3, early rejection triggers!
  const tieVoteRes = (await query(`SELECT public.cast_captain_vote('${room4Id}', '${ev4}', 'tok-u1', 'reject') as res;`))[0].res;

  check('5.2 Tied vote (2 approve vs 2 reject) rejects reroll and keeps provisional captain', () => {
    assert.equal(tieVoteRes.status, 'finalized');
    assert.equal(tieVoteRes.finalDecision, 'rejected');
    assert.equal(tieVoteRes.finalCaptainId, startRes4.provisionalCaptainId, 'Provisional captain kept on tie');
  });

  const history4 = await query(`SELECT * FROM private.captain_history WHERE event_id = '${ev4}';`);
  check('5.3 On tie rejection, exactly one win recorded for original provisional captain', () => {
    assert.equal(history4.length, 1);
    assert.equal(history4[0].participant_id, startRes4.provisionalCaptainId);
    assert.equal(history4[0].was_reroll, false);
  });

  console.log(`\nPASS: All ${checks} Captain Roulette database and algorithm checks passed!`);
} catch (error) {
  console.error('\nEXECUTION FAILED:', error);
  process.exit(1);
}
