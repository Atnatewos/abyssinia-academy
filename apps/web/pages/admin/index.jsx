/**
 * @fileoverview Admin Dashboard Page
 * Overview of platform statistics with sidebar navigation
 * Path: apps/web/pages/admin/index.jsx
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard, CreditCard, Users, BookOpen, Settings, LogOut,
  Code2, Bell, Users as UsersIcon, Clock, DollarSign,
} from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import { useToast } from '../../context/ToastContext';
import apiClient from '../../lib/api';
import { getItem } from '../../lib/storage';

const AdminDashboard = () => {
  const router = useRouter();
  const toast = useToast();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    const token = getItem('admin_token');
    const user = getItem('admin_user');

    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (user) {
      setAdminUser(user);
    }

    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/admin/dashboard');
        if (response && response.success) {
          setStats(response.data || {});
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          router.push('/admin/login');
        } else {
          toast.error('Failed to load dashboard.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/payments', label: 'Payments', icon: CreditCard },
    { path: '/admin/students', label: 'Students', icon: Users },
    { path: '/admin/courses', label: 'Courses', icon: BookOpen },
  ];

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents || 0, icon: UsersIcon, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    { label: 'Enrolled Students', value: stats.enrolledStudents || 0, icon: UsersIcon, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)' },
    { label: 'Pending Payments', value: stats.pendingPayments || 0, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    { label: 'Total Revenue', value: `${(stats.totalRevenue || 0).toLocaleString()} ETB`, icon: DollarSign, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', isCurrency: true },
  ];

  const isActive = (path, exact) => {
    if (exact) return router.pathname === path;
    return router.pathname.startsWith(path);
  };

  return (
    <>
      <SEOHead title="Admin Dashboard" />
      <div className="admin-layout">
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

        <div className="admin-main">
          <header className="admin-header">
            <div>
              <h1 className="admin-header-title">Dashboard</h1>
              <p className="admin-header-subtitle">Platform overview and statistics</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-light)' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 700 }}>
                  {(adminUser?.username || 'A').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{adminUser?.username || 'Admin'}</span>
              </div>
            </div>
          </header>

          <main className="admin-content">
            {loading ? (
              <div className="spinner"><div className="spinner-circle" /></div>
            ) : (
              <div className="admin-stats-grid">
                {statCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <div key={index} className="admin-stat-card">
                      <div className="admin-stat-icon" style={{ background: card.bg, border: `1px solid ${card.border}` }}>
                        <Icon size={20} style={{ color: card.color }} />
                      </div>
                      <p className="admin-stat-label">{card.label}</p>
                      <p className="admin-stat-value" style={{ fontSize: card.isCurrency ? '1rem' : '1.5rem' }}>{card.value}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;