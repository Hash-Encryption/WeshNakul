import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import type { RestaurantItem } from '../../../types/restaurant';
import type { ShuffleCardItem, ShuffleCardsPhase } from '../../../types/shuffleCards';
import { ShuffleCard } from './ShuffleCard';
import { useLocale } from '../../../context/LocaleContext';
import { broadcastShuffleCards, subscribeToShuffleCards } from '../../../lib/supabase';

interface ShuffleCardsModalProps {
  isOpen: boolean;
  roomId: string;
  currentParticipantId: string;
  isHost: boolean;
  captain: { id: string; nickname: string; player_color?: string };
  restaurants: RestaurantItem[];
  winnerId: string;
  seed?: string;
  onWinnerConfirmed: (winner: RestaurantItem) => Promise<void> | void;
  onClose: () => void;
}

export const ShuffleCardsModal: React.FC<ShuffleCardsModalProps> = ({
  isOpen,
  roomId,
  currentParticipantId,
  isHost,
  captain,
  restaurants,
  winnerId,
  seed = 'weshnakul',
  onWinnerConfirmed,
  onClose,
}) => {
  const { t, isRTL } = useLocale();
  const reduceMotion = useReducedMotion();
  const isCaptain = currentParticipantId === captain.id;

  // Authoritative server-selected winner
  const authoritativeWinner = useMemo<RestaurantItem>(() => {
    const found = restaurants.find((r) => r.id === winnerId);
    return found || restaurants[0];
  }, [restaurants, winnerId]);

  const totalContenders = restaurants.length;

  // Compute 3 finalists deterministically for 5+ contender vortex qualifier
  const finalists = useMemo<RestaurantItem[]>(() => {
    if (totalContenders < 5) return restaurants;

    // Must include the authoritative winner
    const nonWinners = restaurants.filter((r) => r.id !== authoritativeWinner.id);

    // Deterministic sort using deterministic pseudo-hash of id + seed
    const sortedRunnersUp = [...nonWinners].sort((a, b) => {
      const hashA = (a.id + seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const hashB = (b.id + seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return hashA - hashB;
    });

    const runnerUp1 = sortedRunnersUp[0] || nonWinners[0];
    const runnerUp2 = sortedRunnersUp[1] || nonWinners[1];

    return [authoritativeWinner, runnerUp1, runnerUp2].filter(Boolean);
  }, [restaurants, authoritativeWinner, totalContenders, seed]);

  // Initial phase depends on contender count
  const [phase, setPhase] = useState<ShuffleCardsPhase>(
    totalContenders >= 5 ? 'vortex_qualifier' : 'initial_reveal'
  );

  const [tappedSlotIndex, setTappedSlotIndex] = useState<number | null>(null);
  const [shuffleAgainCount, setShuffleAgainCount] = useState<number>(0);
  const [swapStep, setSwapStep] = useState<number>(0);
  const [ejectedCardIds, setEjectedCardIds] = useState<Set<string>>(new Set());
  const [revealedWinner, setRevealedWinner] = useState<boolean>(false);
  const isFinalizingRef = useRef(false);

  // Build table cards based on rules
  const initTableCards = useCallback(
    (isReshuffle = false) => {
      if (totalContenders === 2) {
        // Case 1: Exactly 2 tied contenders -> 3-Card Monte with "Shuffle Again" card
        const [cA, cB] = restaurants;
        // In reshuffle or initial, ensure winner is present
        const cards: ShuffleCardItem[] = [
          {
            id: cA.id,
            isShuffleAgain: false,
            restaurant: cA,
            contenderLabel: isRTL ? 'المرشح أ' : 'Contender A',
            isFaceUp: !isReshuffle,
            isZoomed: false,
            isWinner: cA.id === authoritativeWinner.id,
            isEjected: false,
            slotIndex: 0,
          },
          {
            id: 'shuffle_again',
            isShuffleAgain: true,
            contenderLabel: isRTL ? 'اخلط مرة أخرى' : 'Shuffle Again',
            isFaceUp: !isReshuffle,
            isZoomed: false,
            isWinner: false,
            isEjected: false,
            slotIndex: 1,
          },
          {
            id: cB.id,
            isShuffleAgain: false,
            restaurant: cB,
            contenderLabel: isRTL ? 'المرشح ب' : 'Contender B',
            isFaceUp: !isReshuffle,
            isZoomed: false,
            isWinner: cB.id === authoritativeWinner.id,
            isEjected: false,
            slotIndex: 2,
          },
        ];
        return cards;
      }

      if (totalContenders === 3) {
        // Case 2: Exactly 3 tied contenders -> 3-Card table
        return restaurants.map((r, idx) => ({
          id: r.id,
          isShuffleAgain: false,
          restaurant: r,
          contenderLabel: isRTL ? `المرشح ${String.fromCharCode(0x0623 + idx)}` : `Contender ${String.fromCharCode(65 + idx)}`,
          isFaceUp: !isReshuffle,
          isZoomed: false,
          isWinner: r.id === authoritativeWinner.id,
          isEjected: false,
          slotIndex: idx,
        }));
      }

      if (totalContenders === 4) {
        // Case 3: Exactly 4 tied contenders -> 2x2 grid
        return restaurants.map((r, idx) => ({
          id: r.id,
          isShuffleAgain: false,
          restaurant: r,
          contenderLabel: isRTL ? `المرشح ${String.fromCharCode(0x0623 + idx)}` : `Contender ${String.fromCharCode(65 + idx)}`,
          isFaceUp: !isReshuffle,
          isZoomed: false,
          isWinner: r.id === authoritativeWinner.id,
          isEjected: false,
          slotIndex: idx,
        }));
      }

      // Case 4: 5+ contenders (Vortex qualifier narrowing down to 3 finalists)
      // Display initial pool of cards (capped at 8 for safe DOM rendering)
      const initialPool = restaurants.slice(0, 8);
      return initialPool.map((r, idx) => ({
        id: r.id,
        isShuffleAgain: false,
        restaurant: r,
        contenderLabel: isRTL ? `المرشح ${idx + 1}` : `Contender ${idx + 1}`,
        isFaceUp: false, // face down for sleek vortex orbit
        isZoomed: false,
        isWinner: r.id === authoritativeWinner.id,
        isEjected: false,
        slotIndex: idx,
      }));
    },
    [totalContenders, restaurants, authoritativeWinner, isRTL]
  );

  // Active cards state on the table
  const [tableCards, setTableCards] = useState<ShuffleCardItem[]>(() => initTableCards(false));

  // Reset table cards and phase when modal opens or contender count / winner changes
  useEffect(() => {
    if (!isOpen) return;
    setPhase(totalContenders >= 5 ? 'vortex_qualifier' : 'initial_reveal');
    setTableCards(initTableCards(false));
    setTappedSlotIndex(null);
    setShuffleAgainCount(0);
    setSwapStep(0);
    setEjectedCardIds(new Set());
    setRevealedWinner(false);
    isFinalizingRef.current = false;
  }, [isOpen, totalContenders, winnerId, initTableCards]);

  // Handle phase transitions
  useEffect(() => {
    if (!isOpen) return;

    if (phase === 'initial_reveal') {
      // Show cards face-up for 2 seconds, then flip face-down
      const timer = setTimeout(() => {
        setTableCards((prev) => prev.map((c) => ({ ...c, isFaceUp: false })));
        setPhase('flipping_down');
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (phase === 'flipping_down') {
      // Brief pause after flipping before shuffle starts
      const timer = setTimeout(() => {
        setPhase('shuffling');
      }, 600);
      return () => clearTimeout(timer);
    }

    if (phase === 'shuffling') {
      // Execute 3 smooth position swap cycles
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setSwapStep(step);
        if (step >= 4) {
          clearInterval(interval);
          setSwapStep(0);
          setPhase('pick_ready');
        }
      }, 420);
      return () => clearInterval(interval);
    }

    if (phase === 'vortex_qualifier') {
      // Orbiting vortex: eject non-finalists one by one
      const nonFinalistIds = restaurants
        .map((r) => r.id)
        .filter((id) => !finalists.some((f) => f.id === id));

      let ejectIdx = 0;
      const timer = setInterval(() => {
        if (ejectIdx < nonFinalistIds.length) {
          const ejectId = nonFinalistIds[ejectIdx];
          setEjectedCardIds((prev) => new Set([...prev, ejectId]));
          ejectIdx++;
        } else {
          clearInterval(timer);
          // Transition to Finalists Reveal
          setTimeout(() => {
            // Replace table cards with the 3 Finalists
            const finalistCards: ShuffleCardItem[] = finalists.map((r, idx) => ({
              id: r.id,
              isShuffleAgain: false,
              restaurant: r,
              contenderLabel: isRTL ? `مرشح نهائي ${idx + 1}` : `Finalist ${idx + 1}`,
              isFaceUp: true,
              isZoomed: false,
              isWinner: r.id === authoritativeWinner.id,
              isEjected: false,
              slotIndex: idx,
            }));
            setTableCards(finalistCards);
            setPhase('finalists_reveal');
          }, 600);
        }
      }, 400);

      return () => clearInterval(timer);
    }

    if (phase === 'finalists_reveal') {
      // Display the 3 finalists face-up for 1.8 seconds, then flip down and shuffle
      const timer = setTimeout(() => {
        setTableCards((prev) => prev.map((c) => ({ ...c, isFaceUp: false })));
        setPhase('flipping_down');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [phase, isOpen, restaurants, finalists, authoritativeWinner, isRTL]);

  // Reshuffle flow for "Shuffle Again"
  const executeReshuffle = useCallback(() => {
    setShuffleAgainCount((prev) => prev + 1);
    setTappedSlotIndex(null);
    setTableCards((prev) =>
      prev.map((c) => ({ ...c, isFaceUp: false, isZoomed: false }))
    );
    setPhase('shuffling');
  }, []);

  // Execute pick when Captain taps (or when received over realtime)
  const handleExecutePick = useCallback((cardIndex: number, isShuffleAgainPick: boolean) => {
    setTappedSlotIndex(cardIndex);
    setPhase('revealing_pick');

    // Haptics & zoom
    try {
      navigator.vibrate?.(25);
    } catch {}

    if (isShuffleAgainPick) {
      // Tapped the "Shuffle Again" card!
      setTableCards((prev) =>
        prev.map((c, i) =>
          i === cardIndex ? { ...c, isZoomed: true, isFaceUp: true } : c
        )
      );

      // Bounce pulse, flip back down, reshuffle
      setTimeout(() => {
        setPhase('shuffle_again_bounce');
        setTimeout(() => {
          executeReshuffle();
        }, 1200);
      }, 1000);
    } else {
      // Winning card revealed!
      // Guarantee the tapped card shows the server-authoritative winner
      setTableCards((prev) =>
        prev.map((c, i) => {
          if (i === cardIndex) {
            return {
              ...c,
              restaurant: authoritativeWinner,
              isWinner: true,
              isZoomed: true,
              isFaceUp: true,
            };
          }
          // The remaining cards show runners-up
          return {
            ...c,
            isZoomed: false,
            isFaceUp: true,
          };
        })
      );

      setRevealedWinner(true);
      setPhase('winner_celebration');

      // Trigger celebration confetti
      if (typeof window !== 'undefined' && !reduceMotion) {
        try {
          confetti({
            particleCount: 55,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#F0443E', '#FFD75A', '#55B96A', '#73C8EA'],
          });
        } catch {}
      }

      // Auto-finalize after celebration window (~2.8s)
      setTimeout(() => {
        if (!isFinalizingRef.current) {
          isFinalizingRef.current = true;
          setPhase('completed');
          if (isHost) {
            void broadcastShuffleCards(roomId, {
              type: 'shuffle_cards_finalized',
              winnerId: authoritativeWinner.id,
            });
          }
          void onWinnerConfirmed(authoritativeWinner);
        }
      }, 2800);
    }
  }, [authoritativeWinner, executeReshuffle, isHost, onWinnerConfirmed, reduceMotion, roomId]);

  const handlersRef = useRef({ handleExecutePick, executeReshuffle });
  useEffect(() => {
    handlersRef.current = { handleExecutePick, executeReshuffle };
  });

  // Realtime subscription for cross-client sync
  useEffect(() => {
    if (!isOpen || !roomId) return;

    const unsubscribe = subscribeToShuffleCards(roomId, (msg) => {
      if (msg.type === 'shuffle_cards_pick') {
        handlersRef.current.handleExecutePick(msg.cardIndex, msg.isShuffleAgain);
      } else if (msg.type === 'shuffle_cards_again') {
        handlersRef.current.executeReshuffle();
      } else if (msg.type === 'shuffle_cards_finalized') {
        if (!isFinalizingRef.current) {
          isFinalizingRef.current = true;
          setPhase('completed');
          void onWinnerConfirmed(authoritativeWinner);
        }
      }
    });

    return () => unsubscribe();
  }, [isOpen, roomId, authoritativeWinner, onWinnerConfirmed]);

  // Captain click handler
  const handleCardClick = (index: number) => {
    if (phase !== 'pick_ready') return;
    if (!isCaptain) return; // Only captain can pick

    const card = tableCards[index];
    if (!card) return;

    // Check if this pick triggers "Shuffle Again"
    // Guardrail: Allow at most 1 Shuffle Again pull; after that, reveal the winner!
    const shouldShuffleAgain =
      totalContenders === 2 &&
      card.isShuffleAgain &&
      shuffleAgainCount < 1;

    // Broadcast pick to all participants
    void broadcastShuffleCards(roomId, {
      type: 'shuffle_cards_pick',
      cardIndex: index,
      isShuffleAgain: shouldShuffleAgain,
      pickedByParticipantId: currentParticipantId,
    });

    handleExecutePick(index, shouldShuffleAgain);
  };

  if (!isOpen) return null;

  // Header prompt text
  const getPromptText = () => {
    switch (phase) {
      case 'vortex_qualifier':
        return t('shuffleCards.vortexStatus');
      case 'finalists_reveal':
        return t('shuffleCards.finalistsStatus');
      case 'shuffling':
      case 'flipping_down':
        return t('shuffleCards.shufflingStatus');
      case 'shuffle_again_bounce':
        return t('shuffleCards.shuffleAgainDesc');
      case 'winner_celebration':
        return t('shuffleCards.winnerCelebration');
      case 'pick_ready':
      case 'revealing_pick':
      default:
        return isCaptain
          ? t('shuffleCards.captainTurnPrompt')
          : t('shuffleCards.spectatorWaitingPrompt', { captain: captain.nickname });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-[#FFFDF8]/95 backdrop-blur-md px-3 sm:px-4 py-3 select-none overflow-y-auto"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-lg mx-auto pt-1 pb-2">
        {/* Back / Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={phase !== 'initial_reveal' && phase !== 'pick_ready'}
          className="w-10 h-10 rounded-full bg-white border border-[#241B18]/15 flex items-center justify-center text-[#241B18] shadow-xs hover:bg-[#FFF5F2] active:scale-95 disabled:opacity-40 transition-all cursor-pointer"
          aria-label={t('common.back')}
        >
          <svg
            className={`w-5 h-5 text-[#241B18] ${isRTL ? '' : 'rotate-180'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Centered Logo Emblem */}
        <div className="relative flex items-center justify-center w-12 h-10">
          <div className="absolute w-6 h-7 bg-[#FFD75A] rounded-lg transform -rotate-12 -translate-x-2.5 shadow-xs border border-black/5 flex items-center justify-center text-xs">
            🍕
          </div>
          <div className="absolute w-6 h-7 bg-[#55B96A] rounded-lg transform rotate-12 translate-x-2.5 shadow-xs border border-black/5 flex items-center justify-center text-xs">
            🍔
          </div>
          <div className="relative z-10 text-[#F0443E] font-black text-2xl filter drop-shadow-[0_2px_4px_rgba(240,68,62,0.35)] leading-none">
            ؟
          </div>
        </div>

        {/* Squad Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF0EE] border border-[#F0443E]/20 text-[#F0443E] font-black text-xs font-alexandria shadow-xs">
          <span>👥</span>
          <span>{restaurants.length}</span>
        </div>
      </div>

      {/* Main Title & Captain Status Indicator */}
      <div className="flex flex-col items-center text-center my-1 sm:my-2 max-w-md mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-black text-[#241B18] font-alexandria tracking-tight">
          {t('shuffleCards.title')}
        </h2>

        {/* Subtitle / Animated status prompt */}
        <p className="text-xs sm:text-sm font-semibold text-[#7A6E67] font-alexandria mt-0.5">
          {getPromptText()}
        </p>

        {/* Captain Turn Badge */}
        <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8E6] border border-amber-300 shadow-xs font-alexandria font-black text-xs text-amber-900">
          <span>👑</span>
          <span>
            {isRTL
              ? `دور الكابتن (${captain.nickname})`
              : `CAPTAIN'S TURN (${captain.nickname})`}
          </span>
        </div>
      </div>

      {/* CARD ARENA */}
      <div className="flex-1 flex items-center justify-center w-full max-w-lg mx-auto py-3">
        {/* Vortex Orbit Qualifier (for 5+ contenders) */}
        {phase === 'vortex_qualifier' ? (
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
            {/* Spinning Orbit Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3.5, ease: 'linear' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {tableCards.map((card, idx) => {
                const total = tableCards.length;
                const angle = (idx * 2 * Math.PI) / total;
                const radius = 100; // orbit radius
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                const isEjected = ejectedCardIds.has(card.id);

                return (
                  <motion.div
                    key={card.id}
                    animate={
                      isEjected
                        ? {
                            x: x * 2.8,
                            y: y * 2.8,
                            opacity: 0,
                            scale: 0.3,
                          }
                        : {
                            x,
                            y,
                            opacity: 1,
                            scale: 0.75,
                          }
                    }
                    transition={{ duration: 0.45 }}
                    className="absolute w-20 h-28"
                  >
                    <ShuffleCard card={card} disabled />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Center Vortex Pulse */}
            <div className="w-16 h-16 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center animate-ping pointer-events-none" />
            <div className="absolute font-alexandria font-black text-xs text-[#241B18] bg-white/90 px-2 py-1 rounded-full border border-[#241B18]/15 shadow-sm">
              🌪️ {isRTL ? 'تصفية...' : 'Narrowing...'}
            </div>
          </div>
        ) : (
          /* Standard Card Layouts: 3-in-a-row (2 or 3 contenders / finalists) OR 2x2 grid (4 contenders) */
          <div
            className={`w-full ${
              totalContenders === 4
                ? 'grid grid-cols-2 gap-3 sm:gap-4 max-w-xs sm:max-w-sm mx-auto'
                : 'flex items-center justify-center gap-2 sm:gap-3 px-1'
            }`}
          >
            {tableCards.map((card, idx) => {
              // Position animation during criss-cross shuffle
              let xOffset = 0;
              if (phase === 'shuffling') {
                if (swapStep === 1) xOffset = idx % 2 === 0 ? 30 : -30;
                if (swapStep === 2) xOffset = idx % 2 === 0 ? -30 : 30;
                if (swapStep === 3) xOffset = idx === 0 ? 50 : idx === 2 ? -50 : 0;
              }

              const isTapped = tappedSlotIndex === idx;
              const isClickable = phase === 'pick_ready' && isCaptain;
              const isMuted = revealedWinner && !card.isWinner;

              return (
                <motion.div
                  key={`${card.id}-${idx}`}
                  animate={{
                    x: xOffset,
                    scale: isTapped ? 1.08 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 280,
                    damping: 22,
                  }}
                  className="flex-1 max-w-[130px] sm:max-w-[160px]"
                >
                  <ShuffleCard
                    card={card}
                    onClick={() => handleCardClick(idx)}
                    isClickable={isClickable}
                    disabled={phase !== 'pick_ready'}
                    isZoomed={isTapped}
                    isMuted={isMuted}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Status / Action Prompt */}
      <div className="w-full max-w-md mx-auto pt-2 pb-1 text-center">
        {phase === 'pick_ready' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full py-3.5 px-4 rounded-2xl border-2 border-[#241B18] font-alexandria font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0px_4px_0px_#241B18] ${
              isCaptain
                ? 'bg-[#F0443E] text-white animate-pulse'
                : 'bg-white text-[#241B18]'
            }`}
          >
            <span>{isCaptain ? '👇' : '👑'}</span>
            <span>
              {isCaptain
                ? (isRTL ? 'اختر بطاقة لكشف الفائز!' : 'Tap a card to reveal the winner!')
                : (isRTL
                    ? `بانتظار الكابتن (${captain.nickname}) ليختار بطاقة...`
                    : `Waiting for Captain (${captain.nickname}) to pick a card...`)}
            </span>
          </motion.div>
        )}

        {phase === 'shuffle_again_bounce' && (
          <div className="w-full py-3.5 px-4 rounded-2xl bg-[#FFE4C4] border-2 border-[#241B18] text-[#241B18] font-alexandria font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0px_4px_0px_#241B18] animate-bounce">
            <span>🔄</span>
            <span>{isRTL ? 'اخلط مرة أخرى!' : 'Shuffle Again!'}</span>
          </div>
        )}

        {phase === 'winner_celebration' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#55B96A] text-white border-2 border-[#241B18] font-alexandria font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0px_4px_0px_#241B18]"
          >
            <span>🎉</span>
            <span>
              {isRTL
                ? `الفائز: ${authoritativeWinner.nameAr || authoritativeWinner.nameEn}!`
                : `Winner: ${authoritativeWinner.nameEn || authoritativeWinner.nameAr}!`}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};
