import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Room, Participant, CreateRoomInput, JoinRoomInput, FoodChoice, RoomStage, ConsensusType } from '../types/database';
import type { RestaurantSwipe } from '../types/restaurant';
import { getOrCreateSessionToken, generateUUID, generateRoomCode } from './session';
import { getProceduralToken } from './tokenGenerator';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://apsfxnmzfllraoctbwyq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_P2K0kEJqVuKxiGh-BxSRQg_xgtRoDrz';

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

const broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('wsh_room_sync')
  : null;

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
 * Fetch a room by its 4-character code.
 */
export async function getRoomByCode(code: string): Promise<{ room: Room | null; participants: Participant[] }> {
  const normalizedCode = code.trim().toUpperCase();

  if (supabase) {
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    if (roomError || !roomData) {
      return { room: null, participants: [] };
    }

    const { data: partData } = await supabase
      .from('participants')
      .select('*')
      .eq('room_id', roomData.id)
      .order('joined_at', { ascending: true });

    return {
      room: {
        ...roomData,
        stage: roomData.stage || 'lobby',
        tied_categories: roomData.tied_categories || [],
      } as Room,
      participants: (partData || []) as Participant[],
    };
  }

  // Local fallback
  const rooms = getMockRooms();
  const room = rooms[normalizedCode] || null;
  if (!room) return { room: null, participants: [] };

  const participants = getMockParticipants()[room.id] || [];
  return { room, participants };
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

  const newRoom: Room = {
    id: roomId,
    code,
    status: 'lobby',
    stage: 'lobby',
    eating_mode: input.eating_mode,
    city: input.city,
    neighborhood: input.neighborhood || null,
    language: input.language,
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
    nickname: input.host_nickname.trim(),
    player_color: tokenCombo.color,
    player_shape: tokenCombo.shape,
    is_host: true,
    status: 'active',
    joined_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
  };

  if (supabase) {
    const { error: roomErr } = await supabase.from('rooms').insert([newRoom]);
    if (roomErr) throw roomErr;

    let { error: partErr } = await supabase.from('participants').insert([hostParticipant]);
    // Resilient fallback: If database still has legacy unique constraint on session_token,
    // generate a fresh UUID and retry insertion
    if (partErr && (partErr.code === '23505' || partErr.message?.includes('session_token'))) {
      const freshToken = generateUUID();
      hostParticipant.session_token = freshToken;
      try {
        localStorage.setItem(`wesh_nakul_session_${code}`, freshToken);
      } catch {}
      const retry = await supabase.from('participants').insert([hostParticipant]);
      partErr = retry.error;
    }
    if (partErr) throw partErr;

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
  onUpdate: () => void
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
        () => onUpdate()
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // BroadcastChannel and window storage listener for multi-tab realtime
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'ROOM_UPDATED' && (!event.data.roomId || event.data.roomId === roomId)) {
      onUpdate();
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
  const resetMeta = {
    stage: targetStage,
    winning_category: null,
    consensus_type: null,
    tied_categories: [],
    winning_restaurant_id: null,
    swiping_started_at: null,
  };

  if (supabase) {
    // 1. Update room stage
    await supabase.from('rooms').update(resetMeta).eq('id', roomId);

    // 2. Reset food choices (un-submit and clear categories)
    try {
      await supabase
        .from('food_choices')
        .update({
          selected_categories: [],
          is_submitted: false,
          submitted_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('room_id', roomId);
    } catch (e) {
      console.warn('Could not reset food choices', e);
    }

    // Try delete on food choices if permitted
    try {
      await supabase.from('food_choices').delete().eq('room_id', roomId);
    } catch {
      // Ignored if delete policy not active
    }

    // 3. Delete restaurant swipes
    try {
      await supabase.from('restaurant_swipes').delete().eq('room_id', roomId);
    } catch (e) {
      console.warn('Could not delete restaurant swipes', e);
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

  broadcastChannel?.postMessage({
    type: 'ROOM_UPDATED',
    roomId,
  });
}
