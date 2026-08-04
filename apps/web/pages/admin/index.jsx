/**
 * @fileoverview Admin Dashboard Page
 * God-level overview with stat cards, revenue chart, enrollment chart,
 * recent payments, and top referrers.
 * Path: apps/web/pages/admin/index.jsx
 */

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Users,
  UserCheck,
  Clock,
  DollarSign,
  Tag,
  Share2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Check,
  X,
  Eye,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import AdminLayout from '../../components/admin/AdminLayout';
import DashboardStatsCards from '../../components/admin/dashboard/DashboardStatsCards';
import DashboardRevenueChart from '../../components/admin/dashboard/DashboardRevenueChart';
import DashboardEnrollmentChart from '../../components/admin/dashboard/DashboardEnrollmentChart';
import DashboardRecentPayments from '../../components/admin/dashboard/DashboardRecentPayments';
import DashboardTopReferrers from '../../components/admin/dashboard/DashboardTopReferrers';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';
import { getItem } from '../../lib/storage';

/**
 * AdminDashboard — Main admin overview page.
 * Shows comprehensive platform statistics and quick actions.
 */
const AdminDashboard = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
   * Fetch all dashboard data on mount
   */
  useEffect(() => {
    const token = getItem('admin_token');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchDashboard = async () => {
      setLoading(true);

      try {
        /*
         * Fetch stats, revenue, enrollments, recent payments, top referrers
         * in parallel for speed
         */
        const [statsRes, revenueRes, enrollmentRes, paymentsRes, referrersRes] =
          await Promise.allSettled([
            apiClient.get('/admin/dashboard/stats'),
            apiClient.get('/admin/dashboard/revenue-chart'),
            apiClient.get('/admin/dashboard/enrollment-chart'),
            apiClient.get('/admin/payments?limit=5&status=pending'),
            apiClient.get('/admin/referrals?limit=5'),
          ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.success) {
          setStats(statsRes.value.data);
        }

        if (revenueRes.status === 'fulfilled' && revenueRes.value?.success) {
          setRevenueData(revenueRes.value.data);
        }

        if (enrollmentRes.status === 'fulfilled' && enrollmentRes.value?.success) {
          setEnrollmentData(enrollmentRes.value.data);
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
  }, [router]);

  return (
    <>
      <SEOHead title="Admin Dashboard" />
      <AdminLayout
        title={t.admin?.dashboard || 'Dashboard'}
        subtitle="Platform overview and key metrics"
      >
        {loading ? (
          <div className="spinner" style={{ marginTop: '4rem' }}>
            <div className="spinner-circle" />
          </div>
        ) : (
          <div className="admin-dashboard">
            {/* ── Stat Cards Row ── */}
            <DashboardStatsCards stats={stats} />

            {/* ── Charts Row ── */}
            <div className="admin-dashboard-charts">
              <DashboardRevenueChart data={revenueData} />
              <DashboardEnrollmentChart data={enrollmentData} />
            </div>

            {/* ── Bottom Row: Recent Payments + Top Referrers ── */}
            <div className="admin-dashboard-bottom">
              <DashboardRecentPayments
                payments={recentPayments}
                onRefresh={() => {}}
              />
              <DashboardTopReferrers referrers={topReferrers} />
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;