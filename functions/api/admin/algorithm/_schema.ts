/**
 * Server-Side Algorithm Schema, Validation & Diff Utilities
 * Authoritative boundary validation for Algorithm Settings, Drafts, and Publishing.
 */

export const ALGORITHM_CONFIG_SCHEMA_VERSION = 'v1.0.0';

export interface AlgorithmBaseSettings {
  reputation_weight_factor: number;
  editorial_staple_boost: number;
  editorial_popular_boost: number;
  editorial_discovery_boost: number;
  trend_boost: number;
  confidence_boost: number;
  distance_proximity_weight: number;
  distance_decay_km: number;
  district_proximity_weight: number;
  progressive_widening_tier_penalty: number;
  repetition_penalty: number;
  diversity_style_weight: number;
  diversity_price_weight: number;
  diversity_editorial_weight: number;
  pizza_crossover_probability: number;
}

export type AlgorithmSettingKey = keyof AlgorithmBaseSettings;

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

export const SETTING_BOUNDS: Record<AlgorithmSettingKey, { min: number; max: number; default: number }> = {
  reputation_weight_factor: { min: 0.0, max: 3.0, default: 1.45 },
  editorial_staple_boost: { min: 0.0, max: 1.0, default: 0.24 },
  editorial_popular_boost: { min: 0.0, max: 1.0, default: 0.20 },
  editorial_discovery_boost: { min: 0.0, max: 1.0, default: 0.10 },
  trend_boost: { min: 0.0, max: 1.0, default: 0.16 },
  confidence_boost: { min: 0.0, max: 1.0, default: 0.18 },
  distance_proximity_weight: { min: 0.0, max: 3.0, default: 1.00 },
  distance_decay_km: { min: 2.0, max: 30.0, default: 8.0 },
  district_proximity_weight: { min: 0.0, max: 3.0, default: 1.00 },
  progressive_widening_tier_penalty: { min: 0.0, max: 1.0, default: 0.20 },
  repetition_penalty: { min: 0.0, max: 3.0, default: 1.00 },
  diversity_style_weight: { min: 0.0, max: 1.0, default: 0.15 },
  diversity_price_weight: { min: 0.0, max: 1.0, default: 0.12 },
  diversity_editorial_weight: { min: 0.0, max: 1.0, default: 0.10 },
  pizza_crossover_probability: { min: 0.0, max: 1.0, default: 0.50 },
};

export const ALLOWED_SCOPES = new Set([
  'mode:food',
  'mode:breakfast',
  'mode:cafes',
  'category:burger',
  'category:shawarma',
  'category:fried_chicken',
  'category:pizza',
  'category:grills',
  'category:saudi_rice',
  'category:italian',
  'category:healthy',
]);

export interface AlgorithmConfig {
  schema_version: string;
  global: AlgorithmBaseSettings;
  overrides?: Record<string, Partial<AlgorithmBaseSettings>>;
}

export interface ValidationIssue {
  field: string;
  message: string;
  scope?: string;
}

export function validateAlgorithmConfigServer(config: unknown): {
  valid: boolean;
  errors: ValidationIssue[];
} {
  const errors: ValidationIssue[] = [];

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return {
      valid: false,
      errors: [{ field: 'root', message: 'Payload must be a non-null JSON object.' }],
    };
  }

  const c = config as Partial<AlgorithmConfig>;

  if (c.schema_version !== ALGORITHM_CONFIG_SCHEMA_VERSION) {
    errors.push({
      field: 'schema_version',
      message: `Unsupported schema version: expected ${ALGORITHM_CONFIG_SCHEMA_VERSION}, received ${String(c.schema_version)}`,
    });
  }

  if (!c.global || typeof c.global !== 'object' || Array.isArray(c.global)) {
    errors.push({ field: 'global', message: 'Global settings object is required.' });
    return { valid: false, errors };
  }

  const allKeys = Object.keys(SETTING_BOUNDS) as AlgorithmSettingKey[];

  // Validate global settings complete keys & bounds
  for (const key of allKeys) {
    if (!(key in c.global)) {
      errors.push({ field: `global.${key}`, message: `Missing required setting: ${key}`, scope: 'global' });
    }
  }

  for (const [key, value] of Object.entries(c.global)) {
    const bounds = SETTING_BOUNDS[key as AlgorithmSettingKey];
    if (!bounds) {
      errors.push({ field: `global.${key}`, message: `Unknown setting key: ${key}`, scope: 'global' });
      continue;
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      errors.push({ field: `global.${key}`, message: `Value for ${key} must be a finite number.`, scope: 'global' });
      continue;
    }
    if (value < bounds.min || value > bounds.max) {
      errors.push({
        field: `global.${key}`,
        message: `Value ${value} for ${key} is outside allowed range [${bounds.min}, ${bounds.max}].`,
        scope: 'global',
      });
    }
  }

  // Validate overrides if supplied
  if (c.overrides !== undefined) {
    if (typeof c.overrides !== 'object' || c.overrides === null || Array.isArray(c.overrides)) {
      errors.push({ field: 'overrides', message: 'Overrides must be a JSON object mapping scope to settings.' });
    } else {
      for (const [scope, scopeSettings] of Object.entries(c.overrides)) {
        if (!ALLOWED_SCOPES.has(scope)) {
          errors.push({ field: `overrides.${scope}`, message: `Unsupported override scope: ${scope}`, scope });
          continue;
        }
        if (!scopeSettings || typeof scopeSettings !== 'object' || Array.isArray(scopeSettings)) {
          errors.push({ field: `overrides.${scope}`, message: `Override for ${scope} must be a settings object.`, scope });
          continue;
        }
        for (const [key, value] of Object.entries(scopeSettings)) {
          const bounds = SETTING_BOUNDS[key as AlgorithmSettingKey];
          if (!bounds) {
            errors.push({ field: `overrides.${scope}.${key}`, message: `Unknown setting key: ${key}`, scope });
            continue;
          }
          if (typeof value !== 'number' || !Number.isFinite(value)) {
            errors.push({
              field: `overrides.${scope}.${key}`,
              message: `Value for ${key} must be a finite number.`,
              scope,
            });
            continue;
          }
          if (value < bounds.min || value > bounds.max) {
            errors.push({
              field: `overrides.${scope}.${key}`,
              message: `Value ${value} for ${key} is outside allowed range [${bounds.min}, ${bounds.max}].`,
              scope,
            });
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

export function computeConfigDiffSummary(
  beforeConfig: AlgorithmConfig,
  afterConfig: AlgorithmConfig
): string {
  const changes: string[] = [];

  for (const [key] of Object.entries(SETTING_BOUNDS)) {
    const k = key as AlgorithmSettingKey;
    const oldVal = beforeConfig.global?.[k];
    const newVal = afterConfig.global?.[k];
    if (oldVal !== undefined && newVal !== undefined && oldVal !== newVal) {
      changes.push(`${k}: ${oldVal} -> ${newVal}`);
    }
  }

  // Check overrides
  const oldOverrides = beforeConfig.overrides || {};
  const newOverrides = afterConfig.overrides || {};
  const allScopes = new Set([...Object.keys(oldOverrides), ...Object.keys(newOverrides)]);

  for (const scope of allScopes) {
    if (!oldOverrides[scope] && newOverrides[scope]) {
      changes.push(`Added override for ${scope}`);
    } else if (oldOverrides[scope] && !newOverrides[scope]) {
      changes.push(`Removed override for ${scope}`);
    } else if (oldOverrides[scope] && newOverrides[scope]) {
      const sOld = oldOverrides[scope]!;
      const sNew = newOverrides[scope]!;
      for (const key of Object.keys({ ...sOld, ...sNew })) {
        const k = key as AlgorithmSettingKey;
        if (sOld[k] !== sNew[k]) {
          changes.push(`${scope}.${k}: ${sOld[k]} -> ${sNew[k]}`);
        }
      }
    }
  }

  if (changes.length === 0) return 'No parameter changes detected.';
  return changes.slice(0, 10).join('; ') + (changes.length > 10 ? ` (+${changes.length - 10} more)` : '');
}
