import {
  type Env,
  jsonResponse,
} from './_auth.ts';

export async function handleAdminLogout(_request: Request, _env: Env): Promise<Response> {
  return jsonResponse(
    { success: true, message: 'Logged out successfully.' },
    200,
    {
      'Set-Cookie': 'wsh_admin_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure',
    }
  );
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  return handleAdminLogout(context.request, context.env || {});
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
