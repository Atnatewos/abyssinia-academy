/**
 * @fileoverview Scholarship Application Form (Modal)
 *
 * Renders a full-screen modal with:
 *   - Motivation statement (textarea with character counter)
 *   - Per-document-type upload slots (Cloudinary direct upload)
 *   - Validation against scholarshipsConfig.defaults
 *   - Submit button that opens the shared ConfirmDialog
 *   - Success state on completion
 *
 * Uses the shared Modal, ConfirmDialog, Toast — no browser alerts.
 * Uses SkeletonBase while documents are uploading.
 *
 * Cloudinary upload: uses the shared lib/cloudinary helper on the client.
 * Each upload returns { url, publicId } stored in local state.
 *
 * Path: apps/web/components/scholarships/ApplicationForm.jsx
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { X, Upload, Trash2, AlertCircle, Loader2, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../shared/ConfirmProvider';
import { uploadToCloudinary } from '../../lib/cloudinary';
import {
  getScholarshipDefaults,
  getScholarshipDocumentTypes,
} from '../../lib/config';

/**
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose - Called when user cancels or after success
 * @param {object} props.campaign - Campaign detail payload
 * @param {Function} props.onSubmitted - Called after successful submission
 */
const ApplicationForm = ({ isOpen, onClose, campaign, onSubmitted }) => {
  const { t, language } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();

  const defaults = getScholarshipDefaults();
  const documentTypesRegistry = getScholarshipDocumentTypes();

  /* ── State ── */
  const [motivation, setMotivation] = useState('');
  const [documents, setDocuments] = useState({}); // { [type]: { url, publicId, filename, size } }
  const [uploadingTypes, setUploadingTypes] = useState({}); // { [type]: boolean }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRefs = useRef({});

  /* Required document types for this campaign */
  const requiredDocs = useMemo(() => {
    const reqs = campaign?.requiredDocuments || [];
    return reqs.filter((r) => r.required === true).map((r) => r.type);
  }, [campaign]);

  /* Reset form state on close */
  const resetForm = useCallback(() => {
    setMotivation('');
    setDocuments({});
    setUploadingTypes({});
    setError(null);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  /**
   * Upload a document to Cloudinary. Non-blocking per-file.
   *
   * @param {string} type - Document type key
   * @param {File} file
   */
  const handleFileUpload = useCallback(
    async (type, file) => {
      if (!file) return;

      /* Client-side size / type guard */
      if (file.size > defaults.maxDocumentSizeBytes) {
        const maxMB = Math.round(defaults.maxDocumentSizeBytes / (1024 * 1024));
        toast.error(
          `${t.scholarships?.formModal?.documentsHint || 'Max {size} MB each.'}`.replace(
            '{size}',
            String(maxMB)
          )
        );
        return;
      }
      if (!defaults.allowedDocumentTypes.includes(file.type)) {
        toast.error(
          t.scholarships?.formModal?.documentsHint || 'File type not allowed.'
        );
        return;
      }

      setUploadingTypes((prev) => ({ ...prev, [type]: true }));

      try {
        const result = await uploadToCloudinary(file, {
          folder: `abyssinia-academy/scholarships`,
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
          toast.error(
            result?.error || t.scholarships?.formModal?.submitErrorTitle || 'Upload failed.'
          );
        }
      } catch (uploadError) {
        console.error('[scholarship/form] upload failed:', uploadError);
        toast.error(t.scholarships?.formModal?.submitErrorTitle || 'Upload failed.');
      } finally {
        setUploadingTypes((prev) => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
        if (fileInputRefs.current[type]) {
          fileInputRefs.current[type].value = '';
        }
      }
    },
    [defaults, t, toast]
  );

  /**
   * Remove an uploaded document.
   */
  const handleRemoveDocument = useCallback((type) => {
    setDocuments((prev) => {
      const next = { ...prev };
      delete next[type];
      return next;
    });
  }, []);

  /**
   * Validate the form before submit.
   *
   * @returns {string|null} Error key or null when valid
   */
  const validateForm = useCallback(() => {
    const trimmed = motivation.trim();
    if (!trimmed) {
      return (
        t.scholarships?.formModal?.validationMotivationRequired ||
        'Please write a motivation statement.'
      );
    }
    if (trimmed.length < defaults.motivationMinChars) {
      return (
        t.scholarships?.formModal?.validationMotivationShort ||
        'Motivation must be at least {min} characters.'
      ).replace('{min}', String(defaults.motivationMinChars));
    }
    for (const type of requiredDocs) {
      if (!documents[type]) {
        const label =
          documentTypesRegistry[type]?.labelKey
            ? t.scholarships?.documents?.[type] || type
            : type;
        return (
          t.scholarships?.formModal?.validationRequiredDocMissing ||
          'Required document "{type}" is missing.'
        ).replace('{type}', label);
      }
    }
    if (Object.keys(uploadingTypes).length > 0) {
      return (
        t.scholarships?.formModal?.validationUploadInProgress ||
        'Please wait for all uploads to complete.'
      );
    }
    return null;
  }, [motivation, documents, requiredDocs, uploadingTypes, defaults, documentTypesRegistry, t]);

  /**
   * Submit flow: validate → confirm dialog → POST.
   */
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError(null);

      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        return;
      }

      const confirmed = await confirm({
        title: t.scholarships?.formModal?.submitConfirmTitle || 'Submit Application?',
        message:
          t.scholarships?.formModal?.submitConfirmBody ||
          'Once submitted, you cannot edit or re-apply to this campaign.',
        confirmText:
          t.scholarships?.formModal?.submitConfirmButton || 'Yes, Submit',
        cancelText: t.scholarships?.formModal?.cancelButton || 'Cancel',
        variant: 'warning',
      });
      if (!confirmed) return;

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
          setError(
            result?.message ||
              t.scholarships?.formModal?.submitErrorTitle ||
              'Submission failed.'
          );
          return;
        }

        toast.success(
          t.scholarships?.formModal?.submitSuccessBody ||
            'Application submitted. You will be notified when reviewed.'
        );
        resetForm();
        onClose();
        if (typeof onSubmitted === 'function') onSubmitted(result.data);
      } catch (submissionError) {
        console.error('[scholarship/form] submit failed:', submissionError);
        setError(
          t.scholarships?.formModal?.submitErrorTitle || 'Submission failed.'
        );
      } finally {
        setSubmitting(false);
      }
    },
    [motivation, documents, campaign, validateForm, confirm, t, toast, resetForm, onClose, onSubmitted]
  );

  if (!isOpen || !campaign) return null;

  /* ── Helpers ── */
  const charCount = motivation.length;
  const charMax = defaults.motivationMaxChars;
  const charMin = defaults.motivationMinChars;

  const renderDocumentSlot = (docType, config) => {
    const meta = documentTypesRegistry[docType] || {};
    const labelKey = meta.labelKey || '';
    const label = labelKey
      ? (() => {
          /* labelKey looks like 'scholarships.documents.studentId' */
          const parts = labelKey.split('.');
          let value = t;
          for (const part of parts) {
            value = value?.[part];
            if (!value) break;
          }
          return typeof value === 'string' ? value : docType;
        })()
      : docType;

    const isRequired = config.required === true;
    const isUploading = uploadingTypes[docType] === true;
    const uploadedDoc = documents[docType];

    return (
      <div key={docType} className="flex flex-col gap-1.5">
        <label className="flex items-center justify-between text-xs font-bold text-text-main">
          <span>{label}</span>
          <span
            className={`text-2xs font-bold uppercase ${
              isRequired ? 'text-accent' : 'text-text-dim'
            }`}
          >
            {isRequired
              ? t.scholarships?.detail?.documentRequired || 'Required'
              : t.scholarships?.detail?.documentOptional || 'Optional'}
          </span>
        </label>

        {uploadedDoc ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/5 border border-success/20">
            <FileText size={14} className="text-success shrink-0" />
            <span className="flex-1 text-xs text-text-main truncate">
              {uploadedDoc.filename}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveDocument(docType)}
              disabled={submitting}
              aria-label={t.scholarships?.formModal?.documentRemoveLabel || 'Remove'}
              className="p-1 rounded text-error hover:bg-error/10 transition-colors disabled:opacity-50"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ) : isUploading ? (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-input border border-border-medium">
            <Loader2 size={14} className="text-accent animate-spin" />
            <span className="text-xs text-text-muted">
              {t.scholarships?.formModal?.documentUploadingLabel || 'Uploading...'}
            </span>
          </div>
        ) : (
          <>
            <input
              ref={(el) => {
                if (el) fileInputRefs.current[docType] = el;
              }}
              type="file"
              accept={defaults.allowedDocumentTypes.join(',')}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(docType, file);
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRefs.current[docType]?.click()}
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                         bg-bg-input border border-dashed border-border-medium text-text-muted
                         hover:border-accent/40 hover:text-accent transition-colors
                         disabled:opacity-50 text-xs font-semibold"
            >
              <Upload size={13} />
              {(t.scholarships?.formModal?.documentUploadLabel || 'Upload {type}').replace(
                '{type}',
                label
              )}
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-bg-card-solid border border-border-medium shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t.scholarships?.formModal?.title || 'Apply for Scholarship'}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border-light shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-text-main">
              {t.scholarships?.formModal?.title || 'Apply for Scholarship'}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              {t.scholarships?.formModal?.subtitle || 'Tell us why this scholarship matters to you'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            aria-label={t.scholarships?.formModal?.closeAriaLabel || 'Close form'}
            className="shrink-0 p-1.5 rounded-md text-text-dim hover:text-text-main hover:bg-bg-ghost-hover transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 overflow-y-auto">
          {/* Motivation */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-main">
              {t.scholarships?.formModal?.motivationLabel || 'Motivation Statement'}
            </label>
            <textarea
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder={
                t.scholarships?.formModal?.motivationPlaceholder ||
                'Share your story...'
              }
              rows={6}
              maxLength={charMax}
              disabled={submitting}
              className="w-full px-3 py-2.5 rounded-lg bg-bg-input border border-border-medium
                         text-sm text-text-main placeholder:text-text-dim
                         focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
                         transition-colors resize-none disabled:opacity-50"
            />
            <div className="flex items-center justify-between text-2xs">
              <span
                className={
                  charCount > 0 && charCount < charMin
                    ? 'text-warning'
                    : 'text-text-dim'
                }
              >
                {(t.scholarships?.formModal?.motivationCounter ||
                  '{count} / {max} characters (minimum {min})')
                  .replace('{count}', String(charCount))
                  .replace('{max}', String(charMax))
                  .replace('{min}', String(charMin))}
              </span>
            </div>
          </div>

          {/* Documents */}
          {(campaign.requiredDocuments || []).length > 0 && (
            <div className="flex flex-col gap-3 pt-2 border-t border-border-light">
              <div>
                <p className="text-xs font-bold text-text-main">
                  {t.scholarships?.formModal?.documentsLabel || 'Supporting Documents'}
                </p>
                <p className="text-2xs text-text-dim mt-0.5">
                  {(t.scholarships?.formModal?.documentsHint ||
                    'JPEG, PNG, WebP, or PDF. Max {size} MB each.').replace(
                    '{size}',
                    String(Math.round(defaults.maxDocumentSizeBytes / (1024 * 1024)))
                  )}
                </p>
              </div>
              {(campaign.requiredDocuments || []).map((cfg) =>
                renderDocumentSlot(cfg.type, cfg)
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-error/10 border border-error/20">
              <AlertCircle size={14} className="text-error shrink-0 mt-0.5" />
              <span className="text-xs text-error">{error}</span>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-light bg-bg-secondary shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg border border-border-medium bg-transparent
                       text-text-muted text-xs font-bold hover:text-text-main
                       transition-colors disabled:opacity-50"
          >
            {t.scholarships?.formModal?.cancelButton || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                       bg-accent text-text-inverse text-xs font-bold
                       hover:bg-accent-light transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 size={12} className="animate-spin" />}
            {submitting
              ? t.scholarships?.formModal?.submitButtonLoading || 'Submitting...'
              : t.scholarships?.formModal?.submitButton || 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;