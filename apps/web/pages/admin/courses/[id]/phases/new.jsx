/**
 * @fileoverview Admin New Phase Page
 *
 * Creates a phase under a course. Outcomes are entered as a multiline
 * textarea, one per line — the service layer splits and stores them.
 *
 * Path: apps/web/pages/admin/courses/[id]/phases/new.jsx
 */
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, Layers } from 'lucide-react';
import SEOHead from '../../../../../components/shared/SEOHead';
import AdminLayout from '../../../../../components/admin/AdminLayout';
import { useToast } from '../../../../../context/ToastContext';
import apiClient from '../../../../../lib/api';

const Field = ({ label, name, value, onChange, error, type = 'text', placeholder, hint, required }) => (
  <div className="admin-form-group">
    <label className="admin-form-label" htmlFor={name}>
      {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
    <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className="glass-input" />
    {hint && !error && <p className="form-hint">{hint}</p>}
    {error && <p className="profile-field-error">{error}</p>}
  </div>
);

const AdminNewPhasePage = () => {
  const router = useRouter();
  const { id: courseId } = router.query;
  const toast = useToast();

  const [form, setForm] = useState({
    phaseNumber: '',
    title: '',
    titleAm: '',
    subtitle: '',
    subtitleAm: '',
    description: '',
    descriptionAm: '',
    duration: '4 Weeks',
    color: 'from-amber-500 to-yellow-400',
    icon: 'Code2',
    priceEtb: '',
    isPublished: true,
    outcomesText: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.subtitle.trim()) next.subtitle = 'Subtitle is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
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
      const outcomes = form.outcomesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: form.title.trim(),
        titleAm: form.titleAm.trim() || null,
        subtitle: form.subtitle.trim(),
        subtitleAm: form.subtitleAm.trim() || null,
        description: form.description.trim(),
        descriptionAm: form.descriptionAm.trim() || null,
        duration: form.duration.trim(),
        color: form.color,
        icon: form.icon,
        priceEtb: form.priceEtb === '' ? null : Number(form.priceEtb),
        isPublished: form.isPublished,
        outcomes,
      };
      if (form.phaseNumber !== '') payload.phaseNumber = Number(form.phaseNumber);

      const res = await apiClient.post(`/admin/courses/${courseId}/phases`, payload);

      if (res.success) {
        toast.success('Phase created successfully.');
        router.push(`/admin/courses/${courseId}`);
      } else {
        toast.error(res.message || 'Failed to create phase.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create phase.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SEOHead title="New Phase - Admin" />
      <AdminLayout title="Create New Phase" subtitle="Add a phase to this course">
        <button className="admin-back-btn" onClick={() => router.push(`/admin/courses/${courseId}`)}>
          <ArrowLeft size={14} /> <span>Back to Course</span>
        </button>

        <form onSubmit={handleSubmit} className="admin-detail-content">
          <section className="admin-detail-section">
            <h2 className="admin-detail-section-title"><Layers size={16} /> Phase Identity</h2>
            <div className="admin-form-row">
              <Field label="Title (English)" name="title" value={form.title} onChange={handleChange} error={errors.title} required />
              <Field label="Title (Amharic)" name="titleAm" value={form.titleAm} onChange={handleChange} />
            </div>
            <div className="admin-form-row">
              <Field label="Subtitle (English)" name="subtitle" value={form.subtitle} onChange={handleChange} error={errors.subtitle} required />
              <Field label="Subtitle (Amharic)" name="subtitleAm" value={form.subtitleAm} onChange={handleChange} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="description">Description *</label>
              <textarea id="description" name="description" value={form.description} onChange={handleChange} rows={4} className="glass-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
              {errors.description && <p className="profile-field-error">{errors.description}</p>}
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="descriptionAm">Description (Amharic)</label>
              <textarea id="descriptionAm" name="descriptionAm" value={form.descriptionAm} onChange={handleChange} rows={3} className="glass-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          </section>

          <section className="admin-detail-section">
            <h2 className="admin-detail-section-title">Scheduling & Pricing</h2>
            <div className="admin-form-row">
              <Field label="Phase Number" name="phaseNumber" type="number" value={form.phaseNumber} onChange={handleChange} placeholder="Leave blank to auto-assign" hint="Sequential order within the course." />
              <Field label="Duration" name="duration" value={form.duration} onChange={handleChange} />
            </div>
            <div className="admin-form-row">
              <Field label="Price (ETB)" name="priceEtb" type="number" value={form.priceEtb} onChange={handleChange} placeholder="Leave blank for global price" hint="Overrides the platform per-phase price." />
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="icon">Icon</label>
                <select id="icon" name="icon" value={form.icon} onChange={handleChange} className="admin-filter-select">
                  <option value="Code2">Code</option>
                  <option value="Layers">Layers</option>
                  <option value="Cpu">CPU</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Star">Star</option>
                  <option value="Zap">Zap</option>
                </select>
              </div>
            </div>
          </section>

          <section className="admin-detail-section">
            <h2 className="admin-detail-section-title">Learning Outcomes</h2>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="outcomesText">One outcome per line</label>
              <textarea
                id="outcomesText"
                name="outcomesText"
                value={form.outcomesText}
                onChange={handleChange}
                rows={5}
                className="glass-input"
                placeholder={'Semantic HTML5 & Web Accessibility\nResponsive CSS Flexbox & CSS Grid\nProfessional Git workflows'}
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
              <p className="form-hint">Each line becomes a bullet point on the public phase card.</p>
            </div>
          </section>

          <section className="admin-detail-section">
            <label className="admin-checkbox-label">
              <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
              <span>Publish this phase (visible to students)</span>
            </label>
          </section>

          <div className="admin-detail-actions">
            <button type="button" className="admin-btn secondary" onClick={() => router.push(`/admin/courses/${courseId}`)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary" disabled={saving}>
              {saving ? <><span className="spinner-circle-sm" /> Creating...</> : <><Save size={14} /> Create Phase</>}
            </button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
};

export default AdminNewPhasePage;