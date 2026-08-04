/**
 * @fileoverview Admin Analytics Page
 * Platform analytics and insights overview.
 * Path: apps/web/pages/admin/analytics/index.jsx
 */

import { TrendingUp, BarChart3, Users, DollarSign } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';

/**
 * AdminAnalyticsPage — Analytics dashboard overview.
 */
const AdminAnalyticsPage = () => {
  const { t } = useLanguage();

  const analyticsCards = [
    {
      icon: DollarSign,
      title: 'Revenue Analytics',
      description: 'Track revenue by month, payment method, and course type.',
      color: '#10b981',
    },
    {
      icon: Users,
      title: 'Enrollment Analytics',
      description: 'Monitor new enrollments, conversion rates, and student growth.',
      color: '#3b82f6',
    },
    {
      icon: BarChart3,
      title: 'Discount Analytics',
      description: 'See most-used codes, total discounts given, and average savings.',
      color: '#8b5cf6',
    },
    {
      icon: TrendingUp,
      title: 'Referral Analytics',
      description: 'Track referral conversion rates and top performer metrics.',
      color: '#ec4899',
    },
  ];

  return (
    <>
      <SEOHead title="Analytics" />
      <AdminLayout
        title="Analytics"
        subtitle="Platform insights and performance metrics"
      >
        <div className="admin-analytics-grid">
          {analyticsCards.map((card, index) => (
            <div key={index} className="admin-analytics-card">
              <div
                className="admin-analytics-card-icon"
                style={{
                  background: `${card.color}15`,
                  border: `1px solid ${card.color}30`,
                }}
              >
                <card.icon size={28} style={{ color: card.color }} />
              </div>
              <h3 className="admin-analytics-card-title">{card.title}</h3>
              <p className="admin-analytics-card-desc">{card.description}</p>
              <span className="admin-analytics-card-status">Coming Soon</span>
            </div>
          ))}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminAnalyticsPage;