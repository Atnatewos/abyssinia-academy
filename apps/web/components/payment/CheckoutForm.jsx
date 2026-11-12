/**
 * @fileoverview Checkout Form Component
 *
 * Contact details, agent code accordion, screenshot upload, and submit.
 * Uses a semantic <details> element for the discount/agent code section
 * so it collapses by default and expands on click.
 *
 * Path: apps/web/components/payment/CheckoutForm.jsx
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Upload, X, Copy, Check, Tag, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getScreenshotUploadConfig } from '../../lib/config';
import DiscountBreakdown from '../discount/DiscountBreakdown';
import AgentCodeInput from '../agents/AgentCodeInput';

const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [text]);

  return (
    <button type="button" onClick={handleCopy} className="copy-btn" aria-label={label} title={label}>
      {copied ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
    </button>
  );
};

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
  initialAgentCode = '',
  initialAgentName = '',
  isAgentBuyer = false,
  courseId,
  resellerCode,
}) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const toast = useToast();

  const uploadConfig = useMemo(() => getScreenshotUploadConfig(), []);
  const maxFileSize = uploadConfig.maxSize || 5 * 1024 * 1024;
  const allowedTypes = uploadConfig.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));

  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    transactionRef: '',
    screenshot: null,
    agentId: null,
  });
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.full_name || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      toast.error(t.checkout?.invalidFileType || 'Invalid file type.');
      e.target.value = '';
      return;
    }
    if (file.size > maxFileSize) {
      toast.error((t.checkout?.fileTooLarge || 'File too large.').replace('{size}', maxSizeMB));
      e.target.value = '';
      return;
    }
    setFormData((p) => ({ ...p, screenshot: file }));
    setScreenshotPreview(URL.createObjectURL(file));
    if (errors.referenceOrScreenshot) setErrors((p) => ({ ...p, referenceOrScreenshot: '' }));
  };

  const handleRemoveScreenshot = () => {
    setFormData((p) => ({ ...p, screenshot: null }));
    setScreenshotPreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = t.checkout?.fullNameRequired || 'Full name required.';
    if (!formData.phone.trim()) newErrors.phone = t.checkout?.phoneRequired || 'Phone required.';
    if (!selectedMethod) newErrors.method = t.checkout?.paymentMethodRequired || 'Select payment method.';
    if (!formData.transactionRef.trim() && !formData.screenshot) {
      newErrors.referenceOrScreenshot = 'Please provide either a transaction reference or a screenshot.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      paymentMethod: selectedMethod,
      transactionRef: formData.transactionRef.trim() || undefined,
      screenshot: formData.screenshot,
      agentId: formData.agentId,
      courseId: courseId || null,
      resellerCode: resellerCode || null,
    });
  };

  const handleChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
    if (field === 'transactionRef' && value.trim() && errors.referenceOrScreenshot) {
      setErrors((p) => ({ ...p, referenceOrScreenshot: '' }));
    }
  };

  const handleAgentApplied = useCallback((agentData) => {
    setFormData((p) => ({ ...p, agentId: agentData?.agentUserId || agentData?.code || null }));
  }, []);

  const handleAgentRemoved = useCallback(() => {
    setFormData((p) => ({ ...p, agentId: null }));
  }, []);

  const methodDisplayName = language === 'am' ? selectedMethodData?.nameAm || selectedMethodData?.name : selectedMethodData?.name || selectedMethod;
  const methodInstructions = language === 'am' ? selectedMethodData?.instructionsAm || selectedMethodData?.instructions : selectedMethodData?.instructions;
  const accountLabel = selectedMethodData?.bankName
    ? (t.checkout?.bankLabel || 'Bank: {bankName}').replace('{bankName}', selectedMethodData.bankName)
    : t.checkout?.accountLabel || 'Account';

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      {user && (
        <div className="checkout-autofill-banner">
          <User size={14} />
          <span>Auto-filled from your profile. You can edit if needed.</span>
        </div>
      )}

      {selectedMethodData && (
        <div className="checkout-payment-info">
          <p className="checkout-payment-method-name">
            <span className="label">{(t.checkout?.payVia || 'Pay via {method}').replace('{method}', methodDisplayName)}</span>
          </p>
          <div className="checkout-payment-account-row">
            <span className="checkout-payment-account-label">{accountLabel}:</span>
            <span className="checkout-payment-account-number">{selectedMethodData.accountNumber}</span>
            <CopyButton text={selectedMethodData.accountNumber} label="Copy" />
          </div>
          {selectedMethodData.accountName && (
            <p className="checkout-payment-account-name">
              {t.checkout?.accountNameLabel || 'Account Name:'} <span>{selectedMethodData.accountName}</span>
            </p>
          )}
          {methodInstructions && <p className="checkout-payment-instructions">{methodInstructions}</p>}
        </div>
      )}

      <div className="checkout-form-row">
        <div className="checkout-field">
          <label htmlFor="fullname">{t.checkout?.fullName || 'Full Name'}</label>
          <input id="fullname" type="text" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className={`checkout-input ${errors.fullName ? 'error' : ''}`} />
          {errors.fullName && <p className="checkout-error">{errors.fullName}</p>}
        </div>
        <div className="checkout-field">
          <label htmlFor="phone">{t.checkout?.phone || 'Phone Number'}</label>
          <input id="phone" type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className={`checkout-input ${errors.phone ? 'error' : ''}`} />
          {errors.phone && <p className="checkout-error">{errors.phone}</p>}
        </div>
      </div>

      <div className="checkout-field">
        <label htmlFor="txref">{t.checkout?.transactionRef || 'Transaction Reference'}</label>
        <input
          id="txref"
          type="text"
          value={formData.transactionRef}
          onChange={(e) => handleChange('transactionRef', e.target.value)}
          placeholder="Enter transaction ID (or upload screenshot below)"
          className={`checkout-input ${errors.referenceOrScreenshot && !formData.screenshot ? 'error' : ''}`}
        />
      </div>

      {!isAgentBuyer && (
        <details className="checkout-details-accordion">
          <summary>
            <Tag size={14} />
            <span>Have a discount or agent code?</span>
          </summary>
          <div className="checkout-details-body">
            <AgentCodeInput onAgentApplied={handleAgentApplied} onAgentRemoved={handleAgentRemoved} initialCode={initialAgentCode} initialAgentName={initialAgentName} />
          </div>
        </details>
      )}

      <div className="checkout-field">
        <label>{t.checkout?.uploadScreenshot || 'Upload Screenshot'} <span className="checkout-field-optional">(Optional)</span></label>
        {screenshotPreview ? (
          <div className="checkout-upload-preview">
            <img src={screenshotPreview} alt="Preview" />
            <button type="button" onClick={handleRemoveScreenshot} className="checkout-upload-remove"><X size={16} /></button>
          </div>
        ) : (
          <label className="checkout-upload-label">
            <Upload size={24} />
            <span className="checkout-upload-text">{t.checkout?.clickToUpload || 'Click to upload'}</span>
            <span className="checkout-upload-hint">{(t.checkout?.uploadHint || 'JPEG, PNG, WebP').replace('{size}', maxSizeMB)}</span>
            <input type="file" accept={allowedTypes.join(',')} onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        )}
        {errors.referenceOrScreenshot && <p className="checkout-error">{errors.referenceOrScreenshot}</p>}
      </div>

      {discountBreakdown && discountBreakdown.totalDiscountPercent > 0 && (
        <DiscountBreakdown basePrice={amount} breakdown={discountBreakdown} discountCode={discountCode} discountCodePercent={discountCodePercent} referralPercent={isAgentBuyer ? 10 : 0} currency={currency} />
      )}

      <div className="checkout-total">
        <span>{t.checkout?.tuitionFee || 'Tuition Fee'}</span>
        <span className="checkout-total-amount">{amount.toLocaleString()} {currency}</span>
      </div>

      {errors.method && <p className="checkout-error">{errors.method}</p>}

      <button type="submit" disabled={loading} className="checkout-submit-btn">
        {loading ? <><RefreshCw size={16} className="animate-spin" /><span>{t.checkout?.verifying || 'Verifying...'}</span></> : <><ShieldCheck size={16} /><span>{t.checkout?.completeEnrollment || 'Complete Enrollment'}</span></>}
      </button>
    </form>
  );
};

export default CheckoutForm;