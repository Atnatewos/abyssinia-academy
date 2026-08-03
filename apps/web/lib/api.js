/**
 * @fileoverview API Client
 * Axios instance for frontend API calls
 * Path: apps/web/lib/api.js
 */
import axios from 'axios';
import { getItem, removeItem } from './storage';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = getItem('auth_token');
  const adminToken = getItem('admin_token');

  if (config.url && config.url.startsWith('/admin') && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAdmin = error.config && error.config.url && error.config.url.startsWith('/admin');
      if (isAdmin) {
        removeItem('admin_token');
        removeItem('admin_user');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;