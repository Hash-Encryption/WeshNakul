import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useRoom } from '../../context/RoomContext';
import { useLocale } from '../../context/LocaleContext';
import { Header } from '../common/Header';
import { TactileButton } from '../common/TactileButton';
import { SparkleRays, DoodleSquiggle } from '../common/DecorativeSparkles';
import { getCategoryById } from '../../lib/consensus';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export const TiebreakerScreen: React.FC = () => {
  const { currentRoom, isHost, resolveConsensus, participants } = useRoom();
  const { t, locale } = useLocale();

  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentRoom) return null;

  const tiedIds = currentRoom.tied_categories && currentRoom.tied_categories.length > 0
    ? currentRoom.tied_categories
    : ['burger', 'shawarma']; // safe fallback

  const contenders = tiedIds
    .map((id) => getCategoryById(id))
    .filter((c) => Boolean(c));

  // Determine tiebreaker type
  const isUnanimousTie = currentRoom.consensus_type === 'unanimous';

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F0443E', '#FFD75A', '#55B96A', '#73C8EA'],
      });
    } catch {
      // safe fallback
    }
  };

  // Host Direct Pick
  const handleDirectPick = async (categoryId: string) => {
    if (!isHost || isSpinning || isSubmitting) return;
    setIsSubmitting(true);
    try {
      triggerConfetti();
      await resolveConsensus(categoryId, 'host_picked');
    } catch (err) {
      console.error('Error resolving host pick', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Host Random Roll / Roulette
  const handleSpinWheel = async () => {
    if (!isHost || isSpinning || isSubmitting || contenders.length === 0) return;
    setIsSpinning(true);

    const totalSteps = getRandomInt(20, 30);
    const winnerIdx = getRandomInt(0, contenders.length);
    let currentStep = 0;
    const intervalMs = 100;

    const interval = setInterval(async () => {
      setHighlightedIndex((prev) => ((prev ?? 0) + 1) % contenders.length);
      currentStep++;

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setHighlightedIndex(winnerIdx);
        setIsSpinning(false);
        triggerConfetti();

        const winningCategory = contenders[winnerIdx];
        if (winningCategory) {
          setTimeout(async () => {
            await resolveConsensus(winningCategory.id, 'random_picked');
          }, 800);
        }
      }
    }, intervalMs);
  };

  return (
    <div className="relative flex flex-col justify-between min-h-[92dvh] w-full px-4 pb-6 selection:bg-brand-redSoft">
      <div>
        {/* Header */}
        <Header
          showBack={false}
          showMenu={false}
          participantCount={participants.length}
          showCount={true}
        />

        {/* Heading & Drama Notice */}
        <div className="text-center mt-2 mb-6 px-2 relative">
          <DoodleSquiggle className="absolute -top-1 start-4 transform -rotate-12" color="#F0443E" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/15 border border-brand-red/30 text-xs font-bold text-brand-red mb-2">
            <span>⚔️ {t('tiebreaker.heading')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-ink mb-1.5 font-alexandria tracking-tight">
            {t('tiebreaker.tiedOptionsTitle')}
          </h2>
          <p className="text-brand-gray text-xs sm:text-sm font-medium max-w-xs mx-auto">
            {isUnanimousTie
              ? t('tiebreaker.unanimousTieSubtitle')
              : t('tiebreaker.contendersSubtitle')}
          </p>
        </div>

        {/* Tied Contenders Showdown Cards */}
        <div className="max-w-md mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {contenders.map((cat, idx) => {
            if (!cat) return null;
            const isHighlighted = highlightedIndex === idx;
            const name = locale === 'ar' ? cat.ar : cat.en;

            return (
              <div
                key={cat.id}
                onClick={() => isHost && handleDirectPick(cat.id)}
                className={`
                  relative flex flex-col items-center justify-center p-4 rounded-3xl
                  border-2 border-brand-ink text-center transition-all duration-200 select-none
                  min-h-[140px]
                  ${
                    isHighlighted
                      ? 'bg-brand-yellow shadow-none translate-y-1 ring-4 ring-brand-red scale-105 z-10'
                      : 'bg-white shadow-[0_4px_0_#241B18]'
                  }
                  ${isHost ? 'cursor-pointer hover:bg-brand-redSoft/50 active:translate-y-1' : ''}
                `}
              >
                {isHost && (
                  <span className="absolute top-2 end-2 text-[10px] font-bold text-brand-muted bg-brand-cream px-1.5 py-0.5 rounded-full border border-brand-ink/10">
                    {t('tiebreaker.hostDirectPick')}
                  </span>
                )}

                <span className="text-4xl sm:text-5xl my-2 transform transition-transform group-hover:scale-110">
                  {cat.icon}
                </span>

                <span className="font-alexandria font-extrabold text-sm sm:text-base text-brand-ink mt-1">
                  {name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Host Controls or Guest Live Indicator */}
        <div className="max-w-md mx-auto">
          {isHost ? (
            <div className="bg-white rounded-3xl p-5 border-2 border-brand-ink shadow-[0_4px_0_#241B18] text-center">
              <h3 className="font-alexandria font-bold text-sm text-brand-ink mb-1 flex items-center justify-center gap-1.5">
                <span>{t('tiebreaker.hostActionHeading')}</span>
              </h3>
              <p className="text-xs text-brand-muted mb-4">
                {t('tiebreaker.contendersSubtitle')}
              </p>

              <div className="relative">
                <SparkleRays
                  className="absolute -top-3 end-4 transform rotate-12 scale-75 pointer-events-none"
                  color="#FFD75A"
                />
                <TactileButton
                  onClick={handleSpinWheel}
                  disabled={isSpinning || isSubmitting}
                  isLoading={isSpinning}
                  variant="yellow"
                  fullWidth
                  size="lg"
                  icon="🎲"
                >
                  {isSpinning ? t('tiebreaker.spinning') : t('tiebreaker.spinWheel')}
                </TactileButton>
              </div>
            </div>
          ) : (
            <div className="py-6 px-4 rounded-3xl bg-white border-2 border-brand-ink shadow-[0_3px_0_#241B18] text-center flex flex-col items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-full bg-brand-redSoft border border-brand-red flex items-center justify-center text-xl animate-bounce">
                ⏳
              </div>
              <span className="font-alexandria font-bold text-sm text-brand-ink">
                {t('tiebreaker.guestWaiting')}
              </span>
              <span className="text-xs text-brand-muted">
                {t('lobby.waitingOthers')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
