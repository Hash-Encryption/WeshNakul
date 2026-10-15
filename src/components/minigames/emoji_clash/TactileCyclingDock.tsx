import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '../../../context/LocaleContext';
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
  const { locale } = useLocale();
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
    <div className="relative w-full max-w-sm mx-auto flex items-center justify-center py-2 select-none z-20">
      {/* Throw Indicator Arc Text matching reference image */}
      <div className="absolute -top-3.5 right-12 sm:right-16 text-[10px] font-black text-amber-300/80 tracking-wider pointer-events-none rotate-[-12deg]">
        <span>{locale === 'ar' ? 'رمي الشطة ⤴' : 'spice particle throw ⤴'}</span>
      </div>

      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {/* Left Flanking Preview Icon (Garlic / ثوم with curved arrow) */}
        <div className="flex flex-col items-center gap-1 opacity-85">
          <div className="relative flex items-center justify-center">
            {/* Curved rotation arrow pointing into main button */}
            <svg
              className="w-5 h-5 text-white/80 absolute -top-4 -right-2 transform rotate-45"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <polyline points="3 3 3 8 8 8" />
            </svg>
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/30 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
              {leftItem.icon}
            </div>
          </div>
          <div className="text-center leading-none">
            <span className="block text-[10px] font-black text-white/90">
              {leftItem.nameEn}
            </span>
            <span className="block text-[9px] font-semibold text-white/70">
              {leftItem.nameAr}
            </span>
          </div>
        </div>

        {/* Centerpiece 3D Circular Arcade Button */}
        <motion.div
          animate={
            justUnlocked
              ? { scale: [1, 1.22, 1] }
              : isDepressed
              ? { scale: 0.94, y: 6 }
              : { scale: 1, y: 0 }
          }
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative"
        >
          {/* Outer glowing golden ring */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 bg-gradient-to-b from-[#FFE57F] via-[#FFD700] to-[#B38F00] shadow-[0_0_24px_rgba(255,215,0,0.45)] flex items-center justify-center">
            {/* 3D Button Body with border-b-8 physical lip */}
            <button
              type="button"
              disabled={disabled || isCooldown}
              onClick={handlePress}
              style={{
                borderColor: currentItem.borderColor,
                boxShadow: `0 8px 0 ${currentItem.borderColor}, 0 12px 20px rgba(0,0,0,0.5)`,
              }}
              className={`relative w-full h-full rounded-full bg-gradient-to-b ${currentItem.bgGradient} border-3 active:translate-y-1.5 transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer ${
                isCooldown ? 'brightness-75 cursor-not-allowed' : 'hover:brightness-105'
              }`}
            >
              {/* Liquid Cooldown Fill Rising Inside */}
              {isCooldown && (
                <motion.div
                  style={{ height: `${(1 - progress) * 100}%` }}
                  className="absolute bottom-0 inset-x-0 bg-black/55 backdrop-blur-[1px] pointer-events-none transition-all"
                />
              )}

              {/* Glossy top highlight curve */}
              <div className="absolute top-1 inset-x-3 h-5 rounded-full bg-gradient-to-b from-white/45 to-transparent pointer-events-none" />

              {/* Item Icon */}
              <span className="text-2xl sm:text-3xl filter drop-shadow-md z-10">
                {currentItem.icon}
              </span>

              {/* Bilingual Label */}
              <div className="z-10 text-center leading-tight -mt-0.5">
                <span className="block text-xs font-black text-white uppercase tracking-wider drop-shadow-[0_1px_2px_#000]">
                  {currentItem.nameEn}
                </span>
                <span className="block text-[10px] font-bold text-yellow-200 drop-shadow-[0_1px_1px_#000]">
                  {currentItem.nameAr}
                </span>
              </div>

              {/* Ready flash overlay */}
              <AnimatePresence>
                {justUnlocked && (
                  <motion.div
                    initial={{ opacity: 0.8 }}
                    animate={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 bg-white rounded-full pointer-events-none"
                  />
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        {/* Right Flanking Preview Icon (Fire / نار with rotation arrow) */}
        <div className="flex flex-col items-center gap-1 opacity-85">
          <div className="relative flex items-center justify-center">
            {/* Curved rotation arrow showing upcoming cycle */}
            <svg
              className="w-5 h-5 text-white/80 absolute -top-4 -left-2 transform -rotate-45"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <polyline points="21 3 21 8 16 8" />
            </svg>
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/30 backdrop-blur-xs flex items-center justify-center text-xl shadow-inner">
              {rightItem.icon}
            </div>
          </div>
          <div className="text-center leading-none">
            <span className="block text-[10px] font-black text-white/90">
              {rightItem.nameEn}
            </span>
            <span className="block text-[9px] font-semibold text-white/70">
              {rightItem.nameAr}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
