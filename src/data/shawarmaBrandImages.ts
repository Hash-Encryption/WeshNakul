/**
 * WeshNakul — Shawarma Brand Image Registry
 *
 * Source of truth: docs/research/weshnakul_shawarma_image_manifest.json
 * Rules:
 * - One food-focused image per brand
 * - Preserves aspect ratio with object-fit: cover in UI cards
 * - Deterministic filenames based on canonical brand slug
 * - No unapproved or unrelated substitutions
 */

export interface ShawarmaBrandImageMetadata {
  brandId: string;
  canonicalName: string;
  localPath: string | null;
  status: 'approved' | 'failed_download' | 'source_only';
  sourceUrl: string;
  source: string;
  notes: string;
}

export const SHAWARMA_BRAND_IMAGES: ShawarmaBrandImageMetadata[] = [
  {
    brandId: 'shawarmer',
    canonicalName: 'Shawarmer',
    localPath: '/images/restaurants/shawarma/shawarmer.png',
    status: 'approved',
    sourceUrl: 'https://shawarmer.com/en',
    source: 'Shawarmer official website',
    notes: 'Official food-focused Saji chicken shawarma sandwich shot.',
  },
  {
    brandId: 'shawarma_classic',
    canonicalName: 'Shawarma Classic',
    localPath: '/images/restaurants/shawarma/shawarma-classic.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-en/restaurants/regions/riyadh/al-azizyah/shawerma-classic-20887',
    source: 'HungerStation (Shawerma Classic)',
    notes: 'Official Arabi Classic shawarma cut pieces with fries and garlic dipping sauces.',
  },
  {
    brandId: 'shawarma_alrimal',
    canonicalName: 'Shawarma Alrimal',
    localPath: '/images/restaurants/shawarma/shawarma-alrimal.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-ar/restaurants/regions/sands-hotel-2/jeddah/shawarma-alrimal-23187',
    source: 'HungerStation (Shawarma Alrimal)',
    notes: 'Chicken shawarma plate with garlic and sides.',
  },
  {
    brandId: 'shamiyat_haritna',
    canonicalName: 'Shamiyat Haritna',
    localPath: '/images/restaurants/shawarma/shamiyat-haritna.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/en/jeddah/al-hamra/18934/shamyat-haritna',
    source: 'HungerStation (Shamiyat Haritna)',
    notes: 'Classic chicken shawarma sandwich in toasted flatbread.',
  },
  {
    brandId: 'ayedh_shawarma',
    canonicalName: 'Ayedh Shawarma',
    localPath: '/images/restaurants/shawarma/ayedh-shawarma.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-ar/restaurant/%D8%AC%D8%AF%D9%87/%D8%A7%D9%84%D9%85%D8%B3%D8%B1%D8%A9/156736',
    source: 'HungerStation (Shawarma Am Ayed)',
    notes: 'Shawarma Arabi plate with fries and signature sauces.',
  },
  {
    brandId: 'al_khal_al_dimashqi',
    canonicalName: 'Al-Khal Al-Dimashqi',
    localPath: '/images/restaurants/shawarma/al-khal-al-dimashqi.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-ar/restaurants/regions/%D8%AC%D8%AF%D9%87/%D8%A7%D9%84%D8%AE%D8%A7%D9%84%D8%AF%D9%8A%D8%A9/%D8%A7%D9%84%D8%AE%D8%A7%D9%84-%D8%A7%D9%84%D8%AF%D9%85%D8%B4%D9%82%D9%8A-144512',
    source: 'HungerStation (Al-Khal Al-Dimashqi)',
    notes: 'Syrian-style chicken shawarma Arabi with garlic paste and pickles.',
  },
  {
    brandId: 'shawarma_habteen',
    canonicalName: 'Shawarma Habteen',
    localPath: '/images/restaurants/shawarma/shawarma-habteen.png',
    status: 'approved',
    sourceUrl: 'https://shawermahabteen.order.sa/',
    source: 'Shawarma Habteen official online ordering',
    notes: 'Official chicken shawarma sandwich menu shot.',
  },
  {
    brandId: 'ziyada_toum',
    canonicalName: 'Ziyada Toum',
    localPath: '/images/restaurants/shawarma/ziyada-toum.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-en/restaurants/regions/jeddah/al-khalidiyah/ziyada-toum-108039',
    source: 'HungerStation (Ziyada Toum)',
    notes: 'Signature toasted sesame wrap on silver platter with generous toum (garlic sauce) and fries.',
  },
  {
    brandId: 'shawarma_elak',
    canonicalName: 'Shawarma Elak',
    localPath: '/images/restaurants/shawarma/shawarma-elak.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-ar/restaurants/regions/%D9%8A%D9%86%D8%A8%D8%B9/%D8%A7%D9%84%D8%B5%D8%B1%D9%8A%D9%81/shawarma-elak-164435',
    source: 'HungerStation (Shawarma Elak)',
    notes: 'Toasted saroukh shawarma sandwich, branded product shot.',
  },
  {
    brandId: 'shawarma_shakir_aljazeera',
    canonicalName: 'Shawarma Shakir Aljazeera',
    localPath: '/images/restaurants/shawarma/shawarma-shakir-aljazeera.jpg',
    status: 'approved',
    sourceUrl: 'https://shakiraljazeera.com/',
    source: 'Shakir Aljazeera official website',
    notes: 'Classic shawarma sandwich spread, official brand photo.',
  },
  {
    brandId: 'shawarma_abu_bahij',
    canonicalName: 'Shawarma Abu Bahij',
    localPath: '/images/restaurants/shawarma/shawarma-abu-bahij.webp',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-ar/restaurants/regions/%D8%AC%D8%AF%D9%87/%D8%A7%D9%84%D8%B5%D9%81%D8%A7/%D8%B4%D8%A7%D9%88%D8%B1%D9%85%D8%A7-%D8%A3%D8%A8%D9%88-%D8%A8%D9%87%D9%8A%D8%AC-148921',
    source: 'HungerStation (Abu Bahij)',
    notes: 'Large Arabic chicken shawarma plate with golden fries and garlic dip.',
  },
  {
    brandId: 'radi_shawarma',
    canonicalName: 'Radi Shawarma and Juices',
    localPath: '/images/restaurants/shawarma/radi-shawarma-and-juices.webp',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-en/restaurants/regions/jeddah/al-hamadaniyah/radi-shawarma-and-juices-169946',
    source: 'HungerStation (Radi Shawarma and Juices)',
    notes: 'Meat shawarma sandwich with signature sauce, food-focused.',
  },
  {
    brandId: 'shawarma_allosh',
    canonicalName: 'Shawarma Allosh',
    localPath: '/images/restaurants/shawarma/shawarma-allosh.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-ar/restaurants/regions/%D8%AC%D8%AF%D9%87/%D8%A7%D9%84%D8%AD%D9%85%D8%B1%D8%A7%D8%A1/%D8%B9%D9%84%D9%88%D8%B4-131369',
    source: 'HungerStation (Shawarma Allosh)',
    notes: 'Double cheese Arabic shawarma plate.',
  },
  {
    brandId: 'shawarma_marmasha',
    canonicalName: 'Shawarma Marmasha',
    localPath: '/images/restaurants/shawarma/shawarma-marmasha.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-en/restaurants/regions/jeddah/al-bawadi/shawarma-marmasha-166124',
    source: 'HungerStation (Shawarma Marmasha)',
    notes: 'Large Arabic shawarma plate with fries and garlic sauces.',
  },
  {
    brandId: 'palm_beach',
    canonicalName: 'Palm Beach',
    localPath: '/images/restaurants/shawarma/palm-beach.jpg',
    status: 'approved',
    sourceUrl: 'https://palmbeachksa.com/',
    source: 'Palm Beach official website',
    notes: 'Official Lebanese shawarma wraps with traditional wrapper (optimized for web delivery).',
  },
  {
    brandId: 'ganat_al_shawarma',
    canonicalName: 'Ganat Al Shawarma',
    localPath: '/images/restaurants/shawarma/ganat-al-shawarma.webp',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-en/restaurants/regions/jeddah/jeddah-islamic-seaport/ganat-al-shawarma-78629',
    source: 'HungerStation (Ganat Al Shawarma)',
    notes: 'Arabic shawarma plate with garlic and crispy french fries.',
  },
  {
    brandId: 'shawarma_jalila',
    canonicalName: 'Shawarma Jalila',
    localPath: '/images/restaurants/shawarma/shawarma-jalila.jpg',
    status: 'approved',
    sourceUrl: 'https://order.shawarmajalila.com/menu/108?language=en',
    source: 'Shawarma Jalila official ordering page',
    notes: 'Official Shawarma Jalila sandwich product shot.',
  },
  {
    brandId: 'samar_jeddah_shawarma',
    canonicalName: 'Samar Jeddah Shawarma',
    localPath: '/images/restaurants/shawarma/samar-jeddah-shawarma.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-ar/restaurants/regions/%D8%AC%D8%AF%D9%87/%D8%A7%D9%84%D8%AD%D9%85%D8%AF%D8%A7%D9%86%D9%8A%D8%A9/%D8%B3%D9%85%D8%B1-%D8%AC%D8%AF%D8%A9-19405',
    source: 'HungerStation (Samar Jeddah Shawarma)',
    notes: 'Signature Samar shawarma wrap with garlic and shotta.',
  },
  {
    brandId: 'professional_shawarma',
    canonicalName: 'Professional Shawarma',
    localPath: '/images/restaurants/shawarma/professional-shawarma.png',
    status: 'approved',
    sourceUrl: 'https://shawarma-pro.com/',
    source: 'Professional Shawarma official website',
    notes: 'Official food-focused shawarma sandwich from shawarma-pro.com.',
  },
  {
    brandId: 'al_wazzan_restaurant',
    canonicalName: 'Al-Wazzan Restaurant',
    localPath: '/images/restaurants/shawarma/al-wazzan-restaurant.jpg',
    status: 'approved',
    sourceUrl: 'https://hungerstation.com/sa-en/restaurant/al-wazzan/jeddah/as-safa/22284',
    source: 'HungerStation (Al-Wazzan)',
    notes: 'Classic Al-Wazzan chicken shawarma sandwich.',
  },
];

export const SHAWARMA_BRAND_IMAGE_MAP: Record<string, string | null> = Object.fromEntries([
  ...SHAWARMA_BRAND_IMAGES.map((b) => [b.brandId, b.localPath]),
  ...SHAWARMA_BRAND_IMAGES.map((b) => [b.canonicalName, b.localPath]),
  ...SHAWARMA_BRAND_IMAGES.map((b) => [b.canonicalName.toLowerCase(), b.localPath]),
  ...SHAWARMA_BRAND_IMAGES.map((b) => [b.brandId.replace(/_/g, '-'), b.localPath]),
]);

export function getShawarmaBrandImage(idOrName?: string | null): string | null {
  if (!idOrName) return null;
  const direct = SHAWARMA_BRAND_IMAGE_MAP[idOrName];
  if (direct) return direct;
  const lower = SHAWARMA_BRAND_IMAGE_MAP[idOrName.toLowerCase()];
  if (lower) return lower;
  const slugUnderscore = SHAWARMA_BRAND_IMAGE_MAP[idOrName.toLowerCase().replace(/[\s-]+/g, '_')];
  if (slugUnderscore) return slugUnderscore;
  const slugHyphen = SHAWARMA_BRAND_IMAGE_MAP[idOrName.toLowerCase().replace(/[\s_]+/g, '-')];
  if (slugHyphen) return slugHyphen;
  return null;
}
