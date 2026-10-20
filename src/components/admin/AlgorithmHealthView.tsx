import React from 'react';
import {
  Cpu,
  Warning,
  CheckCircle,
  Eye,
  Trophy,
  ChartBar,
} from '@phosphor-icons/react';
import { useAdminLocale } from '../../context/AdminLocaleContext';
import type { BrandMetricRow, AlgorithmHealthSummary, ResolutionMethodCount } from '../../types/admin';

interface AlgorithmHealthViewProps {
  health: {
    summary: AlgorithmHealthSummary;
    brands: BrandMetricRow[];
    resolution_methods: ResolutionMethodCount[];
  } | null;
  isLoading: boolean;
}

export const AlgorithmHealthView: React.FC<AlgorithmHealthViewProps> = ({
  health,
  isLoading,
}) => {
  const { t } = useAdminLocale();

  const summary = health?.summary;
  const brands = health?.brands || [];
  const resolutionMethods = health?.resolution_methods || [];

  // HHI Classification
  const hhi = summary?.hhi_concentration_index || 0;
  let hhiBadge = {
    label: t('hhiHealthy'),
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  if (hhi > 2500) {
    hhiBadge = {
      label: t('hhiHigh'),
      color: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  } else if (hhi >= 1500) {
    hhiBadge = {
      label: t('hhiModerate'),
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }

  return (
    <div className="space-y-6">
      {/* Overview Diagnostic Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={20} className="text-brand-red" />
            <h2 className="text-base font-bold text-stone-900 font-alexandria">
              {t('algoTitle')}
            </h2>
          </div>
          {isLoading && (
            <span className="text-xs font-semibold text-stone-400 animate-pulse">Loading...</span>
          )}
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          {t('algoSubtitle')}
        </p>
      </div>

      {/* Exposure Concentration Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* HHI Concentration Index */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('hhiIndex')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <ChartBar size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-alexandria">
            {hhi.toFixed(1)}
          </div>
          <div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${hhiBadge.color}`}
            >
              {hhiBadge.label}
            </span>
          </div>
        </div>

        {/* Top Brand Impression Share */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('topBrandShare')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Eye size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-alexandria">
            {summary ? `${summary.top_brand_impression_share_pct.toFixed(1)}%` : '—'}
          </div>
          <p className="text-[11px] text-stone-500">
            Share of total card impressions
          </p>
        </div>

        {/* Distinct Brands Displayed */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('distinctBrands')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-alexandria">
            {summary ? summary.distinct_brands_shown : '—'}
          </div>
          <p className="text-[11px] text-stone-500">
            Total unique restaurant brands
          </p>
        </div>

        {/* Total Impressions */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {t('kpiCardImpressions')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Trophy size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 font-alexandria">
            {summary ? summary.total_impressions.toLocaleString() : '—'}
          </div>
          <p className="text-[11px] text-stone-500">
            Denominator for exposure share
          </p>
        </div>
      </div>

      {/* Winner Resolution Methods Distribution */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-sm text-stone-900 font-alexandria">
            {t('resolutionBreakdown')}
          </h3>
          <p className="text-xs text-stone-500">{t('resolutionBreakdownDesc')}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {resolutionMethods.length === 0 ? (
            <div className="col-span-full py-4 text-center text-xs text-stone-400">
              {t('noWinnersResolved')}
            </div>
          ) : (
            resolutionMethods.map((rm) => (
              <div
                key={rm.method}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-center space-y-1"
              >
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block truncate">
                  {rm.method}
                </span>
                <span className="text-lg font-black text-stone-900 font-alexandria block">
                  {rm.count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Brand Performance Table & Low-Confidence Flags */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden space-y-0">
        <div className="p-5 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-stone-900 font-alexandria">
              {t('brandPerformance')}
            </h3>
            <p className="text-xs text-amber-700 font-medium mt-0.5">
              ⚠️ {t('brandTableDesc')}
            </p>
          </div>
        </div>

        {brands.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">
            {t('noBrandsFound')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                  <th className="py-3 px-4">{t('colRestaurant')}</th>
                  <th className="py-3 px-4">{t('colCandidates')}</th>
                  <th className="py-3 px-4">{t('colImpressions')}</th>
                  <th className="py-3 px-4">{t('colYesNoLater')}</th>
                  <th className="py-3 px-4">{t('colApprovalRate')}</th>
                  <th className="py-3 px-4">{t('colExposureRate')}</th>
                  <th className="py-3 px-4">{t('colWins')}</th>
                  <th className="py-3 px-4">{t('colConfidence')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {brands.map((b) => (
                  <tr key={b.restaurant_id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Brand ID */}
                    <td className="py-3 px-4 font-mono text-[11px] font-bold text-stone-900 whitespace-nowrap">
                      {b.restaurant_id}
                    </td>

                    {/* Candidates Generated */}
                    <td className="py-3 px-4 text-stone-600">{b.candidate_count}</td>

                    {/* Impressions Displayed */}
                    <td className="py-3 px-4 font-bold text-stone-800">{b.impression_count}</td>

                    {/* Vote breakdown: YES / NO / LATER */}
                    <td className="py-3 px-4 text-stone-600">
                      <span className="text-emerald-700 font-bold">{b.yes_votes}</span> /{' '}
                      <span className="text-rose-700">{b.no_votes}</span> /{' '}
                      <span className="text-amber-700">{b.later_votes}</span>
                    </td>

                    {/* Approval Rate: YES / Total Votes */}
                    <td className="py-3 px-4 font-semibold text-stone-800">
                      {b.approval_rate_pct !== null ? `${b.approval_rate_pct}%` : 'N/A'}{' '}
                      <span className="text-[10px] text-stone-400 font-normal">
                        ({b.yes_votes}/{b.total_votes})
                      </span>
                    </td>

                    {/* Exposure to YES: YES / Impressions */}
                    <td className="py-3 px-4 font-semibold text-purple-700">
                      {b.exposure_to_yes_pct !== null ? `${b.exposure_to_yes_pct}%` : 'N/A'}{' '}
                      <span className="text-[10px] text-stone-400 font-normal">
                        ({b.yes_votes}/{b.impression_count})
                      </span>
                    </td>

                    {/* Wins & Win Rate */}
                    <td className="py-3 px-4 text-amber-700 font-bold">
                      {b.match_wins}{' '}
                      {b.win_rate_pct !== null && (
                        <span className="text-[10px] text-stone-500 font-normal">
                          ({b.win_rate_pct}%)
                        </span>
                      )}
                    </td>

                    {/* Confidence Status Badge (< 20 check) */}
                    <td className="py-3 px-4">
                      {b.is_low_confidence ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap">
                          <Warning size={12} weight="fill" />
                          <span>{t('badgeLowConfidence')} (n={b.impression_count})</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                          <CheckCircle size={12} weight="fill" />
                          <span>{t('badgeSufficientSample')} (n={b.impression_count})</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
