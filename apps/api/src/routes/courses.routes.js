/**
 * @fileoverview Public Course Routes
 *
 * Order matters in Express: specific paths must come before wildcards.
 * The lesson route is declared before the slug wildcard so it is always
 * reachable.
 *
 * Path: apps/api/src/routes/courses.routes.js
 */

const { Router } = require('express');
const coursesController = require('../controllers/courses.controller');

const router = Router();

router.get('/', coursesController.getAllCourses);
router.get('/lesson/:lessonId', coursesController.getLessonById);
router.get('/:slug', coursesController.getCourseBySlug);

module.exports = router;