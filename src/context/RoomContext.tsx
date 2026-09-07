import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Room, Participant, CreateRoomInput, FoodChoice, ConsensusType } from '../types/database';
import { 
  getRoomByCode, 
  createRoom as apiCreateRoom, 
  joinRoom as apiJoinRoom, 
  subscribeToRoom,
  updateRoomStage,
  upsertFoodChoice,
  getFoodChoices,
  resetRoomVoting as apiResetRoomVoting,
  deleteRoom as apiDeleteRoom,
  isRoomExpired,
  isSupabaseNetworkError
} from '../lib/supabase';
import { 
  getActiveRoomCode, 
  setActiveRoomCode, 
  getOrCreateSessionToken,
  clearRoomSession
} from '../lib/session';
import { calculateConsensus } from '../lib/consensus';
import { useLocale } from './LocaleContext';

interface RoomContextType {
  currentRoom: Room | null;
  currentParticipant: Participant | null;
  participants: Participant[];
  foodChoices: FoodChoice[];
  myChoice: FoodChoice | null;
  isLoading: boolean;
  error: string | null;
  sessionNotice: string | null;
  clearSessionNotice: () => void;
  reportError: (error: unknown) => void;
  failureNotice: string | null;
  clearFailureNotice: () => void;
  createNewRoom: (input: CreateRoomInput) => Promise<{ room: Room; participant: Participant }>;
  joinExistingRoom: (code: string, nickname: string) => Promise<{ success: boolean; isFull?: boolean; error?: string }>;
  loadRoom: (code: string) => Promise<boolean>;
  refreshRoom: () => Promise<void>;
  leaveRoom: () => void;
  destroyRoom: () => Promise<void>;
  isHost: boolean;
  startVoting: () => Promise<void>;
  submitFoodChoices: (selectedCategories: string[]) => Promise<void>;
  resolveConsensus: (winner: string, consensusType: ConsensusType) => Promise<void>;
  startTiebreaker: (tiedCategories: string[]) => Promise<void>;
  resetToLobby: () => Promise<void>;
  resetRoomVoting: (targetStage?: import('../types/database').RoomStage) => Promise<void>;
  startSwiping: () => Promise<void>;
}

const RoomContext = createContext<RoomContextType | null>(null);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useLocale();
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [foodChoices, setFoodChoices] = useState<FoodChoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const [failureNotice, setFailureNotice] = useState<string | null>(null);
  const clearFailureNotice = useCallback(() => setFailureNotice(null), []);
  const reportError = useCallback((err: unknown) => {
    setFailureNotice(t(isSupabaseNetworkError(err) ? 'session.networkFailure' : 'common.errorGeneric'));
  }, [t]);
  useEffect(() => {
    const onFailure = () => setFailureNotice(t('session.networkFailure'));
    window.addEventListener('supabase-network-failure', onFailure);
    return () => window.removeEventListener('supabase-network-failure', onFailure);
  }, [t]);

  const clearSessionNotice = useCallback(() => {
    setSessionNotice(null);
  }, []);

  const currentRoomRef = useRef<Room | null>(null);
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  const currentParticipantRef = useRef<Participant | null>(null);
  useEffect(() => {
    currentParticipantRef.current = currentParticipant;
  }, [currentParticipant]);

  const leaveRoom = useCallback(() => {
    const code = currentRoomRef.current?.code;
    clearRoomSession(code);
    currentRoomRef.current = null;
    currentParticipantRef.current = null;
    setCurrentRoom(null);
    setCurrentParticipant(null);
    setParticipants([]);
    setFoodChoices([]);
    setActiveRoomCode(null);
    if (window.location.pathname.startsWith('/r/')) {
      window.history.pushState({}, '', '/');
    }
  }, []);

  const destroyRoom = useCallback(async () => {
    const room = currentRoomRef.current;
    if (room?.id) {
      await apiDeleteRoom(room.id);
    }
    leaveRoom();
  }, [leaveRoom]);

  const refreshRoom = useCallback(async () => {
    const roomCode = currentRoomRef.current?.code;
    if (!roomCode) return;
    try {
      const { room, participants: parts, isExpired } = await getRoomByCode(roomCode);
      if (isExpired) {
        clearRoomSession(roomCode);
        setSessionNotice(t('session.expiredNotice'));
        leaveRoom();
        return;
      }
      if (room) {
        currentRoomRef.current = room;
        setCurrentRoom(room);
        setParticipants(parts);
        const roomToken = getOrCreateSessionToken(roomCode);
        const legacyToken = getOrCreateSessionToken();
        const me = parts.find((p) => p.session_token === roomToken || p.session_token === legacyToken);
        if (me) {
          currentParticipantRef.current = me;
          setCurrentParticipant(me);
        }

        const choices = await getFoodChoices(room.id);
        setFoodChoices(choices);
      }
    } catch (err) {
      console.error('Error refreshing room', err);
      reportError(err);
    }
  }, [leaveRoom, t, reportError]);

  // Load a room by code
  const loadRoom = useCallback(async (code: string): Promise<boolean> => {
    const normalizedCode = code.trim().toUpperCase();
    setIsLoading(true);
    setError(null);
    try {
      // Guard against eviction loop: If room is already active in memory and fresh, keep it
      if (
        currentRoomRef.current?.code === normalizedCode &&
        !isRoomExpired(currentRoomRef.current.created_at)
      ) {
        setIsLoading(false);
        return true;
      }

      const { room, participants: parts, isExpired } = await getRoomByCode(normalizedCode);
      if (isExpired) {
        clearRoomSession(normalizedCode);
        setSessionNotice(t('session.expiredNotice'));
        leaveRoom();
        setIsLoading(false);
        return false;
      }
      if (!room) {
        setSessionNotice(t('session.invalidCode'));
        setIsLoading(false);
        return false;
      }

      // If user is at root '/' without /r/:code in URL and the room was already matched,
      // clear the active room code so user can start fresh on the landing page!
      const isRoot = window.location.pathname === '/' || window.location.pathname === '';
      const hasUrlCode = window.location.pathname.match(/\/r\/([A-Za-z0-9]{4})/i);
      if (isRoot && !hasUrlCode && room.stage === 'matched') {
        setActiveRoomCode(null);
        setIsLoading(false);
        return false;
      }

      const choices = await getFoodChoices(room.id);
      currentRoomRef.current = room;
      setCurrentRoom(room);
      setParticipants(parts);
      setActiveRoomCode(room.code);

      const roomToken = getOrCreateSessionToken(room.code);
      const legacyToken = getOrCreateSessionToken();
      const me = parts.find((p) => p.session_token === roomToken || p.session_token === legacyToken);
      if (me) {
        currentParticipantRef.current = me;
        setCurrentParticipant(me);
      } else {
        currentParticipantRef.current = null;
        setCurrentParticipant(null);
      }

      setFoodChoices(choices);

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error loading room', err);
      reportError(err);
      setError('FAILED_TO_LOAD');
      setIsLoading(false);
      return false;
    }
  }, [leaveRoom, t, reportError]);

  // Session recovery on app mount
  useEffect(() => {
    const activeCode = getActiveRoomCode();
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

    const unsubscribe = subscribeToRoom(
      currentRoom.id,
      () => {
        refreshRoom();
      },
      () => {
        // onRoomDeleted
        const wasHost = currentParticipantRef.current?.is_host;
        leaveRoom();
        if (!wasHost) {
          setSessionNotice(t('session.roomClosedByHost'));
        }
      },
      () => {
        // onRoomReset
        setFoodChoices([]);
        setSessionNotice(t('session.resetSuccess'));
        refreshRoom();
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentRoom?.id, refreshRoom, leaveRoom, t]);

  // Periodic 30-minute TTL check
  useEffect(() => {
    if (!currentRoom?.created_at) return;

    const checkExpiry = () => {
      if (isRoomExpired(currentRoom.created_at)) {
        clearRoomSession(currentRoom.code);
        setSessionNotice(t('session.expiredNotice'));
        leaveRoom();
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 15000);
    return () => clearInterval(interval);
  }, [currentRoom?.created_at, currentRoom?.code, leaveRoom, t]);

  // Automatic Consensus Evaluation:
  // When in voting stage and all active participants have submitted their choices
  useEffect(() => {
    if (!currentRoom || currentRoom.stage !== 'voting') return;
    if (participants.length === 0) return;

    const submittedChoices = foodChoices.filter((c) => c.is_submitted);
    const allSubmitted = participants.length > 0 && 
      participants.every((p) => submittedChoices.some((c) => c.participant_id === p.id));

    if (allSubmitted && currentParticipant?.is_host) {
      // Evaluate consensus
      const mappedSubmissions = submittedChoices.map((s) => ({
        participant_id: s.participant_id,
        selected_categories: s.selected_categories,
      }));

      const result = calculateConsensus(mappedSubmissions);

      if (result.status === 'UNANIMOUS_MATCH' && result.winner) {
        updateRoomStage(currentRoom.id, 'consensus', {
          winning_category: result.winner,
          consensus_type: 'unanimous',
          tied_categories: [],
        });
      } else if (result.status === 'UNANIMOUS_TIE' && result.tiedCategories) {
        updateRoomStage(currentRoom.id, 'tiebreaker', {
          tied_categories: result.tiedCategories,
          consensus_type: null,
          winning_category: null,
        });
      } else if (result.status === 'CONTENDERS_FOUND' && result.topCategories) {
        updateRoomStage(currentRoom.id, 'tiebreaker', {
          tied_categories: result.topCategories.map((c) => c.id),
          consensus_type: null,
          winning_category: null,
        });
      } else if (result.status === 'NO_CONSENSUS' && result.topCategories) {
        // Deadlock resolution: Top contenders go to tiebreaker for host or squad resolution
        updateRoomStage(currentRoom.id, 'tiebreaker', {
          tied_categories: result.topCategories.map((c) => c.id),
          consensus_type: null,
          winning_category: null,
        });
      }
    }
  }, [currentRoom, participants, foodChoices, currentParticipant?.is_host]);

  const createNewRoom = async (input: CreateRoomInput) => {
    setError(null);
    // Explicitly clear previous room tokens from localStorage BEFORE invoking createRoom
    const prevCode = currentRoomRef.current?.code || getActiveRoomCode();
    if (prevCode) {
      clearRoomSession(prevCode);
    }
    clearRoomSession();

    try {
      const { room, participant } = await apiCreateRoom(input);
      currentRoomRef.current = room;
      currentParticipantRef.current = participant;
      setCurrentRoom(room);
      setCurrentParticipant(participant);
      setParticipants([participant]);
      setFoodChoices([]);
      setActiveRoomCode(room.code);
      return { room, participant };
    } catch (err: any) {
      console.error('[RoomContext createNewRoom] Failed to create room:', err);
      setError(err?.message || 'FAILED_TO_CREATE');
      reportError(err);
      throw err;
    }
  };

  const joinExistingRoom = async (code: string, nickname: string) => {
    setError(null);
    try {
      const res = await apiJoinRoom({ code, nickname });
      if (res.success && res.room && res.participant) {
        const { participants: parts } = await getRoomByCode(res.room.code);
        const choices = await getFoodChoices(res.room.id);
        setCurrentRoom(res.room);
        setCurrentParticipant(res.participant);
        setActiveRoomCode(res.room.code);
        setParticipants(parts);
        setFoodChoices(choices);
        return { success: true };
      }
      if (res.error === 'ROOM_EXPIRED') {
        setSessionNotice(t('session.expiredNotice'));
      } else if (res.error === 'ROOM_NOT_FOUND') {
        setSessionNotice(t('session.invalidCode'));
      }
      return { success: false, isFull: res.isFull, error: res.error };
    } catch (err: any) {
      reportError(err);
      return { success: false, error: err?.message || 'JOIN_FAILED' };
    }
  };

  const startVoting = async () => {
    if (!currentRoom) return;
    await updateRoomStage(currentRoom.id, 'voting', {
      winning_category: null,
      consensus_type: null,
      tied_categories: [],
    });
    await refreshRoom();
  };

  const submitFoodChoices = async (selectedCategories: string[]) => {
    if (!currentRoom || !currentParticipant) return;
    await upsertFoodChoice(currentRoom.id, currentParticipant.id, selectedCategories, true);
    await refreshRoom();
  };

  const resolveConsensus = async (winner: string, consensusType: ConsensusType) => {
    if (!currentRoom) return;
    await updateRoomStage(currentRoom.id, 'consensus', {
      winning_category: winner,
      consensus_type: consensusType,
      tied_categories: [],
    });
    await refreshRoom();
  };

  const startTiebreaker = async (tiedCategories: string[]) => {
    if (!currentRoom) return;
    await updateRoomStage(currentRoom.id, 'tiebreaker', {
      tied_categories: tiedCategories,
      consensus_type: null,
      winning_category: null,
    });
    await refreshRoom();
  };

  const resetRoomVoting = async (targetStage: import('../types/database').RoomStage = 'voting') => {
    if (!currentRoom) return;
    setIsLoading(true);
    setFoodChoices([]);
    try {
      await apiResetRoomVoting(currentRoom.id, targetStage);
      await refreshRoom();
    } catch (err) {
      console.error('Error resetting room voting', err);
      reportError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToLobby = async () => {
    if (!currentRoom) return;
    await resetRoomVoting('lobby');
  };

  const startSwiping = async () => {
    if (!currentRoom) return;
    await updateRoomStage(currentRoom.id, 'swiping', {
      swiping_started_at: new Date().toISOString(),
      winning_restaurant_id: null,
    });
    await refreshRoom();
  };

  const isHost = Boolean(currentParticipant?.is_host);
  const myChoice = currentParticipant
    ? foodChoices.find((c) => c.participant_id === currentParticipant.id) || null
    : null;

  return (
    <RoomContext.Provider
      value={{
        currentRoom,
        currentParticipant,
        participants,
        foodChoices,
        myChoice,
        isLoading,
        error,
        sessionNotice,
        clearSessionNotice,
        reportError,
        failureNotice,
        clearFailureNotice,
        createNewRoom,
        joinExistingRoom,
        loadRoom,
        refreshRoom,
        leaveRoom,
        destroyRoom,
        isHost,
        startVoting,
        submitFoodChoices,
        resolveConsensus,
        startTiebreaker,
        resetToLobby,
        resetRoomVoting,
        startSwiping,
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
