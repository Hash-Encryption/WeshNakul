import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { Room, Participant, CreateRoomInput, FoodChoice, ConsensusType, RoomMode, RoomSuggestion } from '../types/database';
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
  switchRoomMode,
  setRoomPreference,
  toggleRoomSuggestion,
  broadcastSuggestions,
  subscribeToSuggestions,
  getRoomDecisionState,
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
  completeDecisionSpin: () => void;
  retryDecisionSpin: () => void;
  modeTransition: { active: boolean; fromMode: RoomMode; toMode: RoomMode } | null;
  clearModeTransition: () => void;
  suggestions: RoomSuggestion[];
  switchMode: (mode: RoomMode) => Promise<void>;
  setPreference: (key: string, enabled: boolean) => Promise<void>;
  toggleSuggestion: (target: string) => Promise<void>;
}

export const RoomContext = createContext<RoomContextType | null>(null);

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

  const [modeTransition, setModeTransition] = useState<{ active: boolean; fromMode: RoomMode; toMode: RoomMode } | null>(null);
  const modeTransitionTimerRef = useRef<number | null>(null);
  const prevRoomModeRef = useRef<RoomMode | null>(null);

  const clearModeTransition = useCallback(() => {
    if (modeTransitionTimerRef.current) {
      window.clearTimeout(modeTransitionTimerRef.current);
      modeTransitionTimerRef.current = null;
    }
    setModeTransition(null);
  }, []);

  const triggerModeTransition = useCallback((fromMode: RoomMode, toMode: RoomMode) => {
    if (fromMode === toMode) return;
    if (modeTransitionTimerRef.current) {
      window.clearTimeout(modeTransitionTimerRef.current);
    }
    setModeTransition({ active: true, fromMode, toMode });
    modeTransitionTimerRef.current = window.setTimeout(() => {
      setModeTransition(null);
      modeTransitionTimerRef.current = null;
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (modeTransitionTimerRef.current) {
        window.clearTimeout(modeTransitionTimerRef.current);
      }
    };
  }, []);

  const [suggestions, setSuggestions] = useState<RoomSuggestion[]>([]);

  const currentRoomRef = useRef<Room | null>(null);
  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  const currentParticipantRef = useRef<Participant | null>(null);
  useEffect(() => {
    currentParticipantRef.current = currentParticipant;
  }, [currentParticipant]);

  const pendingResolvedRoomRef = useRef<Room | null>(null);

  const reconcileDecisionSpinFromRoom = useCallback((roomOrState: Room | import('../types/database').RoomDecisionState | null | undefined): boolean => {
    if (!roomOrState) return false;
    const room: Room | undefined = 'room' in roomOrState ? (roomOrState as import('../types/database').RoomDecisionState).room : (roomOrState as Room);
    if (!room) return false;

    const spin = decisionSpinRef.current;
    if (!spin || spin.cancelled) return false;

    let winnerId: string | null = null;
    if (spin.kind === 'category') {
      if (room.winning_category) {
        winnerId = room.winning_category;
      }
    } else if (spin.kind === 'restaurant') {
      if (room.winning_restaurant_id) {
        winnerId = room.winning_restaurant_id;
      }
    }

    if (!winnerId) return false;

    // Validate that winnerId is one of the candidate IDs in the spin
    if (!spin.candidateIds.includes(winnerId)) {
      console.warn('[reconcileDecisionSpinFromRoom] Winner not in candidates', { winnerId, candidates: spin.candidateIds });
      return false;
    }

    // Never overwrite a different already-known authoritative winner
    if (spin.winnerId && spin.winnerId !== winnerId) {
      console.warn('[reconcileDecisionSpinFromRoom] Conflicting winner ignored, existing authoritative winner preserved', {
        existing: spin.winnerId,
        incoming: winnerId,
      });
      return false;
    }

    // Store pending resolved room so when animation finishes, room state seamlessly transitions
    pendingResolvedRoomRef.current = room;

    // If winner is not yet set or error was set, update spin with winnerId and clear any transient error
    if (!spin.winnerId || spin.error) {
      applyDecisionSpin({
        ...spin,
        winnerId,
        error: undefined,
      });
    }

    return true;
  }, [applyDecisionSpin]);

  const applyAuthoritativeRoomState = useCallback((state: import('../types/database').RoomDecisionState) => {
    if (!state?.room) return;
    const room = state.room;
    if (room.version < (currentRoomRef.current?.version ?? -1)) return;

    if (state.suggestions) {
      setSuggestions(state.suggestions);
    }

    if (room.room_mode && prevRoomModeRef.current && room.room_mode !== prevRoomModeRef.current) {
      triggerModeTransition(prevRoomModeRef.current, room.room_mode);
      prevRoomModeRef.current = room.room_mode;
    } else if (room.room_mode && !prevRoomModeRef.current) {
      prevRoomModeRef.current = room.room_mode;
    }

    // Check if a decision spin is active and reconcile winner
    if (reconcileDecisionSpinFromRoom(state)) {
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
  }, [reconcileDecisionSpinFromRoom, triggerModeTransition]);

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
    setSuggestions([]);
    clearModeTransition();
    prevRoomModeRef.current = null;
    setActiveRoomCode(null);
    if (window.location.pathname.startsWith('/r/')) {
      window.history.pushState({}, '', '/');
    }
  }, [clearModeTransition]);

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
          if (room.room_mode && prevRoomModeRef.current && room.room_mode !== prevRoomModeRef.current) {
            triggerModeTransition(prevRoomModeRef.current, room.room_mode);
            prevRoomModeRef.current = room.room_mode;
          } else if (room.room_mode && !prevRoomModeRef.current) {
            prevRoomModeRef.current = room.room_mode;
          }

          if (reconcileDecisionSpinFromRoom(room)) {
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
            try {
              const state = await getRoomDecisionState(room.id, me.session_token);
              if (state.suggestions) {
                setSuggestions(state.suggestions);
              }
              if (options?.fetchChoices !== false && room.stage === 'voting') {
                setFoodChoices(state.myCategorySelection ? [state.myCategorySelection] : []);
              }
            } catch (e) {
              console.warn('Error fetching room decision state on refresh', e);
            }
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
  }, [leaveRoom, t, reportError, triggerModeTransition, reconcileDecisionSpinFromRoom]);

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
      prevRoomModeRef.current = room.room_mode || 'food';
      setParticipants(parts);
      setActiveRoomCode(room.code);

      const roomToken = getOrCreateSessionToken(room.code);
      const legacyToken = getOrCreateSessionToken();
      const me = parts.find((p) => p.session_token === roomToken || p.session_token === legacyToken);
      if (me) {
        currentParticipantRef.current = me;
        setCurrentParticipant(me);
        try {
          const state = await getRoomDecisionState(room.id, me.session_token);
          if (state.suggestions) {
            setSuggestions(state.suggestions);
          }
          if (room.stage === 'voting' && state.myCategorySelection) {
            setFoodChoices([state.myCategorySelection]);
          } else {
            setFoodChoices([]);
          }
        } catch (e) {
          console.warn('Error fetching room decision state on load', e);
          setFoodChoices([]);
        }
      } else {
        currentParticipantRef.current = null;
        setCurrentParticipant(null);
        setFoodChoices([]);
      }

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
        // Inspect payload.new directly for resolved winner state BEFORE version gating!
        // This prevents stale-event optimization from suppressing authoritative winner delivery.
        if (payload?.new && decisionSpinRef.current && !decisionSpinRef.current.winnerId) {
          reconcileDecisionSpinFromRoom(payload.new);
        }

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
  }, [currentRoom?.id, refreshRoom, leaveRoom, t, reconcileDecisionSpinFromRoom]);

  useEffect(() => {
    if (!currentRoom?.id) return;
    return subscribeToSuggestions(currentRoom.id, (incomingSuggestions) => {
      setSuggestions(incomingSuggestions);
    });
  }, [currentRoom?.id]);

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
        // WINNER HINT: Only apply if we don't already have an authoritative winner from room state
        const current = decisionSpinRef.current;
        if (current && current.winnerId && current.winnerId !== spin.winnerId) {
          console.warn('[subscribeToDecisionSpin] Conflicting winner hint ignored, room state wins', {
            existing: current.winnerId,
            hint: spin.winnerId,
          });
          return;
        }
        applyDecisionSpin({
          spinId: spin.spinId,
          kind: spin.kind,
          candidateIds: spin.candidateIds,
          winnerId: spin.winnerId,
        });
        return;
      }

      // SPIN START:
      const current = decisionSpinRef.current;
      if (current && !current.cancelled && current.spinId === spin.spinId) {
        return;
      }

      applyDecisionSpin({
        spinId: spin.spinId,
        kind: spin.kind,
        candidateIds: spin.candidateIds,
      });
    });
  }, [currentRoom?.id, applyDecisionSpin]);

  const completeDecisionSpin = useCallback(() => {
    applyDecisionSpin(null);
    if (pendingResolvedRoomRef.current) {
      const resolved = pendingResolvedRoomRef.current;
      pendingResolvedRoomRef.current = null;
      currentRoomRef.current = resolved;
      setCurrentRoom(resolved);
    } else {
      refreshRoom();
    }
  }, [applyDecisionSpin, refreshRoom]);

  // Guest authoritative watchdog: fetch room state at ~4.5s and ~10s if unresolved, never enter error
  useEffect(() => {
    if (!decisionSpin || decisionSpin.winnerId || decisionSpin.error || currentParticipant?.is_host || !currentRoom?.id) return;

    const guestToken = currentParticipant?.session_token;
    const roomId = currentRoom.id;

    const timer45 = window.setTimeout(async () => {
      if (!decisionSpinRef.current || decisionSpinRef.current.winnerId) return;
      try {
        if (guestToken) {
          const state = await getRoomDecisionState(roomId, guestToken);
          if (reconcileDecisionSpinFromRoom(state)) return;
        }
      } catch (err) {
        console.warn('Guest 4.5s watchdog check error', err);
      }
      void refreshRoom({ fetchParticipants: false });
    }, 4500);

    const timer10 = window.setTimeout(async () => {
      if (!decisionSpinRef.current || decisionSpinRef.current.winnerId) return;
      try {
        if (guestToken) {
          const state = await getRoomDecisionState(roomId, guestToken);
          if (reconcileDecisionSpinFromRoom(state)) return;
        }
      } catch (err) {
        console.warn('Guest 10s watchdog check error', err);
      }
      void refreshRoom({ fetchParticipants: false });
    }, 10000);

    return () => {
      window.clearTimeout(timer45);
      window.clearTimeout(timer10);
    };
  }, [decisionSpin, currentParticipant?.is_host, currentParticipant?.session_token, currentRoom?.id, reconcileDecisionSpinFromRoom, refreshRoom]);

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
      let finalRoom = room;

      if (input.room_mode === 'healthy') {
        try {
          const state = await setRoomPreference(room.id, participant.session_token, room.version, 'healthy', true);
          if (state?.room) {
            finalRoom = state.room;
          }
        } catch (prefErr) {
          console.warn('[RoomContext createNewRoom] Non-blocking healthy preference switch warning:', prefErr);
        }
      } else if (input.room_mode && input.room_mode !== 'food') {
        try {
          const state = await switchRoomMode(room.id, participant.session_token, room.version, input.room_mode);
          if (state?.room) {
            finalRoom = state.room;
          }
          if (state?.suggestions) {
            setSuggestions(state.suggestions);
          }
        } catch (switchErr) {
          console.warn('[RoomContext createNewRoom] Non-blocking starting mode switch warning:', switchErr);
        }
      }

      currentRoomRef.current = finalRoom;
      currentParticipantRef.current = participant;
      setCurrentRoom(finalRoom);
      setCurrentParticipant(participant);
      setParticipants([participant]);
      setFoodChoices([]);
      setActiveRoomCode(finalRoom.code);
      return { room: finalRoom, participant };
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
        normalizeCategorySelection(selectedCategories, currentRoom.room_mode || 'food')
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

  const switchMode = async (newMode: RoomMode) => {
    if (!currentRoom || !currentParticipant?.is_host) return;
    const oldMode = currentRoom.room_mode || 'food';
    if (oldMode === newMode) return;

    const endPerf = perf.start('switchMode');
    try {
      triggerModeTransition(oldMode, newMode);
      prevRoomModeRef.current = newMode;
      const state = await switchRoomMode(
        currentRoom.id,
        currentParticipant.session_token,
        currentRoom.version,
        newMode
      );
      setFoodChoices([]);
      setSuggestions(state.suggestions || []);
      applyAuthoritativeRoomState(state);
      void broadcastSuggestions(currentRoom.id, state.suggestions || []);
    } catch (err) {
      console.error('Error switching room mode', err);
      reportError(err);
      await refreshRoom();
      throw err;
    } finally {
      endPerf();
    }
  };

  const setPreference = async (preference: string, enabled: boolean) => {
    if (!currentRoom || !currentParticipant?.is_host) return;
    const endPerf = perf.start('setPreference');
    try {
      const state = await setRoomPreference(
        currentRoom.id,
        currentParticipant.session_token,
        currentRoom.version,
        preference,
        enabled
      );
      setSuggestions(state.suggestions || []);
      applyAuthoritativeRoomState(state);
      void broadcastSuggestions(currentRoom.id, state.suggestions || []);
    } catch (err) {
      console.error('Error setting room preference', err);
      reportError(err);
      await refreshRoom();
      throw err;
    } finally {
      endPerf();
    }
  };

  const toggleSuggestion = async (target: string) => {
    if (!currentRoom || !currentParticipant || currentParticipant.is_host) return;
    const endPerf = perf.start('toggleSuggestion');
    try {
      const state = await toggleRoomSuggestion(
        currentRoom.id,
        currentParticipant.session_token,
        target
      );
      setSuggestions(state.suggestions || []);
      void broadcastSuggestions(currentRoom.id, state.suggestions || []);
    } catch (err) {
      console.error('Error toggling room suggestion', err);
      reportError(err);
      throw err;
    } finally {
      endPerf();
    }
  };

  const startDecisionSpin = useCallback(async (kind: DecisionSpin['kind']) => {
    if (!currentRoom || !currentParticipant?.is_host) return;
    if (decisionSpinRef.current && !decisionSpinRef.current.error) return;

    const candidateIds = kind === 'category'
      ? currentRoom.tied_categories || []
      : currentRoom.restaurant_summary?.tiedRestaurantIds || [];
    if (candidateIds.length < 2) return;

    const spin: DecisionSpin = {
      spinId: crypto.randomUUID(),
      kind,
      candidateIds,
    };
    applyDecisionSpin(spin);
    await broadcastDecisionSpin(currentRoom.id, spin);

    let rpcCompleted = false;

    // Watchdog at ~4.5s: perform ONE authoritative state fetch
    const watchdogTimer = window.setTimeout(async () => {
      if (rpcCompleted || decisionSpinRef.current?.winnerId) return;
      try {
        const state = await getRoomDecisionState(currentRoom.id, currentParticipant.session_token);
        if (reconcileDecisionSpinFromRoom(state)) {
          const resolvedWinnerId = kind === 'category' ? state.room.winning_category : state.room.winning_restaurant_id;
          if (resolvedWinnerId) {
            await broadcastDecisionSpin(currentRoom.id, { ...spin, winnerId: resolvedWinnerId });
          }
        }
        // If state is unresolved and RPC is still pending, continue spinning without error!
      } catch (err) {
        console.warn('Roulette watchdog recovery check error', err);
      }
    }, 4500);

    // Hard ceiling at 20s: check authoritative state before setting host error
    const hardCeilingTimer = window.setTimeout(async () => {
      if (rpcCompleted || decisionSpinRef.current?.winnerId) return;
      try {
        const state = await getRoomDecisionState(currentRoom.id, currentParticipant.session_token);
        if (reconcileDecisionSpinFromRoom(state)) {
          const resolvedWinnerId = kind === 'category' ? state.room.winning_category : state.room.winning_restaurant_id;
          if (resolvedWinnerId) {
            await broadcastDecisionSpin(currentRoom.id, { ...spin, winnerId: resolvedWinnerId });
          }
          return;
        }
      } catch (err) {
        console.warn('Roulette ceiling recovery check error', err);
      }
      if (decisionSpinRef.current && !decisionSpinRef.current.winnerId) {
        applyDecisionSpin({ ...decisionSpinRef.current, error: 'WSH_TIMEOUT' });
      }
    }, 20000);

    const endPerf = perf.start('resolveTieRPC');
    try {
      const state = kind === 'category'
        ? await resolveCategoryTie(currentRoom.id, currentParticipant.session_token, currentRoom.version, 'choose_for_us')
        : await resolveRestaurantTie(currentRoom.id, currentParticipant.session_token, currentRoom.version, 'choose_for_us');
      endPerf();
      rpcCompleted = true;
      window.clearTimeout(watchdogTimer);
      window.clearTimeout(hardCeilingTimer);

      const winnerId = kind === 'category' ? state.room.winning_category : state.room.winning_restaurant_id;
      if (!winnerId || !candidateIds.includes(winnerId)) throw new Error('Authoritative roulette winner is invalid');

      reconcileDecisionSpinFromRoom(state);
      await broadcastDecisionSpin(currentRoom.id, { ...spin, winnerId });
    } catch (error) {
      endPerf();
      window.clearTimeout(watchdogTimer);
      window.clearTimeout(hardCeilingTimer);

      // Check if state is actually resolved before declaring failure
      try {
        const state = await getRoomDecisionState(currentRoom.id, currentParticipant.session_token);
        if (reconcileDecisionSpinFromRoom(state)) {
          const winnerId = kind === 'category' ? state.room.winning_category : state.room.winning_restaurant_id;
          if (winnerId) {
            await broadcastDecisionSpin(currentRoom.id, { ...spin, winnerId });
          }
          return;
        }
      } catch {
        // ignore fallback fetch error
      }

      console.error('Error resolving tie RPC', error);
      // ONLY HOST gets error state
      applyDecisionSpin({ ...spin, error: 'RPC_FAILED' });
      pendingResolvedRoomRef.current = null;
      // Do not broadcast cancelled: true to guests, so guests remain in waiting state while host sees retry
    }
  }, [currentRoom, currentParticipant, applyDecisionSpin, reconcileDecisionSpinFromRoom]);

  const retryDecisionSpin = useCallback(async () => {
    const participant = currentParticipantRef.current;
    const room = currentRoomRef.current;
    if (!participant?.is_host || !room) return;
    const spin = decisionSpinRef.current;
    if (!spin) return;

    // Verify room is still authoritative tiebreaker state
    if (spin.kind === 'category') {
      if (room.stage !== 'tiebreaker' || !room.tied_categories || room.tied_categories.length < 2) {
        console.warn('[retryDecisionSpin] Room is no longer in category tiebreaker state', room.stage);
        return;
      }
    } else if (spin.kind === 'restaurant') {
      const tiedCount = room.restaurant_summary?.tiedRestaurantIds?.length || 0;
      if (tiedCount < 2) {
        console.warn('[retryDecisionSpin] Room is no longer in restaurant tie state');
        return;
      }
    }

    const kind = spin.kind;
    applyDecisionSpin(null);
    await startDecisionSpin(kind);
  }, [applyDecisionSpin, startDecisionSpin]);

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
        completeDecisionSpin,
        retryDecisionSpin,
        modeTransition,
        clearModeTransition,
        suggestions,
        switchMode,
        setPreference,
        toggleSuggestion,
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
