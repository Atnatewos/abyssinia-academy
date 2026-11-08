/**
 * @fileoverview Admin Global Reseller Sales API
 *
 * GET — paginated list of ALL reseller sales across the platform.
 *
 * Query params: ?page=1&limit=20&status=approved|refunded|all
 *
 * Path: apps/web/pages/api/admin/resellers/sales.js
 */

import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';

const MAX_LIMIT = 100;

const verifyAdmin = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const admin = verifyAdmin(req.headers.authorization);
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const status = ['approved', 'paid', 'refunded', 'reversed'].includes(req.query.status)
      ? req.query.status
      : null;

    const params = [];
    const where = [];
    if (status) {
      params.push(status);
      where.push(`rs.status = $${params.length}`);
    }
    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    params.push(limit, offset);

    const rowsResult = await query(
      `SELECT
         rs.id,
         rs.retail_price,
         rs.platform_fee_amount,
         rs.reseller_pool_amount,
         rs.sub_reseller_payout,
         rs.parent_reseller_payout,
         rs.sub_share_percent_snapshot,
         rs.status,
         rs.created_at,
         rs.unlock_at,
         rp.reseller_code,
         ru.full_name AS reseller_name,
         u.full_name AS buyer_name,
         u.phone AS buyer_phone
       FROM reseller_sales rs
       JOIN reseller_profiles rp ON rp.id = rs.reseller_id
       JOIN users ru ON ru.id = rp.user_id
       LEFT JOIN users u ON u.id = rs.buyer_user_id
       ${whereClause}
       ORDER BY rs.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countParams = params.slice(0, params.length - 2);
    const countResult = await query(
      `SELECT COUNT(*)::int AS count FROM reseller_sales rs ${whereClause}`,
      countParams
    );

    const total = countResult.rows[0].count;
    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: {
        sales: rowsResult.rows.map((s) => ({
          id: s.id,
          resellerCode: s.reseller_code,
          resellerName: s.reseller_name,
          buyerName: s.buyer_name || 'Anonymous',
          buyerPhone: s.buyer_phone,
          retailPrice: parseFloat(s.retail_price),
          platformFee: parseFloat(s.platform_fee_amount),
          resellerPool: parseFloat(s.reseller_pool_amount),
          subResellerPayout: parseFloat(s.sub_reseller_payout),
          parentResellerPayout: parseFloat(s.parent_reseller_payout),
          sharePercent: parseFloat(s.sub_share_percent_snapshot),
          status: s.status,
          createdAt: s.created_at,
          unlockAt: s.unlock_at,
          isLocked: new Date(s.unlock_at) > new Date(),
        })),
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
    console.error('[admin/resellers/sales] error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load sales.',
    });
  }
}