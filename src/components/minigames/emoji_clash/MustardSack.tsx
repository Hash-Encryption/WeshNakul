import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '../../../context/LocaleContext';

interface MustardSackProps {
  currentTaps: number;
  targetTaps: number;
  isInteractive: boolean;
  onTap: () => void;
  isDetonated: boolean;
  isSackDropping: boolean;
  isAlertActive?: boolean;
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
  isAlertActive = false,
}) => {
  const { locale } = useLocale();
  const [dodgeX, setDodgeX] = useState(0);
  const [tiltDeg, setTiltDeg] = useState(0);
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [_squashTrigger, setSquashTrigger] = useState(0);

  const tapRatio = Math.min(1, currentTaps / Math.max(1, targetTaps));
  // Scale progressively swells from 0.85 up to 1.85 as tapRatio reaches 100%
  const currentScale = 0.85 + tapRatio * (1.85 - 0.85);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isInteractive || isDetonated || isSackDropping) return;

    // Trigger tap dodge physics: -65px to +65px
    const newDodge = (Math.random() - 0.5) * 130;
    const newTilt = (Math.random() - 0.5) * 40; // ±20deg
    setDodgeX(newDodge);
    setTiltDeg(newTilt);
    setSquashTrigger((prev) => prev + 1);

    // Spawn tiny mustard droplets spraying from the nozzle
    const newDroplets: Droplet[] = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i,
      x: 35 + (Math.random() - 0.5) * 10,
      y: -25 + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.2) * 60,
      vy: (Math.random() - 0.8) * 50,
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

  // Circumference for circular gauge
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - tapRatio * circumference;

  return (
    <div className="absolute top-2 inset-x-0 flex flex-col items-center pointer-events-none z-30">
      {/* Hanging Braided Rope from Ceiling */}
      <motion.div
        animate={
          isSackDropping || isDetonated
            ? { height: 0, opacity: 0 }
            : {
                height: isAlertActive ? 68 : 52,
                x: dodgeX * 0.4,
              }
        }
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        className="w-2.5 bg-gradient-to-b from-[#78542C] via-[#9A784E] to-[#B08958] border-x border-[#3D2612] shadow-sm relative"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.2) 3px, rgba(0,0,0,0.2) 6px)',
        }}
      >
        {/* Rope fray knot at junction */}
        <div className="absolute -bottom-1 -left-1 w-4.5 h-3.5 bg-[#614322] rounded-md border border-[#241B18]" />
      </motion.div>

      {/* Pulsing Shockwave Alert Ring around Sack */}
      {isAlertActive && !isDetonated && !isSackDropping && (
        <motion.div
          animate={{ scale: [0.95, 1.45, 0.95], opacity: [0.85, 0.15, 0.85] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-14 w-36 h-36 rounded-full border-4 border-amber-400 pointer-events-none shadow-[0_0_24px_rgba(250,204,21,0.85)] z-20"
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
                rotate: tiltDeg,
              }
        }
        transition={
          isSackDropping
            ? { duration: 0.3, ease: 'easeIn' }
            : { type: 'spring', stiffness: 420, damping: 18 }
        }
        className="relative pointer-events-auto cursor-pointer select-none origin-top -mt-1 flex items-center justify-center"
        onClick={handleTap}
        whileTap={
          isInteractive && !isDetonated && !isSackDropping
            ? { scaleX: 1.28, scaleY: 0.78 }
            : undefined
        }
      >
        {/* Mustard Sack SVG Graphic */}
        <div className="relative w-28 h-28 flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
          <svg viewBox="0 0 120 120" className="w-full h-full overflow-visible">
            <defs>
              <radialGradient id="mustardGrad" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FFF275" />
                <stop offset="35%" stopColor="#FACC15" />
                <stop offset="75%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
              </radialGradient>
              <linearGradient id="nozzleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="45%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
            </defs>

            {/* Red and white ribbed bottle cap / nozzle (sticking out upper right) */}
            <g transform="translate(68, 10) rotate(32)">
              {/* Bottle neck base */}
              <rect x="0" y="8" width="16" height="6" rx="2" fill="#FFFFFF" stroke="#241B18" strokeWidth="2" />
              {/* Ribbed cap body */}
              <rect x="2" y="-2" width="12" height="12" rx="3" fill="url(#nozzleGrad)" stroke="#241B18" strokeWidth="2" />
              {/* White ribbed bands */}
              <line x1="2" y1="2" x2="14" y2="2" stroke="#FFFFFF" strokeWidth="1.5" />
              <line x1="2" y1="6" x2="14" y2="6" stroke="#FFFFFF" strokeWidth="1.5" />
              {/* Nozzle spout tip */}
              <path d="M5 -2 L8 -7 L11 -2 Z" fill="#EF4444" stroke="#241B18" strokeWidth="1.5" />
            </g>

            {/* Bulging wrinkly Mustard Sack body */}
            <path
              d="M60 22 C82 22 102 36 104 62 C106 88 88 108 60 108 C32 108 14 88 16 62 C18 36 38 22 60 22 Z"
              fill="url(#mustardGrad)"
              stroke="#241B18"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Pressure wrinkles / crease contours */}
            <path d="M30 46 C25 58 26 74 34 86" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65" />
            <path d="M88 44 C94 56 93 72 86 84" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.65" />
            <path d="M48 27 C42 34 38 42 36 50" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
            <path d="M42 96 C52 102 68 102 78 96" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6" />

            {/* Center Biohazard / Warning Triangle Emblem */}
            <g transform="translate(60, 65)">
              {/* Yellow warning triangle backing */}
              <polygon
                points="0,-18 20,14 -20,14"
                fill="#FEF08A"
                stroke="#241B18"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              {/* Biohazard symbol */}
              <circle cx="0" cy="0" r="2.5" fill="#241B18" />
              <path
                d="M0,-8 C3,-8 5,-6 5,-3 C2,-3 0,-4 0,-8 Z"
                fill="#241B18"
              />
              <path
                d="M-7,4 C-8,1 -7,-1 -4,-2 C-4,1 -5,3 -7,4 Z"
                fill="#241B18"
              />
              <path
                d="M7,4 C8,1 7,-1 4,-2 C4,1 5,3 7,4 Z"
                fill="#241B18"
              />
            </g>

            {/* Tie rope knot around neck */}
            <ellipse cx="60" cy="22" rx="14" ry="5" fill="#9A784E" stroke="#241B18" strokeWidth="2.5" />
            <ellipse cx="60" cy="20" rx="12" ry="4" fill="#B08958" />
          </svg>

          {/* Flying mustard droplets from nozzle */}
          <AnimatePresence>
            {droplets.map((d) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 1, scale: 0.8, x: d.x, y: d.y }}
                animate={{
                  opacity: 0,
                  scale: 0.2,
                  x: d.x + d.vx,
                  y: d.y + d.vy,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute w-2 h-2 rounded-full bg-amber-400 border border-amber-600 pointer-events-none"
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Comic Callout Badge on the Right: TAP! / فجر الخردل! with circular pressure gauge */}
        {isInteractive && !isDetonated && !isSackDropping && (
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

        {/* Comic Warning Ribbon, Bouncing Neon Arrows & Live Tap Counter Badge */}
        {isAlertActive && !isDetonated && !isSackDropping && (
          <div className="absolute -bottom-16 inset-x-0 flex flex-col items-center pointer-events-none z-30">
            <div className="flex items-center justify-center gap-2 mb-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                  className="text-lg filter drop-shadow-[0_0_8px_#FACC15]"
                >
                  👆
                </motion.span>
              ))}
            </div>
            <div className="bg-amber-400 text-[#241B18] px-2.5 py-0.5 rounded-full border-2 border-black font-black text-[10px] font-alexandria shadow-[0_3px_0_#000] flex items-center gap-1.5 whitespace-nowrap">
              <span>
                {locale === 'ar'
                  ? '⚠️ اضغطوا على كيس الخردل لتفجيره! 👆'
                  : '⚠️ TAP THE MUSTARD SACK TO EXPLODE IT! 👆'}
              </span>
              <span className="bg-black text-amber-300 px-1.5 py-0.5 rounded-full text-[9px] font-black tracking-wide">
                💥 {currentTaps} / {targetTaps} {locale === 'ar' ? 'ضربة' : 'TAPS'}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
