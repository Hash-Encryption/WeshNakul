import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import confetti from 'canvas-confetti';
import { useLocale } from '../../context/LocaleContext';
import { useRoom } from '../../context/RoomContext';
import { CaptainWheel } from '../common/CaptainWheel';
import { useCaptainWheel } from '../../hooks/useCaptainWheel';
import { LanguageToggle } from '../common/LanguageToggle';
import { SparkleRays } from '../common/DecorativeSparkles';
import type { CaptainCandidate, CaptainEventState, CaptainVoteType } from '../../types/captain';
import {
  startCaptainSelection,
  requestCaptainReroll,
  castCaptainVote,
  resolveCaptainEvent,
  getCaptainEventState,
  broadcastCaptainMessage,
  subscribeToCaptainEvents,
} from '../../lib/supabase';
import { getOrCreateSessionToken } from '../../lib/session';

interface CaptainRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame?: (captain: CaptainCandidate) => void;
  gameTitleKey?: string;
}

export const CaptainRouletteModal: React.FC<CaptainRouletteModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
}) => {
  const { t, locale } = useLocale();
  const { currentRoom, currentParticipant, participants, isHost } = useRoom();
  const reduceMotion = useReducedMotion();

  const [eventState, setEventState] = useState<CaptainEventState | null>(null);
  const [targetWinnerId, setTargetWinnerId] = useState<string | null>(null);
  const [isSpinningWheel, setIsSpinningWheel] = useState(false);
  const [objectionSecondsLeft, setObjectionSecondsLeft] = useState<number>(10);
  const [voteSecondsLeft, setVoteSecondsLeft] = useState<number>(15);
  const [isActionSubmitting, setIsActionSubmitting] = useState(false);
  const [hasVotedLocally, setHasVotedLocally] = useState<CaptainVoteType | null>(null);

  // Active participants list as candidates fallback
  const fallbackCandidates = useMemo<CaptainCandidate[]>(() => {
    return (participants || [])
      .filter((p) => p.status === 'active')
      .map((p) => ({
        id: p.id,
        nickname: p.nickname,
        initial: (p.nickname?.trim()?.[0] || '?').toUpperCase(),
        color: p.player_color,
        weight: 100,
      }));
  }, [participants]);

  const activeCandidates = useMemo<CaptainCandidate[]>(() => {
    if (eventState?.candidates && eventState.candidates.length > 0) {
      return eventState.candidates;
    }
    return fallbackCandidates;
  }, [eventState, fallbackCandidates]);

  // Selected candidate object (provisional or final)
  const currentWinnerCandidate = useMemo<CaptainCandidate | null>(() => {
    const winnerId = eventState?.finalCaptainId || eventState?.provisionalCaptainId || targetWinnerId;
    if (!winnerId) return null;
    return activeCandidates.find((c) => c.id === winnerId) || null;
  }, [eventState, targetWinnerId, activeCandidates]);

  // Winner revealed callback
  const handleRevealed = useCallback((_winnerId: string) => {
    if (!reduceMotion) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#F0443E', '#FFD75A', '#55B96A', '#73C8EA'],
        });
      } catch {}
    }
  }, [reduceMotion]);

  // Wheel controller hook
  const { wheelRef, needleRef, isSpinning } = useCaptainWheel({
    candidates: activeCandidates,
    isSpinning: isSpinningWheel,
    winnerId: targetWinnerId,
    reducedMotion: Boolean(reduceMotion),
    onRevealed: handleRevealed,
  });

  // Reconcile and apply state
  const applyState = useCallback((next: CaptainEventState | null) => {
    if (!next) return;
    setEventState(next);

    if (next.status === 'initial_result_provisional' || next.status === 'objection_window') {
      setTargetWinnerId(next.provisionalCaptainId);
    } else if (next.status === 'finalized' && next.finalCaptainId) {
      setTargetWinnerId(next.finalCaptainId);
    }

    if (currentParticipant?.id && next.votes?.[currentParticipant.id]) {
      setHasVotedLocally(next.votes[currentParticipant.id]);
    }
  }, [currentParticipant]);

  // Load existing event state or initialize if host
  useEffect(() => {
    if (!isOpen || !currentRoom?.id || !currentParticipant?.session_token) return;

    let mounted = true;
    const init = async () => {
      try {
        const existing = await getCaptainEventState(currentRoom.id, currentParticipant.session_token);
        if (mounted && existing) {
          applyState(existing);
          return;
        }

        // Host starts fresh selection if none exists
        if (isHost && !existing) {
          setIsSpinningWheel(true);
          const stableId = getOrCreateSessionToken();
          const initiated = await startCaptainSelection(currentRoom.id, currentParticipant.session_token, stableId);
          if (mounted) {
            applyState(initiated);
            setIsSpinningWheel(true);
            setTargetWinnerId(initiated.provisionalCaptainId);
            // Broadcast start to squad
            void broadcastCaptainMessage(currentRoom.id, {
              type: 'captain_spin_start',
              eventId: initiated.eventId,
              provisionalWinnerId: initiated.provisionalCaptainId,
              candidates: initiated.candidates,
              objectionEndsAt: initiated.objectionEndsAt || '',
            });
          }
        }
      } catch (err) {
        console.error('Failed to init captain roulette', err);
      }
    };

    void init();
    return () => {
      mounted = false;
    };
  }, [isOpen, currentRoom?.id, currentParticipant?.session_token, isHost, applyState]);

  // Realtime subscription across room
  useEffect(() => {
    if (!isOpen || !currentRoom?.id) return;

    const unsubscribe = subscribeToCaptainEvents(currentRoom.id, (msg) => {
      if (msg.type === 'captain_spin_start') {
        setIsSpinningWheel(true);
        setTargetWinnerId(msg.provisionalWinnerId);
        setEventState(() => ({
          eventId: msg.eventId,
          status: 'initial_result_provisional',
          provisionalCaptainId: msg.provisionalWinnerId,
          provisionalCaptainNickname: msg.candidates.find((c) => c.id === msg.provisionalWinnerId)?.nickname || '',
          frozenVoterIds: msg.candidates.map((c) => c.id),
          votes: {},
          approvals: 0,
          rejections: 0,
          requiredApprovals: Math.floor(msg.candidates.length / 2) + 1,
          voterCount: msg.candidates.length,
          objectionEndsAt: msg.objectionEndsAt,
          hasRerolled: false,
          candidates: msg.candidates,
        }));
      } else if (msg.type === 'captain_reroll_requested') {
        setEventState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'reroll_vote_open',
            requesterParticipantId: msg.requesterParticipantId,
            requesterNickname: msg.requesterNickname,
            voteEndsAt: msg.voteEndsAt,
            requiredApprovals: msg.requiredApprovals,
            voterCount: msg.voterCount,
            votes: msg.votes,
            approvals: 1,
            hasRerolled: true,
          };
        });
      } else if (msg.type === 'captain_vote_cast') {
        setEventState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            votes: msg.votes,
            approvals: msg.approvals,
            rejections: msg.rejections,
          };
        });
      } else if (msg.type === 'captain_finalized') {
        setTargetWinnerId(msg.finalCaptainId);
        setEventState((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'finalized',
            finalCaptainId: msg.finalCaptainId,
            finalCaptainNickname: msg.finalCaptainNickname,
            finalDecision: msg.finalDecision,
            hasRerolled: msg.hasRerolled,
          };
        });
        if (!reduceMotion) {
          try {
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.55 },
              colors: ['#F0443E', '#FFD75A', '#55B96A'],
            });
          } catch {}
        }
      }
    });

    return () => unsubscribe();
  }, [isOpen, currentRoom?.id, reduceMotion]);

  // 10s Objection countdown timer
  useEffect(() => {
    if (eventState?.status !== 'initial_result_provisional' && eventState?.status !== 'objection_window') {
      return;
    }
    if (!eventState.objectionEndsAt) return;

    const interval = setInterval(() => {
      const remainingMs = new Date(eventState.objectionEndsAt!).getTime() - Date.now();
      const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
      setObjectionSecondsLeft(seconds);

      // Timeout resolution
      if (seconds <= 0) {
        clearInterval(interval);
        if (currentRoom?.id && eventState.eventId) {
          void resolveCaptainEvent(currentRoom.id, eventState.eventId).then((resolved) => {
            applyState(resolved);
            if (resolved.status === 'finalized' && resolved.finalCaptainId) {
              void broadcastCaptainMessage(currentRoom.id, {
                type: 'captain_finalized',
                eventId: eventState.eventId,
                finalDecision: 'uncontested',
                finalCaptainId: resolved.finalCaptainId,
                finalCaptainNickname: resolved.finalCaptainNickname || '',
                hasRerolled: false,
              });
            }
          });
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [eventState?.status, eventState?.objectionEndsAt, eventState?.eventId, currentRoom?.id, applyState]);

  // 15s Vote countdown timer
  useEffect(() => {
    if (eventState?.status !== 'reroll_vote_open' || !eventState.voteEndsAt) return;

    const interval = setInterval(() => {
      const remainingMs = new Date(eventState.voteEndsAt!).getTime() - Date.now();
      const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
      setVoteSecondsLeft(seconds);

      // Vote expired resolution
      if (seconds <= 0) {
        clearInterval(interval);
        if (currentRoom?.id && eventState.eventId) {
          void resolveCaptainEvent(currentRoom.id, eventState.eventId).then((resolved) => {
            applyState(resolved);
            if (resolved.status === 'finalized' && resolved.finalCaptainId) {
              void broadcastCaptainMessage(currentRoom.id, {
                type: 'captain_finalized',
                eventId: eventState.eventId,
                finalDecision: resolved.finalDecision || 'rejected',
                finalCaptainId: resolved.finalCaptainId,
                finalCaptainNickname: resolved.finalCaptainNickname || '',
                hasRerolled: true,
              });
            }
          });
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [eventState?.status, eventState?.voteEndsAt, eventState?.eventId, currentRoom?.id, applyState]);

  // Handle Reroll Request
  const handleRequestReroll = async () => {
    if (!currentRoom?.id || !eventState?.eventId || !currentParticipant?.session_token) return;
    if (isActionSubmitting || eventState.hasRerolled) return;

    setIsActionSubmitting(true);
    try {
      const res = await requestCaptainReroll(currentRoom.id, eventState.eventId, currentParticipant.session_token);
      applyState(res);
      setHasVotedLocally('approve');
      void broadcastCaptainMessage(currentRoom.id, {
        type: 'captain_reroll_requested',
        eventId: eventState.eventId,
        requesterParticipantId: currentParticipant.id,
        requesterNickname: currentParticipant.nickname,
        voteEndsAt: res.voteEndsAt || '',
        requiredApprovals: res.requiredApprovals,
        voterCount: res.voterCount,
        votes: res.votes || {},
      });
    } catch (err: any) {
      console.warn('Reroll request error', err);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Handle Cast Vote
  const handleCastVote = async (vote: CaptainVoteType) => {
    if (!currentRoom?.id || !eventState?.eventId || !currentParticipant?.session_token) return;
    if (isActionSubmitting || hasVotedLocally) return;

    setIsActionSubmitting(true);
    setHasVotedLocally(vote);
    try {
      const res = await castCaptainVote(currentRoom.id, eventState.eventId, currentParticipant.session_token, vote);
      applyState(res);

      if (res.status === 'finalized') {
        void broadcastCaptainMessage(currentRoom.id, {
          type: 'captain_finalized',
          eventId: eventState.eventId,
          finalDecision: res.finalDecision || (vote === 'approve' ? 'approved' : 'rejected'),
          finalCaptainId: res.finalCaptainId || '',
          finalCaptainNickname: res.finalCaptainNickname || '',
          hasRerolled: true,
        });
      } else {
        void broadcastCaptainMessage(currentRoom.id, {
          type: 'captain_vote_cast',
          eventId: eventState.eventId,
          votes: res.votes,
          approvals: res.approvals,
          rejections: res.rejections,
        });
      }
    } catch (err: any) {
      console.warn('Cast vote error', err);
    } finally {
      setIsActionSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isProvisional = eventState?.status === 'initial_result_provisional' || eventState?.status === 'objection_window';
  const isVoting = eventState?.status === 'reroll_vote_open';
  const isFinalized = eventState?.status === 'finalized';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#241B18]/60 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-sm sm:max-w-md bg-[#FAF4ED] border-3 border-[#241B18] rounded-3xl shadow-[0px_8px_0px_#241B18] overflow-hidden flex flex-col p-4 sm:p-5"
      >
        {/* Top bar: Back/Close button + Language Toggle */}
        <div className="flex items-center justify-between w-full mb-1">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] active:translate-y-0.5 active:shadow-none flex items-center justify-center text-[#241B18] hover:bg-[#FFFDF8] transition-all cursor-pointer"
            aria-label={t('captainRoulette.close')}
          >
            <svg
              className={`w-5 h-5 ${locale === 'ar' ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <LanguageToggle />
        </div>

        {/* Section Headline */}
        <div className="relative text-center my-1">
          <div className="flex items-center justify-center gap-2">
            <SparkleRays className="w-5 h-5 text-[#FFD75A]" />
            <h2 className="font-alexandria font-black text-2xl sm:text-3xl text-[#241B18] tracking-tight">
              {t('captainRoulette.title')}
            </h2>
            <SparkleRays className="w-5 h-5 text-[#FFD75A]" />
          </div>
          <p className="font-alexandria font-bold text-xs sm:text-sm text-[#7A6E67] mt-0.5">
            {t('captainRoulette.subtitle')}
          </p>
        </div>

        {/* Ship-Wheel Roulette */}
        <CaptainWheel
          candidates={activeCandidates}
          isSpinning={isSpinning || isSpinningWheel}
          wheelRef={wheelRef}
          needleRef={needleRef}
        />

        {/* Result & Objection / Voting Experience Card */}
        <div className="flex flex-col gap-3 w-full mt-1">
          {/* Provisional Result / Final Winner Card */}
          <AnimatePresence mode="wait">
            {currentWinnerCandidate && (
              <motion.div
                key={`winner-card-${currentWinnerCandidate.id}-${eventState?.status}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="w-full bg-white border-2 border-[#241B18] rounded-2xl p-3.5 shadow-[0px_3px_0px_#241B18] flex items-center gap-3 relative overflow-hidden"
              >
                {/* Avatar with candidate color and initial */}
                <div
                  className="w-12 h-12 rounded-full border-2 border-[#241B18] flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: currentWinnerCandidate.color || '#FFD75A' }}
                >
                  <span className="font-alexandria font-black text-xl text-[#241B18]">
                    {currentWinnerCandidate.initial}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-alexandria font-black text-base sm:text-lg text-[#241B18] truncate leading-tight">
                    {isFinalized
                      ? t('captainRoulette.finalCaptainBanner', { name: currentWinnerCandidate.nickname })
                      : t('captainRoulette.provisionalBanner', { name: currentWinnerCandidate.nickname })}
                  </h3>

                  {isProvisional && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-[#FFD75A] animate-ping" />
                      <p className="font-alexandria font-bold text-xs text-[#7A6E67]">
                        {t('captainRoulette.objectionWindow', { seconds: objectionSecondsLeft })}
                      </p>
                    </div>
                  )}

                  {isVoting && (
                    <p className="font-alexandria font-bold text-xs text-[#F0443E] mt-0.5">
                      {t('captainRoulette.voteRemaining', { seconds: voteSecondsLeft })}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VOTING STATE CONTROLS */}
          {isVoting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full bg-[#FFF9F5] border-2 border-[#241B18] rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-[0px_3px_0px_#241B18]"
            >
              <div className="flex items-center justify-between">
                <span className="font-alexandria font-black text-xs text-[#241B18]">
                  {t('captainRoulette.voteTitle')}
                </span>
                <span className="font-alexandria font-black text-xs text-[#F0443E]">
                  {t('captainRoulette.votesCount', {
                    approvals: eventState.approvals || 0,
                    required: eventState.requiredApprovals || 2,
                  })}
                </span>
              </div>

              {/* Progress bar of votes */}
              <div className="w-full bg-[#F2E8DF] rounded-full h-2.5 overflow-hidden border border-[#241B18]/20">
                <div
                  className="h-full bg-[#55B96A] transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round(((eventState.approvals || 0) / (eventState.requiredApprovals || 2)) * 100))}%`,
                  }}
                />
              </div>

              {/* Vote buttons */}
              {hasVotedLocally ? (
                <div className="w-full py-2 px-3 rounded-xl bg-white border border-[#241B18]/20 text-center font-alexandria font-bold text-xs text-[#55B96A]">
                  {hasVotedLocally === 'approve'
                    ? t('captainRoulette.votedApprove')
                    : t('captainRoulette.votedReject')}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    disabled={isActionSubmitting}
                    onClick={() => handleCastVote('approve')}
                    className="w-full py-2.5 px-2 rounded-xl bg-[#55B96A] text-white border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] active:translate-y-0.5 active:shadow-none font-alexandria font-black text-xs flex items-center justify-center gap-1 hover:brightness-105 cursor-pointer disabled:opacity-50"
                  >
                    <span>👍</span>
                    <span>{t('captainRoulette.approveVote')}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isActionSubmitting}
                    onClick={() => handleCastVote('reject')}
                    className="w-full py-2.5 px-2 rounded-xl bg-white text-[#241B18] border-2 border-[#241B18] shadow-[0px_2px_0px_#241B18] active:translate-y-0.5 active:shadow-none font-alexandria font-black text-xs flex items-center justify-center gap-1 hover:bg-[#FFFDF8] cursor-pointer disabled:opacity-50"
                  >
                    <span>✋</span>
                    <span>{t('captainRoulette.rejectVote')}</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ACTION BUTTONS (Start Game & Request Reroll) */}
          <div className="flex flex-col gap-2 w-full">
            {/* Primary Action: Start Game (Active when finalized) */}
            {isFinalized && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                type="button"
                onClick={() => {
                  if (currentWinnerCandidate && onStartGame) {
                    onStartGame(currentWinnerCandidate);
                  }
                  onClose();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#F0443E] text-white border-2 border-[#241B18] shadow-[0px_4px_0px_#241B18] active:translate-y-0.5 active:shadow-none hover:brightness-105 transition-all font-alexandria font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>{t('captainRoulette.startGame')}</span>
              </motion.button>
            )}

            {/* Secondary Action: Request Reroll during 10s objection window */}
            {isProvisional && !eventState?.hasRerolled && (
              <button
                type="button"
                disabled={isActionSubmitting}
                onClick={handleRequestReroll}
                className="w-full py-3 px-4 rounded-2xl bg-white text-[#F0443E] border-2 border-[#F0443E] shadow-[0px_3px_0px_#F0443E] active:translate-y-0.5 active:shadow-none hover:bg-[#FFF8F8] transition-all font-alexandria font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 text-[#F0443E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                <span>{t('captainRoulette.requestReroll')}</span>
              </button>
            )}

            {/* Already Rerolled Badge */}
            {isFinalized && eventState?.hasRerolled && (
              <div className="w-full py-1 text-center font-alexandria font-bold text-[11px] text-[#7A6E67]">
                {t('captainRoulette.alreadyRerolled')}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
