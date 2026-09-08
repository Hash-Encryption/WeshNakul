const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json' },
});

Deno.serve(async request => {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const syncToken = Deno.env.get('RESTAURANT_SYNC_TOKEN');
  if (!syncToken || request.headers.get('x-sync-token') !== syncToken) return json({ error: 'Unauthorized' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const googleKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
  if (!supabaseUrl || !serviceKey || !googleKey) return json({ error: 'Server configuration is incomplete' }, 503);

  const { branchId, placeId, identityConfirmed } = await request.json().catch(() => ({}));
  if (!branchId || !placeId || identityConfirmed !== true) {
    return json({ error: 'branchId, placeId and explicit identity confirmation are required' }, 400);
  }

  const dbHeaders = { apikey: serviceKey, authorization: `Bearer ${serviceKey}` };
  const branchResponse = await fetch(
    `${supabaseUrl}/rest/v1/restaurant_branches?id=eq.${encodeURIComponent(branchId)}&select=id,google_place_id`,
    { headers: dbHeaders },
  );
  const [branch] = branchResponse.ok ? await branchResponse.json() : [];
  if (!branch) return json({ error: 'Branch not found' }, 404);
  if (branch.google_place_id && branch.google_place_id !== placeId) {
    return json({ error: 'Existing Place identity differs; manual review required' }, 409);
  }

  const placeResponse = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      'X-Goog-Api-Key': googleKey,
      'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,googleMapsUri,rating,userRatingCount,regularOpeningHours',
    },
  });
  if (!placeResponse.ok) return json({ error: 'Google Places lookup failed' }, 502);
  const place = await placeResponse.json();
  if (place.id !== placeId || place.location?.latitude == null || place.location?.longitude == null) {
    return json({ error: 'Google response did not contain a verified physical location' }, 422);
  }

  const now = new Date().toISOString();
  const updateResponse = await fetch(`${supabaseUrl}/rest/v1/restaurant_branches?id=eq.${encodeURIComponent(branchId)}`, {
    method: 'PATCH',
    headers: { ...dbHeaders, 'content-type': 'application/json', prefer: 'return=minimal' },
    body: JSON.stringify({
      google_place_id: place.id,
      maps_business_name: place.displayName?.text ?? null,
      address_en: place.formattedAddress ?? null,
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      google_maps_url: place.googleMapsUri ?? null,
      google_rating: place.rating ?? null,
      google_review_count: place.userRatingCount ?? null,
      opening_hours: place.regularOpeningHours ?? null,
      maps_lookup_status: 'verified',
      rating_source: place.rating == null ? 'unknown' : 'google_maps_direct',
      branch_identity_confidence: 'high',
      maps_last_verified_at: now,
      hours_last_verified_at: place.regularOpeningHours ? now : null,
      place_last_synced_at: now,
      last_verified_at: now,
    }),
  });
  if (!updateResponse.ok) return json({ error: 'Branch update failed' }, 502);

  return json({ branchId, placeId, syncedAt: now });
});
