/**
 * @fileoverview Payments Table Component
 * Displays payment records with approve/reject actions
 * Path: apps/web/components/admin/PaymentsTable.jsx
 */

import { useState } from 'react';
import { Check, X, Eye, Search } from 'lucide-react';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';

/**
 * PaymentsTable - Admin table for managing payment submissions
 * @param {object} props
 * @param {Array} props.payments - Array of payment objects
 * @param {boolean} props.loading - Whether data is loading
 * @param {Function} props.onRefresh - Callback to refresh payment data
 */
const PaymentsTable = ({ payments = [], loading = false, onRefresh }) => {
  const toast = useToast();
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Filter payments by search term
   */
  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (payment.user_name && payment.user_name.toLowerCase().includes(term)) ||
      (payment.user_phone && payment.user_phone.includes(term)) ||
      (payment.reference && payment.reference.toLowerCase().includes(term))
    );
  });

  /**
   * Handle approve/reject action
   * @param {string} action - 'approve' or 'reject'
   */
  const handleAction = async () => {
    if (!confirmAction) return;

    setActionLoading(true);

    try {
      const endpoint =
        confirmAction.action === 'approve'
          ? `/admin/payments/${confirmAction.paymentId}/approve`
          : `/admin/payments/${confirmAction.paymentId}/reject`;

      const response = await apiClient.patch(endpoint);

      if (response && response.success) {
        toast.success(response.message || `Payment ${confirmAction.action}d successfully.`);
        if (onRefresh) onRefresh();
      } else {
        toast.error(response?.message || 'Action failed.');
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to process payment.';
      toast.error(message);
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  /**
   * Get status badge styling
   * @param {string} status - Payment status
   * @returns {object} Badge classes
   */
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
      approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
      rejected: 'bg-red-500/10 text-red-500 border-red-500/30',
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, phone, or reference..."
          className="glass-input pl-10"
        />
      </div>

      {/* Table */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl">
          <p className="text-slate-500 text-sm">
            {searchTerm ? 'No payments match your search.' : 'No payments found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* Payment Info */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {payment.user_name || 'Unknown'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(payment.status)}`}
                  >
                    {payment.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {payment.user_phone} &bull; Ref: {payment.reference || 'N/A'}
                </p>
                <p className="text-xs text-slate-400">
                  {payment.method} &bull; {new Date(payment.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Amount & Actions */}
              <div className="flex items-center gap-4">
                <span className="text-lg font-extrabold text-amber-500">
                  {payment.amount?.toLocaleString()} ETB
                </span>

                {payment.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    {payment.transaction_id && (
                      <a
                        href={payment.transaction_id}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                        title="View Screenshot"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() =>
                        setConfirmAction({
                          paymentId: payment.id,
                          action: 'approve',
                          name: payment.user_name,
                        })
                      }
                      className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
                      title="Approve Payment"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({
                          paymentId: payment.id,
                          action: 'reject',
                          name: payment.user_name,
                        })
                      }
                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                      title="Reject Payment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        title={
          confirmAction?.action === 'approve'
            ? 'Approve Payment'
            : 'Reject Payment'
        }
        message={
          confirmAction?.action === 'approve'
            ? `Are you sure you want to approve the payment from ${confirmAction?.name}? This will enroll the student.`
            : `Are you sure you want to reject the payment from ${confirmAction?.name}?`
        }
        confirmText={confirmAction?.action === 'approve' ? 'Approve' : 'Reject'}
        variant={confirmAction?.action === 'approve' ? 'warning' : 'danger'}
        loading={actionLoading}
      />
    </>
  );
};

export default PaymentsTable;