import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import type { RestaurantItem } from '../../types/restaurant';
import type { Participant } from '../../types/database';
import { ProceduralAvatar } from '../common/ProceduralAvatar';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { SparkleRays, DoodleHeart } from '../common/DecorativeSparkles';
import { useLocale } from '../../context/LocaleContext';

interface MatchCelebrationScreenProps {
  restaurant: RestaurantItem;
  participants: Participant[];
  onProceed?: () => void;
  onVoteAgain?: () => void;
  onGoHome?: () => void;
  isUnanimous?: boolean;
}

export const MatchCelebrationScreen: React.FC<MatchCelebrationScreenProps> = ({
  restaurant,
  participants,
  onProceed,
  onVoteAgain,
  onGoHome,
  isUnanimous = true,
}) => {
  const { locale, t } = useLocale();
  const [showMenuModal, setShowMenuModal] = useState(false);

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
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-12 overflow-y-auto selection:bg-[#FFF0EE]">
      <div>
        <Header
          showBack={false}
          showMenu={true}
          onMenuClick={() => setShowMenuModal(true)}
          participantCount={participants.length}
          showCount={true}
        />

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
          className="max-w-md mx-auto bg-white rounded-3xl border-2 border-[#241B18] shadow-[0px_6px_0px_#241B18] overflow-hidden mb-4 select-none"
        >
          {/* Cover Image */}
          <div className="relative h-40 sm:h-44 w-full bg-[#FFF8F1] border-b-2 border-[#241B18] overflow-hidden">
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

          <div className="p-4 sm:p-5 flex flex-col gap-2.5">
            {/* Restaurant Title */}
            <h2 className="text-xl sm:text-2xl font-black text-[#241B18] font-alexandria tracking-tight">
              {name}
            </h2>

            {/* Signature Dish Callout */}
            <div className="bg-[#FFF8F1] border-2 border-[#241B18] rounded-2xl p-3 shadow-[0px_2px_0px_#241B18] text-start">
              <span className="text-[10px] font-bold text-[#7A6E67] block mb-0.5">
                {t('swiping.signature_dish_label')}
              </span>
              <p className="text-sm sm:text-base font-extrabold text-[#241B18] font-alexandria leading-snug">
                {signatureDish}
              </p>
            </div>

            {/* Vibe Tags */}
            <div className="flex flex-wrap gap-1.5 justify-center pt-0.5">
              {vibeTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[#F2E8DF]/60 border border-[#241B18]/30 px-2 py-0.5 rounded-full text-[11px] font-bold text-[#241B18]"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Matched Squad Tokens */}
            <div className="border-t border-[#241B18]/15 pt-3 mt-0.5 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#7A6E67] font-alexandria">
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
      <div className="max-w-md w-full mx-auto flex flex-col gap-2.5 pt-2 pb-6">
        {/* Vote Again CTA (Top Priority) */}
        {onVoteAgain && (
          <button
            type="button"
            onClick={onVoteAgain}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none font-alexandria font-black text-base sm:text-lg flex items-center justify-center gap-2 hover:brightness-105 transition-all select-none"
          >
            <span>{t('match.vote_again_cta')}</span>
          </button>
        )}

        {/* WhatsApp Share CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-6 rounded-2xl bg-[#25D366] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none font-alexandria font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:brightness-105 transition-all select-none text-center"
        >
          <span>{t('match.share_whatsapp_cta')}</span>
        </a>

        {/* Secondary Actions Row */}
        <div className="flex items-center gap-2 w-full">
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-white text-[#7A6E67] hover:text-[#241B18] border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-1 active:shadow-none font-alexandria font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all select-none"
            >
              <span>{t('match.go_home_cta')}</span>
            </button>
          )}

          {/* Primary Phase 4 CTA */}
          <button
            type="button"
            onClick={onProceed}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-[#FFF0EE] text-[#F0443E] hover:bg-[#F0443E] hover:text-white border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-1 active:shadow-none font-alexandria font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all select-none"
          >
            <span>{t('match.order_prep_cta')}</span>
          </button>
        </div>
      </div>

      {/* Menu / Options Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border-2 border-[#241B18] text-center">
            <h4 className="text-lg font-bold text-[#241B18] mb-4 font-alexandria">
              {t('match.menu_title')}
            </h4>
            <div className="flex flex-col gap-2.5">
              {onVoteAgain && (
                <TactileButton
                  onClick={() => {
                    setShowMenuModal(false);
                    onVoteAgain();
                  }}
                  variant="primary"
                  size="sm"
                  fullWidth
                >
                  {t('match.vote_again_cta')}
                </TactileButton>
              )}
              {onGoHome && (
                <TactileButton
                  onClick={() => {
                    setShowMenuModal(false);
                    onGoHome();
                  }}
                  variant="ghost"
                  size="sm"
                  fullWidth
                  className="text-brand-red hover:bg-brand-redSoft"
                >
                  {t('match.go_home_cta')}
                </TactileButton>
              )}
              <button
                type="button"
                onClick={() => setShowMenuModal(false)}
                className="py-2 text-xs font-semibold text-[#7A6E67]"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
