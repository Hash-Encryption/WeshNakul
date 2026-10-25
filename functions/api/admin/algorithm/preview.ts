import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';
import {
  validateAlgorithmConfigServer,
  DEFAULT_ALGORITHM_SETTINGS,
  SETTING_BOUNDS,
  type AlgorithmConfig,
} from './_schema.ts';

/**
 * POST /api/admin/algorithm/preview
 * Evaluates candidate ranking side-by-side between the active published settings
 * and the proposed draft settings across identical inputs with no writes or analytics side effects.
 */
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

  const proposedSettings = body.settings as AlgorithmConfig;
  const validation = validateAlgorithmConfigServer(proposedSettings);
  if (!validation.valid) {
    return jsonResponse(
      { error: 'validation_failed', message: 'Proposed settings contain schema errors.', errors: validation.errors },
      422
    );
  }

  const scenario = {
    city: String(body.city || 'jeddah').toLowerCase(),
    mode: String(body.mode || 'food').toLowerCase(),
    category: String(body.category || 'burger').toLowerCase(),
    district: body.district ? String(body.district) : 'al_rawdah',
    latitude: typeof body.latitude === 'number' ? body.latitude : 21.5728,
    longitude: typeof body.longitude === 'number' ? body.longitude : 39.1558,
    eating_mode: body.eating_mode ? String(body.eating_mode) : 'any',
    preferences: Array.isArray(body.preferences) ? (body.preferences as string[]) : [],
  };

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse(
      {
        error: 'preview_service_unavailable',
        message: 'Database credentials are required to evaluate live algorithm preview. Synthetic scenarios are not permitted.',
      },
      503
    );
  }

  let publishedDeck: Record<string, unknown>[] = [];
  let proposedDeck: Record<string, unknown>[] = [];
  let activeVersionNumber = 1;

  try {
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/preview_algorithm_deck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        p_city: scenario.city,
        p_mode: scenario.mode,
        p_category: scenario.category,
        p_district: scenario.district,
        p_lat: scenario.latitude,
        p_lng: scenario.longitude,
        p_eating_mode: scenario.eating_mode,
        p_preferences: scenario.preferences,
        p_proposed_settings: proposedSettings,
      }),
    });

    if (!rpcRes.ok) {
      const errText = await rpcRes.text();
      let errJson: Record<string, unknown> = {};
      try {
        errJson = JSON.parse(errText);
      } catch {
        // raw text
      }
      return jsonResponse(
        {
          error: 'preview_evaluation_failed',
          message: String(errJson.message || errJson.details || errText || 'Preview evaluation failed in database engine.'),
        },
        502
      );
    }

    const data = (await rpcRes.json()) as {
      publishedDeck: Record<string, unknown>[];
      proposedDeck: Record<string, unknown>[];
      activeVersionNumber: number;
    };
    publishedDeck = data.publishedDeck || [];
    proposedDeck = data.proposedDeck || [];
    activeVersionNumber = data.activeVersionNumber || 1;
  } catch (err) {
    return jsonResponse(
      {
        error: 'preview_network_error',
        message: (err as Error).message || 'Network communication error while evaluating preview.',
      },
      502
    );
  }

  // Compute diff and signal explanations
  const pubMap = new Map(publishedDeck.map((c, i) => [String(c.id), { ...c, rank: i + 1 }]));
  const propMap = new Map(proposedDeck.map((c, i) => [String(c.id), { ...c, rank: i + 1 }]));

  const added = proposedDeck.filter((c) => !pubMap.has(String(c.id)));
  const removed = publishedDeck.filter((c) => !propMap.has(String(c.id)));

  const reordered: { id: string; nameEn: string; nameAr: string; oldRank: number; newRank: number }[] = [];
  const scoreChanges: { id: string; nameEn: string; nameAr: string; publishedScore: number; proposedScore: number; delta: number }[] = [];

  for (const [id, propCard] of propMap.entries()) {
    const pubCard = pubMap.get(id);
    if (pubCard) {
      if (pubCard.rank !== propCard.rank) {
        reordered.push({
          id,
          nameEn: String(propCard.nameEn || id),
          nameAr: String(propCard.nameAr || id),
          oldRank: pubCard.rank,
          newRank: propCard.rank,
        });
      }
      const pubScore = Number(pubCard.score ?? 0);
      const propScore = Number(propCard.score ?? 0);
      if (Math.abs(pubScore - propScore) > 0.001) {
        scoreChanges.push({
          id,
          nameEn: String(propCard.nameEn || id),
          nameAr: String(propCard.nameAr || id),
          publishedScore: pubScore,
          proposedScore: propScore,
          delta: Math.round((propScore - pubScore) * 1000) / 1000,
        });
      }
    }
  }

  const signalsExplained = Object.keys(SETTING_BOUNDS).map((key) => {
    const k = key as keyof typeof DEFAULT_ALGORITHM_SETTINGS;
    const pubVal = DEFAULT_ALGORITHM_SETTINGS[k];
    const propVal = proposedSettings.global?.[k] ?? pubVal;
    return {
      key,
      nameEn: key.replace(/_/g, ' '),
      nameAr: key,
      explanationEn: `Current published: ${pubVal}, Proposed draft: ${propVal}`,
      explanationAr: `القيمة المنشورة: ${pubVal}، قيمة المسودة: ${propVal}`,
      publishedValue: pubVal,
      proposedValue: propVal,
      changed: pubVal !== propVal,
    };
  });

  return jsonResponse({
    success: true,
    comparison: {
      scenario,
      publishedDeck,
      proposedDeck,
      activeVersionNumber,
      diff: {
        added,
        removed,
        reordered,
        scoreChanges,
      },
      signalsExplained,
    },
  });
}
