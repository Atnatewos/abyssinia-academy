/**
 * @fileoverview Admin Settings Page — Pricing & Bank Accounts
 * Saves to admin_settings table via API.
 * Changes reflect immediately on public pricing page.
 * Path: apps/web/pages/admin/settings/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Tag, Banknote, Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

const AdminSettingsPage = () => {
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('pricing');

  /*
   * Pricing state
   */
  const [pricing, setPricing] = useState({
    fullCourseAmount: 2499,
    fullCourseOriginal: 9500,
    perPhaseAmount: 750,
    perPhaseOriginal: 2500,
    bulkDiscounts: [],
  });

  /*
   * Bank accounts state
   */
  const [bankAccounts, setBankAccounts] = useState([]);

  /**
   * Fetch existing settings from API
   */
  const fetchSettings = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) { router.push('/admin/login'); return; }

    setLoading(true);
    try {
      const response = await apiClient.get('/admin/settings');

      if (response && response.success && response.data) {
        if (response.data.pricing) {
          setPricing({
            fullCourseAmount: response.data.pricing.fullCourse?.amountETB || 2499,
            fullCourseOriginal: response.data.pricing.fullCourse?.originalAmountETB || 9500,
            perPhaseAmount: response.data.pricing.perPhase?.amountETB || 750,
            perPhaseOriginal: response.data.pricing.perPhase?.originalAmountETB || 2500,
            bulkDiscounts: response.data.pricing.bulkDiscounts || [],
          });
        }

        if (response.data.payment_methods) {
          setBankAccounts(response.data.payment_methods);
        }
      }
    } catch (err) {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  /**
   * Save settings
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      let key, value;

      if (activeTab === 'pricing') {
        key = 'pricing';
        value = {
          fullCourse: {
            amountETB: Number(pricing.fullCourseAmount),
            originalAmountETB: Number(pricing.fullCourseOriginal),
            currency: 'ETB',
            description: 'Full Academy Access Pass — All 5 Phases',
            descriptionAm: 'ሙሉ የአካዳሚ መዳረሻ — ሁሉም 5ቱ ደረጃዎች',
          },
          perPhase: {
            amountETB: Number(pricing.perPhaseAmount),
            originalAmountETB: Number(pricing.perPhaseOriginal),
            currency: 'ETB',
            description: 'Single Phase Access Pass',
            descriptionAm: 'የአንድ ደረጃ መዳረሻ ፓስ',
          },
          bulkDiscounts: pricing.bulkDiscounts,
        };
      } else {
        key = 'payment_methods';
        value = bankAccounts;
      }

      const response = await apiClient.put('/admin/settings', { key, value });

      if (response && response.success) {
        toast.success('Settings saved! Changes are live on the pricing page.');
      } else {
        toast.error(response?.message || 'Failed to save.');
      }
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Reset to defaults
   */
  const handleReset = async () => {
    if (!confirm('Reset this section to config defaults?')) return;

    const key = activeTab === 'pricing' ? 'pricing' : 'payment_methods';

    try {
      const response = await apiClient.post('/admin/settings', { key });

      if (response && response.success) {
        toast.success('Reset to defaults.');
        fetchSettings();
      }
    } catch (err) {
      toast.error('Failed to reset.');
    }
  };

  const discountPercent = pricing.fullCourseOriginal > 0
    ? Math.round(((pricing.fullCourseOriginal - pricing.fullCourseAmount) / pricing.fullCourseOriginal) * 100)
    : 0;

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="spinner"><div className="spinner-circle" /></div>
      </AdminLayout>
    );
  }

  return (
    <>
      <SEOHead title="Settings" />
      <AdminLayout title="Settings" subtitle="Platform pricing and payment configuration">
        {/* Tabs */}
        <div className="admin-tabs">
          <button className={`admin-tab ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => setActiveTab('pricing')}>
            <Tag size={14} /> Pricing
          </button>
          <button className={`admin-tab ${activeTab === 'bank-accounts' ? 'active' : ''}`} onClick={() => setActiveTab('bank-accounts')}>
            <Banknote size={14} /> Bank Accounts
          </button>
        </div>

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="admin-detail-section">
            <h4 className="admin-detail-section-title">Full Course Pricing</h4>
            <div className="admin-form-row" style={{ marginBottom: '1.5rem' }}>
              <div className="profile-form-field">
                <label>Current Price (ETB)</label>
                <input type="number" value={pricing.fullCourseAmount} onChange={(e) => setPricing({ ...pricing, fullCourseAmount: e.target.value })} className="profile-form-input" />
              </div>
              <div className="profile-form-field">
                <label>Original Price (ETB)</label>
                <input type="number" value={pricing.fullCourseOriginal} onChange={(e) => setPricing({ ...pricing, fullCourseOriginal: e.target.value })} className="profile-form-input" />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '1.5rem' }}>
              Current discount: <strong>{discountPercent}% off</strong>
            </p>

            <h4 className="admin-detail-section-title">Per Phase Pricing</h4>
            <div className="admin-form-row" style={{ marginBottom: '1.5rem' }}>
              <div className="profile-form-field">
                <label>Current Price (ETB)</label>
                <input type="number" value={pricing.perPhaseAmount} onChange={(e) => setPricing({ ...pricing, perPhaseAmount: e.target.value })} className="profile-form-input" />
              </div>
              <div className="profile-form-field">
                <label>Original Price (ETB)</label>
                <input type="number" value={pricing.perPhaseOriginal} onChange={(e) => setPricing({ ...pricing, perPhaseOriginal: e.target.value })} className="profile-form-input" />
              </div>
            </div>

            <h4 className="admin-detail-section-title">Bulk Discount Tiers</h4>
            {pricing.bulkDiscounts.map((tier, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input type="number" value={tier.phases} onChange={(e) => {
                  const updated = [...pricing.bulkDiscounts];
                  updated[index] = { ...updated[index], phases: Number(e.target.value) };
                  setPricing({ ...pricing, bulkDiscounts: updated });
                }} className="profile-form-input" style={{ width: '80px' }} placeholder="Phases" />
                <span style={{ color: 'var(--text-dim)' }}>phases →</span>
                <input type="number" value={tier.discountPercent} onChange={(e) => {
                  const updated = [...pricing.bulkDiscounts];
                  updated[index] = { ...updated[index], discountPercent: Number(e.target.value) };
                  setPricing({ ...pricing, bulkDiscounts: updated });
                }} className="profile-form-input" style={{ width: '80px' }} placeholder="%" />
                <span style={{ color: 'var(--text-dim)' }}>% off</span>
                <button type="button" onClick={() => setPricing({ ...pricing, bulkDiscounts: pricing.bulkDiscounts.filter((_, i) => i !== index) })} className="admin-action-btn reject">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => setPricing({ ...pricing, bulkDiscounts: [...pricing.bulkDiscounts, { phases: 0, discountPercent: 0 }] })} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'var(--surface-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
              <Plus size={14} /> Add Tier
            </button>
          </div>
        )}

        {/* Bank Accounts Tab */}
        {activeTab === 'bank-accounts' && (
          <div className="admin-detail-section">
            <h4 className="admin-detail-section-title">Payment Methods</h4>
            {bankAccounts.map((account, index) => (
              <div key={account.id} style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-light)', marginBottom: '0.75rem', background: 'var(--surface-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {account.icon} {account.name}
                  </span>
                  <button type="button" onClick={() => {
                    const updated = [...bankAccounts];
                    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
                    setBankAccounts(updated);
                  }} style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.6875rem', fontWeight: 600, border: account.isActive ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(148,163,184,0.2)', background: account.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.05)', color: account.isActive ? '#10b981' : 'var(--text-dim)', cursor: 'pointer' }}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="admin-form-row">
                  <div className="profile-form-field">
                    <label>Account Number</label>
                    <input type="text" value={account.accountNumber || ''} onChange={(e) => {
                      const updated = [...bankAccounts];
                      updated[index] = { ...updated[index], accountNumber: e.target.value };
                      setBankAccounts(updated);
                    }} className="profile-form-input" />
                  </div>
                  <div className="profile-form-field">
                    <label>Account Name</label>
                    <input type="text" value={account.accountName || ''} onChange={(e) => {
                      const updated = [...bankAccounts];
                      updated[index] = { ...updated[index], accountName: e.target.value };
                      setBankAccounts(updated);
                    }} className="profile-form-input" />
                  </div>
                </div>
                {account.id === 'bank-transfer' && (
                  <div className="profile-form-field" style={{ marginTop: '0.5rem' }}>
                    <label>Bank Name</label>
                    <input type="text" value={account.bankName || ''} onChange={(e) => {
                      const updated = [...bankAccounts];
                      updated[index] = { ...updated[index], bankName: e.target.value };
                      setBankAccounts(updated);
                    }} className="profile-form-input" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={handleSave} disabled={saving} className="admin-btn primary" style={{ flex: 1 }}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button type="button" onClick={handleReset} className="admin-btn secondary">
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminSettingsPage;