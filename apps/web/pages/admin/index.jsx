/**
 * @fileoverview Admin Dashboard
 *
 * Main admin overview page. Reads from /admin/dashboard/stats which
 * returns top_referrers with fields: name, email, direct_referral_count,
 * total_earned — verified against the real users schema.
 *
 * Recent pending payments come from /admin/payments endpoint which
 * joins users table for user_name/full_name.
 *
 * Path: apps/web/pages/admin/index.jsx
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Users,
  DollarSign,
  BookOpen,
  TrendingUp,
  Award,
  Eye,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import AdminLayout from '../../components/admin/AdminLayout';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';

const AdminDashboard = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, paymentsRes, referrersRes] = await Promise.allSettled([
          apiClient.get('/admin/dashboard/stats'),
          apiClient.get('/admin/payments?limit=5&status=pending'),
          apiClient.get('/admin/referrals/top?limit=5'),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
          setStats(statsRes.value.data);
        }
        if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.success) {
          setRecentPayments(paymentsRes.value.data || []);
        }
        if (referrersRes.status === 'fulfilled' && referrersRes.value?.success) {
          setTopReferrers(referrersRes.value.data || []);
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          router.push('/admin/login');
        } else {
          toast.error('Failed to load dashboard data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router, toast]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <SEOHead title="Admin Dashboard" />
        <AdminLayout
          title={t.admin?.dashboard || 'Dashboard'}
          subtitle="Platform overview and key metrics"
        >
          <div className="admin-dashboard">
            <div className="admin-stats-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="admin-stat-card">
                  <div className="admin-stat-icon shimmer" style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem' }} />
                  <div className="admin-stat-label shimmer" style={{ width: '5rem', height: '0.75rem' }} />
                  <div className="admin-stat-value shimmer" style={{ width: '4rem', height: '1.5rem' }} />
                </div>
              ))}
            </div>
            <div className="admin-dashboard-bottom">
              {Array.from({ length: 2 }).map((_, sIdx) => (
                <div key={sIdx} className="admin-recent-section">
                  <div className="admin-section-header">
                    <span className="shimmer" style={{ width: '10rem', height: '1rem' }} />
                    <span className="shimmer" style={{ width: '4rem', height: '0.75rem' }} />
                  </div>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="admin-recent-item">
                      <div className="admin-recent-info">
                        <span className="shimmer" style={{ width: '8rem', height: '0.875rem', marginBottom: '0.25rem' }} />
                        <span className="shimmer" style={{ width: '6rem', height: '0.625rem' }} />
                      </div>
                      <span className="shimmer" style={{ width: '3rem', height: '0.875rem' }} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </AdminLayout>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Admin Dashboard" />
      <AdminLayout
        title={t.admin?.dashboard || 'Dashboard'}
        subtitle="Platform overview and key metrics"
      >
        <div className="admin-dashboard">
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <Users size={24} />
              </div>
              <div className="admin-stat-label">{t.admin?.totalStudents || 'Total Students'}</div>
              <div className="admin-stat-value">{stats?.total_students?.toLocaleString() || '0'}</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <DollarSign size={24} />
              </div>
              <div className="admin-stat-label">{t.admin?.totalRevenue || 'Total Revenue'}</div>
              <div className="admin-stat-value">
                {Number(stats?.total_revenue || 0).toLocaleString()} ETB
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <BookOpen size={24} />
              </div>
              <div className="admin-stat-label">{t.admin?.totalCourses || 'Active Courses'}</div>
              <div className="admin-stat-value">{stats?.total_courses?.toLocaleString() || '0'}</div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <TrendingUp size={24} />
              </div>
              <div className="admin-stat-label">{t.admin?.pendingPayments || 'Pending Payments'}</div>
              <div className="admin-stat-value">{stats?.pending_payments?.toLocaleString() || '0'}</div>
            </div>
          </div>

          <div className="admin-dashboard-bottom">
            <div className="admin-recent-section">
              <div className="admin-section-header">
                <h3 className="admin-section-title">Recent Pending Payments</h3>
                <a href="/admin/payments" className="admin-section-link">
                  View All →
                </a>
              </div>
              {recentPayments.length === 0 ? (
                <p className="admin-section-empty">No pending payments</p>
              ) : (
                <div className="admin-recent-list">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="admin-recent-item">
                      <div className="admin-recent-info">
                        <span className="admin-recent-name">
                          {payment.user_name || payment.full_name || 'Student'}
                        </span>
                        <span className="admin-recent-meta">
                          {payment.method || '—'} · {formatDate(payment.created_at)}
                        </span>
                      </div>
                      <div className="admin-recent-actions">
                        <span className="admin-recent-amount">
                          {Number(payment.amount || 0).toLocaleString()} ETB
                        </span>
                        <a
                          href={`/admin/payments?id=${payment.id}`}
                          className="admin-recent-view"
                        >
                          <Eye size={14} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-recent-section">
              <div className="admin-section-header">
                <h3 className="admin-section-title">Top Referrers</h3>
                <a href="/admin/referrals" className="admin-section-link">
                  View All →
                </a>
              </div>
              {topReferrers.length === 0 ? (
                <p className="admin-section-empty">No referrer data yet</p>
              ) : (
                <div className="admin-recent-list">
                  {topReferrers.map((referrer) => (
                    <div key={referrer.id} className="admin-recent-item">
                      <div className="admin-recent-info">
                        <span className="admin-recent-name">
                          {referrer.name || referrer.full_name || 'Unknown'}
                        </span>
                        <span className="admin-recent-meta">
                          {referrer.direct_referral_count || referrer.referral_count || 0} referrals
                        </span>
                      </div>
                      <div className="admin-recent-actions">
                        <span className="admin-recent-amount">
                          <Award size={14} style={{ color: '#f59e0b' }} />
                          {' '}
                          {Number(referrer.total_earned || referrer.lifetime_referral_earnings || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;