/**
 * @fileoverview Get All Courses API Route
 * Imports course data directly from shared packages
 * Path: apps/web/pages/api/courses/index.js
 */

import CourseLoader from '../../../../../packages/shared/courses/index';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const courses = CourseLoader.getAll('en');
    res.json({ success: true, data: { courses } });
  } catch (error) {
    console.error('Courses error:', error);
    res.status(500).json({ success: false, message: 'Failed to load courses.' });
  }
}