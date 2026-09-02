import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Room, Participant, CreateRoomInput } from '../types/database';
import { 
  getRoomByCode, 
  createRoom as apiCreateRoom, 
  joinRoom as apiJoinRoom, 
  subscribeToRoom 
} from '../lib/supabase';
import { 
  getActiveRoomCode, 
  setActiveRoomCode, 
  getOrCreateSessionToken 
} from '../lib/session';

interface RoomContextType {
  currentRoom: Room | null;
  currentParticipant: Participant | null;
  participants: Participant[];
  isLoading: boolean;
  error: string | null;
  createNewRoom: (input: CreateRoomInput) => Promise<{ room: Room; participant: Participant }>;
  joinExistingRoom: (code: string, nickname: string) => Promise<{ success: boolean; isFull?: boolean; error?: string }>;
  loadRoom: (code: string) => Promise<boolean>;
  refreshRoom: () => Promise<void>;
  leaveRoom: () => void;
  isHost: boolean;
}

const RoomContext = createContext<RoomContextType | null>(null);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const sessionToken = getOrCreateSessionToken();

  const refreshRoom = useCallback(async () => {
    if (!currentRoom?.code) return;
    try {
      const { room, participants: parts } = await getRoomByCode(currentRoom.code);
      if (room) {
        setCurrentRoom(room);
        setParticipants(parts);
        const me = parts.find((p) => p.session_token === sessionToken);
        if (me) {
          setCurrentParticipant(me);
        }
      }
    } catch (err) {
      console.error('Error refreshing room', err);
    }
  }, [currentRoom?.code, sessionToken]);

  // Load a room by code
  const loadRoom = useCallback(async (code: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const { room, participants: parts } = await getRoomByCode(code);
      if (!room) {
        setIsLoading(false);
        return false;
      }
      setCurrentRoom(room);
      setParticipants(parts);
      setActiveRoomCode(room.code);

      const me = parts.find((p) => p.session_token === sessionToken);
      if (me) {
        setCurrentParticipant(me);
      } else {
        setCurrentParticipant(null);
      }
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error loading room', err);
      setError('FAILED_TO_LOAD');
      setIsLoading(false);
      return false;
    }
  }, [sessionToken]);

  // Session recovery on app mount
  useEffect(() => {
    const activeCode = getActiveRoomCode();
    // Check URL search or path as well (e.g. /r/:code)
    const pathname = window.location.pathname;
    const match = pathname.match(/\/r\/([A-Za-z0-9]{4})/i);
    const codeFromUrl = match ? match[1].toUpperCase() : null;

    const targetCode = codeFromUrl || activeCode;

    if (targetCode) {
      loadRoom(targetCode);
    } else {
      setIsLoading(false);
    }
  }, [loadRoom]);

  // Realtime subscription
  useEffect(() => {
    if (!currentRoom?.id) return;

    const unsubscribe = subscribeToRoom(currentRoom.id, () => {
      refreshRoom();
    });

    return () => {
      unsubscribe();
    };
  }, [currentRoom?.id, refreshRoom]);

  const createNewRoom = async (input: CreateRoomInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const { room, participant } = await apiCreateRoom(input);
      setCurrentRoom(room);
      setCurrentParticipant(participant);
      setParticipants([participant]);
      setActiveRoomCode(room.code);
      setIsLoading(false);
      return { room, participant };
    } catch (err: any) {
      setError(err?.message || 'FAILED_TO_CREATE');
      setIsLoading(false);
      throw err;
    }
  };

  const joinExistingRoom = async (code: string, nickname: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiJoinRoom({ code, nickname });
      if (res.success && res.room && res.participant) {
        setCurrentRoom(res.room);
        setCurrentParticipant(res.participant);
        setActiveRoomCode(res.room.code);
        // fetch latest participants list
        const { participants: parts } = await getRoomByCode(res.room.code);
        setParticipants(parts);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, isFull: res.isFull, error: res.error };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err?.message || 'JOIN_FAILED' };
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setCurrentParticipant(null);
    setParticipants([]);
    setActiveRoomCode(null);
    // clean url if needed
    if (window.location.pathname.startsWith('/r/')) {
      window.history.pushState({}, '', '/');
    }
  };

  const isHost = Boolean(currentParticipant?.is_host);

  return (
    <RoomContext.Provider
      value={{
        currentRoom,
        currentParticipant,
        participants,
        isLoading,
        error,
        createNewRoom,
        joinExistingRoom,
        loadRoom,
        refreshRoom,
        leaveRoom,
        isHost,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
