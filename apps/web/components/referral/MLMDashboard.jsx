/**
 * @fileoverview MLM Dashboard — Main Container
 *
 * Tab-based container for the entire MLM referral experience.
 * Orchestrates data fetching via useMLMReferrals and renders
 * the appropriate sub-component per active tab.
 *
 * The "How it works" explanation is rendered as a modal popup
 * triggered from the overview tab, keeping the main layout clean.
 *
 * Tabs: Overview | My Team | Commissions | Bonuses | Withdrawals
 *
 * Path: apps/web/components/referral/MLMDashboard.jsx
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Network,
  Receipt,
  Trophy,
  Banknote,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import useMLMReferrals from '../../hooks/useMLMReferrals';
import MLMStatsCards from './MLMStatsCards';
import MLMShareSection from './MLMShareSection';
import MLMLevelExplanation from './MLMLevelExplanation';
import MLMTreeView from './MLMTreeView';
import MLMCommissionTable from './MLMCommissionTable';
import MLMBonusTracker from './MLMBonusTracker';
import MLMWithdrawalPanel from './MLMWithdrawalPanel';

const TABS = [
  { id: 'overview', icon: LayoutDashboard },
  { id: 'tree', icon: Network },
  { id: 'commissions', icon: Receipt },
  { id: 'bonuses', icon: Trophy },
  { id: 'withdrawals', icon: Banknote },
];

const MLMDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const {
    dashboard,
    dashboardLoading,
    dashboardError,
    commissions,
    commissionsPagination,
    commissionsLoading,
    fetchCommissions,
    tree,
    treeTotal,
    treeLoading,
    bonusSummary,
    bonusesLoading,
    withdrawals,
    withdrawalsLoading,
    withdrawalSubmitting,
    requestWithdrawal,
    refreshAll,
  } = useMLMReferrals();

  /**
   * Renders the content for the currently active tab.
   * @returns {React.ReactNode}
   */
  const renderTabContent = () => {
    if (dashboardLoading) {
      return (
        <div className="mlm-dashboard-loading">
          <div className="spinner" />
          <p>{t.referrals?.mlm?.dashboard?.loading || 'Loading your MLM dashboard...'}</p>
        </div>
      );
    }

    if (dashboardError) {
      return (
        <div className="mlm-dashboard-error">
          <p>{dashboardError}</p>
          <button type="button" className="btn btn-primary" onClick={refreshAll}>
            {t.referrals?.mlm?.dashboard?.retry || 'Retry'}
          </button>
        </div>
      );
    }

    const wallet = dashboard?.wallet || {};
    const team = dashboard?.team || {};

    switch (activeTab) {
      case 'overview':
        return (
          <div className="mlm-tab-overview">
            <MLMStatsCards wallet={wallet} team={team} />
            <div className="mlm-overview-actions">
              <MLMShareSection code={dashboard?.code} link={dashboard?.link} />
              <button
                type="button"
                className="mlm-how-it-works-btn"
                onClick={() => setIsExplanationOpen(true)}
              >
                <HelpCircle size={18} />
                <span>{t.referrals?.mlm?.howItWorks?.title || 'How the 4-Level System Works'}</span>
              </button>
            </div>
          </div>
        );

      case 'tree':
        return (
          <MLMTreeView
            tree={tree}
            totalDescendants={treeTotal}
            loading={treeLoading}
          />
        );

      case 'commissions':
        return (
          <MLMCommissionTable
            commissions={commissions}
            pagination={commissionsPagination}
            loading={commissionsLoading}
            onPageChange={fetchCommissions}
          />
        );

      case 'bonuses':
        return (
          <MLMBonusTracker
            team={team}
            bonusSummary={bonusSummary}
            loading={bonusesLoading}
          />
        );

      case 'withdrawals':
        return (
          <MLMWithdrawalPanel
            wallet={wallet}
            withdrawals={withdrawals}
            withdrawalsLoading={withdrawalsLoading}
            withdrawalSubmitting={withdrawalSubmitting}
            onRequestWithdrawal={requestWithdrawal}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="mlm-dashboard">
      {/* Tab Navigation */}
      <nav className="mlm-tab-nav">
        {TABS.map((tab) => {
          const IconComponent = tab.icon;
          const label = t.referrals?.mlm?.tabs?.[tab.id] || tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`mlm-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent size={18} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Tab Content */}
      <div className="mlm-tab-content">
        {renderTabContent()}
      </div>

      {/* Level Explanation Modal */}
      <MLMLevelExplanation
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
      />
    </div>
  );
};

export default MLMDashboard;