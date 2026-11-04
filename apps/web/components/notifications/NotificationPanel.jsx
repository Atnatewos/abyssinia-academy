/**
 * @fileoverview Notification Panel (Dropdown + Mobile Floating Card)
 *
 * Path: apps/web/components/notifications/NotificationPanel.jsx
 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  CheckCircle, XCircle, Unlock, Trophy, UserPlus, ShoppingCart,
  Banknote, AlertTriangle, Key, GraduationCap, BookOpen, ShieldOff,
  RefreshCw, CheckCheck, Trash2, X, Inbox,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const ICON_MAP = {
  CheckCircle, XCircle, Unlock, Trophy, UserPlus, ShoppingCart,
  Banknote, AlertTriangle, Key, GraduationCap, BookOpen, ShieldOff,
};

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
    if (date >= today) groups.today.items.push(n);
    else if (date >= yesterday) groups.yesterday.items.push(n);
    else if (date >= weekAgo) groups.thisWeek.items.push(n);
    else groups.older.items.push(n);
  });

  return Object.values(groups).filter((g) => g.items.length > 0);
};

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

const NotificationRow = ({ notification, onMarkRead, onDismiss, onClose, labels, t, iconSize }) => {
  const Icon = ICON_MAP[notification.icon] || CheckCircle;
  const { title, body } = resolveI18n(notification, t);
  const timeAgo = formatTimeAgo(notification.created_at, labels.timeAgo || {});

  const handleClick = () => {
    if (!notification.is_read) onMarkRead(notification.id);
    if (notification.link) onClose();
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
    <div
      className={`relative flex items-start border-l-[3px] transition-colors duration-200 group ${
        !notification.is_read ? 'bg-surface-secondary' : 'border-l-transparent'
      } ${severityBorder[notification.severity] || 'border-l-transparent'} hover:bg-surface-hover`}
    >
      <Link
        href={notification.link || '#'}
        className="flex items-start gap-3.5 flex-1 min-w-0 px-5 py-3.5 text-inherit"
        onClick={handleClick}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${severityIconBg[notification.severity] || severityIconBg.info}`}>
          <Icon size={iconSize} />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <p className={`m-0 text-sm text-text-main truncate ${!notification.is_read ? 'font-extrabold' : 'font-semibold'}`}>
            {title}
          </p>
          <p className="m-0 text-xs text-text-muted leading-relaxed line-clamp-2">
            {body}
          </p>
          <span className="text-[0.6875rem] text-text-dim mt-1">
            {timeAgo}
          </span>
        </div>
      </Link>
      <button
        type="button"
        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md bg-transparent border-none text-text-dim inline-flex items-center justify-center cursor-pointer opacity-0 transition-all duration-150 z-10 group-hover:opacity-100 hover:text-error hover:bg-error/10 focus-visible:opacity-100 md:opacity-0 opacity-100"
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
      {!notification.is_read && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent transition-opacity duration-150 group-hover:opacity-0 md:right-4 right-9" />
      )}
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
  const [mounted, setMounted] = useState(false);
  const groups = groupByDate(notifications, labels);
  const hasRead = notifications.some((n) => n.is_read);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const renderHeader = (isMobile = false) => (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border-light shrink-0">
      <h3 className="m-0 text-lg font-extrabold text-text-main">
        {labels.bell || 'Notifications'}
      </h3>
      <div className="flex gap-1.5">
        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-transparent border-none text-text-muted inline-flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-surface-secondary hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onClearRead}
          disabled={!hasRead || loading}
          aria-label={labels.clearRead || 'Clear read'}
          title={labels.clearRead || 'Clear read'}
        >
          <Trash2 size={isMobile ? 18 : 16} />
        </button>
        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-transparent border-none text-text-muted inline-flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-surface-secondary hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0 || loading}
          aria-label={labels.markAllRead || 'Mark all as read'}
          title={labels.markAllRead || 'Mark all as read'}
        >
          <CheckCheck size={isMobile ? 18 : 16} />
        </button>
        {!isMobile && (
          <button
            type="button"
            className="w-8 h-8 rounded-lg bg-transparent border-none text-text-muted inline-flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-surface-secondary hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onRefresh}
            disabled={loading}
            aria-label={labels.refresh || 'Refresh'}
            title={labels.refresh || 'Refresh'}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-transparent border-none text-text-muted inline-flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-surface-secondary hover:text-accent"
          onClick={onClose}
          aria-label="Close"
          title="Close"
        >
          <X size={isMobile ? 20 : 16} />
        </button>
      </div>
    </div>
  );

  const renderContent = (iconSize = 20) => (
    <div className="flex-1 overflow-y-auto py-2">
      {loading && notifications.length === 0 ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`notif-shimmer-${i}`} className="flex items-center gap-3.5 p-3.5">
              <div className="w-8 h-8 rounded-full bg-bg-skeleton animate-pulse shrink-0" />
              <div className="flex-1">
                <div className="w-3/5 h-3.5 bg-bg-skeleton rounded animate-pulse mb-1" />
                <div className="w-4/5 h-3 bg-bg-skeleton rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3 text-center">
          <Inbox size={48} className="text-text-dim opacity-50" />
          <p className="m-0 text-base font-bold text-text-main">
            {labels.empty || "You're all caught up!"}
          </p>
          <span className="m-0 text-sm text-text-muted">
            {labels.emptySubtitle || 'New notifications will appear here'}
          </span>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.label} className="py-2">
            <h4 className="m-0 px-5 py-2 text-[0.6875rem] font-extrabold tracking-[0.08em] uppercase text-text-dim">
              {group.label}
            </h4>
            {group.items.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={onMarkRead}
                onDismiss={onDismiss}
                onClose={onClose}
                labels={labels}
                t={t}
                iconSize={iconSize}
              />
            ))}
          </div>
        ))
      )}
    </div>
  );

  const desktopDropdown = (
    <div
      className="hidden md:flex flex-col absolute top-[calc(100%+0.5rem)] right-0 w-[400px] max-h-[600px] bg-bg-card-solid border border-border-light rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden"
      role="dialog"
      aria-label={labels.bell || 'Notifications'}
    >
      {renderHeader(false)}
      {renderContent(20)}
      {notifications.length > 0 && (
        <div className="px-5 py-3.5 border-t border-border-light shrink-0">
          <Link
            href="/notifications"
            className="block text-center text-sm font-bold text-accent no-underline transition-colors duration-200 hover:text-gold-600"
            onClick={onClose}
          >
            {labels.viewAll || 'View all notifications'}
          </Link>
        </div>
      )}
    </div>
  );

  const mobileOverlay = (
    <div
      className="flex md:hidden fixed inset-0 bg-black/40 z-[9999] justify-center items-start pt-16 px-4 animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] bg-bg-card-solid border border-border-light rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[scaleUp_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {renderHeader(true)}
        {renderContent(20)}
      </div>
    </div>
  );

  return (
    <>
      {desktopDropdown}
      {mounted && createPortal(mobileOverlay, document.body)}
    </>
  );
};

export default NotificationPanel;