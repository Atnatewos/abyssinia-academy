/**
 * @fileoverview Referral MLM Bonuses API
 *
 * GET /api/referrals/mlm/bonuses
 *
 * Returns the authenticated user's bonus award history plus a per-category
 * summary used by the bonus tracker progress bars.
 *
 * Response shape:
 *   { success, data: { bonuses: [...], summary: { totalEarned, byCategory } } }
 *
 * Path: apps/web/pages/api/referrals/mlm/bonuses.js
 */

import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';

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

  try {
    const [bonusesResult, categoryResult] = await Promise.all([
      query(
        `SELECT id, bonus_category, bonus_name, requirement_met,
                amount, period, awarded_at
         FROM referral_bonuses
         WHERE user_id = $1
         ORDER BY awarded_at DESC`,
        [userId]
      ),
      query(
        `SELECT bonus_category, COALESCE(SUM(amount), 0)::numeric AS total
         FROM referral_bonuses
         WHERE user_id = $1
         GROUP BY bonus_category`,
        [userId]
      ),
    ]);

    /* Build the per-category totals map */
    const byCategory = {};
    for (const row of categoryResult.rows) {
      byCategory[row.bonus_category] = parseFloat(row.total);
    }

    const totalEarned = Object.values(byCategory).reduce((sum, value) => sum + value, 0);

    res.status(200).json({
      success: true,
      data: {
        bonuses: bonusesResult.rows,
        summary: {
          totalEarned,
          byCategory,
        },
      },
    });
  } catch (error) {
    console.error('MLM bonuses error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load bonuses.' });
  }
}