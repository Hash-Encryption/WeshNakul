import { CITYWIDE_STAPLES } from '../data/fallbackStaples';
import type { RestaurantItem } from '../types/restaurant';

// Winner rendering reuses the exact presentation records returned by the deck RPC.
const CACHE_KEY='wsh_deck_restaurants';
const storedRestaurants=()=>{try{const value=JSON.parse(localStorage.getItem(CACHE_KEY)||'[]');return Array.isArray(value)?value as RestaurantItem[]:[]}catch{return[]}};
const restaurantCache = new Map<string, RestaurantItem>([...CITYWIDE_STAPLES,...storedRestaurants()].map(item => [item.id, item]));

export function getCachedRestaurant(id: string): RestaurantItem | undefined {
  return restaurantCache.get(id);
}

export function cacheDeckRestaurants(restaurants: RestaurantItem[]): void {
  restaurants.forEach(restaurant => restaurantCache.set(restaurant.id, restaurant));
  try{localStorage.setItem(CACHE_KEY,JSON.stringify(restaurants))}catch{/* storage is an optional reload optimization */}
}
