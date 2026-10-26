import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  UploadSimple,
  Trash,
  ArrowCounterClockwise,
  Plus,
  CaretDown,
  CaretUp,
  Check,
  CircleNotch,
  WarningCircle,
  Image as ImageIcon,
  Storefront,
  Info,
} from '@phosphor-icons/react';
import { useAdminLocale } from '../../context/AdminLocaleContext';
import { uploadCatalogImage, saveCatalogDraft } from '../../services/adminService';
import type { CatalogBrand, CatalogBranch, CatalogDraftItem } from '../../types/admin';

export interface BrandEditorModalProps {
  brand?: CatalogBrand | null;
  existingBranches?: CatalogBranch[];
  districts: string[];
  onClose: () => void;
  onSaved: (draftId: string) => void;
}

interface LocalBranch {
  tempId: string;
  id?: string;
  isNew?: boolean;
  restaurant_id: string;
  branch_name_en: string;
  branch_name_ar: string;
  district: string;
  address_en: string;
  address_ar: string;
  latitude: string;
  longitude: string;
  google_maps_url: string;
  branch_status: string;
  dine_in: boolean;
  takeaway: boolean;
  is_24_hours: boolean;
  late_night: boolean;
  isExpanded: boolean;
  updated_at?: string;
}

export const BrandEditorModal: React.FC<BrandEditorModalProps> = ({
  brand,
  existingBranches = [],
  districts,
  onClose,
  onSaved,
}) => {
  const { t, isRTL } = useAdminLocale();
  const isNew = !brand || !brand.id;

  // -------------------------------------------------------------
  // Section 1: Brand Info Form State
  // -------------------------------------------------------------
  const [slugId, setSlugId] = useState<string>(brand?.id || '');
  const [nameEn, setNameEn] = useState<string>(brand?.name_en || '');
  const [nameAr, setNameAr] = useState<string>(brand?.name_ar || '');
  const [categories, setCategories] = useState<string>(brand?.categories?.join(', ') || '');
  const [diningMode, setDiningMode] = useState<string>(brand?.dining_mode || 'both');
  const [priceTier, setPriceTier] = useState<string>(brand?.price_tier || '$$');
  const [rating, setRating] = useState<string>(brand?.rating != null ? String(brand.rating) : '4.5');
  const [operatingStatus, setOperatingStatus] = useState<string>(brand?.operating_status || 'open');
  const [researchUse, setResearchUse] = useState<string>(brand?.research_use || 'production_ready');
  const [signatureDishEn, setSignatureDishEn] = useState<string>(brand?.signature_dish_en || '');
  const [signatureDishAr, setSignatureDishAr] = useState<string>(brand?.signature_dish_ar || '');

  // -------------------------------------------------------------
  // Section 2: Brand Image State
  // -------------------------------------------------------------
  const initialImageUrl = brand?.image_url || null;
  const [stagedImageUrl, setStagedImageUrl] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isPendingRemoval, setIsPendingRemoval] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Clean up object URLs on unmount or replacement to prevent memory leaks
  useEffect(() => {
    return () => {
      if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  // Handle image file selection (from browse, drag-drop, or paste)
  const processImageFile = useCallback(
    async (file: File) => {
      setImageUploadError(null);

      // Check max size: 5 MB
      if (file.size > 5 * 1024 * 1024) {
        setImageUploadError(t('errorOversizedImage'));
        return;
      }

      // Check mime type
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(file.type)) {
        setImageUploadError(t('errorInvalidImageType'));
        return;
      }

      // Revoke previous local preview if any
      if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localPreviewUrl);
      }

      const preview = URL.createObjectURL(file);
      setLocalPreviewUrl(preview);
      setIsPendingRemoval(false);
      setIsUploadingImage(true);

      try {
        const uploadTargetBrandId = slugId.trim() || 'pending-brand';
        const res = await uploadCatalogImage(uploadTargetBrandId, file);
        if (res.url) {
          setStagedImageUrl(res.url);
        }
      } catch (err) {
        setImageUploadError((err as Error).message || 'Failed to upload image to staging.');
      } finally {
        setIsUploadingImage(false);
      }
    },
    [localPreviewUrl, slugId, t]
  );

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Clipboard paste support
  const handlePaste = useCallback(
    (e: React.ClipboardEvent | ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            break;
          }
        }
      }
    },
    [processImageFile]
  );

  // Global window paste listener when modal is mounted
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      // Only process if user is not pasting inside a text input / textarea
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (isInput && (target as HTMLInputElement).type === 'text') {
        return;
      }
      handlePaste(e);
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [handlePaste]);

  // Image actions
  const handleRemoveImage = () => {
    setIsPendingRemoval(true);
    setStagedImageUrl(null);
    if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
  };

  const handleRevertImage = () => {
    setIsPendingRemoval(false);
    setStagedImageUrl(null);
    if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
  };

  // Determine current active display image
  const displayImageUrl = isPendingRemoval
    ? null
    : localPreviewUrl || stagedImageUrl || initialImageUrl;

  // -------------------------------------------------------------
  // Section 3: Branches State
  // -------------------------------------------------------------
  const [branches, setBranches] = useState<LocalBranch[]>(() => {
    return existingBranches.map((b) => ({
      tempId: b.id,
      id: b.id,
      restaurant_id: b.restaurant_id,
      branch_name_en: b.branch_name_en || '',
      branch_name_ar: b.branch_name_ar || '',
      district: b.district || districts[0] || 'al_rawdah',
      address_en: b.address_en || '',
      address_ar: b.address_ar || '',
      latitude: b.latitude != null ? String(b.latitude) : '',
      longitude: b.longitude != null ? String(b.longitude) : '',
      google_maps_url: b.google_maps_url || '',
      branch_status: b.branch_status || 'open',
      dine_in: b.dine_in ?? true,
      takeaway: b.takeaway ?? true,
      is_24_hours: b.is_24_hours ?? false,
      late_night: b.late_night ?? false,
      isExpanded: false,
      updated_at: b.updated_at,
    }));
  });

  const handleAddBranch = () => {
    const newBranch: LocalBranch = {
      tempId: crypto.randomUUID(),
      isNew: true,
      restaurant_id: slugId.trim(),
      branch_name_en: '',
      branch_name_ar: '',
      district: districts[0] || 'al_rawdah',
      address_en: '',
      address_ar: '',
      latitude: '',
      longitude: '',
      google_maps_url: '',
      branch_status: 'open',
      dine_in: true,
      takeaway: true,
      is_24_hours: false,
      late_night: false,
      isExpanded: true,
    };
    setBranches((prev) => [...prev, newBranch]);
  };

  const handleToggleBranchExpand = (tempId: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.tempId === tempId ? { ...b, isExpanded: !b.isExpanded } : b))
    );
  };

  const handleBranchChange = (
    tempId: string,
    field: keyof LocalBranch,
    value: string | boolean | number
  ) => {
    setBranches((prev) =>
      prev.map((b) => (b.tempId === tempId ? { ...b, [field]: value } : b))
    );
  };

  const handleDeleteBranch = (tempId: string) => {
    setBranches((prev) => prev.filter((b) => b.tempId !== tempId));
  };

  // -------------------------------------------------------------
  // Dirty Tracking & Unsaved Changes Guard
  // -------------------------------------------------------------
  const isDirty = React.useMemo(() => {
    if (isNew) {
      return Boolean(
        slugId ||
          nameEn ||
          nameAr ||
          categories ||
          stagedImageUrl ||
          localPreviewUrl ||
          branches.length > 0
      );
    }

    // Existing brand comparison
    const brandChanged =
      nameEn !== (brand.name_en || '') ||
      nameAr !== (brand.name_ar || '') ||
      categories !== (brand.categories?.join(', ') || '') ||
      diningMode !== (brand.dining_mode || 'both') ||
      priceTier !== (brand.price_tier || '$$') ||
      rating !== (brand.rating != null ? String(brand.rating) : '4.5') ||
      operatingStatus !== (brand.operating_status || 'open') ||
      researchUse !== (brand.research_use || 'production_ready') ||
      signatureDishEn !== (brand.signature_dish_en || '') ||
      signatureDishAr !== (brand.signature_dish_ar || '');

    const imageChanged = isPendingRemoval || stagedImageUrl !== null;

    const branchesCountChanged = branches.length !== existingBranches.length;
    const branchesContentChanged = branches.some((b) => {
      if (b.isNew) return true;
      const original = existingBranches.find((eb) => eb.id === b.id);
      if (!original) return true;
      return (
        b.branch_name_en !== (original.branch_name_en || '') ||
        b.branch_name_ar !== (original.branch_name_ar || '') ||
        b.district !== (original.district || '') ||
        b.address_en !== (original.address_en || '') ||
        b.address_ar !== (original.address_ar || '') ||
        b.google_maps_url !== (original.google_maps_url || '') ||
        b.branch_status !== (original.branch_status || 'open') ||
        b.dine_in !== (original.dine_in ?? true) ||
        b.takeaway !== (original.takeaway ?? true) ||
        b.is_24_hours !== (original.is_24_hours ?? false) ||
        b.late_night !== (original.late_night ?? false)
      );
    });

    return brandChanged || imageChanged || branchesCountChanged || branchesContentChanged;
  }, [
    isNew,
    slugId,
    nameEn,
    nameAr,
    categories,
    diningMode,
    priceTier,
    rating,
    operatingStatus,
    researchUse,
    signatureDishEn,
    signatureDishAr,
    isPendingRemoval,
    stagedImageUrl,
    localPreviewUrl,
    branches,
    brand,
    existingBranches,
  ]);

  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);

  const handleRequestClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // -------------------------------------------------------------
  // Save Draft Changeset
  // -------------------------------------------------------------
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const cleanSlug = isNew ? slugId.trim().toLowerCase() : brand!.id;
    if (isNew) {
      if (!cleanSlug || !/^[a-z0-9_-]{2,80}$/.test(cleanSlug)) {
        setSaveError('Brand slug ID must be 2 to 80 lowercase alphanumeric characters and hyphens.');
        return;
      }
    }

    if (!nameEn.trim() && !nameAr.trim()) {
      setSaveError('At least one brand name (English or Arabic) is required.');
      return;
    }

    setIsSaving(true);
    try {
      const targetEntities: CatalogDraftItem[] = [];

      // 1. Brand Target Entity
      const brandChanges: Record<string, unknown> = {
        name_en: nameEn.trim(),
        name_ar: nameAr.trim(),
        categories: categories
          .split(',')
          .map((c) => c.trim().toLowerCase())
          .filter(Boolean),
        dining_mode: diningMode,
        price_tier: priceTier,
        rating: rating ? Number(rating) : 4.5,
        operating_status: operatingStatus,
        research_use: researchUse,
        signature_dish_en: signatureDishEn.trim() || null,
        signature_dish_ar: signatureDishAr.trim() || null,
      };

      if (isPendingRemoval) {
        brandChanges.image_url = null;
      } else if (stagedImageUrl) {
        brandChanges.image_url = stagedImageUrl;
      }

      targetEntities.push({
        entity_type: 'restaurant',
        entity_id: cleanSlug,
        action: isNew ? 'create' : 'update',
        base_version: isNew ? undefined : brand!.updated_at,
        changes: brandChanges,
      });

      // 2. Branch Target Entities (if modified or new)
      for (const b of branches) {
        const isModified =
          b.isNew ||
          existingBranches.some(
            (eb) =>
              eb.id === b.id &&
              (b.branch_name_en !== (eb.branch_name_en || '') ||
                b.branch_name_ar !== (eb.branch_name_ar || '') ||
                b.district !== (eb.district || '') ||
                b.address_en !== (eb.address_en || '') ||
                b.address_ar !== (eb.address_ar || '') ||
                b.google_maps_url !== (eb.google_maps_url || '') ||
                b.branch_status !== (eb.branch_status || 'open') ||
                b.dine_in !== (eb.dine_in ?? true) ||
                b.takeaway !== (eb.takeaway ?? true) ||
                b.is_24_hours !== (eb.is_24_hours ?? false) ||
                b.late_night !== (eb.late_night ?? false))
          );

        if (isModified) {
          targetEntities.push({
            entity_type: 'branch',
            entity_id: b.id || b.tempId,
            action: b.isNew ? 'create' : 'update',
            base_version: b.isNew ? undefined : b.updated_at,
            changes: {
              restaurant_id: cleanSlug,
              branch_name_en: b.branch_name_en.trim(),
              branch_name_ar: b.branch_name_ar.trim(),
              district: b.district.trim(),
              address_en: b.address_en.trim(),
              address_ar: b.address_ar.trim(),
              latitude: b.latitude ? Number(b.latitude) : null,
              longitude: b.longitude ? Number(b.longitude) : null,
              google_maps_url: b.google_maps_url.trim() || null,
              branch_status: b.branch_status,
              dine_in: b.dine_in,
              takeaway: b.takeaway,
              is_24_hours: b.is_24_hours,
              late_night: b.late_night,
            },
          });
        }
      }

      const draftTitle = isNew
        ? `Create Brand: ${nameEn.trim() || cleanSlug}`
        : `Update Brand: ${brand?.name_en || brand?.id}`;

      const savedDraft = await saveCatalogDraft({
        title: draftTitle,
        change_type: 'edit',
        target_entities: targetEntities,
      });

      onSaved(savedDraft.id);
    } catch (err) {
      setSaveError((err as Error).message || 'Failed to save brand draft.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in"
      onPaste={handlePaste}
    >
      <div
        className="bg-white rounded-3xl border border-stone-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-brand-red/10 text-brand-red">
              <Storefront size={22} weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 font-alexandria">
                  {isNew ? t('modalAddBrandTitle') : `${t('btnEditBrand')}: ${brand?.name_en || brand?.id}`}
                </h3>
                {isDirty && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    {t('labelUnsavedChanges')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {isNew
                  ? 'Add a new brand to the catalog and optionally register its branches.'
                  : `ID: ${brand?.id} - Changes stage safely as an isolated draft.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRequestClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: Scrollable Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {saveError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs">
              <WarningCircle size={18} className="shrink-0 text-rose-600" weight="fill" />
              <span>{saveError}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 1: Brand Information                              */}
          {/* ========================================================= */}
          <div className="p-4 md:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2.5">
              <span className="font-bold text-sm text-stone-900 font-alexandria">
                {t('sectionBrandInfo')}
              </span>
            </div>

            {/* Slug ID (Editable if new, Readonly if existing) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-stone-800">{t('labelBrandSlug')}</label>
                <input
                  type="text"
                  value={slugId}
                  disabled={!isNew}
                  onChange={(e) => setSlugId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="e.g. section-b"
                  className={`w-full p-2.5 rounded-xl border font-mono text-xs ${
                    isNew
                      ? 'bg-white border-stone-300 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red'
                      : 'bg-stone-100 border-stone-200 text-stone-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-stone-800">{t('labelBrandNameEn')}</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="Brand Name in English"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-stone-800">{t('labelBrandNameAr')}</label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="اسم العلامة بالعربي"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                />
              </div>
            </div>

            {/* Categories & Dining Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="block font-bold text-stone-800">{t('labelCategories')}</label>
                <input
                  type="text"
                  value={categories}
                  onChange={(e) => setCategories(e.target.value)}
                  placeholder="burger, american, fast_food"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-stone-800">{t('labelDiningMode')}</label>
                <select
                  value={diningMode}
                  onChange={(e) => setDiningMode(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl cursor-pointer"
                >
                  <option value="both">Both (Dine-in & Delivery)</option>
                  <option value="delivery_only">Delivery Only</option>
                  <option value="dine_in_only">Dine-in Only</option>
                </select>
              </div>
            </div>

            {/* Status, Research Use, Price Tier, Rating */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-stone-800">{t('colOperatingStatus')}</label>
                <select
                  value={operatingStatus}
                  onChange={(e) => setOperatingStatus(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl cursor-pointer"
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
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl cursor-pointer"
                >
                  <option value="production_ready">Production Ready</option>
                  <option value="usable_with_caution">Usable with Caution</option>
                  <option value="manual_review_only">Manual Review Only</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-stone-800">{t('labelPriceTier')}</label>
                <select
                  value={priceTier}
                  onChange={(e) => setPriceTier(e.target.value)}
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl cursor-pointer font-bold"
                >
                  <option value="$">$ (Inexpensive)</option>
                  <option value="$$">$$ (Moderate)</option>
                  <option value="$$$">$$$ (High End)</option>
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
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl font-mono"
                />
              </div>
            </div>

            {/* Signature Dishes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block font-bold text-stone-800">{t('labelSignatureDishEn')}</label>
                <input
                  type="text"
                  value={signatureDishEn}
                  onChange={(e) => setSignatureDishEn(e.target.value)}
                  placeholder="e.g. Classic Truffle Burger"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-stone-800">{t('labelSignatureDishAr')}</label>
                <input
                  type="text"
                  value={signatureDishAr}
                  onChange={(e) => setSignatureDishAr(e.target.value)}
                  placeholder="مثال: كلاسيك ترفل برجر"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                />
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 2: Brand Image                                    */}
          {/* ========================================================= */}
          <div className="p-4 md:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900 font-alexandria">
                  {t('sectionBrandImage')}
                </span>
                {isPendingRemoval && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                    {t('badgePendingRemoval')}
                  </span>
                )}
                {stagedImageUrl && !isPendingRemoval && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                    {t('badgeStagedImage')}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-stone-500 font-mono">
                {t('imageFormatsHint')}
              </span>
            </div>

            {imageUploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2 text-xs">
                <WarningCircle size={16} className="shrink-0 text-rose-600" weight="fill" />
                <span>{imageUploadError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Image Preview Box */}
              <div className="relative w-44 h-44 rounded-2xl border-2 border-stone-200 overflow-hidden bg-white shrink-0 flex items-center justify-center shadow-sm">
                {displayImageUrl ? (
                  <img
                    src={displayImageUrl}
                    alt={nameEn || 'Brand'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                    <ImageIcon size={40} className="mb-1 text-stone-300" />
                    <span className="text-[11px] font-semibold">No image</span>
                  </div>
                )}

                {isUploadingImage && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-brand-red font-semibold">
                    <CircleNotch size={28} className="animate-spin" />
                    <span className="text-[11px]">Uploading to staging...</span>
                  </div>
                )}
              </div>

              {/* Upload Dropzone & Controls */}
              <div className="flex-1 w-full space-y-3">
                <div
                  ref={dropzoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-brand-red bg-brand-red/5 scale-[1.01]'
                      : 'border-stone-300 hover:border-stone-400 bg-white'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="p-3 rounded-full bg-stone-100 text-stone-600">
                    <UploadSimple size={20} weight="bold" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-stone-800 text-xs">
                      {t('dropzoneImagePrompt')}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      JPG, PNG, or WebP up to 5 MB
                    </p>
                  </div>
                </div>

                {/* Image Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {displayImageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <Trash size={14} />
                      <span>{t('btnRemoveImage')}</span>
                    </button>
                  )}

                  {(isPendingRemoval || stagedImageUrl) && initialImageUrl && (
                    <button
                      type="button"
                      onClick={handleRevertImage}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 bg-white hover:bg-stone-50 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <ArrowCounterClockwise size={14} />
                      <span>{t('btnRevertImage')}</span>
                    </button>
                  )}

                  <div className="text-[11px] text-stone-400 italic ms-auto flex items-center gap-1">
                    <Info size={14} />
                    <span>Held in staging until draft publication.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 3: Branches (Optional)                            */}
          {/* ========================================================= */}
          <div className="p-4 md:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-stone-900 font-alexandria">
                  {t('sectionBranches')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-stone-200 text-stone-700">
                  {branches.length}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddBranch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-white hover:bg-stone-800 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <Plus size={14} weight="bold" />
                <span>{t('btnAddBranch')}</span>
              </button>
            </div>

            {branches.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-white border border-stone-200 text-stone-500 space-y-1">
                <Storefront size={28} className="mx-auto text-stone-300" />
                <p className="font-semibold text-xs">No branches configured for this brand.</p>
                <p className="text-[11px] text-stone-400">
                  Branch editing is completely optional. You can save brand details alone, or click "Add Branch" above.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {branches.map((b, idx) => (
                  <div
                    key={b.tempId}
                    className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-xs transition-all"
                  >
                    {/* Branch Summary Bar */}
                    <div className="p-3.5 flex items-center justify-between gap-3 bg-white hover:bg-stone-50/50">
                      <div
                        className="flex items-center gap-2.5 flex-1 cursor-pointer"
                        onClick={() => handleToggleBranchExpand(b.tempId)}
                      >
                        <button
                          type="button"
                          className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                        >
                          {b.isExpanded ? <CaretUp size={16} /> : <CaretDown size={16} />}
                        </button>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-stone-900 text-xs">
                            {b.branch_name_en || b.branch_name_ar || `Branch #${idx + 1}`}
                          </span>
                          <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full text-[10px] font-mono">
                            {b.district}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              b.branch_status === 'open'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {b.branch_status}
                          </span>
                          {b.isNew && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              New
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteBranch(b.tempId)}
                          className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Remove branch"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Inline Expandable Branch Form */}
                    {b.isExpanded && (
                      <div className="p-4 border-t border-stone-100 bg-stone-50/40 space-y-3.5 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block font-bold text-stone-800">
                              {t('labelBranchNameEn')}
                            </label>
                            <input
                              type="text"
                              value={b.branch_name_en}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'branch_name_en', e.target.value)
                              }
                              placeholder="e.g. Al Rawdah Branch"
                              className="w-full p-2 bg-white border border-stone-300 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block font-bold text-stone-800">
                              {t('labelBranchNameAr')}
                            </label>
                            <input
                              type="text"
                              value={b.branch_name_ar}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'branch_name_ar', e.target.value)
                              }
                              placeholder="مثال: فرع الروضة"
                              className="w-full p-2 bg-white border border-stone-300 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block font-bold text-stone-800">
                              {t('labelDistrict')}
                            </label>
                            <select
                              value={b.district}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'district', e.target.value)
                              }
                              className="w-full p-2 bg-white border border-stone-300 rounded-xl cursor-pointer"
                            >
                              {districts.map((d) => (
                                <option key={d} value={d}>
                                  {d}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block font-bold text-stone-800">
                              {t('labelBranchStatus')}
                            </label>
                            <select
                              value={b.branch_status}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'branch_status', e.target.value)
                              }
                              className="w-full p-2 bg-white border border-stone-300 rounded-xl cursor-pointer"
                            >
                              <option value="open">Open</option>
                              <option value="temporarily_closed">Temporarily Closed</option>
                              <option value="permanently_closed">Permanently Closed</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="block font-bold text-stone-800">
                              {t('labelAddressEn')}
                            </label>
                            <input
                              type="text"
                              value={b.address_en}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'address_en', e.target.value)
                              }
                              placeholder="Street name, landmark..."
                              className="w-full p-2 bg-white border border-stone-300 rounded-xl"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block font-bold text-stone-800">
                              {t('labelAddressAr')}
                            </label>
                            <input
                              type="text"
                              value={b.address_ar}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'address_ar', e.target.value)
                              }
                              placeholder="اسم الشارع، المعلم..."
                              className="w-full p-2 bg-white border border-stone-300 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block font-bold text-stone-800">
                              {t('labelLatitude')}
                            </label>
                            <input
                              type="number"
                              step="0.000001"
                              value={b.latitude}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'latitude', e.target.value)
                              }
                              placeholder="21.5432"
                              className="w-full p-2 bg-white border border-stone-300 rounded-xl font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block font-bold text-stone-800">
                              {t('labelLongitude')}
                            </label>
                            <input
                              type="number"
                              step="0.000001"
                              value={b.longitude}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'longitude', e.target.value)
                              }
                              placeholder="39.1728"
                              className="w-full p-2 bg-white border border-stone-300 rounded-xl font-mono"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block font-bold text-stone-800">
                              {t('labelGoogleMapsUrl')}
                            </label>
                            <input
                              type="url"
                              value={b.google_maps_url}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'google_maps_url', e.target.value)
                              }
                              placeholder="https://maps.google.com/..."
                              className="w-full p-2 bg-white border border-stone-300 rounded-xl font-mono"
                            />
                          </div>
                        </div>

                        {/* Service Flags */}
                        <div className="flex flex-wrap items-center gap-4 pt-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={b.dine_in}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'dine_in', e.target.checked)
                              }
                              className="rounded text-brand-red"
                            />
                            <span>{t('labelDineIn')}</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={b.takeaway}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'takeaway', e.target.checked)
                              }
                              className="rounded text-brand-red"
                            />
                            <span>{t('labelTakeaway')}</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={b.is_24_hours}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'is_24_hours', e.target.checked)
                              }
                              className="rounded text-brand-red"
                            />
                            <span>{t('label24Hours')}</span>
                          </label>

                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={b.late_night}
                              onChange={(e) =>
                                handleBranchChange(b.tempId, 'late_night', e.target.checked)
                              }
                              className="rounded text-brand-red"
                            />
                            <span>{t('labelLateNight')}</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Safe Change Set Workflow Notice */}
          <div className="p-4 bg-stone-100/70 border border-stone-200 rounded-2xl text-stone-600 text-[11px] leading-relaxed flex items-center gap-2.5">
            <Info size={18} className="shrink-0 text-stone-500" />
            <span>
              Saving creates or updates an isolated draft change set. The live catalog will not be modified until you preview and explicitly publish.
            </span>
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={handleRequestClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploadingImage}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold hover:bg-brand-red/90 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <CircleNotch size={15} className="animate-spin" />
              ) : (
                <Check size={15} weight="bold" />
              )}
              <span>{t('btnSaveAndPreview')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Discard Unsaved Changes Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl p-5 max-w-sm w-full space-y-3">
            <div className="flex items-center gap-2.5 text-amber-600 font-bold text-sm">
              <WarningCircle size={20} weight="fill" />
              <span>{t('confirmDiscardTitle')}</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {t('confirmDiscardDesc')}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                {t('btnKeepEditing')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer shadow-sm"
              >
                {t('btnDiscardChanges')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
