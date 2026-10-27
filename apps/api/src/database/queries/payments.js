/**
 * @fileoverview Payment Database Queries
 * All payment submission and approval related queries
 * Path: apps/api/src/database/queries/payments.js
 */

const { query } = require('../pool');

const createPayment = async ({ userId, amount, method, transactionRef, screenshotUrl }) => {
  const result = await query(
    `INSERT INTO payments (user_id, amount, method, reference, transaction_id, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [userId, amount, method, transactionRef, screenshotUrl || null]
  );
  return result.rows[0];
};

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

const getUserPayment = async (userId) => {
  const result = await query(
    'SELECT * FROM payments WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  return result.rows[0] || null;
};

/**
 * Update payment status only
 * @param {string} id - Payment UUID
 * @param {string} status - New status ('approved' or 'rejected')
 */
const updatePaymentStatus = async (id, status) => {
  const result = await query(
    `UPDATE payments SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0];
};

/**
 * Set payment paid_at timestamp to NOW
 * @param {string} id - Payment UUID
 */
const markPaymentPaid = async (id) => {
  await query(
    `UPDATE payments SET paid_at = NOW() WHERE id = $1`,
    [id]
  );
};

const getPendingPaymentsCount = async () => {
  const result = await query(
    "SELECT COUNT(*) FROM payments WHERE status = 'pending'"
  );
  return parseInt(result.rows[0].count, 10);
};

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