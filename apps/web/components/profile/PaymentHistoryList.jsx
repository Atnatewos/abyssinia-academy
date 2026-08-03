/**
 * @fileoverview Payment History List Component
 * Displays past payment records with status badges
 * Path: apps/web/components/profile/PaymentHistoryList.jsx
 */

import React from 'react';
import Link from 'next/link';
import { CreditCard, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const PaymentHistoryList = ({ payments = [] }) => {
  const { t } = useLanguage();

  if (!payments || payments.length === 0) {
    return (
      <div className="profile-card">
        <h3 className="profile-card-title">
          <CreditCard size={18} />
          {t.profile?.paymentHistory || 'Payment History'}
        </h3>
        <p className="profile-card-empty">{t.profile?.noPayments || 'No payment history yet.'}</p>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <h3 className="profile-card-title">
        <CreditCard size={18} />
        {t.profile?.paymentHistory || 'Payment History'}
      </h3>

      <div className="profile-payment-list">
        {payments.slice(0, 5).map((payment) => (
          <div key={payment.id} className="profile-payment-item">
            <div className="profile-payment-item-left">
              <span className={`profile-payment-status status-${payment.status}`}>
                {payment.status}
              </span>
              <div className="profile-payment-item-info">
                <span className="profile-payment-item-method">{payment.method}</span>
                <span className="profile-payment-item-date">
                  {new Date(payment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            <span className="profile-payment-item-amount">
              {payment.amount?.toLocaleString()} ETB
            </span>
          </div>
        ))}
      </div>

      {payments.length > 5 && (
        <Link href="/profile/payments" className="profile-card-link">
          {t.profile?.viewAllPayments || 'View All Payments'}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
};

export default PaymentHistoryList;