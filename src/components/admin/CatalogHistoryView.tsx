import React from 'react';
import { ClockCounterClockwise, ShieldCheck, ArrowUUpLeft } from '@phosphor-icons/react';
import { useAdminLocale } from '../../context/AdminLocaleContext';
import type { CatalogChangeRecord } from '../../types/admin';

interface CatalogHistoryViewProps {
  history: CatalogChangeRecord[];
  isLoading: boolean;
  onRollback?: (historyId: string) => void;
}

export const CatalogHistoryView: React.FC<CatalogHistoryViewProps> = ({
  history,
  isLoading,
  onRollback,
}) => {
  const { t, formatSaudiTime } = useAdminLocale();

  return (
    <div className="space-y-6">
      {/* Forward-Only Guarantee Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockCounterClockwise size={20} className="text-brand-red" />
            <h2 className="text-base font-bold text-stone-900 font-alexandria">
              {t('catalogHistoryTitle')}
            </h2>
          </div>
          {isLoading && (
            <span className="text-xs font-semibold text-stone-400 animate-pulse">Loading...</span>
          )}
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          {t('catalogHistorySubtitle')}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-fit">
          <ShieldCheck size={14} weight="fill" />
          <span>Forward-only audit active (Tracking Started: Oct 19, 2026). Captures restaurant and branch updates forward-only; prior revisions preserved in Git.</span>
        </div>
      </div>

      {/* Audit History Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {history.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-500">
            {t('noHistoryFound')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                  <th className="py-3 px-4">{t('colEffectiveAt')}</th>
                  <th className="py-3 px-4">{t('colEntityType')}</th>
                  <th className="py-3 px-4">{t('colAction')}</th>
                  <th className="py-3 px-4">{t('colChangedBy')}</th>
                  <th className="py-3 px-4">{t('colSummary')}</th>
                  {onRollback && <th className="py-3 px-4 text-right">{t('colActions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {history.map((rec) => {
                  const isBaseline = rec.entity_id === 'system_baseline';

                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-stone-50/60 transition-colors ${
                        isBaseline ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                        {formatSaudiTime(rec.effective_at)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200 font-mono">
                          {rec.entity_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isBaseline
                              ? 'bg-amber-50 text-amber-700 border-amber-200 font-mono'
                              : rec.action === 'created'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rec.action === 'retired'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          }`}
                        >
                          {isBaseline ? 'tracking_start_marker' : rec.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-700 font-mono text-[11px]">
                        {rec.changed_by}
                      </td>
                      <td className="py-3.5 px-4 text-stone-800 leading-relaxed max-w-md">
                        <div>{rec.change_summary}</div>
                        {rec.previous_state && (
                          <div className="mt-1 font-mono text-[10px] text-stone-600 bg-stone-50 p-1.5 rounded-lg border border-stone-200 overflow-x-auto">
                            <span className="font-semibold text-stone-400">Previous: </span>
                            {JSON.stringify(rec.previous_state)}
                          </div>
                        )}
                        {rec.new_state && (
                          <div className="mt-1 font-mono text-[10px] text-stone-600 bg-stone-50 p-1.5 rounded-lg border border-stone-200 overflow-x-auto">
                            <span className="font-semibold text-stone-400">
                              {isBaseline ? 'Marker State: ' : 'New: '}
                            </span>
                            {JSON.stringify(rec.new_state)}
                          </div>
                        )}
                      </td>
                      {onRollback && (
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {rec.previous_state && !isBaseline && (
                            <button
                              type="button"
                              onClick={() => onRollback(rec.id)}
                              className="flex items-center gap-1 ml-auto px-2.5 py-1 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                              title={t('btnRollbackToSnapshot')}
                            >
                              <ArrowUUpLeft size={13} />
                              <span>Rollback</span>
                            </button>
                          )}
                        </td>
                      )}
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
