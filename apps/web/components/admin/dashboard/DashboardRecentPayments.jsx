/**
 * @fileoverview Dashboard Recent Payments Component
 * Shows the 5 most recent pending payments with quick approve/reject.
 * Path: apps/web/components/admin/dashboard/DashboardRecentPayments.jsx
 */

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { Check, X, Eye, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';

/**
 * DashboardRecentPayments — Quick-action table for recent pending payments.
 *
 * @param {object} props
 * @param {Array} props.payments - Recent payment records
 * @param {function} props.onRefresh - Callback to refresh data after action
 */
const DashboardRecentPayments = ({ payments = [], onRefresh }) => {
  const { t } = useLanguage();
  const toast = useToast();
  const [actionLoading, setActionLoading] = useState(null);

  /**
   * Handle approve/reject action
   */
  const handleAction = useCallback(async (paymentId, action) => {
    setActionLoading(paymentId);

    try {
      const endpoint =
        action === 'approve'
          ? `/admin/payments/${paymentId}/approve`
          : `/admin/payments/${paymentId}/reject`;

      const response = await apiClient.patch(endpoint);

      if (response && response.success) {
        toast.success(`Payment ${action}d successfully.`);
        if (onRefresh) onRefresh();
      } else {
        toast.error(response?.message || 'Action failed.');
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to process payment.';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  }, [onRefresh, toast]);

  /**
   * Get status badge class
   */
  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-badge pending',
      approved: 'status-badge approved',
      rejected: 'status-badge rejected',
    };
    return classes[status] || classes.pending;
  };

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-header">
        <h3 className="admin-chart-title">
          {t.admin?.pendingPayments || 'Recent Pending Payments'}
        </h3>
        <Link href="/admin/payments" className="admin-chart-link">
          {t.profile?.viewAllPayments || 'View All'} <ArrowRight size={14} />
        </Link>
      </div>

      {payments.length === 0 ? (
        <div className="admin-chart-empty">
          <p>No pending payments.</p>
        </div>
      ) : (
        <div className="admin-payments-mini">
          {payments.slice(0, 5).map((payment) => (
            <div key={payment.id} className="admin-payment-mini-row">
              <div className="admin-payment-mini-info">
                <span className="admin-payment-mini-name">
                  {payment.user_name || payment.full_name || 'Unknown'}
                </span>
                <span className={getStatusClass(payment.status)}>
                  {payment.status}
                </span>
              </div>
              <div className="admin-payment-mini-amount">
                {payment.amount?.toLocaleString()} ETB
              </div>
              <div className="admin-payment-mini-actions">
                {payment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleAction(payment.id, 'approve')}
                      disabled={actionLoading === payment.id}
                      className="admin-action-btn approve"
                      title={t.admin?.approve || 'Approve'}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => handleAction(payment.id, 'reject')}
                      disabled={actionLoading === payment.id}
                      className="admin-action-btn reject"
                      title={t.admin?.reject || 'Reject'}
                    >
                      <X size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardRecentPayments;