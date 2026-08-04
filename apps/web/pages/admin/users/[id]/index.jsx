/**
 * @fileoverview Admin User Detail Page
 * Full user profile view with enrollment, payments, progress, and referrals.
 * Path: apps/web/pages/admin/users/[id]/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Layers,
  CreditCard,
  TrendingUp,
  Share2,
} from 'lucide-react';
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import { useLanguage } from '../../../../context/LanguageContext';
import { useToast } from '../../../../context/ToastContext';
import apiClient from '../../../../lib/api';
import { getItem } from '../../../../lib/storage';

/**
 * AdminUserDetailPage — Full user profile for admin review.
 */
const AdminUserDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useLanguage();
  const toast = useToast();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enrollment');

  /**
   * Fetch user detail data
   */
  const fetchUserDetail = useCallback(async () => {
    if (!id) return;

    const token = getItem('admin_token');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.get(`/admin/users/${id}`);

      if (response && response.success) {
        setUserData(response.data);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load user details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router, toast]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  if (loading) {
    return (
      <AdminLayout title="User Details">
        <div className="spinner" style={{ marginTop: '4rem' }}>
          <div className="spinner-circle" />
        </div>
      </AdminLayout>
    );
  }

  if (!userData) {
    return (
      <AdminLayout title="User Details">
        <div className="empty-state" style={{ padding: '5rem 1rem' }}>
          <p className="empty-state-desc">User not found.</p>
          <Link href="/admin/users" className="pricing-btn" style={{ display: 'inline-flex', marginTop: '1rem' }}>
            Back to Users
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const user = userData.user || {};
  const enrollment = userData.enrollment || null;
  const payments = userData.payments || [];
  const progress = userData.progress || {};
  const referrals = userData.referrals || {};

  return (
    <>
      <SEOHead title={`User: ${user.full_name || 'Details'}`} />
      <AdminLayout title="User Details">
        {/* Back Link */}
        <Link href="/admin/users" className="profile-back-link">
          <ArrowLeft size={16} />
          Back to Users
        </Link>

        {/* User Profile Header */}
        <div className="admin-user-profile-header">
          <div className="admin-user-avatar">
            {(user.full_name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="admin-user-info">
            <h1 className="admin-user-name">{user.full_name || 'Unknown'}</h1>
            <div className="admin-user-meta">
              <span><Phone size={14} /> {user.phone || 'N/A'}</span>
              {user.email && <span><Mail size={14} /> {user.email}</span>}
              <span><Calendar size={14} /> Joined {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
            <div className="admin-user-badges">
              {user.is_enrolled ? (
                <span className="status-badge approved">Enrolled</span>
              ) : (
                <span className="status-badge rejected">Not Enrolled</span>
              )}
              {user.referred_by_code && (
                <span className="status-badge pending">
                  Referred: {user.referred_by_code}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {['enrollment', 'payments', 'progress', 'referrals'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
            >
              {tab === 'enrollment' && <><Layers size={14} /> Enrollment</>}
              {tab === 'payments' && <><CreditCard size={14} /> Payments</>}
              {tab === 'progress' && <><TrendingUp size={14} /> Progress</>}
              {tab === 'referrals' && <><Share2 size={14} /> Referrals</>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="admin-detail-content">
          {/* Enrollment Tab */}
          {activeTab === 'enrollment' && (
            <div className="admin-detail-section">
              <h4 className="admin-detail-section-title">Enrollment Details</h4>
              {enrollment ? (
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Plan</span>
                    <span className="admin-detail-value">
                      {enrollment.purchase_mode === 'full-course'
                        ? 'Full Course'
                        : `${enrollment.selected_phases?.length || 0} Phase(s)`}
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Enrolled Date</span>
                    <span className="admin-detail-value">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="admin-detail-item">
                    <span className="admin-detail-label">Amount Paid</span>
                    <span className="admin-detail-value highlight">
                      {enrollment.purchase_amount?.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              ) : (
                <p className="admin-detail-empty">User is not enrolled in any course.</p>
              )}
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="admin-detail-section">
              <h4 className="admin-detail-section-title">Payment History</h4>
              {payments.length > 0 ? (
                <div className="admin-table-wrapper">
                  {payments.map((payment) => (
                    <div key={payment.id} className="admin-table-row">
                      <div className="admin-table-info">
                        <div className="admin-table-info-top">
                          <span className={`status-badge ${payment.status}`}>
                            {payment.status}
                          </span>
                          <span className="admin-table-name" style={{ marginLeft: '0.5rem' }}>
                            {payment.method}
                          </span>
                        </div>
                        <p className="admin-table-meta">
                          Ref: {payment.reference || 'N/A'} ·{' '}
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="admin-table-amount">
                        {payment.amount?.toLocaleString()} ETB
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="admin-detail-empty">No payment history.</p>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div className="admin-detail-section">
              <h4 className="admin-detail-section-title">Learning Progress</h4>
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Overall Progress</span>
                  <span className="admin-detail-value highlight">
                    {Math.round(progress.overall || 0)}%
                  </span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Completed Lessons</span>
                  <span className="admin-detail-value">
                    {progress.completedLessons || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="admin-detail-section">
              <h4 className="admin-detail-section-title">Referral Information</h4>
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Referral Code</span>
                  <span className="admin-detail-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {referrals.code || 'N/A'}
                  </span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Total Referrals</span>
                  <span className="admin-detail-value">
                    {referrals.totalReferrals || 0}
                  </span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">Successful Referrals</span>
                  <span className="admin-detail-value">
                    {referrals.successfulReferrals || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminUserDetailPage;