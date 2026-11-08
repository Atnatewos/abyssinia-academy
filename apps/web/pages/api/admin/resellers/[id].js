/**
 * @fileoverview Admin Reseller Detail API
 *
 * GET    — single reseller with recent sales + sub-resellers
 * PATCH  — update price / commission / status (superadmin only)
 *
 * Path: apps/web/pages/api/admin/resellers/[id].js
 */

import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';

const verifyAdmin = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  const admin = verifyAdmin(req.headers.authorization);
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Reseller id is required.' });
  }

  try {
    /* ═══════════════════════════════════════════════════════════════
     * GET — return detail
     * ═══════════════════════════════════════════════════════════════ */
    if (req.method === 'GET') {
      const profileResult = await query(
        `SELECT
           rp.id AS reseller_id,
           rp.user_id,
           rp.reseller_code,
           rp.custom_price,
           rp.sub_share_percent,
           rp.parent_reseller_id,
           rp.depth,
           rp.status,
           rp.terms_accepted_at,
           rp.created_at AS joined_at,
           rp.last_sale_at,
           u.full_name,
           u.phone,
           u.email
         FROM reseller_profiles rp
         JOIN users u ON u.id = rp.user_id
         WHERE rp.id = $1 OR rp.user_id = $1
         LIMIT 1`,
        [id]
      );

      if (profileResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Reseller not found.' });
      }

      const profile = profileResult.rows[0];

      const statsResult = await query(
        `SELECT
           COUNT(*)::int AS total_sales,
           COALESCE(SUM(retail_price), 0)::numeric AS total_volume,
           COALESCE(SUM(sub_reseller_payout), 0)::numeric AS total_earnings,
           COALESCE(SUM(CASE WHEN unlock_at > NOW() AND status = 'approved'
             THEN sub_reseller_payout ELSE 0 END), 0)::numeric AS locked_earnings
         FROM reseller_sales
         WHERE reseller_id = $1 AND status IN ('approved', 'paid')`,
        [profile.reseller_id]
      );

      const recentSalesResult = await query(
        `SELECT
           rs.id, rs.retail_price, rs.sub_reseller_payout,
           rs.sub_share_percent_snapshot, rs.status,
           rs.created_at, rs.unlock_at,
           u.full_name AS buyer_name
         FROM reseller_sales rs
         LEFT JOIN users u ON u.id = rs.buyer_user_id
         WHERE rs.reseller_id = $1
         ORDER BY rs.created_at DESC
         LIMIT 10`,
        [profile.reseller_id]
      );

      const subResellersResult = await query(
        `SELECT
           rp.id AS reseller_id,
           rp.reseller_code,
           rp.sub_share_percent,
           rp.status,
           rp.created_at,
           u.full_name,
           u.phone
         FROM reseller_profiles rp
         JOIN users u ON u.id = rp.user_id
         WHERE rp.parent_reseller_id = $1
         ORDER BY rp.created_at DESC`,
        [profile.reseller_id]
      );

      let parent = null;
      if (profile.parent_reseller_id) {
        const parentResult = await query(
          `SELECT rp.reseller_code, u.full_name
           FROM reseller_profiles rp
           JOIN users u ON u.id = rp.user_id
           WHERE rp.id = $1`,
          [profile.parent_reseller_id]
        );
        if (parentResult.rows.length > 0) {
          parent = {
            resellerCode: parentResult.rows[0].reseller_code,
            fullName: parentResult.rows[0].full_name,
          };
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          reseller: {
            resellerId: profile.reseller_id,
            userId: profile.user_id,
            fullName: profile.full_name,
            phone: profile.phone,
            email: profile.email,
            resellerCode: profile.reseller_code,
            customPrice: parseFloat(profile.custom_price),
            subSharePercent: parseFloat(profile.sub_share_percent),
            status: profile.status,
            depth: profile.depth,
            parent,
            termsAcceptedAt: profile.terms_accepted_at,
            joinedAt: profile.joined_at,
            lastSaleAt: profile.last_sale_at,
          },
          stats: {
            totalSales: statsResult.rows[0].total_sales,
            totalVolume: parseFloat(statsResult.rows[0].total_volume),
            totalEarnings: parseFloat(statsResult.rows[0].total_earnings),
            lockedEarnings: parseFloat(statsResult.rows[0].locked_earnings),
          },
          recentSales: recentSalesResult.rows.map((s) => ({
            id: s.id,
            retailPrice: parseFloat(s.retail_price),
            earnings: parseFloat(s.sub_reseller_payout),
            sharePercent: parseFloat(s.sub_share_percent_snapshot),
            status: s.status,
            buyerName: s.buyer_name || 'Anonymous',
            createdAt: s.created_at,
            unlockAt: s.unlock_at,
            isLocked: new Date(s.unlock_at) > new Date(),
          })),
          subResellers: subResellersResult.rows.map((r) => ({
            resellerId: r.reseller_id,
            resellerCode: r.reseller_code,
            fullName: r.full_name,
            phone: r.phone,
            subSharePercent: parseFloat(r.sub_share_percent),
            status: r.status,
            createdAt: r.created_at,
          })),
        },
      });
    }

    /* ═══════════════════════════════════════════════════════════════
     * PATCH — update reseller
     * ═══════════════════════════════════════════════════════════════ */
    if (req.method === 'PATCH') {
      if (admin.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Superadmin privileges required to modify resellers.',
        });
      }

      const { customPrice, subSharePercent, status } = req.body || {};

      const updates = [];
      const params = [];

      if (customPrice !== undefined) {
        const num = Number(customPrice);
        if (!Number.isFinite(num) || num < 800 || num > 5000) {
          return res.status(400).json({
            success: false,
            message: 'customPrice must be between 800 and 5000.',
          });
        }
        params.push(num);
        updates.push(`custom_price = $${params.length}`);
      }

      if (subSharePercent !== undefined) {
        const num = Number(subSharePercent);
        if (!Number.isFinite(num) || num < 10 || num > 70) {
          return res.status(400).json({
            success: false,
            message: 'subSharePercent must be between 10 and 70.',
          });
        }
        params.push(num);
        updates.push(`sub_share_percent = $${params.length}`);
      }

      if (status !== undefined) {
        if (!['active', 'suspended', 'inactive'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'status must be active, suspended, or inactive.',
          });
        }
        params.push(status);
        updates.push(`status = $${params.length}`);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update.',
        });
      }

      params.push(id);
      const updateResult = await query(
        `UPDATE reseller_profiles
         SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = $${params.length} OR user_id = $${params.length}
         RETURNING id, reseller_code, custom_price, sub_share_percent, status`,
        params
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Reseller not found.' });
      }

      await query(
        `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
         VALUES ($1, 'reseller.update', 'reseller', $2, $3, $4, $5)`,
        [
          admin.adminId,
          updateResult.rows[0].id,
          JSON.stringify({ customPrice, subSharePercent, status }),
          req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
          req.headers['user-agent'] || null,
        ]
      );

      return res.status(200).json({
        success: true,
        message: 'Reseller updated successfully.',
        data: {
          reseller: {
            resellerId: updateResult.rows[0].id,
            resellerCode: updateResult.rows[0].reseller_code,
            customPrice: parseFloat(updateResult.rows[0].custom_price),
            subSharePercent: parseFloat(updateResult.rows[0].sub_share_percent),
            status: updateResult.rows[0].status,
          },
        },
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  } catch (error) {
    console.error('[admin/resellers/[id]] error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to process request.',
    });
  }
}