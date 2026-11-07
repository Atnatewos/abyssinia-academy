/**
 * @fileoverview Scholarship Application Form (Modal)
 *
 * Multi-step wizard. Steps are conditional on the campaign:
 *
 *   FREE campaign (fee = 0):
 *     1. Motivation
 *     2. Review & Submit
 *
 *   PAID campaign (fee > 0):
 *     1. Motivation
 *     2. Documents (if any required)
 *     3. Pay registration fee (proof upload)
 *     4. Review & Submit
 *
 * The fee is collected at apply time — the receipt/proof is uploaded
 * here and stored with the application. If the application is rejected,
 * the admin processes a manual refund (see refund flow in service.js).
 *
 * Path: apps/web/components/scholarships/ApplicationForm.jsx
 */

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Trash2,
  AlertCircle,
  Loader2,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../shared/ConfirmProvider';
import { uploadToCloudinary } from '../../lib/cloudinary-client';
import {
  getScholarshipDefaults,
  getScholarshipRegistrationFeeConfig,
  getActivePaymentMethods,
} from '../../lib/config';

const toCamel = (snake) =>
  String(snake || '')
    .split('_')
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');

const resolveDocLabel = (t, type) => {
  const camel = toCamel(type);
  return t.scholarships?.documents?.[camel] || t.scholarships?.documents?.[type] || type;
};

const ApplicationForm = ({ isOpen, onClose, campaign, onSubmitted }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();

  const defaults = getScholarshipDefaults();
  const feeConfig = getScholarshipRegistrationFeeConfig();
  const paymentMethods = getActivePaymentMethods();

  const campaignDocs = useMemo(
    () => (Array.isArray(campaign?.requiredDocuments) ? campaign.requiredDocuments : []),
    [campaign]
  );
  const hasDocs = campaignDocs.length > 0;
  const feeAmount = Number(campaign?.registrationFeeETB) || 0;
  const hasFee = feeAmount > 0;
  const refundDeadlineDays = Number(feeConfig?.paymentDeadlineDays) || 7;

  /* Step order varies by campaign shape */
  const stepOrder = useMemo(() => {
    const steps = ['motivation'];
    if (hasDocs) steps.push('documents');
    if (hasFee) steps.push('payment');
    steps.push('review');
    return steps;
  }, [hasDocs, hasFee]);

  const totalSteps = stepOrder.length;

  const [stepIdx, setStepIdx] = useState(0);
  const [motivation, setMotivation] = useState('');
  const [documents, setDocuments] = useState({});
  const [uploading, setUploading] = useState({});

  /* Payment proof state — only used when hasFee */
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRefs = useRef({});
  const screenshotInputRef = useRef(null);

  /* Initialize payment method to first active method */
  useEffect(() => {
    if (hasFee && !paymentMethod && paymentMethods.length > 0) {
      setPaymentMethod(paymentMethods[0].id);
    }
  }, [hasFee, paymentMethod, paymentMethods]);

  useEffect(() => {
    if (!isOpen) return;
    setStepIdx(0);
    setMotivation('');
    setDocuments({});
    setUploading({});
    setTransactionRef('');
    setScreenshot(null);
    setError(null);
    setSubmitting(false);
  }, [isOpen]);

  const requiredDocs = useMemo(
    () => campaignDocs.filter((d) => d.required === true).map((d) => d.type),
    [campaignDocs]
  );

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleUpload = useCallback(
    async (type, file) => {
      if (!file) return;
      if (file.size > defaults.maxDocumentSizeBytes) {
        toast.error(`Max ${Math.round(defaults.maxDocumentSizeBytes / (1024 * 1024))} MB.`);
        return;
      }
      if (!defaults.allowedDocumentTypes.includes(file.type)) {
        toast.error('File type not allowed.');
        return;
      }
      setUploading((prev) => ({ ...prev, [type]: true }));
      try {
        const result = await uploadToCloudinary(file, {
          folder: 'abyssinia-academy/scholarships',
          resourceType: 'auto',
        });
        if (result?.success && result?.url) {
          setDocuments((prev) => ({
            ...prev,
            [type]: {
              url: result.url,
              publicId: result.publicId || null,
              filename: file.name,
              size: file.size,
              mimetype: file.type,
            },
          }));
        } else {
          toast.error(result?.error || 'Upload failed.');
        }
      } catch (err) {
        console.error('[scholarship/form] upload failed:', err);
        toast.error('Upload failed.');
      } finally {
        setUploading((prev) => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
        if (fileInputRefs.current[type]) fileInputRefs.current[type].value = '';
      }
    },
    [defaults, toast]
  );

  const handleScreenshotUpload = useCallback(
    async (file) => {
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Screenshot must be under 5 MB.');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Screenshot must be JPEG, PNG, or WebP.');
        return;
      }
      setUploadingScreenshot(true);
      try {
        const result = await uploadToCloudinary(file, {
          folder: 'abyssinia-academy/payments',
          resourceType: 'image',
        });
        if (result?.success && result?.url) {
          setScreenshot({
            url: result.url,
            publicId: result.publicId || null,
            filename: file.name,
            size: file.size,
            mimetype: file.type,
          });
        } else {
          toast.error(result?.error || 'Upload failed.');
        }
      } catch (err) {
        console.error('[scholarship/form] screenshot upload failed:', err);
        toast.error('Upload failed.');
      } finally {
        setUploadingScreenshot(false);
        if (screenshotInputRef.current) screenshotInputRef.current.value = '';
      }
    },
    [toast]
  );

  const removeDoc = (type) => {
    setDocuments((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  };

  /* ── Validation per step ── */
  const validateMotivation = () => {
    const trimmed = motivation.trim();
    if (!trimmed) return 'Please write a motivation statement.';
    if (trimmed.length < defaults.motivationMinChars) {
      return `Motivation must be at least ${defaults.motivationMinChars} characters.`;
    }
    return null;
  };

  const validateDocs = () => {
    for (const type of requiredDocs) {
      if (!documents[type]) {
        return `Required document "${resolveDocLabel(t, type)}" is missing.`;
      }
    }
    if (Object.keys(uploading).length > 0) {
      return 'Please wait for all uploads to complete.';
    }
    return null;
  };

  const validatePayment = () => {
    if (!hasFee) return null;
    if (!paymentMethod) return 'Please select a payment method.';
    if (!transactionRef || !transactionRef.trim()) {
      return 'Transaction reference / receipt number is required.';
    }
    if (!screenshot) {
      return 'Please upload a screenshot of your payment proof.';
    }
    return null;
  };

  const currentStepType = stepOrder[stepIdx];

  const nextStep = () => {
    setError(null);
    let err = null;
    if (currentStepType === 'motivation') err = validateMotivation();
    else if (currentStepType === 'documents') err = validateDocs();
    else if (currentStepType === 'payment') err = validatePayment();

    if (err) return setError(err);
    if (stepIdx < totalSteps - 1) setStepIdx((i) => i + 1);
  };

  const prevStep = () => {
    setError(null);
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  };

  const handleSubmit = async () => {
    const err = validateMotivation() || validateDocs() || validatePayment();
    if (err) return setError(err);

    const confirmMessage = hasFee
      ? (t.scholarships?.formModal?.feeNotePayAtApply ||
          'A registration fee of {amount} ETB is required to submit. This fee is 100% refundable if your application is not approved.')
          .replace('{amount}', String(feeAmount))
      : t.scholarships?.formModal?.submitConfirmBody ||
        'Once submitted, you cannot edit or re-apply to this campaign.';

    const ok = await confirm({
      title: t.scholarships?.formModal?.submitConfirmTitle || 'Submit Application?',
      message: confirmMessage,
      confirmText: t.scholarships?.formModal?.submitConfirmButton || 'Yes, Submit',
      variant: hasFee ? 'warning' : 'default',
    });
    if (!ok) return;

    setSubmitting(true);
    try {
      const payload = {
        campaignSlug: campaign.slug,
        motivation: motivation.trim(),
        documents: Object.entries(documents).map(([type, doc]) => ({
          type,
          url: doc.url,
          publicId: doc.publicId,
          size: doc.size,
          mimetype: doc.mimetype,
        })),
      };

      /* When a fee is involved, include payment details in the request.
         The backend (api/scholarships/apply) recognizes these fields and
         creates a pending payment row alongside the application. */
      if (hasFee) {
        payload.payment = {
          method: paymentMethod,
          transactionRef: transactionRef.trim(),
          screenshotUrl: screenshot?.url || null,
          amount: feeAmount,
        };
      }

      const response = await fetch('/api/scholarships/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result?.message || 'Submission failed.');
        return;
      }
      toast.success(
        hasFee
          ? t.scholarships?.notifications?.paymentUnderReview?.body ||
            'Payment received. Your application is now under review.'
          : t.scholarships?.formModal?.submitSuccessBody ||
            'Application submitted.'
      );
      onClose();
      if (typeof onSubmitted === 'function') onSubmitted(result.data);
    } catch (err) {
      console.error('[scholarship/form] submit failed:', err);
      setError('Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !campaign) return null;

  const charCount = motivation.length;
  const charMax = defaults.motivationMaxChars;
  const charMin = defaults.motivationMinChars;
  const charOk = charCount >= charMin && charCount <= charMax;
  const progressPct = ((stepIdx + 1) / totalSteps) * 100;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-bg-card-solid border border-border-medium shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 border-b border-border-light">
          <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-accent text-text-inverse flex items-center justify-center shadow-glow-gold-sm">
                <Sparkles size={16} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-text-main leading-tight">
                  {t.scholarships?.formModal?.title || 'Apply for Scholarship'}
                </h2>
                <p className="text-2xs text-text-muted mt-0.5">
                  Step {stepIdx + 1} of {totalSteps}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              aria-label="Close"
              className="shrink-0 p-1.5 rounded-md text-text-dim hover:text-text-main hover:bg-bg-ghost-hover transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
          <div className="h-1 bg-bg-input">
            <div
              className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-500 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* ── MOTIVATION ── */}
          {currentStepType === 'motivation' && (
            <div className="flex flex-col gap-3 animate-fade-in-up">
              <label className="text-xs font-bold text-text-main block mb-1.5">
                {t.scholarships?.formModal?.motivationLabel || 'Motivation Statement'}
              </label>
              <textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder={t.scholarships?.formModal?.motivationPlaceholder || 'Share your story...'}
                rows={8}
                maxLength={charMax}
                disabled={submitting}
                className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border-medium text-sm text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors resize-none disabled:opacity-50"
              />
              <div className="flex items-center justify-between text-2xs">
                <span className={charOk ? 'text-success' : 'text-text-dim'}>
                  {charCount} / {charMax} characters (min {charMin})
                </span>
                {charOk && <CheckCircle2 size={12} className="text-success" />}
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {currentStepType === 'documents' && (
            <div className="flex flex-col gap-3 animate-fade-in-up">
              <div>
                <p className="text-xs font-bold text-text-main">
                  {t.scholarships?.formModal?.documentsLabel || 'Supporting Documents'}
                </p>
                <p className="text-2xs text-text-dim mt-0.5">
                  JPEG, PNG, WebP, or PDF. Max{' '}
                  {Math.round(defaults.maxDocumentSizeBytes / (1024 * 1024))} MB each.
                </p>
              </div>

              {campaignDocs.map(({ type, required }) => {
                const label = resolveDocLabel(t, type);
                const isUp = uploading[type] === true;
                const doc = documents[type];
                return (
                  <div key={type} className="flex flex-col gap-1.5">
                    <label className="flex items-center justify-between text-xs font-bold text-text-main">
                      <span>{label}</span>
                      <span className={`text-2xs font-bold uppercase ${required ? 'text-accent' : 'text-text-dim'}`}>
                        {required ? 'Required' : 'Optional'}
                      </span>
                    </label>
                    {doc ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/5 border border-success/20">
                        <FileText size={14} className="text-success shrink-0" />
                        <span className="flex-1 text-xs text-text-main truncate">{doc.filename}</span>
                        <button
                          type="button"
                          onClick={() => removeDoc(type)}
                          disabled={submitting}
                          aria-label="Remove"
                          className="p-1 rounded text-error hover:bg-error/10 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ) : isUp ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-input border border-border-medium">
                        <Loader2 size={14} className="text-accent animate-spin" />
                        <span className="text-xs text-text-muted">Uploading...</span>
                      </div>
                    ) : (
                      <>
                        <input
                          ref={(el) => { if (el) fileInputRefs.current[type] = el; }}
                          type="file"
                          accept={defaults.allowedDocumentTypes.join(',')}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(type, file);
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[type]?.click()}
                          disabled={submitting}
                          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-bg-input border-2 border-dashed border-border-medium text-text-muted hover:border-accent hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-50 text-xs font-semibold"
                        >
                          <Upload size={13} /> Upload {label}
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PAYMENT PROOF ── */}
          {currentStepType === 'payment' && (
            <div className="flex flex-col gap-4 animate-fade-in-up">
              {/* Refund guarantee banner */}
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-info/5 border border-info/20 text-info text-2xs">
                <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5">
                    {t.scholarships?.detail?.feePolicyPaidTitle || 'Refundable registration fee'}
                  </p>
                  <p className="opacity-90">
                    {(t.scholarships?.formModal?.feeNoteRefundGuarantee ||
                      'If rejected, your {amount} ETB fee is automatically queued for refund within {days} days.')
                      .replace('{amount}', String(feeAmount))
                      .replace('{days}', String(refundDeadlineDays))}
                  </p>
                </div>
              </div>

              {/* Amount display */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2">
                  <CreditCard size={16} className="text-accent" />
                  <span className="text-xs font-bold text-text-main">Amount due</span>
                </div>
                <span className="text-lg font-extrabold text-accent">
                  {feeAmount.toLocaleString()} ETB
                </span>
              </div>

              {/* Method selector */}
              <div>
                <label className="block text-xs font-bold text-text-main mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                        paymentMethod === m.id
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border-light bg-bg-input text-text-muted hover:border-accent/40'
                      }`}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-2xs font-bold">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected method instructions */}
              {paymentMethod && (
                <div className="p-3 rounded-lg bg-bg-pill border border-border-light">
                  <p className="text-2xs font-bold text-text-main mb-1">
                    Send {feeAmount.toLocaleString()} ETB to:
                  </p>
                  {(() => {
                    const m = paymentMethods.find((x) => x.id === paymentMethod);
                    if (!m) return null;
                    return (
                      <>
                        <p className="text-xs text-text-main font-mono">{m.accountNumber}</p>
                        <p className="text-2xs text-text-dim mt-0.5">{m.accountName}</p>
                        {m.bankName && (
                          <p className="text-2xs text-text-dim">{m.bankName}</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Transaction ref */}
              <div>
                <label className="block text-xs font-bold text-text-main mb-1.5">
                  Transaction Reference
                </label>
                <input
                  type="text"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. TB1234567890"
                  disabled={submitting}
                  className="w-full px-3 py-2 rounded-lg bg-bg-input border border-border-medium text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors disabled:opacity-50"
                />
              </div>

              {/* Screenshot proof */}
              <div>
                <label className="block text-xs font-bold text-text-main mb-1.5">
                  Payment Screenshot
                </label>
                {screenshot ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/5 border border-success/20">
                    <FileText size={14} className="text-success shrink-0" />
                    <span className="flex-1 text-xs text-text-main truncate">
                      {screenshot.filename}
                    </span>
                    <button
                      type="button"
                      onClick={() => setScreenshot(null)}
                      disabled={submitting}
                      className="p-1 rounded text-error hover:bg-error/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : uploadingScreenshot ? (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-input border border-border-medium">
                    <Loader2 size={14} className="text-accent animate-spin" />
                    <span className="text-xs text-text-muted">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <input
                      ref={screenshotInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleScreenshotUpload(file);
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => screenshotInputRef.current?.click()}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-bg-input border-2 border-dashed border-border-medium text-text-muted hover:border-accent hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-50 text-xs font-semibold"
                    >
                      <Upload size={13} /> Upload screenshot
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── REVIEW ── */}
          {currentStepType === 'review' && (
            <div className="flex flex-col gap-3 animate-fade-in-up">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-success" />
                <p className="text-sm font-bold text-text-main">Ready to submit</p>
              </div>
              <div className="p-3 rounded-lg bg-bg-pill border border-border-light">
                <p className="text-2xs font-bold uppercase tracking-wider text-text-dim mb-1">Motivation</p>
                <p className="text-xs text-text-main line-clamp-4">
                  {motivation.slice(0, 300)}{motivation.length > 300 ? '…' : ''}
                </p>
              </div>
              {Object.keys(documents).length > 0 && (
                <div className="p-3 rounded-lg bg-bg-pill border border-border-light">
                  <p className="text-2xs font-bold uppercase tracking-wider text-text-dim mb-1.5">
                    Documents ({Object.keys(documents).length})
                  </p>
                  <div className="flex flex-col gap-1">
                    {Object.entries(documents).map(([type]) => (
                      <div key={type} className="flex items-center gap-1.5 text-2xs text-text-main">
                        <FileText size={10} className="text-success shrink-0" />
                        <span className="truncate">{resolveDocLabel(t, type)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {hasFee && (
                <div className="p-3 rounded-lg bg-info/5 border border-info/20">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-text-main">Registration Fee</span>
                    <span className="font-extrabold text-info">
                      {feeAmount.toLocaleString()} ETB
                    </span>
                  </div>
                  <p className="text-2xs text-info opacity-90">
                    {t.scholarships?.formModal?.feeNoteRefundGuarantee
                      ? t.scholarships.formModal.feeNoteRefundGuarantee
                          .replace('{amount}', String(feeAmount))
                          .replace('{days}', String(refundDeadlineDays))
                      : `100% refundable if not approved.`}
                  </p>
                </div>
              )}
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-warning/5 border border-warning/20 text-warning text-2xs">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <span>Once submitted, you cannot edit or re-apply to this campaign.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-error/10 border border-error/20 animate-fade-in-up">
              <AlertCircle size={14} className="text-error shrink-0 mt-0.5" />
              <span className="text-xs text-error">{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-border-light bg-bg-secondary shrink-0">
          <button
            type="button"
            onClick={stepIdx === 0 ? handleClose : prevStep}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border-medium text-text-muted text-xs font-bold hover:text-text-main disabled:opacity-50 transition-colors"
          >
            {stepIdx === 0 ? (t.scholarships?.formModal?.cancelButton || 'Cancel') : (
              <><ArrowLeft size={12} /> Back</>
            )}
          </button>
          {currentStepType !== 'review' ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light shadow-glow-gold-sm disabled:opacity-50 transition-all"
            >
              Next <ArrowRight size={12} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light shadow-glow-gold-sm disabled:opacity-50 transition-all"
            >
              {submitting ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
              {submitting
                ? t.scholarships?.formModal?.submitButtonLoading || 'Submitting...'
                : t.scholarships?.formModal?.submitButton || 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;