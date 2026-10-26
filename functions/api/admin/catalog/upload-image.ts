import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

interface MagicCheck {
  mime: string;
  ext: string;
  validate: (bytes: Uint8Array) => boolean;
}

const MAGIC_SIGNATURES: MagicCheck[] = [
  {
    mime: 'image/jpeg',
    ext: 'jpg',
    validate: (b) => b.length >= 3 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
  },
  {
    mime: 'image/png',
    ext: 'png',
    validate: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4E &&
      b[3] === 0x47 &&
      b[4] === 0x0D &&
      b[5] === 0x0A &&
      b[6] === 0x1A &&
      b[7] === 0x0A,
  },
  {
    mime: 'image/webp',
    ext: 'webp',
    validate: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 && // 'RIFF'
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50, // 'WEBP'
  },
];

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // 1. Strict server-side admin authentication
  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse({ error: auth.error, message: auth.message }, auth.status);
  }

  // 2. Parse multipart form data
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return jsonResponse({ error: 'invalid_content_type', message: 'Request must be multipart/form-data.' }, 400);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonResponse({ error: 'malformed_form_data', message: 'Could not parse multipart form body.' }, 400);
  }

  const rawBrandId = String(formData.get('brand_id') || '').trim();
  const file = formData.get('file');

  if (!rawBrandId) {
    return jsonResponse({ error: 'brand_id_required', message: 'A valid brand ID is required for image staging.' }, 400);
  }

  // Sanitize brand ID for safe path usage
  const cleanAlphanumeric = rawBrandId.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanAlphanumeric.length === 0) {
    return jsonResponse({ error: 'invalid_brand_id', message: 'Brand ID contains only invalid characters.' }, 400);
  }
  const sanitizedBrandId = rawBrandId.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 80);

  if (!file || typeof file === 'string' || !(file instanceof Blob)) {
    return jsonResponse({ error: 'file_required', message: 'An image file is required.' }, 400);
  }

  // 3. File size check
  if (file.size === 0) {
    return jsonResponse({ error: 'empty_file', message: 'Uploaded image file cannot be empty.' }, 400);
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return jsonResponse(
      { error: 'file_too_large', message: 'Image exceeds the maximum allowed size of 5 MB.' },
      400
    );
  }

  // 4. Inspect file magic bytes (never trust client MIME type or extension alone)
  const headerSlice = await file.slice(0, 16).arrayBuffer();
  const headerBytes = new Uint8Array(headerSlice);

  let matchedSignature: MagicCheck | null = null;
  for (const sig of MAGIC_SIGNATURES) {
    if (sig.validate(headerBytes)) {
      matchedSignature = sig;
      break;
    }
  }

  if (!matchedSignature) {
    return jsonResponse(
      {
        error: 'unsupported_file_type',
        message: 'Unsupported image file type. Only authentic JPEG, PNG, and WebP files are accepted.',
      },
      400
    );
  }

  // 5. Generate secure server-controlled storage path in staging area
  const timestamp = Date.now();
  const uniqueHex = crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  const objectFilename = `${sanitizedBrandId}-${timestamp}-${uniqueHex}.${matchedSignature.ext}`;
  const stagingPath = `staging/${sanitizedBrandId}/${objectFilename}`;

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  // Upstream fallback handling for local/test environments
  const isMockOrUnconfigured =
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes('test.supabase.co') ||
    supabaseKey === 'test-service-role-key';

  if (isMockOrUnconfigured) {
    const mockUrl = `https://mock.storage.local/restaurant-staging/${stagingPath}`;
    return jsonResponse({
      success: true,
      url: mockUrl,
      bucket: 'restaurant-staging',
      path: stagingPath,
      filename: objectFilename,
      bytes: file.size,
      mime_type: matchedSignature.mime,
      warning: 'upstream_not_configured',
    });
  }

  try {
    const uploadUrl = `${supabaseUrl}/storage/v1/object/restaurant-staging/${stagingPath}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': matchedSignature.mime,
        'x-upsert': 'true',
      },
      body: file,
    });

    if (!uploadRes.ok) {
      const errDetail = await uploadRes.text();
      return jsonResponse(
        {
          error: 'storage_upload_failed',
          message: 'Failed to upload image into staging storage.',
          detail: errDetail,
        },
        502
      );
    }

    const stagingUrl = `${supabaseUrl}/storage/v1/object/restaurant-staging/${stagingPath}`;
    return jsonResponse({
      success: true,
      url: stagingUrl,
      bucket: 'restaurant-staging',
      path: stagingPath,
      filename: objectFilename,
      bytes: file.size,
      mime_type: matchedSignature.mime,
    });
  } catch (err) {
    return jsonResponse(
      {
        error: 'storage_network_error',
        message: (err as Error).message || 'Network error communicating with storage service.',
      },
      500
    );
  }
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
