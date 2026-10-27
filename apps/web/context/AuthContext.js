/**
 * @fileoverview Authentication Context
 * User auth state management with JWT token handling
 * Path: apps/web/context/AuthContext.js
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../lib/api';
import { getToken, getUser, setAuth, clearAuth } from '../lib/auth';

const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Manages user authentication state across the entire application
 */
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Check existing authentication on mount
   * Verifies stored JWT token with the API
   */
  useEffect(() => {
    const verifyAuth = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');
        if (response && response.success) {
          setUser(response.data.user);
        } else {
          clearAuth();
        }
      } catch (error) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  /**
   * Register a new user account
   * @param {object} data - { fullName, phone, email, password }
   * @returns {object} API response
   */
  const register = useCallback(async (data) => {
    const response = await apiClient.post('/auth/register', data);
    if (response && response.success) {
      setAuth(response.data.token, response.data.user);
      setUser(response.data.user);
    }
    return response;
  }, []);

  /**
   * Login with existing credentials
   * @param {object} data - { phone, password }
   * @returns {object} API response
   */
  const login = useCallback(async (data) => {
    const response = await apiClient.post('/auth/login', data);
    if (response && response.success) {
      setAuth(response.data.token, response.data.user);
      setUser(response.data.user);
    }
    return response;
  }, []);

  /**
   * Logout current user
   * Clears stored token and redirects to home
   */
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    router.push('/');
  }, [router]);

  /**
   * Refresh user data from the API
   */
  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me');
      if (response && response.success) {
        setUser(response.data.user);
        const token = getToken();
        if (token) {
          setAuth(token, response.data.user);
        }
      }
    } catch (error) {
      // Silently fail - user will need to re-authenticate
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isEnrolled: user?.is_enrolled === true,
    register,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to consume authentication context
 * Returns safe defaults when used outside AuthProvider
 * @returns {object} Auth state and methods
 */
const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      isEnrolled: false,
      register: async () => ({ success: false, message: 'Auth not initialized' }),
      login: async () => ({ success: false, message: 'Auth not initialized' }),
      logout: () => {},
      refreshUser: async () => {},
    };
  }

  return context;
};

export { AuthProvider, useAuth };