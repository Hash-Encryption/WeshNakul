import React, { useState, useEffect, useCallback } from 'react';
import {
  ChartBar,
  Users,
  Door,
  ArrowsLeftRight,
  Trophy,
  NavigationArrow,
  ShoppingBag,
  ArrowClockwise,
  SignOut,
  ArrowLeft,
  CircleNotch,
  WarningCircle,
  ShieldCheck,
  Funnel,
  TrendUp,
} from '@phosphor-icons/react';
import {
  fetchAdminAnalytics,
  fetchAdminDeepAnalytics,
  downloadAdminExport,
  adminLogout,
} from '../../services/adminService';
import { useAdminLocale, AdminLanguageToggle } from '../../context/AdminLocaleContext';
import { DeepAnalyticsView } from './DeepAnalyticsView';
import { AlgorithmHealthView } from './AlgorithmHealthView';
import { CatalogHistoryView } from './CatalogHistoryView';
import { CatalogControlsView } from './CatalogControlsView';
import { AlgorithmControlsView } from './AlgorithmControlsView';
import type {
  AdminAnalyticsResponse,
  AdminDeepAnalyticsResponse,
  AdminDeepFilters,
  AdminUser,
  TimeRangeFilter,
} from '../../types/admin';

export type AdminDashboardTab = 'overview' | 'catalog_controls' | 'algorithm_controls' | 'deep' | 'algorithm' | 'catalog';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
  onExit: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onExit,
}) => {
  const { t, isRTL, formatSaudiTime } = useAdminLocale();
  const [activeTab, setActiveTab] = useState<AdminDashboardTab>('overview');
  const [range, setRange] = useState<TimeRangeFilter>('24h');
  const [data, setData] = useState<AdminAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Phase 3 Deep Analytics State
  const [deepData, setDeepData] = useState<AdminDeepAnalyticsResponse | null>(null);
  const [deepFilters, setDeepFilters] = useState<AdminDeepFilters>({
    category: null,
    district: null,
    eating_mode: null,
    room_mode: null,
    offset: 0,
    limit: 50,
  });
  const [isDeepLoading, setIsDeepLoading] = useState<boolean>(false);
  const [deepError, setDeepError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const loadData = useCallback(async (selectedRange: TimeRangeFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAdminAnalytics(selectedRange);
      setData(response);
    } catch (err) {
      console.error('Failed to load admin analytics', err);
      setError((err as Error).message || 'Failed to fetch analytics data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadDeepData = useCallback(
    async (selectedRange: TimeRangeFilter, filters: AdminDeepFilters) => {
      setIsDeepLoading(true);
      setDeepError(null);
      try {
        const response = await fetchAdminDeepAnalytics({
          range: selectedRange,
          category: filters.category,
          district: filters.district,
          eating_mode: filters.eating_mode,
          room_mode: filters.room_mode,
          limit: filters.limit || 50,
          offset: filters.offset || 0,
        });
        setDeepData(response);
      } catch (err) {
        console.error('Failed to load deep analytics', err);
        setDeepError((err as Error).message || 'Failed to fetch deep analytics data.');
      } finally {
        setIsDeepLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadData(range);
  }, [range, loadData]);

  useEffect(() => {
    if (activeTab !== 'overview') {
      loadDeepData(range, deepFilters);
    }
  }, [activeTab, range, deepFilters, loadDeepData]);

  const handleFilterChange = (newFilters: Partial<AdminDeepFilters>) => {
    setDeepFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportNotice(null);
    try {
      const { filename, blob, isTruncated } = await downloadAdminExport({
        range,
        category: deepFilters.category || null,
        district: deepFilters.district || null,
        eating_mode: deepFilters.eating_mode || null,
        room_mode: deepFilters.room_mode || null,
      });

      if (isTruncated) {
        setExportNotice(t('exportTruncatedWarning'));
      }

      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to export CSV', err);
      setExportNotice((err as Error).message || 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogoutClick = async () => {
    await adminLogout();
    onLogout();
  };

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('success') || eventType.includes('matched')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (eventType.includes('failed') || eventType.includes('failure')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (eventType.includes('swipe') || eventType.includes('minigame')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-stone-50 text-stone-700 border-stone-200';
  };

  const summary = data?.summary;
  const breakdowns = data?.breakdowns;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 selection:bg-brand-redSoft">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-red text-white flex items-center justify-center font-bold text-lg shadow-sm">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-stone-900 tracking-tight font-alexandria">
                {t('portalTitle')}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                {t('phaseBadge')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('liveGateway')}
              </span>
              <span>•</span>
              <span className="truncate max-w-[200px]" title={user.email}>
                {user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Controls: Language Toggle, Time Filter, Refresh, Exit & Logout */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Admin Language Toggle */}
          <AdminLanguageToggle />

          {/* Time range pills */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
            {(['24h', '7d', '30d', 'all'] as TimeRangeFilter[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  range === r
                    ? 'bg-white text-stone-900 shadow-sm font-bold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {r === '24h'
                  ? t('range24h')
                  : r === '7d'
                  ? t('range7d')
                  : r === '30d'
                  ? t('range30d')
                  : t('rangeAll')}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => loadData(range)}
            disabled={isLoading}
            className="p-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            title={t('refreshTooltip')}
          >
            <ArrowClockwise size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {/* Return to App */}
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors cursor-pointer shadow-sm"
          >
            <ArrowLeft size={14} className={isRTL ? 'rotate-180' : ''} />
            <span className="hidden sm:inline">{t('backToApp')}</span>
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogoutClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-xs font-semibold text-stone-700 transition-colors cursor-pointer border border-stone-200"
          >
            <SignOut size={14} className={isRTL ? 'rotate-180' : ''} />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </header>

      {/* Sub-Navigation Tabs */}
      <nav className="bg-white border-b border-stone-200 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-4 overflow-x-auto">
          {[
            { id: 'overview', label: t('tabOverview') },
            { id: 'catalog_controls', label: t('tabCatalogControls') },
            { id: 'algorithm_controls', label: t('tabAlgorithmControls') },
            { id: 'deep', label: t('tabDeepAnalytics') },
            { id: 'algorithm', label: t('tabAlgorithmHealth') },
            { id: 'catalog', label: t('tabCatalogHistory') },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as AdminDashboardTab)}
              className={`py-3.5 px-3 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-brand-red text-brand-red'
                  : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Error Notification */}
        {(error || (activeTab !== 'overview' && deepError)) && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <WarningCircle size={24} className="shrink-0 mt-0.5 text-rose-600" weight="fill" />
            <div className="flex-1">
              <h3 className="font-bold text-sm">{t('errorTitle')}</h3>
              <p className="text-xs text-rose-700 mt-1">{error || deepError}</p>
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'overview') {
                    loadData(range);
                  } else {
                    loadDeepData(range, deepFilters);
                  }
                }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                {t('retry')}
              </button>
            </div>
          </div>
        )}

        {/* Loading State Spinner for Initial Overview */}
        {activeTab === 'overview' && isLoading && !data && (
          <div className="py-24 text-center">
            <CircleNotch size={40} className="animate-spin text-brand-red mx-auto mb-4" />
            <p className="text-sm font-semibold text-stone-600 font-alexandria">
              {t('loadingTitle')}
            </p>
            <p className="text-xs text-stone-400 mt-1">{t('loadingSubtitle')}</p>
          </div>
        )}

        {/* Loading State Spinner for Phase 3 Views */}
        {activeTab !== 'overview' && isDeepLoading && !deepData && (
          <div className="py-24 text-center">
            <CircleNotch size={40} className="animate-spin text-brand-red mx-auto mb-4" />
            <p className="text-sm font-semibold text-stone-600 font-alexandria">
              {t('loadingTitle')}
            </p>
            <p className="text-xs text-stone-400 mt-1">{t('loadingSubtitle')}</p>
          </div>
        )}

        {/* Overview Tab View */}
        {activeTab === 'overview' && data && summary && breakdowns && (
          <>
            {/* Top KPI Metric Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Sessions */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{t('kpiSessions')}</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ChartBar size={18} weight="bold" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-alexandria">
                  {summary.total_sessions.toLocaleString()}
                </div>
                <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                  <span>{t('kpiUniqueVisitors')}</span>
                  <strong className="text-stone-700 font-bold">{summary.unique_visitors.toLocaleString()}</strong>
                </div>
              </div>

              {/* Rooms Created */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{t('kpiRoomsCreated')}</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Door size={18} weight="bold" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-alexandria">
                  {summary.rooms_created_success.toLocaleString()}
                </div>
                <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                  <span>{t('kpiFailed')}</span>
                  <span className={summary.rooms_created_failed > 0 ? 'text-rose-600 font-bold' : 'text-stone-600'}>
                    {summary.rooms_created_failed.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Swipes */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{t('kpiSwipes')}</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ArrowsLeftRight size={18} weight="bold" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-alexandria">
                  {summary.total_swipes.toLocaleString()}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  {summary.total_revotes > 0 ? (
                    <span className="text-amber-600 font-medium">{t('kpiRevotes', { count: summary.total_revotes })}</span>
                  ) : (
                    <span>{t('kpiNoRevotes')}</span>
                  )}
                </div>
              </div>

              {/* Matches & Winners */}
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{t('kpiWinningMatches')}</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Trophy size={18} weight="bold" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-alexandria">
                  {summary.total_matches.toLocaleString()}
                </div>
                <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                  <span>{t('kpiMinigames')}</span>
                  <strong className="text-stone-700">{summary.total_minigames_completed}</strong>
                </div>
              </div>
            </div>

            {/* Sub-KPI Row (Outbound actions & integrity) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                <div className="text-xs text-stone-500">{t('kpiMapsClicks')}</div>
                <div className="text-lg font-bold text-stone-800 mt-1 flex items-center gap-1.5">
                  <NavigationArrow size={16} className="text-brand-red" />
                  <span>{summary.total_maps_clicks.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                <div className="text-xs text-stone-500">{t('kpiDeliveryClicks')}</div>
                <div className="text-lg font-bold text-stone-800 mt-1 flex items-center gap-1.5">
                  <ShoppingBag size={16} className="text-emerald-600" />
                  <span>{summary.total_delivery_clicks.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                <div className="text-xs text-stone-500">{t('kpiRoomsJoined')}</div>
                <div className="text-lg font-bold text-stone-800 mt-1 flex items-center gap-1.5">
                  <Users size={16} className="text-blue-600" />
                  <span>{summary.rooms_joined_success.toLocaleString()}</span>
                  {summary.rooms_joined_failed > 0 && (
                    <span className="text-xs text-rose-600 font-normal">
                      {t('kpiRoomsJoinedFailed', { count: summary.rooms_joined_failed })}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                <div className="text-xs text-stone-500">{t('kpiTechFailures')}</div>
                <div className="text-lg font-bold text-stone-800 mt-1 flex items-center gap-1.5">
                  <WarningCircle
                    size={16}
                    className={summary.total_technical_failures > 0 ? 'text-rose-600' : 'text-stone-400'}
                  />
                  <span className={summary.total_technical_failures > 0 ? 'text-rose-600' : 'text-stone-700'}>
                    {summary.total_technical_failures.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 1: Activity Timeline */}
            <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-stone-900 font-alexandria flex items-center gap-2">
                    <TrendUp size={20} className="text-brand-red" />
                    <span>{t('timelineTitle')}</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {t('timelineSubtitle')}
                  </p>
                </div>
              </div>

              {breakdowns.activity_timeline.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-stone-100">
                  {t('timelineEmpty')}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {breakdowns.activity_timeline.slice(-9).map((point, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                        <div className="font-semibold text-stone-700 mb-2 flex items-center justify-between">
                          <span>{formatSaudiTime(point.bucket_time)}</span>
                          <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-700 font-bold">
                            {t('eventsCount', {
                              count:
                                point.event_count ??
                                point.session_count + point.room_create_count + point.swipe_count,
                            })}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-stone-400 block">{t('timelineSessions')}</span>
                            <span className="font-bold text-blue-600">{point.session_count}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">{t('timelineRooms')}</span>
                            <span className="font-bold text-emerald-600">{point.room_create_count}</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block">{t('timelineSwipes')}</span>
                            <span className="font-bold text-amber-600">{point.swipe_count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Section 2: Two Column Layout (Categories & Modes + Decision/Swipes) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category & Mode Breakdown */}
              <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-stone-900 font-alexandria flex items-center gap-2">
                    <Funnel size={20} className="text-brand-red" />
                    <span>{t('modesCategoriesTitle')}</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">{t('modesCategoriesSubtitle')}</p>
                </div>

                {/* Room Modes */}
                <div>
                  <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5">
                    {t('roomModeHeading')}
                  </h3>
                  {breakdowns.by_room_mode.length === 0 ? (
                    <div className="text-xs text-stone-400 bg-stone-50 p-3 rounded-lg">{t('noDataRecorded')}</div>
                  ) : (
                    <div className="space-y-2">
                      {breakdowns.by_room_mode.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-stone-50">
                          <span className="font-medium text-stone-800 capitalize">
                            {item.room_mode === 'food'
                              ? t('modeFood')
                              : item.room_mode === 'breakfast'
                              ? t('modeBreakfast')
                              : item.room_mode === 'cafes'
                              ? t('modeCafes')
                              : item.room_mode}
                          </span>
                          <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Eating Modes */}
                <div>
                  <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5">
                    {t('eatingModeHeading')}
                  </h3>
                  {breakdowns.by_eating_mode.length === 0 ? (
                    <div className="text-xs text-stone-400 bg-stone-50 p-3 rounded-lg">{t('noDataRecorded')}</div>
                  ) : (
                    <div className="space-y-2">
                      {breakdowns.by_eating_mode.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-stone-50">
                          <span className="font-medium text-stone-800 capitalize">
                            {item.eating_mode === 'delivery'
                              ? t('eatDelivery')
                              : item.eating_mode === 'dine_in'
                              ? t('eatDineIn')
                              : t('eatAny')}
                          </span>
                          <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Categories */}
                <div>
                  <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5">
                    {t('foodCategoriesHeading')}
                  </h3>
                  {breakdowns.by_category.length === 0 ? (
                    <div className="text-xs text-stone-400 bg-stone-50 p-3 rounded-lg">{t('noCategoriesRecorded')}</div>
                  ) : (
                    <div className="space-y-2">
                      {breakdowns.by_category.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-stone-50">
                          <span className="font-medium text-stone-800 capitalize">{item.category}</span>
                          <span className="font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Swipes & Decision Winners */}
              <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-stone-900 font-alexandria flex items-center gap-2">
                    <Trophy size={20} className="text-amber-500" />
                    <span>{t('swipesWinnersTitle')}</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">{t('swipesWinnersSubtitle')}</p>
                </div>

                {/* Swipe Votes Breakdown */}
                <div>
                  <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5">
                    {t('votePolarityHeading')}
                  </h3>
                  {breakdowns.swipes_by_vote.length === 0 ? (
                    <div className="text-xs text-stone-400 bg-stone-50 p-3 rounded-lg">{t('noSwipesRecorded')}</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {breakdowns.swipes_by_vote.map((voteItem, idx) => {
                        const isYes = voteItem.vote === 'YES';
                        const isNo = voteItem.vote === 'NO';
                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border ${
                              isYes
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                : isNo
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-stone-50 border-stone-200 text-stone-800'
                            }`}
                          >
                            <span className="text-[11px] font-semibold block mb-1">
                              {isYes ? t('voteYes') : isNo ? t('voteNo') : t('voteLater')}
                            </span>
                            <span className="text-lg font-bold">{voteItem.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Top Winning Restaurants */}
                <div>
                  <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5">
                    {t('topWinnersHeading')}
                  </h3>
                  {breakdowns.top_winning_restaurants.length === 0 ? (
                    <div className="text-xs text-stone-400 bg-stone-50 p-3 rounded-lg">
                      {t('noWinnersResolved')}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {breakdowns.top_winning_restaurants.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-stone-50">
                          <span className="font-medium text-stone-800 truncate max-w-[240px]">
                            {item.restaurant_id}
                          </span>
                          <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {t('winsCount', { count: item.wins_count })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mini-Games Breakdown */}
                <div>
                  <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-2.5">
                    {t('minigamesHeading')}
                  </h3>
                  {breakdowns.minigames.length === 0 ? (
                    <div className="text-xs text-stone-400 bg-stone-50 p-3 rounded-lg">
                      {t('noMinigamesRecorded')}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {breakdowns.minigames.map((game, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-stone-50">
                          <span className="font-semibold text-stone-800 capitalize">
                            {game.game_type === 'captain_roulette'
                              ? t('gameCaptainRoulette')
                              : game.game_type === 'shuffle_cards'
                              ? t('gameShuffleCards')
                              : game.game_type === 'emoji_clash'
                              ? t('gameEmojiClash')
                              : game.game_type}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-stone-500 text-[11px]">
                              {t('minigameStarted', { count: game.started_count })}
                            </span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                              {t('minigameCompleted', { count: game.completed_count })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Section 3: Recent Events Audit Stream */}
            <section className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-stone-900 font-alexandria flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-600" />
                    <span>{t('recentEventsTitle')}</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {t('recentEventsSubtitle')}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
                  {t('eventsCount', { count: data.recent_events.length })}
                </span>
              </div>

              {data.recent_events.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400 bg-stone-50 rounded-xl">
                  {t('recentEventsEmpty')}
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full text-start text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500 font-semibold">
                        <th className="py-2.5 px-3">{t('colTimeKsa')}</th>
                        <th className="py-2.5 px-3">{t('colEventType')}</th>
                        <th className="py-2.5 px-3">{t('colRoomCode')}</th>
                        <th className="py-2.5 px-3">{t('colCategory')}</th>
                        <th className="py-2.5 px-3">{t('colEatingMode')}</th>
                        <th className="py-2.5 px-3">{t('colRoomMode')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {data.recent_events.map((ev) => (
                        <tr key={ev.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-2 px-3 whitespace-nowrap text-stone-500 font-mono text-[11px]">
                            {formatSaudiTime(ev.event_time)}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEventTypeColor(
                                ev.event_type
                              )}`}
                            >
                              {ev.event_type}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-mono font-bold text-stone-900">
                            {ev.room_code || '—'}
                          </td>
                          <td className="py-2 px-3 text-stone-600 capitalize">
                            {ev.category || '—'}
                          </td>
                          <td className="py-2 px-3 text-stone-600 capitalize">
                            {ev.eating_mode === 'delivery'
                              ? t('eatDelivery')
                              : ev.eating_mode === 'dine_in'
                              ? t('eatDineIn')
                              : ev.eating_mode || '—'}
                          </td>
                          <td className="py-2 px-3 text-stone-600 capitalize">
                            {ev.room_mode === 'food'
                              ? t('modeFood')
                              : ev.room_mode === 'breakfast'
                              ? t('modeBreakfast')
                              : ev.room_mode === 'cafes'
                              ? t('modeCafes')
                              : ev.room_mode || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}

        {/* Phase 3 Deep Analytics Tab View */}
        {activeTab === 'deep' && (
          <DeepAnalyticsView
            data={deepData}
            isLoading={isDeepLoading}
            filters={deepFilters}
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            isExporting={isExporting}
            exportNotice={exportNotice}
            onDismissNotice={() => setExportNotice(null)}
          />
        )}

        {/* Phase 4 Catalog Controls Tab View */}
        {activeTab === 'catalog_controls' && (
          <CatalogControlsView />
        )}

        {/* Phase 5 Algorithm Controls Tab View */}
        {activeTab === 'algorithm_controls' && (
          <AlgorithmControlsView />
        )}

        {/* Phase 3 Algorithm Health Tab View */}
        {activeTab === 'algorithm' && (
          <AlgorithmHealthView
            health={deepData?.algorithm_health || null}
            isLoading={isDeepLoading}
          />
        )}

        {/* Phase 3 Catalog Change History Tab View */}
        {activeTab === 'catalog' && (
          <CatalogHistoryView
            history={deepData?.catalog_history || []}
            isLoading={isDeepLoading}
          />
        )}
      </main>
    </div>
  );
};
