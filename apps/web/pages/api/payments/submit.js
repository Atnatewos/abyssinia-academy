/**
 * @fileoverview Payment Submission API Route
 * Handles payment proof submission with Cloudinary screenshot upload.
 * Path: apps/web/pages/api/payments/submit.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { getReferralTierByCount, getCreditCapConfig, getCommissionConfig } from '../../../lib/config';
import { uploadToCloudinary } from '../../../lib/cloudinary';

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
 * Parse multipart form data using a simple boundary-based approach.
 * Works directly with Buffers to preserve binary file data.
 */
async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const fullBuffer = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';

      console.log('📦 Content-Type:', contentType);
      console.log('📦 Buffer size:', fullBuffer.length, 'bytes');

      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      const boundary = boundaryMatch ? boundaryMatch[1].trim() : null;

      console.log('📦 Boundary:', boundary);

      if (!boundary) {
        console.log('❌ No boundary found — treating as regular form data');
        /*
         * If there's no boundary, it might be JSON or URL-encoded
         */
        try {
          const text = fullBuffer.toString();
          const parsed = JSON.parse(text);
          resolve({ fields: parsed, file: null });
        } catch {
          resolve({ fields: {}, file: null });
        }
        return;
      }

      const fields = {};
      let file = null;

      /*
       * Convert the buffer to string for header parsing,
       * but keep binary sections for file content
       */
      const fullText = fullBuffer.toString('binary');

      /*
       * Split by the boundary string
       */
      const boundaryDelimiter = `--${boundary}`;
      const parts = fullText.split(boundaryDelimiter);

      console.log(`📦 Found ${parts.length} parts`);

      for (const part of parts) {
        /*
         * Skip empty parts and the final '--'
         */
        if (!part || part === '--' || part === '--\r\n' || part.trim() === '--') {
          continue;
        }

        /*
         * Remove leading \r\n
         */
        const cleanPart = part.replace(/^\r\n/, '').replace(/\r\n$/, '');

        if (!cleanPart || cleanPart.length < 10) continue;

        /*
         * Find the header/body separator
         */
        const headerBodySeparator = cleanPart.indexOf('\r\n\r\n');

        if (headerBodySeparator === -1) continue;

        const headerSection = cleanPart.substring(0, headerBodySeparator);
        const bodySection = cleanPart.substring(headerBodySeparator + 4);

        /*
         * Parse headers
         */
        const nameMatch = headerSection.match(/name="([^"]+)"/);
        const filenameMatch = headerSection.match(/filename="([^"]+)"/);

        if (!nameMatch) continue;

        const fieldName = nameMatch[1];

        if (filenameMatch) {
          /*
           * This is a file field
           */
          const filename = filenameMatch[1];

          console.log(`📎 Found file: field="${fieldName}", filename="${filename}", body length=${bodySection.length}`);

          /*
           * Convert the binary string back to a Buffer
           */
          const fileBuffer = Buffer.from(bodySection, 'binary');

          /*
           * Determine MIME type
           */
          let mimetype = 'image/jpeg';
          if (filename.endsWith('.png')) mimetype = 'image/png';
          else if (filename.endsWith('.webp')) mimetype = 'image/webp';
          else if (filename.endsWith('.gif')) mimetype = 'image/gif';

          file = {
            fieldname: fieldName,
            originalname: filename,
            buffer: fileBuffer,
            mimetype: mimetype,
            size: fileBuffer.length,
          };

          console.log(`📎 File buffer size: ${fileBuffer.length} bytes`);
        } else {
          /*
           * This is a regular text field
           */
          const value = bodySection.replace(/\r\n$/, '').trim();
          fields[fieldName] = value;
          console.log(`📝 Field: ${fieldName} = "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`);
        }
      }

      if (file) {
        console.log(`✅ Parsed file: ${file.originalname} (${file.size} bytes, ${file.mimetype})`);
      } else {
        console.log('⚠️ No file found in the request');
      }

      console.log(`📝 Parsed ${Object.keys(fields).length} text fields`);

      resolve({ fields, file });
    });

    req.on('error', (err) => {
      console.error('❌ Request error:', err.message);
      reject(err);
    });
  });
}

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {

    /*
     * Authenticate the user via JWT
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
     * Parse the multipart form data
     */
    const { fields, file } = await parseFormData(req);

    console.log('📋 Fields received:', JSON.stringify(fields, null, 2));
    console.log('📎 File received:', file ? `${file.originalname} (${file.size} bytes)` : 'NONE');

    const {
      fullName,
      phone,
      paymentMethod,
      transactionRef,
      purchaseMode = 'full-course',
      selectedPhases: selectedPhasesRaw,
      amount: amountRaw,
      referralDiscountPercent: referralDiscountPercentRaw,
      referralDiscountAmount: referralDiscountAmountRaw,
      discountCode: discountCodeRaw,
      discountCodeAmount: discountCodeAmountRaw,
      creditApplied: creditAppliedRaw,
    } = fields;

    /*
     * Parse selected phases
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
     * Upload screenshot to Cloudinary if a file was provided
     */
    let screenshotUrl = null;

    if (file && file.buffer && file.buffer.length > 0) {
      console.log(`☁️ Uploading file to Cloudinary: ${file.originalname} (${file.size} bytes)`);

      try {
        const uploadResult = await uploadToCloudinary(file.buffer, {
          folder: 'abyssinia-academy/payments',
          resourceType: 'image',
        });

        console.log('☁️ Cloudinary result:', JSON.stringify(uploadResult, null, 2));

        if (uploadResult.success) {
          screenshotUrl = uploadResult.url;
          console.log('✅ Screenshot uploaded:', screenshotUrl);
        } else {
          console.error('❌ Cloudinary upload failed:', uploadResult.error);
        }
      } catch (uploadError) {
        console.error('❌ Cloudinary upload exception:', uploadError.message);
        console.error('❌ Stack:', uploadError.stack);
      }
    } else {
      console.log('⚠️ No file to upload (file is null or empty)');
    }

    /*
     * Create the payment record with screenshot URL
     */
    /*
     * Create the payment record with screenshot URL
     * Stores purchase_mode and selected_phases so the admin approval
     * endpoint knows exactly what the student purchased — no assumptions.
     */
    const paymentResult = await pool.query(
      `INSERT INTO payments (
         user_id, amount, method, status, reference,
         purchase_mode, selected_phases,
         referral_discount_amount, discount_code_used, discount_code_amount,
         credit_applied, transaction_id, created_at
       )
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
       RETURNING id`,
      [
        user.id,
        amount,
        paymentMethod,
        transactionRef,
        purchaseMode,
        selectedPhases,
        referralDiscountAmount,
        discountCode,
        discountCodeAmount,
        creditApplied,
        screenshotUrl,
      ]
    );

    const paymentId = paymentResult.rows[0].id;
    console.log('💾 Payment record created:', paymentId, 'screenshotUrl:', screenshotUrl);

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
     * Process referral
     */
    if (user.referred_by_code) {

      const referralResult = await pool.query(
        `SELECT id, referrer_id FROM referrals
         WHERE referred_user_id = $1 AND status = 'registered'
         ORDER BY created_at DESC LIMIT 1`,
        [user.id]
      );

      if (referralResult.rows.length > 0) {
        const referral = referralResult.rows[0];

        await pool.query(
          `UPDATE referrals
           SET status = 'completed',
               discount_amount = $1,
               completed_at = CURRENT_TIMESTAMP,
               payment_id = $2
           WHERE id = $3`,
          [referralDiscountAmount, paymentId, referral.id]
        );

        const earningsResult = await pool.query(
          `SELECT successful_referrals FROM referral_earnings WHERE user_id = $1`,
          [referral.referrer_id]
        );

        const successfulReferrals = parseInt(earningsResult.rows[0]?.successful_referrals || 0, 10);
        const currentTier = getReferralTierByCount(successfulReferrals);
        const creditCapConfig = getCreditCapConfig();
        const commissionConfig = getCommissionConfig();

        const referrerCoursePrice = 2499;
        const creditEarned = Math.round(referrerCoursePrice * (currentTier.creditPercent / 100));

        const currentAvailableCredit = parseFloat(
          (await pool.query(
            'SELECT available_credit FROM referral_earnings WHERE user_id = $1',
            [referral.referrer_id]
          )).rows[0]?.available_credit || 0
        );

        const creditCapAmount = Math.round(referrerCoursePrice * (creditCapConfig.maxPercent / 100));

        let creditToAdd = creditEarned;
        let commissionEarned = 0;

        if (currentAvailableCredit + creditEarned > creditCapAmount) {
          const creditSpace = Math.max(0, creditCapAmount - currentAvailableCredit);
          creditToAdd = creditSpace;
          if (creditCapConfig.behavior === 'commission' && commissionConfig.enabled) {
            commissionEarned = Math.round((creditEarned - creditSpace) * (commissionConfig.percentOfPayment / 100));
          }
        }

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

        await pool.query(
          `UPDATE referrals
           SET referrer_credit_percent = $1, referrer_credit_amount = $2, commission_earned = $3
           WHERE id = $4`,
          [currentTier.creditPercent, creditToAdd, commissionEarned, referral.id]
        );
      }
    }

    /*
     * Process discount code
     */
    if (discountCode && discountCodeAmount > 0) {
      const discountCodeResult = await pool.query(
        `SELECT id FROM discount_codes WHERE code = $1 AND is_deleted = false`,
        [discountCode]
      );
      if (discountCodeResult.rows.length > 0) {
        const dcId = discountCodeResult.rows[0].id;
        await pool.query(`UPDATE discount_codes SET current_total_uses = current_total_uses + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [dcId]);
        await pool.query(
          `INSERT INTO discount_code_usage (discount_code_id, user_id, payment_id, discount_amount, original_amount, final_amount, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [dcId, user.id, paymentId, discountCodeAmount, amount + discountCodeAmount + referralDiscountAmount + creditApplied, amount, req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, req.headers['user-agent'] || null]
        );
      }
    }

    /*
     * Deduct credit
     */
    if (creditApplied > 0 && user.referred_by_code) {
      const referrerResult = await pool.query(
        `SELECT referrer_id FROM referrals WHERE referred_user_id = $1 AND status = 'completed' ORDER BY completed_at DESC LIMIT 1`,
        [user.id]
      );
      if (referrerResult.rows.length > 0) {
        await pool.query(
          `UPDATE referral_earnings SET available_credit = GREATEST(0, available_credit - $1), total_credit_used = total_credit_used + $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
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
        screenshotUrl,
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