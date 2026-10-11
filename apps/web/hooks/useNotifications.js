/**
 * @fileoverview Notifications Hook
 *
 * Manages notification state with visibility-based polling:
 *   - Tab active → poll every 60s (config-driven)
 *   - Tab backgrounded → pause polling
 *   - Tab returns to focus → immediate fetch + resume polling
 *   - Route change → fetch unread count
 *   - Manual refresh → always available
 *
 * Exports:
 *   - notifications: Array of notification objects
 *   - unreadCount: Number for badge display
 *   - loading: Boolean
 *   - error: Error message or null
 *   - refresh: Manual refresh function
 *   - markRead: Mark single notification as read
 *   - markAllRead: Mark all as read
 *
 * Path: apps/web/hooks/useNotifications.js
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../lib/api';
import usePageVisibility from './usePageVisibility';
import { getNotificationsConfig } from '../lib/config';

const useNotifications = () => {
  const router = useRouter();
  const isVisible = usePageVisibility();
  const config = getNotificationsConfig();
  const refreshIntervalMs = config?.refreshIntervalMs || 60000;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const lastFetchRef = useRef(0);

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
   * Fetch full notification list (heavier, called on manual refresh + focus return).
   */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/notifications?page=1&pageSize=20');
      if (response && response.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
      lastFetchRef.current = Date.now();
    }
  }, []);

  /**
   * Manual refresh — always available in dropdown header.
   */
  const refresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

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
  };
};

export default useNotifications;