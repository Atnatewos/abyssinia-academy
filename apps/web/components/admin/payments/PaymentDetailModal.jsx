/**
 * @fileoverview Payment Detail Modal Component
 * Professional payment review with Cloudinary screenshot,
 * copy-to-clipboard buttons, discount breakdown, and approve/reject actions.
 * Path: apps/web/components/admin/payments/PaymentDetailModal.jsx
 */

import React, { useState, useCallback } from 'react';
import {
  X,
  Check,
  Eye,
  ExternalLink,
  Copy,
  Check as CheckIcon,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

/**
 * Inline CopyButton — Copies text to clipboard with visual feedback.
 */
const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        setTimeout(() => setCopied(false), 2000);
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
      className="admin-copy-btn"
      title={copied ? 'Copied!' : label}
    >
      {copied ? (
        <CheckIcon size={12} style={{ color: '#10b981' }} />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
};

/**
 * PaymentDetailModal — Professional payment review overlay.
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

  /*
   * The screenshot URL is stored in the transaction_id field
   * from the Cloudinary upload during payment submission.
   * This is a Cloudinary secure_url like:
   * https://res.cloudinary.com/dwu1urppe/image/upload/v1234567890/abyssinia-academy/payments/abc123.jpg
   */
  const screenshotUrl = payment.transaction_id || null;

  /*
   * Check if the URL is a valid image URL (from Cloudinary or any image host)
   */
  const isImageUrl = screenshotUrl && (
    screenshotUrl.includes('cloudinary.com') ||
    screenshotUrl.includes('res.cloudinary.com') ||
    screenshotUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)
  );

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
                <span className="admin-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  {payment.user_name || payment.full_name || 'Unknown'}
                  <CopyButton text={payment.user_name || payment.full_name || ''} label="Copy Name" />
                </span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Phone</span>
                <span className="admin-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  {payment.user_phone || payment.phone || 'N/A'}
                  <CopyButton text={payment.user_phone || payment.phone || ''} label="Copy Phone" />
                </span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Payment Method</span>
                <span className="admin-detail-value">{payment.method || 'N/A'}</span>
              </div>
              <div className="admin-detail-item">
                <span className="admin-detail-label">Reference</span>
                <span className="admin-detail-value" style={{ fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  {payment.reference || 'N/A'}
                  <CopyButton text={payment.reference || ''} label="Copy Reference" />
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
          {screenshotUrl && (
            <div className="admin-detail-section">
              <h4 className="admin-detail-section-title">Payment Proof</h4>

              {isImageUrl ? (
                /*
                 * Cloudinary or image URL — display the image inline
                 */
                <div className="admin-screenshot-viewer">
                  <img
                    src={screenshotUrl}
                    alt="Payment screenshot"
                    className="admin-screenshot-image"
                    loading="lazy"
                    onError={(e) => {
                      /*
                       * If the image fails to load, show the link instead
                       */
                      e.target.style.display = 'none';
                      e.target.parentElement.querySelector('.admin-screenshot-fallback').style.display = 'flex';
                    }}
                  />
                  <div className="admin-screenshot-fallback" style={{ display: 'none' }}>
                    <a
                      href={screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-screenshot-link"
                    >
                      <Eye size={16} />
                      <span>View Screenshot</span>
                    </a>
                  </div>
                  <div className="admin-screenshot-footer">
                    <a
                      href={screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-screenshot-link"
                    >
                      <ExternalLink size={14} />
                      <span>Open Full Size</span>
                    </a>
                  </div>
                </div>
              ) : (
                /*
                 * Regular URL — show as a link
                 */
                <div className="admin-screenshot-preview">
                  <a
                    href={screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-screenshot-link"
                  >
                    <Eye size={16} />
                    <span>View Screenshot</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* No Screenshot Message */}
          {!screenshotUrl && (
            <div className="admin-detail-section">
              <h4 className="admin-detail-section-title">Payment Proof</h4>
              <div className="admin-screenshot-preview">
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem' }}>
                  No screenshot was uploaded with this payment.
                </p>
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