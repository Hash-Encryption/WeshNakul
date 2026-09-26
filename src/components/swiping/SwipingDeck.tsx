import React, { useCallback, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import type { RestaurantItem, RestaurantVote } from '../../types/restaurant';
import { SwipeCard } from './SwipeCard';
import { TactileActionDock } from './TactileActionDock';
import { useLocale } from '../../context/LocaleContext';

interface SwipingDeckProps {
  deck: RestaurantItem[];
  currentIndex: number;
  totalCards: number;
  isLoading: boolean;
  onVote: (vote: RestaurantVote) => void;
}

export const SwipingDeck: React.FC<SwipingDeckProps> = ({
  deck,
  currentIndex,
  totalCards,
  isLoading,
  onVote,
}) => {
  const { t, locale } = useLocale();
  const [exitVote, setExitVote] = useState<RestaurantVote>('LATER');
  const vote = useCallback((nextVote: RestaurantVote) => {
    setExitVote(nextVote);
    onVote(nextVote);
  }, [onVote]);

  // Active-card and deck bounds safety
  const safeDeck = Array.isArray(deck)
    ? deck.filter((r): r is RestaurantItem => Boolean(r && typeof r === 'object' && r.id))
    : [];
  const safeTotal = totalCards > 0 ? totalCards : safeDeck.length;
  const safeIndex = Number.isFinite(currentIndex) ? Math.max(0, Math.floor(currentIndex)) : 0;

  const progressPercentage = safeTotal > 0
    ? Math.min(100, Math.round((safeIndex / safeTotal) * 100))
    : 0;

  const currentCardNumber = Math.min(safeIndex + 1, safeTotal);
  const visibleCards = safeDeck
    .slice(safeIndex, safeIndex + 3)
    .filter((item): item is RestaurantItem => Boolean(item && item.id));

  const isExhausted = safeDeck.length > 0 && safeIndex >= safeDeck.length;

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
          <span>{t('gameSwiper.counter', { current: currentCardNumber, total: safeTotal })}</span>
        </div>
      </div>

      {/* 3. Interactive Swiping Cards Stage */}
      <div className="relative w-full max-w-[360px] mx-auto min-h-[420px] flex items-center justify-center">
        {isLoading && safeDeck.length === 0 ? (
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
        ) : isExhausted ? (
          /* Safe transitional state when user has swiped all cards and summary is synchronizing */
          <div className="w-full h-[420px] bg-white rounded-3xl border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] p-6 flex flex-col items-center justify-center text-center">
            <span className="text-4xl animate-bounce mb-3">✨</span>
            <h3 className="font-alexandria font-black text-lg text-[#241B18]">
              {locale === 'ar' ? 'اكتملت اختياراتك!' : 'Picks Recorded!'}
            </h3>
            <p className="font-alexandria text-xs text-[#7A6E67] mt-1 max-w-[240px]">
              {locale === 'ar' ? 'جاري تجهيز نتائج وتفضيلات القروب...' : 'Syncing group preferences...'}
            </p>
          </div>
        ) : (
          <div className="relative w-full h-[420px]">
            <AnimatePresence initial={false} custom={exitVote}>
              {visibleCards
                .map((item, idx) => ({ item, idx }))
                .reverse()
                .map(({ item, idx }) => (
                  <SwipeCard
                    key={item.id}
                    restaurant={item}
                    isFront={idx === 0}
                    stackIndex={idx}
                    onVote={vote}
                  />
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 4. Tactile 3-Button Controller (Pass, Skip, Pick) */}
      <TactileActionDock
        onVote={vote}
        disabled={safeIndex >= safeTotal || isExhausted || visibleCards.length === 0}
      />
    </div>
  );
};
