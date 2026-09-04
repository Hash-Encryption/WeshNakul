import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import type { RestaurantItem } from '../../types/restaurant';
import type { Participant } from '../../types/database';
import { ProceduralAvatar } from '../common/ProceduralAvatar';
import { Header } from '../common/Header';
import { SparkleRays, DoodleHeart } from '../common/DecorativeSparkles';
import { useLocale } from '../../context/LocaleContext';

interface MatchCelebrationScreenProps {
  restaurant: RestaurantItem;
  participants: Participant[];
  onProceed?: () => void;
  isUnanimous?: boolean;
}

export const MatchCelebrationScreen: React.FC<MatchCelebrationScreenProps> = ({
  restaurant,
  participants,
  onProceed,
  isUnanimous = true,
}) => {
  const { locale, t } = useLocale();

  useEffect(() => {
    try {
      // Confetti volley using neo-brutalist theme palette
      const end = Date.now() + 1200;
      const colors = ['#55B96A', '#FFD75A', '#F0443E', '#241B18'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {
      // fallback
    }
  }, []);

  const name = locale === 'ar' ? restaurant.nameAr : restaurant.nameEn;
  const signatureDish = locale === 'ar' ? restaurant.signatureDishAr : restaurant.signatureDishEn;
  const vibeTags = locale === 'ar' ? restaurant.vibeTagsAr : restaurant.vibeTagsEn;

  // WhatsApp Share URL
  const waShareText =
    locale === 'ar'
      ? `خلاص رسينا على بر! طلبنا اليوم من ${restaurant.nameAr} 🍔🔥`
      : `We locked it in! Today's order is from ${restaurant.nameEn} 🍔🔥`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(waShareText)}`;

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-6 selection:bg-[#FFF0EE]">
      <div>
        <Header showBack={false} showMenu={false} participantCount={participants.length} showCount={true} />

        {/* Heading with playful sparkles */}
        <div className="text-center mt-2 mb-4 px-2 relative">
          <DoodleHeart className="absolute -top-2 start-4 transform -rotate-12" color="#55B96A" />
          <SparkleRays className="absolute -top-3 end-4 transform rotate-12 scale-90" color="#FFD75A" />

          <span className="inline-block bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] px-3 py-1 rounded-full text-xs font-black font-alexandria mb-2">
            {t('match.tag_winner')}
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-[#241B18] font-alexandria tracking-tight">
            {isUnanimous ? t('match.header_unanimous') : t('match.header_majority')}
          </h1>
        </div>

        {/* Hero Winning Restaurant Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="max-w-md mx-auto bg-white rounded-3xl border-2 border-[#241B18] shadow-[0px_6px_0px_#241B18] overflow-hidden mb-5 select-none"
        >
          {/* Cover Image */}
          <div className="relative h-48 w-full bg-[#FFF8F1] border-b-2 border-[#241B18] overflow-hidden">
            <img
              src={restaurant.imageUrl}
              alt={name}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute top-3 end-3 bg-white/90 backdrop-blur-sm border-2 border-[#241B18] px-2.5 py-1 rounded-xl shadow-[0px_2px_0px_#241B18] text-xs font-black text-[#241B18] flex items-center gap-1">
              <span>⭐</span>
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
            <div className="absolute top-3 start-3 bg-[#FFD75A] border-2 border-[#241B18] px-2.5 py-1 rounded-xl shadow-[0px_2px_0px_#241B18] text-xs font-black text-[#241B18]">
              {restaurant.priceTier}
            </div>
          </div>

          <div className="p-5 flex flex-col gap-3">
            {/* Restaurant Title */}
            <h2 className="text-2xl font-black text-[#241B18] font-alexandria tracking-tight">
              {name}
            </h2>

            {/* Signature Dish Callout */}
            <div className="bg-[#FFF8F1] border-2 border-[#241B18] rounded-2xl p-3.5 shadow-[0px_2px_0px_#241B18] text-start">
              <span className="text-[11px] font-bold text-[#7A6E67] block mb-0.5">
                {t('swiping.signature_dish_label')}
              </span>
              <p className="text-base font-extrabold text-[#241B18] font-alexandria leading-snug">
                {signatureDish}
              </p>
            </div>

            {/* Vibe Tags */}
            <div className="flex flex-wrap gap-1.5 justify-center pt-1">
              {vibeTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[#F2E8DF]/60 border border-[#241B18]/30 px-2.5 py-1 rounded-full text-xs font-bold text-[#241B18]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Matched Squad Tokens */}
            <div className="border-t border-[#241B18]/15 pt-3.5 mt-1 flex flex-col items-center gap-2">
              <span className="text-[11px] font-bold text-[#7A6E67] font-alexandria">
                {locale === 'ar' ? 'القروب المتفق عليه 🤝' : 'Squad in Agreement 🤝'}
              </span>
              <div className="flex items-center -space-x-2 rtl:space-x-reverse">
                {participants.map((p) => (
                  <div key={p.id} title={p.nickname} className="relative transform hover:scale-110 transition-transform">
                    <ProceduralAvatar
                      nickname={p.nickname}
                      shape={p.player_shape}
                      color={p.player_color}
                      size="sm"
                      showCrown={p.is_host}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-md w-full mx-auto flex flex-col gap-3">
        {/* Primary Phase 4 CTA */}
        <button
          type="button"
          onClick={onProceed}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#F0443E] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none font-alexandria font-black text-base sm:text-lg flex items-center justify-center gap-2 hover:brightness-105 transition-all select-none"
        >
          <span>{t('match.order_prep_cta')}</span>
        </button>

        {/* WhatsApp Share CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-6 rounded-2xl bg-[#25D366] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none font-alexandria font-black text-base sm:text-lg flex items-center justify-center gap-2 hover:brightness-105 transition-all select-none text-center"
        >
          <span>{t('match.share_whatsapp_cta')}</span>
        </a>
      </div>
    </div>
  );
};
