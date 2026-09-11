import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Room, Participant, CreateRoomInput, JoinRoomInput, FoodChoice, RoomStage, OrderItem, RoomDecisionState } from '../types/database';
import type { RestaurantItem, RestaurantVote } from '../types/restaurant';
import { cacheDeckRestaurants } from './restaurantRepository';
import { getOrCreateSessionToken, generateRoomCode } from './session';

const rawUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const supabaseUrl = rawUrl.trim().replace(/^["']+|["']+$/g, '').trim().replace(/\/+$/, '');
export const supabaseAnonKey = rawKey.trim().replace(/^["']+|["']+$/g, '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project')
);

export function isSupabaseNetworkError(error: unknown): boolean {
  const err = error as { message?: string; name?: string; status?: number } | null;
  return err?.name === 'TypeError' || err?.status === 0 ||
    /failed to fetch|fetch failed|network|load failed|ssl|certificate/i.test(err?.message || '') ||
    (typeof navigator !== 'undefined' && navigator.onLine === false);
}

function reportNetworkFailure(error: unknown) {
  if (!isSupabaseNetworkError(error)) return;
  const err = error as { message?: string; name?: string };
  console.error('[Supabase Network Failure]', {
    message: err?.message,
    name: err?.name,
    hint: 'Check local network, antivirus SSL inspection, or proxy settings blocking *.supabase.co',
  });
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('supabase-network-failure'));
}

function reportRealtimeStatus(status: string, error?: Error) {
  if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
    reportNetworkFailure({ name: 'TypeError', message: error?.message || 'Network realtime connection failed' });
  }
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (input, init) => {
          try {
            const response = await fetch(input, init);
            if (response.status === 0) throw Object.assign(new Error('Network unreachable'), { status: 0 });
            return response;
          } catch (error) {
            reportNetworkFailure(error);
            throw error;
          }
        },
      },
    })
  : null;

export async function checkSupabaseConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.from('rooms').select('id', { count: 'exact', head: true });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (error) {
    return { ok: false, error: (error as Error)?.message || 'Network unreachable' };
  }
}

/**
 * Check if room session has exceeded the 30-minute Time-To-Live (TTL).
 * Forces UTC parsing if Postgres ISO string lacks a timezone indicator (Z or offset).
 */
export function isRoomExpired(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false;

  let raw = createdAt.trim();
  // If Postgres ISO string lacks timezone indicator (Z or offset), force UTC
  if (!raw.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(raw)) {
    raw += 'Z';
  }

  const createdTime = new Date(raw).getTime();
  if (isNaN(createdTime)) return false;

  const now = Date.now();
  // Protect against clock skew
  if (createdTime > now) return false;

  const thirtyMinutesMs = 30 * 60 * 1000;
  return (now - createdTime) > thirtyMinutesMs;
}

/**
 * Fetch a room by its 4-character code (case-insensitive).
 */
export async function getRoomByCode(
  code: string
): Promise<{ room: Room | null; participants: Participant[]; isExpired?: boolean }> {
  if (!supabase) throw new Error('Supabase is not configured');

  const cleanCode = code.trim().toUpperCase();
  console.log('[getRoomByCode] Searching Supabase for code:', cleanCode);

  let { data: room, error } = await supabase
    .from('rooms')
    .select('id,code,status,stage,eating_mode,city,neighborhood,language,host_participant_id,current_stage,winning_category,consensus_type,tied_categories,winning_restaurant_id,swiping_started_at,version,category_summary,restaurant_state,restaurant_summary,winning_deck_id,winning_branch_id,winning_resolution_method,finalized_at,created_at,expires_at')
    .eq('code', cleanCode)
    .maybeSingle();

  if (!room && !error) {
    const retry = await supabase
      .from('rooms')
      .select('id,code,status,stage,eating_mode,city,neighborhood,language,host_participant_id,current_stage,winning_category,consensus_type,tied_categories,winning_restaurant_id,swiping_started_at,version,category_summary,restaurant_state,restaurant_summary,winning_deck_id,winning_branch_id,winning_resolution_method,finalized_at,created_at,expires_at')
      .ilike('code', cleanCode)
      .maybeSingle();
    room = retry.data;
    error = retry.error;
  }

  console.log('[getRoomByCode] Result:', { room, error });

  if (error) throw error;

  if (!room) {
    console.warn('[getRoomByCode] Room not found:', cleanCode);
    return { room: null, participants: [], isExpired: false };
  }

  if (isRoomExpired(room.created_at)) {
    console.warn('[getRoomByCode] Room expired:', cleanCode, room.created_at);
    return { room: null, participants: [], isExpired: true };
  }

  const { data: partData, error: partError } = await supabase.rpc('get_room_participants', {
    p_room_id: room.id,
    p_session_token: getOrCreateSessionToken(cleanCode),
    p_legacy_session_token: getOrCreateSessionToken(),
  });

  if (partError) throw partError;

  return {
    room: {
      ...room,
      stage: room.stage || room.current_stage || room.status || 'lobby',
      tied_categories: room.tied_categories || [],
    } as Room,
    participants: (partData || []) as Participant[],
    isExpired: false,
  };
}

/**
 * Create a new Room and host participant.
 */
export async function createRoom(input: CreateRoomInput): Promise<{ room: Room; participant: Participant }> {
  if (!supabase) throw new Error('Supabase is not configured');

  const code = generateRoomCode();
  const sessionToken = getOrCreateSessionToken(code);
  const safeEatingMode = input.eating_mode || 'delivery';
  const safeCity = input.city || 'riyadh';
  const safeLanguage = input.language || 'ar';
  const safeNickname = input.host_nickname?.trim() || 'المضيف';

  const { data, error } = await supabase.rpc('create_room_authorized', {
    p_code: code, p_session_token: sessionToken, p_eating_mode: safeEatingMode,
    p_city: safeCity, p_neighborhood: input.neighborhood || null, p_language: safeLanguage,
    p_nickname: safeNickname, p_latitude: input.latitude ?? null, p_longitude: input.longitude ?? null,
  });
  if (error) throw error;
  return data as { room: Room; participant: Participant };
}

/**
 * Join an existing room as a guest.
 */
export async function joinRoom(input: JoinRoomInput): Promise<{
  success: boolean;
  room?: Room;
  participant?: Participant;
  isFull?: boolean;
  error?: string;
}> {
  if (!supabase) throw new Error('Supabase is not configured');

  const normalizedCode = input.code.trim().toUpperCase();
  const sessionToken = getOrCreateSessionToken(normalizedCode);
  const { room, isExpired } = await getRoomByCode(normalizedCode);
  if (isExpired) {
    return { success: false, error: 'ROOM_EXPIRED' };
  }
  if (!room) {
    return { success: false, error: 'ROOM_NOT_FOUND' };
  }

  const { data, error } = await supabase.rpc('join_room_authorized', {
    p_code: normalizedCode, p_session_token: sessionToken, p_nickname: input.nickname.trim(),
  });
  if (error) {
    if (error.message?.includes('WSH_ROOM_FULL')) return { success: false, isFull: true, room };
    if (error.message?.includes('WSH_ROOM_EXPIRED')) return { success: false, error: 'ROOM_EXPIRED' };
    throw error;
  }
  const result = data as { room: Room; participant: Participant };
  return { success: true, ...result };
}

async function decisionRpc(name: string, args: Record<string, unknown>): Promise<RoomDecisionState> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data as RoomDecisionState;
}

export const getRoomDecisionState = (roomId: string, sessionToken: string) =>
  decisionRpc('get_room_decision_state', { p_room_id: roomId, p_session_token: sessionToken });

export const startCategoryVoting = (roomId: string, sessionToken: string, version: number) =>
  decisionRpc('start_category_voting', { p_room_id: roomId, p_session_token: sessionToken, p_expected_version: version });

export const submitCategorySelection = (roomId: string, sessionToken: string, version: number, categories: string[]) =>
  decisionRpc('submit_category_selection', { p_room_id: roomId, p_session_token: sessionToken, p_expected_version: version, p_categories: categories });

export const resolveCategoryTie = (roomId: string, sessionToken: string, version: number, method: 'host_pick' | 'choose_for_us', category?: string) =>
  decisionRpc('resolve_category_tie', { p_room_id: roomId, p_session_token: sessionToken, p_expected_version: version, p_method: method, p_category: category ?? null });

export const beginRestaurantVoting = (roomId: string, sessionToken: string, version: number) =>
  decisionRpc('begin_restaurant_voting', { p_room_id: roomId, p_session_token: sessionToken, p_expected_version: version });

export const submitRestaurantVote = (roomId: string, sessionToken: string, version: number, deckId: string, restaurantId: string, vote: RestaurantVote) =>
  decisionRpc('submit_restaurant_vote', { p_room_id: roomId, p_session_token: sessionToken, p_expected_version: version, p_deck_id: deckId, p_restaurant_id: restaurantId, p_vote: vote });

export const resolveRestaurantTie = (roomId: string, sessionToken: string, version: number, method: 'host_pick' | 'choose_for_us', restaurantId?: string) =>
  decisionRpc('resolve_restaurant_tie', { p_room_id: roomId, p_session_token: sessionToken, p_expected_version: version, p_method: method, p_restaurant_id: restaurantId ?? null });

export async function getFoodChoices(roomId: string, sessionToken: string): Promise<FoodChoice[]> {
  const state = await getRoomDecisionState(roomId, sessionToken);
  return state.myCategorySelection ? [state.myCategorySelection] : [];
}

/**
 * Subscribe to realtime participant, room, food choice, and restaurant swipe updates.
 */
export function subscribeToRoom(
  roomId: string,
  onUpdate: () => void,
  onRoomDeleted?: () => void,
  onRoomReset?: () => void
): () => void {
  if (!supabase) throw new Error('Supabase is not configured');

  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'participants', filter: `room_id=eq.${roomId}` },
      () => onUpdate()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
      (payload: any) => {
        if (payload.eventType === 'DELETE') {
          onRoomDeleted?.();
        } else {
          onUpdate();
        }
      }
    )
    .on('broadcast', { event: 'room_deleted' }, () => {
      onRoomDeleted?.();
    })
    .on('broadcast', { event: 'room_reset' }, () => {
      onRoomReset?.();
    })
    .subscribe(reportRealtimeStatus);

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Reset room state, clearing food choices and restaurant swipes so squad can vote again.
 */
export async function resetRoomVoting(
  roomId: string,
  sessionToken: string,
  version: number,
  targetStage: RoomStage = 'voting'
): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase.rpc('reset_room_state_authorized', {
    p_room_id: roomId, p_session_token: sessionToken, p_expected_version: version, p_target_stage: targetStage,
  });
  if (error) throw error;
  const channel = supabase.channel(`room:${roomId}`);
  try {
    await channel.send({ type: 'broadcast', event: 'room_reset', payload: { roomId } });
  } finally {
    void supabase.removeChannel(channel);
  }
}

/**
 * Permanently delete a room and clean up all associated data.
 */
export async function deleteRoom(roomId: string, sessionToken: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase.rpc('delete_room_authorized', { p_room_id: roomId, p_session_token: sessionToken });
  if (error) throw error;
  const channel = supabase.channel(`room:${roomId}`);
  try {
    await channel.send({ type: 'broadcast', event: 'room_deleted', payload: { roomId } });
  } finally {
    void supabase.removeChannel(channel);
  }
}

export { getCachedRestaurant } from './restaurantRepository';
export async function fetchDeckRestaurants(
  roomId: string,
  participantId: string,
  sessionToken: string,
  afterDeckId?: string,
): Promise<import('../types/restaurant').RestaurantDeck> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.rpc('get_or_create_restaurant_deck', {
    p_room_id: roomId,
    p_participant_id: participantId,
    p_session_token: sessionToken,
    p_after_deck_id: afterDeckId ?? null,
  });
  if (error) throw error;
  const deck = data as import('../types/restaurant').RestaurantDeck;
  cacheDeckRestaurants(deck.restaurants);
  return deck;
}
/**
 * Fetch all order items for a room.
 */
export async function fetchOrderItems(roomId: string): Promise<OrderItem[]> {
  if (!supabase) throw new Error('Supabase is not configured');

  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  if (data) {
    return data.map((d: any) => ({
      id: d.id,
      roomId: d.room_id,
      participantId: d.participant_id,
      participantName: d.participant_name,
      itemName: d.item_name,
      notes: d.notes || '',
      createdAt: d.created_at,
    }));
  }

  return [];
}

/**
 * Add a new order item for a participant in a room.
 */
export async function addOrderItem(
  item: Omit<OrderItem, 'id' | 'createdAt'>
): Promise<OrderItem | null> {
  if (!supabase) throw new Error('Supabase is not configured');

  const { data, error } = await supabase
    .from('order_items')
    .insert([
      {
        room_id: item.roomId,
        participant_id: item.participantId,
        participant_name: item.participantName,
        item_name: item.itemName,
        notes: item.notes || '',
      },
    ])
    .select('*')
    .single();

  if (error) throw error;
  if (data) {
    return {
      id: data.id,
      roomId: data.room_id,
      participantId: data.participant_id,
      participantName: data.participant_name,
      itemName: data.item_name,
      notes: data.notes || '',
      createdAt: data.created_at,
    };
  }

  throw new Error("No order item returned");
}

/**
 * Delete an order item by its ID.
 */
export async function deleteOrderItem(itemId: string): Promise<boolean> {
  if (!supabase) throw new Error('Supabase is not configured');

  const { error } = await supabase
    .from('order_items')
    .delete()
    .eq('id', itemId);

  if (error) throw error;
  return true;
}

/**
 * Subscribe to realtime order items updates for a room.
 */
export function subscribeToOrderItems(
  roomId: string,
  onInsert: (item: OrderItem) => void,
  onDelete: (id: string) => void
): () => void {
  let channel: any = null;

  if (supabase) {
    channel = supabase
      .channel(`order_items:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_items', filter: `room_id=eq.${roomId}` },
        (payload: any) => {
          const d = payload.new;
          if (d) {
            onInsert({
              id: d.id,
              roomId: d.room_id,
              participantId: d.participant_id,
              participantName: d.participant_name,
              itemName: d.item_name,
              notes: d.notes || '',
              createdAt: d.created_at,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'order_items' },
        (payload: any) => {
          const old = payload.old;
          if (old?.id) {
            onDelete(old.id);
          }
        }
      )
      .subscribe(reportRealtimeStatus);
  }

  return () => { if (supabase && channel) supabase.removeChannel(channel); };
}

/**
 * Broadcast a re-vote request from a participant.
 */
export async function broadcastRevoteRequest(
  roomId: string,
  participant: { id: string; name: string; active: boolean }
): Promise<void> {
  if (supabase) {
    try {
      const channel = supabase.channel(`revote:${roomId}`);
      if (channel.state !== 'joined') {
        await new Promise<void>((resolve) => {
          channel.subscribe((status: string) => {
            if (status === 'SUBSCRIBED') resolve();
          });
          setTimeout(resolve, 500);
        });
      }
      await channel.send({
        type: 'broadcast',
        event: 'revote_request',
        payload: participant,
      });
    } catch (e) {
      console.warn('Supabase broadcastRevoteRequest failed', e);
    }
  }

}

/**
 * Subscribe to realtime re-vote requests for a room.
 */
export function subscribeToRevoteRequests(
  roomId: string,
  callback: (participant: { id: string; name: string; active: boolean }) => void
): () => void {
  let channel: any = null;

  if (supabase) {
    channel = supabase
      .channel(`revote:${roomId}`)
      .on('broadcast', { event: 'revote_request' }, (payload: any) => {
        if (payload?.payload) {
          callback(payload.payload);
        }
      })
      .subscribe(reportRealtimeStatus);
  }


  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
  };
}

/**
 * Broadcast sudden death duel start
 */
export async function broadcastSuddenDeath(
  roomId: string,
  restaurants: RestaurantItem[]
): Promise<void> {
  if (supabase) {
    try {
      const channel = supabase.channel(`minigames:${roomId}`);
      if (channel.state !== 'joined') {
        await new Promise<void>((resolve) => {
          channel.subscribe((status: string) => {
            if (status === 'SUBSCRIBED') resolve();
          });
          setTimeout(resolve, 500);
        });
      }
      await channel.send({
        type: 'broadcast',
        event: 'sudden_death_start',
        payload: { roomId, restaurants, startedAt: Date.now() },
      });
    } catch (e) {
      console.warn('Supabase broadcastSuddenDeath failed', e);
    }
  }

}

export function subscribeToSuddenDeath(
  roomId: string,
  callback: (restaurants: RestaurantItem[], startedAt: number) => void
): () => void {
  let channel: any = null;

  if (supabase) {
    channel = supabase
      .channel(`minigames:${roomId}`)
      .on('broadcast', { event: 'sudden_death_start' }, (payload: any) => {
        if (payload?.payload?.restaurants) {
          callback(payload.payload.restaurants, payload.payload.startedAt || Date.now());
        }
      })
      .subscribe(reportRealtimeStatus);
  }


  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
  };
}

export async function broadcastSuddenDeathVote(
  roomId: string,
  vote: { participantId: string; restaurantId: string }
): Promise<void> {
  if (supabase) {
    try {
      const channel = supabase.channel(`minigames:${roomId}`);
      if (channel.state !== 'joined') {
        await new Promise<void>((resolve) => {
          channel.subscribe((status: string) => {
            if (status === 'SUBSCRIBED') resolve();
          });
          setTimeout(resolve, 500);
        });
      }
      await channel.send({
        type: 'broadcast',
        event: 'sudden_death_vote',
        payload: { roomId, ...vote },
      });
    } catch (e) {
      console.warn('Supabase broadcastSuddenDeathVote failed', e);
    }
  }

}

export function subscribeToSuddenDeathVote(
  roomId: string,
  callback: (vote: { participantId: string; restaurantId: string }) => void
): () => void {
  let channel: any = null;

  if (supabase) {
    channel = supabase
      .channel(`minigames:${roomId}`)
      .on('broadcast', { event: 'sudden_death_vote' }, (payload: any) => {
        if (payload?.payload?.participantId && payload?.payload?.restaurantId) {
          callback({
            participantId: payload.payload.participantId,
            restaurantId: payload.payload.restaurantId,
          });
        }
      })
      .subscribe(reportRealtimeStatus);
  }


  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
  };
}

export async function broadcastRoulette(
  roomId: string,
  restaurants: RestaurantItem[]
): Promise<void> {
  if (supabase) {
    try {
      const channel = supabase.channel(`roulette_modal:${roomId}`);
      if (channel.state !== 'joined') {
        await new Promise<void>((resolve) => {
          channel.subscribe((status: string) => {
            if (status === 'SUBSCRIBED') resolve();
          });
          setTimeout(resolve, 300);
        });
      }
      await channel.send({
        type: 'broadcast',
        event: 'roulette_open',
        payload: { roomId, restaurants },
      });
    } catch (e) {
      console.warn('Supabase broadcastRoulette failed', e);
    }
  }

}

export async function broadcastRouletteClose(roomId: string): Promise<void> {
  if (supabase) {
    try {
      const channel = supabase.channel(`roulette_modal:${roomId}`);
      if (channel.state !== 'joined') {
        channel.subscribe(reportRealtimeStatus);
      }
      await channel.send({
        type: 'broadcast',
        event: 'roulette_close',
        payload: { roomId },
      });
    } catch (e) {
      console.warn('Supabase broadcastRouletteClose failed', e);
    }
  }

}

export function subscribeToRoulette(
  roomId: string,
  onOpen: (restaurants: RestaurantItem[]) => void,
  onClose?: () => void
): () => void {
  let channel: any = null;

  if (supabase) {
    channel = supabase
      .channel(`roulette_modal:${roomId}`)
      .on('broadcast', { event: 'roulette_open' }, (payload: any) => {
        if (payload?.payload?.restaurants) {
          onOpen(payload.payload.restaurants);
        }
      })
      .on('broadcast', { event: 'roulette_close' }, () => {
        onClose?.();
      })
      .subscribe(reportRealtimeStatus);
  }


  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
  };
}

export async function broadcastRouletteSpin(
  roomId: string,
  spinData: { winnerId: string; targetAngle: number }
): Promise<void> {
  if (supabase) {
    try {
      const channel = supabase.channel(`roulette_spin:${roomId}`);
      if (channel.state !== 'joined') {
        await new Promise<void>((resolve) => {
          channel.subscribe((status: string) => {
            if (status === 'SUBSCRIBED') resolve();
          });
          setTimeout(resolve, 300);
        });
      }
      await channel.send({
        type: 'broadcast',
        event: 'roulette_spin',
        payload: { roomId, ...spinData },
      });
    } catch (e) {
      console.warn('Supabase broadcastRouletteSpin failed', e);
    }
  }

}

export function subscribeToRouletteSpin(
  roomId: string,
  callback: (spinData: { winnerId: string; targetAngle: number }) => void
): () => void {
  let channel: any = null;

  if (supabase) {
    channel = supabase
      .channel(`roulette_spin:${roomId}`)
      .on('broadcast', { event: 'roulette_spin' }, (payload: any) => {
        if (payload?.payload?.winnerId) {
          callback({
            winnerId: payload.payload.winnerId,
            targetAngle: payload.payload.targetAngle,
          });
        }
      })
      .subscribe(reportRealtimeStatus);
  }


  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
  };
}

export async function broadcastCategoryRouletteSpin(
  roomId: string,
  spinData: { winnerId: string; targetAngle: number }
): Promise<void> {
  if (supabase) {
    try {
      const channel = supabase.channel(`category_spin:${roomId}`);
      if (channel.state !== 'joined') {
        await new Promise<void>((resolve) => {
          channel.subscribe((status: string) => {
            if (status === 'SUBSCRIBED') resolve();
          });
          setTimeout(resolve, 300);
        });
      }
      await channel.send({
        type: 'broadcast',
        event: 'category_spin',
        payload: { roomId, ...spinData },
      });
    } catch (e) {
      console.warn('Supabase broadcastCategoryRouletteSpin failed', e);
    }
  }

}

export function subscribeToCategoryRouletteSpin(
  roomId: string,
  callback: (spinData: { winnerId: string; targetAngle: number }) => void
): () => void {
  let channel: any = null;

  if (supabase) {
    channel = supabase
      .channel(`category_spin:${roomId}`)
      .on('broadcast', { event: 'category_spin' }, (payload: any) => {
        if (payload?.payload?.winnerId) {
          callback({
            winnerId: payload.payload.winnerId,
            targetAngle: payload.payload.targetAngle,
          });
        }
      })
      .subscribe(reportRealtimeStatus);
  }


  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
  };
}
