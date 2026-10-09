/**
 * WeshNakul — Italian Brand Image Registry
 *
 * Source of truth: docs/research/weshnakul_italian_images_approved.json
 * Rules:
 * - One food-focused image per brand (authentic pizza or pasta)
 * - Preserves aspect ratio with object-fit: cover in UI cards
 * - Deterministic filenames based on canonical brand slug
 * - Stored locally in /images/restaurants/italian/
 * - No hotlinking in production
 * - All 16 Italian brand images fully verified and approved
 */

export interface ItalianBrandImageMetadata {
  brandId: string;
  canonicalName: string;
  manifestName: string;
  localPath: string | null;
  status: 'approved' | 'pending_user_visual_approval' | 'unresolved' | 'source_only';
  sourceUrl: string | null;
  source: string;
  targetImage: string | null;
  notes: string;
}

export const ITALIAN_BRAND_IMAGES: ItalianBrandImageMetadata[] = [
  {
    brandId: 'jon_and_vinnys',
    canonicalName: "Jon & Vinny's",
    manifestName: "Jon & Vinny's",
    localPath: '/images/restaurants/italian/jon-and-vinnys.jpg',
    status: 'approved',
    sourceUrl: 'https://www.timeoutjeddah.com/cloud/timeoutjeddah/2025/07/04/Jon-Vinnys-1-1024x768.jpg',
    source: 'Time Out Jeddah verified feature (editorial)',
    targetImage: "Jon & Vinny's breakfast pizza and branded berries bowl",
    notes: 'Time Out Jeddah verified feature of Jon & Vinny’s Jeddah showing breakfast pizza and branded Jon & Vinny’s bowl.',
  },
  {
    brandId: 'noto',
    canonicalName: 'Noto',
    manifestName: 'Noto',
    localPath: '/images/restaurants/italian/noto.jpg',
    status: 'approved',
    sourceUrl: 'https://www.timeoutjeddah.com/cloud/timeoutjeddah/2025/05/08/noto.ksa_-1024x768.jpg',
    source: 'Time Out Jeddah feature (editorial)',
    targetImage: 'Penne pasta in wide rim bowl with NOTO engraved on rim',
    notes: 'Time Out Jeddah feature of Noto Jeddah with penne pasta in bowl with NOTO engraved on rim.',
  },
  {
    brandId: 'san_carlo_cicchetti',
    canonicalName: 'San Carlo Cicchetti',
    manifestName: 'San Carlo Cicchetti',
    localPath: '/images/restaurants/italian/san-carlo-cicchetti.jpg',
    status: 'approved',
    sourceUrl: 'https://sancarlocicchetti.sa/assets/uploads/gallery/image1566989658.jpg',
    source: 'Official San Carlo Cicchetti KSA website gallery',
    targetImage: 'Burrata and artisanal pizza served on wooden board',
    notes: 'Official San Carlo Cicchetti KSA gallery showing guests sharing burrata and pizza on wood board (web-optimized to 1200x960 from 15MB 5816x4653 original).',
  },
  {
    brandId: 'piatto',
    canonicalName: 'Piatto',
    manifestName: 'Piatto',
    localPath: '/images/restaurants/italian/piatto.webp',
    status: 'approved',
    sourceUrl: 'https://img.ananinja.com/media/ninja-catalog-42/restaurants/conbd4g8xqnsvxos69ud7c0v08po/68b800e02848f812450d95ad.jpg',
    source: 'Ninja Saudi official catalog item photo',
    targetImage: 'Piatto chicken pizza with white swirl on paddle',
    notes: 'Official Ninja Saudi catalog item photo for Piatto chicken pizza on wood paddle.',
  },
  {
    brandId: 'olive_garden',
    canonicalName: 'Olive Garden',
    manifestName: 'Olive Garden',
    localPath: '/images/restaurants/italian/olive-garden.jpg',
    status: 'approved',
    sourceUrl: 'https://www.multivu.com/players/English/7303853-olive-garden-never-ending-pasta-bowl/image/chicken-alfredo-null-HR.jpg',
    source: 'MultiVu / Olive Garden official brand press photo',
    targetImage: 'Chicken Alfredo fettuccine pasta with fork lift',
    notes: 'Official Olive Garden press / brand high-res photo of signature Chicken Alfredo (web-optimized to 1200x800).',
  },
  {
    brandId: 'eataly',
    canonicalName: 'Eataly',
    manifestName: 'Eataly',
    localPath: '/images/restaurants/italian/eataly.jpg',
    status: 'approved',
    sourceUrl: 'https://www.arabnews.com/sites/default/files/styles/n_670_395/public/2026/04/06/4700291-253239083.jpg?itok=K6SQoEIj',
    source: 'Arab News feature of Eataly Jeddah (editorial)',
    targetImage: 'Neapolitan pepperoni pizza at Eataly Jeddah',
    notes: 'Arab News feature of Eataly Jeddah showing authentic Neapolitan pepperoni pizza slice (web-optimized to 1052x1200).',
  },
  {
    brandId: 'il_vero',
    canonicalName: 'IL Vero',
    manifestName: 'IL Vero',
    localPath: '/images/restaurants/italian/il-vero.webp',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/menus/menuitem/hsimg-8031673?quality=75&webp=true&width=1440',
    source: 'HungerStation verified restaurant menu photograph',
    targetImage: 'Seafood linguine pasta with mussels and shrimp',
    notes: 'Hungerstation menu photo for IL Vero Jeddah showing fresh seafood pasta with mussels and shrimp.',
  },
  {
    brandId: 'portofino',
    canonicalName: 'Portofino',
    manifestName: 'Portofino',
    localPath: '/images/restaurants/italian/portofino.jpg',
    status: 'approved',
    sourceUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/0d/e6/52/photo4jpg.jpg?h=1200&s=1&w=1200',
    source: 'TripAdvisor verified customer photograph',
    targetImage: 'Half cheese half pepperoni pizza at Portofino Jeddah',
    notes: 'TripAdvisor verified customer photograph of whole pizza served at Portofino Jeddah.',
  },
  {
    brandId: 'vivaci',
    canonicalName: 'Vivaci',
    manifestName: 'Vivaci',
    localPath: '/images/restaurants/italian/vivaci.jpg',
    status: 'approved',
    sourceUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/2c/c2/ec/every-slice-tells-a-story.jpg?h=1200&s=1&w=1200',
    source: 'TripAdvisor direct photo reference i724353772 (official restaurant media)',
    targetImage: 'Chef in ViVACi embroidered uniform holding fresh baked pizza slice',
    notes: 'Exact TripAdvisor direct reference photo i724353772 showing pizza chef in ViVACi embroidered uniform holding fresh baked pizza slice ("Every slice tells a story"). Approved candidate.',
  },
  {
    brandId: 'napoli_blu',
    canonicalName: 'Napoli Blu',
    manifestName: 'Napoli Blu',
    localPath: '/images/restaurants/italian/napoli-blu.webp',
    status: 'approved',
    sourceUrl: 'https://img.magicpin.com/10628132_store_images_2.webp',
    source: 'Magicpin store catalog asset',
    targetImage: 'Napoli Blu Truffle Pizza on counter',
    notes: 'Single Napoli Blu truffle pizza on counter from official Magicpin Jeddah store listing.',
  },
  {
    brandId: 'il_postino_pizzeria',
    canonicalName: 'il Postino Pizzeria',
    manifestName: 'il Postino Pizzeria',
    localPath: '/images/restaurants/italian/il-postino.jpg',
    status: 'approved',
    sourceUrl: 'https://www.timeoutjeddah.com/cloud/timeoutjeddah/2024/06/19/Il-Postino-Pizzeria-3.jpg',
    source: 'Time Out Jeddah feature (editorial)',
    targetImage: 'Freshly baked Neapolitan pizzas at il Postino Pizzeria',
    notes: 'Time Out Jeddah feature photo of il Postino Pizzeria showing freshly baked pizzas served on table.',
  },
  {
    brandId: 'wood_fire_pizza_lenuo',
    canonicalName: 'Pizza Lenuo',
    manifestName: 'Pizza Lenuo',
    localPath: '/images/restaurants/italian/lenuo.webp',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/menuitem/image/1222349?quality=75&webp=true&width=1440',
    source: 'HungerStation verified restaurant menu photograph',
    targetImage: 'Spinach tagliatelle pasta with shrimp and Pizza Lenuo logo on rim',
    notes: 'Hungerstation menu photo showing fresh spinach pasta with shrimp and Pizza Lenuo logo printed on plate rim.',
  },
  {
    brandId: 'verra_pizza',
    canonicalName: 'Vera Pizza',
    manifestName: 'Vera Pizza / Verra',
    localPath: '/images/restaurants/italian/verra.webp',
    status: 'approved',
    sourceUrl: 'https://img.ananinja.com/media/ninja-catalog-42/restaurants/oiiypsgxgndxlmpkcg4p32f8ovue/mi100112.jpg',
    source: 'Ninja Saudi official catalog item photo',
    targetImage: 'Neapolitan pepperoni and ricotta pizza',
    notes: 'Official Ninja Saudi catalog item photo for Vera Pizza (Verra) Jeddah.',
  },
  {
    brandId: 'salernoo',
    canonicalName: 'Salernoo',
    manifestName: 'Salernoo',
    localPath: '/images/restaurants/italian/salernoo.webp',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/global-menu-service/hs_sa/vendor/79783/product/13505448/87ccb82c-09b9-403d-8f33-ffcdf5dec9c7.jpg?quality=75&webp=true&width=1440',
    source: 'Delivery Hero global menu service photograph',
    targetImage: 'Pepperoni pizza on wooden paddle board',
    notes: 'Hungerstation verified menu photograph of Salernoo pepperoni pizza.',
  },
  {
    brandId: 'il_castello',
    canonicalName: 'IL Castello',
    manifestName: 'IL Castello',
    localPath: '/images/restaurants/italian/il-castello.jpg',
    status: 'approved',
    sourceUrl: 'https://img05.restaurantguru.com/rfdc-IL-Castello-dishes-2025-11-3.jpg',
    source: 'Restaurant Guru food gallery for IL Castello Jeddah',
    targetImage: 'Fettuccine Alfredo pasta with chicken and Parmesan bowl on IL Castello paper',
    notes: 'Restaurant Guru food gallery item from IL Castello Jeddah showing fettuccine alfredo with chicken, parmesan, on table paper reading "IL CASTELLO - PIZZA ITALIAN SPECIALITY". Option A approved.',
  },
  {
    brandId: 'pizzalio',
    canonicalName: 'Pizzalio',
    manifestName: 'Pizzalio',
    localPath: '/images/restaurants/italian/pizzalio.webp',
    status: 'approved',
    sourceUrl: 'https://img.magicpin.com/10624807_store_images_3.webp',
    source: 'Magicpin store catalog asset',
    targetImage: 'Pizzalio mushroom pizza on wooden peel',
    notes: 'Pizzalio mushroom pizza from Magicpin Jeddah store listing.',
  },
];

export const ITALIAN_BRAND_IMAGE_MAP: Record<string, string | null> = Object.fromEntries([
  ...ITALIAN_BRAND_IMAGES.map((b) => [b.brandId, b.localPath]),
  ...ITALIAN_BRAND_IMAGES.map((b) => [b.canonicalName, b.localPath]),
  ...ITALIAN_BRAND_IMAGES.map((b) => [b.manifestName, b.localPath]),
  ...ITALIAN_BRAND_IMAGES.map((b) => [b.canonicalName.toLowerCase(), b.localPath]),
  ...ITALIAN_BRAND_IMAGES.map((b) => [b.manifestName.toLowerCase(), b.localPath]),
  ...ITALIAN_BRAND_IMAGES.map((b) => [b.brandId.replace(/_/g, '-'), b.localPath]),
  // Additional aliases
  ['jon-and-vinnys', '/images/restaurants/italian/jon-and-vinnys.jpg'],
  ['jon and vinnys', '/images/restaurants/italian/jon-and-vinnys.jpg'],
  ['san-carlo-cicchetti', '/images/restaurants/italian/san-carlo-cicchetti.jpg'],
  ['san carlo cicchetti', '/images/restaurants/italian/san-carlo-cicchetti.jpg'],
  ['il-postino-pizzeria', '/images/restaurants/italian/il-postino.jpg'],
  ['il postino pizzeria', '/images/restaurants/italian/il-postino.jpg'],
  ['il-postino', '/images/restaurants/italian/il-postino.jpg'],
  ['il postino', '/images/restaurants/italian/il-postino.jpg'],
  ['wood-fire-pizza-lenuo', '/images/restaurants/italian/lenuo.webp'],
  ['wood fire pizza lenuo', '/images/restaurants/italian/lenuo.webp'],
  ['pizza-lenuo', '/images/restaurants/italian/lenuo.webp'],
  ['pizza lenuo', '/images/restaurants/italian/lenuo.webp'],
  ['lenuo', '/images/restaurants/italian/lenuo.webp'],
  ['verra-pizza', '/images/restaurants/italian/verra.webp'],
  ['verra pizza', '/images/restaurants/italian/verra.webp'],
  ['vera-pizza', '/images/restaurants/italian/verra.webp'],
  ['vera pizza', '/images/restaurants/italian/verra.webp'],
  ['verra', '/images/restaurants/italian/verra.webp'],
  ['vera', '/images/restaurants/italian/verra.webp'],
  ['napoli-blu', '/images/restaurants/italian/napoli-blu.webp'],
  ['napoli blu', '/images/restaurants/italian/napoli-blu.webp'],
  ['il-castello', '/images/restaurants/italian/il-castello.jpg'],
  ['il castello', '/images/restaurants/italian/il-castello.jpg'],
  ['il-vero', '/images/restaurants/italian/il-vero.webp'],
  ['il vero', '/images/restaurants/italian/il-vero.webp'],
]);

export function getItalianBrandImage(idOrName?: string | null): string | null {
  if (!idOrName) return null;
  const direct = ITALIAN_BRAND_IMAGE_MAP[idOrName];
  if (direct !== undefined) return direct;
  const lower = ITALIAN_BRAND_IMAGE_MAP[idOrName.toLowerCase()];
  if (lower !== undefined) return lower;
  const slugUnderscore = ITALIAN_BRAND_IMAGE_MAP[idOrName.toLowerCase().replace(/[\s-]+/g, '_')];
  if (slugUnderscore !== undefined) return slugUnderscore;
  const slugHyphen = ITALIAN_BRAND_IMAGE_MAP[idOrName.toLowerCase().replace(/[\s_]+/g, '-')];
  if (slugHyphen !== undefined) return slugHyphen;
  return null;
}
