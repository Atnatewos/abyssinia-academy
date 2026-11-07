/**
 * @fileoverview Scholarship Campaign Form — Tabbed Modal with Live Preview
 *
 * Four tabs (Basics / Grants / Schedule / Documents) mirror the mental
 * model admins have for a campaign. The right-side live preview shows
 * the campaign exactly as it will render on /scholarships in real time.
 *
 * TIMEZONE HANDLING (critical):
 *   The <input type="datetime-local"> shows and accepts browser-local
 *   time. The backend stores everything as UTC. This file converts
 *   between the two:
 *     - On hydrate: UTC ISO → local `YYYY-MM-DDTHH:MM` string
 *     - On submit:  local `YYYY-MM-DDTHH:MM` → UTC ISO string
 *
 *   Without this conversion, a campaign created at local 12:39 (UTC+3)
 *   would be stored as 12:39 UTC — three hours in the future, hidden
 *   from the public listing until the clock caught up.
 *
 * DEFAULT OPEN TIME:
 *   New campaigns default `applicationsOpenAt` to "60 seconds ago" in
 *   the user's local timezone. Combined with the backend's
 *   openingGraceSeconds (60s), a freshly created campaign is instantly
 *   visible on the public listing.
 *
 * Path: apps/web/components/admin/scholarships/ScholarshipCampaignForm.jsx
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Save,
  Loader2,
  Check,
  AlertCircle,
  Search,
  Plus,
  X,
  Calendar,
  DollarSign,
  FileText,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  Sparkles,
  Eye,
  ShieldCheck,
  Globe,
  Clock,
} from 'lucide-react';
import Modal from '../../shared/Modal';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import {
  getScholarshipAllowedPhaseIds,
  getScholarshipDocumentTypes,
  getScholarshipsConfig,
} from '../../../lib/config';

/* ============================================================================
 * TIMEZONE HELPERS
 * ========================================================================== */

/**
 * Convert a Date to a `datetime-local` string in the browser's LOCAL
 * timezone. This is what <input type="datetime-local"> expects.
 *
 * @param {Date} date
 * @returns {string} e.g. "2026-11-07T12:39"
 */
const dateToLocalInput = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * Convert a `datetime-local` string (interpreted as browser local time)
 * into an ISO 8601 UTC string for the backend.
 *
 * @param {string|null} localString
 * @returns {string|null}
 */
const localInputToIsoUtc = (localString) => {
  if (!localString) return null;
  const date = new Date(localString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

/* ============================================================================
 * DOC TYPE BRIDGE
 * ========================================================================== */

const toCamelKey = (snake) =>
  String(snake || '')
    .split('_')
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');

const resolveDocLabel = (t, type) => {
  const camel = toCamelKey(type);
  return t.scholarships?.documents?.[camel] || t.scholarships?.documents?.[type] || type;
};

/* ============================================================================
 * DEFAULTS + HYDRATION
 * ========================================================================== */

const buildEmpty = () => {
  const config = getScholarshipsConfig();
  const defaults = config?.defaults || {};

  /* Default open time = 60 seconds ago (local browser time). Combined
     with the backend's openingGraceSeconds (60s), the campaign is
     immediately visible on the public listing. */
  const openAt = new Date(Date.now() - 60 * 1000);

  return {
    slug: '',
    name: '',
    nameAm: '',
    description: '',
    descriptionAm: '',
    grantsFullCourse: true,
    grantsPhases: [],
    registrationFeeETB: Number(defaults.registrationFeeETB) || 0,
    quota: Number(defaults.quota) || 100,
    applicationsOpenAt: dateToLocalInput(openAt),
    applicationsCloseAt: '',
    isActive: true,
    coverImageUrl: '',
    requiredDocuments: [],
    learnMoreContent: '',
    learnMoreUrl: '',
  };
};

const hydrate = (campaign) => {
  if (!campaign) return buildEmpty();

  const toLocalInput = (isoString) => {
    if (!isoString) return '';
    try {
      return dateToLocalInput(new Date(isoString));
    } catch {
      return '';
    }
  };

  return {
    slug: campaign.slug || '',
    name: campaign.name || '',
    nameAm: campaign.name_am || '',
    description: campaign.description || '',
    descriptionAm: campaign.description_am || '',
    grantsFullCourse: campaign.grants_full_course === true,
    grantsPhases: Array.isArray(campaign.grants_phases) ? campaign.grants_phases : [],
    registrationFeeETB: Number(campaign.registration_fee_etb) || 0,
    quota: Number(campaign.quota) || 100,
    applicationsOpenAt: toLocalInput(campaign.applications_open_at),
    applicationsCloseAt: toLocalInput(campaign.applications_close_at),
    isActive: campaign.is_active !== false,
    coverImageUrl: campaign.cover_image_url || '',
    requiredDocuments: Array.isArray(campaign.required_documents)
      ? campaign.required_documents
      : [],
    learnMoreContent: campaign.learn_more_content || '',
    learnMoreUrl: campaign.learn_more_url || '',
  };
};

/* ============================================================================
 * VALIDATION
 * ========================================================================== */

const validate = (form, registeredTypes) => {
  const errors = {};

  const slug = (form.slug || '').trim();
  if (!slug) {
    errors.slug = 'URL slug is required.';
  } else if (!/^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$/.test(slug)) {
    errors.slug = 'Slug must be 3-80 chars: lowercase letters, digits, hyphens only.';
  }

  if (!form.name || form.name.trim().length < 3) {
    errors.name = 'Campaign name must be at least 3 characters.';
  }

  const hasFull = form.grantsFullCourse === true;
  const hasPhases = Array.isArray(form.grantsPhases) && form.grantsPhases.length > 0;
  if (!hasFull && !hasPhases) {
    errors.grants = 'Select full course access or at least one phase.';
  }

  const fee = Number(form.registrationFeeETB);
  if (!Number.isFinite(fee) || fee < 0) {
    errors.registrationFeeETB = 'Fee must be 0 or greater.';
  }

  const quota = Number(form.quota);
  if (!Number.isInteger(quota) || quota < 1) {
    errors.quota = 'Quota must be a whole number of 1 or more.';
  }

  if (form.applicationsCloseAt && form.applicationsOpenAt) {
    if (new Date(form.applicationsCloseAt) <= new Date(form.applicationsOpenAt)) {
      errors.applicationsCloseAt = 'Close date must be after open date.';
    }
  }

  const registry = new Set(registeredTypes);
  for (const doc of form.requiredDocuments) {
    if (!registry.has(doc.type)) {
      errors.requiredDocuments = `Unknown document type "${doc.type}".`;
      break;
    }
  }

  return errors;
};

/* ============================================================================
 * FIELD PRIMITIVES
 * ========================================================================== */

const INPUT_CLASS =
  'w-full px-3.5 py-2.5 text-xs rounded-xl border border-border-medium bg-bg-input text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all';

const LABEL_CLASS = 'block text-2xs font-bold text-text-main mb-1.5';

const Field = ({ label, required, hint, error, children }) => (
  <div className="min-w-0">
    <label className={LABEL_CLASS}>
      {label} {required && <span className="text-error">*</span>}
    </label>
    {children}
    {error ? (
      <p className="mt-1 text-2xs text-error flex items-center gap-1 animate-fade-in-up">
        <AlertCircle size={10} />
        {error}
      </p>
    ) : hint ? (
      <p className="mt-1 text-2xs text-text-dim">{hint}</p>
    ) : null}
  </div>
);

/**
 * Switch — accessible toggle. Single <label> wraps the hidden input and
 * the visual track, so clicking anywhere toggles the value.
 */
const Switch = ({ checked, onChange, disabled }) => (
  <label
    className={`relative inline-flex items-center cursor-pointer select-none ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className="peer sr-only"
    />
    <span
      className="w-11 h-6 rounded-full bg-bg-pill border border-border-medium transition-colors
                 peer-checked:bg-accent peer-checked:border-accent
                 peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40"
    />
    <span
      className="absolute left-[3px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow
                 transition-transform peer-checked:translate-x-5"
    />
  </label>
);

/**
 * DateTimeInput — native datetime-local with a "Now" shortcut button.
 * Value is always a `datetime-local` string (browser-local time); the
 * parent form handles conversion to UTC on submit.
 */
const DateTimeInput = ({ value, onChange, min, allowNow = true, disabled }) => (
  <div className="relative">
    <Calendar
      size={14}
      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
    />
    <input
      type="datetime-local"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      disabled={disabled}
      className={`${INPUT_CLASS} pl-9 pr-20 font-mono text-xs`}
    />
    {allowNow && (
      <button
        type="button"
        onClick={() => onChange(dateToLocalInput(new Date()))}
        disabled={disabled}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1
                   px-2 py-1 rounded-md text-2xs font-bold
                   bg-accent/10 text-accent border border-accent/30
                   hover:bg-accent/20 transition-colors disabled:opacity-50"
      >
        <Clock size={10} />
        Now
      </button>
    )}
  </div>
);

/* ============================================================================
 * DOCUMENT PICKER
 * ========================================================================== */

const DocumentPicker = ({ selected, onChange, registryTypes, searchTerm, onSearch }) => {
  const { t } = useLanguage();

  const selectedByType = useMemo(() => {
    const map = {};
    for (const d of selected) map[d.type] = d;
    return map;
  }, [selected]);

  const filtered = useMemo(() => {
    if (!searchTerm) return registryTypes;
    const term = searchTerm.toLowerCase();
    return registryTypes.filter((type) => {
      const label = resolveDocLabel(t, type).toLowerCase();
      return label.includes(term) || type.toLowerCase().includes(term);
    });
  }, [registryTypes, searchTerm, t]);

  const unknown = useMemo(
    () => selected.filter((d) => !registryTypes.includes(d.type)),
    [selected, registryTypes]
  );

  const toggle = (type) => {
    if (selectedByType[type]) {
      onChange(selected.filter((d) => d.type !== type));
    } else {
      const registry = getScholarshipDocumentTypes();
      const defaultRequired = registry[type]?.defaultRequired === true;
      onChange([...selected, { type, required: defaultRequired }]);
    }
  };

  const setRequired = (type, required) => {
    onChange(selected.map((d) => (d.type === type ? { ...d, required } : d)));
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t.scholarships?.admin?.formDocumentsSearchPlaceholder || 'Filter documents...'}
          className={INPUT_CLASS + ' pl-9'}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-xl border border-dashed border-border-light text-xs text-text-dim">
          {t.scholarships?.admin?.formDocumentsEmpty || 'No document types registered.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
          {filtered.map((type) => {
            const doc = selectedByType[type];
            const isOn = Boolean(doc);
            return (
              <div
                key={type}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isOn ? 'border-accent/40 bg-accent/5' : 'border-border-light bg-bg-input'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <button
                    type="button"
                    onClick={() => toggle(type)}
                    className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isOn ? 'bg-accent text-text-inverse' : 'bg-bg-pill text-text-dim hover:text-text-main'
                    }`}
                    aria-label={isOn ? 'Remove' : 'Add'}
                  >
                    {isOn ? <Check size={12} strokeWidth={3} /> : <Plus size={12} />}
                  </button>
                  <span className={`text-xs truncate ${isOn ? 'text-text-main font-semibold' : 'text-text-muted'}`}>
                    {resolveDocLabel(t, type)}
                  </span>
                </div>
                {isOn && (
                  <label className="inline-flex items-center gap-1.5 cursor-pointer shrink-0 text-2xs text-text-muted hover:text-accent transition-colors">
                    <input
                      type="checkbox"
                      checked={doc.required === true}
                      onChange={(e) => setRequired(type, e.target.checked)}
                      className="w-3.5 h-3.5 rounded accent-[color:var(--accent-gold)]"
                    />
                    <span>Required</span>
                  </label>
                )}
              </div>
            );
          })}
        </div>
      )}

      {unknown.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-error/20">
          <p className="text-2xs font-semibold text-error flex items-center gap-1">
            <AlertCircle size={12} />
            {t.scholarships?.admin?.formDocumentsUnknown || 'Unknown document types:'}
          </p>
          {unknown.map((d) => (
            <div
              key={d.type}
              className="flex items-center justify-between px-3 py-2 rounded-xl border border-error/30 bg-error/5 text-xs text-error"
            >
              <span className="font-mono text-2xs">{d.type}</span>
              <button
                type="button"
                onClick={() => onChange(selected.filter((x) => x.type !== d.type))}
                className="p-1 hover:bg-error/10 rounded-lg transition-colors"
                aria-label="Remove"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * CARD PREVIEW
 * ========================================================================== */

const CardPreview = ({ form, language }) => {
  const name = language === 'am' && form.nameAm ? form.nameAm : form.name;
  const description = language === 'am' && form.descriptionAm ? form.descriptionAm : form.description;
  const fee = Number(form.registrationFeeETB) || 0;
  const quota = Number(form.quota) || 0;
  const phaseCount = Array.isArray(form.grantsPhases) ? form.grantsPhases.length : 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-border-light bg-bg-card-solid shadow-lg">
      <div className="relative h-28 overflow-hidden bg-bg-input">
        {form.coverImageUrl ? (
          <img
            src={form.coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-dim text-xs">
            No cover image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-card-solid via-transparent to-transparent" />
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 text-2xs font-bold rounded-full bg-bg-card-solid/90 text-accent border border-accent/40">
            {fee > 0 ? `${fee.toLocaleString()} ETB` : 'FREE'}
          </span>
        </div>
        <div className="absolute bottom-2 left-3 w-8 h-8 rounded-lg bg-accent text-text-inverse flex items-center justify-center shadow-glow-gold-sm">
          <Sparkles size={14} />
        </div>
      </div>

      <div className="p-3 space-y-2">
        <h5 className="text-xs font-bold text-text-main line-clamp-1">
          {name || 'Untitled Campaign'}
        </h5>
        <p className="text-2xs text-text-muted line-clamp-2">
          {description || 'No description yet.'}
        </p>
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-2xs font-bold border border-accent/30">
            {form.grantsFullCourse ? 'Full Course' : `${phaseCount} phase(s)`}
          </span>
          {form.requiredDocuments.length > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-info/10 text-info text-2xs font-bold border border-info/30">
              <FileText size={8} />
              {form.requiredDocuments.length}
            </span>
          )}
        </div>
        <div className="pt-2 border-t border-border-light flex items-center justify-between text-2xs text-text-dim">
          <span>{quota} seats</span>
          <span className="text-accent font-semibold">View →</span>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * MAIN COMPONENT
 * ========================================================================== */

const TABS = [
  { id: 'basics', labelKey: 'formCreateTitle', fallback: 'Basics', Icon: FileText },
  { id: 'grants', labelKey: 'formGrantType', fallback: 'Grants & Pricing', Icon: DollarSign },
  { id: 'schedule', labelKey: 'formOpenAt', fallback: 'Schedule & Media', Icon: Calendar },
  { id: 'documents', labelKey: 'formDocumentsLabel', fallback: 'Documents & Links', Icon: Layers },
];

const ScholarshipCampaignForm = ({ isOpen, onClose, onSaved, campaign = null }) => {
  const { t, language } = useLanguage();
  const toast = useToast();

  const allowedPhases = useMemo(() => getScholarshipAllowedPhaseIds(), []);
  const documentTypes = useMemo(() => getScholarshipDocumentTypes(), []);
  const registryTypes = useMemo(() => Object.keys(documentTypes), [documentTypes]);
  const config = useMemo(() => getScholarshipsConfig(), []);
  const learnMoreConfig = config?.learnMore || {};
  const isEdit = Boolean(campaign && campaign.id);

  const [activeTab, setActiveTab] = useState('basics');
  const [form, setForm] = useState(buildEmpty);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const [docSearch, setDocSearch] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setForm(hydrate(campaign));
    setErrors({});
    setServerError('');
    setDocSearch('');
    setActiveTab('basics');
  }, [isOpen, campaign]);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (serverError) setServerError('');
  };

  const togglePhase = (id) => {
    setForm((prev) => ({
      ...prev,
      grantsPhases: prev.grantsPhases.includes(id)
        ? prev.grantsPhases.filter((p) => p !== id)
        : [...prev.grantsPhases, id],
    }));
    if (errors.grants) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.grants;
        return next;
      });
    }
  };

  const tabHasError = useMemo(() => ({
    basics: Boolean(errors.name || errors.slug),
    grants: Boolean(errors.grants || errors.registrationFeeETB || errors.quota),
    schedule: Boolean(errors.applicationsCloseAt),
    documents: Boolean(errors.requiredDocuments),
  }), [errors]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setServerError('');

    const validationErrors = validate(form, registryTypes);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      if (validationErrors.name || validationErrors.slug) setActiveTab('basics');
      else if (validationErrors.grants || validationErrors.registrationFeeETB || validationErrors.quota) setActiveTab('grants');
      else if (validationErrors.applicationsCloseAt) setActiveTab('schedule');
      else if (validationErrors.requiredDocuments) setActiveTab('documents');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim(),
        name: form.name.trim(),
        nameAm: form.nameAm?.trim() || null,
        description: form.description?.trim() || null,
        descriptionAm: form.descriptionAm?.trim() || null,
        grantsFullCourse: form.grantsFullCourse === true,
        grantsPhases: form.grantsPhases.length > 0 ? form.grantsPhases : null,
        registrationFeeETB: Number(form.registrationFeeETB),
        quota: Number(form.quota),
        /* Convert form's `datetime-local` (browser local time) into UTC
           ISO strings for the backend. */
        applicationsOpenAt: localInputToIsoUtc(form.applicationsOpenAt),
        applicationsCloseAt: localInputToIsoUtc(form.applicationsCloseAt),
        isActive: form.isActive === true,
        coverImageUrl: form.coverImageUrl?.trim() || null,
        requiredDocuments: form.requiredDocuments,
        learnMoreContent: form.learnMoreContent?.trim() || null,
        learnMoreUrl: form.learnMoreUrl?.trim() || null,
      };

      const response = isEdit
        ? await apiClient.put(`/admin/scholarships/${campaign.id}`, payload, { _confirm: null })
        : await apiClient.post('/admin/scholarships', payload, { _confirm: null });

      if (response?.success) {
        onClose();
        toast.success(
          isEdit
            ? t.scholarships?.admin?.formSuccessUpdated || 'Campaign updated.'
            : t.scholarships?.admin?.formSuccessCreated || 'Campaign created.'
        );
        if (typeof onSaved === 'function') {
          try { await onSaved(); } catch (err) { console.error('[form] refresh failed:', err); }
        }
      } else {
        const msg = response?.message || 'Save failed.';
        setServerError(msg);
        toast.error(msg);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Save failed. Check your connection and try again.';
      setServerError(message);
      toast.error(message);
      if (error?.response?.data?.code === 'SLUG_TAKEN') {
        setErrors((prev) => ({ ...prev, slug: t.scholarships?.admin?.formSlugError || 'Slug already taken.' }));
        setActiveTab('basics');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const maxLearnChars = learnMoreConfig.maxContentChars || 5000;
  const maxLearnUrl = learnMoreConfig.maxUrlChars || 500;
  const learnMoreEnabled = learnMoreConfig.enabled !== false;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex items-stretch md:items-center justify-center p-0 md:p-6 animate-[fadeIn_0.15s_ease-out]"
      onClick={saving ? undefined : onClose}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="relative w-full md:max-w-6xl max-h-full md:max-h-[90vh] bg-bg-card-solid md:rounded-2xl border-0 md:border border-border-medium shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border-light shrink-0 bg-bg-secondary/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-accent text-text-inverse flex items-center justify-center shrink-0 shadow-glow-gold-sm">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-text-main truncate">
                {isEdit
                  ? t.scholarships?.admin?.formEditTitle || 'Edit Campaign'
                  : t.scholarships?.admin?.formCreateTitle || 'Create Campaign'}
              </h2>
              <p className="text-2xs text-text-muted truncate">
                Configure rules, documents, and grants.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-2xs font-bold rounded-lg border transition-colors ${
                showPreview
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'border-border-medium text-text-muted hover:text-text-main'
              }`}
            >
              <Eye size={12} />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
              className="p-1.5 rounded-lg text-text-dim hover:text-text-main hover:bg-bg-ghost-hover transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 flex flex-col md:flex-row min-h-0"
        >
          {/* LEFT — tabbed form */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <div className="flex items-center gap-0.5 px-3 border-b border-border-light bg-bg-secondary/30 overflow-x-auto shrink-0">
              {TABS.map(({ id, labelKey, fallback, Icon }) => {
                const active = activeTab === id;
                const hasErr = tabHasError[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                      active
                        ? 'border-accent text-accent'
                        : 'border-transparent text-text-muted hover:text-text-main'
                    }`}
                  >
                    <Icon size={13} className={active ? 'text-accent' : 'text-text-dim'} />
                    <span>{t.scholarships?.admin?.[labelKey] || fallback}</span>
                    {id === 'documents' && form.requiredDocuments.length > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-2xs font-bold ${
                        active ? 'bg-accent/15 text-accent' : 'bg-bg-pill text-text-dim'
                      }`}>
                        {form.requiredDocuments.length}
                      </span>
                    )}
                    {hasErr && <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />}
                  </button>
                );
              })}
            </div>

            {serverError && (
              <div className="mx-4 mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-error/10 border border-error/30 text-error text-xs animate-fade-in-up">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
              {activeTab === 'basics' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field
                      label={t.scholarships?.admin?.formName || 'Campaign Name'}
                      required
                      error={errors.name}
                    >
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          setField('name', e.target.value);
                          if (!form.slug) {
                            const slug = e.target.value
                              .toLowerCase()
                              .trim()
                              .replace(/[^\w\s-]/g, '')
                              .replace(/[\s_-]+/g, '-')
                              .replace(/^-+|-+$/g, '');
                            setField('slug', slug);
                          }
                        }}
                        placeholder="Tech Leaders Scholarship 2026"
                        maxLength={200}
                        className={INPUT_CLASS}
                      />
                    </Field>
                    <Field label={t.scholarships?.admin?.formNameAm || 'Name (Amharic)'}>
                      <input
                        type="text"
                        value={form.nameAm}
                        onChange={(e) => setField('nameAm', e.target.value)}
                        placeholder="የቴክኖሎጂ መሪዎች ስኮላርሺፕ"
                        maxLength={200}
                        className={INPUT_CLASS}
                      />
                    </Field>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={LABEL_CLASS}>
                        {t.scholarships?.admin?.formSlug || 'URL Slug'}{' '}
                        <span className="text-error">*</span>
                      </label>
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-2xs font-mono text-text-dim select-none">
                        /scholarships/
                      </span>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => setField('slug', e.target.value.toLowerCase())}
                        placeholder="tech-scholars-2026"
                        maxLength={80}
                        className={`w-full pl-28 pr-3.5 py-2.5 text-xs font-mono rounded-xl border ${
                          errors.slug ? 'border-error bg-error/5' : 'border-border-medium bg-bg-input'
                        } text-text-main placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all`}
                      />
                    </div>
                    {errors.slug ? (
                      <p className="mt-1 text-2xs text-error flex items-center gap-1 animate-fade-in-up">
                        <AlertCircle size={10} />
                        {errors.slug}
                      </p>
                    ) : (
                      <p className="mt-1 text-2xs text-text-dim">
                        {t.scholarships?.admin?.formSlugHint || 'Used in /scholarships/<slug>'}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label={t.scholarships?.admin?.formDescription || 'Description'}>
                      <textarea
                        rows={4}
                        value={form.description}
                        onChange={(e) => setField('description', e.target.value)}
                        placeholder="Brief summary shown on the campaign card..."
                        className={INPUT_CLASS + ' resize-none'}
                      />
                    </Field>
                    <Field label={t.scholarships?.admin?.formDescriptionAm || 'Description (Amharic)'}>
                      <textarea
                        rows={4}
                        value={form.descriptionAm}
                        onChange={(e) => setField('descriptionAm', e.target.value)}
                        placeholder="ስለ ስኮላርሺፑ አጭር መግለጫ..."
                        className={INPUT_CLASS + ' resize-none'}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {activeTab === 'grants' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="p-4 rounded-2xl border border-border-light bg-bg-input">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-text-main">Grant Coverage</h4>
                        <p className="text-2xs text-text-muted mt-0.5">
                          Toggle full course, or select specific phases below.
                        </p>
                      </div>
                      <Switch
                        checked={form.grantsFullCourse}
                        onChange={(v) => setField('grantsFullCourse', v)}
                      />
                    </div>

                    <div className="pt-3 mt-3 border-t border-border-light">
                      <label className={LABEL_CLASS}>Specific Phases</label>
                      <div className="flex flex-wrap gap-2">
                        {allowedPhases.map((phaseId) => {
                          const selected = form.grantsPhases.includes(phaseId);
                          return (
                            <button
                              key={phaseId}
                              type="button"
                              onClick={() => togglePhase(phaseId)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-2xs font-semibold transition-all ${
                                selected
                                  ? 'bg-accent text-text-inverse shadow-glow-gold-sm'
                                  : 'bg-bg-card-solid border border-border-light text-text-muted hover:border-accent/40'
                              }`}
                            >
                              {selected && <Check size={10} />}
                              {phaseId.replace('phase-', 'Phase ')}
                            </button>
                          );
                        })}
                      </div>
                      {errors.grants && (
                        <p className="mt-2 text-2xs text-error flex items-center gap-1 animate-fade-in-up">
                          <AlertCircle size={10} />
                          {errors.grants}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field
                      label={t.scholarships?.admin?.formFee || 'Registration Fee (ETB)'}
                      required
                      error={errors.registrationFeeETB}
                      hint={t.scholarships?.admin?.formFeeHint || 'Set to 0 for free'}
                    >
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xs font-bold text-text-dim">
                          ETB
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.registrationFeeETB}
                          onChange={(e) => setField('registrationFeeETB', e.target.value)}
                          className={INPUT_CLASS + ' pl-12 font-semibold'}
                        />
                      </div>
                    </Field>
                    <Field
                      label={t.scholarships?.admin?.formQuota || 'Max Recipients'}
                      required
                      error={errors.quota}
                      hint="Total number of applicants to accept."
                    >
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={form.quota}
                        onChange={(e) => setField('quota', e.target.value)}
                        className={INPUT_CLASS + ' font-semibold'}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field
                      label={t.scholarships?.admin?.formOpenAt || 'Opens'}
                      hint="Defaults to just now — campaign is instantly public."
                    >
                      <DateTimeInput
                        value={form.applicationsOpenAt}
                        onChange={(v) => setField('applicationsOpenAt', v)}
                        min={undefined}
                      />
                    </Field>
                    <Field
                      label={t.scholarships?.admin?.formCloseAt || 'Closes'}
                      error={errors.applicationsCloseAt}
                      hint={t.scholarships?.admin?.formCloseAtHint || 'Leave empty for open-ended'}
                    >
                      <DateTimeInput
                        value={form.applicationsCloseAt}
                        onChange={(v) => setField('applicationsCloseAt', v)}
                        min={form.applicationsOpenAt || undefined}
                      />
                    </Field>
                  </div>

                  <Field label="Cover Banner Image URL">
                    <div className="relative">
                      <ImageIcon
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
                      />
                      <input
                        type="url"
                        value={form.coverImageUrl}
                        onChange={(e) => setField('coverImageUrl', e.target.value)}
                        placeholder="https://res.cloudinary.com/..."
                        className={INPUT_CLASS + ' pl-9'}
                      />
                    </div>
                  </Field>

                  {form.coverImageUrl && (
                    <div className="relative h-32 rounded-2xl overflow-hidden border border-border-light bg-bg-input">
                      <img
                        src={form.coverImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-card-solid via-transparent to-transparent flex items-end p-2">
                        <span className="text-2xs font-semibold text-text-main bg-bg-card-solid/80 px-2 py-1 rounded-lg">
                          Banner Preview
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4 animate-fade-in-up">
                  <div>
                    <h4 className="text-xs font-bold text-text-main flex items-center gap-1.5 mb-2">
                      <ShieldCheck size={14} className="text-accent" />
                      {t.scholarships?.admin?.formDocumentsLabel || 'Required Documents'} ·{' '}
                      {form.requiredDocuments.length}
                    </h4>
                    <DocumentPicker
                      selected={form.requiredDocuments}
                      onChange={(next) => setField('requiredDocuments', next)}
                      registryTypes={registryTypes}
                      searchTerm={docSearch}
                      onSearch={setDocSearch}
                    />
                    {errors.requiredDocuments && (
                      <p className="mt-2 text-2xs text-error flex items-center gap-1 animate-fade-in-up">
                        <AlertCircle size={10} />
                        {errors.requiredDocuments}
                      </p>
                    )}
                  </div>

                  {learnMoreEnabled && (
                    <div className="pt-3 border-t border-border-light space-y-3">
                      <h4 className="text-xs font-bold text-text-main">
                        {t.scholarships?.learnMore?.title || 'Learn More'}
                      </h4>
                      <Field
                        label="Inline Content"
                        hint={`${form.learnMoreContent.length} / ${maxLearnChars}`}
                      >
                        <textarea
                          rows={3}
                          value={form.learnMoreContent}
                          onChange={(e) => setField('learnMoreContent', e.target.value.slice(0, maxLearnChars))}
                          maxLength={maxLearnChars}
                          placeholder="Extra instructions or criteria..."
                          className={INPUT_CLASS + ' resize-none'}
                        />
                      </Field>
                      <Field label="External Link (optional)">
                        <div className="relative">
                          <ExternalLink
                            size={14}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim pointer-events-none"
                          />
                          <input
                            type="url"
                            value={form.learnMoreUrl}
                            onChange={(e) => setField('learnMoreUrl', e.target.value.slice(0, maxLearnUrl))}
                            maxLength={maxLearnUrl}
                            placeholder="https://example.com/rules"
                            className={INPUT_CLASS + ' pl-9'}
                          />
                        </div>
                      </Field>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-accent/10 text-accent shrink-0">
                        <Globe size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-text-main">
                          {t.scholarships?.admin?.formActive || 'Campaign is Active'}
                        </h4>
                        <p className="text-2xs text-text-muted">
                          Publish to the public listing.
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={form.isActive}
                      onChange={(v) => setField('isActive', v)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 md:px-5 py-3 border-t border-border-light bg-bg-secondary/60 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-border-medium text-xs font-bold text-text-muted hover:text-text-main disabled:opacity-50 transition-colors"
              >
                {t.scholarships?.admin?.formCancel || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-accent text-text-inverse text-xs font-bold hover:bg-accent-light shadow-glow-gold-sm disabled:opacity-50 transition-all active:scale-95"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {saving
                  ? t.scholarships?.admin?.formSaving || 'Saving...'
                  : isEdit
                  ? t.scholarships?.admin?.formSaveButton || 'Save Campaign'
                  : t.scholarships?.admin?.createCampaign || 'Create Campaign'}
              </button>
            </div>
          </div>

          {showPreview && (
            <aside className="hidden md:flex w-72 shrink-0 border-l border-border-light bg-bg-secondary/30 flex-col">
              <div className="px-4 py-3 border-b border-border-light">
                <p className="text-2xs font-extrabold uppercase tracking-widest text-text-dim flex items-center gap-1.5">
                  <Eye size={11} />
                  Live Card Preview
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <CardPreview form={form} language={language} />
                <p className="mt-3 text-2xs text-text-dim text-center leading-relaxed">
                  This is exactly how the campaign card will appear on the public listing.
                </p>
              </div>
            </aside>
          )}
        </form>
      </div>
    </div>
  );
};

export default ScholarshipCampaignForm;