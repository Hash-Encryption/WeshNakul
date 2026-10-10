import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { RestaurantItem } from '../../types/restaurant';
import type { Participant, RestaurantSummary } from '../../types/database';
import { useLocale } from '../../context/LocaleContext';
import { ProceduralAvatar } from '../common/ProceduralAvatar';
import { MiniGamesDeckGrid } from '../minigames/MiniGamesDeckGrid';
import type { MiniGameDefinition } from '../../config/miniGames';

interface LeaderboardViewProps {
  restaurants: RestaurantItem[];
  summary?: RestaurantSummary;
  participants: Participant[];
  isHost: boolean;
  onConfirmPick: (restaurant: RestaurantItem) => void;
  onTriggerSuddenDeath: (topTwo: [RestaurantItem, RestaurantItem]) => void;
  onTriggerRoulette: (topSpots: RestaurantItem[]) => void;
  onSelectMiniGame?: (game: MiniGameDefinition) => void;
  onTriggerCaptainRoulette?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  restaurants,
  summary,
  participants,
  isHost,
  onConfirmPick,
  onTriggerSuddenDeath,
  onTriggerRoulette,
  onSelectMiniGame,
  onTriggerCaptainRoulette,
}) => {
  const { t, locale } = useLocale();
  const [isMiniGamesExpanded, setIsMiniGamesExpanded] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const handleSelectMiniGame = (game: MiniGameDefinition) => {
    // 1. Implementation check: Never launch an unimplemented game
    if (!game.implemented) {
      const name = t(game.nameKey);
      const comingSoonText =
        locale === 'ar'
          ? `قريباً! جاري تحضير لعبة ${name} 🚧`
          : `Coming soon! ${name} is in development 🚧`;
      setNoticeMessage(comingSoonText);
      setTimeout(() => setNoticeMessage(null), 3200);
      return;
    }

    // 2. Revalidate player eligibility: games needing captain require at least 2 active players
    const requiredPlayers = Math.max(game.minPlayers, game.needsCaptain ? 2 : 1);
    if (activePlayerCount < requiredPlayers) {
      const msg =
        locale === 'ar'
          ? (requiredPlayers === 2
              ? 'يتطلب لاعبين اثنين نشطين على الأقل للبدء! 👥'
              : `يتطلب ${requiredPlayers} لاعبين نشطين على الأقل للبدء! 👥`)
          : `Requires at least ${requiredPlayers} active players to launch! 👥`;
      setNoticeMessage(msg);
      setTimeout(() => setNoticeMessage(null), 3200);
      return;
    }

    if (game.id === 'sudden_death') {
      if (tiedRestaurants.length >= 2) {
        onTriggerSuddenDeath([tiedRestaurants[0], tiedRestaurants[1]]);
      }
      return;
    }

    if (game.needsCaptain && onTriggerCaptainRoulette) {
      if (activePlayerCount < 2) {
        const msg =
          locale === 'ar'
            ? 'روليت الكابتن يتطلب لاعبين نشطين على الأقل! 👥'
            : 'Captain Roulette requires at least 2 active players! 👥';
        setNoticeMessage(msg);
        setTimeout(() => setNoticeMessage(null), 3200);
        return;
      }
      onTriggerCaptainRoulette();
      return;
    }

    if (onSelectMiniGame) {
      onSelectMiniGame(game);
    }
  };

  // Track who is finished swiping
  const isParticipantDone = (participantId: string) => {
    return Boolean(summary?.participantProgress.find((item) => item.participantId === participantId)?.complete);
  };

  const completedCount = participants.filter((p) => isParticipantDone(p.id)).length;
  const totalParticipants = participants.length || 1;
  const activePlayerCount = useMemo(
    () => participants.filter((p) => p.status === 'active').length,
    [participants]
  );

  // Rank restaurants: Likes (desc), then Rating (desc), then ID (asc)
  const rankedRestaurants = useMemo(() => {
    const counts = Object.fromEntries((summary?.cards || []).map((card) => [card.restaurantId, card.yesCount]));
    const safeList = Array.isArray(restaurants)
      ? restaurants.filter((r): r is RestaurantItem => Boolean(r && typeof r === 'object' && r.id))
      : [];

    return safeList
      .map((restaurant) => ({
        restaurant,
        likes: counts[restaurant.id] || 0,
        percentage: Math.round(((counts[restaurant.id] || 0) / totalParticipants) * 100),
      }))
      .sort((a, b) => {
        const diffLikes = b.likes - a.likes;
        if (diffLikes !== 0) return diffLikes;
        const hasA = typeof a.restaurant.rating === 'number' && Number.isFinite(a.restaurant.rating);
        const hasB = typeof b.restaurant.rating === 'number' && Number.isFinite(b.restaurant.rating);
        if (hasA && hasB) {
          const diffRating = (b.restaurant.rating as number) - (a.restaurant.rating as number);
          if (diffRating !== 0) return diffRating;
        }
        return a.restaurant.id.localeCompare(b.restaurant.id);
      });
  }, [restaurants, summary?.cards, totalParticipants]);

  const isTie = summary?.status === 'tie' && (summary.tiedRestaurantIds?.length || 0) >= 2;
  const tiedIds = useMemo(() => new Set(summary?.tiedRestaurantIds || []), [summary?.tiedRestaurantIds]);
  const tiedRestaurants = useMemo(
    () => rankedRestaurants.filter(({ restaurant }) => tiedIds.has(restaurant.id)).map((r) => r.restaurant),
    [rankedRestaurants, tiedIds]
  );

  const getPodiumBadge = (index: number, restaurantId: string) => {
    if (isTie && tiedIds.has(restaurantId)) {
      return (
        <span className="px-2 py-0.5 rounded-full bg-[#FFEFEF] border border-[#F0443E] text-[#F0443E] font-black text-[10px] whitespace-nowrap shadow-xs">
          {t('gameSwiper.tiedBadge')}
        </span>
      );
    }
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

      {/* Tiebreaker Showdown Controls */}
      {isTie && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFF8F1] border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] rounded-3xl p-4 flex flex-col gap-3 text-center"
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">⚔️</span>
            <h4 className="text-base font-black text-[#241B18] font-alexandria">
              {t('gameSwiper.tiedShowdownTitle')}
            </h4>
            <p className="text-xs font-bold text-[#7A6E67] font-alexandria">
              {t('gameSwiper.tiedShowdownSubtitle')}
            </p>
          </div>

          {isHost ? (
            <div className="flex flex-col items-center gap-2.5 pt-1 w-full">
              {/* Food Roulette Button - Always on Top & Full Width */}
              <button
                type="button"
                onClick={() => onTriggerRoulette(tiedRestaurants)}
                className="w-full py-3 px-4 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-none hover:brightness-105 transition-all font-alexandria font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-base">🎲</span>
                <span>{t('gameSwiper.rouletteBtn')}</span>
              </button>

              {/* Mini Games Expandable Control - Full Width directly under Food Roulette */}
              <button
                type="button"
                onClick={() => setIsMiniGamesExpanded((prev) => !prev)}
                aria-expanded={isMiniGamesExpanded}
                className="relative w-full py-3 px-4 rounded-2xl bg-white text-[#241B18] border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-0.5 active:shadow-none hover:bg-[#FFFDF8] transition-all font-alexandria font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-base">🎮</span>
                <span>{t('gameSwiper.miniGamesBtn')}</span>
                <svg
                  className={`absolute end-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#241B18] transition-transform duration-200 ${
                    isMiniGamesExpanded ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {/* Expandable Mini Games Deck Grid inside Showdown container */}
              <AnimatePresence initial={false}>
                {isMiniGamesExpanded && (
                  <MiniGamesDeckGrid
                    tieCount={tiedRestaurants.length}
                    activePlayerCount={activePlayerCount}
                    tieType="restaurant"
                    contenderIds={tiedRestaurants.map((r) => r.id)}
                    onSelectGame={handleSelectMiniGame}
                  />
                )}
              </AnimatePresence>

              {/* Development Feedback Notice */}
              <AnimatePresence>
                {noticeMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className="w-full py-2 px-3 rounded-xl bg-[#FFF0EE] border border-[#F0443E]/40 text-[#F0443E] font-alexandria font-bold text-xs text-center"
                  >
                    {noticeMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="rounded-xl border border-[#241B18]/15 bg-white p-2.5 text-center text-xs font-bold text-[#7A6E67]">
              {t('gameSwiper.waitingForHost')}
            </div>
          )}
        </motion.div>
      )}

      {/* Ranked Restaurants List */}
      <div className="flex flex-col gap-2.5">
        {rankedRestaurants.map(({ restaurant, likes, percentage }, index) => {
          const name =
            (locale === 'ar' ? restaurant.nameAr : restaurant.nameEn) ||
            restaurant.nameAr ||
            restaurant.nameEn ||
            restaurant.name ||
            (locale === 'ar' ? 'مطعم' : 'Restaurant');
          const signature =
            (locale === 'ar' ? restaurant.signatureDishAr : restaurant.signatureDishEn) ||
            restaurant.signatureDishAr ||
            restaurant.signatureDishEn ||
            '';
          const isTied = isTie && tiedIds.has(restaurant.id);
          const isWinnerCandidate = !isTie && index === 0;

          return (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl border-2 border-[#241B18] p-3 transition-all ${
                isTied
                  ? 'bg-[#FFF9F5] shadow-[0px_3px_0px_#241B18]'
                  : isWinnerCandidate
                  ? 'bg-[#FFFDF9] shadow-[0px_4px_0px_#241B18]'
                  : 'bg-white shadow-[0px_2px_0px_#241B18]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: Podium Icon + Thumbnail */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="shrink-0 flex items-center justify-center min-w-7">
                    {getPodiumBadge(index, restaurant.id)}
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
                  {isHost && isTie && tiedIds.has(restaurant.id) && (
                    <button
                      type="button"
                      onClick={() => onConfirmPick(restaurant)}
                      className="text-[10px] font-black text-[#55B96A] bg-[#E8F8EE] border border-[#55B96A] px-2 py-0.5 rounded-md hover:brightness-95 active:scale-95 transition-all flex items-center gap-1"
                    >
                      <span>👑</span>
                      <span>{locale === 'ar' ? 'اعتماد 🏆' : 'Pick 🏆'}</span>
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
