/**
 * @fileoverview Admin Payments Page
 *
 * Full payment management with search, filter, tabs, approve/reject,
 * detail modal, and inline copy buttons for quick data access.
 *
 * Loading state uses shape-matched SkeletonTableRows so the shimmer
 * columns align with the real table columns.
 *
 * Path: apps/web/pages/admin/payments/index.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Search,
  Check,
  X,
  Eye,
  Download,
  Copy,
  Check as CheckIcon,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import PaymentDetailModal from '../../../components/admin/payments/PaymentDetailModal';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';
import { SkeletonTableRows } from '../../../components/shared/Skeleton';

/**
 * Payment column shape for skeleton alignment.
 * Each entry's width mirrors the real table's grid template.
 */
const PAYMENT_SKELETON_COLUMNS = [
  { width: '2fr', type: 'avatar-text' },
  { width: '1.5fr', type: 'text' },
  { width: '1fr', type: 'pill' },
  { width: '1.2fr', type: 'text' },
  { width: '0.8fr', type: 'text' },
];

/**
 * Inline mini copy button for table cells.
 *
 * @param {object} props - Component props
 * @param {string} props.text - Text to copy to clipboard
 */
const MiniCopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        /* silent */
      }
      document.body.removeChild(textArea);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="admin-table-copy-btn"
      title="Copy"
    >
      {copied ? (
        <CheckIcon size={11} style={{ color: '#10b981' }} />
      ) : (
        <Copy size={11} />
      )}
    </button>
  );
};

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

  const tabs = [
    { id: 'all', label: 'All Payments' },
    { id: 'pending', label: t.admin?.pending || 'Pending' },
    { id: 'approved', label: t.admin?.approved || 'Approved' },
    { id: 'rejected', label: t.admin?.rejected || 'Rejected' },
  ];

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
      if (response.success) {
        setPayments(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load payments');
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load payments');
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, router, toast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleAction = async (paymentId, action) => {
    setActionLoading(paymentId);
    try {
      const response = await apiClient.post(`/admin/payments/${paymentId}/${action}`);
      if (response.success) {
        toast.success(response.message || `Payment ${action}d successfully`);
        fetchPayments();
        if (action === 'approve' || action === 'reject') {
          setShowDetailModal(false);
          setSelectedPayment(null);
        }
      } else {
        toast.error(response.message || `Failed to ${action} payment`);
      }
    } catch (err) {
      toast.error(`Failed to ${action} payment`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetail = (payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedPayment(null);
  };

  const getStatusClass = (status) => {
    if (status === 'approved') return 'status-badge approved';
    if (status === 'rejected') return 'status-badge rejected';
    return 'status-badge pending';
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      payment.user_name?.toLowerCase().includes(search) ||
      payment.full_name?.toLowerCase().includes(search) ||
      payment.user_phone?.toLowerCase().includes(search) ||
      payment.phone?.toLowerCase().includes(search) ||
      payment.reference?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <SEOHead title="Payments Management" />
      <AdminLayout
        title={t.admin?.payments?.title || 'Payments Management'}
        subtitle="Review, approve, and manage student payments"
      >
        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span className="admin-tab-count">
                  {tab.id === 'all'
                    ? payments.length
                    : payments.filter((p) => p.status === tab.id).length}
                </span>
              </button>
            ))}
          </div>
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
          <SkeletonTableRows columns={PAYMENT_SKELETON_COLUMNS} rows={6} />
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
                    <MiniCopyButton text={payment.user_name || payment.full_name || ''} />
                    <span className={getStatusClass(payment.status)}>
                      {payment.status}
                    </span>
                  </div>
                  <p className="admin-table-meta">
                    {payment.user_phone || payment.phone || 'N/A'}
                    <MiniCopyButton text={payment.user_phone || payment.phone || ''} />
                    {' · Ref: '}
                    {payment.reference || 'N/A'}
                    <MiniCopyButton text={payment.reference || ''} />
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
                    <button
                      onClick={() => handleViewDetail(payment)}
                      className="admin-action-btn view"
                      title={t.admin?.viewScreenshot || 'View Details'}
                    >
                      <Eye size={16} />
                    </button>
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