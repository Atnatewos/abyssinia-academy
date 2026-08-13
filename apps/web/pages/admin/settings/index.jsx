/**
 * @fileoverview Admin Settings Page — Tabbed Platform Configuration
 * Manage pricing, bank accounts, and bulk discounts.
 * Live preview of pricing page while editing.
 * Save without page refresh.
 * Reset to defaults per section.
 * 
 * Path: apps/web/pages/admin/settings/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Settings, Tag, Banknote, Save, RefreshCw, Eye,
  Plus, Trash2, Check,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

const TABS = [
  { id: 'pricing', label: '💰 Pricing', icon: Tag },
  { id: 'bank-accounts', label: '🏦 Bank Accounts', icon: Banknote },
];

const AdminSettingsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('pricing');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
   * Pricing form state
   */
  const [pricing, setPricing] = useState({
    fullCourseAmount: 2499,
    fullCourseOriginal: 9500,
    perPhaseAmount: 750,
    perPhaseOriginal: 2500,
    bulkDiscounts: [
      { phases: 2, discountPercent: 0 },
      { phases: 3, discountPercent: 0 },
      { phases: 4, discountPercent: 0 },
      { phases: 5, discountPercent: 0 },
    ],
  });

  /*
   * Bank accounts form state
   */
  const [bankAccounts, setBankAccounts] = useState([
    { id: 'telebirr', name: 'Telebirr', nameAm: 'ቴሌብር', icon: '📱', accountNumber: '', accountName: '', isActive: true },
    { id: 'cbe-birr', name: 'CBE Birr', nameAm: 'ሲቢኢ ብር', icon: '🏦', accountNumber: '', accountName: '', isActive: true },
    { id: 'bank-transfer', name: 'Bank Transfer', nameAm: 'የባንክ ትራንስፈር', icon: '🏛️', accountNumber: '', accountName: '', bankName: '', isActive: true },
  ]);

  /*
   * Fetch existing settings from API
   */
  const fetchSettings = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }

    setLoading(true);
    try {
      const response = await apiClient.get('/admin/settings');
      if (response && response.success) {
        const data = response.data || {};

        if (data.pricing) {
          setPricing({
            fullCourseAmount: data.pricing.fullCourse?.amountETB || 2499,
            fullCourseOriginal: data.pricing.fullCourse?.originalAmountETB || 9500,
            perPhaseAmount: data.pricing.perPhase?.amountETB || 750,
            perPhaseOriginal: data.pricing.perPhase?.originalAmountETB || 2500,
            bulkDiscounts: data.pricing.bulkDiscounts || [],
          });
        }

        if (data.payment_methods) {
          setBankAccounts(data.payment_methods);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  /**
   * Handle pricing field changes
   */
  const handlePricingChange = (field, value) => {
    setPricing((prev) => ({ ...prev, [field]: Number(value) || 0 }));
  };

  /**
   * Handle bulk discount changes
   */
  const handleBulkDiscountChange = (index, field, value) => {
    setPricing((prev) => {
      const updated = [...prev.bulkDiscounts];
      updated[index] = { ...updated[index], [field]: Number(value) || 0 };
      return { ...prev, bulkDiscounts: updated };
    });
  };

  /**
   * Add a new bulk discount tier
   */
  const handleAddBulkTier = () => {
    setPricing((prev) => ({
      ...prev,
      bulkDiscounts: [...prev.bulkDiscounts, { phases: 0, discountPercent: 0 }],
    }));
  };

  /**
   * Remove a bulk discount tier
   */
  const handleRemoveBulkTier = (index) => {
    setPricing((prev) => ({
      ...prev,
      bulkDiscounts: prev.bulkDiscounts.filter((_, i) => i !== index),
    }));
  };

  /**
   * Handle bank account field changes
   */
  const handleBankChange = (index, field, value) => {
    setBankAccounts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  /**
   * Toggle bank account active status
   */
  const handleBankToggle = (index) => {
    setBankAccounts((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], isActive: !updated[index].isActive };
      return updated;
    });
  };

  /**
   * Save current tab's settings
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      let key, value;

      if (activeTab === 'pricing') {
        key = 'pricing';
        value = {
          fullCourse: {
            amountETB: pricing.fullCourseAmount,
            originalAmountETB: pricing.fullCourseOriginal,
            currency: 'ETB',
          },
          perPhase: {
            amountETB: pricing.perPhaseAmount,
            originalAmountETB: pricing.perPhaseOriginal,
            currency: 'ETB',
          },
          bulkDiscounts: pricing.bulkDiscounts,
        };
      } else {
        key = 'payment_methods';
        value = bankAccounts;
      }

      const response = await apiClient.put('/admin/settings', { key, value });

      if (response && response.success) {
        toast.success('Settings saved successfully!');
        fetchSettings();
      } else {
        toast.error(response?.message || 'Failed to save settings.');
      }
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Reset current tab to defaults
   */
  const handleReset = async () => {
    if (!confirm('Reset this section to default values?')) return;

    const key = activeTab === 'pricing' ? 'pricing' : 'payment_methods';

    try {
      const response = await apiClient.post('/admin/settings', { key });

      if (response && response.success) {
        toast.success('Settings reset to defaults.');
        fetchSettings();
      } else {
        toast.error(response?.message || 'Failed to reset.');
      }
    } catch (err) {
      toast.error('Failed to reset settings.');
    }
  };

  /*
   * Calculate live preview values
   */
  const discountPercent = pricing.fullCourseOriginal > 0
    ? Math.round(((pricing.fullCourseOriginal - pricing.fullCourseAmount) / pricing.fullCourseOriginal) * 100)
    : 0;

  return (
    <>
      <SEOHead title="Settings" />
      <AdminLayout title="Settings" subtitle="Platform configuration">
        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="spinner"><div className="spinner-circle" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
            {/* Form Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {activeTab === 'pricing' && (
                <div className="admin-detail-section">
                  <h4 className="admin-detail-section-title">Pricing Configuration</h4>

                  {/* Full Course */}
                  <div className="admin-form-row" style={{ marginBottom: '1rem' }}>
                    <div className="profile-form-field">
                      <label>Full Course Price (ETB)</label>
                      <input type="number" value={pricing.fullCourseAmount} onChange={(e) => handlePricingChange('fullCourseAmount', e.target.value)} className="profile-form-input" />
                    </div>
                    <div className="profile-form-field">
                      <label>Full Course Original Price (ETB)</label>
                      <input type="number" value={pricing.fullCourseOriginal} onChange={(e) => handlePricingChange('fullCourseOriginal', e.target.value)} className="profile-form-input" />
                    </div>
                  </div>

                  {/* Per Phase */}
                  <div className="admin-form-row" style={{ marginBottom: '1rem' }}>
                    <div className="profile-form-field">
                      <label>Per Phase Price (ETB)</label>
                      <input type="number" value={pricing.perPhaseAmount} onChange={(e) => handlePricingChange('perPhaseAmount', e.target.value)} className="profile-form-input" />
                    </div>
                    <div className="profile-form-field">
                      <label>Per Phase Original Price (ETB)</label>
                      <input type="number" value={pricing.perPhaseOriginal} onChange={(e) => handlePricingChange('perPhaseOriginal', e.target.value)} className="profile-form-input" />
                    </div>
                  </div>

                  {/* Bulk Discounts */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>
                      Bulk Discount Tiers
                    </label>
                    {pricing.bulkDiscounts.map((tier, index) => (
                      <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="number"
                          value={tier.phases}
                          onChange={(e) => handleBulkDiscountChange(index, 'phases', e.target.value)}
                          className="profile-form-input"
                          style={{ width: '80px' }}
                          placeholder="Phases"
                        />
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>phases →</span>
                        <input
                          type="number"
                          value={tier.discountPercent}
                          onChange={(e) => handleBulkDiscountChange(index, 'discountPercent', e.target.value)}
                          className="profile-form-input"
                          style={{ width: '80px' }}
                          placeholder="%"
                        />
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>% off</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBulkTier(index)}
                          className="admin-action-btn reject"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddBulkTier}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'var(--surface-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem' }}
                    >
                      <Plus size={14} />
                      Add Tier
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'bank-accounts' && (
                <div className="admin-detail-section">
                  <h4 className="admin-detail-section-title">Bank Account Configuration</h4>
                  {bankAccounts.map((account, index) => (
                    <div key={account.id} style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-light)', marginBottom: '0.75rem', background: 'var(--surface-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {account.icon} {account.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleBankToggle(index)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '1rem',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            border: account.isActive ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(148,163,184,0.2)',
                            background: account.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.05)',
                            color: account.isActive ? '#10b981' : 'var(--text-dim)',
                            cursor: 'pointer',
                          }}
                        >
                          {account.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <div className="admin-form-row">
                        <div className="profile-form-field">
                          <label>Account Number</label>
                          <input type="text" value={account.accountNumber} onChange={(e) => handleBankChange(index, 'accountNumber', e.target.value)} className="profile-form-input" />
                        </div>
                        <div className="profile-form-field">
                          <label>Account Name</label>
                          <input type="text" value={account.accountName} onChange={(e) => handleBankChange(index, 'accountName', e.target.value)} className="profile-form-input" />
                        </div>
                      </div>
                      {account.id === 'bank-transfer' && (
                        <div className="profile-form-field" style={{ marginTop: '0.5rem' }}>
                          <label>Bank Name</label>
                          <input type="text" value={account.bankName || ''} onChange={(e) => handleBankChange(index, 'bankName', e.target.value)} className="profile-form-input" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="admin-btn primary"
                  style={{ flex: 1 }}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="admin-btn secondary"
                >
                  <RefreshCw size={16} />
                  Reset to Defaults
                </button>
              </div>
            </div>

            {/* Live Preview Column */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
                <Eye size={14} />
                Live Preview
              </label>
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-main)', borderRadius: '1rem', padding: '1rem', position: 'sticky', top: '6rem' }}>
                {activeTab === 'pricing' && (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-gold)' }}>Full Course</span>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                        {pricing.fullCourseAmount.toLocaleString()} ETB
                      </div>
                      {discountPercent > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                          Save {discountPercent}%
                        </div>
                      )}
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                        {pricing.fullCourseOriginal.toLocaleString()} ETB
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-gold)' }}>Per Phase</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {pricing.perPhaseAmount.toLocaleString()} ETB
                      </div>
                    </div>
                    {pricing.bulkDiscounts.filter(t => t.discountPercent > 0).length > 0 && (
                      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.5rem' }}>Bulk Discounts</span>
                        {pricing.bulkDiscounts.filter(t => t.discountPercent > 0).map((tier, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.15rem 0' }}>
                            <span>{tier.phases} phases</span>
                            <span>{tier.discountPercent}% off</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {activeTab === 'bank-accounts' && (
                  <>
                    {bankAccounts.filter(a => a.isActive).map((account) => (
                      <div key={account.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {account.icon} {account.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          {account.accountNumber || 'Not set'}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminSettingsPage;