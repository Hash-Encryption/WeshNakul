import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SpiceItemType } from '../../../types/emojiClash';

interface TactileCyclingDockProps {
  onThrow: (item: SpiceItemType) => void;
  disabled?: boolean;
}

interface ItemConfig {
  type: SpiceItemType;
  icon: string;
  nameEn: string;
  nameAr: string;
  bgGradient: string;
  borderColor: string;
  shadowColor: string;
}

const ITEMS: ItemConfig[] = [
  {
    type: 'spice',
    icon: '🌶️',
    nameEn: 'Spice',
    nameAr: 'شطة',
    bgGradient: 'from-[#FF3A3A] via-[#E11D48] to-[#9F1239]',
    borderColor: '#7F1D1D',
    shadowColor: 'rgba(239, 68, 68, 0.6)',
  },
  {
    type: 'garlic',
    icon: '🧄',
    nameEn: 'Garlic',
    nameAr: 'ثوم',
    bgGradient: 'from-[#F3F4F6] via-[#E5E7EB] to-[#9CA3AF]',
    borderColor: '#4B5563',
    shadowColor: 'rgba(209, 213, 219, 0.6)',
  },
  {
    type: 'fire',
    icon: '🔥',
    nameEn: 'Fire',
    nameAr: 'نار',
    bgGradient: 'from-[#FF8C00] via-[#EA580C] to-[#C2410C]',
    borderColor: '#7C2D12',
    shadowColor: 'rgba(249, 115, 22, 0.6)',
  },
];

const COOLDOWN_MS = 1500;

export const TactileCyclingDock: React.FC<TactileCyclingDockProps> = ({
  onThrow,
  disabled = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const [progress, setProgress] = useState(1);
  const [isDepressed, setIsDepressed] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  const currentItem = ITEMS[currentIndex];
  // Left preview is the previous/incoming item
  const leftItem = ITEMS[(currentIndex + ITEMS.length - 1) % ITEMS.length];
  // Right preview is the next item in rotation
  const rightItem = ITEMS[(currentIndex + 1) % ITEMS.length];

  const handlePress = () => {
    if (disabled || isCooldown) return;

    setIsDepressed(true);
    setTimeout(() => setIsDepressed(false), 120);

    onThrow(currentItem.type);

    // Start 1.5s liquid cooldown
    setIsCooldown(true);
    setProgress(0);

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / COOLDOWN_MS);
      setProgress(p);

      if (p < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setIsCooldown(false);
        // Advance cycle: 🌶️ -> 🧄 -> 🔥 -> 🌶️
        setCurrentIndex((prev) => (prev + 1) % ITEMS.length);
        setJustUnlocked(true);
        setTimeout(() => setJustUnlocked(false), 300);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      className={`relative w-full max-w-sm mx-auto flex items-center justify-center py-2 select-none z-20 transition-opacity duration-300 ${
        disabled ? 'opacity-35 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex items-center justify-center gap-3 sm:gap-6">
        {/* Left Flanking Glass Bubble: Fire / نار (or previous item in cycle) */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-md flex items-center justify-center text-2xl transition-transform hover:scale-105">
            {leftItem.icon}
          </div>
          <div className="text-center leading-none">
            <span className="block text-[11px] font-black text-white drop-shadow-[0_1px_2px_#000]">
              {leftItem.nameEn}
            </span>
            <span className="block text-[9px] font-bold text-white/80 drop-shadow-[0_1px_1px_#000]">
              {leftItem.nameAr}
            </span>
          </div>
        </div>

        {/* 4 Curved Golden/White Comic Rotation Arrows */}
        {/* Arrow 1: Top-Left (Left bubble -> Center button) */}
        <svg
          className="w-7 h-5 text-amber-200/90 absolute -top-1 left-[72px] sm:left-[82px] pointer-events-none drop-shadow-xs"
          viewBox="0 0 28 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 14 C10 4 20 4 26 8" />
          <polyline points="20 4 26 8 24 14" />
        </svg>

        {/* Arrow 2: Bottom-Left (Center button -> Left bubble) */}
        <svg
          className="w-7 h-5 text-amber-200/90 absolute -bottom-1 left-[72px] sm:left-[82px] pointer-events-none drop-shadow-xs"
          viewBox="0 0 28 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M26 6 C20 16 10 16 4 12" />
          <polyline points="10 16 4 12 6 6" />
        </svg>

        {/* Centerpiece 3D Red Circular Arcade Button (115px diameter) */}
        <motion.div
          animate={
            justUnlocked
              ? { scale: [1, 1.15, 1] }
              : isDepressed
              ? { scale: 0.95, y: 6 }
              : { scale: 1, y: 0 }
          }
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative flex items-center justify-center"
        >
          {/* Thick 3D physical socket base (border-b-8) */}
          <div className="w-[112px] h-[112px] sm:w-[118px] sm:h-[118px] rounded-full p-2 bg-[#3A2211] border-3 border-[#201208] border-b-8 border-b-[#1C0E05] shadow-[0_12px_24px_rgba(0,0,0,0.65)] flex items-center justify-center">
            {/* The Clickable Glossy Red Dome */}
            <button
              type="button"
              disabled={disabled || isCooldown}
              onClick={handlePress}
              className={`relative w-full h-full rounded-full bg-gradient-to-b from-[#EF4444] via-[#DC2626] to-[#991B1B] border-3 border-[#5C0A0A] shadow-[inset_0_-6px_8px_rgba(0,0,0,0.5),0_4px_10px_rgba(239,68,68,0.4)] active:translate-y-1 transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer ${
                isCooldown ? 'brightness-75 cursor-not-allowed' : 'hover:brightness-105'
              }`}
            >
              {/* Top-Left Specular White Highlight Curve */}
              <div className="absolute top-1.5 left-3 w-10 h-4 rounded-full bg-gradient-to-b from-white/70 via-white/30 to-transparent transform -rotate-12 pointer-events-none" />

              {/* Liquid Cooldown Fill Rising Inside */}
              {isCooldown && (
                <motion.div
                  style={{ height: `${(1 - progress) * 100}%` }}
                  className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-[1px] pointer-events-none transition-all"
                />
              )}

              {/* Item Icon */}
              <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-10 -mt-1">
                {currentItem.icon}
              </span>

              {/* Stacked Bold Text: SPICE / شطة */}
              <div className="z-10 text-center leading-tight -mt-0.5">
                <span className="block text-xs font-black text-white uppercase tracking-wider drop-shadow-[0_2px_2px_#000]">
                  {currentItem.nameEn}
                </span>
                <span className="block text-[10px] font-black text-yellow-200 drop-shadow-[0_1px_2px_#000]">
                  {currentItem.nameAr}
                </span>
              </div>

              {/* Ready Flash Overlay */}
              <AnimatePresence>
                {justUnlocked && (
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 bg-white rounded-full pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        {/* Arrow 3: Top-Right (Center button -> Right bubble) */}
        <svg
          className="w-7 h-5 text-amber-200/90 absolute -top-1 right-[72px] sm:right-[82px] pointer-events-none drop-shadow-xs"
          viewBox="0 0 28 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 8 C10 4 20 4 26 14" />
          <polyline points="22 14 26 14 28 8" />
        </svg>

        {/* Arrow 4: Bottom-Right (Right bubble -> Center button) */}
        <svg
          className="w-7 h-5 text-amber-200/90 absolute -bottom-1 right-[72px] sm:right-[82px] pointer-events-none drop-shadow-xs"
          viewBox="0 0 28 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M26 12 C20 16 10 16 4 6" />
          <polyline points="8 6 4 6 2 12" />
        </svg>

        {/* Right Flanking Glass Bubble: Garlic / ثوم (or next item in cycle) */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full bg-white/15 border-2 border-white/40 shadow-[0_4px_12px_rgba(0,0,0,0.4)] backdrop-blur-md flex items-center justify-center text-2xl transition-transform hover:scale-105">
            {rightItem.icon}
          </div>
          <div className="text-center leading-none">
            <span className="block text-[11px] font-black text-white drop-shadow-[0_1px_2px_#000]">
              {rightItem.nameEn}
            </span>
            <span className="block text-[9px] font-bold text-white/80 drop-shadow-[0_1px_1px_#000]">
              {rightItem.nameAr}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
