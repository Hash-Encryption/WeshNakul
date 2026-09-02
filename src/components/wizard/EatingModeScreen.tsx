import React, { useState } from 'react';
import { motion } from 'motion/react';
import type { EatingMode } from '../../types/database';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { SparkleRays, DoodleHeart } from '../common/DecorativeSparkles';

interface EatingModeScreenProps {
  onNext: (mode: EatingMode) => void;
  onBack: () => void;
  initialMode?: EatingMode;
}

export const EatingModeScreen: React.FC<EatingModeScreenProps> = ({
  onNext,
  onBack,
  initialMode = 'delivery',
}) => {
  const { t } = useLocale();
  const [selectedMode, setSelectedMode] = useState<EatingMode>(initialMode);

  const options: { mode: EatingMode; label: string; icon: string; desc?: string }[] = [
    {
      mode: 'delivery',
      label: t('mode.delivery'),
      icon: '🏠',
    },
    {
      mode: 'dine_in',
      label: t('mode.dineIn'),
      icon: '🍽️',
    },
    {
      mode: 'any',
      label: t('mode.flexible'),
      icon: '🤷',
    },
  ];

  const handleSelect = (mode: EatingMode) => {
    setSelectedMode(mode);
  };

  const handleProceed = () => {
    if (selectedMode) {
      onNext(selectedMode);
    }
  };

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-6">
      {/* Header */}
      <div>
        <Header onBack={onBack} participantCount={1} showCount={true} />

        {/* Heading and Subtitle */}
        <div className="text-center mt-3 mb-6 px-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mb-1.5 font-alexandria tracking-tight">
            {t('mode.heading')}
          </h2>
          <p className="text-brand-gray text-sm sm:text-base font-medium">
            {t('mode.subtitle')}
          </p>
        </div>

        {/* Selection Cards */}
        <div className="relative flex flex-col gap-3.5 max-w-sm mx-auto">
          {/* Decorative Doodles on background */}
          <DoodleHeart className="absolute -bottom-4 -left-4 transform rotate-12" color="#55B96A" />
          <SparkleRays className="absolute -top-3 -right-3 transform rotate-45 scale-75" color="#FFD75A" />

          {options.map((opt) => {
            const isSelected = selectedMode === opt.mode;

            return (
              <motion.button
                key={opt.mode}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(opt.mode)}
                type="button"
                className={`
                  relative flex flex-col items-center justify-center py-5 px-6 rounded-3xl
                  transition-all duration-200 cursor-pointer text-center w-full
                  ${
                    isSelected
                      ? 'bg-brand-redSoft border-2 border-brand-red shadow-md'
                      : 'bg-white border-2 border-brand-border/60 hover:border-brand-border shadow-sm'
                  }
                `}
              >
                {/* Selected Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-3.5 start-3.5 w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    ✓
                  </div>
                )}

                {/* Big Visual Icon */}
                <div className="text-4xl mb-2 filter drop-shadow-sm select-none">
                  {opt.icon}
                </div>

                {/* Card Title */}
                <span
                  className={`text-xl font-bold font-alexandria ${
                    isSelected ? 'text-brand-ink' : 'text-brand-ink/90'
                  }`}
                >
                  {opt.label.replace(/^[^\s]+\s*/, '') /* Render clean title text */}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom Sticky Action */}
      <div className="relative max-w-sm w-full mx-auto mt-6 pt-2">
        <SparkleRays className="absolute top-0 end-1 transform rotate-12 scale-75" color="#FFD75A" />
        <SparkleRays className="absolute bottom-2 start-1 transform -rotate-12 scale-75" color="#FFD75A" />

        <TactileButton
          onClick={handleProceed}
          variant="primary"
          fullWidth
          size="lg"
        >
          {t('mode.next')}
        </TactileButton>
      </div>
    </div>
  );
};
