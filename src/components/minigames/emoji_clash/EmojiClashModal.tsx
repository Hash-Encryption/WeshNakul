import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '../../../context/LocaleContext';
import type { RestaurantItem } from '../../../types/restaurant';
import type { Participant } from '../../../types/database';
import {
  EMOJI_FIGHTERS,
  type EmojiClashPhase,
  type EmojiFighterId,
  type EmojiFighterOption,
  type EmojiSquad,
  type SpiceItemType,
  type SquadFusionStage,
} from '../../../types/emojiClash';
import { FighterSelectGrid } from './FighterSelectGrid';
import { MustardSack } from './MustardSack';
import { TactileCyclingDock } from './TactileCyclingDock';
import { EmojiArenaStage } from './EmojiArenaStage';
import { broadcastEmojiClash, subscribeToEmojiClash } from '../../../lib/supabase';

interface EmojiClashModalProps {
  isOpen: boolean;
  roomId: string;
  currentParticipantId: string;
  participants: Participant[];
  isHost: boolean;
  restaurants: RestaurantItem[];
  winnerRestaurantId: string;
  battleSeed: number;
  onWinnerConfirmed: (winner: RestaurantItem) => Promise<void> | void;
  onClose: () => void;
}

interface ProjectileVFX {
  id: number;
  item: SpiceItemType;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

const COLOR_PALETTES = [
  { ring: '#F59E0B', border: '#D97706' }, // Warm Golden Orange
  { ring: '#EF4444', border: '#DC2626' }, // Crimson Red
  { ring: '#8B5CF6', border: '#7C3AED' }, // Neon Purple
  { ring: '#00F0FF', border: '#0284C7' }, // Neon Cyan
  { ring: '#10B981', border: '#059669' }, // Emerald
  { ring: '#EC4899', border: '#DB2777' }, // Magenta
  { ring: '#F97316', border: '#EA580C' }, // Deep Orange
  { ring: '#6366F1', border: '#4F46E5' }, // Indigo
];

export const EmojiClashModal: React.FC<EmojiClashModalProps> = ({
  isOpen,
  roomId,
  currentParticipantId,
  participants,
  isHost,
  restaurants,
  winnerRestaurantId,
  battleSeed,
  onWinnerConfirmed,
  onClose,
}) => {
  const { locale } = useLocale();

  // Phase management: fighter_select (6s) -> squad_fusion (5s) -> brawl (15s) -> podium (4s) -> completed
  const [phase, setPhase] = useState<EmojiClashPhase>('fighter_select');
  const [fusionStage, setFusionStage] = useState<SquadFusionStage>('fusion_intro');
  const [timerSeconds, setTimerSeconds] = useState(6);

  // Participant emoji picks
  const [picksByParticipant, setPicksByParticipant] = useState<Record<string, EmojiFighterId>>({});
  const [myFighterId, setMyFighterId] = useState<EmojiFighterId | null>(null);

  // Active participants & dynamic group tap target
  const activeParticipants = participants.filter((p) => p.status === 'active' || !p.status);
  const activePlayerCount = Math.max(1, activeParticipants.length);
  const targetTaps = useMemo(
    () => Math.min(45, Math.max(12, activePlayerCount * 7)),
    [activePlayerCount]
  );
  const [currentTaps, setCurrentTaps] = useState(0);

  // Binary Finale states
  const [mustardDetonated, setMustardDetonated] = useState(false);
  const [isSackDropping, setIsSackDropping] = useState(false);
  const [goldenKnockoutTriggered, setGoldenKnockoutTriggered] = useState(false);

  // Active projectiles in flight
  const [projectiles, setProjectiles] = useState<ProjectileVFX[]>([]);

  // Prevent multiple confirmations or duplicate detonations
  const isFinalizingRef = useRef(false);
  const isDetonatedRef = useRef(false);
  const currentTapsRef = useRef(0);
  const targetTapsRef = useRef(targetTaps);
  targetTapsRef.current = targetTaps;
  const phaseRef = useRef<EmojiClashPhase>('fighter_select');
  phaseRef.current = phase;
  const phaseEndTimeRef = useRef<number>(Date.now() + 6000);
  const lastTapBroadcastRef = useRef<number>(0);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Immediate 100% Detonation Trigger
  const triggerDetonationFinale = useCallback(() => {
    if (isDetonatedRef.current) return;
    isDetonatedRef.current = true;
    setIsSackDropping(true);
    setMustardDetonated(true);

    // Transition straight to Champion Podium after splatter impact without waiting for Act 2 clock
    setTimeout(() => {
      setProjectiles([]);
      setPhase('podium');
    }, 900);
  }, []);

  // Golden Super-Aura Knockout (if clock expires before 100% taps)
  const triggerGoldenKnockout = useCallback(() => {
    if (isDetonatedRef.current || goldenKnockoutTriggered) return;
    setGoldenKnockoutTriggered(true);

    setTimeout(() => {
      setProjectiles([]);
      setPhase('podium');
    }, 800);
  }, [goldenKnockoutTriggered]);

  // Confirm Winner (Server Authoritative finalization - exactly once)
  const handleConfirmWinnerClick = useCallback(async () => {
    if (isFinalizingRef.current) return;
    isFinalizingRef.current = true;
    setPhase('completed');

    const winningItem =
      restaurants.find((r) => r.id === winnerRestaurantId) || restaurants[0];

    if (isHost) {
      try {
        await broadcastEmojiClash(roomId, {
          type: 'emoji_clash_finalized',
          winnerRestaurantId: winningItem.id,
        });
      } catch (e) {
        console.warn('Failed to broadcast emoji_clash_finalized', e);
      }
    }

    void onWinnerConfirmed(winningItem);
  }, [isHost, onWinnerConfirmed, restaurants, roomId, winnerRestaurantId]);

  // Subscribe to realtime messages across players
  useEffect(() => {
    if (!isOpen || !roomId) return;

    const unsubscribe = subscribeToEmojiClash(roomId, (msg) => {
      if (msg.type === 'emoji_fighter_pick') {
        setPicksByParticipant((prev) => ({
          ...prev,
          [msg.participantId]: msg.fighterId,
        }));
      } else if (msg.type === 'mustard_tap') {
        const newTaps = currentTapsRef.current + 1;
        currentTapsRef.current = newTaps;
        setCurrentTaps(newTaps);
        if (newTaps >= targetTapsRef.current && phaseRef.current === 'brawl') {
          triggerDetonationFinale();
        }
      } else if (msg.type === 'spice_throw') {
        setProjectiles((prev) => [
          ...prev.slice(-4),
          {
            id: Date.now() + Math.random(),
            item: msg.item,
            startX: (Math.random() - 0.5) * 80,
            startY: 120,
            targetX: (Math.random() - 0.5) * 60,
            targetY: 0,
          },
        ]);
      } else if (msg.type === 'emoji_clash_finalized') {
        if (!isFinalizingRef.current) {
          isFinalizingRef.current = true;
          setPhase('completed');
          const winningItem =
            restaurants.find((r) => r.id === msg.winnerRestaurantId) ||
            restaurants.find((r) => r.id === winnerRestaurantId) ||
            restaurants[0];
          void onWinnerConfirmed(winningItem);
        }
      }
    });

    return () => unsubscribe();
  }, [isOpen, roomId, restaurants, winnerRestaurantId, onWinnerConfirmed, triggerDetonationFinale]);

  // Advance to Phase 2: Squad Fusion (5s total: 0-2.5s fusion_intro, 2.5-5.0s fight_callout)
  const advanceToSquadFusion = useCallback(() => {
    if (phaseRef.current !== 'fighter_select') return;

    // Auto-pick fallback for any player who hasn't picked deterministically via battleSeed
    setPicksByParticipant((prev) => {
      const fallbackPicks = { ...prev };
      participants.forEach((p, index) => {
        if (!fallbackPicks[p.id]) {
          const fallbackFighter = EMOJI_FIGHTERS[(battleSeed + index) % EMOJI_FIGHTERS.length];
          fallbackPicks[p.id] = fallbackFighter.id;
        }
      });
      return fallbackPicks;
    });

    setPhase('squad_fusion');
    setFusionStage('fusion_intro');
  }, [participants, battleSeed]);

  // Phase 1 Early Lock-In Check (Auto-advances if all active players pick before 6s)
  useEffect(() => {
    if (phase !== 'fighter_select') return;

    const allActivePicked =
      activeParticipants.length > 0 &&
      activeParticipants.every((p) =>
        Boolean(picksByParticipant[p.id] || (p.id === currentParticipantId && myFighterId))
      );

    if (allActivePicked) {
      advanceToSquadFusion();
    }
  }, [phase, activeParticipants, picksByParticipant, myFighterId, currentParticipantId, advanceToSquadFusion]);

  // Wall-Clock Monotonic Timeline & Phase Orchestration
  useEffect(() => {
    if (!isOpen || phase === 'completed') return;

    // Phase 1: 6s | Phase 2: 5s | Phase 3: 15s (Act 1: 9s, Act 2: 6s) | Phase 4: 4s
    let durationMs = 6000;
    if (phase === 'fighter_select') {
      durationMs = 6000;
    } else if (phase === 'squad_fusion') {
      durationMs = 5000;
      setFusionStage('fusion_intro');
    } else if (phase === 'brawl') {
      durationMs = 15000;
    } else if (phase === 'podium') {
      durationMs = 4000;
    }

    phaseEndTimeRef.current = Date.now() + durationMs;
    setTimerSeconds(Math.ceil(durationMs / 1000));

    let calloutTimeout: ReturnType<typeof setTimeout> | null = null;
    if (phase === 'squad_fusion') {
      calloutTimeout = setTimeout(() => {
        setFusionStage('fight_callout');
      }, 2500);
    }

    // 200ms lightweight poller comparing Date.now() against phaseEndTimeRef
    // Zero reactive state dependencies inside poller, ensuring taps never delay or freeze the clock
    const poller = setInterval(() => {
      const remainingMs = phaseEndTimeRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      setTimerSeconds(remainingSec);

      if (remainingMs <= 0) {
        clearInterval(poller);

        if (phase === 'fighter_select') {
          advanceToSquadFusion();
        } else if (phase === 'squad_fusion') {
          setPhase('brawl');
        } else if (phase === 'brawl') {
          if (!isDetonatedRef.current) {
            triggerGoldenKnockout();
          }
        } else if (phase === 'podium') {
          void handleConfirmWinnerClick();
        }
      }
    }, 200);

    return () => {
      clearInterval(poller);
      if (calloutTimeout) clearTimeout(calloutTimeout);
    };
  }, [isOpen, phase, advanceToSquadFusion, triggerGoldenKnockout, handleConfirmWinnerClick]);

  // Handle Fighter Selection
  const handleSelectFighter = (fighter: EmojiFighterOption) => {
    if (phase !== 'fighter_select') return;
    setMyFighterId(fighter.id);
    setPicksByParticipant((prev) => ({
      ...prev,
      [currentParticipantId]: fighter.id,
    }));

    const me = participants.find((p) => p.id === currentParticipantId);
    void broadcastEmojiClash(roomId, {
      type: 'emoji_fighter_pick',
      participantId: currentParticipantId,
      emoji: fighter.emoji,
      fighterId: fighter.id,
      nickname: me?.nickname || 'Player',
      playerColor: me?.player_color,
    });
  };

  // Handle Mustard Bomb Tap
  const handleMustardTap = () => {
    if (phaseRef.current !== 'brawl' || isDetonatedRef.current) return;
    const newTaps = currentTapsRef.current + 1;
    currentTapsRef.current = newTaps;
    setCurrentTaps(newTaps);

    const now = Date.now();
    if (now - lastTapBroadcastRef.current >= 200) {
      lastTapBroadcastRef.current = now;
      void broadcastEmojiClash(roomId, {
        type: 'mustard_tap',
        participantId: currentParticipantId,
        tapIndex: newTaps,
      });
    }

    if (newTaps >= targetTapsRef.current) {
      triggerDetonationFinale();
    }
  };

  // Handle Spice / Garlic / Fire Throw from 3D Ability Dock
  const handleSpiceThrow = (item: SpiceItemType) => {
    if (phase !== 'brawl') return;

    const throwSeed = Math.random();
    const newProj: ProjectileVFX = {
      id: Date.now() + Math.random(),
      item,
      startX: 0,
      startY: 120,
      targetX: (Math.random() - 0.5) * 60,
      targetY: 0,
    };
    setProjectiles((prev) => [...prev.slice(-4), newProj]);

    void broadcastEmojiClash(roomId, {
      type: 'spice_throw',
      participantId: currentParticipantId,
      item,
      throwAngle: 45,
      throwSeed,
    });
  };

  // Construct Active Emoji Squads with Multi-Emoji Scaling (2 to 8 squads)
  const squads = useMemo<EmojiSquad[]>(() => {
    const tiedRestaurants = restaurants.length >= 2 ? restaurants : restaurants.slice(0, 2);

    const grouped: Record<
      string,
      { fighterId: EmojiFighterId; members: { participantId: string; nickname: string; playerColor?: string }[] }
    > = {};
    participants.forEach((p, idx) => {
      const fId = picksByParticipant[p.id] || EMOJI_FIGHTERS[(battleSeed + idx) % EMOJI_FIGHTERS.length].id;
      if (!grouped[fId]) {
        grouped[fId] = { fighterId: fId, members: [] };
      }
      grouped[fId].members.push({
        participantId: p.id,
        nickname: p.nickname,
        playerColor: p.player_color,
      });
    });

    let distinctFighterEntries = Object.values(grouped);

    if (distinctFighterEntries.length < tiedRestaurants.length) {
      const clonesNeeded = tiedRestaurants.length - distinctFighterEntries.length;
      for (let i = 0; i < clonesNeeded; i++) {
        const fallbackOption = EMOJI_FIGHTERS[(battleSeed + distinctFighterEntries.length + i) % EMOJI_FIGHTERS.length];
        distinctFighterEntries.push({
          fighterId: fallbackOption.id,
          members: [
            {
              participantId: `clone-${i}`,
              nickname: `${fallbackOption.defaultTitleEn} AI`,
              playerColor: COLOR_PALETTES[(distinctFighterEntries.length + i) % COLOR_PALETTES.length].ring,
            },
          ],
        });
      }
    }

    distinctFighterEntries = distinctFighterEntries.slice(0, 8);
    const squadCount = distinctFighterEntries.length;

    let normalSize = 56;
    let megaSize = 70;
    if (squadCount === 2) {
      normalSize = 72;
      megaSize = 88;
    } else if (squadCount >= 5) {
      normalSize = 46;
      megaSize = 58;
    }

    return distinctFighterEntries.map((entry, index) => {
      const fighter = EMOJI_FIGHTERS.find((f) => f.id === entry.fighterId) || EMOJI_FIGHTERS[0];
      const isMega = entry.members.length >= 2;
      const palette = COLOR_PALETTES[index % COLOR_PALETTES.length];
      const associatedRestaurant = tiedRestaurants[index % tiedRestaurants.length];
      const isWinner = associatedRestaurant.id === winnerRestaurantId;

      return {
        squadId: `squad-${entry.fighterId}-${index}`,
        emoji: fighter.emoji,
        fighterId: entry.fighterId,
        members: entry.members,
        isMega,
        restaurant: associatedRestaurant,
        ringColor: palette.ring,
        ringBorderColor: palette.border,
        isWinner,
        baseSize: isMega ? megaSize : normalSize,
        initialPos: { x: 0, y: 0 },
      };
    });
  }, [participants, picksByParticipant, restaurants, winnerRestaurantId, battleSeed]);

  // Act 2 Boss Showdown begins at 6s remaining in Phase 3
  const isAct2 = phase === 'brawl' && timerSeconds <= 6;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 w-screen h-[100dvh] overflow-hidden touch-manipulation select-none z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-[410px] h-[100dvh] max-h-[840px] mx-auto bg-gradient-to-b from-[#101735] via-[#0D132D] to-[#070914] sm:rounded-3xl border-0 sm:border-3 sm:border-[#241B18] shadow-[0_10px_0_#241B18] flex flex-col justify-between overflow-hidden"
        >
          {/* TOP HEADER HUD: Clean & Organized */}
          <div className="relative w-full px-3 pt-3 flex items-center justify-between z-40">
            {/* Top-Left: Blue Settings Gear Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close / Exit"
              className="w-9 h-9 rounded-full bg-[#4A90E2] border-2 border-[#1E3A8A] text-white flex items-center justify-center text-base shadow-[0_3px_0_#1E3A8A] active:translate-y-0.5 cursor-pointer hover:brightness-105 shrink-0"
            >
              ⚙️
            </button>

            {/* Top-Center: Game Title & Golden Countdown Timer Side-by-Side (No stray '&') */}
            <div className="flex items-center gap-2 bg-black/55 px-3 py-1 rounded-2xl border border-white/20 backdrop-blur-xs shadow-md">
              <div className="flex flex-col items-center leading-none">
                <span className="text-xs sm:text-sm font-black text-white font-alexandria tracking-tight">
                  Emoji Clash
                </span>
                <span className="text-[10px] font-bold text-cyan-300 font-alexandria">
                  حرب الإيموجي
                </span>
              </div>
              {/* Bold Golden Countdown Timer Box */}
              <div className="min-w-[34px] px-1.5 py-0.5 rounded-lg bg-gradient-to-b from-amber-400 to-yellow-500 border border-amber-300 text-black font-black text-sm sm:text-base font-alexandria flex items-center justify-center shadow-[0_2px_0_#B45309]">
                {String(timerSeconds).padStart(2, '0')}
              </div>
            </div>

            {/* Top-Right: Cluster of Connected Circular Player Avatars */}
            <div className="flex items-center -space-x-1.5 rtl:space-x-reverse p-1 bg-black/40 rounded-full border border-white/20 backdrop-blur-xs shrink-0">
              {participants.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  title={p.nickname}
                  style={{ backgroundColor: p.player_color || '#FFD75A' }}
                  className="w-6 h-6 rounded-full border border-black text-[10px] font-black flex items-center justify-center text-black shadow-xs"
                >
                  {p.nickname.slice(0, 1).toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* MAIN ARENA CONTENT: PHASE DRIVEN */}
          <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
            {/* Phase 1: Arcade 2x4 Fighter Select Grid */}
            {phase === 'fighter_select' && (
              <FighterSelectGrid
                selectedFighterId={myFighterId}
                onSelectFighter={handleSelectFighter}
                picksByParticipant={picksByParticipant}
                participants={participants}
                currentParticipantId={currentParticipantId}
              />
            )}

            {/* Phases 2, 3, 4: Arena Stage + Top Hanging Mustard Sack */}
            {phase !== 'fighter_select' && (
              <>
                {/* Top Hanging Bulging Mustard Sack */}
                <MustardSack
                  currentTaps={currentTaps}
                  targetTaps={targetTaps}
                  isInteractive={phase === 'brawl'}
                  onTap={handleMustardTap}
                  isDetonated={mustardDetonated}
                  isSackDropping={isSackDropping}
                  timerSeconds={timerSeconds}
                  phase={phase}
                />

                {/* 2.5D Octagonal Battle Ring Stage */}
                <EmojiArenaStage
                  phase={phase}
                  fusionStage={fusionStage}
                  squads={squads}
                  winningRestaurantId={winnerRestaurantId}
                  battleSeed={battleSeed}
                  projectiles={projectiles}
                  mustardDetonated={mustardDetonated}
                  goldenKnockoutTriggered={goldenKnockoutTriggered}
                  restaurants={restaurants}
                  onWinnerConfirmed={handleConfirmWinnerClick}
                  isHost={isHost}
                  isAct2={isAct2}
                />
              </>
            )}
          </div>

          {/* BOTTOM HUD LAYER: 3D CYCLING SPICE COOLDOWN DOCK */}
          <div className="w-full px-3 pb-3 z-40">
            {phase === 'brawl' ? (
              <TactileCyclingDock onThrow={handleSpiceThrow} disabled={isAct2} />
            ) : phase === 'fighter_select' ? (
              <div className="w-full text-center py-2 text-xs font-bold text-white/60 font-alexandria">
                {locale === 'ar' ? 'النزال سيبدأ قريباً! 🔥' : 'Brawl starts in moments! 🔥'}
              </div>
            ) : phase === 'squad_fusion' ? (
              <div className="w-full text-center py-2 text-xs font-black text-amber-300 font-alexandria animate-pulse">
                {fusionStage === 'fusion_intro'
                  ? (locale === 'ar' ? '⚡ تجهيز المقاتلين في ساحة النزال!' : '⚡ Assembling squads in the ring!')
                  : (locale === 'ar' ? '🥊 استعدوا لبدء المعركة!' : '🥊 GET READY TO BRAWL!')}
              </div>
            ) : (
              <div className="w-full text-center py-1 text-xs font-bold text-white/70 font-alexandria">
                {locale === 'ar' ? 'انتهت الجولة 🏆' : 'Round Finished 🏆'}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
