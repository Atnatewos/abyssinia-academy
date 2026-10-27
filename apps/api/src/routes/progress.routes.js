/**
 * @fileoverview Progress Routes
 * Protected student progress endpoints
 * Path: apps/api/src/routes/progress.routes.js
 */

const { Router } = require('express');
const progressController = require('../controllers/progress.controller');
const { authenticateUser, requireEnrollment } = require('../middleware/auth.middleware');

const router = Router();

// All progress routes require authentication and enrollment
router.use(authenticateUser);
router.use(requireEnrollment);

router.get('/completed', progressController.getCompletedLessons);
router.get('/courses/:courseId', progressController.getCourseProgress);
router.get('/all', progressController.getAllProgress);
router.post('/lessons/:lessonId/toggle', progressController.toggleLessonCompletion);

module.exports = router;