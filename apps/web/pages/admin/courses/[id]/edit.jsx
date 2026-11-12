/**
 * @fileoverview Admin Edit Course Page
 *
 * Same form shape as new.jsx, pre-populated from the server. On save,
 * PATCHes only the fields that changed (diffs against initial state).
 *
 * Path: apps/web/pages/admin/courses/[id]/edit.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import SEOHead from '../../../../components/shared/SEOHead';
import AdminLayout from '../../../../components/admin/AdminLayout';
import { useToast } from '../../../../context/ToastContext';
import apiClient from '../../../../lib/api';

const Field = ({ label, name, value, onChange, error, type = 'text', placeholder, hint, required }) => (
  <div className="admin-form-group">
    <label className="admin-form-label" htmlFor={name}>
      {label}
      {required && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
    <input
      id={name} name={name} type={type} value={value} onChange={onChange}
      placeholder={placeholder} className="glass-input"
      aria-invalid={Boolean(error)}
    />
    {hint && !error && <p className="form-hint">{hint}</p>}
    {error && <p className="profile-field-error">{error}</p>}
  </div>
);

const FieldTextarea = ({ label, name, value, onChange, error, rows = 4, required }) => (
  <div className="admin-form-group">
    <label className="admin-form-label" htmlFor={name}>
      {label}
      {required && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
    <textarea
      id={name} name={name} value={value} onChange={onChange} rows={rows}
      className="glass-input" style={{ resize: 'vertical', fontFamily: 'inherit' }}
    />
    {error && <p className="profile-field-error">{error}</p>}
  </div>
);

const SkeletonBlock = ({ height = '2.5rem' }) => (
  <div className="skeleton-base" style={{ height, borderRadius: '0.625rem' }} />
);

const AdminEditCoursePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  const [form, setForm] = useState(null);
  const [initialForm, setInitialForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchCourse = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/admin/courses/${id}`);
      if (response.success && response.data.course) {
        const c = response.data.course;
        const loaded = {
          title: c.title || '',
          titleAm: c.title_am || '',
          slug: c.slug || '',
          description: c.description || '',
          descriptionAm: c.description_am || '',
          level: c.level || 'Beginner',
          duration: c.duration || '20+ Weeks',
          badge: c.badge || '',
          icon: c.icon || 'Code2',
          priceEtb: c.price_etb !== null && c.price_etb !== undefined
            ? String(c.price_etb)
            : '',
          isPublished: Boolean(c.is_published),
          orderIndex: c.order_index || 0,
        };
        setForm(loaded);
        setInitialForm(loaded);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error('Failed to load course.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const buildDiff = () => {
    const diff = {};
    for (const key of Object.keys(form)) {
      if (form[key] !== initialForm[key]) {
        if (key === 'priceEtb') {
          diff.priceEtb = form.priceEtb === '' ? null : Number(form.priceEtb);
        } else if (['titleAm', 'descriptionAm', 'badge'].includes(key)) {
          diff[key] = form[key].trim() || null;
        } else if (key === 'orderIndex') {
          diff.orderIndex = Number(form[key]) || 0;
        } else {
          diff[key] = typeof form[key] === 'string' ? form[key].trim() : form[key];
        }
      }
    }
    return diff;
  };

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Title is required.';
    if (!form.slug.trim()) next.slug = 'Slug is required.';
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      next.slug = 'Only lowercase letters, numbers, and hyphens.';
    }
    if (!form.description.trim()) next.description = 'Description is required.';
    if (form.priceEtb !== '' && Number(form.priceEtb) < 0) {
      next.priceEtb = 'Price must be zero or positive.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    const diff = buildDiff();
    if (Object.keys(diff).length === 0) {
      toast.success('No changes to save.');
      return;
    }

    setSaving(true);
    try {
      const response = await apiClient.patch(`/admin/courses/${id}`, diff);
      if (response.success) {
        toast.success('Course updated successfully.');
        router.push(`/admin/courses/${id}`);
      } else {
        toast.error(response.message || 'Failed to update course.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update course.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Course" subtitle="Loading...">
        <div className="admin-detail-content">
          <SkeletonBlock height="3rem" />
          <SkeletonBlock height="10rem" />
          <SkeletonBlock height="6rem" />
        </div>
      </AdminLayout>
    );
  }

  if (notFound || !form) {
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

  return (
    <>
      <SEOHead title="Edit Course - Admin" />
      <AdminLayout title="Edit Course" subtitle={initialForm.title}>
        <button className="admin-back-btn" onClick={() => router.push(`/admin/courses/${id}`)}>
          <ArrowLeft size={14} /> <span>Back to Course</span>
        </button>

        <form onSubmit={handleSubmit} className="admin-detail-content">
          <section className="admin-detail-section">
            <h2 className="admin-detail-section-title"><BookOpen size={16} /> Course Identity</h2>
            <div className="admin-form-row">
              <Field label="Title (English)" name="title" value={form.title} onChange={handleChange} error={errors.title} required />
              <Field label="Title (Amharic)" name="titleAm" value={form.titleAm} onChange={handleChange} />
            </div>
            <Field label="Slug" name="slug" value={form.slug} onChange={handleChange} error={errors.slug} hint="Changing this changes the public URL." required />
            <FieldTextarea label="Description (English)" name="description" value={form.description} onChange={handleChange} error={errors.description} required />
            <FieldTextarea label="Description (Amharic)" name="descriptionAm" value={form.descriptionAm} onChange={handleChange} rows={3} />
          </section>

          <section className="admin-detail-section">
            <h2 className="admin-detail-section-title">Pricing & Delivery</h2>
            <div className="admin-form-row">
              <Field label="Price (ETB)" name="priceEtb" type="number" value={form.priceEtb} onChange={handleChange} hint="Leave blank to use the global price." error={errors.priceEtb} />
              <Field label="Duration" name="duration" value={form.duration} onChange={handleChange} />
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="level">Level</label>
                <select id="level" name="level" value={form.level} onChange={handleChange} className="admin-filter-select">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Beginner to Advanced">Beginner to Advanced</option>
                  <option value="Intermediate to Advanced">Intermediate to Advanced</option>
                </select>
              </div>
              <Field label="Badge" name="badge" value={form.badge} onChange={handleChange} />
            </div>
          </section>

          <section className="admin-detail-section">
            <h2 className="admin-detail-section-title">Visibility</h2>
            <label className="admin-checkbox-label">
              <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
              <span>Published</span>
            </label>
          </section>

          <div className="admin-detail-actions">
            <button type="button" className="admin-btn secondary" onClick={() => router.push(`/admin/courses/${id}`)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="admin-btn primary" disabled={saving}>
              {saving ? <><span className="spinner-circle-sm" /> Saving...</> : <><Save size={14} /> Save Changes</>}
            </button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
};

export default AdminEditCoursePage;