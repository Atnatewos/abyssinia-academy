/**
 * @fileoverview Checkout Form Component
 * Payment submission form with transaction reference and screenshot upload
 * Path: apps/web/components/payment/CheckoutForm.jsx
 */

import { useState } from 'react';
import { ShieldCheck, RefreshCw, Upload, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

const CheckoutForm = ({ selectedMethod = '', methods = [], amount = 0, onSubmit, loading = false, selectedMethodData = null }) => {
  const { t } = useLanguage();
  const toast = useToast();

  const [formData, setFormData] = useState({ fullName: '', phone: '', transactionRef: '', screenshot: null });
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) { setFormData((p) => ({ ...p, screenshot: null })); setScreenshotPreview(null); return; }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { toast.error('Please upload a JPEG, PNG, or WebP image.'); e.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('File size must be under 5MB.'); e.target.value = ''; return; }
    setFormData((p) => ({ ...p, screenshot: file }));
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleRemoveScreenshot = () => { setFormData((p) => ({ ...p, screenshot: null })); setScreenshotPreview(null); };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!formData.transactionRef.trim()) newErrors.transactionRef = 'Transaction reference is required.';
    if (!selectedMethod) newErrors.method = 'Please select a payment method.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit({ fullName: formData.fullName.trim(), phone: formData.phone.trim(), paymentMethod: selectedMethod, transactionRef: formData.transactionRef.trim(), screenshot: formData.screenshot });
  };

  const handleChange = (field, value) => { setFormData((p) => ({ ...p, [field]: value })); if (errors[field]) setErrors((p) => ({ ...p, [field]: '' })); };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="checkout-field">
        <label>{t.checkout?.fullName || 'Full Name'}</label>
        <input type="text" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} placeholder="Abebe Kebede" className={`checkout-input ${errors.fullName ? 'error' : ''}`} />
        {errors.fullName && <p className="checkout-error">{errors.fullName}</p>}
      </div>
      <div className="checkout-field">
        <label>{t.checkout?.phone || 'Phone Number'}</label>
        <input type="text" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+251 911 234 567" className={`checkout-input ${errors.phone ? 'error' : ''}`} />
        {errors.phone && <p className="checkout-error">{errors.phone}</p>}
      </div>
      <div className="checkout-field">
        <label>{t.checkout?.transactionRef || 'Transaction Reference Number'}</label>
        <input type="text" value={formData.transactionRef} onChange={(e) => handleChange('transactionRef', e.target.value)} placeholder="Enter the transaction ID" className={`checkout-input ${errors.transactionRef ? 'error' : ''}`} />
        {errors.transactionRef && <p className="checkout-error">{errors.transactionRef}</p>}
      </div>
      {selectedMethodData && (
        <div className="checkout-payment-info">
          <p><span className="label">Pay via {selectedMethodData.name}</span></p>
          <p style={{ color: 'var(--text-muted)' }}>Account: <span className="account">{selectedMethodData.accountNumber}</span></p>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.688rem', lineHeight: 1.6 }}>{selectedMethodData.instructions}</p>
        </div>
      )}
      <div className="checkout-field">
        <label>{t.checkout?.uploadScreenshot || 'Upload Payment Screenshot'} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(Optional)</span></label>
        {screenshotPreview ? (
          <div className="checkout-upload-preview">
            <img src={screenshotPreview} alt="Screenshot preview" />
            <button type="button" onClick={handleRemoveScreenshot} className="checkout-upload-remove"><X size={16} /></button>
          </div>
        ) : (
          <label className="checkout-upload-label">
            <Upload size={24} />
            <span className="checkout-upload-text">Click to upload screenshot</span>
            <span className="checkout-upload-hint">JPEG, PNG, or WebP (max 5MB)</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        )}
      </div>
      <div className="checkout-total">
        <span>{t.checkout?.tuitionFee || 'Tuition Fee'}</span>
        <span className="checkout-total-amount">{amount.toLocaleString()} ETB</span>
      </div>
      {errors.method && <p className="checkout-error">{errors.method}</p>}
      <button type="submit" disabled={loading} className="checkout-submit-btn">
        {loading ? <><RefreshCw size={16} className="animate-spin" /><span>{t.checkout?.verifying || 'Verifying...'}</span></> : <><ShieldCheck size={16} /><span>{t.checkout?.completeEnrollment || 'Complete Enrollment & Unlock Portal'}</span></>}
      </button>
    </form>
  );
};

export default CheckoutForm;