/**
 * @fileoverview Admin Students Page
 *
 * Student management interface with search, status filters, and enrollment
 * details. Loading state uses inline shimmer rows that match the real
 * admin-table-row markup exactly, so styling is 100% consistent.
 *
 * Path: apps/web/pages/admin/students/index.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search, Eye, Mail, Phone } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

const AdminStudentsPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await apiClient.get(`/admin/students?${params.toString()}`);
      if (response.success) {
        setStudents(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load students');
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load students');
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, router, toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const getStatusClass = (status) => {
    if (status === 'active' || status === 'enrolled') return 'status-badge approved';
    if (status === 'suspended' || status === 'banned') return 'status-badge rejected';
    return 'status-badge pending';
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
   * Inline shimmer row — uses the EXACT same admin class names so it
   * inherits all admin-table-row styling. .shimmer class triggers the
   * background animation defined in components.css.
   */
  const renderShimmerRow = (index) => (
    <div key={`shimmer-${index}`} className="admin-table-row">
      <div className="admin-table-info">
        <div className="admin-table-info-top">
          <div className="admin-table-avatar shimmer" />
          <div className="admin-table-name-block">
            <span className="admin-table-name shimmer" style={{ width: '60%', height: '0.875rem' }} />
            <span className="admin-table-sub shimmer" style={{ width: '40%', height: '0.75rem' }} />
          </div>
          <span className="status-badge shimmer" style={{ width: '4rem', height: '1.25rem' }} />
        </div>
        <p className="admin-table-meta">
          <span className="shimmer" style={{ display: 'inline-block', width: '8rem', height: '0.75rem' }} />
        </p>
      </div>
      <div className="admin-table-actions-wrapper">
        <div className="admin-table-meta-col">
          <span className="shimmer" style={{ width: '6rem', height: '0.75rem' }} />
        </div>
        <div className="admin-table-action-btns">
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SEOHead title="Students Management" />
      <AdminLayout
        title={t.admin?.students?.title || 'Students Management'}
        subtitle="View and manage enrolled students"
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Students</option>
            <option value="enrolled">Enrolled</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {loading ? (
          <div className="admin-table-wrapper">
            {Array.from({ length: 6 }).map((_, i) => renderShimmerRow(i))}
          </div>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-desc">
              {searchTerm || statusFilter !== 'all'
                ? 'No students match your filters.'
                : 'No students enrolled yet.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            {students.map((student) => (
              <div key={student.id} className="admin-table-row">
                <div className="admin-table-info">
                  <div className="admin-table-info-top">
                    <div className="admin-table-avatar">
                      {student.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="admin-table-name-block">
                      <span className="admin-table-name">{student.name || 'Unknown'}</span>
                      <span className="admin-table-sub">{student.email || '—'}</span>
                    </div>
                    <span className={getStatusClass(student.status)}>
                      {student.status}
                    </span>
                  </div>
                  <p className="admin-table-meta">
                    <Phone size={12} /> {student.phone || 'N/A'}
                    {' · '}
                    <Mail size={12} /> {student.email || 'N/A'}
                  </p>
                </div>

                <div className="admin-table-actions-wrapper">
                  <div className="admin-table-meta-col">
                    <span>Enrolled: {formatDate(student.enrolled_at || student.created_at)}</span>
                    <span>Phase: {student.current_phase || '—'}</span>
                  </div>
                  <div className="admin-table-action-btns">
                    <button
                      onClick={() => setSelectedStudent(student)}
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

export default AdminStudentsPage;