import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';
import {
  validateBrandFields,
  validateBranchFields,
  evaluateReadiness,
  computeFieldDiffs,
  isValidIsoTimestamp,
  type ValidationError,
  type EntityDiff,
  type ReadinessEvaluation,
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

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  // If draft_id is given, load from database; otherwise use target_entities from body
  const draftId = typeof body.draft_id === 'string' ? body.draft_id.trim() : null;
  let targetEntities = Array.isArray(body.target_entities) ? body.target_entities : [];
  let changeType = String(body.change_type || 'edit');
  let draftTitle = String(body.title || 'Validation Preview');
  let reason = typeof body.reason === 'string' ? body.reason.trim() : '';

  if (draftId && supabaseUrl && supabaseKey) {
    try {
      const draftRes = await fetch(
        `${supabaseUrl}/rest/v1/catalog_draft_changesets?id=eq.${encodeURIComponent(draftId)}`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      );
      if (draftRes.ok) {
        const rows = (await draftRes.json()) as Array<Record<string, unknown>>;
        if (rows.length > 0) {
          const d = rows[0];
          targetEntities = Array.isArray(d.target_entities) ? d.target_entities : [];
          changeType = String(d.change_type || changeType);
          draftTitle = String(d.title || draftTitle);
          reason = typeof d.reason === 'string' ? d.reason : reason;
        }
      }
    } catch {
      // Continue with provided targets
    }
  }

  if (targetEntities.length === 0) {
    return jsonResponse({ error: 'validation_error', message: 'No target entities to validate.' }, 400);
  }

  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const diffs: EntityDiff[] = [];
  const concurrencyConflicts: Array<{
    entity_type: string;
    entity_id: string;
    base_version: string;
    current_version: string;
  }> = [];
  const readinessImpact: Array<{
    entity_id: string;
    entity_type: string;
    before: ReadinessEvaluation | null;
    after: ReadinessEvaluation;
  }> = [];

  // Sensitive action reason validation
  if (['emergency', 'rollback', 'restore'].includes(changeType) && (!reason || reason.trim().length < 3)) {
    errors.push({
      entity_type: 'restaurant',
      entity_id: 'changeset',
      field: 'reason',
      code: 'REASON_REQUIRED',
      message: `A clear reason (at least 3 characters) is strictly required for ${changeType} operations.`,
      severity: 'error',
    });
  }

  // --- Bulk pre-fetch: replace per-entity N+1 fetches with 3 batched queries ---
  // Collect entity IDs by type before the validation loop.
  const restaurantIds: string[] = [];
  const branchIds: string[] = [];
  for (const item of targetEntities) {
    const id = String(item.entity_id || '');
    if (!id) continue;
    if (String(item.entity_type || '') === 'restaurant') restaurantIds.push(id);
    else if (String(item.entity_type || '') === 'branch') branchIds.push(id);
  }

  // Maps populated by bulk fetches; used in the validation loop below.
  const restaurantMap = new Map<string, Record<string, unknown>>();
  const branchMap = new Map<string, Record<string, unknown>>();
  const parentBrandMap = new Map<string, Record<string, unknown>>();

  if (supabaseUrl && supabaseKey) {
    const dbHeaders = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };

    // Query 1: bulk-fetch all restaurant-type target entities.
    if (restaurantIds.length > 0) {
      try {
        const ids = restaurantIds.map(encodeURIComponent).join(',');
        const rRes = await fetch(
          `${supabaseUrl}/rest/v1/restaurants?id=in.(${ids})`,
          { headers: dbHeaders }
        );
        if (rRes.ok) {
          const rows = (await rRes.json()) as Array<Record<string, unknown>>;
          for (const row of rows) restaurantMap.set(row.id as string, row);
        }
      } catch {
        // Fallback to null currentRecord for these entities
      }
    }

    // Query 2: bulk-fetch all branch-type target entities.
    if (branchIds.length > 0) {
      try {
        const ids = branchIds.map(encodeURIComponent).join(',');
        const bRes = await fetch(
          `${supabaseUrl}/rest/v1/restaurant_branches?id=in.(${ids})`,
          { headers: dbHeaders }
        );
        if (bRes.ok) {
          const rows = (await bRes.json()) as Array<Record<string, unknown>>;
          for (const row of rows) branchMap.set(row.id as string, row);
        }
      } catch {
        // Fallback to null currentRecord for branch entities
      }
    }

    // Query 3: bulk-fetch parent brands for all fetched branches (distinct restaurant_ids only).
    if (branchMap.size > 0) {
      const parentIds = [...new Set(
        [...branchMap.values()]
          .map((b) => b.restaurant_id as string)
          .filter(Boolean)
      )];
      if (parentIds.length > 0) {
        try {
          const ids = parentIds.map(encodeURIComponent).join(',');
          const pRes = await fetch(
            `${supabaseUrl}/rest/v1/restaurants?id=in.(${ids})`,
            { headers: dbHeaders }
          );
          if (pRes.ok) {
            const rows = (await pRes.json()) as Array<Record<string, unknown>>;
            for (const row of rows) parentBrandMap.set(row.id as string, row);
          }
        } catch {
          // Fallback to null parentBrand for branch entities
        }
      }
    }
  }
  // --- End bulk pre-fetch ---

  // Inspect each target entity
  for (const item of targetEntities) {
    const entityType = String(item.entity_type || '');
    const entityId = String(item.entity_id || '');
    const baseVersion = item.base_version ? String(item.base_version) : null;
    const changes = (item.changes as Record<string, unknown>) || {};
    const isNew = item.action === 'create';

    // Validate top-level target keys
    for (const key of Object.keys(item)) {
      if (!['entity_type', 'entity_id', 'action', 'base_version', 'changes'].includes(key)) {
        errors.push({
          entity_type: (entityType === 'branch' ? 'branch' : 'restaurant'),
          entity_id: entityId,
          field: key,
          code: 'UNSUPPORTED_TARGET_KEY',
          message: `Key '${key}' is not allowed on target entity.`,
          severity: 'error',
        });
      }
    }

    // Validate base_version timestamp format if provided
    if (item.base_version !== undefined && item.base_version !== null) {
      if (!isValidIsoTimestamp(item.base_version)) {
        errors.push({
          entity_type: (entityType === 'branch' ? 'branch' : 'restaurant'),
          entity_id: entityId,
          field: 'base_version',
          code: 'INVALID_TIMESTAMP',
          message: 'Target base_version must be an ISO 8601 timestamp with explicit timezone.',
          severity: 'error',
        });
      }
    }

    // Resolve current record and parent brand from pre-fetched Maps (zero extra fetches).
    let currentRecord: Record<string, unknown> | null = null;
    let parentBrand: Record<string, unknown> | null = null;

    if (entityType === 'restaurant') {
      currentRecord = restaurantMap.get(entityId) ?? null;
    } else if (entityType === 'branch') {
      currentRecord = branchMap.get(entityId) ?? null;
      if (currentRecord) {
        const restId = currentRecord.restaurant_id as string;
        if (restId) parentBrand = parentBrandMap.get(restId) ?? null;
      }
    }

    // Check concurrency
    if (currentRecord && baseVersion) {
      const currentUpdated = currentRecord.updated_at ? new Date(String(currentRecord.updated_at)).getTime() : 0;
      const baseUpdated = new Date(baseVersion).getTime();
      if (currentUpdated > baseUpdated) {
        concurrencyConflicts.push({
          entity_type: entityType,
          entity_id: entityId,
          base_version: baseVersion,
          current_version: String(currentRecord.updated_at),
        });
        errors.push({
          entity_type: entityType as 'restaurant' | 'branch',
          entity_id: entityId,
          field: 'concurrency',
          code: 'STALE_DRAFT_CONFLICT',
          message: `Entity was modified by another operation at ${currentRecord.updated_at}. Reconcile with latest data before publishing.`,
          severity: 'error',
        });
      }
    }

    // Compute diffs
    const entityDiffs = computeFieldDiffs(
      entityType as 'restaurant' | 'branch',
      entityId,
      currentRecord,
      changes
    );
    diffs.push(...entityDiffs);

    // Validate fields
    if (entityType === 'restaurant') {
      const brandErrors = validateBrandFields(entityId, changes, isNew);
      for (const err of brandErrors) {
        if (err.severity === 'error') errors.push(err);
        else warnings.push(err);
      }

      const projectedBrand = { ...(currentRecord || {}), ...changes };
      const brandStatus = String(projectedBrand.operating_status || 'unknown');
      const researchUse = String(projectedBrand.research_use || 'manual_review_only');

      if (brandStatus === 'open' && !['production_ready', 'usable_with_caution'].includes(researchUse)) {
        errors.push({
          entity_type: 'restaurant',
          entity_id: entityId,
          field: 'research_use',
          code: 'READINESS_BLOCKED',
          message: `Brand with open status requires research_use to be 'production_ready' or 'usable_with_caution' (found '${researchUse}').`,
          severity: 'error',
        });
      }
    } else if (entityType === 'branch') {
      const branchErrors = validateBranchFields(entityId, changes, currentRecord, isNew);
      for (const err of branchErrors) {
        if (err.severity === 'error') errors.push(err);
        else warnings.push(err);
      }

      // Evaluate readiness impact
      const projectedBrand = parentBrand || {
        operating_status: 'open',
        research_use: 'production_ready',
      };
      const projectedBranch = { ...(currentRecord || {}), ...changes };

      const beforeReadiness = currentRecord
        ? evaluateReadiness(parentBrand || projectedBrand, currentRecord)
        : null;
      const afterReadiness = evaluateReadiness(projectedBrand, projectedBranch);

      readinessImpact.push({
        entity_id: entityId,
        entity_type: 'branch',
        before: beforeReadiness,
        after: afterReadiness,
      });

      // If branch fails readiness while proposed to be open, block publication!
      if (!afterReadiness.is_recommendation_eligible) {
        const isBranchOpen = (projectedBranch.branch_status || 'open') === 'open';
        for (const blocker of afterReadiness.blockers) {
          if (isBranchOpen) {
            errors.push({
              entity_type: 'branch',
              entity_id: entityId,
              field: 'readiness',
              code: 'READINESS_BLOCKED',
              message: `Recommendation eligibility blocked for open branch: ${blocker}`,
              severity: 'error',
            });
          } else {
            warnings.push({
              entity_type: 'branch',
              entity_id: entityId,
              field: 'readiness',
              code: 'READINESS_BLOCKED',
              message: `Recommendation eligibility impacted: ${blocker}`,
              severity: 'warning',
            });
          }
        }
      }
    }
  }

  const isPublishable = errors.length === 0 && concurrencyConflicts.length === 0;

  // Persist validation outcome if draft exists in database
  if (draftId && supabaseUrl && supabaseKey) {
    try {
      await fetch(`${supabaseUrl}/rest/v1/catalog_draft_changesets?id=eq.${encodeURIComponent(draftId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          status: isPublishable ? 'validated' : 'draft',
          validation_results: {
            is_publishable: isPublishable,
            error_count: errors.length,
            warning_count: warnings.length,
            conflict_count: concurrencyConflicts.length,
            validated_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        }),
      });
    } catch {
      // Ignore background patch errors
    }
  }

  return jsonResponse({
    success: true,
    draft_id: draftId,
    title: draftTitle,
    change_type: changeType,
    is_publishable: isPublishable,
    errors,
    warnings,
    diffs,
    concurrency_conflicts: concurrencyConflicts,
    readiness_impact: readinessImpact,
    affected_entities_count: targetEntities.length,
  });
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
