import React from 'react';
import confetti from 'canvas-confetti';
import { useLocale } from '../../context/LocaleContext';

interface TactileActionDockProps {
  onSwipe: (liked: boolean) => void;
  onSkip: () => void;
  disabled: boolean;
}

export const TactileActionDock: React.FC<TactileActionDockProps> = ({
  onSwipe,
  onSkip,
  disabled,
}) => {
  const { t } = useLocale();

  const handlePick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#55B96A', '#FFD75A', '#FFF8F1', '#241B18'],
        ticks: 180,
        gravity: 1.2,
      });
    } catch {
      // safe fallback
    }

    onSwipe(true);
  };

  const handlePass = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onSwipe(false);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onSkip();
  };

  return (
    <div
      className="fixed bottom-5 inset-x-0 flex justify-center items-center gap-3 sm:gap-4 z-30 pointer-events-auto px-4 max-w-sm mx-auto select-none"
    >
      {/* Pass Button - Red */}
      <button
        type="button"
        disabled={disabled}
        onClick={handlePass}
        aria-label={t('gameSwiper.dislike')}
        className="flex-1 py-3 px-3 rounded-2xl bg-[#F0443E] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-alexandria font-black text-sm sm:text-base cursor-pointer"
      >
        <span className="text-base sm:text-lg">❌</span>
        <span>{t('gameSwiper.dislike')}</span>
      </button>

      {/* Skip/Later Button - Butter Yellow */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleSkip}
        aria-label={t('gameSwiper.skip')}
        className="flex-1 py-3 px-3 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-alexandria font-black text-sm sm:text-base cursor-pointer"
      >
        <span className="text-base sm:text-lg">⏭️</span>
        <span>{t('gameSwiper.skip')}</span>
      </button>

      {/* Pick Button - Green */}
      <button
        type="button"
        disabled={disabled}
        onClick={handlePick}
        aria-label={t('gameSwiper.like')}
        className="flex-1 py-3 px-3 rounded-2xl bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-alexandria font-black text-sm sm:text-base cursor-pointer"
      >
        <span className="text-base sm:text-lg">❤️</span>
        <span>{t('gameSwiper.like')}</span>
      </button>
    </div>
  );
};

