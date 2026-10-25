/**
 * @fileoverview Checkout Form Component
 *
 * Payment submission form with transaction reference, screenshot upload,
 * agent code input, and discount breakdown display with percentages.
 *
 * Discount code input is handled by the parent (CheckoutModal) — not
 * duplicated here. Agent code input IS rendered here because it applies
 * to both the standalone /checkout page and the CheckoutModal flow.
 *
 * ALL display text from i18n → t.checkout.* / t.agents.* — zero hardcoded strings.
 *
 * Path: apps/web/components/payment/CheckoutForm.jsx
 */

import { useState, useMemo, useCallback } from 'react';
import { ShieldCheck, RefreshCw, Upload, X, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getScreenshotUploadConfig } from '../../lib/config';
import DiscountBreakdown from '../discount/DiscountBreakdown';
import AgentCodeInput from '../agents/AgentCodeInput';

/**
 * CopyButton — Inline copy-to-clipboard button with success feedback
 */
const CopyButton = ({ text, label = 'Copy to clipboard' }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* silent */
      }
      document.body.removeChild(textArea);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="copy-btn"
      aria-label={label}
      title={copied ? (t.checkout?.copied || 'Copied!') : (t.checkout?.copy || 'Copy')}
    >
      {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
    </button>
  );
};

/**
 * CheckoutForm — Payment submission form.
 *
 * The discount code input is rendered by the parent (CheckoutModal).
 * The agent code input is rendered HERE because it appears in both the
 * standalone checkout page and the modal flow.
 *
 * @param {object} props
 * @param {string} props.selectedMethod - Selected payment method ID
 * @param {object} props.selectedMethodData - Full payment method config object
 * @param {number} props.amount - Final amount after all discounts
 * @param {string} props.currency - Currency code (e.g., 'ETB')
 * @param {function} props.onSubmit - Callback(paymentData) on form submit
 * @param {boolean} props.loading - Whether the form is submitting
 * @param {string} props.discountCode - Currently applied discount code
 * @param {number} props.discountCodePercent - Discount code percentage value
 * @param {object} props.discountBreakdown - Combined discount breakdown object
 * @param {function} props.onAgentApplied - Callback when agent code applied
 * @param {function} props.onAgentRemoved - Callback when agent code removed
 */
const CheckoutForm = ({
  selectedMethod = '',
  selectedMethodData = null,
  amount = 0,
  currency = 'ETB',
  onSubmit,
  loading = false,
  discountCode = '',
  discountCodePercent = 0,
  discountBreakdown = null,
  onAgentApplied,
  onAgentRemoved,
}) => {
  const { t, language } = useLanguage();
  const toast = useToast();

  const uploadConfig = useMemo(() => getScreenshotUploadConfig(), []);
  const maxFileSize = uploadConfig.maxSize || 5 * 1024 * 1024;
  const allowedTypes = uploadConfig.allowedTypes || [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    transactionRef: '',
    screenshot: null,
    agentId: null,
  });
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [errors, setErrors] = useState({});

  /**
   * Handle file selection for screenshot upload.
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData((p) => ({ ...p, screenshot: null }));
      setScreenshotPreview(null);
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        t.checkout?.invalidFileType || 'Please upload a JPEG, PNG, or WebP image.'
      );
      e.target.value = '';
      return;
    }
    if (file.size > maxFileSize) {
      toast.error(
        (t.checkout?.fileTooLarge || 'File size must be under {size}MB.').replace(
          '{size}',
          maxSizeMB
        )
      );
      e.target.value = '';
      return;
    }
    setFormData((p) => ({ ...p, screenshot: file }));
    setScreenshotPreview(URL.createObjectURL(file));
  };

  /**
   * Remove the uploaded screenshot.
   */
  const handleRemoveScreenshot = () => {
    setFormData((p) => ({ ...p, screenshot: null }));
    setScreenshotPreview(null);
  };

  /**
   * Validate all required form fields.
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t.checkout?.fullNameRequired || 'Full name is required.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t.checkout?.phoneRequired || 'Phone number is required.';
    }

    if (!formData.transactionRef.trim()) {
      newErrors.transactionRef =
        t.checkout?.transactionRefRequired || 'Transaction reference is required.';
    }

    if (!selectedMethod) {
      newErrors.method =
        t.checkout?.paymentMethodRequired || 'Please select a payment method.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      paymentMethod: selectedMethod,
      transactionRef: formData.transactionRef.trim(),
      screenshot: formData.screenshot,
      agentId: formData.agentId,
    });
  };

  /**
   * Handle input field changes with error clearing.
   */
  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) {
      setErrors((p) => ({ ...p, [field]: '' }));
    }
  };

  /**
   * Store the applied agent's UUID on the form state so submit includes it.
   * The agent validation API does NOT return the UUID directly (it hides
   * the internal user ID), so we extract it from the response if present,
   * or fetch it separately — but for Phase 4 the API returns agentName +
   * commission config only. We pass the CODE to the parent, and the parent
   * (checkout page / modal) resolves the code to an agent UUID via a
   * follow-up lookup. For Phase 4 we keep it simple: the agent data
   * already includes a machine-readable `code`, and submit sends the code
   * as the attribution — the server resolves it back to the agent user ID.
   */
  const handleAgentApplied = useCallback(
    (agentData) => {
      /*
       * We store the agent code as the "agentId" for submission.
       * The submit API accepts the code and resolves it server-side.
       * If the API later evolves to accept a direct UUID, this branch
       * is where to switch.
       */
      setFormData((p) => ({ ...p, agentId: agentData.code || null }));
      if (onAgentApplied) onAgentApplied(agentData);
    },
    [onAgentApplied]
  );

  const handleAgentRemoved = useCallback(() => {
    setFormData((p) => ({ ...p, agentId: null }));
    if (onAgentRemoved) onAgentRemoved();
  }, [onAgentRemoved]);

  /*
   * Resolve display strings from config with bilingual fallback.
   */
  const methodDisplayName =
    language === 'am'
      ? selectedMethodData?.nameAm || selectedMethodData?.name || selectedMethod
      : selectedMethodData?.name || selectedMethod;

  const methodInstructions =
    language === 'am'
      ? selectedMethodData?.instructionsAm || selectedMethodData?.instructions || ''
      : selectedMethodData?.instructions || '';

  const accountLabel = selectedMethodData?.bankName
    ? (t.checkout?.bankLabel || 'Bank: {bankName}').replace(
        '{bankName}',
        selectedMethodData.bankName
      )
    : t.checkout?.accountLabel || 'Account';

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {/* ── Full Name ── */}
      <div className="checkout-field">
        <label htmlFor="checkout-fullname">
          {t.checkout?.fullName || 'Full Name'}
        </label>
        <input
          id="checkout-fullname"
          type="text"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          placeholder="Abebe Kebede"
          className={`checkout-input ${errors.fullName ? 'error' : ''}`}
          autoComplete="name"
        />
        {errors.fullName && <p className="checkout-error">{errors.fullName}</p>}
      </div>

      {/* ── Phone Number ── */}
      <div className="checkout-field">
        <label htmlFor="checkout-phone">
          {t.checkout?.phone || 'Phone Number'}
        </label>
        <input
          id="checkout-phone"
          type="text"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+251 911 234 567"
          className={`checkout-input ${errors.phone ? 'error' : ''}`}
          autoComplete="tel"
        />
        {errors.phone && <p className="checkout-error">{errors.phone}</p>}
      </div>

      {/* ── Transaction Reference ── */}
      <div className="checkout-field">
        <label htmlFor="checkout-transaction-ref">
          {t.checkout?.transactionRef || 'Transaction Reference Number'}
        </label>
        <input
          id="checkout-transaction-ref"
          type="text"
          value={formData.transactionRef}
          onChange={(e) => handleChange('transactionRef', e.target.value)}
          placeholder="Enter the transaction ID"
          className={`checkout-input ${errors.transactionRef ? 'error' : ''}`}
        />
        {errors.transactionRef && (
          <p className="checkout-error">{errors.transactionRef}</p>
        )}
      </div>

      {/* ── Payment Method Info ── */}
      {selectedMethodData && (
        <div className="checkout-payment-info">
          <p className="checkout-payment-method-name">
            <span className="label">
              {(t.checkout?.payVia || 'Pay via {method}').replace(
                '{method}',
                methodDisplayName
              )}
            </span>
          </p>
          <div className="checkout-payment-account-row">
            <span className="checkout-payment-account-label">{accountLabel}:</span>
            <span className="checkout-payment-account-number">
              {selectedMethodData.accountNumber}
            </span>
            <CopyButton
              text={selectedMethodData.accountNumber}
              label={`${t.checkout?.copy || 'Copy'} ${
                selectedMethodData.name
              } ${t.checkout?.accountLabel || 'account'}`}
            />
          </div>
          {selectedMethodData.accountName && (
            <p className="checkout-payment-account-name">
              {t.checkout?.accountNameLabel || 'Account Name:'}{' '}
              <span>{selectedMethodData.accountName}</span>
            </p>
          )}
          {methodInstructions && (
            <p className="checkout-payment-instructions">{methodInstructions}</p>
          )}
        </div>
      )}

      {/* ── Agent Code Input ── */}
      <div className="checkout-field">
        <AgentCodeInput
          onAgentApplied={handleAgentApplied}
          onAgentRemoved={handleAgentRemoved}
        />
      </div>

      {/* ── Screenshot Upload ── */}
      <div className="checkout-field">
        <label>
          {t.checkout?.uploadScreenshot || 'Upload Payment Screenshot'}{' '}
          <span className="checkout-field-optional">(Optional)</span>
        </label>
        {screenshotPreview ? (
          <div className="checkout-upload-preview">
            <img src={screenshotPreview} alt="Payment screenshot preview" />
            <button
              type="button"
              onClick={handleRemoveScreenshot}
              className="checkout-upload-remove"
              aria-label="Remove screenshot"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="checkout-upload-label">
            <Upload size={24} />
            <span className="checkout-upload-text">
              {t.checkout?.clickToUpload || 'Click to upload screenshot'}
            </span>
            <span className="checkout-upload-hint">
              {(
                t.checkout?.uploadHint || 'JPEG, PNG, or WebP (max {size}MB)'
              ).replace('{size}', maxSizeMB)}
            </span>
            <input
              type="file"
              accept={allowedTypes.join(',')}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {/* ── Discount Breakdown with Percentages ── */}
      {discountBreakdown && discountBreakdown.totalDiscountPercent > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <DiscountBreakdown
            basePrice={amount}
            breakdown={discountBreakdown}
            discountCode={discountCode}
            discountCodePercent={discountCodePercent}
            referralPercent={0}
            currency={currency}
          />
        </div>
      )}

      {/* ── Total Display ── */}
      <div className="checkout-total">
        <span>{t.checkout?.tuitionFee || 'Tuition Fee'}</span>
        <span className="checkout-total-amount">
          {amount.toLocaleString()} {currency}
        </span>
      </div>

      {errors.method && <p className="checkout-error">{errors.method}</p>}

      {/* ── Submit Button ── */}
      <button type="submit" disabled={loading} className="checkout-submit-btn">
        {loading ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            <span>{t.checkout?.verifying || 'Verifying...'}</span>
          </>
        ) : (
          <>
            <ShieldCheck size={16} />
            <span>
              {t.checkout?.completeEnrollment ||
                'Complete Enrollment & Unlock Portal'}
            </span>
          </>
        )}
      </button>
    </form>
  );
};

export default CheckoutForm;