import React from 'react';
import type { RoomSuggestion } from '../../types/database';
import { ProceduralAvatar } from './ProceduralAvatar';

interface SocialSuggestionAvatarsProps {
  suggestions: RoomSuggestion[];
  target: string;
  maxVisible?: number;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const SocialSuggestionAvatars: React.FC<SocialSuggestionAvatarsProps> = ({
  suggestions,
  target,
  maxVisible = 2,
  size = 'xs',
  className = '',
}) => {
  const matching = suggestions.filter((s) => s.target === target);
  if (matching.length === 0) return null;

  const visible = matching.slice(0, maxVisible);
  const overflow = matching.length - maxVisible;

  return (
    <div
      className={`inline-flex items-center -space-x-1 rtl:space-x-reverse ${className}`}
      data-testid={`suggestions-${target}`}
    >
      {visible.map((s) => (
        <div
          key={s.participant_id}
          title={s.nickname}
          className="relative rounded-full ring-1 ring-white dark:ring-stone-900 overflow-hidden shadow-xs flex-shrink-0"
        >
          <ProceduralAvatar
            nickname={s.nickname}
            shape={s.player_shape}
            color={s.player_color}
            size={size}
          />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={`flex items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold ring-1 ring-white dark:ring-stone-900 text-[9px] flex-shrink-0 ${
            size === 'xs' ? 'w-5 h-5' : size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
          }`}
          title={`+${overflow}`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};
