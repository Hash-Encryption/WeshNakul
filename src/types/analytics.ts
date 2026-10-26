/**
 * WeshNakul Analytics Event Schema — Version 1
 *
 * Defines versioned, strictly typed analytics events.
 * Stored canonical timestamps use UTC (ISO 8601 strings).
 * Reporting code derives Asia/Riyadh local times.
 */

export const ANALYTICS_SCHEMA_VERSION = 1 as const;

export type AnalyticsEventType =
  | 'app_session_start'
  | 'room_create_success'
  | 'room_create_failed'
  | 'room_join_success'
  | 'room_join_failed'
  | 'room_stage_changed'
  | 'deck_candidates_ready'
  | 'restaurant_card_impression'
  | 'restaurant_swipe'
  | 'decision_winner_matched'
  | 'revote_requested'
  | 'outbound_maps_click'
  | 'outbound_delivery_click'
  | 'minigame_started'
  | 'minigame_completed'
  | 'room_explicit_exit'
  | 'app_technical_failure';

export interface BaseAnalyticsEvent<TType extends AnalyticsEventType, TPayload extends Record<string, unknown>> {
  eventId: string; // UUID v4 for deduplication
  schemaVersion: typeof ANALYTICS_SCHEMA_VERSION;
  eventType: TType;
  eventTime: string; // Canonical UTC ISO string (e.g. 2026-10-15T02:00:00.000Z)
  anonymousId?: string; // First-party anonymous visitor UUID
  roomId?: string; // UUID of the room when known
  roomCode?: string; // 4-char uppercase code (e.g. A7K2)
  participantId?: string; // Room-scoped participant UUID (NOT session token)
  category?: string; // Food category (e.g. burger, shawarma)
  eatingMode?: string; // delivery, dine_in, any
  roomMode?: string; // food, breakfast, cafes
  district?: string; // Macro-district name (e.g. Al-Rawdah) - NEVER GPS coordinates
  appVersion?: string; // Build version (e.g. 2.0.0-phase1)
  payload: TPayload;
}

// 1. App and Session Events
export type AppSessionStartEvent = BaseAnalyticsEvent<
  'app_session_start',
  {
    locale?: string;
    hasActiveRoom?: boolean;
    landingPath?: string;
  }
>;

// 2. Room Lifecycle Events
export type RoomCreateSuccessEvent = BaseAnalyticsEvent<
  'room_create_success',
  {
    eatingMode: string;
    roomMode: string;
    city: string;
    hasDistrict: boolean;
    districtSlug?: string;
  }
>;

export type RoomCreateFailedEvent = BaseAnalyticsEvent<
  'room_create_failed',
  {
    eatingMode?: string;
    roomMode?: string;
    city?: string;
    errorCode?: string;
    reasonClean?: string;
  }
>;

export type RoomJoinSuccessEvent = BaseAnalyticsEvent<
  'room_join_success',
  {
    isRejoin: boolean;
    participantCount?: number;
  }
>;

export type RoomJoinFailedEvent = BaseAnalyticsEvent<
  'room_join_failed',
  {
    reason: 'room_not_found' | 'room_full' | 'room_expired' | 'invalid_input' | 'network_error';
    errorCode?: string;
  }
>;

export type RoomStageChangedEvent = BaseAnalyticsEvent<
  'room_stage_changed',
  {
    fromStage: string;
    toStage: string;
    version?: number;
  }
>;

// 3. Restaurant Interactions
export type DeckCandidatesReadyEvent = BaseAnalyticsEvent<
  'deck_candidates_ready',
  {
    deckId: string;
    generation: number;
    candidateCount: number;
    candidateIds: string[];
    category: string;
  }
>;

export type RestaurantCardImpressionEvent = BaseAnalyticsEvent<
  'restaurant_card_impression',
  {
    deckId?: string;
    restaurantId: string;
    branchId?: string;
    position: number;
    category?: string;
  }
>;

export type RestaurantSwipeEvent = BaseAnalyticsEvent<
  'restaurant_swipe',
  {
    deckId?: string;
    restaurantId: string;
    branchId?: string;
    vote: 'YES' | 'NO' | 'LATER';
    position?: number;
    durationMs?: number;
    category?: string;
  }
>;

export type DecisionWinnerMatchedEvent = BaseAnalyticsEvent<
  'decision_winner_matched',
  {
    restaurantId: string;
    branchId?: string;
    deckId?: string;
    resolutionMethod: string; // normal_consensus, host_pick, choose_for_us, shuffle_cards, etc.
    isUnanimous?: boolean;
    category?: string;
  }
>;

export type RevoteRequestedEvent = BaseAnalyticsEvent<
  'revote_requested',
  {
    isHost: boolean;
    targetStage?: string;
  }
>;

export type OutboundMapsClickEvent = BaseAnalyticsEvent<
  'outbound_maps_click',
  {
    restaurantId: string;
    branchId?: string;
    hasExactBranch: boolean;
  }
>;

export type OutboundDeliveryClickEvent = BaseAnalyticsEvent<
  'outbound_delivery_click',
  {
    restaurantId: string;
    platform: 'keeta' | 'hungerstation' | 'ninja' | 'whatsapp' | 'jahez';
  }
>;

// 4. Mini-Game Events
export type MiniGameStartedEvent = BaseAnalyticsEvent<
  'minigame_started',
  {
    gameType: 'captain_roulette' | 'shuffle_cards' | 'sudden_death' | 'emoji_clash' | string;
    participantCount?: number;
  }
>;

export type MiniGameCompletedEvent = BaseAnalyticsEvent<
  'minigame_completed',
  {
    gameType: 'captain_roulette' | 'shuffle_cards' | 'sudden_death' | 'emoji_clash' | string;
    outcomeRestaurantId?: string;
    isPresentationOnly?: boolean;
  }
>;

// 5. Explicit Exit vs Drop-off
export type RoomExplicitExitEvent = BaseAnalyticsEvent<
  'room_explicit_exit',
  {
    stage: string;
    isHost: boolean;
    exitTrigger: 'leave_button' | 'go_home_button' | 'room_full_dismiss';
  }
>;

// 6. Reliability and Technical Failure
export type AppTechnicalFailureEvent = BaseAnalyticsEvent<
  'app_technical_failure',
  {
    errorPhase: string;
    errorCode?: string;
    messageClean?: string;
  }
>;

export type AnalyticsEvent =
  | AppSessionStartEvent
  | RoomCreateSuccessEvent
  | RoomCreateFailedEvent
  | RoomJoinSuccessEvent
  | RoomJoinFailedEvent
  | RoomStageChangedEvent
  | DeckCandidatesReadyEvent
  | RestaurantCardImpressionEvent
  | RestaurantSwipeEvent
  | DecisionWinnerMatchedEvent
  | RevoteRequestedEvent
  | OutboundMapsClickEvent
  | OutboundDeliveryClickEvent
  | MiniGameStartedEvent
  | MiniGameCompletedEvent
  | RoomExplicitExitEvent
  | AppTechnicalFailureEvent;

export interface IngestAnalyticsResult {
  success: boolean;
  received: number;
  inserted: number;
}
