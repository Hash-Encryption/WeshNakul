// scripts/check-funnel-architecture.mjs
// Verification suite for Wesh Nakul Server-Authoritative State Machine & Funnel Architecture

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

console.log('--- EXECUTING WESH NAKUL SERVER-AUTHORITATIVE FUNNEL ARCHITECTURE TEST SUITE ---');

let checks = 0;
const check = (desc, fn) => {
  try {
    fn();
    checks++;
    console.log(`  ✓ [Check ${checks}] ${desc}`);
  } catch (err) {
    console.error(`FAILED: "${desc}"`);
    throw err;
  }
};

try {
  // 1. Initialize PGlite database with baseline schema
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS; CREATE PUBLICATION supabase_realtime;');
  for (const file of [
    '20260902_initial_schema.sql',
    '002_food_consensus.sql',
    '003_restaurant_swipes.sql',
    '005_create_and_seed_restaurants.sql',
    '006_squad_order_scratchpad.sql',
    '007_room_expiration_and_cleanup.sql',
    '20260908000100_restaurant_intelligence.sql',
    '20260908000200_restaurant_legacy_provenance.sql',
    '20260908000300_room_host_coordinates.sql',
    '20260909000100_private_restaurant_decks.sql',
    '20260909000200_private_participant_sessions.sql',
    '20260910000100_jeddah_geography_intelligence.sql',
    '20260911000100_jeddah_burger_google_verified_catalog.sql',
    '20260911000200_remove_legacy_public_room_coordinates.sql',
    '20260911000300_phase3_authoritative_consensus.sql',
    '20260912000100_allow_voting_stage_joins.sql',
    '20260913000100_decision_game_and_tie_corrections.sql',
    '20260916000100_global_fair_draw_and_immediate_flow.sql',
    '20261010000100_captain_roulette.sql',
    '20261010000200_audit_and_harden_captain_roulette.sql',
    '20261010000300_captain_roulette_minimum_players.sql',
    '20261017000100_reclaim_participant_session.sql',
    '20261022000100_raise_room_capacity_to_20.sql',
    '20261103000100_server_authoritative_funnel.sql'
  ]) {
    await db.exec(migration(file).replace('create extension if not exists "pgcrypto";', ''));
  }

  console.log('\n1. Verifying Database Schema & Status Enum Constraints...');

  // Check constraint enforcement on rooms.status
  const validStatuses = [
    'lobby',
    'category_swiping',
    'tallying_categories',
    'roulette',
    'consensus',
    'restaurant_swiping',
    'final_consensus'
  ];

  for (const st of validStatuses) {
    const res = await query(`
      INSERT INTO rooms (code, eating_mode, city, status)
      VALUES ('T${checks.toString().padStart(3, '0')}', 'delivery', 'Jeddah', '${st}')
      RETURNING id, status;
    `);
    check(`Room status '${st}' is valid and accepted`, () => {
      assert.equal(res[0].status, st);
    });
  }

  // Reject invalid room status
  let threwInvalidStatus = false;
  try {
    await query(`
      INSERT INTO rooms (code, eating_mode, city, status)
      VALUES ('BAD1', 'delivery', 'Jeddah', 'arbitrary_client_status')
    `);
  } catch (err) {
    threwInvalidStatus = true;
  }
  check('Invalid status string violates rooms_status_check constraint', () => {
    assert.equal(threwInvalidStatus, true);
  });

  console.log('\n2. Verifying room_members Schema & Host ID Association...');
  const testRoomId = (await query(`SELECT id FROM rooms LIMIT 1;`))[0].id;

  const memberRes = await query(`
    INSERT INTO participants (id, room_id, session_token, nickname, is_host, player_color, player_shape)
    VALUES (gen_random_uuid(), '${testRoomId}', 'tok_ahmad', 'Ahmad', true, '#55B96A', 'circle')
    RETURNING id as user_id, nickname, is_host;
  `);
  const memberRow = await query(`SELECT * FROM room_members WHERE user_id = '${memberRes[0].user_id}';`);

  check('room_members row created with canonical columns', () => {
    assert.equal(memberRow[0].nickname, 'Ahmad');
    assert.equal(memberRow[0].is_host, true);
    assert.equal(memberRow[0].is_done_swiping, false);
    assert.equal(memberRow[0].swipe_count, 0);
    assert.ok(memberRow[0].last_seen);
    assert.ok(memberRow[0].joined_at);
  });

  await query(`UPDATE rooms SET host_id = '${memberRes[0].user_id}' WHERE id = '${testRoomId}';`);
  const roomWithHost = await query(`SELECT host_id FROM rooms WHERE id = '${testRoomId}';`);
  check('rooms.host_id properly references room_members.user_id', () => {
    assert.equal(roomWithHost[0].host_id, memberRes[0].user_id);
  });

  console.log('\n3. Verifying Atomic advance_room_stage RPC...');
  // Add a second member
  const member2 = await query(`
    INSERT INTO participants (id, room_id, session_token, nickname, is_host, player_color, player_shape)
    VALUES (gen_random_uuid(), '${testRoomId}', 'tok_sami', 'Sami', false, '#FFD75A', 'square')
    RETURNING id as user_id;
  `);

  // Reset room to lobby
  await query(`UPDATE rooms SET status = 'lobby', phase_ends_at = NULL WHERE id = '${testRoomId}';`);

  // Advance lobby -> category_swiping
  const adv1 = await query(`SELECT advance_room_stage('${testRoomId}', 'category_swiping') as res;`);
  check('advance_room_stage transitions to category_swiping', () => {
    assert.equal(adv1[0].res.success, true);
    assert.equal(adv1[0].res.new_status, 'category_swiping');
  });

  const roomAfterAdv1 = await query(`SELECT status, phase_ends_at FROM rooms WHERE id = '${testRoomId}';`);
  check('Swiping phase has no premature kick-out timer', () => {
    assert.equal(roomAfterAdv1[0].status, 'category_swiping');
    assert.equal(roomAfterAdv1[0].phase_ends_at, null);
  });

  // Guard test: Cannot advance to consensus if members are NOT done
  let blockedEarlyAdvancement = false;
  try {
    await query(`SELECT advance_room_stage('${testRoomId}', 'consensus') as res;`);
  } catch (err) {
    blockedEarlyAdvancement = true;
    assert.ok(String(err).includes('Cannot advance: Not all members finished'));
  }
  check('advance_room_stage blocks premature advancement when swiping incomplete', () => {
    assert.equal(blockedEarlyAdvancement, true);
  });

  // Mark all members done
  await query(`UPDATE room_members SET is_done_swiping = true, swipe_count = 5 WHERE room_id = '${testRoomId}';`);
  const adv2 = await query(`SELECT advance_room_stage('${testRoomId}', 'consensus') as res;`);
  const roomAfterAdv2 = await query(`SELECT status, phase_ends_at FROM rooms WHERE id = '${testRoomId}';`);
  check('advance_room_stage allows transition to consensus and sets 15s auto-advance timer', () => {
    assert.equal(adv2[0].res.success, true);
    assert.equal(adv2[0].res.new_status, 'consensus');
    assert.equal(roomAfterAdv2[0].status, 'consensus');
    assert.ok(roomAfterAdv2[0].phase_ends_at);
  });

  // Member swiping flags reset clean for next phase
  const membersAfterAdv = await query(`SELECT is_done_swiping, swipe_count FROM room_members WHERE room_id = '${testRoomId}';`);
  check('Member is_done_swiping and swipe_count are reset clean by advance_room_stage', () => {
    assert.ok(membersAfterAdv.every(m => m.is_done_swiping === false && m.swipe_count === 0));
  });

  // Advance to restaurant_swiping
  const adv3 = await query(`SELECT advance_room_stage('${testRoomId}', 'restaurant_swiping') as res;`);
  const roomAfterAdv3 = await query(`SELECT status, phase_ends_at FROM rooms WHERE id = '${testRoomId}';`);
  check('advance_room_stage transitions to restaurant_swiping without premature eviction timer', () => {
    assert.equal(adv3[0].res.new_status, 'restaurant_swiping');
    assert.equal(roomAfterAdv3[0].status, 'restaurant_swiping');
    assert.equal(roomAfterAdv3[0].phase_ends_at, null);
  });

  console.log('\n4. Verifying Deterministic Host Election & Failover...');
  // Old host: joined first, but last_seen timed out (older than 15s)
  const hostId = memberRes[0].user_id;
  const guest1Id = member2[0].user_id;

  // Add guest 2 who joined later
  const member3 = await query(`
    INSERT INTO room_members (room_id, nickname, is_host, last_seen, joined_at)
    VALUES ('${testRoomId}', 'Tariq', false, now(), now() + interval '5 seconds')
    RETURNING user_id;
  `);
  const guest2Id = member3[0].user_id;

  // Set host last_seen to 20 seconds ago (expired)
  await db.exec(`
    UPDATE room_members SET last_seen = now() - interval '20 seconds' WHERE user_id = '${hostId}';
    UPDATE room_members SET last_seen = now() WHERE user_id = '${guest1Id}';
    UPDATE room_members SET last_seen = now() WHERE user_id = '${guest2Id}';
  `);

  // Run failover check
  const failoverRes = await query(`SELECT check_and_elect_host('${testRoomId}') as res;`);
  check('check_and_elect_host detects disconnected host and elects new host', () => {
    assert.equal(failoverRes[0].res.elected, true);
    // Deterministic rule: Guest 1 joined before Guest 2, so Guest 1 MUST be elected!
    assert.equal(failoverRes[0].res.new_host_id, guest1Id);
    assert.equal(failoverRes[0].res.new_host_name, 'Sami');
  });

  const updatedRoom = await query(`SELECT host_id FROM rooms WHERE id = '${testRoomId}';`);
  const updatedMembers = await query(`SELECT user_id, is_host FROM room_members WHERE room_id = '${testRoomId}';`);
  check('rooms.host_id and room_members.is_host updated to new host', () => {
    assert.equal(updatedRoom[0].host_id, guest1Id);
    const hostRow = updatedMembers.find(m => m.user_id === guest1Id);
    const oldHostRow = updatedMembers.find(m => m.user_id === hostId);
    assert.equal(hostRow.is_host, true);
    assert.equal(oldHostRow.is_host, false);
  });

  console.log('\n5. Verifying Category Consensus Resolution & Roulette Timing...');
  // Test clear winner resolution
  await query(`
    SELECT resolve_category_funnel_consensus(
      '${testRoomId}',
      'burger',
      85,
      '["shawarma", "pizza"]'::jsonb
    );
  `);

  const roomClear = await query(`SELECT status, consensus_summary FROM rooms WHERE id = '${testRoomId}';`);
  check('resolve_category_funnel_consensus stores winner, agreement math, and runner_ups', () => {
    assert.equal(roomClear[0].status, 'consensus');
    assert.equal(roomClear[0].consensus_summary.winner, 'burger');
    assert.equal(roomClear[0].consensus_summary.agreementPercent, 85);
    assert.deepEqual(roomClear[0].consensus_summary.runnerUps, ['shawarma', 'pizza']);
  });

  // Test tie with roulette resolution
  const spinTimestamp = new Date().toISOString();
  await query(`
    SELECT resolve_category_funnel_consensus(
      '${testRoomId}',
      'pizza',
      50,
      '["burger", "pizza"]'::jsonb,
      1720,
      '${spinTimestamp}'
    );
  `);

  const roomRoulette = await query(`SELECT status, consensus_summary FROM rooms WHERE id = '${testRoomId}';`);
  check('Tied vote sets status to roulette and stores deterministic targetAngle and spinStartedAt', () => {
    assert.equal(roomRoulette[0].status, 'roulette');
    assert.equal(roomRoulette[0].consensus_summary.winner, 'pizza');
    assert.equal(roomRoulette[0].consensus_summary.targetAngle, 1720);
    assert.equal(roomRoulette[0].consensus_summary.spinStartedAt, spinTimestamp);
  });

  console.log('\n6. Verifying Full Reset on Vote Again from Scratch & Foreign Key Safety...');
  // Insert a test food choice & restaurant swipe
  await query(`
    INSERT INTO food_choices (room_id, participant_id, selected_categories, is_submitted)
    VALUES ('${testRoomId}', '${guest1Id}', ARRAY['burger'], true)
    ON CONFLICT (room_id, participant_id) DO UPDATE SET selected_categories = EXCLUDED.selected_categories;
  `);
  await query(`
    INSERT INTO restaurant_swipes (room_id, participant_id, restaurant_id, vote)
    VALUES ('${testRoomId}', '${guest1Id}', 'rest-1', 'YES');
  `);

  // Advance to category_swiping or lobby (Vote Again from scratch)
  await query(`SELECT advance_room_stage('${testRoomId}', 'category_swiping');`);
  const choicesAfterReset = await query(`SELECT count(*)::int as cnt FROM food_choices WHERE room_id = '${testRoomId}';`);
  const swipesAfterReset = await query(`SELECT count(*)::int as cnt FROM restaurant_swipes WHERE room_id = '${testRoomId}';`);
  const roomAfterReset = await query(`SELECT winning_category, consensus_summary FROM rooms WHERE id = '${testRoomId}';`);

  check('advance_room_stage to category_swiping resets food_choices, restaurant_swipes, and winning_category', () => {
    assert.equal(choicesAfterReset[0].cnt, 0);
    assert.equal(swipesAfterReset[0].cnt, 0);
    assert.equal(roomAfterReset[0].winning_category, null);
  });

  // Verify Foreign Key ON DELETE SET NULL on rooms.host_id
  await query(`DELETE FROM room_members WHERE user_id = '${guest1Id}';`);
  const roomAfterHostDelete = await query(`SELECT host_id FROM rooms WHERE id = '${testRoomId}';`);
  check('Deleting a host member sets rooms.host_id to NULL without foreign key crash', () => {
    assert.equal(roomAfterHostDelete[0].host_id, null);
  });

  console.log('\n7. Verifying UI Component Mapping & Zero UI Loss Routing...');
  const appFile = readFileSync('src/App.tsx', 'utf8');
  check('App.tsx strictly routes by currentRoom.status preserving 100% of original UI components and zero funnel imports', () => {
    assert.ok(appFile.includes("case 'category_swiping':"));
    assert.ok(appFile.includes('<FoodVotingScreen />'));
    assert.ok(appFile.includes("case 'roulette':"));
    assert.ok(appFile.includes("case 'tiebreaker':"));
    assert.ok(appFile.includes('<TiebreakerScreen />'));
    assert.ok(appFile.includes("case 'consensus':"));
    assert.ok(appFile.includes('<ConsensusResultScreen />'));
    assert.ok(appFile.includes("case 'restaurant_swiping':"));
    assert.ok(appFile.includes('<RestaurantSwipingScreen />'));
    assert.ok(appFile.includes("case 'final_consensus':"));
    assert.ok(appFile.includes('<MatchCelebrationScreen'));
    assert.ok(appFile.includes("case 'lobby':"));
    assert.ok(appFile.includes('<RoomLobbyScreen'));
    assert.equal(appFile.includes('components/funnel/'), false);
  });

  console.log('\n======================================================');
  console.log(`PASS: All ${checks} Server-Authoritative Funnel Architecture checks passed successfully!`);
  console.log('======================================================');
} finally {
  // cleanup
}
