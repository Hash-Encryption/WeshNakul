import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import type { RestaurantItem } from '../../../types/restaurant';
import type { ShuffleCardItem, ShuffleCardsPhase } from '../../../types/shuffleCards';
import { ShuffleCard } from './ShuffleCard';
import { ShuffleSpeedLines } from './ShuffleSpeedLines';
import { useLocale } from '../../../context/LocaleContext';
import { broadcastShuffleCards, subscribeToShuffleCards } from '../../../lib/supabase';

// 6 permutation steps for Three-Card Monte crossover (slots 0, 1, 2)
const SHUFFLE_STEPS_3: number[][] = [
  [1, 0, 2], // Step 1: Left (0) and Center (1) swap
  [2, 0, 1], // Step 2: Center (now 0) and Right (2) swap
  [0, 2, 1], // Step 3: Full cross: Left travels to Right, Right to Left!
  [2, 1, 0], // Step 4: Rapid center cross
  [1, 2, 0], // Step 5: Diagonal criss-cross
  [0, 1, 2], // Step 6: Settle cleanly back to natural slots
];

// 6 permutation steps for 4-contender 2x2 grid (slots 0, 1, 2, 3)
const SHUFFLE_STEPS_4: number[][] = [
  [1, 0, 3, 2], // Step 1: Horizontal swap top and bottom
  [2, 3, 0, 1], // Step 2: Vertical column swap
  [3, 2, 1, 0], // Step 3: Full diagonal cross
  [2, 3, 1, 0], // Step 4: Horizontal swap
  [1, 0, 3, 2], // Step 5: Vertical swap
  [0, 1, 2, 3], // Step 6: Settle back
];

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

  // 1. Strict deduplication of input restaurants by ID (eliminates potential input duplicates)
  const uniqueRestaurants = useMemo<RestaurantItem[]>(() => {
    const seen = new Set<string>();
    const list: RestaurantItem[] = [];
    for (const r of restaurants) {
      if (r && r.id && !seen.has(r.id)) {
        seen.add(r.id);
        list.push(r);
      }
    }
    return list.length > 0 ? list : restaurants;
  }, [restaurants]);

  const totalContenders = uniqueRestaurants.length;

  // Authoritative server-selected winner
  const authoritativeWinner = useMemo<RestaurantItem>(() => {
    const found = uniqueRestaurants.find((r) => r.id === winnerId);
    return found || uniqueRestaurants[0];
  }, [uniqueRestaurants, winnerId]);

  // Compute 3 finalists deterministically for 5+ contender vortex qualifier
  const finalists = useMemo<RestaurantItem[]>(() => {
    if (totalContenders < 5) return uniqueRestaurants;

    // Must include the authoritative winner
    const nonWinners = uniqueRestaurants.filter((r) => r.id !== authoritativeWinner.id);

    // Deterministic sort using deterministic pseudo-hash of id + seed
    const sortedRunnersUp = [...nonWinners].sort((a, b) => {
      const hashA = (a.id + seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const hashB = (b.id + seed).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return hashA - hashB;
    });

    const runnerUp1 = sortedRunnersUp[0] || nonWinners[0];
    const runnerUp2 = sortedRunnersUp[1] || nonWinners[1];

    return [authoritativeWinner, runnerUp1, runnerUp2].filter(Boolean);
  }, [uniqueRestaurants, authoritativeWinner, totalContenders, seed]);

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

  // Build table cards based on rules (strictly unique items)
  const initTableCards = useCallback(
    (isReshuffle = false) => {
      if (totalContenders === 2) {
        // Case 1: Exactly 2 tied contenders -> 3-Card Monte with "Shuffle Again" card
        const [cA, cB] = uniqueRestaurants;
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
        return uniqueRestaurants.map((r, idx) => ({
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
        return uniqueRestaurants.map((r, idx) => ({
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
      const initialPool = uniqueRestaurants.slice(0, 8);
      return initialPool.map((r, idx) => ({
        id: r.id,
        isShuffleAgain: false,
        restaurant: r,
        contenderLabel: isRTL ? `المرشح ${idx + 1}` : `Contender ${idx + 1}`,
        isFaceUp: !isReshuffle,
        isZoomed: false,
        isWinner: r.id === authoritativeWinner.id,
        isEjected: false,
        slotIndex: idx,
      }));
    },
    [totalContenders, uniqueRestaurants, authoritativeWinner, isRTL]
  );

  // Active cards state on the table
  const [tableCards, setTableCards] = useState<ShuffleCardItem[]>(() => initTableCards(false));
  const hasPassedVortexRef = useRef<boolean>(false);
  const initializedSeedRef = useRef<string | null>(null);

  // Reset table cards and phase when modal opens or session seed changes
  useEffect(() => {
    if (!isOpen) {
      initializedSeedRef.current = null;
      return;
    }

    const currentKey = `${roomId}-${winnerId}-${seed}`;
    if (initializedSeedRef.current === currentKey) {
      return; // Already initialized for this round!
    }
    initializedSeedRef.current = currentKey;
    hasPassedVortexRef.current = false;

    setPhase('initial_reveal');
    setTableCards(initTableCards(false));
    setTappedSlotIndex(null);
    setShuffleAgainCount(0);
    setSwapStep(0);
    setEjectedCardIds(new Set());
    setRevealedWinner(false);
    isFinalizingRef.current = false;
  }, [isOpen, roomId, winnerId, seed, initTableCards]);

  // Construct deterministic, 100% deduplicated revealed cards assignment
  const buildRevealedCards = useCallback(
    (pickedIndex: number) => {
      let activeRunnersUp: RestaurantItem[] = [];
      let includeShuffleAgain = false;

      if (totalContenders === 2) {
        const runner =
          uniqueRestaurants.find((r) => r.id !== authoritativeWinner.id) ||
          uniqueRestaurants[1] ||
          uniqueRestaurants[0];
        activeRunnersUp = [runner];
        includeShuffleAgain = true;
      } else if (totalContenders === 4) {
        activeRunnersUp = uniqueRestaurants
          .filter((r) => r.id !== authoritativeWinner.id)
          .slice(0, 3);
      } else {
        const sourcePool = totalContenders >= 5 ? finalists : uniqueRestaurants;
        activeRunnersUp = sourcePool
          .filter((r) => r.id !== authoritativeWinner.id)
          .slice(0, 2);
      }

      const unpickedItems: Array<
        { type: 'restaurant'; item: RestaurantItem } | { type: 'shuffle_again' }
      > = [];
      for (const runner of activeRunnersUp) {
        unpickedItems.push({ type: 'restaurant', item: runner });
      }
      if (includeShuffleAgain) {
        unpickedItems.push({ type: 'shuffle_again' });
      }

      const slotCount = totalContenders === 4 ? 4 : 3;
      const result: ShuffleCardItem[] = [];

      for (let slot = 0; slot < slotCount; slot++) {
        if (slot === pickedIndex) {
          result.push({
            id: authoritativeWinner.id,
            isShuffleAgain: false,
            restaurant: authoritativeWinner,
            contenderLabel: isRTL ? 'الخيار الفائز' : 'Winning Pick',
            isFaceUp: true,
            isZoomed: true,
            isWinner: true,
            isEjected: false,
            slotIndex: slot,
          });
        } else {
          const next = unpickedItems.shift();
          if (next?.type === 'shuffle_again') {
            result.push({
              id: 'shuffle_again',
              isShuffleAgain: true,
              contenderLabel: isRTL ? 'اخلط مرة أخرى' : 'Shuffle Again',
              isFaceUp: false, // reveals after winner zoom
              isZoomed: false,
              isWinner: false,
              isEjected: false,
              slotIndex: slot,
            });
          } else if (next?.type === 'restaurant') {
            result.push({
              id: next.item.id,
              isShuffleAgain: false,
              restaurant: next.item,
              contenderLabel: isRTL ? 'مرشح' : 'Contender',
              isFaceUp: false, // reveals after winner zoom
              isZoomed: false,
              isWinner: false,
              isEjected: false,
              slotIndex: slot,
            });
          }
        }
      }

      return result;
    },
    [authoritativeWinner, finalists, isRTL, totalContenders, uniqueRestaurants]
  );

  const stateRef = useRef({
    uniqueRestaurants,
    finalists,
    authoritativeWinner,
    totalContenders,
    isRTL,
    seed,
  });
  stateRef.current = {
    uniqueRestaurants,
    finalists,
    authoritativeWinner,
    totalContenders,
    isRTL,
    seed,
  };

  // Handle phase transitions
  useEffect(() => {
    if (!isOpen) return;

    if (phase === 'initial_reveal') {
      // Step 1: Show cards face-up for 2.0 seconds, then flip face-down
      const timer = setTimeout(() => {
        setTableCards((prev) => prev.map((c) => ({ ...c, isFaceUp: false })));
        setPhase('flipping_down');
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (phase === 'flipping_down') {
      // Step 2: Flip cards face-down into ring (0.8s for 5+ vortex) or before shuffle (0.7s)
      const isPostFinalists = hasPassedVortexRef.current || stateRef.current.totalContenders < 5;
      const duration = isPostFinalists ? 700 : 800;

      const timer = setTimeout(() => {
        if (stateRef.current.totalContenders >= 5 && !hasPassedVortexRef.current) {
          setPhase('vortex_qualifier');
        } else {
          setPhase('shuffling');
        }
      }, duration);
      return () => clearTimeout(timer);
    }

    if (phase === 'vortex_qualifier') {
      // Step 3: Pure circular orbit for 2.2s with 0 cards ejected
      const currentFinalists = stateRef.current.finalists;
      const currentUnique = stateRef.current.uniqueRestaurants;
      const currentAuthoritativeWinner = stateRef.current.authoritativeWinner;
      const currentIsRTL = stateRef.current.isRTL;

      const nonFinalistIds = currentUnique
        .map((r) => r.id)
        .filter((id) => !currentFinalists.some((f) => f.id === id));

      let ejectIdx = 0;
      let intervalTimer: ReturnType<typeof setInterval> | null = null;
      let settleTimer: ReturnType<typeof setTimeout> | null = null;

      // 2.2s pure orbit
      const initialOrbitTimer = setTimeout(() => {
        // Step 4: Staggered One-by-One Ejections (600ms per card)
        intervalTimer = setInterval(() => {
          if (ejectIdx < nonFinalistIds.length) {
            const ejectId = nonFinalistIds[ejectIdx];
            setEjectedCardIds((prev) => new Set([...prev, ejectId]));
            ejectIdx++;
          } else {
            if (intervalTimer) clearInterval(intervalTimer);
            // Step 5: Hold remaining 3 in circle (0.9s), then deal to row face-up
            settleTimer = setTimeout(() => {
              hasPassedVortexRef.current = true;
              const finalistCards: ShuffleCardItem[] = currentFinalists.map((r, idx) => ({
                id: r.id,
                isShuffleAgain: false,
                restaurant: r,
                contenderLabel: currentIsRTL ? `مرشح نهائي ${idx + 1}` : `Finalist ${idx + 1}`,
                isFaceUp: true,
                isZoomed: false,
                isWinner: r.id === currentAuthoritativeWinner.id,
                isEjected: false,
                slotIndex: idx,
              }));
              setTableCards(finalistCards);
              setPhase('finalists_reveal');
            }, 900);
          }
        }, 600);
      }, 2200);

      return () => {
        clearTimeout(initialOrbitTimer);
        if (intervalTimer) clearInterval(intervalTimer);
        if (settleTimer) clearTimeout(settleTimer);
      };
    }

    if (phase === 'finalists_reveal') {
      // Step 5: Display the 3 finalists face-up for 2.2 seconds, then flip down
      const timer = setTimeout(() => {
        setTableCards((prev) => prev.map((c) => ({ ...c, isFaceUp: false })));
        setPhase('flipping_down');
      }, 2200);
      return () => clearTimeout(timer);
    }

    if (phase === 'shuffling') {
      // Step 6: 6 rapid, full-cross Three-Card Monte swaps (6 * 320ms = 1.92s)
      let step = 0;
      setSwapStep(1);
      const interval = setInterval(() => {
        step++;
        setSwapStep(step);
        if (step >= 6) {
          clearInterval(interval);
          setSwapStep(0);
          setPhase('pick_ready');
        }
      }, 320);
      return () => clearInterval(interval);
    }
  }, [phase, isOpen]);

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
  const handleExecutePick = useCallback(
    (cardIndex: number, isShuffleAgainPick: boolean) => {
      setTappedSlotIndex(cardIndex);
      setPhase('revealing_pick');

      // Haptics & feedback
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
          }, 1100);
        }, 900);
      } else {
        // Winning card revealed!
        // 1. Immediately place authoritative winner at cardIndex with isFaceUp: true and isZoomed: true,
        // while remaining unique runner-up cards are assigned to other slots (face-down initially).
        const revealedDeck = buildRevealedCards(cardIndex);
        setTableCards(revealedDeck);

        // 2. Dramatic reveal: after 750ms focus on the big zoomed winner card, flip runners-up in the background
        setTimeout(() => {
          setTableCards((prev) =>
            prev.map((c) => ({
              ...c,
              isFaceUp: true,
            }))
          );
        }, 750);

        // 3. Celebration confetti and celebration state
        setTimeout(() => {
          setRevealedWinner(true);
          setPhase('winner_celebration');

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
        }, 900);

        // 4. Auto-finalize after celebration window (~2.8s)
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
    },
    [authoritativeWinner, buildRevealedCards, executeReshuffle, isHost, onWinnerConfirmed, reduceMotion, roomId]
  );

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
      case 'initial_reveal':
        if (totalContenders >= 5) return t('shuffleCards.vortexStatus');
        return isCaptain
          ? (isRTL ? 'اختر بطاقة لكشف الفائز!' : 'Tap a card to reveal the winner!')
          : (isRTL
              ? `الكابتن (${captain.nickname}) يختار بطاقة...`
              : `${captain.nickname} is choosing a card...`);
      case 'pick_ready':
      case 'revealing_pick':
      default:
        return isCaptain
          ? (isRTL ? 'اختر بطاقة لكشف الفائز!' : 'Tap a card to reveal the winner!')
          : (isRTL
              ? `الكابتن (${captain.nickname}) يختار بطاقة...`
              : `${captain.nickname} is choosing a card...`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex flex-col justify-between p-3 sm:p-5 bg-gradient-to-b from-[#FAF4ED] via-[#FFFDFB] to-[#F3ECE4] text-[#241B18] overflow-hidden select-none animate-fade-in"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full max-w-lg mx-auto">
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="w-10 h-10 rounded-full border border-[#241B18]/15 bg-white/80 hover:bg-white text-base font-bold flex items-center justify-center transition-transform active:scale-90 shadow-xs"
        >
          ✕
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
          <span>{totalContenders}</span>
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
      <div className="relative flex-1 flex items-center justify-center w-full max-w-lg mx-auto py-3">
        {/* Cartoon Speed Lines while cards are crossing over */}
        {phase === 'shuffling' && <ShuffleSpeedLines />}

        {/* Vortex Orbit Qualifier (for 5+ contenders) */}
        {totalContenders >= 5 && (phase === 'initial_reveal' || phase === 'flipping_down' || phase === 'vortex_qualifier') ? (
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
            {/* Spinning Orbit Ring */}
            <motion.div
              animate={{ rotate: phase === 'vortex_qualifier' ? 360 : 0 }}
              transition={
                phase === 'vortex_qualifier'
                  ? { repeat: Infinity, duration: 2.4, ease: 'linear' }
                  : { duration: 0.5 }
              }
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
                            x: x * 3.4,
                            y: y * 3.4,
                            opacity: 0,
                            scale: 0.25,
                            rotate: (idx % 2 === 0 ? 1 : -1) * 75,
                          }
                        : {
                            x,
                            y,
                            opacity: 1,
                            scale: 0.75,
                            rotate: 0,
                          }
                    }
                    transition={
                      isEjected
                        ? { duration: 0.45, ease: 'easeIn' }
                        : { duration: 0.3 }
                    }
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
              // Compute full-cross position translations during 3-Card Monte crossover
              let xTransform = 0;
              let yTransform = 0;
              let rotTransform = 0;
              let zIndexVal = 10;

              if (phase === 'shuffling' && swapStep > 0 && swapStep <= 6) {
                if (totalContenders === 4) {
                  const targetSlot = SHUFFLE_STEPS_4[swapStep - 1]?.[idx] ?? idx;
                  const origCol = idx % 2;
                  const origRow = Math.floor(idx / 2);
                  const targetCol = targetSlot % 2;
                  const targetRow = Math.floor(targetSlot / 2);

                  const deltaCol = targetCol - origCol;
                  const deltaRow = targetRow - origRow;

                  xTransform = deltaCol * 115;
                  yTransform = deltaRow * 125;
                  rotTransform = (idx % 2 === 0 ? 6 : -6) * (deltaCol !== 0 || deltaRow !== 0 ? 1 : 0);
                  zIndexVal = (idx + swapStep) % 2 === 0 ? 25 : 12;
                } else {
                  // 3-card table: slots 0, 1, 2
                  const targetSlot = SHUFFLE_STEPS_3[swapStep - 1]?.[idx] ?? idx;
                  const delta = targetSlot - idx;

                  if (delta === 1) {
                    xTransform = 115;
                    yTransform = idx % 2 === 0 ? -26 : 26;
                    rotTransform = idx % 2 === 0 ? -7 : 7;
                    zIndexVal = idx % 2 === 0 ? 25 : 12;
                  } else if (delta === -1) {
                    xTransform = -115;
                    yTransform = idx % 2 === 0 ? -26 : 26;
                    rotTransform = idx % 2 === 0 ? -7 : 7;
                    zIndexVal = idx % 2 === 0 ? 25 : 12;
                  } else if (delta === 2) {
                    // Full cross from Left (0) all the way to Right (2)!
                    xTransform = 230;
                    yTransform = -34;
                    rotTransform = -10;
                    zIndexVal = 30;
                  } else if (delta === -2) {
                    // Full cross from Right (2) all the way to Left (0)!
                    xTransform = -230;
                    yTransform = 34;
                    rotTransform = 10;
                    zIndexVal = 10;
                  } else {
                    xTransform = 0;
                    yTransform = 0;
                    rotTransform = 0;
                    zIndexVal = 15;
                  }
                }
              }

              const isTapped = tappedSlotIndex === idx;
              const isClickable = phase === 'pick_ready' && isCaptain;
              const isMuted = revealedWinner && !card.isWinner;

              return (
                <motion.div
                  key={`${card.id}-${idx}`}
                  animate={{
                    x: xTransform ? `${xTransform}%` : 0,
                    y: yTransform,
                    rotate: rotTransform,
                    scale: isTapped ? 1.05 : (isMuted ? 0.82 : 1),
                    zIndex: isTapped ? 50 : zIndexVal,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 24,
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

      {/* Bottom Status / Instructional Guidance Prompt (NOT a button) */}
      <div className="w-full max-w-md mx-auto pt-2 pb-1 text-center flex items-center justify-center">
        {phase === 'pick_ready' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/85 backdrop-blur-xs border border-dashed border-[#241B18]/30 shadow-xs font-alexandria font-bold text-xs sm:text-sm text-[#241B18]"
          >
            {isCaptain ? (
              <motion.span
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="text-base select-none inline-block"
              >
                👆
              </motion.span>
            ) : (
              <span className="text-base select-none">👀</span>
            )}
            <span>
              {isCaptain
                ? t('shuffleCards.captainTurnPrompt')
                : t('shuffleCards.spectatorWaitingPrompt', { captain: captain.nickname })}
            </span>
          </motion.div>
        )}

        {phase === 'shuffle_again_bounce' && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFF5F2] border border-[#F0443E]/30 text-[#F0443E] font-alexandria font-black text-xs sm:text-sm shadow-xs"
          >
            <span className="text-base">🔄</span>
            <span>{t('shuffleCards.shuffleAgainTitle')}</span>
          </motion.div>
        )}

        {phase === 'winner_celebration' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F0FDF4] border border-[#55B96A]/40 text-[#166534] font-alexandria font-black text-xs sm:text-sm shadow-xs"
          >
            <span className="text-base">🎉</span>
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
