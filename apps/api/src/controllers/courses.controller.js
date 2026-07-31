/**
 * @fileoverview Courses Controller
 * Request handlers for course routes
 * Path: apps/api/src/controllers/courses.controller.js
 */

const courseService = require('../services/course.service');

/**
 * GET /api/courses
 * Get all published courses
 */
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await courseService.getPublishedCourses();

    res.json({
      success: true,
      data: { courses },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/courses/:slug
 * Get course details with full curriculum
 */
const getCourseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const course = await courseService.getCourseWithCurriculum(slug);

    res.json({
      success: true,
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/courses/lesson/:lessonId
 * Get single lesson details
 */
const getLessonById = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const lesson = await courseService.getLessonById(lessonId);

    res.json({
      success: true,
      data: { lesson },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCourses,
  getCourseBySlug,
  getLessonById,
};