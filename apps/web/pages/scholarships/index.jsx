/**
 * @fileoverview Admin Scholarship Campaigns — List Page
 *
 * Card-grid campaign management on shared admin primitives. Fetching
 * runs through useAdminQuery (auth gate, stale guard, 401 redirect);
 * pause/activate/delete run through useAdminMutation with styled
 * confirmations and optimistic updates that revert on failure.
 *
 * All copy resolves from admin.scholarships.* / scholarships.admin.*
 * i18n; every visual value flows through the Tailwind token bridge.
 *
 * Path: apps/web/pages/admin/scholarships/index.jsx
 */

import { useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  ArrowRight,
  GraduationCap,
  Award,
  Users,
  Gift,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import ScholarshipCampaignForm from '../../../components/admin/scholarships/ScholarshipCampaignForm';
import AdminToolbar from '../../../components/admin/ui/AdminToolbar';
import AdminTabs from '../../../components/admin/ui/AdminTabs';
import AdminButton from '../../../components/admin/ui/AdminButton';
import AdminBadge from '../../../components/admin/ui/AdminBadge';
import AdminEmptyState from '../../../components/admin/ui/AdminEmptyState';
import { AdminSkeletonBase } from '../../../components/admin/ui/AdminSkeleton';
import { useLanguage } from '../../../context/LanguageContext';
import useAdminQuery, { useDebouncedValue } from '../../../lib/admin/useAdminQuery';
import useAdminMutation from '../../../lib/admin/useAdminMutation';
import { resolveLabel, interpolate } from '../../../lib/admin/labels';
import { getScholarshipAdminConfig } from '../../../lib/config';

/* ── Helpers ──────────────────────────────────────────────────────── */

const campaignStatus = (campaign) => {
  if (
    campaign.applications_close_at &&
    new Date(campaign.applications_close_at) < new Date()
  ) {
    return 'closed';
  }
  return campaign.is_active ? 'active' : 'paused';
};

const QUOTA_WARNING_THRESHOLD = 90;

/* ── Skeleton grid ────────────────────────────────────────────────── */

const CampaignSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5" aria-busy="true">
    {Array.from({ length: 3 }).map((_, index) => (
      <div
        key={`campaign-skeleton-${index}`}
        className="rounded-2xl border border-solid border-border-light bg-bg-card-solid p-5 flex flex-col gap-3"
      >
        <AdminSkeletonBase className="h-28 w-full rounded-xl" />
        <AdminSkeletonBase className="h-4 w-3/5" />
        <AdminSkeletonBase className="h-3 w-2/5" />
        <div className="flex gap-2">
          <AdminSkeletonBase className="h-5 w-20 rounded-full" />
          <AdminSkeletonBase className="h-5 w-20 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

/* ── Campaign card ────────────────────────────────────────────────── */

const CampaignCard = ({
  campaign,
  busy,
  onEdit,
  onToggleActive,
  onDelete,
  onViewApplications,
  label,
  currency,
}) => {
  const status = campaignStatus(campaign);
  const approvedCount = Number(campaign.approved_count) || 0;
  const quota = Number(campaign.quota) || 0;
  const remaining = Math.max(0, quota - approvedCount);
  const quotaPct =
    quota > 0 ? Math.min(100, Math.round((approvedCount / quota) * 100)) : 0;
  const fee = Number(campaign.registration_fee_etb) || 0;

  return (
    <article className="group relative rounded-2xl border border-solid border-border-light bg-bg-card-solid overflow-hidden hover:-translate-y-1 hover:border-accent/40 hover:shadow-glow-gold transition-all duration-slow motion-reduce:hover:translate-y-0 motion-reduce:transition-none flex flex-col">
      {/* Cover band */}
      <div className="relative h-28 overflow-hidden bg-bg-input">
        {campaign.cover_image_url && (
          <img
            src={campaign.cover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-slower motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card-solid via-bg-card-solid/40 to-transparent" />
        <div className="absolute top-4 right-4">
          <AdminBadge status={status} pulse={status === 'active'}>
            {label(`admin.common.statuses.${status}`) || status}
          </AdminBadge>
        </div>
      </div>

      <div className="pt-2 px-5 pb-5 flex flex-col gap-4 flex-1">
        {/* Identity */}
        <div className="-mt-6 relative z-above">
          <div className="w-12 h-12 rounded-xl bg-accent text-on-accent flex items-center justify-center shadow-glow-gold-sm border-4 border-solid border-bg-card-solid mb-2">
            <GraduationCap size={20} aria-hidden="true" />
          </div>
          <h3 className="m-0 text-lg font-extrabold text-text-main leading-tight line-clamp-1">
            {campaign.name}
          </h3>
          <p className="m-0 mt-0.5 text-2xs text-text-dim font-mono truncate">
            /{campaign.slug}
          </p>
        </div>

        {/* Grant + fee badges */}
        <div className="flex flex-wrap gap-2">
          <AdminBadge tone="accent">
            <Award size={12} aria-hidden="true" />
            {campaign.grants_full_course
              ? label('admin.scholarships.fullCourse')
              : label('admin.scholarships.specificPhases')}
          </AdminBadge>
          <AdminBadge tone={fee > 0 ? 'warning' : 'success'}>
            <Gift size={12} aria-hidden="true" />
            {fee > 0
              ? interpolate(label('admin.scholarships.feeAmount'), {
                  amount: fee.toLocaleString(),
                })
              : label('admin.scholarships.freeEntry')}
          </AdminBadge>
        </div>

        {/* Quota progress */}
        {quota > 0 && (
          <div className="bg-bg-input/50 p-3 rounded-xl border border-solid border-border-light">
            <div className="flex items-center justify-between text-2xs mb-1.5">
              <span className="text-text-muted font-semibold flex items-center gap-1">
                <Users size={12} aria-hidden="true" />
                {interpolate(label('admin.scholarships.approvedProgress'), {
                  approved: approvedCount,
                  quota,
                })}
              </span>
              <span className="text-text-main font-bold">
                {interpolate(label('admin.scholarships.spotsLeft'), { count: remaining })}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={quotaPct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-1.5 rounded-full bg-border-light overflow-hidden"
            >
              <div
                className={`h-full rounded-full transition-all duration-slower motion-reduce:transition-none ${
                  quotaPct >= QUOTA_WARNING_THRESHOLD
                    ? 'bg-gradient-to-r from-warning to-error'
                    : 'bg-gradient-to-r from-accent to-accent-light'
                }`}
                style={{ width: `${quotaPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <AdminButton
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={onViewApplications}
          >
            {label('admin.scholarships.viewApplications')}
            <ArrowRight size={14} aria-hidden="true" />
          </AdminButton>
          <div className="flex items-center bg-bg-input rounded-xl border border-solid border-border-light p-1">
            <AdminButton
              variant="ghost"
              size="sm"
              iconOnly
              onClick={onEdit}
              aria-label={label('admin.scholarships.editCampaign')}
              title={label('admin.scholarships.editCampaign')}
            >
              <Edit size={16} aria-hidden="true" />
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              iconOnly
              loading={busy}
              onClick={onToggleActive}
              aria-label={
                campaign.is_active
                  ? label('admin.scholarships.pauseCampaign')
                  : label('admin.scholarships.activateCampaign')
              }
              title={
                campaign.is_active
                  ? label('admin.scholarships.pauseCampaign')
                  : label('admin.scholarships.activateCampaign')
              }
            >
              {campaign.is_active ? <PowerOff size={16} /> : <Power size={16} />}
            </AdminButton>
            <AdminButton
              variant="ghost"
              size="sm"
              iconOnly
              loading={busy}
              onClick={onDelete}
              aria-label={label('admin.scholarships.deleteCampaign')}
              title={label('admin.scholarships.deleteCampaign')}
              className="hover:text-error hover:bg-error/10"
            >
              <Trash2 size={16} aria-hidden="true" />
            </AdminButton>
          </div>
        </div>
      </div>
    </article>
  );
};

/* ── Page ─────────────────────────────────────────────────────────── */

const AdminScholarshipsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { mutate, busy } = useAdminMutation();
  const adminConfig = getScholarshipAdminConfig();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [actionId, setActionId] = useState(null);
  const [optimistic, setOptimistic] = useState(null);

  const debouncedSearch = useDebouncedValue(searchTerm);
  const label = (key) => resolveLabel(t, key);
  const currency = label('admin.common.labels.currency');
  const pageSize = Number(adminConfig.applicationsPerPage) || 200;

  const { data, loading, refetch } = useAdminQuery({
    url: `/admin/scholarships?pageSize=${pageSize}`,
    select: (response) => response.data?.campaigns || [],
    initialData: [],
    errorKey: 'admin.scholarships.loadFailed',
  });

  const campaigns = optimistic ?? data ?? [];

  const counts = useMemo(() => {
    const base = { all: campaigns.length, active: 0, paused: 0, closed: 0 };
    for (const campaign of campaigns) base[campaignStatus(campaign)] += 1;
    return base;
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return campaigns.filter((campaign) => {
      const status = campaignStatus(campaign);
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (!term) return true;
      return (
        campaign.name?.toLowerCase().includes(term) ||
        campaign.slug?.toLowerCase().includes(term)
      );
    });
  }, [campaigns, statusFilter, debouncedSearch]);

  const filterTabs = [
    { id: 'all', label: label('admin.common.filters.all'), count: counts.all },
    { id: 'active', label: label('admin.common.statuses.active'), count: counts.active },
    { id: 'paused', label: label('admin.common.statuses.paused'), count: counts.paused },
    { id: 'closed', label: label('admin.common.statuses.expired'), count: counts.closed },
  ];

  const handleToggleActive = async (campaign) => {
    const wasActive = campaign.is_active;
    setActionId(campaign.id);
    setOptimistic(
      campaigns.map((c) =>
        c.id === campaign.id ? { ...c, is_active: !wasActive } : c
      )
    );

    const response = await mutate({
      method: 'put',
      url: `/admin/scholarships/${campaign.id}`,
      payload: { isActive: !wasActive },
      confirm: {
        title: wasActive
          ? label('admin.scholarships.confirmPauseTitle')
          : label('admin.scholarships.confirmActivateTitle'),
        message: label('admin.scholarships.confirmToggleMessage'),
        confirmText: wasActive
          ? label('admin.scholarships.pauseCampaign')
          : label('admin.scholarships.activateCampaign'),
        variant: 'warning',
      },
      successKey: wasActive
        ? 'admin.scholarships.paused'
        : 'admin.scholarships.activated',
      errorKey: 'admin.scholarships.toggleFailed',
      onSuccess: () => {
        setOptimistic(null);
        refetch();
      },
    });

    if (!response) {
      setOptimistic(null);
      refetch();
    }
    setActionId(null);
  };

  const handleDelete = async (campaign) => {
    setActionId(campaign.id);
    setOptimistic(campaigns.filter((c) => c.id !== campaign.id));

    const response = await mutate({
      method: 'delete',
      url: `/admin/scholarships/${campaign.id}`,
      confirm: {
        title: label('admin.scholarships.confirmDeleteTitle'),
        message: interpolate(label('admin.scholarships.confirmDeleteMessage'), {
          name: campaign.name,
        }),
        confirmText: label('admin.common.actions.delete'),
        variant: 'danger',
      },
      successKey: 'admin.scholarships.deleted',
      errorKey: 'admin.scholarships.deleteFailed',
      onSuccess: () => {
        setOptimistic(null);
        refetch();
      },
    });

    if (!response) {
      setOptimistic(null);
      refetch();
    }
    setActionId(null);
  };

  const hasActiveFilters = Boolean(debouncedSearch) || statusFilter !== 'all';

  return (
    <>
      <SEOHead title={label('admin.scholarships.pageTitle')} />
      <AdminLayout
        title={label('admin.scholarships.pageTitle')}
        subtitle={label('admin.scholarships.pageSubtitle')}
      >
        <AdminTabs
          tabs={filterTabs}
          active={statusFilter}
          onChange={setStatusFilter}
          ariaLabel={label('admin.scholarships.pageTitle')}
        />

        <AdminToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder={label('admin.scholarships.searchPlaceholder')}
          actions={
            <AdminButton
              variant="primary"
              onClick={() => {
                setEditingCampaign(null);
                setFormOpen(true);
              }}
            >
              <Plus size={18} aria-hidden="true" />
              {label('admin.scholarships.createCampaign')}
            </AdminButton>
          }
        />

        {loading ? (
          <CampaignSkeleton />
        ) : filteredCampaigns.length === 0 ? (
          <AdminEmptyState
            icon={GraduationCap}
            title={label('admin.scholarships.emptyTitle')}
            description={
              hasActiveFilters
                ? label('admin.scholarships.emptyFiltered')
                : label('admin.scholarships.emptyAll')
            }
            action={
              !hasActiveFilters ? (
                <AdminButton
                  variant="primary"
                  onClick={() => {
                    setEditingCampaign(null);
                    setFormOpen(true);
                  }}
                >
                  <Plus size={16} aria-hidden="true" />
                  {label('admin.scholarships.createCampaign')}
                </AdminButton>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                busy={busy && actionId === campaign.id}
                label={label}
                currency={currency}
                onEdit={() => {
                  setEditingCampaign(campaign);
                  setFormOpen(true);
                }}
                onToggleActive={() => handleToggleActive(campaign)}
                onDelete={() => handleDelete(campaign)}
                onViewApplications={() =>
                  router.push(`/admin/scholarships/${campaign.id}/applications`)
                }
              />
            ))}
          </div>
        )}
      </AdminLayout>

      <ScholarshipCampaignForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={refetch}
        campaign={editingCampaign}
      />
    </>
  );
};

export default AdminScholarshipsPage;