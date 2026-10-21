import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';
import {
  validateBrandFields,
  validateBranchFields,
  evaluateReadiness,
} from './_validation.ts';

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

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

  const action = String(body.action || '');
  const validActions = ['hide_brand', 'hide_branch', 'branch_unavailable', 'restore_brand', 'restore_branch'];
  if (!validActions.includes(action)) {
    return jsonResponse({ error: 'invalid_action', message: `Unsupported emergency action: '${action}'.` }, 400);
  }

  const entityType = action.endsWith('_brand') ? 'restaurant' : 'branch';
  const entityId = typeof body.entity_id === 'string' ? body.entity_id.trim() : '';
  if (!entityId) {
    return jsonResponse({ error: 'entity_id_required', message: 'Target entity ID is required.' }, 400);
  }

  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  if (!reason || reason.length < 3) {
    return jsonResponse(
      { error: 'reason_required', message: 'A descriptive reason (at least 3 characters) is required for emergency actions.' },
      400
    );
  }

  // Review deadline is required for emergency hiding / unavailability
  let reviewDeadline: string | null = null;
  if (!action.startsWith('restore_')) {
    const deadlineHours = Number(body.deadline_hours || 48);
    const d = new Date(Date.now() + Math.max(1, deadlineHours) * 3600 * 1000);
    reviewDeadline = d.toISOString();
  }

  // Construct target change
  let changes: Record<string, unknown> = {};
  let title = '';

  if (action === 'hide_brand') {
    title = `Emergency Hide Brand: ${entityId}`;
    changes = {
      research_use: 'manual_review_only',
      manual_review_required: true,
      manual_review_reasons: [reason],
    };
  } else if (action === 'hide_branch' || action === 'branch_unavailable') {
    title = `Emergency ${action === 'hide_branch' ? 'Hide Branch' : 'Set Branch Unavailable'}: ${entityId}`;
    changes = {
      branch_status: 'temporarily_closed',
    };
  } else if (action === 'restore_brand') {
    title = `Restore Brand: ${entityId}`;
    changes = {
      research_use: 'production_ready',
      manual_review_required: false,
    };
  } else if (action === 'restore_branch') {
    title = `Restore Branch: ${entityId}`;
    changes = {
      branch_status: 'open',
    };
  }

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({
      success: true,
      action,
      entity_id: entityId,
      entity_type: entityType,
      reason,
      review_deadline: reviewDeadline,
      warning: 'upstream_not_configured',
    });
  }

  try {
    // 1. Fetch current entity updated_at and record data for validation and concurrency check
    const table = entityType === 'restaurant' ? 'restaurants' : 'restaurant_branches';
    const fetchRes = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(entityId)}&select=*`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });

    let baseVersion: string | null = null;
    let currentRecord: Record<string, unknown> | null = null;
    if (fetchRes.ok) {
      const rows = (await fetchRes.json()) as Array<Record<string, unknown>>;
      if (rows.length > 0) {
        currentRecord = rows[0];
        if (currentRecord.updated_at) {
          baseVersion = String(currentRecord.updated_at);
        }
      }
    }

    if (!currentRecord) {
      return jsonResponse({ error: 'entity_not_found', message: `Target ${entityType} '${entityId}' does not exist.` }, 404);
    }

    // 2. Authoritative restoration readiness validation
    if (action === 'restore_brand') {
      let previousResearchUse: string | null = null;
      try {
        const histRes = await fetch(
          `${supabaseUrl}/rest/v1/catalog_change_history?entity_id=eq.${encodeURIComponent(entityId)}&order=effective_at.desc&limit=2`,
          { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
        );
        if (histRes.ok) {
          const histRows = (await histRes.json()) as Array<{ previous_state?: Record<string, unknown>; new_state?: Record<string, unknown> }>;
          for (const h of histRows) {
            const state = h.previous_state;
            if (state && state.research_use && state.research_use !== 'manual_review_only') {
              previousResearchUse = String(state.research_use);
              break;
            }
          }
        }
      } catch {
        // Fallback
      }

      const targetResearchUse = previousResearchUse === 'usable_with_caution' ? 'usable_with_caution' : 'production_ready';
      changes = {
        research_use: targetResearchUse,
        manual_review_required: false,
      };

      const projected = { ...currentRecord, ...changes };
      const valErrors = validateBrandFields(entityId, projected);
      if (valErrors.some((e) => e.severity === 'error')) {
        return jsonResponse(
          {
            error: 'restoration_readiness_blocked',
            message: 'Cannot restore brand: authoritative validation failed on proposed restored state.',
            errors: valErrors,
          },
          422
        );
      }
    } else if (action === 'restore_branch') {
      changes = {
        branch_status: 'open',
      };
      const projected = { ...currentRecord, ...changes };
      const valErrors = validateBranchFields(entityId, projected, currentRecord);
      if (valErrors.some((e) => e.severity === 'error')) {
        return jsonResponse(
          {
            error: 'restoration_readiness_blocked',
            message: 'Cannot restore branch: authoritative validation failed on proposed restored state.',
            errors: valErrors,
          },
          422
        );
      }

      let parentBrand: Record<string, unknown> | null = null;
      const brandId = String(currentRecord.restaurant_id || '');
      if (brandId) {
        try {
          const bRes = await fetch(`${supabaseUrl}/rest/v1/restaurants?id=eq.${encodeURIComponent(brandId)}&select=*`, {
            headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
          });
          if (bRes.ok) {
            const bRows = (await bRes.json()) as Array<Record<string, unknown>>;
            if (bRows.length > 0) parentBrand = bRows[0];
          }
        } catch {
          // Fallback
        }
      }

      const readiness = evaluateReadiness(parentBrand || { operating_status: 'open', research_use: 'production_ready' }, projected);
      if (!readiness.is_recommendation_eligible) {
        return jsonResponse(
          {
            error: 'restoration_readiness_blocked',
            message: 'Cannot restore branch: recommendation eligibility requirements failed.',
            blockers: readiness.blockers,
          },
          422
        );
      }
    }

    // 3. Insert emergency draft change set
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/catalog_draft_changesets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        title,
        status: 'draft',
        change_type: action.startsWith('restore_') ? 'restore' : 'emergency',
        target_entities: [
          {
            entity_type: entityType,
            entity_id: entityId,
            base_version: baseVersion,
            changes,
          },
        ],
        reason,
        review_deadline: reviewDeadline,
        created_by: auth.user.email || 'admin',
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      return jsonResponse({ error: 'emergency_draft_failed', message: 'Failed to create emergency change set.', detail: errText }, 502);
    }

    const createdRows = (await insertRes.json()) as Array<{ id: string }>;
    const changesetId = createdRows[0].id;

    // 3. Atomically publish the emergency change set via RPC
    const pubRes = await fetch(`${supabaseUrl}/rest/v1/rpc/publish_catalog_changeset`, {
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

    if (!pubRes.ok) {
      const pubErr = await pubRes.text();
      return jsonResponse({ error: 'emergency_publish_failed', message: 'Failed to publish emergency action.', detail: pubErr }, 502);
    }

    const outcome = (await pubRes.json()) as Record<string, unknown>;

    return jsonResponse({
      success: true,
      action,
      entity_id: entityId,
      entity_type: entityType,
      reason,
      review_deadline: reviewDeadline,
      changeset_id: changesetId,
      outcome,
      message: action.startsWith('restore_')
        ? 'Entity restored to recommendations.'
        : 'Emergency control applied immediately. Recommendation eligibility updated.',
    });
  } catch (err) {
    return jsonResponse({ error: 'internal_error', message: (err as Error).message }, 500);
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
