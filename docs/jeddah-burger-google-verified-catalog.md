# Jeddah burger Google-verified catalog

The forward migration `20260911000100_jeddah_burger_google_verified_catalog.sql` embeds the certified cleaned JSON so every inserted brand, branch, best seller, source URL, and evidence value remains traceable to the supplied artifact.

- Input: `weshnakul_burger_production_google_verified_only_final_cleaned_2026-09-11.json`
- SHA-256: `C90868219C47FAA8AD6B07096A73C01C5720AA53F065F9FBBB977857A70FD3F3`
- Inventory: 10 brands, 33 production branches, 11 best sellers
- Completeness: Maps URLs 33/33, coordinates 33/33, addresses 33/33, Place IDs 33/33, ratings and reviews 33/33, canonical districts 30/33, Google price data 8/33
- Exclusions: the five entries in `removed_not_google_maps_verified` and the earlier Nora Burger — Abhur claim remain absent

The migration reuses six existing IDs and inserts `sign_burger`, `nora_burger`, `lou_burger`, and `pplr`. It maps `OPERATIONAL` to `open`, preserves exact branch coordinates and Google identities, and leaves the three supplied null districts unresolved. It stores Google price metadata in two optional branch columns instead of overloading WeshNakul spend estimates.

Legacy compatibility uses neutral values only: an empty closing-time label, a 20-minute preparation default, no delivery-platform claims, no brand-level rating, and no inferred meal-strength labels. Boolean meal availability continues to populate legacy time slots. `staple` maps to the legacy staple tier; `popular` and `discovery` map to its trend tier.

Local verification uses `scripts/check-burger-dataset.mjs` for the exact input artifact and `scripts/check-burger-db.mjs` for migration idempotency, schema counts, exclusions, geography, GPS privacy, citywide behavior, and real gen0/gen1 deck consumption. The migration is committed source only and is not applied to remote Supabase without user authorization.
