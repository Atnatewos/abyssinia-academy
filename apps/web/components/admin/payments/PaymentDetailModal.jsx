// /**
//  * @fileoverview Payment Detail Modal Component
//  * Professional payment review with Cloudinary screenshot,
//  * copy-to-clipboard buttons, discount breakdown, and approve/reject actions.
//  * Path: apps/web/components/admin/payments/PaymentDetailModal.jsx
//  */

// import React, { useState, useCallback } from 'react';
// import {
//   X,
//   Check,
//   Eye,
//   ExternalLink,
//   Copy,
//   Check as CheckIcon,
// } from 'lucide-react';
// import { useLanguage } from '../../../context/LanguageContext';

// /**
//  * Inline CopyButton — Copies text to clipboard with visual feedback.
//  */
// const CopyButton = ({ text, label = 'Copy' }) => {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = useCallback(async () => {
//     if (!text) return;

//     try {
//       await navigator.clipboard.writeText(text);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch {
//       const textArea = document.createElement('textarea');
//       textArea.value = text;
//       textArea.style.position = 'fixed';
//       textArea.style.opacity = '0';
//       document.body.appendChild(textArea);
//       textArea.select();
//       try {
//         document.execCommand('copy');
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//       } catch {
//         /* silent */
//       }
//       document.body.removeChild(textArea);
//     }
//   }, [text]);

//   return (
//     <button
//       type="button"
//       onClick={handleCopy}
//       className="admin-copy-btn"
//       title={copied ? 'Copied!' : label}
//     >
//       {copied ? (
//         <CheckIcon size={12} style={{ color: '#10b981' }} />
//       ) : (
//         <Copy size={12} />
//       )}
//     </button>
//   );
// };

// /**
//  * PaymentDetailModal — Professional payment review overlay.
//  *
//  * @param {object} props
//  * @param {boolean} props.isOpen - Whether the modal is visible
//  * @param {function} props.onClose - Close callback
//  * @param {object} props.payment - Payment data object
//  * @param {function} props.onAction - Callback(paymentId, action) for approve/reject
//  * @param {string} props.actionLoading - ID of payment currently being processed
//  */
// const PaymentDetailModal = ({
//   isOpen = false,
//   onClose,
//   payment = null,
//   onAction,
//   actionLoading = null,
// }) => {
//   const { t } = useLanguage();

//   if (!isOpen || !payment) return null;

//   /*
//    * The screenshot URL is stored in the transaction_id field
//    * from the Cloudinary upload during payment submission.
//    * This is a Cloudinary secure_url like:
//    * https://res.cloudinary.com/dwu1urppe/image/upload/v1234567890/abyssinia-academy/payments/abc123.jpg
//    */
//   const screenshotUrl = payment.transaction_id || null;

//   /*
//    * Check if the URL is a valid image URL (from Cloudinary or any image host)
//    */
//   const isImageUrl = screenshotUrl && (
//     screenshotUrl.includes('cloudinary.com') ||
//     screenshotUrl.includes('res.cloudinary.com') ||
//     screenshotUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)
//   );

//   return (
//     <div
//       className="checkout-modal-overlay"
//       onClick={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div className="checkout-modal-container" style={{ maxWidth: '42rem' }}>
//         {/* Close Button */}
//         <button
//           className="checkout-modal-close"
//           onClick={onClose}
//           aria-label="Close detail"
//         >
//           <X size={20} />
//         </button>

//         {/* Header */}
//         <div className="checkout-modal-header">
//           <h2 className="checkout-modal-title">Payment Details</h2>
//           <span
//             className={`status-badge ${payment.status}`}
//             style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
//           >
//             {payment.status}
//           </span>
//         </div>

//         <div className="checkout-modal-body">
//           {/* Student Info */}
//           <div className="admin-detail-section">
//             <h4 className="admin-detail-section-title">Student Information</h4>
//             <div className="admin-detail-grid">
//               <div className="admin-detail-item">
//                 <span className="admin-detail-label">Name</span>
//                 <span className="admin-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
//                   {payment.user_name || payment.full_name || 'Unknown'}
//                   <CopyButton text={payment.user_name || payment.full_name || ''} label="Copy Name" />
//                 </span>
//               </div>
//               <div className="admin-detail-item">
//                 <span className="admin-detail-label">Phone</span>
//                 <span className="admin-detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
//                   {payment.user_phone || payment.phone || 'N/A'}
//                   <CopyButton text={payment.user_phone || payment.phone || ''} label="Copy Phone" />
//                 </span>
//               </div>
//               <div className="admin-detail-item">
//                 <span className="admin-detail-label">Payment Method</span>
//                 <span className="admin-detail-value">{payment.method || 'N/A'}</span>
//               </div>
//               <div className="admin-detail-item">
//                 <span className="admin-detail-label">Reference</span>
//                 <span className="admin-detail-value" style={{ fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
//                   {payment.reference || 'N/A'}
//                   <CopyButton text={payment.reference || ''} label="Copy Reference" />
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Payment Info */}
//           <div className="admin-detail-section">
//             <h4 className="admin-detail-section-title">Payment Information</h4>
//             <div className="admin-detail-grid">
//               <div className="admin-detail-item">
//                 <span className="admin-detail-label">Amount</span>
//                 <span className="admin-detail-value highlight">
//                   {payment.amount?.toLocaleString()} ETB
//                 </span>
//               </div>
//               <div className="admin-detail-item">
//                 <span className="admin-detail-label">Date</span>
//                 <span className="admin-detail-value">
//                   {new Date(payment.created_at).toLocaleDateString()}
//                 </span>
//               </div>
//             </div>

//             {/* Discount Breakdown if available */}
//             {(payment.referral_discount_amount > 0 ||
//               payment.discount_code_amount > 0 ||
//               payment.credit_applied > 0) && (
//               <div className="admin-discount-breakdown">
//                 <span className="admin-discount-breakdown-title">
//                   Discount Breakdown
//                 </span>
//                 {payment.referral_discount_amount > 0 && (
//                   <div className="admin-discount-row">
//                     <span>Referral Discount</span>
//                     <span>
//                       -{payment.referral_discount_amount.toLocaleString()} ETB
//                     </span>
//                   </div>
//                 )}
//                 {payment.discount_code_amount > 0 && (
//                   <div className="admin-discount-row">
//                     <span>Discount Code ({payment.discount_code_used})</span>
//                     <span>
//                       -{payment.discount_code_amount.toLocaleString()} ETB
//                     </span>
//                   </div>
//                 )}
//                 {payment.credit_applied > 0 && (
//                   <div className="admin-discount-row">
//                     <span>Credit Applied</span>
//                     <span>
//                       -{payment.credit_applied.toLocaleString()} ETB
//                     </span>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Screenshot Preview */}
//           {screenshotUrl && (
//             <div className="admin-detail-section">
//               <h4 className="admin-detail-section-title">Payment Proof</h4>

//               {isImageUrl ? (
//                 /*
//                  * Cloudinary or image URL — display the image inline
//                  */
//                 <div className="admin-screenshot-viewer">
//                   <img
//                     src={screenshotUrl}
//                     alt="Payment screenshot"
//                     className="admin-screenshot-image"
//                     loading="lazy"
//                     onError={(e) => {
//                       /*
//                        * If the image fails to load, show the link instead
//                        */
//                       e.target.style.display = 'none';
//                       e.target.parentElement.querySelector('.admin-screenshot-fallback').style.display = 'flex';
//                     }}
//                   />
//                   <div className="admin-screenshot-fallback" style={{ display: 'none' }}>
//                     <a
//                       href={screenshotUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="admin-screenshot-link"
//                     >
//                       <Eye size={16} />
//                       <span>View Screenshot</span>
//                     </a>
//                   </div>
//                   <div className="admin-screenshot-footer">
//                     <a
//                       href={screenshotUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="admin-screenshot-link"
//                     >
//                       <ExternalLink size={14} />
//                       <span>Open Full Size</span>
//                     </a>
//                   </div>
//                 </div>
//               ) : (
//                 /*
//                  * Regular URL — show as a link
//                  */
//                 <div className="admin-screenshot-preview">
//                   <a
//                     href={screenshotUrl}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="admin-screenshot-link"
//                   >
//                     <Eye size={16} />
//                     <span>View Screenshot</span>
//                   </a>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* No Screenshot Message */}
//           {!screenshotUrl && (
//             <div className="admin-detail-section">
//               <h4 className="admin-detail-section-title">Payment Proof</h4>
//               <div className="admin-screenshot-preview">
//                 <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', padding: '1rem' }}>
//                   No screenshot was uploaded with this payment.
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Actions */}
//           {payment.status === 'pending' && (
//             <div className="admin-detail-actions">
//               <button
//                 onClick={() => onAction(payment.id, 'approve')}
//                 disabled={actionLoading === payment.id}
//                 className="admin-detail-btn approve"
//               >
//                 <Check size={18} />
//                 <span>{actionLoading === payment.id ? 'Processing...' : 'Approve Payment'}</span>
//               </button>
//               <button
//                 onClick={() => onAction(payment.id, 'reject')}
//                 disabled={actionLoading === payment.id}
//                 className="admin-detail-btn reject"
//               >
//                 <X size={18} />
//                 <span>{actionLoading === payment.id ? 'Processing...' : 'Reject Payment'}</span>
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentDetailModal;














/**
 * @fileoverview Payment Detail Modal
 *
 * Read-only review surface for a single payment record, built entirely
 * on the shared admin UI primitives (AdminModal, AdminBadge, AdminButton).
 * Approve/reject actions delegate to the parent page's mutation handler
 * so confirmation, busy state, and queue refresh stay centralized.
 *
 * All copy resolves from admin.paymentDetail.* / admin.common.*; every
 * visual value flows through the Tailwind token bridge.
 *
 * Path: apps/web/components/admin/payments/PaymentDetailModal.jsx
 */

import React from 'react';
import { ExternalLink, ImageOff, Check, X } from 'lucide-react';
import AdminModal from '../ui/AdminModal';
import AdminBadge from '../ui/AdminBadge';
import AdminButton from '../ui/AdminButton';
import { useLanguage } from '../../../context/LanguageContext';
import { resolveLabel } from '../../../lib/admin/labels';

/**
 * One labeled detail row in the info grid.
 */
const DetailItem = ({ label, value, mono = false, highlight = false }) => (
  <div className="flex flex-col gap-0.5 min-w-0">
    <span className="text-2xs font-bold uppercase tracking-wider text-text-dim">
      {label}
    </span>
    <span
      className={[
        'text-sm font-semibold truncate',
        mono ? 'font-mono' : '',
        highlight ? 'text-accent' : 'text-text-main',
      ].join(' ')}
    >
      {value}
    </span>
  </div>
);

/**
 * PaymentDetailModal — review + act on a payment.
 *
 * @param {object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {object|null} props.payment
 * @param {Function} props.onAction - (paymentId, 'approve'|'reject') => void
 * @param {string|null} props.actionLoading - Id currently being processed
 */
const PaymentDetailModal = ({
  isOpen,
  onClose,
  payment,
  onAction,
  actionLoading,
}) => {
  const { t } = useLanguage();
  const label = (key) => resolveLabel(t, key);

  if (!payment) return null;

  const emDash = label('admin.common.labels.emDash');
  const currency = label('admin.common.labels.currency');
  const isPending = payment.status === 'pending';
  const isBusy = actionLoading === payment.id;

  const displayName =
    payment.user_name || payment.full_name || emDash;
  const phone = payment.user_phone || payment.phone || emDash;
  const email = payment.user_email || payment.email || emDash;
  const reference = payment.reference || emDash;
  const method = payment.method || emDash;
  const courseTitle = payment.course_title || payment.title || emDash;
  const screenshotUrl = payment.transaction_id || payment.screenshot_url || '';

  const submittedDate = payment.created_at
    ? new Date(payment.created_at).toLocaleString()
    : emDash;

  const amount = Number(payment.amount || 0);
  const referralDiscount = Number(payment.referral_discount_amount || 0);
  const codeDiscount = Number(payment.discount_code_amount || 0);
  const creditApplied = Number(payment.credit_applied || 0);
  const hasBreakdown = referralDiscount > 0 || codeDiscount > 0 || creditApplied > 0;
  const baseAmount = amount + referralDiscount + codeDiscount + creditApplied;

  const formatMoney = (value) =>
    `${Number(value || 0).toLocaleString()} ${currency}`;

  const footer = (
    <>
      <AdminButton variant="secondary" onClick={onClose}>
        {label('admin.paymentDetail.close')}
      </AdminButton>
      {isPending && (
        <>
          <AdminButton
            variant="danger"
            loading={isBusy}
            onClick={() => onAction(payment.id, 'reject')}
          >
            <X size={16} aria-hidden="true" />
            {label('admin.payments.reject')}
          </AdminButton>
          <AdminButton
            variant="primary"
            loading={isBusy}
            onClick={() => onAction(payment.id, 'approve')}
          >
            <Check size={16} aria-hidden="true" />
            {label('admin.payments.approve')}
          </AdminButton>
        </>
      )}
    </>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={label('admin.paymentDetail.title')}
      size="lg"
      closeLabel={label('admin.common.actions.close')}
      footer={footer}
    >
      <div className="flex flex-col gap-5">
        {/* Identity + status header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-lg font-extrabold text-text-main truncate">
              {displayName}
            </span>
            <span className="text-xs text-text-muted truncate">{email}</span>
          </div>
          <AdminBadge status={payment.status}>
            {label(`admin.common.statuses.${payment.status}`) || payment.status}
          </AdminBadge>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-4 rounded-xl bg-bg-input border border-solid border-border-light">
          <DetailItem label={label('admin.paymentDetail.phone')} value={phone} mono />
          <DetailItem label={label('admin.paymentDetail.method')} value={method} />
          <DetailItem label={label('admin.paymentDetail.reference')} value={reference} mono />
          <DetailItem label={label('admin.paymentDetail.course')} value={courseTitle} />
          <DetailItem label={label('admin.paymentDetail.submitted')} value={submittedDate} />
          <DetailItem
            label={label('admin.paymentDetail.amount')}
            value={formatMoney(amount)}
            highlight
          />
        </div>

        {/* Discount breakdown */}
        {hasBreakdown && (
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-surface-secondary border border-solid border-border-light">
            <span className="text-2xs font-bold uppercase tracking-wider text-accent">
              {label('admin.paymentDetail.discountBreakdown')}
            </span>
            <div className="flex justify-between text-xs text-text-muted">
              <span>{label('admin.paymentDetail.baseAmount')}</span>
              <span className="font-mono">{formatMoney(baseAmount)}</span>
            </div>
            {referralDiscount > 0 && (
              <div className="flex justify-between text-xs text-text-muted">
                <span>{label('admin.paymentDetail.referralDiscount')}</span>
                <span className="font-mono text-success">−{formatMoney(referralDiscount)}</span>
              </div>
            )}
            {codeDiscount > 0 && (
              <div className="flex justify-between text-xs text-text-muted">
                <span>
                  {label('admin.paymentDetail.codeDiscount')}
                  {payment.discount_code_used ? ` (${payment.discount_code_used})` : ''}
                </span>
                <span className="font-mono text-success">−{formatMoney(codeDiscount)}</span>
              </div>
            )}
            {creditApplied > 0 && (
              <div className="flex justify-between text-xs text-text-muted">
                <span>{label('admin.paymentDetail.creditApplied')}</span>
                <span className="font-mono text-success">−{formatMoney(creditApplied)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 mt-1 border-t border-solid border-border-light text-sm font-extrabold text-text-main">
              <span>{label('admin.paymentDetail.finalAmount')}</span>
              <span className="font-mono text-accent">{formatMoney(amount)}</span>
            </div>
          </div>
        )}

        {/* Screenshot */}
        <div className="flex flex-col gap-2">
          <span className="text-2xs font-bold uppercase tracking-wider text-text-dim">
            {label('admin.paymentDetail.screenshot')}
          </span>
          {screenshotUrl ? (
            <div className="rounded-xl overflow-hidden border border-solid border-border-light bg-bg-card-solid">
              <img
                src={screenshotUrl}
                alt={label('admin.paymentDetail.screenshot')}
                className="w-full max-h-[24rem] object-contain block"
              />
              <a
                href={screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-accent no-underline bg-accent/5 border-t border-solid border-border-light hover:bg-accent/10 transition-colors duration-fast"
              >
                <ExternalLink size={13} aria-hidden="true" />
                {label('admin.paymentDetail.viewFullSize')}
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl bg-surface-secondary border border-dashed border-border-medium text-text-dim">
              <ImageOff size={28} aria-hidden="true" />
              <span className="text-xs">{label('admin.paymentDetail.noScreenshot')}</span>
            </div>
          )}
        </div>
      </div>
    </AdminModal>
  );
};

export default PaymentDetailModal;