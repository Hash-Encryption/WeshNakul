import React, { useState } from 'react';
import confetti from 'canvas-confetti';

interface TactileActionDockProps {
  onSwipe: (liked: boolean) => void;
  disabled: boolean;
}

export const TactileActionDock: React.FC<TactileActionDockProps> = ({
  onSwipe,
  disabled,
}) => {
  const [isSuperLiking, setIsSuperLiking] = useState(false);

  const handleSuperLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isSuperLiking) return;

    setIsSuperLiking(true);

    // Energetic butter-yellow burst animation (#FFD75A)
    try {
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.85 },
        colors: ['#FFD75A', '#FFE885', '#FFF8F1', '#241B18'],
        ticks: 200,
        gravity: 1.2,
      });
    } catch {
      // safe fallback
    }

    onSwipe(true);

    setTimeout(() => {
      setIsSuperLiking(false);
    }, 400);
  };

  return (
    <div
      dir="ltr"
      className="fixed bottom-6 inset-x-0 flex justify-center items-center gap-5 sm:gap-6 z-30 pointer-events-auto px-4"
    >
      {/* Pass Button (Left) - Red */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSwipe(false)}
        aria-label="Pass"
        className="w-16 h-16 rounded-2xl bg-[#F0443E] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-2xl select-none"
      >
        <span role="img" aria-hidden="true" className="transform active:scale-90 transition-transform">
          ❌
        </span>
      </button>

      {/* Super-Like Button (Center) - Butter Yellow */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleSuperLike}
        aria-label="Super Like"
        className="w-14 h-14 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl select-none"
      >
        <span
          role="img"
          aria-hidden="true"
          className={`transform transition-transform ${isSuperLiking ? 'scale-125 rotate-12' : 'active:scale-90'}`}
        >
          ⭐
        </span>
      </button>

      {/* Like Button (Right) - Green */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSwipe(true)}
        aria-label="Like"
        className="w-16 h-16 rounded-2xl bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-2xl select-none"
      >
        <span role="img" aria-hidden="true" className="transform active:scale-90 transition-transform">
          💚
        </span>
      </button>
    </div>
  );
};
