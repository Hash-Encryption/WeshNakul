import React from 'react';
import {
  Funnel,
  DownloadSimple,
  CircleNotch,
  WarningCircle,
  CaretLeft,
  CaretRight,
  Eye,
  HandPointing,
  ThumbsUp,
  Trophy,
  NavigationArrow,
  ShoppingBag,
  WarningOctagon,
  SignOut,
} from '@phosphor-icons/react';
import { useAdminLocale } from '../../context/AdminLocaleContext';
import { JEDDAH_DISTRICT_LIST } from '../../data/jeddahDistricts';
import type { AdminDeepAnalyticsResponse, AdminDeepFilters } from '../../types/admin';

interface DeepAnalyticsViewProps {
  data: AdminDeepAnalyticsResponse | null;
  isLoading: boolean;
  filters: AdminDeepFilters;
  onFilterChange: (filters: Partial<AdminDeepFilters>) => void;
  onExport: () => Promise<void>;
  isExporting: boolean;
  exportNotice: string | null;
  onDismissNotice: () => void;
}

const CATEGORIES = [
  'burger',
  'shawarma',
  'pizza',
  'grills',
  'italian',
  'seafood',
  'breakfast',
  'dessert',
  'cafe',
];

const EATING_MODES = [
  { id: 'dine_in', labelKey: 'eatDineIn' },
  { id: 'delivery', labelKey: 'eatDelivery' },
  { id: 'any', labelKey: 'eatAny' },
] as const;

const ROOM_MODES = [
  { id: 'quick_round', labelKey: 'modeFood' },
  { id: 'full_squad', labelKey: 'modeFood' },
  { id: 'cafes', labelKey: 'modeCafes' },
] as const;

export const DeepAnalyticsView: React.FC<DeepAnalyticsViewProps> = ({
  data,
  isLoading,
  filters,
  onFilterChange,
  onExport,
  isExporting,
  exportNotice,
  onDismissNotice,
}) => {
  const { t, isRTL, formatSaudiTime } = useAdminLocale();

  const kpis = data?.kpis;
  const pagination = data?.pagination;
  const events = data?.events || [];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ category: e.target.value || null, offset: 0 });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ district: e.target.value || null, offset: 0 });
  };

  const handleEatingModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ eating_mode: e.target.value || null, offset: 0 });
  };

  const handleRoomModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ room_mode: e.target.value || null, offset: 0 });
  };

  const handleResetFilters = () => {
    onFilterChange({
      category: null,
      district: null,
      eating_mode: null,
      room_mode: null,
      offset: 0,
    });
  };

  const currentOffset = pagination?.offset || 0;
  const currentLimit = pagination?.limit || 50;
  const totalEvents = pagination?.total || 0;

  const handlePrevPage = () => {
    const newOffset = Math.max(0, currentOffset - currentLimit);
    onFilterChange({ offset: newOffset });
  };

  const handleNextPage = () => {
    if (pagination?.has_more) {
      onFilterChange({ offset: currentOffset + currentLimit });
    }
  };

  const fromRow = totalEvents === 0 ? 0 : currentOffset + 1;
  const toRow = Math.min(currentOffset + currentLimit, totalEvents);

  return (
    <div className="space-y-6">
      {/* Filters & Actions Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-800">
            <Funnel size={18} className="text-brand-red" />
            <span>{t('filterApply')}</span>
          </div>

          <div className="flex items-center gap-2">
            {(filters.category || filters.district || filters.eating_mode || filters.room_mode) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
              >
                {t('filterReset')}
              </button>
            )}

            <button
              type="button"
              onClick={onExport}
              disabled={isExporting || isLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <DownloadSimple size={14} />
              )}
              <span>{isExporting ? t('exporting') : t('exportCsv')}</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              {t('colCategory')}
            </label>
            <select
              value={filters.category || ''}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red cursor-pointer"
            >
              <option value="">{t('filterAllCategories')}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* District Filter (Allowlisted Jeddah Municipal Districts) */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              {t('filterAllDistricts')}
            </label>
            <select
              value={filters.district || ''}
              onChange={handleDistrictChange}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red cursor-pointer"
            >
              <option value="">{t('filterAllDistricts')}</option>
              {JEDDAH_DISTRICT_LIST.map((d) => (
                <option key={d.id} value={d.id}>
                  {isRTL ? d.nameAr : d.nameEn} ({d.id})
                </option>
              ))}
            </select>
          </div>

          {/* Eating Mode Filter */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              {t('colEatingMode')}
            </label>
            <select
              value={filters.eating_mode || ''}
              onChange={handleEatingModeChange}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red cursor-pointer"
            >
              <option value="">{t('filterAllEatingModes')}</option>
              {EATING_MODES.map((em) => (
                <option key={em.id} value={em.id}>
                  {t(em.labelKey as any)}
                </option>
              ))}
            </select>
          </div>

          {/* Room Mode Filter */}
          <div>
            <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              {t('colRoomMode')}
            </label>
            <select
              value={filters.room_mode || ''}
              onChange={handleRoomModeChange}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red cursor-pointer"
            >
              <option value="">{t('filterAllRoomModes')}</option>
              {ROOM_MODES.map((rm) => (
                <option key={rm.id} value={rm.id}>
                  {rm.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Export Truncation Notice Banner */}
        {exportNotice && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <WarningCircle size={18} className="shrink-0 text-amber-600" />
              <span>{exportNotice}</span>
            </div>
            <button
              type="button"
              onClick={onDismissNotice}
              className="font-bold underline cursor-pointer ml-3 text-amber-900"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Deep Analytics KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Impressions Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('kpiCardImpressions')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Eye size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-alexandria">
            {kpis ? kpis.total_card_impressions.toLocaleString() : '—'}
          </div>
          <p className="text-[11px] text-stone-500">
            {t('kpiCandidatesGenerated')}:{' '}
            <strong className="text-stone-700">
              {kpis ? kpis.total_candidates_generated.toLocaleString() : '—'}
            </strong>
          </p>
        </div>

        {/* Approval Rate Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('kpiApprovalRate')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ThumbsUp size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 font-alexandria">
            {kpis && kpis.approval_rate_pct !== null ? `${kpis.approval_rate_pct}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-stone-500">
            <span className="font-semibold text-stone-600">{t('kpiApprovalFormula')}</span> (YES:{' '}
            {kpis?.total_yes_votes || 0} / Total: {kpis?.total_swipes || 0})
          </p>
        </div>

        {/* Exposure to YES Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('kpiExposureToYes')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <HandPointing size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 font-alexandria">
            {kpis && kpis.exposure_to_yes_pct !== null ? `${kpis.exposure_to_yes_pct}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-stone-500">
            <span className="font-semibold text-stone-600">{t('kpiExposureFormula')}</span> (YES:{' '}
            {kpis?.total_yes_votes || 0} / Impr: {kpis?.total_card_impressions || 0})
          </p>
        </div>

        {/* Attributable Matches Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('kpiMatches')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 font-alexandria">
            {kpis ? kpis.total_matches.toLocaleString() : '—'}
          </div>
          <p className="text-[11px] text-stone-500">
            Revotes: {kpis?.total_revotes || 0} • Mini-Games:{' '}
            {kpis?.total_minigames_completed || 0}
          </p>
        </div>
      </div>

      {/* Sub-KPI Row (Clicks, Exits & Failures) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <NavigationArrow size={14} className="text-sky-600" />
            <span>{t('kpiMapsClicks')}</span>
          </div>
          <div className="text-lg font-bold text-stone-900 mt-1">
            {kpis?.total_maps_clicks || 0}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShoppingBag size={14} className="text-amber-600" />
            <span>{t('kpiDeliveryClicks')}</span>
          </div>
          <div className="text-lg font-bold text-stone-900 mt-1">
            {kpis?.total_delivery_clicks || 0}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <SignOut size={14} className="text-stone-600" />
            <span>{t('kpiExplicitExits')}</span>
          </div>
          <div className="text-lg font-bold text-stone-900 mt-1">
            {kpis?.total_explicit_exits || 0}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-3.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <WarningOctagon size={14} className="text-rose-600" />
            <span>{t('kpiTechnicalFailures')}</span>
          </div>
          <div className="text-lg font-bold text-rose-600 mt-1">
            {kpis?.total_technical_failures || 0}
          </div>
        </div>
      </div>

      {/* Paginated Filtered Event Stream */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-stone-900 font-alexandria">
              {t('recentEventsTitle')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">{t('recentEventsSubtitle')}</p>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-stone-600">
              {t('pageShowing')
                .replace('{from}', String(fromRow))
                .replace('{to}', String(toRow))
                .replace('{total}', String(totalEvents))}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentOffset === 0 || isLoading}
                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 cursor-pointer"
                title={t('pagePrev')}
              >
                <CaretLeft size={14} className={isRTL ? 'rotate-180' : ''} />
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={!pagination?.has_more || isLoading}
                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 cursor-pointer"
                title={t('pageNext')}
              >
                <CaretRight size={14} className={isRTL ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">
            {t('recentEventsEmpty')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                  <th className="py-3 px-4">{t('colTimeKsa')}</th>
                  <th className="py-3 px-4">{t('colEventType')}</th>
                  <th className="py-3 px-4">{t('colCategory')}</th>
                  <th className="py-3 px-4">{t('colRestaurant')}</th>
                  <th className="py-3 px-4">{t('filterAllDistricts')}</th>
                  <th className="py-3 px-4">{t('colRoomMode')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {events.map((ev) => {
                  const p = (ev.payload || {}) as Record<string, unknown>;
                  const targetEntity = String(p.restaurantId || p.outcomeRestaurantId || '—');
                  const branchId = p.branchId ? ` (${p.branchId})` : '';

                  return (
                    <tr key={ev.id || ev.event_id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                        {formatSaudiTime(ev.event_time)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          {ev.event_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-700">{ev.category || '—'}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-stone-800">
                        {targetEntity}
                        {branchId && <span className="text-stone-400 font-sans">{branchId}</span>}
                      </td>
                      <td className="py-3 px-4 text-stone-600">{ev.district || '—'}</td>
                      <td className="py-3 px-4 text-stone-600">{ev.room_mode || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
