import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { RoomMode } from '../../types/database';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { SparkleRays, DoodleHeart } from '../common/DecorativeSparkles';

interface StartingModeScreenProps {
  onNext: (mode: RoomMode) => void;
  onBack: () => void;
  initialMode?: RoomMode;
}

export const StartingModeScreen: React.FC<StartingModeScreenProps> = ({
  onNext,
  onBack,
  initialMode = 'food',
}) => {
  const { t } = useLocale();
  const [selectedMode, setSelectedMode] = useState<RoomMode>(
    initialMode === 'healthy' || initialMode === 'cafes' ? initialMode : 'food'
  );

  const handleProceed = () => {
    if (selectedMode) {
      onNext(selectedMode);
    }
  };

  const isFood = selectedMode === 'food';
  const isHealthy = selectedMode === 'healthy';
  const isCafes = selectedMode === 'cafes';

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-6">
      {/* Top Header */}
      <div>
        <Header onBack={onBack} participantCount={1} showCount={true} />

        {/* Headline and Subtitle */}
        <div className="text-center mt-3 mb-6 px-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mb-1.5 font-alexandria tracking-tight">
            {t('startingMode.heading')}
          </h2>
          <p className="text-brand-gray text-sm sm:text-base font-medium">
            {t('startingMode.subtitle')}
          </p>
        </div>

        {/* Asymmetric Mode Cards Layout */}
        <div className="relative flex flex-col gap-3.5 max-w-sm mx-auto">
          {/* Subtle Decorative Doodles */}
          <DoodleHeart className="absolute -bottom-5 -left-4 transform rotate-12 pointer-events-none" color="#55B96A" />
          <SparkleRays className="absolute -top-3 -right-3 transform rotate-45 scale-75 pointer-events-none" color="#FFD75A" />

          {/* MAIN OPTION: FOOD (Full-width, large dominant card) */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMode('food')}
            type="button"
            className={`
              relative flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl
              transition-all duration-200 cursor-pointer text-center w-full
              ${
                isFood
                  ? 'bg-brand-redSoft border-2 border-brand-red shadow-[0_4px_0_#F0443E]'
                  : 'bg-white border-2 border-brand-border/70 hover:border-brand-border shadow-[0_2px_0_#E5D3B3]'
              }
            `}
          >
            {/* Selected Checkmark Badge */}
            {isFood && (
              <div className="absolute top-3.5 start-3.5 w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-bold shadow-sm">
                ✓
              </div>
            )}

            {/* Energetic Mixed-Food Cluster: Burger + Pizza + Fries */}
            <div className="relative mb-3 flex items-center justify-center select-none py-1">
              <div className="flex items-center justify-center gap-2 bg-[#FFF4E5] border border-amber-300/60 rounded-2xl px-5 py-2.5 shadow-inner">
                <span className="text-2xl sm:text-3xl transform -rotate-12 transition-transform">🍕</span>
                <span className="text-4xl sm:text-5xl transform scale-110 drop-shadow-sm">🍔</span>
                <span className="text-2xl sm:text-3xl transform rotate-12 transition-transform">🍟</span>
              </div>
            </div>

            {/* Title */}
            <span className="text-2xl sm:text-3xl font-extrabold font-alexandria text-brand-ink">
              {t('startingMode.food')}
            </span>
          </motion.button>

          {/* SECONDARY ROW: HEALTHY + CAFES (Side-by-side) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-3.5 w-full [direction:ltr]">
            {/* HEALTHY (Left card) */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode('healthy')}
              type="button"
              className={`
                relative flex flex-col items-center justify-center py-4 px-3 sm:py-5 sm:px-4 rounded-2xl sm:rounded-3xl
                transition-all duration-200 cursor-pointer text-center w-full
                ${
                  isHealthy
                    ? 'bg-brand-redSoft border-2 border-brand-red shadow-[0_3px_0_#F0443E]'
                    : 'bg-white border-2 border-brand-border/70 hover:border-brand-border shadow-[0_2px_0_#E5D3B3]'
                }
              `}
            >
              {/* Selected Checkmark Badge */}
              {isHealthy && (
                <div className="absolute top-2.5 start-2.5 w-5 h-5 rounded-full bg-brand-red text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                  ✓
                </div>
              )}

              {/* Fresh Salad Bowl Illustration */}
              <div className="relative mb-2 flex items-center justify-center select-none py-0.5">
                <div className="flex items-center justify-center gap-1.5 bg-[#EDF9F0] border border-emerald-300/60 rounded-2xl px-3.5 py-2 shadow-inner">
                  <span className="text-3xl sm:text-4xl drop-shadow-sm">🥗</span>
                  <span className="text-lg sm:text-xl transform -rotate-6">🥑</span>
                </div>
              </div>

              {/* Title */}
              <span className="text-lg sm:text-xl font-bold font-alexandria text-brand-ink">
                {t('startingMode.healthy')}
              </span>
            </motion.button>

            {/* CAFES (Right card) */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode('cafes')}
              type="button"
              className={`
                relative flex flex-col items-center justify-center py-4 px-3 sm:py-5 sm:px-4 rounded-2xl sm:rounded-3xl
                transition-all duration-200 cursor-pointer text-center w-full
                ${
                  isCafes
                    ? 'bg-brand-redSoft border-2 border-brand-red shadow-[0_3px_0_#F0443E]'
                    : 'bg-white border-2 border-brand-border/70 hover:border-brand-border shadow-[0_2px_0_#E5D3B3]'
                }
              `}
            >
              {/* Selected Checkmark Badge */}
              {isCafes && (
                <div className="absolute top-2.5 start-2.5 w-5 h-5 rounded-full bg-brand-red text-white flex items-center justify-center text-[11px] font-bold shadow-sm">
                  ✓
                </div>
              )}

              {/* Cozy Coffee + Croissant Illustration */}
              <div className="relative mb-2 flex items-center justify-center select-none py-0.5">
                <div className="flex items-center justify-center gap-1.5 bg-[#FFF8EB] border border-amber-300/60 rounded-2xl px-3.5 py-2 shadow-inner">
                  <span className="text-3xl sm:text-4xl drop-shadow-sm">☕</span>
                  <span className="text-lg sm:text-xl transform rotate-12">🥐</span>
                </div>
              </div>

              {/* Title */}
              <span className="text-lg sm:text-xl font-bold font-alexandria text-brand-ink">
                {t('startingMode.cafes')}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action: Red Next CTA */}
      <div className="relative max-w-sm w-full mx-auto mt-6 pt-2">
        <SparkleRays className="absolute top-0 end-1 transform rotate-12 scale-75 pointer-events-none" color="#FFD75A" />
        <SparkleRays className="absolute bottom-2 start-1 transform -rotate-12 scale-75 pointer-events-none" color="#FFD75A" />

        <TactileButton
          onClick={handleProceed}
          variant="primary"
          fullWidth
          size="lg"
        >
          {t('startingMode.next')}
        </TactileButton>
      </div>
    </div>
  );
};
