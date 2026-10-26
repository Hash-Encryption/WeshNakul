import React from 'react';
import { useLocale } from '../../context/LocaleContext';
import type { RestaurantVote } from '../../types/restaurant';
import { playTactilePop, triggerHaptic } from '../../lib/haptics';

interface TactileActionDockProps {
  onVote: (vote: RestaurantVote) => void;
  disabled: boolean;
  onInteract?: () => void;
}

export const TactileActionDock: React.FC<TactileActionDockProps> = ({
  onVote,
  disabled,
  onInteract,
}) => {
  const { t } = useLocale();

  const handlePick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInteract?.();
    if (disabled) return;
    playTactilePop(220);
    triggerHaptic(16);
    onVote('YES');
  };

  const handlePass = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInteract?.();
    if (disabled) return;
    playTactilePop(150);
    triggerHaptic(10);
    onVote('NO');
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInteract?.();
    if (disabled) return;
    playTactilePop(180);
    triggerHaptic(12);
    onVote('LATER');
  };

  return (
    <div
      onPointerDownCapture={onInteract}
      onTouchStartCapture={onInteract}
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] inset-x-0 flex justify-center items-center gap-2.5 sm:gap-3.5 z-30 pointer-events-auto px-4 max-w-sm mx-auto select-none"
    >
      {/* Pass Button - Red */}
      <button
        type="button"
        disabled={disabled}
        onClick={handlePass}
        onPointerDownCapture={onInteract}
        onTouchStartCapture={onInteract}
        aria-label={t('gameSwiper.dislike')}
        className="flex-1 h-13 py-3 px-2 sm:px-3 rounded-2xl bg-[#F0443E] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-alexandria font-black text-xs sm:text-sm cursor-pointer"
      >
        <span className="text-sm sm:text-base">❌</span>
        <span>{t('gameSwiper.dislike')}</span>
      </button>

      {/* Skip/Later Button - Butter Yellow */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleSkip}
        onPointerDownCapture={onInteract}
        onTouchStartCapture={onInteract}
        aria-label={t('gameSwiper.skip')}
        className="flex-1 h-13 py-3 px-2 sm:px-3 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-alexandria font-black text-xs sm:text-sm cursor-pointer"
      >
        <span className="text-sm sm:text-base">⏭️</span>
        <span>{t('gameSwiper.skip')}</span>
      </button>

      {/* Pick Button - Green */}
      <button
        type="button"
        disabled={disabled}
        onClick={handlePick}
        onPointerDownCapture={onInteract}
        onTouchStartCapture={onInteract}
        aria-label={t('gameSwiper.like')}
        className="flex-1 h-13 py-3 px-2 sm:px-3 rounded-2xl bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 font-alexandria font-black text-xs sm:text-sm cursor-pointer"
      >
        <span className="text-sm sm:text-base">❤️</span>
        <span>{t('gameSwiper.like')}</span>
      </button>
    </div>
  );
};

