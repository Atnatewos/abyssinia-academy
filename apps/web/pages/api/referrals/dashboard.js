/**
 * @fileoverview Referral Dashboard API
 * Returns complete referral data: tier, earnings breakdown, referral history.
 * Path: apps/web/pages/api/referrals/dashboard.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import { getReferralTierByCount, getReferralTiers, getReferralDashboardConfig } from '../../../lib/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

export default async function handler(req, res) {

  if (req.method !== 'GET') {
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

    /*
     * Fetch the referral code
     */
    const codeResult = await pool.query(
      `SELECT code, is_active FROM referral_codes WHERE user_id = $1`,
      [userId]
    );

    if (codeResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          code: null,
          link: null,
          earnings: null,
          history: [],
          tier: null,
        },
      });
    }

    const codeData = codeResult.rows[0];

    /*
     * Fetch earnings data
     */
    const earningsResult = await pool.query(
      `SELECT * FROM referral_earnings WHERE user_id = $1`,
      [userId]
    );

    const earnings = earningsResult.rows[0] || {
      total_credit_earned: 0,
      total_credit_used: 0,
      available_credit: 0,
      total_commission_earned: 0,
      total_commission_paid: 0,
      pending_commission: 0,
      total_referrals: 0,
      successful_referrals: 0,
      current_tier: 'bronze',
    };

    /*
     * Determine current tier and next tier from config
     */
    const successfulCount = parseInt(earnings.successful_referrals || 0, 10);
    const currentTier = getReferralTierByCount(successfulCount);
    const allTiers = getReferralTiers();

    const nextTier = allTiers.find((t) => t.minReferrals > successfulCount) || null;

    /*
     * Fetch recent referral history
     */
    const dashboardConfig = getReferralDashboardConfig();
    const perPage = dashboardConfig.historyPerPage || 10;

    const historyResult = await pool.query(
      `SELECT
         r.id,
         r.referred_user_id,
         u.full_name AS referred_name,
         r.status,
         r.discount_percent,
         r.referrer_credit_amount,
         r.created_at,
         r.completed_at
       FROM referrals r
       LEFT JOIN users u ON u.id = r.referred_user_id
       WHERE r.referrer_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2`,
      [userId, perPage]
    );

    /*
     * Build the referral link
     */
    const baseUrl = process.env.FRONTEND_URL || 'https://abyssinia.academy';
    const referralLink = `${baseUrl}/register?ref=${codeData.code}`;

    res.status(200).json({
      success: true,
      data: {
        code: codeData.code,
        link: referralLink,
        isActive: codeData.is_active,

        earnings: {
          totalCreditEarned: parseFloat(earnings.total_credit_earned || 0),
          totalCreditUsed: parseFloat(earnings.total_credit_used || 0),
          availableCredit: parseFloat(earnings.available_credit || 0),
          totalCommissionEarned: parseFloat(earnings.total_commission_earned || 0),
          totalCommissionPaid: parseFloat(earnings.total_commission_paid || 0),
          pendingCommission: parseFloat(earnings.pending_commission || 0),
          totalReferrals: parseInt(earnings.total_referrals || 0, 10),
          successfulReferrals: successfulCount,
        },

        tier: {
          current: {
            name: currentTier.name,
            nameAm: currentTier.nameAm,
            creditPercent: currentTier.creditPercent,
            color: currentTier.color,
            icon: currentTier.icon,
          },
          next: nextTier ? {
            name: nextTier.name,
            nameAm: nextTier.nameAm,
            creditPercent: nextTier.creditPercent,
            referralsNeeded: nextTier.minReferrals - successfulCount,
          } : null,
        },

        history: historyResult.rows.map((row) => ({
          id: row.id,
          referredName: row.referred_name || 'Anonymous',
          status: row.status,
          discountPercent: parseFloat(row.discount_percent || 0),
          creditAmount: parseFloat(row.referrer_credit_amount || 0),
          createdAt: row.created_at,
          completedAt: row.completed_at,
        })),
      },
    });

  } catch (error) {
    console.error('Referral dashboard error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load referral dashboard.',
    });
  }
}