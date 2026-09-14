import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useLocale } from '../../context/LocaleContext';
import type { Participant } from '../../types/database';

interface DecisionMachineLoadingProps {
  participants?: Participant[];
  currentStep?: 1 | 2 | 3;
  title?: string;
  subtitle?: string;
  tipText?: string;
}

const DEFAULT_AVATAR_COLORS = ['#FFB3BA', '#FFE494', '#D7BDE2', '#A3E4D7', '#AED6F1', '#FAD7A0'];
const DEFAULT_INITIALS_AR = ['ع', 'ن', 'م', 'س', 'خ'];
const DEFAULT_INITIALS_EN = ['A', 'N', 'M', 'S', 'K'];

const TIPS_AR = [
  'الخيارات الجيدة تصنع قرارات ألذ',
  'الجوع كافر، والخوارزمية شغالة تراضي الكل!',
  'سر الاختيار الناجح: بطن شبعان وبال رايق',
  'أصوات القروب بأمان في الغرفة السرية'
];

const TIPS_EN = [
  'Good choices make tastier decisions',
  'Hungry squad? The algorithm is crunching the cravings!',
  'The secret to happiness: a full belly and happy friends',
  'Squad votes are locked tight in the secret chamber'
];

export const DecisionMachineLoading: React.FC<DecisionMachineLoadingProps> = ({
  participants = [],
  currentStep = 2,
  title,
  subtitle,
  tipText,
}) => {
  const { locale } = useLocale();
  const isRTL = locale === 'ar';
  const reduceMotion = useReducedMotion();

  const [tipIndex, setTipIndex] = useState(0);
  const tips = isRTL ? TIPS_AR : TIPS_EN;

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [tips.length]);

  // Derive top participant bubbles
  const displayParticipants = participants.length > 0
    ? participants.slice(0, 5).map((p, idx) => ({
        initial: (p.nickname || '?').trim().charAt(0).toUpperCase(),
        color: DEFAULT_AVATAR_COLORS[idx % DEFAULT_AVATAR_COLORS.length],
      }))
    : (isRTL ? DEFAULT_INITIALS_AR : DEFAULT_INITIALS_EN).map((initial, idx) => ({
        initial,
        color: DEFAULT_AVATAR_COLORS[idx % DEFAULT_AVATAR_COLORS.length],
      }));

  const activeTip = tipText || tips[tipIndex];

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[92dvh] w-full max-w-sm mx-auto px-4 py-2 select-none overflow-hidden font-alexandria">
      {/* 1. Header with WeshNakul Logo Mark & Slogan */}
      <div className="w-full flex items-center justify-between pt-1 pb-2">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Canonical WeshNakul Logo Mark */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center w-8 h-8">
                <div className="absolute w-4 h-5 bg-[#FFD75A] rounded-md transform -rotate-12 -translate-x-1.5 shadow-2xs border border-black/5 flex items-center justify-center text-[10px]">
                  🍕
                </div>
                <div className="absolute w-4 h-5 bg-[#55B96A] rounded-md transform rotate-12 translate-x-1.5 shadow-2xs border border-black/5 flex items-center justify-center text-[10px]">
                  🍔
                </div>
                <div className="relative z-10 text-brand-red font-bold text-lg filter drop-shadow-[0_1px_2px_rgba(240,68,62,0.35)] leading-none select-none font-alexandria">
                  ؟
                </div>
              </div>
              <span className="text-2xl font-black text-brand-red tracking-tight leading-none drop-shadow-[0_2px_4px_rgba(240,68,62,0.2)]">
                {isRTL ? 'وش نطلب؟' : 'WeshNakul?'}
              </span>
            </div>
            <p className="text-[10px] font-bold text-brand-gray/80 mt-0.5">
              {isRTL ? 'القرار ألذ مع المجموعة' : 'Group decisions made delicious'}
            </p>
          </div>
        </div>

        {/* Squad Count Pill */}
        <div className="absolute top-3 end-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEFEF] border border-[#F0443E]/20 text-brand-red text-xs font-black shadow-xs">
          <span className="text-xs">👥</span>
          <span>{Math.max(participants.length, 5)}</span>
        </div>
      </div>

      {/* 2. Headline & Subtitle */}
      <div className="text-center my-1 z-10">
        <h2 className="text-2xl sm:text-3xl font-black text-[#241B18] tracking-tight flex items-center justify-center gap-1">
          <span>{title || (isRTL ? 'نجمع اختياراتكم' : 'Gathering your picks')}</span>
          <span className="text-brand-red tracking-widest animate-pulse">...</span>
        </h2>
        <p className="text-xs sm:text-sm font-bold text-brand-gray mt-1 max-w-[280px] mx-auto leading-relaxed">
          {subtitle || (isRTL
            ? 'نحلّل اختيارات المجموعة ونجهّز القرار النهائي'
            : 'Analyzing squad tastes to prepare the final consensus')}
        </p>
      </div>

      {/* 3. Participant Initial Bubbles with Curved Pastel Streams */}
      <div className="relative w-full max-w-[340px] flex flex-col items-center mt-1">
        {/* Top Bubbles Row */}
        <div className="flex items-center justify-between w-full px-2 z-20">
          {displayParticipants.map((item, idx) => (
            <motion.div
              key={`bubble-${idx}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.08 }}
              className="w-10 h-10 rounded-full border-2 border-[#241B18] flex items-center justify-center font-black text-sm text-[#241B18] shadow-[0_3px_0_#241B18] relative"
              style={{ backgroundColor: item.color }}
            >
              {item.initial}
            </motion.div>
          ))}
        </div>

        {/* Floating Category Cards with gentle tilt */}
        <div className="flex items-center justify-between w-full px-1 my-2 z-20">
          {/* Card 1: Burger */}
          <motion.div
            animate={reduceMotion ? {} : { y: [-2, 2, -2] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-14 h-16 rounded-xl bg-[#FFF9D2] border-2 border-[#241B18] shadow-[0_3px_0_#241B18] flex flex-col items-center justify-center p-1 transform -rotate-6"
          >
            <span className="text-xl">🍔</span>
            <span className="text-[10px] font-black text-[#241B18]">{isRTL ? 'برجر' : 'Burger'}</span>
          </motion.div>

          {/* Card 2: Pizza */}
          <motion.div
            animate={reduceMotion ? {} : { y: [2, -2, 2] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            className="w-14 h-16 rounded-xl bg-[#FFE2D4] border-2 border-[#241B18] shadow-[0_3px_0_#241B18] flex flex-col items-center justify-center p-1 transform -rotate-2"
          >
            <span className="text-xl">🍕</span>
            <span className="text-[10px] font-black text-[#241B18]">{isRTL ? 'بيتزا' : 'Pizza'}</span>
          </motion.div>

          {/* Card 3: Shawarma */}
          <motion.div
            animate={reduceMotion ? {} : { y: [-2, 2, -2] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="w-14 h-16 rounded-xl bg-[#FFECCC] border-2 border-[#241B18] shadow-[0_3px_0_#241B18] flex flex-col items-center justify-center p-1 transform rotate-2"
          >
            <span className="text-xl">🌯</span>
            <span className="text-[10px] font-black text-[#241B18]">{isRTL ? 'شاورما' : 'Shawarma'}</span>
          </motion.div>

          {/* Card 4: Anything */}
          <motion.div
            animate={reduceMotion ? {} : { y: [2, -2, 2] }}
            transition={{ duration: 2.3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            className="w-14 h-16 rounded-xl bg-[#D6F5DB] border-2 border-[#241B18] shadow-[0_3px_0_#241B18] flex flex-col items-center justify-center p-1 transform rotate-6"
          >
            <span className="text-xl">🎲</span>
            <span className="text-[9px] font-black text-[#241B18]">{isRTL ? 'أي شيء' : 'Anything'}</span>
          </motion.div>
        </div>

        {/* 4. The 2.5D Retro-Futuristic Decision Machine */}
        <div className="relative w-full max-w-[310px] mt-1 z-20">
          {/* Top Arched Sign */}
          <div className="mx-auto w-36 py-1 px-2.5 bg-brand-red border-2 border-[#241B18] rounded-t-xl text-center text-white text-[11px] font-black flex items-center justify-center gap-1.5 shadow-[0_2px_0_#241B18] -mb-1 relative z-30">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-ping" />
            <span>{isRTL ? '...جاري التحليل' : 'Analyzing...'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-ping" />
          </div>

          {/* Machine Outer Shell */}
          <div className="relative w-full bg-[#FFFDF9] border-[3px] border-[#241B18] rounded-3xl p-3.5 shadow-[0_8px_0_#241B18] flex flex-col items-center overflow-hidden">
            {/* Left Ear Handle */}
            <div className="absolute -start-3.5 top-1/2 -translate-y-1/2 w-4 h-16 bg-brand-red border-2 border-[#241B18] rounded-s-xl flex items-center justify-center shadow-sm">
              <div className="w-1.5 h-8 rounded-full bg-brand-yellow/90 animate-pulse shadow-[0_0_8px_#FFD75A]" />
            </div>

            {/* Right Ear Handle */}
            <div className="absolute -end-3.5 top-1/2 -translate-y-1/2 w-4 h-16 bg-brand-red border-2 border-[#241B18] rounded-e-xl flex items-center justify-center shadow-sm">
              <div className="w-1.5 h-8 rounded-full bg-brand-yellow/90 animate-pulse shadow-[0_0_8px_#FFD75A]" />
            </div>

            {/* Glowing Amber Chamber / Viewport */}
            <div className="relative w-full h-32 rounded-2xl border-2 border-[#D4A373] bg-gradient-to-b from-[#FFF5E6] via-[#FFE8C2] to-[#FFD599] shadow-inner overflow-hidden flex items-center justify-center">
              {/* Swirling Vortex Glow */}
              <div
                className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400 via-orange-300 to-transparent"
                style={{
                  animation: reduceMotion ? 'none' : 'spin 8s linear infinite',
                }}
              />

              {/* Inside floating particles / icons */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Center orbiting participant circles */}
                {displayParticipants.slice(0, 4).map((p, i) => (
                  <motion.div
                    key={`vortex-p-${i}`}
                    animate={
                      reduceMotion
                        ? {}
                        : {
                            x: [Math.cos(i * 1.57) * 28, Math.cos(i * 1.57 + Math.PI) * 28, Math.cos(i * 1.57) * 28],
                            y: [Math.sin(i * 1.57) * 22, Math.sin(i * 1.57 + Math.PI) * 22, Math.sin(i * 1.57) * 22],
                          }
                    }
                    transition={{ duration: 3.5 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-7 h-7 rounded-full border border-[#241B18] text-[10px] font-black flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.initial}
                  </motion.div>
                ))}

                {/* Floating food icons inside chamber */}
                <motion.span
                  animate={reduceMotion ? {} : { rotate: 360, y: [-4, 4, -4] }}
                  transition={{ rotate: { duration: 12, repeat: Infinity, ease: 'linear' }, y: { duration: 2, repeat: Infinity } }}
                  className="absolute text-xl top-3 start-4 filter drop-shadow-sm"
                >
                  🍕
                </motion.span>
                <motion.span
                  animate={reduceMotion ? {} : { rotate: -360, y: [4, -4, 4] }}
                  transition={{ rotate: { duration: 14, repeat: Infinity, ease: 'linear' }, y: { duration: 2.2, repeat: Infinity } }}
                  className="absolute text-xl bottom-3 end-4 filter drop-shadow-sm"
                >
                  🌯
                </motion.span>
                <motion.span
                  animate={reduceMotion ? {} : { scale: [0.9, 1.1, 0.9] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute text-lg bottom-2 start-6 filter drop-shadow-sm"
                >
                  🍔
                </motion.span>
                <motion.span
                  animate={reduceMotion ? {} : { rotate: 180 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="absolute text-base top-2 end-6 filter drop-shadow-sm"
                >
                  🎲
                </motion.span>
              </div>
            </div>

            {/* Bottom Base Grill & Brand Stamp */}
            <div className="w-full mt-2.5 pt-2 border-t-2 border-[#241B18]/10 flex items-center justify-between px-1">
              {/* Canonical WeshNakul Logo Stamp */}
              <div className="flex items-center gap-1.5">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <div className="absolute w-2.5 h-3 bg-[#FFD75A] rounded-2xs transform -rotate-12 -translate-x-1 shadow-2xs flex items-center justify-center text-[7px]">
                    🍕
                  </div>
                  <div className="absolute w-2.5 h-3 bg-[#55B96A] rounded-2xs transform rotate-12 translate-x-1 shadow-2xs flex items-center justify-center text-[7px]">
                    🍔
                  </div>
                  <div className="relative z-10 text-brand-red font-bold text-xs leading-none select-none font-alexandria">
                    ؟
                  </div>
                </div>
                <span className="text-xs font-black text-brand-red">{isRTL ? 'وش نطلب؟' : 'WeshNakul?'}</span>
              </div>

              {/* Grill with 6 scanning amber LEDs */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#241B18] border border-[#241B18]">
                {[0, 1, 2, 3, 4, 5].map((led) => (
                  <motion.div
                    key={`led-${led}`}
                    animate={
                      reduceMotion
                        ? {}
                        : {
                            backgroundColor: ['#4A3728', '#FFD75A', '#4A3728'],
                            boxShadow: [
                              'none',
                              '0 0 6px rgba(255, 215, 90, 0.8)',
                              'none',
                            ],
                          }
                    }
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: led * 0.18,
                      ease: 'easeInOut',
                    }}
                    className="w-1.5 h-3.5 rounded-full bg-[#FFD75A]"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Three-Step Progress Stepper */}
      <div className="w-full max-w-[320px] my-3 z-10">
        <div className="relative flex items-center justify-between">
          {/* Step 1: Gathering */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-7 h-7 rounded-full border-2 border-[#241B18] flex items-center justify-center text-xs font-black shadow-xs ${
                currentStep >= 1 ? 'bg-brand-red text-white' : 'bg-white text-[#241B18]'
              }`}
            >
              ✓
            </div>
            <span className="text-[10px] font-black text-[#241B18] text-center leading-tight">
              {isRTL ? 'جمعنا' : 'Tastes'}
              <br />
              {isRTL ? 'اختياراتكم' : 'Gathered'}
            </span>
          </div>

          {/* Line 1 */}
          <div className="flex-1 h-1 bg-[#241B18] -mx-1 -mt-4 z-0" />

          {/* Step 2: Simulating / Matching */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-8 h-8 rounded-full border-2 border-[#241B18] flex items-center justify-center text-xs font-black shadow-xs animate-pulse ${
                currentStep >= 2 ? 'bg-brand-red text-white ring-4 ring-brand-red/20' : 'bg-white text-[#241B18]'
              }`}
            >
              •••
            </div>
            <span className="text-[10px] font-black text-brand-red text-center leading-tight">
              {isRTL ? 'نطابق' : 'Simulating'}
              <br />
              {isRTL ? 'الخيارات المناسبة' : 'Cravings'}
            </span>
          </div>

          {/* Line 2 */}
          <div className="flex-1 h-1 bg-[#241B18]/20 -mx-1 -mt-4 z-0" />

          {/* Step 3: Preparing result */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div
              className={`w-7 h-7 rounded-full border-2 border-[#241B18]/40 flex items-center justify-center text-xs font-black ${
                currentStep >= 3 ? 'bg-brand-red text-white' : 'bg-[#E5E0DA] text-[#7A6E67]'
              }`}
            >
              {currentStep >= 3 ? '✓' : '○'}
            </div>
            <span className="text-[10px] font-bold text-[#7A6E67] text-center leading-tight">
              {isRTL ? 'نجهز النتيجة' : 'Finding'}
              <br />
              {isRTL ? 'قريباً...' : 'Consensus...'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Bottom Tip Card */}
      <div className="w-full max-w-[320px] mb-2 z-10">
        <motion.div
          key={activeTip}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full py-2 px-3 rounded-2xl bg-[#FFF0EB] border border-[#241B18]/15 flex items-center justify-between gap-2 shadow-xs"
        >
          <span className="text-base">💡</span>
          <p className="text-[11px] font-bold text-[#241B18] text-center flex-1 leading-snug">
            {activeTip}
          </p>
          <span className="text-sm text-brand-red">❤️</span>
        </motion.div>
      </div>
    </div>
  );
};
