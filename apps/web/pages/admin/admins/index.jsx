/**
 * @fileoverview Admin Management Page
 * Superadmin-only page for managing admin accounts.
 * Path: apps/web/pages/admin/admins/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  UserCog,
  Plus,
  Edit,
  Trash2,
  Shield,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/**
 * AdminManagementPage — Manage admin accounts (superadmin only).
 */
const AdminManagementPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch all admin accounts
   */
  const fetchAdmins = useCallback(async () => {
    const token = getItem('admin_token');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.get('/admin/admins');

      if (response && response.success) {
        setAdmins(response.data || []);
      } else {
        setAdmins([]);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        /*
         * If the endpoint doesn't exist yet, show empty state gracefully
         */
        setAdmins([]);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return (
    <>
      <SEOHead title="Admin Accounts" />
      <AdminLayout
        title="Admin Accounts"
        subtitle="Manage administrator access and permissions"
      >
        {/* Header with Create Button */}
        <div className="admin-toolbar">
          <div className="admin-search" style={{ flex: 1 }} />
          <button className="admin-toolbar-btn" onClick={() => {}}>
            <Plus size={16} />
            <span>Create Admin</span>
          </button>
        </div>

        {/* Admins List */}
        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}>
            <div className="spinner-circle" />
          </div>
        ) : admins.length > 0 ? (
          <div className="admin-table-wrapper">
            {admins.map((admin) => (
              <div key={admin.id} className="admin-table-row">
                <div className="admin-table-info">
                  <div className="admin-table-info-top">
                    <Shield size={14} style={{ color: 'var(--accent-gold)' }} />
                    <span className="admin-table-name">
                      {admin.username}
                    </span>
                    <span className={`status-badge ${admin.role === 'superadmin' ? 'approved' : 'pending'}`}>
                      {admin.role || 'admin'}
                    </span>
                    {admin.is_active === false && (
                      <span className="status-badge rejected">Disabled</span>
                    )}
                  </div>
                  <p className="admin-table-meta">
                    {admin.email} · Last Login:{' '}
                    {admin.last_login
                      ? new Date(admin.last_login).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
                <div className="admin-table-actions-wrapper">
                  <div className="admin-table-action-btns">
                    <button className="admin-action-btn view" title="Edit Admin">
                      <Edit size={16} />
                    </button>
                    {admin.role !== 'superadmin' && (
                      <button className="admin-action-btn reject" title="Delete Admin">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <UserCog size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
            <h3 className="empty-state-title">Admin Management</h3>
            <p className="empty-state-desc">
              {admins.length === 0
                ? 'Admin account management will be available in a future update.'
                : 'No admin accounts found.'}
            </p>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminManagementPage;