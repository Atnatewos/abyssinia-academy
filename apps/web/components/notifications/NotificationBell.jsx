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
 * All styling uses Tailwind utilities mapped to the unified design tokens
 * in themes.css. No dedicated stylesheet is required.
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
    <div className="relative inline-flex items-center md:mr-2" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={labels.bell || 'Notifications'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="relative w-10 h-10 rounded-full bg-surface-secondary border border-border-light text-text-main inline-flex items-center justify-center cursor-pointer transition-all duration-200 hover:bg-surface-hover hover:border-border-hover hover:text-accent"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[1.125rem] h-[1.125rem] px-1.5 rounded-full bg-error text-text-inverse text-[0.625rem] font-extrabold inline-flex items-center justify-center border-2 border-bg-main animate-[badgePulse_2s_ease-in-out_infinite]"
            aria-label={`${unreadCount} unread`}
          >
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