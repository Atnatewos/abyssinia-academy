/**
 * @fileoverview Unified Stats Cards
 *
 * Renders the hero metrics for the Referral + Agent dashboard.
 * Now displays locked MLM earnings and their unlock date.
 *
 * Path: apps/web/components/referral/MLMStatsCards.jsx
 */

import React from 'react';
import { Wallet, Users, ShoppingBag, Trophy, Lock, Unlock, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const formatETB = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const MLMStatsCards = ({ wallet, team, agentData, combinedTotal }) => {
  const { t } = useLanguage();

  /* MLM Data */
  const mlmAvailable = wallet?.availableNow ?? 0;
  const mlmLocked = wallet?.lockedTotal ?? 0; // Fetched from DB
  const totalTeam = team?.totalTeamSize ?? 0;

  /* Agent Data */
  const agentSales = agentData?.totals?.totalSales ?? 0;
  const agentEarned = agentData?.totals?.totalEarned ?? 0;

  /* Calculate Total Combined */
  const total = combinedTotal ?? (mlmAvailable + mlmLocked + agentEarned);

  return (
    <div className="mlm-stats-grid">
      {/* ── HERO CARD: TOTAL BALANCE ── */}
      <div className="glass-card mlm-stat-card mlm-stat-hero" style={{ 
          gridColumn: '1 / -1', // Take full width on smaller screens
          background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(15,23,42,0.8) 100%)',
          borderColor: 'rgba(16,185,129,0.3)',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="mlm-stat-label" style={{ color: '#10b981', fontSize: '0.875rem' }}>
              Total Available Balance
            </span>
            <span className="mlm-stat-value" style={{ fontSize: '2.5rem', color: '#10b981', lineHeight: 1.2 }}>
              {formatETB(total)} <span style={{ fontSize: '1.25rem' }}>ETB</span>
            </span>
          </div>
          
          {/* Show Locked MLM Balance if exists */}
          {mlmLocked > 0 && (
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              border: '1px solid rgba(245, 158, 11, 0.3)', 
              padding: '0.5rem 1rem', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8125rem',
              color: '#f59e0b',
              fontWeight: 600
            }}>
              <Lock size={14} />
              {formatETB(mlmLocked)} ETB Locked (Unlocks in 7 days)
            </div>
          )}
        </div>
        
        {/* Visual Split Bar (Only shows the UNLOCKED split) */}
        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', display: 'flex', overflow: 'hidden', marginTop: '1rem' }}>
          <div style={{ width: `${(mlmAvailable / (mlmAvailable + agentEarned || 1)) * 100}%`, background: '#f59e0b' }} title="Referral Available" />
          <div style={{ width: `${(agentEarned / (mlmAvailable + agentEarned || 1)) * 100}%`, background: '#3b82f6' }} title="Agent Available" />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          <span><span style={{ color: '#f59e0b' }}>●</span> Referral Unlocked: {formatETB(mlmAvailable)} ETB</span>
          <span><span style={{ color: '#3b82f6' }}>●</span> Agent Unlocked: {formatETB(agentEarned)} ETB</span>
        </div>
      </div>

      {/* ── SECONDARY STATS ── */}
      <div className="glass-card mlm-stat-card">
        <div className="mlm-stat-icon" style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
          <Users size={20} />
        </div>
        <div className="mlm-stat-content">
          <span className="mlm-stat-label">Network Size</span>
          <span className="mlm-stat-value">{formatETB(totalTeam)}</span>
          <span className="mlm-stat-sublabel">Direct + Indirect</span>
        </div>
      </div>

      <div className="glass-card mlm-stat-card">
        <div className="mlm-stat-icon" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
          <ShoppingBag size={20} />
        </div>
        <div className="mlm-stat-content">
          <span className="mlm-stat-label">Agent Sales</span>
          <span className="mlm-stat-value">{formatETB(agentSales)}</span>
          <span className="mlm-stat-sublabel">Direct purchases</span>
        </div>
      </div>

      <div className="glass-card mlm-stat-card">
        <div className="mlm-stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
          <Trophy size={20} />
        </div>
        <div className="mlm-stat-content">
          <span className="mlm-stat-label">Bonus Credits</span>
          <span className="mlm-stat-value">{formatETB(wallet?.totalBonusEarned || 0)}</span>
          <span className="mlm-stat-sublabel">Lifetime bonuses</span>
        </div>
      </div>
    </div>
  );
};

export default MLMStatsCards;