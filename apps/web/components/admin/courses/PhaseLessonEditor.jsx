/**
 * @fileoverview Phase Lesson Editor
 *
 * Modal form for creating or editing a lesson. Handles sessions (array of
 * { name, time }) and resources (array of { name, type, url }).
 *
 * When `lesson.isNew` is true, creates via POST. Otherwise PATCHes by ID.
 *
 * Path: apps/web/components/admin/courses/PhaseLessonEditor.jsx
 */
import { useState } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';

const PhaseLessonEditor = ({ lesson, onClose, onSaved }) => {
  const toast = useToast();
  const isNew = Boolean(lesson.isNew);

  const [form, setForm] = useState({
    title: lesson.title || '',
    titleAm: lesson.title_am || '',
    duration: lesson.duration || '',
    youtubeId: lesson.youtube_id || '',
    notes: lesson.notes || '',
    isFreePreview: Boolean(lesson.is_free_preview),
    isPublished: lesson.is_published !== undefined ? lesson.is_published : true,
  });

  const [sessions, setSessions] = useState(lesson.sessions || []);
  const [resources, setResources] = useState(lesson.resources || []);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.duration.trim()) next.duration = 'Duration is required.';
    if (!form.youtubeId.trim()) next.youtubeId = 'YouTube ID or URL is required.';
    sessions.forEach((s, i) => {
      if (!s.name.trim()) next[`session-${i}-name`] = 'Name required.';
      if (!s.time.trim()) next[`session-${i}-time`] = 'Time required.';
    });
    resources.forEach((r, i) => {
      if (!r.name.trim()) next[`resource-${i}-name`] = 'Name required.';
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        titleAm: form.titleAm.trim() || null,
        duration: form.duration.trim(),
        youtubeId: form.youtubeId.trim(),
        notes: form.notes.trim() || null,
        isFreePreview: form.isFreePreview,
        isPublished: form.isPublished,
        sessions: sessions.map((s) => ({ name: s.name.trim(), time: s.time.trim() })),
        resources: resources.map((r) => ({
          name: r.name.trim(),
          type: r.type || 'pdf',
          url: r.url?.trim() || null,
        })),
      };

      let res;
      if (isNew) {
        res = await apiClient.post(`/admin/weeks/${lesson.week_id}/lessons`, payload);
      } else {
        res = await apiClient.patch(`/admin/lessons/${lesson.id}`, payload);
      }

      if (res.success) {
        toast.success(isNew ? 'Lesson created.' : 'Lesson updated.');
        onSaved();
      } else {
        toast.error(res.message || 'Failed.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save lesson.');
    } finally {
      setSaving(false);
    }
  };

  const addSession = () => setSessions((p) => [...p, { name: '', time: '' }]);
  const removeSession = (i) => setSessions((p) => p.filter((_, idx) => idx !== i));
  const updateSession = (i, field, value) => setSessions((p) => p.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)));

  const addResource = () => setResources((p) => [...p, { name: '', type: 'pdf', url: '' }]);
  const removeResource = (i) => setResources((p) => p.filter((_, idx) => idx !== i));
  const updateResource = (i, field, value) => setResources((p) => p.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '44rem', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>{isNew ? 'New Lesson' : 'Edit Lesson'}</h3>
          <button className="admin-action-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
            <label className="admin-form-label">Title (English) *</label>
            <input name="title" value={form.title} onChange={handleChange} className="glass-input" />
            {errors.title && <p className="profile-field-error">{errors.title}</p>}
          </div>

          <div className="admin-form-row" style={{ marginBottom: '1rem' }}>
            <div className="admin-form-group">
              <label className="admin-form-label">Title (Amharic)</label>
              <input name="titleAm" value={form.titleAm} onChange={handleChange} className="glass-input" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Duration *</label>
              <input name="duration" value={form.duration} onChange={handleChange} placeholder="e.g. 45 mins" className="glass-input" />
              {errors.duration && <p className="profile-field-error">{errors.duration}</p>}
            </div>
          </div>

          <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
            <label className="admin-form-label">YouTube ID or URL *</label>
            <input name="youtubeId" value={form.youtubeId} onChange={handleChange} placeholder="pQN-pnXPaVg or https://youtu.be/pQN-pnXPaVg" className="glass-input" />
            {errors.youtubeId && <p className="profile-field-error">{errors.youtubeId}</p>}
            <p className="form-hint">Any YouTube URL format will be normalized to an 11-character ID.</p>
          </div>

          <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
            <label className="admin-form-label">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="glass-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          {/* Sessions */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="admin-form-label" style={{ margin: 0 }}>Sessions (timestamps)</label>
              <button type="button" className="admin-btn secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={addSession}>
                <Plus size={12} /> Add Session
              </button>
            </div>
            {sessions.length === 0 && <p className="form-hint">No sessions. Add optional timestamped markers.</p>}
            {sessions.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                <input value={s.name} onChange={(e) => updateSession(i, 'name', e.target.value)} placeholder="Session name" className="glass-input" style={{ flex: 2 }} />
                <input value={s.time} onChange={(e) => updateSession(i, 'time', e.target.value)} placeholder="MM:SS" className="glass-input" style={{ flex: 1, maxWidth: '6rem' }} />
                <button type="button" className="admin-action-btn reject" onClick={() => removeSession(i)} aria-label="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Resources */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="admin-form-label" style={{ margin: 0 }}>Resources</label>
              <button type="button" className="admin-btn secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }} onClick={addResource}>
                <Plus size={12} /> Add Resource
              </button>
            </div>
            {resources.length === 0 && <p className="form-hint">No resources. Add downloadable files.</p>}
            {resources.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                <input value={r.name} onChange={(e) => updateResource(i, 'name', e.target.value)} placeholder="File name" className="glass-input" style={{ flex: 2 }} />
                <select value={r.type} onChange={(e) => updateResource(i, 'type', e.target.value)} className="admin-filter-select" style={{ width: '6rem' }}>
                  <option value="pdf">PDF</option>
                  <option value="zip">ZIP</option>
                  <option value="doc">DOC</option>
                  <option value="code">CODE</option>
                  <option value="link">LINK</option>
                </select>
                <input value={r.url || ''} onChange={(e) => updateResource(i, 'url', e.target.value)} placeholder="URL (optional)" className="glass-input" style={{ flex: 2 }} />
                <button type="button" className="admin-action-btn reject" onClick={() => removeResource(i)} aria-label="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <label className="admin-checkbox-label">
              <input type="checkbox" name="isFreePreview" checked={form.isFreePreview} onChange={handleChange} />
              <span>Free preview</span>
            </label>
            <label className="admin-checkbox-label">
              <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
              <span>Published</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (isNew ? 'Create Lesson' : 'Save Changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhaseLessonEditor;