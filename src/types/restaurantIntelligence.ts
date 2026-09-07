import type { DiningMode, RestaurantItem, RestaurantLinks, RestaurantPlatforms, PriceTier, TierType, TimeSlot } from './restaurant';

export type Confidence = 'high' | 'medium' | 'low' | 'unknown';
export type EditorialRole = 'staple' | 'popular' | 'discovery';
export type TrendStatus = 'none' | 'rising' | 'trending' | 'cooling' | 'unknown';
export type ResearchUse = 'production_ready' | 'usable_with_caution' | 'manual_review_only' | 'rejected';
export type PricePosition = 'budget' | 'standard' | 'premium' | 'unknown';
export type OperatingStatus = 'open' | 'temporarily_closed' | 'permanently_closed' | 'unknown';
export type Platform = 'hungerstation' | 'jahez' | 'keeta';
export type RatingSource = 'google_maps_direct' | 'google_derived_secondary' | 'official' | 'other' | 'unknown';
export type ReputationTag = 'jeddah_staple' | 'local_favorite' | 'hidden_gem' | 'cult_favorite' | 'mainstream' | 'new_opening' | 'rising' | 'trending';
interface Timestamps { created_at: string; updated_at: string }

/** Existing SQL row. Prototype metadata is not verified research. */
export interface LegacyRestaurantRow {
  id: string; name_ar: string; name_en: string; categories: string[];
  is_city_wide: boolean; branches: string[]; dining_mode: DiningMode;
  time_slots: TimeSlot[]; closing_time_ar: string; is_open_late: boolean; is_24_hours: boolean;
  avg_prep_minutes: number; tier: TierType; price_tier: PriceTier;
  signature_dish_ar: string; signature_dish_en: string; vibe_tags_ar: string[]; vibe_tags_en: string[];
  rating: number | string; platforms: RestaurantPlatforms; links: RestaurantLinks; created_at: string;
}
export interface RestaurantBrandRow extends LegacyRestaurantRow, Timestamps {
  city: string | null; primary_category: string | null; secondary_categories: string[]; subcategories: string[];
  category_fit_confidence: Confidence; category_fit_evidence: string | null;
  editorial_role: EditorialRole | null; reputation_tags: ReputationTag[]; context_tags: string[];
  context_tag_evidence: string | null; business_type: string | null; operating_status: OperatingStatus;
  brand_status_confidence: Confidence; established_year: number | null; origin_city: string | null; origin_country: string | null;
  verified_jeddah_branch_count: number | null; branch_list_completeness: 'complete' | 'partial' | 'unknown';
  meal_period_strength: Partial<Record<TimeSlot, 'strong' | 'moderate' | 'weak' | 'unknown'>> | null;
  serves_breakfast_menu: boolean | null; dining_mode_summary: DiningMode | 'unknown' | null;
  menu_breadth: 'focused' | 'broad' | 'unknown' | null; price_position: PricePosition;
  estimated_sar_per_person_min: number | null; estimated_sar_per_person_max: number | null;
  official_website: string | null; official_phone: string | null; official_ordering: string | null;
  official_instagram: string | null; official_tiktok: string | null; official_x: string | null;
  trend_status: TrendStatus; trend_confidence: Confidence; trend_last_verified_at: string | null;
  overall_confidence: Confidence; research_use: ResearchUse; last_verified_at: string | null; menu_last_verified_at: string | null;
  manual_review_required: boolean; manual_review_reasons: string[];
  intelligence_origin: 'unresearched' | 'legacy_seed' | 'research';
}
export interface RestaurantBranchRow extends Timestamps {
  id: string; restaurant_id: string; branch_name_ar: string | null; branch_name_en: string | null;
  branch_status: OperatingStatus; branch_status_confidence: Confidence;
  branch_type: 'full_dine_in' | 'takeaway_only' | 'delivery_only' | 'mall_foodcourt' | 'airport' | 'kiosk' | 'unknown';
  district: string | null; address_ar: string | null; address_en: string | null;
  latitude: number | null; longitude: number | null; maps_business_name: string | null; google_place_id: string | null;
  maps_lookup_status: 'verified' | 'ambiguous' | 'not_found' | 'secondary_only' | 'unknown';
  google_maps_url: string | null; google_rating: number | null; google_review_count: number | null; rating_source: RatingSource;
  opening_hours: { weekday_text?: string[]; periods?: { open: { day: number; time: string }; close?: { day: number; time: string } }[] } | null;
  hours_last_verified_at: string | null; maps_last_verified_at: string | null; place_last_synced_at: string | null;
  is_24_hours: boolean | null; late_night: boolean | null; dine_in: boolean | null; takeaway: boolean | null;
  google_delivery_indicator: boolean | null; branch_identity_confidence: Confidence; geographic_notes: string | null;
  last_verified_at: string | null;
}
export interface DeliveryPlatformListingRow extends Timestamps {
  id: string; restaurant_id: string; platform: Platform; platform_restaurant_name: string | null;
  service_area_label: string | null; platform_listing_id: string | null; direct_url: string | null;
  status: 'verified' | 'probable' | 'unknown' | 'unavailable'; confidence: Confidence;
  matched_branch_id: string | null; match_confidence: Confidence;
  match_method: 'exact_address' | 'coordinates' | 'official_name' | 'phone' | 'google_place' | 'platform_identifier' | 'manual' | 'unresolved';
  last_verified_at: string | null;
}
export interface RestaurantBestSellerRow extends Timestamps {
  id: string; restaurant_id: string; name_ar: string | null; name_en: string | null;
  is_signature: boolean; sort_order: number; confidence: Confidence; evidence_summary: string | null; last_verified_at: string | null;
}
export interface RestaurantSourceRow extends Timestamps {
  id: string; restaurant_id: string; branch_id: string | null; delivery_listing_id: string | null; best_seller_id: string | null;
  source_type: 'official_website' | 'official_menu' | 'google_maps' | 'delivery_listing' | 'publication' | 'operator' | 'social' | 'aggregator' | 'other';
  source_url: string; supports: string[]; source_date: string | null; date_checked: string;
  evidence_quality: 'primary' | 'strong_secondary' | 'weak_secondary'; notes: string | null;
}
export interface RestaurantTrendSignalRow extends Timestamps {
  id: string; restaurant_id: string; platform: string; signal_type: string; metric_value: number | null;
  metric_unit: string | null; creator_count: number | null; observed_at: string; source_id: string; confidence: Confidence; notes: string | null;
}

export interface RestaurantIntelligence {
  brand: RestaurantBrandRow | null;
  branches: RestaurantBranchRow[];
  bestSellers: RestaurantBestSellerRow[];
  deliveryListings: DeliveryPlatformListingRow[];
  sources: RestaurantSourceRow[];
  trendSignals: RestaurantTrendSignalRow[];
}
/** Phase 1 leaves legacy presentation/selection fields untouched. No branch is selected yet. */
export interface DeckRestaurant extends RestaurantItem {
  intelligence: RestaurantIntelligence;
  intelligenceStatus: 'available' | 'legacy_schema' | 'unavailable' | 'fallback';
  editorialRole: EditorialRole | null;
  trendStatus: TrendStatus;
  selectedBranch: RestaurantBranchRow | null;
  branchRating: number | null;
  reviewCount: number | null;
}
