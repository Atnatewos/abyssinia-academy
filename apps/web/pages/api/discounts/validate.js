/**
 * @fileoverview Discount Code Validation API
 * Validates a discount code against all business rules.
 * Enforces: one active discount per payment, strict eligibility,
 * per-user usage limits, expiration, rate limiting.
 * 
 * Path: apps/web/pages/api/discounts/validate.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { getDiscountConfig } from '../../../lib/config';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  /*
   * Authenticate — must be a logged-in student
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
     * Sanitize the code — uppercase, trimmed
     */
    let cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode || cleanCode.length < (validation.minLength || 4)) {
      return res.status(400).json({ success: false, message: 'Invalid discount code format.' });
    }

    /*
     * Rate limiting: check how many validation attempts from this user recently
     */
    const rateLimit = discountConfig.rateLimiting?.perUser;
    if (rateLimit) {
      const recentAttempts = await pool.query(
        `SELECT COUNT(*) AS count FROM discount_code_usage
         WHERE user_id = $1 AND applied_at > NOW() - INTERVAL '1 minute'`,
        [userId]
      );

      if (parseInt(recentAttempts.rows[0].count, 10) >= (rateLimit.validatePerMinute || 5)) {
        return res.status(429).json({
          success: false,
          message: 'Too many attempts. Please wait a moment and try again.',
        });
      }
    }

    /*
     * ── CRITICAL SECURITY CHECK ──
     * Check if this user already has an active discount applied
     * to a payment that hasn't been completed yet (status = pending).
     * This prevents stacking multiple codes on the same order.
     */
    const activeDiscount = await pool.query(
      `SELECT dc.code, dcu.discount_amount
       FROM discount_code_usage dcu
       JOIN discount_codes dc ON dc.id = dcu.discount_code_id
       JOIN payments p ON p.id = dcu.payment_id
       WHERE dcu.user_id = $1 AND p.status = 'pending'
       ORDER BY dcu.applied_at DESC LIMIT 1`,
      [userId]
    );

    if (activeDiscount.rows.length > 0) {
      const existing = activeDiscount.rows[0];
      return res.status(400).json({
        success: false,
        message: `A discount code (${existing.code}) is already applied to your pending payment. Complete or cancel that payment first.`,
      });
    }

    /*
     * Look up the discount code in the database
     */
    const codeResult = await pool.query(
      'SELECT * FROM discount_codes WHERE code = $1 AND is_deleted = false',
      [cleanCode]
    );

    if (codeResult.rows.length === 0) {
      /*
       * Log failed attempt for anti-abuse
       */
      await pool.query(
        `INSERT INTO discount_code_abuse_log (user_id, ip_address, reason, severity)
         VALUES ($1, $2, 'invalid_code_attempt', 'low')`,
        [userId, req.headers['x-forwarded-for'] || req.socket.remoteAddress || null]
      );

      return res.status(404).json({
        success: false,
        message: 'Invalid discount code. Please check and try again.',
      });
    }

    const dc = codeResult.rows[0];

    /*
     * Status checks
     */
    if (dc.status === 'disabled') {
      return res.status(400).json({ success: false, message: 'This discount code is no longer active.' });
    }
    if (dc.status === 'paused') {
      return res.status(400).json({ success: false, message: 'This discount code is currently paused.' });
    }

    /*
     * Expiration checks
     */
    const now = new Date();
    if (dc.valid_from && new Date(dc.valid_from) > now) {
      return res.status(400).json({ success: false, message: 'This discount code is not yet valid.' });
    }
    if (dc.valid_until && new Date(dc.valid_until) < now) {
      return res.status(400).json({ success: false, message: 'This discount code has expired.' });
    }

    /*
     * Total usage limit
     */
    if (dc.max_total_uses > 0 && dc.current_total_uses >= dc.max_total_uses) {
      return res.status(400).json({ success: false, message: 'This discount code has reached its maximum usage limit.' });
    }

    /*
     * Per-user usage limit — each student can only use a code ONCE ever
     */
    if (dc.max_uses_per_user > 0) {
      const userUsage = await pool.query(
        'SELECT COUNT(*) AS count FROM discount_code_usage WHERE discount_code_id = $1 AND user_id = $2',
        [dc.id, userId]
      );
      if (parseInt(userUsage.rows[0].count, 10) >= dc.max_uses_per_user) {
        return res.status(400).json({ success: false, message: 'You have already used this discount code.' });
      }
    }

    /*
     * Minimum purchase amount
     */
    const purchaseAmount = parseInt(amount, 10) || 0;
    if (dc.min_purchase_amount > 0 && purchaseAmount < dc.min_purchase_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of ${dc.min_purchase_amount} ETB required for this code.`,
      });
    }

    /*
     * ── STRICT ELIGIBILITY ENFORCEMENT ──
     */
    const isFullCourseOnly = dc.eligible_for_full_course && (!dc.eligible_phases || dc.eligible_phases.length === 0);
    const hasPhaseRestrictions = dc.eligible_phases && dc.eligible_phases.length > 0;
    const isPurchasingFullCourse = courseType === 'full-course';

    if (isFullCourseOnly && !isPurchasingFullCourse) {
      return res.status(400).json({
        success: false,
        message: 'This discount code is only valid for full course purchases.',
      });
    }

    if (hasPhaseRestrictions) {
      if (isPurchasingFullCourse && !dc.eligible_for_full_course) {
        return res.status(400).json({
          success: false,
          message: `This code is only valid for specific phases: ${dc.eligible_phases.map(p => p.replace('phase-', 'Phase ')).join(', ')}.`,
        });
      }

      if (!isPurchasingFullCourse) {
        const phases = selectedPhases || [];
        const invalidPhases = phases.filter((p) => !dc.eligible_phases.includes(p));
        if (invalidPhases.length > 0) {
          return res.status(400).json({
            success: false,
            message: `This code is not valid for: ${invalidPhases.map(p => p.replace('phase-', 'Phase ')).join(', ')}.`,
          });
        }
      }
    }

    /*
     * First-time-only check
     */
    if (dc.first_time_only) {
      const enrollmentCheck = await pool.query(
        'SELECT id FROM enrollments WHERE user_id = $1 LIMIT 1',
        [userId]
      );
      if (enrollmentCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'This code is only available for first-time enrollees.' });
      }
    }

    /*
     * Calculate discount amount
     */
    let discountAmount = 0;
    if (dc.type === 'percentage') {
      discountAmount = Math.round(purchaseAmount * (dc.value / 100));
    } else if (dc.type === 'fixed_amount') {
      discountAmount = Math.min(dc.value, purchaseAmount);
    }

    return res.status(200).json({
      success: true,
      data: {
        code: dc.code,
        type: dc.type,
        value: parseFloat(dc.value),
        discountAmount,
        description: dc.description || '',
        finalAmount: purchaseAmount - discountAmount,
        eligibleForFullCourse: dc.eligible_for_full_course,
        eligiblePhases: dc.eligible_phases || [],
      },
    });

  } catch (error) {
    console.error('Discount validation error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to validate discount code.' });
  }
}