/**
 * Referral Earnings API
 * 
 * Provides detailed earnings breakdown including:
 * - Commission earnings by level
 * - Bonus earnings by category
 * - Monthly earnings trends
 * - Lifetime earnings summary
 * 
 * Security: JWT authentication required, user-scoped data only
 * Performance: Indexed queries, pagination support
 */

import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import { validateAuthToken } from '../../../lib/auth';

/**
 * Calculate earnings breakdown by commission level
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Level-wise earnings breakdown
 */
const calculateLevelEarnings = async (userId) => {
  const result = await query(
    `SELECT 
      level,
      COUNT(*) as commission_count,
      COALESCE(SUM(commission_amount), 0) as total_earned,
      COALESCE(SUM(CASE WHEN unlock_at <= NOW() THEN commission_amount ELSE 0 END), 0) as unlocked,
      COALESCE(SUM(CASE WHEN unlock_at > NOW() THEN commission_amount ELSE 0 END), 0) as locked
    FROM affiliate_commissions
    WHERE earning_user_id = $1 AND status = 'credited'
    GROUP BY level
    ORDER BY level`,
    [userId]
  );
  
  const levels = {
    level1: { count: 0, earned: 0, unlocked: 0, locked: 0 },
    level2: { count: 0, earned: 0, unlocked: 0, locked: 0 },
    level3: { count: 0, earned: 0, unlocked: 0, locked: 0 },
    level4: { count: 0, earned: 0, unlocked: 0, locked: 0 }
  };
  
  result.rows.forEach(row => {
    const levelKey = `level${row.level}`;
    if (levels[levelKey]) {
      levels[levelKey] = {
        count: parseInt(row.commission_count),
        earned: parseFloat(row.total_earned),
        unlocked: parseFloat(row.unlocked),
        locked: parseFloat(row.locked)
      };
    }
  });
  
  return levels;
};

/**
 * Calculate earnings breakdown by bonus category
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Category-wise bonus breakdown
 */
const calculateBonusEarnings = async (userId) => {
  const result = await query(
    `SELECT 
      bonus_category,
      COUNT(*) as bonus_count,
      COALESCE(SUM(amount), 0) as total_earned
    FROM referral_bonuses
    WHERE user_id = $1
    GROUP BY bonus_category
    ORDER BY bonus_category`,
    [userId]
  );
  
  const categories = {
    direct_referral: { count: 0, earned: 0 },
    milestone: { count: 0, earned: 0 },
    rank: { count: 0, earned: 0 },
    team_bonus: { count: 0, earned: 0 },
    speed_bonus: { count: 0, earned: 0 }
  };
  
  result.rows.forEach(row => {
    if (categories[row.bonus_category]) {
      categories[row.bonus_category] = {
        count: parseInt(row.bonus_count),
        earned: parseFloat(row.total_earned)
      };
    }
  });
  
  return categories;
};

/**
 * Calculate monthly earnings trends
 * @param {string} userId - User UUID
 * @param {number} months - Number of months to retrieve
 * @returns {Promise<Array>} Monthly earnings array
 */
const calculateMonthlyTrends = async (userId, months = 12) => {
  const result = await query(
    `WITH monthly_commissions AS (
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COALESCE(SUM(commission_amount), 0) as commission_earned
      FROM affiliate_commissions
      WHERE earning_user_id = $1 
        AND status = 'credited'
        AND created_at >= NOW() - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', created_at)
    ),
    monthly_bonuses AS (
      SELECT 
        DATE_TRUNC('month', awarded_at) as month,
        COALESCE(SUM(amount), 0) as bonus_earned
      FROM referral_bonuses
      WHERE user_id = $1
        AND awarded_at >= NOW() - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', awarded_at)
    )
    SELECT 
      COALESCE(c.month, b.month) as month,
      COALESCE(c.commission_earned, 0) as commissions,
      COALESCE(b.bonus_earned, 0) as bonuses,
      COALESCE(c.commission_earned, 0) + COALESCE(b.bonus_earned, 0) as total
    FROM monthly_commissions c
    FULL OUTER JOIN monthly_bonuses b ON c.month = b.month
    ORDER BY month DESC`,
    [userId]
  );
  
  return result.rows.map(row => ({
    month: row.month,
    commissions: parseFloat(row.commissions),
    bonuses: parseFloat(row.bonuses),
    total: parseFloat(row.total)
  }));
};

/**
 * Calculate lifetime earnings summary
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Lifetime earnings summary
 */
const calculateLifetimeSummary = async (userId) => {
  const [walletResult, commissionResult, bonusResult, withdrawalResult] = await Promise.all([
    query(
      `SELECT 
        COALESCE(total_earned, 0) as total_earned,
        COALESCE(total_withdrawn, 0) as total_withdrawn,
        COALESCE(current_balance, 0) as current_balance,
        COALESCE(pending_withdrawal, 0) as pending_withdrawal
      FROM affiliate_wallets
      WHERE user_id = $1`,
      [userId]
    ),
    query(
      `SELECT 
        COUNT(*) as total_commissions,
        COALESCE(SUM(commission_amount), 0) as total_commission_earned
      FROM affiliate_commissions
      WHERE earning_user_id = $1 AND status = 'credited'`,
      [userId]
    ),
    query(
      `SELECT 
        COUNT(*) as total_bonuses,
        COALESCE(SUM(amount), 0) as total_bonus_earned
      FROM referral_bonuses
      WHERE user_id = $1`,
      [userId]
    ),
    query(
      `SELECT 
        COUNT(*) as total_withdrawals,
        COALESCE(SUM(amount), 0) as total_withdrawn
      FROM withdrawal_requests
      WHERE user_id = $1 AND status IN ('approved', 'paid')`,
      [userId]
    )
  ]);
  
  const wallet = walletResult.rows[0] || {};
  const commissions = commissionResult.rows[0] || {};
  const bonuses = bonusResult.rows[0] || {};
  const withdrawals = withdrawalResult.rows[0] || {};
  
  return {
    totalEarned: parseFloat(wallet.total_earned || 0),
    totalWithdrawn: parseFloat(wallet.total_withdrawn || 0),
    currentBalance: parseFloat(wallet.current_balance || 0),
    pendingWithdrawal: parseFloat(wallet.pending_withdrawal || 0),
    totalCommissions: parseInt(commissions.total_commissions || 0),
    totalCommissionEarned: parseFloat(commissions.total_commission_earned || 0),
    totalBonuses: parseInt(bonuses.total_bonuses || 0),
    totalBonusEarned: parseFloat(bonuses.total_bonus_earned || 0),
    totalWithdrawals: parseInt(withdrawals.total_withdrawals || 0),
    totalAmountWithdrawn: parseFloat(withdrawals.total_withdrawn || 0)
  };
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
  // Authenticate user
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  let decoded;
  try {
    const token = authHeader.split(' ')[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
  
  const userId = decoded.userId;
  
  try {
    // Parse query parameters
    const months = Math.min(parseInt(req.query.months || '12'), 24); // Max 24 months
    
    // Calculate all earnings data in parallel
    const [
      levelEarnings,
      bonusEarnings,
      monthlyTrends,
      lifetimeSummary
    ] = await Promise.all([
      calculateLevelEarnings(userId),
      calculateBonusEarnings(userId),
      calculateMonthlyTrends(userId, months),
      calculateLifetimeSummary(userId)
    ]);
    
    // Calculate totals
    const totalCommissionEarned = Object.values(levelEarnings)
      .reduce((sum, level) => sum + level.earned, 0);
    
    const totalBonusEarned = Object.values(bonusEarnings)
      .reduce((sum, category) => sum + category.earned, 0);
    
    const totalUnlocked = Object.values(levelEarnings)
      .reduce((sum, level) => sum + level.unlocked, 0);
    
    const totalLocked = Object.values(levelEarnings)
      .reduce((sum, level) => sum + level.locked, 0);
    
    return res.status(200).json({
      success: true,
      data: {
        summary: lifetimeSummary,
        breakdown: {
          commissions: {
            byLevel: levelEarnings,
            totalEarned: totalCommissionEarned,
            totalUnlocked,
            totalLocked
          },
          bonuses: {
            byCategory: bonusEarnings,
            totalEarned: totalBonusEarned
          }
        },
        trends: {
          monthly: monthlyTrends,
          period: `${months} months`
        },
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Earnings API error:', {
      userId,
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to load earnings data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}