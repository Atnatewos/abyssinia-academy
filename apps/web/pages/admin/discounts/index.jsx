/**
 * @fileoverview Admin Discount Codes Page — Modern Card-Based UI
 * Full CRUD in a single page with slide-over modal.
 * Auto-generate unique discount codes.
 * Copy-to-clipboard, usage progress bars, status badges.
 * Path: apps/web/pages/admin/discounts/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Tag, Plus, Edit, Trash2, Search, Copy, Check,
  Percent, Banknote, Users, Calendar, Sparkles,
  X, Save, RefreshCw,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/*
 * Phase options for eligibility
 */
const PHASE_OPTIONS = [
  { id: 'phase-1', label: 'Phase 1' },
  { id: 'phase-2', label: 'Phase 2' },
  { id: 'phase-3', label: 'Phase 3' },
  { id: 'phase-4', label: 'Phase 4' },
  { id: 'phase-5', label: 'Phase 5' },
];

/**
 * Generate a unique discount code with configurable format.
 * Format: PREFIX-RANDOM (e.g., ABY-X8K2M9)
 */
const generateCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'ABY-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Copy text to clipboard with fallback
 */
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }
};

/**
 * AdminDiscountsPage — Complete discount code management.
 */
const AdminDiscountsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  /*
   * Modal state
   */
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  /*
   * Form state
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
  const [errors, setErrors] = useState({});

  /**
   * Fetch all discount codes
   */
  const fetchDiscounts = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }

    setLoading(true);
    try {
      const response = await apiClient.get('/admin/discounts');
      if (response && response.success) {
        setDiscounts(response.data || []);
      }
    } catch (err) {
      if (err?.response?.status === 401) router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

  /**
   * Open modal for creating a new code
   */
  const handleCreate = () => {
    setEditingCode(null);
    setFormData({ ...emptyForm, code: generateCode() });
    setErrors({});
    setShowModal(true);
  };

  /**
   * Open modal for editing an existing code
   */
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

  /**
   * Close the modal
   */
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCode(null);
  };

  /**
   * Handle form field changes
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  /**
   * Toggle a phase in the eligible phases array
   */
  const handleTogglePhase = (phaseId) => {
    setFormData((prev) => ({
      ...prev,
      eligiblePhases: prev.eligiblePhases.includes(phaseId)
        ? prev.eligiblePhases.filter((p) => p !== phaseId)
        : [...prev.eligiblePhases, phaseId],
    }));
  };

  /**
   * Regenerate a random code
   */
  const handleRegenerateCode = () => {
    setFormData((prev) => ({ ...prev, code: generateCode() }));
  };

  /**
   * Validate the form
   */
  const validateForm = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = 'Code is required.';
    if (!formData.value || Number(formData.value) <= 0) newErrors.value = 'Value is required.';
    if (formData.type === 'percentage' && Number(formData.value) > 100) newErrors.value = 'Max 100%.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Save (create or update)
   */
  const handleSave = async (e) => {
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
        eligiblePhases: formData.eligiblePhases.length > 0 ? formData.eligiblePhases : null,
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
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete a discount code
   */
  const handleDelete = async (id) => {
    if (!confirm('Delete this discount code?')) return;
    try {
      const response = await apiClient.delete(`/admin/discounts/${id}`);
      if (response && response.success) {
        toast.success('Code deleted.');
        fetchDiscounts();
      } else {
        toast.error(response?.message || 'Failed to delete.');
      }
    } catch (err) {
      toast.error('Failed to delete.');
    }
  };

  /**
   * Copy code to clipboard
   */
  const handleCopyCode = async (code) => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedCode(code);
      toast.success('Copied!');
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  /*
   * Filter discounts
   */
  const filteredDiscounts = discounts.filter((d) => {
    if (statusFilter === 'active' && d.status !== 'active') return false;
    if (statusFilter === 'paused' && d.status !== 'paused') return false;
    if (statusFilter === 'disabled' && d.status !== 'disabled') return false;
    if (statusFilter === 'expired' && (!d.valid_until || new Date(d.valid_until) > new Date())) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return d.code?.toLowerCase().includes(term) || d.description?.toLowerCase().includes(term);
  });

  /**
   * Get usage percentage for progress bar
   */
  const getUsagePercent = (discount) => {
    if (!discount.max_total_uses || discount.max_total_uses === 0) return 0;
    return Math.min(100, Math.round((discount.current_total_uses / discount.max_total_uses) * 100));
  };

  /**
   * Check if a code is expired
   */
  const isExpired = (discount) => {
    return discount.valid_until && new Date(discount.valid_until) < new Date();
  };

  return (
    <>
      <SEOHead title={t.discounts?.adminTitle || 'Discount Codes'} />
      <AdminLayout
        title={t.discounts?.adminTitle || 'Discount Codes'}
        subtitle="Create and manage promotional discount codes"
      >
        {/* ── Toolbar ── */}
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

        {/* ── Discount Cards ── */}
        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}><div className="spinner-circle" /></div>
        ) : filteredDiscounts.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredDiscounts.map((discount) => {
              const usagePercent = getUsagePercent(discount);
              const expired = isExpired(discount);
              const statusColor =
                discount.status === 'active' && !expired ? '#10b981' :
                discount.status === 'paused' ? '#f59e0b' :
                expired ? '#ef4444' : '#64748b';

              return (
                <div
                  key={discount.id}
                  className="admin-table-row"
                  style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', padding: '1.25rem' }}
                >
                  {/* Top Row: Code + Status + Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {/* Code */}
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
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {discount.code}
                        {copiedCode === discount.code ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      </button>

                      {/* Type Badge */}
                      <span style={{
                        fontSize: '0.6875rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '0.375rem',
                        background: discount.type === 'percentage' ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.1)',
                        color: discount.type === 'percentage' ? '#8b5cf6' : '#3b82f6',
                      }}>
                        {discount.type === 'percentage' ? `${discount.value}% OFF` : `${discount.value} ETB OFF`}
                      </span>
                    </div>

                    {/* Status + Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="status-badge" style={{
                        background: `${statusColor}15`,
                        color: statusColor,
                        borderColor: `${statusColor}30`,
                        marginLeft: 0,
                      }}>
                        {expired ? 'Expired' : discount.status}
                      </span>

                      <div className="admin-table-action-btns">
                        <button className="admin-action-btn view" title="Edit" onClick={() => handleEdit(discount)}>
                          <Edit size={16} />
                        </button>
                        <button className="admin-action-btn reject" title="Delete" onClick={() => handleDelete(discount.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Usage Bar */}
                  {discount.max_total_uses > 0 && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
                          <Users size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                          {discount.current_total_uses} / {discount.max_total_uses} uses
                        </span>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: usagePercent > 80 ? '#ef4444' : 'var(--text-dim)' }}>
                          {usagePercent}%
                        </span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border-light)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${usagePercent}%`,
                          borderRadius: '3px',
                          background: usagePercent > 80
                            ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                            : 'linear-gradient(90deg, var(--accent-gold), var(--accent-gold-light))',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  )}

                  {/* Bottom Row: Meta Info */}
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.6875rem', color: 'var(--text-dim)' }}>
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

      {/* ── Create/Edit Modal ── */}
      {showModal && (
        <div className="checkout-modal-overlay" onClick={handleCloseModal}>
          <div className="checkout-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '36rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="checkout-modal-close" onClick={handleCloseModal}><X size={20} /></button>
            <div className="checkout-modal-header">
              <h2 className="checkout-modal-title">
                <Sparkles size={18} style={{ color: 'var(--accent-gold)', marginRight: '0.5rem' }} />
                {editingCode ? 'Edit Discount Code' : 'Generate Discount Code'}
              </h2>
            </div>
            <div className="checkout-modal-body">
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* ── Code (with regenerate button) ── */}
                <div className="profile-form-field">
                  <label>Discount Code</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                      className={`profile-form-input ${errors.code ? 'error' : ''}`}
                      style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', flex: 1 }}
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

                {/* ── Type + Value ── */}
                <div className="admin-form-row">
                  <div className="profile-form-field">
                    <label>Type</label>
                    <select value={formData.type} onChange={(e) => handleChange('type', e.target.value)} className="admin-select" style={{ width: '100%' }}>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed_amount">Fixed Amount (ETB)</option>
                    </select>
                  </div>
                  <div className="profile-form-field">
                    <label>{formData.type === 'percentage' ? 'Percentage' : 'Amount (ETB)'}</label>
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

                {/* ── Usage Limits ── */}
                <div className="admin-form-row">
                  <div className="profile-form-field">
                    <label>Max Total Uses (0 = unlimited)</label>
                    <input type="number" value={formData.maxTotalUses} onChange={(e) => handleChange('maxTotalUses', e.target.value)} className="profile-form-input" min="0" />
                  </div>
                  <div className="profile-form-field">
                    <label>Max Per User</label>
                    <input type="number" value={formData.maxUsesPerUser} onChange={(e) => handleChange('maxUsesPerUser', e.target.value)} className="profile-form-input" min="0" />
                  </div>
                </div>

                {/* ── Min Purchase ── */}
                <div className="profile-form-field">
                  <label>Minimum Purchase Amount (ETB)</label>
                  <input type="number" value={formData.minPurchaseAmount} onChange={(e) => handleChange('minPurchaseAmount', e.target.value)} className="profile-form-input" min="0" />
                </div>

                {/* ── Eligibility ── */}
                <div className="profile-form-field">
                  <label className="admin-checkbox-label">
                    <input type="checkbox" checked={formData.eligibleForFullCourse} onChange={(e) => handleChange('eligibleForFullCourse', e.target.checked)} className="admin-checkbox" />
                    <span>Eligible for Full Course</span>
                  </label>
                  <label className="admin-checkbox-label" style={{ marginTop: '0.5rem' }}>
                    <input type="checkbox" checked={formData.firstTimeOnly} onChange={(e) => handleChange('firstTimeOnly', e.target.checked)} className="admin-checkbox" />
                    <span>First-Time Enrollees Only</span>
                  </label>
                </div>

                {/* ── Eligible Phases ── */}
                <div className="profile-form-field">
                  <label>Eligible Phases (leave empty = all)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
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
                        {formData.eligiblePhases.includes(phase.id) && <Check size={12} style={{ marginRight: '0.25rem' }} />}
                        {phase.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Dates ── */}
                <div className="admin-form-row">
                  <div className="profile-form-field">
                    <label>Valid From</label>
                    <input type="date" value={formData.validFrom} onChange={(e) => handleChange('validFrom', e.target.value)} className="profile-form-input" />
                  </div>
                  <div className="profile-form-field">
                    <label>Valid Until</label>
                    <input type="date" value={formData.validUntil} onChange={(e) => handleChange('validUntil', e.target.value)} className="profile-form-input" />
                  </div>
                </div>

                {/* ── Status ── */}
                <div className="profile-form-field">
                  <label>Status</label>
                  <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="admin-select" style={{ width: '100%' }}>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                {/* ── Description ── */}
                <div className="profile-form-field">
                  <label>Description (Internal Notes)</label>
                  <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} className="profile-form-input" rows={2} placeholder="Launch promotion for new cohort" />
                </div>

                {/* ── Submit ── */}
                <button type="submit" disabled={saving} className="profile-form-submit">
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : editingCode ? 'Update Code' : 'Create Code'}</span>
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