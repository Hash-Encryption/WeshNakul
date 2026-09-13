import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArcadeWheel, type ArcadeWheelSlice } from '../common/ArcadeWheel';
import { NEO_BRUTALIST_PALETTE } from '../../lib/consensus';
import { useLocale } from '../../context/LocaleContext';
import type { DecisionSpin } from '../../types/roulette';
import type { RestaurantItem } from '../../types/restaurant';

export const RestaurantRouletteOverlay: React.FC<{ spin: DecisionSpin; restaurants: RestaurantItem[] }> = ({ spin, restaurants }) => {
  const { t, locale } = useLocale();
  const reduceMotion = useReducedMotion();
  const [rotation, setRotation] = useState(0);
  const [duration, setDuration] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const candidates = useMemo(() => spin.candidateIds.map((id) => restaurants.find((item) => item.id === id)).filter(Boolean) as RestaurantItem[], [spin.candidateIds, restaurants]);
  const slices = useMemo<ArcadeWheelSlice[]>(() => candidates.map((restaurant, index) => ({
    id: restaurant.id, name: locale === 'ar' ? restaurant.nameAr : restaurant.nameEn, emoji: '🍽️', votes: 1,
    color: NEO_BRUTALIST_PALETTE[index % NEO_BRUTALIST_PALETTE.length], startAngle: index * 360 / candidates.length,
    endAngle: (index + 1) * 360 / candidates.length, midAngle: (index + .5) * 360 / candidates.length, angle: 360 / candidates.length,
  })), [candidates, locale]);
  const winner = spin.winnerId ? candidates.find((item) => item.id === spin.winnerId) : undefined;

  useEffect(() => {
    const slice = spin.winnerId ? slices.find((item) => item.id === spin.winnerId) : undefined;
    const endAt = slice ? spin.revealAt! : spin.plannedRevealAt;
    // Animation state deliberately begins when the shared spin event arrives.
    // oxlint-disable-next-line react/set-state-in-effect
    setDuration(reduceMotion ? 0 : Math.max(150, endAt - Date.now()));
    const frame = requestAnimationFrame(() => setRotation(slice ? 2160 + (360 - slice.midAngle) : 1440));
    const timer = slice ? window.setTimeout(() => setRevealed(true), Math.max(0, endAt - Date.now())) : undefined;
    return () => { cancelAnimationFrame(frame); if (timer) window.clearTimeout(timer); };
  }, [spin, slices, reduceMotion]);

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-live="polite">
    <motion.div initial={{ opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} className="flex w-full max-w-sm flex-col items-center rounded-[28px] border-2 border-brand-ink bg-[#FFFDF8] p-4 text-center shadow-[0_8px_0_#241B18]">
      <h3 className="font-alexandria text-xl font-black text-brand-ink">{t('gameSwiper.rouletteBtn')}</h3>
      <ArcadeWheel slices={slices} rotation={rotation} isSpinning={!revealed} durationMs={duration} reducedMotion={Boolean(reduceMotion)} />
      {revealed && winner ? <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full rounded-2xl border-2 border-brand-ink bg-brand-yellow p-3 shadow-[0_3px_0_#241B18]">
        <div className="text-xs font-black uppercase">{t('gameSwiper.rouletteWinnerBadge')}</div>
        <div className="font-alexandria text-xl font-black">{locale === 'ar' ? winner.nameAr : winner.nameEn}</div>
      </motion.div> : <p className="min-h-10 font-alexandria text-sm font-black text-brand-red">{t('gameSwiper.rouletteSpinning')}</p>}
    </motion.div>
  </div>;
};
