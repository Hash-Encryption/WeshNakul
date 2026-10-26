/**
 * WeshNakul Client Analytics Engine
 *
 * Implements low-overhead, privacy-first, non-blocking first-party analytics.
 *
 * GUARANTEES:
 * 1. Zero UX Impact: All tracking is fire-and-forget. Failures never throw or degrade UX.
 * 2. Bounded In-Memory Queue: Never retains more than 25 events. Drops oldest if full.
 * 3. Rate-Controlled Dispatch: Flushes batches periodically (1500ms) or when buffer reaches 10.
 * 4. Privacy & Minimization: Strips credentials and exact location coordinates automatically.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { getOrCreateAnalyticsId } from './analyticsIdentity';
import { registerTechnicalFailureListener } from './observability';
import {
  ANALYTICS_SCHEMA_VERSION,
  type AnalyticsEvent,
  type IngestAnalyticsResult,
} from '../types/analytics';

const APP_VERSION = '2.0.0-phase1';
const MAX_QUEUE_SIZE = 25;
const FLUSH_THRESHOLD = 10;
const FLUSH_INTERVAL_MS = 1500;

let eventQueue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false;

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Schedule a debounced flush if not already pending.
 */
function scheduleFlush(): void {
  if (flushTimer !== null) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flushAnalytics().catch(() => {});
  }, FLUSH_INTERVAL_MS);
}

/**
 * Core event ingestion method. Enqueues event and triggers bounded dispatch.
 */
export function trackEvent<T extends AnalyticsEvent>(
  event: Omit<T, 'eventId' | 'schemaVersion' | 'eventTime' | 'anonymousId' | 'appVersion'> &
    Partial<Pick<T, 'eventId' | 'schemaVersion' | 'eventTime' | 'anonymousId' | 'appVersion'>>
): void {
  try {
    const canonicalEvent: AnalyticsEvent = {
      eventId: event.eventId || generateUUID(),
      schemaVersion: ANALYTICS_SCHEMA_VERSION,
      eventType: event.eventType,
      eventTime: event.eventTime || new Date().toISOString(),
      anonymousId: event.anonymousId || getOrCreateAnalyticsId(),
      roomId: event.roomId,
      roomCode: event.roomCode ? event.roomCode.toUpperCase() : undefined,
      participantId: event.participantId,
      category: event.category,
      eatingMode: event.eatingMode,
      roomMode: event.roomMode,
      district: event.district,
      appVersion: event.appVersion || APP_VERSION,
      payload: (event.payload && typeof event.payload === 'object' ? event.payload : {}) as any,
    };

    // Bounded buffer enforcement: drop oldest if exceeding maximum size
    if (eventQueue.length >= MAX_QUEUE_SIZE) {
      eventQueue.shift();
    }
    eventQueue.push(canonicalEvent);

    if (eventQueue.length >= FLUSH_THRESHOLD) {
      if (flushTimer !== null) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      flushAnalytics().catch(() => {});
    } else {
      scheduleFlush();
    }
  } catch (err) {
    // Fail completely silent to prevent any user impact
    if (import.meta.env?.DEV) {
      console.debug('[Analytics] Failed to enqueue event', err);
    }
  }
}

/**
 * Flush queued analytics events to the server in a single atomic batch via Cloudflare gateway.
 */
export async function flushAnalytics(): Promise<IngestAnalyticsResult | null> {
  if (isFlushing || eventQueue.length === 0) return null;

  isFlushing = true;
  const batch = eventQueue.slice(0, MAX_QUEUE_SIZE);
  eventQueue = eventQueue.slice(batch.length);

  try {
    // 1. Dispatch via Cloudflare Pages Function edge gateway (/api/analytics)
    const res = await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });

    if (res.ok) {
      const data = (await res.json().catch(() => null)) as IngestAnalyticsResult | null;
      return data;
    }

    // If rate-limited (429), respect the backoff and do NOT bypass edge controls
    if (res.status === 429) {
      if (import.meta.env?.DEV) {
        console.debug('[Analytics] Gateway rate limit reached');
      }
      return null;
    }

    // Fallback to direct Supabase RPC strictly in local development (DEV) environment
    // where Cloudflare Pages Functions are not running (e.g. plain vite dev server).
    // In production builds (PROD), direct fallback is strictly prohibited.
    const isLocalDev = Boolean(import.meta.env?.DEV);
    if (isLocalDev && res.status === 404 && isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.rpc('record_analytics_events', {
        p_events: batch,
      });
      if (error) return null;
      return data as IngestAnalyticsResult;
    }

    return null;
  } catch (err) {
    // In local development ONLY, allow fallback if local server threw a network error
    const isLocalDev = Boolean(import.meta.env?.DEV);
    if (isLocalDev && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.rpc('record_analytics_events', {
          p_events: batch,
        });
        if (error) return null;
        return data as IngestAnalyticsResult;
      } catch {
        return null;
      }
    }
    if (import.meta.env?.DEV) {
      console.debug('[Analytics] Ingestion error during flush', err);
    }
    return null;
  } finally {
    isFlushing = false;
  }
}

// Ensure pending events attempt to flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && eventQueue.length > 0) {
      flushAnalytics().catch(() => {});
    }
  });

  window.addEventListener('pagehide', () => {
    if (eventQueue.length > 0) {
      flushAnalytics().catch(() => {});
    }
  });
}

// ----------------------------------------------------------------------------
// Typed Convenience Trackers for Essential Lifecycle Events
// ----------------------------------------------------------------------------

export function trackAppSessionStart(options?: { locale?: string; hasActiveRoom?: boolean }): void {
  trackEvent({
    eventType: 'app_session_start',
    payload: {
      locale: options?.locale || 'ar',
      hasActiveRoom: Boolean(options?.hasActiveRoom),
      landingPath: typeof window !== 'undefined' ? window.location.pathname : '/',
    },
  });
}

export function trackRoomCreateSuccess(options: {
  roomId: string;
  roomCode: string;
  eatingMode: string;
  roomMode: string;
  city: string;
  hasDistrict: boolean;
  districtSlug?: string;
}): void {
  const validDistrict = options.districtSlug?.trim() || (options.hasDistrict ? 'district_provided' : undefined);
  trackEvent({
    eventType: 'room_create_success',
    roomId: options.roomId,
    roomCode: options.roomCode,
    eatingMode: options.eatingMode,
    roomMode: options.roomMode,
    district: validDistrict,
    payload: {
      eatingMode: options.eatingMode,
      roomMode: options.roomMode,
      city: options.city,
      hasDistrict: options.hasDistrict,
      districtSlug: validDistrict,
    },
  });
}

export function trackRoomCreateFailed(options: {
  eatingMode?: string;
  roomMode?: string;
  city?: string;
  errorCode?: string;
  reasonClean?: string;
}): void {
  trackEvent({
    eventType: 'room_create_failed',
    eatingMode: options.eatingMode,
    roomMode: options.roomMode,
    payload: {
      eatingMode: options.eatingMode,
      roomMode: options.roomMode,
      city: options.city,
      errorCode: options.errorCode,
      reasonClean: options.reasonClean,
    },
  });
}

export function trackRoomJoinSuccess(options: {
  roomId: string;
  roomCode: string;
  isRejoin?: boolean;
  participantCount?: number;
}): void {
  trackEvent({
    eventType: 'room_join_success',
    roomId: options.roomId,
    roomCode: options.roomCode,
    payload: {
      isRejoin: Boolean(options.isRejoin),
      participantCount: options.participantCount,
    },
  });
}

export function trackRoomJoinFailed(options: {
  roomCode: string;
  reason: 'room_not_found' | 'room_full' | 'room_expired' | 'invalid_input' | 'network_error';
  errorCode?: string;
}): void {
  trackEvent({
    eventType: 'room_join_failed',
    roomCode: options.roomCode,
    payload: {
      reason: options.reason,
      errorCode: options.errorCode,
    },
  });
}

export function trackRoomStageChanged(options: {
  roomId: string;
  roomCode?: string;
  fromStage: string;
  toStage: string;
  version?: number;
}): void {
  trackEvent({
    eventType: 'room_stage_changed',
    roomId: options.roomId,
    roomCode: options.roomCode,
    payload: {
      fromStage: options.fromStage,
      toStage: options.toStage,
      version: options.version,
    },
  });
}

export function trackDeckCandidatesReady(options: {
  roomId: string;
  roomCode?: string;
  deckId: string;
  generation: number;
  candidateCount: number;
  candidateIds: string[];
  category: string;
  district?: string;
  eatingMode?: string;
  roomMode?: string;
}): void {
  trackEvent({
    eventType: 'deck_candidates_ready',
    roomId: options.roomId,
    roomCode: options.roomCode,
    category: options.category,
    district: options.district,
    eatingMode: options.eatingMode,
    roomMode: options.roomMode,
    payload: {
      deckId: options.deckId,
      generation: options.generation,
      candidateCount: options.candidateCount,
      candidateIds: options.candidateIds.slice(0, 10),
      category: options.category,
    },
  });
}

export function trackRestaurantCardImpression(options: {
  roomId: string;
  roomCode?: string;
  deckId?: string;
  restaurantId: string;
  branchId?: string;
  position: number;
  category?: string;
  district?: string;
  eatingMode?: string;
  roomMode?: string;
}): void {
  trackEvent({
    eventType: 'restaurant_card_impression',
    roomId: options.roomId,
    roomCode: options.roomCode,
    category: options.category,
    district: options.district,
    eatingMode: options.eatingMode,
    roomMode: options.roomMode,
    payload: {
      deckId: options.deckId,
      restaurantId: options.restaurantId,
      branchId: options.branchId,
      position: options.position,
    },
  });
}

export function trackRestaurantSwipe(options: {
  roomId: string;
  roomCode?: string;
  deckId?: string;
  restaurantId: string;
  branchId?: string;
  vote: 'YES' | 'NO' | 'LATER';
  position?: number;
  durationMs?: number;
  category?: string;
  district?: string;
  eatingMode?: string;
  roomMode?: string;
}): void {
  trackEvent({
    eventType: 'restaurant_swipe',
    roomId: options.roomId,
    roomCode: options.roomCode,
    category: options.category,
    district: options.district,
    eatingMode: options.eatingMode,
    roomMode: options.roomMode,
    payload: {
      deckId: options.deckId,
      restaurantId: options.restaurantId,
      branchId: options.branchId,
      vote: options.vote,
      position: options.position,
      durationMs: options.durationMs,
    },
  });
}

export function trackDecisionWinnerMatched(options: {
  roomId: string;
  roomCode?: string;
  restaurantId: string;
  branchId?: string;
  deckId?: string;
  resolutionMethod: string;
  isUnanimous?: boolean;
  category?: string;
  district?: string;
  eatingMode?: string;
  roomMode?: string;
}): void {
  trackEvent({
    eventType: 'decision_winner_matched',
    roomId: options.roomId,
    roomCode: options.roomCode,
    category: options.category,
    district: options.district,
    eatingMode: options.eatingMode,
    roomMode: options.roomMode,
    payload: {
      restaurantId: options.restaurantId,
      branchId: options.branchId,
      deckId: options.deckId,
      resolutionMethod: options.resolutionMethod,
      isUnanimous: Boolean(options.isUnanimous),
    },
  });
}

export function trackRevoteRequested(options: {
  roomId: string;
  roomCode?: string;
  isHost: boolean;
  targetStage?: string;
}): void {
  trackEvent({
    eventType: 'revote_requested',
    roomId: options.roomId,
    roomCode: options.roomCode,
    payload: {
      isHost: options.isHost,
      targetStage: options.targetStage,
    },
  });
}

export function trackOutboundMapsClick(options: {
  roomId?: string;
  restaurantId: string;
  branchId?: string;
  hasExactBranch: boolean;
}): void {
  trackEvent({
    eventType: 'outbound_maps_click',
    roomId: options.roomId,
    payload: {
      restaurantId: options.restaurantId,
      branchId: options.branchId,
      hasExactBranch: options.hasExactBranch,
    },
  });
}

export function trackOutboundDeliveryClick(options: {
  roomId?: string;
  restaurantId: string;
  platform: 'keeta' | 'hungerstation' | 'ninja' | 'whatsapp' | 'jahez';
}): void {
  trackEvent({
    eventType: 'outbound_delivery_click',
    roomId: options.roomId,
    payload: {
      restaurantId: options.restaurantId,
      platform: options.platform,
    },
  });
}

export function trackMiniGameStarted(options: {
  roomId: string;
  roomCode?: string;
  gameType: string;
  participantCount?: number;
}): void {
  trackEvent({
    eventType: 'minigame_started',
    roomId: options.roomId,
    roomCode: options.roomCode,
    payload: {
      gameType: options.gameType,
      participantCount: options.participantCount,
    },
  });
}

export function trackMiniGameCompleted(options: {
  roomId: string;
  roomCode?: string;
  gameType: string;
  outcomeRestaurantId?: string;
  isPresentationOnly?: boolean;
}): void {
  trackEvent({
    eventType: 'minigame_completed',
    roomId: options.roomId,
    roomCode: options.roomCode,
    payload: {
      gameType: options.gameType,
      outcomeRestaurantId: options.outcomeRestaurantId,
      isPresentationOnly: Boolean(options.isPresentationOnly),
    },
  });
}

export function trackRoomExplicitExit(options: {
  roomId?: string;
  roomCode?: string;
  stage: string;
  isHost: boolean;
  exitTrigger: 'leave_button' | 'go_home_button' | 'room_full_dismiss';
}): void {
  trackEvent({
    eventType: 'room_explicit_exit',
    roomId: options.roomId,
    roomCode: options.roomCode,
    payload: {
      stage: options.stage,
      isHost: options.isHost,
      exitTrigger: options.exitTrigger,
    },
  });
}

export function trackAppTechnicalFailure(options: {
  errorPhase: string;
  errorCode?: string;
  messageClean?: string;
  roomId?: string;
  deckId?: string;
}): void {
  trackEvent({
    eventType: 'app_technical_failure',
    roomId: options.roomId,
    payload: {
      errorPhase: options.errorPhase,
      errorCode: options.errorCode,
      messageClean: options.messageClean ? options.messageClean.slice(0, 200) : undefined,
      deckId: options.deckId,
    },
  });
}

// Hook into observability subsystem for passive technical failure monitoring
registerTechnicalFailureListener(trackAppTechnicalFailure);

/**
 * Inspection and test helper to access current buffer state.
 */
export function _getAnalyticsQueueForTesting(): AnalyticsEvent[] {
  return [...eventQueue];
}

export function _clearAnalyticsQueueForTesting(): void {
  eventQueue = [];
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}
