/**
 * @fileoverview Notification Panel (Dropdown + Mobile Overlay)
 *
 * Renders notification list with:
 *   - Desktop: dropdown anchored to bell icon (400px wide)
 *   - Mobile (<768px): full-screen overlay (slides up from bottom)
 *   - Grouped by date (Today, Yesterday, This Week, Older)
 *   - Mark read on click + navigate to link
 *   - Header actions: clear read, mark all read, refresh, close
 *   - Per-item dismiss (×) revealed on hover (always visible on touch)
 *   - Empty state with illustration
 *
 * All copy from i18n; icons from config (Lucide).
 *
 * Path: apps/web/components/notifications/NotificationPanel.jsx
 */
import Link from 'next/link';
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
  RefreshCw,
  CheckCheck,
  Trash2,
  X,
  Inbox,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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
 * Group notifications by date (today, yesterday, thisWeek, older).
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
 * Format relative time (e.g., "2m ago", "1h ago", "Yesterday").
 * @param {string} dateString - ISO timestamp
 * @param {object} labels - i18n timeAgo labels
 * @returns {string}
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
 * Resolve notification title/body from i18n keys + tokens.
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

/**
 * Single notification row: link wrapper + dismiss button + unread dot.
 */
const NotificationRow = ({ notification, onMarkRead, onDismiss, onClose, labels, t, iconSize }) => {
  const Icon = ICON_MAP[notification.icon] || CheckCircle;
  const { title, body } = resolveI18n(notification, t);
  const timeAgo = formatTimeAgo(notification.created_at, labels.timeAgo || {});

  const handleClick = () => {
    if (!notification.is_read) onMarkRead(notification.id);
    if (notification.link) onClose();
  };

  return (
    <div
      className={`notification-item ${!notification.is_read ? 'unread' : ''} severity-${notification.severity}`}
    >
      <Link
        href={notification.link || '#'}
        className="notification-item-link"
        onClick={handleClick}
      >
        <div className={`notification-icon ${notification.severity}`}>
          <Icon size={iconSize} />
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
          onDismiss(notification.id);
        }}
        aria-label={labels.dismiss || 'Dismiss'}
        title={labels.dismiss || 'Dismiss'}
      >
        <X size={14} />
      </button>
      {!notification.is_read && <span className="notification-unread-dot" />}
    </div>
  );
};

const NotificationPanel = ({
  notifications,
  loading,
  unreadCount,
  onRefresh,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onClearRead,
  onClose,
  labels,
}) => {
  const { t } = useLanguage();
  const groups = groupByDate(notifications, labels);
  const hasRead = notifications.some((n) => n.is_read);

  return (
    <>
      {/* Desktop dropdown */}
      <div className="notification-panel" role="dialog" aria-label={labels.bell || 'Notifications'}>
        <div className="notification-panel-header">
          <h3>{labels.bell || 'Notifications'}</h3>
          <div className="notification-panel-actions">
            <button
              type="button"
              className="notification-panel-btn"
              onClick={onClearRead}
              disabled={!hasRead || loading}
              aria-label={labels.clearRead || 'Clear read'}
              title={labels.clearRead || 'Clear read'}
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              className="notification-panel-btn"
              onClick={onMarkAllRead}
              disabled={unreadCount === 0 || loading}
              aria-label={labels.markAllRead || 'Mark all as read'}
              title={labels.markAllRead || 'Mark all as read'}
            >
              <CheckCheck size={16} />
            </button>
            <button
              type="button"
              className="notification-panel-btn"
              onClick={onRefresh}
              disabled={loading}
              aria-label={labels.refresh || 'Refresh'}
              title={labels.refresh || 'Refresh'}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </button>
            <button
              type="button"
              className="notification-panel-btn"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="notification-panel-content">
          {loading && notifications.length === 0 ? (
            <div className="notification-loading">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`notif-shimmer-${i}`} className="notification-shimmer">
                  <div className="shimmer" style={{ width: '2rem', height: '2rem', borderRadius: '50%' }} />
                  <div style={{ flex: 1 }}>
                    <span className="shimmer" style={{ width: '60%', height: '0.875rem', display: 'block', marginBottom: '0.25rem' }} />
                    <span className="shimmer" style={{ width: '80%', height: '0.75rem', display: 'block' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <Inbox size={48} />
              <p>{labels.empty || "You're all caught up!"}</p>
              <span>{labels.emptySubtitle || 'New notifications will appear here'}</span>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="notification-group">
                <h4 className="notification-group-label">{group.label}</h4>
                {group.items.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onMarkRead={onMarkRead}
                    onDismiss={onDismiss}
                    onClose={onClose}
                    labels={labels}
                    t={t}
                    iconSize={20}
                  />
                ))}
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="notification-panel-footer">
            <Link href="/notifications" className="notification-view-all" onClick={onClose}>
              {labels.viewAll || 'View all notifications'}
            </Link>
          </div>
        )}
      </div>

      {/* Mobile overlay */}
      <div className="notification-overlay" onClick={onClose}>
        <div className="notification-overlay-content" onClick={(e) => e.stopPropagation()}>
          <div className="notification-panel-header">
            <h3>{labels.bell || 'Notifications'}</h3>
            <div className="notification-panel-actions">
              <button
                type="button"
                className="notification-panel-btn"
                onClick={onClearRead}
                disabled={!hasRead || loading}
                aria-label={labels.clearRead || 'Clear read'}
              >
                <Trash2 size={18} />
              </button>
              <button
                type="button"
                className="notification-panel-btn"
                onClick={onMarkAllRead}
                disabled={unreadCount === 0 || loading}
                aria-label={labels.markAllRead || 'Mark all as read'}
              >
                <CheckCheck size={18} />
              </button>
              <button type="button" className="notification-panel-btn" onClick={onClose} aria-label="Close">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="notification-panel-content">
            {groups.map((group) => (
              <div key={group.label} className="notification-group">
                <h4 className="notification-group-label">{group.label}</h4>
                {group.items.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onMarkRead={onMarkRead}
                    onDismiss={onDismiss}
                    onClose={onClose}
                    labels={labels}
                    t={t}
                    iconSize={20}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;