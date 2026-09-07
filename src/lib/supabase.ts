import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Room, Participant, CreateRoomInput, JoinRoomInput, FoodChoice, RoomStage, ConsensusType, OrderItem } from '../types/database';
import type { RestaurantItem, RestaurantSwipe } from '../types/restaurant';
import { CITYWIDE_STAPLES } from '../data/fallbackStaples';
import { getOrCreateSessionToken, generateUUID, generateRoomCode } from './session';
import { getProceduralToken } from './tokenGenerator';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://apsfxnmzfllraoctbwyq.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_P2K0kEJqVuKxiGh-BxSRQg_xgtRoDrz';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Local BroadcastChannel and storage mock for instant zero-config multi-tab realtime
const LOCAL_STORAGE_ROOMS = 'wsh_mock_rooms';
const LOCAL_STORAGE_PARTICIPANTS = 'wsh_mock_participants';
const LOCAL_STORAGE_FOOD_CHOICES = 'wsh_mock_food_choices';
const LOCAL_STORAGE_RESTAURANT_SWIPES = 'wsh_mock_restaurant_swipes';
const LOCAL_STORAGE_ORDER_ITEMS = 'wsh_mock_order_items';

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('wsh_room_sync')
  : null;

const ordersBroadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('wesh_nakul_orders_fallback')
  : null;

const revoteBroadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('wesh_nakul_revote_fallback')
  : null;

const minigamesBroadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('wesh_nakul_minigames')
  : null;

function getMockOrderItems(): Record<string, OrderItem[]> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDER_ITEMS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMockOrderItems(items: Record<string, OrderItem[]>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDER_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save mock order items', e);
  }
}


function getMockRooms(): Record<string, Room> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ROOMS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMockRooms(rooms: Record<string, Room>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ROOMS, JSON.stringify(rooms));
  } catch (e) {
    console.error('Failed to save mock rooms', e);
  }
}

function getMockParticipants(): Record<string, Participant[]> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PARTICIPANTS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMockParticipants(participants: Record<string, Participant[]>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PARTICIPANTS, JSON.stringify(participants));
  } catch (e) {
    console.error('Failed to save mock participants', e);
  }
}

function getMockFoodChoices(): Record<string, FoodChoice[]> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FOOD_CHOICES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMockFoodChoices(choices: Record<string, FoodChoice[]>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_FOOD_CHOICES, JSON.stringify(choices));
  } catch (e) {
    console.error('Failed to save mock food choices', e);
  }
}

function getMockRestaurantSwipes(): Record<string, RestaurantSwipe[]> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESTAURANT_SWIPES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMockRestaurantSwipes(swipes: Record<string, RestaurantSwipe[]>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_RESTAURANT_SWIPES, JSON.stringify(swipes));
  } catch (e) {
    console.error('Failed to save mock restaurant swipes', e);
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
  const cleanCode = code.trim().toUpperCase();

  if (supabase) {
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .ilike('code', cleanCode)
      .maybeSingle();

    if (roomError || !roomData) {
      console.warn('[getRoomByCode] Room not found:', cleanCode, roomError);
      return { room: null, participants: [], isExpired: false };
    }

    if (isRoomExpired(roomData.created_at)) {
      console.warn('[getRoomByCode] Room expired:', cleanCode, roomData.created_at);
      return { room: null, participants: [], isExpired: true };
    }

    const { data: partData } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', roomData.id)
      .order('joined_at', { ascending: true });

    return {
      room: {
        ...roomData,
        stage: roomData.stage || roomData.current_stage || roomData.status || 'lobby',
        tied_categories: roomData.tied_categories || [],
      } as Room,
      participants: (partData || []) as Participant[],
      isExpired: false,
    };
  }

  // Local fallback
  const rooms = getMockRooms();
  const room = rooms[cleanCode] || null;
  if (!room) return { room: null, participants: [], isExpired: false };

  if (isRoomExpired(room.created_at)) {
    return { room: null, participants: [], isExpired: true };
  }

  const participants = getMockParticipants()[room.id] || [];
  return { room, participants, isExpired: false };
}

/**
 * Create a new Room and host participant.
 */
export async function createRoom(input: CreateRoomInput): Promise<{ room: Room; participant: Participant }> {
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

  if (supabase) {
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

    let { error: roomErr } = await supabase.from('rooms').insert([roomPayload]);

    if (roomErr) {
      console.error('[createRoom] Failed to insert room in Supabase:', {
        payload: roomPayload,
        error: {
          message: roomErr.message,
          details: roomErr.details,
          hint: roomErr.hint,
          code: roomErr.code,
        },
      });

      // If error is due to unknown/uncached columns (e.g. stage, tied_categories, winning_category),
      // retry with safe baseline schema matching 20260902_initial_schema.sql
      const isColumnError =
        roomErr.code === '42703' || // undefined_column
        roomErr.code === 'PGRST204' || // schema cache missing column
        roomErr.message?.toLowerCase().includes('column') ||
        roomErr.message?.toLowerCase().includes('schema cache');

      const isFkError =
        roomErr.code === '23503' ||
        roomErr.message?.toLowerCase().includes('foreign key');

      if (isColumnError || isFkError) {
        console.warn('[createRoom] Retrying with initial schema baseline payload (status & current_stage)...');
        const baselinePayload: any = {
          id: roomId,
          code,
          status: 'lobby',
          current_stage: 'lobby',
          eating_mode: safeEatingMode,
          city: safeCity,
          neighborhood: input.neighborhood || null,
          language: safeLanguage,
          host_participant_id: isFkError ? null : participantId,
          created_at: roomPayload.created_at,
          expires_at: roomPayload.expires_at,
        };

        const retry = await supabase.from('rooms').insert([baselinePayload]);
        if (retry.error) {
          console.error('[createRoom] Retry inserting room with baseline payload failed:', {
            payload: baselinePayload,
            error: {
              message: retry.error.message,
              details: retry.error.details,
              hint: retry.error.hint,
              code: retry.error.code,
            },
          });
          roomErr = retry.error;
        } else {
          roomErr = null;
        }
      }
    }

    if (roomErr) {
      const isNetworkError =
        roomErr.message?.toLowerCase().includes('fetch failed') ||
        roomErr.message?.toLowerCase().includes('failed to fetch') ||
        roomErr.message?.toLowerCase().includes('network');

      if (isNetworkError) {
        console.warn('[createRoom] Supabase network fetch failed, using local storage fallback');
        const rooms = getMockRooms();
        rooms[code] = newRoom;
        saveMockRooms(rooms);

        const participants = getMockParticipants();
        participants[roomId] = [hostParticipant];
        saveMockParticipants(participants);

        broadcastChannel?.postMessage({
          type: 'ROOM_UPDATED',
          roomId,
          code,
        });

        return { room: newRoom, participant: hostParticipant };
      }

      throw roomErr;
    }

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

    let { error: partErr } = await supabase.from('participants').insert([partPayload]);

    if (partErr) {
      console.error('[createRoom] Failed to insert host participant in Supabase:', {
        payload: partPayload,
        error: {
          message: partErr.message,
          details: partErr.details,
          hint: partErr.hint,
          code: partErr.code,
        },
      });

      // Resilient fallback: If database still has legacy unique constraint on session_token,
      // generate a fresh UUID and retry insertion
      if (partErr.code === '23505' || partErr.message?.includes('session_token')) {
        console.warn('[createRoom] Retrying host participant insert with fresh session token...');
        const freshToken = generateUUID();
        hostParticipant.session_token = freshToken;
        partPayload.session_token = freshToken;
        try {
          localStorage.setItem(`wesh_nakul_session_${code}`, freshToken);
        } catch {}
        const retry = await supabase.from('participants').insert([partPayload]);
        if (retry.error) {
          console.error('[createRoom] Retry inserting host participant failed:', {
            payload: partPayload,
            error: {
              message: retry.error.message,
              details: retry.error.details,
              hint: retry.error.hint,
              code: retry.error.code,
            },
          });
          partErr = retry.error;
        } else {
          partErr = null;
        }
      }
    }

    if (partErr) {
      const isNetworkError =
        partErr.message?.toLowerCase().includes('fetch failed') ||
        partErr.message?.toLowerCase().includes('failed to fetch') ||
        partErr.message?.toLowerCase().includes('network');

      if (isNetworkError) {
        console.warn('[createRoom] Supabase network fetch failed for participant, using local storage fallback');
        const participants = getMockParticipants();
        participants[roomId] = [hostParticipant];
        saveMockParticipants(participants);

        return { room: newRoom, participant: hostParticipant };
      }

      throw partErr;
    }

    return { room: newRoom, participant: hostParticipant };
  }

  // Local Storage fallback
  const rooms = getMockRooms();
  rooms[code] = newRoom;
  saveMockRooms(rooms);

  const participants = getMockParticipants();
  participants[roomId] = [hostParticipant];
  saveMockParticipants(participants);

  broadcastChannel?.postMessage({
    type: 'ROOM_UPDATED',
    roomId,
    code,
  });

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
  const normalizedCode = input.code.trim().toUpperCase();
  const sessionToken = getOrCreateSessionToken(normalizedCode);
  const legacyToken = getOrCreateSessionToken();

  const { room, participants } = await getRoomByCode(normalizedCode);
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

  if (supabase) {
    let { error } = await supabase.from('participants').insert([newParticipant]);
    // Resilient fallback for legacy DB unique constraint on session_token
    if (error && (error.code === '23505' || error.message?.includes('session_token'))) {
      const freshToken = generateUUID();
      newParticipant.session_token = freshToken;
      try {
        localStorage.setItem(`wesh_nakul_session_${normalizedCode}`, freshToken);
      } catch {}
      const retry = await supabase.from('participants').insert([newParticipant]);
      error = retry.error;
    }
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, room, participant: newParticipant };
  }

  // Local mock
  const allParticipants = getMockParticipants();
  const currentList = allParticipants[room.id] || [];
  allParticipants[room.id] = [...currentList, newParticipant];
  saveMockParticipants(allParticipants);

  broadcastChannel?.postMessage({
    type: 'ROOM_UPDATED',
    roomId: room.id,
    code: room.code,
  });

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
  const payload: Partial<Room> = {
    stage,
    current_stage: stage,
    ...(updates?.winning_category !== undefined && { winning_category: updates.winning_category }),
    ...(updates?.consensus_type !== undefined && { consensus_type: updates.consensus_type }),
    ...(updates?.tied_categories !== undefined && { tied_categories: updates.tied_categories }),
    ...(updates?.winning_restaurant_id !== undefined && { winning_restaurant_id: updates.winning_restaurant_id }),
    ...(updates?.swiping_started_at !== undefined && { swiping_started_at: updates.swiping_started_at }),
  };

  if (supabase) {
    const { error } = await supabase
      .from('rooms')
      .update(payload)
      .eq('id', roomId);

    if (error) throw error;
    return;
  }

  // Local mock
  const rooms = getMockRooms();
  for (const code of Object.keys(rooms)) {
    if (rooms[code].id === roomId) {
      rooms[code] = {
        ...rooms[code],
        ...payload,
      };
      saveMockRooms(rooms);
      broadcastChannel?.postMessage({
        type: 'ROOM_UPDATED',
        roomId,
        code,
      });
      break;
    }
  }
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
  const now = new Date().toISOString();

  if (supabase) {
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

  // Local mock
  const allChoices = getMockFoodChoices();
  const roomChoices = allChoices[roomId] || [];
  const existingIdx = roomChoices.findIndex((c) => c.participant_id === participantId);

  let updatedChoice: FoodChoice;
  if (existingIdx >= 0) {
    updatedChoice = {
      ...roomChoices[existingIdx],
      selected_categories: selectedCategories,
      is_submitted: isSubmitted,
      submitted_at: isSubmitted ? now : roomChoices[existingIdx].submitted_at,
      updated_at: now,
    };
    roomChoices[existingIdx] = updatedChoice;
  } else {
    updatedChoice = {
      id: generateUUID(),
      room_id: roomId,
      participant_id: participantId,
      selected_categories: selectedCategories,
      is_submitted: isSubmitted,
      submitted_at: isSubmitted ? now : null,
      created_at: now,
      updated_at: now,
    };
    roomChoices.push(updatedChoice);
  }

  allChoices[roomId] = roomChoices;
  saveMockFoodChoices(allChoices);

  broadcastChannel?.postMessage({
    type: 'ROOM_UPDATED',
    roomId,
  });

  return updatedChoice;
}

/**
 * Fetch all food choices for a room.
 */
export async function getFoodChoices(roomId: string): Promise<FoodChoice[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('food_choices')
      .select('*')
      .eq('room_id', roomId);

    if (error) {
      console.error('Error fetching food choices', error);
      return [];
    }

    return (data || []) as FoodChoice[];
  }

  // Local mock
  const allChoices = getMockFoodChoices();
  return allChoices[roomId] || [];
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
  const now = new Date().toISOString();

  if (supabase) {
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

  // Local mock
  const allSwipes = getMockRestaurantSwipes();
  const roomSwipes = allSwipes[roomId] || [];
  const existingIdx = roomSwipes.findIndex(
    (s) => s.participantId === participantId && s.restaurantId === restaurantId
  );

  const newSwipe: RestaurantSwipe = {
    id: generateUUID(),
    roomId,
    participantId,
    restaurantId,
    liked,
    createdAt: now,
  };

  if (existingIdx >= 0) {
    roomSwipes[existingIdx] = newSwipe;
  } else {
    roomSwipes.push(newSwipe);
  }

  allSwipes[roomId] = roomSwipes;
  saveMockRestaurantSwipes(allSwipes);

  broadcastChannel?.postMessage({
    type: 'ROOM_UPDATED',
    roomId,
    swipe: newSwipe,
  });

  return newSwipe;
}

/**
 * Fetch all restaurant swipes for a room.
 */
export async function getRestaurantSwipes(roomId: string): Promise<RestaurantSwipe[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('restaurant_swipes')
      .select('*')
      .eq('room_id', roomId);

    if (error) {
      console.error('Error fetching restaurant swipes', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      roomId: d.room_id,
      participantId: d.participant_id,
      restaurantId: d.restaurant_id,
      liked: d.liked,
      createdAt: d.created_at,
    }));
  }

  // Local mock
  const allSwipes = getMockRestaurantSwipes();
  return allSwipes[roomId] || [];
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
  if (supabase) {
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // BroadcastChannel and window storage listener for multi-tab realtime
  const handleMessage = (event: MessageEvent) => {
    if (!event.data?.roomId || event.data.roomId === roomId) {
      if (event.data?.type === 'ROOM_DELETED') {
        onRoomDeleted?.();
      } else if (event.data?.type === 'ROOM_RESET') {
        onRoomReset?.();
      } else if (event.data?.type === 'ROOM_UPDATED') {
        onUpdate();
      }
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (
      event.key === LOCAL_STORAGE_PARTICIPANTS || 
      event.key === LOCAL_STORAGE_ROOMS || 
      event.key === LOCAL_STORAGE_FOOD_CHOICES ||
      event.key === LOCAL_STORAGE_RESTAURANT_SWIPES
    ) {
      onUpdate();
    }
  };

  broadcastChannel?.addEventListener('message', handleMessage);
  window.addEventListener('storage', handleStorage);

  return () => {
    broadcastChannel?.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Reset room state, clearing food choices and restaurant swipes so squad can vote again.
 */
export async function resetRoomVoting(
  roomId: string,
  targetStage: RoomStage = 'voting'
): Promise<void> {
  const resetMeta: Partial<Room> = {
    stage: targetStage,
    status: 'food_selection',
    current_stage: 'voting',
    winning_category: null,
    consensus_type: null,
    tied_categories: [],
    winning_restaurant_id: null,
    swiping_started_at: null,
  };

  if (supabase) {
    // 1. Try atomic RPC wipe
    try {
      await supabase.rpc('reset_room_state', { target_room_id: roomId });
    } catch (e) {
      console.warn('Could not run reset_room_state RPC, applying direct table updates', e);
    }

    // 2. Direct table updates to guarantee reset across policies
    try {
      await supabase.from('rooms').update(resetMeta).eq('id', roomId);
    } catch (e) {
      console.warn('Could not update room state', e);
    }

    try {
      await supabase.from('food_choices').delete().eq('room_id', roomId);
    } catch (e) {
      console.warn('Could not delete food choices', e);
    }

    try {
      await supabase.from('restaurant_swipes').delete().eq('room_id', roomId);
    } catch (e) {
      console.warn('Could not delete restaurant swipes', e);
    }

    try {
      await supabase.from('order_items').delete().eq('room_id', roomId);
    } catch (e) {
      console.warn('Could not delete order items', e);
    }

    // 3. Broadcast room_reset over supabase realtime
    try {
      const channel = supabase.channel(`room:${roomId}`);
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
        event: 'room_reset',
        payload: { roomId },
      });
    } catch (e) {
      console.warn('Supabase broadcast room_reset error', e);
    }
  }

  // Local mock fallback
  const rooms = getMockRooms();
  for (const code of Object.keys(rooms)) {
    if (rooms[code].id === roomId) {
      rooms[code] = {
        ...rooms[code],
        ...resetMeta,
      };
      saveMockRooms(rooms);
      break;
    }
  }

  const allChoices = getMockFoodChoices();
  delete allChoices[roomId];
  saveMockFoodChoices(allChoices);

  const allSwipes = getMockRestaurantSwipes();
  delete allSwipes[roomId];
  saveMockRestaurantSwipes(allSwipes);

  const allOrders = getMockOrderItems();
  delete allOrders[roomId];
  saveMockOrderItems(allOrders);

  broadcastChannel?.postMessage({
    type: 'ROOM_RESET',
    roomId,
  });
}

/**
 * Permanently delete a room and clean up all associated data.
 */
export async function deleteRoom(roomId: string): Promise<void> {
  if (supabase) {
    // 1. Broadcast room_deleted event before removing row
    try {
      const channel = supabase.channel(`room:${roomId}`);
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
        event: 'room_deleted',
        payload: { roomId },
      });
    } catch (e) {
      console.warn('Supabase broadcast room_deleted error', e);
    }

    // 2. Delete room from rooms table (cascades to all child tables)
    try {
      await supabase.from('rooms').delete().eq('id', roomId);
    } catch (e) {
      console.error('Failed to delete room in Supabase', e);
    }
  }

  // Local mock fallback
  const rooms = getMockRooms();
  for (const code of Object.keys(rooms)) {
    if (rooms[code].id === roomId) {
      delete rooms[code];
      saveMockRooms(rooms);
      break;
    }
  }

  const participants = getMockParticipants();
  delete participants[roomId];
  saveMockParticipants(participants);

  const allChoices = getMockFoodChoices();
  delete allChoices[roomId];
  saveMockFoodChoices(allChoices);

  const allSwipes = getMockRestaurantSwipes();
  delete allSwipes[roomId];
  saveMockRestaurantSwipes(allSwipes);

  const allOrders = getMockOrderItems();
  delete allOrders[roomId];
  saveMockOrderItems(allOrders);

  broadcastChannel?.postMessage({
    type: 'ROOM_DELETED',
    roomId,
  });
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
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (!error && data) {
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
    } catch (e) {
      console.warn('Supabase fetchOrderItems failed, falling back to local storage', e);
    }
  }

  const allItems = getMockOrderItems();
  return allItems[roomId] || [];
}

/**
 * Add a new order item for a participant in a room.
 */
export async function addOrderItem(
  item: Omit<OrderItem, 'id' | 'createdAt'>
): Promise<OrderItem | null> {
  const now = new Date().toISOString();

  if (supabase) {
    try {
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

      if (!error && data) {
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
    } catch (e) {
      console.warn('Supabase addOrderItem failed, falling back to local mock', e);
    }
  }

  // Local fallback
  const newItem: OrderItem = {
    id: generateUUID(),
    roomId: item.roomId,
    participantId: item.participantId,
    participantName: item.participantName,
    itemName: item.itemName,
    notes: item.notes || '',
    createdAt: now,
  };

  const allItems = getMockOrderItems();
  const roomItems = allItems[item.roomId] || [];
  allItems[item.roomId] = [...roomItems, newItem];
  saveMockOrderItems(allItems);

  ordersBroadcastChannel?.postMessage({
    type: 'ORDER_ITEM_INSERTED',
    roomId: item.roomId,
    item: newItem,
  });

  return newItem;
}

/**
 * Delete an order item by its ID.
 */
export async function deleteOrderItem(itemId: string): Promise<boolean> {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemId);

      if (!error) {
        return true;
      }
    } catch (e) {
      console.warn('Supabase deleteOrderItem failed, falling back to local mock', e);
    }
  }

  // Local fallback
  const allItems = getMockOrderItems();
  let deletedRoomId: string | null = null;
  for (const rId of Object.keys(allItems)) {
    const prevCount = allItems[rId].length;
    allItems[rId] = allItems[rId].filter((i) => i.id !== itemId);
    if (allItems[rId].length !== prevCount) {
      deletedRoomId = rId;
      break;
    }
  }

  if (deletedRoomId) {
    saveMockOrderItems(allItems);
    ordersBroadcastChannel?.postMessage({
      type: 'ORDER_ITEM_DELETED',
      roomId: deletedRoomId,
      itemId,
    });
  }

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
      .subscribe();
  }

  // BroadcastChannel and window storage listener for multi-tab offline/mock realtime
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.roomId === roomId) {
      if (event.data.type === 'ORDER_ITEM_INSERTED' && event.data.item) {
        // Ensure the newly received item is saved in localStorage so a newly opened tab loads it
        const allItems = getMockOrderItems();
        const roomItems = allItems[roomId] || [];
        if (!roomItems.some((i) => i.id === event.data.item.id)) {
          allItems[roomId] = [...roomItems, event.data.item];
          saveMockOrderItems(allItems);
        }
        onInsert(event.data.item);
      } else if (event.data.type === 'ORDER_ITEM_DELETED' && event.data.itemId) {
        // Ensure the deleted item is removed from localStorage
        const allItems = getMockOrderItems();
        const roomItems = allItems[roomId] || [];
        if (roomItems.some((i) => i.id === event.data.itemId)) {
          allItems[roomId] = roomItems.filter((i) => i.id !== event.data.itemId);
          saveMockOrderItems(allItems);
        }
        onDelete(event.data.itemId);
      }
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOCAL_STORAGE_ORDER_ITEMS) {
      const allItems = getMockOrderItems();
      const roomItems = allItems[roomId] || [];
      if (roomItems.length > 0) {
        // storage updated
      }
    }
  };

  ordersBroadcastChannel?.addEventListener('message', handleMessage);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
    ordersBroadcastChannel?.removeEventListener('message', handleMessage);
    window.removeEventListener('storage', handleStorage);
  };
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

  revoteBroadcastChannel?.postMessage({
    roomId,
    participant,
  });
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
      .subscribe();
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.roomId === roomId && event.data?.participant) {
      callback(event.data.participant);
    }
  };

  revoteBroadcastChannel?.addEventListener('message', handleMessage);

  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
    revoteBroadcastChannel?.removeEventListener('message', handleMessage);
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

  minigamesBroadcastChannel?.postMessage({
    type: 'SUDDEN_DEATH_START',
    roomId,
    restaurants,
    startedAt: Date.now(),
  });
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
      .subscribe();
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.roomId === roomId && event.data?.type === 'SUDDEN_DEATH_START' && event.data?.restaurants) {
      callback(event.data.restaurants, event.data.startedAt || Date.now());
    }
  };

  minigamesBroadcastChannel?.addEventListener('message', handleMessage);

  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
    minigamesBroadcastChannel?.removeEventListener('message', handleMessage);
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

  minigamesBroadcastChannel?.postMessage({
    type: 'SUDDEN_DEATH_VOTE',
    roomId,
    ...vote,
  });
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
      .subscribe();
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.roomId === roomId && event.data?.type === 'SUDDEN_DEATH_VOTE') {
      callback({
        participantId: event.data.participantId,
        restaurantId: event.data.restaurantId,
      });
    }
  };

  minigamesBroadcastChannel?.addEventListener('message', handleMessage);

  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
    minigamesBroadcastChannel?.removeEventListener('message', handleMessage);
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

  minigamesBroadcastChannel?.postMessage({
    type: 'ROULETTE_OPEN',
    roomId,
    restaurants,
  });
}

export async function broadcastRouletteClose(roomId: string): Promise<void> {
  if (supabase) {
    try {
      const channel = supabase.channel(`roulette_modal:${roomId}`);
      if (channel.state !== 'joined') {
        channel.subscribe();
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

  minigamesBroadcastChannel?.postMessage({
    type: 'ROULETTE_CLOSE',
    roomId,
  });
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
      .subscribe();
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.roomId === roomId) {
      if (event.data?.type === 'ROULETTE_OPEN' && event.data?.restaurants) {
        onOpen(event.data.restaurants);
      } else if (event.data?.type === 'ROULETTE_CLOSE') {
        onClose?.();
      }
    }
  };

  minigamesBroadcastChannel?.addEventListener('message', handleMessage);

  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
    minigamesBroadcastChannel?.removeEventListener('message', handleMessage);
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

  minigamesBroadcastChannel?.postMessage({
    type: 'ROULETTE_SPIN',
    roomId,
    ...spinData,
  });
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
      .subscribe();
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.roomId === roomId && event.data?.type === 'ROULETTE_SPIN') {
      callback({
        winnerId: event.data.winnerId,
        targetAngle: event.data.targetAngle,
      });
    }
  };

  minigamesBroadcastChannel?.addEventListener('message', handleMessage);

  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
    minigamesBroadcastChannel?.removeEventListener('message', handleMessage);
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

  minigamesBroadcastChannel?.postMessage({
    type: 'CATEGORY_ROULETTE_SPIN',
    roomId,
    ...spinData,
  });
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
      .subscribe();
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.data?.roomId === roomId && event.data?.type === 'CATEGORY_ROULETTE_SPIN') {
      callback({
        winnerId: event.data.winnerId,
        targetAngle: event.data.targetAngle,
      });
    }
  };

  minigamesBroadcastChannel?.addEventListener('message', handleMessage);

  return () => {
    if (supabase && channel) {
      supabase.removeChannel(channel);
    }
    minigamesBroadcastChannel?.removeEventListener('message', handleMessage);
  };
}



