import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { RoomModeSelector } from '../common/RoomModeSelector';
import { RoomPreferencesBar } from '../common/RoomPreferencesBar';
import { SocialSuggestionAvatars } from '../common/SocialSuggestionAvatars';

export const CafeDeckScreen: React.FC = () => {
  const { currentRoom, currentParticipant, participants, isHost, switchMode, toggleSuggestion, suggestions } = useRoom();
  const { t } = useLocale();
  const [isSwitching, setIsSwitching] = useState(false);

  if (!currentRoom || !currentParticipant) return null;

  const target = 'mode:food';
  const isSuggestedByMe = suggestions.some(
    (s) => s.target === target && s.participant_id === currentParticipant.id
  );

  const handleBackToFood = async () => {
    if (isHost) {
      if (isSwitching) return;
      setIsSwitching(true);
      try {
        await switchMode('food');
      } catch (err) {
        console.error('Failed to switch mode to food:', err);
      } finally {
        setIsSwitching(false);
      }
    } else {
      try {
        await toggleSuggestion(target);
      } catch (err) {
        console.error('Failed to suggest back to food:', err);
      }
    }
  };

  return (
    <div
      data-testid="cafe-empty-state"
      className="relative flex min-h-[92dvh] w-full flex-col justify-between px-4 pb-6 selection:bg-brand-redSoft"
    >
      <div>
        <Header
          showBack={false}
          showMenu={false}
          participantCount={participants.length}
          showCount={true}
        />

        <RoomModeSelector className="mt-1 mb-2" />
        <RoomPreferencesBar className="mb-3" />

        <div className="mx-auto mt-6 w-full max-w-sm rounded-3xl border-3 border-brand-ink bg-white p-6 sm:p-8 text-center shadow-[0_8px_0_#241B18]">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 dark:bg-stone-800 border-2 border-brand-ink text-4xl shadow-[0_3px_0_#241B18]">
            <span>☕</span>
          </div>

          <h2 className="text-2xl font-black text-brand-ink font-alexandria mb-2">
            {t('cafes.emptyTitle')}
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-alexandria leading-relaxed mb-6">
            {t('cafes.emptySubtitle')}
          </p>

          <div className="flex flex-col items-center gap-2">
            <div data-testid="cafe-back-to-food-button" className="w-full">
              <TactileButton
                onClick={handleBackToFood}
                disabled={isSwitching}
                isLoading={isSwitching}
                variant={!isHost && isSuggestedByMe ? 'secondary' : 'primary'}
                fullWidth
                size="lg"
              >
                {isHost ? t('cafes.backToFood') : t('cafes.suggestBackToFood')}
              </TactileButton>
            </div>

            <SocialSuggestionAvatars
              suggestions={suggestions}
              target={target}
              size="sm"
              className="mt-1 justify-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
