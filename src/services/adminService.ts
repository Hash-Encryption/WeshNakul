import type {
  AdminAnalyticsResponse,
  AdminAuthResponse,
  AdminUser,
  TimeRangeFilter,
} from '../types/admin';

const ADMIN_TOKEN_KEY = 'wsh_admin_token';

export function getStoredAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch (e) {
    console.error('Failed to set admin token in storage', e);
  }
}

export async function adminLogin(
  password: string,
  email?: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email?.trim(),
        password: password.trim(),
      }),
    });

    const data = (await res.json()) as AdminAuthResponse;

    if (!res.ok || !data.success || !data.token) {
      return {
        success: false,
        error: data.message || data.error || 'Authentication failed.',
      };
    }

    setStoredAdminToken(data.token);
    return {
      success: true,
      user: data.user,
    };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message || 'Network error connecting to admin service.',
    };
  }
}

export async function adminLogout(): Promise<void> {
  try {
    const token = getStoredAdminToken();
    if (token) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => {});
    }
  } finally {
    setStoredAdminToken(null);
  }
}

export async function verifyAdminSession(): Promise<AdminUser | null> {
  const token = getStoredAdminToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/admin/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      setStoredAdminToken(null);
      return null;
    }

    const data = (await res.json()) as { authenticated: boolean; user: AdminUser };
    if (data.authenticated && data.user) {
      return data.user;
    }

    setStoredAdminToken(null);
    return null;
  } catch {
    return null;
  }
}

export async function fetchAdminAnalytics(
  range: TimeRangeFilter = '24h'
): Promise<AdminAnalyticsResponse> {
  const token = getStoredAdminToken();
  if (!token) {
    throw new Error('Authentication required.');
  }

  const res = await fetch(`/api/admin/analytics?range=${encodeURIComponent(range)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await res.json()) as AdminAnalyticsResponse;

  if (res.status === 401 || res.status === 403) {
    setStoredAdminToken(null);
    throw Object.assign(new Error(data.message || 'Access denied.'), { status: res.status });
  }

  if (!res.ok) {
    throw Object.assign(new Error(data.message || 'Failed to fetch analytics data.'), { status: res.status });
  }

  return data;
}
