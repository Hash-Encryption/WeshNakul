import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // 1. Strict server-side admin authentication & authorization
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

  const changesetId = typeof body.changeset_id === 'string' ? body.changeset_id.trim() : null;
  if (!changesetId) {
    return jsonResponse({ error: 'changeset_id_required', message: 'Change set ID is required for publication.' }, 400);
  }

  const reason = typeof body.reason === 'string' ? body.reason.trim() : null;

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  const isMockOrUnconfigured =
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes('test.supabase.co') ||
    supabaseKey === 'test-service-role-key';

  if (isMockOrUnconfigured) {
    return jsonResponse({
      success: true,
      changeset_id: changesetId,
      published_entities_count: 1,
      published_at: new Date().toISOString(),
      published_by: auth.user.email,
      reason,
      warning: 'upstream_not_configured',
    });
  }

  try {
    // 2. Inspect changeset for any staged images in private storage needing promotion
    const draftRes = await fetch(
      `${supabaseUrl}/rest/v1/catalog_draft_changesets?id=eq.${encodeURIComponent(changesetId)}&select=id,status,target_entities`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (draftRes.ok) {
      const drafts = (await draftRes.json()) as Array<{
        id: string;
        status: string;
        target_entities: Array<{
          entity_type: string;
          entity_id: string;
          action?: string;
          changes?: Record<string, unknown>;
        }>;
      }>;

      if (drafts && drafts.length > 0 && Array.isArray(drafts[0].target_entities)) {
        let hasPromotedImages = false;
        const targetEntities = drafts[0].target_entities;

        for (const item of targetEntities) {
          if (item.entity_type === 'restaurant' && item.changes && typeof item.changes.image_url === 'string') {
            const rawImg = item.changes.image_url;
            let sourceKey: string | null = null;

            if (rawImg.includes('/restaurant-staging/')) {
              sourceKey = rawImg.split('/restaurant-staging/')[1].split('?')[0];
            } else if (rawImg.startsWith('staging/')) {
              sourceKey = rawImg;
            }

            if (sourceKey) {
              const filename = sourceKey.split('/').pop() || `${item.entity_id}.jpg`;
              const destinationKey = `published/${item.entity_id}/${filename}`;

              // Atomic promote/copy from private staging bucket to public images bucket
              const copyRes = await fetch(`${supabaseUrl}/storage/v1/object/copy`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  apikey: supabaseKey,
                  Authorization: `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                  bucketId: 'restaurant-staging',
                  sourceKey,
                  destinationBucket: 'restaurant-images',
                  destinationKey,
                }),
              });

              if (!copyRes.ok) {
                const copyErr = await copyRes.text();
                return jsonResponse(
                  {
                    error: 'storage_promotion_failed',
                    message: 'Failed to promote staging image to public storage before catalog publication.',
                    detail: copyErr,
                  },
                  502
                );
              }

              // Update target entity image_url to authoritative public storage location
              item.changes.image_url = `${supabaseUrl}/storage/v1/object/public/restaurant-images/${destinationKey}`;
              hasPromotedImages = true;
            }
          }
        }

        if (hasPromotedImages) {
          const patchRes = await fetch(
            `${supabaseUrl}/rest/v1/catalog_draft_changesets?id=eq.${encodeURIComponent(changesetId)}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
                Prefer: 'return=minimal',
              },
              body: JSON.stringify({ target_entities: targetEntities }),
            }
          );

          if (!patchRes.ok) {
            return jsonResponse(
              {
                error: 'storage_promotion_update_failed',
                message: 'Failed to persist promoted image URLs to change set before publication.',
                detail: await patchRes.text(),
              },
              502
            );
          }
        }
      }
    }

    // 3. Invoke authoritative atomic publication RPC
    const rpcUrl = `${supabaseUrl}/rest/v1/rpc/publish_catalog_changeset`;
    const rpcRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        p_changeset_id: changesetId,
        p_admin_id: auth.user.email || 'admin',
        p_reason: reason,
      }),
    });

    if (!rpcRes.ok) {
      const errText = await rpcRes.text();
      let errJson: Record<string, unknown> = {};
      try {
        errJson = JSON.parse(errText);
      } catch {
        // Raw text
      }

      const msg = String(errJson.message || errJson.details || errText || 'Publication failed.');

      // Check specific error codes
      if (msg.includes('WSH_STALE_DRAFT_CONFLICT')) {
        return jsonResponse(
          {
            error: 'stale_draft_conflict',
            message: 'Live catalog data was updated after this draft was created. Reconcile with latest values before publishing.',
            detail: msg,
          },
          409
        );
      }

      if (msg.includes('WSH_BRANCH_READINESS_FAILED')) {
        return jsonResponse(
          {
            error: 'branch_readiness_failed',
            message: 'Branch fails minimum production-readiness constraints (address or canonical district missing).',
            detail: msg,
          },
          422
        );
      }

      if (msg.includes('WSH_REASON_REQUIRED')) {
        return jsonResponse(
          {
            error: 'reason_required',
            message: 'A non-empty reason is strictly required to authorize sensitive publication.',
            detail: msg,
          },
          422
        );
      }

      return jsonResponse(
        {
          error: 'publication_failed',
          message: 'Transactional publication aborted. No partial changes were applied.',
          detail: msg,
        },
        502
      );
    }

    const outcome = (await rpcRes.json()) as Record<string, unknown>;
    return jsonResponse({
      success: true,
      outcome,
      message: 'Change set published atomically to live catalog and audited.',
    });
  } catch (err) {
    return jsonResponse(
      {
        error: 'internal_error',
        message: (err as Error).message || 'Server error during publication.',
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
