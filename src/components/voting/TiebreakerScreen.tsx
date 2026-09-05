import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { SparkleRays, DoodleSquiggle } from '../common/DecorativeSparkles';
import {
  getCategoryById,
  FOOD_CATEGORIES,
  NEO_BRUTALIST_PALETTE,
} from '../../lib/consensus';
import {
  ArcadeWheel,
  type ArcadeWheelSlice,
} from '../common/ArcadeWheel';
import {
  broadcastCategoryRouletteSpin,
  subscribeToCategoryRouletteSpin,
} from '../../lib/supabase';

// Web Audio API tick generator
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

export const TiebreakerScreen: React.FC = () => {
  const { currentRoom, isHost, resolveConsensus, participants } = useRoom();
  const { t, locale } = useLocale();

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<(typeof FOOD_CATEGORIES)[number] | null>(null);
  const [showWinnerCard, setShowWinnerCard] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const audioIntervalRef = useRef<any>(null);
  const spinTimeoutRef = useRef<any>(null);
  const winnerRef = useRef<(typeof FOOD_CATEGORIES)[number] | null>(null);
  const spinCompletedRef = useRef<boolean>(false);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  const rawTiedCategories = currentRoom?.tied_categories;
  const tiedIds = useMemo(() => {
    return rawTiedCategories && rawTiedCategories.length > 0
      ? rawTiedCategories
      : ['burger', 'shawarma'];
  }, [rawTiedCategories]);

  const contenders = useMemo(() => {
    return tiedIds
      .map((id) => getCategoryById(id))
      .filter((c): c is (typeof FOOD_CATEGORIES)[number] => Boolean(c));
  }, [tiedIds]);

  // Construct arcade wheel slices
  const slices: ArcadeWheelSlice[] = useMemo(() => {
    if (contenders.length === 0) return [];
    const sliceAngle = 360 / contenders.length;
    return contenders.map((cat, idx) => {
      const startAngle = idx * sliceAngle;
      const endAngle = (idx + 1) * sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;
      return {
        id: cat.id,
        name: locale === 'ar' ? cat.ar : cat.en,
        emoji: cat.icon,
        votes: 1,
        color: NEO_BRUTALIST_PALETTE[idx % NEO_BRUTALIST_PALETTE.length],
        startAngle,
        endAngle,
        midAngle,
        angle: sliceAngle,
      };
    });
  }, [contenders, locale]);

  const handleSpinComplete = useCallback((winningCat: (typeof FOOD_CATEGORIES)[number]) => {
    if (spinCompletedRef.current) return;
    spinCompletedRef.current = true;

    setIsSpinning(false);
    setWinner(winningCat);
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
        particleCount: 60,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#FBBF24', '#FB923C', '#34D399', '#60A5FA', '#EF4444'],
      });
    } catch {
      // Safe fallback
    }
  }, []);

  const handleSpinAnimation = useCallback(
    (winningCat: (typeof FOOD_CATEGORIES)[number], targetAngle: number) => {
      winnerRef.current = winningCat;
      spinCompletedRef.current = false;
      setIsSpinning(true);
      setShowWinnerCard(false);
      setWinner(null);
      setRotation(targetAngle);

      let tickCount = 0;
      const maxTicks = 40;
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = setInterval(() => {
        tickCount++;
        playTickSound();
        if (tickCount >= maxTicks && audioIntervalRef.current) {
          clearInterval(audioIntervalRef.current);
          audioIntervalRef.current = null;
        }
      }, 105);

      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
      spinTimeoutRef.current = setTimeout(() => {
        handleSpinComplete(winningCat);
      }, 4600);
    },
    [handleSpinComplete]
  );

  // Realtime guest synchronization
  useEffect(() => {
    if (!currentRoom?.id) return;

    const unsubscribe = subscribeToCategoryRouletteSpin(
      currentRoom.id,
      ({ winnerId, targetAngle }) => {
        if (isSpinning && Math.abs(rotation - targetAngle) < 1) return;
        const matched = contenders.find((c) => c.id === winnerId) || contenders[0];
        if (matched) {
          handleSpinAnimation(matched, targetAngle);
        }
      }
    );

    return () => unsubscribe();
  }, [currentRoom?.id, contenders, isSpinning, rotation, handleSpinAnimation]);

  const handleStartSpin = () => {
    if (isSpinning || !isHost || slices.length === 0 || isSubmitting || !currentRoom) return;

    const winnerIdx = Math.floor(Math.random() * contenders.length);
    const chosenSlice = slices[winnerIdx];
    const chosenCat = contenders[winnerIdx];
    if (!chosenSlice || !chosenCat) return;

    const spins = 5 + Math.floor(Math.random() * 3);
    const currentBase = Math.floor(rotation / 360) * 360;
    const targetAngle = currentBase + spins * 360 + (360 - chosenSlice.midAngle);

    // 1. Immediately fire local animation
    handleSpinAnimation(chosenCat, targetAngle);

    // 2. Concurrently broadcast in background
    broadcastCategoryRouletteSpin(currentRoom.id, {
      winnerId: chosenCat.id,
      targetAngle,
    }).catch((err) => {
      console.warn('Failed to broadcast category roulette spin', err);
    });
  };

  const handleProceed = async () => {
    if (!isHost || !winner || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await resolveConsensus(winner.id, 'random_picked');
    } catch (err) {
      console.error('Error proceeding from category tiebreaker', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentRoom) return null;

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-8 selection:bg-brand-redSoft">
      <div>
        {/* Header */}
        <Header
          showBack={false}
          showMenu={false}
          participantCount={participants.length}
          showCount={true}
        />

        {/* Heading & Drama Notice */}
        <div className="text-center mt-2 mb-2 px-2 relative">
          <DoodleSquiggle className="absolute -top-1 start-4 transform -rotate-12 pointer-events-none" color="#F0443E" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/15 border border-brand-red/30 text-xs font-bold text-brand-red mb-2">
            <span>⚔️ {t('tiebreaker.heading')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-ink mb-1 font-alexandria tracking-tight">
            {t('categoryRoulette.title')}
          </h2>
          <p className="text-brand-gray text-xs sm:text-sm font-medium max-w-xs mx-auto">
            {t('categoryRoulette.subtitle')}
          </p>

          {/* Tied Contenders Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
            {contenders.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] text-xs font-black text-[#241B18]"
              >
                <span>{cat.icon}</span>
                <span>{locale === 'ar' ? cat.ar : cat.en}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Center Arcade Wheel Stage */}
        <div className="flex flex-col items-center justify-center my-2">
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
        </div>

        {/* Bottom Controls / Winner Reveal Card */}
        <div className="max-w-md w-full mx-auto mt-2">
          <AnimatePresence mode="wait">
            {showWinnerCard && winner ? (
              <motion.div
                key="winner-card"
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 24 }}
                className="w-full bg-[#FFFDF8] border-2 border-[#241B18] rounded-2xl p-4 shadow-[0px_4px_0px_#241B18] text-center flex flex-col items-center gap-2.5"
              >
                {/* Winner Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD75A] border-2 border-[#241B18] text-xs font-black text-[#241B18] shadow-[0px_2px_0px_#241B18]">
                  {t('categoryRoulette.winnerBadge')}
                </span>

                {/* Category Icon & Name */}
                <div className="flex flex-col items-center">
                  <span className="text-5xl my-1 filter drop-shadow-sm">{winner.icon}</span>
                  <h3 className="text-2xl font-black text-[#241B18] font-alexandria tracking-tight">
                    {locale === 'ar' ? winner.ar : winner.en}
                  </h3>
                </div>

                {/* Host Proceed CTA OR Guest Waiting Notice */}
                {isHost ? (
                  <div className="w-full flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleProceed}
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 rounded-xl bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all font-alexandria font-black text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      <span>🚀</span>
                      <span>{t('categoryRoulette.proceed')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartSpin}
                      disabled={isSpinning || isSubmitting}
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
                  <div className="relative">
                    <SparkleRays
                      className="absolute -top-3 end-4 transform rotate-12 scale-75 pointer-events-none"
                      color="#FFD75A"
                    />
                    <TactileButton
                      onClick={handleStartSpin}
                      disabled={isSpinning || isSubmitting}
                      isLoading={isSpinning}
                      variant="yellow"
                      fullWidth
                      size="lg"
                      icon="🎯"
                    >
                      {isSpinning
                        ? t('gameSwiper.rouletteSpinning')
                        : t('categoryRoulette.spinBtn')}
                    </TactileButton>
                  </div>
                ) : (
                  <div className="py-3 px-4 rounded-2xl bg-[#FFF8F1] border-2 border-[#241B18]/20 text-xs font-black text-[#7A6E67] font-alexandria w-full animate-pulse flex items-center justify-center gap-2">
                    <span>👀</span>
                    <span>{t('categoryRoulette.waitingHost')}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
