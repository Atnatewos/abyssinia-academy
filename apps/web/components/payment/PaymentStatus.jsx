/**
 * @fileoverview Payment Status Component
 * Displays payment approval status
 * Path: apps/web/components/payment/PaymentStatus.jsx
 */

import { Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../context/LanguageContext';

const PaymentStatus = ({ status = 'none', message = '' }) => {
  const { t } = useLanguage();

  const configs = {
    pending: { icon: Clock, iconColor: '#fbbf24', bg: 'pending', title: t.checkout?.pendingTitle || 'Payment Under Review', desc: message || t.checkout?.pendingMessage || 'Your payment is being verified.' },
    approved: { icon: CheckCircle, iconColor: '#10b981', bg: 'approved', title: 'Payment Approved!', desc: 'Your payment has been verified. Welcome to Abyssinia Academy!', link: '/portal', linkText: 'Go to Classroom Portal' },
    rejected: { icon: XCircle, iconColor: '#ef4444', bg: 'rejected', title: 'Payment Not Verified', desc: message || 'Your payment could not be verified. Please contact support.' },
    none: { icon: Clock, iconColor: '#94a3b8', bg: '', title: 'No Payment Found', desc: 'You have not submitted a payment yet.', link: '/pricing', linkText: 'View Pricing' },
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