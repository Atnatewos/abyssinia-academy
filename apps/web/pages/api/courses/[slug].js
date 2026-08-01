/**
 * @fileoverview Get Course by Slug API Route
 * Imports course data directly from shared packages
 * Path: apps/web/pages/api/courses/[slug].js
 */

import CourseLoader from '../../../../../packages/shared/courses/index';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { slug } = req.query;
    const course = CourseLoader.getBySlug(slug, 'en');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    res.json({ success: true, data: { course } });
  } catch (error) {
    console.error('Course detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to load course.' });
  }
}