import React, { useMemo, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ArcadeWheel, type ArcadeWheelSlice } from '../common/ArcadeWheel';
import { TactileButton } from '../common/TactileButton';
import { NEO_BRUTALIST_PALETTE } from '../../lib/consensus';
import { useLocale } from '../../context/LocaleContext';
import { useRoom } from '../../context/RoomContext';
import { useContinuousRoulette } from '../../hooks/useContinuousRoulette';
import type { DecisionSpin } from '../../types/roulette';
import type { RestaurantItem } from '../../types/restaurant';

export const RestaurantRouletteOverlay: React.FC<{ spin: DecisionSpin; restaurants: RestaurantItem[] }> = ({ spin, restaurants }) => {
  const { t, locale } = useLocale();
  const { completeDecisionSpin, retryDecisionSpin, isHost } = useRoom();
  const reduceMotion = useReducedMotion();
  const [isSpinningLong, setIsSpinningLong] = useState(false);

  useEffect(() => {
    if (!spin || spin.winnerId || spin.error) {
      setIsSpinningLong(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setIsSpinningLong(true);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [spin]);

  const candidates = useMemo(() => spin.candidateIds.map((id) => restaurants.find((item) => item.id === id)).filter(Boolean) as RestaurantItem[], [spin.candidateIds, restaurants]);
  const slices = useMemo<ArcadeWheelSlice[]>(() => candidates.map((restaurant, index) => ({
    id: restaurant.id,
    name: locale === 'ar' ? restaurant.nameAr : restaurant.nameEn,
    emoji: '🍽️',
    votes: 1,
    color: NEO_BRUTALIST_PALETTE[index % NEO_BRUTALIST_PALETTE.length],
    startAngle: (index * 360) / candidates.length,
    endAngle: ((index + 1) * 360) / candidates.length,
    midAngle: ((index + 0.5) * 360) / candidates.length,
    angle: 360 / candidates.length,
  })), [candidates, locale]);
  const winner = spin.winnerId ? candidates.find((item) => item.id === spin.winnerId) : undefined;

  const { wheelRef, needleRef, isSpinning, revealed } = useContinuousRoulette({
    spin,
    slices,
    reducedMotion: Boolean(reduceMotion),
    onRevealed: () => {
      if (!reduceMotion) {
        navigator.vibrate?.(15);
        confetti({ particleCount: 35, spread: 55, origin: { y: 0.55 }, colors: ['#FFD75A', '#55B96A', '#F0443E'] });
      }
    },
    onComplete: () => {
      completeDecisionSpin();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-live="polite">
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} className="flex w-full max-w-sm flex-col items-center rounded-[28px] border-2 border-brand-ink bg-[#FFFDF8] p-4 text-center shadow-[0_8px_0_#241B18]">
        <h3 className="font-alexandria text-xl font-black text-brand-ink">{t('gameSwiper.rouletteBtn')}</h3>
        <ArcadeWheel
          slices={slices}
          wheelRef={wheelRef}
          needleRef={needleRef}
          isSpinning={isSpinning}
          reducedMotion={Boolean(reduceMotion)}
        />
        {revealed && winner ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full rounded-2xl border-2 border-brand-ink bg-brand-yellow p-3 shadow-[0_3px_0_#241B18]">
            <div className="text-xs font-black uppercase">{t('gameSwiper.rouletteWinnerBadge')}</div>
            <div className="font-alexandria text-xl font-black">{locale === 'ar' ? winner.nameAr : winner.nameEn}</div>
          </motion.div>
        ) : spin.error && isHost ? (
          <div className="flex flex-col items-center gap-2 w-full mt-2">
            <div className="rounded-xl border-2 border-brand-red bg-rose-50 p-2 text-xs font-black text-brand-red w-full">
              {locale === 'ar' ? 'تعذر حسم التعادل تلقائياً. يرجى المحاولة مرة أخرى.' : 'Resolution timed out. Please try again.'}
            </div>
            <TactileButton onClick={retryDecisionSpin} variant="yellow" fullWidth size="md" icon="🔄">
              {locale === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
            </TactileButton>
          </div>
        ) : (
          <p className="min-h-10 font-alexandria text-sm font-black text-brand-red flex items-center justify-center gap-1.5">
            {isSpinningLong ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                <span>{locale === 'ar' ? 'جاري الحسم...' : 'Still deciding...'}</span>
              </>
            ) : (
              t('gameSwiper.rouletteSpinning')
            )}
          </p>
        )}
      </motion.div>
    </div>
  );
};
