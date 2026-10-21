import {
  type Env,
  authenticateAdminRequest,
  jsonResponse,
} from '../_auth.ts';
import { sanitizeCsvCell } from '../export.ts';

export { sanitizeCsvCell };

const MAX_CATALOG_EXPORT_ROWS = 5000;

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // 1. Strict server-side admin authentication & authorization
  const auth = await authenticateAdminRequest(request, env);
  if (!auth.authenticated) {
    return jsonResponse({ error: auth.error, message: auth.message }, auth.status);
  }

  const url = new URL(request.url);
  const category = url.searchParams.get('category')?.trim() || '';
  const district = url.searchParams.get('district')?.trim() || '';
  const status = url.searchParams.get('status')?.trim() || '';

  const supabaseUrl = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const supabaseKey = (env.SUPABASE_SERVICE_ROLE_KEY || env.TEST_SUPABASE_KEY || '').trim();

  const headersList = [
    'Brand ID',
    'Brand Name (EN)',
    'Brand Name (AR)',
    'Categories',
    'Brand Operating Status',
    'Research Use',
    'Editorial Role',
    'Rating',
    'Price Tier',
    'Branch ID',
    'Branch Name (EN)',
    'Branch Name (AR)',
    'District',
    'Address (EN)',
    'Address (AR)',
    'Branch Status',
    'Latitude',
    'Longitude',
    'Google Maps URL',
    'Dine In',
    'Takeaway',
    '24 Hours',
    'Late Night',
  ];

  if (!supabaseUrl || !supabaseKey) {
    const emptyCsv =
      '\uFEFF' +
      [
        headersList.join(','),
        '# Upstream database unconfigured. Zero rows exported.',
      ].join('\r\n');

    return new Response(emptyCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="weshnakul-catalog-export.csv"',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    // 1. Fetch brands with safe projection allowlist
    let brandQuery = `${supabaseUrl}/rest/v1/restaurants?select=id,name_en,name_ar,categories,operating_status,research_use,editorial_role,rating,price_tier&order=name_en.asc&limit=1000`;
    if (category) {
      brandQuery += `&categories=cs.{${encodeURIComponent(category)}}`;
    }
    if (status) {
      brandQuery += `&operating_status=eq.${encodeURIComponent(status)}`;
    }

    const bRes = await fetch(brandQuery, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });

    if (!bRes.ok) {
      return jsonResponse({ error: 'export_failed', message: 'Failed to retrieve catalog records for export.' }, 502);
    }

    const brands = (await bRes.json()) as Array<Record<string, unknown>>;
    const brandMap = new Map(brands.map((b) => [b.id as string, b]));

    // 2. Fetch branches
    let branchQuery = `${supabaseUrl}/rest/v1/restaurant_branches?select=id,restaurant_id,branch_name_en,branch_name_ar,district,address_en,address_ar,branch_status,latitude,longitude,google_maps_url,dine_in,takeaway,is_24_hours,late_night&order=district.asc&limit=${MAX_CATALOG_EXPORT_ROWS}`;
    if (district) {
      branchQuery += `&district=eq.${encodeURIComponent(district)}`;
    }

    const brRes = await fetch(branchQuery, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
    });

    const branches = brRes.ok ? ((await brRes.json()) as Array<Record<string, unknown>>) : [];

    // Construct CSV rows
    const rows: string[] = [headersList.join(',')];

    if (branches.length > 0) {
      for (const branch of branches) {
        const brand = brandMap.get(branch.restaurant_id as string) || {};
        const categoriesStr = Array.isArray(brand.categories) ? brand.categories.join('; ') : '';

        const row = [
          sanitizeCsvCell(brand.id || branch.restaurant_id),
          sanitizeCsvCell(brand.name_en),
          sanitizeCsvCell(brand.name_ar),
          sanitizeCsvCell(categoriesStr),
          sanitizeCsvCell(brand.operating_status),
          sanitizeCsvCell(brand.research_use),
          sanitizeCsvCell(brand.editorial_role),
          sanitizeCsvCell(brand.rating),
          sanitizeCsvCell(brand.price_tier),
          sanitizeCsvCell(branch.id),
          sanitizeCsvCell(branch.branch_name_en),
          sanitizeCsvCell(branch.branch_name_ar),
          sanitizeCsvCell(branch.district),
          sanitizeCsvCell(branch.address_en),
          sanitizeCsvCell(branch.address_ar),
          sanitizeCsvCell(branch.branch_status),
          sanitizeCsvCell(branch.latitude),
          sanitizeCsvCell(branch.longitude),
          sanitizeCsvCell(branch.google_maps_url),
          sanitizeCsvCell(branch.dine_in ? 'Yes' : 'No'),
          sanitizeCsvCell(branch.takeaway ? 'Yes' : 'No'),
          sanitizeCsvCell(branch.is_24_hours ? 'Yes' : 'No'),
          sanitizeCsvCell(branch.late_night ? 'Yes' : 'No'),
        ];
        rows.push(row.join(','));
      }
    } else {
      // If brand has no branches, still output brand row
      for (const brand of brands) {
        const categoriesStr = Array.isArray(brand.categories) ? brand.categories.join('; ') : '';
        const row = [
          sanitizeCsvCell(brand.id),
          sanitizeCsvCell(brand.name_en),
          sanitizeCsvCell(brand.name_ar),
          sanitizeCsvCell(categoriesStr),
          sanitizeCsvCell(brand.operating_status),
          sanitizeCsvCell(brand.research_use),
          sanitizeCsvCell(brand.editorial_role),
          sanitizeCsvCell(brand.rating),
          sanitizeCsvCell(brand.price_tier),
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ];
        rows.push(row.join(','));
      }
    }

    const csvOutput = '\uFEFF' + rows.join('\r\n');

    return new Response(csvOutput, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="weshnakul-catalog-export.csv"',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
