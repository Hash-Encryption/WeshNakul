import React, { useState } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { SocialSuggestionAvatars } from './SocialSuggestionAvatars';

const PREFERENCES = [
  { id: 'healthy', icon: '🥗' },
  { id: 'nearby', icon: '📍' },
];

export const RoomPreferencesBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentRoom, currentParticipant, isHost, setPreference, toggleSuggestion, suggestions } = useRoom();
  const { t } = useLocale();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  if (!currentRoom) return null;

  const activePreferences = currentRoom.preferences || [];

  const handlePrefClick = async (prefId: string) => {
    const isEnabled = activePreferences.includes(prefId);

    if (isHost) {
      if (isUpdating) return;
      setIsUpdating(prefId);
      try {
        await setPreference(prefId, !isEnabled);
      } catch (err) {
        console.error('Failed to set room preference:', err);
      } finally {
        setIsUpdating(null);
      }
    } else {
      // Guest: toggle suggestion
      try {
        await toggleSuggestion(`preference:${prefId}`);
      } catch (err) {
        console.error('Failed to toggle preference suggestion:', err);
      }
    }
  };

  return (
    <div
      className={`max-w-md mx-auto flex items-center justify-center gap-2 select-none ${className}`}
      data-testid="room-preferences-bar"
    >
      {PREFERENCES.map(({ id, icon }) => {
        const isEnabled = activePreferences.includes(id);
        const target = `preference:${id}`;
        const isSuggestedByMe = suggestions.some(
          (s) => s.target === target && s.participant_id === currentParticipant?.id
        );

        return (
          <button
            key={id}
            type="button"
            data-testid={`pref-pill-${id}`}
            onClick={() => handlePrefClick(id)}
            className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold font-alexandria transition-all cursor-pointer border ${
              isEnabled
                ? 'bg-brand-green/15 text-brand-green border-brand-green shadow-xs'
                : isSuggestedByMe
                ? 'bg-amber-100/90 text-brand-ink border-amber-400'
                : 'bg-white/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-50'
            }`}
            title={
              isEnabled
                ? t(`preferences.${id}.enabled`)
                : isHost
                ? t(`preferences.${id}.toggle`)
                : t(`preferences.${id}.suggest`)
            }
          >
            <span>{icon}</span>
            <span>{t(`preferences.${id}.name`)}</span>
            {isEnabled && <span className="text-brand-green font-extrabold text-[10px]">✓</span>}

            {!isEnabled && (
              <SocialSuggestionAvatars
                suggestions={suggestions}
                target={target}
                size="xs"
                className="ms-0.5"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
