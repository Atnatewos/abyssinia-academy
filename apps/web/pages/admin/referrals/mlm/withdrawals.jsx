/**
 * @fileoverview Admin MLM Withdrawal Approval Queue
 *
 * Route: /admin/referrals/mlm/withdrawals
 *
 * Lists all withdrawal requests with status tabs and client-side search.
 * Admin approves (marks paid with transaction reference) or rejects
 * (funds return to the user) through a confirmation dialog.
 *
 * Path: apps/web/pages/admin/referrals/mlm/withdrawals.jsx
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Banknote,
  Search,
  Loader,
  AlertTriangle,
  CreditCard,
  Building2,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import AdminLayout from '../../../../components/admin/AdminLayout';
import Modal from '../../../../components/shared/Modal';
import { useToast } from '../../../../context/ToastContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { getItem } from '../../../../lib/storage';

const STATUS_TABS = ['all', 'pending', 'approved', 'paid', 'rejected'];

const METHOD_ICONS = {
  telebirr: CreditCard,
  'cbe-birr': Building2,
  'bank-transfer': Banknote,
};

/**
 * Formats an ISO date to a short readable string.
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

const AdminMlmWithdrawalsPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();

  const [adminUser, setAdminUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const token = getItem('admin_token');
    const user = getItem('admin_user');

    if (!token) {
      router.push('/admin/login');
      return;
    }
    if (user) {
      setAdminUser(typeof user === 'string' ? JSON.parse(user) : user);
    }
    setIsAuthLoading(false);
  }, [router]);

  /**
   * Fetches the withdrawal queue for the active status tab.
   */
  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '100');

      const token = getItem('admin_token');
      const response = await fetch(`/api/admin/referrals/mlm/withdrawals?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = await response.json();

      if (payload.success) {
        const list = payload.data?.withdrawals
          || (Array.isArray(payload.data) ? payload.data : []);
        setWithdrawals(list);
      } else {
        setError(payload.message || 'Failed to load withdrawals');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchWithdrawals();
    }
  }, [isAuthLoading, fetchWithdrawals]);

  /**
   * Client-side search over the loaded page of withdrawals.
   */
  const filteredWithdrawals = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return withdrawals;

    return withdrawals.filter((withdrawal) => {
      const haystack = [
        withdrawal.userName,
        withdrawal.accountName,
        withdrawal.accountNumber,
        withdrawal.transactionRef,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [withdrawals, searchQuery]);

  /**
   * Opens the detail modal for a withdrawal row.
   * @param {object} withdrawal
   */
  const handleOpenDetail = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setAdminNote('');
    setTransactionRef('');
    setIsDetailModalOpen(true);
  };

  /**
   * Starts the confirm flow for approve/reject.
   * @param {string} action
   */
  const handleInitiateAction = (action) => {
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  /**
   * Submits the approve/reject decision to the processing endpoint.
   */
  const handleProcessAction = async () => {
    if (!selectedWithdrawal || !confirmAction) return;

    setIsProcessing(true);
    try {
      const token = getItem('admin_token');
      const response = await fetch(`/api/admin/referrals/mlm/withdrawals/${selectedWithdrawal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: confirmAction,
          note: adminNote.trim() || null,
          transactionRef: transactionRef.trim() || null,
        }),
      });

      const payload = await response.json();

      if (payload.success) {
        toast.success(
          confirmAction === 'approve'
            ? (t.referrals?.mlm?.adminWithdrawalApproved || 'Withdrawal marked as paid.')
            : (t.referrals?.mlm?.adminWithdrawalRejected || 'Withdrawal rejected. Funds returned to user.')
        );
        setIsConfirmOpen(false);
        setIsDetailModalOpen(false);
        setSelectedWithdrawal(null);
        await fetchWithdrawals();
      } else {
        toast.error(payload.message || 'Action failed');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isAuthLoading || !adminUser) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <Loader className="animate-spin" size={24} />
        </div>
      </AdminLayout>
    );
  }

  const pendingCount = withdrawals.filter((w) => w.status === 'pending').length;

  return (
    <AdminLayout
      title={t.referrals?.mlm?.adminWithdrawalsTitle || 'Withdrawal Requests'}
      subtitle={t.referrals?.mlm?.adminWithdrawalsSubtitle || 'Review and process cash payouts'}
    >
      <div className="admin-page">
        <div className="admin-page-header">
          <button
            type="button"
            className="admin-back-btn"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft size={16} />
          </button>
          {pendingCount > 0 && (
            <span className="admin-badge admin-badge-warning">
              {pendingCount} pending
            </span>
          )}
        </div>

        <div className="admin-filters">
          <div className="admin-filter-tabs">
            {STATUS_TABS.map((status) => (
              <button
                key={status}
                type="button"
                className={`admin-filter-tab ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
          <div className="admin-search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by name or account..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-search-input"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="admin-loading">
            <Loader className="animate-spin" size={24} />
          </div>
        ) : error ? (
          <div className="admin-error-banner">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        ) : filteredWithdrawals.length === 0 ? (
          <div className="admin-empty-state">
            <Banknote size={40} className="admin-empty-icon" />
            <p>
              {t.referrals?.mlm?.adminWithdrawalsEmpty || 'No withdrawal requests match your filters.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Account</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal) => {
                  const MethodIcon = METHOD_ICONS[withdrawal.method] || CreditCard;
                  return (
                    <tr
                      key={withdrawal.id}
                      className="admin-table-row-clickable"
                      onClick={() => handleOpenDetail(withdrawal)}
                    >
                      <td>
                        <span className="admin-user-name">
                          {withdrawal.userName || withdrawal.accountName || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className="admin-amount">
                          {withdrawal.amount.toLocaleString()} ETB
                        </span>
                      </td>
                      <td>
                        <span className="admin-method-badge">
                          <MethodIcon size={14} />
                          {withdrawal.method}
                        </span>
                      </td>
                      <td className="admin-cell-muted">{withdrawal.accountNumber || '—'}</td>
                      <td className="admin-cell-muted">{formatDate(withdrawal.createdAt)}</td>
                      <td>
                        <span className={`admin-status-badge admin-status-${withdrawal.status}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td>
                        {withdrawal.status === 'pending' && (
                          <div className="admin-row-actions">
                            <button
                              type="button"
                              className="admin-action-btn admin-action-approve"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(withdrawal);
                                setConfirmAction('approve');
                              }}
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              type="button"
                              className="admin-action-btn admin-action-reject"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(withdrawal);
                                setConfirmAction('reject');
                              }}
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={t.referrals?.mlm?.withdrawalRequestTitle || 'Withdrawal Details'}
        >
          {selectedWithdrawal && (
            <div className="admin-withdrawal-detail">
              <div className="admin-withdrawal-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">User</span>
                  <span className="admin-detail-value">
                    {selectedWithdrawal.userName || selectedWithdrawal.accountName}
                  </span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Amount</span>
                  <span className="admin-detail-value admin-amount">
                    {selectedWithdrawal.amount.toLocaleString()} ETB
                  </span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Method</span>
                  <span className="admin-detail-value">{selectedWithdrawal.method}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Account Number</span>
                  <span className="admin-detail-value">{selectedWithdrawal.accountNumber}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Account Name</span>
                  <span className="admin-detail-value">{selectedWithdrawal.accountName}</span>
                </div>
                {selectedWithdrawal.bankName && (
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Bank</span>
                    <span className="admin-detail-value">{selectedWithdrawal.bankName}</span>
                  </div>
                )}
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Requested</span>
                  <span className="admin-detail-value">{formatDate(selectedWithdrawal.createdAt)}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Status</span>
                  <span className={`admin-status-badge admin-status-${selectedWithdrawal.status}`}>
                    {selectedWithdrawal.status}
                  </span>
                </div>
              </div>

              {selectedWithdrawal.status === 'pending' && (
                <div className="admin-withdrawal-actions">
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      {t.referrals?.mlm?.adminWithdrawalTxRef || 'Transaction Reference'}
                    </label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder={t.referrals?.mlm?.adminWithdrawalTxRefPlaceholder || 'e.g., Telebirr TX ID'}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      {t.referrals?.mlm?.adminWithdrawalNote || 'Admin Note'}
                    </label>
                    <textarea
                      className="admin-form-textarea"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      rows={2}
                      placeholder="Optional note..."
                    />
                  </div>
                  <div className="admin-withdrawal-action-buttons">
                    <button
                      type="button"
                      className="admin-btn primary"
                      onClick={() => handleInitiateAction('approve')}
                    >
                      <CheckCircle size={16} />
                      {t.referrals?.mlm?.adminWithdrawalApprove || 'Approve & Mark Paid'}
                    </button>
                    <button
                      type="button"
                      className="admin-btn danger"
                      onClick={() => handleInitiateAction('reject')}
                    >
                      <XCircle size={16} />
                      {t.referrals?.mlm?.adminWithdrawalReject || 'Reject Request'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {isConfirmOpen && (
          <div className="admin-confirm-overlay" onClick={() => setIsConfirmOpen(false)}>
            <div className="admin-confirm-dialog" onClick={(e) => e.stopPropagation()}>
              <h3 className="admin-confirm-title">
                {confirmAction === 'approve'
                  ? (t.referrals?.mlm?.adminWithdrawalConfirmApprove || 'Mark this withdrawal as paid?')
                  : (t.referrals?.mlm?.adminWithdrawalConfirmReject || 'Reject this withdrawal? Funds will return to the user.')}
              </h3>
              <div className="admin-confirm-actions">
                <button
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`admin-btn ${confirmAction === 'approve' ? 'primary' : 'danger'}`}
                  onClick={handleProcessAction}
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader className="animate-spin" size={16} /> : null}
                  {confirmAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMlmWithdrawalsPage;