/**
 * @fileoverview Referral MLM Commissions API
 *
 * GET /api/referrals/mlm/commissions?page=1&limit=20
 *
 * Returns paginated commission history with a stable camelCase contract
 * consumed directly by MLMCommissionTable:
 *   { success, data: { commissions: [...], pagination, summary } }
 *
 * Row normalization keeps the frontend free of snake_case handling and
 * guarantees a single source of truth for field names.
 *
 * Path: apps/web/pages/api/referrals/mlm/commissions.js
 */

import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';

/**
 * Normalize a raw commission row (snake_case) into the camelCase
 * contract consumed by the frontend table component.
 *
 * @param {object} row - Raw database row
 * @returns {object} Normalized commission object
 */
const normalizeCommission = (row) => ({
  id: row.id,
  sourceUserId: row.source_user_id,
  paymentId: row.payment_id,
  level: row.level,
  saleAmount: parseFloat(row.sale_amount),
  commissionAmount: parseFloat(row.commission_amount),
  status: row.status,
  createdAt: row.created_at,
  unlockAt: row.unlock_at,
  reversedAt: row.reversed_at,
  reversalReason: row.reversal_reason,
  sourceUserName: row.source_user_name,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  const userId = decoded.userId;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  try {
    const rowsResult = await query(
      `SELECT c.id, c.source_user_id, c.payment_id, c.level,
              c.sale_amount, c.commission_amount, c.status,
              c.created_at, c.unlock_at, c.reversed_at, c.reversal_reason,
              u.full_name AS source_user_name
       FROM affiliate_commissions c
       LEFT JOIN users u ON u.id = c.source_user_id
       WHERE c.earning_user_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*)::int AS count FROM affiliate_commissions WHERE earning_user_id = $1',
      [userId]
    );

    /* Summary chips: unlocked / locked / this-month credited totals */
    const [unlockedResult, lockedResult, thisMonthResult] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
         FROM affiliate_commissions
         WHERE earning_user_id = $1 AND status = 'credited' AND unlock_at <= NOW()`,
        [userId]
      ),
      query(
        `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
         FROM affiliate_commissions
         WHERE earning_user_id = $1 AND status = 'credited' AND unlock_at > NOW()`,
        [userId]
      ),
      query(
        `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
         FROM affiliate_commissions
         WHERE earning_user_id = $1
           AND status = 'credited'
           AND TO_CHAR(created_at, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')`,
        [userId]
      ),
    ]);

    const total = countResult.rows[0].count;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        commissions: rowsResult.rows.map(normalizeCommission),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        summary: {
          unlocked: parseFloat(unlockedResult.rows[0].total),
          locked: parseFloat(lockedResult.rows[0].total),
          thisMonth: parseFloat(thisMonthResult.rows[0].total),
        },
      },
    });
  } catch (error) {
    console.error('MLM commissions error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load commissions.' });
  }
}