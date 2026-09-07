# Restaurant schema inventory

Generated from the actual disposable PostgreSQL database after the legacy restaurant migration and both Phase 1 migrations. Includes pre-existing restaurants constraints/indexes/public-read policy for context. No room tables are modified.

## Enums

| Name | Entity | Definition |
| --- | --- | --- |
| branch_match_method | public | exact_address, coordinates, official_name, phone, google_place, platform_identifier, manual, unresolved |
| branch_type | public | full_dine_in, takeaway_only, delivery_only, mall_foodcourt, airport, kiosk, unknown |
| delivery_listing_status | public | verified, probable, unknown, unavailable |
| delivery_platform | public | hungerstation, jahez, keeta |
| editorial_role | public | staple, popular, discovery |
| evidence_quality | public | primary, strong_secondary, weak_secondary |
| intelligence_confidence | public | high, medium, low, unknown |
| maps_lookup_status | public | verified, ambiguous, not_found, secondary_only, unknown |
| operating_status | public | open, temporarily_closed, permanently_closed, unknown |
| price_position | public | budget, standard, premium, unknown |
| rating_source | public | google_maps_direct, google_derived_secondary, official, other, unknown |
| research_source_type | public | official_website, official_menu, google_maps, delivery_listing, publication, operator, social, aggregator, other |
| research_use | public | production_ready, usable_with_caution, manual_review_only, rejected |
| trend_status | public | none, rising, trending, cooling, unknown |

## Constraints

| Name | Entity | Definition |
| --- | --- | --- |
| delivery_platform_listings_check | delivery_platform_listings | CHECK ((((matched_branch_id IS NULL) AND (match_method = 'unresolved'::branch_match_method) AND (match_confidence = 'unknown'::intelligence_confidence)) OR ((matched_branch_id IS NOT NULL) AND (match_method <> 'unresolved'::branch_match_method) AND (match_confidence <> 'unknown'::intelligence_confidence)))) |
| delivery_platform_listings_confidence_not_null | delivery_platform_listings | NOT NULL confidence |
| delivery_platform_listings_created_at_not_null | delivery_platform_listings | NOT NULL created_at |
| delivery_platform_listings_direct_url_check | delivery_platform_listings | CHECK (((direct_url IS NULL) OR ((direct_url ~ '^https://'::text) AND (direct_url !~* '(google[.]\|/search([/?#]\|$)\|[?&](q\|query\|search)=)'::text)))) |
| delivery_platform_listings_id_not_null | delivery_platform_listings | NOT NULL id |
| delivery_platform_listings_match_confidence_not_null | delivery_platform_listings | NOT NULL match_confidence |
| delivery_platform_listings_match_method_not_null | delivery_platform_listings | NOT NULL match_method |
| delivery_platform_listings_pkey | delivery_platform_listings | PRIMARY KEY (id) |
| delivery_platform_listings_platform_not_null | delivery_platform_listings | NOT NULL platform |
| delivery_platform_listings_platform_platform_listing_id_key | delivery_platform_listings | UNIQUE (platform, platform_listing_id) |
| delivery_platform_listings_restaurant_id_fkey | delivery_platform_listings | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE |
| delivery_platform_listings_restaurant_id_id_key | delivery_platform_listings | UNIQUE (restaurant_id, id) |
| delivery_platform_listings_restaurant_id_matched_branch_id_fkey | delivery_platform_listings | FOREIGN KEY (restaurant_id, matched_branch_id) REFERENCES restaurant_branches(restaurant_id, id) |
| delivery_platform_listings_restaurant_id_not_null | delivery_platform_listings | NOT NULL restaurant_id |
| delivery_platform_listings_status_not_null | delivery_platform_listings | NOT NULL status |
| delivery_platform_listings_updated_at_not_null | delivery_platform_listings | NOT NULL updated_at |
| restaurant_best_sellers_check | restaurant_best_sellers | CHECK (((COALESCE(length(TRIM(BOTH FROM name_ar)), 0) > 0) OR (COALESCE(length(TRIM(BOTH FROM name_en)), 0) > 0))) |
| restaurant_best_sellers_confidence_not_null | restaurant_best_sellers | NOT NULL confidence |
| restaurant_best_sellers_created_at_not_null | restaurant_best_sellers | NOT NULL created_at |
| restaurant_best_sellers_id_not_null | restaurant_best_sellers | NOT NULL id |
| restaurant_best_sellers_is_signature_not_null | restaurant_best_sellers | NOT NULL is_signature |
| restaurant_best_sellers_pkey | restaurant_best_sellers | PRIMARY KEY (id) |
| restaurant_best_sellers_restaurant_id_fkey | restaurant_best_sellers | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE |
| restaurant_best_sellers_restaurant_id_id_key | restaurant_best_sellers | UNIQUE (restaurant_id, id) |
| restaurant_best_sellers_restaurant_id_not_null | restaurant_best_sellers | NOT NULL restaurant_id |
| restaurant_best_sellers_sort_order_check | restaurant_best_sellers | CHECK ((sort_order >= 0)) |
| restaurant_best_sellers_sort_order_not_null | restaurant_best_sellers | NOT NULL sort_order |
| restaurant_best_sellers_updated_at_not_null | restaurant_best_sellers | NOT NULL updated_at |
| restaurant_branches_branch_identity_confidence_not_null | restaurant_branches | NOT NULL branch_identity_confidence |
| restaurant_branches_branch_status_confidence_not_null | restaurant_branches | NOT NULL branch_status_confidence |
| restaurant_branches_branch_status_not_null | restaurant_branches | NOT NULL branch_status |
| restaurant_branches_branch_type_not_null | restaurant_branches | NOT NULL branch_type |
| restaurant_branches_check | restaurant_branches | CHECK (((latitude IS NULL) = (longitude IS NULL))) |
| restaurant_branches_check1 | restaurant_branches | CHECK (((google_rating IS NULL) OR (rating_source <> 'unknown'::rating_source))) |
| restaurant_branches_check2 | restaurant_branches | CHECK (((rating_source <> 'google_maps_direct'::rating_source) OR (maps_lookup_status = 'verified'::maps_lookup_status))) |
| restaurant_branches_check3 | restaurant_branches | CHECK (((maps_lookup_status <> 'verified'::maps_lookup_status) OR ((google_place_id IS NOT NULL) OR (google_maps_url IS NOT NULL)))) |
| restaurant_branches_created_at_not_null | restaurant_branches | NOT NULL created_at |
| restaurant_branches_google_place_id_check | restaurant_branches | CHECK (((google_place_id IS NULL) OR (length(TRIM(BOTH FROM google_place_id)) > 0))) |
| restaurant_branches_google_place_id_key | restaurant_branches | UNIQUE (google_place_id) |
| restaurant_branches_google_rating_check | restaurant_branches | CHECK (((google_rating >= (0)::numeric) AND (google_rating <= (5)::numeric))) |
| restaurant_branches_google_review_count_check | restaurant_branches | CHECK ((google_review_count >= 0)) |
| restaurant_branches_id_not_null | restaurant_branches | NOT NULL id |
| restaurant_branches_latitude_check | restaurant_branches | CHECK (((latitude >= ('-90'::integer)::double precision) AND (latitude <= (90)::double precision))) |
| restaurant_branches_longitude_check | restaurant_branches | CHECK (((longitude >= ('-180'::integer)::double precision) AND (longitude <= (180)::double precision))) |
| restaurant_branches_maps_lookup_status_not_null | restaurant_branches | NOT NULL maps_lookup_status |
| restaurant_branches_opening_hours_check | restaurant_branches | CHECK ((jsonb_typeof(opening_hours) = 'object'::text)) |
| restaurant_branches_pkey | restaurant_branches | PRIMARY KEY (id) |
| restaurant_branches_rating_source_not_null | restaurant_branches | NOT NULL rating_source |
| restaurant_branches_restaurant_id_fkey | restaurant_branches | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE |
| restaurant_branches_restaurant_id_id_key | restaurant_branches | UNIQUE (restaurant_id, id) |
| restaurant_branches_restaurant_id_not_null | restaurant_branches | NOT NULL restaurant_id |
| restaurant_branches_updated_at_not_null | restaurant_branches | NOT NULL updated_at |
| restaurant_sources_check | restaurant_sources | CHECK (((source_type <> 'aggregator'::research_source_type) OR (evidence_quality <> 'primary'::evidence_quality))) |
| restaurant_sources_created_at_not_null | restaurant_sources | NOT NULL created_at |
| restaurant_sources_date_checked_not_null | restaurant_sources | NOT NULL date_checked |
| restaurant_sources_evidence_quality_not_null | restaurant_sources | NOT NULL evidence_quality |
| restaurant_sources_id_not_null | restaurant_sources | NOT NULL id |
| restaurant_sources_pkey | restaurant_sources | PRIMARY KEY (id) |
| restaurant_sources_restaurant_id_best_seller_id_fkey | restaurant_sources | FOREIGN KEY (restaurant_id, best_seller_id) REFERENCES restaurant_best_sellers(restaurant_id, id) ON DELETE CASCADE |
| restaurant_sources_restaurant_id_branch_id_fkey | restaurant_sources | FOREIGN KEY (restaurant_id, branch_id) REFERENCES restaurant_branches(restaurant_id, id) ON DELETE CASCADE |
| restaurant_sources_restaurant_id_delivery_listing_id_fkey | restaurant_sources | FOREIGN KEY (restaurant_id, delivery_listing_id) REFERENCES delivery_platform_listings(restaurant_id, id) ON DELETE CASCADE |
| restaurant_sources_restaurant_id_fkey | restaurant_sources | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE |
| restaurant_sources_restaurant_id_id_key | restaurant_sources | UNIQUE (restaurant_id, id) |
| restaurant_sources_restaurant_id_not_null | restaurant_sources | NOT NULL restaurant_id |
| restaurant_sources_source_type_not_null | restaurant_sources | NOT NULL source_type |
| restaurant_sources_source_url_check | restaurant_sources | CHECK ((source_url ~ '^https?://'::text)) |
| restaurant_sources_source_url_not_null | restaurant_sources | NOT NULL source_url |
| restaurant_sources_supports_check | restaurant_sources | CHECK ((cardinality(supports) > 0)) |
| restaurant_sources_supports_not_null | restaurant_sources | NOT NULL supports |
| restaurant_sources_updated_at_not_null | restaurant_sources | NOT NULL updated_at |
| restaurant_trend_signals_check | restaurant_trend_signals | CHECK (((metric_value IS NULL) OR (metric_unit IS NOT NULL))) |
| restaurant_trend_signals_confidence_not_null | restaurant_trend_signals | NOT NULL confidence |
| restaurant_trend_signals_created_at_not_null | restaurant_trend_signals | NOT NULL created_at |
| restaurant_trend_signals_creator_count_check | restaurant_trend_signals | CHECK ((creator_count >= 0)) |
| restaurant_trend_signals_id_not_null | restaurant_trend_signals | NOT NULL id |
| restaurant_trend_signals_metric_value_check | restaurant_trend_signals | CHECK ((metric_value >= (0)::numeric)) |
| restaurant_trend_signals_observed_at_not_null | restaurant_trend_signals | NOT NULL observed_at |
| restaurant_trend_signals_pkey | restaurant_trend_signals | PRIMARY KEY (id) |
| restaurant_trend_signals_platform_not_null | restaurant_trend_signals | NOT NULL platform |
| restaurant_trend_signals_restaurant_id_fkey | restaurant_trend_signals | FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE |
| restaurant_trend_signals_restaurant_id_not_null | restaurant_trend_signals | NOT NULL restaurant_id |
| restaurant_trend_signals_restaurant_id_source_id_fkey | restaurant_trend_signals | FOREIGN KEY (restaurant_id, source_id) REFERENCES restaurant_sources(restaurant_id, id) ON DELETE CASCADE |
| restaurant_trend_signals_signal_type_not_null | restaurant_trend_signals | NOT NULL signal_type |
| restaurant_trend_signals_source_id_not_null | restaurant_trend_signals | NOT NULL source_id |
| restaurant_trend_signals_updated_at_not_null | restaurant_trend_signals | NOT NULL updated_at |
| restaurants_avg_prep_minutes_not_null | restaurants | NOT NULL avg_prep_minutes |
| restaurants_branch_list_completeness_check | restaurants | CHECK ((branch_list_completeness = ANY (ARRAY['complete'::text, 'partial'::text, 'unknown'::text]))) |
| restaurants_branch_list_completeness_not_null | restaurants | NOT NULL branch_list_completeness |
| restaurants_branches_not_null | restaurants | NOT NULL branches |
| restaurants_brand_status_confidence_not_null | restaurants | NOT NULL brand_status_confidence |
| restaurants_categories_not_null | restaurants | NOT NULL categories |
| restaurants_category_fit_confidence_not_null | restaurants | NOT NULL category_fit_confidence |
| restaurants_check | restaurants | CHECK (((estimated_sar_per_person_max >= estimated_sar_per_person_min) AND (estimated_sar_per_person_max >= (0)::numeric))) |
| restaurants_closing_time_ar_not_null | restaurants | NOT NULL closing_time_ar |
| restaurants_context_tags_not_null | restaurants | NOT NULL context_tags |
| restaurants_created_at_not_null | restaurants | NOT NULL created_at |
| restaurants_dining_mode_check | restaurants | CHECK ((dining_mode = ANY (ARRAY['both'::text, 'delivery_only'::text, 'dine_in_only'::text]))) |
| restaurants_dining_mode_not_null | restaurants | NOT NULL dining_mode |
| restaurants_dining_mode_summary_check | restaurants | CHECK ((dining_mode_summary = ANY (ARRAY['both'::text, 'delivery_only'::text, 'dine_in_only'::text, 'unknown'::text]))) |
| restaurants_established_year_check | restaurants | CHECK (((established_year >= 1000) AND (established_year <= 9999))) |
| restaurants_estimated_sar_per_person_min_check | restaurants | CHECK ((estimated_sar_per_person_min >= (0)::numeric)) |
| restaurants_id_not_null | restaurants | NOT NULL id |
| restaurants_intelligence_origin_check | restaurants | CHECK ((intelligence_origin = ANY (ARRAY['unresearched'::text, 'legacy_seed'::text, 'research'::text]))) |
| restaurants_intelligence_origin_not_null | restaurants | NOT NULL intelligence_origin |
| restaurants_is_24_hours_not_null | restaurants | NOT NULL is_24_hours |
| restaurants_is_city_wide_not_null | restaurants | NOT NULL is_city_wide |
| restaurants_is_open_late_not_null | restaurants | NOT NULL is_open_late |
| restaurants_links_not_null | restaurants | NOT NULL links |
| restaurants_manual_review_reasons_not_null | restaurants | NOT NULL manual_review_reasons |
| restaurants_manual_review_required_not_null | restaurants | NOT NULL manual_review_required |
| restaurants_meal_period_strength_check | restaurants | CHECK ((jsonb_typeof(meal_period_strength) = 'object'::text)) |
| restaurants_meal_strength_check | restaurants | CHECK (valid_meal_period_strength(meal_period_strength)) |
| restaurants_menu_breadth_check | restaurants | CHECK ((menu_breadth = ANY (ARRAY['focused'::text, 'broad'::text, 'unknown'::text]))) |
| restaurants_name_ar_not_null | restaurants | NOT NULL name_ar |
| restaurants_name_en_not_null | restaurants | NOT NULL name_en |
| restaurants_operating_status_not_null | restaurants | NOT NULL operating_status |
| restaurants_overall_confidence_not_null | restaurants | NOT NULL overall_confidence |
| restaurants_pkey | restaurants | PRIMARY KEY (id) |
| restaurants_platforms_not_null | restaurants | NOT NULL platforms |
| restaurants_price_position_not_null | restaurants | NOT NULL price_position |
| restaurants_price_tier_check | restaurants | CHECK ((price_tier = ANY (ARRAY['$'::text, '$$'::text, '$$$'::text]))) |
| restaurants_price_tier_not_null | restaurants | NOT NULL price_tier |
| restaurants_rating_not_null | restaurants | NOT NULL rating |
| restaurants_reputation_tags_check | restaurants | CHECK ((reputation_tags <@ ARRAY['jeddah_staple'::text, 'local_favorite'::text, 'hidden_gem'::text, 'cult_favorite'::text, 'mainstream'::text, 'new_opening'::text, 'rising'::text, 'trending'::text])) |
| restaurants_reputation_tags_not_null | restaurants | NOT NULL reputation_tags |
| restaurants_research_use_not_null | restaurants | NOT NULL research_use |
| restaurants_secondary_categories_not_null | restaurants | NOT NULL secondary_categories |
| restaurants_signature_dish_ar_not_null | restaurants | NOT NULL signature_dish_ar |
| restaurants_signature_dish_en_not_null | restaurants | NOT NULL signature_dish_en |
| restaurants_subcategories_not_null | restaurants | NOT NULL subcategories |
| restaurants_tier_check | restaurants | CHECK ((tier = ANY (ARRAY['staple'::text, 'trend'::text]))) |
| restaurants_tier_not_null | restaurants | NOT NULL tier |
| restaurants_time_slots_not_null | restaurants | NOT NULL time_slots |
| restaurants_trend_confidence_not_null | restaurants | NOT NULL trend_confidence |
| restaurants_trend_status_not_null | restaurants | NOT NULL trend_status |
| restaurants_updated_at_not_null | restaurants | NOT NULL updated_at |
| restaurants_verified_jeddah_branch_count_check | restaurants | CHECK ((verified_jeddah_branch_count >= 0)) |
| restaurants_vibe_tags_ar_not_null | restaurants | NOT NULL vibe_tags_ar |
| restaurants_vibe_tags_en_not_null | restaurants | NOT NULL vibe_tags_en |

## Indexes

| Name | Entity | Definition |
| --- | --- | --- |
| delivery_listings_branch_idx | delivery_platform_listings | CREATE INDEX delivery_listings_branch_idx ON public.delivery_platform_listings USING btree (matched_branch_id) |
| delivery_listings_lookup_idx | delivery_platform_listings | CREATE INDEX delivery_listings_lookup_idx ON public.delivery_platform_listings USING btree (restaurant_id, platform, status) |
| delivery_platform_listings_pkey | delivery_platform_listings | CREATE UNIQUE INDEX delivery_platform_listings_pkey ON public.delivery_platform_listings USING btree (id) |
| delivery_platform_listings_platform_platform_listing_id_key | delivery_platform_listings | CREATE UNIQUE INDEX delivery_platform_listings_platform_platform_listing_id_key ON public.delivery_platform_listings USING btree (platform, platform_listing_id) |
| delivery_platform_listings_restaurant_id_id_key | delivery_platform_listings | CREATE UNIQUE INDEX delivery_platform_listings_restaurant_id_id_key ON public.delivery_platform_listings USING btree (restaurant_id, id) |
| restaurant_best_sellers_pkey | restaurant_best_sellers | CREATE UNIQUE INDEX restaurant_best_sellers_pkey ON public.restaurant_best_sellers USING btree (id) |
| restaurant_best_sellers_restaurant_id_id_key | restaurant_best_sellers | CREATE UNIQUE INDEX restaurant_best_sellers_restaurant_id_id_key ON public.restaurant_best_sellers USING btree (restaurant_id, id) |
| restaurant_branches_district_status_idx | restaurant_branches | CREATE INDEX restaurant_branches_district_status_idx ON public.restaurant_branches USING btree (district, branch_status) |
| restaurant_branches_google_place_id_key | restaurant_branches | CREATE UNIQUE INDEX restaurant_branches_google_place_id_key ON public.restaurant_branches USING btree (google_place_id) |
| restaurant_branches_pkey | restaurant_branches | CREATE UNIQUE INDEX restaurant_branches_pkey ON public.restaurant_branches USING btree (id) |
| restaurant_branches_restaurant_id_id_key | restaurant_branches | CREATE UNIQUE INDEX restaurant_branches_restaurant_id_id_key ON public.restaurant_branches USING btree (restaurant_id, id) |
| restaurant_sources_branch_idx | restaurant_sources | CREATE INDEX restaurant_sources_branch_idx ON public.restaurant_sources USING btree (branch_id) |
| restaurant_sources_listing_idx | restaurant_sources | CREATE INDEX restaurant_sources_listing_idx ON public.restaurant_sources USING btree (delivery_listing_id) |
| restaurant_sources_pkey | restaurant_sources | CREATE UNIQUE INDEX restaurant_sources_pkey ON public.restaurant_sources USING btree (id) |
| restaurant_sources_restaurant_id_id_key | restaurant_sources | CREATE UNIQUE INDEX restaurant_sources_restaurant_id_id_key ON public.restaurant_sources USING btree (restaurant_id, id) |
| restaurant_sources_seller_idx | restaurant_sources | CREATE INDEX restaurant_sources_seller_idx ON public.restaurant_sources USING btree (best_seller_id) |
| restaurant_trend_observed_idx | restaurant_trend_signals | CREATE INDEX restaurant_trend_observed_idx ON public.restaurant_trend_signals USING btree (restaurant_id, observed_at DESC) |
| restaurant_trend_signals_pkey | restaurant_trend_signals | CREATE UNIQUE INDEX restaurant_trend_signals_pkey ON public.restaurant_trend_signals USING btree (id) |
| restaurant_trend_source_idx | restaurant_trend_signals | CREATE INDEX restaurant_trend_source_idx ON public.restaurant_trend_signals USING btree (restaurant_id, source_id) |
| idx_restaurants_branches | restaurants | CREATE INDEX idx_restaurants_branches ON public.restaurants USING gin (branches) |
| idx_restaurants_categories | restaurants | CREATE INDEX idx_restaurants_categories ON public.restaurants USING gin (categories) |
| idx_restaurants_is_city_wide | restaurants | CREATE INDEX idx_restaurants_is_city_wide ON public.restaurants USING btree (is_city_wide) |
| restaurants_editorial_trend_idx | restaurants | CREATE INDEX restaurants_editorial_trend_idx ON public.restaurants USING btree (editorial_role, trend_status) |
| restaurants_intelligence_filter_idx | restaurants | CREATE INDEX restaurants_intelligence_filter_idx ON public.restaurants USING btree (city, operating_status, research_use) |
| restaurants_pkey | restaurants | CREATE UNIQUE INDEX restaurants_pkey ON public.restaurants USING btree (id) |
| restaurants_primary_category_idx | restaurants | CREATE INDEX restaurants_primary_category_idx ON public.restaurants USING btree (primary_category) |

## Policies

| Name | Entity | Definition |
| --- | --- | --- |
| delivery_platform_listings_public_read | delivery_platform_listings | SELECT TO {anon,authenticated} USING true |
| restaurant_best_sellers_public_read | restaurant_best_sellers | SELECT TO {anon,authenticated} USING true |
| restaurant_branches_public_read | restaurant_branches | SELECT TO {anon,authenticated} USING true |
| restaurant_sources_public_read | restaurant_sources | SELECT TO {anon,authenticated} USING true |
| restaurant_trend_signals_public_read | restaurant_trend_signals | SELECT TO {anon,authenticated} USING true |
| Allow public read access on restaurants | restaurants | SELECT TO {public} USING true |
