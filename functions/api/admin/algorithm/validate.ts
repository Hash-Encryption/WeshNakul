import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';
import { validateAlgorithmConfigServer } from './_schema.ts';

/**
 * POST /api/admin/algorithm/validate
 * Validates a candidate algorithm configuration against bounds, keys, and schema rules.
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

  const settings = body.settings ?? body;
  const result = validateAlgorithmConfigServer(settings);

  return jsonResponse({
    valid: result.valid,
    errors: result.errors,
  }, result.valid ? 200 : 422);
}
