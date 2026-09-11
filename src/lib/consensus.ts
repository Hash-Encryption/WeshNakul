export interface FoodCategoryDef {
  id: string;
  icon: string;
  ar: string;
  en: string;
  isWildcard?: boolean;
}

export const FOOD_CATEGORIES: FoodCategoryDef[] = [
  { id: 'burger', icon: '🍔', ar: 'برجر', en: 'Burger' },
  { id: 'shawarma', icon: '🌯', ar: 'شاورما', en: 'Shawarma' },
  { id: 'fried_chicken', icon: '🍗', ar: 'دجاج مقلي', en: 'Fried Chicken' },
  { id: 'broast', icon: '🍟', ar: 'بروستد', en: 'Broasted' },
  { id: 'rice', icon: '🍚', ar: 'كبسة ورز', en: 'Rice & Kabsa' },
  { id: 'grill', icon: '🍢', ar: 'مشاوي', en: 'Grills' },
  { id: 'pizza', icon: '🍕', ar: 'بيتزا', en: 'Pizza' },
  { id: 'sushi', icon: '🍣', ar: 'سوشي', en: 'Sushi' },
  { id: 'italian', icon: '🍝', ar: 'إيطالي', en: 'Italian' },
  { id: 'asian', icon: '🥢', ar: 'آسيوي', en: 'Asian' },
  { id: 'seafood', icon: '🐟', ar: 'بحري', en: 'Seafood' },
  { id: 'breakfast', icon: '🍳', ar: 'فطور ونواشف', en: 'Breakfast' },
  { id: 'healthy', icon: '🥗', ar: 'صحي ودايت', en: 'Healthy' },
  { id: 'coffee', icon: '☕', ar: 'قهوة وحلا', en: 'Café & Sweets' },
  { id: 'dessert', icon: '🍦', ar: 'آيسكريم وحلى', en: 'Dessert' },
  { id: 'indian', icon: '🍛', ar: 'هندي وبيرياني', en: 'Indian & Biryani' },
  { id: 'fatayer', icon: '🥧', ar: 'فطاير ومعجنات', en: 'Fatayer & Manakish' },
  { id: 'street_folk', icon: '🧆', ar: 'فلافل ومطبق وشعبيات', en: 'Falafel & Street Food' },
  { id: 'mexican', icon: '🌮', ar: 'مكسيكي وتاكوز', en: 'Mexican & Tacos' },
  { id: 'sandwiches', icon: '🥪', ar: 'ساندوتشات وبريسكت', en: 'Sandwiches & Deli' },
  { id: 'flexible', icon: '🎲', ar: 'أي شيء معاكم', en: 'Anything / Flexible', isWildcard: true },
];

export const NEO_BRUTALIST_PALETTE = [
  '#FBBF24', // Slice 0: Amber
  '#FB923C', // Slice 1: Orange / Coral
  '#34D399', // Slice 2: Mint
  '#60A5FA', // Slice 3: Sky Blue
  '#F472B6', // Slice 4: Pink
  '#A78BFA', // Slice 5: Purple
];

export function getCategoryById(id: string): FoodCategoryDef | undefined {
  return FOOD_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryName(id: string, locale: 'ar' | 'en' = 'ar'): string {
  const cat = getCategoryById(id);
  if (!cat) return id;
  return locale === 'ar' ? cat.ar : cat.en;
}
