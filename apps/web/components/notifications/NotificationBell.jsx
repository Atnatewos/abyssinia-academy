/**
 * @fileoverview Notification Bell Icon + Dropdown
 *
 * Bell icon in the global navigation header with:
 *   - Unread count badge (number if ≤9, "9+" if >9)
 *   - Click opens dropdown panel (desktop) or full-screen overlay (mobile)
 *   - Manual refresh with new-notification toast
 *   - Mark all read + clear read actions
 *   - Per-item dismiss (×) inside the panel
 *
 * Uses useNotifications hook for state + visibility-based polling.
 * All copy from i18n; icons from config.
 *
 * Path: apps/web/components/notifications/NotificationBell.jsx
 */
import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import useNotifications from '../../hooks/useNotifications';
import { useLanguage } from '../../context/LanguageContext';

const NotificationBell = () => {
  const { t } = useLanguage();
  const {
    unreadCount,
    notifications,
    loading,
    refresh,
    markRead,
    markAllRead,
    dismiss,
    clearRead,
  } = useNotifications();

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

  /* Close dropdown on Escape for keyboard users */
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) refresh();
      return next;
    });
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
          onDismiss={dismiss}
          onClearRead={clearRead}
          onClose={() => setIsOpen(false)}
          labels={labels}
        />
      )}
    </div>
  );
};

export default NotificationBell;