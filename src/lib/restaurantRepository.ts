import { CITYWIDE_STAPLES } from '../data/fallbackStaples';
import type { RestaurantItem } from '../types/restaurant';
import { normalizeRestaurantItem } from './restaurantNormalization';

// Winner rendering reuses the exact presentation records returned by the deck RPC.
const CACHE_KEY = 'wsh_deck_restaurants';

const storedRestaurants = (): RestaurantItem[] => {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CACHE_KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => normalizeRestaurantItem(item))
      .filter((item): item is RestaurantItem => Boolean(item));
  } catch {
    return [];
  }
};

const safeStaples = CITYWIDE_STAPLES
  .map((item) => normalizeRestaurantItem(item))
  .filter((item): item is RestaurantItem => Boolean(item));

const restaurantCache = new Map<string, RestaurantItem>(
  [...safeStaples, ...storedRestaurants()].map((item) => [item.id, item])
);

export function getCachedRestaurant(id: string): RestaurantItem | undefined {
  if (!id) return undefined;
  return restaurantCache.get(id);
}

export function cacheDeckRestaurants(restaurants: RestaurantItem[]): void {
  if (!Array.isArray(restaurants)) return;
  const validNormalized: RestaurantItem[] = [];
  restaurants.forEach((restaurant) => {
    const normalized = normalizeRestaurantItem(restaurant);
    if (normalized) {
      restaurantCache.set(restaurant.id, restaurant);
      validNormalized.push(normalized);
    }
  });

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(validNormalized));
    }
  } catch {
    /* storage is an optional reload optimization */
  }
}
