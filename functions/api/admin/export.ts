import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from './_auth.ts';
import { calculateDateRange, type TimeRangeFilter } from './analytics.ts';

const MAX_EXPORT_ROWS = 5000;

/**
 * Sanitizes cell values to neutralize CSV / formula injection attacks (DDE)
 * and properly escape RFC 4180 special characters.
 */
export function sanitizeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  let str = String(val);

  // Strip or neutralize formula injection characters: =, +, -, @, \t, \r
  if (/^[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }

  // RFC 4180 escaping: wrap in double quotes if it contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }

  return str;
}

export async function handleAdminExport(request: Request, env: Env): Promise<Response> {
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

  // Enforce server-side 5,000 row maximum
  const rawLimit = parseInt(url.searchParams.get('limit') || `${MAX_EXPORT_ROWS}`, 10);
  const limit = Math.max(1, Math.min(MAX_EXPORT_ROWS, isNaN(rawLimit) ? MAX_EXPORT_ROWS : rawLimit));

  const { startTime, endTime } = calculateDateRange(range);

  // 3. Connect to Supabase using server-only service_role key
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    // Generate empty CSV template if upstream is unconfigured
    const emptyCsv = '\uFEFF' + [
      'Event ID,Event Type,Event Time (UTC),Category,District,Eating Mode,Room Mode,App Version,Restaurant ID,Branch ID,Vote,Resolution Method,Duration (ms)',
      '# Notice: Upstream database is unconfigured. Zero rows exported.',
    ].join('\r\n');

    return new Response(emptyCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="weshnakul-events-${range}.csv"`,
        'Cache-Control': 'no-store',
        'X-Truncated': 'false',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Truncated',
      },
    });
  }

  // 4. Query events directly with server-side limit and boundary checks
  try {
    let queryUrl = `${supabaseUrl}/rest/v1/analytics_events?select=event_id,event_type,event_time,category,district,eating_mode,room_mode,app_version,payload&event_time=gte.${startTime.toISOString()}&event_time=lte.${endTime.toISOString()}&order=event_time.desc&limit=${limit + 1}`;

    if (category) {
      queryUrl += `&category=eq.${encodeURIComponent(category)}`;
    }
    if (district) {
      queryUrl += `&district=eq.${encodeURIComponent(district)}`;
    }
    if (eatingMode) {
      queryUrl += `&eating_mode=eq.${encodeURIComponent(eatingMode)}`;
    }
    if (roomMode) {
      queryUrl += `&room_mode=eq.${encodeURIComponent(roomMode)}`;
    }

    const tableRes = await fetch(queryUrl, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!tableRes.ok) {
      return jsonResponse(
        {
          error: 'database_query_failed',
          message: 'Unable to fetch events data for export.',
        },
        502
      );
    }

    const rawRows = (await tableRes.json()) as Array<{
      event_id: string;
      event_type: string;
      event_time: string;
      category?: string;
      district?: string;
      eating_mode?: string;
      room_mode?: string;
      app_version?: string;
      payload?: Record<string, unknown>;
    }>;

    const isTruncated = rawRows.length > limit || rawRows.length === MAX_EXPORT_ROWS;
    const rows = rawRows.slice(0, limit);

    // Build RFC 4180 CSV with UTF-8 BOM
    const headers = [
      'Event ID',
      'Event Type',
      'Event Time (UTC)',
      'Category',
      'District',
      'Eating Mode',
      'Room Mode',
      'App Version',
      'Restaurant ID',
      'Branch ID',
      'Vote',
      'Resolution Method',
      'Mini Game Type',
      'Duration (ms)',
    ];

    const lines: string[] = [];
    lines.push(headers.map(sanitizeCsvCell).join(','));

    for (const r of rows) {
      const p = r.payload || {};
      const restaurantId = p.restaurantId || p.outcomeRestaurantId || '';
      const branchId = p.branchId || '';
      const vote = p.vote || '';
      const resolutionMethod = p.resolutionMethod || '';
      const gameType = p.gameType || '';
      const durationMs = p.durationMs !== undefined ? p.durationMs : '';

      const lineValues = [
        r.event_id,
        r.event_type,
        r.event_time,
        r.category || '',
        r.district || '',
        r.eating_mode || '',
        r.room_mode || '',
        r.app_version || '',
        restaurantId,
        branchId,
        vote,
        resolutionMethod,
        gameType,
        durationMs,
      ];

      lines.push(lineValues.map(sanitizeCsvCell).join(','));
    }

    if (isTruncated) {
      lines.push(
        `# Truncation Disclosure: Export capped at ${limit} rows to preserve server stability. Refine filter range or dimensions for more specific intervals.`
      );
    }

    // Prepend UTF-8 BOM (\uFEFF)
    const csvContent = '\uFEFF' + lines.join('\r\n');

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="weshnakul-analytics-export-${range}.csv"`,
        'Cache-Control': 'no-store',
        'X-Truncated': isTruncated ? 'true' : 'false',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Truncated',
      },
    });
  } catch {
    return jsonResponse(
      {
        error: 'export_generation_failed',
        message: 'Could not generate CSV export file.',
      },
      502
    );
  }
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  return handleAdminExport(context.request, context.env || {});
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
