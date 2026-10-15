import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { useLocale } from '../../../context/LocaleContext';
import type {
  EmojiClashPhase,
  EmojiSquad,
  SpiceItemType,
  SquadFusionStage,
} from '../../../types/emojiClash';
import type { RestaurantItem } from '../../../types/restaurant';

interface ProjectileVFX {
  id: number;
  item: SpiceItemType;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
}

interface ComicBurst {
  id: number;
  x: number;
  y: number;
  textEn: string;
  textAr: string;
  color: string;
}

interface EmojiArenaStageProps {
  phase: EmojiClashPhase;
  fusionStage?: SquadFusionStage;
  squads: EmojiSquad[];
  winningRestaurantId: string;
  battleSeed: number;
  projectiles: ProjectileVFX[];
  mustardDetonated: boolean;
  goldenKnockoutTriggered: boolean;
  restaurants: RestaurantItem[];
  onWinnerConfirmed?: () => void;
  isHost?: boolean;
}

export const EmojiArenaStage: React.FC<EmojiArenaStageProps> = ({
  phase,
  fusionStage,
  squads,
  winningRestaurantId,
  battleSeed,
  projectiles,
  mustardDetonated,
  goldenKnockoutTriggered,
  restaurants,
  onWinnerConfirmed,
  isHost = false,
}) => {
  const { locale } = useLocale();

  // Screen shake and impact freeze
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [shockwaveRings, setShockwaveRings] = useState<{ id: number; x: number; y: number }[]>([]);
  const [comicBursts, setComicBursts] = useState<ComicBurst[]>([]);

  // Per-squad dynamic battle positions & effects
  const [squadOffsets, setSquadOffsets] = useState<Record<string, { x: number; y: number; rotate: number; jumpY: number; scale: number; statusEffect?: string }>>({});

  // Losing squads knocked out
  const [knockedOutSquadIds, setKnockedOutSquadIds] = useState<Set<string>>(new Set());
  const [screenGlassLandedIds, setScreenGlassLandedIds] = useState<Set<string>>(new Set());

  // Confetti fired once in podium
  const confettiFiredRef = useRef(false);

  // Trigger shockwave & screen shake
  const triggerImpact = (x: number, y: number) => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 120);

    const ringId = Date.now();
    setShockwaveRings((prev) => [...prev.slice(-3), { id: ringId, x, y }]);
    setTimeout(() => {
      setShockwaveRings((prev) => prev.filter((r) => r.id !== ringId));
    }, 500);
  };

  // Trigger comic popups: POW!, طراااخ!, بوووم!, حار!
  const triggerComicBurst = (x: number, y: number, textEn = 'POW!', textAr = 'طراااخ!', color = '#FF3B30') => {
    const burstId = Date.now() + Math.random();
    setComicBursts((prev) => [
      ...prev.slice(-4),
      { id: burstId, x, y, textEn, textAr, color },
    ]);
    setTimeout(() => {
      setComicBursts((prev) => prev.filter((b) => b.id !== burstId));
    }, 700);
  };

  // Phase 3 Choreographed Arena Brawl animation loop driven deterministically by battleSeed
  useEffect(() => {
    if (phase !== 'brawl' && phase !== 'podium') return;

    if (phase === 'podium') {
      setShockwaveRings([]);
      setComicBursts([]);
      if (!confettiFiredRef.current) {
        confettiFiredRef.current = true;
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#00F0FF', '#FF00E5', '#EF4444', '#10B981'],
          });
        } catch {
          // ignore in testing
        }
      }
      return;
    }

    // Deterministic brawl rhythm
    let step = 0;
    const interval = setInterval(() => {
      step++;

      // Don't animate brawl movements after knockout triggered
      if (mustardDetonated || goldenKnockoutTriggered) return;

      const newOffsets: Record<string, { x: number; y: number; rotate: number; jumpY: number; scale: number; statusEffect?: string }> = {};

      squads.forEach((sq, idx) => {
        // Deterministic pseudo-random variation based on battleSeed + squad index + step
        const seedVal = Math.sin(battleSeed * 13 + idx * 7 + step * 3);
        const seedVal2 = Math.cos(battleSeed * 17 + idx * 5 + step * 2);

        // Center clash moment every 1.8s
        const isClashing = step % 4 === 0;
        let x = 0;
        let y = 0;
        let jumpY = 0;
        let rotate = 0;

        if (squads.length === 2) {
          // Left vs Right clash
          const isLeft = idx === 0;
          if (isClashing) {
            x = isLeft ? 26 : -26;
            jumpY = -18;
            rotate = isLeft ? 14 : -14;
            if (idx === 0) {
              triggerImpact(0, 0);
              const bursts = [
                { en: 'POW!', ar: 'طراااخ!' },
                { en: 'BAM!', ar: 'بوووم!' },
                { en: 'CRASH!', ar: 'طاااخ!' },
              ];
              const b = bursts[step % bursts.length];
              triggerComicBurst(0, -15, b.en, b.ar);
            }
          } else {
            x = isLeft ? -10 + seedVal * 12 : 10 + seedVal * 12;
            jumpY = Math.abs(seedVal2) * -12;
            rotate = seedVal * 10;
          }
        } else {
          // 3 to 8 squads orbiting and clashing into center
          if (isClashing && (idx === step % squads.length || idx === (step + 1) % squads.length)) {
            x = seedVal * 20;
            y = seedVal2 * 12;
            jumpY = -15;
            rotate = seedVal * 16;
            triggerImpact(x, y);
            triggerComicBurst(x, y - 10, 'POW!', 'طراااخ!');
          } else {
            x = seedVal * 10;
            y = seedVal2 * 8;
            jumpY = Math.abs(seedVal) * -8;
            rotate = seedVal * 8;
          }
        }

        newOffsets[sq.squadId] = {
          x,
          y,
          rotate,
          jumpY,
          scale: 1,
        };
      });

      setSquadOffsets(newOffsets);
    }, 450);

    return () => clearInterval(interval);
  }, [phase, squads, battleSeed, mustardDetonated, goldenKnockoutTriggered]);

  // Handle Projectiles arriving in the ring (VFX response)
  useEffect(() => {
    if (projectiles.length === 0) return;
    const latest = projectiles[projectiles.length - 1];

    const timer = setTimeout(() => {
      // Pick target squad
      const targetSquad = squads[Math.floor(Math.random() * squads.length)];
      if (!targetSquad) return;

      if (latest.item === 'spice') {
        // Red chili particle burst, crimson red 0.6s, steam puffs, sneeze-bounce
        triggerComicBurst(0, -10, 'SPICY!', 'حار!', '#EF4444');
        setSquadOffsets((prev) => ({
          ...prev,
          [targetSquad.squadId]: {
            ...(prev[targetSquad.squadId] || { x: 0, y: 0, rotate: 0, jumpY: 0, scale: 1 }),
            statusEffect: 'spicy',
            jumpY: -22,
          },
        }));
        setTimeout(() => {
          setSquadOffsets((prev) => ({
            ...prev,
            [targetSquad.squadId]: {
              ...(prev[targetSquad.squadId] || { x: 0, y: 0, rotate: 0, jumpY: 0, scale: 1 }),
              statusEffect: undefined,
            },
          }));
        }, 600);
      } else if (latest.item === 'garlic') {
        // Expanding green aroma shockwave, dizzy stars, wobble sideways
        triggerComicBurst(0, -10, 'GARLIC!', 'ثوم!', '#10B981');
        setSquadOffsets((prev) => ({
          ...prev,
          [targetSquad.squadId]: {
            ...(prev[targetSquad.squadId] || { x: 0, y: 0, rotate: 0, jumpY: 0, scale: 1 }),
            statusEffect: 'dizzy',
            rotate: 25,
          },
        }));
        setTimeout(() => {
          setSquadOffsets((prev) => ({
            ...prev,
            [targetSquad.squadId]: {
              ...(prev[targetSquad.squadId] || { x: 0, y: 0, rotate: 0, jumpY: 0, scale: 1 }),
              statusEffect: undefined,
            },
          }));
        }, 800);
      } else if (latest.item === 'fire') {
        // Fiery floor explosion + camera shake, leap high with scorched tint
        triggerImpact(0, 0);
        triggerComicBurst(0, -20, 'BOOM!', 'نار!', '#F97316');
        setSquadOffsets((prev) => ({
          ...prev,
          [targetSquad.squadId]: {
            ...(prev[targetSquad.squadId] || { x: 0, y: 0, rotate: 0, jumpY: 0, scale: 1 }),
            statusEffect: 'fire',
            jumpY: -35,
          },
        }));
        setTimeout(() => {
          setSquadOffsets((prev) => ({
            ...prev,
            [targetSquad.squadId]: {
              ...(prev[targetSquad.squadId] || { x: 0, y: 0, rotate: 0, jumpY: 0, scale: 1 }),
              statusEffect: undefined,
            },
          }));
        }, 700);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [projectiles, squads]);

  // Handle Binary Knockout Finale (Mustard Bomb Detonation vs Golden Super Uppercut)
  useEffect(() => {
    if (mustardDetonated) {
      // 1. MUSTARD DETONATION FINALE:
      triggerImpact(0, 0);
      triggerComicBurst(0, -30, 'DETONATION!', 'انفجار الخردل!', '#EAB308');

      // Blast all losing squads off-screen
      const losingIds = squads.filter((s) => s.restaurant.id !== winningRestaurantId).map((s) => s.squadId);
      setKnockedOutSquadIds(new Set(losingIds));
    } else if (goldenKnockoutTriggered) {
      // 2. GOLDEN SUPER-AURA KNOCKOUT FINALE:
      triggerImpact(0, 0);
      triggerComicBurst(0, -35, 'KNOCKOUT!', 'ضربة قاضية!', '#FFD700');

      const losingSquads = squads.filter((s) => s.restaurant.id !== winningRestaurantId);
      const losingIds = losingSquads.map((s) => s.squadId);
      setKnockedOutSquadIds(new Set(losingIds));

      // Smash-Bros Style Screen-Glass KO: first loser slams into screen glass
      if (losingSquads[0]) {
        setScreenGlassLandedIds(new Set([losingSquads[0].squadId]));
      }
    }
  }, [mustardDetonated, goldenKnockoutTriggered, squads, winningRestaurantId]);

  const winningSquad = squads.find((s) => s.restaurant.id === winningRestaurantId) || squads[0];

  return (
    <div
      className={`relative w-full h-[360px] sm:h-[400px] flex items-center justify-center overflow-hidden select-none transition-transform duration-75 ${
        isScreenShaking ? 'scale-[1.03] translate-x-1.5 -translate-y-1' : ''
      }`}
    >
      {/* BACKGROUND LAYER: Dark Radial Stadium Backdrop with Sweeping Spotlights & Floating Embers */}
      <div className="absolute inset-0 bg-radial from-[#151D42] via-[#0D132D] to-[#070914] pointer-events-none" />

      {/* Structural stadium roof trusses at ceiling */}
      <div className="absolute top-0 inset-x-0 h-10 border-b border-cyan-500/15 flex items-center justify-around opacity-30 pointer-events-none">
        <div className="w-1/4 h-full border-r border-cyan-500/20 transform skew-x-12" />
        <div className="w-1/4 h-full border-r border-cyan-500/20 transform -skew-x-12" />
        <div className="w-1/4 h-full border-r border-cyan-500/20 transform skew-x-12" />
      </div>

      {/* Sweeping Conical Spotlights from Corners matching reference image */}
      <div className="absolute top-0 left-0 w-36 sm:w-48 h-full bg-gradient-to-br from-cyan-400/25 via-blue-500/10 to-transparent transform -skew-x-25 pointer-events-none blur-xs" />
      <div className="absolute top-0 right-0 w-36 sm:w-48 h-full bg-gradient-to-bl from-blue-400/25 via-indigo-500/10 to-transparent transform skew-x-25 pointer-events-none blur-xs" />

      {/* Floating Golden Ember Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: (i * 26) % 320,
              y: 340,
              opacity: 0.2 + (i % 5) * 0.15,
            }}
            animate={{
              y: [340, 20],
              x: [((i * 26) % 320), ((i * 26) % 320) + (i % 2 === 0 ? 15 : -15)],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 3.5 + (i % 4),
              repeat: Infinity,
              ease: 'linear',
              delay: (i * 0.3) % 3,
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#F59E0B]"
          />
        ))}
      </div>

      {/* Flying Bezier Projectiles in Flight */}
      {projectiles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: p.startX, y: p.startY, scale: 0.8, opacity: 1 }}
          animate={{
            x: p.targetX,
            y: [p.startY, p.targetY - 70, p.targetY],
            scale: [0.8, 1.3, 0.5],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute z-40 text-2xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] pointer-events-none"
        >
          {p.item === 'spice' ? '🌶️' : p.item === 'garlic' ? '🧄' : '🔥'}
        </motion.div>
      ))}

      {/* Viscous Yellow Mustard Splatter Overlay on Screen Glass (Detonation Finale) */}
      <AnimatePresence>
        {mustardDetonated && (
          <motion.div
            initial={{ opacity: 0, scale: 1.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden"
          >
            {/* Massive splat backdrop */}
            <svg viewBox="0 0 400 400" className="w-full h-full opacity-90 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]">
              <path
                d="M170 80 C230 40 280 90 290 140 C340 160 360 230 310 270 C330 330 250 350 200 320 C140 360 70 330 90 260 C40 230 40 160 100 130 C90 70 140 70 170 80 Z"
                fill="#FACC15"
                stroke="#CA8A04"
                strokeWidth="4"
              />
              {/* Dripping yellow slime down glass */}
              <path d="M120 280 Q130 360 125 390 Q120 400 115 390 Z" fill="#EAB308" />
              <path d="M210 320 Q220 380 215 410 Q210 415 205 405 Z" fill="#EAB308" />
              <path d="M280 280 Q290 350 285 375 Q280 385 275 375 Z" fill="#EAB308" />
              {/* Yellow droplets scattered */}
              <circle cx="70" cy="90" r="14" fill="#FACC15" />
              <circle cx="330" cy="110" r="18" fill="#FACC15" />
              <circle cx="340" cy="330" r="16" fill="#FACC15" />
              <circle cx="50" cy="310" r="12" fill="#FACC15" />
            </svg>
            <div className="absolute text-center bg-black/60 px-4 py-2 rounded-2xl border-2 border-amber-400 backdrop-blur-xs">
              <span className="text-sm font-black text-amber-300 font-alexandria uppercase drop-shadow-[0_1px_2px_#000]">
                {locale === 'ar' ? '💥 انفجار قنبلة الخردل!' : '💥 Mustard Bomb Detonation!'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE 2 STAGED FUSION & BANNER DROP OVERLAYS */}
      <AnimatePresence>
        {phase === 'squad_fusion' && fusionStage === 'fusion_intro' && (
          <motion.div
            key="fusion_intro"
            initial={{ scale: 0.7, opacity: 0, y: -10 }}
            animate={{ scale: [0.7, 1.12, 1], opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute z-50 pointer-events-none flex flex-col items-center justify-center bg-black/75 px-5 py-2.5 rounded-2xl border-2 border-amber-400 backdrop-blur-xs shadow-[0_6px_20px_rgba(245,158,11,0.6)]"
          >
            <span className="text-lg sm:text-xl font-black text-amber-300 font-alexandria uppercase tracking-wider drop-shadow-[0_2px_4px_#000]">
              {locale === 'ar' ? '⚡ تجهيز المقاتلين!' : '⚡ FIGHTERS READY! ⚡'}
            </span>
            <span className="text-[11px] font-bold text-white/90 font-alexandria mt-0.5">
              {locale === 'ar' ? 'تشكيل الفرق على الحلبة' : 'Squads assembling on the ring'}
            </span>
          </motion.div>
        )}

        {phase === 'squad_fusion' && fusionStage === 'banner_drop' && (
          <motion.div
            key="banner_drop"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 15, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="absolute top-6 z-50 pointer-events-none flex flex-col items-center bg-[#241B18]/90 px-4 py-1.5 rounded-full border-2 border-[#FFD700] shadow-[0_6px_16px_rgba(0,0,0,0.8)]"
          >
            <span className="text-xs sm:text-sm font-black text-[#FFD700] font-alexandria tracking-wide flex items-center gap-1.5">
              <span>🏷️</span>
              <span>
                {locale === 'ar'
                  ? 'هبوط لافتات المطاعم المتنافسة!'
                  : 'Tied Restaurant Banners Dropping!'}
              </span>
            </span>
          </motion.div>
        )}

        {phase === 'squad_fusion' && fusionStage === 'fight_callout' && (
          <motion.div
            key="fight_callout"
            initial={{ scale: 0.2, opacity: 0, rotate: -8 }}
            animate={{ scale: [0.2, 1.35, 1], opacity: 1, rotate: -2 }}
            exit={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'backOut' }}
            className="absolute z-50 pointer-events-none flex flex-col items-center justify-center bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 px-8 py-3.5 rounded-3xl border-4 border-white shadow-[0_12px_32px_rgba(239,68,68,0.85)]"
          >
            <span className="text-3xl sm:text-4xl font-black text-white font-alexandria uppercase tracking-widest drop-shadow-[0_4px_6px_#000]">
              FIGHT! 🥊
            </span>
            <span className="text-sm font-black text-yellow-200 font-alexandria drop-shadow-[0_1px_2px_#000]">
              {locale === 'ar' ? 'ابدأ المعركة!' : 'LET THE BRAWL BEGIN!'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2.5D OCTAGONAL BATTLE RING (Center-Lower Third) */}
      <div className="relative w-[310px] sm:w-[350px] h-[190px] mt-12 flex items-center justify-center">
        {/* Ring Corner Post Banners (Dropped from stadium ceiling in Phase 2) */}
        {phase !== 'fighter_select' && (
          <>
            {/* Left Post Banner (e.g., Contender 1) */}
            <motion.div
              initial={{ y: -120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.1 }}
              className="absolute -top-7 left-1 z-20 flex flex-col items-center origin-top-left -rotate-6"
            >
              {/* Wooden post */}
              <div className="w-2 h-14 bg-gradient-to-r from-[#8B5A2B] to-[#5C3A1E] border border-black/40" />
              {/* Angled Banner matching reference image */}
              <div className="absolute top-1 -left-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white px-2.5 py-1 rounded-md border-2 border-[#241B18] shadow-[0_4px_0_#241B18] flex items-center gap-1 min-w-[90px] justify-center">
                <span className="text-[10px] font-black font-alexandria truncate max-w-[80px]">
                  {locale === 'ar'
                    ? restaurants[0]?.nameAr || restaurants[0]?.nameEn
                    : restaurants[0]?.nameEn || restaurants[0]?.nameAr}
                </span>
              </div>
            </motion.div>

            {/* Right Post Banner (e.g., Contender 2) */}
            <motion.div
              initial={{ y: -120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22, delay: 0.2 }}
              className="absolute -top-7 right-1 z-20 flex flex-col items-center origin-top-right rotate-6"
            >
              {/* Wooden post */}
              <div className="w-2 h-14 bg-gradient-to-r from-[#8B5A2B] to-[#5C3A1E] border border-black/40" />
              {/* Angled Banner matching reference image */}
              <div className="absolute top-1 -right-2 bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white px-2.5 py-1 rounded-md border-2 border-[#241B18] shadow-[0_4px_0_#241B18] flex items-center gap-1 min-w-[90px] justify-center">
                <span className="text-[10px] font-black font-alexandria truncate max-w-[80px]">
                  {locale === 'ar'
                    ? restaurants[1]?.nameAr || restaurants[1]?.nameEn
                    : restaurants[1]?.nameEn || restaurants[1]?.nameAr}
                </span>
              </div>
            </motion.div>
          </>
        )}

        {/* 3D Perspective Octagon Ring SVG matching reference image */}
        <div className="absolute inset-0 flex items-center justify-center filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]">
          <svg viewBox="0 0 320 180" className="w-full h-full overflow-visible">
            <defs>
              {/* Floor dark navy gradient */}
              <linearGradient id="ringFloor" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="40%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#0B0F19" />
              </linearGradient>

              {/* Lower ring skirt gradient */}
              <linearGradient id="ringSkirt" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#090D16" />
                <stop offset="100%" stopColor="#030508" />
              </linearGradient>
            </defs>

            {/* 3D Base Skirt (depth height) */}
            <polygon
              points="40,90 95,45 225,45 280,90 280,118 225,163 95,163 40,118"
              fill="url(#ringSkirt)"
              stroke="#030712"
              strokeWidth="2"
            />

            {/* Outer Glowing Neon Magenta/Purple Trim */}
            <polygon
              points="40,105 95,50 225,50 280,105 225,150 95,150"
              fill="none"
              stroke="#BD00FF"
              strokeWidth="5"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_0_12px_#BD00FF]"
            />

            {/* Octagonal Floor Plane */}
            <polygon
              points="48,100 100,56 220,56 272,100 220,144 100,144"
              fill="url(#ringFloor)"
              stroke="#1E293B"
              strokeWidth="1.5"
            />

            {/* Inner Glowing Neon Cyan Trim matching reference image */}
            <polygon
              points="54,100 103,60 217,60 266,100 217,140 103,140"
              fill="none"
              stroke="#00F0FF"
              strokeWidth="3.5"
              strokeLinejoin="round"
              className="filter drop-shadow-[0_0_10px_#00F0FF]"
            />
          </svg>
        </div>

        {/* Dynamic Floor Shockwave Ring on heavy collisions */}
        {shockwaveRings.map((r) => (
          <motion.div
            key={r.id}
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ left: `calc(50% + ${r.x}px)`, top: `calc(55% + ${r.y}px)` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-28 h-14 rounded-full border-2 border-cyan-300 pointer-events-none filter drop-shadow-[0_0_8px_#00F0FF]"
          />
        ))}

        {/* Comic Hit Popups (POW!, طراااخ!, BAM!, etc.) */}
        <AnimatePresence>
          {comicBursts.map((b) => (
            <motion.div
              key={b.id}
              initial={{ scale: 0.2, opacity: 0, rotate: -15, y: b.y }}
              animate={{ scale: [0.2, 1.3, 1], opacity: 1, rotate: 10, y: b.y - 25 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
              style={{ left: `calc(50% + ${b.x}px)`, top: `calc(50% + ${b.y}px)` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none"
            >
              {/* Comic sticker burst burst polygon */}
              <div
                style={{ backgroundColor: b.color }}
                className="px-3 py-1.5 rounded-xl border-3 border-black text-white font-black text-xs sm:text-sm font-alexandria shadow-[0_4px_0_#000] rotate-[-8deg] flex flex-col items-center leading-none"
              >
                <span className="text-yellow-200 tracking-wider uppercase drop-shadow-[0_1px_2px_#000]">
                  {b.textEn}
                </span>
                <span className="text-white text-[11px] drop-shadow-[0_1px_1px_#000]">
                  {b.textAr}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* FIGHTER EMOJI SQUADS ON THE OCTAGON RING */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {squads.map((sq, idx) => {
            const isWinner = sq.restaurant.id === winningRestaurantId;
            const isKnockedOut = knockedOutSquadIds.has(sq.squadId);
            const isScreenGlass = screenGlassLandedIds.has(sq.squadId);
            const offset = squadOffsets[sq.squadId] || { x: 0, y: 0, rotate: 0, jumpY: 0, scale: 1 };

            // Base position based on squad count
            let initialX = 0;
            let initialY = 0;
            if (squads.length === 2) {
              initialX = idx === 0 ? -55 : 55;
              initialY = 0;
            } else if (squads.length <= 4) {
              const angles = [-135, -45, 45, 135];
              const a = (angles[idx] * Math.PI) / 180;
              initialX = Math.cos(a) * 65;
              initialY = Math.sin(a) * 32;
            } else {
              const a = ((idx * (360 / squads.length) - 90) * Math.PI) / 180;
              initialX = Math.cos(a) * 75;
              initialY = Math.sin(a) * 38;
            }

            // In podium phase, winning squad celebrates in the center!
            const isPodiumPhase = phase === 'podium';
            const targetX = isPodiumPhase ? (isWinner ? 0 : initialX * 2.5) : initialX + offset.x;
            const targetY = isPodiumPhase ? (isWinner ? -5 : initialY * 2.5) : initialY + offset.y + offset.jumpY;

            return (
              <motion.div
                key={sq.squadId}
                animate={
                  isScreenGlass
                    ? {
                        x: 0,
                        y: -30,
                        scale: 3.2,
                        rotate: 15,
                        opacity: [1, 1, 0.4],
                        transition: { duration: 0.5, ease: 'easeOut' },
                      }
                    : isKnockedOut
                    ? {
                        x: initialX * 4,
                        y: -180,
                        scale: 0.1,
                        rotate: 720,
                        opacity: 0,
                        transition: { duration: 0.6, ease: 'easeIn' },
                      }
                    : {
                        x: targetX,
                        y: targetY,
                        rotate: offset.rotate,
                        scale: isWinner && isPodiumPhase ? 1.4 : offset.scale,
                      }
                }
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="absolute flex flex-col items-center justify-center z-30"
              >
                {/* Floating mini restaurant name pill tethered above fighter head */}
                <div
                  style={{
                    backgroundColor: sq.ringColor,
                    borderColor: '#241B18',
                  }}
                  className="px-2 py-0.5 rounded-full border border-black/60 text-white font-black text-[9px] font-alexandria truncate max-w-[76px] shadow-sm mb-1"
                >
                  {locale === 'ar'
                    ? sq.restaurant.nameAr || sq.restaurant.nameEn
                    : sq.restaurant.nameEn || sq.restaurant.nameAr}
                </div>

                {/* Golden Super-Aura (Winner KO Finale at 7.2s) */}
                {goldenKnockoutTriggered && isWinner && (
                  <motion.div
                    animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="absolute inset-0 -m-3 rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 filter blur-md opacity-80 pointer-events-none"
                  />
                )}

                {/* Comic Speed Lines when attacking or clashing */}
                {phase === 'brawl' && Math.abs(offset.x) > 15 && (
                  <div
                    className={`absolute inset-0 pointer-events-none flex items-center justify-center ${
                      offset.x > 0 ? 'scale-x-100' : '-scale-x-100'
                    }`}
                  >
                    <div className="w-16 h-1 bg-yellow-300/80 -translate-x-10 rounded-full blur-[0.5px]" />
                  </div>
                )}

                {/* The Emoji Fighter Sprite with dynamic squash-and-stretch */}
                <motion.div
                  animate={
                    offset.statusEffect === 'spicy'
                      ? { scale: [1, 1.25, 0.95, 1], rotate: [-10, 10, -5, 5, 0] }
                      : offset.statusEffect === 'dizzy'
                      ? { rotate: [0, 25, -25, 15, 0] }
                      : offset.statusEffect === 'fire'
                      ? { y: [0, -25, 0] }
                      : offset.jumpY < -5
                      ? { scaleX: 0.85, scaleY: 1.25 }
                      : { scaleX: 1.15, scaleY: 0.9 }
                  }
                  transition={{ duration: 0.25 }}
                  style={{ fontSize: `${sq.baseSize}px` }}
                  className={`relative select-none filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)] ${
                    offset.statusEffect === 'spicy'
                      ? 'filter sepia(1) hue-rotate(-50deg) saturate(3)'
                      : offset.statusEffect === 'fire'
                      ? 'brightness-50 contrast-150'
                      : ''
                  }`}
                >
                  {sq.emoji}

                  {/* Status Effect Overlays */}
                  {offset.statusEffect === 'dizzy' && (
                    <span className="absolute -top-3 inset-x-0 text-center text-sm animate-spin">
                      💫
                    </span>
                  )}
                  {offset.statusEffect === 'spicy' && (
                    <span className="absolute -top-3 -right-2 text-xs animate-bounce">
                      💨
                    </span>
                  )}
                </motion.div>

                {/* Glowing Colored Neon Floor Ring under fighter's feet */}
                <div
                  style={{
                    borderColor: sq.ringBorderColor,
                    boxShadow: `0 0 10px ${sq.ringColor}`,
                  }}
                  className="w-12 sm:w-14 h-4 rounded-full border-2 bg-black/40 mt-1 pointer-events-none"
                />

                {/* Dark Oval Ground Shadow that shrinks when jumping and widens on landing */}
                <motion.div
                  animate={{
                    scaleX: offset.jumpY < -5 ? 0.6 : 1.2,
                    opacity: offset.jumpY < -5 ? 0.25 : 0.65,
                  }}
                  className="w-10 sm:w-12 h-2.5 rounded-full bg-black/80 blur-[2px] -mt-2"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Contributor Player Avatar Badges docked along corresponding bottom ring corners */}
        <div className="absolute -bottom-6 inset-x-2 flex items-center justify-between pointer-events-none z-20">
          {squads.map((sq) => (
            <div
              key={sq.squadId}
              className="flex items-center -space-x-1.5 rtl:space-x-reverse bg-black/60 px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-xs"
            >
              <span className="text-xs me-1">{sq.emoji}</span>
              {sq.members.map((m) => (
                <div
                  key={m.participantId}
                  title={m.nickname}
                  style={{ backgroundColor: m.playerColor || '#FFD75A' }}
                  className="w-5 h-5 rounded-full border border-black text-[9px] font-black flex items-center justify-center text-black shadow-xs"
                >
                  {m.nickname.slice(0, 1).toUpperCase()}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* PHASE 4: CHAMPIONSHIP PODIUM WINNER CELEBRATION OVERLAY */}
      {phase === 'podium' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs p-4 text-center pointer-events-auto"
        >
          <div className="w-full max-w-xs bg-white rounded-3xl border-3 border-[#241B18] shadow-[0_8px_0_#241B18] p-4 flex flex-col items-center gap-2">
            <span className="text-4xl">👑</span>
            <span className="text-xs font-black text-amber-600 font-alexandria uppercase tracking-wider">
              {locale === 'ar' ? 'البطل الفائز!' : 'Champion Squad!'}
            </span>
            <div className="text-3xl my-1">{winningSquad?.emoji}</div>
            <h3 className="text-lg font-black text-[#241B18] font-alexandria">
              {locale === 'ar'
                ? winningSquad?.restaurant.nameAr || winningSquad?.restaurant.nameEn
                : winningSquad?.restaurant.nameEn || winningSquad?.restaurant.nameAr}
            </h3>

            {isHost && onWinnerConfirmed ? (
              <button
                type="button"
                onClick={onWinnerConfirmed}
                className="mt-2 w-full py-2.5 px-4 rounded-xl bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0_3px_0_#241B18] font-black text-xs font-alexandria active:translate-y-0.5 cursor-pointer hover:brightness-105"
              >
                {locale === 'ar' ? 'اعتماد الفائز 🏆' : 'Lock in Winner 🏆'}
              </button>
            ) : (
              <div className="mt-2 w-full py-2.5 px-4 rounded-xl bg-amber-500/15 border-2 border-amber-400/50 text-amber-900 font-black text-xs font-alexandria flex items-center justify-center gap-2 animate-pulse">
                <span>⏳</span>
                <span>
                  {locale === 'ar'
                    ? 'جاري الانتقال لصفحة الطلب...'
                    : 'Transitioning to order screen...'}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
