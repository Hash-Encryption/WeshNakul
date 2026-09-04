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
  { id: 'flexible', icon: '🎲', ar: 'أي شيء معاكم', en: 'Anything / Flexible', isWildcard: true }
];

export interface ConsensusResult {
  status: 'UNANIMOUS_MATCH' | 'UNANIMOUS_TIE' | 'CONTENDERS_FOUND' | 'NO_CONSENSUS';
  winner?: string;
  tiedCategories?: string[];
  topCategories?: { id: string; count: number; percentage: number }[];
  tally: Record<string, number>;
  totalSubmitted: number;
}

export function calculateConsensus(
  submissions: { participant_id: string; selected_categories: string[] }[]
): ConsensusResult {
  const totalSubmitted = submissions.length;
  if (totalSubmitted === 0) {
    return { status: 'NO_CONSENSUS', tally: {}, totalSubmitted: 0 };
  }

  const baseCategories = FOOD_CATEGORIES.filter((c) => !c.isWildcard).map((c) => c.id);
  const tally: Record<string, number> = {};
  baseCategories.forEach((id) => (tally[id] = 0));

  const directlyVotedCategories = new Set<string>();
  submissions.forEach((sub) => {
    sub.selected_categories.forEach((cat) => {
      if (cat !== 'flexible') directlyVotedCategories.add(cat);
    });
  });

  submissions.forEach((sub) => {
    const isFlexible = sub.selected_categories.includes('flexible');
    baseCategories.forEach((catId) => {
      const votedDirectly = sub.selected_categories.includes(catId);
      const votedViaFlexible = isFlexible && directlyVotedCategories.has(catId);
      const allFlexibleFallback = isFlexible && directlyVotedCategories.size === 0;

      if (votedDirectly || votedViaFlexible || allFlexibleFallback) {
        tally[catId] = (tally[catId] || 0) + 1;
      }
    });
  });

  const scored = baseCategories
    .map((id) => ({
      id,
      count: tally[id] || 0,
      percentage: (tally[id] || 0) / totalSubmitted
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const unanimousWinners = scored.filter((s) => s.percentage === 1.0);

  if (unanimousWinners.length === 1) {
    return {
      status: 'UNANIMOUS_MATCH',
      winner: unanimousWinners[0].id,
      tally,
      totalSubmitted
    };
  }

  if (unanimousWinners.length > 1) {
    return {
      status: 'UNANIMOUS_TIE',
      tiedCategories: unanimousWinners.map((w) => w.id),
      tally,
      totalSubmitted
    };
  }

  const contenders = scored.filter((s) => s.percentage >= 0.6);
  if (contenders.length > 0) {
    return {
      status: 'CONTENDERS_FOUND',
      topCategories: contenders,
      tally,
      totalSubmitted
    };
  }

  return {
    status: 'NO_CONSENSUS',
    topCategories: scored.slice(0, 3),
    tally,
    totalSubmitted
  };
}

export function getCategoryById(id: string): FoodCategoryDef | undefined {
  return FOOD_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryName(id: string, locale: 'ar' | 'en' = 'ar'): string {
  const cat = getCategoryById(id);
  if (!cat) return id;
  return locale === 'ar' ? cat.ar : cat.en;
}
