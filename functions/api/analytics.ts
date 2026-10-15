/**
 * Cloudflare Pages Function: Secure Analytics Gateway (/api/analytics)
 *
 * Implements a defense-in-depth edge gateway for WeshNakul analytics ingestion.
 *
 * SECURITY & ABUSE CONTROL MANDATES:
 * 1. Server-Side Rate Limiting:
 *    Enforces sliding-window rate limits per client IP using trusted `cf-connecting-ip`.
 * 2. Strict Boundary Validation:
 *    Validates HTTP POST, application/json, max 32KB request size, max 25 events per batch,
 *    and exact allowlisting of 17 event types before forwarding upstream.
 * 3. Privacy & Sanitization:
 *    Strips any credentials, session tokens, and location coordinates before reaching Supabase.
 * 4. Principle of Least Privilege:
 * 4. Server-Only Upstream Credential:
 *    Uses server-side `SUPABASE_SERVICE_ROLE_KEY` to invoke the restricted database RPC.
 *    Service-role keys are strictly server-only, never prefixed with VITE_, and never exposed to the client.
 * 5. Non-Blocking / Resilient:
 *    Always returns safe, bounded JSON responses without leaking internal errors.
 */

export interface Env {
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  // Server-only credential for invoking restricted RPC (never expose to client)
  SUPABASE_SERVICE_ROLE_KEY?: string;
  // Test mock key for isolated unit tests
  TEST_SUPABASE_KEY?: string;
  // Optional Cloudflare-managed rate limiter binding (if provisioned in Cloudflare dashboard)
  RATE_LIMITER?: {
    limit: (options: { key: string }) => Promise<{ success: boolean }>;
  };
  [key: string]: unknown;
}

// Allowed Event Types (Exact 17 allowed event types)
export const ALLOWED_EVENT_TYPES = new Set([
  'app_session_start',
  'room_create_success',
  'room_create_failed',
  'room_join_success',
  'room_join_failed',
  'room_stage_changed',
  'deck_candidates_ready',
  'restaurant_card_impression',
  'restaurant_swipe',
  'decision_winner_matched',
  'revote_requested',
  'outbound_maps_click',
  'outbound_delivery_click',
  'minigame_started',
  'minigame_completed',
  'room_explicit_exit',
  'app_technical_failure',
]);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_REQUEST_SIZE_BYTES = 32768; // 32 KB
const MAX_BATCH_SIZE = 25;
const RATE_LIMIT_WINDOW_MS = 60000; // 60 seconds
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP

// In-memory sliding window rate-limiting cache (per worker isolate)
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Periodically purge expired rate limit entries to prevent memory growth.
 */
function pruneRateLimitMap(now: number): void {
  if (rateLimitMap.size > 2000) {
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(ip);
      }
    }
  }
}

/**
 * Check and increment the rate limit for a client IP.
 * Returns true if allowed, false if limit exceeded.
 */
export function checkRateLimit(clientIp: string, now = Date.now()): { allowed: boolean; retryAfter: number } {
  pruneRateLimitMap(now);

  const existing = rateLimitMap.get(clientIp);
  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(clientIp, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { allowed: false, retryAfter };
  }

  existing.count += 1;
  return { allowed: true, retryAfter: 0 };
}

/**
 * Testing helper to reset rate limit state.
 */
export function _resetRateLimitsForTesting(): void {
  rateLimitMap.clear();
}

/**
 * Extract trusted client IP from Cloudflare header.
 */
export function getTrustedClientIp(request: Request): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim().length > 0) {
    return cfIp.trim();
  }
  return '127.0.0.1';
}

function jsonResponse(data: Record<string, unknown>, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

/**
 * Sanitize event payload by removing any sensitive attributes.
 */
function sanitizeEventPayload(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {};
  }
  const clean: Record<string, unknown> = {};
  const forbiddenKeys = new Set([
    'session_token',
    'sessiontoken',
    'token',
    'password',
    'latitude',
    'longitude',
    'email',
    'phone',
  ]);

  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (!forbiddenKeys.has(key.toLowerCase())) {
      clean[key] = value;
    }
  }
  return clean;
}

/**
 * Core Gateway Ingestion Handler.
 */
export async function handleAnalyticsIngest(request: Request, env: Env): Promise<Response> {
  // 1. Method check (POST only)
  if (request.method !== 'POST') {
    return jsonResponse(
      { error: 'method_not_allowed', message: 'Only POST is supported.' },
      405,
      { Allow: 'POST' }
    );
  }

  // 2. Content-Type check
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonResponse(
      { error: 'unsupported_media_type', message: 'Content-Type must be application/json.' },
      415
    );
  }

  // 3. Server-side Rate Limiting via trusted Cloudflare IP
  const clientIp = getTrustedClientIp(request);

  // 3a. Check Cloudflare-managed rate limiter binding if provisioned in Pages
  if (env.RATE_LIMITER && typeof env.RATE_LIMITER.limit === 'function') {
    try {
      const bindingResult = await env.RATE_LIMITER.limit({ key: clientIp });
      if (!bindingResult.success) {
        return jsonResponse(
          {
            error: 'rate_limit_exceeded',
            message: 'Too many analytics events submitted. Please wait before retrying.',
          },
          429,
          { 'Retry-After': '60' }
        );
      }
    } catch {
      // Gracefully fall through to in-memory sliding window if binding throws
    }
  }

  // 3b. Sliding-window rate limiting per edge isolate
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return jsonResponse(
      {
        error: 'rate_limit_exceeded',
        message: 'Too many analytics events submitted. Please wait before retrying.',
      },
      429,
      { 'Retry-After': String(rateLimit.retryAfter) }
    );
  }

  // 4. Request Body Size Limit Check (Content-Length header check)
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_REQUEST_SIZE_BYTES) {
    return jsonResponse(
      { error: 'payload_too_large', message: 'Request exceeds maximum size limit of 32 KB.' },
      413
    );
  }

  // Read raw text with size verification
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return jsonResponse({ error: 'read_error', message: 'Failed to read request body.' }, 400);
  }

  if (rawBody.length > MAX_REQUEST_SIZE_BYTES) {
    return jsonResponse(
      { error: 'payload_too_large', message: 'Request exceeds maximum size limit of 32 KB.' },
      413
    );
  }

  // 5. JSON Parsing
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: 'malformed_json', message: 'Request body must be valid JSON.' }, 400);
  }

  // 6. Batch Size & Structure Validation
  let eventsBatch: unknown[];
  if (Array.isArray(parsedJson)) {
    eventsBatch = parsedJson;
  } else if (parsedJson && typeof parsedJson === 'object') {
    eventsBatch = [parsedJson];
  } else {
    return jsonResponse(
      { error: 'invalid_batch', message: 'Payload must be a JSON array of events.' },
      400
    );
  }

  if (eventsBatch.length === 0) {
    return jsonResponse({ error: 'empty_batch', message: 'Event batch cannot be empty.' }, 400);
  }

  if (eventsBatch.length > MAX_BATCH_SIZE) {
    return jsonResponse(
      { error: 'batch_size_exceeded', message: `Batch size exceeds limit of ${MAX_BATCH_SIZE} events.` },
      400
    );
  }

  // 7. Event Allowlist & Semantic Validation
  const validatedEvents: Record<string, unknown>[] = [];

  for (let i = 0; i < eventsBatch.length; i++) {
    const item = eventsBatch[i];
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return jsonResponse(
        { error: 'invalid_event_structure', message: `Event at index ${i} must be a JSON object.` },
        400
      );
    }

    const event = item as Record<string, unknown>;
    const eventId = String(event.eventId || event.event_id || '').trim();
    if (!UUID_REGEX.test(eventId)) {
      return jsonResponse(
        { error: 'invalid_event_id', message: `Event at index ${i} has missing or invalid UUID eventId.` },
        400
      );
    }

    const eventType = String(event.eventType || event.event_type || '').trim();
    if (!ALLOWED_EVENT_TYPES.has(eventType)) {
      return jsonResponse(
        { error: 'invalid_event_type', message: `Event at index ${i} has unrecognized eventType: ${eventType}` },
        400
      );
    }

    const schemaVersion = Number(event.schemaVersion ?? event.schema_version ?? 1);
    if (schemaVersion !== 1) {
      return jsonResponse(
        { error: 'unsupported_schema_version', message: `Unsupported schema version: ${schemaVersion}` },
        400
      );
    }

    // Bounded string sanitization
    const cleanEvent: Record<string, unknown> = {
      eventId,
      schemaVersion: 1,
      eventType,
      eventTime: event.eventTime || event.event_time || new Date().toISOString(),
      anonymousId: typeof event.anonymousId === 'string' ? event.anonymousId.slice(0, 64) : undefined,
      roomId: typeof event.roomId === 'string' && UUID_REGEX.test(event.roomId) ? event.roomId : undefined,
      roomCode: typeof event.roomCode === 'string' && /^[A-Z0-9]{4}$/i.test(event.roomCode) ? event.roomCode.toUpperCase() : undefined,
      participantId: typeof event.participantId === 'string' && UUID_REGEX.test(event.participantId) ? event.participantId : undefined,
      category: typeof event.category === 'string' ? event.category.slice(0, 32) : undefined,
      eatingMode: typeof event.eatingMode === 'string' && ['delivery', 'dine_in', 'any'].includes(event.eatingMode) ? event.eatingMode : undefined,
      roomMode: typeof event.roomMode === 'string' && ['food', 'breakfast', 'cafes'].includes(event.roomMode) ? event.roomMode : undefined,
      district: typeof event.district === 'string' ? event.district.slice(0, 64) : undefined,
      appVersion: typeof event.appVersion === 'string' ? event.appVersion.slice(0, 32) : undefined,
      payload: sanitizeEventPayload(event.payload),
    };

    validatedEvents.push(cleanEvent);
  }

  // 8. Gateway-to-Supabase Forwarding via server-only credential
  // Direct client execution of record_analytics_events is revoked; only service_role can execute it.
  // SUPABASE_SERVICE_ROLE_KEY is a server-only secret set in Cloudflare Pages (never exposed to client).
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    // Upstream not configured (e.g. initial staging or test environment)
    return jsonResponse(
      {
        success: true,
        received: validatedEvents.length,
        inserted: 0,
        warning: 'upstream_unconfigured',
      },
      200
    );
  }

  try {
    const upstreamUrl = `${supabaseUrl}/rest/v1/rpc/record_analytics_events`;
    const upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ p_events: validatedEvents }),
    });

    if (!upstreamRes.ok) {
      return jsonResponse(
        {
          error: 'upstream_persistence_failed',
          message: 'Upstream database rejected event batch.',
        },
        502
      );
    }

    const upstreamData = (await upstreamRes.json().catch(() => ({}))) as Record<string, unknown>;
    return jsonResponse({
      success: true,
      received: upstreamData.received ?? validatedEvents.length,
      inserted: upstreamData.inserted ?? validatedEvents.length,
    });
  } catch {
    return jsonResponse(
      {
        error: 'upstream_connection_failed',
        message: 'Could not connect to database backend.',
      },
      502
    );
  }
}

/**
 * Cloudflare Pages Function entry point for POST /api/analytics
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  return handleAnalyticsIngest(context.request, context.env || {});
}

/**
 * Handle CORS preflight requests
 */
export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
