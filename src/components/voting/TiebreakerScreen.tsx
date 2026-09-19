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
import { SocialSuggestionAvatars } from '../common/SocialSuggestionAvatars';

export const TiebreakerScreen: React.FC = () => {
  const {
    currentRoom,
    currentParticipant,
    isHost,
    participants,
    decisionSpin,
    startCategoryRoulette,
    completeDecisionSpin,
    retryDecisionSpin,
    suggestions,
    toggleSuggestion,
  } = useRoom();
  const { t, locale } = useLocale();
  const reduceMotion = useReducedMotion();
  const [isStarting, setIsStarting] = useState(false);
  const [isSpinningLong, setIsSpinningLong] = useState(false);

  const spin = decisionSpin?.kind === 'category' ? decisionSpin : null;

  React.useEffect(() => {
    if (!spin || spin.winnerId || spin.error) {
      setIsSpinningLong(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setIsSpinningLong(true);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [spin]);

  const contenders = useMemo(
    () => (spin?.candidateIds || currentRoom?.tied_categories || []).map((id) => getCategoryById(id, currentRoom?.room_mode)).filter(Boolean),
    [spin?.candidateIds, currentRoom?.tied_categories, currentRoom?.room_mode]
  );
  const slices = useMemo<ArcadeWheelSlice[]>(() => contenders.map((category, index) => ({
    id: category!.id,
    name: locale === 'ar' ? category!.ar : category!.en,
    emoji: category!.icon,
    votes: 1,
    color: NEO_BRUTALIST_PALETTE[index % NEO_BRUTALIST_PALETTE.length],
    startAngle: (index * 360) / contenders.length,
    endAngle: ((index + 1) * 360) / contenders.length,
    midAngle: ((index + 0.5) * 360) / contenders.length,
    angle: 360 / contenders.length,
  })), [contenders, locale]);

  const winner = spin?.winnerId ? getCategoryById(spin.winnerId, currentRoom?.room_mode) : undefined;

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

  if (!currentRoom) return null;

  const choose = async () => {
    if (!isHost || spin || isStarting) return;
    setIsStarting(true);
    navigator.vibrate?.(8);
    try {
      await startCategoryRoulette();
    } catch (error) {
      console.error('Error resolving category tie', error);
    } finally {
      setIsStarting(false);
    }
  };

  const hasError = Boolean(spin?.error);

  return (
    <div className="relative mx-auto flex min-h-[92dvh] w-full max-w-md flex-col justify-between px-4 pb-8">
      <div>
        <Header showBack={false} showMenu={false} participantCount={participants.length} showCount />
        <div className="mb-2 mt-2 text-center">
          <h2 className="font-alexandria text-2xl font-extrabold text-brand-ink">{t('categoryRoulette.title')}</h2>
          <p className="text-xs font-medium text-brand-gray">
            {currentRoom?.category_summary?.allWildcard ? t('gameSwiper.everyoneWildcardNotice') : t('categoryRoulette.subtitle')}
          </p>
        </div>

        {/* Contender Badges */}
        <div className="mb-3 flex flex-wrap justify-center gap-2">
          {contenders.map((category) => (
            <span
              key={category!.id}
              className="rounded-full border-2 border-brand-ink bg-white px-3 py-1 text-xs font-black shadow-[0_2px_0_#241B18]"
            >
              {category!.icon} {locale === 'ar' ? category!.ar : category!.en}
            </span>
          ))}
        </div>

        {/* Central Wheel */}
        <div className="flex justify-center">
          <ArcadeWheel
            slices={slices}
            wheelRef={wheelRef}
            needleRef={needleRef}
            isSpinning={isSpinning}
            reducedMotion={Boolean(reduceMotion)}
          />
        </div>

        {/* Immediate Reveal Area Directly Below Wheel */}
        <div aria-live="polite" className="mx-auto mt-3 min-h-20 w-full max-w-xs text-center">
          <AnimatePresence mode="wait">
            {revealed && winner ? (
              <motion.div
                key="winner"
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="rounded-2xl border-2 border-brand-ink bg-brand-yellow p-3 shadow-[0_4px_0_#241B18]"
              >
                <div className="text-3xl">{winner.icon}</div>
                <div className="font-alexandria text-lg font-black text-brand-ink">
                  {locale === 'ar' ? winner.ar : winner.en}
                </div>
              </motion.div>
            ) : hasError && isHost ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border-2 border-brand-red bg-rose-50 p-2 text-xs font-black text-brand-red"
              >
                {locale === 'ar' ? 'تعذر حسم التعادل تلقائياً. يرجى المحاولة مرة أخرى.' : 'Resolution timed out. Please try again.'}
              </motion.div>
            ) : spin ? (
              <motion.div
                key={isSpinningLong ? 'spinning-long' : 'spinning'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-2 rounded-full border-2 border-brand-ink/30 bg-white/80 px-3 py-1 text-xs font-black text-brand-ink shadow-sm"
              >
                <span className="inline-block animate-spin">{isSpinningLong ? '⏳' : '🎯'}</span>
                <span>
                  {isSpinningLong
                    ? (locale === 'ar' ? 'جاري الحسم...' : 'Still deciding...')
                    : (!isHost ? (locale === 'ar' ? 'جاري اختيار الفائز للجميع...' : t('gameSwiper.rouletteSpinning')) : t('gameSwiper.rouletteSpinning'))}
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Action Controls */}
      <div className="mx-auto w-full">
        {hasError && isHost ? (
          <div className="flex flex-col items-center gap-2">
            <TactileButton onClick={retryDecisionSpin} variant="yellow" fullWidth size="lg" icon="🔄">
              {locale === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
            </TactileButton>
          </div>
        ) : isHost ? (
          <div className="flex flex-col items-center gap-2">
            <TactileButton
              onClick={choose}
              disabled={isStarting || Boolean(spin) || slices.length < 2}
              isLoading={isStarting}
              variant="yellow"
              fullWidth
              size="lg"
              icon="🎯"
            >
              {t('categoryRoulette.spinBtn')}
            </TactileButton>
            <SocialSuggestionAvatars suggestions={suggestions} target="action:spin_again" className="justify-center" />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              disabled={Boolean(spin)}
              onClick={() => toggleSuggestion('action:spin_again')}
              className={`w-full rounded-2xl border-2 p-3 text-center text-xs font-black font-alexandria transition-all ${
                spin ? 'cursor-default opacity-80' : 'cursor-pointer'
              } ${
                suggestions.some((s) => s.target === 'action:spin_again' && s.participant_id === currentParticipant?.id)
                  ? 'bg-amber-100 text-brand-ink border-amber-400'
                  : 'bg-white border-brand-ink/20 text-brand-gray hover:bg-stone-50'
              }`}
            >
              {spin
                ? (isSpinningLong
                    ? (locale === 'ar' ? '⏳ جاري الحسم...' : '⏳ Still deciding...')
                    : (locale === 'ar' ? '🎯 جاري اختيار الفائز للجميع...' : t('gameSwiper.rouletteSpinning')))
                : `${t('categoryRoulette.waitingHost')} • ${t('suggestions.spinAgain')} 🎯`}
            </button>
            {!spin && <SocialSuggestionAvatars suggestions={suggestions} target="action:spin_again" className="justify-center" />}
          </div>
        )}
      </div>
    </div>
  );
};
