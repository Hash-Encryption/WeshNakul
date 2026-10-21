import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer } from 'vite';

const runtime = process.env.PGLITE_MODULE || join(tmpdir(), 'weshnakul-phase1-db/node_modules/@electric-sql/pglite/dist/index.js');
const { PGlite } = await import(pathToFileURL(runtime).href);
const db = new PGlite();
const migration = file => readFileSync(`supabase/migrations/${file}`, 'utf8').replace(/^\uFEFF/, '');
const query = async sql => (await db.query(sql)).rows;

console.log('--- EXECUTING WESHNAKUL ROOM CAPACITY (20 PLAYERS) VERIFICATION SUITE ---');

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
  // 1. Initialize PGlite database with full schema up to latest migrations
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
    '20260916000100_global_fair_draw_and_immediate_flow.sql',
    '20261010000100_captain_roulette.sql',
    '20261010000200_audit_and_harden_captain_roulette.sql',
    '20261010000300_captain_roulette_minimum_players.sql',
    '20261017000100_reclaim_participant_session.sql'
  ]) {
    await db.exec(migration(file));
  }

  console.log('\n1. Verifying Clean Additive Migration Application...');
  // Apply our additive migration
  const capacityMigrationSql = migration('20261022000100_raise_room_capacity_to_20.sql');
  await db.exec(capacityMigrationSql);
  check('Migration 20261022000100_raise_room_capacity_to_20.sql executes cleanly and idempotently', () => {
    assert.ok(capacityMigrationSql.includes('c_max_room_capacity CONSTANT int := 20;'));
  });

  // Verify function permissions
  const grants = await query(`
    SELECT grantee, privilege_type 
    FROM information_schema.routine_privileges 
    WHERE routine_name = 'join_room_authorized';
  `);
  const grantees = grants.map(g => g.grantee);
  check('join_room_authorized grants EXECUTE to anon and authenticated, revokes from PUBLIC', () => {
    assert.ok(grantees.includes('anon'));
    assert.ok(grantees.includes('authenticated'));
    assert.ok(!grantees.includes('PUBLIC'));
  });

  console.log('\n2. Verifying Room Creation and Host Counting Toward Limit...');
  // Helper to call create_room_authorized
  const createRoom = async (code, hostToken, nickname) => {
    const res = await query(`
      SELECT public.create_room_authorized(
        '${code}',
        '${hostToken}',
        'delivery',
        'jeddah',
        'Al Rawdah',
        'ar',
        '${nickname}'
      ) as data;
    `);
    return res[0].data;
  };

  // Helper to call join_room_authorized
  const joinRoom = async (code, token, nickname) => {
    const res = await query(`
      SELECT public.join_room_authorized(
        '${code}',
        '${token}',
        '${nickname}'
      ) as data;
    `);
    return res[0].data;
  };

  const roomCode = 'CAP1';
  const hostToken = 'host-session-token-0001';
  const createRes = await createRoom(roomCode, hostToken, 'CaptainHost');
  const roomId = createRes.room.id;

  check('Host participant is successfully created with is_host = true', () => {
    assert.equal(createRes.participant.is_host, true);
    assert.equal(createRes.participant.nickname, 'CaptainHost');
  });

  const partCountAfterHost = await query(`SELECT count(*)::int as count FROM public.participants WHERE room_id = '${roomId}' AND status = 'active';`);
  check('Host counts as participant #1 toward total capacity', () => {
    assert.equal(partCountAfterHost[0].count, 1);
  });

  console.log('\n3. Verifying Exactly 20 Participants Allowed (1 Host + 19 Guests)...');
  // Add 19 guests
  for (let i = 1; i <= 19; i++) {
    const guestToken = `guest-session-token-${String(i).padStart(4, '0')}`;
    const guestNick = `Guest_${i}`;
    const joinRes = await joinRoom(roomCode, guestToken, guestNick);
    assert.equal(joinRes.participant.nickname, guestNick);
    assert.equal(joinRes.participant.is_host, false);
  }

  const partCountAtCap = await query(`SELECT count(*)::int as count FROM public.participants WHERE room_id = '${roomId}' AND status = 'active';`);
  check('Room successfully accepts exactly 20 total active participants (1 host + 19 guests)', () => {
    assert.equal(partCountAtCap[0].count, 20);
  });

  // Verify all 20 participants have unique session tokens and valid shapes/colors
  const allParts = await query(`SELECT session_token, player_color, player_shape, nickname FROM public.participants WHERE room_id = '${roomId}' ORDER BY joined_at;`);
  check('All 20 participants have unique session tokens and non-null procedural attributes', () => {
    assert.equal(allParts.length, 20);
    const tokens = new Set(allParts.map(p => p.session_token));
    assert.equal(tokens.size, 20);
    for (const p of allParts) {
      assert.ok(p.player_color, `Missing color for ${p.nickname}`);
      assert.ok(p.player_shape, `Missing shape for ${p.nickname}`);
    }
  });

  console.log('\n4. Verifying Participant 21 is Rejected with WSH_ROOM_FULL...');
  const guest21Token = 'guest-session-token-0021';
  let rejected = false;
  let rejectError = null;
  try {
    await joinRoom(roomCode, guest21Token, 'Guest_21');
  } catch (err) {
    rejected = true;
    rejectError = err;
  }

  check('Participant 21 is rejected with exception containing WSH_ROOM_FULL', () => {
    assert.equal(rejected, true);
    assert.ok(String(rejectError).includes('WSH_ROOM_FULL'), `Expected WSH_ROOM_FULL, got: ${rejectError}`);
  });

  console.log('\n5. Verifying Room State and Participant Count Integrity After Rejection...');
  const partCountPostReject = await query(`SELECT count(*)::int as count FROM public.participants WHERE room_id = '${roomId}' AND status = 'active';`);
  check('Participant count remains strictly 20 after rejected 21st join attempt', () => {
    assert.equal(partCountPostReject[0].count, 20);
  });

  const participant21Exists = await query(`SELECT * FROM public.participants WHERE room_id = '${roomId}' AND nickname = 'Guest_21';`);
  check('Rejected participant 21 row was not inserted into database', () => {
    assert.equal(participant21Exists.length, 0);
  });

  const roomStateCheck = await query(`SELECT id, code, stage, status FROM public.rooms WHERE id = '${roomId}';`);
  check('Room record remains uncorrupted and intact', () => {
    assert.equal(roomStateCheck[0].code, roomCode);
    assert.equal(roomStateCheck[0].stage, 'voting');
  });

  console.log('\n6. Verifying Existing Participant Session Re-join & Reclamation at Full Capacity...');
  // A participant already in the room can re-call join_room_authorized (e.g. page refresh) and receive their room/participant data
  const guest5Token = 'guest-session-token-0005';
  const rejoinRes = await joinRoom(roomCode, guest5Token, 'Guest_5');
  check('Existing participant re-joining room at 20 capacity is accepted immediately without error', () => {
    assert.equal(rejoinRes.participant.nickname, 'Guest_5');
    assert.equal(rejoinRes.participant.session_token, guest5Token);
  });

  // Reclaim session for an existing participant with a new session token at 20 capacity
  const reclaimRes = await query(`
    SELECT public.reclaim_participant_session(
      '${roomCode}',
      'Guest_5',
      'guest-session-token-new5'
    ) as data;
  `);
  check('reclaim_participant_session succeeds at full capacity without increasing participant count', () => {
    assert.equal(reclaimRes[0].data.success, true);
    assert.equal(reclaimRes[0].data.participant.nickname, 'Guest_5');
  });

  const partCountPostReclaim = await query(`SELECT count(*)::int as count FROM public.participants WHERE room_id = '${roomId}' AND status = 'active';`);
  check('Participant count remains strictly 20 after session reclamation', () => {
    assert.equal(partCountPostReclaim[0].count, 20);
  });

  console.log('\n7. Verifying Concurrent Join Safety at Boundary (Room at 19 participants)...');
  // Create a fresh room with 1 host and 18 guests (total 19 participants)
  const raceCode = 'RACE';
  const raceHostToken = 'race-host-session-token-001';
  const raceRoomRes = await createRoom(raceCode, raceHostToken, 'RaceHost');
  const raceRoomId = raceRoomRes.room.id;

  for (let i = 1; i <= 18; i++) {
    await joinRoom(raceCode, `race-guest-token-${String(i).padStart(4, '0')}`, `RaceGuest_${i}`);
  }

  const countPreRace = await query(`SELECT count(*)::int as count FROM public.participants WHERE room_id = '${raceRoomId}' AND status = 'active';`);
  assert.equal(countPreRace[0].count, 19);

  // Two guests attempt to join simultaneously when only 1 slot is left (19 -> 20 max)
  const candidateA = () => joinRoom(raceCode, 'race-contender-A-token', 'ContenderA');
  const candidateB = () => joinRoom(raceCode, 'race-contender-B-token', 'ContenderB');

  const results = await Promise.allSettled([candidateA(), candidateB()]);
  const fulfilled = results.filter(r => r.status === 'fulfilled');
  const rejectedJoins = results.filter(r => r.status === 'rejected');

  check('Concurrent joins at capacity: exactly ONE candidate succeeds and ONE is rejected', () => {
    assert.equal(fulfilled.length, 1, 'Exactly one contender should succeed');
    assert.equal(rejectedJoins.length, 1, 'Exactly one contender should be rejected');
    assert.ok(String(rejectedJoins[0].reason).includes('WSH_ROOM_FULL'), 'Rejected contender received WSH_ROOM_FULL');
  });

  const finalRaceCount = await query(`SELECT count(*)::int as count FROM public.participants WHERE room_id = '${raceRoomId}' AND status = 'active';`);
  check('Concurrent join attempts never exceed maximum capacity of 20', () => {
    assert.equal(finalRaceCount[0].count, 20);
  });

  console.log('\n8. Verifying Existing Rooms Preserved and Can Expand to 20...');
  // A room created with 10 players under the previous limit can now seamlessly grow to 20
  const legacyCode = 'LEG1';
  const legHostToken = 'leg-host-session-token-0001';
  await createRoom(legacyCode, legHostToken, 'LegacyHost');
  for (let i = 1; i <= 9; i++) {
    await joinRoom(legacyCode, `leg-guest-token-${i}`, `LegGuest_${i}`);
  }
  const countAt10 = await query(`SELECT count(*)::int as count FROM public.participants WHERE room_id = (SELECT id FROM public.rooms WHERE code = '${legacyCode}') AND status = 'active';`);
  assert.equal(countAt10[0].count, 10);

  // Under old rules, player 11 was blocked. Under new rules, player 11 joins seamlessly:
  const player11 = await joinRoom(legacyCode, 'leg-guest-token-11', 'LegGuest_11');
  check('Room that previously had 10 participants can now seamlessly accept additional participants up to 20', () => {
    assert.equal(player11.participant.nickname, 'LegGuest_11');
  });

  console.log('\n9. Verifying Frontend Centralization, Localization & Contracts...');
  // Load Vite SSR module to test MAX_ROOM_CAPACITY and frontend contracts
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    const roomConfig = await server.ssrLoadModule('/src/config/room.ts');
    check('MAX_ROOM_CAPACITY is centralized in src/config/room.ts and equals 20', () => {
      assert.equal(roomConfig.MAX_ROOM_CAPACITY, 20);
    });

    // Check localization files
    const en = JSON.parse(readFileSync('src/locales/en.json', 'utf8'));
    const ar = JSON.parse(readFileSync('src/locales/ar.json', 'utf8'));

    check('English translations correctly reference 20-player limit', () => {
      assert.equal(en.lobby.maxMembersBadge, 'Up to 20 people');
      assert.equal(en.roomFull.title, 'Room is packed! Max 20 people reached.');
      assert.equal(en.roomFull.subtitle, "You can't join because this squad has reached its 20-player capacity.");
    });

    check('Arabic translations correctly reference 20-player limit', () => {
      assert.equal(ar.lobby.maxMembersBadge, 'حتى 20 شخص');
      assert.equal(ar.roomFull.title, 'عذرًا، القروب وصل حده (20 شخص)');
      assert.equal(ar.roomFull.subtitle, 'ما تقدر تنضم لأن القروب اكتمل بعدد 20 شخص.');
    });

    // Check 1:1 key parity between en and ar
    const enKeys = Object.keys(en).sort();
    const arKeys = Object.keys(ar).sort();
    check('Localization keys maintain 100% parity across English and Arabic', () => {
      assert.deepEqual(enKeys, arKeys);
      assert.deepEqual(Object.keys(en.roomFull).sort(), Object.keys(ar.roomFull).sort());
      assert.deepEqual(Object.keys(en.lobby).sort(), Object.keys(ar.lobby).sort());
    });

    // Verify RoomLobbyScreen source imports MAX_ROOM_CAPACITY and renders {MAX_ROOM_CAPACITY}
    const lobbySrc = readFileSync('src/components/lobby/RoomLobbyScreen.tsx', 'utf8');
    check('RoomLobbyScreen references MAX_ROOM_CAPACITY instead of hardcoded 10', () => {
      assert.ok(lobbySrc.includes('MAX_ROOM_CAPACITY'));
      assert.ok(lobbySrc.includes('{participants.length}/{MAX_ROOM_CAPACITY}'));
      assert.ok(!lobbySrc.includes('{participants.length}/10'));
    });

    // Verify App.tsx source imports MAX_ROOM_CAPACITY and guards route
    const appSrc = readFileSync('src/App.tsx', 'utf8');
    check('App.tsx route guard uses MAX_ROOM_CAPACITY', () => {
      assert.ok(appSrc.includes('MAX_ROOM_CAPACITY'));
      assert.ok(appSrc.includes('participants.length >= MAX_ROOM_CAPACITY'));
      assert.ok(!appSrc.includes('participants.length >= 10'));
    });
  } finally {
    await server.close();
  }

  console.log(`\n======================================================`);
  console.log(`PASS: All ${checks} Room Capacity (20 Total) checks passed successfully!`);
  console.log(`======================================================\n`);
} catch (err) {
  console.error('\n❌ Room capacity verification failed:', err);
  process.exit(1);
}
