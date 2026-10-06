import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log('--- WESHNAKUL SHAWARMA BRAND IMAGE VERIFICATION ---');

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
  const { SHAWARMA_BRAND_IMAGES, SHAWARMA_BRAND_IMAGE_MAP, getShawarmaBrandImage } = await server.ssrLoadModule('/src/data/shawarmaBrandImages.ts');
  const { normalizeRestaurantDeck, normalizeRestaurantItem } = await server.ssrLoadModule('/src/lib/restaurantNormalization.ts');
  const { SwipeCard } = await server.ssrLoadModule('/src/components/swiping/SwipeCard.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

  // 1. Exact 20 brands in registry
  check('Registry contains exactly 20 Shawarma brands', () => {
    assert.equal(SHAWARMA_BRAND_IMAGES.length, 20);
    assert.equal(new Set(SHAWARMA_BRAND_IMAGES.map((b) => b.brandId)).size, 20);
  });

  // 2. Verified all 20 downloaded local image files exist on disk with exact format matching
  check('All 20 approved brand images exist locally in public/images/restaurants/shawarma/ with matching extensions', () => {
    const approved = SHAWARMA_BRAND_IMAGES.filter((b) => b.localPath !== null);
    assert.equal(approved.length, 20);

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

      const ext = path.extname(fullPath).toLowerCase();
      if (isJpeg) assert.equal(ext, '.jpg', `Extension matches JPEG format for ${b.canonicalName}`);
      if (isPng) assert.equal(ext, '.png', `Extension matches PNG format for ${b.canonicalName}`);
      if (isWebp) assert.equal(ext, '.webp', `Extension matches WebP format for ${b.canonicalName}`);
    }
  });

  // 3. Palm Beach optimized and Ziyada Toum landscape crop verified
  check('Palm Beach is optimized (<400 KB) and Ziyada Toum is landscape (1.4:1-1.8:1)', () => {
    const palm = SHAWARMA_BRAND_IMAGES.find((b) => b.brandId === 'palm_beach');
    assert.ok(palm);
    assert.equal(palm.localPath, '/images/restaurants/shawarma/palm-beach.jpg');
    const palmPath = path.resolve('public', palm.localPath.replace(/^\//, ''));
    const palmSize = fs.statSync(palmPath).size;
    assert.ok(palmSize < 400 * 1024, `Palm Beach size (${palmSize} bytes) is under 400 KB`);

    const ziyada = SHAWARMA_BRAND_IMAGES.find((b) => b.brandId === 'ziyada_toum');
    assert.ok(ziyada);
    assert.equal(ziyada.localPath, '/images/restaurants/shawarma/ziyada-toum.jpg');
    const ziyadaPath = path.resolve('public', ziyada.localPath.replace(/^\//, ''));
    const ziyadaBuf = fs.readFileSync(ziyadaPath);
    let offset = 2;
    let zWidth = 0, zHeight = 0;
    while (offset < ziyadaBuf.length) {
      if (ziyadaBuf[offset] !== 0xff) { offset++; continue; }
      const marker = ziyadaBuf[offset + 1];
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        zHeight = ziyadaBuf.readUInt16BE(offset + 5);
        zWidth = ziyadaBuf.readUInt16BE(offset + 7);
        break;
      }
      offset += 2 + ziyadaBuf.readUInt16BE(offset + 2);
    }
    const zAspect = zWidth / zHeight;
    assert.ok(zAspect >= 1.4 && zAspect <= 1.8, `Ziyada Toum aspect ratio (${zAspect.toFixed(2)}) is landscape within 1.4:1-1.8:1`);
  });

  // 4. The 7 weak/medium brands have verified local paths and approved status
  check('The 7 weak/medium brands have approved status and verified local paths', () => {
    const weakOrMediumBrandIds = [
      'shawarma_classic',
      'shawarma_alrimal',
      'ayedh_shawarma',
      'al_khal_al_dimashqi',
      'shawarma_allosh',
      'palm_beach',
      'professional_shawarma',
    ];

    for (const brandId of weakOrMediumBrandIds) {
      const entry = SHAWARMA_BRAND_IMAGES.find((b) => b.brandId === brandId);
      assert.ok(entry, `Brand entry exists for ${brandId}`);
      assert.equal(entry.status, 'approved');
      assert.ok(entry.localPath && entry.localPath.startsWith('/images/restaurants/shawarma/'));
      assert.ok(entry.sourceUrl && entry.sourceUrl.length > 0);
    }
  });

  // 4. Deck normalization attaches local images to Shawarma candidates
  check('normalizeRestaurantDeck injects verified local image paths into Shawarma cards', () => {
    const rawDeck = {
      deckId: 'deck-shawarma-images',
      generation: 0,
      restaurants: [
        {
          id: 'shawarmer',
          nameAr: 'شاورمر',
          nameEn: 'Shawarmer',
          categories: ['shawarma'],
          coreStatus: 'core',
        },
        {
          id: 'shawarma_classic',
          nameAr: 'شاورما كلاسيك',
          nameEn: 'Shawarma Classic',
          categories: ['shawarma'],
          coreStatus: 'core',
        },
        {
          id: 'palm_beach',
          nameAr: 'بالم بيتش',
          nameEn: 'Palm Beach',
          categories: ['shawarma'],
          coreStatus: 'expansion',
        },
        {
          id: 'professional_shawarma',
          nameAr: 'شاورما بروفيشينال',
          nameEn: 'Professional Shawarma',
          categories: ['shawarma'],
          coreStatus: 'expansion',
        },
        {
          id: 'unknown_place',
          nameAr: 'مكان مجهول',
          nameEn: 'Unknown Place',
          categories: ['shawarma'],
          coreStatus: 'expansion',
        },
      ],
    };

    const normDeck = normalizeRestaurantDeck(rawDeck);
    assert.ok(normDeck);
    assert.equal(normDeck.restaurants.length, 5);

    const shawarmer = normDeck.restaurants.find((r) => r.id === 'shawarmer');
    assert.equal(shawarmer.imageUrl, '/images/restaurants/shawarma/shawarmer.png');

    const classic = normDeck.restaurants.find((r) => r.id === 'shawarma_classic');
    assert.equal(classic.imageUrl, '/images/restaurants/shawarma/shawarma-classic.jpg');

    const palm = normDeck.restaurants.find((r) => r.id === 'palm_beach');
    assert.equal(palm.imageUrl, '/images/restaurants/shawarma/palm-beach.jpg');

    const pro = normDeck.restaurants.find((r) => r.id === 'professional_shawarma');
    assert.equal(pro.imageUrl, '/images/restaurants/shawarma/professional-shawarma.png');

    const unknown = normDeck.restaurants.find((r) => r.id === 'unknown_place');
    assert.equal(unknown.imageUrl, undefined);
  });

  // 5. SwipeCard renders image with object-fit: cover and branded fallback for null
  check('SwipeCard renders object-cover image for Shawarma brand and placeholder for null brand', () => {
    const render = (node) => renderToStaticMarkup(createElement(LocaleProvider, null, node));

    const withImage = normalizeRestaurantItem({
      id: 'shawarmer',
      nameAr: 'شاورمر',
      nameEn: 'Shawarmer',
      categories: ['shawarma'],
      imageUrl: '/images/restaurants/shawarma/shawarmer.png',
    });

    const htmlWithImg = render(
      createElement(SwipeCard, {
        restaurant: withImage,
        isFront: true,
        onVote: () => {},
      })
    );

    assert.ok(htmlWithImg.includes('/images/restaurants/shawarma/shawarmer.png'), 'Contains local image src');
    assert.ok(htmlWithImg.includes('object-cover'), 'Uses object-cover (object-fit: cover)');

    const withoutImage = normalizeRestaurantItem({
      id: 'candidate_without_image',
      nameAr: 'شاورما بدون صورة',
      nameEn: 'No Image Shawarma',
      categories: ['shawarma'],
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

  console.log(`\nALL ${checks} SHAWARMA IMAGE VERIFICATION CHECKS PASSED!`);
} finally {
  await server.close();
}
