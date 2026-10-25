import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';
import {
  validateAlgorithmConfigServer,
  type AlgorithmConfig,
} from './_schema.ts';

/**
 * POST /api/admin/algorithm/publish
 * Authoritatively publishes an algorithm configuration, making it the active version.
 * Atomic, validated, immutable, and concurrency-protected.
 */
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

  const settings = body.settings as AlgorithmConfig;
  const reason = typeof body.reason === 'string' ? body.reason.trim() : null;
  const expectedActiveVersion = typeof body.expected_active_version === 'number'
    ? body.expected_active_version
    : null;

  // Server-side validation
  const validation = validateAlgorithmConfigServer(settings);
  if (!validation.valid) {
    return jsonResponse(
      {
        error: 'validation_failed',
        message: 'Cannot publish invalid configuration.',
        errors: validation.errors,
      },
      422
    );
  }

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  const adminId = auth.user.email || 'admin';

  if (!supabaseUrl || !supabaseKey) {
    // Offline / Mock response
    return jsonResponse({
      success: true,
      id: 'mock-published-version',
      version_number: (expectedActiveVersion ?? 1) + 1,
      published_at: new Date().toISOString(),
      published_by: adminId,
      summary: reason || 'Algorithm settings published successfully (mock)',
    });
  }

  try {
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/publish_algorithm_settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        p_settings: settings,
        p_admin_id: adminId,
        p_reason: reason,
        p_expected_active_version: expectedActiveVersion,
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
      if (msg.includes('WSH_ALGORITHM_CONCURRENCY_CONFLICT')) {
        return jsonResponse(
          {
            error: 'concurrency_conflict',
            message: 'Another administrator published a new algorithm configuration while your draft was open. Reconcile with the active version before publishing.',
            detail: msg,
          },
          409
        );
      }

      return jsonResponse(
        {
          error: 'publish_failed',
          message: msg,
        },
        rpcRes.status >= 400 && rpcRes.status < 500 ? (rpcRes.status as 400 | 409 | 422) : 500
      );
    }

    const outcome = (await rpcRes.json()) as Record<string, unknown>;
    return jsonResponse({
      success: true,
      ...outcome,
    });
  } catch (err) {
    return jsonResponse(
      { error: 'database_error', message: (err as Error).message || 'Failed to publish configuration.' },
      500
    );
  }
}
