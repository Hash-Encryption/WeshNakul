import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { SparkleRays, DoodleHeart, DoodleSquiggle } from '../common/DecorativeSparkles';
import { getCategoryById, calculateConsensus, FOOD_CATEGORIES } from '../../lib/consensus';
import { fetchDeckRestaurants } from '../../lib/supabase';

export const ConsensusResultScreen: React.FC = () => {
  const { currentRoom, isHost, resetToLobby, startSwiping, participants, foodChoices } = useRoom();
  const { t, locale } = useLocale();

  const winnerId = currentRoom?.winning_category || 'burger';

  // Silent background pre-fetch of restaurant deck for zero-latency swiping transition
  useEffect(() => {
    if (winnerId) {
      fetchDeckRestaurants(winnerId).catch(() => {});
    }
  }, [winnerId]);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F0443E', '#FFD75A', '#55B96A', '#73C8EA'],
      });
    } catch {
      // safe fallback
    }
  }, []);

  if (!currentRoom) return null;

  const winnerCategory = getCategoryById(winnerId);
  const consensusType = currentRoom.consensus_type || 'unanimous';

  const winnerName = winnerCategory
    ? locale === 'ar'
      ? winnerCategory.ar
      : winnerCategory.en
    : winnerId;

  // Calculate vote breakdown
  const submittedSubmissions = foodChoices
    .filter((c) => c.is_submitted)
    .map((c) => ({
      participant_id: c.participant_id,
      selected_categories: c.selected_categories,
    }));

  const consensusData = calculateConsensus(submittedSubmissions);
  const totalVoters = consensusData.totalSubmitted || participants.length || 1;
  const winnerVoteCount = consensusData.tally[winnerId] || totalVoters;
  const agreementPercentage = Math.round((winnerVoteCount / totalVoters) * 100);

  // Runner-up contenders
  const runnerUps = Object.entries(consensusData.tally)
    .filter(([id]) => id !== winnerId)
    .map(([id, count]) => ({
      id,
      count,
      percentage: Math.round((count / totalVoters) * 100),
      def: FOOD_CATEGORIES.find((c) => c.id === id),
    }))
    .filter((item) => item.def && item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const getConsensusBadge = () => {
    switch (consensusType) {
      case 'unanimous':
        return {
          text: t('consensus.unanimousBadge'),
          bg: 'bg-brand-green text-white border-brand-ink',
        };
      case 'majority_tiebreak':
        return {
          text: t('consensus.majorityBadge'),
          bg: 'bg-brand-yellow text-brand-ink border-brand-ink',
        };
      case 'host_picked':
        return {
          text: t('consensus.hostBadge'),
          bg: 'bg-brand-red text-white border-brand-ink',
        };
      case 'random_picked':
        return {
          text: t('consensus.randomBadge'),
          bg: 'bg-brand-yellow text-brand-ink border-brand-ink',
        };
      default:
        return {
          text: t('consensus.majorityBadge'),
          bg: 'bg-brand-yellow text-brand-ink border-brand-ink',
        };
    }
  };

  const badge = getConsensusBadge();

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-6 selection:bg-brand-redSoft">
      <div>
        {/* Header */}
        <Header
          showBack={false}
          showMenu={false}
          participantCount={participants.length}
          showCount={true}
        />

        {/* Heading and Sparkles */}
        <div className="text-center mt-2 mb-4 px-2 relative">
          <DoodleHeart className="absolute -top-2 start-4 transform -rotate-12" color="#55B96A" />
          <SparkleRays className="absolute -top-3 end-4 transform rotate-12 scale-90" color="#FFD75A" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mb-1 font-alexandria tracking-tight">
            {t('consensus.heading')}
          </h2>
          <p className="text-brand-gray text-xs sm:text-sm font-medium">
            {t('consensus.subtitle')}
          </p>
        </div>

        {/* Big Winning Category Card */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative bg-white rounded-3xl p-6 border-2 border-brand-ink shadow-[0_6px_0_#241B18] text-center overflow-hidden">
            <DoodleSquiggle className="absolute top-3 start-4 opacity-50" color="#F0443E" />
            <SparkleRays className="absolute bottom-3 end-4 opacity-60 scale-75" color="#FFD75A" />

            {/* Consensus Type Badge */}
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border-2 mb-3 shadow-[0_2px_0_#241B18]">
              <span className={`px-2 py-0.5 rounded-full ${badge.bg}`}>
                {badge.text}
              </span>
            </div>

            {/* Giant Emoji Display */}
            <div className="text-7xl sm:text-8xl my-3 filter drop-shadow-md transform hover:scale-105 transition-transform">
              {winnerCategory?.icon || '🍽️'}
            </div>

            {/* Winner Category Title */}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-ink font-alexandria mb-2 tracking-tight">
              {winnerName}
            </h1>

            <p className="text-xs sm:text-sm font-bold text-brand-muted">
              {t('consensus.votesCount', {
                count: winnerVoteCount,
                total: totalVoters,
                percentage: agreementPercentage,
              })}
            </p>
          </div>
        </div>

        {/* Squad Agreement Meter */}
        <div className="max-w-md mx-auto bg-white rounded-2xl p-4 border-2 border-brand-ink shadow-[0_3px_0_#241B18] mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-brand-ink mb-2">
            <span>{t('consensus.agreementMeter')}</span>
            <span className="text-brand-green font-extrabold">{agreementPercentage}%</span>
          </div>

          <div className="w-full h-3.5 bg-brand-cream rounded-full border border-brand-ink/20 overflow-hidden relative mb-2">
            <div
              className="h-full bg-brand-green rounded-full transition-all duration-700"
              style={{ width: `${agreementPercentage}%` }}
            />
          </div>

          {/* Runner-up Contenders Breakdown */}
          {runnerUps.length > 0 && (
            <div className="mt-3 pt-3 border-t border-brand-ink/10">
              <span className="text-[11px] font-bold text-brand-muted block mb-2">
                {t('consensus.topContenders')}:
              </span>
              <div className="flex flex-col gap-1.5">
                {runnerUps.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs text-brand-ink font-semibold bg-brand-cream/60 px-2.5 py-1.5 rounded-xl border border-brand-ink/10"
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{item.def?.icon}</span>
                      <span>{locale === 'ar' ? item.def?.ar : item.def?.en}</span>
                    </span>
                    <span className="text-brand-muted font-bold text-[11px]">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="max-w-md w-full mx-auto mt-3 flex flex-col gap-2.5">
        {isHost ? (
          <>
            <TactileButton
              onClick={startSwiping}
              variant="primary"
              fullWidth
              size="lg"
            >
              {locale === 'ar' ? 'يلا نختار المطعم 🚀' : 'Pick Restaurant 🚀'}
            </TactileButton>

            <TactileButton
              onClick={resetToLobby}
              variant="secondary"
              fullWidth
              size="sm"
            >
              {t('consensus.startOver')}
            </TactileButton>
          </>
        ) : (
          <div className="bg-white/80 border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] rounded-2xl p-3 text-center">
            <p className="text-xs font-bold text-[#7A6E67] font-alexandria animate-pulse">
              {locale === 'ar'
                ? 'المؤسس بيفتح اختيار المطاعم الحين... ⏳'
                : 'Host will start restaurant picking shortly... ⏳'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
