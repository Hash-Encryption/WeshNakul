import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';
import { CANONICAL_JEDDAH_DISTRICT_IDS } from './_validation.ts';

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // 1. Strict server-side admin authentication & authorization
  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse({ error: auth.error, message: auth.message }, auth.status);
  }

  // 2. Query parameters
  const url = new URL(request.url);
  const search = url.searchParams.get('q')?.trim().toLowerCase() || '';
  const category = url.searchParams.get('category')?.trim() || '';
  const district = url.searchParams.get('district')?.trim() || '';
  const status = url.searchParams.get('status')?.trim() || '';
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '50', 10)));
  const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  if (!supabaseUrl || !supabaseKey) {
    return jsonResponse({
      success: true,
      brands: [],
      branches: [],
      districts: Array.from(CANONICAL_JEDDAH_DISTRICT_IDS),
      pagination: { total: 0, limit, offset, has_more: false },
      warning: 'upstream_not_configured',
    });
  }

  try {
    // Fetch brands
    let brandQuery = `${supabaseUrl}/rest/v1/restaurants?select=id,name_en,name_ar,categories,dining_mode,tier,price_tier,rating,operating_status,research_use,price_position,editorial_role,manual_review_required,manual_review_reasons,updated_at&order=name_en.asc&limit=${limit + 1}&offset=${offset}`;

    if (category) {
      brandQuery += `&categories=cs.{${encodeURIComponent(category)}}`;
    }
    if (status) {
      brandQuery += `&operating_status=eq.${encodeURIComponent(status)}`;
    }
    if (search) {
      brandQuery += `&or=(name_en.ilike.*${encodeURIComponent(search)}*,name_ar.ilike.*${encodeURIComponent(search)}*,id.ilike.*${encodeURIComponent(search)}*)`;
    }

    const brandRes = await fetch(brandQuery, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });

    if (!brandRes.ok) {
      return jsonResponse({ error: 'fetch_brands_failed', message: 'Failed to retrieve brands.' }, 502);
    }

    const rawBrands = (await brandRes.json()) as Array<Record<string, unknown>>;
    const hasMoreBrands = rawBrands.length > limit;
    const brands = rawBrands.slice(0, limit);

    // Fetch branches
    const brandIds = brands.map((b) => b.id as string).filter(Boolean);
    let branches: Array<Record<string, unknown>> = [];

    if (brandIds.length > 0) {
      let branchQuery = `${supabaseUrl}/rest/v1/restaurant_branches?select=id,restaurant_id,branch_name_en,branch_name_ar,district,address_ar,address_en,latitude,longitude,google_maps_url,branch_status,branch_type,dine_in,takeaway,late_night,is_24_hours,last_verified_at,updated_at&restaurant_id=in.(${brandIds.map(encodeURIComponent).join(',')})`;

      if (district) {
        branchQuery += `&district=eq.${encodeURIComponent(district)}`;
      }

      const branchRes = await fetch(branchQuery, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      });

      if (branchRes.ok) {
        branches = (await branchRes.json()) as Array<Record<string, unknown>>;
      }
    }

    return jsonResponse({
      success: true,
      brands,
      branches,
      districts: Array.from(CANONICAL_JEDDAH_DISTRICT_IDS),
      pagination: {
        total: brands.length,
        limit,
        offset,
        has_more: hasMoreBrands,
      },
    });
  } catch (err) {
    return jsonResponse(
      { error: 'internal_error', message: (err as Error).message || 'Server error loading catalog items.' },
      500
    );
  }
}

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
