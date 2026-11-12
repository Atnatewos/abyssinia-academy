/**
 * @fileoverview Payment Routes
 *
 * Student-facing payment submission and status endpoints. All routes
 * require authentication; submission also requires multipart upload
 * for the payment screenshot and validation of the submission payload.
 *
 * Path: apps/api/src/routes/payment.routes.js
 */

const { Router } = require('express');
const paymentController = require('../controllers/payment.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const {
  validatePaymentSubmission,
} = require('../middleware/validate.middleware');
const {
  uploadPaymentScreenshot,
} = require('../middleware/upload.middleware');

const router = Router();

/* Student — submit payment for admin review */
router.post(
  '/submit',
  authenticateUser,
  uploadPaymentScreenshot,
  validatePaymentSubmission,
  paymentController.submitPayment
);

/* Student — current payment status */
router.get(
  '/status',
  authenticateUser,
  paymentController.getPaymentStatus
);

module.exports = router;