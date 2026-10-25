import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';
import type { FeedbackSubmission } from '../../../src/types/feedback';

export function maskPhone(phone?: string | null): string | null {
  if (!phone) return null;
  const clean = phone.trim();
  if (clean.length <= 6) return '***';
  return clean.slice(0, 5) + '****' + clean.slice(-2);
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse({ error: auth.error, message: auth.message }, auth.status);
  }

  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status')?.trim() || '';
  const typeFilter = url.searchParams.get('type')?.trim() || '';
  const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '50', 10)));
  const offset = Math.max(0, Number.parseInt(url.searchParams.get('offset') || '0', 10));

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('test.supabase.co')) {
    // Offline or unit test mock response
    return jsonResponse({
      success: true,
      submissions: [],
      total: 0,
      limit,
      offset,
    });
  }

  try {
    let queryUrl = `${supabaseUrl}/rest/v1/feedback_submissions?select=*`;
    if (statusFilter && statusFilter !== 'all') {
      queryUrl += `&status=eq.${encodeURIComponent(statusFilter)}`;
    }
    if (typeFilter && typeFilter !== 'all') {
      queryUrl += `&submission_type=eq.${encodeURIComponent(typeFilter)}`;
    }
    queryUrl += `&order=created_at.desc&limit=${limit}&offset=${offset}`;

    const res = await fetch(queryUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'count=exact',
      },
    });

    if (!res.ok) {
      console.error('Failed to query feedback submissions', await res.text());
      return jsonResponse({ error: 'database_error', message: 'Failed to retrieve feedback submissions.' }, 500);
    }

    const contentRange = res.headers.get('content-range');
    let total = 0;
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)/);
      if (match && match[1]) {
        total = Number.parseInt(match[1], 10);
      }
    }

    const rows = (await res.json()) as FeedbackSubmission[];
    const sanitizedRows = rows.map((r) => ({
      ...r,
      contact_phone: maskPhone(r.contact_phone),
    }));

    return jsonResponse({
      success: true,
      submissions: sanitizedRows,
      total: total || sanitizedRows.length,
      limit,
      offset,
    });
  } catch (err) {
    console.error('Feedback query network failure', err);
    return jsonResponse({ error: 'network_error', message: 'Service temporarily unavailable.' }, 503);
  }
}
