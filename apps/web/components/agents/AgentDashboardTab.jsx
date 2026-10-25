/**
 * @fileoverview Agent Dashboard Tab Content
 *
 * Detailed view for the "Agent" tab.
 * Completely standalone: shows stats, share links, and commission history.
 * (The Overview tab also shows a copy of this for convenience.)
 *
 * Path: apps/web/components/agents/AgentDashboardTab.jsx
 */

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import useAgentDashboard from '../../hooks/useAgentDashboard';
import AgentStatsCards from './AgentStatsCards';
import AgentShareSection from './AgentShareSection';
import AgentCommissionTable from './AgentCommissionTable';

const AgentDashboardTab = () => {
  const { t } = useLanguage();
  const {
    dashboard,
    dashboardLoading,
    dashboardError,
    commissions,
    pagination,
    commissionsLoading,
    fetchCommissions,
    refresh,
  } = useAgentDashboard();

  if (dashboardLoading) {
    return (
      <div className="mlm-dashboard-loading">
        <div className="spinner" />
        <p>{t.agents?.dashboardTitle || 'Loading your agent dashboard...'}</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="mlm-dashboard-error">
        <p>{dashboardError}</p>
        <button type="button" className="btn btn-primary" onClick={refresh}>
          {t.referrals?.mlm?.dashboard?.retry || 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="mlm-tab-overview" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats Cards */}
      <AgentStatsCards data={dashboard} />

      {/* Share Section */}
      <AgentShareSection code={dashboard?.code} link={dashboard?.link} />

      {/* Commission History */}
      <AgentCommissionTable
        commissions={commissions}
        pagination={pagination}
        loading={commissionsLoading}
        onPageChange={fetchCommissions}
      />
    </div>
  );
};

export default AgentDashboardTab;