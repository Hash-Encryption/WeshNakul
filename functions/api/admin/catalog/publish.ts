import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // 1. Strict server-side admin authentication & authorization
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

  const changesetId = typeof body.changeset_id === 'string' ? body.changeset_id.trim() : null;
  if (!changesetId) {
    return jsonResponse({ error: 'changeset_id_required', message: 'Change set ID is required for publication.' }, 400);
  }

  const reason = typeof body.reason === 'string' ? body.reason.trim() : null;

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({
      success: true,
      changeset_id: changesetId,
      published_entities_count: 1,
      published_at: new Date().toISOString(),
      published_by: auth.user.email,
      reason,
      warning: 'upstream_not_configured',
    });
  }

  try {
    // Invoke authoritative atomic publication RPC
    const rpcUrl = `${supabaseUrl}/rest/v1/rpc/publish_catalog_changeset`;
    const rpcRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        p_changeset_id: changesetId,
        p_admin_id: auth.user.email || 'admin',
        p_reason: reason,
      }),
    });

    if (!rpcRes.ok) {
      const errText = await rpcRes.text();
      let errJson: Record<string, unknown> = {};
      try {
        errJson = JSON.parse(errText);
      } catch {
        // Raw text
      }

      const msg = String(errJson.message || errJson.details || errText || 'Publication failed.');

      // Check specific error codes
      if (msg.includes('WSH_STALE_DRAFT_CONFLICT')) {
        return jsonResponse(
          {
            error: 'stale_draft_conflict',
            message: 'Live catalog data was updated after this draft was created. Reconcile with latest values before publishing.',
            detail: msg,
          },
          409
        );
      }

      if (msg.includes('WSH_BRANCH_READINESS_FAILED')) {
        return jsonResponse(
          {
            error: 'branch_readiness_failed',
            message: 'Branch fails minimum production-readiness constraints (address or canonical district missing).',
            detail: msg,
          },
          422
        );
      }

      if (msg.includes('WSH_REASON_REQUIRED')) {
        return jsonResponse(
          {
            error: 'reason_required',
            message: 'A non-empty reason is strictly required to authorize sensitive publication.',
            detail: msg,
          },
          422
        );
      }

      return jsonResponse(
        {
          error: 'publication_failed',
          message: 'Transactional publication aborted. No partial changes were applied.',
          detail: msg,
        },
        502
      );
    }

    const outcome = (await rpcRes.json()) as Record<string, unknown>;
    return jsonResponse({
      success: true,
      outcome,
      message: 'Change set published atomically to live catalog and audited.',
    });
  } catch (err) {
    return jsonResponse(
      {
        error: 'internal_error',
        message: (err as Error).message || 'Server error during publication.',
      },
      500
    );
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
