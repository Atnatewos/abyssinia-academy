/**
 * @fileoverview Reseller Dashboard Container
 *
 * Tabbed container matching the MLMDashboard pattern:
 *   - Overview      → stats + price editor + link
 *   - Sales         → full paginated sales list
 *   - Sub-Resellers → list + invite modal
 *
 * Path: apps/web/components/reseller/ResellerDashboard.jsx
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import useResellerDashboard from '../../hooks/useResellerDashboard';
import useResellerProfile from '../../hooks/useResellerProfile';
import useResellerSales from '../../hooks/useResellerSales';
import useSubResellers from '../../hooks/useSubResellers';
import ResellerStatsCards from './ResellerStatsCards';
import PriceEditor from './PriceEditor';
import ResellerLinkCard from './ResellerLinkCard';
import ResellerSalesTable from './ResellerSalesTable';
import SubResellersList from './SubResellersList';

const TABS = [
  { id: 'overview', labelKey: 'overview', fallback: 'Overview', icon: LayoutDashboard },
  { id: 'sales', labelKey: 'sales', fallback: 'Sales', icon: ShoppingBag },
  { id: 'subResellers', labelKey: 'subResellers', fallback: 'Sub-Resellers', icon: Users },
];

const ResellerDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  const dashboardHook = useResellerDashboard();
  const profileHook = useResellerProfile();
  const salesHook = useResellerSales();
  const subHook = useSubResellers();

  const isLoading = dashboardHook.loading || profileHook.loading;
  const hasError = dashboardHook.error || profileHook.error;

  const handleRefresh = () => {
    dashboardHook.refetch();
    profileHook.refetch();
    salesHook.refetch();
    subHook.refetch();
  };

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
        <div className="w-7 h-7 border-[3px] border-border-medium border-t-accent rounded-full animate-spin" />
        <p className="text-sm">
          {t.reseller?.loading || 'Loading your reseller dashboard...'}
        </p>
      </div>
    );
  }

  /* ── Error state ── */
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
        <AlertCircle size={40} className="text-error" />
        <p className="text-sm font-semibold text-error">
          {dashboardHook.error || profileHook.error}
        </p>
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light transition-colors"
        >
          <RefreshCw size={14} />
          {t.common?.retry || 'Retry'}
        </button>
      </div>
    );
  }

  const profile = profileHook.profile;
  const config = profileHook.config;
  const dashboard = dashboardHook.dashboard;

  if (!profile || !config) return null;

  const hasParent = Boolean(profile.parentResellerId);
  const subSharePercent = Number(profile.subSharePercent || 100);

  const inviteConfig = {
    minSharePercent: Number(config.subReseller?.minSharePercent || 10),
    maxSharePercent: Number(config.subReseller?.maxSharePercent || 70),
    defaultSharePercent: Number(config.subReseller?.defaultSharePercent || 30),
    platformFeePercent: Number(config.platformFeePercent || 30),
    defaultPrice: Number(config.defaultRetailPrice || 1000),
  };

  /* ── Overview ── */
  const renderOverview = () => (
    <div className="flex flex-col gap-6">
      <ResellerStatsCards dashboard={dashboard} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriceEditor
          currentPrice={Number(profile.customPrice || 0)}
          minPrice={Number(config.minPrice || 800)}
          maxPrice={Number(config.maxPrice || 5000)}
          platformFeePercent={Number(config.platformFeePercent || 30)}
          subSharePercent={subSharePercent}
          hasParent={hasParent}
          saving={profileHook.saving}
          onSave={profileHook.updatePrice}
        />

        <ResellerLinkCard code={profile.resellerCode} />
      </div>

      {!hasParent && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/20">
          <Sparkles size={18} className="text-accent shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-sm font-bold text-text-main">
              {t.reseller?.nextStepsTitle || "You're all set to start selling"}
            </p>
            <p className="text-xs text-text-muted leading-relaxed">
              {t.reseller?.nextStepsBody ||
                'Share your link. When someone buys through it, your earnings appear here. You can also invite sub-resellers from the Sub-Resellers tab.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  /* ── Sales ── */
  const renderSales = () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold text-text-main">
          {t.reseller?.sales?.title || 'Your Sales'}
        </h2>
        <button
          type="button"
          onClick={salesHook.refetch}
          disabled={salesHook.loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-medium text-xs font-bold text-text-muted hover:border-accent/40 hover:text-accent transition-colors disabled:opacity-30"
        >
          <RefreshCw size={12} className={salesHook.loading ? 'animate-spin' : ''} />
          {t.common?.refresh || 'Refresh'}
        </button>
      </div>
      <ResellerSalesTable
        sales={salesHook.sales}
        pagination={salesHook.pagination}
        loading={salesHook.loading}
        onPageChange={salesHook.fetchPage}
      />
    </div>
  );

  /* ── Sub-Resellers ── */
  const renderSubResellers = () => (
    <div className="flex flex-col gap-4">
      <SubResellersList
        subResellers={subHook.subResellers}
        limits={subHook.limits}
        config={inviteConfig}
        loading={subHook.loading}
        error={subHook.error}
        onInvite={subHook.inviteSubReseller}
        onRemove={subHook.removeSubReseller}
        inviting={subHook.inviting}
        inviteError={subHook.inviteError}
        onRefetch={subHook.refetch}
      />
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'sales':
        return renderSales();
      case 'subResellers':
        return renderSubResellers();
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Tabs ── */}
      <nav className="flex gap-1 p-1 rounded-xl bg-bg-input border border-border-medium overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const label = t.reseller?.tabs?.[tab.labelKey] || tab.fallback;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all
                ${
                  active
                    ? 'bg-accent/10 text-accent border border-accent/30'
                    : 'text-text-muted hover:text-text-main hover:bg-bg-ghost-hover border border-transparent'
                }
              `}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Tab content ── */}
      <div className="min-h-[400px]">{renderTabContent()}</div>
    </div>
  );
};

export default ResellerDashboard;
