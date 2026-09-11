import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { useRestaurantSwiper } from '../../hooks/useRestaurantSwiper';
import { SwipingDeck } from './SwipingDeck';
import { LeaderboardView } from './LeaderboardView';
import { ConfirmWinnerModal } from './ConfirmWinnerModal';
import { SuddenDeathModal } from './SuddenDeathModal';
import { SquadSwipingHUD } from './SquadSwipingHUD';
import { Header } from '../common/Header';
import { Toast } from '../common/Toast';
import type { RestaurantItem } from '../../types/restaurant';
import {
  broadcastSuddenDeath,
  subscribeToSuddenDeath,
  resolveRestaurantTie,
} from '../../lib/supabase';

interface RestaurantSwipingScreenProps {
  onMatched?: (winnerId: string) => void;
}

export const RestaurantSwipingScreen: React.FC<RestaurantSwipingScreenProps> = () => {
  const { currentRoom, currentParticipant, participants, isHost, refreshRoom } = useRoom();
  const { t, locale } = useLocale();

  const {
    deck,
    currentIndex,
    totalCards,
    isDeckFinished,
    isLoadingDeck,
    deckError,
    recordVote,
    summary,
    showRoundTwoToast,
    dismissRoundTwoToast,
  } = useRestaurantSwiper({
    roomId: currentRoom?.id || '',
    participantId: currentParticipant?.id || '',
    sessionToken: currentParticipant?.session_token || '',
    version: currentRoom?.version || 0,
    category: currentRoom?.winning_category || 'burger',
    stage: currentRoom?.stage,
    summary: currentRoom?.restaurant_summary,
    onRefresh: refreshRoom,
    onMatched: (_winner) => {
      // Handled in room state sync
    },
  });

  // Modal states
  const [selectedWinner, setSelectedWinner] = useState<RestaurantItem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [suddenDeathRestaurants, setSuddenDeathRestaurants] = useState<[RestaurantItem, RestaurantItem] | null>(null);
  const [isSuddenDeathOpen, setIsSuddenDeathOpen] = useState(false);


  // Auto-dismiss round two toast after 4 seconds
  useEffect(() => {
    if (showRoundTwoToast) {
      const timer = setTimeout(() => {
        dismissRoundTwoToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showRoundTwoToast, dismissRoundTwoToast]);

  // Subscribe to realtime sudden death triggers
  useEffect(() => {
    if (!currentRoom?.id) return;

    const unsubscribe = subscribeToSuddenDeath(currentRoom.id, (spots) => {
      if (spots && spots.length >= 2) {
        setSuddenDeathRestaurants([spots[0], spots[1]]);
        setIsSuddenDeathOpen(true);
      }
    });

    return () => unsubscribe();
  }, [currentRoom?.id]);

  if (!currentRoom || !currentParticipant) return null;

  if (deckError) {
    return (
      <div className="relative flex min-h-[92dvh] w-full flex-col px-4">
        <Header showBack={false} showMenu={false} participantCount={participants.length} showCount={false} />
        <div role="alert" className="m-auto max-w-sm rounded-2xl border-2 border-[#241B18] bg-white p-5 text-center font-alexandria font-bold text-[#241B18] shadow-[0_4px_0_#241B18]">
          <p>{deckError === 'NO_ELIGIBLE_RESTAURANTS'
            ? (locale === 'ar' ? 'ما لقينا خيارات موثوقة كفاية لهذي الفئة حالياً.' : 'We could not find enough trusted options for this category yet.')
            : (locale === 'ar' ? 'تعذر تحميل خيارات المطاعم. حاول مرة ثانية.' : 'Restaurant options could not be loaded. Please try again.')}</p>
          {deckError !== 'NO_ELIGIBLE_RESTAURANTS' && (
            <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-xl border-2 border-[#241B18] bg-[#FFD75A] px-4 py-2 text-sm shadow-[0_3px_0_#241B18] active:translate-y-0.5 active:shadow-none">
              {locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Host Action Handlers
  const handleOpenConfirm = (restaurant: RestaurantItem) => {
    setSelectedWinner(restaurant);
    setIsConfirmOpen(true);
  };

  const handleConfirmWinner = async (restaurant: RestaurantItem) => {
    setIsConfirmOpen(false);
    await resolveRestaurantTie(currentRoom.id,currentParticipant.session_token,currentRoom.version,'host_pick',restaurant.id);
    await refreshRoom();
  };

  const handleTriggerSuddenDeath = (topTwo: [RestaurantItem, RestaurantItem]) => {
    setSuddenDeathRestaurants(topTwo);
    setIsSuddenDeathOpen(true);
    broadcastSuddenDeath(currentRoom.id, topTwo);
  };

  const handleTriggerRoulette = async (_topSpots: RestaurantItem[]) => {
    await resolveRestaurantTie(currentRoom.id,currentParticipant.session_token,currentRoom.version,'choose_for_us');
    await refreshRoom();
  };

  const handleTieBreakerWinner = (winner: RestaurantItem) => {
    setIsSuddenDeathOpen(false);
    handleOpenConfirm(winner);
  };

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-3 pb-16 selection:bg-[#FFF0EE]">
      <div>
        {/* Top Header */}
        <Header showBack={false} showMenu={false} participantCount={participants.length} showCount={false} />

        {/* Live Squad Progress HUD (shown during swiping) */}
        {!isDeckFinished && (
          <SquadSwipingHUD
            participants={participants}
            summary={summary}
          />
        )}

        {/* Section Headline (during swiping) */}
        {!isDeckFinished && (
          <div className="text-center mt-1 mb-3 px-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#241B18] font-alexandria tracking-tight">
              {t('swiping.title')}
            </h2>
            <p className="text-xs font-semibold text-[#7A6E67] font-alexandria">
              {t('swiping.subtitle')}
            </p>
          </div>
        )}

        {/* Active Stage: Swiping Deck OR Shared Leaderboard */}
        {isDeckFinished ? (
          <LeaderboardView
            restaurants={deck}
            summary={summary}
            participants={participants}
            isHost={isHost}
            onConfirmPick={handleOpenConfirm}
            onTriggerSuddenDeath={handleTriggerSuddenDeath}
            onTriggerRoulette={handleTriggerRoulette}
          />
        ) : (
          <SwipingDeck
            deck={deck}
            currentIndex={currentIndex}
            totalCards={totalCards}
            isLoading={isLoadingDeck}
            onSwipe={(liked)=>recordVote(liked?'YES':'NO')}
            onSkip={()=>recordVote('LATER')}
          />
        )}
      </div>

      {/* Auto-Restack Round Two Notification Toast */}
      <Toast message={showRoundTwoToast ? t('gameSwiper.roundTwoToast') : null} />

      {/* Host Safety Confirmation Modal ("Make Sure") */}
      <ConfirmWinnerModal
        isOpen={isConfirmOpen}
        restaurant={selectedWinner}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmWinner}
      />

      {/* Sudden Death Showdown Modal */}
      {isSuddenDeathOpen && suddenDeathRestaurants && (
        <SuddenDeathModal
          key={`sd-${suddenDeathRestaurants[0]?.id}-${suddenDeathRestaurants[1]?.id}`}
          isOpen={isSuddenDeathOpen}
          roomId={currentRoom.id}
          currentParticipantId={currentParticipant.id}
          isHost={isHost}
          restaurants={suddenDeathRestaurants}
          totalParticipants={participants.length}
          onSelectWinner={handleTieBreakerWinner}
          onClose={() => setIsSuddenDeathOpen(false)}
        />
      )}

    </div>
  );
};
