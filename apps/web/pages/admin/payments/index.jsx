/**
 * @fileoverview Admin Payments Page
 * Manage payment submissions with approve/reject actions
 * Path: apps/web/pages/admin/payments/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard, CreditCard, Users, BookOpen, Settings, LogOut,
  Code2, Bell, Search, Check, X, Eye,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';

/**
 * AdminPaymentsPage - Payment management with status filtering
 */
const AdminPaymentsPage = () => {
  const router = useRouter();
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  const fetchPayments = useCallback(async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setLoading(true);

    try {
      const endpoint = activeTab === 'all' ? '/admin/payments' : `/admin/payments/${activeTab}`;
      const response = await apiClient.get(endpoint);
      if (response && response.success) {
        setPayments(response.data || []);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
      } else {
        toast.error('Failed to load payments.');
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, router]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleAction = async (paymentId, action) => {
    setActionLoading(paymentId);
    try {
      const endpoint = action === 'approve'
        ? `/admin/payments/${paymentId}/approve`
        : `/admin/payments/${paymentId}/reject`;
      const response = await apiClient.patch(endpoint);
      if (response && response.success) {
        toast.success(`Payment ${action}d successfully.`);
        fetchPayments();
      }
    } catch (err) {
      toast.error('Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.user_name && p.user_name.toLowerCase().includes(term)) ||
      (p.user_phone && p.user_phone.includes(term)) ||
      (p.reference && p.reference.toLowerCase().includes(term))
    );
  });

  const tabs = [
    { id: 'all', label: 'All Payments' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/students', label: 'Students', icon: Users },
    { path: '/admin/courses', label: 'Courses', icon: BookOpen },
  ];

  const isActive = (path, exact) => {
    if (exact) return router.pathname === path;
    return router.pathname.startsWith(path);
  };

  const getStatusBadge = (status) => {
    if (status === 'pending') return 'status-badge pending';
    if (status === 'approved') return 'status-badge approved';
    return 'status-badge rejected';
  };

  return (
    <>
      <SEOHead title="Manage Payments" />
      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <Link href="/admin" className="admin-sidebar-brand">
            <div className="admin-sidebar-logo"><Code2 /></div>
            <div>
              <span className="admin-sidebar-name"><span className="text-gradient-gold">ABYSSiNIA</span></span>
              <span className="admin-sidebar-suffix">Admin Panel</span>
            </div>
          </Link>
          <nav className="admin-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} href={item.path} className={`admin-nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}>
                  <Icon /><span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="admin-nav-bottom">
            <Link href="/admin/settings" className={`admin-nav-link ${isActive('/admin/settings', false) ? 'active' : ''}`}>
              <Settings /><span>Settings</span>
            </Link>
            <button onClick={handleLogout} className="admin-nav-logout">
              <LogOut /><span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="admin-main">
          <header className="admin-header">
            <div>
              <h1 className="admin-header-title">Payments</h1>
              <p className="admin-header-subtitle">Review and manage payment submissions</p>
            </div>
          </header>

          <main className="admin-content">
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`lesson-tab ${activeTab === tab.id ? 'active' : ''}`}
                  style={{ borderBottom: 'none', paddingBottom: 0 }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="admin-search">
              <Search size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone, or reference..."
              />
            </div>

            {/* Payments List */}
            {loading ? (
              <div className="spinner"><div className="spinner-circle" /></div>
            ) : filteredPayments.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-desc">{searchTerm ? 'No payments match your search.' : 'No payments found.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="admin-table-row">
                    <div className="admin-table-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="admin-table-name">{payment.user_name || 'Unknown'}</span>
                        <span className={getStatusBadge(payment.status)}>{payment.status}</span>
                      </div>
                      <p className="admin-table-meta">
                        {payment.user_phone} &bull; Ref: {payment.reference || 'N/A'}
                      </p>
                      <p className="admin-table-meta">
                        {payment.method} &bull; {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="admin-table-amount">{payment.amount?.toLocaleString()} ETB</span>
                      {payment.status === 'pending' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {payment.transaction_id && (
                            <a href={payment.transaction_id} target="_blank" rel="noopener noreferrer" className="admin-action-btn view">
                              <Eye size={16} />
                            </a>
                          )}
                          <button
                            onClick={() => handleAction(payment.id, 'approve')}
                            disabled={actionLoading === payment.id}
                            className="admin-action-btn approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(payment.id, 'reject')}
                            disabled={actionLoading === payment.id}
                            className="admin-action-btn reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminPaymentsPage;