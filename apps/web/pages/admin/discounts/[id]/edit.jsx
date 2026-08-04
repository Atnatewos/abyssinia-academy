/**
 * @fileoverview Admin Edit Discount Code Page
 * Form to edit an existing promotional discount code.
 * Path: apps/web/pages/admin/discounts/[id]/edit.jsx
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Tag, Save } from 'lucide-react';
import Link from 'next/link';
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import { useLanguage } from '../../../../context/LanguageContext';
import { useToast } from '../../../../context/ToastContext';
import apiClient from '../../../../lib/api';
import { getItem } from '../../../../lib/storage';

/**
 * AdminEditDiscountPage — Edit an existing discount code.
 */
const AdminEditDiscountPage = () => {
  const router = useRouter();
  const { id } = router.query;
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  /*
   * Fetch existing discount code data
   */
  useEffect(() => {
    if (!id) return;

    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchDiscount = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/admin/discounts/${id}`);
        if (response && response.success && response.data) {
          const d = response.data;
          setFormData({
            code: d.code || '',
            type: d.type || 'percentage',
            value: d.value?.toString() || '',
            maxTotalUses: d.max_total_uses ?? 100,
            maxUsesPerUser: d.max_uses_per_user ?? 1,
            minPurchaseAmount: d.min_purchase_amount ?? 0,
            eligibleForFullCourse: d.eligible_for_full_course ?? true,
            eligiblePhases: d.eligible_phases ? d.eligible_phases.join(', ') : '',
            firstTimeOnly: d.first_time_only ?? false,
            validFrom: d.valid_from ? d.valid_from.split('T')[0] : '',
            validUntil: d.valid_until ? d.valid_until.split('T')[0] : '',
            description: d.description || '',
            status: d.status || 'active',
          });
        }
      } catch (err) {
        toast.error('Failed to load discount code.');
        router.push('/admin/discounts');
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [id, router, toast]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = 'Discount code is required.';
    if (!formData.value || Number(formData.value) <= 0) newErrors.value = 'Discount value is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);

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

      const response = await apiClient.put(`/admin/discounts/${id}`, payload);

      if (response && response.success) {
        toast.success(t.discounts?.formUpdated || 'Discount code updated successfully!');
        router.push('/admin/discounts');
      } else {
        toast.error(response?.message || 'Failed to update discount code.');
      }
    } catch (err) {
      toast.error('Failed to update discount code.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Discount Code">
        <div className="spinner" style={{ marginTop: '4rem' }}>
          <div className="spinner-circle" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <SEOHead title={t.discounts?.adminEdit || 'Edit Discount Code'} />
      <AdminLayout
        title={t.discounts?.adminEdit || 'Edit Discount Code'}
        subtitle={`Editing: ${formData.code}`}
      >
        <Link href="/admin/discounts" className="profile-back-link">
          <ArrowLeft size={16} />
          Back to Discount Codes
        </Link>

        <form onSubmit={handleSubmit} className="admin-discount-form">
          <div className="profile-form-field">
            <label>{t.discounts?.formCode || 'Discount Code'}</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              className={`profile-form-input ${errors.code ? 'error' : ''}`}
              style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
              readOnly
            />
            {errors.code && <p className="profile-form-field-error">{errors.code}</p>}
          </div>

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
              className={`profile-form-input ${errors.value ? 'error' : ''}`}
            />
            {errors.value && <p className="profile-form-field-error">{errors.value}</p>}
          </div>

          <div className="admin-form-row">
            <div className="profile-form-field">
              <label>{t.discounts?.formMaxUses || 'Max Total Uses'}</label>
              <input type="number" value={formData.maxTotalUses} onChange={(e) => handleChange('maxTotalUses', e.target.value)} className="profile-form-input" />
            </div>
            <div className="profile-form-field">
              <label>{t.discounts?.formMaxUsesPerUser || 'Max Uses Per User'}</label>
              <input type="number" value={formData.maxUsesPerUser} onChange={(e) => handleChange('maxUsesPerUser', e.target.value)} className="profile-form-input" />
            </div>
          </div>

          <div className="profile-form-field">
            <label>{t.discounts?.formMinPurchase || 'Min Purchase (ETB)'}</label>
            <input type="number" value={formData.minPurchaseAmount} onChange={(e) => handleChange('minPurchaseAmount', e.target.value)} className="profile-form-input" />
          </div>

          <div className="admin-form-row">
            <div className="profile-form-field">
              <label className="admin-checkbox-label">
                <input type="checkbox" checked={formData.eligibleForFullCourse} onChange={(e) => handleChange('eligibleForFullCourse', e.target.checked)} className="admin-checkbox" />
                <span>{t.discounts?.formFullCourse || 'Full Course'}</span>
              </label>
            </div>
            <div className="profile-form-field">
              <label className="admin-checkbox-label">
                <input type="checkbox" checked={formData.firstTimeOnly} onChange={(e) => handleChange('firstTimeOnly', e.target.checked)} className="admin-checkbox" />
                <span>{t.discounts?.formFirstTimeOnly || 'First-Time Only'}</span>
              </label>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="profile-form-field">
              <label>{t.discounts?.formValidFrom || 'Valid From'}</label>
              <input type="date" value={formData.validFrom} onChange={(e) => handleChange('validFrom', e.target.value)} className="profile-form-input" />
            </div>
            <div className="profile-form-field">
              <label>{t.discounts?.formValidUntil || 'Valid Until'}</label>
              <input type="date" value={formData.validUntil} onChange={(e) => handleChange('validUntil', e.target.value)} className="profile-form-input" />
            </div>
          </div>

          <div className="profile-form-field">
            <label>{t.discounts?.formStatus || 'Status'}</label>
            <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="admin-select" style={{ width: '100%', padding: '0.625rem 0.875rem' }}>
              <option value="active">{t.discounts?.adminActive || 'Active'}</option>
              <option value="paused">{t.discounts?.adminPaused || 'Paused'}</option>
              <option value="disabled">{t.discounts?.adminDisabled || 'Disabled'}</option>
            </select>
          </div>

          <div className="profile-form-field">
            <label>{t.discounts?.formDescription || 'Description'}</label>
            <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="profile-form-input" rows={3} />
          </div>

          <button type="submit" disabled={saving} className="profile-form-submit">
            <Save size={16} />
            <span>{saving ? (t.discounts?.formSaving || 'Saving...') : (t.discounts?.formSave || 'Save Discount Code')}</span>
          </button>
        </form>
      </AdminLayout>
    </>
  );
};

export default AdminEditDiscountPage;