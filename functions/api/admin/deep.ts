import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from './_auth.ts';
import { calculateDateRange, type TimeRangeFilter } from './analytics.ts';

export async function handleAdminDeepAnalytics(request: Request, env: Env): Promise<Response> {
  // 1. Strict server-side admin authentication & authorization
  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse(
      { error: auth.error, message: auth.message },
      auth.status
    );
  }

  // 2. Parse query parameters
  const url = new URL(request.url);
  const rangeParam = (url.searchParams.get('range') || '24h').toLowerCase() as TimeRangeFilter;
  const validRanges = new Set<TimeRangeFilter>(['24h', '7d', '30d', 'all']);
  const range = validRanges.has(rangeParam) ? rangeParam : '24h';

  const category = url.searchParams.get('category')?.trim() || null;
  const district = url.searchParams.get('district')?.trim() || null;
  const eatingMode = url.searchParams.get('eating_mode')?.trim() || url.searchParams.get('eatingMode')?.trim() || null;
  const roomMode = url.searchParams.get('room_mode')?.trim() || url.searchParams.get('roomMode')?.trim() || null;

  const rawLimit = parseInt(url.searchParams.get('limit') || '50', 10);
  const limit = Math.max(1, Math.min(200, isNaN(rawLimit) ? 50 : rawLimit));

  const rawOffset = parseInt(url.searchParams.get('offset') || '0', 10);
  const offset = Math.max(0, isNaN(rawOffset) ? 0 : rawOffset);

  const { startTime, endTime } = calculateDateRange(range);

  // 3. Connect to Supabase using server-only service_role key
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({
      success: true,
      time_range: {
        filter: range,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      },
      filters: { category, district, eating_mode: eatingMode, room_mode: roomMode },
      kpis: {
        total_events: 0,
        rooms_created_success: 0,
        rooms_joined_success: 0,
        total_candidates_generated: 0,
        total_card_impressions: 0,
        total_swipes: 0,
        total_yes_votes: 0,
        total_no_votes: 0,
        total_later_votes: 0,
        total_matches: 0,
        total_maps_clicks: 0,
        total_delivery_clicks: 0,
        total_minigames_started: 0,
        total_minigames_completed: 0,
        total_revotes: 0,
        total_explicit_exits: 0,
        total_technical_failures: 0,
        approval_rate_pct: null,
        exposure_to_yes_pct: null,
      },
      algorithm_health: {
        summary: {
          total_impressions: 0,
          distinct_brands_shown: 0,
          top_brand_impression_share_pct: 0,
          hhi_concentration_index: 0,
        },
        brands: [],
        resolution_methods: [],
      },
      catalog_history: [],
      pagination: {
        total: 0,
        limit,
        offset,
        has_more: false,
      },
      events: [],
      warning: 'upstream_not_configured',
    });
  }

  // 4. Invoke authoritative database aggregation RPC
  try {
    const rpcUrl = `${supabaseUrl}/rest/v1/rpc/get_admin_deep_analytics`;
    const rpcRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        p_start_time: startTime.toISOString(),
        p_end_time: endTime.toISOString(),
        p_category: category,
        p_district: district,
        p_eating_mode: eatingMode,
        p_room_mode: roomMode,
        p_limit: limit,
        p_offset: offset,
      }),
    });

    if (rpcRes.ok) {
      const data = (await rpcRes.json()) as Record<string, unknown>;
      return jsonResponse({
        ...data,
        time_range: {
          filter: range,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
        },
      });
    }

    const errText = await rpcRes.text();
    return jsonResponse(
      {
        error: 'rpc_invocation_failed',
        message: 'Database deep analytics aggregation encountered an error.',
        detail: errText ? 'RPC error returned from storage backend' : undefined,
      },
      502
    );
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

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  return handleAdminDeepAnalytics(context.request, context.env || {});
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
