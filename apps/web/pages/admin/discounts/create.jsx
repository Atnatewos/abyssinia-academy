/**
 * @fileoverview Admin Create Discount Code Page
 * Form to create a new promotional discount code.
 * Path: apps/web/pages/admin/discounts/create.jsx
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Tag, Save } from 'lucide-react';
import Link from 'next/link';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/**
 * AdminCreateDiscountPage — Create a new discount code.
 */
const AdminCreateDiscountPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    maxTotalUses: 100,
    maxUsesPerUser: 1,
    minPurchaseAmount: 0,
    eligibleForFullCourse: true,
    eligiblePhases: '',
    firstTimeOnly: false,
    validFrom: '',
    validUntil: '',
    description: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Handle form field changes
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validate the form before submission
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = t.discounts?.codeRequired || 'Discount code is required.';
    } else if (formData.code.trim().length < 4) {
      newErrors.code = (t.discounts?.codeTooShort || 'Code must be at least {min} characters.').replace('{min}', '4');
    }

    if (!formData.value || isNaN(formData.value) || Number(formData.value) <= 0) {
      newErrors.value = t.discounts?.valueRequired || 'Discount value is required.';
    }

    if (formData.type === 'percentage' && Number(formData.value) > 100) {
      newErrors.value = (t.discounts?.valueTooHigh || 'Maximum discount is {max}%.').replace('{max}', '100');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        maxTotalUses: Number(formData.maxTotalUses),
        maxUsesPerUser: Number(formData.maxUsesPerUser),
        minPurchaseAmount: Number(formData.minPurchaseAmount),
        eligibleForFullCourse: formData.eligibleForFullCourse,
        eligiblePhases: formData.eligiblePhases
          ? formData.eligiblePhases.split(',').map((p) => p.trim()).filter(Boolean)
          : null,
        firstTimeOnly: formData.firstTimeOnly,
        validFrom: formData.validFrom || null,
        validUntil: formData.validUntil || null,
        description: formData.description.trim() || null,
        status: formData.status,
      };

      const response = await apiClient.post('/admin/discounts', payload);

      if (response && response.success) {
        toast.success(t.discounts?.formCreated || 'Discount code created successfully!');
        router.push('/admin/discounts');
      } else {
        toast.error(response?.message || 'Failed to create discount code.');
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to create discount code.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead title={t.discounts?.adminCreate || 'Create Discount Code'} />
      <AdminLayout
        title={t.discounts?.adminCreate || 'Create Discount Code'}
        subtitle="Create a new promotional discount code"
      >
        {/* Back Link */}
        <Link href="/admin/discounts" className="profile-back-link">
          <ArrowLeft size={16} />
          Back to Discount Codes
        </Link>

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-discount-form">
          {/* Code */}
          <div className="profile-form-field">
            <label>{t.discounts?.formCode || 'Discount Code'}</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder={t.discounts?.formCodePlaceholder || 'e.g., LAUNCH2026'}
              className={`profile-form-input ${errors.code ? 'error' : ''}`}
              maxLength={20}
              style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
            />
            {errors.code && <p className="profile-form-field-error">{errors.code}</p>}
          </div>

          {/* Type */}
          <div className="profile-form-field">
            <label>{t.discounts?.formType || 'Discount Type'}</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="admin-select"
              style={{ width: '100%', padding: '0.625rem 0.875rem' }}
            >
              <option value="percentage">{t.discounts?.adminPercentage || 'Percentage'}</option>
              <option value="fixed_amount">{t.discounts?.adminFixedAmount || 'Fixed Amount'}</option>
            </select>
          </div>

          {/* Value */}
          <div className="profile-form-field">
            <label>
              {formData.type === 'percentage'
                ? (t.discounts?.formValuePercent || 'Percentage (%)')
                : (t.discounts?.formValueFixed || 'Amount (ETB)')}
            </label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) => handleChange('value', e.target.value)}
              placeholder={formData.type === 'percentage' ? '25' : '500'}
              className={`profile-form-input ${errors.value ? 'error' : ''}`}
              min="0"
              max={formData.type === 'percentage' ? '100' : '10000'}
            />
            {errors.value && <p className="profile-form-field-error">{errors.value}</p>}
          </div>

          {/* Max Uses */}
          <div className="admin-form-row">
            <div className="profile-form-field">
              <label>{t.discounts?.formMaxUses || 'Maximum Total Uses'}</label>
              <input
                type="number"
                value={formData.maxTotalUses}
                onChange={(e) => handleChange('maxTotalUses', e.target.value)}
                className="profile-form-input"
                min="0"
              />
            </div>
            <div className="profile-form-field">
              <label>{t.discounts?.formMaxUsesPerUser || 'Maximum Uses Per User'}</label>
              <input
                type="number"
                value={formData.maxUsesPerUser}
                onChange={(e) => handleChange('maxUsesPerUser', e.target.value)}
                className="profile-form-input"
                min="0"
              />
            </div>
          </div>

          {/* Min Purchase */}
          <div className="profile-form-field">
            <label>{t.discounts?.formMinPurchase || 'Minimum Purchase Amount (ETB)'}</label>
            <input
              type="number"
              value={formData.minPurchaseAmount}
              onChange={(e) => handleChange('minPurchaseAmount', e.target.value)}
              className="profile-form-input"
              min="0"
            />
          </div>

          {/* Eligibility */}
          <div className="admin-form-row">
            <div className="profile-form-field">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.eligibleForFullCourse}
                  onChange={(e) => handleChange('eligibleForFullCourse', e.target.checked)}
                  className="admin-checkbox"
                />
                <span>{t.discounts?.formFullCourse || 'Full Course'}</span>
              </label>
            </div>
            <div className="profile-form-field">
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.firstTimeOnly}
                  onChange={(e) => handleChange('firstTimeOnly', e.target.checked)}
                  className="admin-checkbox"
                />
                <span>{t.discounts?.formFirstTimeOnly || 'First-Time Enrollees Only'}</span>
              </label>
            </div>
          </div>

          {/* Dates */}
          <div className="admin-form-row">
            <div className="profile-form-field">
              <label>{t.discounts?.formValidFrom || 'Valid From'}</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => handleChange('validFrom', e.target.value)}
                className="profile-form-input"
              />
            </div>
            <div className="profile-form-field">
              <label>{t.discounts?.formValidUntil || 'Valid Until'}</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => handleChange('validUntil', e.target.value)}
                className="profile-form-input"
              />
            </div>
          </div>

          {/* Status */}
          <div className="profile-form-field">
            <label>{t.discounts?.formStatus || 'Status'}</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="admin-select"
              style={{ width: '100%', padding: '0.625rem 0.875rem' }}
            >
              <option value="active">{t.discounts?.adminActive || 'Active'}</option>
              <option value="paused">{t.discounts?.adminPaused || 'Paused'}</option>
              <option value="disabled">{t.discounts?.adminDisabled || 'Disabled'}</option>
            </select>
          </div>

          {/* Description */}
          <div className="profile-form-field">
            <label>{t.discounts?.formDescription || 'Description (Internal Notes)'}</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="profile-form-input"
              rows={3}
              placeholder="Launch promotion for new cohort"
            />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="profile-form-submit">
            <Save size={16} />
            <span>
              {loading
                ? (t.discounts?.formSaving || 'Saving...')
                : (t.discounts?.formSave || 'Save Discount Code')}
            </span>
          </button>
        </form>
      </AdminLayout>
    </>
  );
};

export default AdminCreateDiscountPage;