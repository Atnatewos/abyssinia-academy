/**
 * @fileoverview MLM Referral Routes
 *
 * Student-facing MLM endpoints. Every route requires an authenticated
 * student JWT. Admin MLM routes are mounted under /api/admin instead.
 *
 * Path: apps/api/src/routes/mlm-referral.routes.js
 */

const { Router } = require('express');
const mlmController = require('../controllers/mlm-referral.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

const router = Router();

/* All MLM routes require an authenticated student. */
router.use(authenticateUser);

/* Dashboard */
router.get('/mlm/dashboard', mlmController.getDashboard);

/* Commissions */
router.get('/mlm/commissions', mlmController.getCommissions);

/* Downline tree */
router.get('/mlm/tree', mlmController.getTree);

/* Withdrawals */
router.get('/mlm/withdrawals', mlmController.getWithdrawals);
router.post('/mlm/withdrawals', mlmController.createWithdrawal);

module.exports = router;