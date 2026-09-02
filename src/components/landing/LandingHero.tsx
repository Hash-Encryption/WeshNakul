import React from 'react';
import { motion } from 'motion/react';
import { useLocale } from '../../context/LocaleContext';
import { LanguageToggle } from '../common/LanguageToggle';
import { TactileButton } from '../common/TactileButton';
import { SparkleRays, DoodleHeart, DoodleSquiggle } from '../common/DecorativeSparkles';

interface LandingHeroProps {
  onStartGroup: () => void;
  onEnterCode: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartGroup,
  onEnterCode,
}) => {
  const { t } = useLocale();

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[92dvh] px-6 py-4 w-full">
      {/* Top Bar with Language Toggle */}
      <div className="w-full flex items-center justify-between pt-2">
        <LanguageToggle />
        <div className="text-xs text-brand-gray font-medium opacity-70">
          9:41
        </div>
      </div>

      {/* Center Artwork & Copy */}
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-sm my-auto">
        {/* Playful Floating Artwork Container */}
        <div className="relative w-52 h-44 flex items-center justify-center mb-6">
          {/* Decorative Sparkles & Doodles around artwork */}
          <SparkleRays className="absolute -top-1 -right-2 transform rotate-12" color="#FFD75A" />
          <SparkleRays className="absolute -top-3 -left-4 transform -rotate-45 scale-75" color="#FFD75A" />
          <DoodleHeart className="absolute top-12 -right-6 transform rotate-12" color="#55B96A" />
          <DoodleSquiggle className="absolute top-10 -left-6 transform -rotate-12" color="#F0443E" />

          {/* Yellow Pizza Card */}
          <motion.div
            initial={{ rotate: -15, y: 10, opacity: 0 }}
            animate={{ rotate: -14, y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute w-24 h-32 bg-[#FFD75A] rounded-2xl shadow-md border-2 border-white/60 flex flex-col items-center justify-center p-2 transform -translate-x-10"
          >
            <span className="text-4xl filter drop-shadow-sm">🍕</span>
          </motion.div>

          {/* Green Burger Card */}
          <motion.div
            initial={{ rotate: 15, y: 10, opacity: 0 }}
            animate={{ rotate: 14, y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute w-24 h-32 bg-[#55B96A] rounded-2xl shadow-md border-2 border-white/60 flex flex-col items-center justify-center p-2 transform translate-x-10"
          >
            <span className="text-4xl filter drop-shadow-sm">🍔</span>
          </motion.div>

          {/* Big 3D Red Arabic Question Mark */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
            className="relative z-10 flex flex-col items-center justify-center filter drop-shadow-[0_8px_16px_rgba(240,68,62,0.4)]"
          >
            {/* 3D Custom Rendered Arabic Question Mark */}
            <div className="relative font-alexandria font-extrabold text-7xl text-brand-red leading-none select-none tracking-tight">
              ؟
              {/* Highlight sheen */}
              <span
                className="absolute inset-0 text-white/30 font-extrabold text-7xl leading-none select-none pointer-events-none"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 35%)' }}
              >
                ؟
              </span>
            </div>
          </motion.div>
        </div>

        {/* Main Headings */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="text-center w-full"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mb-2.5 font-alexandria tracking-tight">
            {t('landing.title')}
          </h1>
          <p className="text-brand-gray text-base sm:text-lg font-medium">
            {t('landing.subtitle')}
          </p>
        </motion.div>
      </div>

      {/* Bottom Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="w-full max-w-sm flex flex-col gap-3.5 pb-2"
      >
        {/* Start Group CTA */}
        <TactileButton
          onClick={onStartGroup}
          variant="primary"
          fullWidth
          size="lg"
          icon="👥"
        >
          {t('landing.createGroup')}
        </TactileButton>

        {/* Enter Code CTA */}
        <TactileButton
          onClick={onEnterCode}
          variant="secondary"
          fullWidth
          size="lg"
          icon="🔑"
        >
          {t('landing.enterCode')}
        </TactileButton>

        {/* Landing Badge & Doodles */}
        <div className="relative flex items-center justify-center mt-2 px-2">
          <DoodleHeart className="absolute -left-2 top-0 transform -rotate-12" color="#55B96A" />
          <SparkleRays className="absolute -right-2 top-0 transform rotate-45 scale-75" color="#FFD75A" />
          
          <div className="flex items-center gap-1.5 text-xs text-brand-gray/90 font-semibold bg-white/40 px-3 py-1.5 rounded-full border border-brand-border/40">
            <span>بدون تسجيل</span>
            <span className="text-brand-red text-xs">•</span>
            <span>سريع</span>
            <span className="text-brand-green text-xs">•</span>
            <span>مناسب للقروبات</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
