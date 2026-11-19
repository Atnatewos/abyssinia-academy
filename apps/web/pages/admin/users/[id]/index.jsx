// /**
//  * @fileoverview Admin User Detail Page
//  *
//  * Single user profile with enrollment stats, wallet balance, agent
//  * attribution, and God Mode controls (impersonate, wallet adjust, ban,
//  * unban, orphan, manual enrollment).
//  *
//  * All UI strings are sourced from the shared i18n `admin.godMode.*`
//  * namespace. All destructive actions are gated by the shared
//  * confirmation system (useConfirm).
//  *
//  * The detail fetch depends only on the route id; toast, router, and
//  * i18n copy are read through refs so context re-renders never retrigger
//  * the effect.
//  *
//  * Path: apps/web/pages/admin/users/[id]/index.jsx
//  */

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { useRouter } from 'next/router';
// import {
//   ArrowLeft,
//   Mail,
//   Phone,
//   Calendar,
//   UserCheck,
//   UserX,
//   CreditCard,
//   Users,
//   Wallet,
//   Briefcase,
//   ShieldAlert,
//   ShieldCheck,
//   Link as LinkIcon,
//   Key,
// } from 'lucide-react';
// import SEOHead from '../../../../components/shared/SEOHead';
// import AdminLayout from '../../../../components/admin/AdminLayout';
// import { useLanguage } from '../../../../context/LanguageContext';
// import { useToast } from '../../../../context/ToastContext';
// import { useConfirm } from '../../../../components/shared/ConfirmProvider';
// import apiClient from '../../../../lib/api';
// import { getItem } from '../../../../lib/storage';

// /**
//  * Normalize a detail payload.
//  * @param {*} payload
//  * @returns {object|null}
//  */
// const normalizeUser = (payload) => {
//   if (!payload) return null;
//   if (Array.isArray(payload)) return normalizeUser(payload[0]);
//   if (typeof payload !== 'object') return null;
//   if (payload.user && typeof payload.user === 'object')
//     return normalizeUser(payload.user);
//   if (
//     payload.data &&
//     typeof payload.data === 'object' &&
//     !Array.isArray(payload.data)
//   )
//     return normalizeUser(payload.data);
//   if (payload.rows && Array.isArray(payload.rows))
//     return normalizeUser(payload.rows[0]);
//   if (payload.id && (payload.full_name || payload.name)) return payload;
//   return null;
// };

// /**
//  * Normalize a list payload.
//  * @param {*} payload
//  * @returns {Array}
//  */
// const normalizeList = (payload) => {
//   if (Array.isArray(payload)) return payload;
//   if (payload && Array.isArray(payload.rows)) return payload.rows;
//   if (payload && payload.data && Array.isArray(payload.data))
//     return payload.data;
//   return [];
// };

// const AdminUserDetailPage = () => {
//   const router = useRouter();
//   const { id } = router.query;
//   const { t } = useLanguage();
//   const toast = useToast();
//   const confirm = useConfirm();

//   const [user, setUser] = useState(null);
//   const [enrollments, setEnrollments] = useState([]);
//   const [referrals, setReferrals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);

//   /* God Mode UI state */
//   const [activeTab, setActiveTab] = useState('overview');
//   const [walletAmount, setWalletAmount] = useState('');
//   const [walletReason, setWalletReason] = useState('');
//   const [banReason, setBanReason] = useState('');
//   const [unbanNote, setUnbanNote] = useState('');
//   const [manualEnrollReason, setManualEnrollReason] = useState('');
//   const [agentType, setAgentType] = useState('fixed');
//   const [agentValue, setAgentValue] = useState('');

//   /* Shorthand helpers */
//   const g = t.admin?.godMode || {};
//   const gs = g.stats || {};
//   const gw = g.wallet || {};
//   const ga = g.agent || {};
//   const gi = g.impersonation || {};
//   const gm = g.manualEnroll || {};
//   const gn = g.network || {};
//   const gb = g.ban || {};
//   const gu = g.unban || {};
//   const gt = g.toasts || {};
//   const gOv = g.overview || {};
//   const gTabs = g.tabs || {};

//   const toastRef = useRef(toast);
//   toastRef.current = toast;
//   const routerRef = useRef(router);
//   routerRef.current = router;
//   const godModeToastsRef = useRef(gt);
//   godModeToastsRef.current = gt;

//   const fetchUserDetail = useCallback(async () => {
//     if (!id) return;

//     const token = getItem('admin_token');
//     if (!token) {
//       routerRef.current.push('/admin/login');
//       return;
//     }

//     setLoading(true);

//     try {
//       const [userRes, enrollRes, refRes] = await Promise.allSettled([
//         apiClient.get(`/admin/users/${id}`),
//         apiClient.get(`/admin/users/${id}/enrollments`),
//         apiClient.get(`/admin/users/${id}/referrals`),
//       ]);

//       if (userRes.status === 'fulfilled') {
//         const raw = userRes.value;
//         const candidate = raw?.data?.user || raw?.data || raw?.user || raw;
//         const normalized = normalizeUser(candidate);
//         if (normalized) setUser(normalized);
//       } else if (userRes.reason?.response?.status === 401) {
//         routerRef.current.push('/admin/login');
//         return;
//       } else {
//         toastRef.current.error(
//           userRes.reason?.response?.data?.message ||
//             godModeToastsRef.current.loadError ||
//             'Failed to load user details.'
//         );
//       }

//       if (enrollRes.status === 'fulfilled') {
//         setEnrollments(normalizeList(enrollRes.value?.data ?? enrollRes.value));
//       }
//       if (refRes.status === 'fulfilled') {
//         setReferrals(normalizeList(refRes.value?.data ?? refRes.value));
//       }
//     } catch (err) {
//       if (err?.response?.status === 401) {
//         routerRef.current.push('/admin/login');
//       } else {
//         toastRef.current.error(
//           godModeToastsRef.current.loadError || 'Failed to load user details'
//         );
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchUserDetail();
//   }, [fetchUserDetail]);

//   /* ── Enrollment toggle ── */
//   const handleStatusChange = async (nextStatus) => {
//     const isEnroll = nextStatus === 'enrolled';
//     const ok = await confirm({
//       title: isEnroll
//         ? t.confirmations?.actions?.godmodeEnroll?.title || 'Mark user as enrolled?'
//         : t.confirmations?.actions?.godmodeUnenroll?.title || 'Unenroll this user?',
//       message: isEnroll
//         ? t.confirmations?.actions?.godmodeEnroll?.message
//         : t.confirmations?.actions?.godmodeUnenroll?.message,
//       variant: isEnroll ? 'warning' : 'danger',
//       confirmText: isEnroll
//         ? t.confirmations?.actions?.godmodeEnroll?.confirmText
//         : t.confirmations?.actions?.godmodeUnenroll?.confirmText,
//     });
//     if (!ok) return;

//     setActionLoading(true);
//     try {
//       const response = await apiClient.post(`/admin/users/${id}/status`, {
//         status: nextStatus,
//       });
//       if (response.success) {
//         toast.success(response.message || gt.statusUpdated);
//         fetchUserDetail();
//       } else {
//         toast.error(response.message || gt.statusFailed);
//       }
//     } catch (err) {
//       toast.error(gt.statusFailed);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ── Impersonate ── */
//   const handleImpersonate = async () => {
//     const ok = await confirm({
//       title: t.confirmations?.actions?.godmodeImpersonate?.title,
//       message: t.confirmations?.actions?.godmodeImpersonate?.message,
//       variant: 'warning',
//       confirmText: t.confirmations?.actions?.godmodeImpersonate?.confirmText,
//     });
//     if (!ok) return;

//     try {
//       setActionLoading(true);
//       const res = await apiClient.post(`/admin/users/${id}/impersonate`);
//       if (res.success && res.data?.magicUrl) {
//         toast.success(gt.impersonationSuccess);
//         window.open(res.data.magicUrl, '_blank', 'noopener,noreferrer');
//       } else {
//         toast.error(res.message || gt.impersonationFailed);
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || gt.impersonationFailed);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ── Force password reset ── */
//   const handleForcePasswordReset = async () => {
//     const ok = await confirm({
//       title: t.confirmations?.actions?.godmodePasswordReset?.title,
//       message: t.confirmations?.actions?.godmodePasswordReset?.message,
//       variant: 'warning',
//       confirmText: t.confirmations?.actions?.godmodePasswordReset?.confirmText,
//     });
//     if (!ok) return;

//     try {
//       setActionLoading(true);
//       const res = await apiClient.post(`/admin/users/${id}/reset-password`);
//       if (res.success && res.data?.resetUrl) {
//         toast.success(gt.resetSuccess);
//         window.open(res.data.resetUrl, '_blank', 'noopener,noreferrer');
//       } else {
//         toast.error(res.message || gt.resetFailed);
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || gt.resetFailed);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ── Wallet adjustment ── */
//   const handleWalletAdjust = async (e) => {
//     e.preventDefault();
//     if (!walletAmount || !walletReason.trim()) return;

//     const numeric = parseFloat(walletAmount);
//     const isLarge = Math.abs(numeric) >= 10000;
//     const direction = numeric > 0 ? 'credit' : 'debit';
//     const amount = Math.abs(numeric).toLocaleString();
//     const reason = walletReason.trim();

//     const confirmKey = isLarge
//       ? 'godmodeWalletAdjustLarge'
//       : 'godmodeWalletAdjust';
//     const copy = t.confirmations?.actions?.[confirmKey] || {};
//     const message = (copy.messageTemplate || '')
//       .replace('{direction}', direction)
//       .replace('{amount}', amount)
//       .replace('{reason}', reason);

//     const ok = await confirm({
//       title: copy.title,
//       message,
//       variant: isLarge ? 'danger' : 'warning',
//       confirmText: copy.confirmText,
//       requireInput: isLarge ? copy.requireInput : null,
//     });
//     if (!ok) return;

//     try {
//       setActionLoading(true);
//       const res = await apiClient.post(`/admin/users/${id}/wallet`, {
//         amount: numeric,
//         reason,
//       });
//       if (res.success) {
//         toast.success(
//           (gt.walletSuccessTemplate || 'Wallet adjusted. New balance: {balance} ETB')
//             .replace('{balance}', res.data?.newBalance ?? '—')
//         );
//         setWalletAmount('');
//         setWalletReason('');
//         fetchUserDetail();
//       } else {
//         toast.error(res.message || gt.walletFailed);
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || gt.walletFailed);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ── Agent override ── */
//   const handleAgentOverride = async (e) => {
//     e.preventDefault();
//     if (!agentValue) return;

//     const numeric = parseFloat(agentValue);
//     const unit = agentType === 'percentage' ? '%' : 'ETB';
//     const copy = t.confirmations?.actions?.godmodeAgentOverride || {};
//     const message = (copy.messageTemplate || '')
//       .replace('{value}', String(numeric))
//       .replace('{unit}', unit);

//     const ok = await confirm({
//       title: copy.title,
//       message,
//       variant: 'warning',
//       confirmText: copy.confirmText,
//     });
//     if (!ok) return;

//     try {
//       setActionLoading(true);
//       const res = await apiClient.patch(`/admin/users/${id}/agent-override`, {
//         commissionType: agentType,
//         commissionValue: numeric,
//       });
//       if (res.success) {
//         toast.success(gt.agentOverrideSuccess);
//         setAgentValue('');
//         fetchUserDetail();
//       } else {
//         toast.error(res.message || gt.agentOverrideFailed);
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || gt.agentOverrideFailed);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ── Orphan ── */
//   const handleOrphan = async () => {
//     const copy = t.confirmations?.actions?.godmodeOrphan || {};
//     const ok = await confirm({
//       title: copy.title,
//       message: copy.message,
//       variant: 'danger',
//       confirmText: copy.confirmText,
//       requireInput: copy.requireInput,
//     });
//     if (!ok) return;

//     try {
//       setActionLoading(true);
//       const res = await apiClient.post(`/admin/users/${id}/orphan`);
//       if (res.success) {
//         toast.success(gt.orphanSuccess);
//         fetchUserDetail();
//       } else {
//         toast.error(res.message || gt.orphanFailed);
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || gt.orphanFailed);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ── Ban ── */
//   const handleBan = async (e) => {
//     e.preventDefault();
//     if (!banReason.trim()) return;

//     const copy = t.confirmations?.actions?.godmodeBan || {};
//     const ok = await confirm({
//       title: copy.title,
//       message: copy.message,
//       variant: 'danger',
//       confirmText: copy.confirmText,
//       requireInput: copy.requireInput,
//     });
//     if (!ok) return;

//     try {
//       setActionLoading(true);
//       const res = await apiClient.post(`/admin/users/${id}/ban`, {
//         reason: banReason.trim(),
//         revokeCodes: true,
//       });
//       if (res.success) {
//         toast.success(gt.banSuccess);
//         setBanReason('');
//         fetchUserDetail();
//       } else {
//         toast.error(res.message || gt.banFailed);
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || gt.banFailed);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ── Unban ── */
//   const handleUnban = async (e) => {
//     e.preventDefault();

//     const copy = t.confirmations?.actions?.godmodeUnban || {};
//     const ok = await confirm({
//       title: copy.title,
//       message: copy.message,
//       variant: 'warning',
//       confirmText: copy.confirmText,
//       requireInput: copy.requireInput,
//     });
//     if (!ok) return;

//     try {
//       setActionLoading(true);
//       const res = await apiClient.post(`/admin/users/${id}/unban`, {
//         note: unbanNote.trim() || null,
//       });
//       if (res.success) {
//         toast.success(gt.unbanSuccess);
//         setUnbanNote('');
//         fetchUserDetail();
//       } else {
//         toast.error(res.message || gt.unbanFailed);
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || gt.unbanFailed);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   /* ── Manual enroll ── */
//   const handleManualEnroll = async (e) => {
//     e.preventDefault();
//     if (!manualEnrollReason.trim()) return;

//     const copy = t.confirmations?.actions?.godmodeManualEnroll || {};
//     const message = (copy.messageTemplate || '').replace(
//       '{reason}',
//       manualEnrollReason.trim()
//     );

//     const ok = await confirm({
//       title: copy.title,
//       message,
//       variant: 'warning',
//       confirmText: copy.confirmText,
//     });
//     if (!ok) return;

//     try {
//       setActionLoading(true);
//       const res = await apiClient.post(`/admin/users/${id}/enroll-manual`, {
//         purchaseMode: 'full-course',
//         reason: manualEnrollReason.trim(),
//       });
//       if (res.success) {
//         toast.success(gt.enrollSuccess);
//         setManualEnrollReason('');
//         fetchUserDetail();
//       } else {
//         toast.error(res.message || gt.enrollFailed);
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || gt.enrollFailed);
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return g.emDash || '—';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   };

//   const formatAmount = (value) => Number(value || 0).toLocaleString('en-US');

//   /* ── Loading ── */
//   if (loading) {
//     return (
//       <>
//         <SEOHead title={g.userDetailsTitle || 'User Details'} />
//         <AdminLayout
//           title={g.userDetailsTitle || 'User Details'}
//           subtitle={g.loadingUser || 'Loading user information...'}
//         >
//           <div className="user-detail-loading">
//             <div className="spinner" style={{ padding: '5rem 0' }}>
//               <div className="spinner-circle" />
//             </div>
//           </div>
//         </AdminLayout>
//       </>
//     );
//   }

//   /* ── Not found ── */
//   if (!user) {
//     return (
//       <>
//         <SEOHead title={g.userNotFoundTitle || 'User Not Found'} />
//         <AdminLayout
//           title={g.userNotFoundTitle || 'User Not Found'}
//           subtitle={g.userNotFoundSubtitle || 'The requested user does not exist.'}
//         >
//           <button
//             className="admin-back-btn"
//             onClick={() => router.push('/admin/users')}
//           >
//             <ArrowLeft size={16} />
//             <span>{g.backToUsers || 'Back to Users'}</span>
//           </button>
//         </AdminLayout>
//       </>
//     );
//   }

//   const displayName = user.full_name || user.name || g.unknownUser || 'Unknown';
//   const isEnrolled = user.is_enrolled === true;
//   const isBanned = Boolean(user.banned_at);

//   return (
//     <>
//       <SEOHead title={`${displayName} — ${g.userDetailsTitle || 'User Details'}`} />
//       <AdminLayout title={displayName} subtitle={user.email || ''}>
//         <button
//           className="admin-back-btn"
//           onClick={() => router.push('/admin/users')}
//         >
//           <ArrowLeft size={16} />
//           <span>{g.backToUsers || 'Back to Users'}</span>
//         </button>

//         {/* Header */}
//         <div className="user-detail-header">
//           <div className="user-detail-avatar">
//             {displayName.charAt(0).toUpperCase()}
//           </div>
//           <div className="user-detail-info">
//             <h2>{displayName}</h2>
//             <div className="user-detail-meta">
//               <span>
//                 <Mail size={14} /> {user.email || g.emDash}
//               </span>
//               <span>
//                 <Phone size={14} /> {user.phone || g.notAvailable}
//               </span>
//               <span>
//                 <Calendar size={14} /> {g.joined}{' '}
//                 {formatDate(user.created_at)}
//               </span>
//               <span
//                 className={`status-badge ${
//                   isBanned ? 'rejected' : isEnrolled ? 'approved' : 'pending'
//                 }`}
//               >
//                 {isBanned
//                   ? g.statusBanned
//                   : user.status ||
//                     (isEnrolled ? g.statusEnrolled : g.statusRegistered)}
//               </span>
//             </div>
//           </div>
//           <div className="user-detail-actions">
//             {isEnrolled ? (
//               <button
//                 className="admin-action-btn reject"
//                 onClick={() => handleStatusChange('registered')}
//                 disabled={actionLoading}
//               >
//                 <UserX size={16} />
//                 {g.unenroll}
//               </button>
//             ) : (
//               <button
//                 className="admin-action-btn approve"
//                 onClick={() => handleStatusChange('enrolled')}
//                 disabled={actionLoading}
//               >
//                 <UserCheck size={16} />
//                 {g.markEnrolled}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="user-detail-stats">
//           <div className="stat-card">
//             <span className="stat-label">{gs.directReferrals}</span>
//             <span className="stat-value">
//               {formatAmount(user.direct_referral_count)}
//             </span>
//           </div>
//           <div className="stat-card">
//             <span className="stat-label">{gs.teamSize}</span>
//             <span className="stat-value">
//               {formatAmount(user.total_team_size)}
//             </span>
//           </div>
//           <div className="stat-card">
//             <span className="stat-label">{gs.payingDirect}</span>
//             <span className="stat-value">
//               {formatAmount(user.paying_direct_count)}
//             </span>
//           </div>
//           <div className="stat-card">
//             <span className="stat-label">{gs.lifetimeEarned}</span>
//             <span className="stat-value">
//               {formatAmount(user.lifetime_referral_earnings)} ETB
//             </span>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div
//           className="admin-tabs"
//           style={{ marginTop: '1.5rem', marginBottom: '1rem' }}
//         >
//           <button
//             className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`}
//             onClick={() => setActiveTab('overview')}
//           >
//             {gTabs.overview}
//           </button>
//           <button
//             className={`admin-tab ${activeTab === 'wallet' ? 'active' : ''}`}
//             onClick={() => setActiveTab('wallet')}
//           >
//             <Wallet size={14} style={{ marginRight: 6 }} />
//             {gTabs.walletAndAgent}
//           </button>
//           <button
//             className={`admin-tab ${activeTab === 'godmode' ? 'active' : ''}`}
//             onClick={() => setActiveTab('godmode')}
//           >
//             <ShieldAlert size={14} style={{ marginRight: 6 }} />
//             {gTabs.godMode}
//           </button>
//         </div>

//         {/* Overview tab */}
//         {activeTab === 'overview' && (
//           <>
//             <div className="user-detail-section">
//               <h3>{gOv.enrollmentHistory}</h3>
//               {enrollments.length === 0 ? (
//                 <p className="empty-state-desc">{gOv.noEnrollments}</p>
//               ) : (
//                 <div className="admin-table-wrapper compact">
//                   {enrollments.map((enrollment) => (
//                     <div key={enrollment.id} className="admin-table-row">
//                       <div className="admin-table-info">
//                         <div className="admin-table-avatar course">
//                           <CreditCard size={16} />
//                         </div>
//                         <div className="admin-table-name-block">
//                           <span className="admin-table-name">
//                             {enrollment.purchase_mode === 'full-course'
//                               ? gOv.fullCoursePass
//                               : gOv.phaseBundle}
//                           </span>
//                           <span className="admin-table-sub">
//                             {formatAmount(enrollment.amount)} ETB ·{' '}
//                             {enrollment.method || g.emDash} ·{' '}
//                             {formatDate(
//                               enrollment.paid_at || enrollment.created_at
//                             )}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="admin-table-actions-wrapper">
//                         <span
//                           className={`status-badge ${
//                             enrollment.status === 'approved'
//                               ? 'approved'
//                               : enrollment.status === 'rejected'
//                               ? 'rejected'
//                               : 'pending'
//                           }`}
//                         >
//                           {enrollment.status}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="user-detail-section">
//               <h3>{gOv.referralHistory}</h3>
//               {referrals.length === 0 ? (
//                 <p className="empty-state-desc">{gOv.noReferrals}</p>
//               ) : (
//                 <div className="admin-table-wrapper compact">
//                   {referrals.map((referral) => (
//                     <div key={referral.id} className="admin-table-row">
//                       <div className="admin-table-info">
//                         <div className="admin-table-avatar">
//                           {(referral.referred_name || '?')
//                             .charAt(0)
//                             .toUpperCase()}
//                         </div>
//                         <div className="admin-table-name-block">
//                           <span className="admin-table-name">
//                             {referral.referred_name || g.unknownUser}
//                           </span>
//                           <span className="admin-table-sub">
//                             {referral.referred_email || g.emDash}
//                           </span>
//                         </div>
//                       </div>
//                       <div className="admin-table-actions-wrapper">
//                         <span className="admin-table-meta">
//                           <Users size={12} /> {formatDate(referral.created_at)}
//                         </span>
//                         <span
//                           className={`status-badge ${
//                             referral.referred_is_enrolled
//                               ? 'approved'
//                               : 'pending'
//                           }`}
//                         >
//                           {referral.referred_is_enrolled
//                             ? g.statusEnrolled
//                             : g.statusRegistered}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </>
//         )}

//         {/* Wallet & Agent tab */}
//         {activeTab === 'wallet' && (
//           <>
//             <div className="user-detail-section">
//               <h3>
//                 <Wallet size={16} style={{ marginRight: 8 }} />
//                 {gw.heading}
//               </h3>
//               <div className="user-detail-stats">
//                 <div className="stat-card">
//                   <span className="stat-label">{gw.currentBalance}</span>
//                   <span className="stat-value">
//                     {formatAmount(user.current_balance)} {gw.currency}
//                   </span>
//                 </div>
//                 <div className="stat-card">
//                   <span className="stat-label">{gw.totalEarned}</span>
//                   <span className="stat-value">
//                     {formatAmount(user.total_earned)} {gw.currency}
//                   </span>
//                 </div>
//                 <div className="stat-card">
//                   <span className="stat-label">{gw.totalWithdrawn}</span>
//                   <span className="stat-value">
//                     {formatAmount(user.total_withdrawn)} {gw.currency}
//                   </span>
//                 </div>
//                 <div className="stat-card">
//                   <span className="stat-label">{gw.pendingWithdrawal}</span>
//                   <span className="stat-value">
//                     {formatAmount(user.pending_withdrawal)} {gw.currency}
//                   </span>
//                 </div>
//               </div>

//               <form
//                 onSubmit={handleWalletAdjust}
//                 style={{
//                   marginTop: '1.5rem',
//                   padding: '1rem',
//                   background: 'var(--bg-input)',
//                   borderRadius: '0.75rem',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   gap: '0.75rem',
//                 }}
//               >
//                 <h4 style={{ margin: 0 }}>{gw.manualAdjustment}</h4>
//                 <p
//                   style={{
//                     fontSize: '0.75rem',
//                     color: 'var(--text-dim)',
//                     margin: 0,
//                   }}
//                 >
//                   {gw.adjustmentHint}
//                 </p>
//                 <input
//                   type="number"
//                   step="0.01"
//                   placeholder={gw.amountPlaceholder}
//                   value={walletAmount}
//                   onChange={(e) => setWalletAmount(e.target.value)}
//                   className="admin-input"
//                   required
//                 />
//                 <input
//                   type="text"
//                   placeholder={gw.reasonPlaceholder}
//                   value={walletReason}
//                   onChange={(e) => setWalletReason(e.target.value)}
//                   className="admin-input"
//                   required
//                   minLength={5}
//                 />
//                 <button
//                   type="submit"
//                   className="admin-btn-primary"
//                   disabled={actionLoading}
//                 >
//                   {actionLoading ? gw.applying : gw.applyAdjustment}
//                 </button>
//               </form>
//             </div>

//             <div className="user-detail-section">
//               <h3>
//                 <Briefcase size={16} style={{ marginRight: 8 }} />
//                 {ga.heading}
//               </h3>
//               <div className="user-detail-stats">
//                 <div className="stat-card">
//                   <span className="stat-label">{ga.agentCode}</span>
//                   <span
//                     className="stat-value"
//                     style={{ fontFamily: 'var(--font-mono)' }}
//                   >
//                     {user.agent_code || g.emDash}
//                   </span>
//                 </div>
//                 <div className="stat-card">
//                   <span className="stat-label">{ga.commissionType}</span>
//                   <span className="stat-value">
//                     {user.commission_type || ga.fixedType}
//                   </span>
//                 </div>
//                 <div className="stat-card">
//                   <span className="stat-label">{ga.commissionValue}</span>
//                   <span className="stat-value">
//                     {formatAmount(user.commission_value)}{' '}
//                     {user.commission_type === 'percentage' ? '%' : 'ETB'}
//                   </span>
//                 </div>
//                 <div className="stat-card">
//                   <span className="stat-label">{ga.agentActive}</span>
//                   <span className="stat-value">
//                     {user.agent_settings_active === false ? ga.no : ga.yes}
//                   </span>
//                 </div>
//               </div>

//               <form
//                 onSubmit={handleAgentOverride}
//                 style={{
//                   marginTop: '1.5rem',
//                   padding: '1rem',
//                   background: 'var(--bg-input)',
//                   borderRadius: '0.75rem',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   gap: '0.75rem',
//                 }}
//               >
//                 <h4 style={{ margin: 0 }}>{ga.overrideHeading}</h4>
//                 <select
//                   value={agentType}
//                   onChange={(e) => setAgentType(e.target.value)}
//                   className="admin-input"
//                 >
//                   <option value="fixed">{ga.fixedOption}</option>
//                   <option value="percentage">{ga.percentageOption}</option>
//                 </select>
//                 <input
//                   type="number"
//                   step="0.01"
//                   placeholder={
//                     agentType === 'fixed'
//                       ? ga.overridePlaceholderFixed
//                       : ga.overridePlaceholderPercentage
//                   }
//                   value={agentValue}
//                   onChange={(e) => setAgentValue(e.target.value)}
//                   className="admin-input"
//                   required
//                 />
//                 <button
//                   type="submit"
//                   className="admin-btn-primary"
//                   disabled={actionLoading}
//                 >
//                   {actionLoading ? ga.applying : ga.overrideRate}
//                 </button>
//               </form>
//             </div>
//           </>
//         )}

//         {/* God Mode tab */}
//         {activeTab === 'godmode' && (
//           <>
//             <div className="user-detail-section">
//               <h3>
//                 <ShieldAlert size={16} style={{ marginRight: 8 }} />
//                 {gi.heading}
//               </h3>
//               <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
//                 {gi.hint}
//               </p>
//               <div
//                 style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
//               >
//                 <button
//                   className="admin-btn-primary"
//                   onClick={handleImpersonate}
//                   disabled={actionLoading}
//                 >
//                   <LinkIcon size={14} style={{ marginRight: 6 }} />
//                   {gi.generateLink}
//                 </button>
//                 <button
//                   className="admin-btn-secondary"
//                   onClick={handleForcePasswordReset}
//                   disabled={actionLoading}
//                 >
//                   <Key size={14} style={{ marginRight: 6 }} />
//                   {gi.generateReset}
//                 </button>
//               </div>
//             </div>

//             <div className="user-detail-section">
//               <h3>{gm.heading}</h3>
//               <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
//                 {gm.hint}
//               </p>
//               <form
//                 onSubmit={handleManualEnroll}
//                 style={{
//                   padding: '1rem',
//                   background: 'var(--bg-input)',
//                   borderRadius: '0.75rem',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   gap: '0.75rem',
//                 }}
//               >
//                 <input
//                   type="text"
//                   placeholder={gm.reasonPlaceholder}
//                   value={manualEnrollReason}
//                   onChange={(e) => setManualEnrollReason(e.target.value)}
//                   className="admin-input"
//                   required
//                   minLength={5}
//                 />
//                 <button
//                   type="submit"
//                   className="admin-btn-primary"
//                   disabled={actionLoading}
//                 >
//                   {actionLoading ? gm.enrolling : gm.button}
//                 </button>
//               </form>
//             </div>

//             <div className="user-detail-section">
//               <h3>{gn.heading}</h3>
//               <div
//                 style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
//               >
//                 <button
//                   className="admin-btn-warning"
//                   onClick={handleOrphan}
//                   disabled={actionLoading}
//                 >
//                   {gn.orphanButton}
//                 </button>
//               </div>

//               {/* Danger Zone — Ban */}
//               {!isBanned && (
//                 <form
//                   onSubmit={handleBan}
//                   style={{
//                     marginTop: '1.5rem',
//                     padding: '1rem',
//                     background: 'rgba(239, 68, 68, 0.06)',
//                     border: '1px solid rgba(239, 68, 68, 0.2)',
//                     borderRadius: '0.75rem',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: '0.75rem',
//                   }}
//                 >
//                   <h4 style={{ margin: 0, color: '#ef4444' }}>
//                     {gb.heading}
//                   </h4>
//                   <p
//                     style={{
//                       fontSize: '0.75rem',
//                       color: 'var(--text-dim)',
//                       margin: 0,
//                     }}
//                   >
//                     {gb.hint}
//                   </p>
//                   <input
//                     type="text"
//                     placeholder={gb.reasonPlaceholder}
//                     value={banReason}
//                     onChange={(e) => setBanReason(e.target.value)}
//                     className="admin-input"
//                     required
//                     minLength={5}
//                   />
//                   <button
//                     type="submit"
//                     className="admin-btn-danger"
//                     disabled={actionLoading}
//                   >
//                     {gb.button}
//                   </button>
//                 </form>
//               )}

//               {/* Danger Zone — Unban */}
//               {isBanned && (
//                 <form
//                   onSubmit={handleUnban}
//                   style={{
//                     marginTop: '1.5rem',
//                     padding: '1rem',
//                     background: 'rgba(245, 158, 11, 0.06)',
//                     border: '1px solid rgba(245, 158, 11, 0.25)',
//                     borderRadius: '0.75rem',
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: '0.75rem',
//                   }}
//                 >
//                   <h4
//                     style={{
//                       margin: 0,
//                       color: 'var(--accent-gold)',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '0.5rem',
//                     }}
//                   >
//                     <ShieldCheck size={16} />
//                     {gu.heading}
//                   </h4>
//                   <p
//                     style={{
//                       fontSize: '0.75rem',
//                       color: 'var(--text-dim)',
//                       margin: 0,
//                     }}
//                   >
//                     {(gu.bannedOnTemplate || '')
//                       .replace('{date}', formatDate(user.banned_at))
//                       .replace('{reason}', user.banned_reason || gu.noReason)}
//                   </p>
//                   <p
//                     style={{
//                       fontSize: '0.75rem',
//                       color: 'var(--text-dim)',
//                       margin: 0,
//                     }}
//                   >
//                     {gu.hint}
//                   </p>
//                   <input
//                     type="text"
//                     placeholder={gu.notePlaceholder}
//                     value={unbanNote}
//                     onChange={(e) => setUnbanNote(e.target.value)}
//                     className="admin-input"
//                   />
//                   <button
//                     type="submit"
//                     className="admin-btn-warning"
//                     disabled={actionLoading}
//                     style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '0.5rem',
//                       justifyContent: 'center',
//                     }}
//                   >
//                     <ShieldCheck size={14} />
//                     {actionLoading ? gu.unbanning : gu.button}
//                   </button>
//                 </form>
//               )}
//             </div>
//           </>
//         )}
//       </AdminLayout>
//     </>
//   );
// };

// export default AdminUserDetailPage;













/**
 * @fileoverview Admin User Detail Page
 *
 * Single user profile with enrollment stats, wallet balance, agent
 * attribution, and God Mode controls (impersonate, wallet adjust, ban,
 * unban, orphan, manual enrollment).
 *
 * Styling is fully Tailwind, resolved through the design-token bridge in
 * tailwind.config.js → themes.css, so dark/light themes stay in sync
 * with the rest of the platform. Every UI string comes from the shared
 * i18n `admin.godMode.*` namespace; the LanguageContext guarantees the
 * namespace is present in every locale.
 *
 * The detail fetch depends only on the route id; toast, router, and
 * i18n copy are read through refs so context re-renders never retrigger
 * the effect. All destructive actions are gated by useConfirm.
 *
 * Path: apps/web/pages/admin/users/[id]/index.jsx
 */

import { useState, useEffect, useCallback, useRef } from 'react';
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

/* ── Design-token class recipes (Tailwind bridge → themes.css) ─────── */

const CARD =
  'box-border bg-bg-card-solid border border-solid border-border-light rounded-2xl';

const SECTION_TITLE =
  'm-0 mb-3 flex items-center gap-2 text-lg font-extrabold text-text-main';

const STAT_LABEL =
  'text-2xs font-bold uppercase tracking-wider text-text-dim';

const STAT_VALUE = 'text-3xl font-black text-text-main';

const INPUT =
  'box-border w-full px-3.5 py-2.5 rounded-md bg-bg-input border border-solid border-border-medium ' +
  'text-text-main text-sm font-sans outline-none transition-colors duration-fast ' +
  'placeholder:text-text-dim hover:border-border-hover focus:border-accent focus:bg-bg-card-solid ' +
  'disabled:opacity-60 disabled:cursor-not-allowed';

const NUMBER_INPUT =
  `${INPUT} [appearance:textfield] ` +
  '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold ' +
  'font-sans whitespace-nowrap cursor-pointer transition-all duration-fast ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const BUTTON_PRIMARY =
  `${BUTTON_BASE} border-0 bg-gradient-to-br from-accent to-accent-dark text-on-accent ` +
  'hover:from-accent-light hover:to-accent hover:-translate-y-px hover:shadow-glow-gold ' +
  'active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none ' +
  'motion-reduce:hover:translate-y-0';

const BUTTON_SECONDARY =
  `${BUTTON_BASE} bg-surface-secondary border border-solid border-border-medium text-text-main ` +
  'hover:bg-bg-icon-btn-hover hover:border-border-hover hover:text-accent';

const BUTTON_WARNING =
  `${BUTTON_BASE} bg-accent/10 border border-solid border-accent/30 text-accent ` +
  'hover:bg-accent/20 hover:border-accent/50';

const BUTTON_DANGER =
  `${BUTTON_BASE} bg-error/10 border border-solid border-error/30 text-error ` +
  'hover:bg-error/20 hover:border-error/50';

const FORM_CARD =
  'box-border flex flex-col gap-3 p-4 rounded-xl border border-solid border-border-light bg-bg-input';

const ROW =
  'box-border flex flex-col items-stretch gap-3 p-3.5 rounded-xl bg-bg-card ' +
  'border border-solid border-border-light transition-colors duration-fast ' +
  'hover:border-border-main md:flex-row md:items-center md:gap-4';

const HINT = 'm-0 text-xs text-text-dim';

const BACK_BUTTON =
  'inline-flex items-center gap-1.5 mb-4 p-0 bg-transparent border-0 font-sans ' +
  'text-xs font-bold text-text-muted whitespace-nowrap cursor-pointer ' +
  'transition-colors duration-fast hover:text-accent';

/**
 * Resolve the semantic badge classes for a derived user/payment status.
 * @param {string} status
 * @returns {string}
 */
const statusBadgeClass = (status) => {
  const base =
    'inline-flex items-center px-2.5 py-1 rounded-full border border-solid ' +
    'text-2xs font-bold capitalize whitespace-nowrap';
  if (status === 'enrolled' || status === 'approved') {
    return `${base} bg-success/10 text-success border-success/30`;
  }
  if (status === 'registered') {
    return `${base} bg-info/10 text-info border-info/30`;
  }
  if (status === 'banned' || status === 'rejected' || status === 'suspended') {
    return `${base} bg-error/10 text-error border-error/30`;
  }
  return `${base} bg-accent/10 text-accent border-accent/30`;
};

/**
 * Resolve tab button classes for the active/inactive state.
 * @param {boolean} isActive
 * @returns {string}
 */
const tabClass = (isActive) =>
  'flex items-center gap-1.5 px-4 py-2 rounded-md border border-solid text-sm ' +
  'font-semibold font-sans cursor-pointer transition-all duration-fast ' +
  (isActive
    ? 'text-accent bg-accent/10 border-accent/20'
    : 'text-text-dim border-transparent hover:text-text-main hover:bg-bg-ghost-hover');

/**
 * Normalize a detail payload into a single user object.
 * @param {*} payload
 * @returns {object|null}
 */
const normalizeUser = (payload) => {
  if (!payload) return null;
  if (Array.isArray(payload)) return normalizeUser(payload[0]);
  if (typeof payload !== 'object') return null;
  if (payload.user && typeof payload.user === 'object') {
    return normalizeUser(payload.user);
  }
  if (
    payload.data &&
    typeof payload.data === 'object' &&
    !Array.isArray(payload.data)
  ) {
    return normalizeUser(payload.data);
  }
  if (payload.rows && Array.isArray(payload.rows)) {
    return normalizeUser(payload.rows[0]);
  }
  if (payload.id && (payload.full_name || payload.name)) return payload;
  return null;
};

/**
 * Normalize a list payload into an array.
 * @param {*} payload
 * @returns {Array}
 */
const normalizeList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.rows)) return payload.rows;
  if (payload && payload.data && Array.isArray(payload.data)) {
    return payload.data;
  }
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

  /* i18n shorthands — guaranteed present by the LanguageContext merge */
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

  const toastRef = useRef(toast);
  toastRef.current = toast;
  const routerRef = useRef(router);
  routerRef.current = router;
  const godModeToastsRef = useRef(gt);
  godModeToastsRef.current = gt;

  const fetchUserDetail = useCallback(async () => {
    if (!id) return;

    const token = getItem('admin_token');
    if (!token) {
      routerRef.current.push('/admin/login');
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
        routerRef.current.push('/admin/login');
        return;
      } else {
        toastRef.current.error(
          userRes.reason?.response?.data?.message ||
            godModeToastsRef.current.loadError
        );
      }

      if (enrollRes.status === 'fulfilled') {
        setEnrollments(normalizeList(enrollRes.value?.data ?? enrollRes.value));
      }
      if (refRes.status === 'fulfilled') {
        setReferrals(normalizeList(refRes.value?.data ?? refRes.value));
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        routerRef.current.push('/admin/login');
      } else {
        toastRef.current.error(godModeToastsRef.current.loadError);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  /* ── Enrollment toggle ── */
  const handleStatusChange = async (nextStatus) => {
    const isEnroll = nextStatus === 'enrolled';
    const copyKey = isEnroll ? 'godmodeEnroll' : 'godmodeUnenroll';
    const copy = t.confirmations?.actions?.[copyKey] || {};

    const ok = await confirm({
      title: copy.title,
      message: copy.message,
      variant: isEnroll ? 'warning' : 'danger',
      confirmText: copy.confirmText,
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
      toast.error(err?.response?.data?.message || gt.statusFailed);
    } finally {
      setActionLoading(false);
    }
  };

  /* ── Impersonate ── */
  const handleImpersonate = async () => {
    const copy = t.confirmations?.actions?.godmodeImpersonate || {};
    const ok = await confirm({
      title: copy.title,
      message: copy.message,
      variant: 'warning',
      confirmText: copy.confirmText,
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
    const copy = t.confirmations?.actions?.godmodePasswordReset || {};
    const ok = await confirm({
      title: copy.title,
      message: copy.message,
      variant: 'warning',
      confirmText: copy.confirmText,
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
    if (!Number.isFinite(numeric) || numeric === 0) return;

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
          (gt.walletSuccessTemplate || '').replace(
            '{balance}',
            res.data?.newBalance ?? g.emDash
          )
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
    if (!Number.isFinite(numeric) || numeric <= 0) return;

    const unit = agentType === 'percentage' ? '%' : gw.currency;
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
    if (!dateString) return g.emDash;
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
        <SEOHead title={g.userDetailsTitle} />
        <AdminLayout title={g.userDetailsTitle} subtitle={g.loadingUser}>
          <div
            className="flex items-center justify-center py-20"
            aria-busy="true"
          >
            <div className="w-10 h-10 rounded-full border-2 border-solid border-border-medium border-t-accent animate-spin" />
          </div>
        </AdminLayout>
      </>
    );
  }

  /* ── Not found ── */
  if (!user) {
    return (
      <>
        <SEOHead title={g.userNotFoundTitle} />
        <AdminLayout
          title={g.userNotFoundTitle}
          subtitle={g.userNotFoundSubtitle}
        >
          <button
            type="button"
            className={BACK_BUTTON}
            onClick={() => router.push('/admin/users')}
          >
            <ArrowLeft size={16} />
            <span>{g.backToUsers}</span>
          </button>
        </AdminLayout>
      </>
    );
  }

  const displayName = user.full_name || user.name || g.unknownUser;
  const isEnrolled = user.is_enrolled === true;
  const isBanned = Boolean(user.banned_at);
  const headerStatus = isBanned
    ? 'banned'
    : isEnrolled
    ? 'enrolled'
    : 'registered';
  const headerStatusLabel = isBanned
    ? g.statusBanned
    : isEnrolled
    ? g.statusEnrolled
    : g.statusRegistered;

  return (
    <>
      <SEOHead title={`${displayName} — ${g.userDetailsTitle}`} />
      <AdminLayout title={displayName} subtitle={user.email || ''}>
        <button
          type="button"
          className={BACK_BUTTON}
          onClick={() => router.push('/admin/users')}
        >
          <ArrowLeft size={16} />
          <span>{g.backToUsers}</span>
        </button>

        {/* Header */}
        <div className={`${CARD} flex flex-wrap items-center gap-4 p-5`}>
          <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center text-3xl font-extrabold shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <h2 className="m-0 text-2xl font-extrabold text-text-main truncate">
              {displayName}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Mail size={14} /> {user.email || g.emDash}
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Phone size={14} /> {user.phone || g.notAvailable}
              </span>
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                <Calendar size={14} /> {g.joined} {formatDate(user.created_at)}
              </span>
              <span className={statusBadgeClass(headerStatus)}>
                {headerStatusLabel}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isEnrolled ? (
              <button
                type="button"
                className={BUTTON_DANGER}
                onClick={() => handleStatusChange('registered')}
                disabled={actionLoading}
              >
                <UserX size={16} />
                {g.unenroll}
              </button>
            ) : (
              <button
                type="button"
                className={BUTTON_PRIMARY}
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
        <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className={`${CARD} flex flex-col gap-1 p-5`}>
            <span className={STAT_LABEL}>{gs.directReferrals}</span>
            <span className={STAT_VALUE}>
              {formatAmount(user.direct_referral_count)}
            </span>
          </div>
          <div className={`${CARD} flex flex-col gap-1 p-5`}>
            <span className={STAT_LABEL}>{gs.teamSize}</span>
            <span className={STAT_VALUE}>
              {formatAmount(user.total_team_size)}
            </span>
          </div>
          <div className={`${CARD} flex flex-col gap-1 p-5`}>
            <span className={STAT_LABEL}>{gs.payingDirect}</span>
            <span className={STAT_VALUE}>
              {formatAmount(user.paying_direct_count)}
            </span>
          </div>
          <div className={`${CARD} flex flex-col gap-1 p-5`}>
            <span className={STAT_LABEL}>{gs.lifetimeEarned}</span>
            <span className={STAT_VALUE}>
              {formatAmount(user.lifetime_referral_earnings)} {gw.currency}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          className="flex flex-wrap gap-2 border-b border-solid border-border-light pb-3 mt-6 mb-4"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            className={tabClass(activeTab === 'overview')}
            onClick={() => setActiveTab('overview')}
          >
            {gTabs.overview}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'wallet'}
            className={tabClass(activeTab === 'wallet')}
            onClick={() => setActiveTab('wallet')}
          >
            <Wallet size={14} className="shrink-0" />
            {gTabs.walletAndAgent}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'godmode'}
            className={tabClass(activeTab === 'godmode')}
            onClick={() => setActiveTab('godmode')}
          >
            <ShieldAlert size={14} className="shrink-0" />
            {gTabs.godMode}
          </button>
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <>
            <section className="mt-6">
              <h3 className={SECTION_TITLE}>{gOv.enrollmentHistory}</h3>
              {enrollments.length === 0 ? (
                <p className="m-0 text-sm text-text-dim">{gOv.noEnrollments}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className={ROW}>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                          <CreditCard size={16} />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-base font-bold text-text-main truncate">
                            {enrollment.purchase_mode === 'full-course'
                              ? gOv.fullCoursePass
                              : gOv.phaseBundle}
                          </span>
                          <span className="text-xs text-text-muted truncate">
                            {formatAmount(enrollment.amount)} {gw.currency} ·{' '}
                            {enrollment.method || g.emDash} ·{' '}
                            {formatDate(
                              enrollment.paid_at || enrollment.created_at
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <span className={statusBadgeClass(enrollment.status)}>
                          {enrollment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-6">
              <h3 className={SECTION_TITLE}>{gOv.referralHistory}</h3>
              {referrals.length === 0 ? (
                <p className="m-0 text-sm text-text-dim">{gOv.noReferrals}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {referrals.map((referral) => (
                    <div key={referral.id} className={ROW}>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-info/10 text-info flex items-center justify-center text-base font-extrabold shrink-0">
                          {(referral.referred_name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-base font-bold text-text-main truncate">
                            {referral.referred_name || g.unknownUser}
                          </span>
                          <span className="text-xs text-text-muted truncate">
                            {referral.referred_email || g.emDash}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 md:justify-end">
                        <span className="inline-flex items-center gap-1.5 text-2xs text-text-dim">
                          <Users size={12} /> {formatDate(referral.created_at)}
                        </span>
                        <span
                          className={statusBadgeClass(
                            referral.referred_is_enrolled
                              ? 'enrolled'
                              : 'registered'
                          )}
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
            </section>
          </>
        )}

        {/* Wallet & Agent tab */}
        {activeTab === 'wallet' && (
          <>
            <section className="mt-6">
              <h3 className={SECTION_TITLE}>
                <Wallet size={16} className="shrink-0" />
                {gw.heading}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className={`${CARD} flex flex-col gap-1 p-5`}>
                  <span className={STAT_LABEL}>{gw.currentBalance}</span>
                  <span className={STAT_VALUE}>
                    {formatAmount(user.current_balance)} {gw.currency}
                  </span>
                </div>
                <div className={`${CARD} flex flex-col gap-1 p-5`}>
                  <span className={STAT_LABEL}>{gw.totalEarned}</span>
                  <span className={STAT_VALUE}>
                    {formatAmount(user.total_earned)} {gw.currency}
                  </span>
                </div>
                <div className={`${CARD} flex flex-col gap-1 p-5`}>
                  <span className={STAT_LABEL}>{gw.totalWithdrawn}</span>
                  <span className={STAT_VALUE}>
                    {formatAmount(user.total_withdrawn)} {gw.currency}
                  </span>
                </div>
                <div className={`${CARD} flex flex-col gap-1 p-5`}>
                  <span className={STAT_LABEL}>{gw.pendingWithdrawal}</span>
                  <span className={STAT_VALUE}>
                    {formatAmount(user.pending_withdrawal)} {gw.currency}
                  </span>
                </div>
              </div>

              <form onSubmit={handleWalletAdjust} className={`${FORM_CARD} mt-6`}>
                <h4 className="m-0 text-base font-bold text-text-main">
                  {gw.manualAdjustment}
                </h4>
                <p className={HINT}>{gw.adjustmentHint}</p>
                <input
                  type="number"
                  step="0.01"
                  placeholder={gw.amountPlaceholder}
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                  className={NUMBER_INPUT}
                  required
                />
                <input
                  type="text"
                  placeholder={gw.reasonPlaceholder}
                  value={walletReason}
                  onChange={(e) => setWalletReason(e.target.value)}
                  className={INPUT}
                  required
                  minLength={5}
                  maxLength={500}
                />
                <button
                  type="submit"
                  className={BUTTON_PRIMARY}
                  disabled={actionLoading}
                >
                  {actionLoading ? gw.applying : gw.applyAdjustment}
                </button>
              </form>
            </section>

            <section className="mt-6">
              <h3 className={SECTION_TITLE}>
                <Briefcase size={16} className="shrink-0" />
                {ga.heading}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className={`${CARD} flex flex-col gap-1 p-5`}>
                  <span className={STAT_LABEL}>{ga.agentCode}</span>
                  <span className={`${STAT_VALUE} font-mono`}>
                    {user.agent_code || g.emDash}
                  </span>
                </div>
                <div className={`${CARD} flex flex-col gap-1 p-5`}>
                  <span className={STAT_LABEL}>{ga.commissionType}</span>
                  <span className={STAT_VALUE}>
                    {user.commission_type === 'percentage'
                      ? ga.percentageType
                      : ga.fixedType}
                  </span>
                </div>
                <div className={`${CARD} flex flex-col gap-1 p-5`}>
                  <span className={STAT_LABEL}>{ga.commissionValue}</span>
                  <span className={STAT_VALUE}>
                    {formatAmount(user.commission_value)}{' '}
                    {user.commission_type === 'percentage' ? '%' : gw.currency}
                  </span>
                </div>
                <div className={`${CARD} flex flex-col gap-1 p-5`}>
                  <span className={STAT_LABEL}>{ga.agentActive}</span>
                  <span className={STAT_VALUE}>
                    {user.agent_settings_active === false ? ga.no : ga.yes}
                  </span>
                </div>
              </div>

              <form onSubmit={handleAgentOverride} className={`${FORM_CARD} mt-6`}>
                <h4 className="m-0 text-base font-bold text-text-main">
                  {ga.overrideHeading}
                </h4>
                <select
                  value={agentType}
                  onChange={(e) => setAgentType(e.target.value)}
                  className={`${INPUT} cursor-pointer`}
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
                  className={NUMBER_INPUT}
                  required
                />
                <button
                  type="submit"
                  className={BUTTON_PRIMARY}
                  disabled={actionLoading}
                >
                  {actionLoading ? ga.applying : ga.overrideRate}
                </button>
              </form>
            </section>
          </>
        )}

        {/* God Mode tab */}
        {activeTab === 'godmode' && (
          <>
            <section className="mt-6">
              <h3 className={SECTION_TITLE}>
                <ShieldAlert size={16} className="shrink-0" />
                {gi.heading}
              </h3>
              <p className={`${HINT} mb-3`}>{gi.hint}</p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className={BUTTON_PRIMARY}
                  onClick={handleImpersonate}
                  disabled={actionLoading}
                >
                  <LinkIcon size={14} className="shrink-0" />
                  {gi.generateLink}
                </button>
                <button
                  type="button"
                  className={BUTTON_SECONDARY}
                  onClick={handleForcePasswordReset}
                  disabled={actionLoading}
                >
                  <Key size={14} className="shrink-0" />
                  {gi.generateReset}
                </button>
              </div>
            </section>

            <section className="mt-6">
              <h3 className={SECTION_TITLE}>{gm.heading}</h3>
              <p className={`${HINT} mb-3`}>{gm.hint}</p>
              <form onSubmit={handleManualEnroll} className={FORM_CARD}>
                <input
                  type="text"
                  placeholder={gm.reasonPlaceholder}
                  value={manualEnrollReason}
                  onChange={(e) => setManualEnrollReason(e.target.value)}
                  className={INPUT}
                  required
                  minLength={5}
                  maxLength={500}
                />
                <button
                  type="submit"
                  className={BUTTON_PRIMARY}
                  disabled={actionLoading}
                >
                  {actionLoading ? gm.enrolling : gm.button}
                </button>
              </form>
            </section>

            <section className="mt-6">
              <h3 className={SECTION_TITLE}>{gn.heading}</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className={BUTTON_WARNING}
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
                  className="box-border mt-6 flex flex-col gap-3 p-4 rounded-xl bg-error/5 border border-solid border-error/20"
                >
                  <h4 className="m-0 text-base font-bold text-error">
                    {gb.heading}
                  </h4>
                  <p className={HINT}>{gb.hint}</p>
                  <input
                    type="text"
                    placeholder={gb.reasonPlaceholder}
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    className={INPUT}
                    required
                    minLength={5}
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    className={BUTTON_DANGER}
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
                  className="box-border mt-6 flex flex-col gap-3 p-4 rounded-xl bg-accent/5 border border-solid border-accent/25"
                >
                  <h4 className="m-0 flex items-center gap-2 text-base font-bold text-accent">
                    <ShieldCheck size={16} className="shrink-0" />
                    {gu.heading}
                  </h4>
                  <p className={HINT}>
                    {(gu.bannedOnTemplate || '')
                      .replace('{date}', formatDate(user.banned_at))
                      .replace('{reason}', user.banned_reason || gu.noReason)}
                  </p>
                  <p className={HINT}>{gu.hint}</p>
                  <input
                    type="text"
                    placeholder={gu.notePlaceholder}
                    value={unbanNote}
                    onChange={(e) => setUnbanNote(e.target.value)}
                    className={INPUT}
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    className={BUTTON_WARNING}
                    disabled={actionLoading}
                  >
                    <ShieldCheck size={14} className="shrink-0" />
                    {actionLoading ? gu.unbanning : gu.button}
                  </button>
                </form>
              )}
            </section>
          </>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminUserDetailPage;