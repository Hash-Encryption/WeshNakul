import React from 'react';
import type { RestaurantItem } from '../../types/restaurant';
import { SwipeCard } from './SwipeCard';
import { TactileActionDock } from './TactileActionDock';
import { useLocale } from '../../context/LocaleContext';

interface SwipingDeckProps {
  deck: RestaurantItem[];
  currentIndex: number;
  totalCards: number;
  isLoading: boolean;
  onSwipe: (liked: boolean) => void;
  onSkip: () => void;
}

export const SwipingDeck: React.FC<SwipingDeckProps> = ({
  deck,
  currentIndex,
  totalCards,
  isLoading,
  onSwipe,
  onSkip,
}) => {
  const { t } = useLocale();

  const progressPercentage = totalCards > 0
    ? Math.min(100, Math.round((currentIndex / totalCards) * 100))
    : 0;

  const currentCardNumber = Math.min(currentIndex + 1, totalCards);
  const visibleCards = deck.slice(currentIndex, currentIndex + 3);

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* 1. Top Edge Arcade Progress Bar */}
      <div className="fixed top-0 inset-x-0 z-50 h-2 bg-[#F2E8DF] border-b border-[#241B18]/15">
        <div
          style={{ width: `${progressPercentage}%` }}
          className="h-full bg-[#55B96A] transition-all duration-300 ease-out"
        />
      </div>

      {/* 2. Header Counter Badge */}
      <div className="flex justify-center mb-3 mt-1">
        <div className="inline-flex items-center gap-1.5 bg-white border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] px-3.5 py-1 rounded-full text-xs font-black text-[#241B18] font-alexandria">
          <span>{t('gameSwiper.counter', { current: currentCardNumber, total: totalCards })}</span>
        </div>
      </div>

      {/* 3. Interactive Swiping Cards Stage */}
      <div className="relative w-full max-w-[360px] mx-auto min-h-[420px] flex items-center justify-center">
        {isLoading && deck.length === 0 ? (
          <div className="w-full h-[420px] bg-white rounded-3xl border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] p-4 flex flex-col justify-between animate-pulse">
            <div className="h-52 bg-[#FFF8F1] rounded-2xl border-2 border-[#241B18]/10" />
            <div className="space-y-3 py-2">
              <div className="h-6 bg-[#F2E8DF] rounded-md w-3/4" />
              <div className="h-12 bg-[#FFF8F1] rounded-xl border border-[#241B18]/10" />
              <div className="flex gap-2">
                <div className="h-6 bg-[#F2E8DF] rounded-full w-16" />
                <div className="h-6 bg-[#F2E8DF] rounded-full w-20" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-[420px]">
            {visibleCards
              .map((item, idx) => ({ item, idx }))
              .reverse()
              .map(({ item, idx }) => (
                <SwipeCard
                  key={item.id}
                  restaurant={item}
                  isFront={idx === 0}
                  stackIndex={idx}
                  onSwipe={onSwipe}
                />
              ))}
          </div>
        )}
      </div>

      {/* 4. Tactile 3-Button Controller (Pass, Skip, Pick) */}
      <TactileActionDock
        onSwipe={onSwipe}
        onSkip={onSkip}
        disabled={currentIndex >= totalCards}
      />
    </div>
  );
};
