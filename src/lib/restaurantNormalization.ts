import type {
  RestaurantItem,
  RestaurantDeck,
  PriceTier,
  DiningMode,
  TierType,
  TimeSlot,
} from '../types/restaurant';
import { logDeckError } from './observability';

const VALID_PRICE_TIERS = new Set<PriceTier>(['$', '$$', '$$$']);
const VALID_DINING_MODES = new Set<DiningMode>(['both', 'delivery_only', 'dine_in_only']);
const VALID_TIERS = new Set<TierType>(['staple', 'trend']);
const VALID_TIME_SLOTS = new Set<TimeSlot>(['breakfast', 'lunch', 'dinner', 'late_night']);

/**
 * Validates and normalizes a single candidate record into a strictly typed,
 * production-safe RestaurantItem.
 *
 * Rules:
 * 1. Required fields: `id` (non-empty string) and at least one non-empty name (`nameAr` or `nameEn`).
 *    If either required check fails, candidate is rejected and returns null.
 * 2. Optional fields receive safe defaults without inventing factual claims.
 * 3. Rating is safely parsed into a valid number or null.
 */
export function normalizeRestaurantItem(
  raw: unknown,
  context?: { roomId?: string; deckId?: string; index?: number }
): RestaurantItem | null {
  if (!raw || typeof raw !== 'object') {
    logDeckError({
      eventPhase: 'card_render',
      roomId: context?.roomId,
      deckId: context?.deckId,
      currentIndex: context?.index,
      message: 'Rejected restaurant candidate: payload is not an object',
      metadata: { rawType: typeof raw },
      isWarning: true,
    });
    return null;
  }

  const record = raw as Record<string, unknown>;

  // 1. Required: ID
  const rawId = record.id ?? record.restaurant_id;
  if (typeof rawId !== 'string' || !rawId.trim()) {
    logDeckError({
      eventPhase: 'card_render',
      roomId: context?.roomId,
      deckId: context?.deckId,
      currentIndex: context?.index,
      message: 'Rejected restaurant candidate: missing required string ID',
      metadata: { record },
      isWarning: true,
    });
    return null;
  }
  const id = rawId.trim();

  // 2. Required: Name (at least one valid name must exist)
  const rawNameAr = typeof record.nameAr === 'string' ? record.nameAr.trim() : typeof record.name_ar === 'string' ? record.name_ar.trim() : '';
  const rawNameEn = typeof record.nameEn === 'string' ? record.nameEn.trim() : typeof record.name_en === 'string' ? record.name_en.trim() : '';
  const rawNameGeneric = typeof record.name === 'string' ? record.name.trim() : '';

  if (!rawNameAr && !rawNameEn && !rawNameGeneric) {
    logDeckError({
      eventPhase: 'card_render',
      roomId: context?.roomId,
      deckId: context?.deckId,
      candidateId: id,
      restaurantBrandId: id,
      message: `Rejected restaurant candidate ${id}: missing required name`,
      isWarning: true,
    });
    return null;
  }

  const nameAr = rawNameAr || rawNameEn || rawNameGeneric;
  const nameEn = rawNameEn || rawNameAr || rawNameGeneric;

  // 3. Categories: safe string array, empty array if none
  const rawCategories = record.categories;
  const categories: string[] = Array.isArray(rawCategories)
    ? rawCategories.filter((c): c is string => typeof c === 'string' && Boolean(c.trim()))
    : typeof record.primary_category === 'string' && record.primary_category.trim()
    ? [record.primary_category.trim()]
    : [];

  // 4. Rating: safe parsing to number or null (never NaN, never undefined)
  let rating: number | null = null;
  const candidateRating = record.rating ?? record.google_rating;
  if (candidateRating !== null && candidateRating !== undefined) {
    const parsedRating = Number(candidateRating);
    if (!Number.isNaN(parsedRating) && Number.isFinite(parsedRating) && parsedRating > 0) {
      rating = Math.round(parsedRating * 10) / 10;
    }
  }

  // 5. Price Tier: preserve null if missing, never invent '$'
  const rawPriceTier = (record.priceTier || record.price_tier) as PriceTier;
  const priceTier: PriceTier | null = VALID_PRICE_TIERS.has(rawPriceTier) ? rawPriceTier : null;

  // 6. Vibe Tags: string array, never invented
  const rawVibeAr = record.vibeTagsAr ?? record.vibe_tags_ar;
  const vibeTagsAr: string[] = Array.isArray(rawVibeAr)
    ? rawVibeAr.filter((v): v is string => typeof v === 'string' && Boolean(v.trim()))
    : [];

  const rawVibeEn = record.vibeTagsEn ?? record.vibe_tags_en;
  const vibeTagsEn: string[] = Array.isArray(rawVibeEn)
    ? rawVibeEn.filter((v): v is string => typeof v === 'string' && Boolean(v.trim()))
    : [];

  // 7. Signature Dishes: preserve null if missing, never fabricate
  const signatureDishAr: string | null =
    typeof record.signatureDishAr === 'string' && record.signatureDishAr.trim()
      ? record.signatureDishAr.trim()
      : typeof record.signature_dish_ar === 'string' && record.signature_dish_ar.trim()
      ? record.signature_dish_ar.trim()
      : null;

  const signatureDishEn: string | null =
    typeof record.signatureDishEn === 'string' && record.signatureDishEn.trim()
      ? record.signatureDishEn.trim()
      : typeof record.signature_dish_en === 'string' && record.signature_dish_en.trim()
      ? record.signature_dish_en.trim()
      : null;

  // 8. Branches: string array
  const rawBranches = record.branches;
  const branches: string[] = Array.isArray(rawBranches)
    ? rawBranches.filter((b): b is string => typeof b === 'string' && Boolean(b.trim()))
    : [];

  // 9. Time slots: empty array if missing, never invent lunch/dinner
  const rawTimeSlots = record.timeSlots ?? record.time_slots;
  const timeSlots: TimeSlot[] = Array.isArray(rawTimeSlots)
    ? rawTimeSlots.filter((slot): slot is TimeSlot => VALID_TIME_SLOTS.has(slot as TimeSlot))
    : [];

  // 10. Dining Mode & Tier: preserve null if missing, never invent
  const rawDiningMode = (record.diningMode || record.dining_mode) as DiningMode;
  const diningMode: DiningMode | null = VALID_DINING_MODES.has(rawDiningMode) ? rawDiningMode : null;

  const rawTier = record.tier as TierType;
  const tier: TierType | null = VALID_TIERS.has(rawTier) ? rawTier : null;

  // 11. Closing time & prep minutes: preserve null if missing, never invent
  const closingTimeAr: string | null =
    typeof record.closingTimeAr === 'string' && record.closingTimeAr.trim()
      ? record.closingTimeAr.trim()
      : typeof record.closing_time_ar === 'string' && record.closing_time_ar.trim()
      ? record.closing_time_ar.trim()
      : null;

  const rawPrep = record.avgPrepMinutes ?? record.avg_prep_minutes;
  const avgPrepMinutes: number | null =
    typeof rawPrep === 'number' && Number.isFinite(rawPrep) && rawPrep > 0
      ? rawPrep
      : null;

  // 12. Platforms & Links
  const rawPlatforms = record.platforms as Record<string, unknown> | undefined;
  const platforms = {
    hungerstation: Boolean(rawPlatforms?.hungerstation),
    jahez: Boolean(rawPlatforms?.jahez),
    keeta: Boolean(rawPlatforms?.keeta),
  };

  const rawLinks = record.links as Record<string, unknown> | undefined;
  const links: Record<string, string | undefined> = {};
  if (rawLinks && typeof rawLinks === 'object') {
    for (const [k, v] of Object.entries(rawLinks)) {
      if (typeof v === 'string' && v.trim()) links[k] = v.trim();
    }
  }

  // 13. Selected branch
  let selectedBranch: RestaurantItem['selectedBranch'] = null;
  const rawBranch = record.selectedBranch as Record<string, unknown> | undefined;
  if (rawBranch && typeof rawBranch === 'object' && rawBranch.id) {
    const branchRating = rawBranch.rating != null ? Number(rawBranch.rating) : null;
    const branchReviewCount = rawBranch.reviewCount != null ? Number(rawBranch.reviewCount) : null;
    const branchDist = rawBranch.distanceKm != null ? Number(rawBranch.distanceKm) : null;

    selectedBranch = {
      id: String(rawBranch.id),
      nameAr: typeof rawBranch.nameAr === 'string' ? rawBranch.nameAr : null,
      nameEn: typeof rawBranch.nameEn === 'string' ? rawBranch.nameEn : null,
      district: typeof rawBranch.district === 'string' ? rawBranch.district : null,
      addressAr: typeof rawBranch.addressAr === 'string' ? rawBranch.addressAr : null,
      addressEn: typeof rawBranch.addressEn === 'string' ? rawBranch.addressEn : null,
      googleMapsUrl: typeof rawBranch.googleMapsUrl === 'string' ? rawBranch.googleMapsUrl : null,
      distanceKm: branchDist != null && !Number.isNaN(branchDist) ? branchDist : null,
      rating: branchRating != null && !Number.isNaN(branchRating) ? branchRating : null,
      reviewCount: branchReviewCount != null && !Number.isNaN(branchReviewCount) ? branchReviewCount : null,
    };
  }

  // 14. Image URL: verified URL or undefined, never a stock photo
  const imageUrl = typeof record.imageUrl === 'string' && record.imageUrl.trim() ? record.imageUrl.trim() : undefined;

  const result: RestaurantItem = {
    id,
    nameAr,
    nameEn,
    categories,
    isCityWide: Boolean(record.isCityWide || record.is_city_wide),
    branches,
    diningMode,
    timeSlots,
    closingTimeAr,
    isOpenLate: Boolean(record.isOpenLate || record.is_open_late),
    is24Hours: Boolean(record.is24Hours || record.is_24_hours),
    avgPrepMinutes,
    tier,
    priceTier,
    signatureDishAr,
    signatureDishEn,
    vibeTagsAr,
    vibeTagsEn,
    rating,
    platforms,
    links,
  };

  if (typeof record.name === 'string') {
    result.name = record.name;
  }
  if (imageUrl) {
    result.imageUrl = imageUrl;
  }
  if (record.selectedBranch !== undefined) {
    result.selectedBranch = selectedBranch;
  }

  return result;
}

/**
 * Normalizes an entire deck payload, filtering out unusable candidates
 * and ensuring unique candidate IDs in the resulting array.
 */
export function normalizeRestaurantDeck(
  raw: unknown,
  context?: { roomId?: string; afterDeckId?: string }
): RestaurantDeck | null {
  if (!raw || typeof raw !== 'object') {
    logDeckError({
      eventPhase: 'deck_generation',
      roomId: context?.roomId,
      message: 'Cannot normalize deck: payload is not an object',
      metadata: { rawType: typeof raw },
    });
    return null;
  }

  const record = raw as Record<string, unknown>;
  const deckId = typeof record.deckId === 'string' && record.deckId.trim() ? record.deckId.trim() : '';
  const generation = typeof record.generation === 'number' && Number.isFinite(record.generation) ? record.generation : 0;

  if (!deckId) {
    logDeckError({
      eventPhase: 'deck_generation',
      roomId: context?.roomId,
      message: 'Deck normalization failed: missing or empty deckId',
      metadata: { record },
    });
    return null;
  }

  const rawList = Array.isArray(record.restaurants) ? record.restaurants : [];
  const seenIds = new Set<string>();
  const normalizedRestaurants: RestaurantItem[] = [];

  rawList.forEach((rawItem, index) => {
    const item = normalizeRestaurantItem(rawItem, {
      roomId: context?.roomId,
      deckId,
      index,
    });

    if (!item) {
      logDeckError({
        eventPhase: 'deck_generation',
        roomId: context?.roomId,
        deckId,
        currentIndex: index,
        message: `Skipping malformed candidate at index ${index} during deck normalization`,
        isWarning: true,
      });
      return;
    }

    if (seenIds.has(item.id)) {
      logDeckError({
        eventPhase: 'deck_generation',
        roomId: context?.roomId,
        deckId,
        candidateId: item.id,
        message: `Skipping duplicate restaurant ${item.id} in deck ${deckId}`,
        isWarning: true,
      });
      return;
    }

    seenIds.add(item.id);
    normalizedRestaurants.push(item);
  });

  return {
    deckId,
    generation,
    restaurants: normalizedRestaurants,
  };
}
