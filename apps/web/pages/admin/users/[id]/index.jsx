/**
 * @fileoverview Admin User Detail Page
 *
 * Single user profile with enrollment stats, payment-derived enrollment
 * history, and direct referral history. All confirmation flows use the
 * platform's custom modal system — never browser-native dialogs.
 *
 * Data contract (verified schema):
 *   user: full_name, email, phone, is_enrolled, enrolled_at,
 *         direct_referral_count, total_team_size, paying_direct_count,
 *         lifetime_referral_earnings, created_at, status
 *
 * Path: apps/web/pages/admin/users/[id]/index.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  UserX,
  CreditCard,
  Users,
} from 'lucide-react';
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import { useLanguage } from '../../../../context/LanguageContext';
import { useToast } from '../../../../context/ToastContext';
import apiClient from '../../../../lib/api';
import { getItem } from '../../../../lib/storage';

/**
 * Normalize a detail payload that may arrive as an object, a single-row
 * array, or nested under a `user` key — guarantees a plain object or null.
 *
 * @param {*} payload - Raw API data
 * @returns {object|null}
 */
const normalizeUser = (payload) => {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] || null;
  if (payload.user && typeof payload.user === 'object') return payload.user;
  if (typeof payload === 'object') return payload;
  return null;
};

/**
 * Normalize a list payload that may arrive as an array or nested rows.
 * @param {*} payload - Raw API data
 * @returns {Array}
 */
const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.rows)) return payload.rows;
  return [];
};

const AdminUserDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useLanguage();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  /* Custom confirmation modal state — replaces browser-native confirm() */
  const [confirmState, setConfirmState] = useState(null);

  const fetchUserDetail = useCallback(async () => {
    if (!id) return;

    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const [userRes, enrollRes, refRes] = await Promise.allSettled([
        apiClient.get(`/admin/users/${id}`),
        apiClient.get(`/admin/users/${id}/enrollments`),
        apiClient.get(`/admin/users/${id}/referrals`),
      ]);

      if (userRes.status === 'fulfilled' && userRes.value?.success) {
        setUser(normalizeUser(userRes.value.data));
      }
      if (enrollRes.status === 'fulfilled' && enrollRes.value?.success) {
        setEnrollments(normalizeList(enrollRes.value.data));
      }
      if (refRes.status === 'fulfilled' && refRes.value?.success) {
        setReferrals(normalizeList(refRes.value.data));
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error(t.admin?.loadError || 'Failed to load user details');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router, toast, t]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  /**
   * Execute the confirmed status transition via the status endpoint.
   * Triggered only from the custom modal's confirm button.
   */
  const handleConfirmedAction = async () => {
    if (!confirmState) return;

    setActionLoading(true);
    try {
      const response = await apiClient.post(`/admin/users/${id}/status`, {
        status: confirmState.action === 'enroll' ? 'enrolled' : 'registered',
      });
      if (response.success) {
        toast.success(response.message || t.admin?.statusUpdated || 'User status updated');
        setConfirmState(null);
        fetchUserDetail();
      } else {
        toast.error(response.message || t.admin?.statusFailed || 'Failed to update status');
      }
    } catch (err) {
      toast.error(t.admin?.statusFailed || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (value) => Number(value || 0).toLocaleString('en-US');

  if (loading) {
    return (
      <>
        <SEOHead title="User Details" />
        <AdminLayout title="User Details" subtitle="Loading user information...">
          <div className="user-detail-loading">
            <div className="user-detail-header">
              <div className="user-detail-avatar shimmer" />
              <div className="user-detail-info">
                <h2 className="shimmer" style={{ width: '10rem', height: '1.5rem', marginBottom: '0.5rem' }} />
                <div className="user-detail-meta">
                  <span className="shimmer" style={{ width: '12rem', height: '0.875rem' }} />
                  <span className="shimmer" style={{ width: '8rem', height: '0.875rem' }} />
                </div>
              </div>
            </div>
            <div className="user-detail-stats">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={`stat-shimmer-${i}`} className="stat-card">
                  <span className="stat-label shimmer" style={{ width: '5rem', height: '0.75rem' }} />
                  <span className="stat-value shimmer" style={{ width: '4rem', height: '1.5rem', marginTop: '0.5rem' }} />
                </div>
              ))}
            </div>
          </div>
        </AdminLayout>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <SEOHead title="User Not Found" />
        <AdminLayout title="User Not Found" subtitle="The requested user does not exist.">
          <button className="admin-back-btn" onClick={() => router.push('/admin/users')}>
            <ArrowLeft size={16} />
            <span>{t.admin?.backToUsers || 'Back to Users'}</span>
          </button>
        </AdminLayout>
      </>
    );
  }

  const displayName = user.full_name || user.name || 'Unknown';
  const isEnrolled = user.is_enrolled === true;

  return (
    <>
      <SEOHead title={`${displayName} — User Details`} />
      <AdminLayout title={displayName} subtitle={user.email || ''}>
        <button className="admin-back-btn" onClick={() => router.push('/admin/users')}>
          <ArrowLeft size={16} />
          <span>{t.admin?.backToUsers || 'Back to Users'}</span>
        </button>

        <div className="user-detail-header">
          <div className="user-detail-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="user-detail-info">
            <h2>{displayName}</h2>
            <div className="user-detail-meta">
              <span><Mail size={14} /> {user.email || '—'}</span>
              <span><Phone size={14} /> {user.phone || 'N/A'}</span>
              <span><Calendar size={14} /> {t.admin?.joined || 'Joined'} {formatDate(user.created_at)}</span>
              <span className={`status-badge ${isEnrolled ? 'approved' : 'pending'}`}>
                {user.status || (isEnrolled ? 'enrolled' : 'registered')}
              </span>
            </div>
          </div>
          <div className="user-detail-actions">
            {isEnrolled ? (
              <button
                className="admin-action-btn reject"
                onClick={() => setConfirmState({ action: 'unenroll' })}
                disabled={actionLoading}
              >
                <UserX size={16} />
                {t.admin?.unenroll || 'Unenroll'}
              </button>
            ) : (
              <button
                className="admin-action-btn approve"
                onClick={() => setConfirmState({ action: 'enroll' })}
                disabled={actionLoading}
              >
                <UserCheck size={16} />
                {t.admin?.markEnrolled || 'Mark Enrolled'}
              </button>
            )}
          </div>
        </div>

        <div className="user-detail-stats">
          <div className="stat-card">
            <span className="stat-label">{t.admin?.directReferrals || 'Direct Referrals'}</span>
            <span className="stat-value">{formatAmount(user.direct_referral_count)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">{t.admin?.teamSize || 'Team Size'}</span>
            <span className="stat-value">{formatAmount(user.total_team_size)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">{t.admin?.payingDirect || 'Paying Direct'}</span>
            <span className="stat-value">{formatAmount(user.paying_direct_count)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">{t.admin?.lifetimeEarned || 'Lifetime Earned'}</span>
            <span className="stat-value">{formatAmount(user.lifetime_referral_earnings)} ETB</span>
          </div>
        </div>

        <div className="user-detail-section">
          <h3>{t.admin?.enrollmentHistory || 'Enrollment History'}</h3>
          {enrollments.length === 0 ? (
            <p className="empty-state-desc">{t.admin?.noEnrollments || 'No enrollments yet.'}</p>
          ) : (
            <div className="admin-table-wrapper compact">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="admin-table-row">
                  <div className="admin-table-info">
                    <div className="admin-table-avatar course">
                      <CreditCard size={16} />
                    </div>
                    <div className="admin-table-name-block">
                      <span className="admin-table-name">
                        {enrollment.purchase_mode === 'full-course'
                          ? t.admin?.fullCoursePass || 'Full Course Pass'
                          : t.admin?.phaseBundle || 'Phase Bundle'}
                      </span>
                      <span className="admin-table-sub">
                        {formatAmount(enrollment.amount)} ETB · {enrollment.method || '—'} · {formatDate(enrollment.paid_at || enrollment.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="admin-table-actions-wrapper">
                    <span className={`status-badge ${enrollment.status === 'approved' ? 'approved' : enrollment.status === 'rejected' ? 'rejected' : 'pending'}`}>
                      {enrollment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="user-detail-section">
          <h3>{t.admin?.referralHistory || 'Referral History'}</h3>
          {referrals.length === 0 ? (
            <p className="empty-state-desc">{t.admin?.noReferrals || 'No referrals yet.'}</p>
          ) : (
            <div className="admin-table-wrapper compact">
              {referrals.map((referral) => (
                <div key={referral.id} className="admin-table-row">
                  <div className="admin-table-info">
                    <div className="admin-table-avatar">
                      {(referral.referred_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="admin-table-name-block">
                      <span className="admin-table-name">{referral.referred_name || 'Unknown'}</span>
                      <span className="admin-table-sub">{referral.referred_email || '—'}</span>
                    </div>
                  </div>
                  <div className="admin-table-actions-wrapper">
                    <span className="admin-table-meta">
                      <Users size={12} /> {formatDate(referral.created_at)}
                    </span>
                    <span className={`status-badge ${referral.referred_is_enrolled ? 'approved' : 'pending'}`}>
                      {referral.referred_is_enrolled ? 'enrolled' : 'registered'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom confirmation modal — replaces browser-native confirm() */}
        {confirmState && (
          <div className="modal-overlay" onClick={() => setConfirmState(null)}>
            <div className="modal-content" onClick={(event) => event.stopPropagation()}>
              <h3>
                {confirmState.action === 'enroll'
                  ? t.admin?.confirmEnrollTitle || 'Mark User as Enrolled?'
                  : t.admin?.confirmUnenrollTitle || 'Unenroll User?'}
              </h3>
              <p>
                {confirmState.action === 'enroll'
                  ? t.admin?.confirmEnrollDesc || 'The user will gain full course access immediately.'
                  : t.admin?.confirmUnenrollDesc || 'The user will lose course access. Referral earnings stay intact.'}
              </p>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setConfirmState(null)}
                  disabled={actionLoading}
                >
                  {t.admin?.cancel || 'Cancel'}
                </button>
                <button
                  className={confirmState.action === 'enroll' ? 'btn-primary' : 'btn-danger'}
                  onClick={handleConfirmedAction}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? t.admin?.processing || 'Processing...'
                    : t.admin?.confirm || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminUserDetailPage;