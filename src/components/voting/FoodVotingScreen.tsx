import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { ProceduralAvatar } from '../common/ProceduralAvatar';
import { Toast } from '../common/Toast';
import { CategoryCard } from './CategoryCard';
import { getCategoriesForMode, normalizeCategorySelection, toggleCategorySelection } from '../../lib/consensus';
import { SparkleRays } from '../common/DecorativeSparkles';
import { DecisionMachineLoading } from '../common/DecisionMachineLoading';
import { RoomModeSelector } from '../common/RoomModeSelector';
import { RoomPreferencesBar } from '../common/RoomPreferencesBar';

export const FoodVotingScreen: React.FC = () => {
  const {
    currentRoom,
    currentParticipant,
    participants,
    myChoice,
    submitFoodChoices,
  } = useRoom();

  const { t, locale } = useLocale();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mode = currentRoom?.room_mode || 'food';
  const rawCategories = getCategoriesForMode(mode);
  // Ensure wildcard card ("Anything / Flexible" / "Any Breakfast") is always the first card in the grid
  const categories = [...rawCategories].sort((a, b) => (b.isWildcard ? 1 : 0) - (a.isWildcard ? 1 : 0));
  const wildcardId = mode === 'breakfast' ? 'any_breakfast' : 'flexible';

  // Initialize selection from existing saved choice if any
  useEffect(() => {
    if (myChoice?.selected_categories && myChoice.selected_categories.length > 0) {
      setSelectedIds(normalizeCategorySelection(myChoice.selected_categories, currentRoom?.room_mode));
    } else {
      setSelectedIds([]);
    }
  }, [myChoice, currentRoom?.room_mode]);

  if (!currentRoom || !currentParticipant) return null;

  const isSubmitted = Boolean(myChoice?.is_submitted) && !isEditing;
  const hasSelectedWildcard = selectedIds.includes(wildcardId);
  const canSubmit = hasSelectedWildcard || selectedIds.length >= 2;

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) => toggleCategorySelection(prev, id, currentRoom?.room_mode));
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitFoodChoices(normalizeCategorySelection(selectedIds, currentRoom?.room_mode));
      setIsEditing(false);
      setToastMessage(t('toast.picksSubmitted'));
      setTimeout(() => setToastMessage(null), 2500);
    } catch (err) {
      console.error('Error submitting picks', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPicks = async () => {
    setIsEditing(true);
  };

  const categorySummary=currentRoom.category_summary;
  const totalSubmitted=categorySummary?.submittedCount||0;

  // Sorted list of base categories with direct/wildcard votes
  const activeTallies = Object.entries(categorySummary?.tally||{})
    .map(([id, count]) => ({
      id,
      count,
      percentage: totalSubmitted > 0 ? count / totalSubmitted : 0,
      def: categories.find((c) => c.id === id)!,
    }))
    .filter((item) => item.def && item.count > 0)
    .sort((a, b) => b.count - a.count);

  const eligibleCount = categorySummary?.eligibleParticipantCount || participants.length;
  const isAllSubmitted = totalSubmitted > 0 && totalSubmitted >= eligibleCount;

  if (isAllSubmitted) {
    return (
      <div className="relative flex flex-col items-center justify-between min-h-[92dvh] w-full px-2 pb-8 selection:bg-brand-redSoft">
        <Toast message={toastMessage} />
        <DecisionMachineLoading
          participants={participants}
          currentStep={3}
        />
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://washn6tab.com';
  const inviteUrl = `${origin}/r/${currentRoom.code}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = inviteUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setToastMessage(t('toast.linkCopied'));
      setTimeout(() => setToastMessage(null), 2000);
      try {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.2 },
          colors: ['#F0443E', '#FFD75A', '#55B96A', '#73C8EA'],
        });
      } catch {
        // safe fallback
      }
    } catch (e) {
      console.error('Failed to copy link', e);
      setToastMessage(t('toast.linkCopied'));
      setTimeout(() => setToastMessage(null), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const rawMessage = t('whatsapp.shareMessage', { url: inviteUrl });
    const encodedMessage = encodeURIComponent(rawMessage);
    const whatsappNativeUrl = `whatsapp://send?text=${encodedMessage}`;
    const whatsappWebUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = whatsappNativeUrl;
      setTimeout(() => {
        window.open(whatsappWebUrl, '_blank');
      }, 1000);
    } else {
      window.open(whatsappWebUrl, '_blank');
    }
  };

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-28 sm:pb-32 selection:bg-brand-redSoft">
      <Toast message={toastMessage} />

      <div>
        {/* Header */}
        <Header
          showBack={false}
          showMenu={false}
          participantCount={participants.length}
          showCount={true}
        />

        {/* Compact Invite & Room Share Bar */}
        <div className="max-w-md mx-auto mt-1 mb-3 px-3 py-2 flex items-center justify-between gap-2 bg-white rounded-2xl border-2 border-brand-ink shadow-[0_2px_0_#241B18]">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-brand-muted uppercase tracking-wider">
              {t('lobby.roomCodeLabel')}:
            </span>
            <span className="font-alexandria font-extrabold text-base text-brand-red bg-brand-cream px-2.5 py-0.5 rounded-xl border border-brand-ink/15 tracking-wider select-all">
              {currentRoom.code}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-brand-cream border border-brand-ink/20 text-xs font-bold text-brand-ink shadow-sm hover:bg-brand-yellow/30 active:translate-y-0.5 transition-all cursor-pointer font-alexandria"
              title={t('lobby.copyLinkBtn')}
            >
              <span>🔗</span>
              <span className="text-[11px] font-bold">{locale === 'ar' ? 'نسخ الرابط' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-brand-whatsapp text-white border border-brand-ink/20 text-xs font-bold shadow-sm hover:brightness-105 active:translate-y-0.5 transition-all cursor-pointer font-alexandria"
              title={t('lobby.shareWhatsAppBtn')}
            >
              <span>💬</span>
              <span className="text-[11px] font-bold">{locale === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
            </button>
          </div>
        </div>

        {/* Room Mode Selector & Preferences Bar */}
        <RoomModeSelector className="mt-1 mb-2" />
        <RoomPreferencesBar className="mb-3" />

        {/* Heading and Squad Instructions */}
        <div className="text-center mt-1 mb-4 px-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/30 border border-brand-ink/10 text-xs font-bold text-brand-ink mb-2">
            <span>{t('voting.minSelectionHint', { count: selectedIds.length })}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-ink mb-1 font-alexandria tracking-tight">
            {mode === 'breakfast' ? t('voting.breakfastHeading') : t('voting.heading')}
          </h2>
          <p className="text-brand-gray text-xs sm:text-sm font-medium">
            {mode === 'breakfast' ? t('voting.breakfastSubtitle') : t('voting.subtitle')}
          </p>
        </div>

        {/* Squad Readiness Live Status Bar */}
        <div className="max-w-md mx-auto bg-white rounded-2xl p-3 border-2 border-brand-ink shadow-[0_3px_0_#241B18] mb-4">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-bold text-brand-ink uppercase tracking-wider">
              {t('voting.squadStatus')} ({totalSubmitted}/{categorySummary?.eligibleParticipantCount||participants.length})
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-brand-green">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <span>
                {totalSubmitted === (categorySummary?.eligibleParticipantCount||participants.length)
                  ? t('voting.ready')
                  : t('voting.picking')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
            {participants.map((p) => {
              const pSubmitted = Boolean(categorySummary?.submittedParticipantIds?.includes(p.id));
              const isMe = p.id === currentParticipant.id;

              return (
                <div key={p.id} className="flex flex-col items-center flex-shrink-0 relative group">
                  <div className="relative">
                    <ProceduralAvatar
                      nickname={p.nickname}
                      shape={p.player_shape}
                      color={p.player_color}
                      size="sm"
                      showCrown={p.is_host}
                    />
                    {/* Submission status check badge */}
                    {pSubmitted ? (
                      <div className="absolute -bottom-1 -end-1 w-4 h-4 rounded-full bg-brand-green border border-brand-ink text-white flex items-center justify-center text-[9px] font-black">
                        ✓
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -end-1 w-4 h-4 rounded-full bg-brand-cream border border-brand-ink text-brand-ink flex items-center justify-center text-[8px] animate-spin">
                        ⏳
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-brand-ink mt-1 truncate max-w-[50px]">
                    {isMe ? t('lobby.youBadge') : p.nickname}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wildcard Info Banner if selected */}
        {hasSelectedWildcard && (
          <div className="max-w-md mx-auto mb-4 p-3 rounded-2xl bg-brand-yellow/20 border-2 border-brand-ink shadow-[0_2px_0_#241B18] text-xs font-bold text-brand-ink flex items-start gap-2">
            <span className="text-lg">🎲</span>
            <span>{mode === 'breakfast' ? t('voting.breakfastWildcardNotice') : t('voting.wildcardNotice')}</span>
          </div>
        )}

        {/* Category Selection Grid */}
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2.5 mb-6">
          {categories.map((cat) => {
            const isSelected = selectedIds.includes(cat.id);
            const count = categorySummary?.tally?.[cat.id] || 0;
            const percentage = totalSubmitted > 0 ? count / totalSubmitted : 0;

            return (
              <CategoryCard
                key={cat.id}
                category={cat}
                isSelected={isSelected}
                onToggle={toggleCategory}
                disabled={isSubmitted}
                locale={locale}
                voteCount={count}
                percentage={percentage}
                showVoteCount={isSubmitted && count > 0}
              />
            );
          })}
        </div>

        {/* Anti-Bias Privacy Live Tally Section */}
        <div className="max-w-md mx-auto mb-6">
          <div className="bg-white rounded-2xl p-4 border-2 border-brand-ink shadow-[0_3px_0_#241B18]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs sm:text-sm font-bold text-brand-ink font-alexandria flex items-center gap-1.5">
                <span>{t('voting.liveVotesTitle')}</span>
              </h3>
              {isSubmitted && (
                <span className="text-[11px] font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-full border border-brand-green/30">
                  {totalSubmitted} {t('common.participants')}
                </span>
              )}
            </div>

            {isSubmitted ? (
              // Unlocked Live Votes View
              activeTallies.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {activeTallies.map((item) => {
                    const percentFormatted = Math.round(item.percentage * 100);
                    const isWinning = item.percentage >= 0.6;

                    return (
                      <div key={item.id} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs font-bold text-brand-ink">
                          <span className="flex items-center gap-1.5">
                            <span className="text-base">{item.def.icon}</span>
                            <span>{locale === 'ar' ? item.def.ar : item.def.en}</span>
                          </span>
                          <span className="text-brand-muted">
                            {item.count} ({percentFormatted}%)
                          </span>
                        </div>

                        <div className="w-full h-3 bg-brand-cream rounded-full border border-brand-ink/20 overflow-hidden relative">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              isWinning ? 'bg-brand-green' : 'bg-brand-red'
                            }`}
                            style={{ width: `${percentFormatted}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-xs text-brand-muted py-2">
                  {t('voting.submittedSubtitle')}
                </p>
              )
            ) : (
              // Locked Anti-Bias Privacy Teaser
              <div className="py-4 px-3 rounded-xl bg-brand-cream/80 border border-brand-ink/10 text-center flex flex-col items-center justify-center gap-1.5">
                <span className="text-2xl">🔒</span>
                <p className="text-xs font-bold text-brand-ink">
                  {t('voting.antiBiasNotice')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Sticky Bottom Submission Bar */}
      <div className="sticky bottom-2 max-w-md w-full mx-auto pt-2 bg-[#FFF8F1]/90 backdrop-blur-sm">
        {isSubmitted ? (
          <div className="flex flex-col gap-2">
            <div className="py-3 px-4 rounded-2xl bg-brand-green/15 border-2 border-brand-green text-center">
              <span className="font-alexandria font-bold text-sm text-brand-ink block">
                {t('voting.submittedTitle')}
              </span>
              <span className="text-xs text-brand-muted font-medium block mt-0.5">
                {t('voting.submittedSubtitle')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleEditPicks}
              className="py-2 text-xs font-bold text-brand-muted hover:text-brand-ink underline text-center"
            >
              {t('voting.changePicks')}
            </button>
          </div>
        ) : (
          <div className="relative">
            {canSubmit && (
              <SparkleRays
                className="absolute -top-3 end-4 transform rotate-12 scale-75 pointer-events-none"
                color="#FFD75A"
              />
            )}
            <TactileButton
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              isLoading={isSubmitting}
              variant="primary"
              fullWidth
              size="lg"
            >
              {canSubmit
                ? `${t('voting.submitPicks')} (${selectedIds.length})`
                : t('voting.minSelectionHint', { count: selectedIds.length })}
            </TactileButton>
          </div>
        )}
      </div>
    </div>
  );
};
