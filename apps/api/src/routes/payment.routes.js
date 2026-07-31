/**
 * @fileoverview Payment Routes
 * Payment submission and status endpoints
 * Path: apps/api/src/routes/payment.routes.js
 */

const { Router } = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { validatePaymentSubmission } = require('../middleware/validate.middleware');
const { uploadPaymentScreenshot } = require('../middleware/upload.middleware');

const router = Router();

router.post('/submit', authenticateUser, uploadPaymentScreenshot, validatePaymentSubmission, paymentController.submitPayment);
router.get('/status', authenticateUser, paymentController.getPaymentStatus);

module.exports = router;