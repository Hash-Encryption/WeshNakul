import React, { useState, useEffect, useCallback } from 'react';
import {
  ChatTeardropText,
  Bug,
  Storefront,
  CircleNotch,
  WarningCircle,
  Clock,
  ArrowClockwise,
  Check,
  X,
  ShieldCheck,
  Phone,
  Info,
} from '@phosphor-icons/react';
import { useAdminLocale } from '../../context/AdminLocaleContext';
import {
  fetchAdminFeedbackList,
  fetchAdminFeedbackDetail,
  updateAdminFeedbackStatus,
} from '../../services/feedbackService';
import type { FeedbackStatus, FeedbackSubmission, FeedbackType } from '../../types/feedback';

export const FeedbackInboxView: React.FC = () => {
  const { t, formatSaudiTime } = useAdminLocale();

  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Detail Modal / Drawer state
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<FeedbackSubmission | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Status update state
  const [newStatusSelection, setNewStatusSelection] = useState<FeedbackStatus>('New');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusUpdateMessage, setStatusUpdateMessage] = useState<string | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminFeedbackList({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 50,
        offset: 0,
      });
      setSubmissions(res.submissions || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load feedback inbox', err);
      setError((err as Error).message || 'Failed to fetch feedback submissions.');
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Open Detail
  const handleOpenDetail = async (id: string) => {
    setSelectedSubmissionId(id);
    setIsDetailLoading(true);
    setDetailError(null);
    setStatusUpdateMessage(null);
    setStatusUpdateError(null);
    try {
      const res = await fetchAdminFeedbackDetail(id);
      setSelectedSubmission(res.submission);
      setNewStatusSelection(res.submission.status);
    } catch (err) {
      console.error('Failed to load feedback detail', err);
      setDetailError((err as Error).message || 'Failed to fetch submission details.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedSubmissionId(null);
    setSelectedSubmission(null);
    setStatusUpdateMessage(null);
    setStatusUpdateError(null);
  };

  // Status Change Submit
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || isUpdatingStatus) return;

    if (newStatusSelection === selectedSubmission.status) {
      setStatusUpdateError('Selected status is the same as current status.');
      return;
    }

    setIsUpdatingStatus(true);
    setStatusUpdateError(null);
    setStatusUpdateMessage(null);

    try {
      const res = await updateAdminFeedbackStatus(selectedSubmission.id, {
        status: newStatusSelection,
        expected_updated_at: selectedSubmission.updated_at,
      });

      setSelectedSubmission(res.submission);
      setStatusUpdateMessage(t('detailStatusUpdatedSuccess'));

      // Refresh list in background
      void loadSubmissions();
    } catch (err) {
      console.error('Failed to update feedback status', err);
      setStatusUpdateError((err as Error).message || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-stone-100 text-stone-600 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getTypeIcon = (type: FeedbackType) => {
    switch (type) {
      case 'bug':
        return <Bug size={16} className="text-rose-600" weight="bold" />;
      case 'comment':
        return <ChatTeardropText size={16} className="text-blue-600" weight="bold" />;
      case 'brand_suggestion':
        return <Storefront size={16} className="text-amber-600" weight="bold" />;
    }
  };

  const getTypeLabel = (type: FeedbackType) => {
    switch (type) {
      case 'bug':
        return t('filterTypeBug');
      case 'comment':
        return t('filterTypeComment');
      case 'brand_suggestion':
        return t('filterTypeBrand');
    }
  };

  const getStatusLabel = (status: FeedbackStatus) => {
    switch (status) {
      case 'New':
        return t('statusNew');
      case 'Under review':
        return t('statusUnderReview');
      case 'Resolved':
        return t('statusResolved');
      case 'Rejected':
        return t('statusRejected');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight font-alexandria flex items-center gap-2">
            <span>{t('feedbackTitle')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-semibold border border-stone-200">
              {totalCount}
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {t('feedbackSubtitle')}
          </p>
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={loadSubmissions}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <ArrowClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Type Filter */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs font-semibold">
          {[
            { id: 'all', label: t('filterAllTypes') },
            { id: 'bug', label: t('filterTypeBug') },
            { id: 'comment', label: t('filterTypeComment') },
            { id: 'brand_suggestion', label: t('filterTypeBrand') },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTypeFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                typeFilter === item.id
                  ? 'bg-stone-900 text-white shadow-xs font-bold'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs font-semibold">
          {[
            { id: 'all', label: t('filterAllStatuses') },
            { id: 'New', label: t('statusNew') },
            { id: 'Under review', label: t('statusUnderReview') },
            { id: 'Resolved', label: t('statusResolved') },
            { id: 'Rejected', label: t('statusRejected') },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-brand-red text-white shadow-xs font-bold'
                  : 'bg-stone-100 text-stone-600 hover:text-stone-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WarningCircle size={20} className="text-rose-600 shrink-0" weight="fill" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadSubmissions}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 text-center bg-white rounded-2xl border border-stone-200">
          <CircleNotch size={36} className="animate-spin text-brand-red mx-auto mb-3" />
          <p className="text-xs font-bold text-stone-600">Loading feedback submissions...</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && submissions.length === 0 && (
        <div className="py-20 text-center bg-white rounded-2xl border border-stone-200">
          <ChatTeardropText size={48} className="text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">{t('emptyFeedbackTitle')}</h3>
          <p className="text-xs text-stone-400 mt-1">{t('emptyFeedbackDesc')}</p>
        </div>
      )}

      {/* Submissions Table */}
      {!isLoading && !error && submissions.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 text-start">{t('colType')}</th>
                  <th className="py-3 px-4 text-start">{t('colAuthorOrBrand')}</th>
                  <th className="py-3 px-4 text-start">{t('colMessage')}</th>
                  <th className="py-3 px-4 text-start">{t('colDate')}</th>
                  <th className="py-3 px-4 text-start">{t('colStatus')}</th>
                  <th className="py-3 px-4 text-end">{t('colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {submissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => handleOpenDetail(sub.id)}
                    className="hover:bg-stone-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 font-bold text-stone-800">
                        {getTypeIcon(sub.submission_type)}
                        <span>{getTypeLabel(sub.submission_type)}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-stone-800">
                      {sub.submission_type === 'brand_suggestion' ? (
                        <span className="font-bold text-stone-900">{sub.brand_name || '-'}</span>
                      ) : sub.submitter_name ? (
                        sub.submitter_name
                      ) : (
                        <span className="text-stone-400 italic">Anonymous</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-stone-600" title={sub.user_message}>
                      {sub.user_message}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-500">
                      {formatSaudiTime(sub.created_at)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          sub.status
                        )}`}
                      >
                        {getStatusLabel(sub.status)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-end whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(sub.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        {t('btnViewDetails')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submission Detail Modal / Drawer */}
      {selectedSubmissionId && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={handleCloseDetail}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-3xl border border-stone-200 shadow-2xl p-6 text-stone-900 font-alexandria my-auto max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150 space-y-6"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={handleCloseDetail}
              className="absolute top-5 end-5 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 cursor-pointer transition-all"
            >
              <X size={18} weight="bold" />
            </button>

            {isDetailLoading && (
              <div className="py-20 text-center">
                <CircleNotch size={36} className="animate-spin text-brand-red mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-600">Loading details...</p>
              </div>
            )}

            {detailError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {detailError}
              </div>
            )}

            {!isDetailLoading && selectedSubmission && (
              <>
                {/* Header & Meta */}
                <div className="pe-10 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 font-bold text-xs text-stone-800">
                      {getTypeIcon(selectedSubmission.submission_type)}
                      <span>{getTypeLabel(selectedSubmission.submission_type)}</span>
                    </span>
                    <span>•</span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getStatusBadge(
                        selectedSubmission.status
                      )}`}
                    >
                      {getStatusLabel(selectedSubmission.status)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-stone-900 mt-2">
                    {selectedSubmission.submission_type === 'brand_suggestion' && selectedSubmission.brand_name
                      ? selectedSubmission.brand_name
                      : t('detailTitle')}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                    <Clock size={14} />
                    <span>{formatSaudiTime(selectedSubmission.created_at)}</span>
                  </div>
                </div>

                {/* Translation Unavailable Notice */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
                  <Info size={18} className="shrink-0 text-stone-500 mt-0.5" />
                  <div>
                    <span className="font-semibold block">{t('detailTranslationNotice')}</span>
                  </div>
                </div>

                {/* Submitted Message */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    {t('detailOriginalText')}
                  </h4>
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 whitespace-pre-wrap leading-relaxed select-text">
                    {selectedSubmission.user_message}
                  </div>
                </div>

                {/* Type-Specific Details */}
                {selectedSubmission.submission_type === 'brand_suggestion' && (
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Storefront size={16} weight="bold" />
                      <span>{t('detailBrandTitle')}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-stone-500 block">{t('detailBrandName')}</span>
                        <strong className="text-stone-900 text-sm font-bold">{selectedSubmission.brand_name}</strong>
                      </div>
                      <div>
                        <span className="text-stone-500 block">{t('detailBrandLocation')}</span>
                        <span className="text-stone-800 font-medium">{selectedSubmission.brand_location || '-'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block">{t('detailBrandDistrict')}</span>
                        <span className="text-stone-800 font-medium">{selectedSubmission.district || '-'}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 block">{t('detailBrandOwnerStatus')}</span>
                        <span
                          className={`inline-block font-bold mt-0.5 ${
                            selectedSubmission.is_brand_owner ? 'text-emerald-700' : 'text-stone-600'
                          }`}
                        >
                          {selectedSubmission.is_brand_owner
                            ? t('detailBrandOwnerYes')
                            : t('detailBrandOwnerNo')}
                        </span>
                      </div>
                    </div>

                    {/* Sensitive Phone Number Display */}
                    {selectedSubmission.is_brand_owner && (
                      <div className="pt-2 border-t border-amber-200/80 space-y-1">
                        <span className="text-stone-500 text-xs block font-bold">{t('detailBrandPhone')}</span>
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-emerald-600" weight="bold" />
                          <span dir="ltr" className="font-mono font-bold text-sm text-stone-900 select-text">
                            {selectedSubmission.contact_phone || 'None provided'}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {t('detailBrandPhoneNotice')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Bug Diagnostics */}
                {selectedSubmission.submission_type === 'bug' && selectedSubmission.diagnostic_context && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                    <h4 className="font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                      <ShieldCheck size={16} className="text-blue-600" weight="bold" />
                      <span>{t('detailDiagnosticsTitle')}</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600">
                      <div>
                        <span className="text-stone-400 block">{t('detailDiagnosticsRoute')}</span>
                        <code className="text-stone-800 font-mono text-[11px]">
                          {selectedSubmission.diagnostic_context.sanitized_route || '/'}
                        </code>
                      </div>
                      <div>
                        <span className="text-stone-400 block">App Version</span>
                        <span className="text-stone-800 font-mono text-[11px]">
                          {selectedSubmission.diagnostic_context.app_version || '2.0.0-phase6'}
                        </span>
                      </div>
                    </div>
                    {selectedSubmission.diagnostic_context.recent_error && (
                      <div className="pt-2 border-t border-stone-200">
                        <span className="text-stone-400 block">{t('detailDiagnosticsError')}</span>
                        <p className="text-rose-700 font-mono text-[11px] mt-0.5">
                          [{selectedSubmission.diagnostic_context.recent_error.event_phase || 'unknown'}]{' '}
                          {selectedSubmission.diagnostic_context.recent_error.error_message || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Status Update Form */}
                <div className="p-4 rounded-2xl bg-white border-2 border-stone-200 space-y-3">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    {t('detailStatusChangePrompt')}
                  </h4>

                  {statusUpdateError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                      {statusUpdateError}
                    </div>
                  )}

                  {statusUpdateMessage && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                      <Check size={16} weight="bold" />
                      <span>{statusUpdateMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleStatusSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                      {(['New', 'Under review', 'Resolved', 'Rejected'] as FeedbackStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setNewStatusSelection(st)}
                          className={`py-2 px-2 rounded-xl border transition-all cursor-pointer text-center ${
                            newStatusSelection === st
                              ? 'border-brand-red bg-brand-red text-white shadow-xs'
                              : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                          }`}
                        >
                          {getStatusLabel(st)}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isUpdatingStatus || newStatusSelection === selectedSubmission.status}
                        className="px-4 py-2 rounded-xl bg-brand-red text-white text-xs font-bold hover:bg-brand-redPressed active:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        {isUpdatingStatus ? (
                          <>
                            <CircleNotch size={14} className="animate-spin" />
                            <span>{t('detailStatusUpdating')}</span>
                          </>
                        ) : (
                          <span>Update Status</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Audit History Log */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    {t('detailAuditTitle')}
                  </h4>
                  {selectedSubmission.audit_logs && selectedSubmission.audit_logs.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSubmission.audit_logs.map((log) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex flex-wrap items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-semibold text-stone-800">
                              {getStatusLabel(log.previous_status)} →{' '}
                              <strong className="text-stone-900 font-bold">
                                {getStatusLabel(log.new_status)}
                              </strong>
                            </span>
                            <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                              <span>By: {log.actor_admin_id}</span>
                            </div>
                          </div>
                          <span className="text-[11px] text-stone-400">
                            {formatSaudiTime(log.action_timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic">
                      {t('detailAuditEmpty')}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
