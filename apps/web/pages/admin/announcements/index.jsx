/**
 * @fileoverview Admin Announcements Composer + History
 *
 * Two-tab admin page:
 *   1. Compose — send a broadcast to all / enrolled / targeted users.
 *      Targeted mode has a live user picker:
 *        - Debounced search by name, phone, or email
 *        - Click to add as a chip (multi-select supported)
 *        - Chips removable individually
 *   2. History — paginated list of every past broadcast with
 *      sent-by attribution, audience, severity, and recipient count.
 *
 * Config-driven: audience options, severity options, rate limit,
 * history page size, and all copy come from i18n + config.
 *
 * Path: apps/web/pages/admin/announcements/index.jsx
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Megaphone,
  Send,
  Users,
  GraduationCap,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Eye,
  Loader,
  ArrowLeft,
  ShieldAlert,
  Search,
  X,
  Clock,
  History as HistoryIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import SEOHead from '../../../components/shared/SEOHead';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useLanguage } from '../../../context/LanguageContext';
import { useToast } from '../../../context/ToastContext';
import apiClient from '../../../lib/api';
import { getItem } from '../../../lib/storage';
import { getNotificationsConfig } from '../../../lib/config';

/* Icon map — matches notifications.config.js severities */
const SEVERITY_ICON_MAP = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  critical: XCircle,
};

/* Audience definitions — i18n keys resolved at render time */
const AUDIENCES = [
  { id: 'all', labelKey: 'admin.announcements.audienceAll', icon: Users },
  { id: 'enrolled', labelKey: 'admin.announcements.audienceEnrolled', icon: GraduationCap },
  { id: 'targeted', labelKey: 'admin.announcements.audienceTargeted', icon: UserCheck },
];

const SEVERITIES = [
  { id: 'info', labelKey: 'admin.announcements.severityInfo', icon: Info },
  { id: 'success', labelKey: 'admin.announcements.severitySuccess', icon: CheckCircle },
  { id: 'warning', labelKey: 'admin.announcements.severityWarning', icon: AlertTriangle },
  { id: 'critical', labelKey: 'admin.announcements.severityCritical', icon: XCircle },
];

/* Debounce delay for the user search input — balances UX feel with API load */
const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;

/**
 * Resolve a dot-notation i18n key. Returns the key itself if not found.
 */
const resolveKey = (t, key) => {
  const parts = key.split('.');
  let value = t;
  for (const part of parts) {
    value = value?.[part];
    if (!value) return key;
  }
  return typeof value === 'string' ? value : key;
};

/**
 * Format a timestamp into a short relative or absolute string.
 * Used in the history table — keeps output simple and locale-agnostic.
 */
const formatHistoryTime = (isoString, labels) => {
  if (!isoString) return '—';
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return labels.timeJustNow || 'Just now';
  if (diffMins < 60) return (labels.timeMinutesAgo || '{count}m ago').replace('{count}', diffMins);
  if (diffHours < 24) return (labels.timeHoursAgo || '{count}h ago').replace('{count}', diffHours);
  if (diffDays < 7) return (labels.timeDaysAgo || '{count}d ago').replace('{count}', diffDays);
  return date.toLocaleDateString();
};

const AdminAnnouncementsPage = () => {
  const router = useRouter();
  const toast = useToast();
  const { t } = useLanguage();
  const config = getNotificationsConfig();
  const historyPageSize = config?.broadcastHistoryPageSize || 20;

  const L = useCallback((key) => resolveKey(t, key), [t]);

  /* ── Active tab: 'compose' | 'history' ── */
  const [activeTab, setActiveTab] = useState('compose');

  /* ── Composer state ── */
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('enrolled');
  const [severity, setSeverity] = useState('info');

  /* ── Targeted audience: multi-select user picker ── */
  const [selectedUsers, setSelectedUsers] = useState([]); /* [{ id, full_name, phone, email }] */
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimerRef = useRef(null);

  /* ── UI state ── */
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  /* ── History state ── */
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  /* ── Validation ── */
  const isValid = useMemo(() => {
    if (!title.trim() || title.length < 3) return false;
    if (!body.trim() || body.length < 10) return false;
    if (audience === 'targeted' && selectedUsers.length === 0) return false;
    return true;
  }, [title, body, audience, selectedUsers]);

  const PreviewIcon = SEVERITY_ICON_MAP[severity] || Info;

  /**
   * Debounced user search — fires 300ms after the user stops typing.
   * Uses the existing /api/admin/users search endpoint for consistency.
   */
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }

    const term = searchQuery.trim();
    if (term.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      return undefined;
    }

    searchTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const token = getItem('admin_token');
        if (!token) return;
        const response = await fetch(
          `/api/admin/users?search=${encodeURIComponent(term)}&limit=15`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        if (data.success) {
          /* Filter out users already in the selected list */
          const selectedIds = new Set(selectedUsers.map((u) => u.id));
          const results = (data.data?.users || []).filter((u) => !selectedIds.has(u.id));
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('[announcements] user search failed:', err.message);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }
    };
    // selectedUsers in deps ensures already-picked users are filtered out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedUsers]);

  /**
   * Add a user from the search results to the selected list.
   */
  const handleSelectUser = useCallback((user) => {
    setSelectedUsers((prev) => {
      if (prev.some((u) => u.id === user.id)) return prev;
      return [...prev, {
        id: user.id,
        full_name: user.full_name || user.fullName || user.name || 'User',
        phone: user.phone || '',
        email: user.email || '',
      }];
    });
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  /**
   * Remove a user from the selected list (× on chip).
   */
  const handleRemoveUser = useCallback((userId) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  /**
   * Load broadcast history. Triggered on tab switch and pagination.
   */
  const loadHistory = useCallback(async (page) => {
    setHistoryLoading(true);
    try {
      const token = getItem('admin_token');
      if (!token) return;
      const response = await fetch(
        `/api/admin/notifications/broadcast-history?page=${page}&pageSize=${historyPageSize}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setHistory(data.data?.announcements || []);
        setHistoryTotal(data.data?.total || 0);
        setHistoryTotalPages(data.data?.totalPages || 1);
        setHistoryPage(page);
      } else {
        toast.error(L('admin.announcements.historyLoadFailed'));
      }
    } catch (err) {
      console.error('[announcements] history load failed:', err.message);
      toast.error(L('admin.announcements.historyLoadFailed'));
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPageSize, toast, L]);

  /* Fetch history on first tab switch and on page change */
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory(historyPage);
    }
  }, [activeTab, historyPage, loadHistory]);

  /* ── Submit handler ── */
  const handleSubmit = useCallback(() => {
    if (!isValid) {
      toast.error(L('admin.announcements.validationFailed'));
      return;
    }
    setShowConfirm(true);
  }, [isValid, toast, L]);

  const handleSend = useCallback(async () => {
    if (confirmText !== 'SEND') return;
    setSending(true);
    setShowConfirm(false);

    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        severity,
        audience,
        link: '/notifications',
      };
      if (audience === 'targeted') {
        payload.userIds = selectedUsers.map((u) => u.id);
      }

      const response = await apiClient.post('/admin/notifications/broadcast', payload);

      if (response?.success) {
        const count = response.data?.recipientCount || 0;
        const template = L('admin.announcements.successToast');
        toast.success(template.replace('{count}', String(count)));

        /* Reset form for next broadcast */
        setTitle('');
        setBody('');
        setSelectedUsers([]);
        setSeverity('info');
        setAudience('enrolled');
      } else {
        toast.error(response?.message || L('admin.announcements.sendFailed'));
      }
    } catch (err) {
      console.error('[announcements] broadcast error:', err.message);
      toast.error(err?.response?.data?.message || L('admin.announcements.sendFailed'));
    } finally {
      setSending(false);
      setConfirmText('');
    }
  }, [confirmText, title, body, severity, audience, selectedUsers, toast, L]);

  const titleCount = title.length;
  const bodyCount = body.length;

  return (
    <>
      <SEOHead title={L('admin.announcements.pageTitle')} />
      <AdminLayout
        title={L('admin.announcements.pageTitle')}
        subtitle={L('admin.announcements.pageSubtitle')}
      >
        <div className="admin-announcements-page">
          <button
            type="button"
            className="admin-back-btn"
            onClick={() => router.push('/admin')}
          >
            <ArrowLeft size={16} />
            <span>{L('admin.announcements.backToDashboard')}</span>
          </button>

          {/* ── Tabs ── */}
          <div className="ann-tabs">
            <button
              type="button"
              className={`ann-tab ${activeTab === 'compose' ? 'active' : ''}`}
              onClick={() => setActiveTab('compose')}
            >
              <Megaphone size={14} />
              <span>{L('admin.announcements.tabCompose')}</span>
            </button>
            <button
              type="button"
              className={`ann-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <HistoryIcon size={14} />
              <span>{L('admin.announcements.tabHistory')}</span>
              {historyTotal > 0 && (
                <span className="ann-tab-badge">{historyTotal}</span>
              )}
            </button>
          </div>

          {/* ── COMPOSE TAB ── */}
          {activeTab === 'compose' && (
            <div className="announcements-grid">
              <section className="announcements-composer">
                {/* Audience */}
                <div className="ann-section">
                  <label className="ann-label">
                    {L('admin.announcements.audienceLabel')}
                  </label>
                  <div className="ann-audience-options">
                    {AUDIENCES.map((opt) => {
                      const Icon = opt.icon;
                      const active = audience === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          className={`ann-audience-btn ${active ? 'active' : ''}`}
                          onClick={() => setAudience(opt.id)}
                          disabled={sending}
                        >
                          <Icon size={16} />
                          <span>{L(opt.labelKey)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Targeted user picker */}
                {audience === 'targeted' && (
                  <div className="ann-section ann-targeted-section">
                    <label className="ann-label">
                      {L('admin.announcements.targetedLabel')}
                      <span className="ann-counter">
                        {selectedUsers.length} {L('admin.announcements.targetedCountSuffix')}
                      </span>
                    </label>

                    {/* Selected users as chips */}
                    {selectedUsers.length > 0 && (
                      <div className="ann-chip-list">
                        {selectedUsers.map((user) => (
                          <span key={user.id} className="ann-chip">
                            <span className="ann-chip-label">
                              {user.full_name}
                              <span className="ann-chip-sub">
                                {user.phone || user.email}
                              </span>
                            </span>
                            <button
                              type="button"
                              className="ann-chip-remove"
                              onClick={() => handleRemoveUser(user.id)}
                              aria-label={L('admin.announcements.removeUser')}
                              disabled={sending}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Search input */}
                    <div className="ann-search-wrapper">
                      <Search size={14} className="ann-search-icon" />
                      <input
                        type="text"
                        className="ann-input ann-search-input"
                        placeholder={L('admin.announcements.targetedPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={sending}
                        autoComplete="off"
                      />
                      {isSearching && (
                        <Loader size={14} className="ann-search-spinner spin" />
                      )}
                    </div>

                    <span className="ann-hint">
                      {L('admin.announcements.targetedHint')}
                    </span>

                    {/* Search results dropdown */}
                    {searchResults.length > 0 && (
                      <div className="ann-search-results">
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            className="ann-search-result"
                            onClick={() => handleSelectUser(user)}
                            disabled={sending}
                          >
                            <div className="ann-search-result-avatar">
                              {(user.full_name || user.fullName || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="ann-search-result-info">
                              <span className="ann-search-result-name">
                                {user.full_name || user.fullName || user.name}
                              </span>
                              <span className="ann-search-result-meta">
                                {user.phone || '—'} · {user.email || L('admin.announcements.noEmail')}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchQuery.trim().length >= MIN_SEARCH_LENGTH &&
                      !isSearching &&
                      searchResults.length === 0 && (
                        <div className="ann-search-empty">
                          {L('admin.announcements.noResults')}
                        </div>
                      )}
                  </div>
                )}

                {/* Title */}
                <div className="ann-section">
                  <label className="ann-label">
                    {L('admin.announcements.titleLabel')}
                    <span className="ann-counter">{titleCount}</span>
                  </label>
                  <input
                    type="text"
                    className="ann-input"
                    placeholder={L('admin.announcements.titlePlaceholder')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={120}
                    disabled={sending}
                  />
                </div>

                {/* Body */}
                <div className="ann-section">
                  <label className="ann-label">
                    {L('admin.announcements.bodyLabel')}
                    <span className="ann-counter">{bodyCount}</span>
                  </label>
                  <textarea
                    className="ann-textarea"
                    placeholder={L('admin.announcements.bodyPlaceholder')}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={500}
                    rows={5}
                    disabled={sending}
                  />
                </div>

                {/* Severity */}
                <div className="ann-section">
                  <label className="ann-label">
                    {L('admin.announcements.severityLabel')}
                  </label>
                  <div className="ann-severity-options">
                    {SEVERITIES.map((sev) => {
                      const Icon = sev.icon;
                      const active = severity === sev.id;
                      return (
                        <button
                          key={sev.id}
                          type="button"
                          className={`ann-severity-btn ${active ? 'active' : ''} sev-${sev.id}`}
                          onClick={() => setSeverity(sev.id)}
                          disabled={sending}
                        >
                          <Icon size={14} />
                          <span>{L(sev.labelKey)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  className="ann-send-btn"
                  onClick={handleSubmit}
                  disabled={!isValid || sending}
                >
                  {sending ? (
                    <>
                      <Loader size={16} className="spin" />
                      <span>{L('admin.announcements.sending')}</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>{L('admin.announcements.sendBtn')}</span>
                    </>
                  )}
                </button>
              </section>

              {/* ── Preview panel ── */}
              <aside className="announcements-preview">
                <div className="preview-header">
                  <Eye size={14} />
                  <span>{L('admin.announcements.previewLabel')}</span>
                </div>

                <div className={`preview-card severity-${severity}`}>
                  <div className={`preview-icon ${severity}`}>
                    <PreviewIcon size={20} />
                  </div>
                  <div className="preview-content">
                    <p className="preview-title">
                      {title.trim() || L('admin.announcements.previewTitlePlaceholder')}
                    </p>
                    <p className="preview-body">
                      {body.trim() || L('admin.announcements.previewBodyPlaceholder')}
                    </p>
                    <span className="preview-time">
                      {L('admin.announcements.previewTimeJustNow')}
                    </span>
                  </div>
                </div>

                <div className="preview-meta">
                  <div className="preview-meta-row">
                    <span className="preview-meta-label">
                      {L('admin.announcements.previewAudienceLabel')}:
                    </span>
                    <span className="preview-meta-value">
                      {L(AUDIENCES.find((a) => a.id === audience)?.labelKey)}
                      {audience === 'targeted' && selectedUsers.length > 0 && (
                        <span className="preview-meta-count">
                          {' '}({selectedUsers.length})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="preview-meta-row">
                    <span className="preview-meta-label">
                      {L('admin.announcements.previewSeverityLabel')}:
                    </span>
                    <span className="preview-meta-value">
                      {L(SEVERITIES.find((s) => s.id === severity)?.labelKey)}
                    </span>
                  </div>
                </div>

                <div className="preview-warning">
                  <ShieldAlert size={16} />
                  <p>{L('admin.announcements.previewWarning')}</p>
                </div>
              </aside>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === 'history' && (
            <div className="announcements-history">
              <div className="ann-history-header">
                <h3>{L('admin.announcements.historyTitle')}</h3>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => loadHistory(historyPage)}
                  disabled={historyLoading}
                >
                  {historyLoading ? (
                    <Loader size={14} className="spin" />
                  ) : (
                    <HistoryIcon size={14} />
                  )}
                  <span>{L('admin.announcements.refreshHistory')}</span>
                </button>
              </div>

              {historyLoading && history.length === 0 ? (
                <div className="ann-history-loading">
                  <Loader size={24} className="spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="ann-history-empty">
                  <Clock size={40} />
                  <p>{L('admin.announcements.historyEmpty')}</p>
                </div>
              ) : (
                <>
                  <div className="ann-history-table-wrapper">
                    <table className="ann-history-table">
                      <thead>
                        <tr>
                          <th>{L('admin.announcements.historyColWhen')}</th>
                          <th>{L('admin.announcements.historyColTitle')}</th>
                          <th>{L('admin.announcements.historyColAudience')}</th>
                          <th>{L('admin.announcements.historyColRecipients')}</th>
                          <th>{L('admin.announcements.historyColSentBy')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((row) => {
                          const SevIcon = SEVERITY_ICON_MAP[row.severity] || Info;
                          const audienceLabel =
                            L(`admin.announcements.audience${row.audience.charAt(0).toUpperCase() + row.audience.slice(1)}`) ||
                            row.audience;

                          return (
                            <tr key={row.id}>
                              <td className="ann-history-when">
                                <span className="ann-history-time">
                                  {formatHistoryTime(row.created_at, {
                                    timeJustNow: L('admin.announcements.timeJustNow'),
                                    timeMinutesAgo: L('admin.announcements.timeMinutesAgo'),
                                    timeHoursAgo: L('admin.announcements.timeHoursAgo'),
                                    timeDaysAgo: L('admin.announcements.timeDaysAgo'),
                                  })}
                                </span>
                                <span className="ann-history-severity">
                                  <SevIcon size={12} className={`sev-${row.severity}`} />
                                </span>
                              </td>
                              <td className="ann-history-title-cell">
                                <span className="ann-history-title">{row.title}</span>
                                <span className="ann-history-body-preview">{row.body}</span>
                              </td>
                              <td>
                                <span className={`ann-history-audience-pill sev-${row.severity}`}>
                                  {audienceLabel}
                                </span>
                              </td>
                              <td className="ann-history-count">
                                {row.recipient_count}
                              </td>
                              <td className="ann-history-sent-by">
                                {row.sent_by}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {historyTotalPages > 1 && (
                    <div className="ann-history-pagination">
                      <button
                        type="button"
                        className="ann-page-btn"
                        onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        disabled={historyPage === 1 || historyLoading}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="ann-page-info">
                        {historyPage} / {historyTotalPages}
                      </span>
                      <button
                        type="button"
                        className="ann-page-btn"
                        onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                        disabled={historyPage === historyTotalPages || historyLoading}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Typed-confirm modal ── */}
          {showConfirm && (
            <div className="ann-modal-overlay" onClick={() => setShowConfirm(false)}>
              <div
                className="ann-modal"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-label={L('admin.announcements.confirmTitle')}
              >
                <div className="ann-modal-header">
                  <ShieldAlert size={20} />
                  <h3>{L('admin.announcements.confirmTitle')}</h3>
                </div>

                <div className="ann-modal-body">
                  <p>{L('admin.announcements.confirmBody')}</p>

                  <div className="ann-confirm-summary">
                    <div>
                      <strong>{L('admin.announcements.previewAudienceLabel')}:</strong>{' '}
                      {L(AUDIENCES.find((a) => a.id === audience)?.labelKey)}
                      {audience === 'targeted' && ` (${selectedUsers.length})`}
                    </div>
                    <div>
                      <strong>{L('admin.announcements.previewSeverityLabel')}:</strong>{' '}
                      {L(SEVERITIES.find((s) => s.id === severity)?.labelKey)}
                    </div>
                    <div>
                      <strong>{L('admin.announcements.titleLabel')}:</strong> {title}
                    </div>
                  </div>

                  <label className="ann-label">
                    {L('admin.announcements.confirmInputLabel')}
                  </label>
                  <input
                    type="text"
                    className="ann-input"
                    placeholder="SEND"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && confirmText === 'SEND') handleSend();
                    }}
                  />
                </div>

                <div className="ann-modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowConfirm(false);
                      setConfirmText('');
                    }}
                  >
                    {L('admin.announcements.cancel')}
                  </button>
                  <button
                    type="button"
                    className="ann-confirm-btn"
                    onClick={handleSend}
                    disabled={confirmText !== 'SEND'}
                  >
                    <Send size={14} />
                    <span>{L('admin.announcements.confirmBtn')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminAnnouncementsPage;