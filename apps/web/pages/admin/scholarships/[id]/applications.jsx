// /**
//  * @fileoverview Admin Scholarship Applications — Review Queue
//  *
//  * Per-campaign review queue with:
//  *   - Sticky campaign hero (cover, grant chips, quota progress)
//  *   - Filter tabs with live counts derived from the campaign's stats
//  *   - Debounced search across applicant name / phone / email
//  *   - Application cards showing uploaded-document count
//  *   - Pagination
//  *
//  * Design system compliance:
//  *   - Design tokens only (bg-bg-card-solid, text-text-main, border-border-light)
//  *   - No raw palette, no dark: variants
//  *   - Skeleton rows during load, staggered entrance on cards
//  *   - All strings via t.scholarships.admin.* and t.scholarships.statusLabel.*
//  *
//  * Path: apps/web/pages/admin/scholarships/[id]/applications.jsx
//  */

// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useRouter } from 'next/router';
// import {
//   Search,
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   ChevronRightCircle,
//   GraduationCap,
//   Award,
//   Gift,
//   Users,
//   Calendar,
//   Clock,
//   CheckCircle2,
//   XCircle,
//   Ban,
//   FileCheck,
// } from 'lucide-react';
// import SEOHead from '../../../../components/shared/SEOHead';
// import AdminLayout from '../../../../components/admin/AdminLayout';
// import ApplicationDetailModal from '../../../../components/admin/scholarships/ApplicationDetailModal';
// import { SkeletonBase, SkeletonWrapper } from '../../../../components/shared/Skeleton';
// import { useLanguage } from '../../../../context/LanguageContext';
// import { useToast } from '../../../../context/ToastContext';
// import apiClient from '../../../../lib/api';
// import { getItem } from '../../../../lib/storage';

// /* ============================================================================
//  * STATUS META
//  * ==========================================================================
//  * Each entry supplies the i18n key path to resolve the display label so
//  * the UI never renders a raw status string. Falls back to a hardcoded
//  * English label when the key is missing.
//  * ========================================================================== */

// const STATUS_META = {
//   pending: {
//     labelKey: 'pending',
//     fallbackLabel: 'Pending',
//     bg: 'rgba(245,158,11,0.12)',
//     fg: '#f59e0b',
//     border: 'rgba(245,158,11,0.35)',
//     Icon: Clock,
//   },
//   pending_payment: {
//     labelKey: 'pendingPayment',
//     fallbackLabel: 'Awaiting Payment',
//     bg: 'rgba(59,130,246,0.12)',
//     fg: '#3b82f6',
//     border: 'rgba(59,130,246,0.35)',
//     Icon: Calendar,
//   },
//   approved: {
//     labelKey: 'approved',
//     fallbackLabel: 'Approved',
//     bg: 'rgba(16,185,129,0.12)',
//     fg: '#10b981',
//     border: 'rgba(16,185,129,0.35)',
//     Icon: CheckCircle2,
//   },
//   rejected: {
//     labelKey: 'rejected',
//     fallbackLabel: 'Rejected',
//     bg: 'rgba(239,68,68,0.12)',
//     fg: '#ef4444',
//     border: 'rgba(239,68,68,0.35)',
//     Icon: XCircle,
//   },
//   withdrawn: {
//     labelKey: 'withdrawn',
//     fallbackLabel: 'Withdrawn',
//     bg: 'var(--surface-secondary)',
//     fg: 'var(--text-dim)',
//     border: 'var(--border-light)',
//     Icon: XCircle,
//   },
//   revoked: {
//     labelKey: 'revoked',
//     fallbackLabel: 'Revoked',
//     bg: 'rgba(239,68,68,0.12)',
//     fg: '#ef4444',
//     border: 'rgba(239,68,68,0.35)',
//     Icon: Ban,
//   },
// };

// /**
//  * Resolve the localized label for a status code.
//  * @param {object} t - Translation tree
//  * @param {string} status
//  * @returns {string}
//  */
// const statusLabelFor = (t, status) => {
//   const meta = STATUS_META[status];
//   if (!meta) return status;
//   return t.scholarships?.statusLabel?.[meta.labelKey] || meta.fallbackLabel;
// };

// const formatDate = (value) => {
//   if (!value) return '—';
//   try {
//     return new Date(value).toLocaleDateString(undefined, {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   } catch {
//     return '—';
//   }
// };

// /* ============================================================================
//  * SKELETON
//  * ========================================================================== */

// const ApplicationRowSkeleton = () => (
//   <SkeletonWrapper className="grid grid-cols-1 gap-3">
//     {[0, 1, 2, 3].map((i) => (
//       <div
//         key={i}
//         className="rounded-xl border border-border-light bg-bg-card-solid p-4 flex items-center gap-3"
//       >
//         <SkeletonBase style={{ height: '2.5rem', width: '2.5rem', borderRadius: '9999px' }} />
//         <div className="flex-1 flex flex-col gap-1.5">
//           <SkeletonBase className="skeleton-line skeleton-line-medium" />
//           <SkeletonBase className="skeleton-line skeleton-line-short" />
//         </div>
//         <SkeletonBase style={{ height: '1.5rem', width: '5rem', borderRadius: '9999px' }} />
//       </div>
//     ))}
//   </SkeletonWrapper>
// );

// /* ============================================================================
//  * CAMPAIGN HERO
//  * ========================================================================== */

// const CampaignHero = ({ campaign }) => {
//   const { t } = useLanguage();
//   if (!campaign) return null;

//   const quotaPct =
//     campaign.quota > 0
//       ? Math.min(
//           100,
//           Math.round(((campaign.approved_count || 0) / campaign.quota) * 100)
//         )
//       : 0;
//   const remaining = Math.max(
//     0,
//     (campaign.quota || 0) - (campaign.approved_count || 0)
//   );
//   const fee = Number(campaign.registration_fee_etb) || 0;
//   const phases = Array.isArray(campaign.grants_phases)
//     ? campaign.grants_phases
//     : [];
//   const requiredDocs = Array.isArray(campaign.required_documents)
//     ? campaign.required_documents
//     : [];

//   return (
//     <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 via-bg-card-solid to-bg-card-solid mb-5 animate-fade-in-up">
//       {campaign.cover_image_url && (
//         <>
//           <img
//             src={campaign.cover_image_url}
//             alt=""
//             aria-hidden="true"
//             className="absolute inset-0 w-full h-full object-cover opacity-20"
//           />
//           <div
//             aria-hidden="true"
//             className="absolute inset-0 bg-gradient-to-r from-bg-card-solid/95 via-bg-card-solid/85 to-bg-card-solid/70"
//           />
//         </>
//       )}
//       <div className="relative p-5 flex flex-col gap-3">
//         <div className="flex items-center gap-3 flex-wrap">
//           <div className="w-12 h-12 rounded-xl bg-accent text-text-inverse flex items-center justify-center shadow-glow-gold-sm">
//             <GraduationCap size={22} />
//           </div>
//           <div className="flex-1 min-w-0">
//             <h2 className="text-lg font-extrabold text-text-main leading-tight truncate">
//               {campaign.name}
//             </h2>
//             <p className="text-2xs text-text-dim mt-0.5 truncate">
//               /{campaign.slug}
//             </p>
//           </div>
//         </div>

//         <div className="flex flex-wrap gap-1.5">
//           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-2xs font-bold border border-accent/30">
//             <Award size={9} />
//             {campaign.grants_full_course
//               ? t.scholarships?.card?.fullCourse || 'Full Course Access'
//               : (t.scholarships?.card?.phases || '{count} phase(s)').replace(
//                   '{count}',
//                   String(phases.length)
//                 )}
//           </span>
//           <span
//             className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold border ${
//               fee > 0
//                 ? 'bg-warning/10 text-warning border-warning/30'
//                 : 'bg-success/10 text-success border-success/30'
//             }`}
//           >
//             <Gift size={9} />
//             {fee > 0
//               ? (t.scholarships?.card?.registrationFee || '{amount} ETB fee').replace(
//                   '{amount}',
//                   fee.toLocaleString()
//                 )
//               : t.scholarships?.card?.registrationFree || 'Free'}
//           </span>
//           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-pill text-text-muted text-2xs font-bold border border-border-medium">
//             <Users size={9} />
//             {campaign.approved_count || 0} / {campaign.quota || 0} approved ·{' '}
//             {remaining} left
//           </span>
//           {requiredDocs.length > 0 && (
//             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-info/10 text-info text-2xs font-bold border border-info/30">
//               <FileCheck size={9} />
//               {requiredDocs.length} doc{requiredDocs.length === 1 ? '' : 's'} required
//             </span>
//           )}
//         </div>

//         {campaign.quota > 0 && (
//           <div className="h-1.5 rounded-full bg-bg-input border border-border-light overflow-hidden max-w-md">
//             <div
//               className={`h-full rounded-full transition-all duration-700 ${
//                 quotaPct >= 90
//                   ? 'bg-gradient-to-r from-warning to-error'
//                   : 'bg-gradient-to-r from-accent to-accent-light'
//               }`}
//               style={{ width: `${quotaPct}%` }}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// /* ============================================================================
//  * APPLICATION ROW
//  * ========================================================================== */

// const ApplicationRow = ({ application, onClick, index }) => {
//   const { t } = useLanguage();
//   const meta = STATUS_META[application.status] || STATUS_META.pending;
//   const { Icon } = meta;

//   const docCount = Array.isArray(application.documents)
//     ? application.documents.length
//     : 0;

//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className="w-full text-left rounded-xl border border-border-light bg-bg-card-solid p-4
//                  flex items-center gap-3 hover:border-accent/40 hover:bg-bg-card-hover
//                  transition-all duration-200 group animate-fade-in-up"
//       style={{ animationDelay: `${index * 40}ms` }}
//     >
//       <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-extrabold text-sm shrink-0">
//         {(application.applicant_name || 'A').charAt(0).toUpperCase()}
//       </div>
//       <div className="flex-1 min-w-0">
//         <p className="text-sm font-bold text-text-main truncate">
//           {application.applicant_name || 'Unknown'}
//         </p>
//         <p className="text-2xs text-text-dim truncate">
//           {application.applicant_phone || '—'}
//           {application.applicant_email ? ` · ${application.applicant_email}` : ''}
//         </p>
//         <p className="text-2xs text-text-dim mt-0.5 inline-flex items-center gap-2 flex-wrap">
//           <span>
//             {t.scholarships?.admin?.appliedColumn || 'Applied'}{' '}
//             {formatDate(application.created_at)}
//           </span>
//           {docCount > 0 && (
//             <span className="inline-flex items-center gap-1 text-info">
//               <FileCheck size={9} />
//               {docCount} doc{docCount === 1 ? '' : 's'}
//             </span>
//           )}
//         </p>
//       </div>
//       <span
//         className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wider border shrink-0"
//         style={{ background: meta.bg, color: meta.fg, borderColor: meta.border }}
//       >
//         <Icon size={10} />
//         {statusLabelFor(t, application.status)}
//       </span>
//       <ChevronRightCircle
//         size={20}
//         className="text-text-dim group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0"
//       />
//     </button>
//   );
// };

// /* ============================================================================
//  * PAGE
//  * ========================================================================== */

// const AdminCampaignApplicationsPage = () => {
//   const router = useRouter();
//   const { t } = useLanguage();
//   const toast = useToast();
//   const campaignId = router.query.id;

//   const [campaign, setCampaign] = useState(null);
//   const [stats, setStats] = useState(null);
//   const [applications, setApplications] = useState([]);
//   const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
//   const [loading, setLoading] = useState(true);
//   const [statusTab, setStatusTab] = useState('pending');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedAppId, setSelectedAppId] = useState(null);
//   const [detailOpen, setDetailOpen] = useState(false);

//   const fetchCampaign = useCallback(async () => {
//     if (!campaignId) return;
//     try {
//       const response = await apiClient.get(`/admin/scholarships/${campaignId}`);
//       if (response?.success) {
//         setCampaign(response.data?.campaign);
//         setStats(response.data?.stats || null);
//       }
//     } catch (error) {
//       if (error?.response?.status === 401) router.push('/admin/login');
//       else if (error?.response?.status === 404) {
//         toast.error('Campaign not found.');
//         router.push('/admin/scholarships');
//       }
//     }
//   }, [campaignId, router, toast]);

//   const fetchApplications = useCallback(
//     async (page = 1) => {
//       if (!campaignId) return;
//       setLoading(true);
//       try {
//         const params = new URLSearchParams({
//           status: statusTab,
//           page: String(page),
//           pageSize: '25',
//         });
//         if (searchTerm) params.set('q', searchTerm);

//         const response = await apiClient.get(
//           `/admin/scholarships/${campaignId}/applications?${params.toString()}`
//         );
//         if (response?.success) {
//           setApplications(response.data?.applications || []);
//           const meta = response.meta || {};
//           setPagination({
//             page: meta.page || 1,
//             totalPages: meta.totalPages || 1,
//             total: meta.total || 0,
//           });
//         }
//       } catch (error) {
//         if (error?.response?.status === 401) router.push('/admin/login');
//       } finally {
//         setLoading(false);
//       }
//     },
//     [campaignId, statusTab, searchTerm, router]
//   );

//   useEffect(() => {
//     const token = getItem('admin_token');
//     if (!token) {
//       router.push('/admin/login');
//       return;
//     }
//     if (!campaignId) return;
//     fetchCampaign();
//   }, [campaignId, fetchCampaign, router]);

//   useEffect(() => {
//     if (!campaignId) return;
//     const handle = setTimeout(() => fetchApplications(1), 300);
//     return () => clearTimeout(handle);
//   }, [statusTab, searchTerm, campaignId, fetchApplications]);

//   const openDetail = (appId) => {
//     setSelectedAppId(appId);
//     setDetailOpen(true);
//   };

//   const handleDetailClose = () => {
//     setDetailOpen(false);
//     setSelectedAppId(null);
//   };

//   const handleDetailUpdated = () => {
//     fetchApplications(pagination.page);
//     fetchCampaign();
//   };

//   const handlePageChange = (nextPage) => {
//     if (nextPage < 1 || nextPage > pagination.totalPages) return;
//     fetchApplications(nextPage);
//   };

//   /* Live counts pulled from the campaign stats endpoint. Falls back to
//      the current pagination total when stats aren't available yet. */
//   const tabCounts = useMemo(() => {
//     const s = stats || {};
//     const pending = Number(s.pending) || 0;
//     const pending_payment = Number(s.pending_payment) || 0;
//     const approved = Number(s.approved) || 0;
//     const rejected = Number(s.rejected) || 0;
//     const total =
//       Number(s.total_applications) ||
//       pending + pending_payment + approved + rejected;
//     return { pending, pending_payment, approved, rejected, all: total };
//   }, [stats]);

//   const filterTabs = [
//     { id: 'pending', Icon: Clock, labelKey: 'filterPending', fallback: 'Pending' },
//     { id: 'pending_payment', Icon: Calendar, labelKey: 'filterPendingPayment', fallback: 'Awaiting Payment' },
//     { id: 'approved', Icon: CheckCircle2, labelKey: 'filterApproved', fallback: 'Approved' },
//     { id: 'rejected', Icon: XCircle, labelKey: 'filterRejected', fallback: 'Rejected' },
//     { id: 'all', Icon: GraduationCap, labelKey: 'filterAll', fallback: 'All' },
//   ];

//   return (
//     <>
//       <SEOHead
//         title={`${t.scholarships?.admin?.applicationsTitle || 'Applications'} — ${campaign?.name || ''}`}
//       />
//       <AdminLayout
//         title={t.scholarships?.admin?.applicationsTitle || 'Scholarship Applications'}
//         subtitle={campaign?.name || ''}
//       >
//         <button
//           type="button"
//           onClick={() => router.push('/admin/scholarships')}
//           className="inline-flex items-center gap-1.5 mb-4 text-2xs font-bold text-text-muted hover:text-accent transition-colors"
//         >
//           <ArrowLeft size={12} />
//           {t.scholarships?.detail?.backLink || 'Back to Scholarships'}
//         </button>

//         <CampaignHero campaign={campaign} />

//         {/* Filter tabs row with live counts */}
//         <div className="flex flex-wrap gap-1.5 mb-3">
//           {filterTabs.map(({ id, Icon, labelKey, fallback }) => {
//             const active = statusTab === id;
//             const count = tabCounts[id] || 0;
//             return (
//               <button
//                 key={id}
//                 type="button"
//                 onClick={() => setStatusTab(id)}
//                 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
//                   active
//                     ? 'bg-accent text-text-inverse shadow-glow-gold-sm'
//                     : 'bg-bg-pill text-text-muted border border-border-light hover:text-text-main hover:border-accent/40'
//                 }`}
//               >
//                 <Icon size={11} />
//                 {t.scholarships?.admin?.[labelKey] || fallback}
//                 <span
//                   className={`inline-flex items-center justify-center min-w-[20px] h-4 px-1 rounded-full text-2xs font-extrabold ${
//                     active
//                       ? 'bg-text-inverse/20 text-text-inverse'
//                       : 'bg-bg-card-solid text-text-dim'
//                   }`}
//                 >
//                   {count}
//                 </span>
//               </button>
//             );
//           })}
//         </div>

//         {/* Search row — full-width on mobile, capped on desktop */}
//         <div className="relative mb-5">
//           <Search
//             size={14}
//             className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
//           />
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder={
//               t.scholarships?.admin?.applicationSearchPlaceholder ||
//               'Search by name, phone, or email...'
//             }
//             className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-bg-input border border-border-medium
//                        text-xs text-text-main placeholder:text-text-dim
//                        focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
//                        transition-colors"
//           />
//         </div>

//         {/* Application list */}
//         {loading ? (
//           <ApplicationRowSkeleton />
//         ) : applications.length === 0 ? (
//           <div className="flex flex-col items-center gap-3 py-16 text-center animate-fade-in-up">
//             <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent animate-pulse-glow">
//               <GraduationCap size={28} />
//             </div>
//             <h3 className="text-base font-extrabold text-text-main">
//               {t.scholarships?.admin?.applicationsEmpty ||
//                 'No applications match your filters.'}
//             </h3>
//             <p className="text-xs text-text-muted">
//               Try another filter or clear your search.
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-3">
//             {applications.map((app, idx) => (
//               <ApplicationRow
//                 key={app.id}
//                 application={app}
//                 index={idx}
//                 onClick={() => openDetail(app.id)}
//               />
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {!loading && pagination.totalPages > 1 && (
//           <div className="flex items-center justify-center gap-3 mt-6">
//             <button
//               type="button"
//               onClick={() => handlePageChange(pagination.page - 1)}
//               disabled={pagination.page <= 1}
//               aria-label="Previous page"
//               className="p-2 rounded-lg bg-bg-pill text-text-muted hover:text-accent hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//             >
//               <ChevronLeft size={16} />
//             </button>
//             <span className="text-xs font-bold text-text-muted">
//               {pagination.page} / {pagination.totalPages}
//             </span>
//             <button
//               type="button"
//               onClick={() => handlePageChange(pagination.page + 1)}
//               disabled={pagination.page >= pagination.totalPages}
//               aria-label="Next page"
//               className="p-2 rounded-lg bg-bg-pill text-text-muted hover:text-accent hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
//             >
//               <ChevronRight size={16} />
//             </button>
//           </div>
//         )}
//       </AdminLayout>

//       <ApplicationDetailModal
//         isOpen={detailOpen}
//         applicationId={selectedAppId}
//         onClose={handleDetailClose}
//         onUpdated={handleDetailUpdated}
//       />
//     </>
//   );
// };

// export default AdminCampaignApplicationsPage;



/**
 * @fileoverview Admin Scholarship Applications — Review Queue
 *
 * Per-campaign review queue under the "pay at apply" model.
 *
 * Filter tabs reflect the new status lattice:
 *   - Pending           (payment awaiting verification)
 *   - Awaiting Decision (payment verified, awaiting grant/refund)
 *   - Approved
 *   - Rejected
 *   - All
 *
 * Path: apps/web/pages/admin/scholarships/[id]/applications.jsx
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Search, ArrowLeft, ChevronLeft, ChevronRight, ChevronRightCircle,
  GraduationCap, Award, Gift, Users, Clock, CheckCircle2, XCircle,
  Ban, FileCheck, ShieldCheck,
} from 'lucide-react';
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import ApplicationDetailModal from '../../../../components/admin/scholarships/ApplicationDetailModal';
import { SkeletonBase, SkeletonWrapper } from '../../../../components/shared/Skeleton';
import { useLanguage } from '../../../../context/LanguageContext';
import { useToast } from '../../../../context/ToastContext';
import apiClient from '../../../../lib/api';
import { getItem } from '../../../../lib/storage';

const STATUS_META = {
  pending: {
    labelKey: 'pending',
    fallbackLabel: 'Payment Under Review',
    bg: 'rgba(245,158,11,0.12)',
    fg: '#f59e0b',
    border: 'rgba(245,158,11,0.35)',
    Icon: Clock,
  },
  payment_verified: {
    labelKey: 'paymentVerified',
    fallbackLabel: 'Awaiting Decision',
    bg: 'rgba(59,130,246,0.12)',
    fg: '#3b82f6',
    border: 'rgba(59,130,246,0.35)',
    Icon: ShieldCheck,
  },
  approved: {
    labelKey: 'approved',
    fallbackLabel: 'Approved',
    bg: 'rgba(16,185,129,0.12)',
    fg: '#10b981',
    border: 'rgba(16,185,129,0.35)',
    Icon: CheckCircle2,
  },
  rejected: {
    labelKey: 'rejected',
    fallbackLabel: 'Rejected',
    bg: 'rgba(239,68,68,0.12)',
    fg: '#ef4444',
    border: 'rgba(239,68,68,0.35)',
    Icon: XCircle,
  },
  withdrawn: {
    labelKey: 'withdrawn',
    fallbackLabel: 'Withdrawn',
    bg: 'var(--surface-secondary)',
    fg: 'var(--text-dim)',
    border: 'var(--border-light)',
    Icon: XCircle,
  },
  revoked: {
    labelKey: 'revoked',
    fallbackLabel: 'Revoked',
    bg: 'rgba(239,68,68,0.12)',
    fg: '#ef4444',
    border: 'rgba(239,68,68,0.35)',
    Icon: Ban,
  },
};

const statusLabelFor = (t, status) => {
  const meta = STATUS_META[status];
  if (!meta) return status;
  return t.scholarships?.statusLabel?.[meta.labelKey] || meta.fallbackLabel;
};

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const ApplicationRowSkeleton = () => (
  <SkeletonWrapper className="grid grid-cols-1 gap-3">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className="rounded-xl border border-border-light bg-bg-card-solid p-4 flex items-center gap-3"
      >
        <SkeletonBase style={{ height: '2.5rem', width: '2.5rem', borderRadius: '9999px' }} />
        <div className="flex-1 flex flex-col gap-1.5">
          <SkeletonBase className="skeleton-line skeleton-line-medium" />
          <SkeletonBase className="skeleton-line skeleton-line-short" />
        </div>
        <SkeletonBase style={{ height: '1.5rem', width: '5rem', borderRadius: '9999px' }} />
      </div>
    ))}
  </SkeletonWrapper>
);

const CampaignHero = ({ campaign }) => {
  const { t } = useLanguage();
  if (!campaign) return null;

  const quotaPct =
    campaign.quota > 0
      ? Math.min(
          100,
          Math.round(((campaign.approved_count || 0) / campaign.quota) * 100)
        )
      : 0;
  const remaining = Math.max(
    0,
    (campaign.quota || 0) - (campaign.approved_count || 0)
  );
  const fee = Number(campaign.registration_fee_etb) || 0;
  const phases = Array.isArray(campaign.grants_phases) ? campaign.grants_phases : [];
  const requiredDocs = Array.isArray(campaign.required_documents)
    ? campaign.required_documents
    : [];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 via-bg-card-solid to-bg-card-solid mb-5 animate-fade-in-up">
      {campaign.cover_image_url && (
        <>
          <img
            src={campaign.cover_image_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-bg-card-solid/95 via-bg-card-solid/85 to-bg-card-solid/70"
          />
        </>
      )}
      <div className="relative p-5 flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="w-12 h-12 rounded-xl bg-accent text-text-inverse flex items-center justify-center shadow-glow-gold-sm">
            <GraduationCap size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold text-text-main leading-tight truncate">
              {campaign.name}
            </h2>
            <p className="text-2xs text-text-dim mt-0.5 truncate">
              /{campaign.slug}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-2xs font-bold border border-accent/30">
            <Award size={9} />
            {campaign.grants_full_course
              ? t.scholarships?.card?.fullCourse || 'Full Course Access'
              : (t.scholarships?.card?.phases || '{count} phase(s)').replace(
                  '{count}',
                  String(phases.length)
                )}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold border ${
              fee > 0
                ? 'bg-warning/10 text-warning border-warning/30'
                : 'bg-success/10 text-success border-success/30'
            }`}
          >
            <Gift size={9} />
            {fee > 0
              ? (
                  t.scholarships?.card?.registrationFee || '{amount} ETB fee'
                ).replace('{amount}', fee.toLocaleString())
              : t.scholarships?.card?.registrationFree || 'Free'}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-pill text-text-muted text-2xs font-bold border border-border-medium">
            <Users size={9} />
            {campaign.approved_count || 0} / {campaign.quota || 0} approved ·{' '}
            {remaining} left
          </span>
          {requiredDocs.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-info/10 text-info text-2xs font-bold border border-info/30">
              <FileCheck size={9} />
              {requiredDocs.length} doc{requiredDocs.length === 1 ? '' : 's'} required
            </span>
          )}
        </div>

        {campaign.quota > 0 && (
          <div className="h-1.5 rounded-full bg-bg-input border border-border-light overflow-hidden max-w-md">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                quotaPct >= 90
                  ? 'bg-gradient-to-r from-warning to-error'
                  : 'bg-gradient-to-r from-accent to-accent-light'
              }`}
              style={{ width: `${quotaPct}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const ApplicationRow = ({ application, onClick, index }) => {
  const { t } = useLanguage();
  const meta = STATUS_META[application.status] || STATUS_META.pending;
  const { Icon } = meta;

  const docCount = Array.isArray(application.documents)
    ? application.documents.length
    : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-border-light bg-bg-card-solid p-4
                 flex items-center gap-3 hover:border-accent/40 hover:bg-bg-card-hover
                 transition-all duration-200 group animate-fade-in-up"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-extrabold text-sm shrink-0">
        {(application.applicant_name || 'A').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-main truncate">
          {application.applicant_name || 'Unknown'}
        </p>
        <p className="text-2xs text-text-dim truncate">
          {application.applicant_phone || '—'}
          {application.applicant_email ? ` · ${application.applicant_email}` : ''}
        </p>
        <p className="text-2xs text-text-dim mt-0.5 inline-flex items-center gap-2 flex-wrap">
          <span>
            {t.scholarships?.admin?.appliedColumn || 'Applied'}{' '}
            {formatDate(application.created_at)}
          </span>
          {docCount > 0 && (
            <span className="inline-flex items-center gap-1 text-info">
              <FileCheck size={9} />
              {docCount} doc{docCount === 1 ? '' : 's'}
            </span>
          )}
        </p>
      </div>
      <span
        className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wider border shrink-0"
        style={{ background: meta.bg, color: meta.fg, borderColor: meta.border }}
      >
        <Icon size={10} />
        {statusLabelFor(t, application.status)}
      </span>
      <ChevronRightCircle
        size={20}
        className="text-text-dim group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0"
      />
    </button>
  );
};

const AdminCampaignApplicationsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();
  const campaignId = router.query.id;

  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchCampaign = useCallback(async () => {
    if (!campaignId) return;
    try {
      const response = await apiClient.get(`/admin/scholarships/${campaignId}`);
      if (response?.success) {
        setCampaign(response.data?.campaign);
        setStats(response.data?.stats || null);
      }
    } catch (error) {
      if (error?.response?.status === 401) router.push('/admin/login');
      else if (error?.response?.status === 404) {
        toast.error('Campaign not found.');
        router.push('/admin/scholarships');
      }
    }
  }, [campaignId, router, toast]);

  const fetchApplications = useCallback(
    async (page = 1) => {
      if (!campaignId) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({
          status: statusTab,
          page: String(page),
          pageSize: '25',
        });
        if (searchTerm) params.set('q', searchTerm);

        const response = await apiClient.get(
          `/admin/scholarships/${campaignId}/applications?${params.toString()}`
        );
        if (response?.success) {
          setApplications(response.data?.applications || []);
          const meta = response.meta || {};
          setPagination({
            page: meta.page || 1,
            totalPages: meta.totalPages || 1,
            total: meta.total || 0,
          });
        }
      } catch (error) {
        if (error?.response?.status === 401) router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    },
    [campaignId, statusTab, searchTerm, router]
  );

  useEffect(() => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    if (!campaignId) return;
    fetchCampaign();
  }, [campaignId, fetchCampaign, router]);

  useEffect(() => {
    if (!campaignId) return;
    const handle = setTimeout(() => fetchApplications(1), 300);
    return () => clearTimeout(handle);
  }, [statusTab, searchTerm, campaignId, fetchApplications]);

  const openDetail = (appId) => {
    setSelectedAppId(appId);
    setDetailOpen(true);
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setSelectedAppId(null);
  };

  const handleDetailUpdated = () => {
    fetchApplications(pagination.page);
    fetchCampaign();
  };

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    fetchApplications(nextPage);
  };

  const tabCounts = useMemo(() => {
    const s = stats || {};
    const pending = Number(s.pending) || 0;
    const payment_verified = Number(s.payment_verified) || 0;
    const approved = Number(s.approved) || 0;
    const rejected = Number(s.rejected) || 0;
    const total =
      Number(s.total_applications) || pending + payment_verified + approved + rejected;
    return { pending, payment_verified, approved, rejected, all: total };
  }, [stats]);

  const filterTabs = [
    { id: 'pending', Icon: Clock, labelKey: 'filterPending', fallback: 'Payment Verification' },
    { id: 'payment_verified', Icon: ShieldCheck, labelKey: 'filterPaymentVerified', fallback: 'Awaiting Decision' },
    { id: 'approved', Icon: CheckCircle2, labelKey: 'filterApproved', fallback: 'Approved' },
    { id: 'rejected', Icon: XCircle, labelKey: 'filterRejected', fallback: 'Rejected' },
    { id: 'all', Icon: GraduationCap, labelKey: 'filterAll', fallback: 'All' },
  ];

  return (
    <>
      <SEOHead
        title={`${t.scholarships?.admin?.applicationsTitle || 'Applications'} — ${campaign?.name || ''}`}
      />
      <AdminLayout
        title={t.scholarships?.admin?.applicationsTitle || 'Scholarship Applications'}
        subtitle={campaign?.name || ''}
      >
        <button
          type="button"
          onClick={() => router.push('/admin/scholarships')}
          className="inline-flex items-center gap-1.5 mb-4 text-2xs font-bold text-text-muted hover:text-accent transition-colors"
        >
          <ArrowLeft size={12} />
          {t.scholarships?.detail?.backLink || 'Back to Scholarships'}
        </button>

        <CampaignHero campaign={campaign} />

        <div className="flex flex-wrap gap-1.5 mb-3">
          {filterTabs.map(({ id, Icon, labelKey, fallback }) => {
            const active = statusTab === id;
            const count = tabCounts[id] || 0;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setStatusTab(id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'bg-accent text-text-inverse shadow-glow-gold-sm'
                    : 'bg-bg-pill text-text-muted border border-border-light hover:text-text-main hover:border-accent/40'
                }`}
              >
                <Icon size={11} />
                {t.scholarships?.admin?.[labelKey] || fallback}
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-4 px-1 rounded-full text-2xs font-extrabold ${
                    active
                      ? 'bg-text-inverse/20 text-text-inverse'
                      : 'bg-bg-card-solid text-text-dim'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative mb-5">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              t.scholarships?.admin?.applicationSearchPlaceholder ||
              'Search by name, phone, or email...'
            }
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-bg-input border border-border-medium
                       text-xs text-text-main placeholder:text-text-dim
                       focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
                       transition-colors"
          />
        </div>

        {loading ? (
          <ApplicationRowSkeleton />
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent animate-pulse-glow">
              <GraduationCap size={28} />
            </div>
            <h3 className="text-base font-extrabold text-text-main">
              {t.scholarships?.admin?.applicationsEmpty ||
                'No applications match your filters.'}
            </h3>
            <p className="text-xs text-text-muted">
              Try another filter or clear your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {applications.map((app, idx) => (
              <ApplicationRow
                key={app.id}
                application={app}
                index={idx}
                onClick={() => openDetail(app.id)}
              />
            ))}
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
              className="p-2 rounded-lg bg-bg-pill text-text-muted hover:text-accent hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-text-muted">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              aria-label="Next page"
              className="p-2 rounded-lg bg-bg-pill text-text-muted hover:text-accent hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </AdminLayout>

      <ApplicationDetailModal
        isOpen={detailOpen}
        applicationId={selectedAppId}
        onClose={handleDetailClose}
        onUpdated={handleDetailUpdated}
      />
    </>
  );
};

export default AdminCampaignApplicationsPage;