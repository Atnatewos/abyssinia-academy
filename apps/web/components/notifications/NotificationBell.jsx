/**
 * @fileoverview Notification Bell Icon + Dropdown
 *
 * Bell icon in the global navigation header with:
 *   - Unread count badge (red dot if ≥1, number if ≤9, "9+" if >9)
 *   - Click opens dropdown panel (desktop) or full-screen overlay (mobile)
 *   - Manual refresh button in dropdown header
 *   - Mark all read button
 *
 * Uses useNotifications hook for state + visibility-based polling.
 * All copy from i18n; icons from config.
 *
 * Path: apps/web/components/notifications/NotificationBell.jsx
 */
import { useState, useEffect, useRef } from 'react';
import { Bell, RefreshCw, CheckCheck, X } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import useNotifications from '../../hooks/useNotifications';
import { useLanguage } from '../../context/LanguageContext';

const NotificationBell = () => {
  const { t } = useLanguage();
  const { unreadCount, notifications, loading, refresh, markRead, markAllRead } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const labels = t.notification || {};
  const badgeText = unreadCount === 0 ? '' : unreadCount <= 9 ? String(unreadCount) : '9+';

  /* Close dropdown on outside click (desktop only) */
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  /* Close dropdown on route change */
  useEffect(() => {
    setIsOpen(false);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      refresh();
    }
  };

  return (
    <div className="notification-bell-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={handleToggle}
        aria-label={labels.bell || 'Notifications'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge" aria-label={`${unreadCount} unread`}>
            {badgeText}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          loading={loading}
          unreadCount={unreadCount}
          onRefresh={refresh}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onClose={() => setIsOpen(false)}
          labels={labels}
        />
      )}
    </div>
  );
};

export default NotificationBell;