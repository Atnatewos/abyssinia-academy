/**
 * @fileoverview Referral Code API — Get or Generate
 * Returns the authenticated user's referral code, link, and basic stats.
 * If the user doesn't have a code yet, one is generated automatically.
 * Path: apps/web/pages/api/referrals/code.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { getReferralCodeGenConfig } from '../../../lib/config';
import { buildReferralUrl } from '../../../lib/url';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

/**
 * Generate a random referral code based on config settings.
 * @param {object} config - Code generation config from referrals.config.js
 * @returns {string} Generated referral code
 */
const generateReferralCode = (config) => {
  const prefix = config.prefix || 'ABY';
  const length = config.length || 8;
  let chars = config.charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  /*
   * Filter out confusing characters if configured
   */
  if (config.excludeSimilar) {
    chars = chars.replace(/[0O1IL]/g, '');
  }

  /*
   * Generate random characters after the prefix
   */
  const codeLength = length - prefix.length;
  let result = prefix;

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
};

/**
 * Generate a unique code that doesn't already exist in the database.
 * Retries up to 10 times in case of collision.
 * @param {object} config - Code generation config
 * @returns {Promise<string>} Unique referral code
 */
const generateUniqueCode = async (config) => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode(config);

    const existing = await pool.query(
      'SELECT id FROM referral_codes WHERE code = $1',
      [code]
    );

    if (existing.rows.length === 0) {
      return code;
    }
  }

  throw new Error('Failed to generate a unique referral code after multiple attempts.');
};

export default async function handler(req, res) {

  /*
   * Authenticate via JWT
   */
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  let decoded;

  try {
    const token = authHeader.split(' ')[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }

  const userId = decoded.userId;

  /*
   * GET — Fetch or generate the user's referral code
   */
  if (req.method === 'GET') {

    try {

      /*
       * Check if user already has a referral code
       */
      let codeResult = await pool.query(
        `SELECT rc.code, rc.is_active, rc.created_at,
                re.total_referrals, re.successful_referrals, re.current_tier,
                re.available_credit, re.pending_commission
         FROM referral_codes rc
         LEFT JOIN referral_earnings re ON re.user_id = rc.user_id
         WHERE rc.user_id = $1`,
        [userId]
      );

      /*
       * If no code exists, generate one now
       */
      if (codeResult.rows.length === 0) {

        try {
          const codeConfig = getReferralCodeGenConfig();
          const newCode = await generateUniqueCode(codeConfig);

          /*
           * Insert the new referral code
           */
          await pool.query(
            `INSERT INTO referral_codes (user_id, code) VALUES ($1, $2)`,
            [userId, newCode]
          );

          /*
           * Create the earnings record
           */
          await pool.query(
            `INSERT INTO referral_earnings (user_id, current_tier)
             VALUES ($1, 'bronze')
             ON CONFLICT (user_id) DO NOTHING`,
            [userId]
          );

          /*
           * Re-fetch with the newly created code
           */
          codeResult = await pool.query(
            `SELECT rc.code, rc.is_active, rc.created_at,
                    re.total_referrals, re.successful_referrals, re.current_tier,
                    re.available_credit, re.pending_commission
             FROM referral_codes rc
             LEFT JOIN referral_earnings re ON re.user_id = rc.user_id
             WHERE rc.user_id = $1`,
            [userId]
          );

        } catch (genError) {
          console.error('Code generation error:', genError.message);
          return res.status(500).json({
            success: false,
            message: 'Failed to generate referral code.',
          });
        }
      }

      const row = codeResult.rows[0];

      /*
       * Build the referral link using the frontend URL from environment
       */
      const referralLink = buildReferralUrl(row.code, req);

      res.status(200).json({
        success: true,
        data: {
          code: row.code,
          link: referralLink,
          isActive: row.is_active,
          createdAt: row.created_at,
          stats: {
            totalReferrals: parseInt(row.total_referrals || 0, 10),
            successfulReferrals: parseInt(row.successful_referrals || 0, 10),
            currentTier: row.current_tier || 'bronze',
            availableCredit: parseFloat(row.available_credit || 0),
            pendingCommission: parseFloat(row.pending_commission || 0),
          },
        },
      });

    } catch (error) {
      console.error('Referral code fetch error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to load referral code.',
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}