/**
 * @fileoverview Checkout Form Component
 * Payment submission form with transaction reference, screenshot upload,
 * discount code input, and discount breakdown display with percentages.
 * ALL display text from i18n → t.checkout.* — zero hardcoded strings.
 * Path: apps/web/components/payment/CheckoutForm.jsx
 */

import { useState, useMemo, useCallback } from 'react';
import { ShieldCheck, RefreshCw, Upload, X, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getScreenshotUploadConfig } from '../../lib/config';
import DiscountCodeInput from '../discount/DiscountCodeInput';
import DiscountBreakdown from '../discount/DiscountBreakdown';

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
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* silent */ }
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
 * CheckoutForm — Payment submission form with discount code support.
 * Shows discount code percentage alongside code name in breakdown.
 * 
 * @param {object} props
 * @param {string} props.selectedMethod - Selected payment method ID
 * @param {object} props.selectedMethodData - Full payment method config object
 * @param {number} props.amount - Tuition amount before discounts
 * @param {string} props.currency - Currency code (e.g., 'ETB')
 * @param {function} props.onSubmit - Callback(paymentData) on form submit
 * @param {boolean} props.loading - Whether the form is submitting
 * @param {string} props.discountCode - Currently applied discount code
 * @param {number} props.discountCodePercent - Discount code percentage value
 * @param {number} props.discountCodeFixed - Discount code fixed amount
 * @param {object} props.discountBreakdown - Combined discount breakdown object
 * @param {function} props.onDiscountApplied - Callback when discount is applied
 * @param {function} props.onDiscountRemoved - Callback when discount is removed
 * @param {string} props.purchaseMode - 'full-course' or 'individual-phases'
 * @param {Array} props.selectedPhases - Array of selected phase IDs
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
  discountCodeFixed = 0,
  discountBreakdown = null,
  onDiscountApplied = null,
  onDiscountRemoved = null,
  purchaseMode = 'full-course',
  selectedPhases = [],
}) => {
  const { t, language } = useLanguage();
  const toast = useToast();

  const uploadConfig = useMemo(() => getScreenshotUploadConfig(), []);
  const maxFileSize = uploadConfig.maxSize || 5 * 1024 * 1024;
  const allowedTypes = uploadConfig.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    transactionRef: '',
    screenshot: null,
  });
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [errors, setErrors] = useState({});

  /**
   * Handle file selection for screenshot upload
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setFormData((p) => ({ ...p, screenshot: null }));
      setScreenshotPreview(null);
      return;
    }
    if (!allowedTypes.includes(file.type)) {
      toast.error(t.checkout?.invalidFileType || 'Please upload a JPEG, PNG, or WebP image.');
      e.target.value = '';
      return;
    }
    if (file.size > maxFileSize) {
      toast.error(
        (t.checkout?.fileTooLarge || 'File size must be under {size}MB.').replace('{size}', maxSizeMB)
      );
      e.target.value = '';
      return;
    }
    setFormData((p) => ({ ...p, screenshot: file }));
    setScreenshotPreview(URL.createObjectURL(file));
  };

  /**
   * Remove the uploaded screenshot
   */
  const handleRemoveScreenshot = () => {
    setFormData((p) => ({ ...p, screenshot: null }));
    setScreenshotPreview(null);
  };

  /**
   * Validate all required form fields
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
      newErrors.transactionRef = t.checkout?.transactionRefRequired || 'Transaction reference is required.';
    }

    if (!selectedMethod) {
      newErrors.method = t.checkout?.paymentMethodRequired || 'Please select a payment method.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
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
    });
  };

  /**
   * Handle input field changes with error clearing
   */
  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) {
      setErrors((p) => ({ ...p, [field]: '' }));
    }
  };

  /*
   * Resolve display strings from config with bilingual fallback
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
    ? (t.checkout?.bankLabel || 'Bank: {bankName}').replace('{bankName}', selectedMethodData.bankName)
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
        {errors.transactionRef && <p className="checkout-error">{errors.transactionRef}</p>}
      </div>

      {/* ── Payment Method Info ── */}
      {selectedMethodData && (
        <div className="checkout-payment-info">
          <p className="checkout-payment-method-name">
            <span className="label">
              {(t.checkout?.payVia || 'Pay via {method}').replace('{method}', methodDisplayName)}
            </span>
          </p>
          <div className="checkout-payment-account-row">
            <span className="checkout-payment-account-label">{accountLabel}:</span>
            <span className="checkout-payment-account-number">
              {selectedMethodData.accountNumber}
            </span>
            <CopyButton
              text={selectedMethodData.accountNumber}
              label={`${t.checkout?.copy || 'Copy'} ${selectedMethodData.name} ${t.checkout?.accountLabel || 'account'}`}
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
              {(t.checkout?.uploadHint || 'JPEG, PNG, or WebP (max {size}MB)').replace('{size}', maxSizeMB)}
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

      {/* ── Discount Code Input ── */}
      <div style={{ marginBottom: '1rem' }}>
        <DiscountCodeInput
          purchaseInfo={{
            amount,
            courseType: purchaseMode,
            selectedPhases,
          }}
          onDiscountApplied={onDiscountApplied}
          onDiscountRemoved={onDiscountRemoved}
        />
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
            <span>{t.checkout?.completeEnrollment || 'Complete Enrollment & Unlock Portal'}</span>
          </>
        )}
      </button>
    </form>
  );
};

export default CheckoutForm;