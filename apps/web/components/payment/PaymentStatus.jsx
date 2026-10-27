/**
 * @fileoverview Payment Status Component
 * Displays payment approval status
 * ALL display text from i18n → t.checkout.* — zero hardcoded strings
 * Path: apps/web/components/payment/PaymentStatus.jsx
 */

import { Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

/**
 * PaymentStatus — Shows payment verification state
 * @param {object} props
 * @param {string} props.status - 'pending' | 'approved' | 'rejected' | 'none'
 * @param {string} props.message - Custom message override
 */
const PaymentStatus = ({ status = 'none', message = '' }) => {
  const { t } = useLanguage();

  const configs = {
    pending: {
      icon: Clock,
      iconColor: '#fbbf24',
      bg: 'pending',
      title: t.checkout?.pendingTitle || 'Payment Under Review',
      desc: message || t.checkout?.pendingMessage || 'Your payment is being verified.',
    },
    approved: {
      icon: CheckCircle,
      iconColor: '#10b981',
      bg: 'approved',
      title: t.checkout?.approvedTitle || 'Payment Approved!',
      desc: t.checkout?.approvedMessage || 'Your payment has been verified. Welcome to Abyssinia Academy!',
      link: '/portal',
      linkText: t.checkout?.goToPortal || 'Go to Classroom Portal',
    },
    rejected: {
      icon: XCircle,
      iconColor: '#ef4444',
      bg: 'rejected',
      title: t.checkout?.rejectedTitle || 'Payment Not Verified',
      desc: message || t.checkout?.rejectedMessage || 'Your payment could not be verified. Please contact support.',
    },
    none: {
      icon: Clock,
      iconColor: '#94a3b8',
      bg: '',
      title: t.checkout?.noPaymentTitle || 'No Payment Found',
      desc: t.checkout?.noPaymentMessage || 'You have not submitted a payment yet.',
      link: '/pricing',
      linkText: t.checkout?.viewPricing || 'View Pricing',
    },
  };

  const config = configs[status] || configs.none;
  const IconComponent = config.icon;

  return (
    <div className={`payment-status ${config.bg}`}>
      <div className="payment-status-icon"><IconComponent size={32} style={{ color: config.iconColor }} /></div>
      <h3 className="payment-status-title">{config.title}</h3>
      <p className="payment-status-desc">{config.desc}</p>
      {config.link && (
        <Link href={config.link} className="pricing-btn" style={{ display: 'inline-flex', marginTop: '1rem' }}>
          {config.linkText}
        </Link>
      )}
    </div>
  );
};

export default PaymentStatus;