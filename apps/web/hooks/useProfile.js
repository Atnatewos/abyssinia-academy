/**
 * @fileoverview Profile Hook
 * Fetches and manages user profile data
 * Path: apps/web/hooks/useProfile.js
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for fetching and managing profile data
 * @returns {object} Profile state and actions
 */
const useProfile = () => {
  const { isAuthenticated, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/profile');
      if (response && response.success) {
        setProfile(response.data);
      } else {
        setError('Failed to load profile.');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Unable to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /**
   * Update profile information
   * @param {object} data - { fullName, phone, email }
   */
  const updateProfile = useCallback(async (data) => {
    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const response = await apiClient.put('/profile', data);
      if (response && response.success) {
        setProfile((prev) => prev ? { ...prev, user: { ...prev.user, ...response.data.user } } : prev);
        setUpdateSuccess(true);
        refreshUser();
        return { success: true };
      }
      setUpdateError('Update failed.');
      return { success: false };
    } catch (err) {
      console.error('Profile update error:', err);
      setUpdateError('Failed to update profile.');
      return { success: false };
    } finally {
      setUpdating(false);
    }
  }, [refreshUser]);

  /**
   * Change password
   * @param {object} data - { currentPassword, newPassword }
   */
  const changePassword = useCallback(async (data) => {
    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const response = await apiClient.put('/profile/password', data);
      if (response && response.success) {
        setUpdateSuccess(true);
        return { success: true, message: response.message };
      }
      setUpdateError(response?.message || 'Password change failed.');
      return { success: false, message: response?.message };
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to change password.';
      setUpdateError(msg);
      return { success: false, message: msg };
    } finally {
      setUpdating(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setUpdateError(null);
    setUpdateSuccess(false);
  }, []);

  return {
    profile,
    loading,
    error,
    updating,
    updateError,
    updateSuccess,
    fetchProfile,
    updateProfile,
    changePassword,
    clearMessages,
  };
};

export default useProfile;