/**
 * @fileoverview Admin Analytics Page
 * Visitor statistics: total, today, this week, top pages.
 * Path: apps/web/pages/admin/analytics/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { Eye, Users, FileText, TrendingUp } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

const AdminAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await apiClient.get('/admin/analytics/visitors');
      if (response && response.success) {
        setStats(response.data);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const statCards = stats ? [
    { icon: Users, label: 'Total Visitors', value: stats.totalVisitors.toLocaleString(), color: '#3b82f6' },
    { icon: Eye, label: "Today's Visitors", value: stats.todayVisitors.toLocaleString(), color: '#10b981' },
    { icon: FileText, label: 'Total Page Views', value: stats.totalViews.toLocaleString(), color: '#f59e0b' },
    { icon: TrendingUp, label: 'This Week', value: stats.weekVisitors.toLocaleString(), color: '#8b5cf6' },
  ] : [];

  return (
    <>
      <SEOHead title="Analytics" />
      <AdminLayout title="Analytics" subtitle="Site visitor statistics">
        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}><div className="spinner-circle" /></div>
        ) : stats ? (
          <>
            {/* Stats Cards */}
            <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div key={index} className="admin-stat-card">
                    <div className="admin-stat-icon" style={{ background: `${card.color}15`, color: card.color }}>
                      <Icon size={20} />
                    </div>
                    <p className="admin-stat-label">{card.label}</p>
                    <p className="admin-stat-value" style={{ color: card.color }}>{card.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Top Pages */}
            <div className="admin-table-card">
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>
                Most Visited Pages
              </h3>
              <div className="admin-table-wrapper">
                {stats.topPages.map((page, index) => (
                  <div key={index} className="admin-table-row">
                    <div className="admin-table-info">
                      <span className="admin-table-name" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                        {page.path}
                      </span>
                    </div>
                    <span className="admin-table-amount">
                      {page.views.toLocaleString()} views
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <Eye size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <p className="empty-state-desc">No analytics data yet.</p>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminAnalyticsPage;