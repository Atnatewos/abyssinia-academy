/**
 * @fileoverview Payment Controller
 * Request handlers for payment routes
 * Path: apps/api/src/controllers/payment.controller.js
 */

const paymentService = require('../services/payment.service');
const paymentsDb = require('../database/queries/payments');
const { getPagination, buildPaginatedResponse } = require('../utils/helpers');

/**
 * POST /api/payments/submit
 * Submit a payment for manual approval
 */
const submitPayment = async (req, res, next) => {
  try {
    const { fullName, phone, paymentMethod, transactionRef } = req.body;
    const screenshotUrl = req.file ? req.file.path : null;

    const payment = await paymentService.submitPayment(req.user.id, {
      fullName,
      phone,
      paymentMethod,
      transactionRef,
      screenshotUrl,
    });

    res.status(201).json({
      success: true,
      message: 'Payment proof submitted successfully. Waiting for approval.',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/status
 * Get current user's payment status
 */
const getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await paymentsDb.getUserPayment(req.user.id);

    res.json({
      success: true,
      data: {
        payment: payment || null,
        userPaymentStatus: req.user.payment_status,
        isEnrolled: req.user.is_enrolled,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/payments
 * Get all payments (admin)
 */
const getAllPayments = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);
    const { payments, total } = await paymentsDb.getAllPayments(pagination.limit, pagination.offset);

    res.json(buildPaginatedResponse(payments, total, pagination));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/payments/pending
 * Get pending payments (admin)
 */
const getPendingPayments = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);
    const { payments, total } = await paymentsDb.getPaymentsByStatus('pending', pagination.limit, pagination.offset);

    res.json(buildPaginatedResponse(payments, total, pagination));
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/payments/:id/approve
 * Approve a payment (admin)
 */
const approvePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.approvePayment(id);

    res.json({
      success: true,
      message: 'Payment approved. Student has been enrolled.',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/payments/:id/reject
 * Reject a payment (admin)
 */
const rejectPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.rejectPayment(id);

    res.json({
      success: true,
      message: 'Payment rejected.',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitPayment,
  getPaymentStatus,
  getAllPayments,
  getPendingPayments,
  approvePayment,
  rejectPayment,
};