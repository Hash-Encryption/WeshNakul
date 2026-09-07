import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Room, Participant, CreateRoomInput, JoinRoomInput, FoodChoice, RoomStage, ConsensusType, OrderItem } from '../types/database';
import type { RestaurantItem, RestaurantSwipe } from '../types/restaurant';
import { CITYWIDE_STAPLES } from '../data/fallbackStaples';
import { getOrCreateSessionToken, generateUUID, generateRoomCode } from './session';
import { getProceduralToken } from './tokenGenerator';

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
    .select('*')
    .eq('code', cleanCode)
    .maybeSingle();

  if (!room && !error) {
    const retry = await supabase
      .from('rooms')
      .select('*')
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

  const { data: partData, error: partError } = await supabase
    .from('participants')
    .select('*')
    .eq('room_id', room.id)
    .order('joined_at', { ascending: true });

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
  const roomId = generateUUID();
  const participantId = generateUUID();
  const tokenCombo = getProceduralToken(0);

  const safeEatingMode = input.eating_mode || 'delivery';
  const safeCity = input.city || 'riyadh';
  const safeLanguage = input.language || 'ar';
  const safeNickname = input.host_nickname?.trim() || 'المضيف';

  const newRoom: Room = {
    id: roomId,
    code,
    status: 'lobby',
    stage: 'lobby',
    eating_mode: safeEatingMode,
    city: safeCity,
    neighborhood: input.neighborhood || null,
    language: safeLanguage,
    host_participant_id: participantId,
    current_stage: 'lobby',
    winning_category: null,
    consensus_type: null,
    tied_categories: [],
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
  };

  const hostParticipant: Participant = {
    id: participantId,
    room_id: roomId,
    session_token: sessionToken,
    nickname: safeNickname,
    player_color: tokenCombo.color,
    player_shape: tokenCombo.shape,
    is_host: true,
    status: 'active',
    joined_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
  };

  const roomPayload: any = {
    id: roomId,
    code,
    status: 'lobby',
    current_stage: 'lobby',
    stage: 'lobby',
    eating_mode: safeEatingMode,
    city: safeCity,
    neighborhood: input.neighborhood || null,
    language: safeLanguage,
    host_participant_id: participantId,
    winning_category: null,
    consensus_type: null,
    tied_categories: [],
    created_at: newRoom.created_at,
    expires_at: newRoom.expires_at,
  };

  const { data: insertedData, error: roomErr } = await supabase
    .from('rooms')
    .insert([roomPayload])
    .select('id, code')
    .maybeSingle();

  if (roomErr) throw roomErr;

  console.log('[createRoom] Room successfully inserted into Supabase:', {
    id: insertedData?.id || roomId,
    code: insertedData?.code || code,
  });

  const partPayload = {
    id: participantId,
    room_id: roomId,
    session_token: sessionToken,
    nickname: safeNickname,
    player_color: tokenCombo.color,
    player_shape: tokenCombo.shape,
    is_host: true,
    status: 'active',
    joined_at: hostParticipant.joined_at,
    last_seen_at: hostParticipant.last_seen_at,
  };

  const { error: partErr } = await supabase.from('participants').insert([partPayload]);

  if (partErr) throw partErr;

  return { room: newRoom, participant: hostParticipant };
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
  const legacyToken = getOrCreateSessionToken();

  const { room, participants, isExpired } = await getRoomByCode(normalizedCode);
  if (isExpired) {
    return { success: false, error: 'ROOM_EXPIRED' };
  }
  if (!room) {
    return { success: false, error: 'ROOM_NOT_FOUND' };
  }

  // Check if session token already joined (check both scoped and legacy)
  const existing = participants.find(
    (p) => p.session_token === sessionToken || p.session_token === legacyToken
  );
  if (existing) {
    return { success: true, room, participant: existing };
  }

  // Check 10-player capacity guard
  if (participants.length >= 10) {
    return { success: false, isFull: true, room };
  }

  const tokenCombo = getProceduralToken(participants.length);
  const newParticipant: Participant = {
    id: generateUUID(),
    room_id: room.id,
    session_token: sessionToken,
    nickname: input.nickname.trim(),
    player_color: tokenCombo.color,
    player_shape: tokenCombo.shape,
    is_host: false,
    status: 'active',
    joined_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('participants').insert([newParticipant]);
  if (error) throw error;
  return { success: true, room, participant: newParticipant };
}

/**
 * Update the stage and consensus details of a room.
 */
export async function updateRoomStage(
  roomId: string,
  stage: RoomStage,
  updates?: {
    winning_category?: string | null;
    consensus_type?: ConsensusType;
    tied_categories?: string[];
    winning_restaurant_id?: string | null;
    swiping_started_at?: string | null;
  }
): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');

  const payload: Partial<Room> = {
    stage,
    current_stage: stage,
    ...(updates?.winning_category !== undefined && { winning_category: updates.winning_category }),
    ...(updates?.consensus_type !== undefined && { consensus_type: updates.consensus_type }),
    ...(updates?.tied_categories !== undefined && { tied_categories: updates.tied_categories }),
    ...(updates?.winning_restaurant_id !== undefined && { winning_restaurant_id: updates.winning_restaurant_id }),
    ...(updates?.swiping_started_at !== undefined && { swiping_started_at: updates.swiping_started_at }),
  };

  const { error } = await supabase
    .from('rooms')
    .update(payload)
    .eq('id', roomId);

  if (error) throw error;
  return;
}

/**
 * Upsert participant's food choices for a room.
 */
export async function upsertFoodChoice(
  roomId: string,
  participantId: string,
  selectedCategories: string[],
  isSubmitted: boolean
): Promise<FoodChoice> {
  if (!supabase) throw new Error('Supabase is not configured');

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('food_choices')
    .upsert(
      {
        room_id: roomId,
        participant_id: participantId,
        selected_categories: selectedCategories,
        is_submitted: isSubmitted,
        submitted_at: isSubmitted ? now : null,
        updated_at: now,
      },
      { onConflict: 'room_id,participant_id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return data as FoodChoice;
}

/**
 * Fetch all food choices for a room.
 */
export async function getFoodChoices(roomId: string): Promise<FoodChoice[]> {
  if (!supabase) throw new Error('Supabase is not configured');

  const { data, error } = await supabase
    .from('food_choices')
    .select('*')
    .eq('room_id', roomId);

  if (error) throw error;

  return (data || []) as FoodChoice[];
}

/**
 * Record a restaurant swipe.
 */
export async function insertRestaurantSwipe(
  roomId: string,
  participantId: string,
  restaurantId: string,
  liked: boolean
): Promise<RestaurantSwipe> {
  if (!supabase) throw new Error('Supabase is not configured');

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('restaurant_swipes')
    .upsert(
      {
        room_id: roomId,
        participant_id: participantId,
        restaurant_id: restaurantId,
        liked,
        created_at: now,
      },
      { onConflict: 'room_id,participant_id,restaurant_id' }
    )
    .select('*')
    .single();

  if (error) throw error;
  return {
    id: data.id,
    roomId: data.room_id,
    participantId: data.participant_id,
    restaurantId: data.restaurant_id,
    liked: data.liked,
    createdAt: data.created_at,
  };
}

/**
 * Fetch all restaurant swipes for a room.
 */
export async function getRestaurantSwipes(roomId: string): Promise<RestaurantSwipe[]> {
  if (!supabase) throw new Error('Supabase is not configured');

  const { data, error } = await supabase
    .from('restaurant_swipes')
    .select('*')
    .eq('room_id', roomId);

  if (error) throw error;

  return (data || []).map((d: any) => ({
    id: d.id,
    roomId: d.room_id,
    participantId: d.participant_id,
    restaurantId: d.restaurant_id,
    liked: d.liked,
    createdAt: d.created_at,
  }));
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
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'food_choices', filter: `room_id=eq.${roomId}` },
      () => onUpdate()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'restaurant_swipes', filter: `room_id=eq.${roomId}` },
      () => onUpdate()
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
  targetStage: RoomStage = 'voting'
): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase.from('rooms').update({
    stage: targetStage, status: targetStage === 'lobby' ? 'lobby' : 'food_selection',
    current_stage: targetStage, winning_category: null, consensus_type: null,
    tied_categories: [], winning_restaurant_id: null, swiping_started_at: null,
  }).eq('id', roomId);
  if (error) throw error;
  for (const table of ['food_choices', 'restaurant_swipes', 'order_items']) {
    const { error } = await supabase.from(table).delete().eq('room_id', roomId);
    if (error) throw error;
  }
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
export async function deleteRoom(roomId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured');
  const { error } = await supabase.from('rooms').delete().eq('id', roomId);
  if (error) throw error;
  const channel = supabase.channel(`room:${roomId}`);
  try {
    await channel.send({ type: 'broadcast', event: 'room_deleted', payload: { roomId } });
  } finally {
    void supabase.removeChannel(channel);
  }
}

// In-memory restaurant cache for instant lookups across stages
const restaurantCache = new Map<string, RestaurantItem>();
CITYWIDE_STAPLES.forEach((s) => restaurantCache.set(s.id, s));

export function getCachedRestaurant(id: string): RestaurantItem | undefined {
  return restaurantCache.get(id);
}

/**
 * Deferred on-demand restaurant loader.
 * Queries Supabase strictly during the restaurant swiping phase.
 * Falls back to in-memory CITYWIDE_STAPLES if Supabase is offline or errors.
 */
export async function fetchDeckRestaurants(categoryId: string): Promise<RestaurantItem[]> {
  try {
    if (!supabase) {
      const matched = CITYWIDE_STAPLES.filter((r) => r.categories.includes(categoryId));
      return matched.length > 0 ? matched : CITYWIDE_STAPLES;
    }

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .contains('categories', [categoryId]);

    if (error || !data || data.length === 0) {
      const matched = CITYWIDE_STAPLES.filter((r) => r.categories.includes(categoryId));
      return matched.length > 0 ? matched : CITYWIDE_STAPLES;
    }

    const items: RestaurantItem[] = data.map((row: any) => ({
      id: row.id,
      nameAr: row.name_ar,
      nameEn: row.name_en,
      categories: row.categories || [],
      isCityWide: row.is_city_wide,
      branches: row.branches || [],
      diningMode: row.dining_mode,
      timeSlots: row.time_slots || [],
      closingTimeAr: row.closing_time_ar,
      isOpenLate: row.is_open_late,
      is24Hours: row.is_24_hours,
      avgPrepMinutes: row.avg_prep_minutes,
      tier: row.tier,
      priceTier: row.price_tier,
      signatureDishAr: row.signature_dish_ar,
      signatureDishEn: row.signature_dish_en,
      vibeTagsAr: row.vibe_tags_ar || [],
      vibeTagsEn: row.vibe_tags_en || [],
      rating: Number(row.rating),
      platforms: row.platforms,
      links: row.links,
    }));

    items.forEach((item) => restaurantCache.set(item.id, item));
    return items;
  } catch {
    const matched = CITYWIDE_STAPLES.filter((r) => r.categories.includes(categoryId));
    return matched.length > 0 ? matched : CITYWIDE_STAPLES;
  }
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

