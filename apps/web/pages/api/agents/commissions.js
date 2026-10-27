/**
 * @fileoverview Agent Commissions API
 *
 * GET /api/agents/commissions?page=1&limit=20
 *
 * Returns paginated agent commission history with a stable camelCase contract.
 * Agent commissions have NO lock window — all rows are instantly withdrawable.
 *
 * Path: apps/web/pages/api/agents/commissions.js
 */
import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

/**
 * Normalize a raw agent commission row (snake_case) into the camelCase
 * contract consumed by the frontend table component.
 *
 * @param {object} row - Raw database row
 * @returns {object} Normalized agent commission object
 */
const normalizeAgentCommission = (row) => ({
  id: row.id,
  sourceUserId: row.source_user_id,
  paymentId: row.payment_id,
  commissionType: row.commission_type,
  commissionAmount: parseFloat(row.commission_amount),
  saleAmount: parseFloat(row.sale_amount),
  percentageRate: parseFloat(row.percentage_rate || 0),
  status: row.status,
  paidAt: row.paid_at,
  createdAt: row.created_at,
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
      `SELECT ac.id, ac.source_user_id, ac.payment_id, ac.commission_type,
              ac.commission_amount, ac.sale_amount, ac.percentage_rate,
              ac.status, ac.paid_at, ac.created_at,
              u.full_name AS source_user_name
       FROM agent_commissions ac
       LEFT JOIN users u ON u.id = ac.source_user_id
       WHERE ac.agent_user_id = $1
       ORDER BY ac.paid_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*)::int AS count FROM agent_commissions WHERE agent_user_id = $1',
      [userId]
    );

    /* Summary chips: total earned, this-month earned, sales count */
    const [totalResult, thisMonthResult, salesResult] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
         FROM agent_commissions
         WHERE agent_user_id = $1 AND status = 'paid'`,
        [userId]
      ),
      query(
        `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
         FROM agent_commissions
         WHERE agent_user_id = $1
         AND status = 'paid'
         AND TO_CHAR(paid_at, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')`,
        [userId]
      ),
      query(
        `SELECT COUNT(*)::int AS count
         FROM agent_commissions
         WHERE agent_user_id = $1 AND status = 'paid'`,
        [userId]
      ),
    ]);

    const total = countResult.rows[0].count;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        commissions: rowsResult.rows.map(normalizeAgentCommission),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        summary: {
          totalEarned: parseFloat(totalResult.rows[0].total || 0),
          thisMonthEarned: parseFloat(thisMonthResult.rows[0].total || 0),
          totalSales: parseInt(salesResult.rows[0].count || 0, 10),
        },
      },
    });
  } catch (error) {
    console.error('Agent commissions error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load agent commissions.' });
  }
}