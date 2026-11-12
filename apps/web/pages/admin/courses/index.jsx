/**
 * @fileoverview Admin Courses List Page
 *
 * Lists all courses (published + drafts). Shows each course's own price
 * when set, or "— Uses global pricing" when it falls back to the platform
 * default. Every label uses i18n — zero hardcoded strings.
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
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

const AdminCoursesPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

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
        toast.error(response.message || t.admin?.courses?.toasts?.loadFailed);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error(t.admin?.courses?.toasts?.loadFailed);
      }
    } finally {
      setLoading(false);
    }
  }, [levelFilter, searchTerm, router, toast, t]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (courseId) => {
    try {
      const response = await apiClient.delete(`/admin/courses/${courseId}`);
      if (response.success) {
        toast.success(t.admin?.courses?.toasts?.deleted);
        setDeleteConfirm(null);
        fetchCourses();
      } else if (!response.cancelled) {
        toast.error(response.message || t.admin?.courses?.toasts?.deleteFailed);
      }
    } catch {
      toast.error(t.admin?.courses?.toasts?.deleteFailed);
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
            <span
              className="admin-table-name shimmer"
              style={{ width: '65%', height: '0.875rem' }}
            />
            <span
              className="admin-table-sub shimmer"
              style={{ width: '80%', height: '0.75rem' }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Price display: course-specific price or "— Uses global pricing" ── */
  const renderPriceMeta = (course) => {
    if (course.price_etb != null && Number(course.price_etb) > 0) {
      return (t.admin?.courses?.priceDisplay?.custom || '{amount} ETB').replace(
        '{amount}',
        Number(course.price_etb).toLocaleString()
      );
    }
    return t.admin?.courses?.priceDisplay?.global || '— Uses global pricing';
  };

  return (
    <>
      <SEOHead title={t.admin?.courses?.pageTitle || 'Courses Management'} />
      <AdminLayout
        title={t.admin?.courses?.pageTitle || 'Courses Management'}
        subtitle={
          t.admin?.courses?.pageSubtitle || 'Manage course catalog and content'
        }
      >
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                t.admin?.courses?.searchPlaceholder || 'Search courses...'
              }
            />
          </div>
          <select
            className="admin-filter-select"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="all">
              {t.admin?.courses?.allLevels || 'All Levels'}
            </option>
            <option value="Beginner">
              {t.admin?.courses?.levels?.beginner || 'Beginner'}
            </option>
            <option value="Intermediate">
              {t.admin?.courses?.levels?.intermediate || 'Intermediate'}
            </option>
            <option value="Advanced">
              {t.admin?.courses?.levels?.advanced || 'Advanced'}
            </option>
          </select>
          <button
            className="admin-toolbar-btn primary"
            onClick={() => router.push('/admin/courses/new')}
          >
            <Plus size={16} />
            <span>{t.admin?.courses?.newCourseBtn || 'New Course'}</span>
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
                ? t.admin?.courses?.empty?.noSearchResults ||
                  'No courses match your filters.'
                : t.admin?.courses?.empty?.noCourses ||
                  'No courses created yet.'}
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
                      <span className="admin-table-name">
                        {course.title || 'Untitled'}
                      </span>
                      <span className="admin-table-sub">
                        {course.description?.slice(0, 80) || '—'}
                        {(course.description?.length || 0) > 80 ? '...' : ''}
                      </span>
                    </div>
                    {course.level && (
                      <span className="phase-badge">{course.level}</span>
                    )}
                    {course.badge && (
                      <span className="role-badge role-admin">
                        {course.badge}
                      </span>
                    )}
                  </div>
                  <p className="admin-table-meta">
                    {course.duration || '—'} · {renderPriceMeta(course)} ·{' '}
                    {(t.admin?.courses?.meta?.status || 'Status')}:{' '}
                    {course.is_published
                      ? t.admin?.courses?.fields?.published || 'Published'
                      : t.admin?.courses?.fields?.draft || 'Draft'}
                  </p>
                </div>

                <div className="admin-table-actions-wrapper">
                  <div className="admin-table-action-btns">
                    <button
                      onClick={() => router.push(`/admin/courses/${course.id}`)}
                      className="admin-action-btn view"
                      title={t.admin?.courses?.actions?.viewWeeks || 'View'}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() =>
                        router.push(`/admin/courses/${course.id}/edit`)
                      }
                      className="admin-action-btn edit"
                      title={t.admin?.courses?.actions?.edit || 'Edit'}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(course.id)}
                      className="admin-action-btn reject"
                      title={t.admin?.courses?.actions?.delete || 'Delete'}
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
          <div
            className="modal-overlay"
            onClick={() => setDeleteConfirm(null)}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{t.admin?.courses?.actions?.delete || 'Delete'}?</h3>
              <p>
                {t.admin?.courses?.empty?.noCourses
                  ? 'This action cannot be undone.'
                  : 'This action cannot be undone.'}
              </p>
              <div className="modal-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setDeleteConfirm(null)}
                >
                  {t.admin?.courses?.actions?.cancel || 'Cancel'}
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  {t.admin?.courses?.actions?.delete || 'Delete'}
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