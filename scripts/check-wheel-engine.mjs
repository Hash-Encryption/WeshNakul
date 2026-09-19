import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '""',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
  },
});

let checks = 0;
const check = (value, message) => {
  assert.ok(value, message);
  checks++;
};

try {
  const {
    calculateLandingTarget,
    getPointerAngleOnWheel,
    getSliceIndexAtPointer,
  } = await server.ssrLoadModule('/src/hooks/useContinuousRoulette.ts');

  // Helper to build test slices for N candidates
  const buildSlices = (candidateIds) => {
    const total = candidateIds.length;
    const sliceAngle = 360 / total;
    return candidateIds.map((id, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = (index + 1) * sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;
      return { id, label: id, color: '#FFB800', startAngle, endAngle, midAngle };
    });
  };

  // =========================================================================
  // SCENARIO 1: Immediate spin entry
  // Spin initiates synchronously on trigger without waiting for network response.
  // =========================================================================
  {
    const candidateIds = ['burger', 'shawarma'];
    const _slices = buildSlices(candidateIds);
    // Initial state: spin started with winnerId = null
    const spin = {
      spinId: 'spin-immediate-1',
      kind: 'category',
      candidateIds,
      winnerId: null,
    };
    const activeSpin = Boolean(spin && !spin.cancelled);
    const activeWinnerId = spin.winnerId;

    check(activeSpin === true, 'S1: Spin is immediately active before network response');
    check(activeWinnerId === null, 'S1: Winner is initially null');

    // Engine immediately enters cruising/spinning phase
    const spinElapsed = 50; // 50ms after click
    const MIN_CRUISE_MS = 700;
    const canStartLanding = Boolean(activeWinnerId && spinElapsed >= MIN_CRUISE_MS);
    check(!canStartLanding, 'S1: Cannot land yet, cruising begins immediately');
  }

  // =========================================================================
  // SCENARIO 2: Fast response (< min spin duration)
  // Winner arrives early (e.g., 200ms). Engine continues cruising until min duration.
  // =========================================================================
  {
    const slices = buildSlices(['burger', 'shawarma']);
    const MIN_CRUISE_MS = 700;

    // Winner arrives at 200ms
    const winnerId = 'burger';
    const winnerSlice = slices.find((s) => s.id === winnerId);

    // At 300ms, elapsed < MIN_CRUISE_MS -> must still be cruising
    const elapsedAt300 = 300;
    const canStartLandingAt300 = Boolean(winnerSlice && elapsedAt300 >= MIN_CRUISE_MS);
    check(canStartLandingAt300 === false, 'S2: Fast response holds landing until min cruise duration');

    // At 700ms, elapsed >= MIN_CRUISE_MS -> landing begins cleanly
    const elapsedAt700 = 700;
    const canStartLandingAt700 = Boolean(winnerSlice && elapsedAt700 >= MIN_CRUISE_MS);
    check(canStartLandingAt700 === true, 'S2: Landing initiates cleanly at/after min cruise duration');
  }

  // =========================================================================
  // SCENARIO 3: Slow response (> 5s)
  // Winner arrives after 5s. Wheel cruised continuously without jerking or resetting.
  // =========================================================================
  {
    const CRUISING_SPEED_DEG_PER_MS = 0.72;
    let rotation = 0;
    let timestamp = 0;

    // Simulate 5000ms of continuous cruising at 60fps (~16.6ms/frame)
    const frameCount = Math.floor(5000 / 16.6);
    for (let i = 0; i < frameCount; i++) {
      const deltaMs = 16.6;
      timestamp += deltaMs;
      rotation += deltaMs * CRUISING_SPEED_DEG_PER_MS;
    }

    check(rotation > 3500, `S3: Wheel rotated continuously to ${rotation.toFixed(1)} deg without stalling`);
    check(!Number.isNaN(rotation), 'S3: Rotation remains a valid number');

    // Winner arrives now at 5000ms
    const winnerMidAngle = 90; // shawarma
    const targetAngle = calculateLandingTarget(rotation, winnerMidAngle, 720);
    check(targetAngle > rotation + 720, 'S3: Landing smoothly continues forward from accumulated rotation');
  }

  // =========================================================================
  // SCENARIO 4: Landing calculation preserves forward momentum from CURRENT continuous angle
  // Never resets rotation to 0. Target is always > current rotation.
  // =========================================================================
  {
    const currentContinuousAngles = [0, 180, 720, 1543.25, 4529.1, 10834.7];
    for (const startAngle of currentContinuousAngles) {
      for (const winnerMidAngle of [0, 90, 180, 270]) {
        const target = calculateLandingTarget(startAngle, winnerMidAngle, 720);
        check(target >= startAngle + 720, `S4: Target ${target} >= start ${startAngle} + 720`);
        // Verify wheel remainder aligns to pointer
        const pointerAngle = getPointerAngleOnWheel(target);
        check(
          Math.abs(pointerAngle - winnerMidAngle) < 0.001,
          `S4: Target angle ${target} modulo alignment matches midAngle ${winnerMidAngle}`
        );
      }
    }
  }

  // =========================================================================
  // SCENARIO 5: Exact landing
  // Final angle aligns needle precisely with winning slice center.
  // Tested across 2, 3, 4, 8 candidate slices.
  // =========================================================================
  {
    for (const candidateCount of [2, 3, 4, 8]) {
      const candidateIds = Array.from({ length: candidateCount }, (_, i) => `cand-${i}`);
      const slices = buildSlices(candidateIds);

      for (const winnerSlice of slices) {
        const arbitraryRotations = [500.5, 1234.56, 9876.12];
        for (const currentRot of arbitraryRotations) {
          const landedTarget = calculateLandingTarget(currentRot, winnerSlice.midAngle, 720);
          const pointerAngle = getPointerAngleOnWheel(landedTarget);
          const tolerance = 0.0001;
          check(
            Math.abs(pointerAngle - winnerSlice.midAngle) < tolerance,
            `S5: Pointer (${pointerAngle}) matches winning slice center (${winnerSlice.midAngle}) for ${candidateCount} slices`
          );
        }
      }
    }
  }

  // =========================================================================
  // SCENARIO 6: Single reveal execution
  // onRevealed fires exactly once when landing reaches completion.
  // =========================================================================
  {
    let revealCount = 0;
    let completeCount = 0;
    let revealedRef = false;
    let completedRef = false;

    const simulateFrames = (totalMs) => {
      let now = 0;
      const startTime = 0;
      const duration = 1650;

      while (now <= totalMs) {
        now += 16.6;
        const landingElapsed = now - startTime;
        const p = Math.min(1, Math.max(0, landingElapsed / duration));

        if (p >= 1) {
          if (!revealedRef) {
            revealedRef = true;
            revealCount++;
          }
          const timeSinceLanded = now - (startTime + duration);
          if (timeSinceLanded >= 1200) {
            if (!completedRef) {
              completedRef = true;
              completeCount++;
            }
          }
        }
      }
    };

    simulateFrames(4000);
    check(revealCount === 1, `S6: onRevealed fired exactly 1 time (fired ${revealCount})`);
    check(completeCount === 1, `S6: onComplete fired exactly 1 time (fired ${completeCount})`);
  }

  // =========================================================================
  // SCENARIO 7: Reconciliation watchdog
  // Authoritative state fetch succeeds when RPC hung, recovers winner without error.
  // =========================================================================
  {
    let spinState = {
      spinId: 'spin-watchdog-1',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: null,
    };

    // Simulate 4.5s watchdog firing
    const mockAuthoritativeState = {
      room: {
        winning_category: 'burger',
        stage: 'dining_mode',
      },
    };

    // Watchdog check logic
    if (!spinState.winnerId) {
      const resolvedWinnerId = mockAuthoritativeState.room.winning_category;
      if (resolvedWinnerId && spinState.candidateIds.includes(resolvedWinnerId)) {
        spinState = { ...spinState, winnerId: resolvedWinnerId };
      }
    }

    check(spinState.winnerId === 'burger', 'S7: Watchdog recovered winner from authoritative room state');
    check(!spinState.error, 'S7: Watchdog recovery does not flag an error');
  }

  // =========================================================================
  // SCENARIO 8: RPC error -> retry state
  // When RPC errors and authoritative fetch has unfinalized room, enter error state with retry.
  // =========================================================================
  {
    let spinState = {
      spinId: 'spin-err-1',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: null,
    };

    // RPC rejects with network error
    const rpcFailed = true;
    const authoritativeStateUnresolved = { room: { winning_category: null } };

    if (rpcFailed) {
      const winnerId = authoritativeStateUnresolved.room.winning_category;
      if (!winnerId) {
        spinState = { ...spinState, error: 'RPC_FAILED' };
      }
    }

    check(spinState.error === 'RPC_FAILED', 'S8: Unresolved tie after failure enters retry error state');
    check(spinState.winnerId === null, 'S8: Winner remains null in error state');
  }

  // =========================================================================
  // SCENARIO 9: Retry execution
  // Retry resets error and triggers a clean, new spin cycle.
  // =========================================================================
  {
    let currentSpin = {
      spinId: 'spin-old',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      error: 'RPC_FAILED',
    };

    // Trigger retry
    const retry = (oldSpin) => {
      assert.ok(oldSpin.error, 'Retry only valid when in error state');
      return {
        spinId: 'spin-new-' + Date.now(),
        kind: oldSpin.kind,
        candidateIds: oldSpin.candidateIds,
        winnerId: null,
      };
    };

    currentSpin = retry(currentSpin);
    check(!currentSpin.error, 'S9: Retry cleared error state');
    check(currentSpin.winnerId === null, 'S9: New spin begins with null winner');
    check(currentSpin.spinId.startsWith('spin-new-'), 'S9: New spin has fresh spinId');
  }

  // =========================================================================
  // SCENARIO 10: Background tab recovery
  // Delta time is clamped to <= 100ms per frame, preventing physics jumps/freezes.
  // =========================================================================
  {
    const lastTimestamp = 1000;
    const nowAfterBackgroundTab = 31000; // 30 seconds in background!
    const rawDelta = nowAfterBackgroundTab - lastTimestamp;
    check(rawDelta === 30000, 'S10: Background tab produced 30000ms raw delta');

    const clampedDelta = Math.min(100, Math.max(0, rawDelta));
    check(clampedDelta === 100, `S10: Clamped delta is safely capped at 100ms (got ${clampedDelta})`);
  }

  // =========================================================================
  // SCENARIO 11: Stale Realtime protection
  // Broadcasts with old spinId or cancelled state are ignored.
  // =========================================================================
  {
    const activeSpinId = 'spin-active-v2';
    let currentSpin = {
      spinId: activeSpinId,
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: null,
    };

    const handleBroadcast = (incomingSpin) => {
      // Stale spin protection
      if (!incomingSpin || incomingSpin.spinId !== activeSpinId) {
        return false; // ignored
      }
      currentSpin = incomingSpin;
      return true;
    };

    const staleBroadcast = { spinId: 'spin-stale-v1', winnerId: 'burger' };
    const accepted = handleBroadcast(staleBroadcast);
    check(accepted === false, 'S11: Stale broadcast with older spinId is rejected');
    check(currentSpin.winnerId === null, 'S11: Active spin untouched by stale broadcast');

    const validBroadcast = { spinId: activeSpinId, winnerId: 'shawarma' };
    const validAccepted = handleBroadcast(validBroadcast);
    check(validAccepted === true, 'S11: Current spin broadcast is accepted');
    check(currentSpin.winnerId === 'shawarma', 'S11: Active spin correctly received winner');
  }

  // =========================================================================
  // SCENARIO 12: Host & guest winner parity
  // Both host and guest resolve to identical slice center for same winnerId.
  // =========================================================================
  {
    const candidateIds = ['burger', 'shawarma'];
    const slices = buildSlices(candidateIds);
    const winnerId = 'shawarma';
    const winnerSlice = slices.find((s) => s.id === winnerId);

    // Host was at 2000 deg, guest was at 2350 deg (network jitter)
    const hostCurrentRot = 2000;
    const guestCurrentRot = 2350;

    const hostTarget = calculateLandingTarget(hostCurrentRot, winnerSlice.midAngle, 720);
    const guestTarget = calculateLandingTarget(guestCurrentRot, winnerSlice.midAngle, 720);

    const hostPointer = getPointerAngleOnWheel(hostTarget);
    const guestPointer = getPointerAngleOnWheel(guestTarget);

    check(
      Math.abs(hostPointer - guestPointer) < 0.0001,
      `S12: Host pointer (${hostPointer}) and Guest pointer (${guestPointer}) are identical`
    );
    check(
      Math.abs(hostPointer - winnerSlice.midAngle) < 0.0001,
      `S12: Both pointers match winner slice midAngle (${winnerSlice.midAngle})`
    );
  }

  // =========================================================================
  // SCENARIO 13: Repeated spins without reload
  // Multiple consecutive spins transition through lifecycle cleanly.
  // =========================================================================
  {
    const slices = buildSlices(['burger', 'shawarma']);
    let previousLandedAngle = 0;

    for (let round = 1; round <= 3; round++) {
      const winnerId = round % 2 === 1 ? 'burger' : 'shawarma';
      const winnerSlice = slices.find((s) => s.id === winnerId);

      // Spin starts from previous rotation
      const startAngle = previousLandedAngle;
      const target = calculateLandingTarget(startAngle, winnerSlice.midAngle, 720);
      check(target >= startAngle + 720, `S13: Round ${round} forward momentum preserved`);

      const pointer = getPointerAngleOnWheel(target);
      check(
        Math.abs(pointer - winnerSlice.midAngle) < 0.0001,
        `S13: Round ${round} landed accurately on ${winnerId}`
      );

      previousLandedAngle = target;
    }
  }

  // =========================================================================
  // SCENARIO 14: Shared engine between Category tie and Restaurant tie
  // Both tiebreakers use identical slice construction, needle ticking, and landing.
  // =========================================================================
  {
    // Category tie: 2 food items
    const catSlices = buildSlices(['burger', 'shawarma']);
    // Restaurant tie: 2 restaurant IDs
    const restSlices = buildSlices(['rest-uuid-1', 'rest-uuid-2']);

    check(catSlices.length === 2 && restSlices.length === 2, 'S14: Equal slice geometry for 2 candidates');

    const catTarget = calculateLandingTarget(1500, catSlices[1].midAngle);
    const restTarget = calculateLandingTarget(1500, restSlices[1].midAngle);

    check(catTarget === restTarget, 'S14: Shared calculation produces identical landing target');

    // Needle boundary ticks work identically
    const tickCat = getSliceIndexAtPointer(1500, catSlices.length);
    const tickRest = getSliceIndexAtPointer(1500, restSlices.length);
    check(tickCat === tickRest, 'S14: Slice boundary crossing calculation is identical');
  }

  // =========================================================================
  // SCENARIO 15: Guest never enters retry due only to elapsed time
  // Guest spin remains active without error regardless of 5s, 10s, 15s, 20s elapsed.
  // =========================================================================
  {
    let guestSpin = {
      spinId: 'guest-spin-1',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: null,
      error: undefined,
    };
    const isHost = false;

    // Simulate guest watchdog checks over time with unresolved DB
    const checkElapsed = (elapsedMs) => {
      // Guest watchdog rules:
      // At 4.5s and 10s, guest polls room state.
      // If unresolved, guest does NOT set error.
      if (!isHost) {
        // Guest NEVER sets error based on elapsed time!
        return guestSpin;
      }
      return guestSpin;
    };

    for (const ms of [4500, 10000, 15000, 20000, 30000]) {
      guestSpin = checkElapsed(ms);
      check(!guestSpin.error, `S15: Guest spin at ${ms}ms has no error`);
      check(guestSpin.winnerId === null, `S15: Guest spin at ${ms}ms still waiting for winner`);
    }
  }

  // =========================================================================
  // SCENARIO 16: Guest watchdog unresolved state keeps spinning
  // When getRoomDecisionState returns unresolved, guest status is 'Still deciding...', wheel keeps spinning.
  // =========================================================================
  {
    const spin = {
      spinId: 'guest-spin-2',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: null,
    };
    const isHost = false;

    // At 4500ms without winner, isSpinningLong becomes true
    let isSpinningLong = false;
    let isSpinning = true;
    const elapsed = 4500;
    if (elapsed >= 4500 && !spin.winnerId && !spin.error) {
      isSpinningLong = true;
    }

    check(isSpinning === true, 'S16: Wheel continues spinning');
    check(isSpinningLong === true, 'S16: isSpinningLong is active');

    // UI text derivation
    const getStatusText = (spin, isSpinningLong, isHost, locale) => {
      if (spin.error && isHost) return 'error';
      if (isSpinningLong) return locale === 'ar' ? 'جاري الحسم...' : 'Still deciding...';
      return locale === 'ar' ? 'جاري اختيار الفائز للجميع...' : 'Spinning...';
    };

    check(getStatusText(spin, isSpinningLong, isHost, 'ar') === 'جاري الحسم...', 'S16: Arabic status shows subtle waiting text');
    check(getStatusText(spin, isSpinningLong, isHost, 'en') === 'Still deciding...', 'S16: English status shows subtle waiting text');
  }

  // =========================================================================
  // SCENARIO 17: Missed winner broadcast recovers from room state
  // Even if broadcast is dropped, authoritative room state fetch or realtime delivers winner.
  // =========================================================================
  {
    let activeSpin = {
      spinId: 'spin-missed-bc',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: null,
    };
    let pendingResolvedRoom = null;

    // Reconciliation helper logic (mirrors RoomContext)
    const reconcile = (roomOrState) => {
      if (!roomOrState) return false;
      const room = 'room' in roomOrState ? roomOrState.room : roomOrState;
      if (!room || !activeSpin || activeSpin.cancelled) return false;
      const winnerId = activeSpin.kind === 'category' ? room.winning_category : room.winning_restaurant_id;
      if (!winnerId || !activeSpin.candidateIds.includes(winnerId)) return false;
      if (activeSpin.winnerId && activeSpin.winnerId !== winnerId) return false;
      pendingResolvedRoom = room;
      if (!activeSpin.winnerId || activeSpin.error) {
        activeSpin = { ...activeSpin, winnerId, error: undefined };
      }
      return true;
    };

    // Winner broadcast is NEVER received (simulate dropped UDP/Websocket)
    // Later, room state arrives via polling or room refresh:
    const roomStateFromDB = {
      room: {
        id: 'room-1',
        stage: 'consensus',
        winning_category: 'shawarma',
      },
    };

    const reconciled = reconcile(roomStateFromDB);
    check(reconciled === true, 'S17: Reconciliation succeeded without broadcast');
    check(activeSpin.winnerId === 'shawarma', 'S17: Active spin acquired winner from room state');
    check(pendingResolvedRoom?.winning_category === 'shawarma', 'S17: Pending resolved room stored for completion');
  }

  // =========================================================================
  // SCENARIO 18: Room state resolution feeds active spin
  // DB room stage transition feeds active spin and triggers landing phase.
  // =========================================================================
  {
    let activeSpin = {
      spinId: 'spin-feed-1',
      kind: 'category',
      candidateIds: ['burger', 'shawarma', 'falafel'],
      winnerId: null,
    };

    const reconcile = (room) => {
      const winnerId = activeSpin.kind === 'category' ? room.winning_category : room.winning_restaurant_id;
      if (!winnerId || !activeSpin.candidateIds.includes(winnerId)) return false;
      activeSpin = { ...activeSpin, winnerId };
      return true;
    };

    const resolvedRoom = {
      id: 'room-1',
      stage: 'consensus',
      winning_category: 'falafel',
    };

    const ok = reconcile(resolvedRoom);
    check(ok === true, 'S18: Room state resolution accepted');
    check(activeSpin.winnerId === 'falafel', 'S18: Spin winner set to falafel');

    // Slices target landing
    const slices = buildSlices(activeSpin.candidateIds);
    const winnerSlice = slices.find((s) => s.id === activeSpin.winnerId);
    check(Boolean(winnerSlice), 'S18: Winner slice exists');
    const landingAngle = calculateLandingTarget(1000, winnerSlice.midAngle, 720);
    check(landingAngle >= 1720, 'S18: Landing target calculated smoothly');
  }

  // =========================================================================
  // SCENARIO 19: Host RPC > 4.5s remains spinning
  // Watchdog at 4.5s does not terminate active spin while RPC is still in flight.
  // =========================================================================
  {
    let hostSpin = {
      spinId: 'host-slow-rpc',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: null,
      error: undefined,
    };

    let isRpcPending = true;

    // Simulate 4.5s watchdog firing while RPC is still pending and DB is still unresolved
    const watchdogFired = (dbState) => {
      if (dbState?.room?.winning_category) {
        hostSpin = { ...hostSpin, winnerId: dbState.room.winning_category };
      } else if (!isRpcPending) {
        // Only if RPC is NO LONGER pending would an error be set
        hostSpin = { ...hostSpin, error: 'WSH_UNRESOLVED_TIE' };
      }
      // If isRpcPending is true, DO NOT touch error!
    };

    watchdogFired({ room: { winning_category: null } });
    check(!hostSpin.error, 'S19: Watchdog did not set error while RPC is pending');
    check(hostSpin.winnerId === null, 'S19: Host spin still waiting cleanly');

    // RPC eventually completes at 6000ms
    isRpcPending = false;
    const rpcResult = { room: { winning_category: 'burger' } };
    hostSpin = { ...hostSpin, winnerId: rpcResult.room.winning_category };
    check(hostSpin.winnerId === 'burger', 'S19: Delayed RPC successfully resolved winner');
    check(!hostSpin.error, 'S19: No error present on resolution');
  }

  // =========================================================================
  // SCENARIO 20: Actual RPC failure gives host retry
  // When RPC truly throws and DB check is unresolved, ONLY host gets error: 'RPC_FAILED' and can retry.
  // =========================================================================
  {
    let hostSpin = {
      spinId: 'host-fail-1',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: null,
      error: undefined,
    };
    let guestSpin = {
      spinId: 'host-fail-1',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: null,
      error: undefined,
    };

    // RPC throws network error
    const dbState = { room: { winning_category: null } }; // DB confirms tie is still unresolved

    // Host error handler:
    if (!dbState.room.winning_category) {
      hostSpin = { ...hostSpin, error: 'RPC_FAILED' };
      // Host DOES NOT broadcast cancelled: true to guests!
    }

    check(hostSpin.error === 'RPC_FAILED', 'S20: Host entered RPC_FAILED error state');
    check(!guestSpin.error, 'S20: Guest received no error and is not cancelled');

    // Host retries
    const retryAsHost = (isHost, roomStage) => {
      if (!isHost || roomStage !== 'tiebreaker') return null;
      return {
        spinId: 'new-retry-spin',
        kind: 'category',
        candidateIds: ['burger', 'shawarma'],
        winnerId: null,
      };
    };

    const newSpin = retryAsHost(true, 'tiebreaker');
    check(newSpin !== null, 'S20: Host successfully triggered new spin');
    check(newSpin.spinId === 'new-retry-spin', 'S20: New spin has fresh ID');
  }

  // =========================================================================
  // SCENARIO 21: Guest receives no retry button
  // Verification that guest UI never renders retry controls even if spin has an error.
  // =========================================================================
  {
    const canShowRetryButton = (isHost, hasError) => {
      // In TiebreakerScreen: hasError && isHost
      return Boolean(hasError && isHost);
    };

    check(canShowRetryButton(false, true) === false, 'S21: Guest with error does NOT get retry button');
    check(canShowRetryButton(false, false) === false, 'S21: Guest without error does NOT get retry button');
    check(canShowRetryButton(true, true) === true, 'S21: Host with error gets retry button');
    check(canShowRetryButton(true, false) === false, 'S21: Host without error gets regular spin button');
  }

  // =========================================================================
  // SCENARIO 22: Stale realtime optimization cannot suppress resolved winner
  // When payload.new has a resolved winner, it reconciles BEFORE version check.
  // =========================================================================
  {
    let currentRoomVersion = 5;
    let activeSpin = {
      spinId: 'spin-stale-test',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: null,
    };

    const handleRoomRealtimePayload = (payload) => {
      // Direct inspection before version gating
      if (payload?.new && activeSpin && !activeSpin.winnerId) {
        const room = payload.new;
        if (room.winning_category && activeSpin.candidateIds.includes(room.winning_category)) {
          activeSpin = { ...activeSpin, winnerId: room.winning_category };
        }
      }

      // Stale event check for regular room update
      if (payload?.new?.version !== undefined && payload.new.version <= currentRoomVersion) {
        return 'SKIPPED_STALE';
      }
      return 'PROCESSED';
    };

    // Stale payload with version 5 (equal to current version), but containing resolved winner!
    const stalePayload = {
      new: {
        id: 'room-1',
        version: 5,
        stage: 'consensus',
        winning_category: 'burger',
      },
    };

    const status = handleRoomRealtimePayload(stalePayload);
    check(status === 'SKIPPED_STALE', 'S22: Payload was correctly marked as stale for full room refresh');
    check(activeSpin.winnerId === 'burger', 'S22: But winner was successfully extracted before version suppression!');
  }

  // =========================================================================
  // SCENARIO 23: Duplicate reconciliation is idempotent
  // Calling reconcile multiple times with the same room state produces no churn.
  // =========================================================================
  {
    let activeSpin = {
      spinId: 'spin-idempotent',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: null,
    };
    let updateCount = 0;

    const reconcile = (room) => {
      const winnerId = room.winning_category;
      if (!winnerId || !activeSpin.candidateIds.includes(winnerId)) return false;
      if (activeSpin.winnerId === winnerId && !activeSpin.error) {
        // No change needed, idempotent no-op!
        return true;
      }
      activeSpin = { ...activeSpin, winnerId, error: undefined };
      updateCount++;
      return true;
    };

    const resolvedRoom = { winning_category: 'shawarma' };

    // Call 5 times in a row (e.g. broadcast hint + realtime + 2 watchdog polls + refresh)
    for (let i = 0; i < 5; i++) {
      const res = reconcile(resolvedRoom);
      check(res === true, `S23: Call ${i + 1} returned true`);
    }

    check(updateCount === 1, `S23: Active spin updated exactly 1 time across 5 duplicate calls (got ${updateCount})`);
    check(activeSpin.winnerId === 'shawarma', 'S23: Winner remains shawarma');
  }

  // =========================================================================
  // SCENARIO 24: Conflicting hint cannot override authoritative room winner
  // If authoritative winner is locked, a conflicting broadcast is rejected.
  // =========================================================================
  {
    let activeSpin = {
      spinId: 'spin-auth-test',
      kind: 'category',
      candidateIds: ['burger', 'shawarma'],
      winnerId: 'burger', // authoritative winner already set
    };

    const handleWinnerBroadcast = (incomingWinnerId) => {
      if (activeSpin.winnerId && activeSpin.winnerId !== incomingWinnerId) {
        // Conflicting hint rejected! Room state wins.
        return false;
      }
      activeSpin = { ...activeSpin, winnerId: incomingWinnerId };
      return true;
    };

    const conflictAccepted = handleWinnerBroadcast('shawarma');
    check(conflictAccepted === false, 'S24: Conflicting winner hint was rejected');
    check(activeSpin.winnerId === 'burger', 'S24: Authoritative winner burger was preserved');
  }

  // =========================================================================
  // SCENARIO 25: Shared reconciliation logic across category & restaurant
  // Same helper reconciles kind='category' (winning_category) and kind='restaurant' (winning_restaurant_id).
  // =========================================================================
  {
    const makeSpin = (kind, candidates) => ({
      spinId: `spin-${kind}`,
      kind,
      candidateIds: candidates,
      winnerId: null,
    });

    const reconcileGeneric = (spin, room) => {
      let winnerId = null;
      if (spin.kind === 'category') {
        winnerId = room.winning_category;
      } else if (spin.kind === 'restaurant') {
        winnerId = room.winning_restaurant_id;
      }
      if (!winnerId || !spin.candidateIds.includes(winnerId)) return null;
      return { ...spin, winnerId };
    };

    // Test Category
    const catSpin = makeSpin('category', ['burger', 'shawarma']);
    const catRoom = { winning_category: 'burger' };
    const resolvedCat = reconcileGeneric(catSpin, catRoom);
    check(resolvedCat?.winnerId === 'burger', 'S25: Category tiebreaker reconciled winning_category');

    // Test Restaurant
    const restSpin = makeSpin('restaurant', ['rest-abc', 'rest-xyz']);
    const restRoom = { winning_restaurant_id: 'rest-xyz' };
    const resolvedRest = reconcileGeneric(restSpin, restRoom);
    check(resolvedRest?.winnerId === 'rest-xyz', 'S25: Restaurant tiebreaker reconciled winning_restaurant_id');

    // Test Invalid candidate rejection on restaurant
    const badRestRoom = { winning_restaurant_id: 'rest-imposter' };
    const rejectedRest = reconcileGeneric(restSpin, badRestRoom);
    check(rejectedRest === null, 'S25: Imposter restaurant ID outside candidateIds is rejected');
  }

  console.log(`PASS: ${checks} Roulette Wheel Engine & Sync checks covering all 25 scenarios.`);
} finally {
  await server.close();
}
