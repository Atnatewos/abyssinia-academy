/**
 * @fileoverview Referral Code Validation API
 * Public endpoint — validates a referral code and returns referrer info + discount.
 * Path: apps/web/pages/api/referrals/validate/[code]/index.js
 */

import { Pool } from 'pg';
import { calculateReferredDiscount } from '../../../../../lib/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export default async function handler(req, res) {

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {

    const { code } = req.query;

    /*
     * Validate code format
     */
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required.',
      });
    }

    const cleanCode = code.trim().toUpperCase();

    /*
     * Look up the referral code
     */
    const codeResult = await pool.query(
      `SELECT rc.user_id, rc.is_active, u.full_name AS referrer_name
       FROM referral_codes rc
       JOIN users u ON u.id = rc.user_id
       WHERE rc.code = $1`,
      [cleanCode]
    );

    if (codeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code.',
      });
    }

    const referralData = codeResult.rows[0];

    if (!referralData.is_active) {
      return res.status(400).json({
        success: false,
        message: 'This referral code is no longer active.',
      });
    }

    /*
     * Get the referrer's successful referral count to calculate discount
     */
    const earningsResult = await pool.query(
      `SELECT successful_referrals FROM referral_earnings WHERE user_id = $1`,
      [referralData.user_id]
    );

    const successfulReferrals = parseInt(
      earningsResult.rows[0]?.successful_referrals || 0,
      10
    );

    /*
     * Calculate the discount percentage based on the referrer's tier
     */
    const discountPercent = calculateReferredDiscount(successfulReferrals);

    res.status(200).json({
      success: true,
      data: {
        code: cleanCode,
        referrerName: referralData.referrer_name,
        discountPercent,
      },
    });

  } catch (error) {
    console.error('Referral validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate referral code.',
    });
  }
}