export type PriceTier = '$' | '$$' | '$$$';
export type TimeSlot = 'breakfast' | 'lunch' | 'dinner' | 'late_night';
export type DiningMode = 'both' | 'delivery_only' | 'dine_in_only';
export type TierType = 'staple' | 'trend';

export interface RestaurantPlatforms {
  hungerstation: boolean;
  jahez: boolean;
  keeta: boolean;
}

export interface RestaurantLinks {
  googleMaps: string;
  hungerstationSearch: string;
  jahezSearch: string;
  keetaSearch: string;
}

export interface RestaurantItem {
  id: string;
  nameAr: string;
  nameEn: string;
  categories: string[];
  isCityWide: boolean;
  branches: string[];
  diningMode: DiningMode;
  timeSlots: TimeSlot[];
  closingTimeAr: string;
  isOpenLate: boolean;
  is24Hours: boolean;
  avgPrepMinutes: number;
  tier: TierType;
  priceTier: PriceTier;
  signatureDishAr: string;
  signatureDishEn: string;
  vibeTagsAr: string[];
  vibeTagsEn: string[];
  rating: number;
  platforms: RestaurantPlatforms;
  links: RestaurantLinks;
  imageUrl?: string;
}

export interface RestaurantSwipe {
  id: string;
  roomId: string;
  participantId: string;
  restaurantId: string;
  liked: boolean;
  createdAt: string;
}
