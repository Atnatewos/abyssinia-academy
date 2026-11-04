/**
 * @fileoverview Notifications Page (Full Notification Center)
 *
 * /notifications route — dedicated page for viewing all notifications
 * with advanced filtering, grouping, and management.
 *
 * All styling uses Tailwind utilities mapped to the unified design tokens
 * in themes.css. No dedicated stylesheet is required.
 *
 * Path: apps/web/pages/notifications/index.jsx
 */
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, CheckCheck, Trash2, Inbox, X } from 'lucide-react';
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

  const resolveLabel = (key) => {
    const parts = key.split('.');
    let value = t;
    for (const part of parts) {
      value = value?.[part];
      if (!value) return key;
    }
    return value || key;
  };

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

  const severityBorder = {
    success: 'border-l-success',
    warning: 'border-l-warning',
    critical: 'border-l-error',
    info: 'border-l-info',
  };

  const severityIconBg = {
    success: 'bg-success/15 text-success',
    warning: 'bg-warning/15 text-warning',
    critical: 'bg-error/15 text-error',
    info: 'bg-info/15 text-info',
  };

  return (
    <>
      <SEOHead title={labels.bell || 'Notifications'} />
      <PageLayout>
        <div className="w-full max-w-3xl mx-auto px-4 py-8 md:px-6 md:py-10">
          
          <div className="flex flex-col gap-5 mb-8">
            <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-accent transition-colors w-fit">
              <ArrowLeft size={16} />
              <span>{labels.backToProfile || 'Back to Profile'}</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h1 className="m-0 text-2xl md:text-3xl font-extrabold text-text-main">
                {labels.bell || 'Notifications'}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={clearRead}
                  disabled={readCount === 0 || loading}
                  aria-label={labels.clearRead || 'Clear read'}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-surface-secondary border border-border-light text-xs font-bold text-text-main transition-colors hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                  <span>{labels.clearRead || 'Clear read'}</span>
                </button>
                <button
                  type="button"
                  onClick={markAllRead}
                  disabled={unreadCount === 0 || loading}
                  aria-label={labels.markAllRead || 'Mark all as read'}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-surface-secondary border border-border-light text-xs font-bold text-text-main transition-colors hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCheck size={14} />
                  <span>{labels.markAllRead || 'Mark all as read'}</span>
                </button>
                <button
                  type="button"
                  onClick={refresh}
                  disabled={loading}
                  aria-label={labels.refresh || 'Refresh'}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-surface-secondary border border-border-light text-xs font-bold text-text-main transition-colors hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>{labels.refresh || 'Refresh'}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveFilter(cat.id)}
                  className={`px-4 py-2 rounded-full text-[0.8125rem] font-bold transition-all duration-200 cursor-pointer border ${
                    activeFilter === cat.id
                      ? 'bg-accent border-accent text-text-inverse'
                      : 'bg-surface-secondary border-border-light text-text-muted hover:bg-surface-hover hover:border-border-hover hover:text-text-main'
                  }`}
                >
                  {resolveLabel(cat.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            {loading && notifications.length === 0 ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={`notif-shimmer-${i}`} className="flex items-start gap-3.5 p-4 rounded-xl bg-surface-secondary border border-border-light animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-bg-skeleton shrink-0" />
                    <div className="flex-1 pt-1">
                      <div className="w-2/5 h-3.5 bg-bg-skeleton rounded mb-2.5" />
                      <div className="w-4/5 h-3 bg-bg-skeleton rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 md:p-20 gap-4 text-center">
                <Inbox size={64} className="text-text-dim opacity-40" />
                <h2 className="m-0 text-xl font-extrabold text-text-main">
                  {labels.empty || "You're all caught up!"}
                </h2>
                <p className="m-0 text-sm text-text-muted">
                  {labels.emptySubtitle || 'New notifications will appear here'}
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="mb-6 last:mb-0">
                  <h3 className="m-0 px-1 py-2 text-[0.6875rem] font-extrabold tracking-[0.08em] uppercase text-text-dim">
                    {group.label}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {group.items.map((notification) => {
                      const Icon = ICON_MAP[notification.icon] || CheckCircle;
                      const { title, body } = resolveI18n(notification, t);
                      const timeAgo = formatTimeAgo(notification.created_at, labels.timeAgo || {});

                      return (
                        <div
                          key={notification.id}
                          className={`relative flex items-start border border-border-light border-l-[3px] rounded-xl bg-surface-primary transition-colors duration-200 group ${
                            !notification.is_read ? 'bg-surface-secondary' : ''
                          } ${severityBorder[notification.severity] || 'border-l-transparent'} hover:bg-surface-hover`}
                        >
                          <Link
                            href={notification.link || '#'}
                            className="flex items-start gap-4 flex-1 min-w-0 px-5 py-4 text-inherit"
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${severityIconBg[notification.severity] || severityIconBg.info}`}>
                              <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                              <p className={`m-0 text-sm text-text-main truncate ${!notification.is_read ? 'font-extrabold' : 'font-semibold'}`}>
                                {title}
                              </p>
                              <p className="m-0 text-[0.8125rem] text-text-muted leading-relaxed line-clamp-2">
                                {body}
                              </p>
                              <span className="text-xs text-text-dim mt-1">
                                {timeAgo}
                              </span>
                            </div>
                          </Link>
                          <button
                            type="button"
                            className="absolute top-3 right-3 w-7 h-7 rounded-md bg-transparent border-none text-text-dim inline-flex items-center justify-center cursor-pointer opacity-0 transition-all duration-150 z-10 group-hover:opacity-100 hover:text-error hover:bg-error/10 focus-visible:opacity-100 md:opacity-0 opacity-100"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              dismiss(notification.id);
                            }}
                            aria-label={labels.dismiss || 'Dismiss'}
                            title={labels.dismiss || 'Dismiss'}
                          >
                            <X size={16} />
                          </button>
                          {!notification.is_read && (
                            <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-accent transition-opacity duration-150 group-hover:opacity-0 md:right-4 right-11" />
                          )}
                        </div>
                      );
                    })}
                  </div>
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