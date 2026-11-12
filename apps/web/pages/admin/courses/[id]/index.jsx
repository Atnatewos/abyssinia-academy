/**
 * @fileoverview Admin Course Detail Page
 *
 * Shows the course metadata and its full phase tree. Every phase can be
 * edited, deleted, or published inline. Clicking a phase opens its week
 * management page.
 *
 * Path: apps/web/pages/admin/courses/[id]/index.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Edit, Trash2, Plus, BookOpen, Layers,
  Eye, EyeOff, ChevronRight,
} from 'lucide-react';
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import { useToast } from '../../../../context/ToastContext';
import apiClient from '../../../../lib/api';

const SkeletonBlock = ({ height = '2.5rem' }) => (
  <div className="skeleton-base" style={{ height, borderRadius: '0.625rem' }} />
);

const AdminCourseDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/admin/courses/${id}`);
      if (response.success && response.data.course) {
        setCourse(response.data.course);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      if (err?.response?.status === 404) setNotFound(true);
      else toast.error('Failed to load course.');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  const handleToggleCoursePublish = async () => {
    setBusyId('course');
    try {
      const next = !course.is_published;
      const res = await apiClient.patch(`/admin/courses/${id}/publish`, {
        isPublished: next,
      });
      if (res.success) {
        toast.success(next ? 'Course published.' : 'Course unpublished.');
        fetchCourse();
      } else {
        toast.error(res.message || 'Failed to toggle publish.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to toggle publish.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteCourse = async () => {
    setBusyId('delete-course');
    try {
      const res = await apiClient.delete(`/admin/courses/${id}`);
      if (res.success) {
        toast.success('Course deleted.');
        router.push('/admin/courses');
      } else if (!res.cancelled) {
        toast.error(res.message || 'Failed to delete.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete.');
    } finally {
      setBusyId(null);
    }
  };

  const handleTogglePhasePublish = async (phaseId, current) => {
    setBusyId(phaseId);
    try {
      const res = await apiClient.patch(`/admin/phases/${phaseId}/publish`, {
        isPublished: !current,
      });
      if (res.success) {
        toast.success(!current ? 'Phase published.' : 'Phase unpublished.');
        fetchCourse();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to toggle.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeletePhase = async (phaseId) => {
    setBusyId(phaseId);
    try {
      const res = await apiClient.delete(`/admin/phases/${phaseId}`);
      if (res.success) {
        toast.success('Phase deleted.');
        fetchCourse();
      } else if (!res.cancelled) {
        toast.error(res.message || 'Failed to delete.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Course Details" subtitle="Loading...">
        <div className="admin-detail-content">
          <SkeletonBlock height="4rem" />
          <SkeletonBlock height="3rem" />
          <SkeletonBlock height="20rem" />
        </div>
      </AdminLayout>
    );
  }

  if (notFound || !course) {
    return (
      <AdminLayout title="Course Not Found" subtitle="The requested course does not exist">
        <button className="admin-back-btn" onClick={() => router.push('/admin/courses')}>
          <ArrowLeft size={14} /> <span>Back to Courses</span>
        </button>
        <div className="empty-state">
          <p className="empty-state-desc">This course was deleted or never existed.</p>
        </div>
      </AdminLayout>
    );
  }

  const phases = course.phases || [];

  return (
    <>
      <SEOHead title={`${course.title} - Admin`} />
      <AdminLayout title={course.title} subtitle={course.description}>
        <button className="admin-back-btn" onClick={() => router.push('/admin/courses')}>
          <ArrowLeft size={14} /> <span>Back to Courses</span>
        </button>

        {/* Course header card */}
        <section className="admin-detail-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{course.title}</h2>
              <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>{course.description}</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <span><strong>Slug:</strong> {course.slug}</span>
                <span><strong>Level:</strong> {course.level}</span>
                <span><strong>Duration:</strong> {course.duration}</span>
                <span><strong>Price:</strong> {course.price_etb ? `${course.price_etb} ETB` : '— (global)'}</span>
                <span>
                  <strong>Status:</strong>{' '}
                  <span className={`status-badge ${course.is_published ? 'approved' : 'pending'}`}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="admin-btn secondary" onClick={handleToggleCoursePublish} disabled={busyId === 'course'}>
                {course.is_published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
              </button>
              <button className="admin-btn primary" onClick={() => router.push(`/admin/courses/${id}/edit`)}>
                <Edit size={14} /> Edit
              </button>
              <button className="admin-btn danger" onClick={handleDeleteCourse} disabled={busyId === 'delete-course'}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </section>

        {/* Phases section */}
        <section className="admin-detail-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="admin-detail-section-title" style={{ margin: 0, border: 0, padding: 0 }}>
              <Layers size={16} /> Phases ({phases.length})
            </h3>
            <button className="admin-btn primary" onClick={() => router.push(`/admin/courses/${id}/phases/new`)}>
              <Plus size={14} /> Add Phase
            </button>
          </div>

          {phases.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-desc">No phases yet. Click &quot;Add Phase&quot; to create the first one.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              {phases.map((phase) => (
                <div key={phase.id} className="admin-table-row">
                  <div className="admin-table-info">
                    <div className="admin-table-info-top">
                      <div className="admin-table-avatar course"><BookOpen size={16} /></div>
                      <div className="admin-table-name-block">
                        <span className="admin-table-name">
                          Phase {phase.phase_number}: {phase.title}
                        </span>
                        <span className="admin-table-sub">{phase.subtitle}</span>
                      </div>
                      <span className="phase-badge">{phase.duration}</span>
                      <span className={`status-badge ${phase.is_published ? 'approved' : 'pending'}`}>
                        {phase.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="admin-table-meta">
                      {phase.price_etb ? `${phase.price_etb} ETB` : '— (global price)'}
                      {' · '}
                      {phase.weeks?.length || 0} week{phase.weeks?.length === 1 ? '' : 's'}
                      {' · '}
                      {phase.outcomes?.length || 0} outcome{phase.outcomes?.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="admin-table-actions-wrapper">
                    <div className="admin-table-action-btns">
                      <button className="admin-action-btn view" onClick={() => router.push(`/admin/courses/${id}/phases/${phase.id}`)} title="View weeks">
                        <ChevronRight size={16} />
                      </button>
                      <button className="admin-action-btn" onClick={() => handleTogglePhasePublish(phase.id, phase.is_published)} disabled={busyId === phase.id} title={phase.is_published ? 'Unpublish' : 'Publish'}>
                        {phase.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button className="admin-action-btn reject" onClick={() => handleDeletePhase(phase.id)} disabled={busyId === phase.id} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </AdminLayout>
    </>
  );
};

export default AdminCourseDetailPage;