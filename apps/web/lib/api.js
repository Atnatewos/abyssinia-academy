/**
 * @fileoverview API Client
 * Axios instance with JWT interceptors
 * Path: apps/web/lib/api.js
 */

import axios from 'axios';
import { getItem, removeItem } from './storage';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - attach JWT token
 * Uses admin token for /admin routes, student token otherwise
 */
apiClient.interceptors.request.use(
  (config) => {
    const isAdminRoute = config.url && config.url.startsWith('/admin');

    if (isAdminRoute) {
      const adminToken = getItem('admin_token');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      const token = getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle auth errors
 */
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status } = error.response;
      const isAdminRoute = error.config && error.config.url && error.config.url.startsWith('/admin');

      if (status === 401) {
        if (isAdminRoute) {
          removeItem('admin_token');
          removeItem('admin_user');
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
        } else {
          removeItem('auth_token');
          removeItem('user');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;