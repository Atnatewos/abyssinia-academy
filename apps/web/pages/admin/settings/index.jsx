/**
 * @fileoverview Admin Settings — Pricing & Payment Methods
 *
 * Persists overrides to the admin_settings table. The public pricing
 * surface reads these overrides at request time, so a save here is live
 * immediately.
 *
 * Value resolution contract:
 *   Form defaults come from getPricing() / getPaymentConfig() (shared
 *   config → defaults config), never from literals in this file. Saved
 *   DB overrides win on load; Reset clears the override so shared config
 *   becomes authoritative again. Non-price metadata (currency,
 *   descriptions) is preserved from config on every save.
 *
 * All destructive actions route through useAdminMutation's styled
 * confirmation dialog. Every visual value flows through the Tailwind
 * token bridge; all copy resolves from admin.settings.* / admin.common.*.
 *
 * Path: apps/web/pages/admin/settings/index.jsx
 */

import { useState, useEffect } from 'react';
import { Tag, Banknote, Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminTabs from '../../../components/admin/ui/AdminTabs';
import AdminCard from '../../../components/admin/ui/AdminCard';
import AdminButton from '../../../components/admin/ui/AdminButton';
import AdminBadge from '../../../components/admin/ui/AdminBadge';
import { AdminInput } from '../../../components/admin/ui/AdminInput';
import { AdminStatSkeleton } from '../../../components/admin/ui/AdminSkeleton';
import { useLanguage } from '../../../context/LanguageContext';
import useAdminQuery from '../../../lib/admin/useAdminQuery';
import useAdminMutation from '../../../lib/admin/useAdminMutation';
import { resolveLabel, interpolate } from '../../../lib/admin/labels';
import { getPricing, getPaymentConfig } from '../../../lib/config';

/** Percentage ceiling for a single bulk-discount tier. */
const MAX_TIER_PERCENT = 100;

/**
 * Build pricing form state from the shared config chain.
 * @returns {object}
 */
const buildPricingDefaults = () => {
  const pricing = getPricing();
  return {
    fullCourseAmount: pricing?.fullCourse?.amountETB ?? 0,
    fullCourseOriginal: pricing?.fullCourse?.originalAmountETB ?? 0,
    perPhaseAmount: pricing?.perPhase?.amountETB ?? 0,
    perPhaseOriginal: pricing?.perPhase?.originalAmountETB ?? 0,
    bulkDiscounts: Array.isArray(pricing?.bulkDiscounts) ? pricing.bulkDiscounts : [],
  };
};

/**
 * Build the payment-method list from the shared config chain.
 * @returns {Array}
 */
const buildMethodDefaults = () => {
  const paymentConfig = getPaymentConfig();
  return Array.isArray(paymentConfig?.methods) ? paymentConfig.methods : [];
};

/**
 * Merge a saved pricing override over config defaults.
 * @param {object|undefined} saved
 * @returns {object}
 */
const mergePricing = (saved) => {
  const defaults = buildPricingDefaults();
  if (!saved) return defaults;
  return {
    fullCourseAmount: saved.fullCourse?.amountETB ?? defaults.fullCourseAmount,
    fullCourseOriginal:
      saved.fullCourse?.originalAmountETB ?? defaults.fullCourseOriginal,
    perPhaseAmount: saved.perPhase?.amountETB ?? defaults.perPhaseAmount,
    perPhaseOriginal:
      saved.perPhase?.originalAmountETB ?? defaults.perPhaseOriginal,
    bulkDiscounts: Array.isArray(saved.bulkDiscounts)
      ? saved.bulkDiscounts
      : defaults.bulkDiscounts,
  };
};

const AdminSettingsPage = () => {
  const { t } = useLanguage();
  const { mutate, busy } = useAdminMutation();

  const [activeTab, setActiveTab] = useState('pricing');
  const [pricing, setPricing] = useState(buildPricingDefaults);
  const [methods, setMethods] = useState(buildMethodDefaults);

  const label = (key) => resolveLabel(t, key);
  const withValues = (key, values) => interpolate(label(key), values);

  const { data: settings, loading, refetch } = useAdminQuery({
    url: '/admin/settings',
    errorKey: 'admin.settings.toasts.loadFailed',
  });

  /* Hydrate form state whenever the server payload changes */
  useEffect(() => {
    if (!settings) return;
    setPricing(mergePricing(settings.pricing));
    if (Array.isArray(settings.payment_methods)) {
      setMethods(settings.payment_methods);
    }
  }, [settings]);

  const discountPercent =
    Number(pricing.fullCourseOriginal) > 0
      ? Math.round(
          ((Number(pricing.fullCourseOriginal) - Number(pricing.fullCourseAmount)) /
            Number(pricing.fullCourseOriginal)) *
            MAX_TIER_PERCENT
        )
      : 0;

  /* ── Pricing mutations ── */

  const setPriceField = (field, value) =>
    setPricing((prev) => ({ ...prev, [field]: value }));

  const setTierField = (index, field, value) =>
    setPricing((prev) => {
      const tiers = [...prev.bulkDiscounts];
      tiers[index] = { ...tiers[index], [field]: Number(value) };
      return { ...prev, bulkDiscounts: tiers };
    });

  const removeTier = (index) =>
    setPricing((prev) => ({
      ...prev,
      bulkDiscounts: prev.bulkDiscounts.filter((_, i) => i !== index),
    }));

  const addTier = () =>
    setPricing((prev) => ({
      ...prev,
      bulkDiscounts: [...prev.bulkDiscounts, { phases: 0, discountPercent: 0 }],
    }));

  /* ── Payment method mutations ── */

  const setMethodField = (index, field, value) =>
    setMethods((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });

  const toggleMethodActive = (index) =>
    setMethods((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], isActive: !next[index].isActive };
      return next;
    });

  /* ── Save / reset ── */

  const handleSave = async () => {
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
      value = methods;
    }

    await mutate({
      method: 'put',
      url: '/admin/settings',
      payload: { key, value },
      successKey: 'admin.settings.toasts.saved',
      errorKey: 'admin.settings.toasts.saveFailed',
      onSuccess: refetch,
    });
  };

  const handleReset = async () => {
    const key = activeTab === 'pricing' ? 'pricing' : 'payment_methods';

    await mutate({
      method: 'post',
      url: '/admin/settings',
      payload: { key },
      confirm: {
        title: label('admin.settings.resetConfirmTitle'),
        message: label('admin.settings.resetConfirmMessage'),
        confirmText: label('admin.settings.resetConfirmAction'),
        variant: 'warning',
      },
      successKey: 'admin.settings.toasts.reset',
      errorKey: 'admin.settings.toasts.resetFailed',
      onSuccess: () => {
        if (key === 'pricing') {
          setPricing(buildPricingDefaults());
        } else {
          setMethods(buildMethodDefaults());
        }
        refetch();
      },
    });
  };

  const tabs = [
    { id: 'pricing', label: label('admin.settings.tabPricing'), icon: Tag },
    { id: 'methods', label: label('admin.settings.tabMethods'), icon: Banknote },
  ];

  const sectionTitle =
    'm-0 mb-4 pb-2.5 border-b border-solid border-border-light text-sm font-extrabold text-accent';

  return (
    <>
      <SEOHead title={label('admin.settings.pageTitle')} />
      <AdminLayout
        title={label('admin.settings.pageTitle')}
        subtitle={label('admin.settings.pageSubtitle')}
      >
        <AdminTabs
          tabs={tabs}
          active={activeTab}
          onChange={setActiveTab}
          ariaLabel={label('admin.settings.pageTitle')}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <AdminStatSkeleton key={`settings-skeleton-${i}`} />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'pricing' && (
              <AdminCard className="p-5">
                {/* Full course */}
                <h4 className={sectionTitle}>
                  {label('admin.settings.pricing.fullCourse')}
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <AdminInput
                    label={label('admin.settings.pricing.currentPrice')}
                    type="number"
                    min="0"
                    value={pricing.fullCourseAmount}
                    onChange={(e) => setPriceField('fullCourseAmount', e.target.value)}
                  />
                  <AdminInput
                    label={label('admin.settings.pricing.originalPrice')}
                    type="number"
                    min="0"
                    value={pricing.fullCourseOriginal}
                    onChange={(e) => setPriceField('fullCourseOriginal', e.target.value)}
                  />
                </div>
                <p className="mt-3 mb-6 text-xs text-success">
                  {label('admin.settings.pricing.currentDiscount')}{' '}
                  <strong>
                    {withValues('admin.settings.discountOff', { percent: discountPercent })}
                  </strong>
                </p>

                {/* Per phase */}
                <h4 className={sectionTitle}>
                  {label('admin.settings.pricing.perPhase')}
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                  <AdminInput
                    label={label('admin.settings.pricing.currentPrice')}
                    type="number"
                    min="0"
                    value={pricing.perPhaseAmount}
                    onChange={(e) => setPriceField('perPhaseAmount', e.target.value)}
                  />
                  <AdminInput
                    label={label('admin.settings.pricing.originalPrice')}
                    type="number"
                    min="0"
                    value={pricing.perPhaseOriginal}
                    onChange={(e) => setPriceField('perPhaseOriginal', e.target.value)}
                  />
                </div>

                {/* Bulk tiers */}
                <h4 className={sectionTitle}>
                  {label('admin.settings.pricing.bulkTiers')}
                </h4>
                <div className="flex flex-col gap-2.5">
                  {pricing.bulkDiscounts.map((tier, index) => (
                    <div
                      key={`tier-${index}`}
                      className="flex flex-wrap items-center gap-3"
                    >
                      <input
                        type="number"
                        min="1"
                        value={tier.phases}
                        aria-label={label('admin.settings.pricing.phasesLabel')}
                        placeholder={label('admin.settings.tierPhasesPlaceholder')}
                        onChange={(e) => setTierField(index, 'phases', e.target.value)}
                        className="box-border w-20 px-3 py-2 rounded-md bg-bg-input border border-solid border-border-medium text-sm font-sans text-text-main outline-none transition-colors duration-fast focus:border-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <span className="text-xs text-text-dim">
                        {label('admin.settings.pricing.phasesArrow')}
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={MAX_TIER_PERCENT}
                        value={tier.discountPercent}
                        aria-label={label('admin.settings.pricing.percentLabel')}
                        placeholder={label('admin.settings.tierPercentPlaceholder')}
                        onChange={(e) =>
                          setTierField(index, 'discountPercent', e.target.value)
                        }
                        className="box-border w-20 px-3 py-2 rounded-md bg-bg-input border border-solid border-border-medium text-sm font-sans text-text-main outline-none transition-colors duration-fast focus:border-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <span className="text-xs text-text-dim">
                        {label('admin.settings.pricing.percentSuffix')}
                      </span>
                      <AdminButton
                        variant="danger"
                        size="sm"
                        iconOnly
                        onClick={() => removeTier(index)}
                        aria-label={label('admin.settings.pricing.removeTier')}
                        title={label('admin.settings.pricing.removeTier')}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </AdminButton>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <AdminButton variant="secondary" size="sm" onClick={addTier}>
                    <Plus size={14} aria-hidden="true" />
                    {label('admin.settings.pricing.addTier')}
                  </AdminButton>
                </div>
              </AdminCard>
            )}

            {activeTab === 'methods' && (
              <div className="flex flex-col gap-4">
                {methods.map((method, index) => (
                  <AdminCard key={method.id} className="p-5">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <span className="text-sm font-bold text-text-main">
                        {method.icon} {method.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleMethodActive(index)}
                        aria-pressed={Boolean(method.isActive)}
                        className="bg-transparent border-0 p-0 cursor-pointer"
                        title={
                          method.isActive
                            ? label('admin.settings.methods.active')
                            : label('admin.settings.methods.inactive')
                        }
                      >
                        <AdminBadge
                          tone={method.isActive ? 'success' : 'neutral'}
                          pulse={Boolean(method.isActive)}
                        >
                          {method.isActive
                            ? label('admin.settings.methods.active')
                            : label('admin.settings.methods.inactive')}
                        </AdminBadge>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <AdminInput
                        label={label('admin.settings.methods.accountNumber')}
                        value={method.accountNumber || ''}
                        onChange={(e) =>
                          setMethodField(index, 'accountNumber', e.target.value)
                        }
                        maxLength={100}
                      />
                      <AdminInput
                        label={label('admin.settings.methods.accountName')}
                        value={method.accountName || ''}
                        onChange={(e) =>
                          setMethodField(index, 'accountName', e.target.value)
                        }
                        maxLength={200}
                      />
                    </div>

                    {method.bankName !== undefined && (
                      <div className="mt-4">
                        <AdminInput
                          label={label('admin.settings.methods.bankName')}
                          value={method.bankName || ''}
                          onChange={(e) =>
                            setMethodField(index, 'bankName', e.target.value)
                          }
                          maxLength={200}
                        />
                      </div>
                    )}
                  </AdminCard>
                ))}
              </div>
            )}

            {/* Action row */}
            <div className="flex flex-col gap-3 mt-6 sm:flex-row">
              <AdminButton
                variant="primary"
                fullWidth
                loading={busy}
                onClick={handleSave}
                className="sm:flex-1"
              >
                <Save size={16} aria-hidden="true" />
                {busy
                  ? label('admin.settings.saving')
                  : label('admin.settings.save')}
              </AdminButton>
              <AdminButton variant="secondary" onClick={handleReset} disabled={busy}>
                <RefreshCw size={16} aria-hidden="true" />
                {label('admin.settings.reset')}
              </AdminButton>
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminSettingsPage;