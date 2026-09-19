import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.get(key) ?? null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
};

const server = await createServer({
  server: { middlewareMode: true },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': '""',
    'import.meta.env.VITE_SUPABASE_ANON_KEY': '""',
  },
});

let checks = 0;

try {
  // 1. Verify Category Architecture & Mode Membership
  const {
    FOOD_CATEGORIES,
    BREAKFAST_CATEGORIES,
    getCategoriesForMode,
    _getCategoryById,
    normalizeCategorySelection,
    toggleCategorySelection,
  } = await server.ssrLoadModule('/src/lib/consensus.ts');

  // Check 1: FOOD_CATEGORIES preserves flexible as wildcard and excludes cleaned categories
  assert.equal(FOOD_CATEGORIES.length, 17, 'FOOD_CATEGORIES has 16 categories + flexible wildcard');
  assert.ok(FOOD_CATEGORIES.some((c) => c.id === 'flexible' && c.isWildcard), 'flexible is in FOOD_CATEGORIES');
  for (const removed of ['breakfast', 'healthy', 'coffee', 'dessert']) {
    assert.ok(!FOOD_CATEGORIES.some((c) => c.id === removed), `${removed} must NOT be in active FOOD_CATEGORIES`);
  }
  checks++;

  // Check 2: BREAKFAST_CATEGORIES contains strictly the 5 approved provisional categories
  assert.equal(BREAKFAST_CATEGORIES.length, 5, 'BREAKFAST_CATEGORIES must contain exactly 4 concrete + 1 wildcard');
  assert.deepEqual(
    BREAKFAST_CATEGORIES.map((c) => c.id),
    ['street_folk', 'sandwiches', 'fatayer', 'breakfast', 'any_breakfast'],
    'BREAKFAST_CATEGORIES matches provisional taxonomy exactly'
  );
  for (const forbidden of ['healthy', 'bakery', 'juice', 'tea', 'coffee', 'dessert']) {
    assert.ok(!BREAKFAST_CATEGORIES.some((c) => c.id === forbidden), `${forbidden} must NOT be in active BREAKFAST_CATEGORIES`);
  }
  checks++;

  // Check 3: getCategoriesForMode routing
  assert.equal(getCategoriesForMode('food'), FOOD_CATEGORIES, 'getCategoriesForMode(food)');
  assert.equal(getCategoriesForMode('breakfast'), BREAKFAST_CATEGORIES, 'getCategoriesForMode(breakfast)');
  assert.deepEqual(getCategoriesForMode('cafes'), [], 'getCategoriesForMode(cafes) is empty');
  checks++;

  // Check 4: normalizeCategorySelection for breakfast
  assert.deepEqual(
    normalizeCategorySelection(['sandwiches', 'any_breakfast'], 'breakfast'),
    ['any_breakfast'],
    'any_breakfast wildcard dominates and normalizes exclusively'
  );
  assert.deepEqual(
    normalizeCategorySelection(['sandwiches', 'fatayer'], 'breakfast'),
    ['sandwiches', 'fatayer'],
    'concrete breakfast categories normalize intact'
  );
  checks++;

  // Check 5: toggleCategorySelection for breakfast
  assert.deepEqual(
    toggleCategorySelection(['sandwiches'], 'any_breakfast', 'breakfast'),
    ['any_breakfast'],
    'selecting any_breakfast replaces previous selections'
  );
  assert.deepEqual(
    toggleCategorySelection(['any_breakfast'], 'sandwiches', 'breakfast'),
    ['sandwiches'],
    'selecting concrete category clears any_breakfast'
  );
  checks++;

  // 2. SSR Component Rendering
  const { _LocaleProvider } = await server.ssrLoadModule('/src/context/LocaleContext.tsx');
  const { SocialSuggestionAvatars } = await server.ssrLoadModule('/src/components/common/SocialSuggestionAvatars.tsx');

  // Check 6: SocialSuggestionAvatars rendering with overflow
  const mockSuggestions = [
    { target: 'mode:breakfast', participant_id: 'p1', nickname: 'Hatem', player_color: '#55B96A', player_shape: 'squircle' },
    { target: 'mode:breakfast', participant_id: 'p2', nickname: 'Sami', player_color: '#F0443E', player_shape: 'circle' },
    { target: 'mode:breakfast', participant_id: 'p3', nickname: 'Omar', player_color: '#FFD75A', player_shape: 'diamond' },
  ];
  const avatarHtml = renderToStaticMarkup(
    createElement(SocialSuggestionAvatars, {
      suggestions: mockSuggestions,
      target: 'mode:breakfast',
      maxVisible: 2,
    })
  );
  assert.ok(avatarHtml.includes('Hatem'), 'Avatars includes first nickname');
  assert.ok(avatarHtml.includes('Sami'), 'Avatars includes second nickname');
  assert.ok(avatarHtml.includes('+1'), 'Avatars includes +1 overflow badge');
  checks++;

  // Check 7: SocialSuggestionAvatars returns null when no matching suggestions
  const emptyAvatarHtml = renderToStaticMarkup(
    createElement(SocialSuggestionAvatars, {
      suggestions: mockSuggestions,
      target: 'mode:cafes',
    })
  );
  assert.equal(emptyAvatarHtml, '', 'Empty suggestions render nothing');
  checks++;

  // Check 8: Bilingual SSR for dictionaries
  const { default: arDict } = await server.ssrLoadModule('/src/locales/ar.json');
  const { default: enDict } = await server.ssrLoadModule('/src/locales/en.json');

  assert.ok(arDict.modes?.food?.name === 'أكل', 'ar modes.food.name');
  assert.ok(enDict.modes?.food?.name === 'Food', 'en modes.food.name');
  assert.ok(arDict.modes?.breakfast?.name === 'فطور', 'ar modes.breakfast.name');
  assert.ok(enDict.modes?.breakfast?.name === 'Breakfast', 'en modes.breakfast.name');
  assert.ok(arDict.modes?.cafes?.name === 'كافيهات', 'ar modes.cafes.name');
  assert.ok(enDict.modes?.cafes?.name === 'Cafes', 'en modes.cafes.name');
  assert.ok(arDict.preferences?.healthy?.name === 'صحي', 'ar preferences.healthy.name');
  assert.ok(enDict.preferences?.healthy?.name === 'Healthy', 'en preferences.healthy.name');
  assert.ok(arDict.preferences?.nearby?.name === 'قريب', 'ar preferences.nearby.name');
  assert.ok(enDict.preferences?.nearby?.name === 'Nearby', 'en preferences.nearby.name');
  assert.ok(arDict.cafes?.emptyTitle?.includes('كافيهات'), 'ar cafes.emptyTitle');
  assert.ok(enDict.cafes?.emptyTitle?.includes('Cafes'), 'en cafes.emptyTitle');
  assert.ok(arDict.cafes?.backToFood?.includes('العودة للأكل'), 'ar cafes.backToFood');
  assert.ok(enDict.cafes?.backToFood?.includes('Back to Food'), 'en cafes.backToFood');
  checks++;

  console.log(`PASS: ${checks} Room Modes, Breakfast, Preferences, and Suggestions frontend contract checks.`);
} finally {
  await server.close();
}
