import React from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import type { RestaurantItem } from '../../types/restaurant';
import { useLocale } from '../../context/LocaleContext';

interface SwipeCardProps {
  restaurant: RestaurantItem;
  isFront: boolean;
  onSwipe: (liked: boolean) => void;
  stackIndex?: number; // 0 for front, 1 for second, 2 for third
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  restaurant,
  isFront,
  onSwipe,
  stackIndex = 0,
}) => {
  const { locale, t } = useLocale();

  // Screen-absolute x drag position
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-160, 0, 160], [-18, 0, 18]);

  // Screen-absolute stamp opacity:
  // x >= 40px: Green stamp (Like)
  // x <= -40px: Red stamp (Pass)
  const likeOpacity = useTransform(x, [40, 120], [0, 1]);
  const passOpacity = useTransform(x, [-40, -120], [0, 1]);

  const name = locale === 'ar' ? restaurant.nameAr : restaurant.nameEn;
  const signatureDish = locale === 'ar' ? restaurant.signatureDishAr : restaurant.signatureDishEn;
  const vibeTags = locale === 'ar' ? restaurant.vibeTagsAr : restaurant.vibeTagsEn;

  // Stack styling for cards beneath the front card
  const getStackStyle = () => {
    if (stackIndex === 1) {
      return {
        scale: 0.95,
        y: 12,
        zIndex: 10,
      };
    }
    if (stackIndex >= 2) {
      return {
        scale: 0.9,
        y: 24,
        zIndex: 5,
      };
    }
    return {
      scale: 1,
      y: 0,
      zIndex: 20,
    };
  };

  const stackStyle = getStackStyle();

  return (
    <motion.div
      style={isFront ? { x, rotate, zIndex: 20 } : stackStyle}
      animate={!isFront ? stackStyle : undefined}
      drag={isFront ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={(_e, info) => {
        if (!isFront) return;
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        // Swiping right = Like (يمشي), Swiping left = Pass (تخطي)
        if (offset >= 120 || (offset > 40 && velocity > 450)) {
          onSwipe(true);
        } else if (offset <= -120 || (offset < -40 && velocity < -450)) {
          onSwipe(false);
        }
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`absolute inset-x-0 mx-auto w-full max-w-[360px] bg-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] rounded-3xl overflow-hidden select-none touch-none ${
        isFront ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'
      }`}
    >
      {/* Visual Stamps for interactive front card */}
      {isFront && (
        <>
          {/* Like Stamp (Green) - Swiping Right */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-6 end-6 z-30 pointer-events-none transform rotate-12"
          >
            <div className="bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] rounded-2xl px-4 py-1.5 font-alexandria font-black text-base sm:text-lg flex items-center gap-1.5">
              <span>{t('swiping.stamp_like')}</span>
            </div>
          </motion.div>

          {/* Pass Stamp (Red) - Swiping Left */}
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-6 start-6 z-30 pointer-events-none transform -rotate-12"
          >
            <div className="bg-[#F0443E] text-white border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] rounded-2xl px-4 py-1.5 font-alexandria font-black text-base sm:text-lg flex items-center gap-1.5">
              <span>{t('swiping.stamp_pass')}</span>
            </div>
          </motion.div>
        </>
      )}

      {/* Restaurant Cover Image */}
      <div className="relative h-52 w-full bg-[#FFF8F1] border-b-2 border-[#241B18] overflow-hidden">
        <img
          src={restaurant.imageUrl}
          alt={name}
          className="w-full h-full object-cover pointer-events-none"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Restaurant Content Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Header row: Name, Price, Rating */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-black text-[#241B18] font-alexandria tracking-tight truncate">
            {name}
          </h2>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] px-2 py-0.5 rounded-md text-xs font-black shadow-[0px_1px_0px_#241B18]">
              {restaurant.priceTier}
            </span>
            <span className="bg-white text-[#241B18] border-2 border-[#241B18] px-2 py-0.5 rounded-md text-xs font-black shadow-[0px_1px_0px_#241B18] flex items-center gap-1">
              <span>⭐</span>
              <span>{restaurant.rating.toFixed(1)}</span>
            </span>
          </div>
        </div>

        {/* Signature Dish Callout */}
        <div className="bg-[#FFF8F1] border-2 border-[#241B18] rounded-xl p-3 text-sm font-bold shadow-[0px_2px_0px_#241B18]">
          <span className="text-[11px] font-bold text-[#7A6E67] block mb-0.5">
            {t('swiping.signature_dish_label')}
          </span>
          <p className="text-sm font-extrabold text-[#241B18] font-alexandria leading-snug">
            {signatureDish}
          </p>
        </div>

        {/* Vibe Tags Pills */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {vibeTags.map((tag, idx) => (
            <span
              key={idx}
              className="bg-[#F2E8DF]/60 border border-[#241B18]/30 px-2.5 py-1 rounded-full text-xs font-bold text-[#241B18]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
