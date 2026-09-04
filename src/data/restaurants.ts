import type { RestaurantItem } from '../types/restaurant';

export const RESTAURANT_CATALOG: RestaurantItem[] = [
  // BURGERS
  {
    id: 'rest_burger_01',
    nameAr: 'شيفز برجر',
    nameEn: "Chef's Burger",
    categoryId: 'burger',
    cities: ['riyadh', 'jeddah'],
    districts: ['al-olaya', 'al-nakheel', 'al-rawdah'],
    priceTier: '$$',
    signatureDishAr: 'برجر بريسكت مدخن 🥩',
    signatureDishEn: 'Smoked Brisket Burger 🥩',
    vibeTagsAr: ['لحم طازج', 'جلسات شباب', 'صوصات خاصة'],
    vibeTagsEn: ['Fresh Beef', 'Casual Squad', 'Special Sauces'],
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    rating: 4.7
  },
  {
    id: 'rest_burger_02',
    nameAr: 'سنشري برجر',
    nameEn: 'Century Burger',
    categoryId: 'burger',
    cities: ['riyadh', 'jeddah', 'dammam_khobar'],
    districts: ['al-malqa', 'al-zahra', 'al-shatie'],
    priceTier: '$$$',
    signatureDishAr: 'ترافل برجر مع بطاطس مقرمشة 🍄',
    signatureDishEn: 'Truffle Burger with Crispy Fries 🍄',
    vibeTagsAr: ['رايق', 'ترافل', 'عائلي وشباب'],
    vibeTagsEn: ['Premium', 'Truffle', 'Cozy'],
    imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
    rating: 4.8
  },
  {
    id: 'rest_burger_03',
    nameAr: 'سككشن-بي',
    nameEn: 'Section-B',
    categoryId: 'burger',
    cities: ['jeddah', 'riyadh'],
    districts: ['al-andalus', 'hittin'],
    priceTier: '$$$',
    signatureDishAr: 'برجر (B) الكلاسيكي 🍔',
    signatureDishEn: 'Classic (B) Burger 🍔',
    vibeTagsAr: ['ترند', 'أجواء حماسية', 'بطاطس مميزة'],
    vibeTagsEn: ['Trendy', 'High Energy', 'Loaded Fries'],
    imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
    rating: 4.9
  },
  {
    id: 'rest_burger_04',
    nameAr: 'سولت',
    nameEn: 'SALT',
    categoryId: 'burger',
    cities: ['riyadh', 'dammam_khobar', 'jeddah'],
    priceTier: '$$',
    signatureDishAr: 'أوريجينال سلايدرز بالجبن الذائب 🧀',
    signatureDishEn: 'Original Sliders with Melted Cheese 🧀',
    vibeTagsAr: ['جلسة خارجية', 'سلايدرز', 'شهرة واسعة'],
    vibeTagsEn: ['Outdoor Vibe', 'Sliders', 'Iconic'],
    imageUrl: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800&auto=format&fit=crop&q=80',
    rating: 4.6
  },
  {
    id: 'rest_burger_05',
    nameAr: 'واغيو برجر',
    nameEn: 'Wagyu Burger',
    categoryId: 'burger',
    cities: ['riyadh', 'jeddah'],
    priceTier: '$$$',
    signatureDishAr: 'واغيو دبل برجر مدخن 🥩🍔',
    signatureDishEn: 'Double Smoked Wagyu Burger 🥩🍔',
    vibeTagsAr: ['لحم فاخر', 'جودة عالية', 'جلسات رايقة'],
    vibeTagsEn: ['Luxury Beef', 'High Quality', 'Chic'],
    imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800&auto=format&fit=crop&q=80',
    rating: 4.8
  },
  {
    id: 'rest_burger_06',
    nameAr: 'كاليفورنيا برجر',
    nameEn: 'California Burger',
    categoryId: 'burger',
    cities: ['riyadh', 'jeddah'],
    priceTier: '$$',
    signatureDishAr: 'كاليفورنيا كلاسيك صوص خاص 🍟',
    signatureDishEn: 'California Classic Special Sauce 🍟',
    vibeTagsAr: ['سريع ولذيذ', 'صوص سري', 'شبابي'],
    vibeTagsEn: ['Fast & Tasty', 'Secret Sauce', 'Youthful'],
    imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&auto=format&fit=crop&q=80',
    rating: 4.5
  },

  // SHAWARMA
  {
    id: 'rest_shawarma_01',
    nameAr: 'ماما نورة',
    nameEn: 'Mama Noura',
    categoryId: 'shawarma',
    cities: ['riyadh'],
    districts: ['al-olaya', 'al-rahmania', 'al-suwaidi'],
    priceTier: '$',
    signatureDishAr: 'شاورما دجاج ثوم زيادة مع عصير كوكتيل 🌯🍹',
    signatureDishEn: 'Extra Garlic Chicken Shawarma with Cocktail Juice 🌯🍹',
    vibeTagsAr: ['أسطوري', 'سريع', 'ثوم لا يقاوم'],
    vibeTagsEn: ['Legendary', 'Fast', 'Garlic Heavy'],
    imageUrl: 'https://images.unsplash.com/photo-1637806930600-37fa8892069d?w=800&auto=format&fit=crop&q=80',
    rating: 4.8
  },
  {
    id: 'rest_shawarma_02',
    nameAr: 'شاورما شاكر الجزيرة',
    nameEn: 'Shaker Al Jazeerah',
    categoryId: 'shawarma',
    cities: ['jeddah'],
    districts: ['al-sharafeyah', 'al-hamra'],
    priceTier: '$',
    signatureDishAr: 'شاورما لحم بالطحينة والنعناع 🥙',
    signatureDishEn: 'Beef Shawarma with Tahini & Mint 🥙',
    vibeTagsAr: ['تاريخي', 'خبز صاج', 'لحم بلدي'],
    vibeTagsEn: ['Historic', 'Saj Bread', 'Fresh Lamb'],
    imageUrl: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=800&auto=format&fit=crop&q=80',
    rating: 4.7
  },
  {
    id: 'rest_shawarma_03',
    nameAr: 'شاورمر',
    nameEn: 'Shawarmer',
    categoryId: 'shawarma',
    cities: ['riyadh', 'jeddah', 'dammam_khobar'],
    priceTier: '$$',
    signatureDishAr: 'عربو مع صوص توميتو ودبس الرمان 🍱',
    signatureDishEn: 'Arabo Box with Pomegranate Molasses 🍱',
    vibeTagsAr: ['بوكسات مشاركة', 'سريع', 'خيارات منوعة'],
    vibeTagsEn: ['Share Boxes', 'Fast', 'Modern'],
    imageUrl: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800&auto=format&fit=crop&q=80',
    rating: 4.5
  },
  {
    id: 'rest_shawarma_04',
    nameAr: 'ذوق الخيام',
    nameEn: 'Thooq Al Khayam',
    categoryId: 'shawarma',
    cities: ['riyadh', 'dammam_khobar'],
    priceTier: '$',
    signatureDishAr: 'صاروخ شاورما مع شطة حارة وبطاطس 🌯🔥',
    signatureDishEn: 'Rocket Shawarma with Hot Sauce & Fries 🌯🔥',
    vibeTagsAr: ['شعبي', 'حار ولذيذ', 'سعر ممتاز'],
    vibeTagsEn: ['Authentic', 'Spicy', 'Budget Friendly'],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    rating: 4.6
  },
  {
    id: 'rest_shawarma_05',
    nameAr: 'بيت الشاورما',
    nameEn: 'Shawarma House',
    categoryId: 'shawarma',
    cities: ['riyadh', 'jeddah'],
    priceTier: '$$',
    signatureDishAr: 'شاورما عربي دبل مع صوصات مشكلة 🌯',
    signatureDishEn: 'Double Arabi Shawarma with Mixed Sauces 🌯',
    vibeTagsAr: ['جمعات شباب', 'منيو متنوع', 'سريع'],
    vibeTagsEn: ['Squad Hangout', 'Diverse Menu', 'Fast'],
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    rating: 4.6
  },
  {
    id: 'rest_shawarma_06',
    nameAr: 'جليلة',
    nameEn: 'Jaleelah',
    categoryId: 'shawarma',
    cities: ['jeddah', 'riyadh'],
    priceTier: '$$',
    signatureDishAr: 'شاورما لحم عجل على الفحم 🥩',
    signatureDishEn: 'Charcoal Grilled Veal Shawarma 🥩',
    vibeTagsAr: ['على الفحم', 'طعم غني', 'جلسات نظيفة'],
    vibeTagsEn: ['Charcoal Grilled', 'Rich Flavor', 'Clean Spot'],
    imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=800&auto=format&fit=crop&q=80',
    rating: 4.7
  },

  // SAUDI / KABSA / RICE
  {
    id: 'rest_saudi_01',
    nameAr: 'القرية النجدية',
    nameEn: 'Najd Village',
    categoryId: 'saudi_kabsa',
    cities: ['riyadh'],
    districts: ['al-olaya', 'al-yasmin'],
    priceTier: '$$$',
    signatureDishAr: 'كبسة حاشي مع جريش وقرصان 🥘',
    signatureDishEn: 'Hashi Kabsa with Jareesh & Qorsan 🥘',
    vibeTagsAr: ['تراثي', 'جلسة أرضية', 'ضيافة سعودية'],
    vibeTagsEn: ['Traditional', 'Floor Seating', 'Heritage'],
    imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800&auto=format&fit=crop&q=80',
    rating: 4.9
  },
  {
    id: 'rest_saudi_02',
    nameAr: 'الرومانسية',
    nameEn: 'Al Romansiah',
    categoryId: 'saudi_kabsa',
    cities: ['riyadh', 'jeddah', 'dammam_khobar'],
    priceTier: '$$',
    signatureDishAr: 'مندي دجاج مع مدفون لحم وشطة حارة 🍗',
    signatureDishEn: 'Chicken Mandi with Madfoon Lamb & Hot Sauce 🍗',
    vibeTagsAr: ['مضمون', 'جمعات عائلية', 'سريع'],
    vibeTagsEn: ['Reliable', 'Squad Feasts', 'Generous'],
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    rating: 4.6
  },
  {
    id: 'rest_saudi_03',
    nameAr: 'شواية الخليج',
    nameEn: 'Shawaya Al Khaleej',
    categoryId: 'saudi_kabsa',
    cities: ['riyadh', 'dammam_khobar', 'jeddah'],
    priceTier: '$',
    signatureDishAr: 'رز شواية أحمر مع دجاج محمر وإيدام 🍗🍚',
    signatureDishEn: 'Red Rice with Roasted Chicken & Stew 🍗🍚',
    vibeTagsAr: ['طعم أصيل', 'سريع ورخيص', 'أسطورة الرز'],
    vibeTagsEn: ['Authentic', 'Affordable', 'Rice Legend'],
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    rating: 4.7
  },
  {
    id: 'rest_saudi_04',
    nameAr: 'السدة',
    nameEn: 'Al Saddah',
    categoryId: 'saudi_kabsa',
    cities: ['jeddah', 'riyadh'],
    priceTier: '$$',
    signatureDishAr: 'مضبي لحم تيس مع رز شعبي 🍖',
    signatureDishEn: 'Madhbi Goat Meat with Folk Rice 🍖',
    vibeTagsAr: ['مضبي أصلي', 'لحوم بلدية', 'ضيافة'],
    vibeTagsEn: ['Authentic Madhbi', 'Fresh Meat', 'Hospitality'],
    imageUrl: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80',
    rating: 4.8
  },
  {
    id: 'rest_saudi_05',
    nameAr: 'بيت الشواية',
    nameEn: 'Bait Al Shawaya',
    categoryId: 'saudi_kabsa',
    cities: ['riyadh', 'dammam_khobar', 'jeddah'],
    priceTier: '$',
    signatureDishAr: 'نصف شواية مع كبسة بيضاء وكنافة 🍗🍮',
    signatureDishEn: 'Half Rotisserie Chicken with White Rice 🍗🍮',
    vibeTagsAr: ['شعبي مضمون', 'وجبة سريعة', 'سعر بطل'],
    vibeTagsEn: ['Folk Favorite', 'Quick Bite', 'Great Value'],
    imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&auto=format&fit=crop&q=80',
    rating: 4.5
  },

  // BROAST
  {
    id: 'rest_broast_01',
    nameAr: 'البيك',
    nameEn: 'Albaik',
    categoryId: 'broast',
    cities: ['jeddah', 'riyadh', 'dammam_khobar'],
    priceTier: '$',
    signatureDishAr: 'وجبة دجاج مسحب 10 قطع مع ثومية البيك الشهيرة 🍗🧄',
    signatureDishEn: '10-Piece Chicken Fillet Nuggets with Albaik Garlic 🍗🧄',
    vibeTagsAr: ['أسطورة سعودية', 'ثومية لا ترحم', 'سعر بطل'],
    vibeTagsEn: ['Saudi Legend', 'Signature Garlic', 'Unbeatable Value'],
    imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop&q=80',
    rating: 4.9
  },
  {
    id: 'rest_broast_02',
    nameAr: 'بروستد القريات',
    nameEn: 'Al Qaryat Broast',
    categoryId: 'broast',
    cities: ['riyadh'],
    priceTier: '$',
    signatureDishAr: 'بروستد حار مقرمش مع خبز صامولي وثوم 🍗🔥',
    signatureDishEn: 'Spicy Crispy Broast with Bun & Garlic 🍗🔥',
    vibeTagsAr: ['قرمشة خرافية', 'حار نار', 'شعبي أصيل'],
    vibeTagsEn: ['Ultra Crispy', 'Super Spicy', 'Authentic Broast'],
    imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=800&auto=format&fit=crop&q=80',
    rating: 4.7
  },
  {
    id: 'rest_broast_03',
    nameAr: 'كوزمو بروست',
    nameEn: 'Cozmo Broast',
    categoryId: 'broast',
    cities: ['jeddah', 'dammam_khobar'],
    priceTier: '$$',
    signatureDishAr: 'بروستد تندر مع بطاطس وافل وصوص سري 🍗🍟',
    signatureDishEn: 'Tenders Broast with Waffle Fries 🍗🍟',
    vibeTagsAr: ['شبابي', 'صوصات مبتكرة', 'نظيف'],
    vibeTagsEn: ['Modern Squad', 'Craft Sauces', 'Crispy'],
    imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&auto=format&fit=crop&q=80',
    rating: 4.6
  },
  {
    id: 'rest_broast_04',
    nameAr: 'بروستد لايت هاوس',
    nameEn: 'Light House Broast',
    categoryId: 'broast',
    cities: ['riyadh', 'jeddah'],
    priceTier: '$',
    signatureDishAr: 'وجبة نصف دجاج بروستد مع حمص وثوم 🍗',
    signatureDishEn: 'Half Chicken Broast with Hummus & Garlic 🍗',
    vibeTagsAr: ['كلاسيكي', 'ثوم زيادة', 'سريع'],
    vibeTagsEn: ['Classic', 'Extra Garlic', 'Fast'],
    imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800&auto=format&fit=crop&q=80',
    rating: 4.5
  },
  {
    id: 'rest_broast_05',
    nameAr: 'توب توب بروست',
    nameEn: 'Top Top Broast',
    categoryId: 'broast',
    cities: ['riyadh', 'dammam_khobar'],
    priceTier: '$',
    signatureDishAr: 'بروستد حراق مقرمش مع صوص جبن 🍗🧀',
    signatureDishEn: 'Extra Spicy Broast with Cheese Dip 🍗🧀',
    vibeTagsAr: ['حراق', 'قرمشة عالية', 'سعر اقتصادي'],
    vibeTagsEn: ['Fiery Spicy', 'High Crunch', 'Budget'],
    imageUrl: 'https://images.unsplash.com/photo-1527477321007-448bf6582ddb?w=800&auto=format&fit=crop&q=80',
    rating: 4.6
  },

  // PIZZA
  {
    id: 'rest_pizza_01',
    nameAr: 'مايسترو بيتزا',
    nameEn: 'Maestro Pizza',
    categoryId: 'pizza',
    cities: ['riyadh', 'jeddah', 'dammam_khobar'],
    priceTier: '$$',
    signatureDishAr: 'بيتزا شاورما رانش مع ديب لافا كيك 🍕🍫',
    signatureDishEn: 'Shawarma Ranch Pizza with Lava Cake 🍕🍫',
    vibeTagsAr: ['عروض قوية', 'توصيل سريع', 'عجينة رقيقة'],
    vibeTagsEn: ['Great Offers', 'Fast Delivery', 'Thin Crust'],
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    rating: 4.6
  },
  {
    id: 'rest_pizza_02',
    nameAr: 'بلانكا بيتزا',
    nameEn: 'Blanca Pizzeria',
    categoryId: 'pizza',
    cities: ['riyadh'],
    districts: ['al-malqa', 'al-yasmin'],
    priceTier: '$$$',
    signatureDishAr: 'بيتزا نابوليتانا ترافل وفطر طازج 🍕🍄',
    signatureDishEn: 'Neapolitan Truffle & Fresh Mushroom Pizza 🍕🍄',
    vibeTagsAr: ['حطب أصلي', 'أجواء إيطالية', 'رايق جداً'],
    vibeTagsEn: ['Wood Fired', 'Italian Mood', 'Artisanal'],
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
    rating: 4.8
  },
  {
    id: 'rest_pizza_03',
    nameAr: 'كراست بيتزا',
    nameEn: 'Crust Pizzeria',
    categoryId: 'pizza',
    cities: ['jeddah', 'dammam_khobar'],
    priceTier: '$$',
    signatureDishAr: 'بيبروني مع عسل حار وعجينة مخمرة 🍕🍯',
    signatureDishEn: 'Hot Honey Pepperoni on Sourdough Crust 🍕🍯',
    vibeTagsAr: ['عجينة تخمير بطيء', 'ترند', 'شبابي'],
    vibeTagsEn: ['Sourdough Crust', 'Trending', 'Cool Spot'],
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
    rating: 4.7
  },
  {
    id: 'rest_pizza_04',
    nameAr: 'فينو بيتزا بار',
    nameEn: 'Fino Pizza Bar',
    categoryId: 'pizza',
    cities: ['riyadh', 'jeddah'],
    priceTier: '$$$',
    signatureDishAr: 'مارغريتا بافلو مع ريحان طازج 🍕🌿',
    signatureDishEn: 'Buffalo Margherita with Fresh Basil 🍕🌿',
    vibeTagsAr: ['راقي', 'مكونات إيطالية', 'جلسات أنيقة'],
    vibeTagsEn: ['Chic', 'Imported Cheese', 'Refined'],
    imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800&auto=format&fit=crop&q=80',
    rating: 4.7
  },
  {
    id: 'rest_pizza_05',
    nameAr: 'بيتزا هت',
    nameEn: 'Pizza Hut',
    categoryId: 'pizza',
    cities: ['riyadh', 'jeddah', 'dammam_khobar'],
    priceTier: '$$',
    signatureDishAr: 'سوبر سوبريم ستافد كراست جبنة 🍕🧀',
    signatureDishEn: 'Super Supreme Cheese Stuffed Crust 🍕🧀',
    vibeTagsAr: ['كلاسيك الطيبين', 'ستافد كراست', 'جمعات'],
    vibeTagsEn: ['Nostalgic', 'Stuffed Crust', 'Group Feast'],
    imageUrl: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop&q=80',
    rating: 4.4
  }
];

/**
 * Deck Size & Fallback Chain:
 * Decks must strictly contain between 5 and 7 cards.
 * Fallback sequence:
 * Category + District -> Category + City -> Category (All Cities) -> Top Rated Overall.
 */
export function getDeckForRoom(categoryId: string, city: string, district?: string): RestaurantItem[] {
  const normalizedCategory = (categoryId || 'burger').toLowerCase();
  const normalizedCity = (city || 'riyadh').toLowerCase();
  const normalizedDistrict = district ? district.toLowerCase().trim() : '';

  let deck: RestaurantItem[] = [];

  // 1. Category + District (if district provided)
  if (normalizedDistrict) {
    deck = RESTAURANT_CATALOG.filter(
      (r) =>
        r.categoryId === normalizedCategory &&
        r.cities.includes(normalizedCity) &&
        r.districts?.some((d) => d.toLowerCase().includes(normalizedDistrict))
    );
  }

  // 2. Category + City fallback
  if (deck.length < 5) {
    const cityMatches = RESTAURANT_CATALOG.filter(
      (r) =>
        r.categoryId === normalizedCategory &&
        r.cities.includes(normalizedCity) &&
        !deck.some((existing) => existing.id === r.id)
    );
    deck = [...deck, ...cityMatches];
  }

  // 3. Category (All Cities) fallback
  if (deck.length < 5) {
    const categoryMatches = RESTAURANT_CATALOG.filter(
      (r) =>
        r.categoryId === normalizedCategory &&
        !deck.some((existing) => existing.id === r.id)
    );
    deck = [...deck, ...categoryMatches];
  }

  // 4. Top Rated Overall fallback (any category, sorted descending by rating)
  if (deck.length < 5) {
    const topOverall = [...RESTAURANT_CATALOG]
      .filter((r) => !deck.some((existing) => existing.id === r.id))
      .sort((a, b) => b.rating - a.rating);
    deck = [...deck, ...topOverall];
  }

  // Strictly return between 5 and 7 cards
  return deck.slice(0, 7);
}
