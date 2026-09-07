import type { SupabaseClient } from '@supabase/supabase-js';
import { CITYWIDE_STAPLES } from '../data/fallbackStaples';
import type { RestaurantItem } from '../types/restaurant';
import type { DeckRestaurant, LegacyRestaurantRow, RestaurantBrandRow, RestaurantIntelligence, RestaurantBranchRow, RestaurantBestSellerRow, DeliveryPlatformListingRow, RestaurantSourceRow, RestaurantTrendSignalRow } from '../types/restaurantIntelligence';

export function mapLegacyRestaurant(row: LegacyRestaurantRow): RestaurantItem {
  return {
    id: row.id, nameAr: row.name_ar, nameEn: row.name_en, categories: row.categories || [],
    isCityWide: row.is_city_wide, branches: row.branches || [], diningMode: row.dining_mode,
    timeSlots: row.time_slots || [], closingTimeAr: row.closing_time_ar, isOpenLate: row.is_open_late,
    is24Hours: row.is_24_hours, avgPrepMinutes: row.avg_prep_minutes, tier: row.tier, priceTier: row.price_tier,
    signatureDishAr: row.signature_dish_ar, signatureDishEn: row.signature_dish_en,
    vibeTagsAr: row.vibe_tags_ar || [], vibeTagsEn: row.vibe_tags_en || [], rating: Number(row.rating),
    platforms: row.platforms, links: row.links,
  };
}

export function projectRestaurant(
  legacy: RestaurantItem,
  intelligence: RestaurantIntelligence = { brand: null, branches: [], bestSellers: [], deliveryListings: [], sources: [], trendSignals: [] },
  status: DeckRestaurant['intelligenceStatus'] = intelligence.brand ? 'available' : 'legacy_schema',
): DeckRestaurant {
  return {
    ...legacy, intelligence, intelligenceStatus: status,
    editorialRole: intelligence.brand?.editorial_role ?? null,
    trendStatus: intelligence.brand?.trend_status ?? 'unknown',
    // Phase 2 owns room-specific branch selection and rating reliability. No brand rating is copied into a branch.
    selectedBranch: null, branchRating: null, reviewCount: null,
  };
}

// Cache retains the existing winner lookup behavior and stable brand IDs.
const restaurantCache = new Map<string, RestaurantItem>(CITYWIDE_STAPLES.map(r => [r.id, r]));
export function getCachedRestaurant(id: string): RestaurantItem | undefined { return restaurantCache.get(id); }

export async function fetchRestaurantPool(client: SupabaseClient | null, categoryId: string): Promise<DeckRestaurant[]> {
  const fallback = () => {
    const matched = CITYWIDE_STAPLES.filter(r => r.categories.includes(categoryId));
    return (matched.length ? matched : CITYWIDE_STAPLES).map(r => projectRestaurant(r, undefined, 'fallback'));
  };
  if (!client) return fallback();
  try {
    // Keep the current category query unchanged; new research ingestion must supply legacy compatibility columns.
    const { data, error } = await client.from('restaurants').select('*').contains('categories', [categoryId]).returns<(LegacyRestaurantRow | RestaurantBrandRow)[]>();
    if (error || !data?.length) return fallback();
    const brands = [...new Map(data.map(row => [row.id, row])).values()];
    const ids = brands.map(row => row.id);
    const hasV2 = brands.every(row => 'intelligence_origin' in row);
    let status: DeckRestaurant['intelligenceStatus'] = hasV2 ? 'available' : 'legacy_schema';
    let branches: RestaurantBranchRow[] = [], bestSellers: RestaurantBestSellerRow[] = [], deliveryListings: DeliveryPlatformListingRow[] = [], sources: RestaurantSourceRow[] = [], trendSignals: RestaurantTrendSignalRow[] = [];
    if (hasV2) {
      // One batch per entity, never one query per card or branch. Partial failures retain the legacy DB pool.
      try {
        const results = await Promise.all([
          client.from('restaurant_branches').select('*').in('restaurant_id', ids).returns<RestaurantBranchRow[]>(),
          client.from('restaurant_best_sellers').select('*').in('restaurant_id', ids).order('sort_order').returns<RestaurantBestSellerRow[]>(),
          client.from('delivery_platform_listings').select('*').in('restaurant_id', ids).returns<DeliveryPlatformListingRow[]>(),
          client.from('restaurant_sources').select('*').in('restaurant_id', ids).returns<RestaurantSourceRow[]>(),
          client.from('restaurant_trend_signals').select('*').in('restaurant_id', ids).returns<RestaurantTrendSignalRow[]>(),
        ]);
        if (results.some(result => result.error)) status = 'unavailable';
        else [branches, bestSellers, deliveryListings, sources, trendSignals] = results.map(r => r.data ?? []) as [RestaurantBranchRow[], RestaurantBestSellerRow[], DeliveryPlatformListingRow[], RestaurantSourceRow[], RestaurantTrendSignalRow[]];
      } catch { status = 'unavailable'; }
    }
    const items = brands.map(row => projectRestaurant(mapLegacyRestaurant(row), {
      brand: 'intelligence_origin' in row ? row : null,
      branches: branches.filter(b => b.restaurant_id === row.id),
      bestSellers: bestSellers.filter(b => b.restaurant_id === row.id),
      deliveryListings: deliveryListings.filter(b => b.restaurant_id === row.id),
      sources: sources.filter(b => b.restaurant_id === row.id),
      trendSignals: trendSignals.filter(b => b.restaurant_id === row.id),
    }, status));
    items.forEach(item => restaurantCache.set(item.id, item));
    return items;
  } catch { return fallback(); }
}
