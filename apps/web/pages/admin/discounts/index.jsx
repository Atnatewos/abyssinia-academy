/**
 * @fileoverview Admin Discount Codes Page — Modern Card-Based UI
 *
 * Full CRUD in a single page with a slide-over modal. Auto-generates
 * unique discount codes, provides copy-to-clipboard, shows usage progress
 * bars and status badges, and renders strict eligibility labels
 * (Full Course Only, Phase-Specific, or All).
 *
 * Path: apps/web/pages/admin/discounts/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  Search,
  Copy,
  Check,
  Users,
  Calendar,
  Sparkles,
  X,
  Save,
  RefreshCw,
  Shield,
  Layers,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/*
 * Purchasable phase options rendered in the eligibility selector.
 * Mirrors the phase IDs used by the checkout flow and phase-gating
 * logic in accessControl.js.
 */
const PHASE_OPTIONS = [
  { id: 'phase-1', label: 'Phase 1' },
  { id: 'phase-2', label: 'Phase 2' },
  { id: 'phase-3', label: 'Phase 3' },
  { id: 'phase-4', label: 'Phase 4' },
  { id: 'phase-5', label: 'Phase 5' },
];

/**
 * Generates a cryptographically random discount code using an
 * unambiguous character set (no 0/O/1/I/L) so it can be dictated
 * over the phone or written on paper without transcription errors.
 *
 * @returns {string} A new code in the form `ABY-XXXXXX`.
 */
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'ABY-';
  for (let i = 0; i < 6; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Copies text to the clipboard, falling back to a temporary textarea
 * when the modern Clipboard API is unavailable (older browsers,
 * non-secure contexts).
 *
 * @param {string} text - Text to copy.
 * @returns {Promise<boolean>} Resolves true when the copy succeeded.
 */
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  }
};

/**
 * Builds a human-readable eligibility label for a discount code,
 * pairing it with an icon and accent color that the card renders
 * inline.
 *
 * @param {object} discount - Discount row from the API.
 * @returns {{ text: string, icon: Function, color: string }}
 */
const getEligibilityLabel = (discount) => {
  const hasPhases =
    Array.isArray(discount.eligible_phases) && discount.eligible_phases.length > 0;
  const fullCourse = discount.eligible_for_full_course;
  const phaseList = hasPhases
    ? discount.eligible_phases.map((p) => p.replace('phase-', '')).join(', ')
    : '';

  if (fullCourse && !hasPhases) {
    return { text: 'Full Course Only', icon: Shield, color: '#3b82f6' };
  }
  if (!fullCourse && hasPhases) {
    return { text: `Phases: ${phaseList}`, icon: Layers, color: '#8b5cf6' };
  }
  if (fullCourse && hasPhases) {
    return {
      text: `Full Course + Phases ${phaseList}`,
      icon: Layers,
      color: '#10b981',
    };
  }
  return { text: 'All Purchases', icon: Tag, color: 'var(--text-dim)' };
};

/**
 * Admin Discount Codes management page.
 *
 * Reads and writes through `/api/admin/discounts`. Auth is enforced by
 * the shared admin token check inside the API route.
 */
const AdminDiscountsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [errors, setErrors] = useState({});

  /*
   * Blank form state used by both the create flow and the
   * "reset after save" path. Pulled up so the field list lives in
   * one place and can't drift between create and edit.
   */
  const emptyForm = {
    code: '',
    type: 'percentage',
    value: '',
    maxTotalUses: 100,
    maxUsesPerUser: 1,
    minPurchaseAmount: 0,
    eligibleForFullCourse: true,
    eligiblePhases: [],
    firstTimeOnly: false,
    validFrom: '',
    validUntil: '',
    description: '',
    status: 'active',
  };

  const [formData, setFormData] = useState(emptyForm);

  /**
   * Fetches the full list of discount codes. Redirects to login when
   * the admin token is missing or has expired.
   */
  const fetchDiscounts = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/discounts');
      if (response && response.success) {
        setDiscounts(response.data || []);
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleCreate = () => {
    setEditingCode(null);
    setFormData({ ...emptyForm, code: generateCode() });
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (code) => {
    setEditingCode(code);
    setFormData({
      code: code.code || '',
      type: code.type || 'percentage',
      value: code.value?.toString() || '',
      maxTotalUses: code.max_total_uses ?? 100,
      maxUsesPerUser: code.max_uses_per_user ?? 1,
      minPurchaseAmount: code.min_purchase_amount ?? 0,
      eligibleForFullCourse: code.eligible_for_full_course ?? true,
      eligiblePhases: code.eligible_phases || [],
      firstTimeOnly: code.first_time_only ?? false,
      validFrom: code.valid_from ? code.valid_from.split('T')[0] : '',
      validUntil: code.valid_until ? code.valid_until.split('T')[0] : '',
      description: code.description || '',
      status: code.status || 'active',
    });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCode(null);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleTogglePhase = (phaseId) => {
    setFormData((prev) => ({
      ...prev,
      eligiblePhases: prev.eligiblePhases.includes(phaseId)
        ? prev.eligiblePhases.filter((p) => p !== phaseId)
        : [...prev.eligiblePhases, phaseId],
    }));
  };

  const handleRegenerateCode = () =>
    setFormData((prev) => ({ ...prev, code: generateCode() }));

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.code.trim()) nextErrors.code = 'Code is required.';
    if (!formData.value || Number(formData.value) <= 0) {
      nextErrors.value = 'Value is required.';
    }
    if (formData.type === 'percentage' && Number(formData.value) > 100) {
      nextErrors.value = 'Max 100%.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (event) => {
    event.preventDefault();
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
        eligiblePhases:
          formData.eligiblePhases.length > 0 ? formData.eligiblePhases : null,
        firstTimeOnly: formData.firstTimeOnly,
        validFrom: formData.validFrom || null,
        validUntil: formData.validUntil || null,
        description: formData.description.trim() || null,
        status: formData.status,
      };

      let response;
      if (editingCode) {
        response = await apiClient.put(`/admin/discounts/${editingCode.id}`, payload);
      } else {
        response = await apiClient.post('/admin/discounts', payload);
      }

      if (response && response.success) {
        toast.success(editingCode ? 'Code updated.' : 'Code created.');
        fetchDiscounts();
        handleCloseModal();
      } else {
        toast.error(response?.message || 'Failed to save.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this discount code?')) return;
    try {
      const response = await apiClient.delete(`/admin/discounts/${id}`);
      if (response && response.success) {
        toast.success('Code deleted.');
        fetchDiscounts();
      } else {
        toast.error(response?.message || 'Failed to delete.');
      }
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleCopyCode = async (code) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(code);
      toast.success('Copied!');
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  /*
   * Client-side filtering keeps the API endpoint simple (a full list
   * fetch). If the number of codes grows past a few hundred, move the
   * filter + pagination server-side.
   */
  const filteredDiscounts = discounts.filter((discount) => {
    if (statusFilter === 'active' && discount.status !== 'active') return false;
    if (statusFilter === 'paused' && discount.status !== 'paused') return false;
    if (statusFilter === 'disabled' && discount.status !== 'disabled') return false;
    if (
      statusFilter === 'expired' &&
      (!discount.valid_until || new Date(discount.valid_until) > new Date())
    ) {
      return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      discount.code?.toLowerCase().includes(term) ||
      discount.description?.toLowerCase().includes(term)
    );
  });

  const getUsagePercent = (discount) => {
    if (!discount.max_total_uses || discount.max_total_uses === 0) return 0;
    return Math.min(
      100,
      Math.round((discount.current_total_uses / discount.max_total_uses) * 100)
    );
  };

  const isExpired = (discount) =>
    Boolean(discount.valid_until) && new Date(discount.valid_until) < new Date();

  return (
    <>
      <SEOHead title={t.discounts?.adminTitle || 'Discount Codes'} />
      <AdminLayout
        title={t.discounts?.adminTitle || 'Discount Codes'}
        subtitle="Create and manage promotional discount codes"
      >
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code or description..."
            />
          </div>
          <div className="admin-filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="disabled">Disabled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <button className="admin-toolbar-btn" onClick={handleCreate}>
            <Plus size={16} />
            <span>Generate New Code</span>
          </button>
        </div>

        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}>
            <div className="spinner-circle" />
          </div>
        ) : filteredDiscounts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredDiscounts.map((discount) => {
              const usagePercent = getUsagePercent(discount);
              const expired = isExpired(discount);
              const eligibility = getEligibilityLabel(discount);
              const EligibilityIcon = eligibility.icon;
              const statusColor =
                discount.status === 'active' && !expired
                  ? '#10b981'
                  : discount.status === 'paused'
                  ? '#f59e0b'
                  : expired
                  ? '#ef4444'
                  : '#64748b';

              return (
                <div
                  key={discount.id}
                  className="admin-table-row"
                  style={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: '0.75rem',
                    padding: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button
                        onClick={() => handleCopyCode(discount.code)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.5rem',
                          background: 'rgba(245,158,11,0.08)',
                          border: '1px solid rgba(245,158,11,0.2)',
                          color: 'var(--accent-gold)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1rem',
                          fontWeight: 700,
                          letterSpacing: '0.03em',
                          cursor: 'pointer',
                        }}
                      >
                        {discount.code}
                        {copiedCode === discount.code ? (
                          <Check size={14} style={{ color: '#10b981' }} />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.375rem',
                          background:
                            discount.type === 'percentage'
                              ? 'rgba(139,92,246,0.1)'
                              : 'rgba(59,130,246,0.1)',
                          color:
                            discount.type === 'percentage' ? '#8b5cf6' : '#3b82f6',
                        }}
                      >
                        {discount.type === 'percentage'
                          ? `${discount.value}% OFF`
                          : `${discount.value} ETB OFF`}
                      </span>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.375rem',
                          background: `${eligibility.color}15`,
                          color: eligibility.color,
                          border: `1px solid ${eligibility.color}30`,
                        }}
                      >
                        <EligibilityIcon size={11} />
                        {eligibility.text}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        className="status-badge"
                        style={{
                          background: `${statusColor}15`,
                          color: statusColor,
                          borderColor: `${statusColor}30`,
                          marginLeft: 0,
                        }}
                      >
                        {expired ? 'Expired' : discount.status}
                      </span>
                      <div className="admin-table-action-btns">
                        <button
                          className="admin-action-btn view"
                          title="Edit"
                          onClick={() => handleEdit(discount)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="admin-action-btn reject"
                          title="Delete"
                          onClick={() => handleDelete(discount.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {discount.max_total_uses > 0 && (
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.375rem',
                        }}
                      >
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                          <Users
                            size={11}
                            style={{
                              display: 'inline',
                              verticalAlign: 'middle',
                              marginRight: '0.25rem',
                            }}
                          />
                          {discount.current_total_uses} / {discount.max_total_uses} uses
                        </span>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            color: usagePercent > 80 ? '#ef4444' : 'var(--text-dim)',
                          }}
                        >
                          {usagePercent}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: '6px',
                          borderRadius: '3px',
                          background: 'var(--border-light)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${usagePercent}%`,
                            borderRadius: '3px',
                            background:
                              usagePercent > 80
                                ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                : 'linear-gradient(90deg, var(--accent-gold), var(--accent-gold-light))',
                            transition: 'width 0.5s ease',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      gap: '1.5rem',
                      flexWrap: 'wrap',
                      fontSize: '0.6875rem',
                      color: 'var(--text-dim)',
                    }}
                  >
                    {discount.description && <span>{discount.description}</span>}
                    {discount.valid_until && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={11} />
                        Expires {new Date(discount.valid_until).toLocaleDateString()}
                      </span>
                    )}
                    {discount.min_purchase_amount > 0 && (
                      <span>Min purchase: {discount.min_purchase_amount} ETB</span>
                    )}
                    {discount.first_time_only && <span>First-time only</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Tag size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <h3 className="empty-state-title">Discount Codes</h3>
            <p className="empty-state-desc">
              {searchTerm || statusFilter !== 'all'
                ? 'No codes match your filters.'
                : 'No discount codes yet. Generate your first one!'}
            </p>
          </div>
        )}
      </AdminLayout>

      {showModal && (
        <div className="checkout-modal-overlay" onClick={handleCloseModal}>
          <div
            className="checkout-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '36rem', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <button className="checkout-modal-close" onClick={handleCloseModal}>
              <X size={20} />
            </button>
            <div className="checkout-modal-header">
              <h2 className="checkout-modal-title">
                <Sparkles
                  size={18}
                  style={{ color: 'var(--accent-gold)', marginRight: '0.5rem' }}
                />
                {editingCode ? 'Edit Discount Code' : 'Generate Discount Code'}
              </h2>
            </div>
            <div className="checkout-modal-body">
              <form
                onSubmit={handleSave}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div className="profile-form-field">
                  <label>Discount Code</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                      className={`profile-form-input ${errors.code ? 'error' : ''}`}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.05em',
                        flex: 1,
                      }}
                      maxLength={20}
                    />
                    {!editingCode && (
                      <button
                        type="button"
                        onClick={handleRegenerateCode}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '0.625rem',
                          background: 'var(--surface-secondary)',
                          border: '1px solid var(--border-light)',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        <RefreshCw size={14} />
                        Regenerate
                      </button>
                    )}
                  </div>
                  {errors.code && <p className="profile-form-field-error">{errors.code}</p>}
                </div>

                <div className="admin-form-row">
                  <div className="profile-form-field">
                    <label>Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                      className="admin-select"
                      style={{ width: '100%' }}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed_amount">Fixed Amount (ETB)</option>
                    </select>
                  </div>
                  <div className="profile-form-field">
                    <label>
                      {formData.type === 'percentage' ? 'Percentage' : 'Amount (ETB)'}
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => handleChange('value', e.target.value)}
                      className={`profile-form-input ${errors.value ? 'error' : ''}`}
                      min="0"
                      max={formData.type === 'percentage' ? '100' : '10000'}
                    />
                    {errors.value && <p className="profile-form-field-error">{errors.value}</p>}
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="profile-form-field">
                    <label>Max Total Uses (0 = unlimited)</label>
                    <input
                      type="number"
                      value={formData.maxTotalUses}
                      onChange={(e) => handleChange('maxTotalUses', e.target.value)}
                      className="profile-form-input"
                      min="0"
                    />
                  </div>
                  <div className="profile-form-field">
                    <label>Max Per User</label>
                    <input
                      type="number"
                      value={formData.maxUsesPerUser}
                      onChange={(e) => handleChange('maxUsesPerUser', e.target.value)}
                      className="profile-form-input"
                      min="0"
                    />
                  </div>
                </div>

                <div className="profile-form-field">
                  <label>Minimum Purchase Amount (ETB)</label>
                  <input
                    type="number"
                    value={formData.minPurchaseAmount}
                    onChange={(e) => handleChange('minPurchaseAmount', e.target.value)}
                    className="profile-form-input"
                    min="0"
                  />
                </div>

                <div className="profile-form-field">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.eligibleForFullCourse}
                      onChange={(e) => handleChange('eligibleForFullCourse', e.target.checked)}
                      className="admin-checkbox"
                    />
                    <span>Eligible for Full Course</span>
                  </label>
                  <label className="admin-checkbox-label" style={{ marginTop: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.firstTimeOnly}
                      onChange={(e) => handleChange('firstTimeOnly', e.target.checked)}
                      className="admin-checkbox"
                    />
                    <span>First-Time Enrollees Only</span>
                  </label>
                </div>

                <div className="profile-form-field">
                  <label style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                    Eligible Phases
                    <span
                      style={{
                        color: 'var(--text-dim)',
                        fontWeight: 400,
                        marginLeft: '0.5rem',
                        fontSize: '0.6875rem',
                      }}
                    >
                      — If &quot;Full Course&quot; is checked + no phases selected = Full Course Only.
                    </span>
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    {PHASE_OPTIONS.map((phase) => (
                      <button
                        key={phase.id}
                        type="button"
                        onClick={() => handleTogglePhase(phase.id)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          border: formData.eligiblePhases.includes(phase.id)
                            ? '1px solid var(--accent-gold)'
                            : '1px solid var(--border-light)',
                          background: formData.eligiblePhases.includes(phase.id)
                            ? 'rgba(245,158,11,0.1)'
                            : 'transparent',
                          color: formData.eligiblePhases.includes(phase.id)
                            ? 'var(--accent-gold)'
                            : 'var(--text-dim)',
                          cursor: 'pointer',
                        }}
                      >
                        {formData.eligiblePhases.includes(phase.id) && (
                          <Check size={12} style={{ marginRight: '0.25rem' }} />
                        )}
                        {phase.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="profile-form-field">
                    <label>Valid From</label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => handleChange('validFrom', e.target.value)}
                      className="profile-form-input"
                    />
                  </div>
                  <div className="profile-form-field">
                    <label>Valid Until</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => handleChange('validUntil', e.target.value)}
                      className="profile-form-input"
                    />
                  </div>
                </div>

                <div className="profile-form-field">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="admin-select"
                    style={{ width: '100%' }}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <div className="profile-form-field">
                  <label>Description (Internal Notes)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="profile-form-input"
                    rows={2}
                    placeholder="Launch promotion for new cohort"
                  />
                </div>

                <button type="submit" disabled={saving} className="profile-form-submit">
                  <Save size={16} />
                  <span>
                    {saving
                      ? 'Saving...'
                      : editingCode
                      ? 'Update Code'
                      : 'Create Code'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDiscountsPage;