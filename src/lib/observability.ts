export type DeckErrorPhase =
  | 'restoration'
  | 'deck_generation'
  | 'deck_traversal'
  | 'card_render'
  | 'vote_submission'
  | 'consensus'
  | 'deck_recovery';

export interface StructuredDeckErrorEvent {
  event: 'deck_error' | 'deck_warning' | 'render_error' | 'restoration_fallback';
  eventPhase: DeckErrorPhase;
  roomId?: string;
  sessionTokenSafe?: string;
  category?: string;
  deckId?: string | null;
  deckLength?: number;
  currentIndex?: number;
  candidateId?: string | null;
  restaurantBrandId?: string | null;
  branchId?: string | null;
  participantCount?: number;
  restorationSource?: string;
  filterState?: Record<string, unknown>;
  errorMessage?: string;
  message?: string;
  stackTrace?: string;
  timestamp: string;
  appVersion: string;
  metadata?: Record<string, unknown>;
}

export interface LogDeckErrorOptions {
  eventPhase: DeckErrorPhase;
  roomId?: string;
  sessionToken?: string;
  category?: string;
  deckId?: string | null;
  deckLength?: number;
  currentIndex?: number;
  candidateId?: string | null;
  restaurantBrandId?: string | null;
  branchId?: string | null;
  participantCount?: number;
  restorationSource?: string;
  filterState?: Record<string, unknown>;
  error?: unknown;
  message?: string;
  metadata?: Record<string, unknown>;
  isWarning?: boolean;
}

// In-memory ring buffer of recent events for troubleshooting without leaking sensitive data
const EVENT_HISTORY_LIMIT = 50;
const recentEvents: StructuredDeckErrorEvent[] = [];

function maskToken(token?: string): string | undefined {
  if (!token) return undefined;
  if (token.length <= 8) return '***';
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

export function logDeckError(options: LogDeckErrorOptions): StructuredDeckErrorEvent {
  const err = options.error instanceof Error ? options.error : null;
  const rawMessage = options.message || err?.message || (typeof options.error === 'string' ? options.error : 'Unknown error');

  const payload: StructuredDeckErrorEvent = {
    event: options.isWarning ? 'deck_warning' : 'deck_error',
    eventPhase: options.eventPhase,
    roomId: options.roomId,
    sessionTokenSafe: maskToken(options.sessionToken),
    category: options.category,
    deckId: options.deckId,
    deckLength: options.deckLength,
    currentIndex: options.currentIndex,
    candidateId: options.candidateId,
    restaurantBrandId: options.restaurantBrandId,
    branchId: options.branchId,
    participantCount: options.participantCount,
    restorationSource: options.restorationSource,
    filterState: options.filterState,
    errorMessage: rawMessage,
    message: rawMessage,
    stackTrace: err?.stack,
    timestamp: new Date().toISOString(),
    appVersion: '2.0.0-phase3',
    metadata: options.metadata,
  };

  recentEvents.push(payload);
  if (recentEvents.length > EVENT_HISTORY_LIMIT) {
    recentEvents.shift();
  }

  const prefix = `[WeshNakul:${payload.eventPhase}]`;
  if (options.isWarning) {
    console.warn(prefix, payload.errorMessage, payload);
  } else {
    console.error(prefix, payload.errorMessage, payload);
  }

  // Hook into window.__WESHNAKUL_LAST_ERROR__ for automated testing and client diagnostics
  if (typeof window !== 'undefined') {
    (window as unknown as { __WESHNAKUL_LAST_DECK_ERROR__?: StructuredDeckErrorEvent }).__WESHNAKUL_LAST_DECK_ERROR__ = payload;
  }

  return payload;
}

export function getRecentDeckErrors(): readonly StructuredDeckErrorEvent[] {
  return recentEvents;
}

export function clearRecentDeckErrors(): void {
  recentEvents.length = 0;
}
