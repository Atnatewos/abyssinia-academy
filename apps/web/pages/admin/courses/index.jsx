/**
 * @fileoverview Admin Courses Page
 *
 * Course management interface verified against the real schema:
 *   courses: id, slug, title, description, level, duration, badge,
 *            icon, is_published, order_index, created_at
 *
 * There is no phase_number, price_etb, class_count, or week_count
 * column — those are removed. Status is derived from is_published.
 * Per-phase pricing is config-driven (getPricing hook).
 *
 * Path: apps/web/pages/admin/courses/index.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Search, Edit, Trash2, Eye, BookOpen, Plus } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import usePaymentConfig from '../../../hooks/usePaymentConfig';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

const AdminCoursesPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();
  const { pricing } = usePaymentConfig();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchCourses = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (levelFilter !== 'all') params.append('level', levelFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await apiClient.get(`/admin/courses?${params.toString()}`);
      if (response && response.success) {
        setCourses(response.data || []);
      } else {
        toast.error(response.message || 'Failed to load courses');
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load courses');
      }
    } finally {
      setLoading(false);
    }
  }, [levelFilter, searchTerm, router, toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (courseId) => {
    try {
      const response = await apiClient.delete(`/admin/courses/${courseId}`);
      if (response.success) {
        toast.success(response.message || 'Course deleted successfully');
        setDeleteConfirm(null);
        fetchCourses();
      } else {
        toast.error(response.message || 'Failed to delete course');
      }
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderShimmerRow = (index) => (
    <div key={`shimmer-${index}`} className="admin-table-row">
      <div className="admin-table-info">
        <div className="admin-table-info-top">
          <div className="admin-table-avatar course shimmer" />
          <div className="admin-table-name-block">
            <span className="admin-table-name shimmer" style={{ width: '65%', height: '0.875rem' }} />
            <span className="admin-table-sub shimmer" style={{ width: '80%', height: '0.75rem' }} />
          </div>
          <span className="phase-badge shimmer" style={{ width: '4rem', height: '1.25rem' }} />
        </div>
        <p className="admin-table-meta">
          <span className="shimmer" style={{ display: 'inline-block', width: '14rem', height: '0.75rem' }} />
        </p>
      </div>
      <div className="admin-table-actions-wrapper">
        <div className="admin-table-meta-col">
          <span className="status-badge shimmer" style={{ width: '4.5rem', height: '1.25rem' }} />
        </div>
        <div className="admin-table-action-btns">
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
          <span className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
    </div>
  );

  /**
   * Per-phase price from config. Courses have no price column in DB,
   * so the display amount is pulled from payments.config.js.
   */
  const perPhasePrice = pricing?.perPhase?.amountETB || 0;

  return (
    <>
      <SEOHead title="Courses Management" />
      <AdminLayout
        title={t.admin?.courses?.title || 'Courses Management'}
        subtitle="Manage course catalog and content"
      >
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses..."
            />
          </div>
          <select
            className="admin-filter-select"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button
            className="admin-toolbar-btn primary"
            onClick={() => router.push('/admin/courses/new')}
          >
            <Plus size={16} />
            <span>New Course</span>
          </button>
        </div>

        {loading ? (
          <div className="admin-table-wrapper">
            {Array.from({ length: 5 }).map((_, i) => renderShimmerRow(i))}
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-desc">
              {searchTerm || levelFilter !== 'all'
                ? 'No courses match your filters.'
                : 'No courses created yet.'}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            {courses.map((course) => (
              <div key={course.id} className="admin-table-row">
                <div className="admin-table-info">
                  <div className="admin-table-info-top">
                    <div className="admin-table-avatar course">
                      <BookOpen size={16} />
                    </div>
                    <div className="admin-table-name-block">
                      <span className="admin-table-name">{course.title || 'Untitled'}</span>
                      <span className="admin-table-sub">
                        {course.description?.slice(0, 80) || 'No description'}
                        {(course.description?.length || 0) > 80 ? '...' : ''}
                      </span>
                    </div>
                    {course.level && (
                      <span className="phase-badge">{course.level}</span>
                    )}
                    {course.badge && (
                      <span className="role-badge role-admin">{course.badge}</span>
                    )}
                  </div>
                  <p className="admin-table-meta">
                    {course.duration || '—'} · {perPhasePrice.toLocaleString()} ETB/phase · Created {formatDate(course.created_at)}
                  </p>
                </div>

                <div className="admin-table-actions-wrapper">
                  <div className="admin-table-meta-col">
                    <span className={`status-badge ${course.is_published ? 'approved' : 'pending'}`}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="admin-table-action-btns">
                    <button
                      onClick={() => router.push(`/admin/courses/${course.id}`)}
                      className="admin-action-btn view"
                      title="View"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                      className="admin-action-btn edit"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(course.id)}
                      className="admin-action-btn reject"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Delete Course?</h3>
              <p>This action cannot be undone. Associated content will also be removed.</p>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminCoursesPage;