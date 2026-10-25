/**
 * @fileoverview Unified Overview Component
 *
 * High-level dashboard combining Referral and Agent systems.
 * Shows combined balance (Unlocked + Locked) and a unified activity feed.
 * 
 * Highlights the Referral vs Agent balance with prominent visual pills
 * directly inside the Hero Card.
 *
 * Path: apps/web/components/referral/UnifiedOverview.jsx
 */

import React from 'react';
import { Users, ShoppingBag, Trophy, ArrowRight, Activity, Lock, Wallet } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import UnifiedShareSection from '../shared/UnifiedShareSection';
import useUnifiedActivity from '../../hooks/useUnifiedActivity';

const formatETB = (value) => {
  if (value === null || value === undefined) return '0';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const UnifiedOverview = ({ mlmData, agentData, onGoToTab }) => {
  const { t } = useLanguage();
  const { activities, loading: activityLoading } = useUnifiedActivity();

  /* MLM Data */
  const mlmAvailable = mlmData?.wallet?.availableNow ?? 0;
  const mlmLocked = mlmData?.wallet?.lockedTotal ?? 0;
  const mlmTotal = mlmAvailable + mlmLocked;
  
  /* Agent Data */
  const agentEarned = agentData?.totals?.totalEarned ?? 0;
  
  const totalBalance = mlmTotal + agentEarned;

  /* Calculate percentages for the split bar */
  const referralPercent = totalBalance > 0 ? (mlmTotal / totalBalance) * 100 : 0;
  const agentPercent = totalBalance > 0 ? (agentEarned / totalBalance) * 100 : 0;

  return (
    <div className="mlm-tab-overview" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Top Section: Hero Card */}
      <div className="glass-card" style={{ 
        padding: '1.5rem', 
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(15,23,42,0.8) 100%)',
        border: '1px solid rgba(16,185,129,0.2)',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Wallet size={18} color="#10b981" />
          <span className="mlm-stat-label" style={{ color: '#10b981', fontSize: '0.875rem', margin: 0 }}>
            Total Available Balance
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <span className="mlm-stat-value" style={{ fontSize: '2.5rem', color: '#10b981', lineHeight: 1.2 }}>
            {formatETB(totalBalance)} <span style={{ fontSize: '1.25rem' }}>ETB</span>
          </span>
          
          {mlmLocked > 0 && (
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.1)', 
              border: '1px solid rgba(245, 158, 11, 0.3)', 
              padding: '0.4rem 0.75rem', 
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8125rem',
              color: '#f59e0b',
              fontWeight: 600,
            }}>
              <Lock size={14} />
              {formatETB(mlmLocked)} ETB Locked (Unlocks in 7 days)
            </div>
          )}
        </div>

        {/* ── NEW: Detailed Balance Breakdown Pills ── */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {/* Referral Pill */}
          <div style={{ 
            background: 'rgba(245,158,11,0.08)', 
            border: '1px solid rgba(245,158,11,0.2)', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
            <div>
              <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Referral Earnings
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                {formatETB(mlmTotal)} ETB
              </span>
            </div>
          </div>

          {/* Agent Pill */}
          <div style={{ 
            background: 'rgba(59,130,246,0.08)', 
            border: '1px solid rgba(59,130,246,0.2)', 
            padding: '0.5rem 1rem', 
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
            <div>
              <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Agent Earnings
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                {formatETB(agentEarned)} ETB
              </span>
            </div>
          </div>
        </div>
        
        {/* Visual Split Bar (Now represents TOTAL balance) */}
        <div style={{ width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', display: 'flex', overflow: 'hidden' }}>
          <div style={{ width: `${referralPercent}%`, background: '#f59e0b' }} title="Referral Earnings" />
          <div style={{ width: `${agentPercent}%`, background: '#3b82f6' }} title="Agent Earnings" />
        </div>
      </div>

      {/* 2. Middle Section: 4 Uniform Stat Cards */}
      <div className="mlm-stats-grid">
        <div className="glass-card mlm-stat-card">
          <div className="mlm-stat-icon" style={{ backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>
            <Users size={20} />
          </div>
          <div className="mlm-stat-content">
            <span className="mlm-stat-label">Network Size</span>
            <span className="mlm-stat-value">{formatETB(mlmData?.team?.totalTeamSize || 0)}</span>
            <span className="mlm-stat-sublabel">Direct + Indirect</span>
          </div>
        </div>

        <div className="glass-card mlm-stat-card">
          <div className="mlm-stat-icon" style={{ backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
            <ShoppingBag size={20} />
          </div>
          <div className="mlm-stat-content">
            <span className="mlm-stat-label">Agent Sales</span>
            <span className="mlm-stat-value">{formatETB(agentData?.totals?.totalSales || 0)}</span>
            <span className="mlm-stat-sublabel">Direct purchases</span>
          </div>
        </div>

        <div className="glass-card mlm-stat-card">
          <div className="mlm-stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <Trophy size={20} />
          </div>
          <div className="mlm-stat-content">
            <span className="mlm-stat-label">Bonus Credits</span>
            <span className="mlm-stat-value">{formatETB(mlmData?.wallet?.totalBonusEarned || 0)}</span>
            <span className="mlm-stat-sublabel">Lifetime bonuses</span>
          </div>
        </div>

        <div className="glass-card mlm-stat-card">
          <div className="mlm-stat-icon" style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <Activity size={20} />
          </div>
          <div className="mlm-stat-content">
            <span className="mlm-stat-label">Commission Rate</span>
            <span className="mlm-stat-value">
              {agentData?.settings?.commissionType === 'percentage' 
                ? `${agentData.settings.commissionValue}%` 
                : `${formatETB(agentData?.settings?.commissionValue || 0)} ETB`}
            </span>
            <span className="mlm-stat-sublabel">Per agent sale</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Share Links */}
      <UnifiedShareSection 
        referralCode={mlmData?.code} 
        referralLink={mlmData?.link} 
        agentCode={agentData?.code} 
        agentLink={agentData?.link} 
      />

      {/* 4. Recent Activity Feed */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 className="mlm-section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={18} color="var(--accent-gold)" /> Recent Earnings
          </h3>
        </div>
        
        {activityLoading ? (
          <div className="spinner spinner-sm" />
        ) : activities.length === 0 ? (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No recent earnings yet. Share your links above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activities.map(act => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: act.type === 'Agent' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                    color: act.type === 'Agent' ? '#3b82f6' : '#f59e0b'
                  }}>
                    {act.type === 'Agent' ? <ShoppingBag size={16} /> : <Users size={16} />}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', margin: 0 }}>{act.title}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                      {act.type === 'Agent' ? 'Direct Agent Sale' : `Level ${act.level} Referral`} • {new Date(act.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#10b981' }}>
                  +{formatETB(act.amount)} ETB
                </div>
              </div>
            ))}
            
            <button 
              onClick={() => onGoToTab('commissions')}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', alignSelf: 'center' }}
            >
              View All Transactions <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedOverview;