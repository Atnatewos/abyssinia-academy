/**
 * @fileoverview Referral Code Validation API
 *
 * Public endpoint. Validates a referral code and returns referrer info
 * plus the flat discount percentage the referred student will receive.
 *
 * Path: apps/web/pages/api/referrals/validate/[code]/index.js
 */

import { query } from '../../../../../lib/db';
import { getReferredDiscountPercent } from '../../../../../lib/config';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required.',
      });
    }

    const cleanCode = code.trim().toUpperCase();

    const codeResult = await query(
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

    const discountPercent = getReferredDiscountPercent();

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