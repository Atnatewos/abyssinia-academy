/**
 * @fileoverview Get Current User API Route
 *
 * Returns the authenticated user's full profile including:
 *   - Standard referral attribution (referred_by_code, discount percent)
 *   - Agent attribution (registered_via_agent_id, pending_agent_id, is_agent)
 *   - Enrollment status
 *
 * The pricing page uses this to auto-fill both the MLM referral code
 * AND the agent code on checkout so users never have to type them again.
 *
 * Uses the shared `lib/db.js` query helper instead of a dedicated Pool
 * so all API routes share one connection pool.
 *
 * Path: apps/web/pages/api/auth/me.js
 */

import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /*
     * Fetch the full attribution picture. The agent fields are read from
     * the users table so the pricing page can auto-fill the checkout.
     */
    const result = await query(
      `SELECT
         id,
         full_name,
         phone,
         email,
         is_enrolled,
         payment_status,
         is_agent,
         referred_by_code,
         referral_discount_percent,
         registered_via_agent_id,
         pending_agent_id
       FROM users
       WHERE id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          email: user.email,
          is_enrolled: user.is_enrolled,
          payment_status: user.payment_status,
          is_agent: user.is_agent === true,

          /* MLM referral attribution */
          referred_by_code: user.referred_by_code || null,
          referral_discount_percent: parseFloat(
            user.referral_discount_percent || 0
          ),

          /* Agent attribution — used by the pricing page to auto-fill checkout */
          registered_via_agent_id: user.registered_via_agent_id || null,
          pending_agent_id: user.pending_agent_id || null,
        },
      },
    });
  } catch (error) {
    console.error('Auth me error:', error.message);
    res
      .status(401)
      .json({ success: false, message: 'Invalid or expired token.' });
  }
}