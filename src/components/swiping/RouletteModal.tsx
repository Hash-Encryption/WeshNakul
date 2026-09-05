import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import type { RestaurantItem, RestaurantSwipe } from '../../types/restaurant';
import { useLocale } from '../../context/LocaleContext';
import { broadcastRouletteSpin, subscribeToRouletteSpin } from '../../lib/supabase';
import { NEO_BRUTALIST_PALETTE } from '../../lib/consensus';
import { ArcadeWheel } from '../common/ArcadeWheel';

interface RouletteModalProps {
  isOpen: boolean;
  roomId: string;
  isHost: boolean;
  restaurants: RestaurantItem[];
  swipes: RestaurantSwipe[];
  onSelectWinner: (winner: RestaurantItem) => void;
  onClose: () => void;
}

function getRestaurantEmoji(restaurant: RestaurantItem): string {
  const cats = restaurant.categories || [];
  const text = (restaurant.nameAr + ' ' + (restaurant.nameEn || '') + ' ' + cats.join(' ')).toLowerCase();
  if (text.includes('برجر') || text.includes('burger')) return '🍔';
  if (text.includes('بيتزا') || text.includes('pizza')) return '🍕';
  if (text.includes('شاورما') || text.includes('shawarma')) return '🌯';
  if (text.includes('دجاج') || text.includes('chicken') || text.includes('بروستد')) return '🍗';
  if (text.includes('سوشي') || text.includes('sushi')) return '🍣';
  if (text.includes('تاكو') || text.includes('taco') || text.includes('مكسيك')) return '🌮';
  if (text.includes('قهوة') || text.includes('كافيه') || text.includes('cafe') || text.includes('coffee')) return '☕';
  if (text.includes('حلى') || text.includes('sweet') || text.includes('dessert') || text.includes('كيك')) return '🍰';
  if (text.includes('فطور') || text.includes('breakfast')) return '🍳';
  if (text.includes('لحم') || text.includes('مشاوي') || text.includes('grill') || text.includes('steak')) return '🥩';
  return '🍽️';
}

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
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
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
  const [winner, setWinner] = useState<RestaurantItem | null>(null);
  const [showWinnerCard, setShowWinnerCard] = useState(false);

  const audioIntervalRef = useRef<any>(null);
  const spinTimeoutRef = useRef<any>(null);
  const winnerRef = useRef<RestaurantItem | null>(null);
  const spinCompletedRef = useRef<boolean>(false);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  // Calculate slices based on vote weights
  const slices = useMemo(() => {
    if (!restaurants || restaurants.length === 0) return [];
    const counts = restaurants.map((r) => {
      const count = swipes.filter((s) => s.restaurantId === r.id && s.liked).length;
      return Math.max(count, 1);
    });
    const totalWeight = counts.reduce((acc, c) => acc + c, 0);

    let currentAngle = 0;
    return restaurants.map((restaurant, idx) => {
      const angle = (counts[idx] / totalWeight) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const midAngle = startAngle + angle / 2;
      currentAngle += angle;
      const name = locale === 'ar' ? restaurant.nameAr : (restaurant.nameEn || restaurant.nameAr);
      const emoji = getRestaurantEmoji(restaurant);
      return {
        id: restaurant.id,
        name,
        emoji,
        restaurant,
        startAngle,
        endAngle,
        midAngle,
        angle,
        votes: counts[idx],
        color: NEO_BRUTALIST_PALETTE[idx % NEO_BRUTALIST_PALETTE.length],
      };
    });
  }, [restaurants, swipes, locale]);

  const handleSpinComplete = useCallback((winnerRestaurant: RestaurantItem) => {
    if (spinCompletedRef.current) return;
    spinCompletedRef.current = true;

    setIsSpinning(false);
    setWinner(winnerRestaurant);
    setShowWinnerCard(true);

    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = null;
    }

    // Trigger celebratory micro-confetti
    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.55 },
        colors: ['#FBBF24', '#FB923C', '#34D399', '#60A5FA', '#EF4444'],
      });
    } catch {
      // Safe fallback
    }
  }, []);

  const handleSpinAnimation = useCallback(
    (winnerRestaurant: RestaurantItem, targetAngle: number) => {
      winnerRef.current = winnerRestaurant;
      spinCompletedRef.current = false;
      setIsSpinning(true);
      setShowWinnerCard(false);
      setWinner(null);
      setRotation(targetAngle);

      // Ticking audio interval (40 ticks over ~4.2s)
      let tickCount = 0;
      const maxTicks = 40;
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = setInterval(() => {
        tickCount++;
        playTickSound();
        if (tickCount >= maxTicks) {
          clearInterval(audioIntervalRef.current);
          audioIntervalRef.current = null;
        }
      }, 105);

      // Safari safety fallback timeout (guarantees completion even if tab blurs or onTransitionEnd drops)
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = setTimeout(() => {
        if (winnerRef.current) {
          handleSpinComplete(winnerRef.current);
        }
      }, 4600);
    },
    [handleSpinComplete]
  );

  // Subscribe to spin broadcast across squad members
  useEffect(() => {
    if (!isOpen || !roomId) return;

    const unsubscribe = subscribeToRouletteSpin(roomId, ({ winnerId, targetAngle }) => {
      // Prevent echoing or re-triggering if already spinning to target
      if (isSpinning && Math.abs(rotation - targetAngle) < 1) return;
      const matched = restaurants.find((r) => r.id === winnerId) || restaurants[0];
      handleSpinAnimation(matched, targetAngle);
    });

    return () => unsubscribe();
  }, [isOpen, roomId, restaurants, isSpinning, rotation, handleSpinAnimation]);

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

    // Pointer is at the top (0° / 12 o'clock)
    // Slices are rendered starting at 12 o'clock clockwise.
    // Target rotation brings chosen.midAngle right under the top pointer at 0°.
    const spins = 5 + Math.floor(Math.random() * 3);
    const currentBase = Math.floor(rotation / 360) * 360;
    const targetAngle = currentBase + spins * 360 + (360 - chosen.midAngle);

    // 1. Immediately fire local animation (NO awaiting broadcast!)
    handleSpinAnimation(chosen.restaurant, targetAngle);

    // 2. Concurrently broadcast to squad in background with error catching
    broadcastRouletteSpin(roomId, {
      winnerId: chosen.restaurant.id,
      targetAngle,
    }).catch((err) => {
      console.warn('Failed to broadcast roulette spin', err);
    });
  };

  if (!isOpen || restaurants.length === 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="relative w-full max-w-sm bg-[#FFFDF8] rounded-[28px] border-3 border-[#241B18] shadow-[0px_8px_0px_#241B18] p-4 sm:p-5 text-center flex flex-col items-center gap-3.5 overflow-hidden"
        >
          {/* Top Arcade Header */}
          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎲</span>
              <h3 className="text-xl font-black text-[#241B18] font-alexandria tracking-tight">
                {t('gameSwiper.rouletteBtn')}
              </h3>
            </div>
            {!isSpinning && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border-2 border-[#241B18] bg-white flex items-center justify-center text-xs font-black text-[#241B18] hover:bg-[#FFF0EE] active:scale-95 transition-all shadow-[0px_2px_0px_#241B18]"
                aria-label={t('common.close')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Arcade Wheel Stage */}
          <ArcadeWheel
            slices={slices}
            rotation={rotation}
            isSpinning={isSpinning}
            onTransitionEnd={() => {
              if (winnerRef.current) {
                handleSpinComplete(winnerRef.current);
              }
            }}
            centerEmoji="🎲"
          />

          {/* Post-Spin Winner Reveal Card OR Spin Controls */}
          <AnimatePresence mode="wait">
            {showWinnerCard && winner ? (
              <motion.div
                key="winner-card"
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                className="w-full bg-[#FFFDF8] border-2 border-[#241B18] rounded-2xl p-3.5 shadow-[0px_4px_0px_#241B18] text-center flex flex-col items-center gap-2.5"
              >
                {/* Winner Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD75A] border-2 border-[#241B18] text-xs font-black text-[#241B18] shadow-[0px_2px_0px_#241B18]">
                  {t('gameSwiper.rouletteWinnerBadge')}
                </span>

                {/* Restaurant Name */}
                <div className="flex flex-col items-center">
                  <h4 className="text-xl font-black text-[#241B18] font-alexandria tracking-tight">
                    {locale === 'ar' ? winner.nameAr : winner.nameEn}
                  </h4>
                  {(winner.signatureDishAr || winner.signatureDishEn) && (
                    <p className="text-xs font-bold text-[#7A6E67] mt-0.5">
                      {locale === 'ar' ? winner.signatureDishAr : winner.signatureDishEn}
                    </p>
                  )}
                </div>

                {/* Host Action or Squad Waiting */}
                {isHost ? (
                  <div className="w-full flex flex-col gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => onSelectWinner(winner)}
                      className="w-full py-3 px-4 rounded-xl bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all font-alexandria font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>🚀</span>
                      <span>
                        {t('gameSwiper.rouletteConfirmWinner', {
                          restaurant: locale === 'ar' ? winner.nameAr : winner.nameEn,
                        })}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartSpin}
                      disabled={isSpinning}
                      className="w-full py-1.5 text-xs font-black text-[#7A6E67] hover:text-[#241B18] transition-colors cursor-pointer"
                    >
                      {t('gameSwiper.rouletteSpinAgain')}
                    </button>
                  </div>
                ) : (
                  <div className="py-2.5 px-4 rounded-xl bg-[#FFF8F1] border border-[#241B18]/20 text-xs font-black text-[#7A6E67] font-alexandria w-full animate-pulse flex items-center justify-center gap-1.5">
                    <span>👑</span>
                    <span>{t('gameSwiper.waitingForHost')}</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="controls"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                {isHost ? (
                  <button
                    type="button"
                    disabled={isSpinning}
                    onClick={handleStartSpin}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all font-alexandria font-black text-base disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>🎯</span>
                    <span>
                      {isSpinning
                        ? t('gameSwiper.rouletteSpinning')
                        : t('gameSwiper.rouletteSpin')}
                    </span>
                  </button>
                ) : (
                  <div className="py-3 px-4 rounded-2xl bg-[#FFF8F1] border-2 border-[#241B18]/20 text-xs font-black text-[#7A6E67] font-alexandria w-full animate-pulse flex items-center justify-center gap-2">
                    <span>👀</span>
                    <span>{t('categoryRoulette.waitingHost')}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

