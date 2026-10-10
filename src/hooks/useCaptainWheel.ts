import { useEffect, useRef, useState } from 'react';
import type { CaptainCandidate } from '../types/captain';

export type CaptainWheelPhase = 'idle' | 'spinning' | 'landing' | 'revealed' | 'complete';

export function calculateCaptainLandingTarget(
  startAngle: number,
  winnerMidAngle: number,
  minDistance = 720
): number {
  const targetRemainder = ((360 - winnerMidAngle) % 360 + 360) % 360;
  const candidate = startAngle + minDistance;
  let currentRem = candidate % 360;
  if (currentRem < 0) currentRem += 360;
  let diff = targetRemainder - currentRem;
  if (diff < 0) diff += 360;
  return candidate + diff;
}

export function getCaptainSliceIndexAtPointer(rotation: number, sliceCount: number): number {
  if (sliceCount <= 0) return 0;
  const sliceSpan = 360 / sliceCount;
  const pointerAngle = ((360 - (rotation % 360)) % 360 + 360) % 360;
  return Math.floor(pointerAngle / sliceSpan) % sliceCount;
}

export interface UseCaptainWheelProps {
  candidates: CaptainCandidate[];
  isSpinning?: boolean;
  winnerId?: string | null;
  reducedMotion?: boolean;
  onRevealed?: (winnerId: string) => void;
  onComplete?: (winnerId: string) => void;
}

export function useCaptainWheel({
  candidates,
  isSpinning = false,
  winnerId = null,
  reducedMotion = false,
  onRevealed,
  onComplete,
}: UseCaptainWheelProps) {
  const [phase, setPhase] = useState<CaptainWheelPhase>('idle');

  const wheelRef = useRef<SVGGElement | null>(null);
  const needleRef = useRef<SVGGElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const phaseRef = useRef<CaptainWheelPhase>('idle');
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

  const updatePhase = (newPhase: CaptainWheelPhase) => {
    if (phaseRef.current !== newPhase) {
      phaseRef.current = newPhase;
      setPhase(newPhase);
    }
  };

  const count = Math.max(1, candidates.length);
  const sliceAngle = 360 / count;

  useEffect(() => {
    // IDLE: Wheel only spins when BOTH isSpinning is true and winnerId is present
    if (!isSpinning || !winnerId) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimestampRef.current = null;
      spinStartTimeRef.current = null;
      landingRef.current = null;
      lastSliceIndexRef.current = null;
      revealedRef.current = false;
      completedRef.current = false;
      needleAngleRef.current = 0;
      if (needleRef.current) needleRef.current.style.transform = 'rotate(0deg)';
      updatePhase('idle');
      return;
    }

    // REDUCED MOTION
    if (reducedMotion) {
      if (winnerId) {
        const winnerIndex = candidates.findIndex((c) => c.id === winnerId);
        const midAngle = (winnerIndex >= 0 ? winnerIndex + 0.5 : 0.5) * sliceAngle;
        const target = ((360 - midAngle) % 360 + 360) % 360;
        rotationRef.current = target;
        if (wheelRef.current) {
          wheelRef.current.style.transform = `rotate(${target}deg)`;
        }
        if (!revealedRef.current) {
          revealedRef.current = true;
          updatePhase('revealed');
          callbacksRef.current.onRevealed?.(winnerId);
        }
        const timer = window.setTimeout(() => {
          if (!completedRef.current) {
            completedRef.current = true;
            updatePhase('complete');
            callbacksRef.current.onComplete?.(winnerId);
          }
        }, 300);
        return () => window.clearTimeout(timer);
      }
      return;
    }

    // ANIMATION LOOP
    const animate = (timestamp: number) => {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const dt = Math.min((timestamp - lastTimestampRef.current) / 1000, 0.05);
      lastTimestampRef.current = timestamp;

      if (!spinStartTimeRef.current) spinStartTimeRef.current = timestamp;
      const elapsed = (timestamp - spinStartTimeRef.current) / 1000;

      // 1. FREE-SPINNING PHASE
      if (!landingRef.current) {
        // Safety ceiling: If spinning for > 8s without landing, abort cleanly to idle
        if (elapsed > 8.0) {
          console.warn('[useCaptainWheel] Safety ceiling reached without landing; stopping wheel.');
          updatePhase('idle');
          return;
        }

        const speed = Math.min(720, 200 + elapsed * 500); // Accelerate up to 720 deg/s
        rotationRef.current = (rotationRef.current + speed * dt) % 360;

        if (wheelRef.current) {
          wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }
        updatePhase('spinning');

        // Boundary tick sound/haptic needle kick
        const currentSlice = getCaptainSliceIndexAtPointer(rotationRef.current, count);
        if (lastSliceIndexRef.current !== null && lastSliceIndexRef.current !== currentSlice) {
          needleAngleRef.current = -12; // kick needle
          try { navigator.vibrate?.(4); } catch {}
        }
        lastSliceIndexRef.current = currentSlice;

        if (needleAngleRef.current < 0) {
          needleAngleRef.current = Math.min(0, needleAngleRef.current + 60 * dt);
          if (needleRef.current) needleRef.current.style.transform = `rotate(${needleAngleRef.current}deg)`;
        }

        // Check if winner is ready and min spin time reached (at least 1.5s spin)
        if (winnerId && elapsed >= 1.5) {
          const winnerIndex = candidates.findIndex((c) => c.id === winnerId);
          const midAngle = (winnerIndex >= 0 ? winnerIndex + 0.5 : 0.5) * sliceAngle;
          const targetAngle = calculateCaptainLandingTarget(rotationRef.current, midAngle, 720);

          landingRef.current = {
            active: true,
            startTime: timestamp,
            startAngle: rotationRef.current,
            targetAngle,
            duration: 2.2, // 2.2s landing easeOutCubic
          };
          updatePhase('landing');
        }

        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // 2. CONTROLLED LANDING PHASE
      const landing = landingRef.current;
      const landingElapsed = (timestamp - landing.startTime) / 1000;
      const progress = Math.min(landingElapsed / landing.duration, 1);

      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRot = landing.startAngle + (landing.targetAngle - landing.startAngle) * eased;
      rotationRef.current = currentRot;

      if (wheelRef.current) {
        wheelRef.current.style.transform = `rotate(${currentRot}deg)`;
      }

      // Slower needle kick during deceleration
      const currentSlice = getCaptainSliceIndexAtPointer(currentRot, count);
      if (lastSliceIndexRef.current !== null && lastSliceIndexRef.current !== currentSlice) {
        needleAngleRef.current = -10 * (1 - progress);
        try { navigator.vibrate?.(progress > 0.8 ? 2 : 4); } catch {}
      }
      lastSliceIndexRef.current = currentSlice;

      if (needleAngleRef.current < 0) {
        needleAngleRef.current = Math.min(0, needleAngleRef.current + 45 * dt);
        if (needleRef.current) needleRef.current.style.transform = `rotate(${needleAngleRef.current}deg)`;
      }

      if (progress >= 1) {
        // LANDED!
        if (needleRef.current) needleRef.current.style.transform = 'rotate(0deg)';
        if (!revealedRef.current && winnerId) {
          revealedRef.current = true;
          updatePhase('revealed');
          callbacksRef.current.onRevealed?.(winnerId);
        }
        if (!completedRef.current && winnerId) {
          completedRef.current = true;
          updatePhase('complete');
          callbacksRef.current.onComplete?.(winnerId);
        }
        return;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isSpinning, winnerId, reducedMotion, candidates, count, sliceAngle]);

  return {
    wheelRef,
    needleRef,
    phase,
    isSpinning: phase === 'spinning' || phase === 'landing',
    revealed: phase === 'revealed' || phase === 'complete',
  };
}
