/**
 * @fileoverview Toast Notification Context
 * Custom toast system replacing browser alerts
 * Path: apps/web/context/ToastContext.js
 */

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

/**
 * Toast Provider Component
 * Provides toast notification functionality across the app
 * No browser alerts - all custom styled notifications
 */
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Remove a toast by its unique ID
   * @param {string} id - Toast identifier
   */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Add a new toast notification
   * @param {string} message - Toast message content
   * @param {string} type - 'success' | 'error' | 'warning' | 'info'
   * @param {number} duration - Display duration in milliseconds
   * @returns {string} Toast ID for manual removal
   */
  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);

    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  /**
   * Show a success toast notification
   * @param {string} message - Success message
   */
  const success = useCallback((message) => addToast(message, 'success'), [addToast]);

  /**
   * Show an error toast notification
   * @param {string} message - Error message
   */
  const error = useCallback((message) => addToast(message, 'error', 6000), [addToast]);

  /**
   * Show a warning toast notification
   * @param {string} message - Warning message
   */
  const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);

  /**
   * Show an info toast notification
   * @param {string} message - Info message
   */
  const info = useCallback((message) => addToast(message, 'info'), [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

/**
 * Hook to consume toast context
 * Returns safe no-op defaults when used outside provider
 * @returns {object} Toast methods
 */
const useToast = () => {
  const context = useContext(ToastContext);

  if (context === null) {
    return {
      toasts: [],
      addToast: () => {},
      removeToast: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    };
  }

  return context;
};

export { ToastProvider, useToast };