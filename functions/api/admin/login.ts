import {
  type Env,
  createAdminToken,
  getAdminSecret,
  jsonResponse,
} from './_auth.ts';

interface LoginRequestBody {
  email?: string;
  username?: string;
  password?: string;
}

const LOGIN_RATE_LIMIT_WINDOW_MS = 60000; // 60 seconds
const MAX_LOGIN_ATTEMPTS_PER_WINDOW = 5; // 5 attempts per minute per IP

interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const loginRateLimitMap = new Map<string, RateLimitRecord>();

function pruneLoginRateLimitMap(now: number): void {
  if (loginRateLimitMap.size > 1000) {
    for (const [ip, record] of loginRateLimitMap.entries()) {
      if (now > record.resetAt) {
        loginRateLimitMap.delete(ip);
      }
    }
  }
}

export function checkLoginRateLimit(clientIp: string, now = Date.now()): { allowed: boolean; retryAfter: number } {
  pruneLoginRateLimitMap(now);

  const existing = loginRateLimitMap.get(clientIp);
  if (!existing || now > existing.resetAt) {
    loginRateLimitMap.set(clientIp, {
      count: 1,
      resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count >= MAX_LOGIN_ATTEMPTS_PER_WINDOW) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { allowed: false, retryAfter };
  }

  existing.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export function getTrustedClientIp(request: Request): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp && cfIp.trim().length > 0) {
    return cfIp.trim();
  }
  return '127.0.0.1';
}

export function _resetLoginRateLimitsForTesting(): void {
  loginRateLimitMap.clear();
}

export async function handleAdminLogin(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse(
      { error: 'method_not_allowed', message: 'Only POST requests are supported.' },
      405,
      { Allow: 'POST' }
    );
  }

  // 1. Enforce server-side rate limiting on login attempts
  const clientIp = getTrustedClientIp(request);

  if (env.RATE_LIMITER && typeof env.RATE_LIMITER.limit === 'function') {
    try {
      const rlResult = await env.RATE_LIMITER.limit({ key: `admin_login_${clientIp}` });
      if (!rlResult.success) {
        return jsonResponse(
          {
            error: 'rate_limit_exceeded',
            message: 'Too many login attempts. Please try again later.',
          },
          429,
          { 'Retry-After': '60' }
        );
      }
    } catch {
      // Fall through to in-memory rate limiter
    }
  }

  const memoryRateLimit = checkLoginRateLimit(clientIp);
  if (!memoryRateLimit.allowed) {
    return jsonResponse(
      {
        error: 'rate_limit_exceeded',
        message: `Too many login attempts. Please try again in ${memoryRateLimit.retryAfter} seconds.`,
      },
      429,
      { 'Retry-After': String(memoryRateLimit.retryAfter) }
    );
  }

  let body: LoginRequestBody;
  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return jsonResponse({ error: 'malformed_json', message: 'Request body must be valid JSON.' }, 400);
  }

  const password = (body.password || '').trim();
  const email = (body.email || body.username || '').trim().toLowerCase();

  if (!password) {
    return jsonResponse({ error: 'missing_password', message: 'Password is required.' }, 400);
  }

  let secret: string;
  try {
    secret = getAdminSecret(env);
  } catch {
    return jsonResponse(
      {
        error: 'server_configuration_error',
        message: 'Server authentication secret is not configured in environment.',
      },
      500
    );
  }

  // 1. Direct Edge Server-Side Admin Authentication (via environment variables)
  const configuredPassword = env.ADMIN_PASSWORD ? String(env.ADMIN_PASSWORD).trim() : '';
  const configuredEmail = env.ADMIN_EMAIL ? String(env.ADMIN_EMAIL).trim().toLowerCase() : '';
  const configuredUsername = env.ADMIN_USERNAME ? String(env.ADMIN_USERNAME).trim().toLowerCase() : '';

  if (!configuredPassword) {
    console.log('[AdminLogin] Direct admin evaluation bypassed: env.ADMIN_PASSWORD is missing or empty.');
  }

  if (configuredPassword) {
    const passwordMatches = password === configuredPassword;
    const identifierMatches = Boolean(
      (!configuredEmail && !configuredUsername) ||
      (configuredEmail && email === configuredEmail) ||
      (configuredUsername && email === configuredUsername)
    );

    console.log('[AdminLogin] Direct admin evaluation:', {
      hasEmailInput: Boolean(email),
      emailLength: email.length,
      hasConfiguredEmail: Boolean(configuredEmail),
      hasConfiguredUsername: Boolean(configuredUsername),
      passwordMatches,
      identifierMatches,
    });

    if (passwordMatches && identifierMatches) {
      const userEmail = email || configuredEmail || 'admin@weshnakul.com';
      const token = await createAdminToken(
        {
          sub: 'admin-root',
          email: userEmail,
          role: 'admin',
        },
        secret
      );

      return jsonResponse({
        success: true,
        token,
        user: {
          id: 'admin-root',
          email: userEmail,
          role: 'admin',
        },
      });
    }
  }

  // 2. Supabase Auth Integration (if configured)
  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseAnonKey = (env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (supabaseUrl && supabaseAnonKey && email) {
    try {
      const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
        },
        body: JSON.stringify({ email, password }),
      });

      if (authRes.ok) {
        const authData = (await authRes.json()) as {
          access_token: string;
          user: {
            id: string;
            email?: string;
            app_metadata?: { role?: string; is_admin?: boolean };
            user_metadata?: { role?: string; is_admin?: boolean };
          };
        };

        const user = authData.user;
        const userEmail = (user.email || '').toLowerCase().trim();
        const configuredAdminEmails = (env.ADMIN_EMAILS || '')
          .split(',')
          .map((e) => e.toLowerCase().trim())
          .filter(Boolean);

        const isAdmin =
          user.app_metadata?.role === 'admin' ||
          user.user_metadata?.role === 'admin' ||
          user.app_metadata?.is_admin === true ||
          user.user_metadata?.is_admin === true ||
          (configuredEmail && userEmail === configuredEmail) ||
          (configuredAdminEmails.length > 0 && configuredAdminEmails.includes(userEmail));

        if (!isAdmin) {
          // User authenticated with Supabase credentials, but has no admin privileges!
          return jsonResponse(
            {
              error: 'forbidden',
              message: 'Authentication successful, but this account is not authorized as an administrator.',
            },
            403
          );
        }

        // Generate edge admin token for this authorized admin
        const token = await createAdminToken(
          {
            sub: user.id,
            email: userEmail || 'admin@weshnakul.com',
            role: 'admin',
          },
          secret
        );

        return jsonResponse({
          success: true,
          token,
          user: {
            id: user.id,
            email: userEmail || 'admin@weshnakul.com',
            role: 'admin',
          },
        });
      }
    } catch {
      // Fall through to invalid credentials
    }
  }

  // 3. Fallback: Failed authentication
  return jsonResponse(
    {
      error: 'invalid_credentials',
      message: 'Invalid administrative email/username or password.',
    },
    401
  );
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  return handleAdminLogin(context.request, context.env || {});
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
