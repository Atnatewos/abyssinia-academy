/**
 * @fileoverview MLM + Agent Dashboard — Main Container
 *
 * Tab-based container. The Overview tab is a unified hub
 * displaying combined earnings, merged stats, and a unified activity feed.
 *
 * IMPORTANT: Agent earnings are ALREADY included in the MLM wallet's
 * current_balance (they're credited to affiliate_wallets on approval).
 * We do NOT add agent earnings again when passing the wallet to
 * withdrawal — that would double-count and let the user attempt
 * withdrawals larger than the backend actually allows.
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
  Briefcase,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import useMLMReferrals from '../../hooks/useMLMReferrals';
import useAgentDashboard from '../../hooks/useAgentDashboard';
import MLMLevelExplanation from './MLMLevelExplanation';
import MLMTreeView from './MLMTreeView';
import MLMCommissionTable from './MLMCommissionTable';
import MLMBonusTracker from './MLMBonusTracker';
import MLMWithdrawalPanel from './MLMWithdrawalPanel';
import AgentDashboardTab from '../agents/AgentDashboardTab';
import UnifiedOverview from './UnifiedOverview';
import { isAgentsEnabled } from '../../lib/config';

const MLMDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const mlm = useMLMReferrals();
  const agent = useAgentDashboard();

  const tabs = [
    { id: 'overview', icon: LayoutDashboard },
    { id: 'tree', icon: Network },
    { id: 'commissions', icon: Receipt },
    { id: 'bonuses', icon: Trophy },
    { id: 'withdrawals', icon: Banknote },
  ];

  if (isAgentsEnabled()) {
    tabs.push({ id: 'agent', icon: Briefcase });
  }

  const renderTabContent = () => {
    if (activeTab === 'agent') {
      return <AgentDashboardTab />;
    }

    if (mlm.dashboardLoading) {
      return (
        <div className="mlm-dashboard-loading">
          <div className="spinner" />
          <p>{t.referrals?.mlm?.dashboard?.loading || 'Loading dashboard...'}</p>
        </div>
      );
    }

    if (mlm.dashboardError) {
      return (
        <div className="mlm-dashboard-error">
          <p>{mlm.dashboardError}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => { mlm.refreshAll(); agent.refresh(); }}
          >
            {t.referrals?.mlm?.dashboard?.retry || 'Retry'}
          </button>
        </div>
      );
    }

    const wallet = mlm.dashboard?.wallet || {};
    const team = mlm.dashboard?.team || {};

    switch (activeTab) {
      case 'overview':
        return (
          <UnifiedOverview
            mlmData={mlm.dashboard}
            agentData={isAgentsEnabled() ? agent.dashboard : null}
            onGoToTab={setActiveTab}
          />
        );

      case 'tree':
        return (
          <MLMTreeView
            tree={mlm.tree}
            totalDescendants={mlm.treeTotal}
            loading={mlm.treeLoading}
          />
        );

      case 'commissions':
        return (
          <MLMCommissionTable
            commissions={mlm.commissions}
            pagination={mlm.commissionsPagination}
            loading={mlm.commissionsLoading}
            onPageChange={mlm.fetchCommissions}
          />
        );

      case 'bonuses':
        return (
          <MLMBonusTracker
            team={team}
            bonusSummary={mlm.bonusSummary}
            loading={mlm.bonusesLoading}
          />
        );

      case 'withdrawals':
        return (
          <MLMWithdrawalPanel
            /*
             * IMPORTANT: The wallet already includes agent earnings
             * (they're in current_balance). We do NOT add them again.
             * Doing so causes the form to show "Available: 1000 ETB"
             * while the backend correctly allows only 500.
             */
            wallet={wallet}
            withdrawals={mlm.withdrawals}
            withdrawalsLoading={mlm.withdrawalsLoading}
            withdrawalSubmitting={mlm.withdrawalSubmitting}
            onRequestWithdrawal={mlm.requestWithdrawal}
            onRefresh={() => { mlm.fetchDashboard(); mlm.fetchWithdrawals(); }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="mlm-dashboard">
      <nav className="mlm-tab-nav">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const label = t.referrals?.mlm?.tabs?.[tab.id] || t.agents?.[tab.id] || tab.id;
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

      <div className="mlm-tab-content">
        {renderTabContent()}
      </div>

      <MLMLevelExplanation
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
      />
    </div>
  );
};

export default MLMDashboard;