/**
 * @fileoverview Admin Phase Detail Page
 *
 * Displays a phase's metadata and its nested weeks/lessons. Weeks and
 * lessons can be added, edited, deleted, and published inline. Lessons
 * are editable via a modal — the modal form is defined in File 8.
 *
 * Path: apps/web/pages/admin/courses/[id]/phases/[phaseId].jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Plus, Trash2, Eye, EyeOff, Calendar, PlayCircle,
} from 'lucide-react';
import SEOHead from '../../../../../components/shared/SEOHead';
import AdminLayout from '../../../../../components/admin/AdminLayout';
import PhaseLessonEditor from '../../../../../components/admin/courses/PhaseLessonEditor';
import { useToast } from '../../../../../context/ToastContext';
import apiClient from '../../../../../lib/api';

const SkeletonBlock = ({ height = '2.5rem' }) => (
  <div className="skeleton-base" style={{ height, borderRadius: '0.625rem' }} />
);

const AdminPhaseDetailPage = () => {
  const router = useRouter();
  const { id: courseId, phaseId } = router.query;
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [phase, setPhase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [creatingWeek, setCreatingWeek] = useState(false);
  const [newWeekTitle, setNewWeekTitle] = useState('');

  const fetchAll = useCallback(async () => {
    if (!courseId || !phaseId) return;
    setLoading(true);
    try {
      const [courseRes, phaseRes] = await Promise.all([
        apiClient.get(`/admin/courses/${courseId}`),
        apiClient.get(`/admin/phases/${phaseId}`),
      ]);
      if (courseRes.success) setCourse(courseRes.data.course);
      if (phaseRes.success) setPhase(phaseRes.data.phase);

      // Load weeks under this phase
      const weeksRes = await apiClient.get(`/admin/phases/${phaseId}/weeks`);
      if (weeksRes.success) {
        const weeks = weeksRes.data.weeks;
        // Load lessons per week in parallel
        const lessonResults = await Promise.all(
          weeks.map((w) => apiClient.get(`/admin/weeks/${w.id}/lessons`))
        );
        const enriched = weeks.map((w, i) => ({
          ...w,
          lessons: lessonResults[i].success ? lessonResults[i].data.lessons : [],
        }));
        setPhase((p) => (p ? { ...p, weeks: enriched } : p));
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        toast.error('Phase or course not found.');
        router.push(`/admin/courses/${courseId}`);
      } else {
        toast.error('Failed to load phase.');
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, phaseId, router, toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreateWeek = async () => {
    if (!newWeekTitle.trim()) {
      toast.error('Week title is required.');
      return;
    }
    try {
      const res = await apiClient.post(`/admin/phases/${phaseId}/weeks`, {
        title: newWeekTitle.trim(),
      });
      if (res.success) {
        toast.success('Week created.');
        setCreatingWeek(false);
        setNewWeekTitle('');
        fetchAll();
      } else {
        toast.error(res.message || 'Failed.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create week.');
    }
  };

  const handleDeleteWeek = async (weekId) => {
    setBusyId(weekId);
    try {
      const res = await apiClient.delete(`/admin/weeks/${weekId}`);
      if (res.success) {
        toast.success('Week deleted.');
        fetchAll();
      } else if (!res.cancelled) {
        toast.error(res.message || 'Failed.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleWeekPublish = async (weekId, current) => {
    setBusyId(weekId);
    try {
      const res = await apiClient.patch(`/admin/weeks/${weekId}/publish`, { isPublished: !current });
      if (res.success) fetchAll();
    } catch (err) {
      toast.error('Failed to toggle.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    setBusyId(lessonId);
    try {
      const res = await apiClient.delete(`/admin/lessons/${lessonId}`);
      if (res.success) {
        toast.success('Lesson deleted.');
        fetchAll();
      } else if (!res.cancelled) {
        toast.error(res.message || 'Failed.');
      }
    } catch (err) {
      toast.error('Failed to delete lesson.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Phase Details" subtitle="Loading...">
        <div className="admin-detail-content">
          <SkeletonBlock height="4rem" />
          <SkeletonBlock height="20rem" />
        </div>
      </AdminLayout>
    );
  }

  if (!phase || !course) {
    return (
      <AdminLayout title="Phase Not Found" subtitle="The requested phase does not exist">
        <button className="admin-back-btn" onClick={() => router.push(`/admin/courses/${courseId}`)}>
          <ArrowLeft size={14} /> <span>Back to Course</span>
        </button>
        <div className="empty-state">
          <p className="empty-state-desc">This phase was deleted or never existed.</p>
        </div>
      </AdminLayout>
    );
  }

  const weeks = phase.weeks || [];

  return (
    <>
      <SEOHead title={`Phase ${phase.phase_number} - Admin`} />
      <AdminLayout title={`Phase ${phase.phase_number}: ${phase.title}`} subtitle={phase.subtitle}>
        <button className="admin-back-btn" onClick={() => router.push(`/admin/courses/${courseId}`)}>
          <ArrowLeft size={14} /> <span>Back to Course</span>
        </button>

        <section className="admin-detail-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{phase.description}</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                <span><strong>Duration:</strong> {phase.duration}</span>
                <span><strong>Price:</strong> {phase.price_etb ? `${phase.price_etb} ETB` : '— (global)'}</span>
                <span><strong>Status:</strong> <span className={`status-badge ${phase.is_published ? 'approved' : 'pending'}`}>{phase.is_published ? 'Published' : 'Draft'}</span></span>
              </div>
            </div>
            <button className="admin-btn primary" onClick={() => { setCreatingWeek(true); setNewWeekTitle(''); }}>
              <Plus size={14} /> Add Week
            </button>
          </div>

          {creatingWeek && (
            <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--border-medium)', borderRadius: '0.75rem' }}>
              <label className="admin-form-label" htmlFor="newWeekTitle">Week title</label>
              <input
                id="newWeekTitle"
                type="text"
                className="glass-input"
                value={newWeekTitle}
                onChange={(e) => setNewWeekTitle(e.target.value)}
                placeholder="e.g. HTML5 Semantics & Web Mechanics"
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreateWeek(); }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button className="admin-btn secondary" onClick={() => setCreatingWeek(false)}>Cancel</button>
                <button className="admin-btn primary" onClick={handleCreateWeek}>Create Week</button>
              </div>
            </div>
          )}
        </section>

        <section className="admin-detail-section">
          <h3 className="admin-detail-section-title"><Calendar size={16} /> Weeks ({weeks.length})</h3>

          {weeks.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-desc">No weeks yet. Click &quot;Add Week&quot; to create the first one.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              {weeks.map((week) => (
                <div key={week.id}>
                  <div className="admin-table-row">
                    <div className="admin-table-info">
                      <div className="admin-table-info-top">
                        <div className="admin-table-avatar course"><Calendar size={16} /></div>
                        <div className="admin-table-name-block">
                          <span className="admin-table-name">Week {week.week_number}: {week.title}</span>
                          <span className="admin-table-sub">{week.lessons?.length || 0} lesson{week.lessons?.length === 1 ? '' : 's'}</span>
                        </div>
                        <span className={`status-badge ${week.is_published ? 'approved' : 'pending'}`}>
                          {week.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="admin-table-actions-wrapper">
                      <div className="admin-table-action-btns">
                        <button className="admin-action-btn" onClick={() => handleToggleWeekPublish(week.id, week.is_published)} disabled={busyId === week.id} title={week.is_published ? 'Unpublish' : 'Publish'}>
                          {week.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button className="admin-action-btn reject" onClick={() => handleDeleteWeek(week.id)} disabled={busyId === week.id} title="Delete week">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lessons under this week */}
                  <div style={{ marginLeft: '2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {(week.lessons || []).map((lesson) => (
                      <div key={lesson.id} className="admin-table-row" style={{ padding: '0.5rem 0.75rem' }}>
                        <div className="admin-table-info">
                          <div className="admin-table-info-top">
                            <div className="admin-table-avatar video"><PlayCircle size={14} /></div>
                            <div className="admin-table-name-block">
                              <span className="admin-table-name">{lesson.title}</span>
                              <span className="admin-table-sub">{lesson.duration} · YouTube: {lesson.youtube_id}</span>
                            </div>
                            {lesson.is_free_preview && <span className="role-badge">FREE</span>}
                            <span className={`status-badge ${lesson.is_published ? 'approved' : 'pending'}`}>
                              {lesson.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        <div className="admin-table-actions-wrapper">
                          <div className="admin-table-action-btns">
                            <button className="admin-action-btn view" onClick={() => setEditingLesson(lesson)} title="Edit lesson">Edit</button>
                            <button className="admin-action-btn reject" onClick={() => handleDeleteLesson(lesson.id)} disabled={busyId === lesson.id} title="Delete lesson">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="admin-btn secondary" style={{ alignSelf: 'flex-start', fontSize: '0.75rem' }} onClick={() => setEditingLesson({ week_id: week.id, isNew: true })}>
                      <Plus size={12} /> Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {editingLesson && (
          <PhaseLessonEditor
            lesson={editingLesson}
            onClose={() => setEditingLesson(null)}
            onSaved={() => { setEditingLesson(null); fetchAll(); }}
          />
        )}
      </AdminLayout>
    </>
  );
};

export default AdminPhaseDetailPage;