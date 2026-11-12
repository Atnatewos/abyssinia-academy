// /**
//  * @fileoverview Admin Routes
//  * Protected admin endpoints for full platform management
//  * Path: apps/api/src/routes/admin.routes.js
//  */

// const { Router } = require('express');
// const paymentController = require('../controllers/payment.controller');
// const adminController = require('../controllers/admin.controller');
// const mlmController = require('../controllers/mlm-referral.controller');
// const { authenticateAdmin } = require('../middleware/admin.middleware');
// const { uploadThumbnail } = require('../middleware/upload.middleware');

// const router = Router();

// // All admin routes require authentication
// router.use(authenticateAdmin);

// // Dashboard
// router.get('/dashboard', adminController.getDashboardStats);

// // Payment management
// router.get('/payments', paymentController.getAllPayments);
// router.get('/payments/pending', paymentController.getPendingPayments);
// router.patch('/payments/:id/approve', paymentController.approvePayment);
// router.patch('/payments/:id/reject', paymentController.rejectPayment);

// // Student management
// router.get('/students', adminController.getAllStudents);
// router.get('/students/:id', adminController.getStudentById);

// // Course management
// router.post('/courses', uploadThumbnail, adminController.createCourse);
// router.patch('/courses/:id', uploadThumbnail, adminController.updateCourse);

// // MLM withdrawal management
// router.get('/referrals/mlm/withdrawals', mlmController.adminGetWithdrawals);
// router.patch('/referrals/mlm/withdrawals/:id', mlmController.adminProcessWithdrawal);
// router.get('/referrals/mlm/stats', mlmController.adminGetStats);

// module.exports = router;



/**
 * @fileoverview Admin Routes
 *
 * Every admin endpoint requires a valid admin JWT (verified by
 * `authenticateAdmin`, which attaches req.admin). The middleware is
 * applied once at the top so no route can accidentally ship without auth.
 *
 * Route organization:
 *   1. Dashboard
 *   2. Courses (list + create + update + delete + full detail with curriculum)
 *   3. Phases (list + get + create + update + delete + publish toggle)
 *   4. Weeks (list + get + create + update + delete + publish toggle)
 *   5. Lessons (list + get + create + update + delete + publish toggle)
 *   6. Payments
 *   7. Students
 *   8. MLM withdrawals
 *
 * Route ordering rule: always list a specific path BEFORE a wildcard on
 * the same prefix. Express matches top-to-bottom, first-wins.
 *
 * Path: apps/api/src/routes/admin.routes.js
 */

const { Router } = require('express');

/* ── Controllers ───────────────────────────────────────────────────── */
const adminController = require('../controllers/admin.controller');
const coursesController = require('../controllers/courses.controller');
const phasesController = require('../controllers/phases.controller');
const weeksController = require('../controllers/weeks.controller');
const lessonsController = require('../controllers/lessons.controller');
const paymentController = require('../controllers/payment.controller');
const mlmController = require('../controllers/mlm-referral.controller');

/* ── Middleware ────────────────────────────────────────────────────── */
const { authenticateAdmin } = require('../middleware/admin.middleware');
const { uploadThumbnail } = require('../middleware/upload.middleware');

const router = Router();

/* All routes below require admin authentication. */
router.use(authenticateAdmin);

/* ============================================================================
 * DASHBOARD
 * ============================================================================ */

router.get('/dashboard', adminController.getDashboardStats);

/* ============================================================================
 * COURSES
 * ============================================================================ */

/* List (admin — includes drafts) */
router.get('/courses', adminController.getAllCourses);

/* Create (thumbnail upload optional) */
router.post('/courses', uploadThumbnail, adminController.createCourse);

/* Full detail with curriculum (phases → weeks → lessons) */
router.get('/courses/:id', adminController.getCourseDetail);

/* Update (thumbnail upload optional) */
router.patch('/courses/:id', uploadThumbnail, adminController.updateCourse);

/* Delete (cascade to phases/weeks/lessons at DB level) */
router.delete('/courses/:id', adminController.deleteCourse);

/* Publish toggle */
router.patch('/courses/:id/publish', adminController.setCoursePublishState);

/* ============================================================================
 * PHASES
 * ============================================================================ */

/* List phases under a course (admin — includes drafts) */
router.get('/courses/:courseId/phases', phasesController.listPhases);

/* Create a phase under a course */
router.post('/courses/:courseId/phases', phasesController.createPhase);

/* Single phase with outcomes */
router.get('/phases/:id', phasesController.getPhase);

/* Update */
router.patch('/phases/:id', phasesController.updatePhase);

/* Delete (cascades to weeks/lessons at DB level) */
router.delete('/phases/:id', phasesController.deletePhase);

/* Publish toggle */
router.patch('/phases/:id/publish', phasesController.setPublishState);

/* ============================================================================
 * WEEKS
 * ============================================================================ */

/* List weeks under a phase */
router.get('/phases/:phaseId/weeks', weeksController.listWeeks);

/* Create a week under a phase */
router.post('/phases/:phaseId/weeks', weeksController.createWeek);

/* Single week */
router.get('/weeks/:id', weeksController.getWeek);

/* Update */
router.patch('/weeks/:id', weeksController.updateWeek);

/* Delete (cascades to lessons at DB level) */
router.delete('/weeks/:id', weeksController.deleteWeek);

/* Publish toggle */
router.patch('/weeks/:id/publish', weeksController.setPublishState);

/* ============================================================================
 * LESSONS
 * ============================================================================ */

/* List lessons under a week */
router.get('/weeks/:weekId/lessons', lessonsController.listLessons);

/* Create a lesson under a week (sessions/resources included in body) */
router.post('/weeks/:weekId/lessons', lessonsController.createLesson);

/* Single lesson with sessions and resources */
router.get('/lessons/:id', lessonsController.getLesson);

/* Update (sessions/resources fully replaced when provided) */
router.patch('/lessons/:id', lessonsController.updateLesson);

/* Delete (cascades to sessions/resources at DB level) */
router.delete('/lessons/:id', lessonsController.deleteLesson);

/* Publish toggle */
router.patch('/lessons/:id/publish', lessonsController.setPublishState);

/* ============================================================================
 * PAYMENTS
 * ============================================================================ */

router.get('/payments', paymentController.getAllPayments);
router.get('/payments/pending', paymentController.getPendingPayments);
router.patch('/payments/:id/approve', paymentController.approvePayment);
router.patch('/payments/:id/reject', paymentController.rejectPayment);

/* ============================================================================
 * STUDENTS
 * ============================================================================ */

router.get('/students', adminController.getAllStudents);
router.get('/students/:id', adminController.getStudentById);

/* ============================================================================
 * MLM WITHDRAWALS
 * ============================================================================ */

router.get('/referrals/mlm/withdrawals', mlmController.adminGetWithdrawals);
router.patch(
  '/referrals/mlm/withdrawals/:id',
  mlmController.adminProcessWithdrawal
);
router.get('/referrals/mlm/stats', mlmController.adminGetStats);

module.exports = router;