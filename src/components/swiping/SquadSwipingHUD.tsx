import React from 'react';
import type { Participant } from '../../types/database';
import type { RestaurantSwipe } from '../../types/restaurant';
import { ProceduralAvatar } from '../common/ProceduralAvatar';
import { useLocale } from '../../context/LocaleContext';

interface SquadSwipingHUDProps {
  participants: Participant[];
  swipes: RestaurantSwipe[];
  totalCards: number;
}

export const SquadSwipingHUD: React.FC<SquadSwipingHUDProps> = ({
  participants,
  swipes,
  totalCards,
}) => {
  const { t } = useLocale();

  const isParticipantDone = (participantId: string) => {
    if (totalCards === 0) return false;
    const count = swipes.filter((s) => s.participantId === participantId).length;
    return count >= totalCards;
  };

  const completedCount = participants.filter((p) => isParticipantDone(p.id)).length;
  const totalCount = participants.length;

  return (
    <header className="w-full max-w-[360px] mx-auto pt-2 pb-3 px-2 z-20">
      <div className="bg-white border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] rounded-full px-3.5 py-1.5 flex items-center justify-between gap-2 select-none">
        {/* Progress Text */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#241B18] font-alexandria">
          <span className="inline-block w-2 h-2 rounded-full bg-[#55B96A] animate-pulse" />
          <span>
            {t('swiping.hud_status', {
              completed: completedCount,
              total: totalCount,
            })}
          </span>
        </div>

        {/* Squad Participant Avatars */}
        <div className="flex items-center -space-x-1.5 rtl:space-x-reverse overflow-hidden">
          {participants.slice(0, 5).map((participant) => {
            const done = isParticipantDone(participant.id);
            return (
              <div key={participant.id} className="relative group shrink-0" title={participant.nickname}>
                <ProceduralAvatar
                  nickname={participant.nickname}
                  shape={participant.player_shape}
                  color={participant.player_color}
                  size="sm"
                  showCrown={participant.is_host}
                />
                {done && (
                  <span
                    className="absolute -bottom-0.5 -end-0.5 w-3.5 h-3.5 bg-[#55B96A] text-white border border-[#241B18] rounded-full text-[9px] flex items-center justify-center font-bold"
                    aria-label="Finished"
                  >
                    ✓
                  </span>
                )}
              </div>
            );
          })}
          {participants.length > 5 && (
            <div className="w-7 h-7 rounded-full bg-[#FFF8F1] border-2 border-[#241B18] text-[10px] font-black flex items-center justify-center text-[#241B18]">
              +{participants.length - 5}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
