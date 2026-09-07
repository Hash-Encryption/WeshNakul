-- Phase 1 only. Apply after the existing restaurants migration; no room/session changes.
BEGIN;

CREATE TYPE public.intelligence_confidence AS ENUM ('high', 'medium', 'low', 'unknown');
CREATE TYPE public.editorial_role AS ENUM ('staple', 'popular', 'discovery');
CREATE TYPE public.trend_status AS ENUM ('none', 'rising', 'trending', 'cooling', 'unknown');
CREATE TYPE public.research_use AS ENUM ('production_ready', 'usable_with_caution', 'manual_review_only', 'rejected');
CREATE TYPE public.price_position AS ENUM ('budget', 'standard', 'premium', 'unknown');
CREATE TYPE public.operating_status AS ENUM ('open', 'temporarily_closed', 'permanently_closed', 'unknown');
CREATE TYPE public.branch_type AS ENUM ('full_dine_in', 'takeaway_only', 'delivery_only', 'mall_foodcourt', 'airport', 'kiosk', 'unknown');
CREATE TYPE public.maps_lookup_status AS ENUM ('verified', 'ambiguous', 'not_found', 'secondary_only', 'unknown');
CREATE TYPE public.rating_source AS ENUM ('google_maps_direct', 'google_derived_secondary', 'official', 'other', 'unknown');
CREATE TYPE public.delivery_platform AS ENUM ('hungerstation', 'jahez', 'keeta');
CREATE TYPE public.delivery_listing_status AS ENUM ('verified', 'probable', 'unknown', 'unavailable');
CREATE TYPE public.branch_match_method AS ENUM ('exact_address', 'coordinates', 'official_name', 'phone', 'google_place', 'platform_identifier', 'manual', 'unresolved');
CREATE TYPE public.evidence_quality AS ENUM ('primary', 'strong_secondary', 'weak_secondary');
CREATE TYPE public.research_source_type AS ENUM ('official_website', 'official_menu', 'google_maps', 'delivery_listing', 'publication', 'operator', 'social', 'aggregator', 'other');

ALTER TABLE public.restaurants
  ADD COLUMN city text,
  ADD COLUMN primary_category text,
  ADD COLUMN secondary_categories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN subcategories text[] NOT NULL DEFAULT '{}',
  ADD COLUMN category_fit_confidence public.intelligence_confidence NOT NULL DEFAULT 'unknown',
  ADD COLUMN category_fit_evidence text,
  ADD COLUMN editorial_role public.editorial_role,
  ADD COLUMN reputation_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN context_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN context_tag_evidence text,
  ADD COLUMN business_type text,
  ADD COLUMN operating_status public.operating_status NOT NULL DEFAULT 'unknown',
  ADD COLUMN brand_status_confidence public.intelligence_confidence NOT NULL DEFAULT 'unknown',
  ADD COLUMN established_year integer CHECK (established_year BETWEEN 1000 AND 9999),
  ADD COLUMN origin_city text,
  ADD COLUMN origin_country text,
  ADD COLUMN verified_jeddah_branch_count integer CHECK (verified_jeddah_branch_count >= 0),
  ADD COLUMN branch_list_completeness text NOT NULL DEFAULT 'unknown' CHECK (branch_list_completeness IN ('complete','partial','unknown')),
  ADD COLUMN meal_period_strength jsonb CHECK (jsonb_typeof(meal_period_strength) = 'object'),
  ADD COLUMN serves_breakfast_menu boolean,
  ADD COLUMN dining_mode_summary text CHECK (dining_mode_summary IN ('both','delivery_only','dine_in_only','unknown')),
  ADD COLUMN menu_breadth text CHECK (menu_breadth IN ('focused','broad','unknown')),
  ADD COLUMN price_position public.price_position NOT NULL DEFAULT 'unknown',
  ADD COLUMN estimated_sar_per_person_min numeric CHECK (estimated_sar_per_person_min >= 0),
  ADD COLUMN estimated_sar_per_person_max numeric CHECK (estimated_sar_per_person_max >= estimated_sar_per_person_min AND estimated_sar_per_person_max >= 0),
  ADD COLUMN official_website text,
  ADD COLUMN official_phone text,
  ADD COLUMN official_ordering text,
  ADD COLUMN official_instagram text,
  ADD COLUMN official_tiktok text,
  ADD COLUMN official_x text,
  ADD COLUMN trend_status public.trend_status NOT NULL DEFAULT 'unknown',
  ADD COLUMN trend_confidence public.intelligence_confidence NOT NULL DEFAULT 'unknown',
  ADD COLUMN trend_last_verified_at timestamptz,
  ADD COLUMN overall_confidence public.intelligence_confidence NOT NULL DEFAULT 'unknown',
  ADD COLUMN research_use public.research_use NOT NULL DEFAULT 'manual_review_only',
  ADD COLUMN last_verified_at timestamptz,
  ADD COLUMN menu_last_verified_at timestamptz,
  ADD COLUMN manual_review_required boolean NOT NULL DEFAULT true,
  ADD COLUMN manual_review_reasons text[] NOT NULL DEFAULT '{}',
  ADD COLUMN intelligence_origin text NOT NULL DEFAULT 'unresearched' CHECK (intelligence_origin IN ('unresearched','legacy_seed','research')),
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now(),
  ADD CONSTRAINT restaurants_reputation_tags_check CHECK (reputation_tags <@ ARRAY['jeddah_staple','local_favorite','hidden_gem','cult_favorite','mainstream','new_opening','rising','trending']::text[]);

-- Structured meal strengths; opening at breakfast does not imply a breakfast menu.
CREATE FUNCTION public.valid_meal_period_strength(value jsonb) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT value IS NULL OR (jsonb_typeof(value) = 'object' AND NOT EXISTS (
    SELECT 1 FROM jsonb_each_text(CASE WHEN jsonb_typeof(value) = 'object' THEN value ELSE '{}'::jsonb END)
    WHERE key NOT IN ('breakfast','lunch','dinner','late_night') OR value NOT IN ('strong','moderate','weak','unknown')
  ));
$$;
ALTER TABLE public.restaurants ADD CONSTRAINT restaurants_meal_strength_check CHECK (public.valid_meal_period_strength(meal_period_strength));

CREATE TABLE public.restaurant_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id text NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_name_ar text, branch_name_en text,
  branch_status public.operating_status NOT NULL DEFAULT 'unknown',
  branch_status_confidence public.intelligence_confidence NOT NULL DEFAULT 'unknown',
  branch_type public.branch_type NOT NULL DEFAULT 'unknown',
  district text, address_ar text, address_en text,
  latitude double precision CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision CHECK (longitude BETWEEN -180 AND 180),
  maps_business_name text, google_place_id text UNIQUE CHECK (google_place_id IS NULL OR length(trim(google_place_id)) > 0),
  maps_lookup_status public.maps_lookup_status NOT NULL DEFAULT 'unknown',
  google_maps_url text,
  google_rating numeric(2,1) CHECK (google_rating BETWEEN 0 AND 5),
  google_review_count integer CHECK (google_review_count >= 0),
  rating_source public.rating_source NOT NULL DEFAULT 'unknown',
  opening_hours jsonb CHECK (jsonb_typeof(opening_hours) = 'object'),
  hours_last_verified_at timestamptz, maps_last_verified_at timestamptz, place_last_synced_at timestamptz,
  is_24_hours boolean, late_night boolean, dine_in boolean, takeaway boolean, google_delivery_indicator boolean,
  branch_identity_confidence public.intelligence_confidence NOT NULL DEFAULT 'unknown',
  geographic_notes text, last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, id),
  CHECK ((latitude IS NULL) = (longitude IS NULL)),
  CHECK (google_rating IS NULL OR rating_source <> 'unknown'),
  CHECK (rating_source <> 'google_maps_direct' OR maps_lookup_status = 'verified'),
  CHECK (maps_lookup_status <> 'verified' OR (google_place_id IS NOT NULL OR google_maps_url IS NOT NULL))
);

CREATE TABLE public.delivery_platform_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id text NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  platform public.delivery_platform NOT NULL,
  platform_restaurant_name text, service_area_label text, platform_listing_id text,
  direct_url text CHECK (direct_url IS NULL OR (direct_url ~ '^https://' AND direct_url !~* '(google[.]|/search([/?#]|$)|[?&](q|query|search)=)')),
  status public.delivery_listing_status NOT NULL DEFAULT 'unknown',
  confidence public.intelligence_confidence NOT NULL DEFAULT 'unknown',
  matched_branch_id uuid,
  match_confidence public.intelligence_confidence NOT NULL DEFAULT 'unknown',
  match_method public.branch_match_method NOT NULL DEFAULT 'unresolved',
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, id), UNIQUE (platform, platform_listing_id),
  FOREIGN KEY (restaurant_id, matched_branch_id) REFERENCES public.restaurant_branches(restaurant_id, id),
  CHECK ((matched_branch_id IS NULL AND match_method = 'unresolved' AND match_confidence = 'unknown') OR
         (matched_branch_id IS NOT NULL AND match_method <> 'unresolved' AND match_confidence <> 'unknown'))
);

CREATE TABLE public.restaurant_best_sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id text NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name_ar text, name_en text,
  is_signature boolean NOT NULL DEFAULT false, sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  confidence public.intelligence_confidence NOT NULL DEFAULT 'unknown', evidence_summary text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, id),
  CHECK (coalesce(length(trim(name_ar)),0) > 0 OR coalesce(length(trim(name_en)),0) > 0)
);

CREATE TABLE public.restaurant_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id text NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  branch_id uuid, delivery_listing_id uuid, best_seller_id uuid,
  source_type public.research_source_type NOT NULL,
  source_url text NOT NULL CHECK (source_url ~ '^https?://'),
  supports text[] NOT NULL CHECK (cardinality(supports) > 0),
  source_date date, date_checked timestamptz NOT NULL,
  evidence_quality public.evidence_quality NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (restaurant_id, id),
  FOREIGN KEY (restaurant_id, branch_id) REFERENCES public.restaurant_branches(restaurant_id,id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id, delivery_listing_id) REFERENCES public.delivery_platform_listings(restaurant_id,id) ON DELETE CASCADE,
  FOREIGN KEY (restaurant_id, best_seller_id) REFERENCES public.restaurant_best_sellers(restaurant_id,id) ON DELETE CASCADE,
  CHECK (source_type <> 'aggregator' OR evidence_quality <> 'primary')
);

-- A signal references its source, avoiding a circular source/signal FK.
CREATE TABLE public.restaurant_trend_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id text NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  platform text NOT NULL, signal_type text NOT NULL,
  metric_value numeric CHECK (metric_value >= 0), metric_unit text,
  creator_count integer CHECK (creator_count >= 0), observed_at timestamptz NOT NULL,
  source_id uuid NOT NULL, confidence public.intelligence_confidence NOT NULL DEFAULT 'unknown', notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (restaurant_id,source_id) REFERENCES public.restaurant_sources(restaurant_id,id) ON DELETE CASCADE,
  CHECK (metric_value IS NULL OR metric_unit IS NOT NULL)
);

CREATE INDEX restaurants_intelligence_filter_idx ON public.restaurants(city, operating_status, research_use);
CREATE INDEX restaurants_editorial_trend_idx ON public.restaurants(editorial_role, trend_status);
CREATE INDEX restaurants_primary_category_idx ON public.restaurants(primary_category);
CREATE INDEX restaurant_branches_district_status_idx ON public.restaurant_branches(district, branch_status);
CREATE INDEX delivery_listings_lookup_idx ON public.delivery_platform_listings(restaurant_id, platform, status);
CREATE INDEX delivery_listings_branch_idx ON public.delivery_platform_listings(matched_branch_id);
CREATE INDEX restaurant_sources_branch_idx ON public.restaurant_sources(branch_id);
CREATE INDEX restaurant_sources_listing_idx ON public.restaurant_sources(delivery_listing_id);
CREATE INDEX restaurant_sources_seller_idx ON public.restaurant_sources(best_seller_id);
CREATE INDEX restaurant_trend_observed_idx ON public.restaurant_trend_signals(restaurant_id, observed_at DESC);
CREATE INDEX restaurant_trend_source_idx ON public.restaurant_trend_signals(restaurant_id, source_id);
-- Composite unique indexes already cover restaurant_id on branches, listings, sellers and sources.

CREATE FUNCTION public.touch_restaurant_intelligence_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER restaurants_intelligence_updated_at BEFORE UPDATE ON public.restaurants FOR EACH ROW EXECUTE FUNCTION public.touch_restaurant_intelligence_updated_at();
REVOKE ALL ON public.restaurants FROM anon, authenticated;
GRANT SELECT ON public.restaurants TO anon, authenticated;
GRANT ALL ON public.restaurants TO service_role;

CREATE TRIGGER restaurant_branches_intelligence_updated_at BEFORE UPDATE ON public.restaurant_branches FOR EACH ROW EXECUTE FUNCTION public.touch_restaurant_intelligence_updated_at();
ALTER TABLE public.restaurant_branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY restaurant_branches_public_read ON public.restaurant_branches FOR SELECT TO anon, authenticated USING (true);
REVOKE ALL ON public.restaurant_branches FROM anon, authenticated;
GRANT SELECT ON public.restaurant_branches TO anon, authenticated;
GRANT ALL ON public.restaurant_branches TO service_role;

CREATE TRIGGER delivery_platform_listings_intelligence_updated_at BEFORE UPDATE ON public.delivery_platform_listings FOR EACH ROW EXECUTE FUNCTION public.touch_restaurant_intelligence_updated_at();
ALTER TABLE public.delivery_platform_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY delivery_platform_listings_public_read ON public.delivery_platform_listings FOR SELECT TO anon, authenticated USING (true);
REVOKE ALL ON public.delivery_platform_listings FROM anon, authenticated;
GRANT SELECT ON public.delivery_platform_listings TO anon, authenticated;
GRANT ALL ON public.delivery_platform_listings TO service_role;

CREATE TRIGGER restaurant_best_sellers_intelligence_updated_at BEFORE UPDATE ON public.restaurant_best_sellers FOR EACH ROW EXECUTE FUNCTION public.touch_restaurant_intelligence_updated_at();
ALTER TABLE public.restaurant_best_sellers ENABLE ROW LEVEL SECURITY;
CREATE POLICY restaurant_best_sellers_public_read ON public.restaurant_best_sellers FOR SELECT TO anon, authenticated USING (true);
REVOKE ALL ON public.restaurant_best_sellers FROM anon, authenticated;
GRANT SELECT ON public.restaurant_best_sellers TO anon, authenticated;
GRANT ALL ON public.restaurant_best_sellers TO service_role;

CREATE TRIGGER restaurant_sources_intelligence_updated_at BEFORE UPDATE ON public.restaurant_sources FOR EACH ROW EXECUTE FUNCTION public.touch_restaurant_intelligence_updated_at();
ALTER TABLE public.restaurant_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY restaurant_sources_public_read ON public.restaurant_sources FOR SELECT TO anon, authenticated USING (true);
REVOKE ALL ON public.restaurant_sources FROM anon, authenticated;
GRANT SELECT ON public.restaurant_sources TO anon, authenticated;
GRANT ALL ON public.restaurant_sources TO service_role;

CREATE TRIGGER restaurant_trend_signals_intelligence_updated_at BEFORE UPDATE ON public.restaurant_trend_signals FOR EACH ROW EXECUTE FUNCTION public.touch_restaurant_intelligence_updated_at();
ALTER TABLE public.restaurant_trend_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY restaurant_trend_signals_public_read ON public.restaurant_trend_signals FOR SELECT TO anon, authenticated USING (true);
REVOKE ALL ON public.restaurant_trend_signals FROM anon, authenticated;
GRANT SELECT ON public.restaurant_trend_signals TO anon, authenticated;
GRANT ALL ON public.restaurant_trend_signals TO service_role;

COMMIT;
