/**
 * @fileoverview Payment Database Queries
 *
 * All payment submission and approval queries. Every query is parameterized
 * (no string interpolation).
 *
 * Reseller attribution columns (migration 028) are optional. When present,
 * they are stored on the payment row so the orchestrator can route the
 * commission correctly at approval time.
 *
 * Path: apps/api/src/database/queries/payments.js
 */

const { query } = require('../pool');

/**
 * Create a new pending payment.
 *
 * Supports both standard course purchases and reseller-attributed payments.
 * Reseller fields are optional — when omitted, the columns default to NULL
 * which preserves the pre-reseller behavior.
 *
 * @param {object} params
 * @param {string} params.userId - Buyer user UUID
 * @param {number} params.amount - Amount in ETB (already resolved from price)
 * @param {string} params.method - Payment method ('telebirr' | 'cbe-birr' | 'bank-transfer')
 * @param {string} params.transactionRef - Transaction reference / screenshot URL
 * @param {string|null} [params.screenshotUrl]
 * @param {string|null} [params.resellerUserId] - Reseller profile owner UUID
 * @param {string|null} [params.parentResellerUserId] - Parent reseller owner UUID
 * @param {number|null} [params.resellerRetailPrice] - Retail price snapshot
 * @param {number|null} [params.platformFeeAmount] - Platform fee snapshot
 * @param {string} [params.purchaseMode='full-course']
 * @param {string[]|null} [params.selectedPhases]
 * @param {string} [params.purpose='course']
 * @param {string|null} [params.scholarshipApplicationId]
 * @returns {Promise<object>} Created payment row
 */
const createPayment = async ({
  userId,
  amount,
  method,
  transactionRef,
  screenshotUrl = null,
  resellerUserId = null,
  parentResellerUserId = null,
  resellerRetailPrice = null,
  platformFeeAmount = null,
  purchaseMode = 'full-course',
  selectedPhases = null,
  purpose = 'course',
  scholarshipApplicationId = null,
}) => {
  const result = await query(
    `INSERT INTO payments (
       user_id, amount, method, status, reference,
       purchase_mode, selected_phases,
       transaction_id,
       reseller_user_id, parent_reseller_user_id,
       reseller_retail_price, platform_fee_amount,
       purpose, scholarship_application_id
     )
     VALUES (
       $1, $2, $3, 'pending', $4,
       $5, $6,
       $7,
       $8, $9,
       $10, $11,
       $12, $13
     )
     RETURNING *`,
    [
      userId,
      amount,
      method,
      transactionRef,
      purchaseMode,
      selectedPhases,
      screenshotUrl,
      resellerUserId,
      parentResellerUserId,
      resellerRetailPrice,
      platformFeeAmount,
      purpose,
      scholarshipApplicationId,
    ]
  );
  return result.rows[0];
};

/**
 * Get all payments (admin). Paginated, newest first.
 *
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<{payments: object[], total: number}>}
 */
const getAllPayments = async (limit, offset) => {
  const result = await query(
    `SELECT p.*, u.full_name as user_name, u.phone as user_phone
     FROM payments p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const countResult = await query('SELECT COUNT(*) FROM payments');

  return {
    payments: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
};

/**
 * Get payments by status (admin). Paginated, newest first.
 *
 * @param {string} status
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<{payments: object[], total: number}>}
 */
const getPaymentsByStatus = async (status, limit, offset) => {
  const result = await query(
    `SELECT p.*, u.full_name as user_name, u.phone as user_phone
     FROM payments p
     JOIN users u ON p.user_id = u.id
     WHERE p.status = $1
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [status, limit, offset]
  );

  const countResult = await query(
    'SELECT COUNT(*) FROM payments WHERE status = $1',
    [status]
  );

  return {
    payments: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
};

/**
 * Get a single payment by ID (with user context).
 *
 * @param {string} id - Payment UUID
 * @returns {Promise<object|null>}
 */
const getPaymentById = async (id) => {
  const result = await query(
    `SELECT p.*, u.full_name as user_name, u.phone as user_phone
     FROM payments p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Get the most recent payment for a user.
 *
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
const getUserPayment = async (userId) => {
  const result = await query(
    'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Update a payment's status.
 *
 * @param {string} id
 * @param {string} status - 'approved' | 'rejected'
 * @returns {Promise<object|null>}
 */
const updatePaymentStatus = async (id, status) => {
  const result = await query(
    `UPDATE payments SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0] || null;
};

/**
 * Set payment paid_at timestamp to NOW.
 *
 * @param {string} id
 * @returns {Promise<void>}
 */
const markPaymentPaid = async (id) => {
  await query(
    `UPDATE payments SET paid_at = NOW() WHERE id = $1`,
    [id]
  );
};

/**
 * Count pending payments (admin dashboard).
 *
 * @returns {Promise<number>}
 */
const getPendingPaymentsCount = async () => {
  const result = await query(
    "SELECT COUNT(*) FROM payments WHERE status = 'pending'"
  );
  return parseInt(result.rows[0].count, 10);
};

/**
 * Sum total revenue from approved payments.
 *
 * @returns {Promise<number>}
 */
const getTotalRevenue = async () => {
  const result = await query(
    "SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'approved'"
  );
  return parseFloat(result.rows[0].total);
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentsByStatus,
  getPaymentById,
  getUserPayment,
  updatePaymentStatus,
  markPaymentPaid,
  getPendingPaymentsCount,
  getTotalRevenue,
};