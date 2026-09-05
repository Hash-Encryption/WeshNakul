import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
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

// Neo-brutalist palette for the wheel slices
const NEO_BRUTALIST_PALETTE = [
  '#FBBF24', // Slice 0: Amber
  '#FB923C', // Slice 1: Orange / Coral
  '#34D399', // Slice 2: Mint
  '#60A5FA', // Slice 3: Sky Blue
  '#F472B6', // Slice 4: Pink (fallback)
  '#A78BFA', // Slice 5: Purple (fallback)
];

// Pre-computed pegs around the 320x320 wheel circumference (radius 141)
const PEGS = Array.from({ length: 16 }, (_, i) => {
  const angle = i * 22.5;
  const rad = (angle * Math.PI) / 180;
  return {
    x: 160 + 141 * Math.sin(rad),
    y: 160 - 141 * Math.cos(rad),
  };
});

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
      return {
        restaurant,
        startAngle,
        endAngle,
        midAngle,
        angle,
        votes: counts[idx],
        color: NEO_BRUTALIST_PALETTE[idx % NEO_BRUTALIST_PALETTE.length],
      };
    });
  }, [restaurants, swipes]);

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
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-1">
            <svg
              viewBox="0 0 320 320"
              className="w-full h-full select-none overflow-visible drop-shadow-[0px_6px_0px_#241B18]"
            >
              {/* Rotating Wheel Group (iOS Safari explicit pixel transform-origin) */}
              <g
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: '160px 160px',
                  transition: isSpinning
                    ? 'transform 4500ms cubic-bezier(0.15, 0.9, 0.2, 1)'
                    : 'none',
                }}
                onTransitionEnd={() => {
                  if (winnerRef.current) {
                    handleSpinComplete(winnerRef.current);
                  }
                }}
              >
                {/* Thick Arcade Outer Rim */}
                <circle cx="160" cy="160" r="146" fill="#241B18" />

                {/* Slices */}
                {slices.map((slice) => {
                  const startRad = (slice.startAngle * Math.PI) / 180;
                  const endRad = (slice.endAngle * Math.PI) / 180;
                  const x1 = 160 + 136 * Math.sin(startRad);
                  const y1 = 160 - 136 * Math.cos(startRad);
                  const x2 = 160 + 136 * Math.sin(endRad);
                  const y2 = 160 - 136 * Math.cos(endRad);
                  const largeArc = slice.angle > 180 ? 1 : 0;
                  const pathData = `M 160 160 L ${x1} ${y1} A 136 136 0 ${largeArc} 1 ${x2} ${y2} Z`;

                  return (
                    <path
                      key={`slice-${slice.restaurant.id}`}
                      d={pathData}
                      fill={slice.color}
                      stroke="#241B18"
                      strokeWidth="2.5"
                    />
                  );
                })}

                {/* Direct Inside-Slice Labels & Emojis */}
                {slices.map((slice) => {
                  const rawName = locale === 'ar' ? slice.restaurant.nameAr : slice.restaurant.nameEn;
                  const displayName = rawName.length > 12 ? rawName.slice(0, 12).trim() + '...' : rawName;

                  return (
                    <g
                      key={`label-${slice.restaurant.id}`}
                      transform={`rotate(${slice.midAngle} 160 160)`}
                    >
                      {/* Food Emoji */}
                      <text
                        x="160"
                        y="58"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="18"
                        className="select-none pointer-events-none"
                      >
                        {getRestaurantEmoji(slice.restaurant)}
                      </text>
                      {/* Truncated Restaurant Name */}
                      <text
                        x="160"
                        y="80"
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#241B18"
                        fontSize="11"
                        fontWeight="900"
                        fontFamily="Alexandria, system-ui, sans-serif"
                        className="select-none pointer-events-none"
                      >
                        {displayName}
                      </text>
                    </g>
                  );
                })}

                {/* Metallic Pegs on Rim (Rotate with wheel) */}
                {PEGS.map((peg, i) => (
                  <g key={`peg-${i}`}>
                    <circle cx={peg.x} cy={peg.y} r="3.5" fill="#FFFDF8" stroke="#241B18" strokeWidth="1.2" />
                    <circle cx={peg.x - 0.8} cy={peg.y - 0.8} r="1" fill="#FFFFFF" />
                  </g>
                ))}
              </g>

              {/* 3D Tactile Center Cap (Outside rotating group so dice stays upright) */}
              <g className="pointer-events-none">
                <circle cx="160" cy="160" r="30" fill="#241B18" />
                <circle cx="160" cy="160" r="28" fill="#FFFDF8" stroke="#241B18" strokeWidth="3" />
                <circle cx="160" cy="160" r="22" fill="#FFD75A" stroke="#241B18" strokeWidth="2" />
                <text
                  x="160"
                  y="161"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="20"
                  className="select-none pointer-events-none"
                >
                  🎲
                </text>
              </g>

              {/* Top Arcade Indicator Needle (Outside rotating group with wobble animation) */}
              <motion.g
                animate={isSpinning ? { rotate: [0, -12, 10, -8, 5, -2, 0] } : { rotate: 0 }}
                transition={
                  isSpinning
                    ? { repeat: Infinity, duration: 0.16, ease: 'linear' }
                    : { type: 'spring', stiffness: 400, damping: 20 }
                }
                style={{ transformOrigin: '160px 8px' }}
                className="pointer-events-none"
              >
                {/* Needle Drop Shadow */}
                <polygon
                  points="148,8 172,8 160,37"
                  fill="#000000"
                  opacity="0.25"
                  transform="translate(0, 3)"
                />
                {/* Needle Body */}
                <polygon
                  points="148,8 172,8 160,36"
                  fill="#EF4444"
                  stroke="#241B18"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                {/* Inner Accent Ridge */}
                <polygon points="160,11 170,9 160,34" fill="#DC2626" />
                <line
                  x1="160"
                  y1="10"
                  x2="160"
                  y2="34"
                  stroke="#FEE2E2"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                {/* Brass Pivot Rivet */}
                <circle cx="160" cy="8" r="8" fill="#FBBF24" stroke="#241B18" strokeWidth="3" />
                <circle cx="160" cy="8" r="3" fill="#241B18" />
              </motion.g>
            </svg>
          </div>

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
                  <div className="py-2.5 px-4 rounded-xl bg-[#FFF8F1] border border-[#241B18]/20 text-xs font-black text-[#7A6E67] font-alexandria w-full">
                    {t('gameSwiper.waitingForHost')}
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
                  <div className="py-3 px-4 rounded-2xl bg-[#FFF8F1] border-2 border-[#241B18]/20 text-xs font-black text-[#7A6E67] font-alexandria w-full">
                    {isSpinning
                      ? t('gameSwiper.rouletteSpinning')
                      : t('gameSwiper.waitingForHost')}
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

