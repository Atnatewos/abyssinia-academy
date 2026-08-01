/**
 * @fileoverview Portal Course Hook
 * Fetches the fullstack course data for the learning portal
 * Path: apps/web/hooks/usePortalCourse.js
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';

const usePortalCourse = (slug = 'fullstack-web-engineering-masterclass') => {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/courses/${slug}`);

      if (response && response.success) {
        setPhases(response.data.course?.phases || []);
      } else {
        setPhases([]);
      }
    } catch (err) {
      console.error('Failed to fetch portal course:', err);
      setError('Unable to load curriculum.');
      setPhases([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return { phases, loading, error, refetch: fetchCourse };
};

export default usePortalCourse;