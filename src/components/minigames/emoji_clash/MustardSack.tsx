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
  const [_squashTrigger, setSquashTrigger] = useState(0);

  // Stage A: First 3 seconds of fight (15s down to 12s remaining) -> compact, high, gentle sway, no alert clutter
  // Stage B: Mid-Match drop (12s down to 00s remaining) -> drops into spotlight at scale(0.95), reveals belly label, alert ribbon & swells
  const isStageB = phase === 'brawl' && timerSeconds <= 12;

  const tapRatio = Math.min(1, currentTaps / Math.max(1, targetTaps));
  // In Stage B: swells from 0.95 up to 1.85 with taps
  const currentScale = isStageB ? 0.95 + tapRatio * (1.85 - 0.95) : 0.55;

  // Rope height: 32px in Stage A; 65px extending up to 110px with taps in Stage B
  const ropeHeight = isStageB ? 65 + tapRatio * 45 : 32;

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isInteractive || isDetonated || isSackDropping || phase !== 'brawl') return;

    // Trigger tap dodge physics: -45px to +45px
    const newDodge = (Math.random() - 0.5) * 90;
    const newTilt = (Math.random() - 0.5) * 36; // ±18deg
    setDodgeX(newDodge);
    setTiltDeg(newTilt);
    setSquashTrigger((prev) => prev + 1);

    // Spawn mustard droplets spraying from the nozzle
    const newDroplets: Droplet[] = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      x: 45 + (Math.random() - 0.5) * 12,
      y: -25 + (Math.random() - 0.5) * 12,
      vx: (Math.random() - 0.2) * 65,
      vy: (Math.random() - 0.8) * 55,
    }));
    setDroplets((prev) => [...prev.slice(-12), ...newDroplets]);

    onTap();
  };

  // Clean up old droplets
  useEffect(() => {
    if (droplets.length === 0) return;
    const timer = setTimeout(() => {
      setDroplets([]);
    }, 600);
    return () => clearTimeout(timer);
  }, [droplets]);

  // Clean up on unmount or phase change
  useEffect(() => {
    if (phase === 'podium' || phase === 'completed') {
      setDroplets([]);
    }
  }, [phase]);

  // If in podium or completed, completely hide the sack so nothing clips behind victory card
  if (phase === 'podium' || phase === 'completed') {
    return null;
  }

  // Circular gauge calculations
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - tapRatio * circumference;

  return (
    <div className="absolute top-1 inset-x-0 flex flex-col items-center pointer-events-none z-30">
      {/* Hanging Braided Rope from Ceiling */}
      <motion.div
        animate={
          isSackDropping || isDetonated
            ? { height: 0, opacity: 0 }
            : {
                height: ropeHeight,
                x: dodgeX * 0.35,
              }
        }
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        className="w-2.5 bg-gradient-to-b from-[#78542C] via-[#9A784E] to-[#B08958] border-x border-[#3D2612] shadow-sm relative origin-top"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 6px)',
        }}
      >
        {/* Rope fray knot at junction */}
        <div className="absolute -bottom-1 -left-1 w-4.5 h-3.5 bg-[#614322] rounded-md border border-[#241B18]" />
      </motion.div>

      {/* Pulsing Shockwave Alert Ring around Sack (Only in Stage B) */}
      {isStageB && !isDetonated && !isSackDropping && (
        <motion.div
          animate={{ scale: [0.95, 1.45, 0.95], opacity: [0.85, 0.15, 0.85] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-16 w-40 h-40 rounded-full border-4 border-amber-400 pointer-events-none shadow-[0_0_24px_rgba(250,204,21,0.85)] z-20"
        />
      )}

      {/* Main Mustard Sack Container with Spring & Dodge Physics */}
      <motion.div
        animate={
          isDetonated
            ? { scale: 0, opacity: 0 }
            : isSackDropping
            ? { y: 280, scale: 2.1, rotate: 0 }
            : {
                x: dodgeX,
                scale: currentScale,
                rotate: tiltDeg !== 0 ? tiltDeg : !isStageB ? [-3, 3, -3] : 0,
              }
        }
        transition={
          isSackDropping
            ? { duration: 0.3, ease: 'easeIn' }
            : tiltDeg !== 0
            ? { type: 'spring', stiffness: 420, damping: 18 }
            : !isStageB
            ? { rotate: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } }
            : { type: 'spring', stiffness: 420, damping: 18 }
        }
        className="relative pointer-events-auto cursor-pointer select-none origin-top -mt-1 flex items-center justify-center"
        onClick={handleTap}
        whileTap={
          isInteractive && !isDetonated && !isSackDropping
            ? { scaleX: 1.28, scaleY: 0.76 }
            : undefined
        }
      >
        {/* Custom Rich Comic Mustard Sack SVG Graphic (viewBox="0 0 180 200") */}
        <div className="relative w-36 h-40 flex items-center justify-center filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.65)]">
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
              {/* White collar ring */}
              <rect x="0" y="8" width="18" height="7" rx="2" fill="#FFFFFF" stroke="#241B18" strokeWidth="2.5" />
              {/* Red ribbed cap */}
              <rect x="2" y="-3" width="14" height="13" rx="3" fill="url(#nozzleRed)" stroke="#241B18" strokeWidth="2.5" />
              {/* White ribbed bands */}
              <line x1="2" y1="1" x2="16" y2="1" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="2" y1="6" x2="16" y2="6" stroke="#FFFFFF" strokeWidth="2" />
              {/* Nozzle spout tip */}
              <path d="M5 -3 L9 -9 L13 -3 Z" fill="#EF4444" stroke="#241B18" strokeWidth="2" />
              {/* Hanging mustard drip */}
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
            <path
              d="M66,54 C56,70 52,90 50,110"
              stroke="#FFFFFF"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
            <path
              d="M65,172 C80,182 100,182 115,172"
              stroke="#78350F"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />

            {/* Multi-loop braided rope knot around neck */}
            <ellipse cx="90" cy="34" rx="18" ry="6" fill="url(#knotBrown)" stroke="#241B18" strokeWidth="3" />
            <ellipse cx="90" cy="31" rx="15" ry="5" fill="#B45309" stroke="#241B18" strokeWidth="2" />
            {/* Knot loop wrap */}
            <path d="M84,30 Q90,36 96,30" stroke="#78350F" strokeWidth="2.5" fill="none" strokeLinecap="round" />

            {/* Belly Hazard Emblem & Printed Comic Label (Revealed in Stage B) */}
            {isStageB && (
              <g transform="translate(90, 114)">
                {/* Yellow Warning Triangle with thick black border */}
                <polygon
                  points="0,-18 20,12 -20,12"
                  fill="#FEF08A"
                  stroke="#241B18"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                {/* Biohazard Symbol Center */}
                <circle cx="0" cy="0" r="2.5" fill="#241B18" />
                <path d="M0,-8 C3,-8 5,-6 5,-3 C2,-3 0,-4 0,-8 Z" fill="#241B18" />
                <path d="M-7,4 C-8,1 -7,-1 -4,-2 C-4,1 -5,3 -7,4 Z" fill="#241B18" />
                <path d="M7,4 C8,1 7,-1 4,-2 C4,1 5,3 7,4 Z" fill="#241B18" />

                {/* Printed Comic Text Across Sack Belly: MUSTARD BOMB / قنبلة الخردل */}
                <text
                  x="0"
                  y="28"
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
                  y="40"
                  textAnchor="middle"
                  fill="#241B18"
                  fontWeight="900"
                  fontSize="9"
                  fontFamily="sans-serif"
                >
                  قنبلة الخردل
                </text>
              </g>
            )}
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

        {/* Circular Pressure Gauge Button on the Right */}
        {isInteractive && !isDetonated && !isSackDropping && isStageB && (
          <div className="absolute -right-12 sm:-right-14 top-1/2 -translate-y-1/2 flex items-center justify-center">
            {/* Pressure Ring SVG */}
            <svg className="w-16 h-16 -rotate-90 pointer-events-none">
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="4"
                fill="none"
              />
              <motion.circle
                cx="32"
                cy="32"
                r={radius}
                stroke="#FFD700"
                strokeWidth="4"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.15 }}
                strokeLinecap="round"
              />
            </svg>

            {/* Comic Callout Sticker Button */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="absolute w-12 h-12 rounded-full bg-gradient-to-b from-[#FF6B00] via-[#EA580C] to-[#C2410C] border-2 border-white shadow-[0_4px_10px_rgba(234,88,12,0.8)] flex flex-col items-center justify-center text-white font-black leading-tight select-none cursor-pointer"
            >
              <span className="text-[11px] font-black tracking-wider text-yellow-200 uppercase drop-shadow-[0_1px_1px_#000]">
                TAP!
              </span>
              <span className="text-[8px] font-bold tracking-tight text-white/95">
                {locale === 'ar' ? 'فجر!' : 'POP!'}
              </span>
            </motion.div>
          </div>
        )}

        {/* Curved Arcade Warning Ribbon, Bouncing Neon Arrows & Live Tap Counter Badge (Only in Stage B) */}
        {isStageB && !isDetonated && !isSackDropping && (
          <div className="absolute -bottom-16 inset-x-0 flex flex-col items-center pointer-events-none z-30">
            {/* 3 Animated Bouncing Neon Arrows */}
            <div className="flex items-center justify-center gap-2 mb-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                  className="text-lg filter drop-shadow-[0_0_8px_#FACC15]"
                >
                  👇
                </motion.span>
              ))}
            </div>

            {/* Curved Red/Gold Arcade Warning Ribbon with Progress Ring */}
            <div className="flex items-center bg-gradient-to-r from-[#DC2626] via-[#B91C1C] to-[#991B1B] text-white px-3.5 py-1 rounded-full border-2 border-amber-300 shadow-[0_4px_16px_rgba(220,38,38,0.75)] gap-2 whitespace-nowrap">
              <span className="text-[10px] font-black tracking-tight text-yellow-200">
                {locale === 'ar' ? '👇 اضغط لتفجير قنبلة الخردل!' : '👇 CLICK THE MUSTARD BOMB!'}
              </span>

              {/* Mini Circular Gauge */}
              <div className="relative w-5 h-5 flex items-center justify-center">
                <svg className="w-5 h-5 -rotate-90">
                  <circle cx="10" cy="10" r="7.5" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" fill="none" />
                  <circle
                    cx="10"
                    cy="10"
                    r="7.5"
                    stroke="#FACC15"
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 7.5}
                    strokeDashoffset={2 * Math.PI * 7.5 * (1 - tapRatio)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[7px] font-black text-white">
                  {Math.min(100, Math.round(tapRatio * 100))}%
                </span>
              </div>

              <span className="text-[9px] font-black bg-black/50 text-amber-300 px-1.5 py-0.5 rounded-full">
                💥 {currentTaps}/{targetTaps}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
