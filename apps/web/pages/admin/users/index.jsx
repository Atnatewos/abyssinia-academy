/**
 * @fileoverview Admin Users Page
 * Complete user management with search, filter, user detail, and bulk actions.
 * Path: apps/web/pages/admin/users/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Search,
  Download,
  Eye,
  MoreVertical,
  Check,
  X,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/**
 * AdminUsersPage — Complete user management interface.
 */
const AdminUsersPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  /**
   * Fetch users from the API
   */
  const fetchUsers = useCallback(async () => {
    const token = getItem('admin_token');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.get('/admin/users');

      if (response && response.success) {
        setUsers(response.data || []);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load users.');
      }
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  /*
   * Fetch on mount
   */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Toggle user selection for bulk actions
   */
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  /**
   * Select or deselect all visible users
   */
  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  /**
   * Filter users by search term and status
   */
  const filteredUsers = users.filter((user) => {
    if (statusFilter === 'enrolled' && !user.is_enrolled) return false;
    if (statusFilter === 'not-enrolled' && user.is_enrolled) return false;
    if (statusFilter === 'pending' && user.payment_status !== 'pending') return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (user.full_name && user.full_name.toLowerCase().includes(term)) ||
      (user.phone && user.phone.includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term))
    );
  });

  /**
   * Get enrollment status display
   */
  const getEnrollmentStatus = (user) => {
    if (user.is_enrolled) {
      return { label: 'Enrolled', className: 'status-badge approved' };
    }
    if (user.payment_status === 'pending') {
      return { label: 'Payment Pending', className: 'status-badge pending' };
    }
    return { label: 'Not Enrolled', className: 'status-badge rejected' };
  };

  return (
    <>
      <SEOHead title="Manage Users" />
      <AdminLayout
        title={t.admin?.students || 'Users'}
        subtitle="View and manage registered students"
      >
        {/* Filters */}
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, or email..."
            />
          </div>
          <div className="admin-filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Users</option>
              <option value="enrolled">Enrolled</option>
              <option value="not-enrolled">Not Enrolled</option>
              <option value="pending">Payment Pending</option>
            </select>
          </div>
          <button className="admin-toolbar-btn" onClick={() => {}}>
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="admin-bulk-actions">
            <span className="admin-bulk-count">
              {selectedUsers.length} user(s) selected
            </span>
            <button className="admin-bulk-btn" onClick={() => setSelectedUsers([])}>
              Clear Selection
            </button>
          </div>
        )}

        {/* Users Table */}
        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}>
            <div className="spinner-circle" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-desc">
              {searchTerm
                ? 'No users match your search.'
                : 'No users registered yet.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            {filteredUsers.map((user) => {
              const status = getEnrollmentStatus(user);

              return (
                <div key={user.id} className="admin-table-row">
                  {/* Checkbox */}
                  <div className="admin-table-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="admin-checkbox"
                    />
                  </div>

                  {/* User Info */}
                  <div className="admin-table-info">
                    <div className="admin-table-info-top">
                      <span className="admin-table-name">
                        {user.full_name || 'Unknown'}
                      </span>
                      <span className={status.className}>{status.label}</span>
                    </div>
                    <p className="admin-table-meta">
                      {user.phone}
                      {user.email ? ` · ${user.email}` : ''}
                    </p>
                    <p className="admin-table-meta">
                      Joined {new Date(user.created_at).toLocaleDateString()}
                      {user.is_enrolled &&
                        ` · Enrolled ${new Date(user.enrolled_at).toLocaleDateString()}`}
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="admin-table-actions-wrapper">
                    <div className="admin-table-action-btns">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="admin-action-btn view"
                        title="View User Details"
                      >
                        <Eye size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminUsersPage;