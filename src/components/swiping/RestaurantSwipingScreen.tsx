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
  getCaptainEventState,
  subscribeToCaptainEvents,
  broadcastShuffleCards,
  subscribeToShuffleCards,
  broadcastEmojiClash,
  subscribeToEmojiClash,
} from '../../lib/supabase';
import { CafeDeckScreen } from './CafeDeckScreen';
import { DeckErrorBoundary } from '../common/ErrorBoundary';
import { CaptainRouletteModal } from '../captain/CaptainRouletteModal';
import { ShuffleCardsModal } from '../minigames/shuffle_cards/ShuffleCardsModal';
import { EmojiClashModal } from '../minigames/emoji_clash/EmojiClashModal';
import type { MiniGameId, MiniGameDefinition } from '../../config/miniGames';

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
    suggestions,
    toggleSuggestion,
    startMiniGameSession,
    completeMiniGame,
    cancelMiniGameSession,
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

  const [suddenDeathRestaurants, setSuddenDeathRestaurants] = useState<RestaurantItem[] | null>(null);
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
        setSuddenDeathRestaurants(spots);
        setIsSuddenDeathOpen(true);
      }
    });

    return () => unsubscribe();
  }, [currentRoom?.id]);

  const [isCaptainRouletteOpen, setIsCaptainRouletteOpen] = useState(false);
  const [captainNotice, setCaptainNotice] = useState<string | null>(null);
  const [pendingMiniGame, setPendingMiniGame] = useState<MiniGameId | null>(null);
  const [isShuffleCardsOpen, setIsShuffleCardsOpen] = useState(false);
  const [shuffleCardsState, setShuffleCardsState] = useState<{
    captain: { id: string; nickname: string; player_color?: string };
    winnerId: string;
    restaurants: RestaurantItem[];
    seed: string;
  } | null>(null);

  // Subscribe to realtime captain roulette triggers
  useEffect(() => {
    if (!currentRoom?.id) return;

    // Check if captain event is currently active on mount for spectators
    if (!isHost && currentParticipant?.session_token) {
      void getCaptainEventState(currentRoom.id, currentParticipant.session_token)
        .then((existing) => {
          if (existing && existing.status !== 'finalized') {
            setPendingMiniGame('shuffle_cards');
            startMiniGameSession('shuffle_cards');
            setIsCaptainRouletteOpen(true);
          }
        })
        .catch(() => {});
    }

    const unsubscribe = subscribeToCaptainEvents(currentRoom.id, (msg) => {
      if (msg.type === 'captain_spin_start') {
        setPendingMiniGame('shuffle_cards');
        startMiniGameSession('shuffle_cards');
        setIsCaptainRouletteOpen(true);
      }
    });

    return () => unsubscribe();
  }, [currentRoom?.id, isHost, currentParticipant?.session_token, startMiniGameSession]);

  // Subscribe to realtime shuffle cards triggers
  useEffect(() => {
    if (!currentRoom?.id) return;

    const unsubscribe = subscribeToShuffleCards(currentRoom.id, (msg) => {
      if (msg.type === 'shuffle_cards_pre_lock') {
        startMiniGameSession('shuffle_cards');
        setIsCaptainRouletteOpen(false);
        return;
      }

      if (msg.type === 'shuffle_cards_start') {
        const candidateItems = msg.contenderIds
          .map((id) => deck.find((r) => r.id === id))
          .filter(Boolean) as RestaurantItem[];
        const finalCandidates = candidateItems.length >= 2 ? candidateItems : deck.slice(0, 3);

        startMiniGameSession('shuffle_cards');
        setShuffleCardsState({
          captain: {
            id: msg.captainId,
            nickname: msg.captainNickname,
            player_color: msg.captainColor,
          },
          winnerId: msg.winnerId,
          restaurants: finalCandidates,
          seed: msg.seed,
        });
        setIsCaptainRouletteOpen(false);
        setIsShuffleCardsOpen(true);
      }
    });

    return () => unsubscribe();
  }, [currentRoom?.id, deck, startMiniGameSession]);

  // Emoji Clash Mini-Game state
  const [isEmojiClashOpen, setIsEmojiClashOpen] = useState(false);
  const [emojiClashState, setEmojiClashState] = useState<{
    winnerRestaurantId: string;
    restaurants: RestaurantItem[];
    battleSeed: number;
  } | null>(null);

  // Subscribe to realtime emoji clash triggers across all clients
  useEffect(() => {
    if (!currentRoom?.id) return;

    const unsubscribe = subscribeToEmojiClash(currentRoom.id, (msg) => {
      if (msg.type === 'emoji_clash_start') {
        const candidateItems = msg.contenderIds
          .map((id) => deck.find((r) => r.id === id))
          .filter(Boolean) as RestaurantItem[];
        const finalCandidates = candidateItems.length >= 2 ? candidateItems : deck.slice(0, 3);

        startMiniGameSession('emoji_clash');
        setEmojiClashState({
          winnerRestaurantId: msg.winnerRestaurantId,
          restaurants: finalCandidates,
          battleSeed: msg.battleSeed,
        });
        setIsEmojiClashOpen(true);
      } else if (msg.type === 'emoji_clash_finalized') {
        setIsEmojiClashOpen(false);
        completeMiniGame();
        void refreshRoom();
      }
    });

    return () => unsubscribe();
  }, [currentRoom?.id, deck, startMiniGameSession, completeMiniGame, refreshRoom]);

  // Safety watchdog: If room reaches matched stage, guarantee Emoji Clash is cleanly closed
  useEffect(() => {
    if (currentRoom?.stage === 'matched' && isEmojiClashOpen) {
      setIsEmojiClashOpen(false);
      completeMiniGame();
    }
  }, [currentRoom?.stage, isEmojiClashOpen, completeMiniGame]);

  const handleLaunchEmojiClash = async () => {
    if (!currentRoom || !currentParticipant) return;
    const tiedIds = summary?.tiedRestaurantIds || [];
    const candidates = tiedIds.map((id) => deck.find((r) => r.id === id)).filter(Boolean) as RestaurantItem[];
    const activeContenders = candidates.length >= 2 ? candidates : deck.slice(0, 3);

    startMiniGameSession('emoji_clash');

    try {
      const state = await resolveRestaurantTie(
        currentRoom.id,
        currentParticipant.session_token,
        currentRoom.version,
        'choose_for_us'
      );
      const serverWinnerId = state.room.winning_restaurant_id || activeContenders[0].id;
      const battleSeed = Math.floor(Math.random() * 1000000) + 1;

      setEmojiClashState({
        winnerRestaurantId: serverWinnerId,
        restaurants: activeContenders,
        battleSeed,
      });
      setIsEmojiClashOpen(true);

      await broadcastEmojiClash(currentRoom.id, {
        type: 'emoji_clash_start',
        contenderIds: activeContenders.map((r) => r.id),
        winnerRestaurantId: serverWinnerId,
        battleSeed,
        startedAt: Date.now(),
      });
    } catch (err) {
      console.error('Error resolving tie for Emoji Clash', err);
      const fallbackWinner = currentRoom.winning_restaurant_id || activeContenders[0].id;
      const battleSeed = 123456;
      setEmojiClashState({
        winnerRestaurantId: fallbackWinner,
        restaurants: activeContenders,
        battleSeed,
      });
      setIsEmojiClashOpen(true);
    }
  };

  const handleEmojiClashWinnerConfirmed = async (winner: RestaurantItem) => {
    setIsEmojiClashOpen(false);
    completeMiniGame();
    if (isHost && currentRoom) {
      try {
        await broadcastEmojiClash(currentRoom.id, {
          type: 'emoji_clash_finalized',
          winnerRestaurantId: winner.id,
        });
      } catch (err) {
        console.warn('Failed to broadcast emoji_clash_finalized', err);
      }
    }
    await refreshRoom();
  };

  const handleEmojiClashClose = () => {
    setIsEmojiClashOpen(false);
    cancelMiniGameSession();
  };

  const handleSelectMiniGame = (game: MiniGameDefinition) => {
    if (game.id === 'emoji_clash') {
      void handleLaunchEmojiClash();
    }
  };

  const handleTriggerCaptainRoulette = (targetGame?: MiniGameId) => {
    if (!isHost) return;
    const activeCount = participants.filter((p) => p.status === 'active').length;
    if (activeCount < 2) {
      if (targetGame === 'shuffle_cards' && currentParticipant) {
        void handleLaunchShuffleCards({
          id: currentParticipant.id,
          nickname: currentParticipant.nickname,
          color: currentParticipant.player_color,
        });
        return;
      }
      const msg =
        locale === 'ar'
          ? 'روليت الكابتن يتطلب لاعبين نشطين على الأقل! 👥'
          : 'Captain Roulette requires at least 2 active players! 👥';
      setCaptainNotice(msg);
      setTimeout(() => setCaptainNotice(null), 3500);
      return;
    }
    setPendingMiniGame(targetGame || null);
    if (targetGame) {
      startMiniGameSession(targetGame);
    }
    setIsCaptainRouletteOpen(true);
  };

  const handleLaunchShuffleCards = async (captainCandidate: { id: string; nickname: string; color?: string }) => {
    if (!currentRoom || !currentParticipant) return;
    const tiedIds = summary?.tiedRestaurantIds || [];
    const candidates = tiedIds.map((id) => deck.find((r) => r.id === id)).filter(Boolean) as RestaurantItem[];
    const activeContenders = candidates.length >= 2 ? candidates : deck.slice(0, 3);

    startMiniGameSession('shuffle_cards');
    setIsCaptainRouletteOpen(false);

    // Pre-lock guest sessions BEFORE Postgres changes DB room stage to 'matched'
    try {
      await broadcastShuffleCards(currentRoom.id, {
        type: 'shuffle_cards_pre_lock',
      });
    } catch {}

    try {
      const state = await resolveRestaurantTie(
        currentRoom.id,
        currentParticipant.session_token,
        currentRoom.version,
        'choose_for_us'
      );
      const serverWinnerId = state.room.winning_restaurant_id || activeContenders[0].id;
      const seed = `${currentRoom.id}-${currentRoom.version}-${Date.now()}`;

      setShuffleCardsState({
        captain: {
          id: captainCandidate.id,
          nickname: captainCandidate.nickname,
          player_color: captainCandidate.color,
        },
        winnerId: serverWinnerId,
        restaurants: activeContenders,
        seed,
      });
      setIsShuffleCardsOpen(true);

      await broadcastShuffleCards(currentRoom.id, {
        type: 'shuffle_cards_start',
        captainId: captainCandidate.id,
        captainNickname: captainCandidate.nickname,
        captainColor: captainCandidate.color,
        contenderIds: activeContenders.map((r) => r.id),
        winnerId: serverWinnerId,
        seed,
      });
    } catch (err) {
      console.error('Error resolving tie for Shuffle Cards', err);
      const fallbackWinner = currentRoom.winning_restaurant_id || activeContenders[0].id;
      setShuffleCardsState({
        captain: {
          id: captainCandidate.id,
          nickname: captainCandidate.nickname,
          player_color: captainCandidate.color,
        },
        winnerId: fallbackWinner,
        restaurants: activeContenders,
        seed: 'fallback',
      });
      setIsShuffleCardsOpen(true);
    }
  };

  const handleShuffleCardsWinnerConfirmed = async (_winner: RestaurantItem) => {
    setIsShuffleCardsOpen(false);
    completeMiniGame();
    await refreshRoom();
  };

  const handleShuffleCardsClose = () => {
    setIsShuffleCardsOpen(false);
    cancelMiniGameSession();
  };

  if (!currentRoom || !currentParticipant) return null;

  if (deckError) {
    const isNoRestaurants = deckError === 'NO_ELIGIBLE_RESTAURANTS';

    return (
      <div className="relative flex min-h-[92dvh] w-full flex-col px-4">
        <Header showBack={false} showMenu={false} participantCount={participants.length} showCount={false} onLeave={() => leaveRoom(false)} showLeave={true} />
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

  const handleTriggerSuddenDeath = (topContenders: RestaurantItem[]) => {
    if (!isHost) return;
    setSuddenDeathRestaurants(topContenders);
    setIsSuddenDeathOpen(true);
    broadcastSuddenDeath(currentRoom.id, topContenders);
  };

  const handleTriggerRoulette = async (_topSpots: RestaurantItem[]) => {
    if (!isHost) return;
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
        <Header showBack={false} showMenu={false} participantCount={participants.length} showCount={false} onLeave={() => leaveRoom(false)} showLeave={true} />

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
              suggestions={suggestions}
              currentParticipantId={currentParticipant?.id}
              onToggleSuggestion={toggleSuggestion}
              onConfirmPick={handleOpenConfirm}
              onTriggerSuddenDeath={handleTriggerSuddenDeath}
              onTriggerRoulette={handleTriggerRoulette}
              onTriggerCaptainRoulette={handleTriggerCaptainRoulette}
              onSelectMiniGame={handleSelectMiniGame}
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

      {/* Captain Roulette Feedback Toast */}
      <Toast message={captainNotice} />

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
          key={`sd-${suddenDeathRestaurants.map((r) => r?.id).join('-')}`}
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

      {/* Captain Roulette Modal */}
      {isCaptainRouletteOpen && (
        <CaptainRouletteModal
          isOpen={isCaptainRouletteOpen}
          onClose={() => setIsCaptainRouletteOpen(false)}
          onStartGame={(captain) => {
            const msg =
              locale === 'ar'
                ? `تم اعتماد ${captain.nickname} كابتن للجولة! 👑`
                : `${captain.nickname} is locked in as Captain! 👑`;
            setCaptainNotice(msg);
            setTimeout(() => setCaptainNotice(null), 4000);

            if (pendingMiniGame === 'shuffle_cards') {
              void handleLaunchShuffleCards(captain);
            }
          }}
        />
      )}

      {/* Shuffle Cards Mini-Game Modal */}
      {isShuffleCardsOpen && shuffleCardsState && (
        <ShuffleCardsModal
          isOpen={isShuffleCardsOpen}
          roomId={currentRoom.id}
          currentParticipantId={currentParticipant.id}
          isHost={isHost}
          captain={shuffleCardsState.captain}
          restaurants={shuffleCardsState.restaurants}
          winnerId={shuffleCardsState.winnerId}
          seed={shuffleCardsState.seed}
          onWinnerConfirmed={handleShuffleCardsWinnerConfirmed}
          onClose={handleShuffleCardsClose}
        />
      )}

      {/* Emoji Clash Mini-Game Modal */}
      {isEmojiClashOpen && emojiClashState && (
        <EmojiClashModal
          isOpen={isEmojiClashOpen}
          roomId={currentRoom.id}
          currentParticipantId={currentParticipant.id}
          participants={participants}
          isHost={isHost}
          restaurants={emojiClashState.restaurants}
          winnerRestaurantId={emojiClashState.winnerRestaurantId}
          battleSeed={emojiClashState.battleSeed}
          onWinnerConfirmed={handleEmojiClashWinnerConfirmed}
          onClose={handleEmojiClashClose}
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
