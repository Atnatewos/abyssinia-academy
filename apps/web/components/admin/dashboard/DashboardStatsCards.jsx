/**
 * @fileoverview Dashboard Stats Cards Component
 * Displays 6 key metric cards at the top of the admin dashboard.
 * ALL display text from i18n → t.admin.*
 * Path: apps/web/components/admin/dashboard/DashboardStatsCards.jsx
 */

import React from 'react';
import {
  Users,
  UserCheck,
  Clock,
  DollarSign,
  Tag,
  Share2,
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

/**
 * DashboardStatsCards — Six-card grid showing key platform metrics.
 *
 * @param {object} props
 * @param {object} props.stats - Statistics data from the API
 */
const DashboardStatsCards = ({ stats = {} }) => {
  const { t } = useLanguage();

  /*
   * Build the stat cards from API data with safe fallbacks
   */
  const cards = [
    {
      id: 'totalStudents',
      label: t.admin?.totalStudents || 'Total Students',
      value: (stats.totalStudents || 0).toLocaleString(),
      icon: Users,
      color: '#3b82f6',
      trend: stats.studentGrowth || null,
    },
    {
      id: 'enrolledStudents',
      label: t.admin?.enrolledStudents || 'Enrolled Students',
      value: (stats.enrolledStudents || 0).toLocaleString(),
      icon: UserCheck,
      color: '#10b981',
      trend: stats.enrollmentGrowth || null,
    },
    {
      id: 'pendingPayments',
      label: t.admin?.pendingPayments || 'Pending Payments',
      value: (stats.pendingPayments || 0).toLocaleString(),
      icon: Clock,
      color: '#f59e0b',
      highlight: stats.pendingPayments > 0,
    },
    {
      id: 'totalRevenue',
      label: t.admin?.totalRevenue || 'Total Revenue',
      value: `${(stats.totalRevenue || 0).toLocaleString()} ETB`,
      icon: DollarSign,
      color: '#10b981',
      trend: stats.revenueGrowth || null,
    },
    {
      id: 'activeDiscounts',
      label: t.discounts?.adminTotalCodes || 'Active Discount Codes',
      value: (stats.activeDiscountCodes || 0).toLocaleString(),
      icon: Tag,
      color: '#8b5cf6',
    },
    {
      id: 'totalReferrals',
      label: t.referrals?.totalReferrals || 'Total Referrals',
      value: (stats.totalReferrals || 0).toLocaleString(),
      icon: Share2,
      color: '#ec4899',
    },
  ];

  return (
    <div className="admin-stats-grid admin-stats-grid-6">
      {cards.map((card) => (
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
              <card.icon size={20} style={{ color: card.color }} />
            </div>

            {card.trend !== null && card.trend !== undefined && (
              <span
                className={`admin-stat-trend ${card.trend >= 0 ? 'up' : 'down'}`}
              >
                {card.trend >= 0 ? '↑' : '↓'} {Math.abs(card.trend)}%
              </span>
            )}
          </div>

          <p className="admin-stat-label">{card.label}</p>
          <p className="admin-stat-value" style={{ color: card.color }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStatsCards;