import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log('--- WESHNAKUL GRILLS BRAND IMAGE VERIFICATION ---');

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
});

let checks = 0;
const check = (desc, fn) => {
  try {
    fn();
    checks++;
    console.log(`✓ ${desc}`);
  } catch (err) {
    console.error(`✗ FAILED: ${desc}`);
    throw err;
  }
};

try {
  const { GRILLS_BRAND_IMAGES, GRILLS_BRAND_IMAGE_MAP, getGrillsBrandImage } = await server.ssrLoadModule('/src/data/grillsBrandImages.ts');
  const { normalizeRestaurantDeck, normalizeRestaurantItem } = await server.ssrLoadModule('/src/lib/restaurantNormalization.ts');
  const { SwipeCard } = await server.ssrLoadModule('/src/components/swiping/SwipeCard.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

  // 1. Exact 15 curated brands in registry with unique IDs
  check('Registry contains exactly 15 Grills brands with unique IDs', () => {
    assert.equal(GRILLS_BRAND_IMAGES.length, 15);
    assert.equal(new Set(GRILLS_BRAND_IMAGES.map((b) => b.brandId)).size, 15);
  });

  // 2. Verified 12 approved and 3 unresolved brands truthfully documented
  check('Registry truthfully classifies 12 approved brands and 3 unresolved brands', () => {
    const approved = GRILLS_BRAND_IMAGES.filter((b) => b.localPath !== null);
    const unresolved = GRILLS_BRAND_IMAGES.filter((b) => b.localPath === null);

    assert.equal(approved.length, 12, 'Exactly 12 approved brands with local assets');
    assert.equal(unresolved.length, 3, 'Exactly 3 unresolved brands without assets');

    const unresolvedIds = new Set(unresolved.map((b) => b.brandId));
    assert.ok(unresolvedIds.has('skewers_grilled_restaurant'), 'Skewers is marked unresolved');
    assert.ok(unresolvedIds.has('at_beirut_jeddah'), 'At Beirut is marked unresolved');
    assert.ok(unresolvedIds.has('istanbul_grill_restaurant'), 'Istanbul Grill is marked unresolved');
  });

  // 3. Verified all 12 downloaded local image files exist on disk with valid magic bytes
  check('All 12 approved brand images exist locally in public/images/restaurants/grills/', () => {
    const approved = GRILLS_BRAND_IMAGES.filter((b) => b.localPath !== null);

    for (const b of approved) {
      assert.ok(b.localPath.startsWith('/images/restaurants/grills/'), `Valid local path prefix for ${b.canonicalName}`);
      const relPath = b.localPath.replace(/^\//, '');
      const fullPath = path.resolve('public', relPath);
      assert.ok(fs.existsSync(fullPath), `File exists for ${b.canonicalName}: ${fullPath}`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 1000, `Image for ${b.canonicalName} has non-trivial size (${stat.size} bytes)`);
      assert.ok(stat.size < 500 * 1024, `Image for ${b.canonicalName} is web-friendly (<500 KB): ${stat.size} bytes`);

      // Verify magic bytes
      const fd = fs.openSync(fullPath, 'r');
      const header = Buffer.alloc(16);
      fs.readSync(fd, header, 0, 16, 0);
      fs.closeSync(fd);

      const isJpeg = header[0] === 0xff && header[1] === 0xd8;
      const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
      const isWebp = header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP';
      const isAvif = header.toString('ascii', 4, 8) === 'ftyp' && (header.toString('ascii', 8, 12) === 'avif' || header.toString('ascii', 8, 12) === 'avis');

      assert.ok(isJpeg || isPng || isWebp || isAvif, `Valid image format for ${b.canonicalName}`);

      // Verify file extension matches magic bytes
      const ext = path.extname(fullPath).toLowerCase();
      if (isJpeg) assert.ok(ext === '.jpg' || ext === '.jpeg', `Extension matches JPEG for ${b.canonicalName}`);
      if (isPng) assert.equal(ext, '.png', `Extension matches PNG for ${b.canonicalName}`);
      if (isWebp) assert.equal(ext, '.webp', `Extension matches WEBP for ${b.canonicalName}`);
      if (isAvif) assert.equal(ext, '.avif', `Extension matches AVIF for ${b.canonicalName}`);
    }
  });

  // 4. Manifest alignment with JSON source of truth
  check('Manifest JSON exists and aligns 1:1 with TypeScript registry', () => {
    const manifestPath = path.resolve('docs/research/weshnakul_grills_images_approved.json');
    assert.ok(fs.existsSync(manifestPath), 'Manifest JSON file exists');
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(raw);

    assert.equal(manifest.brand_count, 15);
    assert.equal(manifest.category, 'grills');
    assert.equal(manifest.brands.length, 15);
    assert.equal(manifest.approved_image_count, 12);
    assert.equal(manifest.unresolved_image_count, 3);

    for (const b of manifest.brands) {
      const reg = GRILLS_BRAND_IMAGES.find((item) => item.brandId === b.id);
      assert.ok(reg, `Brand ${b.id} present in TypeScript registry`);
      assert.equal(reg.localPath, b.local_path, `Local path matches for ${b.name}`);
      assert.equal(reg.status, b.selection_status, `Status matches for ${b.name}`);
    }
  });

  // 5. Deterministic brand ID and name resolution
  check('getGrillsBrandImage resolves approved brands and safely returns null for unresolved/unknown', () => {
    const approved = GRILLS_BRAND_IMAGES.filter((b) => b.localPath !== null);
    for (const b of approved) {
      assert.equal(getGrillsBrandImage(b.brandId), b.localPath, `Resolves by brandId: ${b.brandId}`);
      assert.equal(getGrillsBrandImage(b.canonicalName), b.localPath, `Resolves by canonicalName: ${b.canonicalName}`);
      assert.equal(getGrillsBrandImage(b.manifestName), b.localPath, `Resolves by manifestName: ${b.manifestName}`);
      assert.equal(getGrillsBrandImage(b.brandId.toLowerCase()), b.localPath, `Resolves case-insensitively: ${b.brandId}`);
      assert.equal(getGrillsBrandImage(b.canonicalName.toLowerCase()), b.localPath, `Resolves case-insensitively: ${b.canonicalName}`);
    }

    // Unresolved brands must return null
    assert.equal(getGrillsBrandImage('skewers_grilled_restaurant'), null, 'Skewers resolves to null');
    assert.equal(getGrillsBrandImage('at_beirut_jeddah'), null, 'At Beirut resolves to null');
    assert.equal(getGrillsBrandImage('at_beirut'), null, 'At Beirut alias resolves to null');
    assert.equal(getGrillsBrandImage('istanbul_grill_restaurant'), null, 'Istanbul Grill resolves to null');
    assert.equal(getGrillsBrandImage('non_existent_grill'), null, 'Non-existent returns null');
    assert.equal(getGrillsBrandImage(null), null);
    assert.equal(getGrillsBrandImage(undefined), null);
  });

  // 6. Deck normalization attaches local images to Grills candidates
  check('normalizeRestaurantDeck injects verified local image paths into Grills cards', () => {
    const rawDeck = {
      deckId: 'deck-grills-images',
      generation: 0,
      restaurants: [
        {
          id: 'khayal_restaurant',
          nameAr: 'مطعم خيال',
          nameEn: 'Khayal Restaurant',
          categories: ['grills'],
        },
        {
          id: 'ennabi_grill',
          nameAr: 'المشوى العنابي',
          nameEn: 'Ennabi Grill',
          categories: ['grills'],
        },
        {
          id: 'kabebo',
          nameAr: 'كابيبو',
          nameEn: 'Kabebo',
          categories: ['grills'],
        },
        {
          id: 'al_hamraa_barbecue_restaurant',
          nameAr: 'مطاعم مشويات الحمراء',
          nameEn: 'Al Hamraa Barbecue Restaurant',
          categories: ['grills'],
        },
        {
          id: 'texas_roadhouse',
          nameAr: 'تكساس رودهاوس',
          nameEn: 'Texas Roadhouse',
          categories: ['grills'],
        },
        {
          id: 'skewers_grilled_restaurant',
          nameAr: 'مطعم سكيوورز للمشويات',
          nameEn: 'Skewers Grilled Restaurant',
          categories: ['grills'],
        },
        {
          id: 'unknown_grill_spot',
          nameAr: 'مشاوي مجهولة',
          nameEn: 'Unknown Grill Spot',
          categories: ['grills'],
        },
      ],
    };

    const normDeck = normalizeRestaurantDeck(rawDeck);
    assert.ok(normDeck);
    assert.equal(normDeck.restaurants.length, 7);

    const khayal = normDeck.restaurants.find((r) => r.id === 'khayal_restaurant');
    assert.equal(khayal.imageUrl, '/images/restaurants/grills/khayal.webp');

    const ennabi = normDeck.restaurants.find((r) => r.id === 'ennabi_grill');
    assert.equal(ennabi.imageUrl, '/images/restaurants/grills/ennabi-grill.jpg');

    const kabebo = normDeck.restaurants.find((r) => r.id === 'kabebo');
    assert.equal(kabebo.imageUrl, '/images/restaurants/grills/kabebo.avif');

    const alHamraa = normDeck.restaurants.find((r) => r.id === 'al_hamraa_barbecue_restaurant');
    assert.equal(alHamraa.imageUrl, '/images/restaurants/grills/al-hamraa.webp');

    const texas = normDeck.restaurants.find((r) => r.id === 'texas_roadhouse');
    assert.equal(texas.imageUrl, '/images/restaurants/grills/texas-roadhouse.jpg');

    const skewers = normDeck.restaurants.find((r) => r.id === 'skewers_grilled_restaurant');
    assert.equal(skewers.imageUrl, undefined, 'Unresolved Skewers does not have local image');

    const unknown = normDeck.restaurants.find((r) => r.id === 'unknown_grill_spot');
    assert.equal(unknown.imageUrl, undefined);
  });

  // 7. SwipeCard renders image with object-fit: cover for Grills cards
  check('SwipeCard renders object-cover image for approved Grills brands', () => {
    const render = (node) => renderToStaticMarkup(createElement(LocaleProvider, null, node));
    const approved = GRILLS_BRAND_IMAGES.filter((b) => b.localPath !== null);

    for (const b of approved) {
      const item = normalizeRestaurantItem({
        id: b.brandId,
        nameAr: b.canonicalName,
        nameEn: b.canonicalName,
        categories: ['grills'],
        imageUrl: b.localPath,
      });

      const html = render(
        createElement(SwipeCard, {
          restaurant: item,
          isFront: true,
          onVote: () => {},
        })
      );

      assert.ok(html.includes(b.localPath), `Card for ${b.canonicalName} contains image src ${b.localPath}`);
      assert.ok(html.includes('object-cover'), `Card for ${b.canonicalName} uses object-cover styling`);
    }
  });

  // 8. No accidental cross-brand or cross-category collisions
  check('Approved Grills images are unique across brands and do not collide', () => {
    const approved = GRILLS_BRAND_IMAGES.filter((b) => b.localPath !== null);
    const paths = approved.map((b) => b.localPath);
    assert.equal(new Set(paths).size, approved.length, 'Every approved brand has a distinct local image path');
  });

  console.log(`\nALL ${checks} GRILLS IMAGE VERIFICATION CHECKS PASSED!`);
} finally {
  await server.close();
}
