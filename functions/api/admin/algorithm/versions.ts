import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';
import {
  DEFAULT_ALGORITHM_SETTINGS,
  ALGORITHM_CONFIG_SCHEMA_VERSION,
} from './_schema.ts';

/**
 * GET /api/admin/algorithm/versions
 * Returns the immutable version history of all published algorithm configurations.
 */
export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse({ error: auth.error, message: auth.message }, auth.status);
  }

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({
      success: true,
      versions: [
        {
          id: 'v1-mock',
          version_number: 1,
          config_schema_version: ALGORITHM_CONFIG_SCHEMA_VERSION,
          settings: {
            schema_version: ALGORITHM_CONFIG_SCHEMA_VERSION,
            global: DEFAULT_ALGORITHM_SETTINGS,
            overrides: {},
          },
          is_active: true,
          published_by: 'system',
          published_at: new Date().toISOString(),
          change_summary: 'Initial baseline recommendation algorithm configuration',
        },
      ],
    });
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/algorithm_published_versions?select=*&order=version_number.desc&limit=100`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return jsonResponse({ error: 'fetch_failed', message: errText || 'Failed to fetch version history.' }, 500);
    }

    const versions = (await res.json()) as Record<string, unknown>[];
    return jsonResponse({
      success: true,
      versions,
    });
  } catch (err) {
    return jsonResponse(
      { error: 'database_error', message: (err as Error).message || 'Failed to query versions.' },
      500
    );
  }
}
