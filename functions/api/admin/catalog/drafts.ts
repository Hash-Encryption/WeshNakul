import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';

const MAX_TARGET_ENTITIES = 50;

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse({ error: auth.error, message: auth.message }, auth.status);
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status')?.trim() || '';
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '50', 10)));
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({
      success: true,
      drafts: [],
      emergency_reminders: [],
      warning: 'upstream_not_configured',
    });
  }

  try {
    let query = `${supabaseUrl}/rest/v1/catalog_draft_changesets?select=id,title,status,change_type,target_entities,validation_results,reason,review_deadline,related_history_id,created_by,published_by,published_at,created_at,updated_at&order=created_at.desc&limit=${limit}&offset=${offset}`;

    if (status) {
      query += `&status=eq.${encodeURIComponent(status)}`;
    }

    const res = await fetch(query, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });

    if (!res.ok) {
      return jsonResponse({ error: 'fetch_drafts_failed', message: 'Failed to retrieve drafts.' }, 502);
    }

    const drafts = (await res.json()) as Array<Record<string, unknown>>;

    // Dedicated query for active emergency review reminders independent of pagination or status filters
    let emergencyReminders: Array<Record<string, unknown>> = [];
    try {
      const remRes = await fetch(
        `${supabaseUrl}/rest/v1/catalog_draft_changesets?change_type=eq.emergency&status=eq.published&review_deadline=not.is.null&select=id,title,status,change_type,target_entities,reason,review_deadline,published_at,published_by&order=review_deadline.asc&limit=20`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      if (remRes.ok) {
        emergencyReminders = (await remRes.json()) as Array<Record<string, unknown>>;
      }
    } catch {
      emergencyReminders = drafts.filter(
        (d) => d.change_type === 'emergency' && d.status === 'published' && d.review_deadline
      );
    }

    return jsonResponse({
      success: true,
      drafts,
      emergency_reminders: emergencyReminders,
      pagination: { total: drafts.length, limit, offset },
    });
  } catch (err) {
    return jsonResponse({ error: 'internal_error', message: (err as Error).message }, 500);
  }
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse({ error: auth.error, message: auth.message }, auth.status);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: 'invalid_json', message: 'Malformed JSON payload.' }, 400);
  }

  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title) {
    return jsonResponse({ error: 'validation_error', message: 'Draft title is required.' }, 400);
  }

  const changeType = String(body.change_type || 'edit');
  const validTypes = ['edit', 'bulk_edit', 'emergency', 'rollback', 'restore'];
  if (!validTypes.includes(changeType)) {
    return jsonResponse({ error: 'validation_error', message: `Invalid change_type: '${changeType}'.` }, 400);
  }

  const targetEntities = Array.isArray(body.target_entities) ? body.target_entities : [];
  if (targetEntities.length === 0) {
    return jsonResponse({ error: 'validation_error', message: 'At least one target entity must be specified.' }, 400);
  }

  if (targetEntities.length > MAX_TARGET_ENTITIES) {
    return jsonResponse(
      { error: 'limit_exceeded', message: `Maximum ${MAX_TARGET_ENTITIES} entities allowed per change set.` },
      400
    );
  }

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({
      success: true,
      draft: {
        id: 'mock-draft-id',
        title,
        status: 'draft',
        change_type: changeType,
        target_entities: targetEntities,
        created_by: auth.user.email,
        created_at: new Date().toISOString(),
      },
      warning: 'upstream_not_configured',
    });
  }

  try {
    const existingId = typeof body.id === 'string' ? body.id.trim() : null;
    let res: Response;

    if (existingId) {
      // Update existing draft
      res = await fetch(`${supabaseUrl}/rest/v1/catalog_draft_changesets?id=eq.${encodeURIComponent(existingId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          title,
          change_type: changeType,
          target_entities: targetEntities,
          reason: typeof body.reason === 'string' ? body.reason.trim() : null,
          review_deadline: body.review_deadline || null,
          status: 'draft', // Reset to draft on modification
          updated_at: new Date().toISOString(),
        }),
      });
    } else {
      // Create new draft
      res = await fetch(`${supabaseUrl}/rest/v1/catalog_draft_changesets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          title,
          change_type: changeType,
          target_entities: targetEntities,
          reason: typeof body.reason === 'string' ? body.reason.trim() : null,
          review_deadline: body.review_deadline || null,
          related_history_id: typeof body.related_history_id === 'string' ? body.related_history_id : null,
          created_by: auth.user.email || 'admin',
          status: 'draft',
        }),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      return jsonResponse({ error: 'draft_save_failed', message: 'Failed to persist draft.', detail: errText }, 502);
    }

    const saved = (await res.json()) as Array<Record<string, unknown>>;
    return jsonResponse({ success: true, draft: saved[0] });
  } catch (err) {
    return jsonResponse({ error: 'internal_error', message: (err as Error).message }, 500);
  }
}

export async function onRequestDelete(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse({ error: auth.error, message: auth.message }, auth.status);
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id')?.trim();
  if (!id) {
    return jsonResponse({ error: 'id_required', message: 'Draft ID is required to cancel or discard.' }, 400);
  }

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({ success: true, message: 'Draft discarded (mock mode).' });
  }

  try {
    // Mark as cancelled rather than hard delete to preserve traceability
    const res = await fetch(`${supabaseUrl}/rest/v1/catalog_draft_changesets?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ status: 'cancelled', updated_at: new Date().toISOString() }),
    });

    if (!res.ok) {
      return jsonResponse({ error: 'cancel_failed', message: 'Failed to cancel draft.' }, 502);
    }

    return jsonResponse({ success: true, message: 'Draft cancelled successfully without modifying catalog records.' });
  } catch (err) {
    return jsonResponse({ error: 'internal_error', message: (err as Error).message }, 500);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
