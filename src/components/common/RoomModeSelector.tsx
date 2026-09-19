import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { SocialSuggestionAvatars } from './SocialSuggestionAvatars';
import type { RoomMode } from '../../types/database';

const MODES: { id: RoomMode; icon: string }[] = [
  { id: 'food', icon: '🍽️' },
  { id: 'breakfast', icon: '🍳' },
  { id: 'cafes', icon: '☕' },
];

export const RoomModeSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentRoom, currentParticipant, isHost, switchMode, toggleSuggestion, suggestions } = useRoom();
  const { t } = useLocale();
  const [isSwitching, setIsSwitching] = useState(false);

  if (!currentRoom) return null;

  const currentMode = currentRoom.room_mode || 'food';

  const handleModeClick = async (mode: RoomMode) => {
    if (mode === currentMode) return;

    if (isHost) {
      if (isSwitching) return;
      setIsSwitching(true);
      try {
        await switchMode(mode);
      } catch (err) {
        console.error('Failed to switch mode:', err);
      } finally {
        setIsSwitching(false);
      }
    } else {
      // Guest: toggle suggestion
      try {
        await toggleSuggestion(`mode:${mode}`);
      } catch (err) {
        console.error('Failed to toggle mode suggestion:', err);
      }
    }
  };

  return (
    <div
      className={`max-w-md mx-auto px-1 py-1 bg-white/80 dark:bg-stone-800/80 rounded-2xl border-2 border-brand-ink shadow-[0_2px_0_#241B18] flex items-center justify-between gap-1 select-none ${className}`}
      data-testid="room-mode-selector"
    >
      {MODES.map(({ id, icon }) => {
        const isActive = currentMode === id;
        const target = `mode:${id}`;
        const isSuggestedByMe = suggestions.some(
          (s) => s.target === target && s.participant_id === currentParticipant?.id
        );

        return (
          <button
            key={id}
            type="button"
            data-testid={`mode-tab-${id}`}
            onClick={() => handleModeClick(id)}
            className={`relative flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-xs sm:text-sm font-bold font-alexandria transition-all cursor-pointer ${
              isActive
                ? 'bg-brand-yellow text-brand-ink border-2 border-brand-ink shadow-[0_2px_0_#241B18] z-10'
                : isSuggestedByMe
                ? 'bg-amber-100/90 text-brand-ink border border-amber-400 hover:bg-amber-200'
                : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700/60 border border-transparent'
            }`}
            title={
              isActive
                ? t(`modes.${id}.name`)
                : isHost
                ? t('modes.clickToSwitch', { mode: t(`modes.${id}.name`) })
                : t('modes.clickToSuggest', { mode: t(`modes.${id}.name`) })
            }
          >
            <span className="text-sm sm:text-base leading-none">{icon}</span>
            <span className="truncate">{t(`modes.${id}.name`)}</span>

            {!isActive && (
              <SocialSuggestionAvatars
                suggestions={suggestions}
                target={target}
                size="xs"
                className="ms-1"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
