/**
 * WeshNakul — Pizza Brand Image Registry
 *
 * Source of truth: docs/research/weshnakul_pizza_images_approved.json
 * Rules:
 * - One food-focused image per brand
 * - Preserves aspect ratio with object-fit: cover in UI cards
 * - Deterministic filenames based on canonical brand slug
 * - Stored locally in /images/restaurants/pizza/
 * - No hotlinking in production
 */

export interface PizzaBrandImageMetadata {
  brandId: string;
  canonicalName: string;
  manifestName: string;
  localPath: string | null;
  status: 'approved' | 'failed_download' | 'source_only';
  sourceUrl: string;
  source: string;
  targetImage: string;
  isCrossover?: boolean;
  crossoverCategory?: string;
  notes: string;
}

export const PIZZA_BRAND_IMAGES: PizzaBrandImageMetadata[] = [
  {
    brandId: 'dominos',
    canonicalName: "Domino's",
    manifestName: "Domino's",
    localPath: '/images/restaurants/pizza/dominos.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.dhmedia.io/image/global-menu-service/HS_SA/pos-chain/HS-Dominos/42beb204d04676d065a4324db2838956.jpg?quality=80&width=1080',
    source: "Official Saudi Domino's menu (Hungerstation / Domino's KSA)",
    targetImage: "Saudi Domino's Pepperoni pizza",
    notes: "Classic beef pepperoni pizza on wooden board from official Saudi Domino's menu.",
  },
  {
    brandId: 'maestro_pizza',
    canonicalName: 'Maestro Pizza',
    manifestName: 'Maestro Pizza',
    localPath: '/images/restaurants/pizza/maestro-pizza.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/menu-import-gateway-prd/regions/ME/chains/MP-HS/782c20a1c524dfad4e185f780ba9b657.png?quality=80&width=1080',
    source: 'HungerStation Saudi / Maestro Saudi menu imagery',
    targetImage: 'Maestro Jalapeno/Chicken Ranch-style pizza',
    notes: 'Official Maestro Jalapeno Ranchy pizza on round wooden serving board.',
  },
  {
    brandId: 'papa_johns',
    canonicalName: 'Papa Johns',
    manifestName: 'Papa Johns',
    localPath: '/images/restaurants/pizza/papa-johns.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/menu-import-gateway-prd/regions/ME/chains/HS-PAPA/8aabb3df3a01eb1b821bd54dec5f2552.jpeg?quality=80&width=1080',
    source: 'HungerStation Saudi Papa Johns menu',
    targetImage: 'Chicken Garlic pizza on branded Saudi presentation',
    notes: 'Official Chicken Garlic Parmesan pizza on branded Saudi presentation.',
  },
  {
    brandId: 'little_caesars',
    canonicalName: 'Little Caesars',
    manifestName: 'Little Caesars',
    localPath: '/images/restaurants/pizza/little-caesars.webp',
    status: 'approved',
    sourceUrl: 'https://img.ananinja.com/media/ninja-catalog-42/restaurants/p73rskqns85bm1tj9ucyzfv38425/sk-0766.jpg',
    source: 'Ninja Saudi Little Caesars menu',
    targetImage: 'Spicy Pepperoni pizza',
    notes: 'Cruncher Spicy Pepperoni pizza; recognizable Saudi menu item intentionally approved.',
  },
  {
    brandId: 'pizza_hut',
    canonicalName: 'Pizza Hut',
    manifestName: 'Pizza Hut',
    localPath: '/images/restaurants/pizza/pizza-hut.webp',
    status: 'approved',
    sourceUrl: 'https://img.ananinja.com/media/ninja-catalog-42/restaurants/3rcmillud7f0zy2mi0n6seeewjsv/screenshot-2026-05-16-013311.png',
    source: 'Pizza Hut Saudi / Ninja Saudi menu',
    targetImage: 'Classic Pepperoni pizza',
    notes: 'Classic Pan Pepperoni pizza from official Saudi Pizza Hut presence.',
  },
  {
    brandId: 'white_wood_pizzeria',
    canonicalName: 'White Wood Pizzeria',
    manifestName: 'White Wood',
    localPath: '/images/restaurants/pizza/white-wood.jpg',
    status: 'approved',
    sourceUrl: 'https://img1.wsimg.com/isteam/ip/52fe2ad6-5259-41b4-abdf-4b8630bee155/PAblo.jpeg/:/cr=t:0%25,l:0%25,w:100%25,h:100%25/rs=w:1080,h:1080,cg:true',
    source: 'Official White Wood Pizzeria website',
    targetImage: 'Strong food-focused signature pizza; Pablo',
    notes: 'Official signature Pablo pizza directly from White Wood Pizzeria official website.',
  },
  {
    brandId: 'il_postino_pizzeria',
    canonicalName: 'Il Postino Pizzeria',
    manifestName: 'Il Postino',
    localPath: '/images/restaurants/pizza/il-postino.jpg',
    status: 'approved',
    sourceUrl: 'https://assets.maestronewsroom.com/media/30f6532d-717b-4366-9158-9c455299fcd9/arabnews-import/2021/04/2588451-1434500152.jpg',
    source: 'Time Out Jeddah / Arab News Il Postino restaurant feature gallery',
    targetImage: 'Two Neapolitan pizzas being served',
    notes: 'Official supplied restaurant feature image showing two authentic Neapolitan pizzas being served.',
  },
  {
    brandId: 'verra_pizza',
    canonicalName: 'Verra Pizza',
    manifestName: 'Verra',
    localPath: '/images/restaurants/pizza/verra.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/restaurant/android_cover_photo/918d1ba8725ca346ffc234be1c629e5c.jpeg',
    source: 'HungerStation Jeddah Verra listing',
    targetImage: 'Pizza entering wood-fired oven with visible flame',
    notes: 'Official HungerStation cover showing pepperoni pizza on peel entering blazing wood-fired oven.',
  },
  {
    brandId: 'napoli_blu',
    canonicalName: 'Napoli Blu',
    manifestName: 'Napoli Blu',
    localPath: '/images/restaurants/pizza/napoli-blu.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/menuitem/image_url_ref/c3b1693d498bf12b3b9d1a79fe95d2d2.jpg?quality=80&width=1080',
    source: 'HungerStation Jeddah Napoli Blu listing',
    targetImage: 'Pepperoni pizza with NAPOLI BLU branding visible',
    notes: 'Authentic wood-fired pepperoni pizza served on Napoli Blu branded board.',
  },
  {
    brandId: 'wood_fire_pizza_lenuo',
    canonicalName: 'Wood Fire Pizza Lenuo',
    manifestName: 'Lenuo',
    localPath: '/images/restaurants/pizza/lenuo.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/product/image_url_ref/860a68ec3144c5dcb811aeb70e7f0653.jpg?quality=80&width=1080',
    source: 'HungerStation Jeddah Lenuo listing',
    targetImage: 'Food-focused Lenuo pizza',
    notes: 'Food-focused artisanal wood-fired pizza from Pizza Lenuo Jeddah.',
  },
  {
    brandId: 'blu_pizzeria',
    canonicalName: 'Blu Pizzeria',
    manifestName: 'Blu Pizzeriá',
    localPath: '/images/restaurants/pizza/blu-pizzeria.jpg',
    status: 'approved',
    sourceUrl: 'https://cms.factmagazines.com/wp-content/uploads/2025/01/Blu-Pizzeria.jpg',
    source: 'Blu Pizzeria Saudi brand launch feature (FACT Magazine Jeddah)',
    targetImage: 'Blu Pizzeria wood-fired pizza',
    notes: 'Official Blu Pizzeria brand imagery for Jeddah branch launch.',
  },
  {
    brandId: 'mazencito_pizzeria',
    canonicalName: 'Mazencito Pizzeria',
    manifestName: 'Mazencito',
    localPath: '/images/restaurants/pizza/mazencito.webp',
    status: 'approved',
    sourceUrl: 'https://mazencito.com/assets/menu/vegetariano-pizza.webp',
    source: 'Mazencito Pizzeria official menu',
    targetImage: 'Wood-fired vegetable pizza on MAZENCITO PIZZERIA branded board',
    notes: 'Wood-fired Vegetariano pizza on board stamped with MAZENCITO PIZZERIA branding.',
  },
  {
    brandId: 'impasto_seven',
    canonicalName: 'Impasto Seven',
    manifestName: 'Impasto Seven',
    localPath: '/images/restaurants/pizza/impasto-seven.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/menuitem/image_url_ref/c7114fba835f20b3acc77f6794d477fd.jpg?quality=80&width=1080',
    source: 'HungerStation Jeddah Impasto Seven listing',
    targetImage: 'White Truffle pizza',
    notes: 'Signature White Truffle woodfired Neapolitan pizza.',
  },
  {
    brandId: 'locos_pizza',
    canonicalName: 'Locos Pizza',
    manifestName: 'Locos Pizza',
    localPath: '/images/restaurants/pizza/locos-pizza.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/global-menu-service/HS_SA/vendor/37688/product/12298681/5add8c65-034b-4579-98f7-d8b4bed42627.jpg?quality=80&width=1080',
    source: 'HungerStation Jeddah Locos Pizza listing',
    targetImage: 'Pizza spread with LOCOS branding visible',
    notes: "Loco's Signature Pepperoni Pizza fresh from oven.",
  },
  {
    brandId: 'jon_and_vinnys',
    canonicalName: "Jon & Vinny's",
    manifestName: "Jon & Vinny's",
    localPath: '/images/restaurants/pizza/jon-and-vinnys.jpg',
    status: 'approved',
    sourceUrl: 'https://jonandvinnysksa.com/images/menu-items/lunch-and-dinner/pizza/the%20margherita.jpg',
    source: "Official Saudi Jon & Vinny's menu imagery",
    targetImage: "Clean food-focused Jon & Vinny's pizza",
    notes: "Official Jon & Vinny's Saudi Margherita pizza product shot.",
  },
  {
    brandId: 'bread_ahead',
    canonicalName: 'Bread Ahead',
    manifestName: 'Bread Ahead',
    localPath: '/images/restaurants/pizza/bread-ahead.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/restaurant/android_cover_photo/473d19a3f204429d4509f75e27b094dc.png',
    source: 'HungerStation Saudi Bread Ahead listing',
    targetImage: 'Artisanal pizza spread from Bread Ahead',
    notes: 'Official HungerStation cover showing Bread Ahead square pepperoni and sourdough margherita pizzas.',
  },
  {
    brandId: 'pizzalio',
    canonicalName: 'Pizzalio',
    manifestName: 'Pizzalio',
    localPath: '/images/restaurants/pizza/pizzalio.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/menuitem/image_url_ref/13995d664b781aa71d23411fb0e545dd.jpg?quality=80&width=1080',
    source: 'HungerStation Jeddah Pizzalio listing',
    targetImage: 'Neapolitan Margherita-style pizza from verified Jeddah restaurant gallery',
    notes: 'Fresh Neapolitan Margherita pizza with basil leaves.',
  },
  {
    brandId: 'pastola_italian_restaurant',
    canonicalName: 'Pastola Italian Restaurant',
    manifestName: 'Pastola',
    localPath: '/images/restaurants/pizza/pastola.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/global-menu-service/HS_SA/vendor/177622/product/106316081/10e976a6-4bd0-44a7-bd5a-da9e68107f70.jpg?quality=80&width=1080',
    source: 'HungerStation Jeddah Pastola listing',
    targetImage: 'Food-focused pizza from Pastola Jeddah',
    notes: 'Classic Margherita pizza from Pastola Italian Restaurant Jeddah.',
  },
];

/**
 * Approved cross-category restaurants eligible for at most 1 crossover slot in a Pizza deck.
 * Rule: Never assign one restaurant's food photo to another restaurant.
 * Potential crossovers (including San Carlo Cicchetti) are preserved for future use,
 * but excluded until an authentic food image from that specific restaurant is approved.
 * When this array is empty, all 7 cards in every Pizza deck are drawn from the 18 primary Pizza brands.
 */
export const PIZZA_CROSSOVER_IMAGES: PizzaBrandImageMetadata[] = [];

export const PIZZA_BRAND_IMAGE_MAP: Record<string, string | null> = Object.fromEntries([
  ...PIZZA_BRAND_IMAGES.map((b) => [b.brandId, b.localPath]),
  ...PIZZA_BRAND_IMAGES.map((b) => [b.canonicalName, b.localPath]),
  ...PIZZA_BRAND_IMAGES.map((b) => [b.manifestName, b.localPath]),
  ...PIZZA_BRAND_IMAGES.map((b) => [b.canonicalName.toLowerCase(), b.localPath]),
  ...PIZZA_BRAND_IMAGES.map((b) => [b.manifestName.toLowerCase(), b.localPath]),
  ...PIZZA_BRAND_IMAGES.map((b) => [b.brandId.replace(/_/g, '-'), b.localPath]),
  ...PIZZA_CROSSOVER_IMAGES.map((b) => [b.brandId, b.localPath]),
  ...PIZZA_CROSSOVER_IMAGES.map((b) => [b.canonicalName, b.localPath]),
  ...PIZZA_CROSSOVER_IMAGES.map((b) => [b.manifestName, b.localPath]),
  ...PIZZA_CROSSOVER_IMAGES.map((b) => [b.canonicalName.toLowerCase(), b.localPath]),
  ...PIZZA_CROSSOVER_IMAGES.map((b) => [b.manifestName.toLowerCase(), b.localPath]),
  ...PIZZA_CROSSOVER_IMAGES.map((b) => [b.brandId.replace(/_/g, '-'), b.localPath]),
]);

export function getPizzaBrandImage(idOrName?: string | null): string | null {
  if (!idOrName) return null;
  const direct = PIZZA_BRAND_IMAGE_MAP[idOrName];
  if (direct) return direct;
  const lower = PIZZA_BRAND_IMAGE_MAP[idOrName.toLowerCase()];
  if (lower) return lower;
  const slugUnderscore = PIZZA_BRAND_IMAGE_MAP[idOrName.toLowerCase().replace(/[\s-]+/g, '_')];
  if (slugUnderscore) return slugUnderscore;
  const slugHyphen = PIZZA_BRAND_IMAGE_MAP[idOrName.toLowerCase().replace(/[\s_]+/g, '-')];
  if (slugHyphen) return slugHyphen;
  return null;
}
