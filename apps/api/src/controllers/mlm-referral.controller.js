/**
 * @fileoverview MLM Referral Controller
 *
 * Request handlers for all MLM referral endpoints — commissions, bonuses,
 * withdrawals, and dashboard data. All business logic lives in
 * mlm-referral.service.js; this layer handles HTTP concerns only.
 *
 * Path: apps/api/src/controllers/mlm-referral.controller.js
 */

const mlmService = require('../services/mlm-referral.service');
const { getPagination, buildPaginatedResponse } = require('../utils/helpers');
const { BadRequestError } = require('../utils/errors');

/**
 * GET /api/referrals/mlm/dashboard
 * Aggregated dashboard payload for the authenticated student.
 */
const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await mlmService.getDashboard(req.user.id);

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals/mlm/commissions
 * Paginated commission history for the authenticated student.
 */
const getCommissions = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);

    const { commissions, total } = await mlmService.getCommissionHistory(
      req.user.id,
      pagination.limit,
      pagination.offset
    );

    res.json(buildPaginatedResponse(commissions, total, pagination));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals/mlm/tree
 * Downline tree for the authenticated student.
 */
const getTree = async (req, res, next) => {
  try {
    const tree = await mlmService.getDownlineTree(req.user.id);

    res.json({
      success: true,
      data: { tree },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/referrals/mlm/withdrawals
 * Paginated withdrawal history for the authenticated student.
 */
const getWithdrawals = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);

    const { withdrawals, total } = await mlmService.getWithdrawalHistory(
      req.user.id,
      pagination.limit,
      pagination.offset
    );

    res.json(buildPaginatedResponse(withdrawals, total, pagination));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/referrals/mlm/withdrawals
 * Submit a new withdrawal request.
 */
const createWithdrawal = async (req, res, next) => {
  try {
    const { amount, method, accountNumber, accountName, bankName } = req.body;

    if (!amount || !method || !accountNumber || !accountName) {
      throw new BadRequestError('amount, method, accountNumber, and accountName are required.');
    }

    const withdrawal = await mlmService.requestWithdrawal(req.user.id, {
      amount: Number(amount),
      method,
      accountNumber,
      accountName,
      bankName,
    });

    res.status(201).json({
      success: true,
      message: 'Withdrawal request submitted. Admin will process shortly.',
      data: { withdrawal },
    });
  } catch (error) {
    next(error);
  }
};

/* ============================================================================
 * ADMIN HANDLERS
 * ========================================================================== */

/**
 * GET /api/admin/referrals/mlm/withdrawals
 * Paginated list of withdrawals for admin review.
 */
const adminGetWithdrawals = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const pagination = getPagination(page, limit);

    const { withdrawals, total } = await mlmService.getWithdrawalsForAdmin({
      status: status && status !== 'all' ? status : null,
      limit: pagination.limit,
      offset: pagination.offset,
    });

    res.json(buildPaginatedResponse(withdrawals, total, pagination));
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/referrals/mlm/withdrawals/:id
 * Approve or reject a withdrawal request.
 */
const adminProcessWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, note, transactionRef } = req.body;

    if (!action || !['approve', 'reject'].includes(action)) {
      throw new BadRequestError('action must be "approve" or "reject".');
    }

    const withdrawal = await mlmService.processWithdrawal(id, req.admin.id, {
      action,
      note,
      transactionRef,
    });

    res.json({
      success: true,
      message: action === 'approve' ? 'Withdrawal marked as paid.' : 'Withdrawal rejected.',
      data: { withdrawal },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/referrals/mlm/stats
 * Platform-wide MLM statistics for the admin dashboard.
 */
const adminGetStats = async (req, res, next) => {
  try {
    const stats = await mlmService.getAdminStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getCommissions,
  getTree,
  getWithdrawals,
  createWithdrawal,
  adminGetWithdrawals,
  adminProcessWithdrawal,
  adminGetStats,
};