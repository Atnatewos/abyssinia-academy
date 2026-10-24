/**
 * @fileoverview Payment Submission API Route
 *
 * Handles payment proof submission with Cloudinary screenshot upload.
 * MLM commission distribution happens on admin approval, not here.
 * This route only records the payment, discount metadata, and agent
 * attribution.
 *
 * Agent attribution (Money Model v2.5):
 *   When the buyer enters a valid agent code at checkout, `agentId` is
 *   passed in the form data. We validate that the agent exists, is
 *   active, and is not the buyer themselves, then store the agent_id on
 *   the payment so the approval endpoint can fire the agent commission.
 *
 *   Agent code overrides MLM: if agentId is stored, the approval flow
 *   skips the MLM tree entirely.
 *
 * Path: apps/web/pages/api/payments/submit.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { getPaymentConfig, isAgentsEnabled } from '../../../lib/config';

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
 * Parse multipart form data using a boundary-based approach.
 * Preserves binary file data so Cloudinary uploads remain intact.
 *
 * @param {object} req - Next.js request
 * @returns {Promise<{fields: object, file: object|null}>}
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

      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      const boundary = boundaryMatch ? boundaryMatch[1].trim() : null;

      if (!boundary) {
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

      const fullText = fullBuffer.toString('binary');
      const boundaryDelimiter = `--${boundary}`;
      const parts = fullText.split(boundaryDelimiter);

      for (const part of parts) {
        if (!part || part === '--' || part === '--\r\n' || part.trim() === '--') {
          continue;
        }

        const cleanPart = part.replace(/^\r\n/, '').replace(/\r\n$/, '');
        if (!cleanPart || cleanPart.length < 10) continue;

        const headerBodySeparator = cleanPart.indexOf('\r\n\r\n');
        if (headerBodySeparator === -1) continue;

        const headerSection = cleanPart.substring(0, headerBodySeparator);
        const bodySection = cleanPart.substring(headerBodySeparator + 4);

        const nameMatch = headerSection.match(/name="([^"]+)"/);
        const filenameMatch = headerSection.match(/filename="([^"]+)"/);

        if (!nameMatch) continue;

        const fieldName = nameMatch[1];

        if (filenameMatch) {
          const filename = filenameMatch[1];
          const fileBuffer = Buffer.from(bodySection, 'binary');

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
        } else {
          const value = bodySection.replace(/\r\n$/, '').trim();
          fields[fieldName] = value;
        }
      }

      resolve({ fields, file });
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Validate an agent UUID against the agent_codes table.
 * Returns the agent's user ID if valid & active & not self, else null.
 *
 * @param {string} rawAgentId - Raw agent_id string from form
 * @param {string} buyerId - Buyer's user ID
 * @returns {Promise<string|null>} Validated agent user ID or null
 */
async function resolveAgentId(rawAgentId, buyerId) {
  if (!isAgentsEnabled()) return null;
  if (!rawAgentId || typeof rawAgentId !== 'string') return null;

  const cleanId = rawAgentId.trim();
  if (!cleanId) return null;

  /* Loose UUID shape check — full validation still happens via SQL */
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)) {
    return null;
  }

  /* Self-referral guard */
  if (cleanId === buyerId) return null;

  try {
    const result = await pool.query(
      `SELECT ac.user_id, ac.is_active, ags.is_active AS settings_active
       FROM agent_codes ac
       LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
       WHERE ac.user_id = $1`,
      [cleanId]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    if (!row.is_active) return null;
    if (row.settings_active === false) return null;

    return row.user_id;
  } catch (error) {
    console.error('Agent ID validation failed:', {
      agentId: cleanId,
      error: error.message,
    });
    return null;
  }
}

/**
 * POST /api/payments/submit
 * Submit payment proof for admin review.
 *
 * This endpoint does NOT distribute MLM or agent commissions. It stores:
 *   - The payment record (with purchase_mode, selected_phases, discounts)
 *   - The agent attribution (agent_id) when a valid agent code was used
 *   - The user's payment_status = 'pending'
 *   - The discount code usage record (if a code was applied)
 *
 * Commission distribution happens in:
 *   - /api/admin/payments/[id]/approve.js  (MLM + agent)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    /* Authenticate the user. */
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userResult = await pool.query(
      `SELECT id, full_name, phone, referred_by_code, referral_discount_percent
       FROM users WHERE id = $1`,
      [decoded.userId]
    );

    if (!userResult.rows[0]) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    const user = userResult.rows[0];

    /* Parse the multipart form data. */
    const { fields, file } = await parseFormData(req);

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
      agentId: agentIdRaw,
    } = fields;

    /* Parse selected phases for individual-phases purchases. */
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

    /* Validate required fields. */
    if (!fullName || !phone || !paymentMethod || !transactionRef) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone, payment method, and transaction reference are required.',
      });
    }

    /* Validate amount against config. */
    const paymentConfig = getPaymentConfig();
    const pricing = paymentConfig.pricing || {};
    const minAmount = purchaseMode === 'individual-phases'
      ? (pricing.perPhase?.amountETB || 500)
      : (pricing.fullCourse?.amountETB || 1000);

    if (amount < minAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount must be at least ${minAmount} ETB.`,
      });
    }

    /*
     * Validate the agent attribution. Returns null if:
     *   - Agent feature disabled
     *   - Agent ID malformed / nonexistent
     *   - Agent inactive
     *   - Self-attribution attempted
     */
    const validatedAgentId = await resolveAgentId(agentIdRaw, user.id);

    /*
     * Upload screenshot to Cloudinary if provided.
     */
    let screenshotUrl = null;
    const screenshotConfig = paymentConfig.screenshotUpload || {};
    const maxSize = screenshotConfig.maxSize || 5 * 1024 * 1024;

    if (file && file.buffer && file.buffer.length > 0) {
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `Screenshot size must be under ${maxSize / (1024 * 1024)}MB.`,
        });
      }

      const allowedTypes = screenshotConfig.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Only JPEG, PNG, and WebP images are allowed.',
        });
      }

      try {
        const uploadResult = await uploadToCloudinary(file.buffer, {
          folder: 'abyssinia-academy/payments',
          resourceType: 'image',
        });

        if (uploadResult.success) {
          screenshotUrl = uploadResult.url;
        } else {
          console.error('Cloudinary upload failed:', uploadResult.error);
        }
      } catch (uploadError) {
        console.error('Cloudinary upload exception:', uploadError.message);
      }
    }

    /*
     * Create the payment record.
     * Stores purchase metadata + discount breakdown + agent attribution.
     */
    const paymentResult = await pool.query(
      `INSERT INTO payments (
         user_id, amount, method, status, reference,
         purchase_mode, selected_phases,
         referral_discount_amount, discount_code_used, discount_code_amount,
         credit_applied, transaction_id, agent_id, created_at
       )
       VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
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
        validatedAgentId,
      ]
    );

    const paymentId = paymentResult.rows[0].id;

    /* Update user payment status to pending. */
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
     * Record discount code usage so the code's counter and usage log
     * stay in sync. Eligibility was already validated client-side.
     */
    if (discountCode && discountCodeAmount > 0) {
      const discountCodeResult = await pool.query(
        `SELECT id FROM discount_codes WHERE code = $1 AND is_deleted = false`,
        [discountCode]
      );

      if (discountCodeResult.rows.length > 0) {
        const dcId = discountCodeResult.rows[0].id;

        await pool.query(
          `UPDATE discount_codes
           SET current_total_uses = current_total_uses + 1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [dcId]
        );

        await pool.query(
          `INSERT INTO discount_code_usage
             (discount_code_id, user_id, payment_id, discount_amount,
              original_amount, final_amount, ip_address, user_agent)
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
     * Credit balance check — if the student applied MLM bonus credits
     * toward this purchase, verify they have enough, then record a
     * negative "redemption" bonus row to keep the ledger append-only.
     */
    if (creditApplied > 0) {
      const bonusSumResult = await pool.query(
        `SELECT COALESCE(SUM(amount), 0)::numeric AS total
         FROM referral_bonuses WHERE user_id = $1`,
        [user.id]
      );

      const creditUsedResult = await pool.query(
        `SELECT COALESCE(SUM(credit_applied), 0)::numeric AS total
         FROM payments
         WHERE user_id = $1 AND status IN ('pending', 'approved')`,
        [user.id]
      );

      const earned = parseFloat(bonusSumResult.rows[0].total);
      const alreadyUsed = parseFloat(creditUsedResult.rows[0].total);
      const availableCredit = earned - alreadyUsed;

      if (creditApplied > availableCredit) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient credit balance.',
        });
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
        discountCodeApplied: Boolean(discountCode),
        creditApplied: creditApplied > 0,
        agentAttributed: Boolean(validatedAgentId),
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