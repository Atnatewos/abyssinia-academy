/**
 * @fileoverview Admin Routes
 * Protected admin endpoints for full platform management
 * Path: apps/api/src/routes/admin.routes.js
 */

const { Router } = require('express');
const paymentController = require('../controllers/payment.controller');
const adminController = require('../controllers/admin.controller');
const { authenticateAdmin } = require('../middleware/admin.middleware');
const { uploadThumbnail } = require('../middleware/upload.middleware');

const router = Router();

// All admin routes require authentication
router.use(authenticateAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Payment management
router.get('/payments', paymentController.getAllPayments);
router.get('/payments/pending', paymentController.getPendingPayments);
router.patch('/payments/:id/approve', paymentController.approvePayment);
router.patch('/payments/:id/reject', paymentController.rejectPayment);

// Student management
router.get('/students', adminController.getAllStudents);
router.get('/students/:id', adminController.getStudentById);

// Course management
router.post('/courses', uploadThumbnail, adminController.createCourse);
router.patch('/courses/:id', uploadThumbnail, adminController.updateCourse);

module.exports = router;