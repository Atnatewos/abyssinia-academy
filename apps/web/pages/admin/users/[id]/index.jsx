/**
 * @fileoverview Admin User Detail Page
 *
 * Single user profile with enrollment stats, wallet balance, agent
 * attribution, and God Mode controls (impersonate, wallet adjust, ban,
 * unban, orphan, manual enrollment).
 *
 * All UI strings are sourced from the shared i18n `admin.godMode.*`
 * namespace. All destructive actions are gated by the shared
 * confirmation system (useConfirm).
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
  ShieldCheck,
  Link as LinkIcon,
  Key,
} from 'lucide-react';
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import { useLanguage } from '../../../../context/LanguageContext';
import { useToast } from '../../../../context/ToastContext';
import { useConfirm } from '../../../../components/shared/ConfirmProvider';
import apiClient from '../../../../lib/api';
import { getItem } from '../../../../lib/storage';

/**
 * Normalize a detail payload.
 * @param {*} payload
 * @returns {object|null}
 */
const normalizeUser = (payload) => {
  if (!payload) return null;
  if (Array.isArray(payload)) return normalizeUser(payload[0]);
  if (typeof payload !== 'object') return null;

  if (payload.user && typeof payload.user === 'object')
    return normalizeUser(payload.user);
  if (
    payload.data &&
    typeof payload.data === 'object' &&
    !Array.isArray(payload.data)
  )
    return normalizeUser(payload.data);
  if (payload.rows && Array.isArray(payload.rows))
    return normalizeUser(payload.rows[0]);

  if (payload.id && (payload.full_name || payload.name)) return payload;

  return null;
};

/**
 * Normalize a list payload.
 * @param {*} payload
 * @returns {Array}
 */
const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.rows)) return payload.rows;
  if (payload && payload.data && Array.isArray(payload.data))
    return payload.data;
  return [];
};

const AdminUserDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();

  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  /* God Mode UI state */
  const [activeTab, setActiveTab] = useState('overview');
  const [walletAmount, setWalletAmount] = useState('');
  const [walletReason, setWalletReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [unbanNote, setUnbanNote] = useState('');
  const [manualEnrollReason, setManualEnrollReason] = useState('');
  const [agentType, setAgentType] = useState('fixed');
  const [agentValue, setAgentValue] = useState('');

  /* Shorthand helpers */
  const g = t.admin?.godMode || {};
  const gs = g.stats || {};
  const gw = g.wallet || {};
  const ga = g.agent || {};
  const gi = g.impersonation || {};
  const gm = g.manualEnroll || {};
  const gn = g.network || {};
  const gb = g.ban || {};
  const gu = g.unban || {};
  const gt = g.toasts || {};
  const gOv = g.overview || {};
  const gTabs = g.tabs || {};

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

      if (userRes.status === 'fulfilled') {
        const raw = userRes.value;
        const candidate = raw?.data?.user || raw?.data || raw?.user || raw;
        const normalized = normalizeUser(candidate);
        if (normalized) setUser(normalized);
      } else if (userRes.reason?.response?.status === 401) {
        router.push('/admin/login');
        return;
      } else {
        toast.error(
          userRes.reason?.response?.data?.message ||
            gt.loadError ||
            'Failed to load user details.'
        );
      }

      if (enrollRes.status === 'fulfilled') {
        setEnrollments(normalizeList(enrollRes.value?.data ?? enrollRes.value));
      }
      if (refRes.status === 'fulfilled') {
        setReferrals(normalizeList(refRes.value?.data ?? refRes.value));
      }
    } catch (err) {
      if (err?.response?.status === 401) router.push('/admin/login');
      else toast.error(gt.loadError || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [id, router, toast, gt]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  /* ── Enrollment toggle ── */
  const handleStatusChange = async (nextStatus) => {
    const isEnroll = nextStatus === 'enrolled';
    const ok = await confirm({
      title: isEnroll
        ? t.confirmations?.actions?.godmodeEnroll?.title || 'Mark user as enrolled?'
        : t.confirmations?.actions?.godmodeUnenroll?.title || 'Unenroll this user?',
      message: isEnroll
        ? t.confirmations?.actions?.godmodeEnroll?.message
        : t.confirmations?.actions?.godmodeUnenroll?.message,
      variant: isEnroll ? 'warning' : 'danger',
      confirmText: isEnroll
        ? t.confirmations?.actions?.godmodeEnroll?.confirmText
        : t.confirmations?.actions?.godmodeUnenroll?.confirmText,
    });
    if (!ok) return;

    setActionLoading(true);
    try {
      const response = await apiClient.post(`/admin/users/${id}/status`, {
        status: nextStatus,
      });
      if (response.success) {
        toast.success(response.message || gt.statusUpdated);
        fetchUserDetail();
      } else {
        toast.error(response.message || gt.statusFailed);
      }
    } catch (err) {
      toast.error(gt.statusFailed);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Impersonate ── */
  const handleImpersonate = async () => {
    const ok = await confirm({
      title: t.confirmations?.actions?.godmodeImpersonate?.title,
      message: t.confirmations?.actions?.godmodeImpersonate?.message,
      variant: 'warning',
      confirmText: t.confirmations?.actions?.godmodeImpersonate?.confirmText,
    });
    if (!ok) return;

    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/impersonate`);
      if (res.success && res.data?.magicUrl) {
        toast.success(gt.impersonationSuccess);
        window.open(res.data.magicUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(res.message || gt.impersonationFailed);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || gt.impersonationFailed);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Force password reset ── */
  const handleForcePasswordReset = async () => {
    const ok = await confirm({
      title: t.confirmations?.actions?.godmodePasswordReset?.title,
      message: t.confirmations?.actions?.godmodePasswordReset?.message,
      variant: 'warning',
      confirmText: t.confirmations?.actions?.godmodePasswordReset?.confirmText,
    });
    if (!ok) return;

    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/reset-password`);
      if (res.success && res.data?.resetUrl) {
        toast.success(gt.resetSuccess);
        window.open(res.data.resetUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(res.message || gt.resetFailed);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || gt.resetFailed);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Wallet adjustment ── */
  const handleWalletAdjust = async (e) => {
    e.preventDefault();
    if (!walletAmount || !walletReason.trim()) return;

    const numeric = parseFloat(walletAmount);
    const isLarge = Math.abs(numeric) >= 10000;

    const direction = numeric > 0 ? 'credit' : 'debit';
    const amount = Math.abs(numeric).toLocaleString();
    const reason = walletReason.trim();

    const confirmKey = isLarge
      ? 'godmodeWalletAdjustLarge'
      : 'godmodeWalletAdjust';
    const copy = t.confirmations?.actions?.[confirmKey] || {};

    const message = (copy.messageTemplate || '')
      .replace('{direction}', direction)
      .replace('{amount}', amount)
      .replace('{reason}', reason);

    const ok = await confirm({
      title: copy.title,
      message,
      variant: isLarge ? 'danger' : 'warning',
      confirmText: copy.confirmText,
      requireInput: isLarge ? copy.requireInput : null,
    });
    if (!ok) return;

    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/wallet`, {
        amount: numeric,
        reason,
      });
      if (res.success) {
        toast.success(
          (gt.walletSuccessTemplate || 'Wallet adjusted. New balance: {balance} ETB')
            .replace('{balance}', res.data?.newBalance ?? '—')
        );
        setWalletAmount('');
        setWalletReason('');
        fetchUserDetail();
      } else {
        toast.error(res.message || gt.walletFailed);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || gt.walletFailed);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Agent override ── */
  const handleAgentOverride = async (e) => {
    e.preventDefault();
    if (!agentValue) return;

    const numeric = parseFloat(agentValue);
    const unit = agentType === 'percentage' ? '%' : 'ETB';

    const copy = t.confirmations?.actions?.godmodeAgentOverride || {};
    const message = (copy.messageTemplate || '')
      .replace('{value}', String(numeric))
      .replace('{unit}', unit);

    const ok = await confirm({
      title: copy.title,
      message,
      variant: 'warning',
      confirmText: copy.confirmText,
    });
    if (!ok) return;

    try {
      setActionLoading(true);
      const res = await apiClient.patch(`/admin/users/${id}/agent-override`, {
        commissionType: agentType,
        commissionValue: numeric,
      });
      if (res.success) {
        toast.success(gt.agentOverrideSuccess);
        setAgentValue('');
        fetchUserDetail();
      } else {
        toast.error(res.message || gt.agentOverrideFailed);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || gt.agentOverrideFailed);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Orphan ── */
  const handleOrphan = async () => {
    const copy = t.confirmations?.actions?.godmodeOrphan || {};
    const ok = await confirm({
      title: copy.title,
      message: copy.message,
      variant: 'danger',
      confirmText: copy.confirmText,
      requireInput: copy.requireInput,
    });
    if (!ok) return;

    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/orphan`);
      if (res.success) {
        toast.success(gt.orphanSuccess);
        fetchUserDetail();
      } else {
        toast.error(res.message || gt.orphanFailed);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || gt.orphanFailed);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Ban ── */
  const handleBan = async (e) => {
    e.preventDefault();
    if (!banReason.trim()) return;

    const copy = t.confirmations?.actions?.godmodeBan || {};
    const ok = await confirm({
      title: copy.title,
      message: copy.message,
      variant: 'danger',
      confirmText: copy.confirmText,
      requireInput: copy.requireInput,
    });
    if (!ok) return;

    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/ban`, {
        reason: banReason.trim(),
        revokeCodes: true,
      });
      if (res.success) {
        toast.success(gt.banSuccess);
        setBanReason('');
        fetchUserDetail();
      } else {
        toast.error(res.message || gt.banFailed);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || gt.banFailed);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Unban ── */
  const handleUnban = async (e) => {
    e.preventDefault();

    const copy = t.confirmations?.actions?.godmodeUnban || {};
    const ok = await confirm({
      title: copy.title,
      message: copy.message,
      variant: 'warning',
      confirmText: copy.confirmText,
      requireInput: copy.requireInput,
    });
    if (!ok) return;

    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/unban`, {
        note: unbanNote.trim() || null,
      });
      if (res.success) {
        toast.success(gt.unbanSuccess);
        setUnbanNote('');
        fetchUserDetail();
      } else {
        toast.error(res.message || gt.unbanFailed);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || gt.unbanFailed);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Manual enroll ── */
  const handleManualEnroll = async (e) => {
    e.preventDefault();
    if (!manualEnrollReason.trim()) return;

    const copy = t.confirmations?.actions?.godmodeManualEnroll || {};
    const message = (copy.messageTemplate || '').replace(
      '{reason}',
      manualEnrollReason.trim()
    );

    const ok = await confirm({
      title: copy.title,
      message,
      variant: 'warning',
      confirmText: copy.confirmText,
    });
    if (!ok) return;

    try {
      setActionLoading(true);
      const res = await apiClient.post(`/admin/users/${id}/enroll-manual`, {
        purchaseMode: 'full-course',
        reason: manualEnrollReason.trim(),
      });
      if (res.success) {
        toast.success(gt.enrollSuccess);
        setManualEnrollReason('');
        fetchUserDetail();
      } else {
        toast.error(res.message || gt.enrollFailed);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || gt.enrollFailed);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return g.emDash || '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (value) => Number(value || 0).toLocaleString('en-US');

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <SEOHead title={g.userDetailsTitle || 'User Details'} />
        <AdminLayout
          title={g.userDetailsTitle || 'User Details'}
          subtitle={g.loadingUser || 'Loading user information...'}
        >
          <div className="user-detail-loading">
            <div className="spinner" style={{ padding: '5rem 0' }}>
              <div className="spinner-circle" />
            </div>
          </div>
        </AdminLayout>
      </>
    );
  }

  /* ── Not found ── */
  if (!user) {
    return (
      <>
        <SEOHead title={g.userNotFoundTitle || 'User Not Found'} />
        <AdminLayout
          title={g.userNotFoundTitle || 'User Not Found'}
          subtitle={g.userNotFoundSubtitle || 'The requested user does not exist.'}
        >
          <button
            className="admin-back-btn"
            onClick={() => router.push('/admin/users')}
          >
            <ArrowLeft size={16} />
            <span>{g.backToUsers || 'Back to Users'}</span>
          </button>
        </AdminLayout>
      </>
    );
  }

  const displayName = user.full_name || user.name || g.unknownUser || 'Unknown';
  const isEnrolled = user.is_enrolled === true;
  const isBanned = Boolean(user.banned_at);

  return (
    <>
      <SEOHead title={`${displayName} — ${g.userDetailsTitle || 'User Details'}`} />
      <AdminLayout title={displayName} subtitle={user.email || ''}>
        <button
          className="admin-back-btn"
          onClick={() => router.push('/admin/users')}
        >
          <ArrowLeft size={16} />
          <span>{g.backToUsers || 'Back to Users'}</span>
        </button>

        {/* Header */}
        <div className="user-detail-header">
          <div className="user-detail-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="user-detail-info">
            <h2>{displayName}</h2>
            <div className="user-detail-meta">
              <span>
                <Mail size={14} /> {user.email || g.emDash}
              </span>
              <span>
                <Phone size={14} /> {user.phone || g.notAvailable}
              </span>
              <span>
                <Calendar size={14} /> {g.joined}{' '}
                {formatDate(user.created_at)}
              </span>
              <span
                className={`status-badge ${
                  isBanned ? 'rejected' : isEnrolled ? 'approved' : 'pending'
                }`}
              >
                {isBanned
                  ? g.statusBanned
                  : user.status ||
                    (isEnrolled ? g.statusEnrolled : g.statusRegistered)}
              </span>
            </div>
          </div>
          <div className="user-detail-actions">
            {isEnrolled ? (
              <button
                className="admin-action-btn reject"
                onClick={() => handleStatusChange('registered')}
                disabled={actionLoading}
              >
                <UserX size={16} />
                {g.unenroll}
              </button>
            ) : (
              <button
                className="admin-action-btn approve"
                onClick={() => handleStatusChange('enrolled')}
                disabled={actionLoading}
              >
                <UserCheck size={16} />
                {g.markEnrolled}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="user-detail-stats">
          <div className="stat-card">
            <span className="stat-label">{gs.directReferrals}</span>
            <span className="stat-value">
              {formatAmount(user.direct_referral_count)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">{gs.teamSize}</span>
            <span className="stat-value">
              {formatAmount(user.total_team_size)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">{gs.payingDirect}</span>
            <span className="stat-value">
              {formatAmount(user.paying_direct_count)}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">{gs.lifetimeEarned}</span>
            <span className="stat-value">
              {formatAmount(user.lifetime_referral_earnings)} ETB
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="admin-tabs"
          style={{ marginTop: '1.5rem', marginBottom: '1rem' }}
        >
          <button
            className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            {gTabs.overview}
          </button>
          <button
            className={`admin-tab ${activeTab === 'wallet' ? 'active' : ''}`}
            onClick={() => setActiveTab('wallet')}
          >
            <Wallet size={14} style={{ marginRight: 6 }} />
            {gTabs.walletAndAgent}
          </button>
          <button
            className={`admin-tab ${activeTab === 'godmode' ? 'active' : ''}`}
            onClick={() => setActiveTab('godmode')}
          >
            <ShieldAlert size={14} style={{ marginRight: 6 }} />
            {gTabs.godMode}
          </button>
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <>
            <div className="user-detail-section">
              <h3>{gOv.enrollmentHistory}</h3>
              {enrollments.length === 0 ? (
                <p className="empty-state-desc">{gOv.noEnrollments}</p>
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
                              ? gOv.fullCoursePass
                              : gOv.phaseBundle}
                          </span>
                          <span className="admin-table-sub">
                            {formatAmount(enrollment.amount)} ETB ·{' '}
                            {enrollment.method || g.emDash} ·{' '}
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
              <h3>{gOv.referralHistory}</h3>
              {referrals.length === 0 ? (
                <p className="empty-state-desc">{gOv.noReferrals}</p>
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
                            {referral.referred_name || g.unknownUser}
                          </span>
                          <span className="admin-table-sub">
                            {referral.referred_email || g.emDash}
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
                            ? g.statusEnrolled
                            : g.statusRegistered}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Wallet & Agent tab */}
        {activeTab === 'wallet' && (
          <>
            <div className="user-detail-section">
              <h3>
                <Wallet size={16} style={{ marginRight: 8 }} />
                {gw.heading}
              </h3>
              <div className="user-detail-stats">
                <div className="stat-card">
                  <span className="stat-label">{gw.currentBalance}</span>
                  <span className="stat-value">
                    {formatAmount(user.current_balance)} {gw.currency}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">{gw.totalEarned}</span>
                  <span className="stat-value">
                    {formatAmount(user.total_earned)} {gw.currency}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">{gw.totalWithdrawn}</span>
                  <span className="stat-value">
                    {formatAmount(user.total_withdrawn)} {gw.currency}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">{gw.pendingWithdrawal}</span>
                  <span className="stat-value">
                    {formatAmount(user.pending_withdrawal)} {gw.currency}
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
                <h4 style={{ margin: 0 }}>{gw.manualAdjustment}</h4>
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-dim)',
                    margin: 0,
                  }}
                >
                  {gw.adjustmentHint}
                </p>
                <input
                  type="number"
                  step="0.01"
                  placeholder={gw.amountPlaceholder}
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  className="admin-input"
                  required
                />
                <input
                  type="text"
                  placeholder={gw.reasonPlaceholder}
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
                  {actionLoading ? gw.applying : gw.applyAdjustment}
                </button>
              </form>
            </div>

            <div className="user-detail-section">
              <h3>
                <Briefcase size={16} style={{ marginRight: 8 }} />
                {ga.heading}
              </h3>
              <div className="user-detail-stats">
                <div className="stat-card">
                  <span className="stat-label">{ga.agentCode}</span>
                  <span
                    className="stat-value"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {user.agent_code || g.emDash}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">{ga.commissionType}</span>
                  <span className="stat-value">
                    {user.commission_type || ga.fixedType}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">{ga.commissionValue}</span>
                  <span className="stat-value">
                    {formatAmount(user.commission_value)}{' '}
                    {user.commission_type === 'percentage' ? '%' : 'ETB'}
                  </span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">{ga.agentActive}</span>
                  <span className="stat-value">
                    {user.agent_settings_active === false ? ga.no : ga.yes}
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
                <h4 style={{ margin: 0 }}>{ga.overrideHeading}</h4>
                <select
                  value={agentType}
                  onChange={(e) => setAgentType(e.target.value)}
                  className="admin-input"
                >
                  <option value="fixed">{ga.fixedOption}</option>
                  <option value="percentage">{ga.percentageOption}</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder={
                    agentType === 'fixed'
                      ? ga.overridePlaceholderFixed
                      : ga.overridePlaceholderPercentage
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
                  {actionLoading ? ga.applying : ga.overrideRate}
                </button>
              </form>
            </div>
          </>
        )}

        {/* God Mode tab */}
        {activeTab === 'godmode' && (
          <>
            <div className="user-detail-section">
              <h3>
                <ShieldAlert size={16} style={{ marginRight: 8 }} />
                {gi.heading}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {gi.hint}
              </p>
              <div
                style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
              >
                <button
                  className="admin-btn-primary"
                  onClick={handleImpersonate}
                  disabled={actionLoading}
                >
                  <LinkIcon size={14} style={{ marginRight: 6 }} />
                  {gi.generateLink}
                </button>
                <button
                  className="admin-btn-secondary"
                  onClick={handleForcePasswordReset}
                  disabled={actionLoading}
                >
                  <Key size={14} style={{ marginRight: 6 }} />
                  {gi.generateReset}
                </button>
              </div>
            </div>

            <div className="user-detail-section">
              <h3>{gm.heading}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {gm.hint}
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
                  placeholder={gm.reasonPlaceholder}
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
                  {actionLoading ? gm.enrolling : gm.button}
                </button>
              </form>
            </div>

            <div className="user-detail-section">
              <h3>{gn.heading}</h3>
              <div
                style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
              >
                <button
                  className="admin-btn-warning"
                  onClick={handleOrphan}
                  disabled={actionLoading}
                >
                  {gn.orphanButton}
                </button>
              </div>

              {/* Danger Zone — Ban */}
              {!isBanned && (
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
                  <h4 style={{ margin: 0, color: '#ef4444' }}>
                    {gb.heading}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-dim)',
                      margin: 0,
                    }}
                  >
                    {gb.hint}
                  </p>
                  <input
                    type="text"
                    placeholder={gb.reasonPlaceholder}
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className="admin-input"
                    required
                    minLength={5}
                  />
                  <button
                    type="submit"
                    className="admin-btn-danger"
                    disabled={actionLoading}
                  >
                    {gb.button}
                  </button>
                </form>
              )}

              {/* Danger Zone — Unban */}
              {isBanned && (
                <form
                  onSubmit={handleUnban}
                  style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(245, 158, 11, 0.06)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <ShieldCheck size={16} />
                    {gu.heading}
                  </h4>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-dim)',
                      margin: 0,
                    }}
                  >
                    {(gu.bannedOnTemplate || '')
                      .replace('{date}', formatDate(user.banned_at))
                      .replace('{reason}', user.banned_reason || gu.noReason)}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-dim)',
                      margin: 0,
                    }}
                  >
                    {gu.hint}
                  </p>
                  <input
                    type="text"
                    placeholder={gu.notePlaceholder}
                    value={unbanNote}
                    onChange={(e) => setUnbanNote(e.target.value)}
                    className="admin-input"
                  />
                  <button
                    type="submit"
                    className="admin-btn-warning"
                    disabled={actionLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      justifyContent: 'center',
                    }}
                  >
                    <ShieldCheck size={14} />
                    {actionLoading ? gu.unbanning : gu.button}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminUserDetailPage;