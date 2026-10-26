import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocale } from '../../context/LocaleContext';
import { isHapticsMuted, setHapticsMuted, playTactilePop, triggerHaptic } from '../../lib/haptics';

export interface MiniGameSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onLeaveGame: () => void;
  gameTitle?: string;
  gameTitleAr?: string;
  ruleReminder?: string;
  ruleReminderAr?: string;
}

export const MiniGameSettingsPopover: React.FC<MiniGameSettingsPopoverProps> = ({
  isOpen,
  onClose,
  onLeaveGame,
  gameTitle = 'Mini Game',
  gameTitleAr = 'لعبة الحسم',
  ruleReminder = 'Battle it out with your squad to break the tie!',
  ruleReminderAr = 'تحدَّ أعضاء القروب في مواجهة سريعة لحسم التعادل!',
}) => {
  const { locale } = useLocale();
  const [soundEnabled, setSoundEnabled] = useState(() => !isHapticsMuted());
  const [showRules, setShowRules] = useState(false);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setHapticsMuted(!next);
    if (next) {
      playTactilePop(220);
      triggerHaptic(12);
    }
  };

  const handleBackToGame = () => {
    playTactilePop(180);
    triggerHaptic(10);
    onClose();
  };

  const handleLeave = () => {
    playTactilePop(150);
    triggerHaptic(14);
    onLeaveGame();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none animate-fade-in"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full max-w-xs bg-[#1E192B] text-white rounded-3xl border-2 border-white/20 shadow-[0_16px_40px_rgba(0,0,0,0.85)] p-4 flex flex-col gap-3"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">⚙️</span>
                <span className="font-alexandria font-black text-sm text-white">
                  {locale === 'ar' ? 'إعدادات اللعبة' : 'Game Settings'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleBackToGame}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white flex items-center justify-center text-xs font-black transition-all cursor-pointer"
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>

            {/* Game Tag */}
            <div className="text-center px-1">
              <span className="text-[11px] font-bold text-amber-300 font-alexandria">
                {locale === 'ar' ? gameTitleAr : gameTitle}
              </span>
            </div>

            {/* 1. Sound & Haptics Toggle */}
            <button
              type="button"
              onClick={handleToggleSound}
              className={`w-full py-2.5 px-3 rounded-2xl border-2 font-alexandria font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                soundEnabled
                  ? 'bg-[#55B96A]/20 text-[#55B96A] border-[#55B96A]/60 shadow-xs'
                  : 'bg-white/5 text-white/60 border-white/15'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{soundEnabled ? '🔊' : '🔇'}</span>
                <span>
                  {locale === 'ar'
                    ? soundEnabled
                      ? 'الأصوات والاهتزاز: مفعّل'
                      : 'الأصوات والاهتزاز: معطّل'
                    : soundEnabled
                    ? 'Sound & Haptics: ON'
                    : 'Sound & Haptics: OFF'}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black/30">
                {soundEnabled ? (locale === 'ar' ? 'شغال' : 'ON') : (locale === 'ar' ? 'صامت' : 'MUTED')}
              </span>
            </button>

            {/* 2. Compact Rules Reminder */}
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setShowRules((prev) => !prev)}
                className="w-full py-2 px-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white/90 font-alexandria font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span>📖</span>
                  <span>{locale === 'ar' ? 'طريقة اللعب' : 'How to Play'}</span>
                </div>
                <span className="text-xs text-white/50">{showRules ? '▲' : '▼'}</span>
              </button>
              {showRules && (
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-semibold text-white/80 font-alexandria leading-snug">
                  {locale === 'ar' ? ruleReminderAr : ruleReminder}
                </div>
              )}
            </div>

            {/* 3. Back to Game Button */}
            <button
              type="button"
              onClick={handleBackToGame}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0_3px_0_#241B18] active:translate-y-0.5 font-alexandria font-black text-xs sm:text-sm hover:brightness-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <span>▶️</span>
              <span>{locale === 'ar' ? 'متابعة اللعب' : 'Back to Game'}</span>
            </button>

            {/* 4. Leave Mini-Game Button */}
            <button
              type="button"
              onClick={handleLeave}
              className="w-full py-2 px-3 rounded-2xl bg-[#F0443E]/15 hover:bg-[#F0443E]/25 text-[#F0443E] border border-[#F0443E]/40 font-alexandria font-black text-xs active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🚪</span>
              <span>{locale === 'ar' ? 'مغادرة اللعبة' : 'Leave Mini-Game'}</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
