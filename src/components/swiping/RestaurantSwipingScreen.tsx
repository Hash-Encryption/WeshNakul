import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { useRestaurantSwiper } from '../../hooks/useRestaurantSwiper';
import { SwipingDeck } from './SwipingDeck';
import { LeaderboardView } from './LeaderboardView';
import { ConfirmWinnerModal } from './ConfirmWinnerModal';
import { SuddenDeathModal } from './SuddenDeathModal';
import { RouletteModal } from './RouletteModal';
import { SquadSwipingHUD } from './SquadSwipingHUD';
import { Header } from '../common/Header';
import { Toast } from '../common/Toast';
import type { RestaurantItem } from '../../types/restaurant';
import {
  broadcastSuddenDeath,
  subscribeToSuddenDeath,
  broadcastRoulette,
  broadcastRouletteClose,
  subscribeToRoulette,
} from '../../lib/supabase';

interface RestaurantSwipingScreenProps {
  onMatched?: (winnerId: string) => void;
}

export const RestaurantSwipingScreen: React.FC<RestaurantSwipingScreenProps> = () => {
  const { currentRoom, currentParticipant, participants, isHost } = useRoom();
  const { t } = useLocale();

  const {
    deck,
    currentIndex,
    totalCards,
    isDeckFinished,
    isLoadingDeck,
    recordSwipe,
    skipCard,
    allSwipes,
    commitWinner,
    showRoundTwoToast,
    dismissRoundTwoToast,
  } = useRestaurantSwiper({
    roomId: currentRoom?.id || '',
    participantId: currentParticipant?.id || '',
    isHost,
    totalParticipants: participants.length,
    category: currentRoom?.winning_category || 'burger',
    city: currentRoom?.city || 'riyadh',
    district: currentRoom?.district || currentRoom?.neighborhood || undefined,
    eatingMode: currentRoom?.eating_mode,
    stage: currentRoom?.stage,
    onMatched: (_winner) => {
      // Handled in room state sync
    },
  });

  // Modal states
  const [selectedWinner, setSelectedWinner] = useState<RestaurantItem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [suddenDeathRestaurants, setSuddenDeathRestaurants] = useState<[RestaurantItem, RestaurantItem] | null>(null);
  const [isSuddenDeathOpen, setIsSuddenDeathOpen] = useState(false);

  const [rouletteRestaurants, setRouletteRestaurants] = useState<RestaurantItem[]>([]);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);

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

  // Subscribe to realtime roulette triggers
  useEffect(() => {
    if (!currentRoom?.id) return;

    const unsubscribe = subscribeToRoulette(
      currentRoom.id,
      (spots) => {
        if (spots && spots.length >= 2) {
          setRouletteRestaurants(spots);
          setIsRouletteOpen(true);
        }
      },
      () => {
        setIsRouletteOpen(false);
      }
    );

    return () => unsubscribe();
  }, [currentRoom?.id]);

  if (!currentRoom || !currentParticipant) return null;

  // Host Action Handlers
  const handleOpenConfirm = (restaurant: RestaurantItem) => {
    setSelectedWinner(restaurant);
    setIsConfirmOpen(true);
  };

  const handleConfirmWinner = async (restaurant: RestaurantItem) => {
    setIsConfirmOpen(false);
    await commitWinner(restaurant);
  };

  const handleTriggerSuddenDeath = (topTwo: [RestaurantItem, RestaurantItem]) => {
    setSuddenDeathRestaurants(topTwo);
    setIsSuddenDeathOpen(true);
    broadcastSuddenDeath(currentRoom.id, topTwo);
  };

  const handleTriggerRoulette = (topSpots: RestaurantItem[]) => {
    setRouletteRestaurants(topSpots);
    setIsRouletteOpen(true);
    broadcastRoulette(currentRoom.id, topSpots);
  };

  const handleTieBreakerWinner = (winner: RestaurantItem) => {
    setIsSuddenDeathOpen(false);
    setIsRouletteOpen(false);
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
            swipes={allSwipes}
            totalCards={totalCards}
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
            swipes={allSwipes}
            participants={participants}
            isHost={isHost}
            totalCards={totalCards}
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
            onSwipe={recordSwipe}
            onSkip={skipCard}
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

      {/* Food Roulette Modal */}
      {isRouletteOpen && rouletteRestaurants.length >= 2 && (
        <RouletteModal
          key={`roulette-${rouletteRestaurants.map((r) => r.id).join('-')}`}
          isOpen={isRouletteOpen}
          roomId={currentRoom.id}
          isHost={isHost}
          restaurants={rouletteRestaurants}
          swipes={allSwipes}
          onSelectWinner={handleTieBreakerWinner}
          onClose={() => {
            setIsRouletteOpen(false);
            if (isHost && currentRoom?.id) {
              broadcastRouletteClose(currentRoom.id).catch(() => {});
            }
          }}
        />
      )}
    </div>
  );
};
