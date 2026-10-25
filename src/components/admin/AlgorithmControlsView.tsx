import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Sliders,
  Compass,
  MapPin,
  Sparkle,
  CheckCircle,
  WarningCircle,
  Eye,
  FloppyDisk,
  ArrowCounterClockwise,
  UploadSimple,
  CircleNotch,
  X,
  ShieldCheck,
  Storefront,
  Info,
} from '@phosphor-icons/react';
import { useAdminLocale } from '../../context/AdminLocaleContext';
import {
  fetchAlgorithmConfig,
  saveAlgorithmDraft,
  validateAlgorithmSettings,
  previewAlgorithmSettings,
  publishAlgorithmSettings,
  fetchAlgorithmVersions,
  rollbackAlgorithmSettings,
} from '../../services/adminAlgorithmService';
import {
  ALGORITHM_CONFIG_SCHEMA_VERSION,
  ALGORITHM_SETTING_METADATA,
  DEFAULT_ALGORITHM_SETTINGS,
  SUPPORTED_OVERRIDE_SCOPES,
  type AlgorithmConfig,
  type AlgorithmDraft,
  type AlgorithmOverrideScope,
  type AlgorithmPreviewComparison,
  type AlgorithmPublishedVersion,
  type AlgorithmSettingKey,
  type AlgorithmValidationResult,
} from '../../types/algorithm';

export const AlgorithmControlsView: React.FC = () => {
  const { t, isRTL, formatSaudiTime } = useAdminLocale();

  // Active configuration state
  const [publishedVersion, setPublishedVersion] = useState<AlgorithmPublishedVersion | null>(null);
  const [draft, setDraft] = useState<AlgorithmDraft | null>(null);
  const [versions, setVersions] = useState<AlgorithmPublishedVersion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Local in-memory working configuration (draft being edited)
  const [workingConfig, setWorkingConfig] = useState<AlgorithmConfig>({
    schema_version: ALGORITHM_CONFIG_SCHEMA_VERSION,
    global: { ...DEFAULT_ALGORITHM_SETTINGS },
    overrides: {},
  });

  // Selected scope for editing ('global' or specific override scope)
  const [selectedScope, setSelectedScope] = useState<'global' | AlgorithmOverrideScope>('global');

  // Tracking unsaved changes
  const [isDraftDirty, setIsDraftDirty] = useState<boolean>(false);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);

  // Validation state
  const [validationResult, setValidationResult] = useState<AlgorithmValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Preview state
  const [previewScenario, setPreviewScenario] = useState<{
    city: string;
    mode: string;
    category: string;
    district: string;
    eating_mode: string;
    nearby: boolean;
    healthy: boolean;
  }>({
    city: 'jeddah',
    mode: 'food',
    category: 'burger',
    district: 'al_rawdah',
    eating_mode: 'any',
    nearby: false,
    healthy: false,
  });
  const [previewResult, setPreviewResult] = useState<AlgorithmPreviewComparison | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Modals state
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [publishReason, setPublishReason] = useState<string>('');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState<boolean>(false);
  const [rollbackTargetVersion, setRollbackTargetVersion] = useState<number | null>(null);
  const [rollbackReason, setRollbackReason] = useState<string>('');
  const [isRollingBack, setIsRollingBack] = useState<boolean>(false);

  // Load configuration and versions
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [configData, versionsData] = await Promise.all([
        fetchAlgorithmConfig(),
        fetchAlgorithmVersions(),
      ]);

      setPublishedVersion(configData.published);
      setDraft(configData.draft);
      setVersions(versionsData);

      // Initialize working config from saved draft
      const initialConfig: AlgorithmConfig = {
        schema_version: configData.draft.settings?.schema_version || ALGORITHM_CONFIG_SCHEMA_VERSION,
        global: {
          ...DEFAULT_ALGORITHM_SETTINGS,
          ...(configData.draft.settings?.global || {}),
        },
        overrides: configData.draft.settings?.overrides || {},
      };
      setWorkingConfig(initialConfig);
      setIsDraftDirty(false);
    } catch (err) {
      console.error('Failed to load algorithm data', err);
      setErrorMessage((err as Error).message || 'Failed to load algorithm configuration.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle value change for a setting in the currently selected scope
  const handleSettingChange = (key: AlgorithmSettingKey, value: number) => {
    setWorkingConfig((prev) => {
      if (selectedScope === 'global') {
        return {
          ...prev,
          global: {
            ...prev.global,
            [key]: value,
          },
        };
      } else {
        const currentOverrides = prev.overrides || {};
        const scopeOverrides = currentOverrides[selectedScope] || {};
        return {
          ...prev,
          overrides: {
            ...currentOverrides,
            [selectedScope]: {
              ...scopeOverrides,
              [key]: value,
            },
          },
        };
      }
    });
    setIsDraftDirty(true);
    setSuccessMessage(null);
  };

  // Reset setting to baseline default
  const handleResetToDefault = (key: AlgorithmSettingKey) => {
    const meta = ALGORITHM_SETTING_METADATA[key];
    handleSettingChange(key, meta.default);
  };

  // Reset setting to published value
  const handleResetToPublished = (key: AlgorithmSettingKey) => {
    if (!publishedVersion) return;
    const publishedVal = publishedVersion.settings.global[key] ?? DEFAULT_ALGORITHM_SETTINGS[key];
    handleSettingChange(key, publishedVal);
  };

  // Add override scope
  const handleAddOverrideScope = (scope: AlgorithmOverrideScope) => {
    setWorkingConfig((prev) => {
      const currentOverrides = prev.overrides || {};
      if (currentOverrides[scope]) return prev;
      return {
        ...prev,
        overrides: {
          ...currentOverrides,
          [scope]: {},
        },
      };
    });
    setSelectedScope(scope);
    setIsDraftDirty(true);
  };

  // Remove override scope
  const handleRemoveOverrideScope = (scope: AlgorithmOverrideScope) => {
    setWorkingConfig((prev) => {
      const currentOverrides = { ...(prev.overrides || {}) };
      delete currentOverrides[scope];
      return {
        ...prev,
        overrides: currentOverrides,
      };
    });
    if (selectedScope === scope) {
      setSelectedScope('global');
    }
    setIsDraftDirty(true);
  };

  // Save draft
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    setErrorMessage(null);
    try {
      const res = await saveAlgorithmDraft(workingConfig);
      setDraft(res.draft);
      setIsDraftDirty(false);
      setSuccessMessage(t('badgeDraftSaved'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to save draft.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Discard draft and revert to published
  const handleDiscardDraft = () => {
    if (!publishedVersion) return;
    setWorkingConfig({
      schema_version: publishedVersion.config_schema_version,
      global: { ...publishedVersion.settings.global },
      overrides: JSON.parse(JSON.stringify(publishedVersion.settings.overrides || {})),
    });
    setIsDraftDirty(false);
    setSuccessMessage(t('badgeDraftInSync'));
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Run validation
  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await validateAlgorithmSettings(workingConfig);
      setValidationResult(result);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Validation failed.');
    } finally {
      setIsValidating(false);
    }
  };

  // Run live preview
  const handleRunPreview = async () => {
    setIsPreviewLoading(true);
    setPreviewError(null);
    try {
      const prefs: string[] = [];
      if (previewScenario.nearby) prefs.push('nearby');
      if (previewScenario.healthy) prefs.push('healthy');

      const comparison = await previewAlgorithmSettings({
        settings: workingConfig,
        city: previewScenario.city,
        mode: previewScenario.mode,
        category: previewScenario.category,
        district: previewScenario.district,
        eating_mode: previewScenario.eating_mode,
        preferences: prefs,
      });
      setPreviewResult(comparison);
    } catch (err) {
      setPreviewError((err as Error).message || 'Failed to evaluate preview.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Publish configuration
  const handlePublish = async () => {
    if (!publishedVersion) return;
    setIsPublishing(true);
    setErrorMessage(null);
    try {
      const res = await publishAlgorithmSettings(
        workingConfig,
        publishReason.trim() || undefined,
        publishedVersion.version_number
      );
      setIsPublishModalOpen(false);
      setPublishReason('');
      setSuccessMessage(`Successfully published v${res.version_number}`);
      await loadData();
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to publish configuration.');
    } finally {
      setIsPublishing(false);
    }
  };

  // Rollback configuration
  const handleRollback = async () => {
    if (!rollbackTargetVersion || !publishedVersion) return;
    setIsRollingBack(true);
    setErrorMessage(null);
    try {
      const res = await rollbackAlgorithmSettings(
        rollbackTargetVersion,
        rollbackReason.trim() || undefined,
        publishedVersion.version_number
      );
      setIsRollbackModalOpen(false);
      setRollbackReason('');
      setRollbackTargetVersion(null);
      setSuccessMessage(`Restored v${res.rollback_of_version} as active v${res.version_number}`);
      await loadData();
    } catch (err) {
      setErrorMessage((err as Error).message || 'Failed to rollback configuration.');
    } finally {
      setIsRollingBack(false);
    }
  };

  // Group settings by section
  const rankingSettings = useMemo(() => {
    return (Object.keys(ALGORITHM_SETTING_METADATA) as AlgorithmSettingKey[])
      .filter((k) => ALGORITHM_SETTING_METADATA[k].section === 'ranking')
      .map((k) => ALGORITHM_SETTING_METADATA[k]);
  }, []);

  const geoSettings = useMemo(() => {
    return (Object.keys(ALGORITHM_SETTING_METADATA) as AlgorithmSettingKey[])
      .filter((k) => ALGORITHM_SETTING_METADATA[k].section === 'geography')
      .map((k) => ALGORITHM_SETTING_METADATA[k]);
  }, []);

  const diversitySettings = useMemo(() => {
    return (Object.keys(ALGORITHM_SETTING_METADATA) as AlgorithmSettingKey[])
      .filter((k) => ALGORITHM_SETTING_METADATA[k].section === 'diversity')
      .map((k) => ALGORITHM_SETTING_METADATA[k]);
  }, []);

  // Helper to determine the effective value of a setting for the active scope
  const getSettingValue = (key: AlgorithmSettingKey): { value: number; isOverridden: boolean } => {
    if (selectedScope === 'global') {
      return {
        value: workingConfig.global[key] ?? ALGORITHM_SETTING_METADATA[key].default,
        isOverridden: false,
      };
    }
    const scopeOverrides = workingConfig.overrides?.[selectedScope];
    if (scopeOverrides && scopeOverrides[key] !== undefined) {
      return {
        value: scopeOverrides[key] as number,
        isOverridden: true,
      };
    }
    // Inherited from global
    return {
      value: workingConfig.global[key] ?? ALGORITHM_SETTING_METADATA[key].default,
      isOverridden: false,
    };
  };

  if (isLoading && !publishedVersion) {
    return (
      <div className="py-24 text-center">
        <CircleNotch size={40} className="animate-spin text-brand-red mx-auto mb-4" />
        <p className="text-sm font-semibold text-stone-600 font-alexandria">
          {t('loadingTitle')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-alexandria">
      {/* 1. Header & Status Banner */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Sliders size={26} className="text-brand-red" weight="bold" />
              <h2 className="text-xl font-bold text-stone-900">{t('algoControlsTitle')}</h2>
              {publishedVersion && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  v{publishedVersion.version_number} {t('badgeActive')}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1">{t('algoControlsSubtitle')}</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDiscardDraft}
              disabled={!isDraftDirty}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5"
            >
              <ArrowCounterClockwise size={15} />
              {t('btnDiscardAlgoDraft')}
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || !isDraftDirty}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center gap-1.5"
            >
              {isSavingDraft ? <CircleNotch size={15} className="animate-spin" /> : <FloppyDisk size={15} />}
              {t('btnSaveAlgoDraft')}
            </button>

            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-red text-white hover:bg-red-700 shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
            >
              <UploadSimple size={16} weight="bold" />
              {t('btnPublishAlgoConfig')}
            </button>
          </div>
        </div>

        {/* Status indicators */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {isDraftDirty ? (
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                {t('badgeDraftModified')}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <CheckCircle size={14} weight="fill" />
                {t('badgeDraftInSync')}
              </span>
            )}

            {publishedVersion && (
              <span className="text-stone-500">
                {t('colPublishedAt')}: {formatSaudiTime(publishedVersion.published_at)} ({publishedVersion.published_by})
                {draft?.updated_at && (
                  <span className="ms-2 text-stone-400 font-normal">
                    [{t('labelDraftValue')}: {formatSaudiTime(draft.updated_at)}]
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleValidate}
              disabled={isValidating}
              className="text-stone-600 hover:text-stone-900 font-semibold underline underline-offset-2 cursor-pointer flex items-center gap-1"
            >
              {isValidating && <CircleNotch size={12} className="animate-spin" />}
              {t('btnValidateConfig')}
            </button>
          </div>
        </div>

        {/* Feedback banners */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <WarningCircle size={18} className="shrink-0 text-rose-600" weight="fill" />
            <span className="flex-1">{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage(null)} className="cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle size={18} className="shrink-0 text-emerald-600" weight="fill" />
            <span className="flex-1 font-semibold">{successMessage}</span>
          </div>
        )}

        {validationResult && (
          <div
            className={`p-3.5 rounded-2xl text-xs border ${
              validationResult.valid
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {validationResult.valid ? <CheckCircle size={16} /> : <WarningCircle size={16} />}
              <span>{validationResult.valid ? t('validationPassed') : t('validationFailed')}</span>
            </div>
            {validationResult.errors.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5 mt-1 text-[11px]">
                {validationResult.errors.map((e, idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{e.field}:</span> {e.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* 2. Scope Selector (Global vs Override) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Storefront size={18} className="text-stone-700" />
              {t('secOverrides')}
            </h3>
            <p className="text-xs text-stone-500">
              {selectedScope === 'global'
                ? t('labelScopeGlobal')
                : `${t('labelScopeOverride')}: ${selectedScope}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Global pill */}
            <button
              type="button"
              onClick={() => setSelectedScope('global')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedScope === 'global'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {t('labelScopeGlobal')}
            </button>

            {/* Existing override pills */}
            {Object.keys(workingConfig.overrides || {}).map((scopeKey) => {
              const scopeMeta = SUPPORTED_OVERRIDE_SCOPES.find((s) => s.id === scopeKey);
              const label = isRTL ? scopeMeta?.nameAr : scopeMeta?.nameEn;
              const isSelected = selectedScope === scopeKey;
              return (
                <div
                  key={scopeKey}
                  className={`inline-flex items-center rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-brand-red text-white border-brand-red shadow-sm'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedScope(scopeKey as AlgorithmOverrideScope)}
                    className="px-3 py-1.5 cursor-pointer"
                  >
                    {label || scopeKey}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveOverrideScope(scopeKey as AlgorithmOverrideScope)}
                    title={t('btnRemoveOverride')}
                    className="pe-2 ps-1 cursor-pointer hover:opacity-80"
                  >
                    <X size={12} weight="bold" />
                  </button>
                </div>
              );
            })}

            {/* Add new override dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddOverrideScope(e.target.value as AlgorithmOverrideScope);
                  e.target.value = '';
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 border border-stone-200 text-stone-700 hover:bg-stone-200 cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                + {t('btnAddOverride')}
              </option>
              {SUPPORTED_OVERRIDE_SCOPES.filter(
                (s) => !workingConfig.overrides?.[s.id]
              ).map((s) => (
                <option key={s.id} value={s.id}>
                  {isRTL ? s.nameAr : s.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Controls Grid Section: Ranking Priorities */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkle size={20} className="text-amber-500" weight="fill" />
          <h3 className="text-base font-bold text-stone-900">{t('secRankingPriorities')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rankingSettings.map((meta) => {
            const { value, isOverridden } = getSettingValue(meta.key);
            const pubVal = publishedVersion?.settings.global[meta.key] ?? meta.default;
            return (
              <AlgorithmControlCard
                key={meta.key}
                metadata={meta}
                currentValue={value}
                publishedValue={pubVal}
                isOverridden={isOverridden}
                isRTL={isRTL}
                t={t}
                onChange={(val) => handleSettingChange(meta.key, val)}
                onResetDefault={() => handleResetToDefault(meta.key)}
                onResetPublished={() => handleResetToPublished(meta.key)}
              />
            );
          })}
        </div>
      </div>

      {/* 4. Controls Grid Section: Geographic Relevance */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin size={20} className="text-emerald-600" weight="fill" />
          <h3 className="text-base font-bold text-stone-900">{t('secGeographicRelevance')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {geoSettings.map((meta) => {
            const { value, isOverridden } = getSettingValue(meta.key);
            const pubVal = publishedVersion?.settings.global[meta.key] ?? meta.default;
            return (
              <AlgorithmControlCard
                key={meta.key}
                metadata={meta}
                currentValue={value}
                publishedValue={pubVal}
                isOverridden={isOverridden}
                isRTL={isRTL}
                t={t}
                onChange={(val) => handleSettingChange(meta.key, val)}
                onResetDefault={() => handleResetToDefault(meta.key)}
                onResetPublished={() => handleResetToPublished(meta.key)}
              />
            );
          })}
        </div>
      </div>

      {/* 5. Controls Grid Section: Repetition and Diversity */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Compass size={20} className="text-indigo-600" weight="fill" />
          <h3 className="text-base font-bold text-stone-900">{t('secRepetitionDiversity')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diversitySettings.map((meta) => {
            const { value, isOverridden } = getSettingValue(meta.key);
            const pubVal = publishedVersion?.settings.global[meta.key] ?? meta.default;
            return (
              <AlgorithmControlCard
                key={meta.key}
                metadata={meta}
                currentValue={value}
                publishedValue={pubVal}
                isOverridden={isOverridden}
                isRTL={isRTL}
                t={t}
                onChange={(val) => handleSettingChange(meta.key, val)}
                onResetDefault={() => handleResetToDefault(meta.key)}
                onResetPublished={() => handleResetToPublished(meta.key)}
              />
            );
          })}
        </div>
      </div>

      {/* 6. Draft Validation and Preview Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Eye size={20} className="text-brand-red" />
              {t('secDraftPreview')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Compare current published recommendations vs proposed draft settings under identical inputs.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunPreview}
            disabled={isPreviewLoading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white cursor-pointer transition-all flex items-center gap-2 shadow-sm"
          >
            {isPreviewLoading ? <CircleNotch size={15} className="animate-spin" /> : <Eye size={15} />}
            {t('btnRunPreview')}
          </button>
        </div>

        {/* Scenario Controls */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-bold text-stone-700 mb-1">Mode</label>
            <select
              value={previewScenario.mode}
              onChange={(e) => setPreviewScenario((s) => ({ ...s, mode: e.target.value }))}
              className="w-full p-2 rounded-xl bg-white border border-stone-200 text-stone-800 font-semibold"
            >
              <option value="food">Food</option>
              <option value="breakfast">Breakfast</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Category</label>
            <select
              value={previewScenario.category}
              onChange={(e) => setPreviewScenario((s) => ({ ...s, category: e.target.value }))}
              className="w-full p-2 rounded-xl bg-white border border-stone-200 text-stone-800 font-semibold"
            >
              <option value="burger">Burger</option>
              <option value="shawarma">Shawarma</option>
              <option value="fried_chicken">Fried Chicken & Broast</option>
              <option value="pizza">Pizza</option>
              <option value="grills">Grills</option>
              <option value="saudi_rice">Saudi Rice & Kabsa</option>
              <option value="italian">Italian</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">District</label>
            <select
              value={previewScenario.district}
              onChange={(e) => setPreviewScenario((s) => ({ ...s, district: e.target.value }))}
              className="w-full p-2 rounded-xl bg-white border border-stone-200 text-stone-800 font-semibold"
            >
              <option value="al_rawdah">Al Rawdah</option>
              <option value="al_zahra">Al Zahra</option>
              <option value="al_salamah">Al Salamah</option>
              <option value="al_andalus">Al Andalus</option>
              <option value="abhur_al_shamaliyah">North Obhur</option>
              <option value="al_hamdaniyah">Al Hamdaniyah</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Dining Mode</label>
            <select
              value={previewScenario.eating_mode}
              onChange={(e) => setPreviewScenario((s) => ({ ...s, eating_mode: e.target.value }))}
              className="w-full p-2 rounded-xl bg-white border border-stone-200 text-stone-800 font-semibold"
            >
              <option value="any">Any Mode</option>
              <option value="delivery">Delivery</option>
              <option value="dine_in">Dine-in</option>
            </select>
          </div>
        </div>

        {previewError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <WarningCircle size={18} className="shrink-0 text-rose-600" />
            <span>{previewError}</span>
          </div>
        )}

        {/* Live Preview Results */}
        {previewResult && (
          <div className="space-y-4">
            {/* Diff Summary Notice */}
            <div
              className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                previewResult.diff.added.length > 0 ||
                previewResult.diff.removed.length > 0 ||
                previewResult.diff.reordered.length > 0
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <Info size={18} className="shrink-0" />
              <span>
                {previewResult.diff.added.length > 0 ||
                previewResult.diff.removed.length > 0 ||
                previewResult.diff.reordered.length > 0
                  ? t('previewChangesDetectedNotice')
                  : t('previewNoChangesNotice')}
              </span>
            </div>

            {/* Side-by-side 7-card decks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Published Deck */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {t('previewColPublishedDeck')} (v{previewResult.activeVersionNumber})
                  </h4>
                  <span className="text-xs text-stone-500">7 Cards</span>
                </div>

                <div className="space-y-2">
                  {previewResult.publishedDeck.map((card, idx) => (
                    <div
                      key={card.id}
                      className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-white border border-stone-200 flex items-center justify-center font-bold text-stone-600">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-stone-900">
                            {isRTL ? card.nameAr : card.nameEn}
                          </div>
                          <div className="text-[11px] text-stone-500">
                            {card.district} {card.distanceKm ? `• ${card.distanceKm} km` : ''}
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="font-bold text-stone-700">{card.score}</span>
                        {card.tier && (
                          <div className="text-[10px] text-stone-400 capitalize">{card.tier}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposed Draft Deck */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-red" />
                    {t('previewColProposedDeck')}
                  </h4>
                  <span className="text-xs text-stone-500">7 Cards</span>
                </div>

                <div className="space-y-2">
                  {previewResult.proposedDeck.map((card, idx) => {
                    const isNew = previewResult.diff.added.some((a) => a.id === card.id);
                    return (
                      <div
                        key={card.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                          isNew
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold ${
                              isNew
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white border-stone-200 text-stone-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-stone-900 flex items-center gap-1.5">
                              <span>{isRTL ? card.nameAr : card.nameEn}</span>
                              {isNew && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {t('previewAddedCards')}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500">
                              {card.district} {card.distanceKm ? `• ${card.distanceKm} km` : ''}
                            </div>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="font-bold text-stone-700">{card.score}</span>
                          {card.tier && (
                            <div className="text-[10px] text-stone-400 capitalize">{card.tier}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. Published Configuration and Version History */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-600" />
            {t('secVersionHistory')}
          </h3>
          <span className="text-xs text-stone-500">{versions.length} versions recorded</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-xs text-start">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
              <tr>
                <th className="p-3 text-start">{t('colVersionNum')}</th>
                <th className="p-3 text-start">{t('colStatus')}</th>
                <th className="p-3 text-start">{t('colPublishedAt')}</th>
                <th className="p-3 text-start">{t('colPublishedBy')}</th>
                <th className="p-3 text-start">{t('colChangeSummary')}</th>
                <th className="p-3 text-end">{t('colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {versions.map((ver) => (
                <tr key={ver.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="p-3 font-bold text-stone-900">v{ver.version_number}</td>
                  <td className="p-3">
                    {ver.is_active ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {t('badgeActive')}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600">
                        {t('badgeHistoric')}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-stone-600">{formatSaudiTime(ver.published_at)}</td>
                  <td className="p-3 text-stone-600">{ver.published_by}</td>
                  <td className="p-3 text-stone-700 max-w-xs truncate" title={ver.change_summary || ''}>
                    {ver.change_summary || ver.reason || '-'}
                  </td>
                  <td className="p-3 text-end">
                    {!ver.is_active && (
                      <button
                        type="button"
                        onClick={() => {
                          setRollbackTargetVersion(ver.version_number);
                          setIsRollbackModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 cursor-pointer transition-colors"
                      >
                        {t('btnRollbackToVersion')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <UploadSimple size={20} className="text-brand-red" weight="bold" />
                {t('publishConfirmTitle')}
              </h3>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {t('publishConfirmPrompt')}
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('colChangeSummary')}
              </label>
              <input
                type="text"
                value={publishReason}
                onChange={(e) => setPublishReason(e.target.value)}
                placeholder={t('inputReasonPlaceholder')}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-brand-red"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                {t('btnDiscardAlgoDraft')}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-red text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isPublishing && <CircleNotch size={14} className="animate-spin" />}
                {t('btnPublishAlgoConfig')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {isRollbackModalOpen && rollbackTargetVersion && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <ArrowCounterClockwise size={20} className="text-amber-600" weight="bold" />
                {t('rollbackConfirmTitle')}
              </h3>
              <button
                type="button"
                onClick={() => setIsRollbackModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {t('rollbackConfirmPrompt', { targetVersion: rollbackTargetVersion })}
            </p>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {t('colChangeSummary')}
              </label>
              <input
                type="text"
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                placeholder="Reason for rolling back..."
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-brand-red"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRollbackModalOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                {t('btnDiscardAlgoDraft')}
              </button>
              <button
                type="button"
                onClick={handleRollback}
                disabled={isRollingBack}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                {isRollingBack && <CircleNotch size={14} className="animate-spin" />}
                {t('btnConfirmRollback')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface AlgorithmControlCardProps {
  metadata: typeof ALGORITHM_SETTING_METADATA[AlgorithmSettingKey];
  currentValue: number;
  publishedValue: number;
  isOverridden: boolean;
  isRTL: boolean;
  t: (key: any, replacements?: any) => string;
  onChange: (value: number) => void;
  onResetDefault: () => void;
  onResetPublished: () => void;
}

const AlgorithmControlCard: React.FC<AlgorithmControlCardProps> = ({
  metadata,
  currentValue,
  publishedValue,
  isOverridden,
  isRTL,
  t,
  onChange,
  onResetDefault,
  onResetPublished,
}) => {
  const name = isRTL ? metadata.nameAr : metadata.nameEn;
  const description = isRTL ? metadata.descriptionAr : metadata.descriptionEn;
  const higherEffect = isRTL ? metadata.higherEffectAr : metadata.higherEffectEn;
  const lowerEffect = isRTL ? metadata.lowerEffectAr : metadata.lowerEffectEn;

  const isModifiedFromPublished = currentValue !== publishedValue;

  return (
    <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3 hover:border-stone-300 transition-colors">
      <div>
        {/* Header with name and badges */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-stone-900 leading-tight">{name}</h4>
            <span className="text-[10px] text-stone-400 font-mono">{metadata.unit}</span>
          </div>

          <div className="flex items-center gap-1">
            {isOverridden ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-redSoft text-brand-red">
                {t('labelScopeOverride')}
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600">
                {t('labelScopeInherited')}
              </span>
            )}
          </div>
        </div>

        <p className="text-[11px] text-stone-500 mt-1 leading-snug">{description}</p>
      </div>

      {/* Value adjustment slider & input */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <div className="flex items-center justify-between text-xs">
          <span className="text-stone-500">
            {t('labelCurrentPublished')}: <span className="font-semibold text-stone-700">{publishedValue}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500">{t('labelDraftValue')}:</span>
            <input
              type="number"
              min={metadata.min}
              max={metadata.max}
              step={metadata.step}
              value={currentValue}
              onChange={(e) => {
                const parsed = parseFloat(e.target.value);
                if (!isNaN(parsed)) {
                  onChange(parsed);
                }
              }}
              className={`w-16 p-1 rounded-lg border text-center font-bold text-xs ${
                isModifiedFromPublished
                  ? 'border-brand-red bg-amber-50/50 text-brand-red'
                  : 'border-stone-200 bg-white text-stone-900'
              }`}
            />
          </div>
        </div>

        {/* Range slider */}
        <input
          type="range"
          min={metadata.min}
          max={metadata.max}
          step={metadata.step}
          value={currentValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full accent-brand-red cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
        />

        <div className="flex items-center justify-between text-[10px] text-stone-400">
          <span>{metadata.min}</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onResetDefault}
              title={`Reset to default (${metadata.default})`}
              className="text-[10px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              {t('resetToDefault')}
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={onResetPublished}
              title={`Reset to published (${publishedValue})`}
              className="text-[10px] text-stone-500 hover:text-stone-800 underline cursor-pointer"
            >
              {t('resetToPublished')}
            </button>
          </div>
          <span>{metadata.max}</span>
        </div>
      </div>

      {/* Practical effects explanation */}
      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-150 text-[10px] space-y-1 text-stone-600">
        <div>
          <span className="font-bold text-emerald-700">▲ Higher: </span>
          <span>{higherEffect}</span>
        </div>
        <div>
          <span className="font-bold text-amber-700">▼ Lower: </span>
          <span>{lowerEffect}</span>
        </div>
      </div>
    </div>
  );
};
