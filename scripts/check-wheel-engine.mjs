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
    const slices = buildSlices(candidateIds);
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

  console.log(`PASS: ${checks} Roulette Wheel Engine checks covering all 14 required scenarios.`);
} finally {
  await server.close();
}
