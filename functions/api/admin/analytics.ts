import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from './_auth.ts';

export type TimeRangeFilter = '24h' | '7d' | '30d' | 'all';

export function calculateDateRange(filter: TimeRangeFilter, now = new Date()): { startTime: Date; endTime: Date } {
  const endTime = new Date(now);
  let startTime: Date;

  switch (filter) {
    case '7d':
      startTime = new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
      startTime = new Date(endTime.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case '24h':
    default:
      startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
      break;
  }

  return { startTime, endTime };
}

/**
 * Handle protected GET /api/admin/analytics
 */
export async function handleAdminAnalytics(request: Request, env: Env): Promise<Response> {
  // 1. Enforce strict server-side admin authentication & authorization
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

  const { startTime, endTime } = calculateDateRange(range);

  // 3. Connect to Supabase using server-only service_role key
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    // Return empty structured template if upstream is not configured yet
    return jsonResponse({
      success: true,
      time_range: {
        filter: range,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      },
      summary: {
        total_events: 0,
        unique_visitors: 0,
        total_sessions: 0,
        rooms_created_success: 0,
        rooms_created_failed: 0,
        rooms_joined_success: 0,
        rooms_joined_failed: 0,
        total_swipes: 0,
        total_matches: 0,
        total_minigames_started: 0,
        total_minigames_completed: 0,
        total_maps_clicks: 0,
        total_delivery_clicks: 0,
        total_revotes: 0,
        total_technical_failures: 0,
      },
      breakdowns: {
        by_event_type: [],
        by_category: [],
        by_room_mode: [],
        by_eating_mode: [],
        swipes_by_vote: [],
        top_winning_restaurants: [],
        minigames: [],
        join_failures: [],
        activity_timeline: [],
      },
      recent_events: [],
      warning: 'upstream_not_configured',
    });
  }

  // 4. Invoke authoritative database aggregation RPC
  try {
    const rpcUrl = `${supabaseUrl}/rest/v1/rpc/get_admin_analytics_summary`;
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

    // 5. Resilient fallback: direct query via PostgREST if RPC is pending deployment
    const tableUrl = `${supabaseUrl}/rest/v1/analytics_events?select=id,event_id,event_type,event_time,anonymous_id,room_code,category,eating_mode,room_mode,app_version,payload&event_time=gte.${startTime.toISOString()}&event_time=lte.${endTime.toISOString()}&order=event_time.desc&limit=1000`;
    const tableRes = await fetch(tableUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!tableRes.ok) {
      return jsonResponse(
        {
          error: 'database_query_failed',
          message: 'Unable to fetch analytics data from storage backend.',
        },
        502
      );
    }

    const rows = (await tableRes.json()) as Array<{
      id: string;
      event_id: string;
      event_type: string;
      event_time: string;
      anonymous_id?: string;
      room_code?: string;
      category?: string;
      eating_mode?: string;
      room_mode?: string;
      app_version?: string;
      payload?: Record<string, unknown>;
    }>;

    // Aggregate in-memory
    const uniqueAnon = new Set<string>();
    let totalSessions = 0;
    let roomsCreatedSuccess = 0;
    let roomsCreatedFailed = 0;
    let roomsJoinedSuccess = 0;
    let roomsJoinedFailed = 0;
    let totalSwipes = 0;
    let totalMatches = 0;
    let minigamesStarted = 0;
    let minigamesCompleted = 0;
    let mapsClicks = 0;
    let deliveryClicks = 0;
    let revotes = 0;
    let technicalFailures = 0;

    const eventTypeCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const roomModeCounts: Record<string, number> = {};
    const eatingModeCounts: Record<string, number> = {};
    const voteCounts: Record<string, number> = {};
    const winnerCounts: Record<string, number> = {};
    const minigameStats: Record<string, { started_count: number; completed_count: number }> = {};
    const joinFailureCounts: Record<string, number> = {};

    for (const row of rows) {
      if (row.anonymous_id) uniqueAnon.add(row.anonymous_id);
      eventTypeCounts[row.event_type] = (eventTypeCounts[row.event_type] || 0) + 1;

      if (row.category) {
        categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1;
      }
      if (row.room_mode) {
        roomModeCounts[row.room_mode] = (roomModeCounts[row.room_mode] || 0) + 1;
      }
      if (row.eating_mode) {
        eatingModeCounts[row.eating_mode] = (eatingModeCounts[row.eating_mode] || 0) + 1;
      }

      switch (row.event_type) {
        case 'app_session_start':
          totalSessions++;
          break;
        case 'room_create_success':
          roomsCreatedSuccess++;
          break;
        case 'room_create_failed':
          roomsCreatedFailed++;
          break;
        case 'room_join_success':
          roomsJoinedSuccess++;
          break;
        case 'room_join_failed':
          roomsJoinedFailed++;
          if (row.payload?.reason) {
            const r = String(row.payload.reason);
            joinFailureCounts[r] = (joinFailureCounts[r] || 0) + 1;
          }
          break;
        case 'restaurant_swipe':
          totalSwipes++;
          if (row.payload?.vote) {
            const v = String(row.payload.vote);
            voteCounts[v] = (voteCounts[v] || 0) + 1;
          }
          break;
        case 'decision_winner_matched':
          totalMatches++;
          if (row.payload?.restaurantId) {
            const rid = String(row.payload.restaurantId);
            winnerCounts[rid] = (winnerCounts[rid] || 0) + 1;
          }
          break;
        case 'minigame_started': {
          minigamesStarted++;
          const g = String(row.payload?.gameType || 'unknown');
          if (!minigameStats[g]) minigameStats[g] = { started_count: 0, completed_count: 0 };
          minigameStats[g].started_count++;
          break;
        }
        case 'minigame_completed': {
          minigamesCompleted++;
          const g = String(row.payload?.gameType || 'unknown');
          if (!minigameStats[g]) minigameStats[g] = { started_count: 0, completed_count: 0 };
          minigameStats[g].completed_count++;
          break;
        }
        case 'outbound_maps_click':
          mapsClicks++;
          break;
        case 'outbound_delivery_click':
          deliveryClicks++;
          break;
        case 'revote_requested':
          revotes++;
          break;
        case 'app_technical_failure':
          technicalFailures++;
          break;
      }
    }

    return jsonResponse({
      success: true,
      time_range: {
        filter: range,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
      },
      summary: {
        total_events: rows.length,
        unique_visitors: uniqueAnon.size,
        total_sessions: totalSessions,
        rooms_created_success: roomsCreatedSuccess,
        rooms_created_failed: roomsCreatedFailed,
        rooms_joined_success: roomsJoinedSuccess,
        rooms_joined_failed: roomsJoinedFailed,
        total_swipes: totalSwipes,
        total_matches: totalMatches,
        total_minigames_started: minigamesStarted,
        total_minigames_completed: minigamesCompleted,
        total_maps_clicks: mapsClicks,
        total_delivery_clicks: deliveryClicks,
        total_revotes: revotes,
        total_technical_failures: technicalFailures,
      },
      breakdowns: {
        by_event_type: Object.entries(eventTypeCounts).map(([event_type, count]) => ({ event_type, count })),
        by_category: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
        by_room_mode: Object.entries(roomModeCounts).map(([room_mode, count]) => ({ room_mode, count })),
        by_eating_mode: Object.entries(eatingModeCounts).map(([eating_mode, count]) => ({ eating_mode, count })),
        swipes_by_vote: Object.entries(voteCounts).map(([vote, count]) => ({ vote, count })),
        top_winning_restaurants: Object.entries(winnerCounts)
          .map(([restaurant_id, wins_count]) => ({ restaurant_id, wins_count }))
          .sort((a, b) => b.wins_count - a.wins_count)
          .slice(0, 15),
        minigames: Object.entries(minigameStats).map(([game_type, stats]) => ({
          game_type,
          ...stats,
        })),
        join_failures: Object.entries(joinFailureCounts).map(([reason, count]) => ({ reason, count })),
        activity_timeline: [],
      },
      recent_events: rows.slice(0, 50).map((r) => ({
        id: r.id,
        event_id: r.event_id,
        event_type: r.event_type,
        event_time: r.event_time,
        room_code: r.room_code,
        category: r.category,
        eating_mode: r.eating_mode,
        room_mode: r.room_mode,
        app_version: r.app_version,
      })),
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

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  return handleAdminAnalytics(context.request, context.env || {});
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
