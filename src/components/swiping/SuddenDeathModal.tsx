import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { RestaurantItem } from '../../types/restaurant';
import { useLocale } from '../../context/LocaleContext';
import { broadcastSuddenDeathVote, subscribeToSuddenDeathVote } from '../../lib/supabase';

interface SuddenDeathModalProps {
  isOpen: boolean;
  roomId: string;
  currentParticipantId: string;
  isHost: boolean;
  restaurants: [RestaurantItem, RestaurantItem] | null;
  totalParticipants: number;
  onSelectWinner: (winner: RestaurantItem) => void;
  onClose: () => void;
}

export const SuddenDeathModal: React.FC<SuddenDeathModalProps> = ({
  isOpen,
  roomId,
  currentParticipantId,
  isHost,
  restaurants,
  totalParticipants,
  onSelectWinner,
  onClose,
}) => {
  const { t, locale } = useLocale();
  const [timeLeft, setTimeLeft] = useState(10);
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [myVote, setMyVote] = useState<string | null>(null);
  const timerRef = useRef<any>(null);
  const votedCount = Object.keys(votes).length;
  const isFinished = timeLeft === 0 || (votedCount >= totalParticipants && totalParticipants > 0);

  // Subscribe to realtime votes
  useEffect(() => {
    if (!isOpen || !roomId) return;

    const unsubscribe = subscribeToSuddenDeathVote(roomId, (vote) => {
      setVotes((prev) => ({ ...prev, [vote.participantId]: vote.restaurantId }));
    });

    return () => unsubscribe();
  }, [isOpen, roomId]);

  // 10-second countdown timer
  useEffect(() => {
    if (!isOpen || !restaurants) return;

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
  }, [isOpen, restaurants]);

  // Handle resolution when time expires or all voted
  useEffect(() => {
    if (!isOpen || !restaurants || !isFinished) return;

    if (timerRef.current) clearInterval(timerRef.current);

    if (isHost) {
      const [r1, r2] = restaurants;
      const votes1 = Object.values(votes).filter((id) => id === r1.id).length;
      const votes2 = Object.values(votes).filter((id) => id === r2.id).length;

      let winner = r1;
      if (votes2 > votes1) {
        winner = r2;
      } else if (votes1 === votes2) {
        winner = r1.rating >= r2.rating ? r1 : r2;
      }

      const timeout = setTimeout(() => {
        onSelectWinner(winner);
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, restaurants, isFinished, isHost, onSelectWinner, votes]);

  if (!isOpen || !restaurants) return null;

  const [r1, r2] = restaurants;
  const votes1 = Object.values(votes).filter((id) => id === r1.id).length;
  const votes2 = Object.values(votes).filter((id) => id === r2.id).length;
  const totalVotesCast = votes1 + votes2;
  const pct1 = totalVotesCast === 0 ? 50 : Math.round((votes1 / totalVotesCast) * 100);
  const pct2 = totalVotesCast === 0 ? 50 : 100 - pct1;

  const handleCastVote = (restaurantId: string) => {
    if (isFinished) return;
    setMyVote(restaurantId);
    setVotes((prev) => ({ ...prev, [currentParticipantId]: restaurantId }));
    broadcastSuddenDeathVote(roomId, {
      participantId: currentParticipantId,
      restaurantId,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-sm bg-white rounded-3xl border-2 border-[#241B18] shadow-[0px_6px_0px_#241B18] p-4 sm:p-5 text-center flex flex-col gap-3 overflow-hidden"
        >
          {/* Header & Timer Badge */}
          <div className="flex items-center justify-between gap-2 border-b-2 border-[#241B18]/10 pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">⚡</span>
              <h3 className="text-lg font-black text-[#241B18] font-alexandria tracking-tight">
                {t('gameSwiper.suddenDeathTitle')}
              </h3>
            </div>
            <div className={`px-2.5 py-1 rounded-xl border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] text-xs font-black font-alexandria flex items-center gap-1 ${
              timeLeft <= 3 ? 'bg-[#F0443E] text-white animate-pulse' : 'bg-[#FFD75A] text-[#241B18]'
            }`}>
              <span>⏱️</span>
              <span>{timeLeft}s</span>
            </div>
          </div>

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
              {totalVotesCast > 0 ? `${pct1}% : ${pct2}%` : 'صوتوا الآن! ⚔️'}
            </div>
          </div>

          {/* Split-Screen Cards: Option 1 (Top) & Option 2 (Bottom) */}
          <div className="flex flex-col gap-2.5 my-1">
            {/* Option 1 */}
            <button
              type="button"
              onClick={() => handleCastVote(r1.id)}
              className={`w-full rounded-2xl border-2 border-[#241B18] p-3 text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
                myVote === r1.id
                  ? 'bg-[#E8F8EE] border-[#55B96A] shadow-[0px_4px_0px_#55B96A] -translate-y-0.5'
                  : 'bg-white shadow-[0px_3px_0px_#241B18] hover:bg-[#FFF8F1] active:translate-y-1 active:shadow-none'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {r1.imageUrl ? (
                  <img src={r1.imageUrl} alt={r1.nameAr} className="w-12 h-12 rounded-xl object-cover border border-[#241B18]/20 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#55B96A]/20 border border-[#241B18]/20 flex items-center justify-center text-xl shrink-0">
                    🍔
                  </div>
                )}
                <div className="min-w-0 truncate">
                  <h4 className="text-base font-black text-[#241B18] font-alexandria truncate">
                    {locale === 'ar' ? r1.nameAr : r1.nameEn}
                  </h4>
                  <p className="text-xs font-semibold text-[#7A6E67] font-alexandria truncate">
                    ⭐ {r1.rating.toFixed(1)} • {r1.priceTier}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="w-8 h-8 rounded-full border-2 border-[#241B18] bg-white flex items-center justify-center font-black text-xs shadow-xs">
                  {votes1}
                </span>
                {myVote === r1.id && <span className="text-lg">✅</span>}
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
              onClick={() => handleCastVote(r2.id)}
              className={`w-full rounded-2xl border-2 border-[#241B18] p-3 text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
                myVote === r2.id
                  ? 'bg-[#FFEFEF] border-[#F0443E] shadow-[0px_4px_0px_#F0443E] -translate-y-0.5'
                  : 'bg-white shadow-[0px_3px_0px_#241B18] hover:bg-[#FFF8F1] active:translate-y-1 active:shadow-none'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {r2.imageUrl ? (
                  <img src={r2.imageUrl} alt={r2.nameAr} className="w-12 h-12 rounded-xl object-cover border border-[#241B18]/20 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#F0443E]/20 border border-[#241B18]/20 flex items-center justify-center text-xl shrink-0">
                    🍕
                  </div>
                )}
                <div className="min-w-0 truncate">
                  <h4 className="text-base font-black text-[#241B18] font-alexandria truncate">
                    {locale === 'ar' ? r2.nameAr : r2.nameEn}
                  </h4>
                  <p className="text-xs font-semibold text-[#7A6E67] font-alexandria truncate">
                    ⭐ {r2.rating.toFixed(1)} • {r2.priceTier}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="w-8 h-8 rounded-full border-2 border-[#241B18] bg-white flex items-center justify-center font-black text-xs shadow-xs">
                  {votes2}
                </span>
                {myVote === r2.id && <span className="text-lg">✅</span>}
              </div>
            </button>
          </div>

          {/* Status Hint */}
          <div className="text-center pt-1">
            {isFinished ? (
              <p className="text-xs font-black text-[#55B96A] font-alexandria animate-bounce">
                {isHost ? '🎉 جاري اعتماد الفائز...' : t('gameSwiper.waitingForHost')}
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

          {isHost && !isFinished && (
            <button
              type="button"
              onClick={onClose}
              className="mt-1 text-xs font-bold text-[#7A6E67] hover:text-[#241B18] underline"
            >
              {t('common.close')}
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
