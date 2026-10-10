import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

console.log('--- EXECUTING REAL REMOTE SUPABASE CAPTAIN ROULETTE INTEGRATION SUITE ---');

const SUPABASE_URL = 'https://apsfxnmzfllraoctbwyq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_P2K0kEJqVuKxiGh-BxSRQg_xgtRoDrz';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let checks = 0;
const check = (desc, fn) => {
  try {
    fn();
    checks++;
    console.log(`  ✓ ${desc}`);
  } catch (err) {
    console.error(`  ✗ FAILED: "${desc}"`);
    throw err;
  }
};

let room1 = null;
let room2 = null;
let hostToken1 = null;
let guestToken1 = null;
let voterToken1 = null;
let hostPart1 = null;
let guestPart1 = null;
let voterPart1 = null;

const stableAlice = `test-stable-alice-${Date.now()}`;
const stableBob = `test-stable-bob-${Date.now()}`;
const stableCharlie = `test-stable-charlie-${Date.now()}`;

try {
  // Helper to generate a random 4-letter room code
  const randomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const code1 = randomCode();
  hostToken1 = `host-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  console.log(`\n1. Creating isolated test room on remote Supabase (code: ${code1})...`);
  const createRes = await supabase.rpc('create_room_authorized', {
    p_code: code1,
    p_session_token: hostToken1,
    p_eating_mode: 'delivery',
    p_city: 'riyadh',
    p_neighborhood: null,
    p_language: 'ar',
    p_nickname: 'Alice',
    p_latitude: null,
    p_longitude: null,
    p_stable_player_id: stableAlice,
  });

  if (createRes.error) {
    throw new Error(`Failed to create remote test room: ${createRes.error.message}`);
  }

  room1 = createRes.data.room;
  hostPart1 = createRes.data.participant;
  assert.ok(room1?.id, 'Remote room created');
  assert.ok(hostPart1?.id, 'Host participant created');
  console.log(`  ✓ Remote test room created: ${room1.id}`);

  // 1.b Testing 1 active player is rejected on remote Supabase
  const soloRes = await supabase.rpc('start_captain_selection', {
    p_room_id: room1.id,
    p_session_token: hostToken1,
    p_stable_id: stableAlice,
  });
  check('1.b Single active player is strictly rejected with WSH_INSUFFICIENT_ACTIVE_PLAYERS', () => {
    assert.ok(soloRes.error, 'Single player must return error');
    assert.ok(soloRes.error.message.includes('WSH_INSUFFICIENT_ACTIVE_PLAYERS'), 'Expected WSH_INSUFFICIENT_ACTIVE_PLAYERS');
  });

  // Guest Bob joins room 1 (now 2 active players)
  guestToken1 = `guest-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const joinResBob = await supabase.rpc('join_room_authorized', {
    p_code: code1,
    p_session_token: guestToken1,
    p_nickname: 'Bob',
    p_stable_player_id: stableBob,
  });
  if (joinResBob.error) throw new Error(`Bob join failed: ${joinResBob.error.message}`);
  guestPart1 = joinResBob.data.participant;

  // 1.c Testing 2 active players succeeds, finalizes immediately, and rejects reroll
  const duoRes = await supabase.rpc('start_captain_selection', {
    p_room_id: room1.id,
    p_session_token: hostToken1,
    p_stable_id: stableAlice,
  });
  if (duoRes.error) throw new Error(`Two-player start failed: ${duoRes.error.message}`);
  check('1.c Exactly 2 active players succeeds and immediately finalizes', () => {
    assert.equal(duoRes.data.status, 'finalized', '2-player event must be finalized');
    assert.ok(duoRes.data.finalCaptainId, 'Final captain selected');
    assert.equal(duoRes.data.objectionEndsAt, null, 'No objection window for 2 players');
  });

  // Attempting reroll with 2 players is rejected
  const duoReroll = await supabase.rpc('request_captain_reroll', {
    p_room_id: room1.id,
    p_event_id: duoRes.data.eventId,
    p_session_token: guestToken1,
  });
  check('1.d Reroll is strictly rejected for 2-player finalized event', () => {
    assert.ok(duoReroll.error, 'Reroll on 2 players must fail');
  });

  // Voter Charlie joins room 1 (now 3 active players)
  voterToken1 = `voter-session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const joinResCharlie = await supabase.rpc('join_room_authorized', {
    p_code: code1,
    p_session_token: voterToken1,
    p_nickname: 'Charlie',
    p_stable_player_id: stableCharlie,
  });
  if (joinResCharlie.error) throw new Error(`Charlie join failed: ${joinResCharlie.error.message}`);
  voterPart1 = joinResCharlie.data.participant;

  console.log('\n2. Testing start_captain_selection with 3 active players on remote Supabase:');
  const startRes = await supabase.rpc('start_captain_selection', {
    p_room_id: room1.id,
    p_session_token: hostToken1,
    p_stable_id: stableAlice,
  });

  if (startRes.error) throw new Error(`start_captain_selection failed: ${startRes.error.message}`);
  const eventData = startRes.data;

  check('2.1 Initial selection generates provisional captain and objection window', () => {
    assert.ok(eventData.eventId, 'Event ID generated');
    assert.equal(eventData.status, 'initial_result_provisional');
    assert.ok(eventData.provisionalCaptainId, 'Provisional captain chosen');
    assert.equal(eventData.frozenVoterIds.length, 3, 'All 3 active participants included');
    assert.ok(eventData.objectionEndsAt, 'Objection deadline timestamp returned');
    assert.ok(new Date(eventData.objectionEndsAt).getTime() > Date.now(), 'Deadline is in the future');
  });

  check('2.2 Candidate initials are clean letters without emojis', () => {
    assert.equal(eventData.candidates.length, 3);
    for (const c of eventData.candidates) {
      assert.ok(c.initial && c.initial.length === 1, `Candidate ${c.nickname} has single-letter initial`);
      assert.ok(!c.initial.includes('👑') && !c.initial.includes('🎲'), 'Initial has no emojis');
    }
  });

  console.log('\n3. Testing get_captain_event_state across connected participants:');
  const bobState = await supabase.rpc('get_captain_event_state', {
    p_room_id: room1.id,
    p_session_token: guestToken1,
  });
  const charlieState = await supabase.rpc('get_captain_event_state', {
    p_room_id: room1.id,
    p_session_token: voterToken1,
  });

  check('3.1 All participants retrieve identical server-authoritative event state', () => {
    assert.equal(bobState.data.eventId, eventData.eventId);
    assert.equal(charlieState.data.eventId, eventData.eventId);
    assert.equal(bobState.data.provisionalCaptainId, eventData.provisionalCaptainId);
    assert.equal(charlieState.data.provisionalCaptainId, eventData.provisionalCaptainId);
  });

  console.log('\n4. Testing objection deadline enforcement (premature resolution blocked):');
  const prematureResolve = await supabase.rpc('resolve_captain_event', {
    p_room_id: room1.id,
    p_event_id: eventData.eventId,
    p_session_token: hostToken1,
  });

  check('4.1 Premature resolution call before objection deadline does not finalize', () => {
    assert.notEqual(prematureResolve.data.status, 'finalized');
    assert.equal(prematureResolve.data.message, 'OBJECTION_WINDOW_ACTIVE');
  });

  console.log('\n5. Testing reroll request and strict single-reroll rule:');
  const rerollRes = await supabase.rpc('request_captain_reroll', {
    p_room_id: room1.id,
    p_event_id: eventData.eventId,
    p_session_token: guestToken1,
  });

  if (rerollRes.error) throw new Error(`request_captain_reroll failed: ${rerollRes.error.message}`);

  check('5.1 Valid reroll opens voting and auto-casts 1 approval for requester', () => {
    assert.equal(rerollRes.data.status, 'reroll_vote_open');
    assert.equal(rerollRes.data.requesterParticipantId, guestPart1.id);
    assert.equal(rerollRes.data.votes[guestPart1.id], 'approve');
    assert.equal(rerollRes.data.requiredApprovals, 2, 'For N=3, threshold is 2');
    assert.equal(rerollRes.data.hasRerolled, true);
  });

  // Second reroll request must be rejected
  const secondReroll = await supabase.rpc('request_captain_reroll', {
    p_room_id: room1.id,
    p_event_id: eventData.eventId,
    p_session_token: voterToken1,
  });

  check('5.2 Second reroll request is strictly rejected by server', () => {
    assert.ok(secondReroll.error, 'Second reroll must return error');
    assert.ok(
      secondReroll.error.message.includes('WSH_REROLL_ALREADY_USED') ||
      secondReroll.error.message.includes('WSH_INVALID_EVENT_STAGE')
    );
  });

  console.log('\n6. Testing voting window, duplicate voting, and majority approval:');
  // Premature resolve during voting window must be blocked
  const prematureVoteResolve = await supabase.rpc('resolve_captain_event', {
    p_room_id: room1.id,
    p_event_id: eventData.eventId,
    p_session_token: hostToken1,
  });
  check('6.1 Premature resolve during active voting window does not finalize', () => {
    assert.notEqual(prematureVoteResolve.data.status, 'finalized');
    assert.equal(prematureVoteResolve.data.message, 'VOTING_WINDOW_ACTIVE');
  });

  // Guest attempts to vote again (duplicate)
  const dupVote = await supabase.rpc('cast_captain_vote', {
    p_room_id: room1.id,
    p_event_id: eventData.eventId,
    p_session_token: guestToken1,
    p_vote: 'reject',
  });
  check('6.2 Duplicate vote from same participant rejected', () => {
    assert.ok(dupVote.error, 'Duplicate vote must return error');
    assert.ok(dupVote.error.message.includes('WSH_ALREADY_VOTED'));
  });

  // Host votes Approve -> meets strict majority threshold 2 for N=3 -> triggers approved 2nd draw
  const hostVote = await supabase.rpc('cast_captain_vote', {
    p_room_id: room1.id,
    p_event_id: eventData.eventId,
    p_session_token: hostToken1,
    p_vote: 'approve',
  });

  if (hostVote.error) throw new Error(`Host vote failed: ${hostVote.error.message}`);

  check('6.3 Majority approval triggers 2nd draw strictly excluding provisional captain', () => {
    assert.equal(hostVote.data.status, 'finalized');
    assert.equal(hostVote.data.finalDecision, 'approved');
    assert.ok(hostVote.data.finalCaptainId);
    assert.notEqual(
      hostVote.data.finalCaptainId,
      eventData.provisionalCaptainId,
      'Provisional captain strictly excluded from 2nd draw'
    );
  });

  const finalCaptainId = hostVote.data.finalCaptainId;

  console.log('\n7. Testing client reconnect and idempotent recovery:');
  const reconnectState = await supabase.rpc('get_captain_event_state', {
    p_room_id: room1.id,
    p_session_token: voterToken1,
  });
  check('7.1 Reconnecting client retrieves finalized winner and decision', () => {
    assert.equal(reconnectState.data.status, 'finalized');
    assert.equal(reconnectState.data.finalCaptainId, finalCaptainId);
    assert.equal(reconnectState.data.hasRerolled, true);
  });

  console.log('\n8. Testing security boundary (unauthorized tokens & non-members):');
  const fakeToken = 'attacker-unauthorized-session-token-999';

  const unauthGet = await supabase.rpc('get_captain_event_state', {
    p_room_id: room1.id,
    p_session_token: fakeToken,
  });
  check('8.1 get_captain_event_state rejects forged token', () => {
    assert.ok(unauthGet.error && unauthGet.error.message.includes('WSH_UNAUTHORIZED'));
  });

  const unauthStart = await supabase.rpc('start_captain_selection', {
    p_room_id: room1.id,
    p_session_token: fakeToken,
  });
  check('8.2 start_captain_selection rejects forged token', () => {
    assert.ok(unauthStart.error && unauthStart.error.message.includes('WSH_UNAUTHORIZED'));
  });

  const unauthReroll = await supabase.rpc('request_captain_reroll', {
    p_room_id: room1.id,
    p_event_id: eventData.eventId,
    p_session_token: fakeToken,
  });
  check('8.3 request_captain_reroll rejects forged token', () => {
    assert.ok(unauthReroll.error && unauthReroll.error.message.includes('WSH_UNAUTHORIZED'));
  });

  const unauthVote = await supabase.rpc('cast_captain_vote', {
    p_room_id: room1.id,
    p_event_id: eventData.eventId,
    p_session_token: fakeToken,
    p_vote: 'approve',
  });
  check('8.4 cast_captain_vote rejects forged token', () => {
    assert.ok(unauthVote.error && unauthVote.error.message.includes('WSH_UNAUTHORIZED'));
  });

  const unauthResolve = await supabase.rpc('resolve_captain_event', {
    p_room_id: room1.id,
    p_event_id: eventData.eventId,
    p_session_token: fakeToken,
  });
  check('8.5 resolve_captain_event rejects forged token', () => {
    assert.ok(unauthResolve.error && unauthResolve.error.message.includes('WSH_UNAUTHORIZED'));
  });

  console.log('\n9. Testing fresh round creation after finalization:');
  const freshStart = await supabase.rpc('start_captain_selection', {
    p_room_id: room1.id,
    p_session_token: hostToken1,
  });
  if (freshStart.error) throw new Error(`Fresh start failed: ${freshStart.error.message}`);
  check('9.1 Starting selection after finalized round creates fresh event with new ID', () => {
    assert.ok(freshStart.data.eventId);
    assert.notEqual(freshStart.data.eventId, eventData.eventId, 'New event has distinct ID');
    assert.equal(freshStart.data.status, 'initial_result_provisional');
    assert.equal(freshStart.data.hasRerolled, false);
  });

  console.log('\n10. Testing cross-room history tracking and weight decay:');
  // Determine winner from room 1 (Alice, Bob, or Charlie)
  const winnerPartId = finalCaptainId;
  let winnerStable = null;
  let winnerNickname = null;
  if (winnerPartId === hostPart1.id) {
    winnerStable = stableAlice;
    winnerNickname = 'Alice';
  } else if (winnerPartId === guestPart1.id) {
    winnerStable = stableBob;
    winnerNickname = 'Bob';
  } else {
    winnerStable = stableCharlie;
    winnerNickname = 'Charlie';
  }

  // Create Room 2 where the winner enters with a completely different session token but same stable_player_id
  const code2 = randomCode();
  const room2HostToken = `room2-host-${Date.now()}`;
  const createRoom2 = await supabase.rpc('create_room_authorized', {
    p_code: code2,
    p_session_token: room2HostToken,
    p_eating_mode: 'delivery',
    p_city: 'jeddah',
    p_neighborhood: null,
    p_language: 'ar',
    p_nickname: 'HostTwo',
    p_latitude: null,
    p_longitude: null,
    p_stable_player_id: `host-two-${Date.now()}`,
  });
  if (createRoom2.error) throw new Error(`Room 2 create failed: ${createRoom2.error.message}`);
  room2 = createRoom2.data.room;

  // Winner joins Room 2 with a new session token, but the SAME stable identity
  const winnerTokenRoom2 = `winner-room2-session-${Date.now()}`;
  const winnerJoinRoom2 = await supabase.rpc('join_room_authorized', {
    p_code: code2,
    p_session_token: winnerTokenRoom2,
    p_nickname: winnerNickname,
    p_stable_player_id: winnerStable,
  });
  if (winnerJoinRoom2.error) throw new Error(`Winner join Room 2 failed: ${winnerJoinRoom2.error.message}`);

  // Another player named same nickname with DIFFERENT stable ID joins Room 2
  const cloneTokenRoom2 = `clone-room2-session-${Date.now()}`;
  const cloneJoinRoom2 = await supabase.rpc('join_room_authorized', {
    p_code: code2,
    p_session_token: cloneTokenRoom2,
    p_nickname: winnerNickname,
    p_stable_player_id: `different-stable-id-${Date.now()}`,
  });
  if (cloneJoinRoom2.error) throw new Error(`Clone join Room 2 failed: ${cloneJoinRoom2.error.message}`);

  // Start captain selection in Room 2
  const startRoom2 = await supabase.rpc('start_captain_selection', {
    p_room_id: room2.id,
    p_session_token: room2HostToken,
  });
  if (startRoom2.error) throw new Error(`Room 2 selection failed: ${startRoom2.error.message}`);

  const candidatesRoom2 = startRoom2.data.candidates;
  const candWinner = candidatesRoom2.find(c => c.id === winnerJoinRoom2.data.participant.id);
  const candClone = candidatesRoom2.find(c => c.id === cloneJoinRoom2.data.participant.id);

  check('10.1 Winner carries decayed weight (~20.0) into new room via stable identity', () => {
    assert.ok(candWinner, 'Winner is a candidate in Room 2');
    assert.ok(
      Math.abs(Number(candWinner.weight) - 20.0) < 0.1,
      `Expected weight ~20.0 for recent winner, got ${candWinner.weight}`
    );
  });

  check('10.2 Player with same nickname but different stable identity retains fresh weight 100.0', () => {
    assert.ok(candClone, 'Clone is a candidate in Room 2');
    assert.equal(Number(candClone.weight), 100.0, `Expected fresh weight 100.0, got ${candClone.weight}`);
  });

  console.log('\n=================================================================');
  console.log(`ALL ${checks} REAL REMOTE SUPABASE INTEGRATION CHECKS PASSED!`);
  console.log('=================================================================\n');
} catch (error) {
  console.error('\nREMOTE SUPABASE INTEGRATION TEST FAILED:', error);
  process.exitCode = 1;
} finally {
  console.log('11. Cleaning up isolated test rooms from remote Supabase...');
  if (room1?.id && hostToken1) {
    try {
      await supabase.rpc('delete_room_authorized', { p_room_id: room1.id, p_session_token: hostToken1 });
      console.log(`  ✓ Cleaned up test room 1: ${room1.id}`);
    } catch (e) {
      console.warn('Failed to clean up room 1', e);
    }
  }
  if (room2?.id) {
    try {
      const room2HostToken = `room2-host-${Date.now()}`;
      await supabase.rpc('delete_room_authorized', { p_room_id: room2.id, p_session_token: room2HostToken });
      console.log(`  ✓ Cleaned up test room 2: ${room2.id}`);
    } catch {}
  }
}
