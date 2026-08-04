/**
 * @fileoverview Admin Payments Page
 * Full payment management with search, filter, tabs, approve/reject, and detail modal.
 * Path: apps/web/pages/admin/payments/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Search,
  Filter,
  Check,
  X,
  Eye,
  Download,
  ChevronDown,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import PaymentDetailModal from '../../../components/admin/payments/PaymentDetailModal';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/**
 * AdminPaymentsPage — Complete payment management interface.
 */
const AdminPaymentsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  /*
   * Tabs for filtering by status
   */
  const tabs = [
    { id: 'all', label: 'All Payments' },
    { id: 'pending', label: t.admin?.pending || 'Pending' },
    { id: 'approved', label: t.admin?.approved || 'Approved' },
    { id: 'rejected', label: t.admin?.rejected || 'Rejected' },
  ];

  /**
   * Fetch payments from the API
   */
  const fetchPayments = useCallback(async () => {
    const token = getItem('admin_token');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        activeTab === 'all'
          ? '/admin/payments'
          : `/admin/payments?status=${activeTab}`;

      const response = await apiClient.get(endpoint);

      if (response && response.success) {
        setPayments(response.data || []);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load payments.');
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, router, toast]);

  /*
   * Fetch on mount and when tab changes
   */
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
        fetchPayments();
      } else {
        toast.error(response?.message || 'Action failed.');
      }
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to process payment.';
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  }, [fetchPayments, toast]);

  /**
   * Open payment detail modal
   */
  const handleViewDetail = useCallback((payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  }, []);

  /**
   * Close payment detail modal
   */
  const handleCloseDetail = useCallback(() => {
    setShowDetailModal(false);
    setSelectedPayment(null);
  }, []);

  /**
   * Filter payments by search term
   */
  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (payment.user_name && payment.user_name.toLowerCase().includes(term)) ||
      (payment.full_name && payment.full_name.toLowerCase().includes(term)) ||
      (payment.user_phone && payment.user_phone.includes(term)) ||
      (payment.reference && payment.reference.toLowerCase().includes(term))
    );
  });

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
    <>
      <SEOHead title="Manage Payments" />
      <AdminLayout
        title={t.admin?.payments || 'Payments'}
        subtitle="Review and manage payment submissions"
      >
        {/* Tabs */}
        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, or reference..."
            />
          </div>
          <button className="admin-toolbar-btn" onClick={() => {}}>
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>

        {/* Payments List */}
        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}>
            <div className="spinner-circle" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-desc">
              {searchTerm
                ? 'No payments match your search.'
                : 'No payments found.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="admin-table-row">
                {/* Payment Info */}
                <div className="admin-table-info">
                  <div className="admin-table-info-top">
                    <span className="admin-table-name">
                      {payment.user_name || payment.full_name || 'Unknown'}
                    </span>
                    <span className={getStatusClass(payment.status)}>
                      {payment.status}
                    </span>
                  </div>
                  <p className="admin-table-meta">
                    {payment.user_phone || payment.phone || 'N/A'} · Ref:{' '}
                    {payment.reference || 'N/A'}
                  </p>
                  <p className="admin-table-meta">
                    {payment.method} ·{' '}
                    {new Date(payment.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Amount + Actions */}
                <div className="admin-table-actions-wrapper">
                  <span className="admin-table-amount">
                    {payment.amount?.toLocaleString()} ETB
                  </span>

                  <div className="admin-table-action-btns">
                    {/* View Detail */}
                    <button
                      onClick={() => handleViewDetail(payment)}
                      className="admin-action-btn view"
                      title={t.admin?.viewScreenshot || 'View Details'}
                    >
                      <Eye size={16} />
                    </button>

                    {/* Approve / Reject for pending payments */}
                    {payment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAction(payment.id, 'approve')}
                          disabled={actionLoading === payment.id}
                          className="admin-action-btn approve"
                          title={t.admin?.approve || 'Approve'}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(payment.id, 'reject')}
                          disabled={actionLoading === payment.id}
                          className="admin-action-btn reject"
                          title={t.admin?.reject || 'Reject'}
                        >
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseDetail}
        payment={selectedPayment}
        onAction={handleAction}
        actionLoading={actionLoading}
      />
    </>
  );
};

export default AdminPaymentsPage;