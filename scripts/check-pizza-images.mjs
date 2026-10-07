import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

console.log('--- WESHNAKUL PIZZA BRAND IMAGE VERIFICATION ---');

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
  const { PIZZA_BRAND_IMAGES, PIZZA_BRAND_IMAGE_MAP, getPizzaBrandImage } = await server.ssrLoadModule('/src/data/pizzaBrandImages.ts');
  const { normalizeRestaurantDeck, normalizeRestaurantItem } = await server.ssrLoadModule('/src/lib/restaurantNormalization.ts');
  const { SwipeCard } = await server.ssrLoadModule('/src/components/swiping/SwipeCard.tsx');
  const { LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');

  // 1. Exact 18 brands in registry
  check('Registry contains exactly 18 Pizza brands with unique IDs', () => {
    assert.equal(PIZZA_BRAND_IMAGES.length, 18);
    assert.equal(new Set(PIZZA_BRAND_IMAGES.map((b) => b.brandId)).size, 18);
  });

  // 2. Verified all 18 downloaded local image files exist on disk
  check('All 18 approved brand images exist locally in public/images/restaurants/pizza/', () => {
    const approved = PIZZA_BRAND_IMAGES.filter((b) => b.localPath !== null);
    assert.equal(approved.length, 18);

    for (const b of approved) {
      assert.ok(b.localPath.startsWith('/images/restaurants/pizza/'), `Valid local path prefix for ${b.canonicalName}`);
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

      // Verify file extension matches magic bytes
      const ext = path.extname(fullPath).toLowerCase();
      if (isJpeg) assert.ok(ext === '.jpg' || ext === '.jpeg', `Extension matches JPEG for ${b.canonicalName}`);
      if (isPng) assert.equal(ext, '.png', `Extension matches PNG for ${b.canonicalName}`);
      if (isWebp) assert.equal(ext, '.webp', `Extension matches WEBP for ${b.canonicalName}`);
    }
  });

  // 3. Manifest alignment with JSON source of truth
  check('Manifest JSON exists and aligns 1:1 with TypeScript registry', () => {
    const manifestPath = path.resolve('docs/research/weshnakul_pizza_images_approved.json');
    assert.ok(fs.existsSync(manifestPath), 'Manifest JSON file exists');
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(raw);

    assert.equal(manifest.brand_count, 18);
    assert.equal(manifest.category, 'pizza');
    assert.equal(manifest.brands.length, 18);

    for (const b of manifest.brands) {
      assert.equal(b.selection_status, 'approved');
      assert.ok(b.local_path, `Local path specified for ${b.name}`);
      const reg = PIZZA_BRAND_IMAGES.find((item) => item.brandId === b.id);
      assert.ok(reg, `Brand ${b.id} present in TypeScript registry`);
      assert.equal(reg.localPath, b.local_path);
    }
  });

  // 4. Deterministic brand ID and name resolution
  check('getPizzaBrandImage resolves all 18 brands deterministically by ID, canonical name, and manifest name', () => {
    for (const b of PIZZA_BRAND_IMAGES) {
      assert.equal(getPizzaBrandImage(b.brandId), b.localPath, `Resolves by brandId: ${b.brandId}`);
      assert.equal(getPizzaBrandImage(b.canonicalName), b.localPath, `Resolves by canonicalName: ${b.canonicalName}`);
      assert.equal(getPizzaBrandImage(b.manifestName), b.localPath, `Resolves by manifestName: ${b.manifestName}`);
      assert.equal(getPizzaBrandImage(b.brandId.toLowerCase()), b.localPath, `Resolves case-insensitively: ${b.brandId}`);
      assert.equal(getPizzaBrandImage(b.canonicalName.toLowerCase()), b.localPath, `Resolves case-insensitively: ${b.canonicalName}`);
    }
    assert.equal(getPizzaBrandImage('non_existent_pizza'), null);
    assert.equal(getPizzaBrandImage(null), null);
    assert.equal(getPizzaBrandImage(undefined), null);
  });

  // 5. Deck normalization attaches local images to Pizza candidates
  check('normalizeRestaurantDeck injects verified local image paths into Pizza cards', () => {
    const rawDeck = {
      deckId: 'deck-pizza-images',
      generation: 0,
      restaurants: [
        {
          id: 'dominos',
          nameAr: "دومينوز",
          nameEn: "Domino's",
          categories: ['pizza'],
        },
        {
          id: 'maestro_pizza',
          nameAr: 'مايسترو بيتزا',
          nameEn: 'Maestro Pizza',
          categories: ['pizza'],
        },
        {
          id: 'il_postino_pizzeria',
          nameAr: 'إل بوستينو بيتزاريا',
          nameEn: 'Il Postino Pizzeria',
          categories: ['pizza'],
        },
        {
          id: 'white_wood_pizzeria',
          nameAr: 'وايت وود بيتزاريا',
          nameEn: 'White Wood Pizzeria',
          categories: ['pizza'],
        },
        {
          id: 'verra_pizza',
          nameAr: 'فيرا بيتزا',
          nameEn: 'Verra Pizza',
          categories: ['pizza'],
        },
        {
          id: 'unknown_pizza_joint',
          nameAr: 'بيتزا مجهولة',
          nameEn: 'Unknown Pizza Joint',
          categories: ['pizza'],
        },
      ],
    };

    const normDeck = normalizeRestaurantDeck(rawDeck);
    assert.ok(normDeck);
    assert.equal(normDeck.restaurants.length, 6);

    const dominos = normDeck.restaurants.find((r) => r.id === 'dominos');
    assert.equal(dominos.imageUrl, '/images/restaurants/pizza/dominos.jpg');

    const maestro = normDeck.restaurants.find((r) => r.id === 'maestro_pizza');
    assert.equal(maestro.imageUrl, '/images/restaurants/pizza/maestro-pizza.jpg');

    const ilPostino = normDeck.restaurants.find((r) => r.id === 'il_postino_pizzeria');
    assert.equal(ilPostino.imageUrl, '/images/restaurants/pizza/il-postino.jpg');

    const whiteWood = normDeck.restaurants.find((r) => r.id === 'white_wood_pizzeria');
    assert.equal(whiteWood.imageUrl, '/images/restaurants/pizza/white-wood.jpg');

    const verra = normDeck.restaurants.find((r) => r.id === 'verra_pizza');
    assert.equal(verra.imageUrl, '/images/restaurants/pizza/verra.jpg');

    const unknown = normDeck.restaurants.find((r) => r.id === 'unknown_pizza_joint');
    assert.equal(unknown.imageUrl, undefined);
  });

  // 6. SwipeCard renders image with object-fit: cover for Pizza cards
  check('SwipeCard renders object-cover image for approved Pizza brand', () => {
    const render = (node) => renderToStaticMarkup(createElement(LocaleProvider, null, node));

    for (const b of PIZZA_BRAND_IMAGES) {
      const item = normalizeRestaurantItem({
        id: b.brandId,
        nameAr: b.canonicalName,
        nameEn: b.canonicalName,
        categories: ['pizza'],
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

  console.log(`\nALL ${checks} PIZZA IMAGE VERIFICATION CHECKS PASSED!`);
} finally {
  await server.close();
}
