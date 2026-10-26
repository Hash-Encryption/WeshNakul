import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import type { RestaurantItem } from '../../types/restaurant';
import type { Participant, OrderItem } from '../../types/database';
import { ProceduralAvatar } from '../common/ProceduralAvatar';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { SparkleRays, DoodleHeart } from '../common/DecorativeSparkles';
import { useLocale } from '../../context/LocaleContext';
import { useRoom } from '../../context/RoomContext';
import { DeliveryLauncher } from '../orders/DeliveryLauncher';
import { OrderScratchpad } from '../orders/OrderScratchpad';
import { SocialSuggestionAvatars } from '../common/SocialSuggestionAvatars';

import { broadcastRevoteRequest, subscribeToRevoteRequests } from '../../lib/supabase';
import { trackRevoteRequested } from '../../lib/analytics';
import { generateReceiptFile } from '../../lib/receiptGenerator';
import { playTactilePop, triggerHaptic } from '../../lib/haptics';

const PILL_GRADIENTS = [
  'from-[#FF6B6B] to-[#FF8E53]',
  'from-[#4E65FF] to-[#92EFFD]',
  'from-[#11998E] to-[#38EF7D]',
  'from-[#F2994A] to-[#F2C94C]',
  'from-[#EE0979] to-[#FF6A00]',
  'from-[#8E2DE2] to-[#4A00E0]',
];

function getInitials(name: string): string {
  const clean = name.trim();
  if (!clean) return '؟';
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0].slice(0, 1) + parts[1].slice(0, 1)).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

function getPillGradient(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PILL_GRADIENTS[hash % PILL_GRADIENTS.length];
}

interface MatchCelebrationScreenProps {
  restaurant: RestaurantItem;
  participants: Participant[];
  roomId?: string;
  currentParticipantId?: string;
  currentParticipantName?: string;
  isHost?: boolean;
  onProceed?: () => void;
  onVoteAgain?: () => void;
  onRestartVote?: () => void;
  onGoHome?: () => void;
  isUnanimous?: boolean;
}


export const MatchCelebrationScreen: React.FC<MatchCelebrationScreenProps> = ({
  restaurant,
  participants,
  roomId,
  currentParticipantId,
  currentParticipantName,
  isHost,
  onProceed: _onProceed,
  onVoteAgain,
  onRestartVote,
  onGoHome,
  isUnanimous = true,
}) => {
  const { locale, t } = useLocale();
  const { currentRoom, currentParticipant, isHost: roomIsHost, resetRoomVoting, suggestions, toggleSuggestion } = useRoom();
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [revoteVoters, setRevoteVoters] = useState<Array<{ id: string; name: string }>>([]);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [receiptModal, setReceiptModal] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);

  const activeRoomId = roomId || currentRoom?.id || '';
  const activeParticipantId = currentParticipantId || currentParticipant?.id || '';
  const activeParticipantName = currentParticipantName || currentParticipant?.nickname || '';
  const activeIsHost = isHost !== undefined ? isHost : roomIsHost;
  const roomCode = currentRoom?.code || '';

  const name =
    (locale === 'ar' ? restaurant.nameAr : restaurant.nameEn) ||
    restaurant.nameAr ||
    restaurant.nameEn ||
    restaurant.name ||
    (locale === 'ar' ? 'مطعم' : 'Restaurant');

  const handleOpenReceiptPreview = async () => {
    if (isGeneratingReceipt) return;
    setIsGeneratingReceipt(true);
    playTactilePop(220);
    triggerHaptic(12);
    try {
      const file = await generateReceiptFile({
        restaurant,
        participants,
        orders,
        roomCode,
        districtName: currentRoom?.district || undefined,
        cityName: currentRoom?.city || undefined,
        isUnanimous,
        locale,
      });

      const previewUrl = URL.createObjectURL(file);
      setReceiptModal({ file, previewUrl });

      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.warn('Generate receipt preview failed:', err);
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const handleCloseReceiptModal = () => {
    if (receiptModal) {
      URL.revokeObjectURL(receiptModal.previewUrl);
      setReceiptModal(null);
    }
  };

  const handleModalShare = async () => {
    if (!receiptModal) return;
    playTactilePop(240);
    triggerHaptic(16);
    try {
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [receiptModal.file] })) {
        await navigator.share({
          title: `${name} - Wesh Nakul`,
          text: locale === 'ar' ? `اخترنا ${name} عبر وش ناكل! 🍔` : `We picked ${name} on Wesh Nakul! 🍔`,
          files: [receiptModal.file],
        });
      } else {
        handleModalSave();
      }
    } catch (err) {
      console.warn('Share modal failed:', err);
    }
  };

  const handleModalSave = () => {
    if (!receiptModal) return;
    playTactilePop(180);
    triggerHaptic(12);
    const a = document.createElement('a');
    a.href = receiptModal.previewUrl;
    a.download = receiptModal.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Realtime subscription for squad revote requests
  useEffect(() => {
    if (!activeRoomId) return;

    const unsubscribe = subscribeToRevoteRequests(activeRoomId, (p) => {
      setRevoteVoters((prev) => {
        if (p.active) {
          if (prev.some((v) => v.id === p.id)) return prev;
          return [...prev, { id: p.id, name: p.name }];
        } else {
          return prev.filter((v) => v.id !== p.id);
        }
      });
    });

    return () => unsubscribe();
  }, [activeRoomId]);

  const handleHostRestartVote = () => {
    trackRevoteRequested({
      roomId: activeRoomId,
      roomCode,
      isHost: true,
      targetStage: 'voting',
    });
    if (onRestartVote) {
      onRestartVote();
    } else if (onVoteAgain) {
      onVoteAgain();
    } else {
      resetRoomVoting('voting');
    }
  };

  const isMyRevoteRequested = revoteVoters.some((v) => v.id === activeParticipantId);

  const handleToggleRevoteRequest = () => {
    const nextActive = !isMyRevoteRequested;

    if (nextActive) {
      trackRevoteRequested({
        roomId: activeRoomId,
        roomCode,
        isHost: false,
        targetStage: 'voting',
      });
    }

    setRevoteVoters((prev) => {
      if (nextActive) {
        if (prev.some((v) => v.id === activeParticipantId)) return prev;
        return [...prev, { id: activeParticipantId, name: activeParticipantName }];
      } else {
        return prev.filter((v) => v.id !== activeParticipantId);
      }
    });

    broadcastRevoteRequest(activeRoomId, {
      id: activeParticipantId,
      name: activeParticipantName,
      active: nextActive,
    });

    void toggleSuggestion('action:try_another_restaurant');
  };


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

  const signatureDish =
    (locale === 'ar' ? restaurant?.signatureDishAr : restaurant?.signatureDishEn) ||
    restaurant?.signatureDishAr ||
    restaurant?.signatureDishEn ||
    '';
  const rawVibe = locale === 'ar' ? restaurant?.vibeTagsAr : restaurant?.vibeTagsEn;
  const vibeTags = Array.isArray(rawVibe)
    ? rawVibe
    : Array.isArray(restaurant?.vibeTagsAr)
    ? restaurant.vibeTagsAr
    : Array.isArray(restaurant?.vibeTagsEn)
    ? restaurant.vibeTagsEn
    : [];

  const hasRating =
    restaurant?.rating !== null &&
    restaurant?.rating !== undefined &&
    !Number.isNaN(Number(restaurant.rating)) &&
    Number(restaurant.rating) > 0;
  const formattedRating = hasRating ? Number(restaurant.rating).toFixed(1) : null;

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-12 overflow-y-auto selection:bg-[#FFF0EE]">
      <div>
        <Header
          showBack={false}
          showMenu={true}
          onMenuClick={() => setShowMenuModal(true)}
          participantCount={participants.length}
          showCount={true}
          onLeave={onGoHome}
          showLeave={Boolean(onGoHome)}
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
          {/* Cover Visual */}
          <div className="relative h-40 sm:h-44 w-full bg-[#FFF8F1] border-b-2 border-[#241B18] overflow-hidden flex items-center justify-center select-none">
            {restaurant?.imageUrl ? (
              <>
                <img
                  src={restaurant.imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#FFF8F1] p-4 text-center select-none">
                <div className="w-14 h-14 rounded-2xl bg-[#FFD75A] border-2 border-[#241B18] shadow-[0_3px_0_#241B18] flex items-center justify-center text-2xl">
                  <span>🍽️</span>
                </div>
                <span className="text-xs font-black text-[#7A6E67] tracking-wider uppercase font-alexandria">
                  {locale === 'ar' ? 'وش ناكل؟' : 'WeshNakul'}
                </span>
              </div>
            )}
            {formattedRating && (
              <div className="absolute top-3 end-3 bg-white/90 backdrop-blur-sm border-2 border-[#241B18] px-2.5 py-1 rounded-xl shadow-[0px_2px_0px_#241B18] text-xs font-black text-[#241B18] flex items-center gap-1">
                <span>⭐</span>
                <span>{formattedRating}</span>
              </div>
            )}
            {restaurant?.priceTier && (
              <div className="absolute top-3 start-3 bg-[#FFD75A] border-2 border-[#241B18] px-2.5 py-1 rounded-xl shadow-[0px_2px_0px_#241B18] text-xs font-black text-[#241B18]">
                {restaurant.priceTier}
              </div>
            )}
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

        {/* Phase 4: Delivery App Launcher */}
        <DeliveryLauncher
          restaurant={restaurant}
        />

        {/* Phase 4: Squad Order Scratchpad */}
        <OrderScratchpad
          roomId={activeRoomId}
          currentParticipantId={activeParticipantId}
          currentParticipantName={activeParticipantName}
          isHost={activeIsHost}
          orders={orders}
          onOrdersChange={setOrders}
          restaurantName={name}
          roomCode={roomCode}
        />
      </div>

      {/* Action Buttons */}
      <div className="max-w-md w-full mx-auto flex flex-col gap-2.5 pt-2 pb-6">
        {/* Share to IG Story (Thermal Receipt) */}
        <button
          type="button"
          onClick={handleOpenReceiptPreview}
          disabled={isGeneratingReceipt}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none font-alexandria font-black text-sm sm:text-base flex items-center justify-center gap-2 hover:brightness-105 transition-all select-none cursor-pointer disabled:opacity-60"
        >
          <span className="text-base sm:text-lg">📸</span>
          <span>
            {isGeneratingReceipt
              ? (locale === 'ar' ? 'جاري تحضير الفاتورة...' : 'Generating Receipt...')
              : (locale === 'ar' ? 'مشاركة ستوري إنستقرام (فاتورة حرارية)' : 'Share to IG Story (Receipt)')}
          </span>
        </button>
        {/* Re-Vote Section with Avatar Badges */}
        <div className="w-full flex flex-col gap-1.5">
          {revoteVoters.length > 0 && (
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="flex items-center -space-x-1.5 rtl:space-x-reverse">
                {revoteVoters.map((voter) => (
                  <div
                    key={voter.id}
                    title={voter.name}
                    className={`w-6 h-6 rounded-full bg-gradient-to-tr ${getPillGradient(voter.id)} border border-[#241B18] shadow-sm flex items-center justify-center text-[10px] font-black text-white font-alexandria select-none`}
                  >
                    {getInitials(voter.name)}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-black text-[#241B18] font-alexandria bg-[#FFF8F1] border border-[#241B18] px-2.5 py-0.5 rounded-full shadow-[0px_1.5px_0px_#241B18]">
                {locale === 'ar'
                  ? `(${revoteVoters.length}/${participants.length} طلبوا الإعادة)`
                  : `(${revoteVoters.length}/${participants.length} requested re-vote)`}
              </span>
            </div>
          )}

          {activeIsHost ? (
            /* Host Re-Vote CTA */
            <button
              type="button"
              onClick={handleHostRestartVote}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#FFD75A] text-[#241B18] border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none font-alexandria font-black text-base sm:text-lg flex items-center justify-center gap-2 hover:brightness-105 transition-all select-none"
            >
              <span>{t('revote.hostAction')}</span>
            </button>
          ) : (
            /* Squad Member Re-Vote Request / Cancel CTA */
            <button
              type="button"
              onClick={handleToggleRevoteRequest}
              className={`w-full py-3.5 px-6 rounded-2xl border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-1 active:shadow-none font-alexandria font-black text-base sm:text-lg flex items-center justify-center gap-2 transition-all select-none ${
                isMyRevoteRequested
                  ? 'bg-[#FEE4E2] text-[#B42318] hover:bg-[#FECDCA]'
                  : 'bg-[#FFD75A] text-[#241B18] hover:brightness-105'
              }`}
            >
              <span>
                {isMyRevoteRequested
                  ? t('revote.participantCancel')
                  : t('revote.participantRequest')}
              </span>
            </button>
          )}

          <SocialSuggestionAvatars
            suggestions={suggestions}
            target="action:try_another_restaurant"
            className="justify-center mt-1"
          />
        </div>

        {/* Go Home CTA */}
        {onGoHome && (
          <button
            type="button"
            onClick={onGoHome}
            className="w-full py-2.5 px-3 rounded-2xl bg-white text-[#7A6E67] hover:text-[#241B18] border-2 border-[#241B18] shadow-[0px_3px_0px_#241B18] active:translate-y-1 active:shadow-none font-alexandria font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all select-none"
          >
            <span>{t('match.go_home_cta')}</span>
          </button>
        )}
      </div>


      {/* Menu / Options Modal */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl border-2 border-[#241B18] text-center">
            <h4 className="text-lg font-bold text-[#241B18] mb-4 font-alexandria">
              {t('match.menu_title')}
            </h4>
            <div className="flex flex-col gap-2.5">
              {activeIsHost ? (
                <TactileButton
                  onClick={() => {
                    setShowMenuModal(false);
                    handleHostRestartVote();
                  }}
                  variant="primary"
                  size="sm"
                  fullWidth
                >
                  {t('revote.hostAction')}
                </TactileButton>
              ) : (
                <TactileButton
                  onClick={() => {
                    setShowMenuModal(false);
                    handleToggleRevoteRequest();
                  }}
                  variant={isMyRevoteRequested ? 'ghost' : 'primary'}
                  size="sm"
                  fullWidth
                  className={isMyRevoteRequested ? 'text-brand-red hover:bg-brand-redSoft' : ''}
                >
                  {isMyRevoteRequested
                    ? t('revote.participantCancel')
                    : t('revote.participantRequest')}
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

      {/* 9:16 Receipt Preview Modal */}
      {receiptModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-fade-in"
        >
          <div className="relative w-full max-w-sm bg-[#1A1412] text-white rounded-3xl border-2 border-[#241B18] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-4 sm:p-5 flex flex-col gap-3.5 max-h-[92vh] overflow-hidden">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD75A]/20 border border-[#FFD75A]/40 text-[#FFD75A] font-alexandria font-black text-xs">
                <span>🧾</span>
                <span>{locale === 'ar' ? 'معاينة الفاتورة الحرارية' : 'Receipt Preview'}</span>
              </div>
              <button
                type="button"
                onClick={handleCloseReceiptModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer text-sm font-black"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Receipt 9:16 Image Preview */}
            <div className="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden rounded-2xl bg-black/40 border border-white/10 p-2">
              <img
                src={receiptModal.previewUrl}
                alt="Wesh Nakul Receipt"
                className="max-h-[55vh] w-auto object-contain rounded-xl shadow-lg border border-white/10"
              />
            </div>

            {/* Action Buttons: Synchronous One-Tap on the pre-built File */}
            <div className="flex flex-col gap-2 w-full pt-1">
              <button
                type="button"
                onClick={handleModalShare}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white font-alexandria font-black text-xs sm:text-sm border-2 border-white/20 shadow-md active:translate-y-0.5 hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-base">📲</span>
                <span>{locale === 'ar' ? 'مشاركة في إنستقرام / ستوري' : 'Share to Instagram / Stories'}</span>
              </button>

              <button
                type="button"
                onClick={handleModalSave}
                className="w-full py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-alexandria font-black text-xs sm:text-sm border border-white/20 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-base">💾</span>
                <span>{locale === 'ar' ? 'حفظ صورة الفاتورة للصور' : 'Save Receipt Image to Photos'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
