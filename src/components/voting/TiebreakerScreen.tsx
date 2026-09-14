import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { ArcadeWheel, type ArcadeWheelSlice } from '../common/ArcadeWheel';
import { getCategoryById, NEO_BRUTALIST_PALETTE } from '../../lib/consensus';
import { useContinuousRoulette } from '../../hooks/useContinuousRoulette';

export const TiebreakerScreen: React.FC = () => {
  const { currentRoom, isHost, participants, decisionSpin, startCategoryRoulette } = useRoom();
  const { t, locale } = useLocale();
  const reduceMotion = useReducedMotion();
  const [isStarting, setIsStarting] = useState(false);
  const spin = decisionSpin?.kind === 'category' ? decisionSpin : null;
  const contenders = useMemo(() => (spin?.candidateIds || currentRoom?.tied_categories || []).map(getCategoryById).filter(Boolean), [spin?.candidateIds, currentRoom?.tied_categories]);
  const slices = useMemo<ArcadeWheelSlice[]>(() => contenders.map((category, index) => ({
    id: category!.id, name: locale === 'ar' ? category!.ar : category!.en, emoji: category!.icon, votes: 1,
    color: NEO_BRUTALIST_PALETTE[index % NEO_BRUTALIST_PALETTE.length], startAngle: index * 360 / contenders.length,
    endAngle: (index + 1) * 360 / contenders.length, midAngle: (index + .5) * 360 / contenders.length, angle: 360 / contenders.length,
  })), [contenders, locale]);
  const winner = spin?.winnerId ? getCategoryById(spin.winnerId) : undefined;

  const { rotation, isSpinning, revealed } = useContinuousRoulette({
    spin,
    slices,
    reducedMotion: Boolean(reduceMotion),
    onRevealed: () => {
      if (!reduceMotion) {
        navigator.vibrate?.(12);
        confetti({ particleCount: 35, spread: 55, origin: { y: .55 }, colors: ['#FFD75A', '#55B96A', '#F0443E'] });
      }
    },
  });

  if (!currentRoom) return null;
  const choose = async () => {
    if (!isHost || spin || isStarting) return;
    setIsStarting(true);
    navigator.vibrate?.(8);
    try { await startCategoryRoulette(); }
    catch (error) { console.error('Error resolving category tie', error); }
    finally { setIsStarting(false); }
  };

  return <div className="relative flex min-h-[92dvh] w-full flex-col justify-between px-4 pb-8">
    <div><Header showBack={false} showMenu={false} participantCount={participants.length} showCount />
      <div className="mb-3 mt-2 text-center"><h2 className="font-alexandria text-2xl font-extrabold text-brand-ink">{t('categoryRoulette.title')}</h2>
        <p className="text-sm font-medium text-brand-gray">{currentRoom?.category_summary?.allWildcard ? t('gameSwiper.everyoneWildcardNotice') : t('categoryRoulette.subtitle')}</p></div>
      <div className="mb-4 flex flex-wrap justify-center gap-2">{contenders.map((category) => <span key={category!.id} className="rounded-full border-2 border-brand-ink bg-white px-3 py-1 text-xs font-black">{category!.icon} {locale === 'ar' ? category!.ar : category!.en}</span>)}</div>
      <div className="flex justify-center"><ArcadeWheel slices={slices} rotation={rotation} isSpinning={isSpinning} durationMs={0} reducedMotion={Boolean(reduceMotion)} /></div>
      <div aria-live="polite" className="mx-auto mt-4 min-h-24 w-full max-w-sm text-center"><AnimatePresence mode="wait">
        {revealed && winner ? <motion.div key="winner" initial={{ opacity: 0, scale: .9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="rounded-2xl border-2 border-brand-ink bg-brand-yellow p-3 shadow-[0_4px_0_#241B18]">
          <div className="text-4xl">{winner.icon}</div><div className="font-alexandria text-xl font-black text-brand-ink">{locale === 'ar' ? winner.ar : winner.en}</div>
        </motion.div> : spin ? <motion.p key="spinning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-alexandria text-sm font-black text-brand-red">{t('gameSwiper.rouletteSpinning')}</motion.p> : null}
      </AnimatePresence></div>
    </div>
    <div className="mx-auto w-full max-w-md">{isHost ? <TactileButton onClick={choose} disabled={isStarting || Boolean(spin) || slices.length < 2} isLoading={isStarting} variant="yellow" fullWidth size="lg" icon="🎯">{t('categoryRoulette.spinBtn')}</TactileButton>
      : <div className="rounded-2xl border-2 border-brand-ink/20 bg-white p-3 text-center text-xs font-black text-brand-gray">{t('categoryRoulette.waitingHost')}</div>}</div>
  </div>;
};
