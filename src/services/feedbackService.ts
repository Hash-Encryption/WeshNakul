import type {
  CreateFeedbackPayload,
  FeedbackDetailResponse,
  FeedbackListResponse,
  UpdateFeedbackStatusPayload,
  UpdateFeedbackStatusResponse,
} from '../types/feedback';
import { getStoredAdminToken } from './adminService';

/**
 * Public submission endpoint (/api/feedback).
 */
export async function submitFeedback(payload: CreateFeedbackPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as { success?: boolean; id?: string; error?: string; message?: string };
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.message || data.error || 'Failed to submit feedback.',
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (err) {
    console.error('submitFeedback network error', err);
    return {
      success: false,
      error: 'Network connection issue. Please check your connection and try again.',
    };
  }
}

/**
 * Admin: Fetch list of feedback submissions (/api/admin/feedback).
 */
export async function fetchAdminFeedbackList(params: {
  status?: string;
  type?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<FeedbackListResponse> {
  const token = getStoredAdminToken();
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.type && params.type !== 'all') searchParams.set('type', params.type);
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));

  const query = searchParams.toString();
  const url = `/api/admin/feedback${query ? `?${query}` : ''}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const errData = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(errData.message || errData.error || `HTTP ${res.status}: Failed to fetch feedback list.`);
  }

  return (await res.json()) as FeedbackListResponse;
}

/**
 * Admin: Fetch full feedback detail with audit logs (/api/admin/feedback/:id).
 */
export async function fetchAdminFeedbackDetail(id: string): Promise<FeedbackDetailResponse> {
  const token = getStoredAdminToken();
  const res = await fetch(`/api/admin/feedback/${encodeURIComponent(id)}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const errData = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(errData.message || errData.error || `HTTP ${res.status}: Failed to fetch feedback detail.`);
  }

  return (await res.json()) as FeedbackDetailResponse;
}

/**
 * Admin: Update feedback status and record audit trail (/api/admin/feedback/:id/status).
 */
export async function updateAdminFeedbackStatus(
  id: string,
  payload: UpdateFeedbackStatusPayload
): Promise<UpdateFeedbackStatusResponse> {
  const token = getStoredAdminToken();
  const res = await fetch(`/api/admin/feedback/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(errData.message || errData.error || `HTTP ${res.status}: Failed to update feedback status.`);
  }

  return (await res.json()) as UpdateFeedbackStatusResponse;
}
