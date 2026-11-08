/**
 * @fileoverview Reseller Sub-Reseller Detail API
 *
 * GET    — get one sub-reseller
 * PATCH  — update their share percent
 * DELETE — remove from team (orphan them)
 *
 * Only the parent can access/modify their own sub-resellers.
 *
 * Path: apps/web/pages/api/reseller/sub-resellers/[id].js
 */

import {
  requireReseller,
  sendSuccess,
  sendError,
  getConfig,
} from '../../../../lib/reseller-api';
import { query } from '../../../../lib/db';

export default async function handler(req, res) {
  let context;
  try {
    context = await requireReseller(req);
  } catch (err) {
    return sendError(res, err.status || 401, err.message);
  }

  const { userId, profile } = context;
  const subResellerId = req.query.id;

  if (!subResellerId) {
    return sendError(res, 400, 'Sub-reseller id is required.');
  }

  /* ── Verify ownership ────────────────────────────────────────────────── */
  const ownerCheck = await query(
    `SELECT rp.*, u.full_name, u.phone
     FROM reseller_profiles rp
     JOIN users u ON u.id = rp.user_id
     WHERE rp.id = $1`,
    [subResellerId]
  );

  if (ownerCheck.rows.length === 0) {
    return sendError(res, 404, 'Sub-reseller not found.');
  }

  const sub = ownerCheck.rows[0];

  if (sub.parent_reseller_id !== profile.id) {
    return sendError(res, 403, 'You do not own this sub-reseller.');
  }

  /* ══════════════════════════════════════════════════════════════════════
   * GET
   * ══════════════════════════════════════════════════════════════════════ */
  if (req.method === 'GET') {
    const [salesStats, recentSales] = await Promise.all([
      query(
        `SELECT COUNT(*)::int AS count,
                COALESCE(SUM(parent_reseller_payout), 0)::numeric AS parent_earned
         FROM reseller_sales
         WHERE parent_reseller_id = $1 AND status IN ('approved', 'paid')`,
        [profile.id]
      ),
      query(
        `SELECT id, retail_price, parent_reseller_payout, status, created_at
         FROM reseller_sales
         WHERE parent_reseller_id = $1
         ORDER BY created_at DESC
         LIMIT 10`,
        [profile.id]
      ),
    ]);

    return sendSuccess(res, {
      subReseller: {
        id: sub.id,
        resellerCode: sub.reseller_code,
        displayName: sub.full_name,
        subSharePercent: parseFloat(sub.sub_share_percent),
        theirPrice: parseFloat(sub.custom_price),
        status: sub.status,
        createdAt: sub.created_at,
      },
      stats: {
        totalSales: salesStats.rows[0].count,
        yourEarnings: parseFloat(salesStats.rows[0].parent_earned),
      },
      recentSales: recentSales.rows.map((r) => ({
        id: r.id,
        retailPrice: parseFloat(r.retail_price),
        yourEarnings: parseFloat(r.parent_reseller_payout),
        status: r.status,
        createdAt: r.created_at,
      })),
    });
  }

  /* ══════════════════════════════════════════════════════════════════════
   * PATCH — update share percent
   * ══════════════════════════════════════════════════════════════════════ */
  if (req.method === 'PATCH') {
    try {
      const config = await getConfig(profile.id);
      const { subSharePercent } = req.body || {};
      const sharePercent = Number(subSharePercent);

      if (!Number.isFinite(sharePercent)) {
        return sendError(res, 400, 'Sub-share percent must be a number.');
      }
      if (sharePercent < config.commission.subReseller.minSubSharePercent
          || sharePercent > config.commission.subReseller.maxSubSharePercent) {
        return sendError(
          res, 400,
          `Sub-share must be between ${config.commission.subReseller.minSubSharePercent}% and ${config.commission.subReseller.maxSubSharePercent}%.`,
          'INVALID_SHARE_PERCENT'
        );
      }

      const result = await query(
        `UPDATE reseller_profiles
         SET sub_share_percent = $2,
             sub_share_set_by = $3,
             sub_share_set_at = NOW(),
             updated_at = NOW()
         WHERE id = $1
         RETURNING sub_share_percent`,
        [subResellerId, sharePercent, userId]
      );

      return sendSuccess(
        res,
        { subSharePercent: parseFloat(result.rows[0].sub_share_percent) },
        'Share percent updated.'
      );
    } catch (err) {
      console.error('[sub-resellers PATCH]', err.message);
      return sendError(res, 500, 'Failed to update share.');
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
   * DELETE — orphan the sub-reseller
   * ══════════════════════════════════════════════════════════════════════ */
  if (req.method === 'DELETE') {
    try {
      const client = await require('../../../../lib/db').pool.connect();
      try {
        await client.query('BEGIN');

        await client.query(
          `UPDATE reseller_profiles
           SET parent_reseller_id = NULL,
               depth = 0,
               sub_share_percent = 100,
               sub_share_set_by = NULL,
               sub_share_set_at = NULL,
               updated_at = NOW()
           WHERE id = $1`,
          [subResellerId]
        );

        await client.query('COMMIT');
        return sendSuccess(res, { removed: true }, 'Sub-reseller removed.');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('[sub-resellers DELETE]', err.message);
      return sendError(res, 500, 'Failed to remove sub-reseller.');
    }
  }

  return sendError(res, 405, 'Method not allowed.');
}