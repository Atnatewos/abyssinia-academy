/**
 * @fileoverview Reseller Sub-Resellers API
 *
 * GET  — list sub-resellers of the authenticated reseller
 * POST — invite a new sub-reseller
 *
 * Handles the one-level sub-reseller model: a reseller can recruit
 * sub-resellers, who then sell under a share split the parent chooses.
 * Sub-resellers cannot themselves recruit further (depth cap = 1).
 *
 * Path: apps/web/pages/api/reseller/sub-resellers/index.js
 */

import {
  requireReseller,
  sendSuccess,
  sendError,
  getConfig,
} from '../../../../lib/reseller-api';
import { query, pool } from '../../../../lib/db';
import { ResellerValidationError, ensureResellerProfile } from '@shared/reseller';

export default async function handler(req, res) {
  let context;
  try {
    context = await requireReseller(req);
  } catch (err) {
    return sendError(res, err.status || 401, err.message);
  }

  const { userId, profile } = context;
  const config = await getConfig(profile.id);

  /* ══════════════════════════════════════════════════════════════════════
   * GET — list sub-resellers
   * ══════════════════════════════════════════════════════════════════════ */
  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT rp.id, rp.reseller_code, rp.sub_share_percent, rp.custom_price,
                rp.status, rp.created_at, rp.last_sale_at,
                u.full_name, u.phone
         FROM reseller_profiles rp
         JOIN users u ON u.id = rp.user_id
         WHERE rp.parent_reseller_id = $1
         ORDER BY rp.created_at DESC`,
        [profile.id]
      );

      return sendSuccess(res, {
        subResellers: result.rows.map((r) => ({
          id: r.id,
          resellerCode: r.reseller_code,
          displayName: r.full_name,
          phone: r.phone ? `${r.phone.slice(0, 4)}****${r.phone.slice(-2)}` : null,
          subSharePercent: parseFloat(r.sub_share_percent),
          theirPrice: parseFloat(r.custom_price),
          status: r.status,
          createdAt: r.created_at,
          lastSaleAt: r.last_sale_at,
        })),
        limits: {
          currentCount: result.rows.length,
          maxAllowed: config.commission.subReseller.maxSubResellersPerParent,
        },
      });
    } catch (err) {
      console.error('[sub-resellers GET]', err.message);
      return sendError(res, 500, 'Failed to load sub-resellers.');
    }
  }

  /* ══════════════════════════════════════════════════════════════════════
   * POST — invite a new sub-reseller
   * ══════════════════════════════════════════════════════════════════════ */
  if (req.method === 'POST') {
    try {
      /* Feature-flag check */
      if (!config.commission.subReseller.enabled) {
        return sendError(res, 403, 'Sub-reselling is currently disabled.', 'SUB_RESELLING_DISABLED');
      }

      const { identifier, subSharePercent } = req.body || {};

      /* ── Input validation ────────────────────────────────────────────── */
      if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
        return sendError(res, 400, 'Sub-reseller email or phone is required.');
      }

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

      /* ── Find the target user ────────────────────────────────────────── */
      const targetResult = await query(
        `SELECT id, full_name FROM users
         WHERE LOWER(email) = LOWER($1) OR phone = $1
         LIMIT 1`,
        [identifier.trim()]
      );

      if (targetResult.rows.length === 0) {
        return sendError(res, 404, 'No user found with that email or phone.', 'USER_NOT_FOUND');
      }

      const targetUser = targetResult.rows[0];

      if (targetUser.id === userId) {
        return sendError(res, 400, 'You cannot recruit yourself.', 'SELF_RECRUIT');
      }

      /* ── Check target's existing reseller profile ───────────────────── */
      const existingProfile = await query(
        'SELECT id, parent_reseller_id FROM reseller_profiles WHERE user_id = $1',
        [targetUser.id]
      );

      if (existingProfile.rows.length > 0 && existingProfile.rows[0].parent_reseller_id) {
        return sendError(
          res, 409,
          'This user already has a parent reseller.',
          'ALREADY_RECRUITED'
        );
      }

      /* ── Check parent's sub-reseller limit ─────────────────────────── */
      const countResult = await query(
        'SELECT COUNT(*)::int AS count FROM reseller_profiles WHERE parent_reseller_id = $1',
        [profile.id]
      );
      if (countResult.rows[0].count >= config.commission.subReseller.maxSubResellersPerParent) {
        return sendError(
          res, 429,
          `You have reached the maximum of ${config.commission.subReseller.maxSubResellersPerParent} sub-resellers.`,
          'LIMIT_REACHED'
        );
      }

      /* ── Attach target as sub-reseller (idempotent insert/update) ──── */
      if (existingProfile.rows.length > 0) {
        await query(
          `UPDATE reseller_profiles
           SET parent_reseller_id = $1,
               sub_share_percent = $2,
               sub_share_set_by = $3,
               sub_share_set_at = NOW(),
               depth = 1,
               updated_at = NOW()
           WHERE id = $4`,
          [profile.id, sharePercent, userId, existingProfile.rows[0].id]
        );
      } else {
        /* Wrap the shared module adapter directly around the pool */
        const db = {
          query: (t, p) => query(t, p),
          getClient: () => pool.connect(),
        };
        await ensureResellerProfile(db, targetUser.id, {
          parentResellerId: profile.id,
          customPrice: config.pricing.defaultRetailPriceETB,
          subSharePercent: sharePercent,
          depth: 1,
        });
      }

      return sendSuccess(
        res,
        {
          subReseller: {
            userId: targetUser.id,
            displayName: targetUser.full_name,
            subSharePercent: sharePercent,
          },
        },
        'Sub-reseller added successfully.',
        201
      );
    } catch (err) {
      if (err instanceof ResellerValidationError) {
        return sendError(res, 400, err.message, err.code);
      }
      console.error('[sub-resellers POST]', err.message);
      return sendError(res, 500, 'Failed to add sub-reseller.');
    }
  }

  return sendError(res, 405, 'Method not allowed.');
}