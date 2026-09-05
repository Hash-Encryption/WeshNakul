import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, insertRestaurantSwipe, getRestaurantSwipes, updateRoomStage, fetchDeckRestaurants } from '../lib/supabase';
import type { RestaurantItem, RestaurantSwipe } from '../types/restaurant';
import type { EatingMode } from '../types/database';
import { getDeckForRoom, isDineInEligible } from '../data/restaurants';
import { CITYWIDE_STAPLES } from '../data/fallbackStaples';

interface SwiperProps {
  roomId: string;
  participantId: string;
  isHost: boolean;
  totalParticipants: number;
  category: string;
  city: string;
  district?: string;
  eatingMode?: EatingMode;
  stage?: string;
  onMatched?: (winner: RestaurantItem) => void;
}

export function useRestaurantSwiper({
  roomId,
  participantId,
  isHost: _isHost,
  totalParticipants: _totalParticipants,
  category,
  city,
  district,
  eatingMode,
  stage = 'swiping',
  onMatched,
}: SwiperProps) {
  // Synchronous initial fallback deck (0ms overhead)
  const [deck, setDeck] = useState<RestaurantItem[]>(() =>
    getDeckForRoom(category, city, district, CITYWIDE_STAPLES, eatingMode)
  );
  const [cachedPool, setCachedPool] = useState<RestaurantItem[]>(CITYWIDE_STAPLES);
  const [isLoadingDeck, setIsLoadingDeck] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allSwipes, setAllSwipes] = useState<RestaurantSwipe[]>([]);
  const [showRoundTwoToast, setShowRoundTwoToast] = useState(false);
  const matchCommittedRef = useRef(false);

  // Staged lifecycle: strictly defer Supabase query until stage === 'swiping'
  useEffect(() => {
    if (stage !== 'swiping' || !category) {
      return;
    }

    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) setIsLoadingDeck(true);
    });

    fetchDeckRestaurants(category)
      .then((fetchedPool) => {
        if (!isMounted) return;
        const validPool = eatingMode === 'dine_in' ? fetchedPool.filter(isDineInEligible) : fetchedPool;
        setCachedPool(validPool);
        const computedDeck = getDeckForRoom(category, city, district, validPool, eatingMode);
        setDeck(computedDeck);
        setIsLoadingDeck(false);
      })
      .catch((err) => {
        console.warn('Failed to fetch restaurants pool, falling back to staples', err);
        if (!isMounted) return;
        setDeck(getDeckForRoom(category, city, district, CITYWIDE_STAPLES, eatingMode));
        setIsLoadingDeck(false);
      });

    return () => {
      isMounted = false;
    };
  }, [stage, category, city, district, eatingMode]);

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
      if (event.data?.type === 'ROOM_UPDATED' && (!event.data.roomId || event.data.roomId === roomId)) {
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

      if (nextIndex >= deck.length && totalLikesWillBe === 0) {
        // Auto-restack loop triggered!
        setShowRoundTwoToast(true);
        // Refresh local deck from catalog pool and reset index to 0
        const freshDeck = getDeckForRoom(category, city, district, cachedPool, eatingMode);
        setDeck(freshDeck);
        setCurrentIndex(0);
      } else {
        setCurrentIndex(nextIndex);
      }

      try {
        const recorded = await insertRestaurantSwipe(roomId, participantId, item.id, liked);
        setAllSwipes((prev) => [...prev.filter((s) => s.id !== recorded.id), recorded]);
      } catch (err) {
        console.error('Failed to record swipe', err);
      }
    },
    [currentIndex, deck, allSwipes, participantId, category, city, district, cachedPool, eatingMode, roomId]
  );

  return {
    deck,
    currentItem: deck[currentIndex] || null,
    currentIndex,
    totalCards: deck.length,
    isDeckFinished: currentIndex >= deck.length,
    isLoadingDeck,
    recordSwipe,
    skipCard,
    allSwipes,
    commitWinner,
    showRoundTwoToast,
    dismissRoundTwoToast: () => setShowRoundTwoToast(false),
  };
}
