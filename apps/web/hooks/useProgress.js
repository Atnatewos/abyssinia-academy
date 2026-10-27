/**
 * @fileoverview Learning Progress Hook
 * Manages student progress, completed lessons, and progress percentage
 * Path: apps/web/hooks/useProgress.js
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook for managing student learning progress
 * @returns {object} Progress state and actions
 */
const useProgress = () => {
  const { isAuthenticated, isEnrolled } = useAuth();
  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch completed lesson IDs from the API
   */
  const fetchCompletedLessons = useCallback(async () => {
    if (!isAuthenticated || !isEnrolled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/progress/completed');

      if (response && response.success) {
        setCompletedLessons(response.data.completedLessons || []);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
      setError('Unable to load progress.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isEnrolled]);

  useEffect(() => {
    fetchCompletedLessons();
  }, [fetchCompletedLessons]);

  /**
   * Toggle a lesson's completion status
   * @param {string} lessonId - Lesson UUID
   * @returns {object} Updated state
   */
  const toggleLesson = useCallback(async (lessonId) => {
    try {
      const response = await apiClient.post(`/progress/lessons/${lessonId}/toggle`);

      if (response && response.success) {
        setCompletedLessons((prev) => {
          if (response.data.completed) {
            return [...prev, lessonId];
          } else {
            return prev.filter((id) => id !== lessonId);
          }
        });
        return { completed: response.data.completed };
      }
    } catch (err) {
      console.error('Failed to toggle lesson:', err);
      return { completed: false, error: true };
    }
  }, []);

  /**
   * Check if a specific lesson is completed
   * @param {string} lessonId - Lesson UUID
   * @returns {boolean} Whether the lesson is completed
   */
  const isLessonCompleted = useCallback(
    (lessonId) => {
      return completedLessons.includes(lessonId);
    },
    [completedLessons]
  );

  /**
   * Calculate progress percentage for a set of lesson IDs
   * @param {Array} allLessonIds - All lesson IDs in the course
   * @returns {number} Progress percentage (0-100)
   */
  const calculateProgress = useCallback(
    (allLessonIds = []) => {
      if (allLessonIds.length === 0) return 0;
      const completed = allLessonIds.filter((id) => completedLessons.includes(id));
      return Math.round((completed.length / allLessonIds.length) * 100);
    },
    [completedLessons]
  );

  return {
    completedLessons,
    loading,
    error,
    toggleLesson,
    isLessonCompleted,
    calculateProgress,
    refetch: fetchCompletedLessons,
  };
};

export default useProgress;