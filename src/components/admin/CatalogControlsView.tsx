import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MagnifyingGlass,
  PencilSimple,
  DownloadSimple,
  WarningCircle,
  CheckCircle,
  XCircle,
  Lightning,
  CircleNotch,
  CaretDown,
  CaretRight,
  Trash,
  Check,
  X,
  Buildings,
  Storefront,
} from '@phosphor-icons/react';
import { useAdminLocale } from '../../context/AdminLocaleContext';
import {
  fetchCatalogItems,
  fetchCatalogDrafts,
  saveCatalogDraft,
  discardCatalogDraft,
  validateCatalogDraft,
  publishCatalogChangeset,
  applyEmergencyCatalogAction,
  createRollbackDraft,
  downloadCatalogCsv,
} from '../../services/adminService';
import type {
  CatalogBrand,
  CatalogBranch,
  CatalogDraftChangeset,
  CatalogDraftItem,
  CatalogValidationResponse,
} from '../../types/admin';

export const CatalogControlsView: React.FC = () => {
  const { t, isRTL, formatSaudiTime } = useAdminLocale();

  // Primary navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'drafts' | 'reminders'>('catalog');

  // Catalog data state
  const [brands, setBrands] = useState<CatalogBrand[]>([]);
  const [branches, setBranches] = useState<CatalogBranch[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Expanded brand accordion state
  const [expandedBrandIds, setExpandedBrandIds] = useState<Set<string>>(new Set());

  // Bulk selection state
  const [selectedEntityKeys, setSelectedEntityKeys] = useState<Set<string>>(new Set());

  // Drafts & Reminders state
  const [drafts, setDrafts] = useState<CatalogDraftChangeset[]>([]);
  const [reminders, setReminders] = useState<CatalogDraftChangeset[]>([]);
  const [isDraftsLoading, setIsDraftsLoading] = useState<boolean>(false);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingEntity, setEditingEntity] = useState<{
    type: 'restaurant' | 'branch';
    brand?: CatalogBrand;
    branch?: CatalogBranch;
  } | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [activeChangesetId, setActiveChangesetId] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<CatalogValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishReason, setPublishReason] = useState<string>('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Emergency action modal
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [emergencyTarget, setEmergencyTarget] = useState<{
    action: 'hide_brand' | 'hide_branch' | 'branch_unavailable' | 'restore_brand' | 'restore_branch';
    entityId: string;
    entityName: string;
  } | null>(null);
  const [emergencyReason, setEmergencyReason] = useState<string>('');
  const [emergencyDeadlineHours, setEmergencyDeadlineHours] = useState<number>(48);
  const [isApplyingEmergency, setIsApplyingEmergency] = useState<boolean>(false);

  // CSV export state
  const [isExportingCsv, setIsExportingCsv] = useState<boolean>(false);

  // Load catalog items
  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setCatalogError(null);
    try {
      const res = await fetchCatalogItems({
        search: searchQuery,
        category: selectedCategory,
        district: selectedDistrict,
        status: selectedStatus,
        limit: 100,
      });
      setBrands(res.brands || []);
      setBranches(res.branches || []);
      if (res.districts && res.districts.length > 0) {
        setDistricts(res.districts);
      }
    } catch (err) {
      setCatalogError((err as Error).message || 'Failed to load catalog records.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedDistrict, selectedStatus]);

  // Load drafts and reminders
  const loadDraftsAndReminders = useCallback(async () => {
    setIsDraftsLoading(true);
    try {
      const res = await fetchCatalogDrafts();
      setDrafts(res.drafts || []);
      setReminders(res.emergency_reminders || []);
    } catch (err) {
      console.error('Failed to load drafts', err);
    } finally {
      setIsDraftsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  useEffect(() => {
    loadDraftsAndReminders();
  }, [loadDraftsAndReminders]);

  // Group branches by restaurant_id
  const branchesByBrand = useMemo(() => {
    const map = new Map<string, CatalogBranch[]>();
    for (const b of branches) {
      const list = map.get(b.restaurant_id) || [];
      list.push(b);
      map.set(b.restaurant_id, list);
    }
    return map;
  }, [branches]);

  const toggleBrandExpand = (brandId: string) => {
    setExpandedBrandIds((prev) => {
      const next = new Set(prev);
      if (next.has(brandId)) next.delete(brandId);
      else next.add(brandId);
      return next;
    });
  };

  const toggleSelectEntity = (key: string) => {
    setSelectedEntityKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Open brand edit modal
  const handleOpenBrandEdit = (brand: CatalogBrand) => {
    setEditingEntity({ type: 'restaurant', brand });
    setIsEditModalOpen(true);
  };

  // Open branch edit modal
  const handleOpenBranchEdit = (branch: CatalogBranch, parentBrand: CatalogBrand) => {
    setEditingEntity({ type: 'branch', branch, brand: parentBrand });
    setIsEditModalOpen(true);
  };

  // Trigger Validation & Preview
  const handlePreviewDraft = async (draftId: string) => {
    setActiveChangesetId(draftId);
    setIsValidating(true);
    setIsPreviewModalOpen(true);
    setValidationResult(null);
    setFeedbackNotice(null);
    try {
      const res = await validateCatalogDraft({ draft_id: draftId });
      setValidationResult(res);
    } catch (err) {
      setFeedbackNotice({
        text: (err as Error).message || 'Draft validation request failed.',
        type: 'error',
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Publish Change Set
  const handlePublishCurrentDraft = async () => {
    if (!activeChangesetId) return;
    if (
      validationResult?.change_type &&
      ['emergency', 'rollback', 'restore'].includes(validationResult.change_type) &&
      (!publishReason || publishReason.trim().length < 3)
    ) {
      setFeedbackNotice({
        text: t('labelReasonRequired'),
        type: 'error',
      });
      return;
    }

    setIsPublishing(true);
    setFeedbackNotice(null);
    try {
      await publishCatalogChangeset(activeChangesetId, publishReason);
      setFeedbackNotice({
        text: t('publishSuccessMessage'),
        type: 'success',
      });
      await loadCatalog();
      await loadDraftsAndReminders();
      setTimeout(() => {
        setIsPreviewModalOpen(false);
        setActiveChangesetId(null);
      }, 1500);
    } catch (err) {
      const errorMsg = (err as { detail?: string; message?: string }).detail || (err as Error).message;
      setFeedbackNotice({
        text: errorMsg || t('publishFailedMessage'),
        type: 'error',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Discard draft
  const handleDiscardDraft = async (draftId: string) => {
    if (!confirm('Are you sure you want to discard this draft? Live catalog data will remain untouched.')) return;
    try {
      await discardCatalogDraft(draftId);
      await loadDraftsAndReminders();
    } catch (err) {
      alert((err as Error).message || 'Failed to discard draft.');
    }
  };

  // Open emergency control modal
  const handleOpenEmergency = (
    action: 'hide_brand' | 'hide_branch' | 'branch_unavailable' | 'restore_brand' | 'restore_branch',
    entityId: string,
    entityName: string
  ) => {
    setEmergencyTarget({ action, entityId, entityName });
    setEmergencyReason('');
    setEmergencyDeadlineHours(48);
    setIsEmergencyModalOpen(true);
  };

  // Apply emergency action
  const handleApplyEmergency = async () => {
    if (!emergencyTarget) return;
    if (!emergencyReason || emergencyReason.trim().length < 3) {
      alert(t('labelReasonRequired'));
      return;
    }

    setIsApplyingEmergency(true);
    try {
      await applyEmergencyCatalogAction(
        emergencyTarget.action,
        emergencyTarget.entityId,
        emergencyReason,
        emergencyDeadlineHours
      );
      setIsEmergencyModalOpen(false);
      setEmergencyTarget(null);
      await loadCatalog();
      await loadDraftsAndReminders();
    } catch (err) {
      alert((err as Error).message || 'Emergency action failed.');
    } finally {
      setIsApplyingEmergency(false);
    }
  };

  // Catalog CSV Export
  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    try {
      const { filename, blob } = await downloadCatalogCsv({
        category: selectedCategory,
        district: selectedDistrict,
        status: selectedStatus,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert((err as Error).message || 'Failed to export catalog CSV.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Forward Rollback initiation
  const handleTriggerRollback = async (historyId: string) => {
    try {
      const res = await createRollbackDraft(historyId);
      await loadDraftsAndReminders();
      handlePreviewDraft(res.draft_id);
    } catch (err) {
      alert((err as Error).message || 'Failed to initiate rollback.');
    }
  };

  // Bulk Edit Handler
  const handleBulkEdit = async () => {
    if (selectedEntityKeys.size === 0) return;
    const targets: CatalogDraftItem[] = [];
    for (const key of selectedEntityKeys) {
      const [type, id] = key.split(':');
      if (type === 'brand') {
        const b = brands.find((x) => x.id === id);
        if (b) {
          targets.push({
            entity_type: 'restaurant',
            entity_id: b.id,
            base_version: b.updated_at,
            changes: { operating_status: b.operating_status || 'open' },
          });
        }
      }
    }
    if (targets.length === 0) return;
    try {
      const draft = await saveCatalogDraft({
        title: `Bulk Edit: ${targets.length} brands`,
        change_type: 'bulk_edit',
        target_entities: targets,
      });
      await loadDraftsAndReminders();
      handlePreviewDraft(draft.id);
    } catch (err) {
      alert((err as Error).message || 'Failed to create bulk draft.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Buildings size={22} className="text-brand-red" weight="fill" />
              <h2 className="text-base sm:text-lg font-bold text-stone-900 font-alexandria">
                {t('catalogControlsTitle')}
              </h2>
            </div>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              {t('catalogControlsSubtitle')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedEntityKeys.size > 0 && (
              <button
                type="button"
                onClick={handleBulkEdit}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                <PencilSimple size={14} />
                <span>{t('btnBulkEdit')} ({selectedEntityKeys.size})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isExportingCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isExportingCsv ? (
                <CircleNotch size={14} className="animate-spin text-stone-500" />
              ) : (
                <DownloadSimple size={14} />
              )}
              <span>{t('btnExportCatalogCsv')}</span>
            </button>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setActiveSubTab('catalog')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'catalog'
                ? 'bg-brand-red text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {t('tabBrandsBranches')} ({brands.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('drafts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'drafts'
                ? 'bg-brand-red text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>{t('tabDrafts')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current">
              {drafts.filter((d) => d.status === 'draft' || d.status === 'validated').length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('reminders')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeSubTab === 'reminders'
                ? 'bg-brand-red text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <span>{t('tabEmergencyReminders')}</span>
            {reminders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                {reminders.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main View Mode: Brands & Branches */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <MagnifyingGlass
                size={16}
                className={`absolute top-1/2 -translate-y-1/2 text-stone-400 ${
                  isRTL ? 'right-3' : 'left-3'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchCatalogPlaceholder')}
                className={`w-full py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red ${
                  isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              >
                <option value="">{t('filterAllCategories')}</option>
                <option value="burger">Burger</option>
                <option value="shawarma">Shawarma</option>
                <option value="fried_chicken">Fried Chicken</option>
                <option value="pizza">Pizza</option>
                <option value="kabsa">Kabsa</option>
                <option value="grills">Grills</option>
                <option value="breakfast">Breakfast</option>
                <option value="seafood">Seafood</option>
                <option value="sushi">Sushi</option>
              </select>

              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              >
                <option value="">{t('filterAllDistricts')}</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              >
                <option value="">{t('filterAllStatuses')}</option>
                <option value="open">{t('filterStatusOpen')}</option>
                <option value="temporarily_closed">{t('filterStatusTemporarilyClosed')}</option>
                <option value="permanently_closed">{t('filterStatusPermanentlyClosed')}</option>
              </select>
            </div>
          </div>

          {/* Catalog Listing */}
          {isLoading ? (
            <div className="py-24 text-center">
              <CircleNotch size={32} className="animate-spin text-brand-red mx-auto mb-3" />
              <p className="text-xs font-semibold text-stone-500">Loading catalog records...</p>
            </div>
          ) : catalogError ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <WarningCircle size={18} className="shrink-0" />
              <span>{catalogError}</span>
            </div>
          ) : brands.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
              No matching brands or branches found.
            </div>
          ) : (
            <div className="space-y-3">
              {brands.map((brand) => {
                const brandBranches = branchesByBrand.get(brand.id) || [];
                const isExpanded = expandedBrandIds.has(brand.id);
                const isBrandOpen = brand.operating_status === 'open';
                const isBrandEligible =
                  isBrandOpen && ['production_ready', 'usable_with_caution'].includes(brand.research_use || '');

                return (
                  <div
                    key={brand.id}
                    className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden transition-all"
                  >
                    {/* Brand Row */}
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-stone-50/50">
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedEntityKeys.has(`brand:${brand.id}`)}
                          onChange={() => toggleSelectEntity(`brand:${brand.id}`)}
                          className="mt-1.5 rounded text-brand-red focus:ring-brand-red/20 cursor-pointer"
                        />

                        <button
                          type="button"
                          onClick={() => toggleBrandExpand(brand.id)}
                          className="mt-1 p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                        >
                          {isExpanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-stone-900 font-alexandria">
                              {brand.name_en || brand.name_ar}
                            </span>
                            {brand.name_ar && brand.name_en && (
                              <span className="text-xs text-stone-500 font-alexandria">
                                ({brand.name_ar})
                              </span>
                            )}
                            <span className="font-mono text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                              {brand.id}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                              {brand.categories?.join(', ')}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                isBrandOpen
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              {brand.operating_status || 'unknown'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                isBrandEligible
                                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {brand.research_use || 'manual_review_only'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <span className="text-xs font-semibold text-stone-500">
                          {brandBranches.length} {t('colBranchesCount')}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenBrandEdit(brand)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
                        >
                          <PencilSimple size={13} />
                          <span>{t('btnEditBrand')}</span>
                        </button>

                        {isBrandEligible ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEmergency(
                                'hide_brand',
                                brand.id,
                                brand.name_en || brand.name_ar
                              )
                            }
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Lightning size={13} weight="fill" />
                            <span>{t('btnEmergencyHide')}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEmergency(
                                'restore_brand',
                                brand.id,
                                brand.name_en || brand.name_ar
                              )
                            }
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Check size={13} />
                            <span>{t('btnRestore')}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Branches Sub-Table */}
                    {isExpanded && (
                      <div className="border-t border-stone-100 bg-stone-50/50 p-4">
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono">
                            {t('colBranchesCount')} ({brandBranches.length})
                          </h4>

                          {brandBranches.length === 0 ? (
                            <div className="py-4 text-center text-xs text-stone-500 bg-white rounded-xl border border-stone-200">
                              No branches registered for this brand.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {brandBranches.map((branch) => {
                                const isBranchOpen = branch.branch_status === 'open';
                                const hasAddress = Boolean(branch.address_ar || branch.address_en);
                                const hasDistrict = Boolean(branch.district);
                                const isBranchEligible = isBrandEligible && isBranchOpen && hasAddress && hasDistrict;

                                return (
                                  <div
                                    key={branch.id}
                                    className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-sm space-y-2"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <Storefront size={16} className="text-stone-500" />
                                          <span className="font-bold text-xs text-stone-800">
                                            {branch.branch_name_en || branch.branch_name_ar || branch.district}
                                          </span>
                                        </div>
                                        <div className="text-[11px] text-stone-600 mt-0.5">
                                          {branch.address_en || branch.address_ar || (
                                            <span className="text-rose-600 font-semibold">
                                              No address recorded!
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                          isBranchEligible
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}
                                      >
                                        {isBranchEligible ? t('badgeEligible') : t('badgeBlocked')}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-stone-500 pt-1 border-t border-stone-100">
                                      <span className="bg-stone-100 px-1.5 py-0.2 rounded">
                                        {branch.district || 'no_district'}
                                      </span>
                                      <span
                                        className={`px-1.5 py-0.2 rounded ${
                                          isBranchOpen
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-rose-50 text-rose-700'
                                        }`}
                                      >
                                        {branch.branch_status}
                                      </span>
                                      {branch.google_maps_url && (
                                        <a
                                          href={branch.google_maps_url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-brand-red hover:underline"
                                        >
                                          Maps Link
                                        </a>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-end gap-1.5 pt-1">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenBranchEdit(branch, brand)}
                                        className="p-1 rounded text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                                        title={t('btnEditBrand')}
                                      >
                                        <PencilSimple size={14} />
                                      </button>
                                      {isBranchOpen ? (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOpenEmergency(
                                              'hide_branch',
                                              branch.id,
                                              branch.branch_name_en || branch.district || branch.id
                                            )
                                          }
                                          className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-semibold transition-colors cursor-pointer"
                                        >
                                          {t('btnEmergencyHide')}
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOpenEmergency(
                                              'restore_branch',
                                              branch.id,
                                              branch.branch_name_en || branch.district || branch.id
                                            )
                                          }
                                          className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold transition-colors cursor-pointer"
                                        >
                                          {t('btnRestore')}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Draft Change Sets */}
      {activeSubTab === 'drafts' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-stone-900 font-alexandria">
                {t('tabDrafts')}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Drafts remain strictly isolated from live recommendations until explicitly published.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                id="rollback-history-input"
                placeholder="History ID for rollback..."
                className="py-1.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700 w-48 sm:w-60 focus:outline-none focus:ring-2 focus:ring-brand-red/20"
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('rollback-history-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handleTriggerRollback(input.value.trim());
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                {t('btnRollbackToSnapshot')}
              </button>
            </div>
          </div>

          {isDraftsLoading ? (
            <div className="py-24 text-center">
              <CircleNotch size={32} className="animate-spin text-brand-red mx-auto mb-3" />
              <p className="text-xs font-semibold text-stone-500">Loading drafts...</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
              No active drafts found. Create an edit or bulk edit to start an isolated change set.
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => {
                const isPublished = draft.status === 'published';
                const isCancelled = draft.status === 'cancelled';

                return (
                  <div
                    key={draft.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 font-alexandria">
                          {draft.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border font-mono ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isCancelled
                              ? 'bg-stone-100 text-stone-500 border-stone-200'
                              : draft.status === 'validated'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {draft.status}
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200">
                          {draft.change_type}
                        </span>
                      </div>

                      <div className="text-xs text-stone-500 mt-1 flex flex-wrap items-center gap-3 font-mono text-[11px]">
                        <span>Entities: {draft.target_entities?.length || 0}</span>
                        <span>Created: {formatSaudiTime(draft.created_at)}</span>
                        <span>By: {draft.created_by}</span>
                        {draft.reason && <span>Reason: {draft.reason}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      {!isPublished && !isCancelled && (
                        <>
                          <button
                            type="button"
                            onClick={() => handlePreviewDraft(draft.id)}
                            className="px-3 py-1.5 rounded-xl bg-brand-red text-white hover:bg-brand-red/90 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                          >
                            Review & Publish
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDiscardDraft(draft.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title={t('btnDiscardDraft')}
                          >
                            <Trash size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Emergency Reminders */}
      {activeSubTab === 'reminders' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
            <h3 className="text-sm font-bold text-stone-900 font-alexandria flex items-center gap-2">
              <Lightning size={18} className="text-amber-500" weight="fill" />
              <span>{t('tabEmergencyReminders')}</span>
            </h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed">
              {t('emergencyReminderNotice')}
            </p>
          </div>

          {reminders.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200">
              Zero active emergency review reminders. Catalog is operating normally.
            </div>
          ) : (
            <div className="space-y-3">
              {reminders.map((rem) => {
                const deadline = rem.review_deadline ? new Date(rem.review_deadline) : null;
                const isOverdue = deadline ? deadline.getTime() < Date.now() : false;

                return (
                  <div
                    key={rem.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900 font-alexandria">
                          {rem.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isOverdue
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isOverdue ? 'Review Overdue' : 'Review Pending'}
                        </span>
                      </div>

                      <div className="text-xs text-stone-600 mt-1 space-y-0.5">
                        <p>Reason: {rem.reason || 'None provided'}</p>
                        <p className="text-[11px] font-mono text-stone-400">
                          Deadline: {rem.review_deadline ? formatSaudiTime(rem.review_deadline) : 'None'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          const target = rem.target_entities?.[0];
                          if (target) {
                            handleOpenEmergency(
                              target.entity_type === 'restaurant' ? 'restore_brand' : 'restore_branch',
                              target.entity_id,
                              target.entity_id
                            );
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {t('btnRestore')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Draft Validation & Full Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-alexandria">
                  {t('modalDraftPreviewTitle')}
                </h3>
                <p className="text-xs text-stone-500 font-mono mt-0.5">
                  ID: {activeChangesetId || 'New'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-stone-700">
              {isValidating ? (
                <div className="py-20 text-center">
                  <CircleNotch size={32} className="animate-spin text-brand-red mx-auto mb-3" />
                  <p className="text-xs font-semibold text-stone-600">
                    Running authoritative server validation and calculating diffs...
                  </p>
                </div>
              ) : validationResult ? (
                <>
                  {/* Status Banner */}
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      validationResult.is_publishable
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {validationResult.is_publishable ? (
                      <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" weight="fill" />
                    ) : (
                      <XCircle size={20} className="text-rose-600 shrink-0 mt-0.5" weight="fill" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm">
                        {validationResult.is_publishable
                          ? 'Draft Validated: Ready for Atomic Publication'
                          : 'Publication Blocked: Resolve Errors Below'}
                      </h4>
                      <p className="text-xs opacity-90 mt-0.5">
                        {validationResult.affected_entities_count} entity affected. Changes are completely all-or-nothing.
                      </p>
                    </div>
                  </div>

                  {/* Feedback Notice */}
                  {feedbackNotice && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                        feedbackNotice.type === 'success'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      {feedbackNotice.type === 'success' ? (
                        <CheckCircle size={16} weight="fill" />
                      ) : (
                        <WarningCircle size={16} weight="fill" />
                      )}
                      <span>{feedbackNotice.text}</span>
                    </div>
                  )}

                  {/* Validation Errors */}
                  {validationResult.errors.length > 0 && (
                    <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-2">
                      <h5 className="font-bold text-rose-800 flex items-center gap-1.5">
                        <XCircle size={16} weight="fill" />
                        <span>{t('previewValidationErrors')}</span>
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-rose-700">
                        {validationResult.errors.map((e, idx) => (
                          <li key={idx}>
                            <span className="font-mono font-bold">[{e.entity_type} {e.entity_id} - {e.field}]: </span>
                            {e.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Concurrency Conflicts */}
                  {validationResult.concurrency_conflicts.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                      <h5 className="font-bold text-amber-800 flex items-center gap-1.5">
                        <WarningCircle size={16} weight="fill" />
                        <span>Stale Draft Concurrency Conflict</span>
                      </h5>
                      <p className="text-xs text-amber-700">
                        The live record was updated in the database after this draft was loaded.
                      </p>
                      <button
                        type="button"
                        onClick={() => activeChangesetId && handlePreviewDraft(activeChangesetId)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors cursor-pointer"
                      >
                        {t('btnReconcileDraft')}
                      </button>
                    </div>
                  )}

                  {/* Field-by-Field Diff */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-stone-900 font-alexandria">
                      {t('previewDiffTitle')} ({validationResult.diffs.length})
                    </h5>

                    {validationResult.diffs.length === 0 ? (
                      <div className="py-4 text-center text-stone-500 bg-stone-50 rounded-xl border border-stone-200">
                        No field modifications detected.
                      </div>
                    ) : (
                      <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
                        {validationResult.diffs.map((diff, idx) => (
                          <div key={idx} className="p-3.5 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-[11px] text-stone-800">
                                {diff.entity_type} : {diff.entity_id}
                              </span>
                              <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 rounded">
                                {diff.field}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                              <div className="p-2 rounded bg-rose-50 text-rose-800 border border-rose-100 truncate">
                                <span className="text-[10px] text-rose-400 block uppercase">Previous:</span>
                                {JSON.stringify(diff.previous_value)}
                              </div>
                              <div className="p-2 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 truncate">
                                <span className="text-[10px] text-emerald-400 block uppercase">Proposed:</span>
                                {JSON.stringify(diff.proposed_value)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Readiness Impact */}
                  {validationResult.readiness_impact.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-bold text-stone-900 font-alexandria">
                        {t('previewReadinessImpact')}
                      </h5>
                      <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden bg-white">
                        {validationResult.readiness_impact.map((imp, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between">
                            <span className="font-mono text-xs">{imp.entity_id}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-stone-400">After publish:</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  imp.after.is_recommendation_eligible
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {imp.after.is_recommendation_eligible ? 'Eligible' : 'Blocked from recommendations'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reason Input */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <label className="block text-xs font-bold text-stone-800">
                      {['emergency', 'rollback', 'restore'].includes(validationResult.change_type)
                        ? t('labelReasonRequired')
                        : t('labelReasonOptional')}
                    </label>
                    <input
                      type="text"
                      value={publishReason}
                      onChange={(e) => setPublishReason(e.target.value)}
                      placeholder={t('placeholderReason')}
                      className="w-full py-2 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                    />
                  </div>
                </>
              ) : null}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishCurrentDraft}
                disabled={!validationResult?.is_publishable || isPublishing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-red text-white hover:bg-brand-red/90 text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? (
                  <CircleNotch size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>{isPublishing ? t('publishingInProgress') : t('btnPublishNow')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Control Modal */}
      {isEmergencyModalOpen && emergencyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <Lightning size={20} weight="fill" />
                <h3 className="font-bold text-sm text-stone-900 font-alexandria">
                  {t('emergencyModalTitle')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="font-bold text-stone-900 font-alexandria block">
                  {emergencyTarget.entityName} ({emergencyTarget.entityId})
                </span>
                <p className="text-stone-600">
                  {emergencyTarget.action === 'hide_brand'
                    ? t('emergencyHideBrandDesc')
                    : emergencyTarget.action === 'hide_branch'
                    ? t('emergencyHideBranchDesc')
                    : emergencyTarget.action.startsWith('restore_')
                    ? 'Re-enables recommendation eligibility for this entity.'
                    : t('emergencyUnavailableDesc')}
                </p>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-stone-800">
                  {t('labelReasonRequired')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  placeholder="Explain the operational issue or reason..."
                  rows={3}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                />
              </div>

              {!emergencyTarget.action.startsWith('restore_') && (
                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">
                    {t('emergencyReviewDeadline')}
                  </label>
                  <select
                    value={emergencyDeadlineHours}
                    onChange={(e) => setEmergencyDeadlineHours(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    <option value={24}>{t('deadline24h')}</option>
                    <option value={48}>{t('deadline48h')}</option>
                    <option value={168}>{t('deadline7d')}</option>
                    <option value={720}>{t('deadline30d')}</option>
                  </select>
                </div>
              )}

              <p className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                {t('emergencyReminderNotice')}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyEmergency}
                disabled={isApplyingEmergency}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50 ${
                  emergencyTarget.action.startsWith('restore_')
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isApplyingEmergency ? (
                  <CircleNotch size={14} className="animate-spin" />
                ) : (
                  <Lightning size={14} weight="fill" />
                )}
                <span>
                  {emergencyTarget.action.startsWith('restore_')
                    ? t('btnRestoreEntity')
                    : t('btnApplyEmergency')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand / Branch Edit Drawer / Modal */}
      {isEditModalOpen && editingEntity && (
        <EditDraftModal
          editingEntity={editingEntity}
          districts={districts}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={async (draftId) => {
            setIsEditModalOpen(false);
            await loadDraftsAndReminders();
            handlePreviewDraft(draftId);
          }}
        />
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// Sub-Component: Edit Draft Modal
// ----------------------------------------------------------------------
interface EditDraftModalProps {
  editingEntity: {
    type: 'restaurant' | 'branch';
    brand?: CatalogBrand;
    branch?: CatalogBranch;
  };
  districts: string[];
  onClose: () => void;
  onSaved: (draftId: string) => void;
}

const EditDraftModal: React.FC<EditDraftModalProps> = ({
  editingEntity,
  districts,
  onClose,
  onSaved,
}) => {
  const { t } = useAdminLocale();
  const isBrand = editingEntity.type === 'restaurant';
  const brand = editingEntity.brand;
  const branch = editingEntity.branch;

  // Form State: Brand
  const [brandNameEn, setBrandNameEn] = useState<string>(brand?.name_en || '');
  const [brandNameAr, setBrandNameAr] = useState<string>(brand?.name_ar || '');
  const [categories, setCategories] = useState<string>(brand?.categories?.join(', ') || '');
  const [diningMode, setDiningMode] = useState<string>(brand?.dining_mode || 'both');
  const [rating, setRating] = useState<string>(String(brand?.rating ?? 4.5));
  const [operatingStatus, setOperatingStatus] = useState<string>(brand?.operating_status || 'open');
  const [researchUse, setResearchUse] = useState<string>(brand?.research_use || 'production_ready');

  // Form State: Branch
  const [branchNameEn, setBranchNameEn] = useState<string>(branch?.branch_name_en || '');
  const [branchNameAr, setBranchNameAr] = useState<string>(branch?.branch_name_ar || '');
  const [district, setDistrict] = useState<string>(branch?.district || districts[0] || 'al_rawdah');
  const [addressEn, setAddressEn] = useState<string>(branch?.address_en || '');
  const [addressAr, setAddressAr] = useState<string>(branch?.address_ar || '');
  const [latitude, setLatitude] = useState<string>(branch?.latitude ? String(branch.latitude) : '');
  const [longitude, setLongitude] = useState<string>(branch?.longitude ? String(branch.longitude) : '');
  const [mapsUrl, setMapsUrl] = useState<string>(branch?.google_maps_url || '');
  const [branchStatus, setBranchStatus] = useState<string>(branch?.branch_status || 'open');
  const [dineIn, setDineIn] = useState<boolean>(branch?.dine_in ?? true);
  const [takeaway, setTakeaway] = useState<boolean>(branch?.takeaway ?? true);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let targetItem: CatalogDraftItem;

      if (isBrand && brand) {
        targetItem = {
          entity_type: 'restaurant',
          entity_id: brand.id,
          base_version: brand.updated_at,
          changes: {
            name_en: brandNameEn.trim(),
            name_ar: brandNameAr.trim(),
            categories: categories
              .split(',')
              .map((c) => c.trim().toLowerCase())
              .filter(Boolean),
            dining_mode: diningMode,
            rating: Number(rating) || 4.5,
            operating_status: operatingStatus,
            research_use: researchUse,
          },
        };
      } else if (branch) {
        targetItem = {
          entity_type: 'branch',
          entity_id: branch.id,
          base_version: branch.updated_at,
          changes: {
            branch_name_en: branchNameEn.trim(),
            branch_name_ar: branchNameAr.trim(),
            district: district.trim(),
            address_en: addressEn.trim(),
            address_ar: addressAr.trim(),
            latitude: latitude ? Number(latitude) : null,
            longitude: longitude ? Number(longitude) : null,
            google_maps_url: mapsUrl.trim() || null,
            branch_status: branchStatus,
            dine_in: dineIn,
            takeaway: takeaway,
          },
        };
      } else {
        return;
      }

      const draftTitle = isBrand
        ? `Edit Brand: ${brand?.name_en || brand?.id}`
        : `Edit Branch: ${branchNameEn || district} (${branch?.id})`;

      const savedDraft = await saveCatalogDraft({
        title: draftTitle,
        change_type: 'edit',
        target_entities: [targetItem],
      });

      onSaved(savedDraft.id);
    } catch (err) {
      alert((err as Error).message || 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-stone-900 font-alexandria">
            {isBrand ? t('modalEditBrandTitle') : t('modalEditBranchTitle')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {isBrand ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('labelBrandNameEn')}</label>
                  <input
                    type="text"
                    value={brandNameEn}
                    onChange={(e) => setBrandNameEn(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('labelBrandNameAr')}</label>
                  <input
                    type="text"
                    value={brandNameAr}
                    onChange={(e) => setBrandNameAr(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('labelCategories')}</label>
                  <input
                    type="text"
                    value={categories}
                    onChange={(e) => setCategories(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('labelDiningMode')}</label>
                  <select
                    value={diningMode}
                    onChange={(e) => setDiningMode(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer"
                  >
                    <option value="both">Both (Dine-in & Delivery)</option>
                    <option value="delivery_only">Delivery Only</option>
                    <option value="dine_in_only">Dine-in Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('colOperatingStatus')}</label>
                  <select
                    value={operatingStatus}
                    onChange={(e) => setOperatingStatus(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer"
                  >
                    <option value="open">Open</option>
                    <option value="temporarily_closed">Temporarily Closed</option>
                    <option value="permanently_closed">Permanently Closed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('colResearchUse')}</label>
                  <select
                    value={researchUse}
                    onChange={(e) => setResearchUse(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer"
                  >
                    <option value="production_ready">Production Ready</option>
                    <option value="usable_with_caution">Usable with Caution</option>
                    <option value="manual_review_only">Manual Review Only</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">Rating (0 - 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('labelBranchNameEn')}</label>
                  <input
                    type="text"
                    value={branchNameEn}
                    onChange={(e) => setBranchNameEn(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('labelBranchNameAr')}</label>
                  <input
                    type="text"
                    value={branchNameAr}
                    onChange={(e) => setBranchNameAr(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('labelDistrict')}</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('labelBranchStatus')}</label>
                  <select
                    value={branchStatus}
                    onChange={(e) => setBranchStatus(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer"
                  >
                    <option value="open">Open</option>
                    <option value="temporarily_closed">Temporarily Closed</option>
                    <option value="permanently_closed">Permanently Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-stone-800">{t('labelAddressEn')}</label>
                <input
                  type="text"
                  value={addressEn}
                  onChange={(e) => setAddressEn(e.target.value)}
                  placeholder="Street name, building..."
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-stone-800">{t('labelAddressAr')}</label>
                <input
                  type="text"
                  value={addressAr}
                  onChange={(e) => setAddressAr(e.target.value)}
                  placeholder="الشارع، رقم المبنى..."
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('labelLatitude')}</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="21.5432"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-stone-800">{t('labelLongitude')}</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="39.1728"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-stone-800">{t('labelGoogleMapsUrl')}</label>
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dineIn}
                    onChange={(e) => setDineIn(e.target.checked)}
                    className="rounded text-brand-red"
                  />
                  <span>{t('labelDineIn')}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={takeaway}
                    onChange={(e) => setTakeaway(e.target.checked)}
                    className="rounded text-brand-red"
                  />
                  <span>{t('labelTakeaway')}</span>
                </label>
              </div>
            </>
          )}

          <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl text-stone-500 text-[11px] leading-relaxed">
            Saving will create an isolated draft change set. The live catalog will not be modified until you preview and explicitly publish.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-red text-white text-xs font-bold hover:bg-brand-red/90 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <CircleNotch size={14} className="animate-spin" /> : <Check size={14} />}
              <span>{t('btnSaveDraft')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
