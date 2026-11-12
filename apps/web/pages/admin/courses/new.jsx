/**
 * @fileoverview Admin New Course Page
 *
 * Full-page course creation form. Validates on the client for UX, then
 * sends to Express. Server-side validation is authoritative — this is
 * a convenience layer.
 *
 * Path: apps/web/pages/admin/courses/new.jsx
 */
import { useState } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';

/**
 * Reusable field — labelled input with optional error.
 */
const Field = ({ label, name, value, onChange, error, type = 'text', placeholder, hint, required }) => (
  <div className="admin-form-group">
    <label className="admin-form-label" htmlFor={name}>
      {label}
      {required && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="glass-input"
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
    />
    {hint && !error && (
      <p id={`${name}-hint`} className="form-hint">{hint}</p>
    )}
    {error && (
      <p id={`${name}-error`} className="profile-field-error">{error}</p>
    )}
  </div>
);

/**
 * Reusable textarea — for the description field.
 */
const FieldTextarea = ({ label, name, value, onChange, error, rows = 4, hint, required }) => (
  <div className="admin-form-group">
    <label className="admin-form-label" htmlFor={name}>
      {label}
      {required && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className="glass-input"
      style={{ resize: 'vertical', fontFamily: 'inherit' }}
      aria-invalid={Boolean(error)}
    />
    {hint && !error && <p className="form-hint">{hint}</p>}
    {error && <p className="profile-field-error">{error}</p>}
  </div>
);

const AdminNewCoursePage = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();

  const [form, setForm] = useState({
    title: '',
    titleAm: '',
    slug: '',
    description: '',
    descriptionAm: '',
    level: 'Beginner',
    duration: '20+ Weeks',
    badge: '',
    icon: 'Code2',
    priceEtb: '',
    isPublished: false,
    orderIndex: 0,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /**
   * Derive a slug from the title when the admin hasn't typed one.
   */
  const deriveSlug = (title) =>
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      // Auto-derive slug only when admin hasn't touched it manually
      if (name === 'title' && prev.slug === deriveSlug(prev.title)) {
        next.slug = deriveSlug(value);
      }
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Client-side validation. Server re-validates authoritatively.
   */
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

    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        titleAm: form.titleAm.trim() || null,
        descriptionAm: form.descriptionAm.trim() || null,
        badge: form.badge.trim() || null,
        priceEtb:
          form.priceEtb === '' ? null : Number(form.priceEtb),
        orderIndex: Number(form.orderIndex) || 0,
      };

      const response = await apiClient.post('/admin/courses', payload);

      if (response.success) {
        toast.success('Course created successfully.');
        router.push(`/admin/courses/${response.data.course.id}`);
      } else {
        toast.error(response.message || 'Failed to create course.');
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Failed to create course. Please try again.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SEOHead title="New Course - Admin" />
      <AdminLayout title="Create New Course" subtitle="Add a course to the academy catalog">
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => router.push('/admin/courses')}
        >
          <ArrowLeft size={14} />
          <span>Back to Courses</span>
        </button>

        <form onSubmit={handleSubmit} className="admin-detail-content">
          <section className="admin-detail-section">
            <h2 className="admin-detail-section-title">
              <BookOpen size={16} />
              Course Identity
            </h2>
            <div className="admin-form-row">
              <Field
                label="Title (English)"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Full-Stack Web Engineering Masterclass"
                error={errors.title}
                required
              />
              <Field
                label="Title (Amharic)"
                name="titleAm"
                value={form.titleAm}
                onChange={handleChange}
                placeholder="የኮርስ ርዕስ"
              />
            </div>

            <Field
              label="Slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="full-stack-web-engineering"
              hint="Auto-generated from title. Edit only if you need a custom URL."
              error={errors.slug}
              required
            />

            <FieldTextarea
              label="Description (English)"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What will students learn in this course?"
              error={errors.description}
              required
            />

            <FieldTextarea
              label="Description (Amharic)"
              name="descriptionAm"
              value={form.descriptionAm}
              onChange={handleChange}
              placeholder="የኮርሱ መግለጫ"
              rows={3}
            />
          </section>

          <section className="admin-detail-section">
            <h2 className="admin-detail-section-title">Pricing & Delivery</h2>
            <div className="admin-form-row">
              <Field
                label="Price (ETB)"
                name="priceEtb"
                type="number"
                value={form.priceEtb}
                onChange={handleChange}
                placeholder="Leave blank to use the global price"
                hint="Optional. Overrides the platform default for this course."
                error={errors.priceEtb}
              />
              <Field
                label="Duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="20+ Weeks"
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="level">Level</label>
                <select
                  id="level"
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className="admin-filter-select"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Beginner to Advanced">Beginner to Advanced</option>
                  <option value="Intermediate to Advanced">Intermediate to Advanced</option>
                </select>
              </div>
              <Field
                label="Badge"
                name="badge"
                value={form.badge}
                onChange={handleChange}
                placeholder="e.g. Most Popular"
              />
            </div>
          </section>

          <section className="admin-detail-section">
            <h2 className="admin-detail-section-title">Visibility</h2>
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                name="isPublished"
                checked={form.isPublished}
                onChange={handleChange}
              />
              <span>Publish this course (visible on the public site)</span>
            </label>
            <p className="form-hint" style={{ marginTop: '0.5rem' }}>
              Leave unchecked to save as a draft. You can publish later from the course detail page.
            </p>
          </section>

          <div className="admin-detail-actions">
            <button
              type="button"
              className="admin-btn secondary"
              onClick={() => router.push('/admin/courses')}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-btn primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-circle-sm" />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </AdminLayout>
    </>
  );
};

export default AdminNewCoursePage;