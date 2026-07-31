/**
 * @fileoverview Course Routes
 * Public course viewing endpoints
 * Path: apps/api/src/routes/courses.routes.js
 */

const { Router } = require('express');
const coursesController = require('../controllers/courses.controller');

const router = Router();

router.get('/', coursesController.getAllCourses);
router.get('/:slug', coursesController.getCourseBySlug);
router.get('/lesson/:lessonId', coursesController.getLessonById);

module.exports = router;