/**
 * @fileoverview Payment Submission API Route
 * Handles payment proof submission with full support for:
 * - Full course and individual phase purchases
 * - Referral code processing (credit earning, tier updates)
 * - Discount code validation and usage tracking
 * - Credit application from referral earnings
 * Path: apps/web/pages/api/payments/submit.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { getReferralTierByCount, getCreditCapConfig, getCommissionConfig } from '../../../lib/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Parse multipart form data
 */
async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      const boundary = contentType.split('boundary=')[1];

      if (!boundary) {
        resolve({ fields: {}, file: null });
        return;
      }

      const parts = buffer.toString().split(`--${boundary}`);
      const fields = {};
      let file = null;

      for (const part of parts) {
        if (part.includes('Content-Disposition') && part.includes('name=')) {
          const nameMatch = part.match(/name="([^"]+)"/);
          const filenameMatch = part.match(/filename="([^"]+)"/);

          if (nameMatch) {
            const name = nameMatch[1];
            const valueStart = part.indexOf('\r\n\r\n');
            if (valueStart !== -1) {
              let value = part.substring(valueStart + 4);
              value = value.replace(/\r\n$/, '').trim();

              if (filenameMatch) {
                file = {
                  fieldname: name,
                  originalname: filenameMatch[1],
                  buffer: Buffer.from(value, 'binary'),
                };
              } else {
                fields[name] = value;
              }
            }
          }
        }
      }

      resolve({ fields, file });
    });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {

    /*
     * Authenticate
     */
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await pool.query(
      'SELECT id, full_name, phone, referred_by_code, referral_discount_percent FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (!userResult.rows[0]) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const user = userResult.rows[0];

    /*
     * Parse multipart form data
     */
    const { fields, file } = await parseFormData(req);

    const {
      fullName,
      phone,
      paymentMethod,
      transactionRef,
      purchaseMode = 'full-course',
      selectedPhases: selectedPhasesRaw,
      amount: amountRaw,
      referralCode: referralCodeRaw,
      referralDiscountPercent: referralDiscountPercentRaw,
      referralDiscountAmount: referralDiscountAmountRaw,
      discountCode: discountCodeRaw,
      discountCodeAmount: discountCodeAmountRaw,
      creditApplied: creditAppliedRaw,
    } = fields;

    /*
     * Parse values
     */
    let selectedPhases = null;
    if (purchaseMode === 'individual-phases' && selectedPhasesRaw) {
      try {
        selectedPhases = JSON.parse(selectedPhasesRaw);
      } catch {
        selectedPhases = selectedPhasesRaw.split(',').map((s) => s.trim());
      }
    }

    const amount = parseInt(amountRaw, 10) || 0;
    const referralDiscountPercent = parseFloat(referralDiscountPercentRaw) || 0;
    const referralDiscountAmount = parseInt(referralDiscountAmountRaw, 10) || 0;
    const discountCode = discountCodeRaw?.trim().toUpperCase() || null;
    const discountCodeAmount = parseInt(discountCodeAmountRaw, 10) || 0;
    const creditApplied = parseInt(creditAppliedRaw, 10) || 0;

    /*
     * Validate required fields
     */
    if (!fullName || !phone || !paymentMethod || !transactionRef) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone, payment method, and transaction reference are required.',
      });
    }

    /*
     * Create payment record
     */
    const paymentResult = await pool.query(
      `INSERT INTO payments (
         user_id, amount, method, status, reference,
         referral_discount_amount, discount_code_used, discount_code_amount,
         credit_applied, created_at
       )
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       RETURNING id`,
      [
        user.id,
        amount,
        paymentMethod,
        transactionRef,
        referralDiscountAmount,
        discountCode,
        discountCodeAmount,
        creditApplied,
      ]
    );

    const paymentId = paymentResult.rows[0].id;

    /*
     * Update user payment status
     */
    await pool.query(
      `UPDATE users
       SET payment_method = $1,
           payment_status = 'pending',
           payment_amount = $2,
           payment_ref = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [paymentMethod, amount, transactionRef, user.id]
    );

    /*
     * Process referral — if this user was referred, update the referral record
     */
    if (user.referred_by_code) {

      /*
       * Find the pending referral record
       */
      const referralResult = await pool.query(
        `SELECT id, referrer_id FROM referrals
         WHERE referred_user_id = $1 AND status = 'registered'
         ORDER BY created_at DESC LIMIT 1`,
        [user.id]
      );

      if (referralResult.rows.length > 0) {
        const referral = referralResult.rows[0];

        /*
         * Update the referral record
         */
        await pool.query(
          `UPDATE referrals
           SET status = 'completed',
               discount_amount = $1,
               completed_at = CURRENT_TIMESTAMP,
               payment_id = $2
           WHERE id = $3`,
          [referralDiscountAmount, paymentId, referral.id]
        );

        /*
         * Calculate referrer rewards
         */
        const earningsResult = await pool.query(
          `SELECT successful_referrals FROM referral_earnings WHERE user_id = $1`,
          [referral.referrer_id]
        );

        const successfulReferrals = parseInt(
          earningsResult.rows[0]?.successful_referrals || 0,
          10
        );

        const currentTier = getReferralTierByCount(successfulReferrals);
        const creditCapConfig = getCreditCapConfig();
        const commissionConfig = getCommissionConfig();

        /*
         * Calculate credit amount for this referral
         */
        const referrerCoursePrice = 2499; // Full course price for credit calculation
        const creditEarned = Math.round(
          referrerCoursePrice * (currentTier.creditPercent / 100)
        );

        /*
         * Check credit cap
         */
        const currentAvailableCredit = parseFloat(
          (await pool.query(
            'SELECT available_credit FROM referral_earnings WHERE user_id = $1',
            [referral.referrer_id]
          )).rows[0]?.available_credit || 0
        );

        const creditCapAmount = Math.round(
          referrerCoursePrice * (creditCapConfig.maxPercent / 100)
        );

        let creditToAdd = creditEarned;
        let commissionEarned = 0;

        if (currentAvailableCredit + creditEarned > creditCapAmount) {
          const creditSpace = Math.max(0, creditCapAmount - currentAvailableCredit);
          creditToAdd = creditSpace;

          if (creditCapConfig.behavior === 'commission' && commissionConfig.enabled) {
            const excessValue = creditEarned - creditSpace;
            commissionEarned = Math.round(
              excessValue * (commissionConfig.percentOfPayment / 100)
            );
          }
        }

        /*
         * Update referrer earnings
         */
        await pool.query(
          `UPDATE referral_earnings
           SET total_credit_earned = total_credit_earned + $1,
               available_credit = available_credit + $1,
               total_commission_earned = total_commission_earned + $2,
               pending_commission = pending_commission + $2,
               successful_referrals = successful_referrals + 1,
               current_tier = $3,
               tier_updated_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $4`,
          [creditToAdd, commissionEarned, currentTier.name, referral.referrer_id]
        );

        /*
         * Update the referral record with credit/commission amounts
         */
        await pool.query(
          `UPDATE referrals
           SET referrer_credit_percent = $1,
               referrer_credit_amount = $2,
               commission_earned = $3
           WHERE id = $4`,
          [currentTier.creditPercent, creditToAdd, commissionEarned, referral.id]
        );
      }
    }

    /*
     * Process discount code — record usage
     */
    if (discountCode && discountCodeAmount > 0) {

      const discountCodeResult = await pool.query(
        `SELECT id FROM discount_codes WHERE code = $1 AND is_deleted = false`,
        [discountCode]
      );

      if (discountCodeResult.rows.length > 0) {
        const dcId = discountCodeResult.rows[0].id;

        /*
         * Increment usage count
         */
        await pool.query(
          `UPDATE discount_codes
           SET current_total_uses = current_total_uses + 1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [dcId]
        );

        /*
         * Record usage
         */
        await pool.query(
          `INSERT INTO discount_code_usage (
             discount_code_id, user_id, payment_id,
             discount_amount, original_amount, final_amount,
             ip_address, user_agent
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            dcId,
            user.id,
            paymentId,
            discountCodeAmount,
            amount + discountCodeAmount + referralDiscountAmount + creditApplied,
            amount,
            req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
            req.headers['user-agent'] || null,
          ]
        );
      }
    }

    /*
     * Deduct credit from referrer's balance if credit was applied
     */
    if (creditApplied > 0 && user.referred_by_code) {
      /*
       * Find the user who referred this user
       */
      const referrerResult = await pool.query(
        `SELECT referrer_id FROM referrals
         WHERE referred_user_id = $1 AND status = 'completed'
         ORDER BY completed_at DESC LIMIT 1`,
        [user.id]
      );

      if (referrerResult.rows.length > 0) {
        /*
         * This user is using their own credit — deduct from their earnings
         */
        await pool.query(
          `UPDATE referral_earnings
           SET available_credit = GREATEST(0, available_credit - $1),
               total_credit_used = total_credit_used + $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE user_id = $2`,
          [creditApplied, user.id]
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Payment proof submitted successfully. Waiting for admin approval.',
      data: {
        paymentId,
        status: 'pending',
        purchaseMode,
        selectedPhases,
        referralProcessed: !!user.referred_by_code,
        discountCodeApplied: !!discountCode,
        creditApplied: creditApplied > 0,
      },
    });

  } catch (error) {
    console.error('Payment submission error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Payment submission failed. Please try again.',
    });
  }
}