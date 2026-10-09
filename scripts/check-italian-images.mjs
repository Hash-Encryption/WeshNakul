import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log('--- WESHNAKUL ITALIAN BRAND IMAGE VERIFICATION ---');

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
  const { ITALIAN_BRAND_IMAGES, ITALIAN_BRAND_IMAGE_MAP, getItalianBrandImage } = await server.ssrLoadModule('/src/data/italianBrandImages.ts');
  const { normalizeRestaurantDeck, normalizeRestaurantItem } = await server.ssrLoadModule('/src/lib/restaurantNormalization.ts');
  const { SwipeCard } = await server.ssrLoadModule('/src/components/swiping/SwipeCard.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

  // 1. Exact 16 curated brands in registry with unique IDs
  check('Registry contains exactly 16 Italian brands with unique IDs', () => {
    assert.equal(ITALIAN_BRAND_IMAGES.length, 16);
    assert.equal(new Set(ITALIAN_BRAND_IMAGES.map((b) => b.brandId)).size, 16);
  });

  // 2. Truthful classification: all 16 approved
  check('Registry truthfully classifies all 16 brands as approved', () => {
    const approved = ITALIAN_BRAND_IMAGES.filter((b) => b.status === 'approved');
    const pending = ITALIAN_BRAND_IMAGES.filter((b) => b.status === 'pending_user_visual_approval');

    assert.equal(approved.length, 16, 'Exactly 16 approved brands');
    assert.equal(pending.length, 0, 'Zero pending brands');
  });

  // 3. Verified all 16 downloaded local image files exist on disk with valid magic bytes
  check('All 16 brand images exist locally in public/images/restaurants/italian/', () => {
    for (const b of ITALIAN_BRAND_IMAGES) {
      assert.ok(b.localPath !== null, `Local path defined for ${b.canonicalName}`);
      assert.ok(b.localPath.startsWith('/images/restaurants/italian/'), `Valid local path prefix for ${b.canonicalName}`);
      const relPath = b.localPath.replace(/^\//, '');
      const fullPath = path.resolve('public', relPath);
      assert.ok(fs.existsSync(fullPath), `File exists for ${b.canonicalName}: ${fullPath}`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 1000, `Image for ${b.canonicalName} has non-trivial size (${stat.size} bytes)`);
      assert.ok(stat.size < 400 * 1024, `Image for ${b.canonicalName} is web-friendly (<400 KB): ${stat.size} bytes`);

      // Verify magic bytes
      const fd = fs.openSync(fullPath, 'r');
      const header = Buffer.alloc(16);
      fs.readSync(fd, header, 0, 16, 0);
      fs.closeSync(fd);

      const isJpeg = header[0] === 0xff && header[1] === 0xd8;
      const isPng = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47;
      const isWebp = header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP';

      assert.ok(isJpeg || isPng || isWebp, `Valid image format for ${b.canonicalName}`);

      // Verify file extension matches magic bytes
      const ext = path.extname(fullPath).toLowerCase();
      if (isJpeg) assert.ok(ext === '.jpg' || ext === '.jpeg', `Extension matches JPEG for ${b.canonicalName}`);
      if (isPng) assert.equal(ext, '.png', `Extension matches PNG for ${b.canonicalName}`);
      if (isWebp) assert.equal(ext, '.webp', `Extension matches WEBP for ${b.canonicalName}`);
    }
  });

  // 4. Manifest alignment with JSON source of truth
  check('Manifest JSON exists and aligns 1:1 with TypeScript registry', () => {
    const manifestPath = path.resolve('docs/research/weshnakul_italian_images_approved.json');
    assert.ok(fs.existsSync(manifestPath), 'Manifest JSON file exists');
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(raw);

    assert.equal(manifest.brand_count, 16);
    assert.equal(manifest.category, 'italian');
    assert.equal(manifest.brands.length, 16);
    assert.equal(manifest.approved_image_count, 16);
    assert.equal(manifest.pending_approval_count, 0);

    for (const b of manifest.brands) {
      const reg = ITALIAN_BRAND_IMAGES.find((item) => item.brandId === b.id);
      assert.ok(reg, `Brand ${b.id} present in TypeScript registry`);
      assert.equal(reg.localPath, b.local_path, `Local path matches for ${b.name}`);
      assert.equal(reg.status, b.selection_status, `Status matches for ${b.name}`);
    }
  });

  // 5. Deterministic brand ID and name resolution
  check('getItalianBrandImage resolves brands and safely returns null for unknown', () => {
    for (const b of ITALIAN_BRAND_IMAGES) {
      assert.equal(getItalianBrandImage(b.brandId), b.localPath, `Resolves by brandId: ${b.brandId}`);
      assert.equal(getItalianBrandImage(b.canonicalName), b.localPath, `Resolves by canonicalName: ${b.canonicalName}`);
      assert.equal(getItalianBrandImage(b.manifestName), b.localPath, `Resolves by manifestName: ${b.manifestName}`);
      assert.equal(getItalianBrandImage(b.brandId.toLowerCase()), b.localPath, `Resolves case-insensitively: ${b.brandId}`);
      assert.equal(getItalianBrandImage(b.canonicalName.toLowerCase()), b.localPath, `Resolves case-insensitively: ${b.canonicalName}`);
    }

    assert.equal(getItalianBrandImage('non_existent_brand'), null);
    assert.equal(getItalianBrandImage(null), null);
    assert.equal(getItalianBrandImage(undefined), null);
  });

  // 6. Normalization pipeline assigns local Italian images
  check('normalizeRestaurantDeck populates local imageUrl for Italian brands', () => {
    const rawDeck = {
      deckId: 'deck-italian-test',
      generation: 1,
      restaurants: [
        { id: 'jon_and_vinnys', nameEn: "Jon & Vinny's", nameAr: "جون آند فينيز", categories: ['italian'] },
        { id: 'noto', nameEn: 'Noto', nameAr: 'نوتو', categories: ['italian'] },
        { id: 'san_carlo_cicchetti', nameEn: 'San Carlo Cicchetti', nameAr: 'سان كارلو تشيكيتّي', categories: ['italian'] },
        { id: 'piatto', nameEn: 'Piatto', nameAr: 'بياتو', categories: ['italian'] },
        { id: 'olive_garden', nameEn: 'Olive Garden', nameAr: 'أوليف جاردن', categories: ['italian'] },
        { id: 'eataly', nameEn: 'Eataly', nameAr: 'إيتالي', categories: ['italian'] },
        { id: 'il_vero', nameEn: 'IL Vero', nameAr: 'إل فيرو', categories: ['italian'] },
        { id: 'portofino', nameEn: 'Portofino', nameAr: 'بورتوفينو', categories: ['italian'] },
        { id: 'vivaci', nameEn: 'Vivaci', nameAr: 'فيفاتشي', categories: ['italian'] },
        { id: 'napoli_blu', nameEn: 'Napoli Blu', nameAr: 'نابولي بلو', categories: ['italian'] },
        { id: 'il_postino_pizzeria', nameEn: 'il Postino Pizzeria', nameAr: 'إل بوستينو بيتزاريا', categories: ['italian'] },
        { id: 'wood_fire_pizza_lenuo', nameEn: 'Pizza Lenuo', nameAr: 'بيتزا لينو', categories: ['italian'] },
        { id: 'verra_pizza', nameEn: 'Vera Pizza', nameAr: 'ڤيرا', categories: ['italian'] },
        { id: 'salernoo', nameEn: 'Salernoo', nameAr: 'ساليرنو', categories: ['italian'] },
        { id: 'il_castello', nameEn: 'IL Castello', nameAr: 'إل كاستيلو', categories: ['italian'] },
        { id: 'pizzalio', nameEn: 'Pizzalio', nameAr: 'بيتزاليو', categories: ['italian'] },
      ],
    };

    const normalized = normalizeRestaurantDeck(rawDeck);
    assert.ok(normalized, 'Normalized deck is non-null');
    assert.equal(normalized.restaurants.length, 16);

    for (const r of normalized.restaurants) {
      assert.ok(r.imageUrl, `Restaurant ${r.id} has an imageUrl`);
      assert.ok(r.imageUrl.startsWith('/images/restaurants/italian/'), `Local italian path for ${r.id}`);
    }
  });

  // 7. SSR rendering with SwipeCard renders local images properly
  check('SwipeCard renders local Italian image in SSR markup', () => {
    const item = normalizeRestaurantItem({
      id: 'vivaci',
      nameEn: 'Vivaci',
      nameAr: 'فيفاتشي',
      categories: ['italian'],
      imageUrl: '/images/restaurants/italian/vivaci.jpg',
    });
    assert.ok(item, 'Item normalized successfully');

    const markup = renderToStaticMarkup(
      createElement(
        LocaleProvider,
        null,
        createElement(SwipeCard, {
          restaurant: item,
          isFront: true,
          onVote: () => {},
        })
      )
    );

    assert.ok(markup.includes('/images/restaurants/italian/vivaci.jpg'), 'Markup includes local image URL');
  });

  console.log(`\nAll ${checks} verification checks passed!`);
} finally {
  await server.close();
}
