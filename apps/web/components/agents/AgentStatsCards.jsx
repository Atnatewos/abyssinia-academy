/**
 * @fileoverview Agent Stats Cards
 *
 * Renders the 4 hero metrics for the agent dashboard tab:
 *   1. Total Sales (count of paid agent commissions)
 *   2. Total Earned (sum of paid agent commissions)
 *   3. Commission Rate (current agent_settings)
 *   4. Status (Active/Suspended)
 *
 * Path: apps/web/components/agents/AgentStatsCards.jsx
 */

import React from 'react';
import { ShoppingBag, Wallet, Percent, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const formatETB = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const AgentStatsCards = ({ data }) => {
  const { t } = useLanguage();

  const totals = data?.totals || {};
  const settings = data?.settings || {};
  const isActive = data?.isActive && settings?.isActive !== false;

  const commissionDisplay = settings.commissionType === 'percentage'
    ? `${settings.commissionValue}%`
    : `${formatETB(settings.commissionValue)} ETB`;

  const cards = [
    {
      id: 'total-sales',
      icon: ShoppingBag,
      label: t.agents?.totalAgentSales || 'Total Agent Sales',
      value: formatETB(totals.totalSales),
      sublabel: t.agents?.perSale || 'per sale',
      accent: '#3b82f6',
    },
    {
      id: 'total-earned',
      icon: Wallet,
      label: t.agents?.totalAgentEarned || 'Total Agent Earned',
      value: `${formatETB(totals.totalEarned)} ETB`,
      sublabel: t.agents?.instantPayout || 'Instant Payout',
      accent: '#10b981',
      hero: true,
    },
    {
      id: 'commission-rate',
      icon: Percent,
      label: t.agents?.agentCommissionRate || 'Commission Rate',
      value: commissionDisplay,
      sublabel: t.agents?.fixedCommission?.split(' ')[1] || 'per approved sale',
      accent: '#f59e0b',
    },
    {
      id: 'status',
      icon: isActive ? ShieldCheck : ShieldAlert,
      label: t.agents?.dashboardTitle || 'Agent Status',
      value: isActive ? 'Active' : 'Suspended',
      sublabel: isActive ? 'Ready to earn' : 'Contact support',
      accent: isActive ? '#10b981' : '#ef4444',
    },
  ];

  return (
    <div className="mlm-stats-grid">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`glass-card mlm-stat-card ${card.hero ? 'mlm-stat-hero' : ''}`}
          >
            <div
              className="mlm-stat-icon"
              style={{ backgroundColor: `${card.accent}20`, color: card.accent }}
            >
              <IconComponent size={22} />
            </div>
            <div className="mlm-stat-content">
              <span className="mlm-stat-label">{card.label}</span>
              <span className="mlm-stat-value">{card.value}</span>
              <span className="mlm-stat-sublabel">{card.sublabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AgentStatsCards;