import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Room, Participant, CreateRoomInput, FoodChoice, ConsensusType } from '../types/database';
import { 
  getRoomByCode, 
  createRoom as apiCreateRoom, 
  joinRoom as apiJoinRoom, 
  subscribeToRoom,
  startCategoryVoting,
  submitCategorySelection,
  resolveCategoryTie,
  resolveRestaurantTie,
  beginRestaurantVoting,
  getFoodChoices,
  resetRoomVoting as apiResetRoomVoting,
  deleteRoom as apiDeleteRoom,
  isRoomExpired,
  isSupabaseNetworkError,
  broadcastDecisionSpin,
  subscribeToDecisionSpin,
} from '../lib/supabase';
import { 
  getActiveRoomCode, 
  setActiveRoomCode, 
  getOrCreateSessionToken,
  clearRoomSession
} from '../lib/session';
import { useLocale } from './LocaleContext';
import { normalizeCategorySelection } from '../lib/consensus';
import type { DecisionSpin } from '../types/roulette';
import { perf } from '../lib/perf';

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
  refreshRoom: (options?: { fetchParticipants?: boolean; fetchChoices?: boolean }) => Promise<void>;
  applyAuthoritativeRoomState: (state: import('../types/database').RoomDecisionState) => void;
  leaveRoom: (preserveToken?: boolean) => void;
  destroyRoom: () => Promise<void>;
  isHost: boolean;
  startVoting: () => Promise<void>;
  submitFoodChoices: (selectedCategories: string[]) => Promise<void>;
  resolveConsensus: (winner: string, consensusType: ConsensusType) => Promise<void>;
  resetToLobby: () => Promise<void>;
  resetRoomVoting: (targetStage?: import('../types/database').RoomStage) => Promise<void>;
  startSwiping: () => Promise<void>;
  decisionSpin: DecisionSpin | null;
  startCategoryRoulette: () => Promise<void>;
  startRestaurantRoulette: () => Promise<void>;
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
  const [decisionSpin, setDecisionSpin] = useState<DecisionSpin | null>(null);
  const decisionSpinRef = useRef<DecisionSpin | null>(null);
  const applyDecisionSpin = useCallback((spin: DecisionSpin | null) => {
    decisionSpinRef.current = spin;
    setDecisionSpin(spin);
  }, []);

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

  const pendingResolvedRoomRef = useRef<Room | null>(null);

  const applyAuthoritativeRoomState = useCallback((state: import('../types/database').RoomDecisionState) => {
    if (!state?.room) return;
    const room = state.room;
    if (room.version < (currentRoomRef.current?.version ?? -1)) return;

    // Check if a decision spin is active and uncompleted
    const spin = decisionSpinRef.current;
    const spinResolvedRoom = spin?.kind === 'category'
      ? room.stage === 'consensus' && room.winning_category
      : room.stage === 'matched' && room.winning_restaurant_id;

    if (spin && !spin.cancelled && spinResolvedRoom) {
      pendingResolvedRoomRef.current = room;
      if (!spin.winnerId) {
        const winnerId = spin.kind === 'category' ? room.winning_category! : room.winning_restaurant_id!;
        const revealAt = spin.revealAt || spin.plannedRevealAt;
        applyDecisionSpin({ ...spin, winnerId, revealAt, completeAt: revealAt + 1200 });
      }
      return;
    }

    currentRoomRef.current = room;
    setCurrentRoom(room);

    if (state.myCategorySelection) {
      setFoodChoices((prev) => {
        const idx = prev.findIndex((c) => c.participant_id === state.myCategorySelection!.participant_id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = state.myCategorySelection!;
          return next;
        }
        return [...prev, state.myCategorySelection!];
      });
    }
  }, [applyDecisionSpin]);

  const leaveRoom = useCallback((preserveToken = true) => {
    const code = currentRoomRef.current?.code;
    if (preserveToken) {
      setActiveRoomCode(null);
    } else {
      clearRoomSession(code);
    }
    currentRoomRef.current = null;
    currentParticipantRef.current = null;
    pendingResolvedRoomRef.current = null;
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
      const participant = currentParticipantRef.current;
      if (participant) await apiDeleteRoom(room.id, participant.session_token);
    }
    leaveRoom(false);
  }, [leaveRoom]);

  const inFlightRefreshRef = useRef<Promise<void> | null>(null);
  const queuedRefreshRef = useRef<boolean>(false);

  const refreshRoom = useCallback(async (options?: { fetchParticipants?: boolean; fetchChoices?: boolean }) => {
    const roomCode = currentRoomRef.current?.code;
    if (!roomCode) return;

    if (inFlightRefreshRef.current) {
      perf.increment('coalesced_refreshes');
      queuedRefreshRef.current = true;
      return inFlightRefreshRef.current;
    }

    const endPerf = perf.start('refreshRoom');
    const performRefresh = async () => {
      try {
        const { room, participants: parts, isExpired } = await getRoomByCode(roomCode);
        if (isExpired) {
          clearRoomSession(roomCode);
          setSessionNotice(t('session.expiredNotice'));
          leaveRoom(false);
          return;
        }
        if (room) {
          const spin = decisionSpinRef.current;
          const spinResolvedRoom = spin?.kind === 'category'
            ? room.stage === 'consensus' && room.winning_category
            : room.stage === 'matched' && room.winning_restaurant_id;
          if (spin && !spin.cancelled && spinResolvedRoom) {
            pendingResolvedRoomRef.current = room;
            if (!spin.winnerId) {
              const winnerId = spin.kind === 'category' ? room.winning_category! : room.winning_restaurant_id!;
              const revealAt = spin.revealAt || spin.plannedRevealAt;
              applyDecisionSpin({ ...spin, winnerId, revealAt, completeAt: revealAt + 1200 });
            }
            return;
          }
          if (room.version < (currentRoomRef.current?.version ?? -1)) return;
          currentRoomRef.current = room;
          setCurrentRoom(room);
          if (options?.fetchParticipants !== false) {
            setParticipants(parts);
          }
          const roomToken = getOrCreateSessionToken(roomCode);
          const legacyToken = getOrCreateSessionToken();
          const me = parts.find((p) => p.session_token === roomToken || p.session_token === legacyToken);
          if (me) {
            currentParticipantRef.current = me;
            setCurrentParticipant(me);
          }

          if (options?.fetchChoices !== false && room.stage === 'voting') {
            const choices = me ? await getFoodChoices(room.id, me.session_token) : [];
            setFoodChoices(choices);
          }
        }
      } catch (err) {
        console.error('Error refreshing room', err);
        reportError(err);
      } finally {
        endPerf();
        inFlightRefreshRef.current = null;
        if (queuedRefreshRef.current) {
          queuedRefreshRef.current = false;
          void refreshRoom(options);
        }
      }
    };

    inFlightRefreshRef.current = performRefresh();
    return inFlightRefreshRef.current;
  }, [leaveRoom, t, reportError, applyDecisionSpin]);

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
        leaveRoom(false);
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

      currentRoomRef.current = room;
      setCurrentRoom(room);
      setParticipants(parts);
      setActiveRoomCode(room.code);

      const roomToken = getOrCreateSessionToken(room.code);
      const legacyToken = getOrCreateSessionToken();
      const me = parts.find((p) => p.session_token === roomToken || p.session_token === legacyToken);
      const choices = me ? await getFoodChoices(room.id, me.session_token) : [];
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
      (payload) => {
        // Rooms change: if incoming payload has a version and it's already <= our current version, ignore!
        if (payload?.new?.version !== undefined && payload.new.version <= (currentRoomRef.current?.version ?? -1)) {
          perf.increment('skipped_stale_realtime_events');
          return;
        }
        refreshRoom({ fetchParticipants: false });
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
      },
      () => {
        // onParticipantsUpdate (joins / leaves)
        refreshRoom({ fetchParticipants: true });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentRoom?.id, refreshRoom, leaveRoom, t]);

  useEffect(() => {
    if (!currentRoom?.id) return;
    return subscribeToDecisionSpin(currentRoom.id, (spin) => {
      if (spin.cancelled) {
        if (decisionSpinRef.current?.spinId === spin.spinId) {
          applyDecisionSpin(null);
          pendingResolvedRoomRef.current = null;
        }
        return;
      }
      const room = currentRoomRef.current;
      const authoritativeIds = spin.kind === 'category'
        ? room?.tied_categories || []
        : room?.restaurant_summary?.tiedRestaurantIds || [];

      if (new Set(spin.candidateIds).size !== spin.candidateIds.length) return;
      // If room still has tied_categories, check candidate matching
      if (authoritativeIds.length > 0) {
        if (spin.candidateIds.length !== authoritativeIds.length || spin.candidateIds.some((id) => !authoritativeIds.includes(id))) return;
      }
      if (spin.winnerId && !spin.candidateIds.includes(spin.winnerId)) return;

      if (spin.winnerId) {
        const existing = decisionSpinRef.current;
        // Accept winner broadcast even if initial cruising spin was missed
        const revealAt = spin.revealAt || existing?.revealAt || Date.now() + 1800;
        const completeAt = Math.max(revealAt + 1200, Date.now() + 2400);
        applyDecisionSpin({
          spinId: spin.spinId,
          kind: spin.kind,
          candidateIds: spin.candidateIds,
          startedAt: existing?.startedAt || Date.now() - 500,
          plannedRevealAt: existing?.plannedRevealAt || revealAt,
          winnerId: spin.winnerId,
          revealAt,
          completeAt,
        });
        return;
      }

      applyDecisionSpin(spin);
    });
  }, [currentRoom?.id, applyDecisionSpin]);

  useEffect(() => {
    if (!decisionSpin?.winnerId || !decisionSpin.completeAt) return;
    const timer = window.setTimeout(() => {
      applyDecisionSpin(null);
      if (pendingResolvedRoomRef.current) {
        const resolved = pendingResolvedRoomRef.current;
        pendingResolvedRoomRef.current = null;
        currentRoomRef.current = resolved;
        setCurrentRoom(resolved);
      } else {
        refreshRoom();
      }
    }, Math.max(0, decisionSpin.completeAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [decisionSpin, applyDecisionSpin, refreshRoom]);

  // Periodic 30-minute TTL check
  useEffect(() => {
    if (!currentRoom?.created_at) return;

    const checkExpiry = () => {
      if (isRoomExpired(currentRoom.created_at)) {
        clearRoomSession(currentRoom.code);
        setSessionNotice(t('session.expiredNotice'));
        leaveRoom(false);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 15000);
    return () => clearInterval(interval);
  }, [currentRoom?.created_at, currentRoom?.code, leaveRoom, t]);

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
        const choices = await getFoodChoices(res.room.id, res.participant.session_token);
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
    if (!currentRoom || !currentParticipant) return;
    const endPerf = perf.start('startVoting');
    try {
      const state = await startCategoryVoting(currentRoom.id, currentParticipant.session_token, currentRoom.version);
      applyAuthoritativeRoomState(state);
    } finally {
      endPerf();
    }
  };

  const submitFoodChoices = async (selectedCategories: string[]) => {
    if (!currentRoom || !currentParticipant) return;
    const endPerf = perf.start('submitFoodChoices');
    try {
      const state = await submitCategorySelection(
        currentRoom.id,
        currentParticipant.session_token,
        currentRoom.version,
        normalizeCategorySelection(selectedCategories)
      );
      applyAuthoritativeRoomState(state);
    } finally {
      endPerf();
    }
  };

  const resolveConsensus = async (winner: string, consensusType: ConsensusType) => {
    if (!currentRoom || !currentParticipant) return;
    const endPerf = perf.start('resolveConsensus');
    try {
      const state = await resolveCategoryTie(
        currentRoom.id,
        currentParticipant.session_token,
        currentRoom.version,
        consensusType === 'host_picked' ? 'host_pick' : 'choose_for_us',
        winner
      );
      applyAuthoritativeRoomState(state);
    } finally {
      endPerf();
    }
  };

  const startDecisionSpin = async (kind: DecisionSpin['kind']) => {
    if (!currentRoom || !currentParticipant?.is_host || decisionSpinRef.current) return;
    const candidateIds = kind === 'category'
      ? currentRoom.tied_categories || []
      : currentRoom.restaurant_summary?.tiedRestaurantIds || [];
    if (candidateIds.length < 2) return;
    const startedAt = Date.now() + 120;
    const plannedRevealAt = startedAt + 3200;
    const spin: DecisionSpin = {
      spinId: crypto.randomUUID(),
      kind,
      candidateIds,
      startedAt,
      plannedRevealAt,
    };
    applyDecisionSpin(spin);
    await broadcastDecisionSpin(currentRoom.id, spin);
    const endPerf = perf.start('resolveTieRPC');
    try {
      const state = kind === 'category'
        ? await resolveCategoryTie(currentRoom.id, currentParticipant.session_token, currentRoom.version, 'choose_for_us')
        : await resolveRestaurantTie(currentRoom.id, currentParticipant.session_token, currentRoom.version, 'choose_for_us');
      endPerf();
      const winnerId = kind === 'category' ? state.room.winning_category : state.room.winning_restaurant_id;
      if (!winnerId || !candidateIds.includes(winnerId)) throw new Error('Authoritative roulette winner is invalid');
      const revealAt = Math.max(spin.plannedRevealAt, Date.now() + 800);
      const result: DecisionSpin = { ...spin, winnerId, revealAt, completeAt: revealAt + 1200 };
      applyDecisionSpin(result);
      pendingResolvedRoomRef.current = state.room;
      await broadcastDecisionSpin(currentRoom.id, result);
    } catch (error) {
      endPerf();
      applyDecisionSpin(null);
      pendingResolvedRoomRef.current = null;
      await broadcastDecisionSpin(currentRoom.id, { ...spin, cancelled: true });
      await refreshRoom();
      throw error;
    }
  };

  const startCategoryRoulette = () => startDecisionSpin('category');
  const startRestaurantRoulette = () => startDecisionSpin('restaurant');

  const resetRoomVoting = async (targetStage: import('../types/database').RoomStage = 'voting') => {
    if (!currentRoom) return;
    setFoodChoices([]);
    try {
      if (!currentParticipant) return;
      await apiResetRoomVoting(currentRoom.id, currentParticipant.session_token, currentRoom.version, targetStage);
      await refreshRoom();
    } catch (err) {
      console.error('Error resetting room voting', err);
      reportError(err);
    }
  };

  const resetToLobby = async () => {
    if (!currentRoom) return;
    await resetRoomVoting('lobby');
  };

  const startSwiping = async () => {
    if (!currentRoom || !currentParticipant) return;
    const endPerf = perf.start('startSwiping');
    try {
      const state = await beginRestaurantVoting(currentRoom.id, currentParticipant.session_token, currentRoom.version);
      applyAuthoritativeRoomState(state);
    } finally {
      endPerf();
    }
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
        applyAuthoritativeRoomState,
        leaveRoom,
        destroyRoom,
        isHost,
        startVoting,
        submitFoodChoices,
        resolveConsensus,
        resetToLobby,
        resetRoomVoting,
        startSwiping,
        decisionSpin,
        startCategoryRoulette,
        startRestaurantRoulette,
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
