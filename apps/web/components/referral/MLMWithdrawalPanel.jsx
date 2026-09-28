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

import React, { useState, useMemo } from 'react';
import { Banknote, CreditCard, Building2, Clock, CheckCircle, XCircle, Loader, Lock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { getWithdrawalConfig } from '../../lib/config';

const METHOD_ICONS = {
  telebirr: CreditCard,
  'cbe-birr': Building2,
  'bank-transfer': Banknote,
};

const STATUS_CONFIG = {
  pending: { icon: Clock, color: '#f59e0b', labelKey: 'status_pending' },
  approved: { icon: CheckCircle, color: '#3b82f6', labelKey: 'status_approved' },
  paid: { icon: CheckCircle, color: '#10b981', labelKey: 'status_paid' },
  rejected: { icon: XCircle, color: '#ef4444', labelKey: 'status_rejected' },
};

/**
 * Formats an ISO date string for display.
 * @param {string} isoDate
 * @returns {string}
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
  } catch {
    return isoDate;
  }
};

const MLMWithdrawalPanel = ({
  wallet,
  withdrawals,
  withdrawalsLoading,
  withdrawalSubmitting,
  onRequestWithdrawal,
}) => {
  const { t } = useLanguage();
  const toast = useToast();
  const withdrawalConfig = useMemo(() => getWithdrawalConfig(), []);

  const minimumAmount = withdrawalConfig?.minimumAmountETB || 500;
  const methods = withdrawalConfig?.methods || ['telebirr', 'cbe-birr', 'bank-transfer'];

  /* Money Model v2: unified withdrawable balance */
  const availableBalance = wallet?.availableNow ?? wallet?.commissionBalance ?? 0;
  const lockedTotal = wallet?.lockedTotal ?? 0;
  const hasPendingWithdrawal = (withdrawals || []).some((w) => w.status === 'pending');

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(methods[0] || 'telebirr');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [formErrors, setFormErrors] = useState({});

  /**
   * Validates the withdrawal form against config-driven rules.
   * @returns {boolean} True if valid
   */
  const validateForm = () => {
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
  };

  /**
   * Handles withdrawal form submission.
   * @param {React.FormEvent} event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      amount: Number(amount),
      method,
      accountNumber: accountNumber.trim(),
      accountName: accountName.trim(),
      bankName: method === 'bank-transfer' ? bankName.trim() : null,
    };

    const result = await onRequestWithdrawal(payload);

    if (result.success) {
      toast.success(
        t.referrals?.mlm?.withdrawal?.submitted ||
          'Withdrawal request submitted. Admin will process within 48 hours.'
      );
      setAmount('');
      setAccountNumber('');
      setAccountName('');
      setBankName('');
      setFormErrors({});
    } else {
      toast.error(result.message || 'Withdrawal failed');
    }
  };

  const lockedHint = (t.referrals?.mlm?.withdrawal?.lockedHint ||
    'You have {amount} ETB still in the 7-day lock window.')
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
            <Lock size={18} />
            <span>{lockedHint}</span>
          </div>
        )}

        {hasPendingWithdrawal ? (
          <div className="mlm-withdrawal-pending-notice">
            <Clock size={18} />
            <span>
              {t.referrals?.mlm?.withdrawal?.pendingNotice ||
                'You already have a pending withdrawal request. Please wait for it to be processed.'}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mlm-withdrawal-form">
            <div className="mlm-form-group">
              <label className="mlm-form-label">
                {t.referrals?.mlm?.withdrawal?.amountLabel || 'Amount (ETB)'}
              </label>
              <input
                type="number"
                className={`mlm-form-input ${formErrors.amount ? 'error' : ''}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`${t.referrals?.mlm?.withdrawal?.minimumIs || 'Min'} ${minimumAmount}`}
                min={minimumAmount}
                max={availableBalance}
              />
              {formErrors.amount && <span className="mlm-form-error">{formErrors.amount}</span>}
            </div>

            <div className="mlm-form-group">
              <label className="mlm-form-label">
                {t.referrals?.mlm?.withdrawal?.methodLabel || 'Payment Method'}
              </label>
              <div className="mlm-method-selector">
                {methods.map((m) => {
                  const IconComponent = METHOD_ICONS[m] || CreditCard;
                  const label = t.referrals?.mlm?.withdrawal?.[`method_${m.replace(/-/g, '_')}`] || m;
                  return (
                    <button
                      key={m}
                      type="button"
                      className={`mlm-method-btn ${method === m ? 'active' : ''}`}
                      onClick={() => setMethod(m)}
                    >
                      <IconComponent size={18} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mlm-form-group">
              <label className="mlm-form-label">
                {t.referrals?.mlm?.withdrawal?.accountLabel || 'Account Number'}
              </label>
              <input
                type="text"
                className={`mlm-form-input ${formErrors.accountNumber ? 'error' : ''}`}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="09XXXXXXXX"
              />
              {formErrors.accountNumber && <span className="mlm-form-error">{formErrors.accountNumber}</span>}
            </div>

            <div className="mlm-form-group">
              <label className="mlm-form-label">
                {t.referrals?.mlm?.withdrawal?.nameLabel || 'Account Holder Name'}
              </label>
              <input
                type="text"
                className={`mlm-form-input ${formErrors.accountName ? 'error' : ''}`}
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Abebe Kebede"
              />
              {formErrors.accountName && <span className="mlm-form-error">{formErrors.accountName}</span>}
            </div>

            {method === 'bank-transfer' && (
              <div className="mlm-form-group">
                <label className="mlm-form-label">
                  {t.referrals?.mlm?.withdrawal?.bankLabel || 'Bank Name'}
                </label>
                <input
                  type="text"
                  className={`mlm-form-input ${formErrors.bankName ? 'error' : ''}`}
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Commercial Bank of Ethiopia"
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
                  <Loader size={16} className="spin" />
                  {t.referrals?.mlm?.withdrawal?.submitting || 'Submitting...'}
                </>
              ) : (
                <>
                  <Banknote size={16} />
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
          <div className="mlm-table-loading">
            <div className="spinner spinner-sm" />
          </div>
        ) : !withdrawals || withdrawals.length === 0 ? (
          <div className="mlm-empty-state">
            <p>{t.referrals?.mlm?.withdrawal?.noHistory || 'No withdrawal requests yet.'}</p>
          </div>
        ) : (
          <div className="mlm-withdrawal-list">
            {withdrawals.map((withdrawal) => {
              const statusConfig = STATUS_CONFIG[withdrawal.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;
              const MethodIcon = METHOD_ICONS[withdrawal.method] || CreditCard;
              return (
                <div key={withdrawal.id} className="mlm-withdrawal-item">
                  <div className="mlm-withdrawal-item-left">
                    <div className="mlm-withdrawal-method-icon">
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
                    <StatusIcon size={14} />
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