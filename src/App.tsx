import React, { useState, useEffect } from 'react';
import type { EatingMode } from './types/database';
import { useRoom } from './context/RoomContext';
import { useLocale } from './context/LocaleContext';
import { LandingHero } from './components/landing/LandingHero';
import { EnterCodeModal } from './components/landing/EnterCodeModal';
import { EatingModeScreen } from './components/wizard/EatingModeScreen';
import { RoomSetupScreen } from './components/wizard/RoomSetupScreen';
import { RoomLobbyScreen } from './components/lobby/RoomLobbyScreen';
import { GuestJoinScreen } from './components/guest/GuestJoinScreen';
import { RoomFullView } from './components/guest/RoomFullView';
import { FoodVotingScreen } from './components/voting/FoodVotingScreen';
import { TiebreakerScreen } from './components/voting/TiebreakerScreen';
import { ConsensusResultScreen } from './components/voting/ConsensusResultScreen';
import { RestaurantSwipingScreen } from './components/swiping/RestaurantSwipingScreen';
import { MatchCelebrationScreen } from './components/swiping/MatchCelebrationScreen';
import { RESTAURANT_CATALOG } from './data/restaurants';
import { getCachedRestaurant } from './lib/supabase';

type FlowStep = 'landing' | 'mode' | 'setup' | 'room' | 'guest-join' | 'room-full';

export const App: React.FC = () => {
  const {
    currentRoom,
    currentParticipant,
    participants,
    isLoading,
    createNewRoom,
    joinExistingRoom,
    loadRoom,
    leaveRoom,
    startVoting,
    resetRoomVoting,
  } = useRoom();

  const { t } = useLocale();

  const [step, setStep] = useState<FlowStep>('landing');
  const [selectedEatingMode, setSelectedEatingMode] = useState<EatingMode>('delivery');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [codeModalError, setCodeModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  // Sync flow step with RoomContext state
  useEffect(() => {
    if (isLoading) return;

    // If active participant is in current room, show room screen
    if (currentRoom && currentParticipant) {
      const isRoot = window.location.pathname === '/' || window.location.pathname === '';
      const hasUrlCode = window.location.pathname.match(/\/r\/([A-Za-z0-9]{4})/i);
      if (isRoot && !hasUrlCode && currentRoom.stage === 'matched') {
        setStep('landing');
        return;
      }
      setStep('room');
      return;
    }

    // If currentRoom is loaded but participant hasn't joined yet
    if (currentRoom && !currentParticipant) {
      if (participants.length >= 10) {
        setStep('room-full');
      } else {
        setStep('guest-join');
      }
      return;
    }

    // Default to landing if no active room
    if (!currentRoom && step !== 'mode' && step !== 'setup') {
      setStep('landing');
    }
  }, [currentRoom, currentParticipant, participants.length, isLoading, step]);

  // Handle URL path /r/:code on load or direct link
  useEffect(() => {
    const handleUrlRouting = async () => {
      const match = window.location.pathname.match(/\/r\/([A-Za-z0-9]{4})/i);
      if (match) {
        const code = match[1].toUpperCase();
        await loadRoom(code);
      }
    };
    handleUrlRouting();
  }, [loadRoom]);

  // Host Wizard Step 1 -> Step 2
  const handleStartGroup = () => {
    setStep('mode');
  };

  // Host Mode Selection -> Setup Form
  const handleModeSelected = (mode: EatingMode) => {
    setSelectedEatingMode(mode);
    setStep('setup');
  };

  // Host Setup Form -> Create Room
  const handleCreateRoom = async ({
    nickname,
    city,
    neighborhood,
  }: {
    nickname: string;
    city: string;
    neighborhood?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const { room } = await createNewRoom({
        eating_mode: selectedEatingMode,
        city,
        neighborhood,
        language: 'ar',
        host_nickname: nickname,
      });

      window.history.pushState({}, '', `/r/${room.code}`);
      setStep('room');
    } catch (err) {
      console.error('Failed to create room', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Join by code modal submission
  const handleEnterCodeSubmit = async (code: string) => {
    setIsSubmitting(true);
    setCodeModalError(null);
    try {
      const found = await loadRoom(code);
      if (!found) {
        setCodeModalError(t('enterCodeModal.errorNotFound'));
        setIsSubmitting(false);
        return;
      }
      setIsCodeModalOpen(false);
      window.history.pushState({}, '', `/r/${code}`);
    } catch (err) {
      console.error('Failed to join by code', err);
      setCodeModalError(t('enterCodeModal.errorNotFound'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Guest Nickname Submit
  const handleGuestJoin = async (nickname: string) => {
    if (!currentRoom) return;
    setIsSubmitting(true);
    setGuestError(null);
    try {
      const res = await joinExistingRoom(currentRoom.code, nickname);
      if (res.success) {
        setStep('room');
      } else if (res.isFull) {
        setStep('room-full');
      } else {
        setGuestError(t('common.errorGeneric'));
      }
    } catch (err) {
      console.error('Guest join error', err);
      setGuestError(t('common.errorGeneric'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeave = () => {
    leaveRoom();
    setStep('landing');
  };

  if (isLoading) {
    return (
      <div className="app-container flex flex-col items-center justify-center min-h-[100dvh]">
        <div className="w-12 h-12 rounded-2xl bg-brand-redSoft flex items-center justify-center text-brand-red text-2xl animate-bounce">
          🍕
        </div>
        <p className="text-xs font-bold text-brand-gray mt-3">
          {t('common.loading')}
        </p>
      </div>
    );
  }

  const renderRoomContent = () => {
    if (!currentRoom || !currentParticipant) return null;

    switch (currentRoom.stage) {
      case 'voting':
        return <FoodVotingScreen />;
      case 'tiebreaker':
        return <TiebreakerScreen />;
      case 'consensus':
        return <ConsensusResultScreen />;
      case 'swiping':
        return <RestaurantSwipingScreen />;
      case 'matched': {
        const winner =
          getCachedRestaurant(currentRoom.winning_restaurant_id || '') ||
          RESTAURANT_CATALOG.find((r) => r.id === currentRoom.winning_restaurant_id) ||
          RESTAURANT_CATALOG[0];
        return (
          <MatchCelebrationScreen
            restaurant={winner}
            participants={participants}
            onVoteAgain={() => resetRoomVoting('voting')}
            onRestartVote={() => resetRoomVoting('voting')}
            onGoHome={handleLeave}
            onProceed={() => {
              // Prepares Phase 4 transition
            }}
          />
        );
      }
      case 'lobby':
      default:
        return (
          <RoomLobbyScreen
            onStartPicking={startVoting}
            onLeaveRoom={handleLeave}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7EFE6] flex items-center justify-center sm:py-6 selection:bg-brand-redSoft">
      <main className="app-container flex flex-col justify-center sm:rounded-[36px] sm:overflow-y-auto sm:border sm:border-brand-border sm:shadow-2xl">
        {step === 'landing' && (
          <LandingHero
            onStartGroup={handleStartGroup}
            onEnterCode={() => setIsCodeModalOpen(true)}
          />
        )}

        {step === 'mode' && (
          <EatingModeScreen
            initialMode={selectedEatingMode}
            onNext={handleModeSelected}
            onBack={() => setStep('landing')}
          />
        )}

        {step === 'setup' && (
          <RoomSetupScreen
            eatingMode={selectedEatingMode}
            onBack={() => setStep('mode')}
            onCreateRoom={handleCreateRoom}
            isLoading={isSubmitting}
          />
        )}

        {step === 'room' && renderRoomContent()}

        {step === 'guest-join' && currentRoom && (
          <GuestJoinScreen
            room={currentRoom}
            participants={participants}
            onJoin={handleGuestJoin}
            onBack={handleLeave}
            isLoading={isSubmitting}
            error={guestError}
          />
        )}

        {step === 'room-full' && (
          <RoomFullView onGoHome={handleLeave} />
        )}

        {/* Enter Code Modal Dialog */}
        <EnterCodeModal
          isOpen={isCodeModalOpen}
          onClose={() => {
            setIsCodeModalOpen(false);
            setCodeModalError(null);
          }}
          onSubmit={handleEnterCodeSubmit}
          isLoading={isSubmitting}
          error={codeModalError}
        />
      </main>
    </div>
  );
};

export default App;
