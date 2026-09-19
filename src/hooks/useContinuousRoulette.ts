import { useEffect, useRef, useState } from 'react';
import type { DecisionSpin } from '../types/roulette';
import type { ArcadeWheelSlice } from '../components/common/ArcadeWheel';

export type RoulettePhase = 'idle' | 'spinning' | 'landing' | 'revealed' | 'complete';

export function getPointerAngleOnWheel(rotation: number): number {
  return ((360 - (rotation % 360)) % 360 + 360) % 360;
}

export function calculateLandingTarget(startAngle: number, winnerMidAngle: number, minDistance = 720): number {
  const targetRemainder = ((360 - winnerMidAngle) % 360 + 360) % 360;
  const candidate = startAngle + minDistance;
  let currentRem = candidate % 360;
  if (currentRem < 0) currentRem += 360;
  let diff = targetRemainder - currentRem;
  if (diff < 0) diff += 360;
  return candidate + diff;
}

export function getSliceIndexAtPointer(rotation: number, sliceCount: number): number {
  if (sliceCount <= 0) return 0;
  const sliceSpan = 360 / sliceCount;
  const pointerAngle = getPointerAngleOnWheel(rotation);
  return Math.floor(pointerAngle / sliceSpan) % sliceCount;
}

export interface UseContinuousRouletteProps {
  slices: ArcadeWheelSlice[];
  isSpinning?: boolean;
  spin?: DecisionSpin | null;
  winnerId?: string | null;
  reducedMotion?: boolean;
  onRevealed?: (winnerId: string) => void;
  onComplete?: (winnerId: string) => void;
}

export function useContinuousRoulette({
  slices,
  isSpinning: explicitSpinning,
  spin,
  winnerId: explicitWinnerId,
  reducedMotion = false,
  onRevealed,
  onComplete,
}: UseContinuousRouletteProps) {
  const [phase, setPhase] = useState<RoulettePhase>('idle');

  // Authoritative inputs derived from explicit props or legacy spin object
  const activeSpin = explicitSpinning ?? Boolean(spin && !spin.cancelled);
  const activeWinnerId = explicitWinnerId ?? (spin?.winnerId || null);

  const wheelRef = useRef<SVGGElement | null>(null);
  const needleRef = useRef<SVGGElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const phaseRef = useRef<RoulettePhase>('idle');
  const rotationRef = useRef(0);
  const needleAngleRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);
  const spinStartTimeRef = useRef<number | null>(null);
  const lastSliceIndexRef = useRef<number | null>(null);
  const revealedRef = useRef(false);
  const completedRef = useRef(false);

  const landingRef = useRef<{
    active: boolean;
    startTime: number;
    startAngle: number;
    targetAngle: number;
    duration: number;
  } | null>(null);

  const callbacksRef = useRef({ onRevealed, onComplete });
  useEffect(() => {
    callbacksRef.current = { onRevealed, onComplete };
  }, [onRevealed, onComplete]);

  // Keep phaseRef in sync with state
  const updatePhase = (newPhase: RoulettePhase) => {
    if (phaseRef.current !== newPhase) {
      phaseRef.current = newPhase;
      setPhase(newPhase);
    }
  };

  useEffect(() => {
    // IDLE: No active spin
    if (!activeSpin) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimestampRef.current = null;
      spinStartTimeRef.current = null;
      landingRef.current = null;
      lastSliceIndexRef.current = null;
      revealedRef.current = false;
      completedRef.current = false;
      needleAngleRef.current = 0;
      if (needleRef.current) {
        needleRef.current.style.transform = 'rotate(0deg)';
      }
      updatePhase('idle');
      return;
    }

    // REDUCED MOTION: Instant or gentle resolve without continuous rotation
    if (reducedMotion) {
      if (activeWinnerId) {
        const slice = slices.find((s) => s.id === activeWinnerId);
        const target = slice ? ((360 - slice.midAngle) % 360 + 360) % 360 : 0;
        rotationRef.current = target;
        if (wheelRef.current) {
          wheelRef.current.style.transform = `rotate(${target}deg)`;
        }
        if (!revealedRef.current) {
          revealedRef.current = true;
          updatePhase('revealed');
          callbacksRef.current.onRevealed?.(activeWinnerId);
        }
        const timer = window.setTimeout(() => {
          if (!completedRef.current) {
            completedRef.current = true;
            updatePhase('complete');
            callbacksRef.current.onComplete?.(activeWinnerId);
          }
        }, 1100);
        return () => window.clearTimeout(timer);
      } else {
        updatePhase('spinning');
      }
      return;
    }

    // START SPINNING: Record start time if not already recorded
    if (!spinStartTimeRef.current) {
      spinStartTimeRef.current = performance.now();
      revealedRef.current = false;
      completedRef.current = false;
      landingRef.current = null;
      updatePhase('spinning');
    }

    const CRUISING_SPEED_DEG_PER_MS = 0.72; // ~720 deg/second
    const ACCEL_DURATION_MS = 300;
    const MIN_CRUISE_MS = 700; // Minimum visual spin duration before landing begins
    const LANDING_DURATION_MS = 1650;

    const animate = (timestamp: number) => {
      const now = timestamp;
      const lastTime = lastTimestampRef.current ?? now;
      // Cap delta to prevent huge jumps or freezes on background tab recovery
      const deltaMs = Math.min(100, Math.max(0, now - lastTime));
      lastTimestampRef.current = now;

      const spinElapsed = now - (spinStartTimeRef.current ?? now);

      // Check slice boundary crossing for physical needle kick
      if (slices.length > 0) {
        const currentSliceIndex = getSliceIndexAtPointer(rotationRef.current, slices.length);

        if (lastSliceIndexRef.current !== null && lastSliceIndexRef.current !== currentSliceIndex) {
          // Boundary crossed! Kick needle in direction of wheel travel
          needleAngleRef.current = -9;
        }
        lastSliceIndexRef.current = currentSliceIndex;
      }

      // Decay needle kick back toward neutral 0
      if (needleAngleRef.current < 0) {
        needleAngleRef.current = Math.min(0, needleAngleRef.current + deltaMs * 0.045);
        if (needleRef.current) {
          needleRef.current.style.transform = `rotate(${needleAngleRef.current.toFixed(1)}deg)`;
        }
      }

      // Determine visual phase: CRUISING vs LANDING
      const winnerSlice = activeWinnerId ? slices.find((s) => s.id === activeWinnerId) : null;
      const canStartLanding = Boolean(winnerSlice && spinElapsed >= MIN_CRUISE_MS);

      if (!canStartLanding || !winnerSlice) {
        // PHASE A: ACCELERATING & CRUISING
        const accelFactor = Math.min(1, Math.max(0.2, spinElapsed / ACCEL_DURATION_MS));
        const currentSpeed = CRUISING_SPEED_DEG_PER_MS * accelFactor;
        rotationRef.current += deltaMs * currentSpeed;

        if (wheelRef.current) {
          wheelRef.current.style.transform = `rotate(${rotationRef.current.toFixed(2)}deg)`;
        }
        updatePhase('spinning');
      } else {
        // PHASE B: LANDING DECELERATION
        if (!landingRef.current) {
          const startAngle = rotationRef.current;
          const targetAngle = calculateLandingTarget(startAngle, winnerSlice.midAngle, 720);

          landingRef.current = {
            active: true,
            startTime: now,
            startAngle,
            targetAngle,
            duration: LANDING_DURATION_MS,
          };
          updatePhase('landing');
        }

        const { startTime, startAngle, targetAngle, duration } = landingRef.current;
        const landingElapsed = now - startTime;
        const p = Math.min(1, Math.max(0, landingElapsed / duration));

        // Smooth quartic ease-out for realistic mechanical deceleration
        const eased = 1 - Math.pow(1 - p, 3.5);
        const currentAngle = startAngle + (targetAngle - startAngle) * eased;
        rotationRef.current = currentAngle;

        if (wheelRef.current) {
          wheelRef.current.style.transform = `rotate(${currentAngle.toFixed(2)}deg)`;
        }

        if (p >= 1) {
          // LANDED EXACTLY ON WINNER SLICE
          rotationRef.current = targetAngle;
          if (wheelRef.current) {
            wheelRef.current.style.transform = `rotate(${targetAngle}deg)`;
          }
          // Final decisive needle snap
          if (needleRef.current) {
            needleRef.current.style.transform = 'rotate(0deg)';
          }

          if (!revealedRef.current) {
            revealedRef.current = true;
            updatePhase('revealed');
            callbacksRef.current.onRevealed?.(activeWinnerId!);
          }

          // Transition to complete after brief reveal presentation
          const timeSinceLanded = now - (startTime + duration);
          if (timeSinceLanded >= 1200) {
            if (!completedRef.current) {
              completedRef.current = true;
              updatePhase('complete');
              callbacksRef.current.onComplete?.(activeWinnerId!);
            }
            return;
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [activeSpin, activeWinnerId, slices, reducedMotion]);

  return {
    phase,
    wheelRef,
    needleRef,
    getRotation: () => rotationRef.current,
    isSpinning: phase === 'spinning' || phase === 'landing',
    revealed: phase === 'revealed' || phase === 'complete',
    isComplete: phase === 'complete',
  };
}
