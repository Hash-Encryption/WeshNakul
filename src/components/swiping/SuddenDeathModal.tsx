import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { RestaurantItem } from '../../types/restaurant';
import { useLocale } from '../../context/LocaleContext';
import { broadcastSuddenDeathVote, subscribeToSuddenDeathVote } from '../../lib/supabase';
import { MiniGameIntroOverlay } from '../minigames/MiniGameIntroOverlay';
import { trackMiniGameStarted, trackMiniGameCompleted } from '../../lib/analytics';

interface SuddenDeathModalProps {
  isOpen: boolean;
  roomId: string;
  currentParticipantId: string;
  isHost: boolean;
  restaurants: RestaurantItem[] | [RestaurantItem, RestaurantItem] | null;
  totalParticipants: number;
  skipIntro?: boolean;
  onSelectWinner: (winner: RestaurantItem, method: 'sudden_death') => void;
  onClose: () => void;
}

export const SuddenDeathModal: React.FC<SuddenDeathModalProps> = ({
  isOpen,
  roomId,
  currentParticipantId,
  isHost,
  restaurants,
  totalParticipants,
  skipIntro = false,
  onSelectWinner,
  onClose,
}) => {
  const { t, locale } = useLocale();

  // Gauntlet Round State
  const totalRounds = Math.max(1, (restaurants?.length || 2) - 1);
  const [roundIndex, setRoundIndex] = useState(0);
  const [currentPair, setCurrentPair] = useState<[RestaurantItem, RestaurantItem] | null>(() => {
    if (restaurants && restaurants.length >= 2) {
      return [restaurants[0], restaurants[1]];
    }
    return null;
  });

  // Per-round voting & timer state
  const shouldSkipIntro = skipIntro || (typeof window !== 'undefined' && Boolean((window as any).__MINIGAME_HARNESS_READY__));
  const [showIntro, setShowIntro] = useState(!shouldSkipIntro);
  const [timeLeft, setTimeLeft] = useState(10);
  const [votes, setVotes] = useState<Record<string, { restaurantId: string; timestamp: number }>>({});
  const [myVote, setMyVote] = useState<string | null>(null);
  const [isSpeedWin, setIsSpeedWin] = useState(false);
  const [isFailedZeroVotes, setIsFailedZeroVotes] = useState(false);
  const [roundWinner, setRoundWinner] = useState<RestaurantItem | null>(null);

  const timerRef = useRef<any>(null);
  const hasTrackedStartRef = useRef(false);
  const votedCount = Object.keys(votes).length;
  const isFinished = timeLeft === 0 || (votedCount >= totalParticipants && totalParticipants > 0);

  // Initialize first pair when modal opens
  useEffect(() => {
    if (isOpen && !hasTrackedStartRef.current) {
      trackMiniGameStarted({
        roomId,
        gameType: 'sudden_death',
        participantCount: totalParticipants,
      });
      hasTrackedStartRef.current = true;
    } else if (!isOpen) {
      hasTrackedStartRef.current = false;
    }

    if (restaurants && restaurants.length >= 2) {
      setCurrentPair([restaurants[0], restaurants[1]]);
      setRoundIndex(0);
      setVotes({});
      setMyVote(null);
      setTimeLeft(10);
      setIsSpeedWin(false);
      setIsFailedZeroVotes(false);
      setRoundWinner(null);
      setShowIntro(!shouldSkipIntro);
    }
  }, [isOpen, roomId, restaurants, shouldSkipIntro]);

  // Subscribe to realtime votes
  useEffect(() => {
    if (!isOpen || !roomId) return;

    const unsubscribe = subscribeToSuddenDeathVote(roomId, (vote) => {
      if (vote.roundIndex !== undefined && vote.roundIndex !== roundIndex) {
        return;
      }
      setVotes((prev) => ({
        ...prev,
        [vote.participantId]: {
          restaurantId: vote.restaurantId,
          timestamp: vote.timestamp || Date.now(),
        },
      }));
    });

    return () => unsubscribe();
  }, [isOpen, roomId, roundIndex]);

  // 10-second countdown timer per round
  useEffect(() => {
    if (!isOpen || !currentPair || roundWinner || isFailedZeroVotes || showIntro) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, currentPair, roundIndex, roundWinner, isFailedZeroVotes, showIntro]);

  // Handle round resolution
  useEffect(() => {
    if (!isOpen || !currentPair || !isFinished || roundWinner || isFailedZeroVotes || showIntro) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const [r1, r2] = currentPair;
    const votesArr1 = Object.values(votes).filter((v) => v.restaurantId === r1.id);
    const votesArr2 = Object.values(votes).filter((v) => v.restaurantId === r2.id);
    const votes1 = votesArr1.length;
    const votes2 = votesArr2.length;

    // Edge Case 1: 0 vs 0 (No votes cast) -> FAILED SUDDEN DEATH FALLBACK
    if (votes1 === 0 && votes2 === 0) {
      setIsFailedZeroVotes(true);
      return;
    }

    let winner: RestaurantItem;
    let wonBySpeed = false;

    // Edge Case 2: Even vote split (e.g., 1 vs 1, or 2 vs 2) -> SPEED TIE-BREAKER
    if (votes1 === votes2) {
      const sorted1 = [...votesArr1].sort((a, b) => a.timestamp - b.timestamp);
      const sorted2 = [...votesArr2].sort((a, b) => a.timestamp - b.timestamp);
      const lastVoteTs1 = sorted1[sorted1.length - 1]?.timestamp || 0;
      const lastVoteTs2 = sorted2[sorted2.length - 1]?.timestamp || 0;

      winner = lastVoteTs1 <= lastVoteTs2 ? r1 : r2;
      wonBySpeed = true;
    } else {
      winner = votes1 > votes2 ? r1 : r2;
    }

    setRoundWinner(winner);
    setIsSpeedWin(wonBySpeed);

    // If more rounds in King-of-the-Hill gauntlet
    if (roundIndex < totalRounds - 1 && restaurants && restaurants[roundIndex + 2]) {
      const nextChallenger = restaurants[roundIndex + 2];
      const timer = setTimeout(() => {
        setCurrentPair([winner, nextChallenger]);
        setRoundIndex((prev) => prev + 1);
        setVotes({});
        setMyVote(null);
        setTimeLeft(10);
        setIsSpeedWin(false);
        setRoundWinner(null);
      }, 2200);
      return () => clearTimeout(timer);
    } else if (isHost) {
      // Final champion determined! Host locks in winner
      const timer = setTimeout(() => {
        trackMiniGameCompleted({
          roomId,
          gameType: 'sudden_death',
          outcomeRestaurantId: winner.id,
        });
        onSelectWinner(winner, 'sudden_death');
      }, wonBySpeed ? 2000 : 1500);
      return () => clearTimeout(timer);
    }
  }, [
    isOpen,
    currentPair,
    isFinished,
    roundWinner,
    isFailedZeroVotes,
    votes,
    roundIndex,
    totalRounds,
    restaurants,
    isHost,
    onSelectWinner,
    showIntro,
  ]);

  if (!isOpen || !currentPair) return null;

  const [r1, r2] = currentPair;
  const votes1 = Object.values(votes).filter((v) => v.restaurantId === r1.id).length;
  const votes2 = Object.values(votes).filter((v) => v.restaurantId === r2.id).length;
  const totalVotesCast = votes1 + votes2;
  const pct1 = totalVotesCast === 0 ? 50 : Math.round((votes1 / totalVotesCast) * 100);
  const pct2 = totalVotesCast === 0 ? 50 : 100 - pct1;

  const handleCastVote = (restaurantId: string) => {
    if (isFinished || roundWinner || isFailedZeroVotes) return;
    const now = Date.now();
    setMyVote(restaurantId);
    setVotes((prev) => ({
      ...prev,
      [currentParticipantId]: { restaurantId, timestamp: now },
    }));
    broadcastSuddenDeathVote(roomId, {
      participantId: currentParticipantId,
      restaurantId,
      timestamp: now,
      roundIndex,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 25 }}
          className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl border-2 border-[#241B18] shadow-[0px_6px_0px_#241B18] p-4 sm:p-5 text-center flex flex-col gap-3 overflow-hidden"
        >
          {showIntro && (
            <MiniGameIntroOverlay
              gameId="sudden_death"
              onComplete={() => setShowIntro(false)}
            />
          )}

          {/* Header & Round / Timer Badge */}
          <div className="flex items-center justify-between gap-2 border-b-2 border-[#241B18]/10 pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">⚡</span>
              <div className="text-start">
                <h3 className="text-base sm:text-lg font-black text-[#241B18] font-alexandria tracking-tight">
                  {t('gameSwiper.suddenDeathTitle')}
                </h3>
                {totalRounds > 1 && (
                  <span className="inline-block text-[11px] font-black text-[#F0443E] font-alexandria">
                    {locale === 'ar'
                      ? `الجولة ${roundIndex + 1} من ${totalRounds}`
                      : `Round ${roundIndex + 1} of ${totalRounds}`}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`px-2.5 py-1 rounded-xl border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] text-xs font-black font-alexandria flex items-center gap-1 ${
                timeLeft <= 3 ? 'bg-[#F0443E] text-white animate-pulse' : 'bg-[#FFD75A] text-[#241B18]'
              }`}
            >
              <span>⏱️</span>
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* Always-Visible Explainer Announcer Pill */}
          <div className="w-full flex items-center justify-center -mt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0EE] border border-[#F0443E]/25 text-[#F0443E] font-alexandria font-black text-[11px] sm:text-xs shadow-xs text-center">
              <span>⚔️</span>
              <span>
                {locale === 'ar'
                  ? 'الفائز يستمر للجولة القادمة — الخاسر يخرج فوراً!'
                  : 'Winner stays on — loser is eliminated!'}
              </span>
            </div>
          </div>

          {/* Speed Tie-Breaker Visual Badge */}
          {isSpeedWin && roundWinner && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-1 px-3 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-900 text-xs font-black font-alexandria flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>⚡</span>
              <span>{locale === 'ar' ? 'حُسمت بالسرعة!' : 'Won by Speed!'}</span>
            </motion.div>
          )}

          {/* Real-time Tug-of-War Progress Bar */}
          <div className="w-full bg-[#FFF8F1] border-2 border-[#241B18] rounded-full h-6 p-0.5 relative overflow-hidden flex shadow-[0px_2px_0px_#241B18]">
            <motion.div
              style={{ width: `${pct1}%` }}
              className="bg-[#55B96A] h-full rounded-s-full flex items-center justify-start ps-2 text-[10px] font-black text-white transition-all duration-300"
            >
              {votes1 > 0 && `${votes1}`}
            </motion.div>
            <motion.div
              style={{ width: `${pct2}%` }}
              className="bg-[#FF6B6B] h-full rounded-e-full flex items-center justify-end pe-2 text-[10px] font-black text-white transition-all duration-300"
            >
              {votes2 > 0 && `${votes2}`}
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] font-black text-[#241B18]">
              {totalVotesCast > 0 ? `${pct1}% : ${pct2}%` : locale === 'ar' ? 'صوتوا الآن! ⚔️' : 'Vote Now! ⚔️'}
            </div>
          </div>

          {/* Split-Screen Cards: Option 1 (Top) & Option 2 (Bottom) */}
          <div className="flex flex-col gap-2.5 my-1">
            {/* Option 1 */}
            <button
              type="button"
              disabled={isFinished || Boolean(roundWinner) || isFailedZeroVotes}
              onClick={() => handleCastVote(r1.id)}
              className={`w-full rounded-2xl border-2 border-[#241B18] p-3 text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
                roundWinner?.id === r1.id
                  ? 'bg-[#E8F8EE] border-[#55B96A] shadow-[0px_4px_0px_#55B96A] scale-[1.02]'
                  : myVote === r1.id
                  ? 'bg-[#E8F8EE] border-[#55B96A] shadow-[0px_4px_0px_#55B96A] -translate-y-0.5'
                  : 'bg-white shadow-[0px_3px_0px_#241B18] hover:bg-[#FFF8F1] active:translate-y-1 active:shadow-none'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {r1.imageUrl ? (
                  <img
                    src={r1.imageUrl}
                    alt={r1.nameAr}
                    className="w-12 h-12 rounded-xl object-cover border border-[#241B18]/20 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#FFF8F1] border-2 border-[#241B18] flex items-center justify-center text-xl shrink-0 shadow-xs">
                    🍽️
                  </div>
                )}
                <div className="min-w-0 truncate">
                  <h4 className="text-base font-black text-[#241B18] font-alexandria truncate">
                    {locale === 'ar' ? r1.nameAr : r1.nameEn}
                  </h4>
                  <p className="text-xs font-semibold text-[#7A6E67] font-alexandria truncate">
                    {r1.rating != null && !Number.isNaN(Number(r1.rating)) ? `⭐ ${Number(r1.rating).toFixed(1)}` : ''}
                    {r1.rating != null && r1.priceTier ? ' • ' : ''}
                    {r1.priceTier || ''}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="w-8 h-8 rounded-full border-2 border-[#241B18] bg-white flex items-center justify-center font-black text-xs shadow-xs">
                  {votes1}
                </span>
                {roundWinner?.id === r1.id ? (
                  <span className="text-xl">🏆</span>
                ) : myVote === r1.id ? (
                  <span className="text-lg">✅</span>
                ) : null}
              </div>
            </button>

            {/* VS Divider */}
            <div className="flex items-center justify-center -my-1 z-10">
              <span className="bg-[#241B18] text-[#FFD75A] border-2 border-white px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider shadow-sm">
                VS
              </span>
            </div>

            {/* Option 2 */}
            <button
              type="button"
              disabled={isFinished || Boolean(roundWinner) || isFailedZeroVotes}
              onClick={() => handleCastVote(r2.id)}
              className={`w-full rounded-2xl border-2 border-[#241B18] p-3 text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
                roundWinner?.id === r2.id
                  ? 'bg-[#E8F8EE] border-[#55B96A] shadow-[0px_4px_0px_#55B96A] scale-[1.02]'
                  : myVote === r2.id
                  ? 'bg-[#FFEFEF] border-[#F0443E] shadow-[0px_4px_0px_#F0443E] -translate-y-0.5'
                  : 'bg-white shadow-[0px_3px_0px_#241B18] hover:bg-[#FFF8F1] active:translate-y-1 active:shadow-none'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {r2.imageUrl ? (
                  <img
                    src={r2.imageUrl}
                    alt={r2.nameAr}
                    className="w-12 h-12 rounded-xl object-cover border border-[#241B18]/20 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#FFF8F1] border-2 border-[#241B18] flex items-center justify-center text-xl shrink-0 shadow-xs">
                    🍽️
                  </div>
                )}
                <div className="min-w-0 truncate">
                  <h4 className="text-base font-black text-[#241B18] font-alexandria truncate">
                    {locale === 'ar' ? r2.nameAr : r2.nameEn}
                  </h4>
                  <p className="text-xs font-semibold text-[#7A6E67] font-alexandria truncate">
                    {r2.rating != null && !Number.isNaN(Number(r2.rating)) ? `⭐ ${Number(r2.rating).toFixed(1)}` : ''}
                    {r2.rating != null && r2.priceTier ? ' • ' : ''}
                    {r2.priceTier || ''}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="w-8 h-8 rounded-full border-2 border-[#241B18] bg-white flex items-center justify-center font-black text-xs shadow-xs">
                  {votes2}
                </span>
                {roundWinner?.id === r2.id ? (
                  <span className="text-xl">🏆</span>
                ) : myVote === r2.id ? (
                  <span className="text-lg">✅</span>
                ) : null}
              </div>
            </button>
          </div>

          {/* Status Hint / Failed Notice */}
          <div className="text-center pt-1">
            {isFailedZeroVotes ? (
              <div className="flex flex-col gap-2 p-3 rounded-2xl bg-red-50 border-2 border-red-400 text-red-700">
                <span className="text-2xl">⚠️</span>
                <p className="text-xs font-black font-alexandria leading-snug">
                  {locale === 'ar'
                    ? 'فشل الموت المفاجئ لعدم التصويت! جربوا لعبة ثانية أو روليت المطاعم.'
                    : 'Sudden Death failed — no one voted! Try another mini-game or use Food Roulette.'}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-1 py-2 px-3 rounded-xl bg-white border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] text-[#241B18] text-xs font-black hover:bg-neutral-50 active:translate-y-0.5 cursor-pointer font-alexandria"
                >
                  {locale === 'ar' ? 'العودة لخيارات الحسم ↩️' : 'Return to Tiebreaker Menu ↩️'}
                </button>
              </div>
            ) : roundWinner ? (
              <p className="text-xs font-black text-[#55B96A] font-alexandria animate-bounce">
                {roundIndex < totalRounds - 1
                  ? locale === 'ar'
                    ? '🔥 تأهل الفائز للجولة القادمة!'
                    : '🔥 Winner advances to the next round!'
                  : isHost
                  ? locale === 'ar'
                    ? '🎉 جاري اعتماد البطل النهائي...'
                    : '🎉 Locking in final champion...'
                  : t('gameSwiper.waitingForHost')}
              </p>
            ) : myVote ? (
              <p className="text-xs font-bold text-[#7A6E67] font-alexandria">
                {locale === 'ar' ? 'تم تسجيل صوتك! بانتظار الباقين...' : 'Vote locked in! Waiting for squad...'}
              </p>
            ) : (
              <p className="text-xs font-bold text-[#241B18] font-alexandria">
                {locale === 'ar' ? 'اضغط على خيارك لحسم المواجهة! 👆' : 'Tap your pick to break the tie! 👆'}
              </p>
            )}
          </div>

          {!isFailedZeroVotes && (isHost || isFinished) && (
            <button
              type="button"
              onClick={onClose}
              className="mt-1 text-xs font-bold text-[#7A6E67] hover:text-[#241B18] underline cursor-pointer"
            >
              {t('common.close')}
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
