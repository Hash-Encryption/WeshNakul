import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';

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

  const historyId = typeof body.history_id === 'string' ? body.history_id.trim() : '';
  if (!historyId) {
    return jsonResponse({ error: 'history_id_required', message: 'History record ID is required for rollback.' }, 400);
  }

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({
      success: true,
      draft_id: 'mock-rollback-draft-id',
      warning: 'upstream_not_configured',
    });
  }

  try {
    // 1. Fetch history record
    const histRes = await fetch(`${supabaseUrl}/rest/v1/catalog_change_history?id=eq.${encodeURIComponent(historyId)}`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });

    if (!histRes.ok) {
      return jsonResponse({ error: 'history_lookup_failed', message: 'Failed to look up history record.' }, 502);
    }

    const histRows = (await histRes.json()) as Array<{
      id: string;
      entity_type: string;
      entity_id: string;
      previous_state: Record<string, unknown> | null;
      new_state: Record<string, unknown> | null;
      effective_at: string;
    }>;

    if (histRows.length === 0) {
      return jsonResponse({ error: 'not_found', message: 'History entry not found.' }, 404);
    }

    const rec = histRows[0];
    const stateToRestore = rec.previous_state;
    if (!stateToRestore) {
      return jsonResponse(
        {
          error: 'no_previous_state',
          message: 'This history entry has no prior snapshot (it was a creation event). Cannot rollback.',
        },
        400
      );
    }

    // 2. Fetch current entity for base_version
    const table = rec.entity_type === 'restaurant' ? 'restaurants' : 'restaurant_branches';
    const entRes = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(rec.entity_id)}&select=updated_at`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });

    let baseVersion: string | null = null;
    if (entRes.ok) {
      const rows = (await entRes.json()) as Array<{ updated_at?: string }>;
      if (rows.length > 0 && rows[0].updated_at) {
        baseVersion = rows[0].updated_at;
      }
    }

    // Filter out read-only fields from stateToRestore
    const cleanChanges: Record<string, unknown> = { ...stateToRestore };
    delete cleanChanges.id;
    delete cleanChanges.restaurant_id;

    // 3. Create a new forward draft change set
    const title = `Forward Rollback: ${rec.entity_type} ${rec.entity_id} to snapshot from ${rec.effective_at.slice(0, 10)}`;
    const draftRes = await fetch(`${supabaseUrl}/rest/v1/catalog_draft_changesets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        title,
        status: 'draft',
        change_type: 'rollback',
        target_entities: [
          {
            entity_type: rec.entity_type,
            entity_id: rec.entity_id,
            base_version: baseVersion,
            changes: cleanChanges,
          },
        ],
        related_history_id: rec.id,
        created_by: auth.user.email || 'admin',
      }),
    });

    if (!draftRes.ok) {
      const err = await draftRes.text();
      return jsonResponse({ error: 'create_rollback_draft_failed', message: 'Failed to create rollback draft.', detail: err }, 502);
    }

    const createdRows = (await draftRes.json()) as Array<{ id: string }>;

    return jsonResponse({
      success: true,
      draft_id: createdRows[0].id,
      title,
      target_entity: {
        entity_type: rec.entity_type,
        entity_id: rec.entity_id,
      },
      message: 'Forward rollback draft created. Review diff and validate before publishing.',
    });
  } catch (err) {
    return jsonResponse({ error: 'internal_error', message: (err as Error).message }, 500);
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
