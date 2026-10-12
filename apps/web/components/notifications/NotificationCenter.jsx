/**
 * @fileoverview Notification Center (Full Page)
 *
 * /notifications route — full-page notification list with:
 *   - Filter chips (All, Unread, Payments, Referrals, Enrollment, Security)
 *   - Date grouping (Today, Yesterday, This Week, Older)
 *   - Pagination (Load more button)
 *   - Mark read on click + navigate to link
 *   - Refresh + Mark all read buttons in header
 *   - Empty state with illustration
 *
 * Uses useNotifications hook for state + visibility-based polling.
 *
 * Path: apps/web/components/notifications/NotificationCenter.jsx
 */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, CheckCheck } from 'lucide-react';
import useNotifications from '../../hooks/useNotifications';
import { useLanguage } from '../../context/LanguageContext';
import { getNotificationsConfig } from '../../lib/config';
import NotificationPanel from './NotificationPanel';

const NotificationCenter = () => {
  const { t } = useLanguage();
  const config = getNotificationsConfig();
  const { notifications, loading, unreadCount, refresh, markRead, markAllRead } = useNotifications();

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

  const filteredNotifications =
    activeFilter === 'all'
      ? notifications
      : activeFilter === 'unread'
      ? notifications.filter((n) => !n.is_read)
      : notifications.filter((n) => {
          const typeConfig = config.types[n.type];
          return typeConfig?.category === activeFilter;
        });

  return (
    <div className="notification-center-page">
      <div className="notification-center-header">
        <Link href="/profile" className="auth-back-link">
          <ArrowLeft size={16} />
          <span>{labels.backToProfile || 'Back to Profile'}</span>
        </Link>

        <h1>{labels.bell || 'Notifications'}</h1>

        <div className="notification-center-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={markAllRead}
            disabled={unreadCount === 0 || loading}
          >
            <CheckCheck size={16} />
            <span>{labels.markAllRead || 'Mark all as read'}</span>
          </button>
          <button type="button" className="btn-secondary" onClick={refresh} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>{labels.refresh || 'Refresh'}</span>
          </button>
        </div>
      </div>

      <div className="notification-center-filters">
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

      <div className="notification-center-content">
        <NotificationPanel
          notifications={filteredNotifications}
          loading={loading}
          unreadCount={unreadCount}
          onRefresh={refresh}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onClose={() => {}}
          labels={labels}
          isPage
        />
      </div>
    </div>
  );
};

export default NotificationCenter;