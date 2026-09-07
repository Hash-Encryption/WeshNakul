-- Preserve every legacy field and ID. No physical branches or evidence are fabricated.
BEGIN;
UPDATE public.restaurants
SET primary_category = categories[1],
    secondary_categories = coalesce(categories[2:cardinality(categories)], '{}'),
    price_position = CASE price_tier WHEN '$' THEN 'budget'::public.price_position WHEN '$$' THEN 'standard'::public.price_position WHEN '$$$' THEN 'premium'::public.price_position ELSE 'unknown'::public.price_position END,
    intelligence_origin = 'legacy_seed',
    manual_review_required = true,
    manual_review_reasons = ARRAY['Legacy seed metadata; research and physical branch identities not verified']
WHERE intelligence_origin = 'unresearched';
-- City, editorial role, trend, ratings, hours, platform listings, branch identities,
-- sources and best sellers remain unknown/empty. Existing signature fields stay legacy.
COMMIT;
