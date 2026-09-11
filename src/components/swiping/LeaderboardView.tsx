import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import type { RestaurantItem } from '../../types/restaurant';
import type { Participant, RestaurantSummary } from '../../types/database';
import { useLocale } from '../../context/LocaleContext';
import { ProceduralAvatar } from '../common/ProceduralAvatar';

interface LeaderboardViewProps {
  restaurants: RestaurantItem[];
  summary?: RestaurantSummary;
  participants: Participant[];
  isHost: boolean;
  onConfirmPick: (restaurant: RestaurantItem) => void;
  onTriggerSuddenDeath: (topTwo: [RestaurantItem, RestaurantItem]) => void;
  onTriggerRoulette: (topSpots: RestaurantItem[]) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  restaurants,
  summary,
  participants,
  isHost,
  onConfirmPick,
  onTriggerSuddenDeath,
  onTriggerRoulette,
}) => {
  const { t, locale } = useLocale();

  // Track who is finished swiping
  const isParticipantDone = (participantId: string) => {
    return Boolean(summary?.participantProgress.find((item) => item.participantId === participantId)?.complete);
  };

  const completedCount = participants.filter((p) => isParticipantDone(p.id)).length;
  const totalParticipants = participants.length || 1;

  // Rank restaurants: Likes (desc), then Rating (desc), then ID (asc)
  const rankedRestaurants = useMemo(() => {
    const counts=Object.fromEntries((summary?.cards||[]).map(card=>[card.restaurantId,card.yesCount]));

    return [...restaurants]
      .map((restaurant) => ({
        restaurant,
        likes: counts[restaurant.id] || 0,
        percentage: Math.round(((counts[restaurant.id] || 0) / totalParticipants) * 100),
      }))
      .sort((a, b) => {
        const diffLikes = b.likes - a.likes;
        if (diffLikes !== 0) return diffLikes;
        const diffRating = b.restaurant.rating - a.restaurant.rating;
        if (diffRating !== 0) return diffRating;
        return a.restaurant.id.localeCompare(b.restaurant.id);
      });
  }, [restaurants, summary?.cards, totalParticipants]);

  const topSpot = rankedRestaurants[0]?.restaurant;
  const runnerUp = rankedRestaurants[1]?.restaurant;
  const canRunTieBreaker = summary?.status === 'tie' && (summary.tiedRestaurantIds?.length || 0) >= 2;

  const getPodiumBadge = (index: number) => {
    switch (index) {
      case 0:
        return <span className="text-xl sm:text-2xl" title="First Place">🥇</span>;
      case 1:
        return <span className="text-xl sm:text-2xl" title="Second Place">🥈</span>;
      case 2:
        return <span className="text-xl sm:text-2xl" title="Third Place">🥉</span>;
      default:
        return (
          <span className="w-7 h-7 rounded-full bg-[#FFF8F1] border-2 border-[#241B18] font-black text-xs flex items-center justify-center text-[#241B18]">
            #{index + 1}
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-[390px] mx-auto flex flex-col gap-4 pb-20 select-none">
      {/* Top Squad Status Bar */}
      <div className="bg-white border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] rounded-2xl p-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#55B96A] animate-pulse" />
          <span className="text-xs font-black text-[#241B18] font-alexandria">
            {t('swiping.hud_status', {
              completed: completedCount,
              total: participants.length,
            })}
          </span>
        </div>

        {/* Squad Avatars */}
        <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
          {participants.map((p) => {
            const done = isParticipantDone(p.id);
            return (
              <div key={p.id} className="relative" title={p.nickname}>
                <ProceduralAvatar
                  nickname={p.nickname}
                  shape={p.player_shape}
                  color={p.player_color}
                  size="sm"
                  showCrown={p.is_host}
                />
                {done && (
                  <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 bg-[#55B96A] text-white border border-[#241B18] rounded-full text-[8px] flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Title */}
      <div className="text-center px-2">
        <h3 className="text-2xl font-black text-[#241B18] font-alexandria tracking-tight">
          {locale === 'ar' ? 'نتائج القروب المباشرة 📊' : 'Live Squad Leaderboard 📊'}
        </h3>
        <p className="text-xs font-bold text-[#7A6E67] font-alexandria mt-0.5">
          {locale === 'ar'
            ? 'ترتيب المطاعم حسب تفضيلات الجميع'
            : 'Ranked according to squad picks'}
        </p>
      </div>

      {/* Host Action Quick Deck for Top Spot */}
      {isHost && topSpot && canRunTieBreaker && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFF8F1] border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] rounded-3xl p-4 flex flex-col gap-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-[#241B18] font-alexandria flex items-center gap-1">
              <span>👑</span>
              <span>{locale === 'ar' ? 'خيارات المضيف للحسم:' : 'Host Lockout Controls:'}</span>
            </span>
            <span className="bg-[#FFD75A] border border-[#241B18] text-[#241B18] text-[11px] font-black px-2 py-0.5 rounded-full">
              {locale === 'ar' ? 'المتصدر 🥇' : '#1 Pick 🥇'}
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => onConfirmPick(topSpot)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all font-alexandria font-black text-base flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('gameSwiper.hostConfirmBtn')}</span>
            <span className="truncate text-sm opacity-90">({locale === 'ar' ? topSpot.nameAr : topSpot.nameEn})</span>
          </button>

          {/* Tie-Breaker Buttons */}
          {canRunTieBreaker && (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onTriggerSuddenDeath([topSpot, runnerUp!])}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white text-[#241B18] border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-none hover:bg-[#FFF0EE] transition-all font-alexandria font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>⚡</span>
                <span>{t('gameSwiper.suddenDeathBtn')}</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerRoulette(rankedRestaurants.filter(({restaurant})=>summary?.tiedRestaurantIds.includes(restaurant.id)).map((r) => r.restaurant))}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white text-[#241B18] border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-none hover:bg-[#FFF8F1] transition-all font-alexandria font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🎲</span>
                <span>{t('gameSwiper.rouletteBtn')}</span>
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Ranked Restaurants List */}
      <div className="flex flex-col gap-2.5">
        {rankedRestaurants.map(({ restaurant, likes, percentage }, index) => {
          const name = locale === 'ar' ? restaurant.nameAr : restaurant.nameEn;
          const signature = locale === 'ar' ? restaurant.signatureDishAr : restaurant.signatureDishEn;
          const isWinnerCandidate = index === 0;

          return (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl border-2 border-[#241B18] p-3 transition-all ${
                isWinnerCandidate
                  ? 'bg-[#FFFDF9] shadow-[0px_4px_0px_#241B18]'
                  : 'bg-white shadow-[0px_2px_0px_#241B18]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: Podium Icon + Thumbnail */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0 flex items-center justify-center w-7">
                    {getPodiumBadge(index)}
                  </div>

                  {restaurant.imageUrl ? (
                    <img
                      src={restaurant.imageUrl}
                      alt={name}
                      className="w-12 h-12 rounded-xl object-cover border border-[#241B18]/20 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#FFF8F1] border border-[#241B18]/20 flex items-center justify-center text-xl shrink-0">
                      🍽️
                    </div>
                  )}

                  <div className="min-w-0 truncate">
                    <h4 className="text-sm sm:text-base font-black text-[#241B18] font-alexandria truncate">
                      {name}
                    </h4>
                    <p className="text-[11px] font-semibold text-[#7A6E67] font-alexandria truncate">
                      {signature}
                    </p>
                  </div>
                </div>

                {/* Right: Likes tally & Host picker */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 bg-[#FFF8F1] border border-[#241B18]/30 px-2 py-0.5 rounded-full text-xs font-black text-[#241B18]">
                    <span>❤️</span>
                    <span>{likes}</span>
                  </div>
                  {isHost && summary?.status === 'tie' && summary.tiedRestaurantIds.includes(restaurant.id) && (
                    <button
                      type="button"
                      onClick={() => onConfirmPick(restaurant)}
                      className="text-[10px] font-black text-[#55B96A] hover:underline"
                    >
                      {locale === 'ar' ? 'اعتماد 🏆' : 'Pick 🏆'}
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar of squad likes */}
              <div className="w-full bg-[#F2E8DF] rounded-full h-2 mt-2.5 overflow-hidden border border-[#241B18]/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    index === 0
                      ? 'bg-[#55B96A]'
                      : index === 1
                      ? 'bg-[#FFD75A]'
                      : 'bg-[#73C8EA]'
                  }`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Squad Member Waiting Pill */}
      {!isHost && (
        <div className="fixed bottom-5 inset-x-4 max-w-sm mx-auto z-40">
          <div className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] flex items-center justify-center gap-2 animate-pulse">
            <span className="text-base">👑</span>
            <span className="text-xs sm:text-sm font-black text-[#241B18] font-alexandria">
              {t('gameSwiper.waitingForHost')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
