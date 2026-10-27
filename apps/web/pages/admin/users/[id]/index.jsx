/**
 * @fileoverview Admin User Detail Page
 *
 * Single user profile with enrollment stats, wallet balance, agent
 * attribution, and God Mode controls (impersonate, wallet adjust, ban,
 * orphan, manual enrollment).
 *
 * Data contract (verified schema + wallet + agent joins):
 *   user: full_name, email, phone, is_enrolled, enrolled_at,
 *         direct_referral_count, total_team_size, paying_direct_count,
 *         lifetime_referral_earnings, created_at, is_agent, banned_at,
 *         current_balance, total_earned, total_withdrawn,
 *         agent_code, commission_type, commission_value, status
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
  Wallet,
  Briefcase,
  ShieldAlert,
  Link as LinkIcon,
  Key,
} from 'lucide-react';
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import { useLanguage } from '../../../../context/LanguageContext';
import { useToast } from '../../../../context/ToastContext';
import apiClient from '../../../../lib/api';
import { getItem } from '../../../../lib/storage';

/**
 * Normalize a detail payload that may arrive as an object, a single-row
 * array, nested under a `user` key, OR wrapped in an outer `{ data }`
 * envelope (Axios style). Guarantees a plain user object or null.
 *
 * @param {*} payload - Raw API data
 * @returns {object|null}
 */
const normalizeUser = (payload) => {
  if (!payload) return null;
  if (Array.isArray(payload)) return normalizeUser(payload[0]);
  if (typeof payload !== 'object') return null;

  /* Common nesting patterns from different API client shapes */
  if (payload.user && typeof payload.user === 'object') {
    return normalizeUser(payload.user);
  }
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return normalizeUser(payload.data);
  }
  if (payload.rows && Array.isArray(payload.rows)) {
    return normalizeUser(payload.rows[0]);
  }

  /* Looks like an actual user row — return as-is */
  if (payload.id && (payload.full_name || payload.name)) {
    return payload;
  }

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
  if (payload && payload.data && Array.isArray(payload.data)) return payload.data;
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
  const [confirmState, setConfirmState] = useState(null);

  /* God Mode UI state */
  const [activeTab, setActiveTab] = useState('overview');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [manualEnrollReason, setManualEnrollReason] = useState('');
  const [agentType, setAgentType] = useState('fixed');
  const [agentValue, setAgentValue] = useState('');

  const fetchUserDetail = useCallback(async () => {
    if (!id) return;

    const token = getItem('admin_token');
    if (!token) {
      console.warn('[admin/user-detail] No admin token — redirecting to login');
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

      /*
       * Comprehensive diagnostic — makes the shape of every response
       * visible in the browser console so we can debug "User Not Found"
       * issues immediately.
       */
      if (process.env.NODE_ENV === 'development') {
        console.group('[admin/user-detail] Fetch results');
        console.log('User response:', userRes);
        console.log('Enrollments response:', enrollRes);
        console.log('Referrals response:', refRes);
        console.groupEnd();
      }

      /* User — try every common response shape */
      if (userRes.status === 'fulfilled') {
        const raw = userRes.value;
        const candidate =
          raw?.data?.user ||
          raw?.data ||
          raw?.user ||
          raw;
        const normalized = normalizeUser(candidate);
        console.log('[admin/user-detail] Normalized user:', normalized);
        if (normalized) setUser(normalized);
        else console.warn('[admin/user-detail] Could not normalize user. Raw:', raw);
      } else {
        console.error('[admin/user-detail] User fetch rejected:', userRes.reason);
        /* 401 → redirect; other errors → show toast */
        if (userRes.reason?.response?.status === 401) {
          router.push('/admin/login');
          return;
        }
        toast.error(
          userRes.reason?.response?.data?.message ||
            'Failed to load user details.'
        );
      }

      /* Enrollments */
      if (enrollRes.status === 'fulfilled') {
        const raw = enrollRes.value;
        setEnrollments(normalizeList(raw?.data ?? raw));
      }

      /* Referrals */
      if (refRes.status === 'fulfilled') {
        const raw = refRes.value;
        setReferrals(normalizeList(raw?.data ?? raw));
      }
    } catch (err) {
      console.error('[admin/user-detail] Unexpected error:', err);
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

  const handleConfirmedAction = async () => {
    if (!confirmState) return;

    setActionLoading(true);
    try {
      const response = await apiClient.post(`/admin/users/${id}/status`, {
        status: confirmState.action === 'enroll' ? 'enrolled' : 'registered',
      });
      if (response.success) {
        toast.success(
          response.message ||
            t.admin?.statusUpdated ||
            'User status updated'
        );
        setConfirmState(null);
        fetchUserDetail();
      } else {
        toast.error(
          response.message ||
            t.admin?.statusFailed ||
            'Failed to update status'
        );
      }
    } catch (err) {
      toast.error(t.admin?.statusFailed || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  /* ── God Mode Handlers ── */

  const handleImpersonate = async () => {
    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/impersonate`);
      if (res.success && res.data?.magicUrl) {
        toast.success('Magic link generated — opening in new tab');
        window.open(res.data.magicUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(res.message || 'Failed to generate impersonation link');
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to generate impersonation link'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleForcePasswordReset = async () => {
    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/reset-password`);
      if (res.success && res.data?.resetUrl) {
        toast.success('Reset link generated — opening in new tab');
        window.open(res.data.resetUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(res.message || 'Failed to generate reset link');
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to generate reset link'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleWalletAdjust = async (e) => {
    e.preventDefault();
    if (!walletAmount || !walletReason.trim()) return;

    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/wallet`, {
        amount: parseFloat(walletAmount),
        reason: walletReason.trim(),
      });
      if (res.success) {
        toast.success(
          `Wallet adjusted. New balance: ${res.data?.newBalance ?? '—'} ETB`
        );
        setWalletAmount('');
        setWalletReason('');
        fetchUserDetail();
      } else {
        toast.error(res.message || 'Failed to adjust wallet');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to adjust wallet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAgentOverride = async (e) => {
    e.preventDefault();
    if (!agentValue) return;

    try {
      setActionLoading(true);
      const res = await apiClient.patch(`/admin/users/${id}/agent-override`, {
        commissionType: agentType,
        commissionValue: parseFloat(agentValue),
      });
      if (res.success) {
        toast.success('Agent rate overridden successfully');
        setAgentValue('');
        fetchUserDetail();
      } else {
        toast.error(res.message || 'Failed to override agent rate');
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to override agent rate'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleOrphan = async () => {
    if (!window.confirm('Orphan this user from the MLM tree? This cannot be undone.')) {
      return;
    }
    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/orphan`);
      if (res.success) {
        toast.success('User orphaned from MLM tree');
        fetchUserDetail();
      } else {
        toast.error(res.message || 'Failed to orphan user');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to orphan user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBan = async (e) => {
    e.preventDefault();
    if (!banReason.trim()) return;
    if (!window.confirm('Ban this user? They will lose access immediately.')) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/ban`, {
        reason: banReason.trim(),
        revokeCodes: true,
      });
      if (res.success) {
        toast.success('User banned successfully');
        setBanReason('');
        fetchUserDetail();
      } else {
        toast.error(res.message || 'Failed to ban user');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to ban user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualEnroll = async (e) => {
    e.preventDefault();
    if (!manualEnrollReason.trim()) return;
    if (!window.confirm('Grant full course access without a payment record?')) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/enroll-manual`, {
        purchaseMode: 'full-course',
        reason: manualEnrollReason.trim(),
      });
      if (res.success) {
        toast.success('User manually enrolled');
        setManualEnrollReason('');
        fetchUserDetail();
      } else {
        toast.error(res.message || 'Failed to enroll user');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to enroll user');
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

  const formatAmount = (value) =>
    Number(value || 0).toLocaleString('en-US');

  /* ── Loading state ── */
  if (loading) {
    return (
      <>
        <SEOHead title="User Details" />
        <AdminLayout title="User Details" subtitle="Loading user information...">
          <div className="user-detail-loading">
            <div className="spinner" style={{ padding: '5rem 0' }}>
              <div className="spinner-circle" />
            </div>
          </div>
        </AdminLayout>
      </>
    );
  }

  /* ── Not found state (only reached if fetch succeeded but user is null) ── */
  if (!user) {
    return (
      <>
        <SEOHead title="User Not Found" />
        <AdminLayout
          title="User Not Found"
          subtitle="The requested user does not exist."
        >
          <button
            className="admin-back-btn"
            onClick={() => router.push('/admin/users')}
          >
            <ArrowLeft size={16} />
            <span>{t.admin?.backToUsers || 'Back to Users'}</span>
          </button>
          <p style={{ marginTop: '1rem', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            Open the browser DevTools Console to see the diagnostic logs —
            the raw API response will help identify why the user could not
            be loaded.
          </p>
        </AdminLayout>
      </>
    );
  }

  const displayName = user.full_name || user.name || 'Unknown';
  const isEnrolled = user.is_enrolled === true;
  const isBanned = Boolean(user.banned_at);

  return (
    <>
      <SEOHead title={`${displayName} — User Details`} />
      <AdminLayout title={displayName} subtitle={user.email || ''}>
        <button
          className="admin-back-btn"
          onClick={() => router.push('/admin/users')}
        >
          <ArrowLeft size={16} />
          <span>{t.admin?.backToUsers || 'Back to Users'}</span>
        </button>

        {/* ── Header ── */}
        <div className="user-detail-header">
          <div className="user-detail-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="user-detail-info">
            <h2>{displayName}</h2>
            <div className="user-detail-meta">
              <span>
                <Mail size={14} /> {user.email || '—'}
              </span>
              <span>
                <Phone size={14} /> {user.phone || 'N/A'}
              </span>
              <span>
                <Calendar size={14} /> {t.admin?.joined || 'Joined'}{' '}
                {formatDate(user.created_at)}
              </span>
              <span className={`status-badge ${isBanned ? 'rejected' : isEnrolled ? 'approved' : 'pending'}`}>
                {isBanned ? 'banned' : user.status || (isEnrolled ? 'enrolled' : 'registered')}
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

        {/* ── Stats ── */}
        <div className="user-detail-stats">
          <div className="stat-card">
            <span className="stat-label">
              {t.admin?.directReferrals || 'Direct Referrals'}
            </span>
            <span className="stat-value">
              {formatAmount(user.direct_referral_count)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">{t.admin?.teamSize || 'Team Size'}</span>
            <span className="stat-value">
              {formatAmount(user.total_team_size)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">
              {t.admin?.payingDirect || 'Paying Direct'}
            </span>
            <span className="stat-value">
              {formatAmount(user.paying_direct_count)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">
              {t.admin?.lifetimeEarned || 'Lifetime Earned'}
            </span>
            <span className="stat-value">
              {formatAmount(user.lifetime_referral_earnings)} ETB
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="admin-tabs" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
          <button
            className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`admin-tab ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            <Wallet size={14} style={{ marginRight: 6 }} />
            Wallet & Agent
          </button>
          <button
            className={`admin-tab ${activeTab === 'godmode' ? 'active' : ''}`}
            onClick={() => setActiveTab('godmode')}
          >
            <ShieldAlert size={14} style={{ marginRight: 6 }} />
            God Mode
          </button>
        </div>

        {/* ── Tab: Overview ── */}
        {activeTab === 'overview' && (
          <>
            <div className="user-detail-section">
              <h3>{t.admin?.enrollmentHistory || 'Enrollment History'}</h3>
              {enrollments.length === 0 ? (
                <p className="empty-state-desc">
                  {t.admin?.noEnrollments || 'No enrollments yet.'}
                </p>
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
                            {formatAmount(enrollment.amount)} ETB ·{' '}
                            {enrollment.method || '—'} ·{' '}
                            {formatDate(
                              enrollment.paid_at || enrollment.created_at
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="admin-table-actions-wrapper">
                        <span
                          className={`status-badge ${
                            enrollment.status === 'approved'
                              ? 'approved'
                              : enrollment.status === 'rejected'
                              ? 'rejected'
                              : 'pending'
                          }`}
                        >
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
                <p className="empty-state-desc">
                  {t.admin?.noReferrals || 'No referrals yet.'}
                </p>
              ) : (
                <div className="admin-table-wrapper compact">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="admin-table-row">
                      <div className="admin-table-info">
                        <div className="admin-table-avatar">
                          {(referral.referred_name || '?')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="admin-table-name-block">
                          <span className="admin-table-name">
                            {referral.referred_name || 'Unknown'}
                          </span>
                          <span className="admin-table-sub">
                            {referral.referred_email || '—'}
                          </span>
                        </div>
                      </div>
                      <div className="admin-table-actions-wrapper">
                        <span className="admin-table-meta">
                          <Users size={12} /> {formatDate(referral.created_at)}
                        </span>
                        <span
                          className={`status-badge ${
                            referral.referred_is_enrolled
                              ? 'approved'
                              : 'pending'
                          }`}
                        >
                          {referral.referred_is_enrolled
                            ? 'enrolled'
                            : 'registered'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Tab: Wallet & Agent ── */}
        {activeTab === 'wallet' && (
          <>
            <div className="user-detail-section">
              <h3>
                <Wallet size={16} style={{ marginRight: 8 }} />
                Wallet
              </h3>
              <div className="user-detail-stats">
                <div className="stat-card">
                  <span className="stat-label">Current Balance</span>
                  <span className="stat-value">
                    {formatAmount(user.current_balance)} ETB
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Earned</span>
                  <span className="stat-value">
                    {formatAmount(user.total_earned)} ETB
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Total Withdrawn</span>
                  <span className="stat-value">
                    {formatAmount(user.total_withdrawn)} ETB
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Pending Withdrawal</span>
                  <span className="stat-value">
                    {formatAmount(user.pending_withdrawal)} ETB
                  </span>
                </div>
              </div>

              <form
                onSubmit={handleWalletAdjust}
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'var(--bg-input)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <h4 style={{ margin: 0 }}>Manual Wallet Adjustment</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
                  Positive numbers credit the wallet. Negative numbers claw back.
                </p>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount in ETB (e.g., 500 or -500)"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  className="admin-input"
                  required
                />
                <input
                  type="text"
                  placeholder="Reason (min 5 chars — logged in audit)"
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  className="admin-input"
                  required
                  minLength={5}
                />
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Applying...' : 'Apply Adjustment'}
                </button>
              </form>
            </div>

            <div className="user-detail-section">
              <h3>
                <Briefcase size={16} style={{ marginRight: 8 }} />
                Agent Status
              </h3>
              <div className="user-detail-stats">
                <div className="stat-card">
                  <span className="stat-label">Agent Code</span>
                  <span className="stat-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {user.agent_code || '—'}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Commission Type</span>
                  <span className="stat-value">
                    {user.commission_type || 'fixed'}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Commission Value</span>
                  <span className="stat-value">
                    {formatAmount(user.commission_value)}{' '}
                    {user.commission_type === 'percentage' ? '%' : 'ETB'}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Agent Active</span>
                  <span className="stat-value">
                    {user.agent_settings_active === false ? 'No' : 'Yes'}
                  </span>
                </div>
              </div>

              <form
                onSubmit={handleAgentOverride}
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'var(--bg-input)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <h4 style={{ margin: 0 }}>Override Commission Rate</h4>
                <select
                  value={agentType}
                  onChange={(e) => setAgentType(e.target.value)}
                  className="admin-input"
                >
                  <option value="fixed">Fixed (ETB per sale)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder={
                    agentType === 'fixed' ? 'e.g., 500' : 'e.g., 15'
                  }
                  value={agentValue}
                  onChange={(e) => setAgentValue(e.target.value)}
                  className="admin-input"
                  required
                />
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Applying...' : 'Override Rate'}
                </button>
              </form>
            </div>
          </>
        )}

        {/* ── Tab: God Mode ── */}
        {activeTab === 'godmode' && (
          <>
            <div className="user-detail-section">
              <h3>
                <ShieldAlert size={16} style={{ marginRight: 8 }} />
                Impersonation & Access
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Generates a 5-minute magic link. Opens in a new tab — your
                admin session stays logged in.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="admin-btn-primary"
                  onClick={handleImpersonate}
                  disabled={actionLoading}
                >
                  <LinkIcon size={14} style={{ marginRight: 6 }} />
                  Generate Impersonation Link
                </button>
                <button
                  className="admin-btn-secondary"
                  onClick={handleForcePasswordReset}
                  disabled={actionLoading}
                >
                  <Key size={14} style={{ marginRight: 6 }} />
                  Generate Password Reset Link
                </button>
              </div>
            </div>

            <div className="user-detail-section">
              <h3>Manual Enrollment</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Grants full course access without a payment record. Use for
                cash enrollments or scholarships.
              </p>
              <form
                onSubmit={handleManualEnroll}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-input)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <input
                  type="text"
                  placeholder="Reason (min 5 chars — logged in audit)"
                  value={manualEnrollReason}
                  onChange={(e) => setManualEnrollReason(e.target.value)}
                  className="admin-input"
                  required
                  minLength={5}
                />
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Enrolling...' : 'Grant Full Course Access'}
                </button>
              </form>
            </div>

            <div className="user-detail-section">
              <h3>Network & Account</h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  className="admin-btn-warning"
                  onClick={handleOrphan}
                  disabled={actionLoading}
                >
                  Orphan from MLM Tree
                </button>
              </div>

              <form
                onSubmit={handleBan}
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <h4 style={{ margin: 0, color: '#ef4444' }}>Danger Zone</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>
                  Bans the user and revokes their agent + referral codes.
                  This action is logged but reversible from the database.
                </p>
                <input
                  type="text"
                  placeholder="Ban reason (min 5 chars)"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="admin-input"
                  required
                  minLength={5}
                  disabled={isBanned}
                />
                <button
                  type="submit"
                  className="admin-btn-danger"
                  disabled={actionLoading || isBanned}
                >
                  {isBanned ? 'Already Banned' : 'Ban User'}
                </button>
                {isBanned && (
                  <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: 0 }}>
                    Banned on {formatDate(user.banned_at)} — reason:{' '}
                    {user.banned_reason || '—'}
                  </p>
                )}
              </form>
            </div>
          </>
        )}

        {/* ── Confirmation modal for enroll/unenroll ── */}
        {confirmState && (
          <div className="modal-overlay" onClick={() => setConfirmState(null)}>
            <div
              className="modal-content"
              onClick={(event) => event.stopPropagation()}
            >
              <h3>
                {confirmState.action === 'enroll'
                  ? t.admin?.confirmEnrollTitle || 'Mark User as Enrolled?'
                  : t.admin?.confirmUnenrollTitle || 'Unenroll User?'}
              </h3>
              <p>
                {confirmState.action === 'enroll'
                  ? t.admin?.confirmEnrollDesc ||
                    'The user will gain full course access immediately.'
                  : t.admin?.confirmUnenrollDesc ||
                    'The user will lose course access. Referral earnings stay intact.'}
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
                  className={
                    confirmState.action === 'enroll'
                      ? 'btn-primary'
                      : 'btn-danger'
                  }
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