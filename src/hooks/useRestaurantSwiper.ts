import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, insertRestaurantSwipe, getRestaurantSwipes, updateRoomStage, fetchDeckRestaurants } from '../lib/supabase';
import type { RestaurantItem, RestaurantSwipe } from '../types/restaurant';

interface SwiperProps {
  roomId: string;
  participantId: string;
  sessionToken: string;
  isHost: boolean;
  totalParticipants: number;
  category: string;
  stage?: string;
  onMatched?: (winner: RestaurantItem) => void;
}

export function useRestaurantSwiper({
  roomId,
  participantId,
  sessionToken,
  isHost: _isHost,
  totalParticipants: _totalParticipants,
  category,
  stage = 'swiping',
  onMatched,
}: SwiperProps) {
  const [deck, setDeck] = useState<RestaurantItem[]>([]);
  const [deckId, setDeckId] = useState<string | null>(null);
  const [isLoadingDeck, setIsLoadingDeck] = useState<boolean>(true);
  const [deckError, setDeckError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allSwipes, setAllSwipes] = useState<RestaurantSwipe[]>([]);
  const [showRoundTwoToast, setShowRoundTwoToast] = useState(false);
  const matchCommittedRef = useRef(false);

  // Staged lifecycle: strictly defer Supabase query until stage === 'swiping'
  useEffect(() => {
    if (stage !== 'swiping' || !category || !roomId || !participantId || !sessionToken) {
      return;
    }

    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) setIsLoadingDeck(true);
    });

    fetchDeckRestaurants(roomId, participantId, sessionToken)
      .then((response) => {
        if (!isMounted) return;
        setDeck(response.restaurants);
        setDeckId(response.deckId);
        setDeckError(response.restaurants.length ? null : 'NO_ELIGIBLE_RESTAURANTS');
        setIsLoadingDeck(false);
      })
      .catch((err) => {
        console.error('Failed to fetch authoritative restaurant deck', err);
        if (!isMounted) return;
        setDeck([]);
        setDeckError('DECK_UNAVAILABLE');
        setIsLoadingDeck(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stage, category, roomId, participantId, sessionToken]);

  // Load existing swipes and subscribe to realtime updates
  useEffect(() => {
    if (!roomId) return;

    let isMounted = true;

    const fetchSwipes = async () => {
      const data = await getRestaurantSwipes(roomId);
      if (isMounted) {
        setAllSwipes(data);
      }
    };
    fetchSwipes();

    // Supabase subscription if available
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel(`room_swipes_${roomId}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'restaurant_swipes', filter: `room_id=eq.${roomId}` },
          (payload: any) => {
            const item: RestaurantSwipe = {
              id: payload.new.id,
              roomId: payload.new.room_id,
              participantId: payload.new.participant_id,
              restaurantId: payload.new.restaurant_id,
              liked: payload.new.liked,
              createdAt: payload.new.created_at,
            };
            setAllSwipes((prev) => [...prev.filter((s) => s.id !== item.id), item]);
          }
        )
        .subscribe();
    }

    // Local multi-tab broadcast listener for instant zero-config sync
    const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel('wsh_room_sync')
      : null;

    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'ROOM_RESET' && (!event.data.roomId || event.data.roomId === roomId)) {
        setAllSwipes([]);
        setCurrentIndex(0);
      } else if (event.data?.type === 'ROOM_UPDATED' && (!event.data.roomId || event.data.roomId === roomId)) {
        if (event.data.swipe) {
          const swipe = event.data.swipe as RestaurantSwipe;
          setAllSwipes((prev) => [...prev.filter((s) => s.id !== swipe.id), swipe]);
        } else {
          fetchSwipes();
        }
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'wsh_mock_restaurant_swipes') {
        fetchSwipes();
      }
    };

    broadcastChannel?.addEventListener('message', handleBroadcast);
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
      broadcastChannel?.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
    };
  }, [roomId]);

  const commitWinner = useCallback(
    async (winner: RestaurantItem) => {
      if (matchCommittedRef.current) return;
      matchCommittedRef.current = true;
      onMatched?.(winner);

      await updateRoomStage(roomId, 'matched', {
        winning_restaurant_id: winner.id,
      });
    },
    [onMatched, roomId]
  );

  // Skip / Later action: move current card to the back of the deck without recording a vote
  const skipCard = useCallback(() => {
    if (currentIndex >= deck.length) return;
    setDeck((prevDeck) => {
      if (currentIndex >= prevDeck.length) return prevDeck;
      const currentCard = prevDeck[currentIndex];
      return [
        ...prevDeck.slice(0, currentIndex),
        ...prevDeck.slice(currentIndex + 1),
        currentCard,
      ];
    });
  }, [currentIndex, deck.length]);

  const recordSwipe = useCallback(
    async (liked: boolean) => {
      if (currentIndex >= deck.length) return;
      const item = deck[currentIndex];
      const nextIndex = currentIndex + 1;

      // Check auto-restack condition:
      // If this is the last card in the deck and participant has 0 likes so far (and this swipe is NOT a like)
      const myLikes = allSwipes.filter((s) => s.participantId === participantId && s.liked);
      const totalLikesWillBe = myLikes.length + (liked ? 1 : 0);

      try {
        const recorded = await insertRestaurantSwipe(roomId, participantId, item.id, liked);
        setAllSwipes((prev) => [...prev.filter((s) => s.id !== recorded.id), recorded]);
        if (nextIndex >= deck.length && totalLikesWillBe === 0 && deckId) {
          setIsLoadingDeck(true);
          const nextDeck = await fetchDeckRestaurants(roomId, participantId, sessionToken, deckId);
          if (nextDeck.restaurants.length) {
            setDeck(nextDeck.restaurants);
            setDeckId(nextDeck.deckId);
            setCurrentIndex(0);
            setShowRoundTwoToast(true);
          } else {
            setCurrentIndex(nextIndex);
          }
          setIsLoadingDeck(false);
        } else {
          setCurrentIndex(nextIndex);
        }
      } catch (err) {
        console.error('Failed to record swipe', err);
        setDeckError('DECK_UNAVAILABLE');
        setIsLoadingDeck(false);
      }
    },
    [currentIndex, deck, allSwipes, participantId, roomId, sessionToken, deckId]
  );

  return {
    deck,
    currentItem: deck[currentIndex] || null,
    currentIndex,
    totalCards: deck.length,
    isDeckFinished: deck.length > 0 && currentIndex >= deck.length,
    isLoadingDeck,
    deckError,
    recordSwipe,
    skipCard,
    allSwipes,
    commitWinner,
    showRoundTwoToast,
    dismissRoundTwoToast: () => setShowRoundTwoToast(false),
  };
}
