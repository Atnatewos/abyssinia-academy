/**
 * @fileoverview Courses Data Hook with Stale-While-Revalidate Cache
 *
 * Fetches course data from the API. To prevent empty states on slow
 * networks, the previous successful response is cached in localStorage
 * and returned immediately while the fresh request resolves in the
 * background.
 *
 * Path: apps/web/hooks/useCourses.js
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';

/* LocalStorage cache keys — namespaced to avoid collisions */
const CACHE_KEY_LIST = 'abyssinia_cache_courses_list';
const CACHE_KEY_DETAIL = (slug) => `abyssinia_cache_course_${slug}`;

/**
 * Safely read JSON from localStorage. Returns null if the value is
 * missing, malformed, or localStorage is unavailable (SSR / private mode).
 */
const readCache = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Safely write JSON to localStorage. Silently ignores failures (quota,
 * disabled, private mode).
 */
const writeCache = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

/* ============================================================================
 * useCourses — List all published courses
 * ============================================================================ */

const useCourses = () => {
  // Initialize with cache immediately to avoid a flash of empty state
  const [courses, setCourses] = useState(() => readCache(CACHE_KEY_LIST) || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/courses');

      if (response && response.success && Array.isArray(response.data?.courses)) {
        const data = response.data.courses;
        setCourses(data);
        writeCache(CACHE_KEY_LIST, data);
      } else {
        // Only clear if there is no cache to fall back on
        const cached = readCache(CACHE_KEY_LIST);
        if (!cached || cached.length === 0) setCourses([]);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      
      // Fallback to cache on network failure
      const cached = readCache(CACHE_KEY_LIST);
      if (cached && cached.length > 0) {
        setCourses(cached);
      } else {
        setError('Unable to load courses. Please check your connection.');
        setCourses([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};

/* ============================================================================
 * useCourseBySlug — Fetch one course's full detail
 * ============================================================================ */

const useCourseBySlug = (slug) => {
  const [course, setCourse] = useState(() => {
    if (!slug) return null;
    return readCache(CACHE_KEY_DETAIL(slug));
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug || typeof slug !== 'string') {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCourse = async () => {
      // If we already have cached data, don't show the full loading spinner.
      // Keep showing the cached content while we refresh.
      const cached = readCache(CACHE_KEY_DETAIL(slug));
      if (!cached) setLoading(true);
      
      setError(null);

      try {
        const response = await apiClient.get(`/courses/${slug}`);

        if (cancelled) return;

        if (response && response.success && response.data?.course) {
          const data = response.data.course;
          setCourse(data);
          writeCache(CACHE_KEY_DETAIL(slug), data);
        } else if (!cached) {
          setCourse(null);
          setError('Course not found.');
        }
      } catch (err) {
        if (cancelled) return;
        
        // On failure, use cache if available
        if (cached) {
          setCourse(cached);
        } else {
          setError('Unable to load course details.');
          setCourse(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
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