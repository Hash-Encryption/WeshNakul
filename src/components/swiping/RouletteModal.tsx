import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { RestaurantItem, RestaurantSwipe } from '../../types/restaurant';
import { useLocale } from '../../context/LocaleContext';
import { broadcastRouletteSpin, subscribeToRouletteSpin } from '../../lib/supabase';

interface RouletteModalProps {
  isOpen: boolean;
  roomId: string;
  isHost: boolean;
  restaurants: RestaurantItem[];
  swipes: RestaurantSwipe[];
  onSelectWinner: (winner: RestaurantItem) => void;
  onClose: () => void;
}

const SLICE_COLORS = ['#FFD75A', '#55B96A', '#73C8EA', '#F0443E', '#9B86EC'];

// Synthetic ticking sound generator using Web Audio API
function playTickSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  } catch {
    // AudioContext blocked or not supported
  }
}

export const RouletteModal: React.FC<RouletteModalProps> = ({
  isOpen,
  roomId,
  isHost,
  restaurants,
  swipes,
  onSelectWinner,
  onClose,
}) => {
  const { t, locale } = useLocale();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<RestaurantItem | null>(null);
  const audioIntervalRef = useRef<any>(null);

  // Calculate slices based on vote counts
  const slices = useMemo(() => {
    if (!restaurants || restaurants.length === 0) return [];
    const counts = restaurants.map((r) => {
      const count = swipes.filter((s) => s.restaurantId === r.id && s.liked).length;
      return Math.max(count, 1); // minimum 1 weight for slice visibility
    });
    const totalWeight = counts.reduce((acc, c) => acc + c, 0);

    let currentAngle = 0;
    return restaurants.map((restaurant, idx) => {
      const angle = (counts[idx] / totalWeight) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle += angle;
      return {
        restaurant,
        startAngle,
        endAngle,
        angle,
        color: SLICE_COLORS[idx % SLICE_COLORS.length],
      };
    });
  }, [restaurants, swipes]);

  const handleSpinAnimation = useCallback((winnerId: string, targetAngle: number) => {
    setIsSpinning(true);
    setSelectedWinner(null);
    setRotation(targetAngle);

    // Ticking audio interval
    let tickCount = 0;
    const maxTicks = 35;
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    audioIntervalRef.current = setInterval(() => {
      tickCount++;
      playTickSound();
      if (tickCount >= maxTicks) {
        clearInterval(audioIntervalRef.current);
      }
    }, 110);

    setTimeout(() => {
      setIsSpinning(false);
      const winner = restaurants.find((r) => r.id === winnerId) || restaurants[0];
      setSelectedWinner(winner);

      if (isHost && winner) {
        setTimeout(() => {
          onSelectWinner(winner);
        }, 1500);
      }
    }, 4200);
  }, [restaurants, isHost, onSelectWinner]);

  // Subscribe to spin broadcast across clients
  useEffect(() => {
    if (!isOpen || !roomId) return;

    const unsubscribe = subscribeToRouletteSpin(roomId, ({ winnerId, targetAngle }) => {
      handleSpinAnimation(winnerId, targetAngle);
    });

    return () => unsubscribe();
  }, [isOpen, roomId, handleSpinAnimation]);

  const handleStartSpin = () => {
    if (isSpinning || !isHost || slices.length === 0) return;

    // Pick random weighted slice
    const randomPick = Math.random() * 360;
    let chosen = slices[0];
    for (const slice of slices) {
      if (randomPick >= slice.startAngle && randomPick < slice.endAngle) {
        chosen = slice;
        break;
      }
    }

    // Pointer is at the top (270 degrees or 90 degrees depending on coordinate system)
    // The slice center should land under the pointer at 0° (top)
    const sliceCenter = (chosen.startAngle + chosen.endAngle) / 2;
    const spins = 5 + Math.floor(Math.random() * 3);
    const targetAngle = spins * 360 + (360 - sliceCenter);

    broadcastRouletteSpin(roomId, {
      winnerId: chosen.restaurant.id,
      targetAngle,
    });
  };

  if (!isOpen || restaurants.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-sm bg-white rounded-3xl border-2 border-[#241B18] shadow-[0px_6px_0px_#241B18] p-5 text-center flex flex-col items-center gap-4 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            <h3 className="text-xl font-black text-[#241B18] font-alexandria tracking-tight">
              {t('gameSwiper.rouletteBtn')}
            </h3>
          </div>

          {/* Roulette Wheel Stage */}
          <div className="relative w-64 h-64 flex items-center justify-center my-2">
            {/* Pointer / Marker at the top */}
            <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none drop-shadow-md">
              <div className="w-0 h-0 border-x-8 border-x-transparent border-t-16 border-t-[#241B18]" />
            </div>

            {/* Rotating SVG Wheel */}
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.95, 0.35, 1)' : 'none',
              }}
              className="w-full h-full rounded-full border-4 border-[#241B18] shadow-[0px_4px_0px_#241B18] overflow-hidden"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {slices.map((slice) => {
                  const startRad = (slice.startAngle * Math.PI) / 180;
                  const endRad = (slice.endAngle * Math.PI) / 180;
                  const x1 = 50 + 50 * Math.cos(startRad);
                  const y1 = 50 + 50 * Math.sin(startRad);
                  const x2 = 50 + 50 * Math.cos(endRad);
                  const y2 = 50 + 50 * Math.sin(endRad);
                  const largeArc = slice.angle > 180 ? 1 : 0;
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

                  return (
                    <path
                      key={slice.restaurant.id}
                      d={pathData}
                      fill={slice.color}
                      stroke="#241B18"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>
            </div>

            {/* Center Hub */}
            <div className="absolute w-12 h-12 rounded-full bg-white border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] flex items-center justify-center font-black text-lg pointer-events-none z-20">
              🎯
            </div>
          </div>

          {/* Slices Legend */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xs">
            {slices.map((s) => (
              <div
                key={s.restaurant.id}
                className="flex items-center gap-1.5 bg-[#FFF8F1] border border-[#241B18]/30 px-2.5 py-1 rounded-full text-xs font-black text-[#241B18]"
              >
                <span className="w-3 h-3 rounded-full border border-[#241B18]" style={{ backgroundColor: s.color }} />
                <span className="truncate max-w-[90px]">
                  {locale === 'ar' ? s.restaurant.nameAr : s.restaurant.nameEn}
                </span>
              </div>
            ))}
          </div>

          {/* Winner Announcement or Controls */}
          {selectedWinner ? (
            <div className="bg-[#E8F8EE] border-2 border-[#55B96A] rounded-2xl p-3 w-full shadow-[0px_3px_0px_#55B96A] animate-bounce">
              <span className="text-xs font-bold text-[#55B96A] block">
                {locale === 'ar' ? 'وقع الاختيار على! 🏆' : 'The Wheel Picked! 🏆'}
              </span>
              <p className="text-base font-black text-[#241B18] font-alexandria">
                {locale === 'ar' ? selectedWinner.nameAr : selectedWinner.nameEn}
              </p>
            </div>
          ) : isHost ? (
            <button
              type="button"
              disabled={isSpinning}
              onClick={handleStartSpin}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all font-alexandria font-black text-base disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🎯</span>
              <span>{isSpinning ? t('common.loading') : t('gameSwiper.rouletteSpin')}</span>
            </button>
          ) : (
            <div className="py-2.5 px-4 rounded-2xl bg-[#FFF8F1] border border-[#241B18]/30 text-xs font-black text-[#7A6E67] font-alexandria">
              {isSpinning ? '🎡 العجلة تدور الآن...' : t('gameSwiper.waitingForHost')}
            </div>
          )}

          {isHost && !isSpinning && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-[#7A6E67] hover:text-[#241B18] underline"
            >
              {t('common.close')}
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
