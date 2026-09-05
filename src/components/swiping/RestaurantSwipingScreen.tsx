import React from 'react';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { useRestaurantSwiper } from '../../hooks/useRestaurantSwiper';
import { SwipeCard } from './SwipeCard';
import { TactileActionDock } from './TactileActionDock';
import { SquadSwipingHUD } from './SquadSwipingHUD';
import { WaitingForSquadCard } from './WaitingForSquadCard';
import { Header } from '../common/Header';

interface RestaurantSwipingScreenProps {
  onMatched?: (winnerId: string) => void;
}

export const RestaurantSwipingScreen: React.FC<RestaurantSwipingScreenProps> = () => {
  const { currentRoom, currentParticipant, participants, isHost } = useRoom();
  const { t } = useLocale();

  const {
    deck,
    currentIndex,
    isDeckFinished,
    isLoadingDeck,
    recordSwipe,
    allSwipes,
  } = useRestaurantSwiper({
    roomId: currentRoom?.id || '',
    participantId: currentParticipant?.id || '',
    isHost,
    totalParticipants: participants.length,
    category: currentRoom?.winning_category || 'burger',
    city: currentRoom?.city || 'riyadh',
    district: currentRoom?.district || currentRoom?.neighborhood || undefined,
    stage: currentRoom?.stage,
    onMatched: (_winner) => {
      // Handled in room state sync
    },
  });

  if (!currentRoom || !currentParticipant) return null;

  // Render cards in 3-tier visual stack
  // Stack contains top card (stackIndex 0), second card (stackIndex 1), third card (stackIndex 2)
  const visibleCards = deck.slice(currentIndex, currentIndex + 3);

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-3 pb-24 selection:bg-[#FFF0EE]">
      <div>
        {/* Top Header */}
        <Header showBack={false} showMenu={false} participantCount={participants.length} showCount={false} />

        {/* Live Squad Progress HUD */}
        <SquadSwipingHUD
          participants={participants}
          swipes={allSwipes}
          totalCards={deck.length}
        />

        {/* Section Headline */}
        <div className="text-center mt-1 mb-3 px-2">
          <h2 className="text-xl sm:text-2xl font-black text-[#241B18] font-alexandria tracking-tight">
            {t('swiping.title')}
          </h2>
          <p className="text-xs font-semibold text-[#7A6E67] font-alexandria">
            {t('swiping.subtitle')}
          </p>
        </div>

        {/* Swiping Card Stage / Waiting Card */}
        <div className="relative w-full max-w-[360px] mx-auto min-h-[420px] flex items-center justify-center">
          {isLoadingDeck && deck.length === 0 ? (
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
          ) : isDeckFinished ? (
            <WaitingForSquadCard
              participants={participants}
              swipes={allSwipes}
              totalCards={deck.length}
            />
          ) : (
            <div className="relative w-full h-[420px]">
              {/* Render in reverse order so top card renders last on DOM */}
              {visibleCards
                .map((item, idx) => ({ item, idx }))
                .reverse()
                .map(({ item, idx }) => (
                  <SwipeCard
                    key={item.id}
                    restaurant={item}
                    isFront={idx === 0}
                    stackIndex={idx}
                    onSwipe={recordSwipe}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Dock (Pass, Super-Like, Like) */}
      {!isDeckFinished && (
        <TactileActionDock
          onSwipe={recordSwipe}
          disabled={isDeckFinished}
        />
      )}
    </div>
  );
};
