/**
 * @fileoverview MLM Withdrawal Panel (Unified Wallet)
 *
 * Provides a crystal-clear breakdown of earnings for the user:
 * - Total Earned (Agent + Referral)
 * - Locked amount (and why)
 * - Available to withdraw
 * 
 * Path: apps/web/components/referral/MLMWithdrawalPanel.jsx
 */

import React, { useState } from 'react';
import { Banknote, Wallet, Lock, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const formatETB = (value) => {
  if (!value) return '0';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

const MLMWithdrawalPanel = ({
  wallet,
  withdrawals = [],
  withdrawalsLoading,
  withdrawalSubmitting,
  onRequestWithdrawal,
}) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');

  /* 
   * Wallet data breakdown:
   * availableNow: Unlocked MLM + Agent Earnings (assuming API combines them, or we add them)
   * lockedTotal: MLM earnings locked for 7 days
   * total: Sum of everything
   */
  const availableBalance = wallet?.availableNow || 0; 
  const lockedBalance = wallet?.lockedTotal || 0;
  const totalBalance = availableBalance + lockedBalance;
  
  const minWithdrawal = 500; // Should come from config ideally

  const handleSubmit = (e) => {
    e.preventDefault();
    onRequestWithdrawal(Number(amount));
    setAmount('');
  };

  return (
    <div className="mlm-withdrawal-panel">
      {/* Left Column: Request Form */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h3 className="mlm-section-title">{t.referrals?.mlm?.withdrawal?.title || 'Request Withdrawal'}</h3>
        <p className="mlm-section-subtitle" style={{ marginBottom: '1.5rem' }}>
          Cash out your combined earnings from network referrals and direct agent sales.
        </p>

        {/* ── Balance Breakdown Card ── */}
        <div style={{ 
          background: 'rgba(15,23,42,0.6)', 
          border: '1px solid var(--border-medium)', 
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Earnings</span>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>{formatETB(totalBalance)} ETB</span>
          </div>

          {/* Locked */}
          {lockedBalance > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <Lock size={16} style={{ color: '#f59e0b', marginTop: '2px' }} />
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: 600, display: 'block' }}>Locked Balance</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Referral commissions unlock after 7 days.</span>
                </div>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>{formatETB(lockedBalance)} ETB</span>
            </div>
          )}

          {/* Available */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            background: 'rgba(16,185,129,0.1)',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(16,185,129,0.2)',
            marginTop: '0.25rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Wallet size={18} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 700 }}>Available to Withdraw</span>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{formatETB(availableBalance)} ETB</span>
          </div>
        </div>

        {/* ── Withdrawal Form ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              {t.referrals?.mlm?.withdrawal?.amountLabel || 'Amount (ETB)'}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ${minWithdrawal}`}
              className="checkout-input"
              min={minWithdrawal}
              max={availableBalance}
              disabled={availableBalance < minWithdrawal || withdrawalSubmitting}
            />
          </div>

          <button
            type="submit"
            className="checkout-submit-btn"
            disabled={!amount || amount < minWithdrawal || amount > availableBalance || withdrawalSubmitting || availableBalance < minWithdrawal}
            style={{
              opacity: (availableBalance < minWithdrawal) ? 0.5 : 1,
              cursor: (availableBalance < minWithdrawal) ? 'not-allowed' : 'pointer'
            }}
          >
            {withdrawalSubmitting 
              ? 'Submitting...' 
              : availableBalance < minWithdrawal 
                ? `Minimum ${minWithdrawal} ETB Required` 
                : (t.referrals?.mlm?.withdrawal?.submitBtn || 'Request Withdrawal')}
          </button>
        </form>
      </div>

      {/* Right Column: History */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 className="mlm-section-title">{t.referrals?.mlm?.withdrawal?.historyTitle || 'Withdrawal History'}</h3>
        
        {withdrawalsLoading ? (
          <div className="spinner spinner-sm" />
        ) : withdrawals.length === 0 ? (
          <div className="mlm-empty-state" style={{ padding: '2rem 0' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No withdrawals yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {withdrawals.map(w => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', display: 'block' }}>{formatETB(w.amount)} ETB</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(w.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: w.status === 'paid' ? '#10b981' : w.status === 'rejected' ? '#ef4444' : '#f59e0b',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem',
                  background: w.status === 'paid' ? 'rgba(16,185,129,0.1)' : w.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)'
                }}>
                  {w.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MLMWithdrawalPanel;