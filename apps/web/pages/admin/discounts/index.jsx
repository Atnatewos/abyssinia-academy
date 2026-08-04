/**
 * @fileoverview Admin Discount Codes Page
 * Manage promotional discount codes.
 * Path: apps/web/pages/admin/discounts/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Tag, Plus, Edit, Trash2, Search } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/**
 * AdminDiscountsPage — Discount code management.
 */
const AdminDiscountsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Fetch all discount codes
   */
  const fetchDiscounts = useCallback(async () => {
    const token = getItem('admin_token');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.get('/admin/discounts');

      if (response && response.success) {
        setDiscounts(response.data || []);
      } else {
        setDiscounts([]);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        setDiscounts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  /**
   * Filter by search term
   */
  const filteredDiscounts = discounts.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return d.code && d.code.toLowerCase().includes(term);
  });

  return (
    <>
      <SEOHead title={t.discounts?.adminTitle || 'Discount Codes'} />
      <AdminLayout
        title={t.discounts?.adminTitle || 'Discount Codes'}
        subtitle="Create and manage promotional discount codes"
      >
        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code..."
            />
          </div>
          <button className="admin-toolbar-btn" onClick={() => router.push('/admin/discounts/create')}>
            <Plus size={16} />
            <span>{t.discounts?.adminCreate || 'Create Discount Code'}</span>
          </button>
        </div>

        {/* Discounts List */}
        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}>
            <div className="spinner-circle" />
          </div>
        ) : filteredDiscounts.length > 0 ? (
          <div className="admin-table-wrapper">
            {filteredDiscounts.map((discount) => (
              <div key={discount.id} className="admin-table-row">
                <div className="admin-table-info">
                  <div className="admin-table-info-top">
                    <Tag size={14} style={{ color: 'var(--accent-gold)' }} />
                    <span className="admin-table-name" style={{ fontFamily: 'var(--font-mono)' }}>
                      {discount.code}
                    </span>
                    <span className={`status-badge ${discount.status === 'active' ? 'approved' : discount.status === 'paused' ? 'pending' : 'rejected'}`}>
                      {discount.status}
                    </span>
                  </div>
                  <p className="admin-table-meta">
                    {discount.type === 'percentage'
                      ? `${discount.value}% off`
                      : `${discount.value} ETB off`}
                    {' · '}
                    {discount.current_total_uses || 0}/
                    {discount.max_total_uses > 0
                      ? discount.max_total_uses
                      : (t.discounts?.adminUnlimited || 'Unlimited')}{' '}
                    uses
                  </p>
                  <p className="admin-table-meta">
                    {discount.valid_until
                      ? `Expires: ${new Date(discount.valid_until).toLocaleDateString()}`
                      : (t.discounts?.adminNoExpiration || 'Never expires')}
                  </p>
                </div>
                <div className="admin-table-actions-wrapper">
                  <div className="admin-table-action-btns">
                    <button
                      className="admin-action-btn view"
                      title={t.discounts?.adminEdit || 'Edit'}
                      onClick={() => router.push(`/admin/discounts/${discount.id}/edit`)}
                    >
                      <Edit size={16} />
                    </button>
                    <button className="admin-action-btn reject" title={t.discounts?.adminDelete || 'Delete'}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Tag size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <h3 className="empty-state-title">{t.discounts?.adminTitle || 'Discount Codes'}</h3>
            <p className="empty-state-desc">
              {searchTerm
                ? 'No discount codes match your search.'
                : (t.discounts?.noActiveCodes || 'No discount codes created yet.')}
            </p>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminDiscountsPage;