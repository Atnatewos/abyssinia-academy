// /**
//  * @fileoverview Admin Settings Page — Pricing & Bank Accounts
//  * Saves to admin_settings table via API.
//  * Changes reflect immediately on public pricing page.
//  * Path: apps/web/pages/admin/settings/index.jsx
//  */

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/router';
// import { Tag, Banknote, Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
// import SEOHead from '../../../components/shared/SEOHead';
// import AdminLayout from '../../../components/admin/AdminLayout';
// import { useToast } from '../../../context/ToastContext';
// import apiClient from '../../../lib/api';
// import { getItem } from '../../../lib/storage';

// const AdminSettingsPage = () => {
//   const router = useRouter();
//   const toast = useToast();

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState('pricing');

//   /*
//    * Pricing state
//    */
//   const [pricing, setPricing] = useState({
//     fullCourseAmount: 2499,
//     fullCourseOriginal: 9500,
//     perPhaseAmount: 750,
//     perPhaseOriginal: 2500,
//     bulkDiscounts: [],
//   });

//   /*
//    * Bank accounts state
//    */
//   const [bankAccounts, setBankAccounts] = useState([]);

//   /**
//    * Fetch existing settings from API
//    */
//   const fetchSettings = useCallback(async () => {
//     const token = getItem('admin_token');
//     if (!token) { router.push('/admin/login'); return; }

//     setLoading(true);
//     try {
//       const response = await apiClient.get('/admin/settings');

//       if (response && response.success && response.data) {
//         if (response.data.pricing) {
//           setPricing({
//             fullCourseAmount: response.data.pricing.fullCourse?.amountETB || 2499,
//             fullCourseOriginal: response.data.pricing.fullCourse?.originalAmountETB || 9500,
//             perPhaseAmount: response.data.pricing.perPhase?.amountETB || 750,
//             perPhaseOriginal: response.data.pricing.perPhase?.originalAmountETB || 2500,
//             bulkDiscounts: response.data.pricing.bulkDiscounts || [],
//           });
//         }

//         if (response.data.payment_methods) {
//           setBankAccounts(response.data.payment_methods);
//         }
//       }
//     } catch (err) {
//       toast.error('Failed to load settings.');
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   useEffect(() => { fetchSettings(); }, [fetchSettings]);

//   /**
//    * Save settings
//    */
//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       let key, value;

//       if (activeTab === 'pricing') {
//         key = 'pricing';
//         value = {
//           fullCourse: {
//             amountETB: Number(pricing.fullCourseAmount),
//             originalAmountETB: Number(pricing.fullCourseOriginal),
//             currency: 'ETB',
//             description: 'Full Academy Access Pass — All 5 Phases',
//             descriptionAm: 'ሙሉ የአካዳሚ መዳረሻ — ሁሉም 5ቱ ደረጃዎች',
//           },
//           perPhase: {
//             amountETB: Number(pricing.perPhaseAmount),
//             originalAmountETB: Number(pricing.perPhaseOriginal),
//             currency: 'ETB',
//             description: 'Single Phase Access Pass',
//             descriptionAm: 'የአንድ ደረጃ መዳረሻ ፓስ',
//           },
//           bulkDiscounts: pricing.bulkDiscounts,
//         };
//       } else {
//         key = 'payment_methods';
//         value = bankAccounts;
//       }

//       const response = await apiClient.put('/admin/settings', { key, value });

//       if (response && response.success) {
//         toast.success('Settings saved! Changes are live on the pricing page.');
//       } else {
//         toast.error(response?.message || 'Failed to save.');
//       }
//     } catch (err) {
//       toast.error('Failed to save settings.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   /**
//    * Reset to defaults
//    */
//   const handleReset = async () => {
//     if (!confirm('Reset this section to config defaults?')) return;

//     const key = activeTab === 'pricing' ? 'pricing' : 'payment_methods';

//     try {
//       const response = await apiClient.post('/admin/settings', { key });

//       if (response && response.success) {
//         toast.success('Reset to defaults.');
//         fetchSettings();
//       }
//     } catch (err) {
//       toast.error('Failed to reset.');
//     }
//   };

//   const discountPercent = pricing.fullCourseOriginal > 0
//     ? Math.round(((pricing.fullCourseOriginal - pricing.fullCourseAmount) / pricing.fullCourseOriginal) * 100)
//     : 0;

//   if (loading) {
//     return (
//       <AdminLayout title="Settings">
//         <div className="spinner"><div className="spinner-circle" /></div>
//       </AdminLayout>
//     );
//   }

//   return (
//     <>
//       <SEOHead title="Settings" />
//       <AdminLayout title="Settings" subtitle="Platform pricing and payment configuration">
//         {/* Tabs */}
//         <div className="admin-tabs">
//           <button className={`admin-tab ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => setActiveTab('pricing')}>
//             <Tag size={14} /> Pricing
//           </button>
//           <button className={`admin-tab ${activeTab === 'bank-accounts' ? 'active' : ''}`} onClick={() => setActiveTab('bank-accounts')}>
//             <Banknote size={14} /> Bank Accounts
//           </button>
//         </div>

//         {/* Pricing Tab */}
//         {activeTab === 'pricing' && (
//           <div className="admin-detail-section">
//             <h4 className="admin-detail-section-title">Full Course Pricing</h4>
//             <div className="admin-form-row" style={{ marginBottom: '1.5rem' }}>
//               <div className="profile-form-field">
//                 <label>Current Price (ETB)</label>
//                 <input type="number" value={pricing.fullCourseAmount} onChange={(e) => setPricing({ ...pricing, fullCourseAmount: e.target.value })} className="profile-form-input" />
//               </div>
//               <div className="profile-form-field">
//                 <label>Original Price (ETB)</label>
//                 <input type="number" value={pricing.fullCourseOriginal} onChange={(e) => setPricing({ ...pricing, fullCourseOriginal: e.target.value })} className="profile-form-input" />
//               </div>
//             </div>
//             <p style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '1.5rem' }}>
//               Current discount: <strong>{discountPercent}% off</strong>
//             </p>

//             <h4 className="admin-detail-section-title">Per Phase Pricing</h4>
//             <div className="admin-form-row" style={{ marginBottom: '1.5rem' }}>
//               <div className="profile-form-field">
//                 <label>Current Price (ETB)</label>
//                 <input type="number" value={pricing.perPhaseAmount} onChange={(e) => setPricing({ ...pricing, perPhaseAmount: e.target.value })} className="profile-form-input" />
//               </div>
//               <div className="profile-form-field">
//                 <label>Original Price (ETB)</label>
//                 <input type="number" value={pricing.perPhaseOriginal} onChange={(e) => setPricing({ ...pricing, perPhaseOriginal: e.target.value })} className="profile-form-input" />
//               </div>
//             </div>

//             <h4 className="admin-detail-section-title">Bulk Discount Tiers</h4>
//             {pricing.bulkDiscounts.map((tier, index) => (
//               <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
//                 <input type="number" value={tier.phases} onChange={(e) => {
//                   const updated = [...pricing.bulkDiscounts];
//                   updated[index] = { ...updated[index], phases: Number(e.target.value) };
//                   setPricing({ ...pricing, bulkDiscounts: updated });
//                 }} className="profile-form-input" style={{ width: '80px' }} placeholder="Phases" />
//                 <span style={{ color: 'var(--text-dim)' }}>phases →</span>
//                 <input type="number" value={tier.discountPercent} onChange={(e) => {
//                   const updated = [...pricing.bulkDiscounts];
//                   updated[index] = { ...updated[index], discountPercent: Number(e.target.value) };
//                   setPricing({ ...pricing, bulkDiscounts: updated });
//                 }} className="profile-form-input" style={{ width: '80px' }} placeholder="%" />
//                 <span style={{ color: 'var(--text-dim)' }}>% off</span>
//                 <button type="button" onClick={() => setPricing({ ...pricing, bulkDiscounts: pricing.bulkDiscounts.filter((_, i) => i !== index) })} className="admin-action-btn reject">
//                   <Trash2 size={14} />
//                 </button>
//               </div>
//             ))}
//             <button type="button" onClick={() => setPricing({ ...pricing, bulkDiscounts: [...pricing.bulkDiscounts, { phases: 0, discountPercent: 0 }] })} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: 'var(--surface-secondary)', border: '1px solid var(--border-light)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
//               <Plus size={14} /> Add Tier
//             </button>
//           </div>
//         )}

//         {/* Bank Accounts Tab */}
//         {activeTab === 'bank-accounts' && (
//           <div className="admin-detail-section">
//             <h4 className="admin-detail-section-title">Payment Methods</h4>
//             {bankAccounts.map((account, index) => (
//               <div key={account.id} style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--border-light)', marginBottom: '0.75rem', background: 'var(--surface-secondary)' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
//                   <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
//                     {account.icon} {account.name}
//                   </span>
//                   <button type="button" onClick={() => {
//                     const updated = [...bankAccounts];
//                     updated[index] = { ...updated[index], isActive: !updated[index].isActive };
//                     setBankAccounts(updated);
//                   }} style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.6875rem', fontWeight: 600, border: account.isActive ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(148,163,184,0.2)', background: account.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(148,163,184,0.05)', color: account.isActive ? '#10b981' : 'var(--text-dim)', cursor: 'pointer' }}>
//                     {account.isActive ? 'Active' : 'Inactive'}
//                   </button>
//                 </div>
//                 <div className="admin-form-row">
//                   <div className="profile-form-field">
//                     <label>Account Number</label>
//                     <input type="text" value={account.accountNumber || ''} onChange={(e) => {
//                       const updated = [...bankAccounts];
//                       updated[index] = { ...updated[index], accountNumber: e.target.value };
//                       setBankAccounts(updated);
//                     }} className="profile-form-input" />
//                   </div>
//                   <div className="profile-form-field">
//                     <label>Account Name</label>
//                     <input type="text" value={account.accountName || ''} onChange={(e) => {
//                       const updated = [...bankAccounts];
//                       updated[index] = { ...updated[index], accountName: e.target.value };
//                       setBankAccounts(updated);
//                     }} className="profile-form-input" />
//                   </div>
//                 </div>
//                 {account.id === 'bank-transfer' && (
//                   <div className="profile-form-field" style={{ marginTop: '0.5rem' }}>
//                     <label>Bank Name</label>
//                     <input type="text" value={account.bankName || ''} onChange={(e) => {
//                       const updated = [...bankAccounts];
//                       updated[index] = { ...updated[index], bankName: e.target.value };
//                       setBankAccounts(updated);
//                     }} className="profile-form-input" />
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
//           <button type="button" onClick={handleSave} disabled={saving} className="admin-btn primary" style={{ flex: 1 }}>
//             <Save size={16} />
//             {saving ? 'Saving...' : 'Save Changes'}
//           </button>
//           <button type="button" onClick={handleReset} className="admin-btn secondary">
//             <RefreshCw size={16} />
//             Reset
//           </button>
//         </div>
//       </AdminLayout>
//     </>
//   );
// };

// export default AdminSettingsPage;









/**
 * @fileoverview Admin Settings — Pricing & Payment Methods
 *
 * Persists overrides to the admin_settings table. The public pricing
 * page reads these overrides at request time, so a save here is live
 * immediately.
 *
 * Value resolution contract:
 *   Form defaults come from getPricing() / getActivePaymentMethods()
 *   (shared config → defaults config), never from literals in this file.
 *   Saved DB overrides win over config on load; "Reset" clears the
 *   override so config becomes authoritative again.
 *
 * All destructive actions route through the shared confirmation dialog.
 *
 * Path: apps/web/pages/admin/settings/index.jsx
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { Tag, Banknote, Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../components/shared/ConfirmProvider';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';
import { getPricing, getPaymentConfig } from '../../../lib/config';

/**
 * Build the initial pricing form state from the shared config chain.
 * @returns {object}
 */
const buildPricingDefaults = () => {
  const pricing = getPricing();
  return {
    fullCourseAmount: pricing?.fullCourse?.amountETB ?? 0,
    fullCourseOriginal: pricing?.fullCourse?.originalAmountETB ?? 0,
    perPhaseAmount: pricing?.perPhase?.amountETB ?? 0,
    perPhaseOriginal: pricing?.perPhase?.originalAmountETB ?? 0,
    bulkDiscounts: Array.isArray(pricing?.bulkDiscounts)
      ? pricing.bulkDiscounts
      : [],
  };
};

/**
 * Build the initial payment-method list from the shared config chain.
 * @returns {Array}
 */
const buildPaymentMethodDefaults = () => {
  const paymentConfig = getPaymentConfig();
  return Array.isArray(paymentConfig?.methods) ? paymentConfig.methods : [];
};

const AdminSettingsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('pricing');
  const [pricing, setPricing] = useState(buildPricingDefaults);
  const [bankAccounts, setBankAccounts] = useState(buildPaymentMethodDefaults);

  const toastRef = useRef(toast);
  toastRef.current = toast;
  const routerRef = useRef(router);
  routerRef.current = router;

  const copy = t.admin?.settings || {};
  const pricingCopy = copy.pricing || {};
  const methodsCopy = copy.methods || {};
  const toasts = copy.toasts || {};

  const fetchSettings = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) {
      routerRef.current.push('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get('/admin/settings');
      const defaults = buildPricingDefaults();

      if (response?.success && response.data) {
        const savedPricing = response.data.pricing;
        if (savedPricing) {
          setPricing({
            fullCourseAmount:
              savedPricing.fullCourse?.amountETB ?? defaults.fullCourseAmount,
            fullCourseOriginal:
              savedPricing.fullCourse?.originalAmountETB ??
              defaults.fullCourseOriginal,
            perPhaseAmount:
              savedPricing.perPhase?.amountETB ?? defaults.perPhaseAmount,
            perPhaseOriginal:
              savedPricing.perPhase?.originalAmountETB ??
              defaults.perPhaseOriginal,
            bulkDiscounts: Array.isArray(savedPricing.bulkDiscounts)
              ? savedPricing.bulkDiscounts
              : defaults.bulkDiscounts,
          });
        }

        if (Array.isArray(response.data.payment_methods)) {
          setBankAccounts(response.data.payment_methods);
        }
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        routerRef.current.push('/admin/login');
        return;
      }
      toastRef.current.error(toasts.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [toasts.loadFailed]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  /**
   * Persist the active tab's section as a DB override.
   */
  const handleSave = async () => {
    setSaving(true);
    try {
      let key;
      let value;

      if (activeTab === 'pricing') {
        const configPricing = getPricing();
        key = 'pricing';
        value = {
          fullCourse: {
            ...(configPricing?.fullCourse || {}),
            amountETB: Number(pricing.fullCourseAmount),
            originalAmountETB: Number(pricing.fullCourseOriginal),
          },
          perPhase: {
            ...(configPricing?.perPhase || {}),
            amountETB: Number(pricing.perPhaseAmount),
            originalAmountETB: Number(pricing.perPhaseOriginal),
          },
          bulkDiscounts: pricing.bulkDiscounts,
        };
      } else {
        key = 'payment_methods';
        value = bankAccounts;
      }

      const response = await apiClient.put('/admin/settings', { key, value });

      if (response?.success) {
        toast.success(toasts.saved);
      } else if (!response?.cancelled) {
        toast.error(response?.message || toasts.saveFailed);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || toasts.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Clear the DB override so shared config becomes authoritative again.
   */
  const handleReset = async () => {
    const confirmed = await confirm({
      title: copy.resetConfirmTitle,
      message: copy.resetConfirmMessage,
      confirmText: copy.resetConfirmAction,
      variant: 'warning',
    });
    if (!confirmed) return;

    const key = activeTab === 'pricing' ? 'pricing' : 'payment_methods';
    try {
      const response = await apiClient.post(
        '/admin/settings',
        { key },
        { _confirm: null }
      );
      if (response?.success) {
        toast.success(toasts.reset);
        if (key === 'pricing') {
          setPricing(buildPricingDefaults());
        } else {
          setBankAccounts(buildPaymentMethodDefaults());
        }
        fetchSettings();
      } else if (!response?.cancelled) {
        toast.error(response?.message || toasts.resetFailed);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || toasts.resetFailed);
    }
  };

  const discountPercent =
    Number(pricing.fullCourseOriginal) > 0
      ? Math.round(
          ((Number(pricing.fullCourseOriginal) - Number(pricing.fullCourseAmount)) /
            Number(pricing.fullCourseOriginal)) *
            100
        )
      : 0;

  if (loading) {
    return (
      <AdminLayout title={copy.pageTitle}>
        <div className="spinner">
          <div className="spinner-circle" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <SEOHead title={copy.pageTitle} />
      <AdminLayout title={copy.pageTitle} subtitle={copy.pageSubtitle}>
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => setActiveTab('pricing')}
          >
            <Tag size={14} /> {copy.tabPricing}
          </button>
          <button
            type="button"
            className={`admin-tab ${activeTab === 'bank-accounts' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank-accounts')}
          >
            <Banknote size={14} /> {copy.tabMethods}
          </button>
        </div>

        {activeTab === 'pricing' && (
          <div className="admin-detail-section">
            <h4 className="admin-detail-section-title">{pricingCopy.fullCourse}</h4>
            <div className="admin-form-row">
              <div className="profile-form-field">
                <label htmlFor="full-course-amount">{pricingCopy.currentPrice}</label>
                <input
                  id="full-course-amount"
                  type="number"
                  min="0"
                  value={pricing.fullCourseAmount}
                  onChange={(e) =>
                    setPricing({ ...pricing, fullCourseAmount: e.target.value })
                  }
                  className="profile-form-input"
                />
              </div>
              <div className="profile-form-field">
                <label htmlFor="full-course-original">{pricingCopy.originalPrice}</label>
                <input
                  id="full-course-original"
                  type="number"
                  min="0"
                  value={pricing.fullCourseOriginal}
                  onChange={(e) =>
                    setPricing({ ...pricing, fullCourseOriginal: e.target.value })
                  }
                  className="profile-form-input"
                />
              </div>
            </div>
            <p className="admin-settings-discount-note">
              {pricingCopy.currentDiscount} <strong>{discountPercent}%</strong>
            </p>

            <h4 className="admin-detail-section-title">{pricingCopy.perPhase}</h4>
            <div className="admin-form-row">
              <div className="profile-form-field">
                <label htmlFor="per-phase-amount">{pricingCopy.currentPrice}</label>
                <input
                  id="per-phase-amount"
                  type="number"
                  min="0"
                  value={pricing.perPhaseAmount}
                  onChange={(e) =>
                    setPricing({ ...pricing, perPhaseAmount: e.target.value })
                  }
                  className="profile-form-input"
                />
              </div>
              <div className="profile-form-field">
                <label htmlFor="per-phase-original">{pricingCopy.originalPrice}</label>
                <input
                  id="per-phase-original"
                  type="number"
                  min="0"
                  value={pricing.perPhaseOriginal}
                  onChange={(e) =>
                    setPricing({ ...pricing, perPhaseOriginal: e.target.value })
                  }
                  className="profile-form-input"
                />
              </div>
            </div>

            <h4 className="admin-detail-section-title">{pricingCopy.bulkTiers}</h4>
            {pricing.bulkDiscounts.map((tier, index) => (
              <div key={`tier-${index}`} className="admin-settings-tier-row">
                <input
                  type="number"
                  min="1"
                  value={tier.phases}
                  aria-label={pricingCopy.phasesLabel}
                  onChange={(e) => {
                    const updated = [...pricing.bulkDiscounts];
                    updated[index] = { ...updated[index], phases: Number(e.target.value) };
                    setPricing({ ...pricing, bulkDiscounts: updated });
                  }}
                  className="profile-form-input admin-settings-tier-input"
                />
                <span className="admin-settings-tier-separator">
                  {pricingCopy.phasesArrow}
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tier.discountPercent}
                  aria-label={pricingCopy.percentLabel}
                  onChange={(e) => {
                    const updated = [...pricing.bulkDiscounts];
                    updated[index] = {
                      ...updated[index],
                      discountPercent: Number(e.target.value),
                    };
                    setPricing({ ...pricing, bulkDiscounts: updated });
                  }}
                  className="profile-form-input admin-settings-tier-input"
                />
                <span className="admin-settings-tier-separator">
                  {pricingCopy.percentSuffix}
                </span>
                <button
                  type="button"
                  aria-label={pricingCopy.removeTier}
                  onClick={() =>
                    setPricing({
                      ...pricing,
                      bulkDiscounts: pricing.bulkDiscounts.filter((_, i) => i !== index),
                    })
                  }
                  className="admin-action-btn reject"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn secondary"
              onClick={() =>
                setPricing({
                  ...pricing,
                  bulkDiscounts: [
                    ...pricing.bulkDiscounts,
                    { phases: 0, discountPercent: 0 },
                  ],
                })
              }
            >
              <Plus size={14} /> {pricingCopy.addTier}
            </button>
          </div>
        )}

        {activeTab === 'bank-accounts' && (
          <div className="admin-detail-section">
            <h4 className="admin-detail-section-title">{methodsCopy.heading}</h4>
            {bankAccounts.map((account, index) => (
              <div key={account.id} className="admin-settings-method-card">
                <div className="admin-settings-method-header">
                  <span className="admin-settings-method-name">
                    {account.icon} {account.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...bankAccounts];
                      updated[index] = { ...updated[index], isActive: !updated[index].isActive };
                      setBankAccounts(updated);
                    }}
                    className={`status-badge ${account.isActive ? 'approved' : 'pending'}`}
                  >
                    {account.isActive ? methodsCopy.active : methodsCopy.inactive}
                  </button>
                </div>

                <div className="admin-form-row">
                  <div className="profile-form-field">
                    <label htmlFor={`account-number-${account.id}`}>
                      {methodsCopy.accountNumber}
                    </label>
                    <input
                      id={`account-number-${account.id}`}
                      type="text"
                      value={account.accountNumber || ''}
                      onChange={(e) => {
                        const updated = [...bankAccounts];
                        updated[index] = { ...updated[index], accountNumber: e.target.value };
                        setBankAccounts(updated);
                      }}
                      className="profile-form-input"
                    />
                  </div>
                  <div className="profile-form-field">
                    <label htmlFor={`account-name-${account.id}`}>
                      {methodsCopy.accountName}
                    </label>
                    <input
                      id={`account-name-${account.id}`}
                      type="text"
                      value={account.accountName || ''}
                      onChange={(e) => {
                        const updated = [...bankAccounts];
                        updated[index] = { ...updated[index], accountName: e.target.value };
                        setBankAccounts(updated);
                      }}
                      className="profile-form-input"
                    />
                  </div>
                </div>

                {account.id === 'bank-transfer' && (
                  <div className="profile-form-field">
                    <label htmlFor={`bank-name-${account.id}`}>
                      {methodsCopy.bankName}
                    </label>
                    <input
                      id={`bank-name-${account.id}`}
                      type="text"
                      value={account.bankName || ''}
                      onChange={(e) => {
                        const updated = [...bankAccounts];
                        updated[index] = { ...updated[index], bankName: e.target.value };
                        setBankAccounts(updated);
                      }}
                      className="profile-form-input"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="admin-detail-actions">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="admin-btn primary"
          >
            <Save size={16} />
            {saving ? copy.saving : copy.save}
          </button>
          <button type="button" onClick={handleReset} className="admin-btn secondary">
            <RefreshCw size={16} />
            {copy.reset}
          </button>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminSettingsPage;