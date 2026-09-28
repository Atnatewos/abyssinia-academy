/**
 * @fileoverview Admin MLM Withdrawals List API
 *
 * GET /api/admin/referrals/mlm/withdrawals
 *
 * Returns paginated withdrawal requests for admin review with a stable
 * response contract: { success, data: { withdrawals: [...], pagination } }.
 * Rows are mapped to camelCase so the admin UI consumes them directly.
 *
 * Path: apps/web/pages/api/admin/referrals/mlm/withdrawals.js
 */

import { query } from '../../../../../lib/db';
import jwt from 'jsonwebtoken';

/**
 * Verify the admin JWT from the Authorization header.
 *
 * @param {object} req - Next.js request object
 * @returns {object|null} Decoded token payload or null
 */
const verifyAdminToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  try {
    return jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return null;
  }
};

/**
 * Map a raw withdrawal row (snake_case) to the camelCase contract
 * consumed by the admin UI.
 *
 * @param {object} row - Raw database row
 * @returns {object} Normalized withdrawal object
 */
const normalizeWithdrawal = (row) => ({
  id: row.id,
  userId: row.user_id,
  amount: parseFloat(row.amount),
  method: row.method,
  accountNumber: row.account_number,
  accountName: row.account_name,
  bankName: row.bank_name,
  status: row.status,
  adminNote: row.admin_note,
  transactionRef: row.transaction_ref,
  createdAt: row.created_at,
  processedAt: row.processed_at,
  userName: row.user_name,
  userPhone: row.user_phone,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const admin = verifyAdminToken(req);
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const offset = (page - 1) * limit;
    const status = req.query.status && req.query.status !== 'all' ? req.query.status : null;

    const filterClause = status ? 'WHERE w.status = $1' : '';
    const filterParams = status ? [status] : [];
    const limitPlaceholder = `$${filterParams.length + 1}`;
    const offsetPlaceholder = `$${filterParams.length + 2}`;

    const rowsResult = await query(
      `SELECT w.id, w.user_id, w.amount, w.method, w.account_number, w.account_name,
              w.bank_name, w.status, w.admin_note, w.transaction_ref,
              w.created_at, w.processed_at,
              u.full_name AS user_name, u.phone AS user_phone
       FROM withdrawal_requests w
       LEFT JOIN users u ON u.id = w.user_id
       ${filterClause}
       ORDER BY
         CASE WHEN w.status = 'pending' THEN 0 ELSE 1 END,
         w.created_at ASC
       LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
      [...filterParams, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*)::int AS count FROM withdrawal_requests ${status ? 'WHERE status = $1' : ''}`,
      filterParams
    );

    const total = countResult.rows[0].count;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        withdrawals: rowsResult.rows.map(normalizeWithdrawal),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Admin MLM withdrawals list error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load withdrawals.' });
  }
}