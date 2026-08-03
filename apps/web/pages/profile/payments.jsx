/**
 * @fileoverview Payment History Page
 * Path: apps/web/pages/profile/payments.jsx
 */

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import useProfile from '../../hooks/useProfile';

const PaymentHistoryPage = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { profile, loading } = useProfile();
  const payments = profile?.payments || [];

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="empty-state" style={{ padding: '5rem 1rem' }}>
          <p className="empty-state-desc">Please log in to view your payment history.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <>
      <SEOHead title={t.profile?.paymentHistory || 'Payment History'} />
      <PageLayout>
        <div className="profile-page">
          <div className="profile-form-container">
            <Link href="/profile" className="profile-back-link">
              <ArrowLeft size={16} />
              {t.profile?.editProfileTitle || 'Back to Profile'}
            </Link>
            <h1 className="profile-form-title">
              <CreditCard size={24} />
              {t.profile?.paymentHistory || 'Payment History'}
            </h1>

            {loading ? (
              <div className="spinner"><div className="spinner-circle" /></div>
            ) : payments.length === 0 ? (
              <div className="profile-card">
                <p className="profile-card-empty">{t.profile?.noPayments || 'No payment history yet.'}</p>
              </div>
            ) : (
              <div className="profile-payment-full-list">
                {payments.map((payment) => (
                  <div key={payment.id} className="profile-payment-item-full">
                    <div className="profile-payment-item-full-left">
                      <span className={`profile-payment-status status-${payment.status}`}>{payment.status}</span>
                      <div>
                        <span className="profile-payment-item-full-method">{payment.method}</span>
                        <span className="profile-payment-item-full-ref">{payment.reference || payment.transactionId || '—'}</span>
                      </div>
                    </div>
                    <div className="profile-payment-item-full-right">
                      <span className="profile-payment-item-full-amount">{payment.amount?.toLocaleString()} ETB</span>
                      <span className="profile-payment-item-full-date">
                        {new Date(payment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default PaymentHistoryPage;