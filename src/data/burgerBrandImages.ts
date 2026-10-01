/**
 * WeshNakul — Burger Brand Image Registry
 *
 * Source of truth: docs/research/weshnakul_burger_image_manifest.json
 * Rules:
 * - One food-focused image per brand
 * - Preserves aspect ratio with object-fit: cover in UI cards
 * - Deterministic filenames based on canonical brand slug
 * - No unapproved or unrelated substitutions
 */

export interface BurgerBrandImageMetadata {
  brandId: string;
  canonicalName: string;
  localPath: string | null;
  status: 'approved' | 'failed_download' | 'source_only';
  sourceUrl: string;
  source: string;
  notes: string;
}

export const BURGER_BRAND_IMAGES: BurgerBrandImageMetadata[] = [
  {
    brandId: 'section_b',
    canonicalName: 'Section-B',
    localPath: '/images/restaurants/burger/section-b.jpg',
    status: 'approved',
    sourceUrl: 'https://www.listmag.com/en/eat-drink/casual/best-burger-restaurants-in-jeddah',
    source: 'LIST Magazine',
    notes: 'Food-focused spread of Section-B burgers and fries.',
  },
  {
    brandId: 'california_burger',
    canonicalName: 'The California Burger',
    localPath: '/images/restaurants/burger/the-california-burger.jpg',
    status: 'approved',
    sourceUrl: 'https://www.timeoutjeddah.com/',
    source: 'Time Out Jeddah',
    notes: 'Clean burger-focused food shot.',
  },
  {
    brandId: 'century_burger',
    canonicalName: 'Century Burger',
    localPath: '/images/restaurants/burger/century-burger.webp',
    status: 'approved',
    sourceUrl: 'https://ananinja.com/',
    source: 'Ninja',
    notes: 'Menu-style burger shot.',
  },
  {
    brandId: 'chefs_burger',
    canonicalName: "Chef's Homemade Burger Gourmet",
    localPath: '/images/restaurants/burger/chefs-homemade-burger-gourmet.jpg',
    status: 'approved',
    sourceUrl: 'https://www.timeoutjeddah.com/',
    source: 'Time Out Jeddah',
    notes: 'Strong close-up burger image.',
  },
  {
    brandId: 'sign_burger',
    canonicalName: 'Sign Burger',
    localPath: '/images/restaurants/burger/sign-burger.webp',
    status: 'approved',
    sourceUrl: 'https://www.arabnews.com/',
    source: 'Arab News',
    notes: 'Branded burger close-up.',
  },
  {
    brandId: 'nora_burger',
    canonicalName: 'Nora Burger',
    localPath: '/images/restaurants/burger/nora-burger.jpg',
    status: 'approved',
    sourceUrl: 'https://khayratco.sa/noraburger/',
    source: 'Nora Burger official website',
    notes: 'Official Nora Double Cheese Smash Burger product shot.',
  },
  {
    brandId: 'wbj',
    canonicalName: 'WBJ',
    localPath: '/images/restaurants/burger/wbj.jpg',
    status: 'approved',
    sourceUrl: 'https://www.arabnews.com/',
    source: 'Arab News',
    notes: 'Burger, fries and branded cup.',
  },
  {
    brandId: 'lou_burger',
    canonicalName: 'Lou Burger',
    localPath: '/images/restaurants/burger/lou-burger.webp',
    status: 'approved',
    sourceUrl: 'https://www.arabnews.com/',
    source: 'Arab News',
    notes: 'Food-first burger shot.',
  },
  {
    brandId: 'pplr',
    canonicalName: 'PPLR',
    localPath: '/images/restaurants/burger/pplr.png',
    status: 'approved',
    sourceUrl: 'https://menux.app/pplr-burger/',
    source: 'MenuX / PPLR menu',
    notes: 'PPLR burger menu image.',
  },
  {
    brandId: 'smash_me',
    canonicalName: 'Smash Me',
    localPath: '/images/restaurants/burger/smash-me.jpg',
    status: 'approved',
    sourceUrl: 'https://www.iloveqatar.net/',
    source: 'ILoveQatar',
    notes: 'Branded burger meal shot.',
  },
  {
    brandId: 'black_tap',
    canonicalName: 'Black Tap',
    localPath: '/images/restaurants/burger/black-tap.jpg',
    status: 'approved',
    sourceUrl: 'https://blacktap.com/location/jeddah/',
    source: 'Time Out Jeddah / Black Tap',
    notes: 'Jeddah burger spread.',
  },
  {
    brandId: 'fatt',
    canonicalName: 'FATT',
    localPath: '/images/restaurants/burger/fatt.webp',
    status: 'approved',
    sourceUrl: 'https://ananinja.com/',
    source: 'Ninja',
    notes: 'Two burgers with fries, food-focused.',
  },
  {
    brandId: 'burger_boutique',
    canonicalName: 'Burger Boutique',
    localPath: '/images/restaurants/burger/burger-boutique.jpg',
    status: 'approved',
    sourceUrl: 'https://ar.timeoutriyadh.com/',
    source: 'Time Out Riyadh',
    notes: 'Brand-wide signature burger shot; not Jeddah-specific.',
  },
  {
    brandId: 'place',
    canonicalName: 'Place',
    localPath: '/images/restaurants/burger/place.jpg',
    status: 'approved',
    sourceUrl: 'https://www.arabnews.com/',
    source: 'Arab News',
    notes: 'Tray of burgers and fries.',
  },
  {
    brandId: 'score',
    canonicalName: 'Score',
    localPath: '/images/restaurants/burger/score.jpg',
    status: 'approved',
    sourceUrl: 'https://score.sa/',
    source: 'Score official website',
    notes: 'Official food-focused burger image.',
  },
  {
    brandId: 'smpl_brgr',
    canonicalName: 'SMPL BRGR',
    localPath: '/images/restaurants/burger/smpl-brgr.jpg',
    status: 'approved',
    sourceUrl: 'https://www.listmag.com/en/eat-drink/casual/best-burger-restaurants-in-jeddah',
    source: 'LIST Magazine',
    notes: 'Food-focused branded burgers and fries.',
  },
  {
    brandId: 'bunco_burger',
    canonicalName: 'Bunco Burger',
    localPath: '/images/restaurants/burger/bunco-burger.webp',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/',
    source: 'HungerStation',
    notes: 'Clean Double Cheeseburger menu image.',
  },
  {
    brandId: 'mmmm_burger',
    canonicalName: 'Mmmm Burger',
    localPath: '/images/restaurants/burger/mmmm-burger.webp',
    status: 'approved',
    sourceUrl: 'https://also3odyah.com/',
    source: 'Als3odyah',
    notes: 'Burger in branded wrapper.',
  },
  {
    brandId: 'the_plan',
    canonicalName: 'The Plan',
    localPath: '/images/restaurants/burger/the-plan.webp',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/',
    source: 'HungerStation',
    notes: 'Burger meal in The Plan branded box.',
  },
  {
    brandId: 'im_hungry',
    canonicalName: "I'M Hungry",
    localPath: '/images/restaurants/burger/im-hungry.jpg',
    status: 'approved',
    sourceUrl: 'https://x.com/',
    source: 'X/Twitter',
    notes: "Burger close-up with I'M HUNGRY branding.",
  },
  {
    brandId: 'brgr1983',
    canonicalName: 'BRGR1983',
    localPath: '/images/restaurants/burger/brgr1983.jpg',
    status: 'approved',
    sourceUrl: 'https://x.com/lolol202020/status/2038645768995656042',
    source: 'X/Twitter post (@lolol202020)',
    notes: 'Food-focused burger cross-section photo from BRGR1983 post.',
  },
];

export const BURGER_BRAND_IMAGE_MAP: Record<string, string | null> = Object.fromEntries([
  ...BURGER_BRAND_IMAGES.map((b) => [b.brandId, b.localPath]),
  ...BURGER_BRAND_IMAGES.map((b) => [b.canonicalName, b.localPath]),
]);

export function getBurgerBrandImage(idOrName?: string | null): string | null {
  if (!idOrName) return null;
  return BURGER_BRAND_IMAGE_MAP[idOrName] ?? null;
}
