import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchDeckRestaurants, getRoomDecisionState, submitRestaurantVote } from '../lib/supabase';
import type { RestaurantItem, RestaurantVote } from '../types/restaurant';
import type { RestaurantSummary } from '../types/database';
import { logDeckError } from '../lib/observability';

interface SwiperProps {
  roomId: string;
  participantId: string;
  sessionToken: string;
  version: number;
  category: string;
  stage?: string;
  summary?: RestaurantSummary;
  onRefresh: () => Promise<void>;
  onMatched?: (winner: RestaurantItem) => void;
  onAuthoritativeState?: (state: import('../types/database').RoomDecisionState) => void;
}

export function useRestaurantSwiper({
  roomId,
  participantId,
  sessionToken,
  version,
  category,
  stage = 'swiping',
  summary,
  onRefresh,
  onMatched,
  onAuthoritativeState,
}: SwiperProps) {
  const [traversal, setTraversal] = useState<{ deck: RestaurantItem[]; deckId: string | null; currentIndex: number }>({
    deck: [],
    deckId: null,
    currentIndex: 0,
  });
  const { deck, deckId, currentIndex } = traversal;
  const [isLoadingDeck, setIsLoadingDeck] = useState(true);
  const [deckError, setDeckError] = useState<string | null>(null);
  const [myVotes, setMyVotes] = useState<Record<string, RestaurantVote>>({});
  const [showRoundTwoToast, setShowRoundTwoToast] = useState(false);
  const versionRef = useRef(version);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingItemsRef = useRef(new Set<string>());
  const reloadTriggerRef = useRef(0);
  const [reloadCounter, setReloadCounter] = useState(0);

  const reloadDeck = useCallback(() => {
    reloadTriggerRef.current += 1;
    setIsLoadingDeck(true);
    setDeckError(null);
    setReloadCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    versionRef.current = Math.max(versionRef.current, version);
  }, [version]);

  // Preload upcoming restaurant images for zero-lag card advancement
  useEffect(() => {
    if (!deck || deck.length === 0 || typeof Image === 'undefined') return;
    const safeIndex = Number.isFinite(currentIndex) ? Math.max(0, currentIndex) : 0;
    const toPreload = [deck[safeIndex], deck[safeIndex + 1], deck[safeIndex + 2]];
    toPreload.forEach((item) => {
      if (item?.imageUrl) {
        try {
          const img = new Image();
          img.src = item.imageUrl;
        } catch {
          // Preload errors must never interrupt UX
        }
      }
    });
  }, [deck, currentIndex]);

  // Fetch and hydrate deck
  useEffect(() => {
    if (stage !== 'swiping' || !category || !roomId || !participantId || !sessionToken) return;
    let active = true;

    Promise.all([
      fetchDeckRestaurants(roomId, participantId, sessionToken),
      getRoomDecisionState(roomId, sessionToken),
    ])
      .then(([nextDeck, state]) => {
        if (!active) return;
        const serverVotes = state.myVotes || {};
        setMyVotes(serverVotes);

        setTraversal((current) => {
          // Safe filtering: only accept candidates with valid ID
          const validNext = Array.isArray(nextDeck?.restaurants)
            ? nextDeck.restaurants.filter((item): item is RestaurantItem => Boolean(item && typeof item === 'object' && item.id))
            : [];

          const sameDeck = current.deckId === nextDeck?.deckId;
          const fresh = new Map(validNext.map((item) => [item.id, item]));

          const ordered = sameDeck && current.deck.length > 0
            ? [
                ...current.deck.map((item) => fresh.get(item.id)).filter((item): item is RestaurantItem => Boolean(item)),
                ...validNext.filter((item) => !current.deck.some((existing) => existing.id === item.id)),
              ]
            : validNext;

          if (ordered.length === 0) {
            return { deck: [], deckId: nextDeck?.deckId || null, currentIndex: 0 };
          }

          const start = sameDeck && Number.isFinite(current.currentIndex)
            ? Math.min(Math.max(0, Math.floor(current.currentIndex)), ordered.length)
            : 0;

          // Find first unvoted candidate starting from `start`
          let pending = ordered.findIndex((item, index) => index >= start && !['YES', 'NO'].includes(serverVotes[item.id] || ''));
          if (pending < 0) {
            // Check earlier items (e.g. items placed LATER)
            pending = ordered.findIndex((item) => !['YES', 'NO'].includes(serverVotes[item.id] || ''));
          }

          const resolvedIndex = pending < 0 ? ordered.length : pending;

          return {
            deck: ordered,
            deckId: nextDeck?.deckId || null,
            currentIndex: resolvedIndex,
          };
        });

        setDeckError(nextDeck?.restaurants?.length ? null : 'NO_ELIGIBLE_RESTAURANTS');
        setIsLoadingDeck(false);
      })
      .catch((error) => {
        logDeckError({
          roomId,
          sessionToken,
          category,
          eventPhase: 'restoration',
          error,
          message: 'Failed to load authoritative decision state or deck',
        });
        if (active) {
          setDeckError('DECK_UNAVAILABLE');
          setIsLoadingDeck(false);
        }
      });

    return () => {
      active = false;
    };
  }, [stage, category, roomId, participantId, sessionToken, summary?.deckId, reloadCounter]);



  const recordVote = useCallback(
    (vote: RestaurantVote) => {
      if (!deckId || !Array.isArray(deck) || deck.length === 0) return Promise.resolve();
      const safeIndex = Number.isFinite(currentIndex) ? Math.max(0, Math.floor(currentIndex)) : 0;
      if (safeIndex >= deck.length) return Promise.resolve();

      const item = deck[safeIndex];
      if (!item || !item.id) return Promise.resolve();

      if (pendingItemsRef.current.has(item.id)) return Promise.resolve();
      pendingItemsRef.current.add(item.id);

      const previousVote = myVotes[item.id];
      setMyVotes((current) => ({ ...current, [item.id]: vote }));

      setTraversal((current) => {
        if (current.deckId !== deckId) return current;
        const cIndex = Number.isFinite(current.currentIndex) ? Math.max(0, Math.floor(current.currentIndex)) : 0;
        if (cIndex >= current.deck.length || current.deck[cIndex]?.id !== item.id) return current;

        if (vote === 'LATER') {
          const reordered = [
            ...current.deck.slice(0, cIndex),
            ...current.deck.slice(cIndex + 1),
            item,
          ];
          return {
            ...current,
            deck: reordered,
            // Keep currentIndex pointing at the card that shifted into this slot, unless we were at the end
            currentIndex: Math.min(cIndex, Math.max(0, reordered.length - 1)),
          };
        } else {
          const nextIndex = cIndex + 1;
          if (nextIndex >= current.deck.length) {
            // Find if any other cards still need a YES/NO vote (e.g. pushed with LATER)
            const unvotedIdx = current.deck.findIndex(
              (card, i) => i !== cIndex && !['YES', 'NO'].includes(myVotes[card.id] || '')
            );
            if (unvotedIdx >= 0) {
              return {
                ...current,
                currentIndex: unvotedIdx,
              };
            }
          }
          return {
            ...current,
            currentIndex: nextIndex,
          };
        }
      });

      const submit = async () => {
        const accept = async (state: Awaited<ReturnType<typeof submitRestaurantVote>>) => {
          versionRef.current = Math.max(versionRef.current, state.room.version);
          setMyVotes(state.myVotes || {});
          if (state.room.stage === 'matched') onMatched?.(item);
          const nextDeckId = state.room.restaurant_summary?.deckId;
          if (nextDeckId && nextDeckId !== deckId) {
            setShowRoundTwoToast(true);
            setIsLoadingDeck(true);
          }
          if (onAuthoritativeState) {
            onAuthoritativeState(state);
          } else {
            await onRefresh();
          }
        };

        try {
          await accept(await submitRestaurantVote(roomId, sessionToken, versionRef.current, deckId, item.id, vote));
        } catch (error) {
          let failure = error;
          if ((failure as { code?: string })?.code === 'PT409') {
            try {
              const canonical = await getRoomDecisionState(roomId, sessionToken);
              versionRef.current = Math.max(versionRef.current, canonical.room.version);
              if (canonical.room.stage === 'swiping' && canonical.room.restaurant_summary?.deckId === deckId) {
                await accept(await submitRestaurantVote(roomId, sessionToken, versionRef.current, deckId, item.id, vote));
                return;
              }
            } catch (retryError) {
              failure = retryError;
            }
          }

          const isStale = (failure as { code?: string })?.code === 'PT409';
          if (!isStale) {
            logDeckError({
              roomId,
              sessionToken,
              deckId,
              candidateId: item.id,
              eventPhase: 'vote_submission',
              error: failure,
              message: 'Failed to record authoritative vote',
            });
          }

          // Rollback optimistic traversal
          setTraversal((current) => {
            const index = current.deck.findIndex((card) => card.id === item.id);
            if (index < 0) return current;
            const remaining = current.deck.filter((card) => card.id !== item.id);
            const insertAt = Math.min(safeIndex, remaining.length);
            return {
              ...current,
              deck: [...remaining.slice(0, insertAt), item, ...remaining.slice(insertAt)],
              currentIndex: insertAt,
            };
          });

          // Rollback vote
          setMyVotes((current) => {
            const next = { ...current };
            if (previousVote) next[item.id] = previousVote;
            else delete next[item.id];
            return next;
          });

          try {
            const canonical = await getRoomDecisionState(roomId, sessionToken);
            versionRef.current = Math.max(versionRef.current, canonical.room.version);
            setMyVotes(canonical.myVotes || {});
            if (onAuthoritativeState) onAuthoritativeState(canonical);
          } catch {
            /* refresh reports the original error */
          }

          if (!onAuthoritativeState) {
            await onRefresh();
          }
          if (!isStale) setDeckError('DECK_UNAVAILABLE');
        } finally {
          pendingItemsRef.current.delete(item.id);
        }
      };

      const queued = queueRef.current.then(submit, submit);
      queueRef.current = queued.catch(() => {});
      return queued;
    },
    [deckId, currentIndex, deck, myVotes, roomId, sessionToken, onMatched, onRefresh, onAuthoritativeState]
  );

  const hasDeck = Array.isArray(deck) && deck.length > 0;
  const allVoted = hasDeck && deck.every((item) => Boolean(item && item.id && ['YES', 'NO'].includes(myVotes[item.id] || '')));
  const boundsReached = hasDeck && currentIndex >= deck.length;
  const hasUnvotedCandidate = hasDeck && deck.some((item) => Boolean(item && item.id && !['YES', 'NO'].includes(myVotes[item.id] || '')));
  const isDeckFinished = hasDeck && (allVoted || (boundsReached && !hasUnvotedCandidate));

  return {
    deck,
    currentIndex,
    totalCards: deck.length,
    isDeckFinished,
    isLoadingDeck,
    deckError,
    recordVote,
    reloadDeck,
    summary,
    myVotes,
    showRoundTwoToast,
    dismissRoundTwoToast: () => setShowRoundTwoToast(false),
  };
}
