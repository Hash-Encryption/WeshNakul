import { getStoredAdminToken } from './adminService';
import type {
  AlgorithmConfig,
  AlgorithmPublishedVersion,
  AlgorithmDraft,
  AlgorithmPreviewComparison,
  AlgorithmValidationResult,
} from '../types/algorithm';

function getAuthHeaders(): HeadersInit {
  const token = getStoredAdminToken();
  if (!token) throw new Error('Authentication required.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchAlgorithmConfig(): Promise<{
  published: AlgorithmPublishedVersion;
  draft: AlgorithmDraft;
}> {
  const res = await fetch('/api/admin/algorithm/config', {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error((data as { message?: string }).message || 'Failed to fetch algorithm configuration.'),
      { status: res.status }
    );
  }

  return data as { published: AlgorithmPublishedVersion; draft: AlgorithmDraft };
}

export async function saveAlgorithmDraft(
  settings: AlgorithmConfig
): Promise<{ success: boolean; draft: AlgorithmDraft }> {
  const res = await fetch('/api/admin/algorithm/config', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ settings }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error((data as { message?: string }).message || 'Failed to save algorithm draft.'),
      { status: res.status, errors: (data as { errors?: unknown[] }).errors }
    );
  }

  return data as { success: boolean; draft: AlgorithmDraft };
}

export async function validateAlgorithmSettings(
  settings: AlgorithmConfig
): Promise<AlgorithmValidationResult> {
  const res = await fetch('/api/admin/algorithm/validate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ settings }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 422) {
    throw Object.assign(
      new Error((data as { message?: string }).message || 'Validation request failed.'),
      { status: res.status }
    );
  }

  return data as AlgorithmValidationResult;
}

export async function previewAlgorithmSettings(params: {
  settings: AlgorithmConfig;
  city?: string;
  mode?: string;
  category?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  eating_mode?: string;
  preferences?: string[];
}): Promise<AlgorithmPreviewComparison> {
  const res = await fetch('/api/admin/algorithm/preview', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error((data as { message?: string }).message || 'Preview evaluation failed.'),
      { status: res.status, errors: (data as { errors?: unknown[] }).errors }
    );
  }

  return (data as { comparison: AlgorithmPreviewComparison }).comparison;
}

export async function publishAlgorithmSettings(
  settings: AlgorithmConfig,
  reason?: string,
  expectedActiveVersion?: number
): Promise<{
  success: boolean;
  version_number: number;
  published_at: string;
  published_by: string;
  summary: string;
}> {
  const res = await fetch('/api/admin/algorithm/publish', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      settings,
      reason,
      expected_active_version: expectedActiveVersion,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error((data as { message?: string }).message || 'Algorithm publication failed.'),
      { status: res.status, error: (data as { error?: string }).error }
    );
  }

  return data as {
    success: boolean;
    version_number: number;
    published_at: string;
    published_by: string;
    summary: string;
  };
}

export async function fetchAlgorithmVersions(): Promise<AlgorithmPublishedVersion[]> {
  const res = await fetch('/api/admin/algorithm/versions', {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error((data as { message?: string }).message || 'Failed to fetch algorithm versions.'),
      { status: res.status }
    );
  }

  return (data as { versions: AlgorithmPublishedVersion[] }).versions || [];
}

export async function rollbackAlgorithmSettings(
  targetVersion: number,
  reason?: string,
  expectedActiveVersion?: number
): Promise<{
  success: boolean;
  version_number: number;
  rollback_of_version: number;
  published_at: string;
  published_by: string;
  summary: string;
}> {
  const res = await fetch('/api/admin/algorithm/rollback', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      target_version: targetVersion,
      reason,
      expected_active_version: expectedActiveVersion,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error((data as { message?: string }).message || 'Rollback failed.'),
      { status: res.status, error: (data as { error?: string }).error }
    );
  }

  return data as {
    success: boolean;
    version_number: number;
    rollback_of_version: number;
    published_at: string;
    published_by: string;
    summary: string;
  };
}
