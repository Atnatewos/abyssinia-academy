/**
 * @fileoverview Scholarship Stats Cards
 *
 * Four-card stats strip rendered at the top of /admin/scholarships.
 * Consumes GET /api/admin/scholarships/stats. Shows a shape-matched
 * skeleton while the request is in flight so the layout never jumps.
 *
 * All strings resolve through t.scholarships.admin.* and all styling
 * goes through admin.css design tokens (.admin-stats-grid,
 * .admin-stat-card). No raw palette, no dark: variants.
 *
 * Path: apps/web/components/admin/scholarships/ScholarshipStatsCards.jsx
 */

import { GraduationCap, CheckCircle2, Clock, Users } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { SkeletonStatsGrid } from '../../shared/Skeleton';

/**
 * Build the four display cards from a stats payload.
 *
 * @param {object} stats - Response data from /api/admin/scholarships/stats
 * @param {object} t - Translation tree
 * @returns {Array<{id: string, label: string, value: string, icon: Function, color: string, highlight?: boolean}>}
 */
const buildCards = (stats, t) => {
  const campaigns = stats?.campaigns || { total: 0, active: 0 };
  const applications = stats?.applications || {
    total: 0,
    pending: 0,
    pending_payment: 0,
    approved: 0,
    rejected: 0,
  };

  return [
    {
      id: 'totalCampaigns',
      label: t.scholarships?.admin?.statsTotalCampaigns || 'Total Campaigns',
      value: String(campaigns.total || 0),
      icon: GraduationCap,
      color: '#3b82f6',
    },
    {
      id: 'activeCampaigns',
      label: t.scholarships?.admin?.statsActiveCampaigns || 'Active Campaigns',
      value: String(campaigns.active || 0),
      icon: CheckCircle2,
      color: '#10b981',
    },
    {
      id: 'pendingApplications',
      label: t.scholarships?.admin?.statsPendingApplications || 'Pending Applications',
      value: String((applications.pending || 0) + (applications.pending_payment || 0)),
      icon: Clock,
      color: '#f59e0b',
      highlight: (applications.pending || 0) + (applications.pending_payment || 0) > 0,
    },
    {
      id: 'approvedRecipients',
      label: t.scholarships?.admin?.statsApprovedRecipients || 'Approved Recipients',
      value: String(applications.approved || 0),
      icon: Users,
      color: '#8b5cf6',
    },
  ];
};

/**
 * ScholarshipStatsCards — four-card metrics grid.
 *
 * @param {object} props
 * @param {object} props.stats - Payload from /api/admin/scholarships/stats
 * @param {boolean} [props.loading=false] - Renders skeleton when true
 */
const ScholarshipStatsCards = ({ stats, loading = false }) => {
  const { t } = useLanguage();

  if (loading) {
    return <SkeletonStatsGrid count={4} />;
  }

  const cards = buildCards(stats, t);

  return (
    <div className="admin-stats-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`admin-stat-card ${card.highlight ? 'highlight' : ''}`}
          >
            <div className="admin-stat-card-top">
              <div
                className="admin-stat-icon"
                style={{
                  background: `${card.color}15`,
                  border: `1px solid ${card.color}30`,
                }}
              >
                <Icon size={20} style={{ color: card.color }} />
              </div>
            </div>
            <p className="admin-stat-label">{card.label}</p>
            <p className="admin-stat-value" style={{ color: card.color }}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ScholarshipStatsCards;