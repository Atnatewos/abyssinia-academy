/**
 * @fileoverview Courses Data Hook
 * Fetches course data from the API with loading and error states
 * Path: apps/web/hooks/useCourses.js
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';

/**
 * Custom hook for fetching all published courses
 * @returns {object} { courses, loading, error, refetch }
 */
const useCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/courses');

      if (response && response.success) {
        setCourses(response.data.courses || []);
      } else {
        setCourses([]);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Unable to load courses. Please try again later.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};

/**
 * Custom hook for fetching a single course by slug
 * Only fetches when slug is available (not undefined)
 * @param {string} slug - Course URL slug
 * @returns {object} { course, loading, error }
 */
const useCourseBySlug = (slug) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCourse = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching course:', slug);
        const response = await apiClient.get(`/courses/${slug}`);
        console.log('📥 Course response:', response);

        if (!cancelled) {
          if (response && response.success) {
            setCourse(response.data.course || null);
            if (!response.data.course) {
              setError('Course not found.');
            }
          } else {
            setCourse(null);
            setError('Course not found.');
          }
        }
      } catch (err) {
        console.error('Failed to fetch course:', err);
        if (!cancelled) {
          setError('Unable to load course details.');
          setCourse(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCourse();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { course, loading, error };
};

export { useCourses, useCourseBySlug };