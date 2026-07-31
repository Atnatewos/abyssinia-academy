/**
 * @fileoverview Admin Students Page
 * View all registered students with enrollment status
 * Path: apps/web/pages/admin/students/index.jsx
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard, CreditCard, Users, BookOpen, Settings, LogOut,
  Code2, Search,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';

/**
 * AdminStudentsPage - Student management view
 */
const AdminStudentsPage = () => {
  const router = useRouter();
  const toast = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const fetchStudents = async () => {
      try {
        const response = await apiClient.get('/admin/students');
        if (response && response.success) {
          setStudents(response.data || []);
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          localStorage.removeItem('admin_token');
          router.push('/admin/login');
        } else {
          toast.error('Failed to load students.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [router]);

  const filteredStudents = students.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.full_name && s.full_name.toLowerCase().includes(term)) ||
      (s.phone && s.phone.includes(term)) ||
      (s.email && s.email.toLowerCase().includes(term))
    );
  });

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
    if (status === 'approved' || status === true) return 'status-badge approved';
    if (status === 'pending') return 'status-badge pending';
    return 'status-badge rejected';
  };

  return (
    <>
      <SEOHead title="Manage Students" />
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
              <h1 className="admin-header-title">Students</h1>
              <p className="admin-header-subtitle">View and manage registered students</p>
            </div>
          </header>

          <main className="admin-content">
            <div className="admin-search">
              <Search size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, phone, or email..."
              />
            </div>

            {loading ? (
              <div className="spinner"><div className="spinner-circle" /></div>
            ) : filteredStudents.length === 0 ? (
              <div className="empty-state">
                <p className="empty-state-desc">{searchTerm ? 'No students match your search.' : 'No students registered yet.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredStudents.map((student) => (
                  <div key={student.id} className="admin-table-row">
                    <div className="admin-table-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className="admin-table-name">{student.full_name}</span>
                        <span className={getStatusBadge(student.is_enrolled ? 'approved' : student.payment_status)}>
                          {student.is_enrolled ? 'Enrolled' : student.payment_status || 'N/A'}
                        </span>
                      </div>
                      <p className="admin-table-meta">{student.phone}{student.email ? ` • ${student.email}` : ''}</p>
                      <p className="admin-table-meta">Joined {new Date(student.created_at).toLocaleDateString()}</p>
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

export default AdminStudentsPage;