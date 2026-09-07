# Restaurant Intelligence V2 — Phase 1

Scope: additive intelligence foundation only. Starting main and live origin/main were both `88b33e130fae0ec5689224dbe30bc06e75b9c7c5`, with a clean worktree on 2026-09-08 (Asia/Riyadh). The project is `C:\codexprojects\WeshNakul`.

## ALREADY EXISTS — KEEP

`src/data/restaurants.ts` owns the current selector: category match, fallback below five candidates, conditional late-night filtering, district/neighbor order and seven-card cap. `jeddahDistricts.ts` retains macro zones and neighbors. `useRestaurantSwiper.ts` owns Later rotation without a vote, all-No replay, voting and winner commitment. The winner cache, card components, consensus, room/session lifecycle, scratchpad, delivery links, bilingual presentation and realtime flows remain intact.

## ALREADY EXISTS — REFINE

The flattened SQL restaurant row and `RestaurantItem` mix brand identity, district strings, prototype ratings/hours, price, dishes and platform flags/search URLs. The inline mapper in `supabase.ts` is replaced by a typed repository. Existing `categories`, `tier`, rating, and all other compatibility columns retain their original semantics. `tier = trend` is not researched trend evidence.

## ACTUALLY MISSING — ADD

Five child tables: physical branches, platform listings, best sellers, sources and trend signals. Brand intelligence gains independent editorial/trend state, confidence, approval, freshness, provenance, categories, meal strength, price estimates and review flags. TypeScript entities and `DeckRestaurant` expose this graph without per-component queries.

## CHANGE / REMOVE

Only restaurant cache/fetch/mapping moves from `supabase.ts` to `restaurantRepository.ts`; compatibility exports remain. No legacy seed records/columns are deleted, no UI is redesigned, no selector/tie/room behavior is replaced. No fake branch placeholders, direct listing links, source records or trend metrics are backfilled.

## BACKWARD-COMPATIBILITY RISKS

- Cards call numeric `rating.toFixed`; the selector, leaderboard and sudden-death tie resolution use legacy ratings. Phase 1 preserves them exactly. `branchRating` and `reviewCount` remain null until Phase 2 selects a branch; actual branch values and provenance remain available in `intelligence.branches`.
- Missing V2 columns use the old schema path (one restaurant query). Child-query errors retain the fetched legacy brand pool and mark `intelligenceStatus = unavailable`, rather than silently treating partial intelligence as complete. Brand-fetch failures/empty responses retain the existing category/staple fallback.
- `ConsensusResultScreen` already prefetches before swiping; the hook itself defers until swiping. That existing distinction is retained.
- Legacy migrations have duplicate `005` prefixes, the initial schema sorts after its dependents, and `005_fix_participant_session_unique.sql` contains malformed `DO` syntax. Those historical room migrations are not rewritten here. Do not blindly reset/push the whole migration directory.

## Entities and evidence

`restaurants` remains the brand authority with stable TEXT IDs; its existing ID is already the slug-like identifier. `restaurant_branches` contains physical locations only. Nullable coordinates must be a valid pair, Place IDs are unique when supplied, Maps lookup state is explicit, and direct vs secondary rating sources are distinct. A verified Maps identity needs a URL or Place ID. Unknown operations/hours/capabilities remain null.

`delivery_platform_listings` describes HungerStation, Jahez and Keeta listings/service areas independently of physical branches. Optional composite foreign keys enforce that a matched branch belongs to the same brand. An unresolved match has no branch ID, unknown confidence and unresolved method. Reconcile only with actual address/coordinate/name/phone/Place/platform/manual evidence. Deleting a matched branch requires unmatching its listing first; deleting a brand cascades through its children.

`restaurant_best_sellers` allows either language, but requires an actual nonblank dish name. `restaurant_sources` stores a source URL, supported field paths, checked/source dates, evidence quality and optional same-brand branch/listing/dish references. Use paths such as `restaurant_branches.google_rating` or `restaurants.editorial_role` in `supports`. Aggregators cannot be primary evidence. Curators must still assess source truth; SQL cannot prove that a URL is genuine evidence.

`restaurant_trend_signals` references its same-brand source, so sources do not need circular trend references. Raw factual metrics require units; no arbitrary quality/popularity/trend scores exist. Editorial role can be null (unknown) or staple/popular/discovery, independently of none/rising/trending/cooling/unknown trend status.

Confidence is high/medium/low/unknown. Reputation tags have a controlled allowlist. Meal strengths use a checked object keyed by breakfast/lunch/dinner/late_night with strong/moderate/weak/unknown values; breakfast-menu capability is a separate nullable fact. Opening hours use a typed object with weekday text and optional open/close day/time periods. Ingestion validates payload details before writing.

Brand/menu/trend, branch/Maps/hours/Places-sync, listing and best-seller timestamps separate verification freshness from ordinary `updated_at`. Six triggers maintain `updated_at`; changing a row never invents a verification timestamp. Research approval is production_ready/usable_with_caution/manual_review_only/rejected. It does not filter the production selector in Phase 1.

All research content here is public restaurant information: select-only grants/policies for anon/authenticated; writes remain service-role/admin owned. Do not store private credentials or internal confidential notes in these publicly readable tables. No new admin UI or anonymous write policy is introduced. Existing room policies are untouched.

## Migration and rollout

1. `20260908000100_restaurant_intelligence.sql`: 14 enums, additive brand columns, five child tables, integrity constraints, 11 explicit indexes, six update triggers, five select policies, explicit read/write grants.
2. `20260908000200_restaurant_legacy_provenance.sql`: primary/secondary categories from the existing array and budget/standard/premium from existing price symbols; mark existing rows legacy_seed/manual-review. All original columns, including signatures and IDs, stay byte-for-byte/value-for-value intact. The backfill can be repeated without overwriting researched rows.

No branch records are inferred from district strings. No legacy platforms, rating, hours, vibe tags or tier are promoted to researched facts. No sources/best-seller/trend/listing records are invented. City, branch count, Maps identities, coordinates, review counts, exact prices, verified editorial/trend assertions and verification times remain null/unknown until research supplies them. The original signature fields remain explicitly legacy by brand provenance.

Apply only these two forward files, in order, after the existing restaurant table is present and the target schema has been checked. Each file is transactional. They have been executed against a disposable PostgreSQL runtime seeded with the actual restaurant migration. No remote Supabase migration was run. The application works both before and after schema deployment; schema rollback is not needed to roll back application code. Do not rerun Migration A as if it were idempotent.

See [schema inventory](restaurant-intelligence-schema-inventory.md) for exact enum, constraint, index and policy names, including inherited restaurant objects.

## Runtime boundary

`fetchRestaurantPool(client, categoryId)` performs the existing brand/category query, then one query per child entity when the schema supports V2. It groups children under stable brand IDs and deduplicates brands. `mapLegacyRestaurant` preserves the previous field mapping. `projectRestaurant` exposes the typed graph under `intelligence`, with explicit availability status and separate editorial/trend fields. Existing `fetchDeckRestaurants` and `getCachedRestaurant` callers retain their API.

Phase 1 intentionally uses compatibility fields for presentation and selection even when intelligence exists. New verified branch ratings never overwrite the legacy ranking field. Missing children are arrays; no selected branch is fabricated. The in-memory `CITYWIDE_STAPLES` dataset remains a legacy fallback, not a second normalized database. Phase 2 must check availability and research trust before using intelligence. PostgREST pagination and broad-pool querying must be considered before bulk ingestion exceeds server row limits.

## Future research JSON mapping

| Research payload | Target | Unknown/provenance handling |
| --- | --- | --- |
| restaurant identity/classification | restaurants | Reuse stable ID; city and optional facts null; editorial role null; trend/confidence unknown; intelligence_origin research only for curated records |
| primary/secondary/subcategories and evidence | restaurants | Preserve canonical IDs; explicit fit evidence and source supports; no silent category-voting rewrite |
| branches | restaurant_branches | One row per evidenced physical location; missing Place ID/coordinates/hours/rating null; no platform service-area placeholders |
| best_sellers | restaurant_best_sellers | Insert actual dishes only; absent list means zero rows; confidence/evidence/timestamp required by ingestion review |
| platform listings | delivery_platform_listings | Direct URL nullable, status unknown unless verified; never import search URLs as direct URLs; unresolved branch null |
| sources | restaurant_sources | Insert real source URL/type/quality, supports and actual checked date; attach only same-brand entities |
| trend evidence | restaurant_trend_signals | Insert after sources; reference source ID; metric/unit/creator count null when unknown; no invented metrics |

Future ingestion should validate the typed payload, stage manual-review records, then write brand → branches/listings/best sellers → sources → trend signals transactionally. Keep public evidence distinct from private editorial workflow data. Existing legacy NOT NULL compatibility columns still apply to new brand inserts. Updating current brands is additive; inserting new brands into production requires an explicitly reviewed compatibility payload or the Phase 2 nullable-runtime transition. Never accept the legacy default 4.5 as a researched rating, synthesize dish names, or guess hours/tier to satisfy a new-row insert. Bulk ingestion is not enabled in this phase.

## Phase boundaries

Phase 2 owns hard eligibility V2, best-branch resolution, general/precise geography, review/rating reliability, contextual weighting, staple/popular/discovery composition, trend and hidden-gem selection, weighted seeded randomness, diversity, first/optional next seven, replay variation and Try Something New. The data foundation supports these; none are activated.

Phase 3 owns true vote-tie semantics, delivery launcher cleanup/platform visibility, and end-to-end production certification. Static geographic relevance is not platform presence, and platform presence is not live deliverability to an address. No live routing, mandatory GPS, Places API or delivery API integration is added.

## Reproduce validation

- `npm.cmd test`: all four existing assertion suites, 28 repository/SSR checks, mocked Supabase failures plus create/join/capacity/session checks.
- `npm.cmd run build`: TypeScript project build and production Vite build.
- `npm.cmd run lint`: six pre-existing warnings, no new warnings/errors.
- `npm.cmd run test:db`: 93 checks against disposable PostgreSQL (no remote connections). First install the test-only runtime with PowerShell: `npm.cmd install --prefix (Join-Path $env:TEMP 'weshnakul-phase1-db') --no-save --package-lock=false @electric-sql/pglite@0.5.8`. Alternatively point `PGLITE_MODULE` at its `dist/index.js`. No application dependency/lockfile change is required.
- `node scripts/check-restaurant-db.mjs --write-inventory`: regenerate catalog inventory.
- `npm.cmd run test:browser`: open `http://127.0.0.1:5187/phase1-tests`; the page reports 25 actual React/browser checks, using mocked backend operations. Stop the server after use. The virtual test modules are not part of the production build.
- `git diff --check`: whitespace review.

Formatting and dedicated secret-scan scripts do not exist. Live Supabase schema/RLS/API/realtime persistence, physical devices, multi-client production room completion and actual WhatsApp/platform navigation are NOT_RUN. The disposable SQL and mocked/browser results do not certify those boundaries.
