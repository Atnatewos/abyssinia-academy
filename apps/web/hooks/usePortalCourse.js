/**
 * @fileoverview Portal Course Hook
 * Fetches the full course data (including metadata) for the learning portal
 * Path: apps/web/hooks/usePortalCourse.js
 */
import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';

const usePortalCourse = (slug = 'fullstack-web-engineering-masterclass') => {
  const [course, setCourse] = useState(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/courses/${slug}`);

      if (response && response.success) {
        const courseData = response.data.course || null;
        setCourse(courseData);
        setPhases(courseData?.phases || []);
      } else {
        setCourse(null);
        setPhases([]);
      }
    } catch (err) {
      console.error('Failed to fetch portal course:', err);
      setError('Unable to load curriculum.');
      setCourse(null);
      setPhases([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { course, phases, loading, error, refetch: fetchCourse };
};

export default usePortalCourse;