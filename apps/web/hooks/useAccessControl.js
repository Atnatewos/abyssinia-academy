/**
 * @fileoverview Access Control Hook
 * React hook that fetches and caches the user's access map
 * Provides helper methods for checking phase/week/lesson accessibility
 * 
 * Path: apps/web/hooks/useAccessControl.js
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  fetchAccessMap,
  clearAccessCache,
  canAccessPhase,
  canAccessWeek,
  canAccessLesson,
  getLockedPhases,
  getPhaseNumberFromLessonId,
} from '../lib/accessControl';

/**
 * Custom hook for access control throughout the portal
 * Automatically refetches when auth state changes (login/logout)
 * 
 * @returns {object} Access state and helper methods
 */
const useAccessControl = () => {
  const { isAuthenticated, isEnrolled, user } = useAuth();
  const [accessMap, setAccessMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch the access map whenever auth state changes
   * Clears cache on user identity change to prevent stale data
   */
  useEffect(() => {
    const loadAccessMap = async () => {
      if (!isAuthenticated) {
        setAccessMap(null);
        setLoading(false);
        clearAccessCache();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const map = await fetchAccessMap();
        setAccessMap(map);
      } catch (err) {
        console.error('Failed to load access map:', err);
        setError('Unable to verify access permissions.');
        setAccessMap(null);
      } finally {
        setLoading(false);
      }
    };

    clearAccessCache();
    loadAccessMap();
  }, [isAuthenticated, user?.id]);

  /**
   * Check if a specific phase is accessible
   * Memoized to avoid unnecessary re-renders
   */
  const checkPhaseAccess = useCallback(
    (phaseId) => canAccessPhase(accessMap, phaseId),
    [accessMap]
  );

  /**
   * Check if a specific week is accessible
   */
  const checkWeekAccess = useCallback(
    (weekNumber) => canAccessWeek(accessMap, weekNumber),
    [accessMap]
  );

  /**
   * Check if a specific lesson is accessible
   * Respects free preview bypass for enrolled students
   */
  const checkLessonAccess = useCallback(
    (lessonId, isFreePreview = false) =>
      canAccessLesson(accessMap, lessonId, isFreePreview),
    [accessMap]
  );

  /**
   * Get all locked phase IDs for the current student
   */
  const lockedPhases = useMemo(() => {
    const allPhaseIds = ['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5'];
    return getLockedPhases(accessMap, allPhaseIds);
  }, [accessMap]);

  /**
   * Determine which phase a locked lesson belongs to
   * Used to show "Buy Phase X" on lock overlays
   */
  const getLockedLessonPhase = useCallback((lessonId) => {
    return getPhaseNumberFromLessonId(lessonId);
  }, []);

  /**
   * Manually refresh the access map (e.g., after new purchase)
   */
  const refreshAccess = useCallback(async () => {
    clearAccessCache();
    setLoading(true);
    try {
      const map = await fetchAccessMap();
      setAccessMap(map);
    } catch (err) {
      setError('Failed to refresh access.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    accessMap,
    loading,
    error,
    isFullCourse: accessMap?.isFullCourse || false,
    isEnrolled: accessMap?.isEnrolled || false,
    accessiblePhases: accessMap?.accessiblePhases || [],
    accessibleWeeks: accessMap?.accessibleWeeks || [],
    accessibleLessons: accessMap?.accessibleLessons || [],
    lockedPhases,
    checkPhaseAccess,
    checkWeekAccess,
    checkLessonAccess,
    getLockedLessonPhase,
    refreshAccess,
  };
};

export default useAccessControl;