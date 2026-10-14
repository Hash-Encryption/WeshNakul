import React from 'react';
import { motion } from 'motion/react';
import type { ShuffleCardItem } from '../../../types/shuffleCards';
import { WeshNakulCardBack } from './WeshNakulCardBack';
import { useLocale } from '../../../context/LocaleContext';

interface ShuffleCardProps {
  card: ShuffleCardItem;
  onClick?: () => void;
  isClickable?: boolean;
  disabled?: boolean;
  isZoomed?: boolean;
  isMuted?: boolean;
}

export const ShuffleCard: React.FC<ShuffleCardProps> = ({
  card,
  onClick,
  isClickable = false,
  disabled = false,
  isZoomed = false,
  isMuted = false,
}) => {
  const { locale, t } = useLocale();
  const isArabic = locale === 'ar';

  const restaurant = card.restaurant;
  const name = isArabic
    ? (restaurant?.nameAr || restaurant?.nameEn || card.id)
    : (restaurant?.nameEn || restaurant?.nameAr || card.id);

  const tags = restaurant?.categories || ['local', 'popular'];

  return (
    <div
      className={`relative w-full aspect-[2/3] max-w-[130px] sm:max-w-[160px] md:max-w-[180px] mx-auto transition-all duration-300 ${
        isZoomed ? 'z-50' : 'z-10'
      } ${isMuted ? 'opacity-40 filter blur-[0.5px]' : 'opacity-100'}`}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{
          rotateY: card.isFaceUp ? 0 : 180,
          scale: isZoomed ? 1.5 : 1,
          y: isZoomed ? -20 : 0,
        }}
        transition={{
          duration: 0.52,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
          filter: isZoomed
            ? 'drop-shadow(0 20px 30px rgba(240, 68, 62, 0.45)) drop-shadow(0 0 20px rgba(255, 215, 90, 0.4))'
            : undefined,
        }}
        onClick={() => {
          if (isClickable && !disabled && onClick) {
            onClick();
          }
        }}
        className={`relative w-full h-full select-none ${
          isClickable && !disabled
            ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg active:scale-95'
            : 'cursor-default'
        }`}
      >
        {/* CARD FRONT (Face-Up) */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
          className={`absolute inset-0 w-full h-full rounded-2xl border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] overflow-hidden flex flex-col justify-between ${
            card.isShuffleAgain
              ? 'bg-gradient-to-b from-[#FFF5F2] via-[#FFEBE5] to-[#FFDED6] text-center p-3 sm:p-4'
              : 'bg-white p-2 sm:p-2.5'
          } ${card.isWinner ? 'ring-3 ring-amber-400' : ''}`}
        >
          {card.isShuffleAgain ? (
            /* "Shuffle Again" Card Face */
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F0443E]/10 border border-[#F0443E]/30 flex items-center justify-center text-2xl sm:text-3xl shadow-inner animate-pulse">
                🔄
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-alexandria font-black text-xs sm:text-sm text-[#F0443E]">
                  {t('shuffleCards.shuffleAgainTitle')}
                </span>
                <span className="font-alexandria font-semibold text-[10px] text-[#7A6E67]">
                  {isArabic ? 'اخلط مرة أخرى!' : 'Shuffle Again!'}
                </span>
              </div>
            </div>
          ) : (
            /* Restaurant Contender Card Face */
            <>
              {/* Image & Rating */}
              <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-xl border border-[#241B18]/15 overflow-hidden bg-[#FFF8F1]">
                {restaurant?.imageUrl ? (
                  <img
                    src={restaurant.imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-amber-100 to-orange-200">
                    🍽️
                  </div>
                )}
                {/* Rating Badge */}
                <div className="absolute top-1.5 end-1.5 px-1.5 py-0.5 rounded-lg bg-white/95 border border-[#241B18]/15 shadow-xs flex items-center gap-1 font-alexandria font-black text-[10px] text-[#241B18]">
                  <span className="text-amber-500 text-[10px]">⭐</span>
                  <span>{restaurant?.rating ? restaurant.rating.toFixed(1) : '4.6'}</span>
                </div>
              </div>

              {/* Contender Label & Name */}
              <div className="flex flex-col gap-0.5 mt-1 sm:mt-1.5">
                <span className="text-[10px] font-bold text-[#7A6E67] font-alexandria">
                  {card.contenderLabel || t('shuffleCards.contender')}
                </span>
                <div className="rounded-lg border border-[#241B18]/20 bg-[#FFFDF8] px-2 py-1">
                  <h4 className="font-alexandria font-black text-xs sm:text-sm text-[#241B18] line-clamp-1 leading-tight">
                    {name}
                  </h4>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-1 overflow-hidden max-h-5 sm:max-h-6">
                {tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded-md bg-[#FFF5F2] border border-[#241B18]/10 text-[9px] font-bold text-[#7A6E67] font-alexandria truncate"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* CARD BACK (Face-Down) */}
        <div
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
          className="absolute inset-0 w-full h-full"
        >
          <WeshNakulCardBack />
        </div>
      </motion.div>
    </div>
  );
};
