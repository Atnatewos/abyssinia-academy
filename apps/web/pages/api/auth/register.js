/**
 * @fileoverview Register API Route
 *
 * Serverless function for user registration with referral code support.
 * After creating the user, builds the referral tree via the shared MLM
 * module so ancestors start earning on future purchases.
 *
 * Referral tree building is best-effort: if it fails, the user is still
 * created and can continue. Errors are logged but never fail the request.
 *
 * Path: apps/web/pages/api/auth/register.js
 */

import { pool, query } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getReferredDiscountPercent } from '../../../lib/config';
import sharedMlm from '@shared/mlm';
import referralsConfig from '@shared/config/referrals.config';

/*
 * Adapter for the shared MLM module — matches its expected `db` shape.
 */
const mlmDb = {
  query,
  getClient: () => pool.connect(),
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { fullName, phone, email, password, referralCode } = req.body;

    /* Validate required fields. */
    if (!fullName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone, and password are required.',
      });
    }

    /* Duplicate phone check. */
    const existingUser = await query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this phone number already exists.',
      });
    }

    /* Validate referral code if provided. */
    let referrerId = null;
    let referralDiscountPercent = 0;
    let validatedReferralCode = null;

    if (referralCode && typeof referralCode === 'string' && referralCode.trim()) {
      const cleanCode = referralCode.trim().toUpperCase();

      const referralCodeResult = await query(
        `SELECT rc.user_id, rc.is_active
         FROM referral_codes rc
         WHERE rc.code = $1`,
        [cleanCode]
      );

      if (referralCodeResult.rows.length > 0) {
        const referralData = referralCodeResult.rows[0];

        if (referralData.is_active) {
          referrerId = referralData.user_id;
          validatedReferralCode = cleanCode;
          referralDiscountPercent = getReferredDiscountPercent();
        }
      }
    }

    /* Hash password. */
    const hashedPassword = await bcrypt.hash(password, 12);

    /* Create user. */
    const result = await query(
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
     * Legacy referrals record — kept for audit trail only.
     * The active commission system runs on referral_tree + affiliate_commissions.
     */
    if (referrerId && validatedReferralCode) {
      await query(
        `INSERT INTO referral_earnings (user_id, current_tier)
         VALUES ($1, 'bronze')
         ON CONFLICT (user_id) DO NOTHING`,
        [referrerId]
      );

      await query(
        `INSERT INTO referrals (referrer_id, referred_user_id, referral_code, status, discount_percent)
         VALUES ($1, $2, $3, 'registered', $4)`,
        [referrerId, user.id, validatedReferralCode, referralDiscountPercent]
      );

      await query(
        `UPDATE referral_earnings
         SET total_referrals = total_referrals + 1,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [referrerId]
      );

      /*
       * Build the MLM referral tree via the shared module. Best-effort —
       * a failure here must not prevent registration.
       */
      try {
        await sharedMlm.buildReferralTree(mlmDb, referralsConfig, user.id, referrerId);
      } catch (treeError) {
        console.error('Referral tree build failed during registration:', {
          userId: user.id,
          referralCode: validatedReferralCode,
          error: treeError.message,
        });
      }
    } else {
      /*
       * Even without a referrer, ensure the user has a wallet so
       * commission and bonus distribution never hits a missing row.
       */
      try {
        await query(
          `INSERT INTO affiliate_wallets (user_id) VALUES ($1)
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id]
        );
      } catch (walletError) {
        console.error('Wallet creation failed during registration:', {
          userId: user.id,
          error: walletError.message,
        });
      }
    }

    /* Issue JWT. */
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
        referral: validatedReferralCode
          ? {
              code: validatedReferralCode,
              discountPercent: referralDiscountPercent,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed.' });
  }
}