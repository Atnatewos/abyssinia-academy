/**
 * @fileoverview Notifications Page (Full Notification Center)
 *
 * /notifications route — dedicated page for viewing all notifications
 * with advanced filtering, grouping, and management.
 *
 * Features:
 *   - Filter chips: All, Unread, Payments, Referrals, Enrollment, Security
 *   - Date grouping: Today, Yesterday, This Week, Older
 *   - Mark individual or all as read
 *   - Clear read (bulk cleanup) + manual refresh
 *   - Per-item dismiss (×) on every row
 *   - Empty state with illustration + loading skeletons
 *
 * Uses useNotifications hook for state + visibility-based polling.
 * All copy from i18n; icons from config.
 *
 * Path: apps/web/pages/notifications/index.jsx
 */
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, CheckCheck, Trash2, Inbox } from 'lucide-react';
import SEOHead from '../../components/shared/SEOHead';
import PageLayout from '../../components/shared/PageLayout';
import useNotifications from '../../hooks/useNotifications';
import { useLanguage } from '../../context/LanguageContext';
import { getNotificationsConfig } from '../../lib/config';
import {
  CheckCircle,
  XCircle,
  Unlock,
  Trophy,
  UserPlus,
  ShoppingCart,
  Banknote,
  AlertTriangle,
  Key,
  GraduationCap,
  BookOpen,
  ShieldOff,
  X,
} from 'lucide-react';

/* Icon map from config type.icon → Lucide component */
const ICON_MAP = {
  CheckCircle,
  XCircle,
  Unlock,
  Trophy,
  UserPlus,
  ShoppingCart,
  Banknote,
  AlertTriangle,
  Key,
  GraduationCap,
  BookOpen,
  ShieldOff,
};

/**
 * Group notifications by date bucket (today, yesterday, thisWeek, older).
 * @param {Array} notifications - Notification objects with created_at
 * @param {object} labels - i18n labels for group headers
 * @returns {Array<{label: string, items: Array}>}
 */
const groupByDate = (notifications, labels) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups = {
    today: { label: labels.groupToday || 'Today', items: [] },
    yesterday: { label: labels.groupYesterday || 'Yesterday', items: [] },
    thisWeek: { label: labels.groupThisWeek || 'This Week', items: [] },
    older: { label: labels.groupOlder || 'Older', items: [] },
  };

  notifications.forEach((n) => {
    const date = new Date(n.created_at);
    if (date >= today) {
      groups.today.items.push(n);
    } else if (date >= yesterday) {
      groups.yesterday.items.push(n);
    } else if (date >= weekAgo) {
      groups.thisWeek.items.push(n);
    } else {
      groups.older.items.push(n);
    }
  });

  return Object.values(groups).filter((g) => g.items.length > 0);
};

/**
 * Format relative time string (e.g., "2m ago", "1h ago", "Yesterday").
 * @param {string} dateString - ISO timestamp
 * @param {object} labels - i18n timeAgo labels
 * @returns {string} Formatted time string
 */
const formatTimeAgo = (dateString, labels) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return labels.justNow || 'Just now';
  if (diffMins < 60) return (labels.minutesAgo || '{count}m ago').replace('{count}', diffMins);
  if (diffHours < 24) return (labels.hoursAgo || '{count}h ago').replace('{count}', diffHours);
  if (diffDays === 1) return labels.yesterday || 'Yesterday';
  if (diffDays < 7) return (labels.daysAgo || '{count}d ago').replace('{count}', diffDays);
  return date.toLocaleDateString();
};

/**
 * Resolve i18n title/body from keys + tokens.
 * @param {object} notification - Notification object
 * @param {object} t - Full i18n translation object
 * @returns {{title: string, body: string}}
 */
const resolveI18n = (notification, t) => {
  const resolve = (key, tokens) => {
    const parts = key.split('.');
    let value = t;
    for (const part of parts) {
      value = value?.[part];
      if (!value) return key;
    }
    if (typeof value !== 'string') return key;
    return Object.entries(tokens || {}).reduce(
      (str, [token, val]) => str.replace(`{${token}}`, String(val)),
      value
    );
  };

  return {
    title: resolve(notification.title_key, notification.title_tokens),
    body: resolve(notification.body_key, notification.body_tokens),
  };
};

const NotificationsPage = () => {
  const { t } = useLanguage();
  const config = getNotificationsConfig();
  const {
    notifications,
    loading,
    unreadCount,
    refresh,
    markRead,
    markAllRead,
    dismiss,
    clearRead,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState('all');
  const labels = t.notification || {};

  const categories = config.categories || [
    { id: 'all', labelKey: 'notification.filter.all' },
    { id: 'unread', labelKey: 'notification.filter.unread' },
  ];

  /**
   * Resolve i18n label from dot-notation key.
   */
  const resolveLabel = (key) => {
    const parts = key.split('.');
    let value = t;
    for (const part of parts) {
      value = value?.[part];
      if (!value) return key;
    }
    return value || key;
  };

  /* Filter notifications by active category */
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'unread') return notifications.filter((n) => !n.is_read);
    return notifications.filter((n) => {
      const typeConfig = config.types[n.type];
      return typeConfig?.category === activeFilter;
    });
  }, [notifications, activeFilter, config]);

  const readCount = useMemo(
    () => notifications.filter((n) => n.is_read).length,
    [notifications]
  );

  const groups = groupByDate(filteredNotifications, labels);

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markRead(notification.id);
    }
  };

  return (
    <>
      <SEOHead title={labels.bell || 'Notifications'} />
      <PageLayout>
        <div className="notifications-page">
          <div className="notifications-header">
            <Link href="/profile" className="auth-back-link">
              <ArrowLeft size={16} />
              <span>{labels.backToProfile || 'Back to Profile'}</span>
            </Link>

            <div className="notifications-title-row">
              <h1>{labels.bell || 'Notifications'}</h1>
              <div className="notifications-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={clearRead}
                  disabled={readCount === 0 || loading}
                  aria-label={labels.clearRead || 'Clear read'}
                >
                  <Trash2 size={16} />
                  <span>{labels.clearRead || 'Clear read'}</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={markAllRead}
                  disabled={unreadCount === 0 || loading}
                  aria-label={labels.markAllRead || 'Mark all as read'}
                >
                  <CheckCheck size={16} />
                  <span>{labels.markAllRead || 'Mark all as read'}</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={refresh}
                  disabled={loading}
                  aria-label={labels.refresh || 'Refresh'}
                >
                  <RefreshCw size={16} className={loading ? 'spin' : ''} />
                  <span>{labels.refresh || 'Refresh'}</span>
                </button>
              </div>
            </div>

            <div className="notifications-filters">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`notification-filter-chip ${activeFilter === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat.id)}
                >
                  {resolveLabel(cat.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="notifications-content">
            {loading && notifications.length === 0 ? (
              <div className="notifications-loading">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={`notif-shimmer-${i}`} className="notification-item-shimmer">
                    <div className="shimmer" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%' }} />
                    <div style={{ flex: 1 }}>
                      <span className="shimmer" style={{ width: '60%', height: '1rem', display: 'block', marginBottom: '0.5rem' }} />
                      <span className="shimmer" style={{ width: '80%', height: '0.875rem', display: 'block' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="notifications-empty">
                <Inbox size={64} />
                <h2>{labels.empty || "You're all caught up!"}</h2>
                <p>{labels.emptySubtitle || 'New notifications will appear here'}</p>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="notification-group">
                  <h3 className="notification-group-label">{group.label}</h3>
                  {group.items.map((notification) => {
                    const Icon = ICON_MAP[notification.icon] || CheckCircle;
                    const { title, body } = resolveI18n(notification, t);
                    const timeAgo = formatTimeAgo(notification.created_at, labels.timeAgo || {});

                    return (
                      <div
                        key={notification.id}
                        className={`notification-item ${!notification.is_read ? 'unread' : ''} severity-${notification.severity}`}
                      >
                        <Link
                          href={notification.link || '#'}
                          className="notification-item-link"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className={`notification-icon ${notification.severity}`}>
                            <Icon size={24} />
                          </div>
                          <div className="notification-content">
                            <p className="notification-title">{title}</p>
                            <p className="notification-body">{body}</p>
                            <span className="notification-time">{timeAgo}</span>
                          </div>
                        </Link>
                        <button
                          type="button"
                          className="notification-dismiss"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            dismiss(notification.id);
                          }}
                          aria-label={labels.dismiss || 'Dismiss'}
                          title={labels.dismiss || 'Dismiss'}
                        >
                          <X size={14} />
                        </button>
                        {!notification.is_read && <span className="notification-unread-dot" />}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default NotificationsPage;