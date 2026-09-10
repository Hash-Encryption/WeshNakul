# Jeddah geography intelligence

## Baseline audit

Before this upgrade, the room setup UI exposed 10 Jeddah districts while `src/data/jeddahDistricts.ts` and `private.district_geography` held a separate 20-district graph. `al_samer` existed only in the UI. The five Pass C districts `al_ruwais`, `al_thaghr`, `al_balad`, `al_hamdaniyah`, and `al_sheraa` were absent. The database normalized only `North Obhur` and `أبحر الشمالية` explicitly, then converted other Latin input to a slug; most Arabic input became an empty string. Eighteen of 20 private rows shared `central_jeddah`, so the broad fallback carried little spatial meaning.

The deck fallback was GPS distance, exact district, direct neighbor, same macrozone, then city-wide. It had no second-ring tier. Branch selection still returned one branch per restaurant and the deck still deduplicated by restaurant.

## Canonical contract

`src/data/jeddahDistricts.ts` is the public application catalog. It contains the 26 supported district IDs, Arabic and English display names, controlled aliases, macrozones, and verified direct neighbors. The setup UI derives its Jeddah options from this catalog and stores the stable ID. Older English display values remain accepted through explicit aliases.

The private database needs the same data without exposing `private` tables to clients. Migration `20260910000100_jeddah_geography_intelligence.sql` is the forward-only SQL snapshot. `scripts/check-geography.mjs` compares every catalog row, including aliases, zone, and neighbors, with that migration so the two representations cannot drift silently. The database harness also verifies the applied private graph and normalization functions.

Normalization is exact after case, surrounding whitespace, hyphen, underscore, and repeated-space normalization. It does not use fuzzy matching. Unknown values resolve to `null`.

## Geography verification

The [Saudi National Address district API contract](https://api.address.gov.sa/Districts) confirms that district identity and name are registry fields, but reading its Jeddah register requires a subscription token. Bilingual spellings, direct relationships, and north-to-south placement were checked on the public [Jeddah district polygon layer](https://services8.arcgis.com/ET0FctyFeVvxU1Nq/ArcGIS/rest/services/Jeddah_Districts_gdb/FeatureServer/0), last edited 2026-05-19. A direct edge is present only when two supported district polygons share boundary segments. The Pass C research document supplied the five newly required district identities; restaurant rows and its coordinates remain outside this migration.

The supported graph has 27 undirected direct relationships. `al_hamdaniyah`, `abhur_al_janoubiyah`, and `al_balad` have no shared boundary with another district in the supported subset. They intentionally use zone and city-wide fallback rather than invented direct edges.

Second-ring districts are derived from the direct graph. The derivation is bounded to one neighbor-of-neighbor step, excludes the origin and direct neighbors, removes duplicates, and sorts application results for deterministic behavior.

The old `north_obhur / central_jeddah / south_jeddah` structure is replaced by five geometry-based north-to-south bands:

- `north`: Al Sheraa, Al Hamdaniyah, North Obhur, South Obhur
- `north_central`: Al Murjan, Al Basateen, Al Mohammadiyyah, Al Naeem, Al Marwah
- `central`: Al Shati, Al Bawadi, Al Salamah, Al Zahra, Al Safa, Al Samer, Al Faisaliyyah, Al Rawdah, Al Khalidiyyah, Al Rehab
- `south_central`: Al Andalus, Al Hamra, Al Naseem, Al Ruwais
- `south`: Al Faiha, Al Balad, Al Thaghr

These bands follow the polygon layer's district centroids and preserve a weaker fallback for supported districts that are not connected in the subset graph.

## Runtime behavior and limits

The geographic tier is exact (`0.75`), direct (`0.40`), second ring (`0.28`), same zone (`0.18`), then city-wide (`0`). The only new constant is `0.28`, placed between the existing direct and macrozone values. Category correctness, reputation, editorial role, trend, meal context, diversity, deterministic selection, persistence, and replay logic are unchanged.

GPS distance remains the strongest geographic input when both room and branch coordinates exist. Exact room coordinates remain in `private.room_locations`, enter through `set_room_location`, and are absent from public room, Realtime, and deck payloads. When the user chooses a district, the engine uses exact, direct, second-ring, zone, then city-wide context. Any Jeddah stores no district and therefore applies no district weight. The UI keeps GPS, manual district, and Any Jeddah mutually exclusive.

There is still no trusted Jeddah city boundary or reverse geocoder. GPS outside Jeddah is not detected physically, and GPS does not infer a district. This remains the extension point for a future trusted boundary or geocoder. No dependency, boundary, or coordinate was fabricated for this phase.
