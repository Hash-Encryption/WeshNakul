import { useEffect, useRef, useState } from 'react';
import type { DecisionSpin } from '../types/roulette';
import type { ArcadeWheelSlice } from '../components/common/ArcadeWheel';

interface UseContinuousRouletteProps {
  spin: DecisionSpin | null;
  slices: ArcadeWheelSlice[];
  reducedMotion?: boolean;
  onRevealed?: (winnerId: string) => void;
}

export function useContinuousRoulette({
  spin,
  slices,
  reducedMotion = false,
  onRevealed,
}: UseContinuousRouletteProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const revealedRef = useRef(false);
  const onRevealedRef = useRef(onRevealed);
  useEffect(() => {
    onRevealedRef.current = onRevealed;
  }, [onRevealed]);

  // Track continuous rotation and state machine without resetting across re-renders
  const rotationRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // State machine for landing phase
  const landingRef = useRef<{
    active: boolean;
    startTime: number;
    startAngle: number;
    targetAngle: number;
    duration: number;
  }>({
    active: false,
    startTime: 0,
    startAngle: 0,
    targetAngle: 0,
    duration: 0,
  });

  useEffect(() => {
    if (!spin) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rotationRef.current = 0;
      lastTimeRef.current = null;
      landingRef.current.active = false;
      revealedRef.current = false;
      return;
    }

    revealedRef.current = false;
    setRevealed(false);
    setIsSpinning(true);

    if (reducedMotion) {
      if (spin.winnerId) {
        const slice = slices.find((s) => s.id === spin.winnerId);
        const target = slice ? (360 - slice.midAngle + 360) % 360 : 0;
        rotationRef.current = target;
        setRotation(target);
        setIsSpinning(false);
        setRevealed(true);
        revealedRef.current = true;
        onRevealedRef.current?.(spin.winnerId);
      }
      return;
    }

    const CRUISING_SPEED_DEG_PER_MS = 0.72; // ~720 deg/second (2 revolutions per sec)
    lastTimeRef.current = performance.now();

    const animate = (timestamp: number) => {
      const now = timestamp;
      const lastTime = lastTimeRef.current ?? now;
      const deltaMs = Math.min(100, Math.max(0, now - lastTime));
      lastTimeRef.current = now;

      const winnerSlice = spin.winnerId ? slices.find((s) => s.id === spin.winnerId) : null;

      if (!winnerSlice) {
        // PHASE A: CRUISING
        // Continuously spin at steady cruising speed. Never stop, never timeout without winner.
        rotationRef.current += deltaMs * CRUISING_SPEED_DEG_PER_MS;
        setRotation(rotationRef.current);
      } else {
        // PHASE B: LANDING
        // Decelerate smoothly from current wheel angle to the authoritative winner slice.
        if (!landingRef.current.active) {
          const startAngle = rotationRef.current;
          const targetRemainder = ((360 - winnerSlice.midAngle) % 360 + 360) % 360;
          const minLandingDistance = 720; // 2 full revolutions of deceleration
          const candidate = startAngle + minLandingDistance;
          let currentRem = candidate % 360;
          if (currentRem < 0) currentRem += 360;
          let diff = targetRemainder - currentRem;
          if (diff < 0) diff += 360;
          const targetAngle = candidate + diff;
          const duration = Math.max(1600, (targetAngle - startAngle) / 0.55);

          landingRef.current = {
            active: true,
            startTime: now,
            startAngle,
            targetAngle,
            duration,
          };
        }

        const { startTime, startAngle, targetAngle, duration } = landingRef.current;
        const elapsed = now - startTime;
        const p = Math.min(1, Math.max(0, elapsed / duration));

        // Smooth quartic ease-out for realistic mechanical deceleration
        const eased = 1 - Math.pow(1 - p, 3.5);
        const currentAngle = startAngle + (targetAngle - startAngle) * eased;

        rotationRef.current = currentAngle;
        setRotation(currentAngle);

        if (p >= 1) {
          // Landed exactly on authoritative winner slice
          rotationRef.current = targetAngle;
          setRotation(targetAngle);
          setIsSpinning(false);
          if (!revealedRef.current) {
            revealedRef.current = true;
            setRevealed(true);
            onRevealedRef.current?.(spin.winnerId!);
          }
          return;
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [spin, slices, reducedMotion]);

  return {
    rotation,
    isSpinning,
    revealed,
  };
}
