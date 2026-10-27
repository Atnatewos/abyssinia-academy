/**
 * @fileoverview Register API Route
 *
 * Serverless function for user registration with referral + agent
 * attribution support. After creating the user, builds the MLM referral
 * tree via the shared module and provisions a personal agent code so the
 * student can start earning on their own sales.
 *
 * Agent attribution flow:
 *   1. If the payload contains an `agentCode`, we resolve it to the agent's
 *      UUID and store it on BOTH `users.pending_agent_id` (consumed later)
 *      AND `users.registered_via_agent_id` (permanent record for discounts).
 *   2. Agent provisioning (code + settings) is always attempted so every
 *      student can become an agent themselves.
 *
 * Path: apps/web/pages/api/auth/register.js
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool, query } from '../../../lib/db';
import {
  getReferredDiscountPercent,
  isAgentsEnabled,
  getAgentDefaultCommission,
  getAgentCodeGeneration,
} from '../../../lib/config';
import sharedMlm from '@shared/mlm';
import referralsConfig from '@shared/config/referrals.config';
import { notify } from '../../../lib/notifications';

/*
 * Adapter for the shared MLM module — matches its expected `db` shape.
 */
const mlmDb = {
  query,
  getClient: () => pool.connect(),
};

/**
 * Short, unique id used to correlate client-visible errors with server
 * logs.
 * 
 * @returns {string}
 */
const newErrorId = () => crypto.randomBytes(6).toString('hex');

/**
 * Generate a cryptographically secure agent code from config rules.
 *
 * @param {object} codeConfig - { prefix, length, charset, excludeSimilar }
 * @returns {string} Generated agent code
 */
const generateAgentCode = (codeConfig) => {
  const {
    length = 12,
    prefix = 'AGT-',
    charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    excludeSimilar = true,
  } = codeConfig || {};

  let chars = charset;
  if (excludeSimilar) {
    chars = chars.replace(/[0O1IL]/g, '');
  }

  const randomLength = Math.max(0, length - prefix.length);
  let result = prefix;

  const nodeCrypto = require('crypto');
  for (let i = 0; i < randomLength; i++) {
    result += chars[nodeCrypto.randomInt(0, chars.length)];
  }
  return result;
};

/**
 * Generate a unique agent code with collision detection.
 *
 * @param {object} codeConfig - { prefix, length, charset, excludeSimilar }
 * @param {number} maxAttempts - Maximum generation attempts
 * @returns {Promise<string>} Unique agent code
 * @throws {Error} If unable to generate unique code
 */
const generateUniqueAgentCode = async (codeConfig, maxAttempts = 10) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateAgentCode(codeConfig);
    const existing = await query(
      'SELECT id FROM agent_codes WHERE code = $1 LIMIT 1',
      [code]
    );
    if (existing.rows.length === 0) return code;
  }
  throw new Error(
    `Failed to generate unique agent code after ${maxAttempts} attempts`
  );
};

/**
 * Provision the agent code and default settings for a new user.
 * Idempotent — uses ON CONFLICT DO NOTHING so re-runs are safe.
 *
 * @param {string} userId - User UUID
 * @returns {Promise<void>}
 */
const provisionAgentAccount = async (userId) => {
  if (!isAgentsEnabled()) return;

  const codeConfig = getAgentCodeGeneration();
  const defaultCommission = getAgentDefaultCommission();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const agentCode = await generateUniqueAgentCode(codeConfig);
    await client.query(
      `INSERT INTO agent_codes (user_id, code, is_active)
       VALUES ($1, $2, true)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, agentCode]
    );

    const commissionType =
      defaultCommission?.type === 'percentage' ? 'percentage' : 'fixed';
    const commissionValue = Number(defaultCommission?.value) || 500;

    await client.query(
      `INSERT INTO agent_settings (user_id, commission_type, commission_value, is_active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, commissionType, commissionValue]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Resolve an agent code to the owning user's UUID.
 * Case-insensitive lookup via LOWER() so legacy codes with mixed casing
 * (e.g. AGT-aeaec1ec) resolve correctly.
 *
 * @param {string} rawCode - The agent code from the request payload
 * @returns {Promise<string|null>} Agent user UUID or null
 */
const resolveAgentCodeToUserId = async (rawCode) => {
  if (!isAgentsEnabled()) return null;
  if (!rawCode || typeof rawCode !== 'string') return null;

  const cleanCode = rawCode.trim().toUpperCase();
  if (!cleanCode) return null;

  try {
    const result = await query(
      `SELECT ac.user_id, ac.is_active, ags.is_active AS settings_active
       FROM agent_codes ac
       LEFT JOIN agent_settings ags ON ags.user_id = ac.user_id
       WHERE LOWER(ac.code) = LOWER($1)`,
      [cleanCode]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    if (!row.is_active) return null;
    if (row.settings_active === false) return null;

    return row.user_id;
  } catch (error) {
    console.error('Agent code resolution failed:', {
      code: cleanCode,
      error: error.message,
    });
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, message: 'Method not allowed' });
  }

  const errorId = newErrorId();

  try {
    const {
      fullName,
      phone,
      email,
      password,
      referralCode,
      agentCode,
    } = req.body || {};

    /* ── Validate required fields ── */
    if (!fullName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, phone, and password are required.',
      });
    }

    /* ── Duplicate phone check ── */
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

    /* ── Validate referral code ── */
    let referrerId = null;
    let referralDiscountPercent = 0;
    let validatedReferralCode = null;

    if (
      referralCode &&
      typeof referralCode === 'string' &&
      referralCode.trim()
    ) {
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

    /* ── Resolve agent attribution BEFORE insert ── */
    const pendingAgentId = await resolveAgentCodeToUserId(agentCode);

    /* ── Hash password ── */
    const hashedPassword = await bcrypt.hash(password, 12);

    /* 
     * ── Create user with both referral and pending agent attribution ──
     * We store the agent ID in BOTH pending_agent_id (consumed on first payment)
     * and registered_via_agent_id (permanent, for auto-discounts).
     */
    const result = await query(
      `INSERT INTO users (
         full_name, phone, email, password,
         referred_by_code, referral_discount_percent, 
         pending_agent_id, registered_via_agent_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, full_name, phone, email, is_enrolled, payment_status,
                 referred_by_code, referral_discount_percent, pending_agent_id`,
      [
        fullName,
        phone,
        email || null,
        hashedPassword,
        validatedReferralCode,
        referralDiscountPercent,
        pendingAgentId,
        pendingAgentId,
      ]
    );

    const user = result.rows[0];

    /* ── Provision agent account (best-effort) ── */
    try {
      await provisionAgentAccount(user.id);
    } catch (agentError) {
      console.error(`[${errorId}] Agent provisioning failed:`, {
        userId: user.id,
        message: agentError.message,
        stack: agentError.stack,
      });
    }

    /*
     * ── Referral side-effects (audit + MLM tree + notification) ──
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

      try {
        await sharedMlm.buildReferralTree(
          mlmDb,
          referralsConfig,
          user.id,
          referrerId
        );
      } catch (treeError) {
        console.error(`[${errorId}] Referral tree build failed:`, {
          userId: user.id,
          referralCode: validatedReferralCode,
          message: treeError.message,
        });
      }

      try {
        await notify(
          referrerId,
          'referral_signed_up',
          { name: fullName },
          '/profile/referrals'
        );
      } catch (notifError) {
        console.error(
          `[${errorId}] referral_signed_up notification failed:`,
          notifError.message
        );
      }
    } else {
      try {
        await query(
          `INSERT INTO affiliate_wallets (user_id) VALUES ($1)
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id]
        );
      } catch (walletError) {
        console.error(`[${errorId}] Wallet creation failed:`, {
          userId: user.id,
          message: walletError.message,
        });
      }
    }

    /* ── Issue JWT ── */
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
          referral_discount_percent: parseFloat(
            user.referral_discount_percent || 0
          ),
          pending_agent_id: user.pending_agent_id,
        },
        token,
        referral: validatedReferralCode
          ? {
              code: validatedReferralCode,
              discountPercent: referralDiscountPercent,
            }
          : null,
        agentAttribution: pendingAgentId
          ? { captured: true }
          : { captured: false },
      },
    });
  } catch (error) {
    console.error(`[${errorId}] Register error:`, {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
      stack: error.stack,
    });

    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({
      success: false,
      message: 'Registration failed.',
      errorId,
      ...(isDev && {
        detail: error.message,
        ...(error.constraint && { constraint: error.constraint }),
      }),
    });
  }
}