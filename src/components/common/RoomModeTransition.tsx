import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import type { RoomMode } from '../../types/database';

const MODE_ICONS: Record<RoomMode, string> = {
  food: '🍽️',
  breakfast: '🍳',
  cafes: '☕',
};

export const RoomModeTransition: React.FC = () => {
  const { modeTransition } = useRoom();
  const { t } = useLocale();

  if (!modeTransition?.active) return null;

  const targetMode = modeTransition.toMode;
  const icon = MODE_ICONS[targetMode] || '🍽️';

  return (
    <AnimatePresence>
      <div
        data-testid="mode-transition-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs pointer-events-none p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white dark:bg-stone-900 rounded-3xl border-3 border-brand-ink shadow-[0_12px_0_#241B18] text-center max-w-xs sm:max-w-sm w-full mx-auto"
        >
          <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-stone-800 border-2 border-brand-ink flex items-center justify-center text-4xl mb-4 shadow-[0_4px_0_#241B18]">
            <span>{icon}</span>
          </div>

          <span className="text-xs uppercase tracking-widest font-black text-brand-red mb-1 font-alexandria">
            {t('modes.transitionNotice')}
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-brand-ink dark:text-white font-cairo">
            {t(`modes.${targetMode}.title`)}
          </h2>

          <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 font-alexandria">
            {t(`modes.${targetMode}.desc`)}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
