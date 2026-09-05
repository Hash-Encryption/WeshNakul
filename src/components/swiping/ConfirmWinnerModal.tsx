import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { RestaurantItem } from '../../types/restaurant';
import { useLocale } from '../../context/LocaleContext';

interface ConfirmWinnerModalProps {
  isOpen: boolean;
  restaurant: RestaurantItem | null;
  onClose: () => void;
  onConfirm: (restaurant: RestaurantItem) => Promise<void> | void;
}

export const ConfirmWinnerModal: React.FC<ConfirmWinnerModalProps> = ({
  isOpen,
  restaurant,
  onClose,
  onConfirm,
}) => {
  const { t, locale } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !restaurant) return null;

  const restaurantName = locale === 'ar' ? restaurant.nameAr : restaurant.nameEn;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(restaurant);
    } catch (err) {
      console.error('Error confirming winner', err);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 12 }}
          transition={{ type: 'spring', stiffness: 320, damping: 25 }}
          className="w-full max-w-sm bg-white rounded-3xl border-2 border-[#241B18] shadow-[0px_6px_0px_#241B18] p-5 sm:p-6 text-center overflow-hidden flex flex-col gap-4"
        >
          {/* Header Icon / Title */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="w-14 h-14 rounded-2xl bg-[#FFD75A] border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] flex items-center justify-center text-2xl animate-bounce">
              🏆
            </span>
            <h3 className="text-xl font-black text-[#241B18] font-alexandria tracking-tight mt-1">
              {t('gameSwiper.modalTitle')}
            </h3>
          </div>

          {/* Restaurant Callout */}
          <div className="bg-[#FFF8F1] border-2 border-[#241B18] rounded-2xl p-3.5 shadow-[0px_2px_0px_#241B18] text-start flex items-center gap-3">
            {restaurant.imageUrl ? (
              <img
                src={restaurant.imageUrl}
                alt={restaurantName}
                className="w-14 h-14 rounded-xl object-cover border border-[#241B18]/20 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#FFD75A]/40 border border-[#241B18]/20 flex items-center justify-center text-2xl shrink-0">
                🍽️
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-base font-black text-[#241B18] font-alexandria truncate">
                {restaurantName}
              </h4>
              <p className="text-xs font-semibold text-[#7A6E67] font-alexandria truncate mt-0.5">
                {locale === 'ar' ? restaurant.signatureDishAr : restaurant.signatureDishEn}
              </p>
            </div>
          </div>

          {/* Body Message */}
          <p className="text-sm font-bold text-[#241B18] font-alexandria leading-relaxed px-1">
            {t('gameSwiper.modalBody', { restaurant: restaurantName })}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="w-full py-3 px-4 rounded-2xl bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none hover:brightness-105 transition-all font-alexandria font-black text-base disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🎉</span>
              <span>{isSubmitting ? t('common.loading') : t('gameSwiper.modalConfirm')}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-2xl bg-white text-[#7A6E67] hover:text-[#241B18] border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-1 active:shadow-none hover:bg-[#FFF8F1] transition-all font-alexandria font-bold text-sm disabled:opacity-50 cursor-pointer"
            >
              {t('gameSwiper.modalCancel')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
