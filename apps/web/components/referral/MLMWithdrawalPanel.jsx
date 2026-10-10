/**
 * @fileoverview MLM Withdrawal Panel
 *
 * Withdrawal request form + history list (Money Model v2).
 * Available balance reads wallet.availableNow — the unified withdrawable
 * figure (current_balance − locked commissions − locked bonuses).
 * A lock hint surfaces still-locked funds for transparency.
 *
 * Path: apps/web/components/referral/MLMWithdrawalPanel.jsx
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Banknote,
  CreditCard,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Lock,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getWithdrawalConfig } from '../../lib/config';

/**
 * Fallback constants for configuration values.
 * Used only if the central configuration fails to load.
 */
const DEFAULT_MINIMUM_WITHDRAWAL = 500;
const DEFAULT_PAYMENT_METHODS = ['telebirr', 'cbe-birr', 'bank-transfer'];
const DEFAULT_LOCK_WINDOW_DAYS = 7;

/**
 * Maps payment method identifiers to their corresponding Lucide icons.
 */
const METHOD_ICONS = {
  telebirr: CreditCard,
  'cbe-birr': Building2,
  'bank-transfer': Banknote,
};

/**
 * Maps withdrawal status identifiers to their UI configuration.
 */
const STATUS_CONFIG = {
  pending: { icon: Clock, color: '#f59e0b', labelKey: 'status_pending' },
  approved: { icon: CheckCircle, color: '#3b82f6', labelKey: 'status_approved' },
  paid: { icon: CheckCircle, color: '#10b981', labelKey: 'status_paid' },
  rejected: { icon: XCircle, color: '#ef4444', labelKey: 'status_rejected' },
};

/**
 * Formats an ISO date string into a human-readable locale string.
 *
 * @param {string} isoDate - The ISO 8601 date string to format.
 * @returns {string} The formatted date string or a fallback dash.
 */
const formatDate = (isoDate) => {
  if (!isoDate) return '—';
  
  try {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Date formatting failed:', error);
    return isoDate;
  }
};

/**
 * MLMWithdrawalPanel component handles the display of available balances,
 * submission of withdrawal requests, and the historical log of past withdrawals.
 *
 * @param {Object} props - Component properties.
 * @param {Object} props.wallet - The user's wallet data containing balances.
 * @param {Array} props.withdrawals - List of historical withdrawal requests.
 * @param {boolean} props.withdrawalsLoading - Loading state for history fetch.
 * @param {boolean} props.withdrawalSubmitting - Loading state for form submission.
 * @param {Function} props.onRequestWithdrawal - Callback to trigger withdrawal API request.
 */
const MLMWithdrawalPanel = ({
  wallet,
  withdrawals,
  withdrawalsLoading,
  withdrawalSubmitting,
  onRequestWithdrawal,
}) => {
  const { t } = useLanguage();
  const toast = useToast();
  
  // Memoize configuration to prevent unnecessary re-renders
  const withdrawalConfig = useMemo(() => getWithdrawalConfig(), []);

  const minimumAmount = withdrawalConfig?.minimumAmountETB || DEFAULT_MINIMUM_WITHDRAWAL;
  const methods = withdrawalConfig?.methods || DEFAULT_PAYMENT_METHODS;
  const lockWindowDays = withdrawalConfig?.unlockDelayDays || DEFAULT_LOCK_WINDOW_DAYS;

  // Money Model v2: unified withdrawable balance
  const availableBalance = wallet?.availableNow ?? wallet?.commissionBalance ?? 0;
  const lockedTotal = wallet?.lockedTotal ?? 0;
  const hasPendingWithdrawal = (withdrawals || []).some((w) => w.status === 'pending');

  // Form state management
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(methods[0] || 'telebirr');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [formErrors, setFormErrors] = useState({});

  /**
   * Validates the withdrawal form against config-driven business rules.
   *
   * @returns {boolean} True if the form is valid and ready for submission.
   */
  const validateForm = useCallback(() => {
    const errors = {};
    const numericAmount = Number(amount);

    if (!amount || Number.isNaN(numericAmount)) {
      errors.amount = t.referrals?.mlm?.withdrawal?.invalidAmount || 'Enter a valid amount';
    } else if (numericAmount < minimumAmount) {
      errors.amount = `${t.referrals?.mlm?.withdrawal?.minimumIs || 'Minimum withdrawal is'} ${minimumAmount} ETB`;
    } else if (numericAmount > availableBalance) {
      errors.amount = t.referrals?.mlm?.withdrawal?.insufficientBalance || 'Insufficient available balance';
    }

    if (!accountNumber.trim()) {
      errors.accountNumber = t.referrals?.mlm?.withdrawal?.accountRequired || 'Account number is required';
    }
    
    if (!accountName.trim()) {
      errors.accountName = t.referrals?.mlm?.withdrawal?.nameRequired || 'Account name is required';
    }
    
    if (method === 'bank-transfer' && !bankName.trim()) {
      errors.bankName = t.referrals?.mlm?.withdrawal?.bankRequired || 'Bank name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [amount, accountNumber, accountName, bankName, method, availableBalance, minimumAmount, t]);

  /**
   * Handles the submission of the withdrawal request form.
   * Sanitizes inputs and triggers the API callback.
   *
   * @param {React.FormEvent} event - The form submission event.
   */
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    const payload = {
      amount: Number(amount),
      method,
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      bankName: method === 'bank-transfer' ? bankName.trim() : null,
    };

    try {
      const result = await onRequestWithdrawal(payload);

      if (result?.success) {
        toast.success(
          t.referrals?.mlm?.withdrawal?.submitted ||
            'Withdrawal request submitted. Admin will process within 48 hours.'
        );
        
        // Reset form on success
        setAmount('');
        setAccountNumber('');
        setAccountName('');
        setBankName('');
        setFormErrors({});
      } else {
        toast.error(result?.message || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal submission error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  }, [validateForm, amount, method, accountNumber, accountName, bankName, onRequestWithdrawal, toast, t]);

  const lockedHint = (t.referrals?.mlm?.withdrawal?.lockedHint ||
    `You have {amount} ETB still in the ${lockWindowDays}-day lock window.`)
    .replace('{amount}', lockedTotal.toLocaleString('en-US'));

  return (
    <div className="mlm-withdrawal-panel">
      {/* Request Form */}
      <div className="glass-card mlm-withdrawal-form-card">
        <h3 className="mlm-section-title">
          {t.referrals?.mlm?.withdrawal?.title || 'Request Withdrawal'}
        </h3>
        <p className="mlm-section-subtitle">
          {t.referrals?.mlm?.withdrawal?.subtitle || 'Withdraw your available balance to your preferred payment method.'}
        </p>

        <div className="mlm-withdrawal-balance">
          <span className="mlm-withdrawal-balance-label">
            {t.referrals?.mlm?.withdrawal?.availableBalance || 'Available Balance'}
          </span>
          <span className="mlm-withdrawal-balance-value">
            {availableBalance.toLocaleString('en-US')} ETB
          </span>
        </div>

        {lockedTotal > 0 && (
          <div className="mlm-withdrawal-pending-notice" style={{ marginBottom: '1rem' }}>
            <Lock size={18} aria-hidden="true" />
            <span>{lockedHint}</span>
          </div>
        )}

        {hasPendingWithdrawal ? (
          <div className="mlm-withdrawal-pending-notice">
            <Clock size={18} aria-hidden="true" />
            <span>
              {t.referrals?.mlm?.withdrawal?.pendingNotice ||
                'You already have a pending withdrawal request. Please wait for it to be processed.'}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mlm-withdrawal-form" noValidate>
            <div className="mlm-form-group">
              <label className="mlm-form-label" htmlFor="withdrawal-amount">
                {t.referrals?.mlm?.withdrawal?.amountLabel || 'Amount (ETB)'}
              </label>
              <input
                id="withdrawal-amount"
                type="number"
                className={`mlm-form-input ${formErrors.amount ? 'error' : ''}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`${t.referrals?.mlm?.withdrawal?.minimumIs || 'Min'} ${minimumAmount}`}
                min={minimumAmount}
                max={availableBalance}
                autoComplete="off"
              />
              {formErrors.amount && <span className="mlm-form-error">{formErrors.amount}</span>}
            </div>

            <div className="mlm-form-group">
              <label className="mlm-form-label">
                {t.referrals?.mlm?.withdrawal?.methodLabel || 'Payment Method'}
              </label>
              <div className="mlm-method-selector" role="radiogroup" aria-label="Payment Method">
                {methods.map((m) => {
                  const IconComponent = METHOD_ICONS[m] || CreditCard;
                  const label = t.referrals?.mlm?.withdrawal?.[`method_${m.replace(/-/g, '_')}`] || m;
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`mlm-method-btn ${method === m ? 'active' : ''}`}
                      onClick={() => setMethod(m)}
                      role="radio"
                      aria-checked={method === m}
                    >
                      <IconComponent size={18} aria-hidden="true" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mlm-form-group">
              <label className="mlm-form-label" htmlFor="withdrawal-account-number">
                {t.referrals?.mlm?.withdrawal?.accountLabel || 'Account Number'}
              </label>
              <input
                id="withdrawal-account-number"
                type="text"
                className={`mlm-form-input ${formErrors.accountNumber ? 'error' : ''}`}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="09XXXXXXXX"
                autoComplete="off"
              />
              {formErrors.accountNumber && <span className="mlm-form-error">{formErrors.accountNumber}</span>}
            </div>

            <div className="mlm-form-group">
              <label className="mlm-form-label" htmlFor="withdrawal-account-name">
                {t.referrals?.mlm?.withdrawal?.nameLabel || 'Account Holder Name'}
              </label>
              <input
                id="withdrawal-account-name"
                type="text"
                className={`mlm-form-input ${formErrors.accountName ? 'error' : ''}`}
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Abebe Kebede"
                autoComplete="off"
              />
              {formErrors.accountName && <span className="mlm-form-error">{formErrors.accountName}</span>}
            </div>

            {method === 'bank-transfer' && (
              <div className="mlm-form-group">
                <label className="mlm-form-label" htmlFor="withdrawal-bank-name">
                  {t.referrals?.mlm?.withdrawal?.bankLabel || 'Bank Name'}
                </label>
                <input
                  id="withdrawal-bank-name"
                  type="text"
                  className={`mlm-form-input ${formErrors.bankName ? 'error' : ''}`}
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Commercial Bank of Ethiopia"
                  autoComplete="off"
                />
                {formErrors.bankName && <span className="mlm-form-error">{formErrors.bankName}</span>}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary mlm-withdrawal-submit"
              disabled={withdrawalSubmitting || availableBalance < minimumAmount}
            >
              {withdrawalSubmitting ? (
                <>
                  <Loader size={16} className="spin" aria-hidden="true" />
                  {t.referrals?.mlm?.withdrawal?.submitting || 'Submitting...'}
                </>
              ) : (
                <>
                  <Banknote size={16} aria-hidden="true" />
                  {t.referrals?.mlm?.withdrawal?.submitBtn || 'Request Withdrawal'}
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Withdrawal History */}
      <div className="glass-card mlm-withdrawal-history-card">
        <h3 className="mlm-section-title">
          {t.referrals?.mlm?.withdrawal?.historyTitle || 'Withdrawal History'}
        </h3>

        {withdrawalsLoading ? (
          <div className="mlm-table-loading" role="status" aria-label="Loading withdrawal history">
            <div className="spinner spinner-sm" />
          </div>
        ) : !withdrawals || withdrawals.length === 0 ? (
          <div className="mlm-empty-state">
            <p>{t.referrals?.mlm?.withdrawal?.noHistory || 'No withdrawal requests yet.'}</p>
          </div>
        ) : (
          <div className="mlm-withdrawal-list" role="list">
            {withdrawals.map((withdrawal) => {
              const statusConfig = STATUS_CONFIG[withdrawal.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              const MethodIcon = METHOD_ICONS[withdrawal.method] || CreditCard;
              
              return (
                <div key={withdrawal.id} className="mlm-withdrawal-item" role="listitem">
                  <div className="mlm-withdrawal-item-left">
                    <div className="mlm-withdrawal-method-icon" aria-hidden="true">
                      <MethodIcon size={18} />
                    </div>
                    <div className="mlm-withdrawal-item-info">
                      <span className="mlm-withdrawal-amount">
                        {Number(withdrawal.amount).toLocaleString('en-US')} ETB
                      </span>
                      <span className="mlm-withdrawal-date">{formatDate(withdrawal.createdAt)}</span>
                      {withdrawal.adminNote && (
                        <span className="mlm-withdrawal-note">{withdrawal.adminNote}</span>
                      )}
                    </div>
                  </div>
                  <span className="mlm-withdrawal-status" style={{ color: statusConfig.color }}>
                    <StatusIcon size={14} aria-hidden="true" />
                    {t.referrals?.mlm?.withdrawal?.[statusConfig.labelKey] || withdrawal.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MLMWithdrawalPanel;