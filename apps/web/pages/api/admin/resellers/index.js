/**
 * @fileoverview Admin Resellers List API
 *
 * GET — paginated list of all reseller profiles with aggregate stats.
 *
 * Query params:
 *   ?page=1&limit=20&search=text&status=active|suspended
 *
 * Path: apps/web/pages/api/admin/resellers/index.js
 */

import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';

const MAX_LIMIT = 100;

/**
 * Verify the admin JWT from the Authorization header.
 *
 * @param {string} authHeader
 * @returns {object|null}
 */
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

    const search = (req.query.search || '').trim();
    const status =
      req.query.status === 'active' || req.query.status === 'suspended'
        ? req.query.status
        : null;

    const where = [];
    const params = [];

    if (status) {
      params.push(status);
      where.push(`rp.status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      where.push(`(
        LOWER(u.full_name) LIKE $${params.length}
        OR u.phone LIKE $${params.length}
        OR LOWER(COALESCE(u.email, '')) LIKE $${params.length}
        OR LOWER(rp.reseller_code) LIKE $${params.length}
      )`);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    params.push(limit, offset);

    const rowsResult = await query(
      `SELECT
         u.id AS user_id,
         u.full_name,
         u.phone,
         u.email,
         rp.id AS reseller_id,
         rp.reseller_code,
         rp.custom_price,
         rp.sub_share_percent,
         rp.status,
         rp.parent_reseller_id,
         rp.depth,
         rp.created_at AS joined_at,
         rp.last_sale_at,
         COALESCE(stats.total_sales, 0) AS total_sales,
         COALESCE(stats.total_earnings, 0) AS total_earnings
       FROM reseller_profiles rp
       JOIN users u ON u.id = rp.user_id
       LEFT JOIN LATERAL (
         SELECT
           COUNT(*)::int AS total_sales,
           COALESCE(SUM(sub_reseller_payout), 0)::numeric AS total_earnings
         FROM reseller_sales
         WHERE reseller_id = rp.id
           AND status IN ('approved', 'paid')
       ) stats ON TRUE
       ${whereClause}
       ORDER BY stats.total_earnings DESC NULLS LAST, rp.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countParams = params.slice(0, params.length - 2);
    const countResult = await query(
      `SELECT COUNT(*)::int AS count
       FROM reseller_profiles rp
       JOIN users u ON u.id = rp.user_id
       ${whereClause}`,
      countParams
    );

    const total = countResult.rows[0].count;
    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: {
        resellers: rowsResult.rows.map((r) => ({
          userId: r.user_id,
          resellerId: r.reseller_id,
          fullName: r.full_name,
          phone: r.phone,
          email: r.email,
          resellerCode: r.reseller_code,
          customPrice: parseFloat(r.custom_price),
          subSharePercent: parseFloat(r.sub_share_percent),
          status: r.status,
          parentResellerId: r.parent_reseller_id,
          depth: r.depth,
          joinedAt: r.joined_at,
          lastSaleAt: r.last_sale_at,
          totalSales: r.total_sales,
          totalEarnings: parseFloat(r.total_earnings),
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
    console.error('[admin/resellers] list error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load resellers.',
    });
  }
}