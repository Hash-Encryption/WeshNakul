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
import { TactileButton } from '../common/TactileButton';
import { RestaurantRouletteOverlay } from './RestaurantRouletteOverlay';
import { DecisionMachineLoading } from '../common/DecisionMachineLoading';
import type { RestaurantItem } from '../../types/restaurant';
import {
  broadcastSuddenDeath,
  subscribeToSuddenDeath,
  resolveRestaurantTie,
} from '../../lib/supabase';
import { CafeDeckScreen } from './CafeDeckScreen';
import { DeckErrorBoundary } from '../common/ErrorBoundary';

interface RestaurantSwipingScreenProps {
  onMatched?: (winnerId: string) => void;
}

const FoodRestaurantSwipingScreen: React.FC<RestaurantSwipingScreenProps> = () => {
  const {
    currentRoom,
    currentParticipant,
    participants,
    isHost,
    refreshRoom,
    applyAuthoritativeRoomState,
    decisionSpin,
    startRestaurantRoulette,
    resetRoomVoting,
    leaveRoom,
  } = useRoom();
  const { t, locale } = useLocale();

  const {
    deck,
    currentIndex,
    totalCards,
    isDeckFinished,
    isLoadingDeck,
    deckError,
    recordVote,
    reloadDeck,
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
    onAuthoritativeState: applyAuthoritativeRoomState,
    onMatched: (_winner) => {
      // Handled in room state sync
    },
  });

  // Modal states
  const [selectedWinner, setSelectedWinner] = useState<RestaurantItem | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [suddenDeathRestaurants, setSuddenDeathRestaurants] = useState<[RestaurantItem, RestaurantItem] | null>(null);
  const [isSuddenDeathOpen, setIsSuddenDeathOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleChooseAnotherCategory = async () => {
    if (isResetting) return;
    setIsResetting(true);
    try {
      await resetRoomVoting('voting');
    } catch (error) {
      console.error('Error resetting category voting', error);
    } finally {
      setIsResetting(false);
    }
  };

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
    const isNoRestaurants = deckError === 'NO_ELIGIBLE_RESTAURANTS';

    return (
      <div className="relative flex min-h-[92dvh] w-full flex-col px-4">
        <Header showBack={false} showMenu={false} participantCount={participants.length} showCount={false} />
        <div role="alert" className="m-auto w-full max-w-sm rounded-2xl border-2 border-[#241B18] bg-white p-6 text-center font-alexandria shadow-[0_4px_0_#241B18]">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF8F1] border border-[#241B18]/10 text-2xl">
            {isNoRestaurants ? '🍽️' : '⚠️'}
          </div>

          <h2 className="text-lg font-black text-[#241B18] mb-1.5 leading-snug">
            {isNoRestaurants
              ? t('swiping.no_restaurants_title')
              : (locale === 'ar' ? 'تعذر تحميل خيارات المطاعم' : 'Failed to load restaurant options')}
          </h2>

          <p className="text-sm font-medium text-[#7A6E67] mb-6 leading-relaxed">
            {isNoRestaurants
              ? t('swiping.no_restaurants_subtitle')
              : (locale === 'ar' ? 'حدث خطأ في الاتصال. حاول مرة ثانية.' : 'A connection error occurred. Please try again.')}
          </p>

          {isNoRestaurants ? (
            isHost ? (
              <div className="flex flex-col gap-2.5 w-full">
                <TactileButton
                  variant="primary"
                  fullWidth
                  size="md"
                  isLoading={isResetting}
                  onClick={handleChooseAnotherCategory}
                >
                  {t('swiping.choose_another_category')}
                </TactileButton>
                <TactileButton
                  variant="ghost"
                  fullWidth
                  size="sm"
                  disabled={isResetting}
                  onClick={() => leaveRoom()}
                  className="text-[#7A6E67] hover:text-[#241B18]"
                >
                  {t('swiping.back_to_home')}
                </TactileButton>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full items-center">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-[#FFF8F1] border border-[#241B18]/15 px-4 py-3 text-sm font-semibold text-[#241B18] w-full">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FFD75A] border border-[#241B18]/20 animate-pulse flex-shrink-0" />
                  <span>{t('swiping.waiting_host_choose')}</span>
                </div>
                <TactileButton
                  variant="ghost"
                  fullWidth
                  size="sm"
                  onClick={() => leaveRoom()}
                  className="text-[#7A6E67] hover:text-[#241B18]"
                >
                  {t('swiping.leave_room')}
                </TactileButton>
              </div>
            )
          ) : (
            <TactileButton
              variant="yellow"
              fullWidth
              size="md"
              onClick={reloadDeck}
            >
              {locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
            </TactileButton>
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
    try { await startRestaurantRoulette(); }
    catch (error) { console.error('Error resolving restaurant tie', error); }
  };

  const handleTieBreakerWinner = async (winner: RestaurantItem, method: 'sudden_death' = 'sudden_death') => {
    setIsSuddenDeathOpen(false);
    try {
      await resolveRestaurantTie(currentRoom.id, currentParticipant.session_token, currentRoom.version, method, winner.id);
      await refreshRoom();
    } catch (error) {
      console.error('Error resolving sudden death tie', error);
      await refreshRoom();
    }
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

        {/* Active Stage: Swiping Deck OR Shared Leaderboard with Localized Error Boundary */}
        <DeckErrorBoundary onRetry={reloadDeck} onChooseAnotherCategory={handleChooseAnotherCategory} isHost={isHost}>
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
          ) : isLoadingDeck && deck.length === 0 ? (
            <DecisionMachineLoading
              participants={participants}
              currentStep={2}
              title={locale === 'ar' ? 'نجهّز قائمة المطاعم' : 'Preparing Restaurant Deck'}
              subtitle={locale === 'ar' ? 'الخوارزمية تبحث عن أفضل الخيارات المطابقة' : 'Algorithm is finding the best matching restaurants'}
            />
          ) : (
            <SwipingDeck
              deck={deck}
              currentIndex={currentIndex}
              totalCards={totalCards}
              isLoading={isLoadingDeck}
              onVote={recordVote}
            />
          )}
        </DeckErrorBoundary>
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

      {decisionSpin?.kind === 'restaurant' && (
        <RestaurantRouletteOverlay spin={decisionSpin} restaurants={deck} />
      )}

    </div>
  );
};

export const RestaurantSwipingScreen: React.FC<RestaurantSwipingScreenProps> = (props) => {
  const { currentRoom } = useRoom();

  if (currentRoom?.room_mode === 'cafes') {
    return <CafeDeckScreen />;
  }

  return <FoodRestaurantSwipingScreen {...props} />;
};
