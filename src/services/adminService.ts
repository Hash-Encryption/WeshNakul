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

export async function fetchAdminDeepAnalytics(
  filters: import('../types/admin').AdminDeepFilters = {}
): Promise<import('../types/admin').AdminDeepAnalyticsResponse> {
  const token = getStoredAdminToken();
  if (!token) {
    throw new Error('Authentication required.');
  }

  const params = new URLSearchParams();
  if (filters.range) params.set('range', filters.range);
  if (filters.category) params.set('category', filters.category);
  if (filters.district) params.set('district', filters.district);
  if (filters.eating_mode) params.set('eating_mode', filters.eating_mode);
  if (filters.room_mode) params.set('room_mode', filters.room_mode);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset !== undefined) params.set('offset', String(filters.offset));

  const res = await fetch(`/api/admin/deep?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await res.json()) as import('../types/admin').AdminDeepAnalyticsResponse;

  if (res.status === 401 || res.status === 403) {
    setStoredAdminToken(null);
    throw Object.assign(new Error(data.message || 'Access denied.'), { status: res.status });
  }

  if (!res.ok) {
    throw Object.assign(new Error(data.message || 'Failed to fetch deep analytics data.'), { status: res.status });
  }

  return data;
}

export async function downloadAdminExport(
  filters: import('../types/admin').AdminDeepFilters = {}
): Promise<{ filename: string; blob: Blob; isTruncated: boolean }> {
  const token = getStoredAdminToken();
  if (!token) {
    throw new Error('Authentication required.');
  }

  const params = new URLSearchParams();
  if (filters.range) params.set('range', filters.range);
  if (filters.category) params.set('category', filters.category);
  if (filters.district) params.set('district', filters.district);
  if (filters.eating_mode) params.set('eating_mode', filters.eating_mode);
  if (filters.room_mode) params.set('room_mode', filters.room_mode);

  const res = await fetch(`/api/admin/export?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    setStoredAdminToken(null);
    throw Object.assign(new Error('Access denied to export.'), { status: res.status });
  }

  if (!res.ok) {
    throw Object.assign(new Error('Failed to generate CSV export.'), { status: res.status });
  }

  const isTruncated = res.headers.get('X-Truncated') === 'true';
  const disposition = res.headers.get('Content-Disposition') || '';
  let filename = `weshnakul-export-${filters.range || '24h'}.csv`;
  const match = disposition.match(/filename="?([^"]+)"?/);
  if (match && match[1]) {
    filename = match[1];
  }

  const blob = await res.blob();
  return { filename, blob, isTruncated };
}

// -------------------------------------------------------------
// Phase 4: Catalog Controls Service Functions
// -------------------------------------------------------------

export async function fetchCatalogItems(params: {
  search?: string;
  category?: string;
  district?: string;
  status?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<import('../types/admin').CatalogItemsResponse> {
  const token = getStoredAdminToken();
  if (!token) throw new Error('Authentication required.');

  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('q', params.search);
  if (params.category) searchParams.set('category', params.category);
  if (params.district) searchParams.set('district', params.district);
  if (params.status) searchParams.set('status', params.status);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const res = await fetch(`/api/admin/catalog/items?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = (await res.json()) as import('../types/admin').CatalogItemsResponse;
  if (!res.ok) {
    throw Object.assign(new Error(data.message || 'Failed to fetch catalog items.'), { status: res.status });
  }
  return data;
}

export async function fetchCatalogDrafts(status?: string): Promise<import('../types/admin').CatalogDraftsResponse> {
  const token = getStoredAdminToken();
  if (!token) throw new Error('Authentication required.');

  const url = status ? `/api/admin/catalog/drafts?status=${encodeURIComponent(status)}` : '/api/admin/catalog/drafts';
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = (await res.json()) as import('../types/admin').CatalogDraftsResponse;
  if (!res.ok) {
    throw Object.assign(new Error(data.message || 'Failed to fetch catalog drafts.'), { status: res.status });
  }
  return data;
}

export async function saveCatalogDraft(draft: {
  id?: string;
  title: string;
  change_type: string;
  target_entities: import('../types/admin').CatalogDraftItem[];
  reason?: string | null;
  review_deadline?: string | null;
}): Promise<import('../types/admin').CatalogDraftChangeset> {
  const token = getStoredAdminToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/admin/catalog/drafts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(draft),
  });

  const data = (await res.json()) as { success: boolean; draft: import('../types/admin').CatalogDraftChangeset; message?: string };
  if (!res.ok || !data.draft) {
    throw Object.assign(new Error(data.message || 'Failed to save catalog draft.'), { status: res.status });
  }
  return data.draft;
}

export async function discardCatalogDraft(draftId: string): Promise<void> {
  const token = getStoredAdminToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch(`/api/admin/catalog/drafts?id=${encodeURIComponent(draftId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error((data as { message?: string }).message || 'Failed to discard draft.'), { status: res.status });
  }
}

export async function validateCatalogDraft(payload: {
  draft_id?: string;
  title?: string;
  change_type?: string;
  target_entities?: import('../types/admin').CatalogDraftItem[];
  reason?: string;
}): Promise<import('../types/admin').CatalogValidationResponse> {
  const token = getStoredAdminToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/admin/catalog/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as import('../types/admin').CatalogValidationResponse;
  if (!res.ok) {
    throw Object.assign(new Error(data.message || 'Validation request failed.'), { status: res.status });
  }
  return data;
}

export async function publishCatalogChangeset(
  changesetId: string,
  reason?: string
): Promise<{ success: boolean; outcome?: Record<string, unknown>; message?: string }> {
  const token = getStoredAdminToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/admin/catalog/publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      changeset_id: changesetId,
      reason,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error((data as { message?: string }).message || 'Publication failed.'), {
      status: res.status,
      detail: (data as { detail?: string }).detail,
    });
  }
  return data as { success: boolean; outcome?: Record<string, unknown>; message?: string };
}

export async function applyEmergencyCatalogAction(
  action: 'hide_brand' | 'hide_branch' | 'branch_unavailable' | 'restore_brand' | 'restore_branch',
  entityId: string,
  reason: string,
  deadlineHours = 48
): Promise<{ success: boolean; message: string }> {
  const token = getStoredAdminToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/admin/catalog/emergency', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action,
      entity_id: entityId,
      reason,
      deadline_hours: deadlineHours,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error((data as { message?: string }).message || 'Emergency action failed.'), { status: res.status });
  }
  return data as { success: boolean; message: string };
}

export async function createRollbackDraft(
  historyId: string
): Promise<{ success: boolean; draft_id: string; title: string }> {
  const token = getStoredAdminToken();
  if (!token) throw new Error('Authentication required.');

  const res = await fetch('/api/admin/catalog/rollback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ history_id: historyId }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error((data as { message?: string }).message || 'Failed to create rollback draft.'), { status: res.status });
  }
  return data as { success: boolean; draft_id: string; title: string };
}

export async function downloadCatalogCsv(params: {
  category?: string;
  district?: string;
  status?: string;
} = {}): Promise<{ filename: string; blob: Blob }> {
  const token = getStoredAdminToken();
  if (!token) throw new Error('Authentication required.');

  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set('category', params.category);
  if (params.district) searchParams.set('district', params.district);
  if (params.status) searchParams.set('status', params.status);

  const res = await fetch(`/api/admin/catalog/export?${searchParams.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw Object.assign(new Error('Failed to generate catalog CSV export.'), { status: res.status });
  }

  const disposition = res.headers.get('Content-Disposition') || '';
  let filename = 'weshnakul-catalog-export.csv';
  const match = disposition.match(/filename="?([^"]+)"?/);
  if (match && match[1]) {
    filename = match[1];
  }

  const blob = await res.blob();
  return { filename, blob };
}


