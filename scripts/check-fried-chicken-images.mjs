import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log('--- WESHNAKUL FRIED CHICKEN BRAND IMAGE VERIFICATION ---');

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
  const { FRIED_CHICKEN_BRAND_IMAGES, FRIED_CHICKEN_BRAND_IMAGE_MAP, getFriedChickenBrandImage } = await server.ssrLoadModule('/src/data/friedChickenBrandImages.ts');
  const { normalizeRestaurantDeck, normalizeRestaurantItem } = await server.ssrLoadModule('/src/lib/restaurantNormalization.ts');
  const { SwipeCard } = await server.ssrLoadModule('/src/components/swiping/SwipeCard.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

  // 1. Exact 18 brands in registry
  check('Registry contains exactly 18 Fried Chicken brands with unique IDs', () => {
    assert.equal(FRIED_CHICKEN_BRAND_IMAGES.length, 18);
    assert.equal(new Set(FRIED_CHICKEN_BRAND_IMAGES.map((b) => b.brandId)).size, 18);
  });

  // 2. Verified all 18 downloaded local image files exist on disk
  check('All 18 approved brand images exist locally in public/images/restaurants/fried_chicken/', () => {
    const approved = FRIED_CHICKEN_BRAND_IMAGES.filter((b) => b.localPath !== null);
    assert.equal(approved.length, 18);

    for (const b of approved) {
      assert.ok(b.localPath.startsWith('/images/restaurants/fried_chicken/'), `Valid local path prefix for ${b.canonicalName}`);
      const relPath = b.localPath.replace(/^\//, '');
      const fullPath = path.resolve('public', relPath);
      assert.ok(fs.existsSync(fullPath), `File exists for ${b.canonicalName}: ${fullPath}`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 1000, `Image for ${b.canonicalName} has non-trivial size (${stat.size} bytes)`);
      assert.ok(stat.size < 400 * 1024, `Image for ${b.canonicalName} is web-friendly (<400 KB): ${stat.size} bytes`);

      // Verify magic bytes
      const fd = fs.openSync(fullPath, 'r');
      const header = Buffer.alloc(12);
      fs.readSync(fd, header, 0, 12, 0);
      fs.closeSync(fd);

      const isJpeg = header[0] === 0xff && header[1] === 0xd8;
      const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
      const isWebp = header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP';

      assert.ok(isJpeg || isPng || isWebp, `Valid image format for ${b.canonicalName}`);
    }

    // Verify retired Al Najah image is absent
    assert.equal(fs.existsSync(path.resolve('public/images/restaurants/fried_chicken/al-najah-broast.jpg')), false, 'Al Najah image must be removed');
  });

  // 3. Rotation pool membership verified (2 brands)
  check('Broast rotation pool contains exactly rami_broast and broast_hanoo', () => {
    const rotationMembers = FRIED_CHICKEN_BRAND_IMAGES.filter((b) => b.isBroastRotationMember);
    assert.equal(rotationMembers.length, 2);
    const rotationIds = rotationMembers.map((b) => b.brandId).sort();
    assert.deepEqual(rotationIds, ['broast_hanoo', 'rami_broast']);

    // Anchors/staples are NOT rotation members
    const nonRotationIds = ['albaik', 'chicken_mubeen', 'ktaykit'];
    for (const id of nonRotationIds) {
      const brand = FRIED_CHICKEN_BRAND_IMAGES.find((b) => b.brandId === id);
      assert.ok(brand, `Brand exists: ${id}`);
      assert.equal(brand.isBroastRotationMember, false, `${id} must not be in the rotation pool`);
    }

    // Retired Al Najah must not exist in registry
    assert.equal(FRIED_CHICKEN_BRAND_IMAGES.some(b => b.brandId === 'al_najah_broast'), false);
    assert.equal(getFriedChickenBrandImage('al_najah_broast'), null);
  });

  // 4. Special cases: Broast Hanoo, Dabboos
  check('Special cases (Broast Hanoo, Dabboos) have valid approved status and local paths', () => {
    const hanoo = FRIED_CHICKEN_BRAND_IMAGES.find((b) => b.brandId === 'broast_hanoo');
    assert.ok(hanoo);
    assert.equal(hanoo.status, 'approved');
    assert.equal(hanoo.localPath, '/images/restaurants/fried_chicken/broast-hanoo.jpg');

    const dabboos = FRIED_CHICKEN_BRAND_IMAGES.find((b) => b.brandId === 'dabboos');
    assert.ok(dabboos);
    assert.equal(dabboos.status, 'approved');
    assert.equal(dabboos.localPath, '/images/restaurants/fried_chicken/dabboos.jpg');
  });

  // 5. Deck normalization attaches local images to Fried Chicken candidates
  check('normalizeRestaurantDeck injects verified local image paths into Fried Chicken cards', () => {
    const rawDeck = {
      deckId: 'deck-fried-chicken-images',
      generation: 0,
      restaurants: [
        {
          id: 'albaik',
          nameAr: 'البيك',
          nameEn: 'ALBAIK',
          categories: ['fried_chicken'],
          coreStatus: 'core',
        },
        {
          id: 'rami_broast',
          nameAr: 'بروست رامي',
          nameEn: 'Rami Broast',
          categories: ['fried_chicken'],
          coreStatus: 'core',
        },
        {
          id: 'broast_hanoo',
          nameAr: 'بروست هانو',
          nameEn: 'Broast Hanoo',
          categories: ['fried_chicken'],
          coreStatus: 'expansion',
        },
        {
          id: 'dabboos',
          nameAr: 'دبوس',
          nameEn: 'Dabboos',
          categories: ['fried_chicken'],
          coreStatus: 'core',
        },
        {
          id: 'unknown_chicken',
          nameAr: 'دجاج مجهول',
          nameEn: 'Unknown Chicken',
          categories: ['fried_chicken'],
          coreStatus: 'expansion',
        },
      ],
    };

    const normDeck = normalizeRestaurantDeck(rawDeck);
    assert.ok(normDeck);
    assert.equal(normDeck.restaurants.length, 5);

    const albaik = normDeck.restaurants.find((r) => r.id === 'albaik');
    assert.equal(albaik.imageUrl, '/images/restaurants/fried_chicken/albaik.jpg');

    const rami = normDeck.restaurants.find((r) => r.id === 'rami_broast');
    assert.equal(rami.imageUrl, '/images/restaurants/fried_chicken/rami-broast.jpg');

    const hanoo = normDeck.restaurants.find((r) => r.id === 'broast_hanoo');
    assert.equal(hanoo.imageUrl, '/images/restaurants/fried_chicken/broast-hanoo.jpg');

    const dabboos = normDeck.restaurants.find((r) => r.id === 'dabboos');
    assert.equal(dabboos.imageUrl, '/images/restaurants/fried_chicken/dabboos.jpg');

    const unknown = normDeck.restaurants.find((r) => r.id === 'unknown_chicken');
    assert.equal(unknown.imageUrl, undefined);
  });

  // 6. SwipeCard renders image with object-fit: cover
  check('SwipeCard renders object-cover image for approved Fried Chicken brand', () => {
    const render = (node) => renderToStaticMarkup(createElement(LocaleProvider, null, node));

    const withImage = normalizeRestaurantItem({
      id: 'albaik',
      nameAr: 'البيك',
      nameEn: 'ALBAIK',
      categories: ['fried_chicken'],
      imageUrl: '/images/restaurants/fried_chicken/albaik.jpg',
    });

    const htmlWithImg = render(
      createElement(SwipeCard, {
        restaurant: withImage,
        isFront: true,
        onVote: () => {},
      })
    );

    assert.ok(htmlWithImg.includes('/images/restaurants/fried_chicken/albaik.jpg'), 'Contains local image src');
    assert.ok(htmlWithImg.includes('object-cover'), 'Uses object-cover (object-fit: cover)');
  });

  console.log(`\nALL ${checks} FRIED CHICKEN IMAGE VERIFICATION CHECKS PASSED!`);
} finally {
  await server.close();
}
