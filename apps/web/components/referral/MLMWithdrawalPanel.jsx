/**
 * @fileoverview MLM Withdrawal Panel (Unified Wallet)
 *
 * Provides a crystal-clear breakdown of earnings for the user:
 * - Total Earned (Agent + Referral)
 * - Locked amount (and why)
 * - Available to withdraw
 *
 * The withdrawal form captures:
 * - Amount (validated against min/max/available)
 * - Payment method (telebirr | cbe_birr | bank_transfer)
 * - Account number
 * - Account name (holder)
 * - Bank name (only when method === bank_transfer)
 *
 * Path: apps/web/components/referral/MLMWithdrawalPanel.jsx
 */

import React, { useState } from 'react';
import { Wallet, Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const formatETB = (value) => {
  if (!value) return '0';
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 0 });
};

/**
 * Allowed payment methods.
 * IMPORTANT: These must match the backend whitelist exactly:
 * 'telebirr', 'cbe_birr', 'bank_transfer' (underscore, not hyphen).
 */
const PAYMENT_METHODS = [
  { id: 'telebirr', label: 'Telebirr', requiresBank: false },
  { id: 'cbe_birr', label: 'CBE Birr', requiresBank: false },
  { id: 'bank_transfer', label: 'Bank Transfer', requiresBank: true },
];

const MLMWithdrawalPanel = ({
  wallet,
  withdrawals = [],
  withdrawalsLoading,
  withdrawalSubmitting,
  onRequestWithdrawal,
}) => {
  const { t } = useLanguage();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('telebirr');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [validationError, setValidationError] = useState(null);

  const availableBalance = wallet?.availableNow || 0;
  const lockedBalance = wallet?.lockedTotal || 0;
  const totalBalance = availableBalance + lockedBalance;

  const minWithdrawal = 500;

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method);
  const requiresBank = selectedMethod?.requiresBank === true;

  const canSubmit =
    !withdrawalSubmitting &&
    availableBalance >= minWithdrawal &&
    amount &&
    Number(amount) >= minWithdrawal &&
    Number(amount) <= availableBalance &&
    accountNumber.trim().length >= 6 &&
    accountName.trim().length >= 2 &&
    (!requiresBank || bankName.trim().length >= 2);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);

    /* Client-side validation */
    if (!amount || Number(amount) < minWithdrawal) {
      setValidationError(`Minimum withdrawal is ${minWithdrawal} ETB.`);
      return;
    }
    if (Number(amount) > availableBalance) {
      setValidationError(`Insufficient balance. Available: ${formatETB(availableBalance)} ETB.`);
      return;
    }
    if (!accountNumber.trim()) {
      setValidationError('Account number is required.');
      return;
    }
    if (!accountName.trim()) {
      setValidationError('Account holder name is required.');
      return;
    }
    if (requiresBank && !bankName.trim()) {
      setValidationError('Bank name is required for bank transfers.');
      return;
    }

    /* Build the full payload matching the backend contract */
    const payload = {
      amount: Number(amount),
      method,
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      bankName: requiresBank ? bankName.trim() : null,
    };

    const result = await onRequestWithdrawal(payload);

    /* Only clear the form on success */
    if (result && result.success) {
      setAmount('');
      setAccountNumber('');
      setAccountName('');
      setBankName('');
    } else {
      setValidationError(result?.message || 'Failed to submit withdrawal.');
    }
  };

  return (
    <div className="mlm-withdrawal-panel">
      {/* ── Request Form ── */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h3 className="mlm-section-title">
          {t.referrals?.mlm?.withdrawal?.title || 'Request Withdrawal'}
        </h3>
        <p className="mlm-section-subtitle" style={{ marginBottom: '1.5rem' }}>
          Cash out your combined earnings from network referrals and direct agent sales.
        </p>

        {/* Balance Breakdown */}
        <div style={{
          background: 'rgba(15,23,42,0.6)',
          border: '1px solid var(--border-medium)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: '0.75rem',
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Total Earnings
            </span>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff' }}>
              {formatETB(totalBalance)} ETB
            </span>
          </div>

          {lockedBalance > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <Lock size={16} style={{ color: '#f59e0b', marginTop: '2px' }} />
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: 600, display: 'block' }}>
                    Locked Balance
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                    Referral commissions unlock after 7 days.
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f59e0b' }}>
                {formatETB(lockedBalance)} ETB
              </span>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(16,185,129,0.1)',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(16,185,129,0.2)',
            marginTop: '0.25rem',
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Wallet size={18} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 700 }}>
                Available to Withdraw
              </span>
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {formatETB(availableBalance)} ETB
            </span>
          </div>
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
          {/* Amount */}
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

          {/* Payment Method */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Payment Method
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  disabled={withdrawalSubmitting}
                  style={{
                    flex: 1,
                    minWidth: '6rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: withdrawalSubmitting ? 'not-allowed' : 'pointer',
                    border: method === m.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                    background: method === m.id ? 'rgba(245,158,11,0.12)' : 'var(--bg-input)',
                    color: method === m.id ? 'var(--accent-gold)' : 'var(--text-dim)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Account Number
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={requiresBank ? 'e.g., 1000123456789' : 'e.g., 0911223344'}
              className="checkout-input"
              disabled={withdrawalSubmitting}
            />
          </div>

          {/* Account Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Account Holder Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Full name as it appears on the account"
              className="checkout-input"
              disabled={withdrawalSubmitting}
            />
          </div>

          {/* Bank Name (conditional) */}
          {requiresBank && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., Commercial Bank of Ethiopia"
                className="checkout-input"
                disabled={withdrawalSubmitting}
              />
            </div>
          )}

          {/* Validation error */}
          {validationError && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start',
              padding: '0.625rem 0.75rem',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              color: '#ef4444',
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="checkout-submit-btn"
            disabled={!canSubmit}
            style={{
              opacity: canSubmit ? 1 : 0.5,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
            }}
          >
            {withdrawalSubmitting
              ? 'Submitting...'
              : availableBalance < minWithdrawal
                ? `Minimum ${minWithdrawal} ETB Required`
                : t.referrals?.mlm?.withdrawal?.submitBtn || 'Request Withdrawal'}
          </button>
        </form>
      </div>

      {/* ── Withdrawal History ── */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 className="mlm-section-title">
          {t.referrals?.mlm?.withdrawal?.historyTitle || 'Withdrawal History'}
        </h3>

        {withdrawalsLoading ? (
          <div className="spinner spinner-sm" />
        ) : withdrawals.length === 0 ? (
          <div className="mlm-empty-state" style={{ padding: '2rem 0' }}>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No withdrawals yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
            {withdrawals.map((w) => (
              <div key={w.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', display: 'block' }}>
                    {formatETB(w.amount)} ETB
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(w.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: w.status === 'paid' ? '#10b981' : w.status === 'rejected' ? '#ef4444' : '#f59e0b',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem',
                  background: w.status === 'paid' ? 'rgba(16,185,129,0.1)' : w.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
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