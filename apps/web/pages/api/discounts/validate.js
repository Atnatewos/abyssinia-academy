/**
 * @fileoverview Discount Code Validation API
 * Validates a discount code against all business rules.
 * Checks: existence, status, expiration, usage limits, eligibility, min purchase.
 * Path: apps/web/pages/api/discounts/validate.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { getDiscountConfig, getCombinedDiscountConfig } from '../../../lib/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  /*
   * Authenticate
   */
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

    const { code, amount, courseType, selectedPhases } = req.body;
    const discountConfig = getDiscountConfig();
    const validation = discountConfig.codes?.codeValidation || {};

    /*
     * Sanitize the code
     */
    let cleanCode = code || '';

    if (validation.trimWhitespace !== false) {
      cleanCode = cleanCode.trim();
    }

    if (validation.autoUppercase !== false) {
      cleanCode = cleanCode.toUpperCase();
    }

    /*
     * Validate code format
     */
    if (!cleanCode || cleanCode.length < (validation.minLength || 4)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount code format.',
      });
    }

    /*
     * Look up the discount code in the database
     */
    const codeResult = await pool.query(
      `SELECT * FROM discount_codes
       WHERE code = $1 AND is_deleted = false`,
      [cleanCode]
    );

    if (codeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid discount code. Please check and try again.',
      });
    }

    const discountCode = codeResult.rows[0];

    /*
     * Check status
     */
    if (discountCode.status === 'disabled') {
      return res.status(400).json({ success: false, message: 'This discount code is no longer active.' });
    }

    if (discountCode.status === 'paused') {
      return res.status(400).json({ success: false, message: 'This discount code is currently paused.' });
    }

    /*
     * Check expiration
     */
    const now = new Date();

    if (discountCode.valid_from && new Date(discountCode.valid_from) > now) {
      return res.status(400).json({ success: false, message: 'This discount code is not yet valid.' });
    }

    if (discountCode.valid_until && new Date(discountCode.valid_until) < now) {
      return res.status(400).json({ success: false, message: 'This discount code has expired.' });
    }

    /*
     * Check total usage limit
     */
    if (discountCode.max_total_uses > 0 && discountCode.current_total_uses >= discountCode.max_total_uses) {
      return res.status(400).json({ success: false, message: 'This discount code has reached its maximum usage limit.' });
    }

    /*
     * Check per-user usage limit
     */
    if (discountCode.max_uses_per_user > 0) {
      const userUsage = await pool.query(
        `SELECT COUNT(*) AS count FROM discount_code_usage
         WHERE discount_code_id = $1 AND user_id = $2`,
        [discountCode.id, userId]
      );

      if (parseInt(userUsage.rows[0].count, 10) >= discountCode.max_uses_per_user) {
        return res.status(400).json({ success: false, message: 'You have already used this discount code.' });
      }
    }

    /*
     * Check minimum purchase amount
     */
    const purchaseAmount = parseInt(amount, 10) || 0;
    if (discountCode.min_purchase_amount > 0 && purchaseAmount < discountCode.min_purchase_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ${discountCode.min_purchase_amount} ETB required for this code.`,
      });
    }

    /*
     * Check course/phase eligibility
     */
    if (courseType === 'full-course' && !discountCode.eligible_for_full_course) {
      return res.status(400).json({ success: false, message: 'This code cannot be used for full course purchases.' });
    }

    if (courseType === 'individual-phases' && discountCode.eligible_phases && discountCode.eligible_phases.length > 0) {
      const phases = selectedPhases || [];
      const allEligible = phases.every((p) => discountCode.eligible_phases.includes(p));
      if (!allEligible) {
        return res.status(400).json({ success: false, message: 'This code cannot be used for the selected phases.' });
      }
    }

    /*
     * Check first-time-only restriction
     */
    if (discountCode.first_time_only) {
      const enrollmentCheck = await pool.query(
        `SELECT id FROM enrollments WHERE user_id = $1 LIMIT 1`,
        [userId]
      );

      if (enrollmentCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'This code is only available for first-time enrollees.' });
      }
    }

    /*
     * Calculate the discount amount
     */
    let discountAmount = 0;

    if (discountCode.type === 'percentage') {
      discountAmount = Math.round(purchaseAmount * (discountCode.value / 100));
    } else if (discountCode.type === 'fixed_amount') {
      discountAmount = Math.min(discountCode.value, purchaseAmount);
    }

    /*
     * Return the validated discount
     */
    res.status(200).json({
      success: true,
      data: {
        code: discountCode.code,
        type: discountCode.type,
        value: parseFloat(discountCode.value),
        discountAmount,
        description: discountCode.description || '',
        finalAmount: purchaseAmount - discountAmount,
      },
    });

  } catch (error) {
    console.error('Discount validation error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate discount code.',
    });
  }
}