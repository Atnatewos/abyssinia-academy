/**
 * @fileoverview Checkout Form Component
 * Payment submission form with transaction reference and screenshot upload
 * ALL display text from i18n → t.checkout.* — zero hardcoded strings
 * Path: apps/web/components/payment/CheckoutForm.jsx
 */

import { useState, useMemo, useCallback } from 'react';
import { ShieldCheck, RefreshCw, Upload, X, Copy, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getScreenshotUploadConfig } from '../../lib/config';

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
    <button type="button" onClick={handleCopy} className="copy-btn" aria-label={label} title={copied ? (t.checkout?.copied || 'Copied!') : (t.checkout?.copy || 'Copy')}>
      {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
    </button>
  );
};

/**
 * CheckoutForm — Payment submission form
 */
const CheckoutForm = ({ selectedMethod = '', selectedMethodData = null, amount = 0, currency = 'ETB', onSubmit, loading = false }) => {
  const { t, language } = useLanguage();
  const toast = useToast();

  const uploadConfig = useMemo(() => getScreenshotUploadConfig(), []);
  const maxFileSize = uploadConfig.maxSize || 5 * 1024 * 1024;
  const allowedTypes = uploadConfig.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));

  const [formData, setFormData] = useState({ fullName: '', phone: '', transactionRef: '', screenshot: null });
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) { setFormData((p) => ({ ...p, screenshot: null })); setScreenshotPreview(null); return; }
    if (!allowedTypes.includes(file.type)) { toast.error(t.checkout?.invalidFileType || 'Please upload a JPEG, PNG, or WebP image.'); e.target.value = ''; return; }
    if (file.size > maxFileSize) { toast.error((t.checkout?.fileTooLarge || 'File size must be under {size}MB.').replace('{size}', maxSizeMB)); e.target.value = ''; return; }
    setFormData((p) => ({ ...p, screenshot: file }));
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleRemoveScreenshot = () => { setFormData((p) => ({ ...p, screenshot: null })); setScreenshotPreview(null); };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = t.checkout?.fullNameRequired || 'Full name is required.';
    if (!formData.phone.trim()) newErrors.phone = t.checkout?.phoneRequired || 'Phone number is required.';
    if (!formData.transactionRef.trim()) newErrors.transactionRef = t.checkout?.transactionRefRequired || 'Transaction reference is required.';
    if (!selectedMethod) newErrors.method = t.checkout?.paymentMethodRequired || 'Please select a payment method.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({ fullName: formData.fullName.trim(), phone: formData.phone.trim(), paymentMethod: selectedMethod, transactionRef: formData.transactionRef.trim(), screenshot: formData.screenshot });
  };

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const methodDisplayName = language === 'am' ? (selectedMethodData?.nameAm || selectedMethodData?.name || selectedMethod) : (selectedMethodData?.name || selectedMethod);
  const methodInstructions = language === 'am' ? (selectedMethodData?.instructionsAm || selectedMethodData?.instructions || '') : (selectedMethodData?.instructions || '');
  const accountLabel = selectedMethodData?.bankName
    ? (t.checkout?.bankLabel || 'Bank: {bankName}').replace('{bankName}', selectedMethodData.bankName)
    : (t.checkout?.accountLabel || 'Account');

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="checkout-field">
        <label htmlFor="checkout-fullname">{t.checkout?.fullName || 'Full Name'}</label>
        <input id="checkout-fullname" type="text" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} placeholder="Abebe Kebede" className={`checkout-input ${errors.fullName ? 'error' : ''}`} autoComplete="name" />
        {errors.fullName && <p className="checkout-error">{errors.fullName}</p>}
      </div>

      <div className="checkout-field">
        <label htmlFor="checkout-phone">{t.checkout?.phone || 'Phone Number'}</label>
        <input id="checkout-phone" type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+251 911 234 567" className={`checkout-input ${errors.phone ? 'error' : ''}`} autoComplete="tel" />
        {errors.phone && <p className="checkout-error">{errors.phone}</p>}
      </div>

      <div className="checkout-field">
        <label htmlFor="checkout-transaction-ref">{t.checkout?.transactionRef || 'Transaction Reference Number'}</label>
        <input id="checkout-transaction-ref" type="text" value={formData.transactionRef} onChange={(e) => handleChange('transactionRef', e.target.value)} placeholder="Enter the transaction ID" className={`checkout-input ${errors.transactionRef ? 'error' : ''}`} />
        {errors.transactionRef && <p className="checkout-error">{errors.transactionRef}</p>}
      </div>

      {selectedMethodData && (
        <div className="checkout-payment-info">
          <p className="checkout-payment-method-name">
            <span className="label">{(t.checkout?.payVia || 'Pay via {method}').replace('{method}', methodDisplayName)}</span>
          </p>
          <div className="checkout-payment-account-row">
            <span className="checkout-payment-account-label">{accountLabel}:</span>
            <span className="checkout-payment-account-number">{selectedMethodData.accountNumber}</span>
            <CopyButton text={selectedMethodData.accountNumber} label={`${t.checkout?.copy || 'Copy'} ${selectedMethodData.name} ${t.checkout?.accountLabel || 'account'}`} />
          </div>
          {selectedMethodData.accountName && (
            <p className="checkout-payment-account-name">{t.checkout?.accountNameLabel || 'Account Name:'} <span>{selectedMethodData.accountName}</span></p>
          )}
          {methodInstructions && <p className="checkout-payment-instructions">{methodInstructions}</p>}
        </div>
      )}

      <div className="checkout-field">
        <label>{t.checkout?.uploadScreenshot || 'Upload Payment Screenshot'} <span className="checkout-field-optional">(Optional)</span></label>
        {screenshotPreview ? (
          <div className="checkout-upload-preview">
            <img src={screenshotPreview} alt="Payment screenshot preview" />
            <button type="button" onClick={handleRemoveScreenshot} className="checkout-upload-remove" aria-label="Remove screenshot"><X size={16} /></button>
          </div>
        ) : (
          <label className="checkout-upload-label">
            <Upload size={24} />
            <span className="checkout-upload-text">{t.checkout?.clickToUpload || 'Click to upload screenshot'}</span>
            <span className="checkout-upload-hint">{(t.checkout?.uploadHint || 'JPEG, PNG, or WebP (max {size}MB)').replace('{size}', maxSizeMB)}</span>
            <input type="file" accept={allowedTypes.join(',')} onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        )}
      </div>

      <div className="checkout-total">
        <span>{t.checkout?.tuitionFee || 'Tuition Fee'}</span>
        <span className="checkout-total-amount">{amount.toLocaleString()} {currency}</span>
      </div>

      {errors.method && <p className="checkout-error">{errors.method}</p>}

      <button type="submit" disabled={loading} className="checkout-submit-btn">
        {loading ? (<><RefreshCw size={16} className="animate-spin" /><span>{t.checkout?.verifying || 'Verifying...'}</span></>) : (<><ShieldCheck size={16} /><span>{t.checkout?.completeEnrollment || 'Complete Enrollment & Unlock Portal'}</span></>)}
      </button>
    </form>
  );
};

export default CheckoutForm;