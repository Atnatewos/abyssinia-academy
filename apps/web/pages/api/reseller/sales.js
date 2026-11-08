/**
 * @fileoverview Reseller Sales List API
 *
 * GET — paginated list of the authenticated reseller's sales.
 *
 * Path: apps/web/pages/api/reseller/sales.js
 */

import {
  requireReseller,
  sendSuccess,
  sendError,
} from '../../../lib/reseller-api';
import { query } from '../../../lib/db';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed.');
  }

  let context;
  try {
    context = await requireReseller(req);
  } catch (err) {
    return sendError(res, err.status || 401, err.message);
  }

  const { profile } = context;

  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_PAGE_SIZE));
    const offset = (page - 1) * limit;

    const [rowsResult, countResult] = await Promise.all([
      query(
        `SELECT rs.id, rs.retail_price, rs.sub_reseller_payout, rs.sub_share_percent_snapshot,
                rs.status, rs.created_at, rs.unlock_at,
                u.full_name AS buyer_name
         FROM reseller_sales rs
         LEFT JOIN users u ON u.id = rs.buyer_user_id
         WHERE rs.reseller_id = $1
         ORDER BY rs.created_at DESC
         LIMIT $2 OFFSET $3`,
        [profile.id, limit, offset]
      ),
      query(
        'SELECT COUNT(*)::int AS count FROM reseller_sales WHERE reseller_id = $1',
        [profile.id]
      ),
    ]);

    const total = countResult.rows[0].count;
    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, {
      sales: rowsResult.rows.map((r) => ({
        id: r.id,
        buyerName: r.buyer_name || 'Anonymous',
        retailPrice: parseFloat(r.retail_price),
        yourEarnings: parseFloat(r.sub_reseller_payout),
        sharePercent: parseFloat(r.sub_share_percent_snapshot),
        status: r.status,
        createdAt: r.created_at,
        unlockAt: r.unlock_at,
        isLocked: new Date(r.unlock_at) > new Date(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('[reseller/sales]', err.message);
    return sendError(res, 500, 'Failed to load sales.');
  }
}