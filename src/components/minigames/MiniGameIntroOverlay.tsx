import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useLocale } from '../../context/LocaleContext';

export type MiniGameIntroId = 'shuffle_cards' | 'sudden_death' | 'emoji_clash';

interface StepItem {
  icon: string;
  badge: string;
  ar: string;
  en: string;
}

interface GameIntroConfig {
  icon: string;
  titleAr: string;
  titleEn: string;
  steps: [StepItem, StepItem, StepItem];
}

const INTRO_CONFIGS: Record<MiniGameIntroId, GameIntroConfig> = {
  shuffle_cards: {
    icon: '🃏',
    titleAr: 'أوراق الحظ',
    titleEn: 'Shuffle Cards',
    steps: [
      {
        icon: '🃏',
        badge: '1️⃣',
        ar: 'اخفِ المطاعم المتعادلة خلف البطاقات',
        en: 'Tied restaurants hide behind cards',
      },
      {
        icon: '🔀',
        badge: '2️⃣',
        ar: 'راقب البطاقات وهي تتخلط بسرعة',
        en: 'Watch the cards shuffle across the table',
      },
      {
        icon: '👆',
        badge: '3️⃣',
        ar: 'اسحب بطاقة واحدة لكشف المطعم الفائز!',
        en: 'Pick 1 card to reveal the winning spot!',
      },
    ],
  },
  sudden_death: {
    icon: '⚡',
    titleAr: 'رأس برأس',
    titleEn: 'Sudden Death',
    steps: [
      {
        icon: '⚔️',
        badge: '1️⃣',
        ar: 'مواجهة حاسمة بين مطعمين في كل جولة',
        en: '2 tied restaurants face off 1v1',
      },
      {
        icon: '⏱️',
        badge: '2️⃣',
        ar: 'صوّت لمطعمك المفضل قبل انتهاء الـ 5 ثوانٍ',
        en: 'Vote for your favorite before 5s runs out',
      },
      {
        icon: '⚡',
        badge: '3️⃣',
        ar: 'عند التعادل: التصويت الأسرع يفوز فوراً!',
        en: 'Tie-breaker: Fastest first vote wins!',
      },
    ],
  },
  emoji_clash: {
    icon: '🥊',
    titleAr: 'حرب الإيموجي',
    titleEn: 'Emoji Clash',
    steps: [
      {
        icon: '🥊',
        badge: '1️⃣',
        ar: 'اختر إيموجي مقاتل ليمثل مطعمك بالحلبة',
        en: 'Pick an emoji fighter to champion a restaurant',
      },
      {
        icon: '🌶️',
        badge: '2️⃣',
        ar: 'اضغط الزر السفلي لرمي الشطة والثوم والنار',
        en: 'Press the bottom button to throw spices & fire',
      },
      {
        icon: '💥',
        badge: '3️⃣',
        ar: 'اضغطوا معاً على قنبلة الخردل لتفجيرها!',
        en: 'Tap the Mustard Bomb together to detonate it!',
      },
    ],
  },
};

interface MiniGameIntroOverlayProps {
  gameId: MiniGameIntroId;
  onComplete: () => void;
  durationMs?: number;
}

export const MiniGameIntroOverlay: React.FC<MiniGameIntroOverlayProps> = ({
  gameId,
  onComplete,
  durationMs = 3500,
}) => {
  const { isRTL } = useLocale();
  const config = INTRO_CONFIGS[gameId];
  const [completed, setCompleted] = useState(false);

  const handleFinish = () => {
    if (completed) return;
    setCompleted(true);
    onComplete();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir={isRTL ? 'rtl' : 'ltr'}
      className="absolute inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-fade-in"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-[360px] bg-gradient-to-b from-[#18132B]/95 via-[#120E22]/95 to-[#0A0814]/95 text-white rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-4 sm:p-5 flex flex-col gap-3.5 overflow-hidden"
      >
        {/* Top bar: Glowing badge & Skip button */}
        <div className="flex items-center justify-between w-full">
          {/* Glowing HOW TO PLAY badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/50 text-amber-300 font-alexandria font-black text-[10px] tracking-wider uppercase shadow-[0_0_12px_rgba(251,191,36,0.35)]">
            <span>💡</span>
            <span>{isRTL ? 'كيف تلعب؟' : 'HOW TO PLAY'}</span>
          </div>

          {/* Skip button */}
          <button
            type="button"
            onClick={handleFinish}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-alexandria font-bold text-[11px] border border-white/20 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <span>{isRTL ? 'تخطي' : 'Skip'}</span>
            <span>⚡</span>
          </button>
        </div>

        {/* Game Icon & Title */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-white/15 flex items-center justify-center text-2xl shadow-inner shrink-0">
            {config.icon}
          </div>
          <div className="flex flex-col text-start">
            <h3 className="font-alexandria font-black text-base sm:text-lg text-white leading-tight">
              {isRTL ? config.titleAr : config.titleEn}
            </h3>
            <span className="font-alexandria font-semibold text-xs text-amber-300/80 leading-tight">
              {isRTL ? config.titleEn : config.titleAr}
            </span>
          </div>
        </div>

        {/* 3 Step Rows */}
        <div className="flex flex-col gap-2 w-full">
          {config.steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * (idx + 1), duration: 0.2 }}
              className="flex items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-white/[0.06] border border-white/10 text-start"
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-base shrink-0 shadow-xs">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black font-alexandria text-amber-400 bg-amber-400/15 px-1.5 py-0.5 rounded-md leading-none">
                    {step.badge}
                  </span>
                  <span className="font-alexandria font-bold text-xs text-white leading-snug">
                    {isRTL ? step.ar : step.en}
                  </span>
                </div>
                <span className="block font-alexandria text-[10px] text-white/55 leading-tight mt-0.5 truncate">
                  {isRTL ? step.en : step.ar}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Auto-Advance Progress Bar at Bottom */}
        <div className="w-full pt-1 flex flex-col gap-1.5">
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: durationMs / 1000, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-[#F0443E]"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
