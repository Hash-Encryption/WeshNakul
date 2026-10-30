/**
 * Edge Server-Side Admin Authentication & Authorization Helper
 *
 * Enforces cryptographic HMAC-SHA256 admin session verification and
 * Supabase Auth role checks strictly at the server boundary.
 *
 * Mandate:
 * 1. Server-Only Credentials:
 *    Service-role keys and admin secrets never leave the server.
 * 2. Strict Privilege Separation:
 *    Unauthenticated requests -> 401 Unauthorized
 *    Authenticated non-admin requests -> 403 Forbidden
 *    Authorized admin requests -> 200 OK
 */

export interface Env {
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  TEST_SUPABASE_KEY?: string;
  ADMIN_JWT_SECRET?: string;
  TEST_ADMIN_SECRET?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_EMAIL?: string;
  ADMIN_EMAILS?: string;
  ADMIN_USERNAME?: string;
  RATE_LIMITER?: {
    limit: (options: { key: string }) => Promise<{ success: boolean }>;
  };
  [key: string]: unknown;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
}

export interface AdminTokenPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

export type AdminAuthResult =
  | { authenticated: true; user: AdminUser }
  | { authenticated: false; status: 401 | 403; error: string; message: string };

function base64UrlEncode(data: string | Uint8Array): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function getAdminSecret(env: Env): string {
  const secret = (
    (typeof env.ADMIN_JWT_SECRET === 'string' ? env.ADMIN_JWT_SECRET : '') ||
    (typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string' ? env.SUPABASE_SERVICE_ROLE_KEY : '') ||
    (typeof env.TEST_ADMIN_SECRET === 'string' ? env.TEST_ADMIN_SECRET : '') ||
    ''
  ).trim();

  if (!secret) {
    throw new Error('WSH_MISSING_ADMIN_SECRET: No admin signing secret configured in server environment.');
  }

  return secret;
}

/**
 * Mint a cryptographically signed HMAC-SHA256 admin session token (standard compact JWT format).
 */
export async function createAdminToken(
  payload: { sub: string; email: string; role: string; exp?: number },
  secret: string
): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: AdminTokenPayload = {
    sub: payload.sub,
    email: payload.email,
    role: payload.role,
    iat: now,
    exp: payload.exp || now + 8 * 3600, // 8 hours by default
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = new TextEncoder().encode(`${headerEncoded}.${payloadEncoded}`);

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, dataToSign);
  const signatureEncoded = base64UrlEncode(new Uint8Array(signature));

  return `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`;
}

/**
 * Verify HMAC-SHA256 admin session token signature and expiration.
 */
export async function verifyAdminToken(
  token: string,
  secret: string
): Promise<{ valid: boolean; payload?: AdminTokenPayload; error?: string }> {
  try {
    if (!token || !secret) {
      return { valid: false, error: 'invalid_arguments' };
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'invalid_token_format' };
    }
    const [headerEncoded, payloadEncoded, signatureEncoded] = parts;
    const dataToVerify = new TextEncoder().encode(`${headerEncoded}.${payloadEncoded}`);
    const signatureBytes = base64UrlDecode(signatureEncoded);

    // Verify token header structure & algorithm
    const headerJson = new TextDecoder().decode(base64UrlDecode(headerEncoded));
    const header = JSON.parse(headerJson) as { alg?: string; typ?: string };
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
      return { valid: false, error: 'invalid_token_header' };
    }

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, dataToVerify);
    if (!isValid) {
      return { valid: false, error: 'invalid_signature' };
    }

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadEncoded));
    const payload = JSON.parse(payloadJson) as AdminTokenPayload;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || typeof payload.exp !== 'number' || payload.exp < now) {
      return { valid: false, error: 'token_expired' };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'verification_failed' };
  }
}

/**
 * Extract bearer token from Authorization header or Cookie.
 */
export function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader && authHeader.trim().toLowerCase().startsWith('bearer ')) {
    const token = authHeader.trim().substring(7).trim();
    if (token) return token;
  }

  const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)wsh_admin_token=([^;]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1].trim());
    }
  }

  return null;
}

/**
 * Authorize an admin request strictly on the server-side.
 * Returns 401 for unauthenticated, 403 for authenticated non-admin, or 200 with user for admin.
 */
export async function authenticateAdminRequest(request: Request, env: Env): Promise<AdminAuthResult> {
  const token = extractToken(request);
  if (!token) {
    return {
      authenticated: false,
      status: 401,
      error: 'unauthorized',
      message: 'Authentication credentials required.',
    };
  }

  let secret: string;
  try {
    secret = getAdminSecret(env);
  } catch {
    return {
      authenticated: false,
      status: 401,
      error: 'unauthorized',
      message: 'Server authentication secret is not configured.',
    };
  }

  // 1. Verify our edge-issued HMAC-SHA256 token
  const edgeVerification = await verifyAdminToken(token, secret);
  if (edgeVerification.valid && edgeVerification.payload) {
    if (edgeVerification.payload.role === 'admin') {
      return {
        authenticated: true,
        user: {
          id: edgeVerification.payload.sub,
          email: edgeVerification.payload.email,
          role: 'admin',
        },
      };
    } else {
      // Authenticated with valid token, but not an admin!
      return {
        authenticated: false,
        status: 403,
        error: 'forbidden',
        message: 'Admin privileges required. Access denied.',
      };
    }
  }

  // 2. Fallback: Verify if token is a Supabase Auth access_token (JWT)
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseAnonKey = (env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`,
        },
      });

      if (userRes.ok) {
        const user = (await userRes.json()) as {
          id: string;
          email?: string;
          app_metadata?: { role?: string; is_admin?: boolean };
        };

        const email = (user.email || '').toLowerCase().trim();
        const configuredAdminEmail = (env.ADMIN_EMAIL || '').toLowerCase().trim();
        const configuredAdminEmails = (env.ADMIN_EMAILS || '')
          .split(',')
          .map((e) => e.toLowerCase().trim())
          .filter(Boolean);

        const isAdmin =
          user.app_metadata?.role === 'admin' ||
          user.app_metadata?.is_admin === true ||
          (configuredAdminEmail && email === configuredAdminEmail) ||
          (configuredAdminEmails.length > 0 && configuredAdminEmails.includes(email));

        if (isAdmin) {
          return {
            authenticated: true,
            user: {
              id: user.id,
              email: user.email || 'admin@weshnakul.com',
              role: 'admin',
            },
          };
        }

        // Authenticated in Supabase, but NOT an admin!
        return {
          authenticated: false,
          status: 403,
          error: 'forbidden',
          message: 'Authenticated user is not authorized as an administrator.',
        };
      }
    } catch {
      // Fall through to unauthenticated
    }
  }

  // If token was expired specifically
  if (edgeVerification.error === 'token_expired') {
    return {
      authenticated: false,
      status: 401,
      error: 'token_expired',
      message: 'Admin session has expired. Please log in again.',
    };
  }

  // Unrecognized or invalid token
  return {
    authenticated: false,
    status: 401,
    error: 'unauthorized',
    message: 'Invalid or unrecognized authentication token.',
  };
}

export function jsonResponse(
  data: Record<string, unknown>,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}
