import React from 'react';

export const WeshNakulCardBack: React.FC = () => {
  return (
    <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#B73516] via-[#A82D10] to-[#8E2209] border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] overflow-hidden select-none flex items-center justify-center">
      {/* Tactile Inset Border */}
      <div className="absolute inset-1.5 rounded-xl border border-[#FDE8D3]/50 pointer-events-none" />

      {/* Floating Food Icons Pattern across card face */}
      <div className="absolute inset-0 pointer-events-none opacity-85">
        <span className="absolute top-2.5 start-2.5 text-xs sm:text-sm drop-shadow-xs">🍕</span>
        <span className="absolute top-2.5 start-1/2 -translate-x-1/2 text-xs sm:text-sm drop-shadow-xs">🍔</span>
        <span className="absolute top-2.5 end-2.5 text-xs sm:text-sm drop-shadow-xs">🌮</span>

        <span className="absolute top-10 start-2 text-xs sm:text-sm drop-shadow-xs">🥗</span>
        <span className="absolute top-10 end-2 text-xs sm:text-sm drop-shadow-xs">🍟</span>

        <span className="absolute top-20 start-3 text-xs sm:text-sm drop-shadow-xs">🍟</span>
        <span className="absolute top-20 end-3 text-xs sm:text-sm drop-shadow-xs">☕</span>

        <span className="absolute bottom-20 start-2 text-xs sm:text-sm drop-shadow-xs">☕</span>
        <span className="absolute bottom-20 end-2 text-xs sm:text-sm drop-shadow-xs">🍔</span>

        <span className="absolute bottom-10 start-2.5 text-xs sm:text-sm drop-shadow-xs">🌮</span>
        <span className="absolute bottom-10 end-2.5 text-xs sm:text-sm drop-shadow-xs">🥗</span>

        <span className="absolute bottom-2.5 start-3 text-xs sm:text-sm drop-shadow-xs">🍕</span>
        <span className="absolute bottom-2.5 start-1/2 -translate-x-1/2 text-xs sm:text-sm drop-shadow-xs">🍔</span>
        <span className="absolute bottom-2.5 end-3 text-xs sm:text-sm drop-shadow-xs">☕</span>
      </div>

      {/* Subtle radial inner glow */}
      <div className="absolute inset-0 bg-radial from-amber-400/10 via-transparent to-black/30 pointer-events-none" />

      {/* Centered WeshNakul Official Emblem */}
      <div className="relative z-10 flex items-center justify-center p-3 sm:p-4 rounded-2xl bg-[#FFE4C4]/15 backdrop-blur-[1px] border border-[#FFE4C4]/40 shadow-inner">
        <div className="relative flex items-center justify-center w-14 sm:w-16 h-12 sm:h-14">
          {/* Yellow Pizza Card */}
          <div className="absolute w-8 sm:w-9 h-10 sm:h-11 bg-[#FFD75A] rounded-xl transform -rotate-12 -translate-x-3.5 sm:-translate-x-4 shadow-md border border-[#241B18]/15 flex items-center justify-center text-sm sm:text-base">
            🍕
          </div>
          {/* Green Burger Card */}
          <div className="absolute w-8 sm:w-9 h-10 sm:h-11 bg-[#55B96A] rounded-xl transform rotate-12 translate-x-3.5 sm:translate-x-4 shadow-md border border-[#241B18]/15 flex items-center justify-center text-sm sm:text-base">
            🍔
          </div>
          {/* Red 3D Arabic Question Mark */}
          <div className="relative z-10 text-[#F0443E] font-black text-3xl sm:text-4xl filter drop-shadow-[0_2px_4px_rgba(240,68,62,0.4)] leading-none select-none">
            ؟
          </div>
        </div>
      </div>
    </div>
  );
};
