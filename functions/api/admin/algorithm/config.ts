import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';
import {
  DEFAULT_ALGORITHM_SETTINGS,
  ALGORITHM_CONFIG_SCHEMA_VERSION,
  validateAlgorithmConfigServer,
  type AlgorithmConfig,
} from './_schema.ts';

/**
 * GET /api/admin/algorithm/config
 * Returns current published active version and latest saved draft.
 *
 * POST /api/admin/algorithm/config
 * Saves an updated algorithm draft (without affecting live customer recommendations).
 */
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse({ error: auth.error, message: auth.message }, auth.status);
  }

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  const baselineConfig: AlgorithmConfig = {
    schema_version: ALGORITHM_CONFIG_SCHEMA_VERSION,
    global: DEFAULT_ALGORITHM_SETTINGS,
    overrides: {},
  };

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({
      success: true,
      published: {
        id: 'mock-published-v1',
        version_number: 1,
        config_schema_version: ALGORITHM_CONFIG_SCHEMA_VERSION,
        settings: baselineConfig,
        is_active: true,
        published_by: 'system',
        published_at: new Date().toISOString(),
        change_summary: 'Baseline settings (offline/mock mode)',
      },
      draft: {
        id: 'current',
        settings: baselineConfig,
        updated_by: 'system',
        updated_at: new Date().toISOString(),
      },
    });
  }

  try {
    // 1. Fetch active published version
    const pubRes = await fetch(
      `${supabaseUrl}/rest/v1/algorithm_published_versions?is_active=eq.true&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );
    const pubRows = pubRes.ok ? ((await pubRes.json()) as Record<string, unknown>[]) : [];
    const published = pubRows.length > 0 ? pubRows[0] : null;

    // 2. Fetch current draft
    const draftRes = await fetch(
      `${supabaseUrl}/rest/v1/algorithm_drafts?id=eq.current&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );
    const draftRows = draftRes.ok ? ((await draftRes.json()) as Record<string, unknown>[]) : [];
    const draft = draftRows.length > 0 ? draftRows[0] : null;

    return jsonResponse({
      success: true,
      published: published || {
        version_number: 1,
        config_schema_version: ALGORITHM_CONFIG_SCHEMA_VERSION,
        settings: baselineConfig,
        is_active: true,
        published_by: 'system',
        published_at: new Date().toISOString(),
        change_summary: 'Default baseline configuration',
      },
      draft: draft || {
        id: 'current',
        settings: published ? (published as { settings: AlgorithmConfig }).settings : baselineConfig,
        updated_by: 'system',
        updated_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    return jsonResponse(
      { error: 'database_error', message: (err as Error).message || 'Failed to fetch algorithm configuration.' },
      500
    );
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

  const settings = body.settings;
  const validation = validateAlgorithmConfigServer(settings);
  if (!validation.valid) {
    return jsonResponse(
      {
        error: 'validation_failed',
        message: 'Draft contains invalid settings.',
        errors: validation.errors,
      },
      422
    );
  }

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  const nowIso = new Date().toISOString();
  const adminId = auth.user.email || 'admin';

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({
      success: true,
      draft: {
        id: 'current',
        settings,
        updated_by: adminId,
        updated_at: nowIso,
      },
    });
  }

  try {
    const upsertRes = await fetch(`${supabaseUrl}/rest/v1/algorithm_drafts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        id: 'current',
        settings,
        updated_by: adminId,
        updated_at: nowIso,
      }),
    });

    if (!upsertRes.ok) {
      const errText = await upsertRes.text();
      return jsonResponse({ error: 'save_failed', message: errText || 'Failed to persist draft.' }, 500);
    }

    const saved = ((await upsertRes.json()) as Record<string, unknown>[])[0];
    return jsonResponse({
      success: true,
      draft: saved,
    });
  } catch (err) {
    return jsonResponse(
      { error: 'database_error', message: (err as Error).message || 'Failed to save draft.' },
      500
    );
  }
}
