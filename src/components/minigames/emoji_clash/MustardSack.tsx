import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '../../../context/LocaleContext';
import type { EmojiClashPhase } from '../../../types/emojiClash';

interface MustardSackProps {
  currentTaps: number;
  targetTaps: number;
  isInteractive: boolean;
  onTap: () => void;
  isDetonated: boolean;
  isSackDropping: boolean;
  timerSeconds: number;
  phase: EmojiClashPhase;
}

interface Droplet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const MustardSack: React.FC<MustardSackProps> = ({
  currentTaps,
  targetTaps,
  isInteractive,
  onTap,
  isDetonated,
  isSackDropping,
  timerSeconds,
  phase,
}) => {
  const { locale } = useLocale();
  const [dodgeX, setDodgeX] = useState(0);
  const [tiltDeg, setTiltDeg] = useState(0);
  const [droplets, setDroplets] = useState<Droplet[]>([]);

  // Phase 3, Act 1 (15s–6s): Mustard Bomb is hidden above ceiling.
  // Phase 3, Act 2 (6s–0s): Mustard Bomb drops into upper-sky zone with stationary progress bar.
  const isAct2 = phase === 'brawl' && timerSeconds <= 6;

  // Constrain scale: 0.95x at 0% up to strictly 1.38x at 100% taps (never overflows 390px mobile screen)
  const tapRatio = Math.min(1, currentTaps / Math.max(1, targetTaps));
  const currentScale = 0.95 + tapRatio * (1.38 - 0.95);

  // Constrain vertical drop: 0px to 32px max in upper-sky zone (never touches octagon or bottom dock)
  const verticalDrop = Math.min(32, tapRatio * 32);

  // Rope height: 20px extending slightly up to 34px max
  const ropeHeight = 20 + tapRatio * 14;

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isInteractive || isDetonated || isSackDropping || !isAct2) return;

    // Horizontal jolt constrained to strictly ±10px max
    const newDodge = (Math.random() - 0.5) * 20; // -10px to +10px
    const newTilt = (Math.random() - 0.5) * 12; // -6deg to +6deg
    setDodgeX(newDodge);
    setTiltDeg(newTilt);

    // Spawn mustard droplets spraying from the nozzle
    const newDroplets: Droplet[] = Array.from({ length: 3 }).map((_, i) => ({
      id: Date.now() + i,
      x: 35 + (Math.random() - 0.5) * 8,
      y: -15 + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.2) * 45,
      vy: (Math.random() - 0.7) * 35,
    }));
    setDroplets((prev) => [...prev.slice(-8), ...newDroplets]);

    onTap();
  };

  // Clean up old droplets
  useEffect(() => {
    if (droplets.length === 0) return;
    const timer = setTimeout(() => {
      setDroplets([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [droplets]);

  // If not in Act 2 or detonated, hide cleanly
  if (!isAct2 || isDetonated) {
    return null;
  }

  // Circular gauge calculations
  const radius = 7.5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - tapRatio);

  return (
    <div className="absolute top-2 inset-x-0 flex flex-col items-center pointer-events-none z-30">
      {/* 1. STATIONARY NON-TILTING PROGRESS PILL (Completely outside scaling/tilting wrapper) */}
      <div className="flex flex-col items-center pointer-events-none mb-1 z-30">
        <div className="flex items-center bg-gradient-to-r from-[#DC2626] via-[#B91C1C] to-[#991B1B] text-white px-3 py-1 rounded-full border-2 border-amber-300 shadow-[0_4px_16px_rgba(220,38,38,0.85)] gap-2 whitespace-nowrap">
          <span className="text-[10px] sm:text-[11px] font-black tracking-tight text-yellow-200 font-alexandria">
            {locale === 'ar' ? 'اضغط لتفجير قنبلة الخردل!' : 'CLICK THE MUSTARD BOMB!'}
          </span>

          {/* Mini Circular Progress Ring */}
          <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 -rotate-90">
              <circle
                cx="10"
                cy="10"
                r={radius}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="2.5"
                fill="none"
              />
              <circle
                cx="10"
                cy="10"
                r={radius}
                stroke="#FACC15"
                strokeWidth="2.5"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[7px] font-black text-white font-mono">
              {Math.min(100, Math.round(tapRatio * 100))}%
            </span>
          </div>

          {/* Live Tap Counter Badge */}
          <span className="text-[9px] font-black bg-black/60 text-amber-300 px-1.5 py-0.5 rounded-full font-mono">
            💥 {currentTaps}/{targetTaps}
          </span>
        </div>

        {/* Single Clean Pointing Hand Indicator directly above the Mustard Bomb */}
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-base mt-0.5 filter drop-shadow-[0_0_6px_#FACC15]"
        >
          👇
        </motion.div>
      </div>

      {/* Hanging Braided Rope from Ceiling */}
      <motion.div
        animate={
          isSackDropping
            ? { height: 0, opacity: 0 }
            : {
                height: ropeHeight,
                x: dodgeX * 0.25,
              }
        }
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        className="w-2 bg-gradient-to-b from-[#78542C] via-[#9A784E] to-[#B08958] border-x border-[#3D2612] shadow-xs relative origin-top"
      >
        <div className="absolute -bottom-1 -left-0.5 w-3 h-2 bg-[#614322] rounded-xs border border-[#241B18]" />
      </motion.div>

      {/* Pulsing Shockwave Alert Ring around Sack */}
      {!isSackDropping && (
        <motion.div
          animate={{ scale: [0.95, 1.25, 0.95], opacity: [0.75, 0.15, 0.75] }}
          transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-14 w-28 h-28 rounded-full border-3 border-amber-400 pointer-events-none shadow-[0_0_18px_rgba(250,204,21,0.75)] z-10"
        />
      )}

      {/* Tilting & Scaling Mustard Bomb SVG Wrapper */}
      <motion.div
        animate={
          isSackDropping
            ? { y: 50, scale: 1.45, opacity: 0 }
            : {
                x: dodgeX,
                y: verticalDrop,
                scale: currentScale,
                rotate: tiltDeg,
              }
        }
        transition={{ type: 'spring', stiffness: 450, damping: 22 }}
        className="relative pointer-events-auto cursor-pointer select-none origin-top flex items-center justify-center z-20"
        onClick={handleTap}
        whileTap={{ scaleX: 1.12, scaleY: 0.9 }}
      >
        {/* Base SVG container: 92px width × 104px height */}
        <div className="relative w-[92px] h-[104px] flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]">
          <svg viewBox="0 0 180 200" className="w-full h-full overflow-visible">
            <defs>
              {/* Rich Mustard Cloth Radial Gradient */}
              <radialGradient id="mustardCloth" cx="42%" cy="38%" r="68%">
                <stop offset="0%" stopColor="#FFF385" />
                <stop offset="28%" stopColor="#FACC15" />
                <stop offset="68%" stopColor="#EAB308" />
                <stop offset="92%" stopColor="#CA8A04" />
                <stop offset="100%" stopColor="#A16207" />
              </radialGradient>

              {/* Nozzle Gradient */}
              <linearGradient id="nozzleRed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="45%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>

              {/* Rope Knot Gradient */}
              <linearGradient id="knotBrown" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B45309" />
                <stop offset="50%" stopColor="#92400E" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>

            {/* Ruffled sack cloth crown above the neck knot */}
            <path
              d="M72,24 C76,14 82,18 90,13 C98,18 104,14 108,24 C102,30 90,32 72,24 Z"
              fill="url(#mustardCloth)"
              stroke="#241B18"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Red & White Ribbed Squeeze Nozzle sticking out upper right */}
            <g transform="translate(108, 18) rotate(32)">
              <rect x="0" y="8" width="18" height="7" rx="2" fill="#FFFFFF" stroke="#241B18" strokeWidth="2.5" />
              <rect x="2" y="-3" width="14" height="13" rx="3" fill="url(#nozzleRed)" stroke="#241B18" strokeWidth="2.5" />
              <line x1="2" y1="1" x2="16" y2="1" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="2" y1="6" x2="16" y2="6" stroke="#FFFFFF" strokeWidth="2" />
              <path d="M5 -3 L9 -9 L13 -3 Z" fill="#EF4444" stroke="#241B18" strokeWidth="2" />
              <circle cx="9" cy="-11" r="2.5" fill="#FACC15" stroke="#CA8A04" strokeWidth="1" />
            </g>

            {/* Bulging Pear-Shaped Cloth Sack Body */}
            <path
              d="M80,36 C64,48 40,78 34,115 C28,152 50,186 90,186 C130,186 152,152 146,115 C140,78 116,48 100,36 Z"
              fill="url(#mustardCloth)"
              stroke="#241B18"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />

            {/* Internal Cloth Creases & Wrinkle Contours */}
            <path
              d="M48,92 C40,112 44,142 56,162"
              stroke="#92400E"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />
            <path
              d="M132,90 C140,110 136,140 124,160"
              stroke="#92400E"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />

            {/* Neck Braided Rope Knot */}
            <ellipse
              cx="90"
              cy="34"
              rx="18"
              ry="6.5"
              fill="url(#knotBrown)"
              stroke="#241B18"
              strokeWidth="3"
            />
            <ellipse
              cx="90"
              cy="37"
              rx="15"
              ry="5"
              fill="url(#knotBrown)"
              stroke="#241B18"
              strokeWidth="2"
            />

            {/* PRINTED BELLY LABEL: MUSTARD BOMB / قنبلة الخردل + BIOHAZARD TRIANGLE */}
            <g transform="translate(90, 110)">
              {/* Warning Triangle Background */}
              <polygon
                points="0,-32 26,12 -26,12"
                fill="#FACC15"
                stroke="#241B18"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              {/* Inner Triangle Border */}
              <polygon
                points="0,-24 20,8 -20,8"
                fill="none"
                stroke="#241B18"
                strokeWidth="1.5"
              />
              {/* Biohazard/Droplet Icon in Center */}
              <circle cx="0" cy="-2" r="4" fill="#241B18" />
              <path d="M-7,4 C-8,1 -7,-1 -4,-2 C-4,1 -5,3 -7,4 Z" fill="#241B18" />
              <path d="M7,4 C8,1 7,-1 4,-2 C4,1 5,3 7,4 Z" fill="#241B18" />

              {/* Printed Comic Text Across Sack Belly */}
              <text
                x="0"
                y="27"
                textAnchor="middle"
                fill="#241B18"
                fontWeight="900"
                fontSize="10"
                fontFamily="sans-serif"
                letterSpacing="1"
              >
                MUSTARD BOMB
              </text>
              <text
                x="0"
                y="39"
                textAnchor="middle"
                fill="#241B18"
                fontWeight="900"
                fontSize="9"
                fontFamily="sans-serif"
              >
                قنبلة الخردل
              </text>
            </g>
          </svg>

          {/* Flying Mustard Droplets sprayed from nozzle on tap */}
          <AnimatePresence>
            {droplets.map((d) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 1, scale: 0.9, x: d.x, y: d.y }}
                animate={{
                  opacity: 0,
                  scale: 0.2,
                  x: d.x + d.vx,
                  y: d.y + d.vy,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 pointer-events-none"
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
