
// /**
//  * @fileoverview Admin Scholarship Campaigns — List Page
//  *
//  * Campaign management surface for the admin panel. Renders a hero
//  * banner with live counts, a stat grid, a filter/search toolbar, and
//  * one card per campaign (not a table row) so cover imagery, quota
//  * progress, and status read at a glance.
//  *
//  * Path: apps/web/pages/admin/scholarships/index.jsx
//  */

// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { useRouter } from 'next/router';
// import {
//   Plus, Search, Edit, Trash2, Power, PowerOff, ArrowRight,
//   GraduationCap, Award, Users, Sparkles, Calendar, Gift,
// } from 'lucide-react';
// import SEOHead from '../../../components/shared/SEOHead';
// import AdminLayout from '../../../components/admin/AdminLayout';
// import ScholarshipCampaignForm from '../../../components/admin/scholarships/ScholarshipCampaignForm';
// import { SkeletonBase, SkeletonWrapper } from '../../../components/shared/Skeleton';
// import { useLanguage } from '../../../context/LanguageContext';
// import { useToast } from '../../../context/ToastContext';
// import { useConfirm } from '../../../components/shared/ConfirmProvider';
// import apiClient from '../../../lib/api';
// import { getItem } from '../../../lib/storage';

// /* ============================================================================
//  * HELPERS
//  * ========================================================================== */

// const campaignStatus = (campaign) => {
//   if (
//     campaign.applications_close_at &&
//     new Date(campaign.applications_close_at) < new Date()
//   ) {
//     return 'closed';
//   }
//   return campaign.is_active ? 'active' : 'paused';
// };

// const shortDate = (value) => {
//   if (!value) return '';
//   try {
//     return new Date(value).toLocaleDateString(undefined, {
//       month: 'short', day: 'numeric', year: 'numeric',
//     });
//   } catch {
//     return '';
//   }
// };

// const statusColors = (status) => {
//   switch (status) {
//     case 'active':
//       return { bg: 'rgba(16,185,129,0.12)', fg: '#10b981', border: 'rgba(16,185,129,0.35)' };
//     case 'paused':
//       return { bg: 'rgba(245,158,11,0.12)', fg: '#f59e0b', border: 'rgba(245,158,11,0.35)' };
//     case 'closed':
//       return { bg: 'rgba(239,68,68,0.12)', fg: '#ef4444', border: 'rgba(239,68,68,0.35)' };
//     default:
//       return { bg: 'var(--surface-secondary)', fg: 'var(--text-dim)', border: 'var(--border-light)' };
//   }
// };

// /* ============================================================================
//  * SKELETON
//  * ========================================================================== */

// const CampaignSkeleton = () => (
//   <SkeletonWrapper className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//     {[0, 1, 2, 3].map((i) => (
//       <div key={i} className="rounded-2xl border border-border-light bg-bg-card-solid p-5 flex flex-col gap-3">
//         <SkeletonBase style={{ height: '5rem', borderRadius: '0.75rem' }} />
//         <SkeletonBase className="skeleton-line skeleton-line-medium" />
//         <SkeletonBase className="skeleton-line skeleton-line-short" />
//         <div className="flex gap-2">
//           <SkeletonBase style={{ height: '1.25rem', width: '5rem', borderRadius: '9999px' }} />
//           <SkeletonBase style={{ height: '1.25rem', width: '5rem', borderRadius: '9999px' }} />
//         </div>
//       </div>
//     ))}
//   </SkeletonWrapper>
// );

// /* ============================================================================
//  * CAMPAIGN CARD
//  * ========================================================================== */

// const CampaignCard = ({
//   campaign,
//   index,
//   onEdit,
//   onToggleActive,
//   onDelete,
//   onViewApplications,
// }) => {
//   const { t } = useLanguage();
//   const status = campaignStatus(campaign);
//   const colors = statusColors(status);
//   const remaining = Math.max(0, (campaign.quota || 0) - (campaign.approved_count || 0));
//   const quotaPct =
//     campaign.quota > 0
//       ? Math.min(100, Math.round(((campaign.approved_count || 0) / campaign.quota) * 100))
//       : 0;
//   const fee = Number(campaign.registration_fee_etb) || 0;
//   const grantsPhases = Array.isArray(campaign.grants_phases) ? campaign.grants_phases : [];

//   return (
//     <article
//       className="group relative rounded-2xl border border-border-light bg-bg-card-solid overflow-hidden
//                  hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow-gold
//                  transition-all duration-300 animate-fade-in-up"
//       style={{ animationDelay: `${index * 60}ms` }}
//     >
//       {/* Cover / gradient band */}
//       <div className="relative h-24 overflow-hidden">
//         {campaign.cover_image_url ? (
//           <>
//             <img
//               src={campaign.cover_image_url}
//               alt=""
//               aria-hidden="true"
//               className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-bg-card-solid via-bg-card-solid/60 to-transparent" />
//           </>
//         ) : (
//           <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-accent/15 to-bg-card-solid" />
//         )}
//         <div className="absolute inset-0 bg-gradient-to-t from-bg-card-solid via-transparent to-transparent" />

//         {/* Status pill */}
//         <span
//           className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full
//                      text-2xs font-extrabold uppercase tracking-wider border backdrop-blur-sm"
//           style={{ background: colors.bg, color: colors.fg, borderColor: colors.border }}
//         >
//           {status}
//         </span>

//         {/* Icon badge */}
//         <div className="absolute -bottom-5 left-5 w-12 h-12 rounded-xl bg-accent text-text-inverse flex items-center justify-center shadow-glow-gold-sm border-4 border-bg-card-solid">
//           <GraduationCap size={20} />
//         </div>
//       </div>

//       {/* Body */}
//       <div className="pt-8 px-5 pb-5 flex flex-col gap-3">
//         <div>
//           <h3 className="text-base font-extrabold text-text-main leading-tight line-clamp-1">
//             {campaign.name}
//           </h3>
//           <p className="text-2xs text-text-dim mt-0.5 truncate">/{campaign.slug}</p>
//         </div>

//         {/* Chips */}
//         <div className="flex flex-wrap gap-1.5">
//           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-2xs font-bold border border-accent/30">
//             <Award size={9} />
//             {campaign.grants_full_course
//               ? t.scholarships?.card?.fullCourse || 'Full Course'
//               : (t.scholarships?.card?.phases || '{count} Phases').replace(
//                   '{count}',
//                   String(grantsPhases.length)
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
//               ? (t.scholarships?.card?.registrationFee || '{amount} ETB').replace(
//                   '{amount}',
//                   fee.toLocaleString()
//                 )
//               : t.scholarships?.card?.registrationFree || 'Free'}
//           </span>
//         </div>

//         {/* Quota progress */}
//         {campaign.quota > 0 && (
//           <div className="flex flex-col gap-1.5">
//             <div className="flex items-center justify-between text-2xs">
//               <span className="inline-flex items-center gap-1 text-text-muted font-semibold">
//                 <Users size={10} />
//                 {campaign.approved_count || 0} / {campaign.quota} approved
//               </span>
//               <span className="text-text-dim font-bold font-mono">{quotaPct}%</span>
//             </div>
//             <div className="h-1.5 rounded-full bg-bg-input border border-border-light overflow-hidden">
//               <div
//                 className={`h-full rounded-full transition-all duration-700 ${
//                   quotaPct >= 90
//                     ? 'bg-gradient-to-r from-warning to-error'
//                     : 'bg-gradient-to-r from-accent to-accent-light'
//                 }`}
//                 style={{ width: `${quotaPct}%` }}
//               />
//             </div>
//             <div className="flex items-center justify-between text-2xs text-text-dim">
//               <span>{remaining} spots left</span>
//               {campaign.applications_close_at && (
//                 <span className="inline-flex items-center gap-1">
//                   <Calendar size={9} />
//                   {shortDate(campaign.applications_close_at)}
//                 </span>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Actions */}
//         <div className="flex items-center gap-1.5 mt-1 pt-3 border-t border-border-light">
//           <button
//             type="button"
//             onClick={onViewApplications}
//             className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
//                        bg-accent text-text-inverse text-xs font-bold
//                        hover:bg-accent-light transition-colors"
//           >
//             {t.scholarships?.admin?.viewButton || 'Applications'}
//             <ArrowRight size={12} />
//           </button>
//           <button
//             type="button"
//             onClick={onEdit}
//             aria-label="Edit"
//             className="p-2 rounded-lg bg-bg-pill text-text-muted hover:text-accent hover:bg-accent/10 transition-colors"
//           >
//             <Edit size={14} />
//           </button>
//           <button
//             type="button"
//             onClick={onToggleActive}
//             aria-label={campaign.is_active ? 'Pause' : 'Activate'}
//             className="p-2 rounded-lg bg-bg-pill text-text-muted hover:text-warning hover:bg-warning/10 transition-colors"
//           >
//             {campaign.is_active ? <PowerOff size={14} /> : <Power size={14} />}
//           </button>
//           <button
//             type="button"
//             onClick={onDelete}
//             aria-label="Delete"
//             className="p-2 rounded-lg bg-bg-pill text-text-muted hover:text-error hover:bg-error/10 transition-colors"
//           >
//             <Trash2 size={14} />
//           </button>
//         </div>
//       </div>
//     </article>
//   );
// };

// /* ============================================================================
//  * PAGE
//  * ========================================================================== */

// const AdminScholarshipsPage = () => {
//   const router = useRouter();
//   const { t } = useLanguage();
//   const toast = useToast();
//   const confirm = useConfirm();

//   const [campaigns, setCampaigns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [formOpen, setFormOpen] = useState(false);
//   const [editingCampaign, setEditingCampaign] = useState(null);

//   const fetchCampaigns = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await apiClient.get('/admin/scholarships?pageSize=200');
//       if (response?.success) {
//         setCampaigns(response.data?.campaigns || []);
//       }
//     } catch (error) {
//       if (error?.response?.status === 401) router.push('/admin/login');
//     } finally {
//       setLoading(false);
//     }
//   }, [router]);

//   useEffect(() => {
//     const token = getItem('admin_token');
//     if (!token) {
//       router.push('/admin/login');
//       return;
//     }
//     fetchCampaigns();
//   }, [fetchCampaigns, router]);

//   const filteredCampaigns = useMemo(() => {
//     return campaigns.filter((campaign) => {
//       const status = campaignStatus(campaign);
//       if (statusFilter !== 'all' && status !== statusFilter) return false;
//       if (!searchTerm) return true;
//       const term = searchTerm.toLowerCase();
//       return (
//         campaign.name?.toLowerCase().includes(term) ||
//         campaign.slug?.toLowerCase().includes(term)
//       );
//     });
//   }, [campaigns, statusFilter, searchTerm]);

//   const counts = useMemo(() => {
//     const base = { all: campaigns.length, active: 0, paused: 0, closed: 0 };
//     for (const c of campaigns) base[campaignStatus(c)] += 1;
//     return base;
//   }, [campaigns]);

//   const handleCreate = () => {
//     setEditingCampaign(null);
//     setFormOpen(true);
//   };

//   const handleEdit = (campaign) => {
//     setEditingCampaign(campaign);
//     setFormOpen(true);
//   };

//   const handleToggleActive = async (campaign) => {
//     const wasActive = campaign.is_active;
//     const ok = await confirm({
//       title: wasActive ? 'Pause campaign?' : 'Activate campaign?',
//       message: wasActive
//         ? 'New applications will be blocked while paused. Existing applications can still be reviewed.'
//         : 'The campaign will start accepting new applications.',
//       confirmText: wasActive ? 'Pause' : 'Activate',
//       variant: 'warning',
//     });
//     if (!ok) return;

//     try {
//       const response = await apiClient.put(
//         `/admin/scholarships/${campaign.id}`,
//         { isActive: !wasActive },
//         { _confirm: null }
//       );
//       if (response?.success) {
//         toast.success(wasActive ? 'Campaign paused.' : 'Campaign activated.');
//         fetchCampaigns();
//       } else {
//         toast.error(response?.message || 'Update failed.');
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || 'Update failed.');
//     }
//   };

//   const handleDelete = async (campaign) => {
//     const ok = await confirm({
//       title: 'Delete campaign?',
//       message: `"${campaign.name}" will be permanently deleted. This action cannot be undone.`,
//       confirmText: 'Delete Campaign',
//       variant: 'danger',
//     });
//     if (!ok) return;

//     try {
//       await apiClient.delete(`/admin/scholarships/${campaign.id}`, { _confirm: null });
//       toast.success('Campaign deleted.');
//       fetchCampaigns();
//     } catch (error) {
//       const errorCode = error?.response?.data?.code;
//       const errorMessage = error?.response?.data?.message || 'Delete failed.';
      
//       /* 
//        * If the campaign has applications, the DB blocks deletion.
//        * Show a helpful toast instead of a scary red error.
//        */
//       if (errorCode === 'CAMPAIGN_HAS_APPLICATIONS') {
//         toast.error(
//           'Cannot delete: This campaign already has applications. Pause it instead to hide it from the public.'
//         );
//       } else {
//         toast.error(errorMessage);
//       }
//     }
//   };

//   const filterTabs = [
//     { id: 'all', label: 'All', count: counts.all },
//     { id: 'active', label: 'Active', count: counts.active },
//     { id: 'paused', label: 'Paused', count: counts.paused },
//     { id: 'closed', label: 'Closed', count: counts.closed },
//   ];

//   return (
//     <>
//       <SEOHead title="Scholarship Campaigns" />
//       <AdminLayout
//         title={t.scholarships?.admin?.campaignsTitle || 'Scholarship Campaigns'}
//         subtitle={
//           t.scholarships?.admin?.campaignsSubtitle ||
//           'Create and manage scholarship offerings'
//         }
//       >
//         {/* Hero banner */}
//         <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/15 via-bg-card-solid to-bg-card-solid p-6 mb-6 animate-fade-in-up">
//           <div
//             aria-hidden="true"
//             className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/30 blur-3xl pointer-events-none animate-blob"
//           />
//           <div className="relative flex items-center gap-4 flex-wrap">
//             <div className="w-14 h-14 rounded-2xl bg-accent text-text-inverse flex items-center justify-center shadow-glow-gold">
//               <GraduationCap size={26} />
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="inline-flex items-center gap-1.5 text-2xs font-extrabold text-accent uppercase tracking-widest mb-1">
//                 <Sparkles size={10} /> {t.scholarships?.admin?.sectionLabel || 'Scholarships'}
//               </p>
//               <h2 className="text-xl font-extrabold text-text-main leading-tight">
//                 {t.scholarships?.admin?.campaignsTitle || 'Scholarship Campaigns'}
//               </h2>
//               <p className="text-xs text-text-muted mt-1">
//                 {campaigns.length} {campaigns.length === 1 ? 'campaign' : 'campaigns'} ·{' '}
//                 {counts.active} active · {counts.paused} paused
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={handleCreate}
//               className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl
//                          bg-accent text-text-inverse text-sm font-bold
//                          hover:bg-accent-light hover:-translate-y-0.5
//                          shadow-glow-gold hover:shadow-glow-gold-lg
//                          transition-all duration-200"
//             >
//               <Plus size={16} />
//               {t.scholarships?.admin?.createCampaign || 'Create Campaign'}
//             </button>
//           </div>
//         </div>

//         {/* Toolbar: filter tabs + search */}
//         <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
//           <div className="flex flex-wrap gap-1.5">
//             {filterTabs.map((tab) => (
//               <button
//                 key={tab.id}
//                 type="button"
//                 onClick={() => setStatusFilter(tab.id)}
//                 className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
//                   statusFilter === tab.id
//                     ? 'bg-accent text-text-inverse shadow-glow-gold-sm'
//                     : 'bg-bg-pill text-text-muted border border-border-light hover:text-text-main hover:border-accent/40'
//                 }`}
//               >
//                 {tab.label}
//                 <span
//                   className={`inline-flex items-center justify-center min-w-[20px] h-4 px-1 rounded-full text-2xs font-extrabold ${
//                     statusFilter === tab.id
//                       ? 'bg-text-inverse/20 text-text-inverse'
//                       : 'bg-bg-card-solid text-text-dim'
//                   }`}
//                 >
//                   {tab.count}
//                 </span>
//               </button>
//             ))}
//           </div>

//           <div className="relative flex-1 max-w-md md:ml-auto">
//             <Search
//               size={14}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
//             />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder={
//                 t.scholarships?.admin?.searchPlaceholder ||
//                 'Search campaigns by name or slug...'
//               }
//               className="w-full pl-9 pr-3 py-2 rounded-lg bg-bg-input border border-border-medium
//                          text-xs text-text-main placeholder:text-text-dim
//                          focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20
//                          transition-colors"
//             />
//           </div>
//         </div>

//         {/* Content */}
//         {loading ? (
//           <CampaignSkeleton />
//         ) : filteredCampaigns.length === 0 ? (
//           <div className="flex flex-col items-center gap-4 py-16 text-center animate-fade-in-up">
//             <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent animate-pulse-glow">
//               <GraduationCap size={28} />
//             </div>
//             <div>
//               <h3 className="text-base font-extrabold text-text-main">
//                 {t.scholarships?.admin?.campaignsEmpty ||
//                   'No campaigns yet. Create your first one!'}
//               </h3>
//               <p className="text-xs text-text-muted mt-1">
//                 Launch a scholarship to attract driven learners.
//               </p>
//             </div>
//             <button
//               type="button"
//               onClick={handleCreate}
//               className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl
//                          bg-accent text-text-inverse text-sm font-bold
//                          hover:bg-accent-light shadow-glow-gold transition-all"
//             >
//               <Plus size={16} />
//               {t.scholarships?.admin?.createCampaign || 'Create Campaign'}
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//             {filteredCampaigns.map((campaign, idx) => (
//               <CampaignCard
//                 key={campaign.id}
//                 campaign={campaign}
//                 index={idx}
//                 onEdit={() => handleEdit(campaign)}
//                 onToggleActive={() => handleToggleActive(campaign)}
//                 onDelete={() => handleDelete(campaign)}
//                 onViewApplications={() =>
//                   router.push(`/admin/scholarships/${campaign.id}/applications`)
//                 }
//               />
//             ))}
//           </div>
//         )}
//       </AdminLayout>

//       <ScholarshipCampaignForm
//         isOpen={formOpen}
//         onClose={() => setFormOpen(false)}
//         onSaved={fetchCampaigns}
//         campaign={editingCampaign}
//       />
//     </>
//   );
// };

// export default AdminScholarshipsPage;





/**
 * @fileoverview Admin Scholarship Campaigns — List Page (Redesigned)
 *
 * Provides a premium, card-based UI for managing campaigns.
 * Uses aggressive Optimistic UI: deleting or pausing a campaign 
 * instantly removes it from the visual grid.
 *
 * Path: apps/web/pages/admin/scholarships/index.jsx
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Plus, Search, Edit, Trash2, Power, PowerOff, ArrowRight,
  GraduationCap, Award, Users, Sparkles, Calendar, Gift, Clock
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import ScholarshipCampaignForm from '../../../components/admin/scholarships/ScholarshipCampaignForm';
import { SkeletonBase, SkeletonWrapper } from '../../../components/shared/Skeleton';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import { useConfirm } from '../../../components/shared/ConfirmProvider';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

const campaignStatus = (campaign) => {
  if (campaign.applications_close_at && new Date(campaign.applications_close_at) < new Date()) {
    return 'closed';
  }
  return campaign.is_active ? 'active' : 'paused';
};

const shortDate = (value) => {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return ''; }
};

const statusColors = (status) => {
  switch (status) {
    case 'active': return { bg: 'rgba(16,185,129,0.1)', fg: '#10b981', border: 'rgba(16,185,129,0.3)' };
    case 'paused': return { bg: 'rgba(245,158,11,0.1)', fg: '#f59e0b', border: 'rgba(245,158,11,0.3)' };
    case 'closed': return { bg: 'rgba(239,68,68,0.1)', fg: '#ef4444', border: 'rgba(239,68,68,0.3)' };
    default: return { bg: 'var(--surface-secondary)', fg: 'var(--text-dim)', border: 'var(--border-light)' };
  }
};

const CampaignSkeleton = () => (
  <SkeletonWrapper className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="rounded-2xl border border-border-light bg-bg-card-solid p-5 flex flex-col gap-3">
        <SkeletonBase style={{ height: '6rem', borderRadius: '0.75rem' }} />
        <SkeletonBase className="skeleton-line skeleton-line-medium" />
        <SkeletonBase className="skeleton-line skeleton-line-short" />
      </div>
    ))}
  </SkeletonWrapper>
);

const CampaignCard = ({ campaign, index, onEdit, onToggleActive, onDelete, onViewApplications }) => {
  const { t } = useLanguage();
  const status = campaignStatus(campaign);
  const colors = statusColors(status);
  const approvedCount = Number(campaign.approved_count) || 0;
  const quota = Number(campaign.quota) || 0;
  const remaining = Math.max(0, quota - approvedCount);
  const quotaPct = quota > 0 ? Math.min(100, Math.round((approvedCount / quota) * 100)) : 0;
  const fee = Number(campaign.registration_fee_etb) || 0;

  return (
    <article
      className="group relative rounded-2xl border border-border-light bg-bg-card-solid overflow-hidden
                 hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow-gold
                 transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Modern Cover Band */}
      <div className="relative h-28 overflow-hidden bg-bg-input">
        {campaign.cover_image_url && (
          <img src={campaign.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card-solid via-bg-card-solid/40 to-transparent" />
        
        {/* Floating Status Pill */}
        <span className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wider border backdrop-blur-md shadow-sm" style={{ background: colors.bg, color: colors.fg, borderColor: colors.border }}>
          {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
          {status}
        </span>
      </div>

      <div className="pt-2 px-5 pb-5 flex flex-col gap-4">
        {/* Title & Slug */}
        <div className="-mt-6 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-accent text-text-inverse flex items-center justify-center shadow-glow-gold-sm border-4 border-bg-card-solid mb-2">
            <GraduationCap size={20} />
          </div>
          <h3 className="text-lg font-extrabold text-text-main leading-tight line-clamp-1">{campaign.name}</h3>
          <p className="text-2xs text-text-dim font-mono mt-0.5 truncate">/{campaign.slug}</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 text-accent text-2xs font-bold border border-accent/20">
            <Award size={12} /> {campaign.grants_full_course ? 'Full Course' : 'Specific Phases'}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-2xs font-bold border ${fee > 0 ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'}`}>
            <Gift size={12} /> {fee > 0 ? `${fee.toLocaleString()} ETB` : 'Free Entry'}
          </span>
        </div>

        {/* Progress Bar */}
        {quota > 0 && (
          <div className="bg-bg-input/50 p-3 rounded-xl border border-border-light">
            <div className="flex items-center justify-between text-2xs mb-1.5">
              <span className="text-text-muted font-semibold flex items-center gap-1"><Users size={12}/> {approvedCount} / {quota} Approved</span>
              <span className="text-text-main font-bold">{remaining} left</span>
            </div>
            <div className="h-1.5 rounded-full bg-border-light overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${quotaPct >= 90 ? 'bg-gradient-to-r from-warning to-error' : 'bg-gradient-to-r from-accent to-accent-light'}`} style={{ width: `${quotaPct}%` }} />
            </div>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <button onClick={onViewApplications} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light hover:shadow-glow-gold-sm transition-all active:scale-95">
            View Applications <ArrowRight size={14} />
          </button>
          
          <div className="flex items-center bg-bg-input rounded-xl border border-border-light p-1">
            <button onClick={onEdit} title="Edit Campaign" className="p-2 rounded-lg text-text-muted hover:text-accent hover:bg-accent/10 transition-colors">
              <Edit size={16} />
            </button>
            <button onClick={onToggleActive} title={campaign.is_active ? "Pause Campaign" : "Activate Campaign"} className="p-2 rounded-lg text-text-muted hover:text-warning hover:bg-warning/10 transition-colors">
              {campaign.is_active ? <PowerOff size={16} /> : <Power size={16} />}
            </button>
            {/* Always clickable delete button as requested */}
            <button onClick={onDelete} title="Delete Campaign" className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const AdminScholarshipsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();
  const confirm = useConfirm();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/scholarships?pageSize=200');
      if (response?.success) setCampaigns(response.data?.campaigns || []);
    } catch (error) {
      if (error?.response?.status === 401) router.push('/admin/login');
    } finally { setLoading(false); }
  }, [router]);

  useEffect(() => {
    if (!getItem('admin_token')) { router.push('/admin/login'); return; }
    fetchCampaigns();
  }, [fetchCampaigns, router]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const status = campaignStatus(c);
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return c.name?.toLowerCase().includes(term) || c.slug?.toLowerCase().includes(term);
    });
  }, [campaigns, statusFilter, searchTerm]);

  const counts = useMemo(() => {
    const base = { all: campaigns.length, active: 0, paused: 0, closed: 0 };
    for (const c of campaigns) base[campaignStatus(c)] += 1;
    return base;
  }, [campaigns]);

  const handleToggleActive = async (campaign) => {
    const wasActive = campaign.is_active;
    const ok = await confirm({
      title: wasActive ? 'Pause Campaign?' : 'Activate Campaign?',
      message: 'This will immediately update the public visibility of this campaign.',
      confirmText: wasActive ? 'Pause' : 'Activate',
      variant: 'warning',
    });
    if (!ok) return;

    /* Optimistic UI: Update state instantly */
    setCampaigns((prev) => prev.map((c) => c.id === campaign.id ? { ...c, is_active: !wasActive } : c));

    try {
      await apiClient.put(`/admin/scholarships/${campaign.id}`, { isActive: !wasActive }, { _confirm: null });
      toast.success(wasActive ? 'Campaign paused.' : 'Campaign activated.');
    } catch (error) {
      toast.error('Update failed. Refreshing list.');
      fetchCampaigns(); // Revert on failure
    }
  };

  const handleDelete = async (campaign) => {
    const ok = await confirm({
      title: 'Delete Campaign?',
      message: `"${campaign.name}" will be removed from the admin panel. If it has existing applications, it will be archived to protect student data.`,
      confirmText: 'Delete',
      variant: 'danger',
    });
    if (!ok) return;

    /* Optimistic UI: Remove instantly */
    setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));

    try {
      await apiClient.delete(`/admin/scholarships/${campaign.id}`, { _confirm: null });
      toast.success('Campaign deleted successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete. Refreshing list.');
      fetchCampaigns(); // Revert on failure
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'active', label: 'Active', count: counts.active },
    { id: 'paused', label: 'Paused', count: counts.paused },
    { id: 'closed', label: 'Closed', count: counts.closed },
  ];

  return (
    <>
      <SEOHead title="Scholarship Campaigns" />
      <AdminLayout title="Scholarship Campaigns" subtitle="Manage public offerings and monitor quotas">
        
        {/* Modern Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2 bg-bg-input p-1.5 rounded-2xl border border-border-light w-fit">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === tab.id ? 'bg-bg-card-solid text-text-main shadow-sm' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${statusFilter === tab.id ? 'bg-accent/10 text-accent' : 'bg-bg-pill text-text-dim'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-input border border-border-light text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
            <button
              onClick={() => { setEditingCampaign(null); setFormOpen(true); }}
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-text-inverse text-sm font-bold hover:bg-accent-light shadow-glow-gold hover:-translate-y-0.5 transition-all"
            >
              <Plus size={18} /> Create Campaign
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <CampaignSkeleton />
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center border-2 border-dashed border-border-light rounded-3xl bg-bg-input/50">
            <GraduationCap size={48} className="text-text-dim" />
            <div>
              <h3 className="text-lg font-extrabold text-text-main">No campaigns found</h3>
              <p className="text-sm text-text-muted mt-1">Try changing your filters or create a new one.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCampaigns.map((campaign, idx) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                index={idx}
                onEdit={() => { setEditingCampaign(campaign); setFormOpen(true); }}
                onToggleActive={() => handleToggleActive(campaign)}
                onDelete={() => handleDelete(campaign)}
                onViewApplications={() => router.push(`/admin/scholarships/${campaign.id}/applications`)}
              />
            ))}
          </div>
        )}
      </AdminLayout>

      <ScholarshipCampaignForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchCampaigns}
        campaign={editingCampaign}
      />
    </>
  );
};

export default AdminScholarshipsPage;