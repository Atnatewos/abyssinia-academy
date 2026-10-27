/**
 * @fileoverview Notifications Hook
 *
 * Manages notification state with visibility-based polling:
 *   - Tab active → poll every 60s (config-driven)
 *   - Tab backgrounded → pause polling
 *   - Tab returns to focus → immediate fetch + resume polling
 *   - Route change → fetch unread count
 *   - Manual refresh → always available, fires "N new notifications"
 *     toast only when the unread count actually increased
 *
 * Actions:
 *   - refresh: manual re-fetch with new-notification toast
 *   - markRead / markAllRead: read-state management
 *   - dismiss: delete a single notification (× button)
 *   - clearRead: delete all read notifications (cleanup button)
 *
 * Path: apps/web/hooks/useNotifications.js
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../lib/api';
import usePageVisibility from './usePageVisibility';
import { getNotificationsConfig } from '../lib/config';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const useNotifications = () => {
  const router = useRouter();
  const isVisible = usePageVisibility();
  const toast = useToast();
  const { t } = useLanguage();
  const config = getNotificationsConfig();
  const refreshIntervalMs = config?.refreshIntervalMs || 60000;
  const pageSize = config?.pageSize || 20;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const unreadCountRef = useRef(0);
  const notificationsRef = useRef([]);

  /* Keep refs in sync so callbacks can read latest state safely */
  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  /**
   * Fetch unread count (lightweight, called on route change + interval).
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      if (response && response.success) {
        setUnreadCount(response.data.count || 0);
      }
    } catch (err) {
      console.error('[useNotifications] Unread count fetch failed:', err.message);
    }
  }, []);

  /**
   * Fetch full notification list (heavier, called on manual refresh,
   * focus return, and mount). Returns the payload so callers can diff.
   */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/notifications?page=1&pageSize=${pageSize}`);
      if (response && response.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
        return response.data;
      }
      return null;
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      return null;
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  /**
   * Manual refresh — compares unread counts and toasts only when
   * new notifications actually arrived (never on initial load).
   */
  const refresh = useCallback(async () => {
    const previousUnread = unreadCountRef.current;
    const data = await fetchNotifications();
    if (data && typeof data.unreadCount === 'number' && data.unreadCount > previousUnread) {
      const delta = data.unreadCount - previousUnread;
      const template = t.notification?.newNotificationsToast || '{count} new notification(s)';
      toast.info(template.replace('{count}', String(delta)));
    }
  }, [fetchNotifications, toast, t]);

  /**
   * Mark a single notification as read.
   */
  const markRead = useCallback(async (notificationId) => {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      if (response && response.success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('[useNotifications] Mark read failed:', err.message);
    }
  }, []);

  /**
   * Mark all notifications as read.
   */
  const markAllRead = useCallback(async () => {
    try {
      const response = await apiClient.post('/notifications/read-all');
      if (response && response.success) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('[useNotifications] Mark all read failed:', err.message);
    }
  }, []);

  /**
   * Dismiss (delete) a single notification via the × button.
   * Adjusts the unread badge when the dismissed item was unread.
   */
  const dismiss = useCallback(async (notificationId) => {
    const target = notificationsRef.current.find((n) => n.id === notificationId);
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      if (response && response.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (target && !target.is_read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('[useNotifications] Dismiss failed:', err.message);
      toast.error(t.notification?.dismissFailed || 'Failed to dismiss notification');
    }
  }, [toast, t]);

  /**
   * Clear all read notifications (cleanup). Toasts the removed count.
   */
  const clearRead = useCallback(async () => {
    try {
      const response = await apiClient.post('/notifications/clear-read');
      if (response && response.success) {
        const removed = response.data?.deletedCount || 0;
        setNotifications((prev) => prev.filter((n) => !n.is_read));
        if (removed > 0) {
          const template = t.notification?.clearedReadToast || '{count} read notification(s) removed';
          toast.info(template.replace('{count}', String(removed)));
        }
      }
    } catch (err) {
      console.error('[useNotifications] Clear read failed:', err.message);
      toast.error(t.notification?.clearReadFailed || 'Failed to clear read notifications');
    }
  }, [toast, t]);

  /* Visibility-based polling: active = poll, backgrounded = pause */
  useEffect(() => {
    if (!isVisible) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }

    /* Tab just became visible — immediate fetch */
    fetchUnreadCount();

    /* Start polling interval */
    intervalRef.current = setInterval(() => {
      fetchUnreadCount();
    }, refreshIntervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isVisible, fetchUnreadCount, refreshIntervalMs]);

  /* Route change — fetch unread count */
  useEffect(() => {
    const handleRouteChange = () => {
      fetchUnreadCount();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router, fetchUnreadCount]);

  /* Initial fetch on mount */
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    markAllRead,
    dismiss,
    clearRead,
  };
};

export default useNotifications;