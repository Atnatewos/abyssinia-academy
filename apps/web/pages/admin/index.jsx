// /**
//  * @fileoverview Admin Dashboard
//  *
//  * Reads `/api/admin/dashboard/stats` (stat cards + embedded leaderboard),
//  * `/api/admin/payments` (recent pending queue), and
//  * `/api/admin/referrals/top` (leaderboard panel).
//  *
//  * Data fetching runs exactly once per mount. Toast and router identities
//  * are accessed through refs so context re-renders never retrigger the
//  * effect (an unstable dependency here previously caused an infinite
//  * fetch → toast → re-render loop).
//  *
//  * Path: apps/web/pages/admin/index.jsx
//  */

// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/router';
// import Link from 'next/link';
// import {
//   Users,
//   DollarSign,
//   BookOpen,
//   TrendingUp,
//   Award,
//   Eye,
// } from 'lucide-react';
// import SEOHead from '../../components/shared/SEOHead';
// import AdminLayout from '../../components/admin/AdminLayout';
// import { useLanguage } from '../../context/LanguageContext';
// import { useToast } from '../../context/ToastContext';
// import apiClient from '../../lib/api';

// const AdminDashboard = () => {
//   const router = useRouter();
//   const { t } = useLanguage();
//   const toast = useToast();

//   const [stats, setStats] = useState(null);
//   const [recentPayments, setRecentPayments] = useState([]);
//   const [topReferrers, setTopReferrers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const toastRef = useRef(toast);
//   toastRef.current = toast;
//   const routerRef = useRef(router);
//   routerRef.current = router;

//   useEffect(() => {
//     let cancelled = false;

//     const fetchDashboard = async () => {
//       const [statsRes, paymentsRes, referrersRes] = await Promise.allSettled([
//         apiClient.get('/admin/dashboard/stats'),
//         apiClient.get('/admin/payments?limit=5&status=pending'),
//         apiClient.get('/admin/referrals/top?limit=5'),
//       ]);

//       if (cancelled) return;

//       const unauthorized = [statsRes, paymentsRes, referrersRes].some(
//         (result) =>
//           result.status === 'rejected' &&
//           result.reason?.response?.status === 401
//       );
//       if (unauthorized) {
//         routerRef.current.push('/admin/login');
//         return;
//       }

//       if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
//         setStats(statsRes.value.data);
//       }
//       if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.success) {
//         setRecentPayments(paymentsRes.value.data || []);
//       }
//       if (referrersRes.status === 'fulfilled' && referrersRes.value?.success) {
//         setTopReferrers(referrersRes.value.data || []);
//       }

//       const anyFailed = [statsRes, paymentsRes, referrersRes].some(
//         (result) => result.status === 'rejected'
//       );
//       if (anyFailed) {
//         toastRef.current.error('Failed to load dashboard data.');
//       }

//       setLoading(false);
//     };

//     fetchDashboard();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   /**
//    * Formats an ISO date string for the recent payments list.
//    * @param {string} dateString
//    * @returns {string}
//    */
//   const formatDate = (dateString) => {
//     if (!dateString) return '—';
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//     });
//   };

//   if (loading) {
//     return (
//       <>
//         <SEOHead title="Admin Dashboard" />
//         <AdminLayout
//           title={t.admin?.dashboard || 'Dashboard'}
//           subtitle="Platform overview and key metrics"
//         >
//           <div className="admin-dashboard">
//             <div className="admin-stats-grid">
//               {Array.from({ length: 4 }).map((_, index) => (
//                 <div key={index} className="admin-stat-card">
//                   <div
//                     className="admin-stat-icon shimmer"
//                     style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem' }}
//                   />
//                   <div
//                     className="admin-stat-label shimmer"
//                     style={{ width: '5rem', height: '0.75rem' }}
//                   />
//                   <div
//                     className="admin-stat-value shimmer"
//                     style={{ width: '4rem', height: '1.5rem' }}
//                   />
//                 </div>
//               ))}
//             </div>
//             <div className="admin-dashboard-bottom">
//               {Array.from({ length: 2 }).map((_, sectionIndex) => (
//                 <div key={sectionIndex} className="admin-recent-section">
//                   <div className="admin-section-header">
//                     <span className="shimmer" style={{ width: '10rem', height: '1rem' }} />
//                     <span className="shimmer" style={{ width: '4rem', height: '0.75rem' }} />
//                   </div>
//                   {Array.from({ length: 4 }).map((_, index) => (
//                     <div key={index} className="admin-recent-item">
//                       <div className="admin-recent-info">
//                         <span
//                           className="shimmer"
//                           style={{
//                             width: '8rem',
//                             height: '0.875rem',
//                             marginBottom: '0.25rem',
//                           }}
//                         />
//                         <span className="shimmer" style={{ width: '6rem', height: '0.625rem' }} />
//                       </div>
//                       <span className="shimmer" style={{ width: '3rem', height: '0.875rem' }} />
//                     </div>
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </AdminLayout>
//       </>
//     );
//   }

//   return (
//     <>
//       <SEOHead title="Admin Dashboard" />
//       <AdminLayout
//         title={t.admin?.dashboard || 'Dashboard'}
//         subtitle="Platform overview and key metrics"
//       >
//         <div className="admin-dashboard">
//           <div className="admin-stats-grid">
//             <div className="admin-stat-card">
//               <div
//                 className="admin-stat-icon"
//                 style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}
//               >
//                 <Users size={24} />
//               </div>
//               <div className="admin-stat-label">
//                 {t.admin?.totalStudents || 'Total Students'}
//               </div>
//               <div className="admin-stat-value">
//                 {stats?.total_students?.toLocaleString() || '0'}
//               </div>
//             </div>
//             <div className="admin-stat-card">
//               <div
//                 className="admin-stat-icon"
//                 style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}
//               >
//                 <DollarSign size={24} />
//               </div>
//               <div className="admin-stat-label">
//                 {t.admin?.totalRevenue || 'Total Revenue'}
//               </div>
//               <div className="admin-stat-value">
//                 {Number(stats?.total_revenue || 0).toLocaleString()} ETB
//               </div>
//             </div>
//             <div className="admin-stat-card">
//               <div
//                 className="admin-stat-icon"
//                 style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}
//               >
//                 <BookOpen size={24} />
//               </div>
//               <div className="admin-stat-label">
//                 {t.admin?.totalCourses || 'Active Courses'}
//               </div>
//               <div className="admin-stat-value">
//                 {stats?.total_courses?.toLocaleString() || '0'}
//               </div>
//             </div>
//             <div className="admin-stat-card">
//               <div
//                 className="admin-stat-icon"
//                 style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}
//               >
//                 <TrendingUp size={24} />
//               </div>
//               <div className="admin-stat-label">
//                 {t.admin?.pendingPayments || 'Pending Payments'}
//               </div>
//               <div className="admin-stat-value">
//                 {stats?.pending_payments?.toLocaleString() || '0'}
//               </div>
//             </div>
//           </div>

//           <div className="admin-dashboard-bottom">
//             <div className="admin-recent-section">
//               <div className="admin-section-header">
//                 <h3 className="admin-section-title">Recent Pending Payments</h3>
//                 <Link href="/admin/payments" className="admin-section-link">
//                   View All →
//                 </Link>
//               </div>
//               {recentPayments.length === 0 ? (
//                 <p className="admin-section-empty">No pending payments</p>
//               ) : (
//                 <div className="admin-recent-list">
//                   {recentPayments.map((payment) => (
//                     <div key={payment.id} className="admin-recent-item">
//                       <div className="admin-recent-info">
//                         <span className="admin-recent-name">
//                           {payment.user_name || payment.full_name || 'Student'}
//                         </span>
//                         <span className="admin-recent-meta">
//                           {payment.method || '—'} · {formatDate(payment.created_at)}
//                         </span>
//                       </div>
//                       <div className="admin-recent-actions">
//                         <span className="admin-recent-amount">
//                           {Number(payment.amount || 0).toLocaleString()} ETB
//                         </span>
//                         <Link
//                           href={`/admin/payments?id=${payment.id}`}
//                           className="admin-recent-view"
//                         >
//                           <Eye size={14} />
//                         </Link>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="admin-recent-section">
//               <div className="admin-section-header">
//                 <h3 className="admin-section-title">Top Referrers</h3>
//                 <Link href="/admin/referrals" className="admin-section-link">
//                   View All →
//                 </Link>
//               </div>
//               {topReferrers.length === 0 ? (
//                 <p className="admin-section-empty">No referrer data yet</p>
//               ) : (
//                 <div className="admin-recent-list">
//                   {topReferrers.map((referrer) => (
//                     <div key={referrer.id} className="admin-recent-item">
//                       <div className="admin-recent-info">
//                         <span className="admin-recent-name">
//                           {referrer.name || referrer.full_name || 'Unknown'}
//                         </span>
//                         <span className="admin-recent-meta">
//                           {referrer.direct_referral_count ||
//                             referrer.referral_count ||
//                             0}{' '}
//                           referrals
//                         </span>
//                       </div>
//                       <div className="admin-recent-actions">
//                         <span className="admin-recent-amount">
//                           <Award size={14} style={{ color: '#f59e0b' }} />{' '}
//                           {Number(
//                             referrer.total_earned ||
//                               referrer.lifetime_referral_earnings ||
//                               0
//                           ).toLocaleString()}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </AdminLayout>
//     </>
//   );
// };

// export default AdminDashboard;













/**
 * @fileoverview Admin Dashboard
 *
 * Platform overview built entirely on the shared admin UI primitives.
 * Three independent queries (stats, pending queue, leaderboard) run
 * through useAdminQuery, so each panel degrades gracefully when one
 * endpoint fails and none can trigger a refetch loop.
 *
 * All copy resolves from admin.dashboard.* / admin.common.*; every
 * visual value flows through the Tailwind token bridge.
 *
 * Path: apps/web/pages/admin/index.jsx
 */

import Link from 'next/link';
import {
  Users,
  DollarSign,
  BookOpen,
  Clock,
  Award,
  Eye,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import AdminLayout from '../../components/admin/AdminLayout';
import { AdminStatCard } from '../../components/admin/ui/AdminCard';
import AdminCard from '../../components/admin/ui/AdminCard';
import AdminEmptyState from '../../components/admin/ui/AdminEmptyState';
import { AdminStatSkeleton, AdminRowSkeleton } from '../../components/admin/ui/AdminSkeleton';
import { useLanguage } from '../../context/LanguageContext';
import useAdminQuery from '../../lib/admin/useAdminQuery';
import { resolveLabel, interpolate } from '../../lib/admin/labels';

/** Number of rows shown in each dashboard panel. */
const PANEL_LIMIT = 5;

/**
 * Format an ISO date for compact dashboard display.
 * @param {string} value
 * @param {string} fallback
 * @returns {string}
 */
const formatDate = (value, fallback) => {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const AdminDashboard = () => {
  const { t } = useLanguage();

  const label = (key) => resolveLabel(t, key);
  const emDash = label('admin.common.labels.emDash');
  const currency = label('admin.common.labels.currency');

  const { data: stats, loading: statsLoading } = useAdminQuery({
    url: '/admin/dashboard/stats',
    errorKey: 'admin.dashboard.loadFailed',
  });

  const { data: recentPayments, loading: paymentsLoading } = useAdminQuery({
    url: `/admin/payments?limit=${PANEL_LIMIT}&status=pending`,
    initialData: [],
    errorKey: 'admin.dashboard.loadFailed',
    silent: true,
  });

  const { data: topReferrers, loading: referrersLoading } = useAdminQuery({
    url: `/admin/referrals/top?limit=${PANEL_LIMIT}`,
    initialData: [],
    errorKey: 'admin.dashboard.loadFailed',
    silent: true,
  });

  const statCards = [
    {
      id: 'students',
      icon: Users,
      tone: 'info',
      label: label('admin.dashboard.stats.totalStudents'),
      value: Number(stats?.total_students || 0).toLocaleString(),
    },
    {
      id: 'revenue',
      icon: DollarSign,
      tone: 'success',
      label: label('admin.dashboard.stats.totalRevenue'),
      value: `${Number(stats?.total_revenue || 0).toLocaleString()} ${currency}`,
    },
    {
      id: 'courses',
      icon: BookOpen,
      tone: 'accent',
      label: label('admin.dashboard.stats.activeCourses'),
      value: Number(stats?.total_courses || 0).toLocaleString(),
    },
    {
      id: 'pending',
      icon: Clock,
      tone: 'warning',
      label: label('admin.dashboard.stats.pendingPayments'),
      value: Number(stats?.pending_payments || 0).toLocaleString(),
    },
  ];

  /**
   * Panel header: title + "View All" link.
   */
  const PanelHeader = ({ title, href }) => (
    <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-solid border-border-light">
      <h3 className="m-0 text-base font-extrabold text-text-main">{title}</h3>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs font-bold text-accent no-underline hover:text-accent-light transition-colors duration-fast whitespace-nowrap"
      >
        {label('admin.dashboard.viewAll')}
        <ArrowRight size={13} aria-hidden="true" />
      </Link>
    </div>
  );

  return (
    <>
      <SEOHead title={label('admin.dashboard.title')} />
      <AdminLayout
        title={label('admin.dashboard.title')}
        subtitle={label('admin.dashboard.subtitle')}
      >
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <AdminStatSkeleton key={`stat-skeleton-${i}`} />
              ))
            : statCards.map((card) => (
                <AdminStatCard
                  key={card.id}
                  icon={card.icon}
                  tone={card.tone}
                  label={card.label}
                  value={card.value}
                />
              ))}
        </div>

        {/* Panels */}
        <div className="grid grid-cols-1 gap-5 mt-6 lg:grid-cols-2">
          {/* Recent pending payments */}
          <AdminCard className="p-5">
            <PanelHeader
              title={label('admin.dashboard.recentPayments')}
              href="/admin/payments"
            />
            {paymentsLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: PANEL_LIMIT }).map((_, i) => (
                  <AdminRowSkeleton key={`payment-skeleton-${i}`} />
                ))}
              </div>
            ) : (recentPayments || []).length === 0 ? (
              <AdminEmptyState
                icon={CreditCard}
                title={label('admin.dashboard.noPendingPayments')}
                className="py-10 border-0 bg-transparent"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {(recentPayments || []).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-bg-input border border-solid border-border-light"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-bold text-text-main truncate">
                        {payment.user_name || payment.full_name || emDash}
                      </span>
                      <span className="text-2xs text-text-dim truncate">
                        {payment.method || emDash} ·{' '}
                        {formatDate(payment.created_at, emDash)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-sm font-extrabold text-accent whitespace-nowrap">
                        {Number(payment.amount || 0).toLocaleString()} {currency}
                      </span>
                      <Link
                        href={`/admin/payments?id=${payment.id}`}
                        aria-label={label('admin.payments.viewDetails')}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-info/10 text-info hover:bg-info/20 transition-colors duration-fast"
                      >
                        <Eye size={14} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>

          {/* Top referrers */}
          <AdminCard className="p-5">
            <PanelHeader
              title={label('admin.dashboard.topReferrers')}
              href="/admin/referrals"
            />
            {referrersLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: PANEL_LIMIT }).map((_, i) => (
                  <AdminRowSkeleton key={`referrer-skeleton-${i}`} />
                ))}
              </div>
            ) : (topReferrers || []).length === 0 ? (
              <AdminEmptyState
                icon={Award}
                title={label('admin.dashboard.noReferrers')}
                className="py-10 border-0 bg-transparent"
              />
            ) : (
              <div className="flex flex-col gap-2">
                {(topReferrers || []).map((referrer, index) => (
                  <div
                    key={referrer.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-bg-input border border-solid border-border-light"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 shrink-0 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-xs font-extrabold">
                        {index + 1}
                      </span>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-bold text-text-main truncate">
                          {referrer.name || referrer.full_name || emDash}
                        </span>
                        <span className="text-2xs text-text-dim truncate">
                          {interpolate(label('admin.dashboard.referralsCount'), {
                            count:
                              referrer.referral_count ??
                              referrer.direct_referral_count ??
                              0,
                          })}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-success whitespace-nowrap shrink-0">
                      <Award size={14} className="text-accent" aria-hidden="true" />
                      {Number(
                        referrer.total_earned ??
                          referrer.lifetime_referral_earnings ??
                          0
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;