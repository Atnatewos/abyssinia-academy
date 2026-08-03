/**
 * @fileoverview Register API Route
 * Serverless function for user registration with referral code support.
 * If a valid referral code is provided, the referred student gets a discount
 * and a referral record is created.
 * Path: apps/web/pages/api/auth/register.js
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { calculateReferredDiscount } from '../../../lib/config';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {

    const { fullName, phone, email, password, referralCode } = req.body;

    /*
     * Validate required fields
     */
    if (!fullName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone, and password are required.',
      });
    }

    /*
     * Check for duplicate phone number
     */
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this phone number already exists.',
      });
    }

    /*
     * Validate referral code if provided
     */
    let referrerId = null;
    let referralDiscountPercent = 0;
    let validatedReferralCode = null;

    if (referralCode && typeof referralCode === 'string' && referralCode.trim()) {
      const cleanCode = referralCode.trim().toUpperCase();

      /*
       * Look up the referral code
       */
      const referralCodeResult = await pool.query(
        `SELECT rc.user_id, rc.is_active, re.successful_referrals
         FROM referral_codes rc
         LEFT JOIN referral_earnings re ON re.user_id = rc.user_id
         WHERE rc.code = $1`,
        [cleanCode]
      );

      if (referralCodeResult.rows.length > 0) {
        const referralData = referralCodeResult.rows[0];

        /*
         * Prevent self-referral
         */
        if (referralData.is_active) {
          referrerId = referralData.user_id;
          validatedReferralCode = cleanCode;

          /*
           * Calculate the discount based on referrer's tier
           */
          const successfulReferrals = parseInt(referralData.successful_referrals || 0, 10);
          referralDiscountPercent = calculateReferredDiscount(successfulReferrals);
        }
      }
    }

    /*
     * Hash the password
     */
    const hashedPassword = await bcrypt.hash(password, 12);

    /*
     * Create the user with referral info
     */
    const result = await pool.query(
      `INSERT INTO users (full_name, phone, email, password, referred_by_code, referral_discount_percent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, phone, email, is_enrolled, payment_status, referred_by_code, referral_discount_percent`,
      [
        fullName,
        phone,
        email || null,
        hashedPassword,
        validatedReferralCode,
        referralDiscountPercent,
      ]
    );

    const user = result.rows[0];

    /*
     * Create the referral record if this was a referred registration
     */
    if (referrerId && validatedReferralCode) {

      /*
       * Ensure the referrer has an earnings record
       */
      await pool.query(
        `INSERT INTO referral_earnings (user_id, current_tier)
         VALUES ($1, 'bronze')
         ON CONFLICT (user_id) DO NOTHING`,
        [referrerId]
      );

      /*
       * Create the referral record with 'registered' status
       */
      await pool.query(
        `INSERT INTO referrals (referrer_id, referred_user_id, referral_code, status, discount_percent)
         VALUES ($1, $2, $3, 'registered', $4)`,
        [referrerId, user.id, validatedReferralCode, referralDiscountPercent]
      );

      /*
       * Increment the referrer's total referral count
       */
      await pool.query(
        `UPDATE referral_earnings
         SET total_referrals = total_referrals + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [referrerId]
      );
    }

    /*
     * Generate JWT token
     */
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          phone: user.phone,
          email: user.email,
          is_enrolled: user.is_enrolled,
          payment_status: user.payment_status,
          referred_by_code: user.referred_by_code,
          referral_discount_percent: parseFloat(user.referral_discount_percent || 0),
        },
        token,
        referral: validatedReferralCode ? {
          code: validatedReferralCode,
          discountPercent: referralDiscountPercent,
        } : null,
      },
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed.' });
  }
}