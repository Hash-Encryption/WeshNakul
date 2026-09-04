import React from 'react';
import { motion } from 'motion/react';
import type { Participant } from '../../types/database';
import type { RestaurantSwipe } from '../../types/restaurant';
import { ProceduralAvatar } from '../common/ProceduralAvatar';
import { SparkleRays, DoodleSquiggle } from '../common/DecorativeSparkles';
import { useLocale } from '../../context/LocaleContext';

interface WaitingForSquadCardProps {
  participants: Participant[];
  swipes: RestaurantSwipe[];
  totalCards: number;
}

export const WaitingForSquadCard: React.FC<WaitingForSquadCardProps> = ({
  participants,
  swipes,
  totalCards,
}) => {
  const { t, locale } = useLocale();

  const isParticipantDone = (participantId: string) => {
    if (totalCards === 0) return false;
    const count = swipes.filter((s) => s.participantId === participantId).length;
    return count >= totalCards;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-[360px] mx-auto bg-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] rounded-3xl p-6 text-center overflow-hidden select-none"
    >
      <SparkleRays className="absolute -top-2 end-3 scale-75 opacity-70" color="#FFD75A" />
      <DoodleSquiggle className="absolute bottom-3 start-3 opacity-40" color="#F0443E" />

      {/* Animated Icon */}
      <div className="w-16 h-16 rounded-2xl bg-[#FFF8F1] border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] mx-auto flex items-center justify-center text-3xl mb-4 animate-bounce">
        ⏳
      </div>

      {/* Title & Desc */}
      <h3 className="text-xl sm:text-2xl font-black text-[#241B18] font-alexandria mb-2 tracking-tight">
        {t('swiping.waiting_title')}
      </h3>
      <p className="text-sm font-semibold text-[#7A6E67] font-alexandria leading-relaxed mb-6">
        {t('swiping.waiting_desc')}
      </p>

      {/* Squad Status List */}
      <div className="bg-[#FFF8F1] border-2 border-[#241B18] rounded-2xl p-3.5 flex flex-col gap-2.5 text-start">
        <span className="text-xs font-black text-[#241B18] font-alexandria block mb-1">
          {locale === 'ar' ? 'حالة ربعك بالقروب:' : 'Squad Swiping Status:'}
        </span>
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
          {participants.map((p) => {
            const done = isParticipantDone(p.id);
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-[#241B18]/20"
              >
                <div className="flex items-center gap-2 truncate">
                  <ProceduralAvatar
                    nickname={p.nickname}
                    shape={p.player_shape}
                    color={p.player_color}
                    size="sm"
                    showCrown={p.is_host}
                  />
                  <span className="text-xs font-bold text-[#241B18] font-alexandria truncate">
                    {p.nickname}
                  </span>
                </div>

                {done ? (
                  <span className="shrink-0 bg-[#55B96A] text-white border border-[#241B18] px-2 py-0.5 rounded-full text-[10px] font-black">
                    {locale === 'ar' ? 'خلص ✓' : 'Done ✓'}
                  </span>
                ) : (
                  <span className="shrink-0 bg-[#FFD75A] text-[#241B18] border border-[#241B18] px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
                    {locale === 'ar' ? 'يقلّب... ⏳' : 'Swiping...'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
