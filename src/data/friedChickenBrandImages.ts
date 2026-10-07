/**
 * WeshNakul — Fried Chicken Brand Image Registry
 *
 * Source of truth: docs/research/weshnakul_fried_chicken_images_approved.json
 * Rules:
 * - One food-focused image per brand
 * - Preserves aspect ratio with object-fit: cover in UI cards
 * - Deterministic filenames based on canonical brand slug
 * - No hotlinking in production
 * - Dedicated Broast rotation pool: rami_broast, al_najah_broast, broast_hanoo
 */

export interface FriedChickenBrandImageMetadata {
  brandId: string;
  canonicalName: string;
  localPath: string | null;
  status: 'approved' | 'failed_download' | 'source_only';
  sourceUrl: string;
  source: string;
  targetImage: string;
  isBroastRotationMember: boolean;
  notes: string;
}

export const FRIED_CHICKEN_BRAND_IMAGES: FriedChickenBrandImageMetadata[] = [
  {
    brandId: 'albaik',
    canonicalName: 'ALBAIK',
    localPath: '/images/restaurants/fried_chicken/albaik.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/menus/menuitem/hsimg-34006599-1740486016?quality=75&width=1440',
    source: 'HungerStation (ALBAIK)',
    targetImage: 'ALBAIK 4 Piece Chicken Meal / signature fried chicken meal',
    isBroastRotationMember: false,
    notes: 'Anchor brand; stays in general Fried Chicken pool, not in rotation slot.',
  },
  {
    brandId: 'raising_canes',
    canonicalName: "Raising Cane's",
    localPath: '/images/restaurants/fried_chicken/raising-canes.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-en/restaurant/riyadh/riyadh/85369',
    source: "HungerStation (Raising Cane's)",
    targetImage: "The Box Combo / signature chicken fingers with fries, toast and Cane's sauce",
    isBroastRotationMember: false,
    notes: "Official Box Combo product shot.",
  },
  {
    brandId: 'kfc',
    canonicalName: 'KFC',
    localPath: '/images/restaurants/fried_chicken/kfc.webp',
    status: 'approved',
    sourceUrl: 'https://img.ananinja.com/media/ninja-catalog-42/restaurants/pvemxhrq7p1204p9k9n8vib6t3tw/1216.jpg?q=75&w=1080',
    source: 'Ninja Catalog (KFC)',
    targetImage: 'Saudi KFC fried chicken bucket/meal; food must dominate',
    isBroastRotationMember: false,
    notes: 'Official Saudi KFC fried chicken meal shot.',
  },
  {
    brandId: 'texas_chicken',
    canonicalName: 'Texas Chicken',
    localPath: '/images/restaurants/fried_chicken/texas-chicken.webp',
    status: 'approved',
    sourceUrl: 'https://img.ananinja.com/media/ninja-catalog-42/restaurants/kdycqhskww3036tthetyh0bd8n9c/92414.jpg',
    source: 'Ninja Catalog (Texas Chicken)',
    targetImage: '2-piece fried chicken meal with fries and bun',
    isBroastRotationMember: false,
    notes: 'Official Texas Chicken 2-piece meal with fries.',
  },
  {
    brandId: 'popeyes',
    canonicalName: 'Popeyes',
    localPath: '/images/restaurants/fried_chicken/popeyes.jpg',
    status: 'approved',
    sourceUrl: 'https://www.timeoutriyadh.com/cloud/timeoutriyadh/2022/02/16/popeyes-saudi-arabia-768x576-1-1024x768-1.jpg',
    source: 'Time Out Riyadh (Popeyes Saudi Arabia)',
    targetImage: 'Popeyes branded fried chicken spread/family meal',
    isBroastRotationMember: false,
    notes: 'Editorial spread of signature Popeyes crispy fried chicken.',
  },
  {
    brandId: 'daves_hot_chicken',
    canonicalName: "Dave's Hot Chicken",
    localPath: '/images/restaurants/fried_chicken/daves-hot-chicken.jpg',
    status: 'approved',
    sourceUrl: 'https://www.caterermiddleeast.com/cloud/2026/03/31/Daves-Hot-Chicken-Jeddah-expansion-copy-1024x768.jpg',
    source: 'Caterer Middle East',
    targetImage: "Dave's signature hot chicken tenders/sliders; chicken prominent",
    isBroastRotationMember: false,
    notes: "Official Dave's Hot Chicken Jeddah menu product shot.",
  },
  {
    brandId: 'tndr',
    canonicalName: 'TNDR',
    localPath: '/images/restaurants/fried_chicken/tndr.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/restaurant/android_cover_photo/2b42df4df5a85930d9efe2099b3aa7b0.jpg?quality=75&width=1200',
    source: 'HungerStation (TNDR)',
    targetImage: 'TNDR signature crispy chicken/tenders',
    isBroastRotationMember: false,
    notes: 'Official cover photo featuring signature crispy chicken tenders.',
  },
  {
    brandId: 'wingstop',
    canonicalName: 'Wingstop',
    localPath: '/images/restaurants/fried_chicken/wingstop.webp',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/menu-import-gateway-prd/regions/ME/chains/HS-WSTOP/2da8a707239f7f3ca9d209130a4c90f1.jpg?quality=75&webp=true&width=1080',
    source: 'HungerStation (Wingstop)',
    targetImage: 'Branded Wingstop wings platter; wings prominent',
    isBroastRotationMember: false,
    notes: 'Official Wingstop signature wings platter.',
  },
  {
    brandId: 'crusted',
    canonicalName: 'Crusted',
    localPath: '/images/restaurants/fried_chicken/crusted.jpg',
    status: 'approved',
    sourceUrl: 'https://www.arabnews.com/sites/default/files/styles/n_670_395/public/2025/11/29/4662983-401477762.jpg?itok=uUi7xTSK',
    source: 'Arab News',
    targetImage: 'Crusted Nashville fried chicken spread',
    isBroastRotationMember: false,
    notes: 'Crusted Jeddah Nashville hot fried chicken spread.',
  },
  {
    brandId: 'crisper',
    canonicalName: 'Crisper',
    localPath: '/images/restaurants/fried_chicken/crisper.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/menu-import-gateway-prd/regions/ME/chains/HS-CPR/74a0aee8af718e82bd1fcaebde0d55a0.jpg',
    source: 'HungerStation (Crisper)',
    targetImage: 'Crisper Nashville/strips meal; fried chicken prominent',
    isBroastRotationMember: false,
    notes: 'Crisper Nashville 3-piece tenders meal with fries.',
  },
  {
    brandId: 'dabboos',
    canonicalName: 'Dabboos',
    localPath: '/images/restaurants/fried_chicken/dabboos.jpg',
    status: 'approved',
    sourceUrl: 'https://dabboos.sa/wp-content/uploads/2026/09/DSC08673-copy-scaled.jpg',
    source: 'Dabboos official website',
    targetImage: 'User-approved official Dabboos food photo',
    isBroastRotationMember: false,
    notes: 'Official Dabboos fried chicken dish approved explicitly by user.',
  },
  {
    brandId: 'sayakh',
    canonicalName: 'Sayakh',
    localPath: '/images/restaurants/fried_chicken/sayakh.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/menu-import-gateway-prd/regions/ME/chains/HS-S5/65509e293ed03ad913d0692de9770749.jpg',
    source: 'HungerStation (Sayakh)',
    targetImage: 'Sayakh fried/broasted chicken food image',
    isBroastRotationMember: false,
    notes: 'Broasted Chicken meal with fries from Sayakh.',
  },
  {
    brandId: 'nashvilles_hot_chicken',
    canonicalName: "Nashville's Hot Chicken",
    localPath: '/images/restaurants/fried_chicken/nashvilles-hot-chicken.jpg',
    status: 'approved',
    sourceUrl: 'https://www.timeoutriyadh.com/cloud/timeoutriyadh/2024/09/16/Nashvilles-6-1000x750.jpg',
    source: 'Time Out Riyadh',
    targetImage: "Nashville's signature hot chicken/tenders",
    isBroastRotationMember: false,
    notes: "Nashville's signature hot chicken meal shot.",
  },
  {
    brandId: 'tenders_cart',
    canonicalName: 'Tenders Cart',
    localPath: '/images/restaurants/fried_chicken/tenders-cart.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/menuitem/image/29053565?quality=75&webp=true&width=1440',
    source: 'HungerStation (Tenders Cart)',
    targetImage: 'Signature chicken tenders meal',
    isBroastRotationMember: false,
    notes: 'Signature crispy chicken tenders box with sauce.',
  },
  {
    brandId: 'rami_broast',
    canonicalName: 'Rami Broast',
    localPath: '/images/restaurants/fried_chicken/rami-broast.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/restaurant/android_cover_photo/ae40711a2277c1dccbb33791916d305c.jpg',
    source: 'HungerStation (Rami Broast)',
    targetImage: 'Broasted Chicken Regular / signature broast meal',
    isBroastRotationMember: true,
    notes: 'Traditional Broast rotation member #1. Verified signature broast meal.',
  },
  {
    brandId: 'chicken_mubeen',
    canonicalName: 'Chicken Mubeen',
    localPath: '/images/restaurants/fried_chicken/chicken-mubeen.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/menuitem/image/2270823',
    source: 'HungerStation (Chicken Mubeen)',
    targetImage: 'Regular Broasted Chicken / genuine Chicken Mubeen meal',
    isBroastRotationMember: false,
    notes: 'General pool staple broast; does NOT count toward special 3-brand rotation slot.',
  },
  {
    brandId: 'ktaykit',
    canonicalName: 'Ktaykit',
    localPath: '/images/restaurants/fried_chicken/ktaykit.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/menuitem/image/886453',
    source: 'HungerStation (Ktaykit)',
    targetImage: 'Ktaykit Regular or Ktaykit Mofalfal 4-piece chicken meal',
    isBroastRotationMember: false,
    notes: 'General pool staple broast; does NOT count toward special 3-brand rotation slot.',
  },
  {
    brandId: 'al_najah_broast',
    canonicalName: 'Al Najah Broast',
    localPath: '/images/restaurants/fried_chicken/al-najah-broast.jpg',
    status: 'approved',
    sourceUrl: 'https://restaurantguru.com/Al-Najah-Broast-brwst-alnjah-Jeddah-2',
    source: 'RestaurantGuru (Al Najah Broast As Safa)',
    targetImage: 'Genuine Al Najah broasted chicken food photo; simple usable crop is acceptable',
    isBroastRotationMember: true,
    notes: 'Traditional Broast rotation member #2. Clean crop of authentic broasted chicken meal.',
  },
  {
    brandId: 'broast_hanoo',
    canonicalName: 'Broast Hanoo',
    localPath: '/images/restaurants/fried_chicken/broast-hanoo.jpg',
    status: 'approved',
    sourceUrl: 'https://fliphtml5.com/iwmhr/kmin/DKSA_JED_142_JAN-FEB_25/',
    source: 'Destination KSA Issue 142 (Jan/Feb 2025, Al-Balad culinary feature)',
    targetImage: 'Genuine Broast Hanoo crispy broast chicken photo from Al-Balad coverage/gallery; simple food crop is acceptable',
    isBroastRotationMember: true,
    notes: 'Traditional Broast rotation member #3. Historic Al-Balad broast chicken meal crop.',
  },
];

export const FRIED_CHICKEN_BRAND_IMAGE_MAP: Record<string, string | null> = Object.fromEntries([
  ...FRIED_CHICKEN_BRAND_IMAGES.map((b) => [b.brandId, b.localPath]),
  ...FRIED_CHICKEN_BRAND_IMAGES.map((b) => [b.canonicalName, b.localPath]),
  ...FRIED_CHICKEN_BRAND_IMAGES.map((b) => [b.canonicalName.toLowerCase(), b.localPath]),
  ...FRIED_CHICKEN_BRAND_IMAGES.map((b) => [b.brandId.replace(/_/g, '-'), b.localPath]),
]);

export function getFriedChickenBrandImage(idOrName?: string | null): string | null {
  if (!idOrName) return null;
  const direct = FRIED_CHICKEN_BRAND_IMAGE_MAP[idOrName];
  if (direct) return direct;
  const lower = FRIED_CHICKEN_BRAND_IMAGE_MAP[idOrName.toLowerCase()];
  if (lower) return lower;
  const slugUnderscore = FRIED_CHICKEN_BRAND_IMAGE_MAP[idOrName.toLowerCase().replace(/[\s-]+/g, '_')];
  if (slugUnderscore) return slugUnderscore;
  const slugHyphen = FRIED_CHICKEN_BRAND_IMAGE_MAP[idOrName.toLowerCase().replace(/[\s_]+/g, '-')];
  if (slugHyphen) return slugHyphen;
  return null;
}
