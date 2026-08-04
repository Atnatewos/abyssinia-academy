/**
 * @fileoverview Admin Discount Code Usage Page
 * Shows usage history for a specific discount code.
 * Path: apps/web/pages/admin/discounts/[id]/usage.jsx
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Tag, Users } from 'lucide-react';
import Link from 'next/link';
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import { useLanguage } from '../../../../context/LanguageContext';
import { useToast } from '../../../../context/ToastContext';
import apiClient from '../../../../lib/api';
import { getItem } from '../../../../lib/storage';

/**
 * AdminDiscountUsagePage — View discount code usage history.
 */
const AdminDiscountUsagePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useLanguage();
  const toast = useToast();

  const [discount, setDiscount] = useState(null);
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  /*
   * Fetch discount code details and usage history
   */
  useEffect(() => {
    if (!id) return;

    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [discountRes, usageRes] = await Promise.all([
          apiClient.get(`/admin/discounts/${id}`),
          apiClient.get(`/admin/discounts/${id}/usage`),
        ]);

        if (discountRes?.success) setDiscount(discountRes.data);
        if (usageRes?.success) setUsage(usageRes.data || []);
      } catch (err) {
        toast.error('Failed to load usage data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router, toast]);

  return (
    <>
      <SEOHead title={t.discounts?.adminUsageHistory || 'Usage History'} />
      <AdminLayout
        title={t.discounts?.adminUsageHistory || 'Usage History'}
        subtitle={discount ? `Code: ${discount.code}` : 'Loading...'}
      >
        <Link href="/admin/discounts" className="profile-back-link">
          <ArrowLeft size={16} />
          Back to Discount Codes
        </Link>

        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}>
            <div className="spinner-circle" />
          </div>
        ) : usage.length > 0 ? (
          <div className="admin-table-wrapper">
            {usage.map((item) => (
              <div key={item.id} className="admin-table-row">
                <div className="admin-table-info">
                  <div className="admin-table-info-top">
                    <Users size={14} style={{ color: 'var(--accent-gold)' }} />
                    <span className="admin-table-name">
                      {item.user_name || item.full_name || 'Unknown User'}
                    </span>
                  </div>
                  <p className="admin-table-meta">
                    Original: {item.original_amount?.toLocaleString()} ETB · Discount: {item.discount_amount?.toLocaleString()} ETB · Final: {item.final_amount?.toLocaleString()} ETB
                  </p>
                  <p className="admin-table-meta">
                    {new Date(item.applied_at).toLocaleString()}
                    {item.ip_address ? ` · IP: ${item.ip_address}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Tag size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <p className="empty-state-desc">This discount code has not been used yet.</p>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminDiscountUsagePage;