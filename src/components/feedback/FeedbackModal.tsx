import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Bug,
  ChatTeardropText,
  Storefront,
  CheckCircle,
  WarningCircle,
  CircleNotch,
} from '@phosphor-icons/react';
import { useLocale } from '../../context/LocaleContext';
import { submitFeedback } from '../../services/feedbackService';
import { getRecentDeckErrors } from '../../lib/observability';
import type { BugDiagnosticContext, FeedbackType } from '../../types/feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PHONE_REGEX = /^\+?[0-9\s-]{8,20}$/;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocale();

  const [activeTab, setActiveTab] = useState<FeedbackType>('bug');

  // Form A: Bug
  const [bugDescription, setBugDescription] = useState<string>('');
  const [bugSteps, setBugSteps] = useState<string>('');

  // Form B: Comment
  const [commentMessage, setCommentMessage] = useState<string>('');
  const [commentName, setCommentName] = useState<string>('');

  // Form C: Brand
  const [brandName, setBrandName] = useState<string>('');
  const [brandLocation, setBrandLocation] = useState<string>('');
  const [brandDistrict, setBrandDistrict] = useState<string>('');
  const [brandContext, setBrandContext] = useState<string>('');
  const [isBrandOwner, setIsBrandOwner] = useState<boolean | null>(null);
  const [contactPhone, setContactPhone] = useState<string>('');

  // Status and submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const resetFormState = () => {
    setBugDescription('');
    setBugSteps('');
    setCommentMessage('');
    setCommentName('');
    setBrandName('');
    setBrandLocation('');
    setBrandDistrict('');
    setBrandContext('');
    setIsBrandOwner(null);
    setContactPhone('');
    setErrorMessage(null);
    setIsSuccess(false);
  };

  const handleModalClose = () => {
    resetFormState();
    onClose();
  };

  // Safe diagnostics extractor for Form A
  const getSafeBugDiagnostics = (): BugDiagnosticContext => {
    const rawPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    // Sanitize path by stripping specific room codes, query parameters, and fragments
    const sanitizedRoute = rawPath.replace(/\/(?:r|room)\/[A-Za-z0-9]+/i, '/r/:code').slice(0, 100);

    const recentErrors = getRecentDeckErrors();
    const lastError = recentErrors && recentErrors.length > 0 ? recentErrors[recentErrors.length - 1] : null;

    const safeDiagnostics: BugDiagnosticContext = {
      timestamp: new Date().toISOString(),
      sanitized_route: sanitizedRoute,
      app_version: lastError?.appVersion || '2.0.0-phase6',
    };

    if (lastError) {
      safeDiagnostics.recent_error = {
        event: lastError.event,
        event_phase: lastError.eventPhase,
        error_message: (lastError.errorMessage || '').slice(0, 300),
        category: lastError.category,
      };
    }

    return safeDiagnostics;
  };

  const handleOwnerChange = (val: boolean) => {
    setIsBrandOwner(val);
    if (!val) {
      // Clear phone number when selecting No
      setContactPhone('');
    }
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage(null);

    // Validation per tab
    if (activeTab === 'bug') {
      const cleanDesc = bugDescription.trim();
      if (!cleanDesc || cleanDesc.length < 3) {
        setErrorMessage(t('feedback.status.requiredField'));
        return;
      }
      const fullMessage = bugSteps.trim()
        ? `${cleanDesc}\n\nSteps:\n${bugSteps.trim()}`
        : cleanDesc;

      setIsSubmitting(true);
      const res = await submitFeedback({
        submission_type: 'bug',
        user_message: fullMessage,
        diagnostic_context: getSafeBugDiagnostics(),
      });
      setIsSubmitting(false);

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || t('feedback.status.errorGeneric'));
      }
    } else if (activeTab === 'comment') {
      const cleanMsg = commentMessage.trim();
      if (!cleanMsg || cleanMsg.length < 3) {
        setErrorMessage(t('feedback.status.requiredField'));
        return;
      }

      setIsSubmitting(true);
      const res = await submitFeedback({
        submission_type: 'comment',
        user_message: cleanMsg,
        submitter_name: commentName.trim() || undefined,
      });
      setIsSubmitting(false);

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || t('feedback.status.errorGeneric'));
      }
    } else if (activeTab === 'brand_suggestion') {
      const cleanBrand = brandName.trim();
      if (!cleanBrand || cleanBrand.length < 2) {
        setErrorMessage(t('feedback.status.requiredField'));
        return;
      }

      if (isBrandOwner === null) {
        setErrorMessage(t('feedback.status.ownerChoiceRequired'));
        return;
      }

      if (isBrandOwner) {
        const cleanPhone = contactPhone.trim();
        if (!cleanPhone || !PHONE_REGEX.test(cleanPhone)) {
          setErrorMessage(t('feedback.status.phoneRequired'));
          return;
        }
      }

      setIsSubmitting(true);
      const res = await submitFeedback({
        submission_type: 'brand_suggestion',
        brand_name: cleanBrand,
        brand_location: brandLocation.trim() || undefined,
        district: brandDistrict.trim() || undefined,
        user_message: brandContext.trim() || cleanBrand,
        is_brand_owner: isBrandOwner,
        contact_phone: isBrandOwner ? contactPhone.trim() : undefined,
      });
      setIsSubmitting(false);

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || t('feedback.status.errorGeneric'));
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
      onClick={handleModalClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#FFF8F1] rounded-3xl border-2 border-[#241B18] shadow-[0px_8px_0px_#241B18] p-5 sm:p-6 text-[#241B18] font-alexandria my-auto relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleModalClose}
          aria-label={t('feedback.closeAria')}
          className="absolute top-4 end-4 w-9 h-9 rounded-full bg-white border border-[#241B18]/15 flex items-center justify-center text-[#241B18] hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink"
        >
          <X size={18} weight="bold" />
        </button>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle size={38} weight="fill" />
            </div>
            <h2 className="text-xl font-black text-[#241B18]">
              {t('feedback.status.successTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6E67] max-w-xs mx-auto leading-relaxed">
              {t('feedback.status.successMessage')}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="w-full py-3 px-6 rounded-2xl bg-brand-red text-white font-bold text-sm shadow-tactile-red hover:bg-brand-redPressed active:translate-y-0.5 cursor-pointer transition-all"
              >
                {t('feedback.status.done')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-4 pe-8">
              <h2 id="feedback-dialog-title" className="text-lg font-black text-[#241B18] tracking-tight">
                {t('feedback.modalTitle')}
              </h2>
              <p className="text-xs text-[#7A6E67] mt-0.5">
                {t('feedback.modalSubtitle')}
              </p>
            </div>

            {/* Type Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-2xl border border-[#241B18]/15 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('bug');
                  setErrorMessage(null);
                }}
                className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'bug'
                    ? 'bg-brand-red text-white shadow-xs'
                    : 'text-[#7A6E67] hover:text-[#241B18]'
                }`}
              >
                <Bug size={16} weight={activeTab === 'bug' ? 'fill' : 'bold'} />
                <span className="truncate">{t('feedback.tabBug')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('comment');
                  setErrorMessage(null);
                }}
                className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'comment'
                    ? 'bg-brand-red text-white shadow-xs'
                    : 'text-[#7A6E67] hover:text-[#241B18]'
                }`}
              >
                <ChatTeardropText size={16} weight={activeTab === 'comment' ? 'fill' : 'bold'} />
                <span className="truncate">{t('feedback.tabComment')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('brand_suggestion');
                  setErrorMessage(null);
                }}
                className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'brand_suggestion'
                    ? 'bg-brand-red text-white shadow-xs'
                    : 'text-[#7A6E67] hover:text-[#241B18]'
                }`}
              >
                <Storefront size={16} weight={activeTab === 'brand_suggestion' ? 'fill' : 'bold'} />
                <span className="truncate">{t('feedback.tabBrand')}</span>
              </button>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <WarningCircle size={18} className="shrink-0 text-rose-600" weight="fill" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Forms */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {activeTab === 'bug' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#241B18] mb-1">
                      {t('feedback.bug.descLabel')}{' '}
                      <span className="text-brand-red">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={bugDescription}
                      onChange={(e) => setBugDescription(e.target.value)}
                      placeholder={t('feedback.bug.descPlaceholder')}
                      required
                      className="w-full py-2 px-3 text-xs rounded-xl bg-white border border-[#241B18]/20 focus:border-brand-red focus:outline-none placeholder:text-neutral-400 text-[#241B18] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#241B18] mb-1">
                      {t('feedback.bug.stepsLabel')}
                    </label>
                    <textarea
                      rows={2}
                      value={bugSteps}
                      onChange={(e) => setBugSteps(e.target.value)}
                      placeholder={t('feedback.bug.stepsPlaceholder')}
                      className="w-full py-2 px-3 text-xs rounded-xl bg-white border border-[#241B18]/20 focus:border-brand-red focus:outline-none placeholder:text-neutral-400 text-[#241B18] resize-none"
                    />
                  </div>
                </>
              )}

              {activeTab === 'comment' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#241B18] mb-1">
                      {t('feedback.comment.messageLabel')}{' '}
                      <span className="text-brand-red">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={commentMessage}
                      onChange={(e) => setCommentMessage(e.target.value)}
                      placeholder={t('feedback.comment.messagePlaceholder')}
                      required
                      className="w-full py-2 px-3 text-xs rounded-xl bg-white border border-[#241B18]/20 focus:border-brand-red focus:outline-none placeholder:text-neutral-400 text-[#241B18] resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#241B18] mb-1">
                      {t('feedback.comment.nameLabel')}
                    </label>
                    <input
                      type="text"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder={t('feedback.comment.namePlaceholder')}
                      maxLength={100}
                      className="w-full py-2 px-3 text-xs rounded-xl bg-white border border-[#241B18]/20 focus:border-brand-red focus:outline-none placeholder:text-neutral-400 text-[#241B18]"
                    />
                  </div>
                </>
              )}

              {activeTab === 'brand_suggestion' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#241B18] mb-1">
                      {t('feedback.brand.nameLabel')}{' '}
                      <span className="text-brand-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder={t('feedback.brand.namePlaceholder')}
                      required
                      maxLength={150}
                      className="w-full py-2 px-3 text-xs rounded-xl bg-white border border-[#241B18]/20 focus:border-brand-red focus:outline-none placeholder:text-neutral-400 text-[#241B18]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#241B18] mb-1">
                        {t('feedback.brand.locationLabel')}
                      </label>
                      <input
                        type="text"
                        value={brandLocation}
                        onChange={(e) => setBrandLocation(e.target.value)}
                        placeholder={t('feedback.brand.locationPlaceholder')}
                        maxLength={200}
                        className="w-full py-1.5 px-2.5 text-xs rounded-xl bg-white border border-[#241B18]/20 focus:border-brand-red focus:outline-none placeholder:text-neutral-400 text-[#241B18]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#241B18] mb-1">
                        {t('feedback.brand.districtLabel')}
                      </label>
                      <input
                        type="text"
                        value={brandDistrict}
                        onChange={(e) => setBrandDistrict(e.target.value)}
                        placeholder={t('feedback.brand.districtPlaceholder')}
                        maxLength={100}
                        className="w-full py-1.5 px-2.5 text-xs rounded-xl bg-white border border-[#241B18]/20 focus:border-brand-red focus:outline-none placeholder:text-neutral-400 text-[#241B18]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#241B18] mb-1">
                      {t('feedback.brand.contextLabel')}
                    </label>
                    <textarea
                      rows={2}
                      value={brandContext}
                      onChange={(e) => setBrandContext(e.target.value)}
                      placeholder={t('feedback.brand.contextPlaceholder')}
                      className="w-full py-1.5 px-2.5 text-xs rounded-xl bg-white border border-[#241B18]/20 focus:border-brand-red focus:outline-none placeholder:text-neutral-400 text-[#241B18] resize-none"
                    />
                  </div>

                  {/* Owner / Representative Question */}
                  <div className="p-3 bg-white/70 rounded-2xl border border-[#241B18]/15 space-y-2">
                    <span className="block text-xs font-bold text-[#241B18]">
                      {t('feedback.brand.ownerQuestion')}{' '}
                      <span className="text-brand-red">*</span>
                    </span>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="isBrandOwner"
                          checked={isBrandOwner === true}
                          onChange={() => handleOwnerChange(true)}
                          className="accent-brand-red cursor-pointer"
                        />
                        <span>{t('feedback.brand.ownerYes')}</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="isBrandOwner"
                          checked={isBrandOwner === false}
                          onChange={() => handleOwnerChange(false)}
                          className="accent-brand-red cursor-pointer"
                        />
                        <span>{t('feedback.brand.ownerNo')}</span>
                      </label>
                    </div>

                    {isBrandOwner === true && (
                      <div className="pt-2 border-t border-stone-200 space-y-1.5">
                        <label className="block text-xs font-bold text-[#241B18]">
                          {t('feedback.brand.phoneLabel')}{' '}
                          <span className="text-brand-red">*</span>
                        </label>
                        <input
                          type="tel"
                          dir="ltr"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder={t('feedback.brand.phonePlaceholder')}
                          required
                          className="w-full py-2 px-3 text-xs rounded-xl bg-white border border-[#241B18]/20 focus:border-brand-red focus:outline-none placeholder:text-neutral-400 text-[#241B18]"
                        />
                        <p className="text-[11px] text-[#7A6E67] leading-tight">
                          {t('feedback.brand.phoneNotice')}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-2xl bg-brand-red text-white font-bold text-xs sm:text-sm shadow-tactile-red hover:bg-brand-redPressed active:translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <CircleNotch size={18} className="animate-spin" />
                      <span>{t('feedback.status.submitting')}</span>
                    </>
                  ) : activeTab === 'bug' ? (
                    t('feedback.bug.submit')
                  ) : activeTab === 'comment' ? (
                    t('feedback.comment.submit')
                  ) : (
                    t('feedback.brand.submit')
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
