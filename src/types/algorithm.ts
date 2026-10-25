/**
 * WeshNakul Phase 5: Algorithm Configuration Types & Metadata
 *
 * Provides a typed, validated, and versioned configuration schema
 * for algorithm tuning, drafts, preview, publishing, and rollback.
 */

export const ALGORITHM_CONFIG_SCHEMA_VERSION = 'v1.0.0';

export interface AlgorithmBaseSettings {
  // 1. Ranking priorities
  reputation_weight_factor: number;
  editorial_staple_boost: number;
  editorial_popular_boost: number;
  editorial_discovery_boost: number;
  trend_boost: number;
  confidence_boost: number;

  // 2. Geographic relevance
  distance_proximity_weight: number;
  distance_decay_km: number;
  district_proximity_weight: number;
  progressive_widening_tier_penalty: number;

  // 3. Repetition and diversity
  repetition_penalty: number;
  diversity_style_weight: number;
  diversity_price_weight: number;
  diversity_editorial_weight: number;
  pizza_crossover_probability: number;
}

export type AlgorithmSettingKey = keyof AlgorithmBaseSettings;

export interface AlgorithmSettingMetadata {
  key: AlgorithmSettingKey;
  section: 'ranking' | 'geography' | 'diversity';
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
  higherEffectEn: string;
  higherEffectAr: string;
  lowerEffectEn: string;
  lowerEffectAr: string;
}

export const ALGORITHM_SETTING_METADATA: Record<AlgorithmSettingKey, AlgorithmSettingMetadata> = {
  // Ranking priorities
  reputation_weight_factor: {
    key: 'reputation_weight_factor',
    section: 'ranking',
    nameEn: 'Reputation Influence',
    nameAr: 'تأثير التقييمات والشهرة',
    descriptionEn: 'Multiplier applied to Google ratings and review counts.',
    descriptionAr: 'معامل تأثير تقييمات جوجل وعدد المراجعات على ترتيب المطعم.',
    unit: 'multiplier',
    min: 0.0,
    max: 3.0,
    step: 0.05,
    default: 1.45,
    higherEffectEn: 'Strongly favors top-rated and highly reviewed restaurants.',
    higherEffectAr: 'يرجح بقوة المطاعم الأعلى تقييماً والأكثر مراجعات.',
    lowerEffectEn: 'Reduces the dominance of ratings compared to other signals.',
    lowerEffectAr: 'يقلل من سيطرة التقييمات مقارنة بالمعايير الأخرى.',
  },
  editorial_staple_boost: {
    key: 'editorial_staple_boost',
    section: 'ranking',
    nameEn: 'Staple Boost',
    nameAr: 'أفضلية المطاعم الأصيلة',
    descriptionEn: 'Additive score boost for curated Jeddah staple restaurants.',
    descriptionAr: 'زيادة إضافية للمطاعم الكلاسيكية الأصيلة في جدة.',
    unit: 'score boost',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    default: 0.24,
    higherEffectEn: 'Prioritizes iconic, long-standing local favorites.',
    higherEffectAr: 'يعطي الأولوية للمطاعم الراسخة والمفضلة محلياً.',
    lowerEffectEn: 'Levels the competition for newer and non-staple spots.',
    lowerEffectAr: 'يتيح منافسة متكافئة للمطاعم الحديثة وغير التقليدية.',
  },
  editorial_popular_boost: {
    key: 'editorial_popular_boost',
    section: 'ranking',
    nameEn: 'Popular Boost',
    nameAr: 'أفضلية المطاعم الرائجة',
    descriptionEn: 'Additive score boost for well-known popular restaurants.',
    descriptionAr: 'زيادة إضافية للمطاعم المعروفة وعالية الطلب.',
    unit: 'score boost',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    default: 0.20,
    higherEffectEn: 'Surfaces reliable crowd-pleasers more frequently.',
    higherEffectAr: 'يُظهر الخيارات المضمونة والمحبوبة جماهيرياً.',
    lowerEffectEn: 'Gives more room for niche and discovery spots.',
    lowerEffectAr: 'يفسح المجال للمطاعم المميزة والأقل انتشاراً.',
  },
  editorial_discovery_boost: {
    key: 'editorial_discovery_boost',
    section: 'ranking',
    nameEn: 'Discovery & Hidden Gems Boost',
    nameAr: 'أفضلية الاكتشاف والأماكن المميزة',
    descriptionEn: 'Additive score boost for hidden gems and discovery picks.',
    descriptionAr: 'زيادة إضافية لأماكن الاكتشاف والكنوز المخفية.',
    unit: 'score boost',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    default: 0.10,
    higherEffectEn: 'Increases the likelihood of discovering novel food spots.',
    higherEffectAr: 'يزيد فرصة تجربة أماكن جديدة ومميزة.',
    lowerEffectEn: 'Keeps decks focused primarily on mainstream established choices.',
    lowerEffectAr: 'يُبقي التوصيات مركزة على الخيارات الشائعة والمجربة.',
  },
  trend_boost: {
    key: 'trend_boost',
    section: 'ranking',
    nameEn: 'Trend & Momentum Boost',
    nameAr: 'أفضلية المطاعم الصاعدة والترند',
    descriptionEn: 'Additive score boost for restaurants with rising momentum.',
    descriptionAr: 'زيادة إضافية للمطاعم الصاعدة والتي تشهد إقبالاً متزايداً.',
    unit: 'score boost',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    default: 0.16,
    higherEffectEn: 'Brings viral and trending dining options forward.',
    higherEffectAr: 'يُبرز الأماكن الترند ذات الشعبية المتصاعدة.',
    lowerEffectEn: 'Treats trending spots symmetrically with classic spots.',
    lowerEffectAr: 'يعامل الأماكن الصاعدة مثل الأماكن التقليدية.',
  },
  confidence_boost: {
    key: 'confidence_boost',
    section: 'ranking',
    nameEn: 'Catalog Confidence Boost',
    nameAr: 'أفضلية التحقق والبيانات الموثقة',
    descriptionEn: 'Additive score boost for high-confidence catalog entries.',
    descriptionAr: 'زيادة إضافية للمطاعم ذات التوثيق الكامل والمؤكد.',
    unit: 'score boost',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    default: 0.18,
    higherEffectEn: 'Emphasizes restaurants with confirmed branch, menu, and location data.',
    higherEffectAr: 'يمنح الأفضلية للمطاعم ذات البيانات المحدثة والمثبتة بدقة.',
    lowerEffectEn: 'Reduces the gap between high and medium verification entries.',
    lowerEffectAr: 'يقلل الفارق بين المطاعم عالية ومتوسطة التوثيق.',
  },

  // Geographic relevance
  distance_proximity_weight: {
    key: 'distance_proximity_weight',
    section: 'geography',
    nameEn: 'GPS Distance Weight',
    nameAr: 'وزن القرب الجغرافي (GPS)',
    descriptionEn: 'Multiplier for physical distance proximity when GPS is enabled.',
    descriptionAr: 'معامل تأثير المسافة الفعلية بالكيلومتر عند توفر موقع دقيق.',
    unit: 'multiplier',
    min: 0.0,
    max: 3.0,
    step: 0.05,
    default: 1.00,
    higherEffectEn: 'Strongly prioritizes the closest branches to the participants.',
    higherEffectAr: 'يرجح بقوة الفروع الأقرب جغرافياً للمجموعة.',
    lowerEffectEn: 'Allows higher-quality restaurants farther away to compete.',
    lowerEffectAr: 'يسمح للمطاعم المتميزة في مناطق أبعد بالمنافسة.',
  },
  distance_decay_km: {
    key: 'distance_decay_km',
    section: 'geography',
    nameEn: 'Distance Decay Scale',
    nameAr: 'معدل تناقص المسافة (كم)',
    descriptionEn: 'Distance decay scaling factor: 1 / (1 + distance_km / scale_km).',
    descriptionAr: 'معدل التلاشي مع المسافة: 1 / (1 + المسافة / المقياس).',
    unit: 'km',
    min: 2.0,
    max: 30.0,
    step: 0.5,
    default: 8.0,
    higherEffectEn: 'Flattens distance falloff; farther branches receive less penalty.',
    higherEffectAr: 'يبطئ تناقص النقاط مع المسافة ليناسب المشاوير الأطول.',
    lowerEffectEn: 'Steep distance penalty; branches beyond a short drive drop sharply.',
    lowerEffectAr: 'تناقص حاد للنقاط مع الابتعاد بضعة كيلومترات.',
  },
  district_proximity_weight: {
    key: 'district_proximity_weight',
    section: 'geography',
    nameEn: 'District Relationship Weight',
    nameAr: 'وزن علاقات الأحياء',
    descriptionEn: 'Multiplier for neighborhood graph proximity when selecting by district.',
    descriptionAr: 'معامل تأثير التقارب بين الأحياء (نفس الحي، المجاور، الدائري الثاني).',
    unit: 'multiplier',
    min: 0.0,
    max: 3.0,
    step: 0.05,
    default: 1.00,
    higherEffectEn: 'Same-district and 1st-ring neighbor branches score much higher.',
    higherEffectAr: 'يرجح بقوة الفروع في نفس الحي أو الأحياء الملاصقة مباشرة.',
    lowerEffectEn: 'Widens the geographic field across more Jeddah districts.',
    lowerEffectAr: 'يوسع نطاق البحث عبر مزيد من أحياء جدة بالتساوي.',
  },
  progressive_widening_tier_penalty: {
    key: 'progressive_widening_tier_penalty',
    section: 'geography',
    nameEn: 'Rotation Pool Widening Penalty',
    nameAr: 'خصم التوسع الجغرافي لأحواض التدوير',
    descriptionEn: 'Distance sensitivity multiplier applied specifically to Fried Chicken broast rotation and Pizza crossover selection pools.',
    descriptionAr: 'معامل خصم المسافة المطبق تحديداً على حوض تدوير البروستد وحوض تقاطع البيتزا.',
    unit: 'tier penalty',
    min: 0.0,
    max: 1.0,
    step: 0.02,
    default: 0.20,
    higherEffectEn: 'Favors closer branches when drawing from the broast rotation or pizza crossover pools.',
    higherEffectAr: 'يرجح الفروع الأقرب عند السحب من حوض البروستد أو تقاطع البيتزا.',
    lowerEffectEn: 'Allows farther branches in rotation and crossover pools to compete on equal footing.',
    lowerEffectAr: 'يتيح لفروع البروستد أو التقاطع الأبعد جغرافياً المنافسة بتكافؤ أكبر.',
  },

  // Repetition and diversity
  repetition_penalty: {
    key: 'repetition_penalty',
    section: 'diversity',
    nameEn: 'Repetition Avoidance Penalty',
    nameAr: 'عقوبة تكرار المطاعم',
    descriptionEn: 'Multiplier applied to deprioritize restaurants seen in prior decks.',
    descriptionAr: 'معامل تقليل أولوية المطاعم التي ظهرت في جولات سابقة لنفس الغرفة.',
    unit: 'multiplier',
    min: 0.0,
    max: 3.0,
    step: 0.05,
    default: 1.00,
    higherEffectEn: 'Aggressively avoids repeating restaurants across swiping rounds.',
    higherEffectAr: 'يمنع تكرار المطاعم السابقة بصرامة بين الجولات.',
    lowerEffectEn: 'Allows previously seen high-scoring restaurants to reappear sooner.',
    lowerEffectAr: 'يسمح للمطاعم المميزة بالظهور مجدداً إذا كانت هي الأفضل.',
  },
  diversity_style_weight: {
    key: 'diversity_style_weight',
    section: 'diversity',
    nameEn: 'Style Diversity Weight (Burger)',
    nameAr: 'وزن تنوع الأسلوب (للبرجر)',
    descriptionEn: 'Penalty for clustering preparation styles (smash, wagyu, classic) beyond 3 cards in Burger decks. (Burger category only).',
    descriptionAr: 'خصم عند تكرار نفس أسلوب التحضير (سماش، واغيو، كلاسيك) أكثر من 3 بطاقات في قوائم البرجر (خاص بفئة البرجر).',
    unit: 'penalty factor',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    default: 0.15,
    higherEffectEn: 'Enforces distinct preparation styles across cards in Burger decks.',
    higherEffectAr: 'يضمن تنوع أساليب التحضير في بطاقات البرجر.',
    lowerEffectEn: 'Allows Burger decks to focus heavily on the predominant style.',
    lowerEffectAr: 'يسمح لبطاقات البرجر بالتركيز على النمط السائد.',
  },
  diversity_price_weight: {
    key: 'diversity_price_weight',
    section: 'diversity',
    nameEn: 'Price Tier Diversity Weight',
    nameAr: 'وزن تنوع الفئات السعرية',
    descriptionEn: 'Penalty for grouping too many cards in the same price tier beyond 3 cards.',
    descriptionAr: 'خصم عند تجمع أكثر من 3 بطاقات في نفس الفئة السعرية ($ مقابل $$$).',
    unit: 'penalty factor',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    default: 0.12,
    higherEffectEn: 'Maintains a healthy mix of budget, moderate, and premium options.',
    higherEffectAr: 'يحافظ على مزيج متوازن بين الخيارات الاقتصادية والمتوسطة والراقية.',
    lowerEffectEn: 'Permits decks to be dominated by a single price tier.',
    lowerEffectAr: 'يسمح بسيطرة فئة سعرية معينة دون تقييد.',
  },
  diversity_editorial_weight: {
    key: 'diversity_editorial_weight',
    section: 'diversity',
    nameEn: 'Editorial & District Diversity Weight',
    nameAr: 'وزن تنوع التصنيف التحريري والأحياء',
    descriptionEn: 'Penalty for clustering beyond 3 cards: penalizes editorial roles in Burger decks, and geographic district clustering in non-Burger decks.',
    descriptionAr: 'خصم عند تجمع أكثر من 3 بطاقات: يطبق على التصنيف التحريري في البرجر، وتنوع الأحياء في الفئات الأخرى.',
    unit: 'penalty factor',
    min: 0.0,
    max: 1.0,
    step: 0.01,
    default: 0.10,
    higherEffectEn: 'Guarantees balanced representation across editorial roles (Burger) or geographic districts (other categories).',
    higherEffectAr: 'يضمن توازناً مدروساً بين التصنيفات التحريرية (للبرجر) أو الأحياء الجغرافية (للفئات الأخرى).',
    lowerEffectEn: 'Allows decks to cluster around a single editorial role or a single district.',
    lowerEffectAr: 'يسمح بتجمع معظم بطاقات القائمة في تصنيف واحد أو حي واحد.',
  },
  pizza_crossover_probability: {
    key: 'pizza_crossover_probability',
    section: 'diversity',
    nameEn: 'Pizza Crossover Activation Chance',
    nameAr: 'احتمال إدخال خيار بيتزا إيطالي متقاطع',
    descriptionEn: 'Probability (0-1) of enabling an approved authentic Italian cross-category slot in Pizza decks.',
    descriptionAr: 'نسبة احتمال تضمين مطعم إيطالي معتمد يقدم بيتزا أصيلة ضمن قائمة البيتزا.',
    unit: 'probability',
    min: 0.0,
    max: 1.0,
    step: 0.05,
    default: 0.50,
    higherEffectEn: 'More frequently includes a verified Italian crossover pizza option.',
    higherEffectAr: 'يزيد تكرار ظهور خيار إيطالي متقاطع ومعتمد داخل قائمة البيتزا.',
    lowerEffectEn: 'Keeps pizza decks purely focused on primary pizza restaurants.',
    lowerEffectAr: 'يُبقي بطاقات البيتزا مقتصرة تماماً على مطاعم البيتزا المتخصصة.',
  },
};

export const DEFAULT_ALGORITHM_SETTINGS: AlgorithmBaseSettings = {
  reputation_weight_factor: 1.45,
  editorial_staple_boost: 0.24,
  editorial_popular_boost: 0.20,
  editorial_discovery_boost: 0.10,
  trend_boost: 0.16,
  confidence_boost: 0.18,
  distance_proximity_weight: 1.00,
  distance_decay_km: 8.0,
  district_proximity_weight: 1.00,
  progressive_widening_tier_penalty: 0.20,
  repetition_penalty: 1.00,
  diversity_style_weight: 0.15,
  diversity_price_weight: 0.12,
  diversity_editorial_weight: 0.10,
  pizza_crossover_probability: 0.50,
};

export type AlgorithmOverrideScope =
  | 'mode:food'
  | 'mode:breakfast'
  | 'mode:cafes'
  | 'category:burger'
  | 'category:shawarma'
  | 'category:fried_chicken'
  | 'category:pizza'
  | 'category:grills'
  | 'category:saudi_rice'
  | 'category:italian'
  | 'category:healthy';

export const SUPPORTED_OVERRIDE_SCOPES: { id: AlgorithmOverrideScope; nameEn: string; nameAr: string }[] = [
  { id: 'mode:food', nameEn: 'Mode: Food', nameAr: 'الوضع: غداء وعشاء' },
  { id: 'mode:breakfast', nameEn: 'Mode: Breakfast', nameAr: 'الوضع: فطور' },
  { id: 'mode:cafes', nameEn: 'Mode: Cafés', nameAr: 'الوضع: كافيهات' },
  { id: 'category:burger', nameEn: 'Category: Burger', nameAr: 'التصنيف: برجر' },
  { id: 'category:shawarma', nameEn: 'Category: Shawarma', nameAr: 'التصنيف: شاورما' },
  { id: 'category:fried_chicken', nameEn: 'Category: Fried Chicken & Broast', nameAr: 'التصنيف: بروستد ودجاج' },
  { id: 'category:pizza', nameEn: 'Category: Pizza', nameAr: 'التصنيف: بيتزا' },
  { id: 'category:grills', nameEn: 'Category: Grills', nameAr: 'التصنيف: مشاوي' },
  { id: 'category:saudi_rice', nameEn: 'Category: Saudi Rice & Kabsa', nameAr: 'التصنيف: رز وكبسة' },
  { id: 'category:italian', nameEn: 'Category: Italian', nameAr: 'التصنيف: إيطالي' },
  { id: 'category:healthy', nameEn: 'Category: Healthy', nameAr: 'التصنيف: صحي' },
];

export interface AlgorithmConfig {
  schema_version: string;
  global: AlgorithmBaseSettings;
  overrides?: Partial<Record<AlgorithmOverrideScope, Partial<AlgorithmBaseSettings>>>;
}

export interface AlgorithmPublishedVersion {
  id: string;
  version_number: number;
  config_schema_version: string;
  settings: AlgorithmConfig;
  is_active: boolean;
  published_by: string;
  published_at: string;
  change_summary?: string | null;
  reason?: string | null;
  rollback_of_version?: number | null;
}

export interface AlgorithmDraft {
  id: string;
  settings: AlgorithmConfig;
  updated_by: string;
  updated_at: string;
}

export interface AlgorithmValidationResult {
  valid: boolean;
  errors: { field: string; message: string; scope?: string }[];
  warnings?: { field: string; message: string; scope?: string }[];
}

export interface AlgorithmPreviewCard {
  id: string;
  nameAr: string;
  nameEn: string;
  branchNameAr?: string | null;
  branchNameEn?: string | null;
  district?: string | null;
  distanceKm?: number | null;
  score: number;
  scoreBreakdown: {
    base: number;
    reputation: number;
    distance: number;
    district: number;
    editorial: number;
    trend: number;
    confidence: number;
    totalWeight: number;
  };
  tier?: string;
  coreStatus?: string;
  isCrossover?: boolean;
}

export interface AlgorithmPreviewComparison {
  scenario: {
    city: string;
    mode: string;
    category: string;
    district?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    eating_mode?: string | null;
    preferences?: string[];
  };
  publishedDeck: AlgorithmPreviewCard[];
  proposedDeck: AlgorithmPreviewCard[];
  activeVersionNumber: number;
  diff: {
    added: AlgorithmPreviewCard[];
    removed: AlgorithmPreviewCard[];
    reordered: { id: string; nameEn: string; nameAr: string; oldRank: number; newRank: number }[];
    scoreChanges: {
      id: string;
      nameEn: string;
      nameAr: string;
      publishedScore: number;
      proposedScore: number;
      delta: number;
    }[];
  };
  signalsExplained: {
    key: string;
    nameEn: string;
    nameAr: string;
    explanationEn: string;
    explanationAr: string;
    publishedValue: number;
    proposedValue: number;
    changed: boolean;
  }[];
}

/**
 * Pure function: merges global settings with scope override (if any).
 */
export function resolveEffectiveSettings(
  config: AlgorithmConfig,
  mode?: string | null,
  category?: string | null
): AlgorithmBaseSettings {
  const result = { ...config.global };

  if (!config.overrides) return result;

  // 1. Mode override
  if (mode) {
    const modeKey = `mode:${mode.toLowerCase()}` as AlgorithmOverrideScope;
    const modeOverride = config.overrides[modeKey];
    if (modeOverride) {
      Object.assign(result, modeOverride);
    }
  }

  // 2. Category override takes precedence over mode override
  if (category) {
    const catKey = `category:${category.toLowerCase()}` as AlgorithmOverrideScope;
    const catOverride = config.overrides[catKey];
    if (catOverride) {
      Object.assign(result, catOverride);
    }
  }

  return result;
}

/**
 * Pure function: Validate algorithm config against schema rules.
 */
export function validateAlgorithmConfig(config: unknown): AlgorithmValidationResult {
  const errors: { field: string; message: string; scope?: string }[] = [];
  const warnings: { field: string; message: string; scope?: string }[] = [];

  if (!config || typeof config !== 'object') {
    return { valid: false, errors: [{ field: 'root', message: 'Configuration must be a non-null JSON object.' }] };
  }

  const c = config as Partial<AlgorithmConfig>;

  if (c.schema_version !== ALGORITHM_CONFIG_SCHEMA_VERSION) {
    errors.push({
      field: 'schema_version',
      message: `Unsupported schema version: expected ${ALGORITHM_CONFIG_SCHEMA_VERSION}, received ${String(c.schema_version)}`,
    });
  }

  if (!c.global || typeof c.global !== 'object') {
    errors.push({ field: 'global', message: 'Global settings object is required.' });
    return { valid: false, errors };
  }

  // Validate global settings
  validateBaseSettings(c.global, 'global', errors);

  // Validate overrides if present
  if (c.overrides !== undefined) {
    if (typeof c.overrides !== 'object' || c.overrides === null || Array.isArray(c.overrides)) {
      errors.push({ field: 'overrides', message: 'Overrides must be a key-value mapping of scope to settings.' });
    } else {
      const allowedScopes = new Set(SUPPORTED_OVERRIDE_SCOPES.map((s) => s.id));
      for (const [scopeKey, scopeSettings] of Object.entries(c.overrides)) {
        if (!allowedScopes.has(scopeKey as AlgorithmOverrideScope)) {
          errors.push({
            field: `overrides.${scopeKey}`,
            message: `Unsupported override scope: ${scopeKey}.`,
            scope: scopeKey,
          });
          continue;
        }

        if (!scopeSettings || typeof scopeSettings !== 'object' || Array.isArray(scopeSettings)) {
          errors.push({
            field: `overrides.${scopeKey}`,
            message: `Override for ${scopeKey} must be a settings object.`,
            scope: scopeKey,
          });
          continue;
        }

        validateBaseSettings(scopeSettings, scopeKey, errors, true);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

function validateBaseSettings(
  rawSettings: unknown,
  scope: string,
  errors: { field: string; message: string; scope?: string }[],
  isPartial = false
): void {
  if (!rawSettings || typeof rawSettings !== 'object' || Array.isArray(rawSettings)) {
    errors.push({ field: scope, message: `${scope} must be a valid settings object.` });
    return;
  }
  const settings = rawSettings as Record<string, unknown>;
  const allKeys = Object.keys(ALGORITHM_SETTING_METADATA) as AlgorithmSettingKey[];

  if (!isPartial) {
    for (const key of allKeys) {
      if (!(key in settings)) {
        errors.push({
          field: `${scope}.${key}`,
          message: `Missing required setting: ${key}`,
          scope,
        });
      }
    }
  }

  for (const [key, value] of Object.entries(settings)) {
    const meta = ALGORITHM_SETTING_METADATA[key as AlgorithmSettingKey];
    if (!meta) {
      errors.push({
        field: `${scope}.${key}`,
        message: `Unknown setting key: ${key}`,
        scope,
      });
      continue;
    }

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      errors.push({
        field: `${scope}.${key}`,
        message: `Value for ${key} must be a finite number.`,
        scope,
      });
      continue;
    }

    if (value < meta.min || value > meta.max) {
      errors.push({
        field: `${scope}.${key}`,
        message: `Value ${value} for ${key} is outside allowed range [${meta.min}, ${meta.max}].`,
        scope,
      });
    }
  }
}
