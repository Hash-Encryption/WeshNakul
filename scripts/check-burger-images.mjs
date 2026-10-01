import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log('--- WESHNAKUL BURGER BRAND IMAGE VERIFICATION ---');

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
  const { BURGER_BRAND_IMAGES, BURGER_BRAND_IMAGE_MAP, getBurgerBrandImage } = await server.ssrLoadModule('/src/data/burgerBrandImages.ts');
  const { normalizeRestaurantDeck, normalizeRestaurantItem } = await server.ssrLoadModule('/src/lib/restaurantNormalization.ts');
  const { SwipeCard } = await server.ssrLoadModule('/src/components/swiping/SwipeCard.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

  // 1. Exact 21 brands in registry
  check('Registry contains exactly 21 Burger brands', () => {
    assert.equal(BURGER_BRAND_IMAGES.length, 21);
    assert.equal(new Set(BURGER_BRAND_IMAGES.map((b) => b.brandId)).size, 21);
  });

  // 2. Verified all 21 downloaded local image files exist on disk
  check('All 21 approved brand images exist locally in public/images/restaurants/burger/', () => {
    const approved = BURGER_BRAND_IMAGES.filter((b) => b.localPath !== null);
    assert.equal(approved.length, 21);

    for (const b of approved) {
      const relPath = b.localPath.replace(/^\//, '');
      const fullPath = path.resolve('public', relPath);
      assert.ok(fs.existsSync(fullPath), `File exists for ${b.canonicalName}: ${fullPath}`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 1000, `Image for ${b.canonicalName} has non-trivial size (${stat.size} bytes)`);

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
  });

  // 3. Nora Burger and BRGR1983 verified with dedicated local paths and approved status
  check('Nora Burger and BRGR1983 have verified local paths and approved status', () => {
    const nora = BURGER_BRAND_IMAGES.find((b) => b.brandId === 'nora_burger');
    assert.ok(nora);
    assert.equal(nora.localPath, '/images/restaurants/burger/nora-burger.jpg');
    assert.equal(nora.status, 'approved');

    const brgr = BURGER_BRAND_IMAGES.find((b) => b.brandId === 'brgr1983');
    assert.ok(brgr);
    assert.equal(brgr.localPath, '/images/restaurants/burger/brgr1983.jpg');
    assert.equal(brgr.status, 'approved');
  });

  // 4. Deck normalization attaches local images to burger candidates
  check('normalizeRestaurantDeck injects verified local image paths into deck cards', () => {
    const rawDeck = {
      deckId: 'deck-burger-images',
      generation: 0,
      restaurants: [
        {
          id: 'section_b',
          nameAr: 'سكشن بي',
          nameEn: 'Section-B',
          categories: ['burger'],
          coreStatus: 'core',
        },
        {
          id: 'century_burger',
          nameAr: 'سنشري برجر',
          nameEn: 'Century Burger',
          categories: ['burger'],
          coreStatus: 'core',
        },
        {
          id: 'nora_burger',
          nameAr: 'نورا برجر',
          nameEn: 'Nora Burger',
          categories: ['burger'],
          coreStatus: 'core',
        },
        {
          id: 'brgr1983',
          nameAr: 'برجر 1983',
          nameEn: 'BRGR1983',
          categories: ['burger'],
          coreStatus: 'expansion',
        },
        {
          id: 'unknown_place',
          nameAr: 'مكان مجهول',
          nameEn: 'Unknown Place',
          categories: ['burger'],
          coreStatus: 'expansion',
        },
      ],
    };

    const normDeck = normalizeRestaurantDeck(rawDeck);
    assert.ok(normDeck);
    assert.equal(normDeck.restaurants.length, 5);

    const sectionB = normDeck.restaurants.find((r) => r.id === 'section_b');
    assert.equal(sectionB.imageUrl, '/images/restaurants/burger/section-b.jpg');

    const century = normDeck.restaurants.find((r) => r.id === 'century_burger');
    assert.equal(century.imageUrl, '/images/restaurants/burger/century-burger.webp');

    const nora = normDeck.restaurants.find((r) => r.id === 'nora_burger');
    assert.equal(nora.imageUrl, '/images/restaurants/burger/nora-burger.jpg');

    const brgr = normDeck.restaurants.find((r) => r.id === 'brgr1983');
    assert.equal(brgr.imageUrl, '/images/restaurants/burger/brgr1983.jpg');

    const unknown = normDeck.restaurants.find((r) => r.id === 'unknown_place');
    assert.equal(unknown.imageUrl, undefined);
  });

  // 5. SwipeCard renders image with object-fit: cover and branded fallback for null
  check('SwipeCard renders object-cover image for approved brand and placeholder for null brand', () => {
    const render = (node) => renderToStaticMarkup(createElement(LocaleProvider, null, node));

    const withImage = normalizeRestaurantItem({
      id: 'section_b',
      nameAr: 'سكشن بي',
      nameEn: 'Section-B',
      categories: ['burger'],
      imageUrl: '/images/restaurants/burger/section-b.jpg',
    });

    const htmlWithImg = render(
      createElement(SwipeCard, {
        restaurant: withImage,
        isFront: true,
        onVote: () => {},
      })
    );

    assert.ok(htmlWithImg.includes('/images/restaurants/burger/section-b.jpg'), 'Contains local image src');
    assert.ok(htmlWithImg.includes('object-cover'), 'Uses object-cover (object-fit: cover)');

    const withoutImage = normalizeRestaurantItem({
      id: 'candidate_without_image',
      nameAr: 'برجر بدون صورة',
      nameEn: 'No Image Burger',
      categories: ['burger'],
      imageUrl: undefined,
    });

    const htmlWithoutImg = render(
      createElement(SwipeCard, {
        restaurant: withoutImage,
        isFront: true,
        onVote: () => {},
      })
    );

    assert.ok(htmlWithoutImg.includes('🍽️'), 'Renders placeholder icon when imageUrl is missing');
    assert.ok(htmlWithoutImg.includes('وش ناكل؟') || htmlWithoutImg.includes('WeshNakul'), 'Renders branded placeholder text');
  });

  console.log(`\nALL ${checks} BURGER IMAGE VERIFICATION CHECKS PASSED!`);
} finally {
  await server.close();
}
