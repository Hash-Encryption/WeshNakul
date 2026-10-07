/**
 * WeshNakul — Grills Brand Image Registry
 *
 * Source of truth: docs/research/weshnakul_grills_images_approved.json
 * Rules:
 * - One food-focused image per brand
 * - Preserves aspect ratio with object-fit: cover in UI cards
 * - Deterministic filenames based on canonical brand slug
 * - Stored locally in /images/restaurants/grills/
 * - No hotlinking in production
 * - Approved assets only; unresolved brands truthfully report null
 */

export interface GrillsBrandImageMetadata {
  brandId: string;
  canonicalName: string;
  manifestName: string;
  localPath: string | null;
  status: 'approved' | 'unresolved' | 'source_only';
  sourceUrl: string | null;
  source: string;
  targetImage: string | null;
  notes: string;
}

export const GRILLS_BRAND_IMAGES: GrillsBrandImageMetadata[] = [
  {
    brandId: 'khayal_restaurant',
    canonicalName: 'Khayal Restaurant',
    manifestName: 'Khayal Restaurant',
    localPath: '/images/restaurants/grills/khayal.webp',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/menu-import-gateway-prd/regions/ME/chains/HS-KKL/5935522893e8256cce6010f4579a16ca.jpg?quality=75&webp=true&width=1440',
    source: 'Delivery Hero / HungerStation official chain catalog (HS-KKL)',
    targetImage: 'Signature Khayal mixed grill platter',
    notes: 'Official Khayal charcoal grill platter served fresh.',
  },
  {
    brandId: 'ennabi_grill',
    canonicalName: 'Ennabi Grill',
    manifestName: 'Ennabi Grill',
    localPath: '/images/restaurants/grills/ennabi-grill.jpg',
    status: 'approved',
    sourceUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/a9/b8/67/20190806-205747-largejpg.jpg?h=500&s=1&w=900',
    source: 'Tripadvisor media CDN',
    targetImage: 'Ennabi Grill grilled meats and kebabs platter',
    notes: 'Charcoal grilled kebab skewers on traditional flatbread.',
  },
  {
    brandId: 'kabebo',
    canonicalName: 'Kabebo',
    manifestName: 'Kabebo',
    localPath: '/images/restaurants/grills/kabebo.avif',
    status: 'approved',
    sourceUrl: 'https://static.wixstatic.com/media/a571cb_f16d1c07e1ec4bf1a3d35bded30eee8e~mv2.png/v1/crop/x_0%2Cy_4%2Cw_648%2Ch_402/fill/w_264%2Ch_170%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/%D9%83%D8%A7%D8%A8%D9%8A%D8%A8%D9%88%20%D9%83%D8%A8%D8%A7%D8%A8.png',
    source: 'Official Kabebo Wix CDN asset',
    targetImage: 'Kabebo signature kebab skewers with flatbread',
    notes: 'Exact approved asset delivered as modern AVIF format by Wix CDN.',
  },
  {
    brandId: 'al_hamraa_barbecue_restaurant',
    canonicalName: 'Al Hamraa Barbecue Restaurant',
    manifestName: 'Al Hamraa Barbecue Restaurant',
    localPath: '/images/restaurants/grills/al-hamraa.webp',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/global-menu-service/HS_SA/vendor/8293/product/318551/8976bdcc-5576-42f5-9e0e-6be5b39dce86.jpg?quality=75&webp=true&width=1440',
    source: 'HungerStation / Delivery Hero global menu service',
    targetImage: 'Signature grilled chicken and meat kebab plate',
    notes: 'Official HungerStation menu asset for Al Hamraa Barbecue Restaurant.',
  },
  {
    brandId: 'al_fairouz_restaurant',
    canonicalName: 'Al Fairouz Restaurant',
    manifestName: 'Al Fairouz Restaurant',
    localPath: '/images/restaurants/grills/al-fairouz.webp',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/global-menu-service/HS_SA/vendor/31178/PRODUCT/67966311/45e4dc05-57d1-4c3c-a825-70ceac145027.jpg?quality=75&webp=true&width=1440',
    source: 'HungerStation / Delivery Hero global menu service',
    targetImage: 'Turkish charcoal grill platter with bread and grilled peppers',
    notes: 'Official HungerStation product image for Al Fairouz Restaurant.',
  },
  {
    brandId: 'shami',
    canonicalName: 'Shami',
    manifestName: 'Shami',
    localPath: '/images/restaurants/grills/shami.webp',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/menu-import-gateway-prd/regions/ME/chains/HS-SH12/397950ef1bc7d3461d0743a40e3386f4.jpg?quality=75&webp=true&width=1440',
    source: 'Delivery Hero / HungerStation official chain catalog (HS-SH12)',
    targetImage: 'Shami signature charcoal mixed grill spread',
    notes: 'Official Shami restaurant chain menu asset.',
  },
  {
    brandId: 'skewers_grilled_restaurant',
    canonicalName: 'Skewers Grilled Restaurant',
    manifestName: 'Skewers Grilled Restaurant',
    localPath: null,
    status: 'source_only',
    sourceUrl: null,
    source: 'https://restaurantguru.com/Skewers-Grilled-Restaurant-Jeddah',
    targetImage: null,
    notes: 'SKewers image unresolved. Source inspected; no confident food-specific approved asset extractable without substitution.',
  },
  {
    brandId: 'at_beirut_jeddah',
    canonicalName: 'At Beirut',
    manifestName: 'At Beirut',
    localPath: null,
    status: 'source_only',
    sourceUrl: null,
    source: 'https://hungerstation.com/sa-en/restaurants/regions/jeddah/al-basatin/at-beirut-144693',
    targetImage: 'Mix Grill Platter from From The Grill section',
    notes: 'At Beirut Mix Grill Platter asset unresolved. Vendor 144693 client menu endpoint protected by Cloudflare bot challenge.',
  },
  {
    brandId: 'al_nakheel_restaurant',
    canonicalName: 'Al Nakheel Restaurant',
    manifestName: 'Al Nakheel Restaurant',
    localPath: '/images/restaurants/grills/al-nakheel.webp',
    status: 'approved',
    sourceUrl: 'https://image.kkday.com/v2/image/get/c_fit%2Cq_55%2Ct_webp%2Cw_960/s1.kkday.com/product_133903/20221002125911_Qq7In/jpg',
    source: 'KKday CDN asset for Al Nakheel Jeddah',
    targetImage: 'Al Nakheel dining and grilled food presentation',
    notes: 'Approved asset for Al Nakheel Restaurant Jeddah.',
  },
  {
    brandId: 'shababik',
    canonicalName: 'Shababik',
    manifestName: 'Shababik',
    localPath: '/images/restaurants/grills/shababik.jpg',
    status: 'approved',
    sourceUrl: 'https://www.timeoutriyadh.com/cloud/timeoutriyadh/2023/12/29/Shababik-Riyadh-2.jpg',
    source: 'Time Out Riyadh / Shababik feature CDN',
    targetImage: 'Premium Lebanese charcoal grilled skewers and meats',
    notes: 'High-end Lebanese grill presentation for Shababik.',
  },
  {
    brandId: 'burj_al_hamam',
    canonicalName: 'Burj Al Hamam',
    manifestName: 'Burj Al Hamam',
    localPath: '/images/restaurants/grills/burj-al-hamam.jpg',
    status: 'approved',
    sourceUrl: 'https://eatapp.co/amman-restaurants/images/burj-al-hamam-intercontinental-hotel-3rd-circle-restaurant-6.jpg?height=500&width=850',
    source: 'EatApp CDN asset for Burj Al Hamam',
    targetImage: 'Traditional Lebanese mixed grill skewers',
    notes: 'Approved mixed grill platter from Burj Al Hamam.',
  },
  {
    brandId: 'saraya_latif',
    canonicalName: 'Saraya Latif',
    manifestName: 'Saraya Latif',
    localPath: '/images/restaurants/grills/saraya-latif.jpg',
    status: 'approved',
    sourceUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/04/ec/78/caption.jpg?h=1200&s=1&w=1200',
    source: 'Tripadvisor media CDN',
    targetImage: 'Saraya Latif Turkish charcoal barbecue meat spread',
    notes: 'Turkish charcoal grill meat spread from Saraya Latif.',
  },
  {
    brandId: 'taksim_point_restaurant',
    canonicalName: 'Taksim Point Restaurant',
    manifestName: 'Taksim Point Restaurant',
    localPath: '/images/restaurants/grills/taksim-point.webp',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/menuitem/image/13858282?quality=75&webp=true&width=1440',
    source: 'HungerStation / Delivery Hero menu item CDN',
    targetImage: 'Taksim Point Turkish grill skewers platter with fries and bread',
    notes: 'Food-focused Turkish kebab platter from Taksim Point Restaurant.',
  },
  {
    brandId: 'texas_roadhouse',
    canonicalName: 'Texas Roadhouse',
    manifestName: 'Texas Roadhouse',
    localPath: '/images/restaurants/grills/texas-roadhouse.jpg',
    status: 'approved',
    sourceUrl: 'https://img.venuewise.com/upload/venue/gallery/2025/02/23/image_4535805_67bb27d489b4b.jpg',
    source: 'VenueWise gallery CDN',
    targetImage: 'Texas Roadhouse hand-cut steak and ribs grill platter',
    notes: 'Replaces Yildizlar as the premium steak/grill going-out option.',
  },
  {
    brandId: 'alsheesh_bbq',
    canonicalName: 'Alsheesh BBQ',
    manifestName: 'Alsheesh BBQ',
    localPath: '/images/restaurants/grills/alsheesh-bbq.jpg',
    status: 'approved',
    sourceUrl: 'https://images.deliveryhero.io/image/hungerstation/menus/product/hsimg-467158?width=1920',
    source: 'https://hungerstation.com/sa-en/restaurant/jeddah/al-sahifah/106471',
    targetImage: 'Mixed Grill - 250 G',
    notes: 'Exact approved Mixed Grill - 250 G for Alsheesh BBQ (resolves Place entity ChIJpeROlxLawxURhEcynrnaKxY).',
  },
];

export const GRILLS_BRAND_IMAGE_MAP: Record<string, string | null> = Object.fromEntries([
  ...GRILLS_BRAND_IMAGES.map((b) => [b.brandId, b.localPath]),
  ...GRILLS_BRAND_IMAGES.map((b) => [b.canonicalName, b.localPath]),
  ...GRILLS_BRAND_IMAGES.map((b) => [b.manifestName, b.localPath]),
  ...GRILLS_BRAND_IMAGES.map((b) => [b.canonicalName.toLowerCase(), b.localPath]),
  ...GRILLS_BRAND_IMAGES.map((b) => [b.manifestName.toLowerCase(), b.localPath]),
  ...GRILLS_BRAND_IMAGES.map((b) => [b.brandId.replace(/_/g, '-'), b.localPath]),
  // Additional canonical aliases
  ['at_beirut', null],
  ['at-beirut', null],
  ['At Beirut Jeddah', null],
  ['al_hamra_barbecue', '/images/restaurants/grills/al-hamraa.webp'],
  ['al-hamra-barbecue', '/images/restaurants/grills/al-hamraa.webp'],
  ['al_fairouz', '/images/restaurants/grills/al-fairouz.webp'],
  ['al-fairouz', '/images/restaurants/grills/al-fairouz.webp'],
  ['al_nakheel', '/images/restaurants/grills/al-nakheel.webp'],
  ['al-nakheel', '/images/restaurants/grills/al-nakheel.webp'],
  ['taksim_point', '/images/restaurants/grills/taksim-point.webp'],
  ['taksim-point', '/images/restaurants/grills/taksim-point.webp'],
  // Legacy / entity aliases for Alsheesh BBQ / Istanbul Grill
  ['istanbul_grill_restaurant', '/images/restaurants/grills/alsheesh-bbq.jpg'],
  ['istanbul-grill-restaurant', '/images/restaurants/grills/alsheesh-bbq.jpg'],
  ['Istanbul Grill Restaurant', '/images/restaurants/grills/alsheesh-bbq.jpg'],
  ['istanbul_grill', '/images/restaurants/grills/alsheesh-bbq.jpg'],
  ['istanbul-grill', '/images/restaurants/grills/alsheesh-bbq.jpg'],
  ['alsheesh_bbq', '/images/restaurants/grills/alsheesh-bbq.jpg'],
  ['alsheesh-bbq', '/images/restaurants/grills/alsheesh-bbq.jpg'],
  ['Alsheesh BBQ', '/images/restaurants/grills/alsheesh-bbq.jpg'],
  ['الشيش للمشويات', '/images/restaurants/grills/alsheesh-bbq.jpg'],
]);

export function getGrillsBrandImage(idOrName?: string | null): string | null {
  if (!idOrName) return null;
  const direct = GRILLS_BRAND_IMAGE_MAP[idOrName];
  if (direct !== undefined) return direct;
  const lower = GRILLS_BRAND_IMAGE_MAP[idOrName.toLowerCase()];
  if (lower !== undefined) return lower;
  const slugUnderscore = GRILLS_BRAND_IMAGE_MAP[idOrName.toLowerCase().replace(/[\s-]+/g, '_')];
  if (slugUnderscore !== undefined) return slugUnderscore;
  const slugHyphen = GRILLS_BRAND_IMAGE_MAP[idOrName.toLowerCase().replace(/[\s_]+/g, '-')];
  if (slugHyphen !== undefined) return slugHyphen;
  return null;
}
