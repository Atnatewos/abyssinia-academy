/**
 * @fileoverview Payment Detail Modal Component
 * Shows full payment information with screenshot preview, discount breakdown,
 * and approve/reject actions.
 * Path: apps/web/components/admin/payments/PaymentDetailModal.jsx
 */

import React from 'react';
import { X, Check, Eye, Download } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

/**
 * PaymentDetailModal — Full-screen overlay showing complete payment details.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {function} props.onClose - Close callback
 * @param {object} props.payment - Payment data object
 * @param {function} props.onAction - Callback(paymentId, action) for approve/reject
 * @param {string} props.actionLoading - ID of payment currently being processed
 */
const PaymentDetailModal = ({
  isOpen = false,
  onClose,
  payment = null,
  onAction,
  actionLoading = null,
}) => {
  const { t } = useLanguage();

  if (!isOpen || !payment) return null;

  return (
    <div
      className="checkout-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="checkout-modal-container" style={{ maxWidth: '42rem' }}>
        {/* Close Button */}
        <button
          className="checkout-modal-close"
          onClick={onClose}
          aria-label="Close detail"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="checkout-modal-header">
          <h2 className="checkout-modal-title">Payment Details</h2>
          <span
            className={`status-badge ${payment.status}`}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
          >
            {payment.status}
          </span>
        </div>

        <div className="checkout-modal-body">
          {/* Student Info */}
          <div className="admin-detail-section">
            <h4 className="admin-detail-section-title">Student Information</h4>
            <div className="admin-detail-grid">
              <div className="admin-detail-item">
                <span className="admin-detail-label">Name</span>
                <span className="admin-detail-value">
                  {payment.user_name || payment.full_name || 'Unknown'}
                </span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Phone</span>
                <span className="admin-detail-value">
                  {payment.user_phone || payment.phone || 'N/A'}
                </span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Payment Method</span>
                <span className="admin-detail-value">{payment.method || 'N/A'}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Reference</span>
                <span className="admin-detail-value" style={{ fontFamily: 'var(--font-mono)' }}>
                  {payment.reference || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="admin-detail-section">
            <h4 className="admin-detail-section-title">Payment Information</h4>
            <div className="admin-detail-grid">
              <div className="admin-detail-item">
                <span className="admin-detail-label">Amount</span>
                <span className="admin-detail-value highlight">
                  {payment.amount?.toLocaleString()} ETB
                </span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Date</span>
                <span className="admin-detail-value">
                  {new Date(payment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Discount Breakdown if available */}
            {(payment.referral_discount_amount > 0 ||
              payment.discount_code_amount > 0 ||
              payment.credit_applied > 0) && (
              <div className="admin-discount-breakdown">
                <span className="admin-discount-breakdown-title">
                  Discount Breakdown
                </span>
                {payment.referral_discount_amount > 0 && (
                  <div className="admin-discount-row">
                    <span>Referral Discount</span>
                    <span>
                      -{payment.referral_discount_amount.toLocaleString()} ETB
                    </span>
                  </div>
                )}
                {payment.discount_code_amount > 0 && (
                  <div className="admin-discount-row">
                    <span>Discount Code ({payment.discount_code_used})</span>
                    <span>
                      -{payment.discount_code_amount.toLocaleString()} ETB
                    </span>
                  </div>
                )}
                {payment.credit_applied > 0 && (
                  <div className="admin-discount-row">
                    <span>Credit Applied</span>
                    <span>
                      -{payment.credit_applied.toLocaleString()} ETB
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Screenshot Preview */}
          {payment.transaction_id && (
            <div className="admin-detail-section">
              <h4 className="admin-detail-section-title">Payment Proof</h4>
              <div className="admin-screenshot-preview">
                <a
                  href={payment.transaction_id}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-screenshot-link"
                >
                  <Eye size={16} />
                  <span>View Screenshot</span>
                </a>
              </div>
            </div>
          )}

          {/* Actions */}
          {payment.status === 'pending' && (
            <div className="admin-detail-actions">
              <button
                onClick={() => onAction(payment.id, 'approve')}
                disabled={actionLoading === payment.id}
                className="admin-detail-btn approve"
              >
                <Check size={18} />
                <span>{actionLoading === payment.id ? 'Processing...' : 'Approve Payment'}</span>
              </button>
              <button
                onClick={() => onAction(payment.id, 'reject')}
                disabled={actionLoading === payment.id}
                className="admin-detail-btn reject"
              >
                <X size={18} />
                <span>{actionLoading === payment.id ? 'Processing...' : 'Reject Payment'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailModal;