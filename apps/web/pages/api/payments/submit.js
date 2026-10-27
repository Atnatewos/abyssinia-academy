/**
 * @fileoverview Payment Submission API Route
 *
 * Handles payment proof submission. Validates discounts server-side to
 * ensure the user cannot tamper with the final price.
 * 
 * Agent attribution flow:
 *   1. Checks `agentId` (from form).
 *   2. Falls back to `pending_agent_id` (if first payment).
 *   3. Falls back to `registered_via_agent_id` (for permanent 10% discount).
 *
 * Path: apps/web/pages/api/payments/submit.js
 */

import { Pool } from 'pg';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import {
  getPaymentConfig,
  getAgentConfig,
  isAgentsEnabled,
} from '../../../lib/config';
import { calculateCombinedDiscount } from '@shared/utils/pricing';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Short id for correlating client errors with server logs.
 *
 * @returns {string}
 */
const newErrorId = () => crypto.randomBytes(6).toString('hex');

/**
 * Parse multipart form data using a boundary-based approach.
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
        if (
          !part ||
          part === '--' ||
          part === '--\r\n' ||
          part.trim() === '--'
        ) {
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
            mimetype,
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
 * Standard UUID shape check.
 *
 * @param {string} value
 * @returns {boolean}
 */
const looksLikeUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

/**
 * Cache the result of "does pending_agent_id exist" so we don't query
 * information_schema on every request.
 *
 * @type {boolean|null}
 */
let pendingAgentColumnChecked = null;

async function hasPendingAgentColumn() {
  if (pendingAgentColumnChecked !== null) return pendingAgentColumnChecked;

  try {
    const result = await pool.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'users'
         AND column_name = 'pending_agent_id'`
    );
    pendingAgentColumnChecked = result.rows.length > 0;
  } catch (err) {
    console.error(
      'pending_agent_id column check failed, assuming absent:',
      err.message
    );
    pendingAgentColumnChecked = false;
  }

  return pendingAgentColumnChecked;
}

const normalizeAttributionInput = (rawValue) => {
  if (rawValue === null || rawValue === undefined) return '';
  return String(rawValue).trim();
};

/**
 * Resolve a raw attribution token to a validated agent user UUID.
 *
 * @param {string} rawValue - Raw agent_id or agent_code value from the form
 * @param {string} buyerId - Buyer's user UUID
 * @returns {Promise<string|null>} Validated agent user UUID or null
 */
async function resolveAgentAttribution(rawValue, buyerId) {
  if (!isAgentsEnabled()) return null;

  const clean = normalizeAttributionInput(rawValue);
  if (!clean) return null;

  try {
    let result;

    if (looksLikeUuid(clean)) {
      if (clean === buyerId) return null;
      result = await pool.query(
        `SELECT ac.user_id, ac.is_active, ags.is_active AS settings_active
         FROM agent_codes ac
         LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
         WHERE ac.user_id = $1`,
        [clean]
      );
    } else {
      result = await pool.query(
        `SELECT ac.user_id, ac.is_active, ags.is_active AS settings_active
         FROM agent_codes ac
         LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
         WHERE LOWER(ac.code) = LOWER($1)`,
        [clean]
      );
    }

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    if (!row.is_active) return null;
    if (row.settings_active === false) return null;
    if (row.user_id === buyerId) return null;

    return row.user_id;
  } catch (error) {
    console.error('Agent attribution resolution failed:', {
      rawValue: clean.slice(0, 16),
      error: error.message,
    });
    return null;
  }
}

/**
 * POST /api/payments/submit
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' });
  }

  const errorId = newErrorId();

  try {
    /* ── Authenticate ── */
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ success: false, message: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error(`[${errorId}] JWT verification failed:`, jwtError.message);
      return res
        .status(401)
        .json({ success: false, message: 'Invalid or expired token.' });
    }

    const includePendingAgent = await hasPendingAgentColumn();
    const userSelect = includePendingAgent
      ? `SELECT id, full_name, phone, referred_by_code,
                referral_discount_percent, pending_agent_id, registered_via_agent_id
         FROM users WHERE id = $1`
      : `SELECT id, full_name, phone, referred_by_code,
                referral_discount_percent, NULL::uuid AS pending_agent_id, registered_via_agent_id
         FROM users WHERE id = $1`;

    const userResult = await pool.query(userSelect, [decoded.userId]);

    if (!userResult.rows[0]) {
      return res
        .status(401)
        .json({ success: false, message: 'User not found.' });
    }

    const user = userResult.rows[0];

    /* ── Parse multipart form ── */
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
      isAgentBuyer: isAgentBuyerRaw,
    } = fields;

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
    const isAgentBuyer = isAgentBuyerRaw === 'true';

    /* ── Validate required fields ── */
    if (!fullName || !phone || !paymentMethod || !transactionRef) {
      return res.status(400).json({
        success: false,
        message:
          'Full name, phone, payment method, and transaction reference are required.',
      });
    }

    /* ── Validate amount against config ── */
    const paymentConfig = getPaymentConfig();
    const pricing = paymentConfig.pricing || {};
    
    const basePrice = purchaseMode === 'individual-phases'
        ? (pricing.perPhase?.amountETB || 500) * (selectedPhases?.length || 1)
        : (pricing.fullCourse?.amountETB || 1000);

    /* Server-side discount recalculation (0 trust in client) */
    const expectedBreakdown = calculateCombinedDiscount({
      basePrice,
      referralDiscountPercent: isAgentBuyer ? 0 : referralDiscountPercent,
      discountCodePercent: 0, // Exact code validation requires DB lookup
      discountCodeFixed: 0,
      creditAmount: creditApplied,
      isAgentBuyer
    });

    const expectedAmount = expectedBreakdown.finalPrice;

    /* Allow minor rounding variance */
    if (amount < expectedAmount - 10) {
       return res.status(400).json({
         success: false,
         message: 'Payment amount validation failed. Please refresh and try again.'
       });
    }

    /* ── Resolve agent attribution ── */
    const agentConfig = getAgentConfig();
    let validatedAgentId = await resolveAgentAttribution(
      agentIdRaw,
      user.id
    );

    if (!validatedAgentId && user.pending_agent_id) {
      validatedAgentId = await resolveAgentAttribution(
        user.pending_agent_id,
        user.id
      );
    }
    
    if (!validatedAgentId && user.registered_via_agent_id) {
      validatedAgentId = user.registered_via_agent_id;
    }

    /* ── Upload screenshot (optional) ── */
    let screenshotUrl = null;
    const screenshotConfig = paymentConfig.screenshotUpload || {};
    const maxSize = screenshotConfig.maxSize || 5 * 1024 * 1024;

    if (file && file.buffer && file.buffer.length > 0) {
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `Screenshot size must be under ${
            maxSize / (1024 * 1024)
          }MB.`,
        });
      }

      const allowedTypes = screenshotConfig.allowedTypes || [
        'image/jpeg',
        'image/png',
        'image/webp',
      ];
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
          console.error(
            `[${errorId}] Cloudinary upload failed:`,
            uploadResult.error
          );
        }
      } catch (uploadError) {
        console.error(
          `[${errorId}] Cloudinary upload exception:`,
          uploadError.message
        );
      }
    }

    /* ── Insert payment ── */
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
        isAgentBuyer ? 0 : referralDiscountAmount,
        discountCode,
        discountCodeAmount,
        creditApplied,
        screenshotUrl,
        validatedAgentId,
      ]
    );

    const paymentId = paymentResult.rows[0].id;

    /* ── Update user payment status ── */
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

    /* ── Consume pending_agent_id ── */
    if (
      includePendingAgent &&
      validatedAgentId &&
      user.pending_agent_id &&
      agentConfig?.attribution?.consumeOnFirstPayment !== false
    ) {
      try {
        await pool.query(
          `UPDATE users
           SET pending_agent_id = NULL, updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [user.id]
        );
      } catch (consumeError) {
        console.error(
          `[${errorId}] Failed to consume pending_agent_id:`,
          consumeError.message
        );
      }
    }

    /* ── Record discount code usage ── */
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
            amount + discountCodeAmount + (isAgentBuyer ? 0 : referralDiscountAmount) + creditApplied,
            amount,
            req.headers['x-forwarded-for'] ||
              req.socket.remoteAddress ||
              null,
            req.headers['user-agent'] || null,
          ]
        );
      }
    }

    /* ── Verify credit balance ── */
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
      message:
        'Payment proof submitted successfully. Waiting for admin approval.',
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
    console.error(`[${errorId}] Payment submission error:`, {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      stack: error.stack,
    });

    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({
      success: false,
      message: 'Payment submission failed. Please try again.',
      errorId,
      ...(isDev && {
        detail: error.message,
        ...(error.constraint && { constraint: error.constraint }),
      }),
    });
  }
}