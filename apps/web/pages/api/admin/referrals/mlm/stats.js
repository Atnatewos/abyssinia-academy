/**
 * @fileoverview Admin MLM Stats API
 *
 * GET /api/admin/referrals/mlm/stats
 *
 * Platform-wide MLM health metrics (Money Model v2):
 *   - totalCommissionPaid: credited commissions only (reversed excluded)
 *   - totalBonusesAwarded: credited bonuses only
 *   - activeReferrers: users with at least one credited commission
 *   - currentMonthPayout: platform monthly aggregate
 *
 * Path: apps/web/pages/api/admin/referrals/mlm/stats.js
 */

import { query } from '../../../../../lib/db';
import jwt from 'jsonwebtoken';

/**
 * Verifies the admin JWT from the Authorization header.
 * @param {object} req - Next.js request object
 * @returns {object|null} Decoded token or null
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const admin = verifyAdminToken(req);
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  try {
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [commissionResult, bonusResult, referrersResult, monthlyResult] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
         FROM affiliate_commissions
         WHERE status = 'credited'`
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0)::numeric AS total
         FROM referral_bonuses
         WHERE status = 'credited'`
      ),
      query(
        `SELECT COUNT(DISTINCT earning_user_id)::int AS count
         FROM affiliate_commissions
         WHERE status = 'credited'`
      ),
      query(
        `SELECT COALESCE(total_payout, 0)::numeric AS total
         FROM referral_platform_monthly
         WHERE month = $1`,
        [currentMonth]
      ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalCommissionPaid: parseFloat(commissionResult.rows[0]?.total || 0),
        totalBonusesAwarded: parseFloat(bonusResult.rows[0]?.total || 0),
        activeReferrers: referrersResult.rows[0]?.count || 0,
        currentMonthPayout: parseFloat(monthlyResult.rows[0]?.total || 0),
        currentMonth,
      },
    });
  } catch (error) {
    console.error('Admin MLM stats error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load MLM stats.' });
  }
}