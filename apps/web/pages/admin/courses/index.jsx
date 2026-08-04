/**
 * @fileoverview Admin Courses Page
 * Course management interface.
 * Path: apps/web/pages/admin/courses/index.jsx
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { BookOpen, Edit, Eye, Plus } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';

/**
 * AdminCoursesPage — Course management overview.
 */
const AdminCoursesPage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    const token = getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.get('/admin/courses');
      if (response && response.success) {
        setCourses(response.data || []);
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        router.push('/admin/login');
      } else {
        toast.error('Failed to load courses.');
      }
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <>
      <SEOHead title="Manage Courses" />
      <AdminLayout
        title={t.admin?.courses || 'Courses'}
        subtitle="Manage course content and structure"
      >
        {loading ? (
          <div className="spinner" style={{ marginTop: '2rem' }}>
            <div className="spinner-circle" />
          </div>
        ) : (
          <div className="admin-courses-grid">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="admin-course-card">
                  <div className="admin-course-card-icon">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="admin-course-card-title">{course.title}</h3>
                  <p className="admin-course-card-desc">{course.description}</p>
                  <div className="admin-course-card-meta">
                    <span>{course.level}</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="admin-course-card-actions">
                    <button className="admin-action-btn view">
                      <Eye size={16} />
                    </button>
                    <button className="admin-action-btn view">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <BookOpen size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
                <p className="empty-state-desc">No courses configured yet.</p>
              </div>
            )}
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminCoursesPage;