import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { supabase, insertRestaurantSwipe, getRestaurantSwipes, updateRoomStage } from '../lib/supabase';
import type { RestaurantItem, RestaurantSwipe } from '../types/restaurant';
import { getDeckForRoom } from '../data/restaurants';

interface SwiperProps {
  roomId: string;
  participantId: string;
  isHost: boolean;
  totalParticipants: number;
  category: string;
  city: string;
  district?: string;
  onMatched: (winner: RestaurantItem) => void;
}

export function useRestaurantSwiper({
  roomId,
  participantId,
  isHost,
  totalParticipants,
  category,
  city,
  district,
  onMatched,
}: SwiperProps) {
  const deck = useMemo(
    () => getDeckForRoom(category, city, district),
    [category, city, district]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [allSwipes, setAllSwipes] = useState<RestaurantSwipe[]>([]);
  const matchCommittedRef = useRef(false);

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
      onMatched(winner);

      await updateRoomStage(roomId, 'matched', {
        winning_restaurant_id: winner.id,
      });
    },
    [onMatched, roomId]
  );

  // Evaluate consensus: Instant Unanimous or Deck Exhaustion Fallback
  useEffect(() => {
    if (deck.length === 0 || totalParticipants === 0 || matchCommittedRef.current) return;

    // 1. Instant 100% Unanimous Match
    for (const item of deck) {
      const likes = allSwipes.filter((s) => s.restaurantId === item.id && s.liked);
      if (likes.length >= totalParticipants) {
        commitWinner(item);
        return;
      }
    }

    // 2. Deck Exhaustion Check
    const uniqueSwipers = new Set(allSwipes.map((s) => s.participantId));
    const allDone =
      uniqueSwipers.size >= totalParticipants &&
      Array.from(uniqueSwipers).every((pId) => {
        return allSwipes.filter((s) => s.participantId === pId).length >= deck.length;
      });

    if (allDone) {
      const resolveFallback = () => {
        const counts: Record<string, number> = {};
        deck.forEach((r) => (counts[r.id] = 0));
        allSwipes.forEach((s) => {
          if (s.liked && counts[s.restaurantId] !== undefined) {
            counts[s.restaurantId]++;
          }
        });

        // Deterministic sort: Likes (desc), then Rating (desc), then ID (asc)
        const sorted = [...deck].sort((a, b) => {
          const diffLikes = counts[b.id] - counts[a.id];
          if (diffLikes !== 0) return diffLikes;
          const diffRating = b.rating - a.rating;
          if (diffRating !== 0) return diffRating;
          return a.id.localeCompare(b.id);
        });

        commitWinner(sorted[0]);
      };

      if (isHost) {
        resolveFallback();
      } else {
        // Failover: Non-host commits after 3 seconds if host client is unresponsive
        const timer = setTimeout(resolveFallback, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [allSwipes, deck, totalParticipants, isHost, commitWinner]);

  const recordSwipe = useCallback(
    async (liked: boolean) => {
      if (currentIndex >= deck.length) return;
      const item = deck[currentIndex];
      setCurrentIndex((prev) => prev + 1);

      try {
        const recorded = await insertRestaurantSwipe(roomId, participantId, item.id, liked);
        setAllSwipes((prev) => [...prev.filter((s) => s.id !== recorded.id), recorded]);
      } catch (err) {
        console.error('Failed to record swipe', err);
      }
    },
    [currentIndex, deck, roomId, participantId]
  );

  return {
    deck,
    currentItem: deck[currentIndex] || null,
    currentIndex,
    isDeckFinished: currentIndex >= deck.length,
    recordSwipe,
    allSwipes,
  };
}
