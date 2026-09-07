# Phase 1 traceability and validation

Status: implementation and local validation complete; remote migration/production certification not performed. See [architecture/audit](restaurant-intelligence-phase1.md) and [exact schema inventory](restaurant-intelligence-schema-inventory.md).

| Requirement (prompt sections) | Implementation location | Test coverage | Status | Notes |
| --- | --- | --- | --- | --- |
| Inspect baseline and consumers (4–5,54) | Architecture document audit | Git HEAD/status/live ls-remote; consumer search | DONE IN PHASE 1 | Clean main at 88b33e130fae0ec5689224dbe30bc06e75b9c7c5; no baseline divergence |
| Preserve working flows and stable IDs (1–3,30–34) | Existing hook/UI/selector untouched; supabase.ts compatibility exports | Existing suites; repository, SQL snapshot, browser lifecycle | DONE IN PHASE 1 | Live multi-client certification remains separate |
| Brand/physical branch/listing separation (6–9,13,18) | 20260908000100_restaurant_intelligence.sql; restaurantIntelligence.ts | SQL relationships; two branches yield one runtime card | DONE IN PHASE 1 | No branch is inferred from service areas/district strings |
| Brand identity/category/evidence fields (9,37) | Additive restaurants fields; existing names/signatures/ID | SQL category preservation; mapper equality | DONE IN PHASE 1 | Existing ID is stable slug-like key; no category rewrite |
| Editorial vs trend/reputation (10–12) | editorial_role, trend_status, reputation_tags | Independent discovery/rising and staple/trending; invalid tag rejected | DONE IN PHASE 1 | Editorial unknown is null; no verified backfill from tier |
| Branch metadata/types/Maps/rating provenance (13–17) | restaurant_branches | Null Place/rating; coordinate pair/range; uniqueness; secondary/direct validation | DONE IN PHASE 1 | No live Places integration |
| Listing states/URLs/reconciliation (18–20,49) | delivery_platform_listings | Null unmatched allowed; cross-brand match rejected; search URL rejected | DONE IN PHASE 1 | Curator still verifies URLs; no claim of live deliverability |
| Best sellers (21) | restaurant_best_sellers | Missing names rejected; empty runtime list/render works | DONE IN PHASE 1 | No fabricated dishes |
| Evidence and factual trend signals (22–23) | restaurant_sources, restaurant_trend_signals | Cross-brand source rejected; aggregator cannot be primary; cascade tests | DONE IN PHASE 1 | source_id supplies signal provenance without circular FK |
| Research use/manual review/confidence (24,46–47) | Brand approval/flags and entity confidence enums | All four approval states and invalid state; legacy manual review | DONE IN PHASE 1 | No arbitrary quality/trend scores |
| Freshness (25) | Entity-specific verified timestamps; six updated_at triggers | Timestamp trigger executes; legacy verification stays unknown | DONE IN PHASE 1 | Updates do not refresh verification facts |
| Conservative additive backfill (26–27) | 20260908000200_restaurant_legacy_provenance.sql | All 83 original rows/columns unchanged; repeat backfill | DONE IN PHASE 1 | No children fabricated; direct categories/price only |
| Typed runtime/repository (28–29,43–44) | restaurantRepository.ts, restaurantIntelligence.ts, database.ts | 28 mapper/repository/SSR checks | DONE IN PHASE 1 | Actual PostgREST calls mocked; legacy UI fields preserved |
| District/optional coordinates (31–32) | Existing graph; nullable branch coordinates | Selector regression and SQL checks | DONE IN PHASE 1 | No room schema or mandatory GPS changes |
| Constraints/indexes/RLS (35–36) | Schema migration and inventory | 93 PostgreSQL checks including roles/read/denied writes | DONE IN PHASE 1 | Service-role writes only; room policies untouched |
| Price/meal/dining structures (38–40) | price_position/SAR range, meal strength/menu capability, branch booleans | Invalid range/meal values rejected; legacy dine-in tests | DONE IN PHASE 1 | Existing vibe fallback retained temporarily |
| Tests/migration validation (41–42,52–53) | scripts/check-restaurants.mjs, check-restaurant-db.mjs, check-browser.mjs, check-supabase.mjs | SQL + mocked API + SSR + actual browser lifecycle | DONE IN PHASE 1 | Evidence levels distinguished below |
| Research ingestion mapping/docs (45,50–51) | Architecture document + this traceability | Mapping review and TypeScript build | DONE IN PHASE 1 | Bulk ingestion not run; new-brand compatibility insert requires review |
| Hard eligibility/best physical branch (48) | Typed data supports future consumer | Not implemented | DEFERRED TO PHASE 2 | selectedBranch/branchRating/reviewCount stay null |
| General/precise geography and rating reliability | Branch coordinates/ratings/review count/source/freshness | Schema supports inputs | DEFERRED TO PHASE 2 | No distance/routing or Bayesian logic |
| Context weighting/composition/trend/discovery | Brand and branch intelligence | Not implemented | DEFERRED TO PHASE 2 | Includes hidden gems and Try Something New |
| Weighted seeded randomness/diversity/first-next seven/replay variation | Existing selector retained | Legacy selector tests | DEFERRED TO PHASE 2 | No quotas or optional Show 7 More |
| True vote ties/launcher cleanup/platform visibility | Existing components retained | Legacy ranking/SSR browser smoke | DEFERRED TO PHASE 3 | No changed result semantics |
| End-to-end production certification | No remote writes in this phase | NOT_RUN | DEFERRED TO PHASE 3 | Includes realtime multi-client and provider checks |

## Validation commands and evidence

| Check | Command | Result |
| --- | --- | --- |
| Regression suites + repository/SSR/API | npm.cmd test | PASS — four existing suites, 28 added repository/SSR checks, mocked API room creation/join/capacity/session/failure checks |
| SQL execution | npm.cmd run test:db | PASS — 93 checks on actual legacy restaurant migration plus both new migrations in PGlite 0.5.8; 83 original rows preserved |
| TypeScript + production | npm.cmd run build | PASS — tsc -b and Vite; pre-existing large-chunk warning |
| Lint | npm.cmd run lint | PASS — six pre-existing warnings, no errors/new warnings |
| Browser lifecycle | npm.cmd run test:browser; open /phase1-tests | PASS — 25 checks; real React and browser, mocked backend |
| Actual application forms | Local browser / | PASS — English/Arabic landing, Start a Group first step, Join with Code input rendering |
| Diff whitespace | git diff --check | PASS |
| Formatting | No script | NOT_RUN — script does not exist |
| Dedicated secret scan | No script/tool configured | NOT_RUN — script does not exist; changed-file credential-pattern review performed |
| Whole historical migration replay | Existing migration directory | BLOCKED — pre-existing duplicate 005 versions, initial-schema ordering and malformed participant DO statement; restaurant prerequisite and new files independently executed |
| Live Supabase | No remote SQL/API mutation executed | NOT_RUN — deployed schema/data/RLS/realtime not certified |
| Physical devices / actual provider launch | No device/provider run | NOT_RUN |

## Regression evidence by flow

| Flow | Result | Evidence and limits |
| --- | --- | --- |
| Landing | PASS | Actual local browser in AR/EN |
| Room creation | PASS (mocked API + form) | Successful persisted-response simulation and network rejection; first form step in browser |
| Host lobby / room sharing | NOT_RUN end-to-end | Production source unchanged; requires a live configured backend |
| Guest join / 10-player capacity / session reuse | PASS (mocked API + join form) | Fresh join, capacity refusal, existing session avoids insert; join UI rendered |
| Category voting / consensus | PASS logic | Existing consensus assertions; no live group submission |
| Swiping / Yes / No / Later | PASS browser with mocked API | Real hook and state updates; no production persistence claim |
| All-No replay | PASS browser with mocked API | Restarts index, toast, changes vote by upsert |
| Leaderboard / host pick / confirmation | PASS SSR + hook | Bilingual leaderboard/confirmation rendering and one winner commit |
| Sudden-death/roulette interaction | NOT_RUN end-to-end | No source changes; legacy ordering assertions run |
| Winner transition | PASS hook | Stable brand ID passed to matched-stage update; live room broadcast not exercised |
| Orders | PASS limited | Existing API failure checks and order-message formatter; live scratchpad editing NOT_RUN |
| WhatsApp sharing | PASS formatter | Names/dishes/notes/room code retained; clipboard/external send NOT_RUN |
| Delivery launcher | PASS SSR/browser | Missing direct URL renders existing fallback links; no external launch |
| Arabic/English/RTL | PASS | 181 matching localization keys; SSR names and actual browser language/direction effects |
| Room expiry/token/session behavior | PASS logic | Existing expiration/token suites and mocked joining/session reuse |
| Supabase fetch compatibility | PASS mocked HTTP | Legacy/V2, missing child table, empty response and network failure; live REST NOT_RUN |

## Handoff readiness

The normalized schema and typed graph are ready for Phase 2 development. Deploy the two ordered forward migrations through the existing operational process before consuming V2 data remotely. Research import remains unexecuted. New brands must not receive invented compatibility facts to satisfy legacy NOT NULL columns; plan that transition before ingestion. Broad-pool pagination, selected-branch authority and nullable UI presentation belong in the explicitly authorized next phase, not an implicit selector switch here.
