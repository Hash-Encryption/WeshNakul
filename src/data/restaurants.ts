import { CITYWIDE_STAPLES } from './fallbackStaples';
import { JEDDAH_DISTRICTS } from './jeddahDistricts';
import type { RestaurantItem, TimeSlot } from '../types/restaurant';
import type { EatingMode } from '../types/database';

export const RESTAURANT_CATALOG = CITYWIDE_STAPLES;

function getCurrentTimeSlot(): TimeSlot {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'breakfast';
  if (hour >= 12 && hour < 17) return 'lunch';
  if (hour >= 17 && hour < 23) return 'dinner';
  return 'late_night';
}

export function isDineInEligible(restaurant: RestaurantItem): boolean {
  if (restaurant.diningMode === 'delivery_only') return false;
  const isCloudOrDeliveryOnly =
    restaurant.vibeTagsAr?.some((t) => t.includes('سحابي') || t.includes('توصيل فقط') || t.includes('بدون جلسات')) ||
    restaurant.vibeTagsEn?.some((t) => {
      const lower = t.toLowerCase();
      return lower.includes('cloud') || lower.includes('virtual') || lower.includes('delivery only') || lower.includes('no seating');
    });
  if (isCloudOrDeliveryOnly) return false;
  return restaurant.diningMode === 'both' || restaurant.diningMode === 'dine_in_only';
}

export function getDeckForRoom(
  categoryId: string,
  _city?: string,
  userDistrict?: string,
  catalogPool: RestaurantItem[] = CITYWIDE_STAPLES,
  eatingMode?: EatingMode
): RestaurantItem[] {
  let sourcePool = catalogPool;
  if (eatingMode === 'dine_in') {
    sourcePool = sourcePool.filter(isDineInEligible);
  }

  const currentSlot = getCurrentTimeSlot();
  const isLateNightHour = currentSlot === 'late_night';

  let pool = sourcePool.filter((r) => r.categories.includes(categoryId));

  if (pool.length < 5) {
    const fallbackStaples = eatingMode === 'dine_in' ? CITYWIDE_STAPLES.filter(isDineInEligible) : CITYWIDE_STAPLES;
    const staples = fallbackStaples.filter((s) => !pool.some((p) => p.id === s.id));
    pool = [...pool, ...staples];
  }

  if (isLateNightHour) {
    const openSpots = pool.filter((r) => r.isOpenLate || r.is24Hours);
    if (openSpots.length >= 5) {
      pool = openSpots;
    }
  }

  if (!userDistrict) {
    return pool.sort((a, b) => b.rating - a.rating).slice(0, 7);
  }

  const normalizedDistrict = userDistrict.toLowerCase().trim();
  const districtData = JEDDAH_DISTRICTS[normalizedDistrict];
  const neighborIds = districtData ? districtData.neighbors : [];

  const tier1Matches = pool.filter(
    (r) => r.isCityWide || r.branches.includes(normalizedDistrict)
  );

  const tier2Matches = pool.filter(
    (r) =>
      !r.isCityWide &&
      !r.branches.includes(normalizedDistrict) &&
      r.branches.some((b) => neighborIds.includes(b))
  );

  let deck = [...tier1Matches, ...tier2Matches];

  if (deck.length < 5) {
    const remaining = pool
      .filter((r) => !deck.some((d) => d.id === r.id))
      .sort((a, b) => b.rating - a.rating);
    deck = [...deck, ...remaining];
  }

  return deck.slice(0, 7);
}
