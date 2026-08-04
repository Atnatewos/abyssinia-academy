/**
 * @fileoverview Admin Referrals Page
 * Referral management and top referrers leaderboard.
 * Path: apps/web/pages/admin/referrals/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Share2, Award, TrendingUp } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/**
 * AdminReferralsPage — Referral system management.
 */
const AdminReferralsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [referrals, setReferrals] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);

    try {
      const [referralsRes, topRes] = await Promise.all([
        apiClient.get('/admin/referrals?limit=50'),
        apiClient.get('/admin/referrals/top'),
      ]);

      if (referralsRes?.success) setReferrals(referralsRes.data || []);
      if (topRes?.success) setTopReferrers(topRes.data || []);
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load referral data.');
      }
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <SEOHead title="Referrals" />
      <AdminLayout
        title={t.referrals?.dashboardTitle || 'Referrals'}
        subtitle="Manage referral system and view top referrers"
      >
        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}>
            <div className="spinner-circle" />
          </div>
        ) : (
          <div className="admin-referrals-page">
            {/* Top Referrers */}
            <div className="admin-chart-card" style={{ marginBottom: '1.5rem' }}>
              <div className="admin-chart-header">
                <Award size={18} />
                <h3 className="admin-chart-title">Top Referrers</h3>
              </div>
              {topReferrers.length > 0 ? (
                <div className="admin-referrers-mini">
                  {topReferrers.map((referrer, index) => (
                    <div key={referrer.id || index} className="admin-referrer-mini-row">
                      <div className="admin-referrer-mini-rank">
                        <span className="admin-referrer-medal" style={{ color: index < 3 ? ['#ffd700', '#c0c0c0', '#cd7f32'][index] : 'var(--text-dim)' }}>
                          {index + 1}
                        </span>
                      </div>
                      <div className="admin-referrer-mini-info">
                        <span className="admin-referrer-mini-name">
                          {referrer.full_name || referrer.user_name || 'Anonymous'}
                        </span>
                        <span className="admin-referrer-mini-stats">
                          {referrer.total_referrals || referrer.referralCount || 0} referrals ·{' '}
                          {(referrer.total_credit_earned || referrer.creditEarned || 0).toLocaleString()} ETB
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-chart-empty"><p>No referral data yet.</p></div>
              )}
            </div>

            {/* All Referrals */}
            <div className="admin-chart-card">
              <div className="admin-chart-header">
                <TrendingUp size={18} />
                <h3 className="admin-chart-title">Recent Referrals</h3>
              </div>
              {referrals.length > 0 ? (
                <div className="admin-table-wrapper">
                  {referrals.map((ref) => (
                    <div key={ref.id} className="admin-table-row">
                      <div className="admin-table-info">
                        <div className="admin-table-info-top">
                          <span className="admin-table-name">
                            {ref.referrer_name || 'Referrer'} → {ref.referred_name || 'Referred'}
                          </span>
                          <span className={`status-badge ${ref.status}`}>{ref.status}</span>
                        </div>
                        <p className="admin-table-meta">
                          Code: {ref.referral_code} ·{' '}
                          {new Date(ref.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="admin-table-amount">
                        +{ref.referrer_credit_amount?.toLocaleString() || 0} ETB
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-chart-empty"><p>No referrals yet.</p></div>
              )}
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminReferralsPage;