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

  // Track the continuous rotation without resetting across re-renders
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!spin) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rotationRef.current = 0;
      setRotation(0);
      setIsSpinning(false);
      setRevealed(false);
      revealedRef.current = false;
      return;
    }

    revealedRef.current = false;
    setRevealed(false);
    setIsSpinning(true);

    if (reducedMotion) {
      if (spin.winnerId) {
        const slice = slices.find((s) => s.id === spin.winnerId);
        const target = slice ? 2160 + ((360 - slice.midAngle) % 360) : 2160;
        rotationRef.current = target;
        setRotation(target);
        setIsSpinning(false);
        setRevealed(true);
        revealedRef.current = true;
        onRevealedRef.current?.(spin.winnerId);
      }
      return;
    }

    const baseRotations = 6 * 360; // 2160 degrees (6 full revolutions)

    const animate = () => {
      const now = Date.now();
      const startedAt = spin.startedAt;
      const revealAt = spin.revealAt || spin.plannedRevealAt;

      if (now < startedAt) {
        // Spin has not started yet (waiting out sync buffer)
        rotationRef.current = 0;
        setRotation(0);
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      const winnerSlice = spin.winnerId ? slices.find((s) => s.id === spin.winnerId) : null;

      if (winnerSlice) {
        const sliceOffset = (360 - winnerSlice.midAngle) % 360;
        const targetAngle = baseRotations + sliceOffset;
        const totalDuration = Math.max(800, revealAt - startedAt);
        const elapsed = now - startedAt;
        const p = Math.min(1, Math.max(0, elapsed / totalDuration));

        // Smooth quartic ease-out for realistic deceleration
        // E(p) = 1 - (1 - p)^3.5
        const eased = 1 - Math.pow(1 - p, 3.5);
        const currentAngle = targetAngle * eased;

        rotationRef.current = currentAngle;
        setRotation(currentAngle);

        if (p >= 1) {
          // Reached landing target
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
      } else {
        // Winner has not resolved yet (in flight).
        // Rotate continuously at a steady cruising speed so wheel never freezes or hitches.
        const elapsed = now - startedAt;
        const totalEstimated = Math.min(1800, elapsed * 0.72);
        rotationRef.current = totalEstimated;
        setRotation(totalEstimated);
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
