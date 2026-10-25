import type { BugDiagnosticContext, FeedbackType } from '../../src/types/feedback';

export interface Env {
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  TEST_SUPABASE_KEY?: string;
  RATE_LIMITER?: {
    limit: (options: { key: string }) => Promise<{ success: boolean }>;
  };
  [key: string]: unknown;
}

const MAX_REQUEST_SIZE_BYTES = 16384; // 16 KB
const RATE_LIMIT_WINDOW_MS = 600000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5; // 5 submissions per 10 minutes per IP

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

function pruneRateLimitMap(now: number): void {
  if (rateLimitMap.size > 1000) {
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(ip);
      }
    }
  }
}

export function checkFeedbackRateLimit(
  clientIp: string,
  now = Date.now()
): { allowed: boolean; retryAfter: number } {
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

export function _resetFeedbackRateLimitsForTesting(): void {
  rateLimitMap.clear();
}

export function getTrustedClientIp(request: Request): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim().length > 0) {
    return cfIp.trim();
  }
  return '127.0.0.1';
}

function jsonResponse(
  data: Record<string, unknown>,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

const PHONE_REGEX = /^\+?[0-9\s-]{8,20}$/;

function sanitizeBugDiagnostics(raw: unknown): BugDiagnosticContext | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  const obj = raw as Record<string, unknown>;
  const clean: BugDiagnosticContext = {};

  if (typeof obj.timestamp === 'string' && obj.timestamp.length <= 50) {
    clean.timestamp = obj.timestamp;
  }
  if (typeof obj.sanitized_route === 'string' && obj.sanitized_route.length <= 150) {
    clean.sanitized_route = obj.sanitized_route.replace(/[?#].*$/, '').slice(0, 100);
  }
  if (typeof obj.app_version === 'string' && obj.app_version.length <= 50) {
    clean.app_version = obj.app_version;
  }
  if (obj.recent_error && typeof obj.recent_error === 'object' && !Array.isArray(obj.recent_error)) {
    const err = obj.recent_error as Record<string, unknown>;
    clean.recent_error = {
      event: typeof err.event === 'string' ? err.event.slice(0, 50) : undefined,
      event_phase: typeof err.event_phase === 'string' ? err.event_phase.slice(0, 50) : undefined,
      error_message: typeof err.error_message === 'string' ? err.error_message.slice(0, 300) : undefined,
      category: typeof err.category === 'string' ? err.category.slice(0, 50) : undefined,
    };
  }

  return clean;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // 1. Content-Type check
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return jsonResponse({ error: 'invalid_content_type', message: 'Content-Type must be application/json.' }, 415);
  }

  // 2. Request size check
  const contentLength = Number.parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLength > MAX_REQUEST_SIZE_BYTES) {
    return jsonResponse({ error: 'payload_too_large', message: 'Request exceeds maximum size limit.' }, 413);
  }

  // 3. Rate limiting check
  const clientIp = getTrustedClientIp(request);
  const rateCheck = checkFeedbackRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return jsonResponse(
      { error: 'rate_limit_exceeded', message: 'Too many feedback submissions. Please try again later.' },
      429,
      { 'Retry-After': String(rateCheck.retryAfter) }
    );
  }

  // 4. Parse JSON
  let bodyText: string;
  try {
    bodyText = await request.text();
  } catch {
    return jsonResponse({ error: 'read_error', message: 'Failed to read request body.' }, 400);
  }

  if (bodyText.length > MAX_REQUEST_SIZE_BYTES) {
    return jsonResponse({ error: 'payload_too_large', message: 'Request exceeds maximum size limit.' }, 413);
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(bodyText) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'invalid_json', message: 'Malformed JSON payload.' }, 400);
  }

  // 5. Validate type
  const rawType = body.submission_type;
  if (rawType !== 'bug' && rawType !== 'comment' && rawType !== 'brand_suggestion') {
    return jsonResponse(
      { error: 'invalid_submission_type', message: 'submission_type must be bug, comment, or brand_suggestion.' },
      422
    );
  }
  const submissionType = rawType as FeedbackType;

  // 6. Validate message
  const rawMessage = typeof body.user_message === 'string' ? body.user_message.trim() : '';
  if (submissionType === 'bug' || submissionType === 'comment') {
    if (!rawMessage || rawMessage.length < 3) {
      return jsonResponse({ error: 'validation_error', message: 'Message is required (minimum 3 characters).' }, 422);
    }
  }
  if (rawMessage.length > 3000) {
    return jsonResponse({ error: 'validation_error', message: 'Message cannot exceed 3000 characters.' }, 422);
  }

  // 7. Type-specific validation
  let submitterName: string | null = null;
  let brandName: string | null = null;
  let brandLocation: string | null = null;
  let district: string | null = null;
  let isBrandOwner: boolean | null = null;
  let contactPhone: string | null = null;
  let diagnosticContext: BugDiagnosticContext | null = null;

  if (submissionType === 'comment') {
    if (typeof body.submitter_name === 'string') {
      const cleanName = body.submitter_name.trim();
      submitterName = cleanName.length > 0 ? cleanName.slice(0, 100) : null;
    }
  } else if (submissionType === 'brand_suggestion') {
    const rawBrandName = typeof body.brand_name === 'string' ? body.brand_name.trim() : '';
    if (!rawBrandName || rawBrandName.length < 2) {
      return jsonResponse({ error: 'validation_error', message: 'Brand name is required (minimum 2 characters).' }, 422);
    }
    if (rawBrandName.length > 150) {
      return jsonResponse({ error: 'validation_error', message: 'Brand name cannot exceed 150 characters.' }, 422);
    }
    brandName = rawBrandName;

    if (typeof body.brand_location === 'string') {
      const cleanLoc = body.brand_location.trim();
      brandLocation = cleanLoc.length > 0 ? cleanLoc.slice(0, 200) : null;
    }
    if (typeof body.district === 'string') {
      const cleanDist = body.district.trim();
      district = cleanDist.length > 0 ? cleanDist.slice(0, 100) : null;
    }

    // Owner question is strictly required
    if (typeof body.is_brand_owner !== 'boolean') {
      return jsonResponse(
        { error: 'validation_error', message: 'Must answer whether you are the owner or authorized representative.' },
        422
      );
    }
    isBrandOwner = body.is_brand_owner;

    if (isBrandOwner) {
      const rawPhone = typeof body.contact_phone === 'string' ? body.contact_phone.trim() : '';
      if (!rawPhone || !PHONE_REGEX.test(rawPhone)) {
        return jsonResponse(
          { error: 'validation_error', message: 'A valid contact phone number with country code is required for brand owners.' },
          422
        );
      }
      contactPhone = rawPhone.slice(0, 30);
    } else {
      // If not owner, ensure contact phone is null
      contactPhone = null;
    }
  } else if (submissionType === 'bug') {
    diagnosticContext = sanitizeBugDiagnostics(body.diagnostic_context);
  }

  // 8. Database Ingestion
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  const recordToInsert = {
    submission_type: submissionType,
    status: 'New',
    user_message: rawMessage || brandName || 'No message provided',
    submitter_name: submitterName,
    brand_name: brandName,
    brand_location: brandLocation,
    district: district,
    is_brand_owner: isBrandOwner,
    contact_phone: contactPhone,
    diagnostic_context: diagnosticContext || {},
  };

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('test.supabase.co')) {
    // Offline or test mock mode
    return jsonResponse({
      success: true,
      id: 'mock-feedback-' + Date.now(),
      message: 'Feedback received successfully (offline/mock mode).',
      submission: recordToInsert,
    });
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/feedback_submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify(recordToInsert),
    });

    if (!res.ok) {
      console.error('Failed to insert feedback submission', await res.text());
      return jsonResponse({ error: 'database_error', message: 'Failed to record feedback. Please try again.' }, 500);
    }

    const insertedRows = (await res.json()) as { id: string }[];
    const inserted = insertedRows && insertedRows.length > 0 ? insertedRows[0] : null;

    return jsonResponse({
      success: true,
      id: inserted?.id || 'created',
      message: 'Feedback received successfully.',
    });
  } catch (err) {
    console.error('Feedback ingestion network failure', err);
    return jsonResponse({ error: 'network_error', message: 'Service temporarily unavailable.' }, 503);
  }
}
