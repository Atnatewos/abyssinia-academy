/**
 * @fileoverview Payment Controller
 *
 * Handles:
 *   - Student submit (accepts reference OR screenshot)
 *   - Student status
 *   - Admin list / pending / approve / reject
 *
 * Path: apps/api/src/controllers/payment.controller.js
 */

const paymentService = require('../services/payment.service');
const paymentsDb = require('../database/queries/payments');
const {
  getPagination,
  buildPaginatedResponse,
} = require('../utils/helpers');
const { BadRequestError } = require('../utils/errors');

/* ============================================================================
 * STUDENT — SUBMIT
 * ============================================================================ */

/**
 * POST /api/payments/submit
 *
 * Accepts either `transactionRef` OR `screenshot` (or both). The file is
 * uploaded by multer to Cloudinary; its secure URL is on req.file.path.
 */
const submitPayment = async (req, res, next) => {
  try {
    const transactionRef =
      typeof req.body.transactionRef === 'string' && req.body.transactionRef.trim()
        ? req.body.transactionRef.trim()
        : null;

    const screenshotUrl = req.file?.path || null;

    if (!transactionRef && !screenshotUrl) {
      throw new BadRequestError(
        'Please provide either a transaction reference number or a payment screenshot.'
      );
    }

    const paymentData = {
      fullName: req.body.fullName || null,
      phone: req.body.phone || null,
      paymentMethod: req.body.paymentMethod,
      transactionRef,
      screenshotUrl,
      courseId: req.body.courseId || null,
      resellerCode: req.body.resellerCode || null,
      discountCode: req.body.discountCode || null,
      referralCode: req.body.referralCode || null,
      agentId: req.body.agentId || null,
      isAgentBuyer: req.body.isAgentBuyer === 'true',
      purchaseMode: req.body.purchaseMode || 'full-course',
      selectedPhases: req.body.selectedPhases
        ? (() => {
            try {
              return JSON.parse(req.body.selectedPhases);
            } catch {
              return null;
            }
          })()
        : null,
    };

    if (!paymentData.paymentMethod) {
      throw new BadRequestError('paymentMethod is required.');
    }

    const payment = await paymentService.submitPayment(req.user.id, paymentData);

    res.status(201).json({
      success: true,
      message:
        'Payment submitted successfully. An admin will review it shortly.',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * STUDENT — GET CURRENT PAYMENT STATUS
 * ============================================================================ */

/**
 * GET /api/payments/status
 *
 * ⚠️  This handler must remain exported. `payment.routes.js` binds it on
 * boot — removing it crashes Express with `Route.get() requires a callback`.
 */
const getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await paymentsDb.getUserPayment(req.user.id);

    res.json({
      success: true,
      data: {
        payment: payment || null,
        userPaymentStatus: req.user.payment_status || 'none',
        isEnrolled: req.user.is_enrolled === true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * ADMIN — LIST
 * ============================================================================ */

const getAllPayments = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);

    const result = await paymentsDb.getAllPayments(
      pagination.limit,
      pagination.offset
    );

    res.json(
      buildPaginatedResponse(result.payments, result.total, pagination)
    );
  } catch (error) {
    next(error);
  }
};

const getPendingPayments = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);

    const result = await paymentsDb.getPaymentsByStatus(
      'pending',
      pagination.limit,
      pagination.offset
    );

    res.json(
      buildPaginatedResponse(result.payments, result.total, pagination)
    );
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * ADMIN — APPROVE / REJECT
 * ============================================================================ */

const approvePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await paymentService.approvePayment(id);
    res.json({
      success: true,
      message: 'Payment approved and enrollment activated.',
      data: { payment },
    });
  } catch (error) {
    next(error);
  }
};

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