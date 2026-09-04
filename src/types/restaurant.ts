export type PriceTier = '$' | '$$' | '$$$';

export interface RestaurantItem {
  id: string;
  nameAr: string;
  nameEn: string;
  categoryId: string;
  cities: string[];
  districts?: string[];
  priceTier: PriceTier;
  signatureDishAr: string;
  signatureDishEn: string;
  vibeTagsAr: string[];
  vibeTagsEn: string[];
  imageUrl: string;
  rating: number;
}

export interface RestaurantSwipe {
  id: string;
  roomId: string;
  participantId: string;
  restaurantId: string;
  liked: boolean;
  createdAt: string;
}
