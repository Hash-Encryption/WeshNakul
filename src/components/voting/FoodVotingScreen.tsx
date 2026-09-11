import React, { useState, useEffect } from 'react';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { ProceduralAvatar } from '../common/ProceduralAvatar';
import { Toast } from '../common/Toast';
import { CategoryCard } from './CategoryCard';
import { FOOD_CATEGORIES } from '../../lib/consensus';
import { SparkleRays } from '../common/DecorativeSparkles';

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

  // Initialize selection from existing saved choice if any
  useEffect(() => {
    if (myChoice?.selected_categories && myChoice.selected_categories.length > 0) {
      setSelectedIds(myChoice.selected_categories);
    } else {
      setSelectedIds([]);
    }
  }, [myChoice]);

  if (!currentRoom || !currentParticipant) return null;

  const isSubmitted = Boolean(myChoice?.is_submitted) && !isEditing;
  const canSubmit = selectedIds.length >= 2;

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitFoodChoices(selectedIds);
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
      def: FOOD_CATEGORIES.find((c) => c.id === id)!,
    }))
    .filter((item) => item.def && item.count > 0)
    .sort((a, b) => b.count - a.count);

  const hasSelectedWildcard = selectedIds.includes('flexible');

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

        {/* Heading and Squad Instructions */}
        <div className="text-center mt-2 mb-4 px-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-yellow/30 border border-brand-ink/10 text-xs font-bold text-brand-ink mb-2">
            <span>{t('voting.minSelectionHint', { count: selectedIds.length })}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-ink mb-1 font-alexandria tracking-tight">
            {t('voting.heading')}
          </h2>
          <p className="text-brand-gray text-xs sm:text-sm font-medium">
            {t('voting.subtitle')}
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
            <span>{t('voting.wildcardNotice')}</span>
          </div>
        )}

        {/* Category Selection Grid */}
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2.5 mb-6">
          {FOOD_CATEGORIES.map((cat) => {
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
