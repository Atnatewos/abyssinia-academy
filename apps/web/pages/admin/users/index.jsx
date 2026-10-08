/**
 * @fileoverview Admin Users Page
 *
 * General user management with search, role/status filters, and inline
 * shimmer loading rows that mirror the real admin-table markup.
 *
 * Status badge mapping follows the derived API contract:
 *   enrolled   → green  (status-badge approved)
 *   registered → blue   (status-badge registered)
 *   suspended  → red    (status-badge rejected)
 *   fallback   → gold   (status-badge pending)
 *
 * Path: apps/web/pages/admin/users/index.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search, Eye, Shield, User } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/**
 * Map a derived user status to its semantic badge class.
 * @param {string} status - Status value from the users API
 * @returns {string} Badge class pair
 */
const getStatusClass = (status) => {
  if (status === 'enrolled' || status === 'active') return 'status-badge approved';
  if (status === 'registered') return 'status-badge registered';
  if (status === 'suspended' || status === 'banned') return 'status-badge rejected';
  return 'status-badge pending';
};

const AdminUsersPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchUsers = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      if (response.success) {
        setUsers(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load users');
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load users');
      }
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchTerm, router, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getRoleIcon = (role) => {
    if (role === 'admin') return <Shield size={12} />;
    return <User size={12} />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Inline shimmer row — reuses the real admin-table classes so loading
   * rows inherit identical padding, typography, and badge geometry.
   */
  const renderShimmerRow = (index) => (
    <div key={`shimmer-${index}`} className="admin-table-row">
      <div className="admin-table-info">
        <div className="admin-table-info-top">
          <div className="admin-table-avatar shimmer" />
          <div className="admin-table-name-block">
            <span className="admin-table-name shimmer" style={{ width: '55%', height: '0.875rem' }} />
            <span className="admin-table-sub shimmer" style={{ width: '35%', height: '0.75rem' }} />
          </div>
          <span className="role-badge shimmer" style={{ width: '3.5rem', height: '1.25rem' }} />
          <span className="status-badge shimmer" style={{ width: '4rem', height: '1.25rem' }} />
        </div>
        <p className="admin-table-meta">
          <span className="shimmer" style={{ display: 'inline-block', width: '12rem', height: '0.75rem' }} />
        </p>
      </div>
      <div className="admin-table-actions-wrapper">
        <div className="admin-table-meta-col">
          <span className="shimmer" style={{ width: '5rem', height: '0.75rem' }} />
          <span className="shimmer" style={{ width: '5rem', height: '0.75rem' }} />
        </div>
        <div className="admin-table-action-btns">
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead title="Users Management" />
      <AdminLayout
        title={t.admin?.users?.title || 'Users Management'}
        subtitle="View and manage all platform users"
      >
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
            />
          </div>
          <select
            className="admin-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
            <option value="referrer">Referrers</option>
          </select>
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="enrolled">Enrolled</option>
            <option value="registered">Registered</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-table-wrapper">
            {Array.from({ length: 6 }).map((_, i) => renderShimmerRow(i))}
          </div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-desc">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'No users match your filters.'
                : 'No users found.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            {users.map((user) => (
              <div key={user.id} className="admin-table-row">
                <div className="admin-table-info">
                  <div className="admin-table-info-top">
                    <div className="admin-table-avatar">
                      {(user.name || user.full_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="admin-table-name-block">
                      <span className="admin-table-name">
                        {user.name || user.full_name || 'Unknown'} {getRoleIcon(user.role)}
                      </span>
                      <span className="admin-table-sub">{user.email || '—'}</span>
                    </div>
                    <span className={`role-badge role-${user.role || 'user'}`}>
                      {user.role || 'user'}
                    </span>
                    <span className={getStatusClass(user.status)}>
                      {user.status || 'registered'}
                    </span>
                  </div>
                  <p className="admin-table-meta">
                    Phone: {user.phone || 'N/A'} · Joined: {formatDate(user.created_at)}
                  </p>
                </div>

                <div className="admin-table-actions-wrapper">
                  <div className="admin-table-meta-col">
                    <span>Referrals: {user.referral_count || 0}</span>
                    <span>Last active: {formatDate(user.last_active_at)}</span>
                  </div>
                  <div className="admin-table-action-btns">
                    <button
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                      className="admin-action-btn view"
                      title="View details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminUsersPage;