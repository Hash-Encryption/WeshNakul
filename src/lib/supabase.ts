import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Room, Participant, CreateRoomInput, JoinRoomInput } from '../types/database';
import { getOrCreateSessionToken, generateUUID, generateRoomCode } from './session';
import { getProceduralToken } from './tokenGenerator';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
      room: roomData as Room,
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
  const sessionToken = getOrCreateSessionToken();
  const code = generateRoomCode();
  const roomId = generateUUID();
  const participantId = generateUUID();
  const tokenCombo = getProceduralToken(0);

  const newRoom: Room = {
    id: roomId,
    code,
    status: 'lobby',
    eating_mode: input.eating_mode,
    city: input.city,
    neighborhood: input.neighborhood || null,
    language: input.language,
    host_participant_id: participantId,
    current_stage: 'lobby',
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

    const { error: partErr } = await supabase.from('participants').insert([hostParticipant]);
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
  const sessionToken = getOrCreateSessionToken();

  const { room, participants } = await getRoomByCode(normalizedCode);
  if (!room) {
    return { success: false, error: 'ROOM_NOT_FOUND' };
  }

  // Check if session token already joined
  const existing = participants.find((p) => p.session_token === sessionToken);
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
    const { error } = await supabase.from('participants').insert([newParticipant]);
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
 * Subscribe to realtime participant and room updates.
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // BroadcastChannel and window storage listener for multi-tab realtime
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'ROOM_UPDATED' && event.data?.roomId === roomId) {
      onUpdate();
    }
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LOCAL_STORAGE_PARTICIPANTS || event.key === LOCAL_STORAGE_ROOMS) {
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
