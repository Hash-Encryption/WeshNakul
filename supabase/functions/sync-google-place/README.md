# Google Place branch sync

This operator-only Edge Function refreshes one already-researched physical branch from an explicitly confirmed Google Place ID. It never creates branches or performs fuzzy identity matching.

Configure `GOOGLE_PLACES_API_KEY` and `RESTAURANT_SYNC_TOKEN` as Supabase function secrets. Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Call the function server-to-server with `x-sync-token` and JSON containing `branchId`, `placeId`, and `identityConfirmed: true`.
