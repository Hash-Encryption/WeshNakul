import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from './_auth.ts';

export async function handleAdminMe(request: Request, env: Env): Promise<Response> {
  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse(
      { error: auth.error, message: auth.message },
      auth.status
    );
  }

  return jsonResponse({
    authenticated: true,
    user: auth.user,
  });
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  return handleAdminMe(context.request, context.env || {});
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
