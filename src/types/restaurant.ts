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
  googleMaps?: string;
  hungerstation?: string;
  hungerstationSearch?: string;
  jahez?: string;
  jahezSearch?: string;
  keeta?: string;
  keetaSearch?: string;
  [key: string]: string | undefined;
}

export interface RestaurantItem {
  id: string;
  name?: string;
  nameAr: string;
  nameEn: string;
  categories: string[];
  isCityWide: boolean;
  branches: string[];
  diningMode?: DiningMode | null;
  timeSlots?: TimeSlot[];
  closingTimeAr?: string | null;
  isOpenLate: boolean;
  is24Hours: boolean;
  avgPrepMinutes?: number | null;
  tier?: TierType | null;
  priceTier?: PriceTier | null;
  signatureDishAr?: string | null;
  signatureDishEn?: string | null;
  vibeTagsAr: string[];
  vibeTagsEn: string[];
  rating: number | null;
  platforms: RestaurantPlatforms;
  links: RestaurantLinks;
  imageUrl?: string;
  selectedBranch?: {
    id: string;
    nameAr: string | null;
    nameEn: string | null;
    district: string | null;
    addressAr: string | null;
    addressEn: string | null;
    googleMapsUrl: string | null;
    distanceKm: number | null;
    rating: number | null;
    reviewCount: number | null;
  } | null;
}

export interface RestaurantDeck {
  deckId: string;
  generation: number;
  restaurants: RestaurantItem[];
}

export interface RestaurantSwipe {
  id: string;
  roomId: string;
  participantId: string;
  restaurantId: string;
  liked: boolean;
  createdAt: string;
}

export type RestaurantVote = 'YES' | 'NO' | 'LATER';
