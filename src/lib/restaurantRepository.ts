import { CITYWIDE_STAPLES } from '../data/fallbackStaples';
import type { RestaurantItem } from '../types/restaurant';

// Winner rendering reuses the exact presentation records returned by the deck RPC.
const restaurantCache = new Map<string, RestaurantItem>(CITYWIDE_STAPLES.map(item => [item.id, item]));

export function getCachedRestaurant(id: string): RestaurantItem | undefined {
  return restaurantCache.get(id);
}

export function cacheDeckRestaurants(restaurants: RestaurantItem[]): void {
  restaurants.forEach(restaurant => restaurantCache.set(restaurant.id, restaurant));
}
