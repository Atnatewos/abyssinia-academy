/**
 * @fileoverview Admin User Detail API
 *
 * Returns full user profile with enrollment, payments, progress, and
 * MLM referral data. Referral data is sourced from the new MLM tables
 * (affiliate_wallets, affiliate_commissions, referral_tree, referral_bonuses),
 * NOT the legacy referral_earnings table.
 *
 * Path: apps/web/pages/api/admin/users/[id]/index.js
 */

import { query } from '../../../../../lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  try {
    jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  const { id } = req.query;

  try {
    /* Fetch user record. */
    const userResult = await query(
      `SELECT
         id, full_name, phone, email, is_enrolled, enrolled_at,
         payment_method, payment_status, avatar_url,
         referred_by_code, referral_discount_percent,
         referred_by_user_id, direct_referral_count, total_team_size,
         lifetime_referral_earnings, profile_completed, created_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = userResult.rows[0];

    /* Fetch enrollment. */
    const enrollmentResult = await query(
      `SELECT e.*, p.status AS payment_status, p.amount AS payment_amount,
              p.method AS payment_method, p.reference AS payment_ref
       FROM enrollments e
       LEFT JOIN payments p ON e.payment_id = p.id
       WHERE e.user_id = $1
       ORDER BY e.enrolled_at DESC
       LIMIT 1`,
      [id]
    );

    /* Fetch payments. */
    const paymentsResult = await query(
      `SELECT id, amount, method, status, reference, transaction_id, created_at
       FROM payments
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [id]
    );

    /* Fetch progress. */
    const progressResult = await query(
      `SELECT progress AS overall, updated_at
       FROM course_progress
       WHERE user_id = $1
       LIMIT 1`,
      [id]
    );

    const completedResult = await query(
      `SELECT COUNT(*) AS count
       FROM completed_lessons
       WHERE user_id = $1`,
      [id]
    );

    /*
     * Fetch MLM data from the new tables.
     */

    /* Referral code. */
    const referralCodeResult = await query(
      `SELECT code, is_active, created_at FROM referral_codes WHERE user_id = $1`,
      [id]
    );

    /* Wallet. */
    const walletResult = await query(
      `SELECT total_earned, total_withdrawn, current_balance,
              pending_withdrawal, debt_balance, updated_at
       FROM affiliate_wallets
       WHERE user_id = $1`,
      [id]
    );

    /* Unlocked and locked commission balances. */
    const unlockedResult = await query(
      `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
       FROM affiliate_commissions
       WHERE earning_user_id = $1 AND status = 'credited' AND unlock_at <= NOW()`,
      [id]
    );

    const lockedResult = await query(
      `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS total
       FROM affiliate_commissions
       WHERE earning_user_id = $1 AND status = 'credited' AND unlock_at > NOW()`,
      [id]
    );

    /* Total credit earned (bonuses minus prior redemptions on pending/approved payments). */
    const bonusEarnedResult = await query(
      `SELECT COALESCE(SUM(amount), 0)::numeric AS total
       FROM referral_bonuses WHERE user_id = $1`,
      [id]
    );

    const creditUsedResult = await query(
      `SELECT COALESCE(SUM(credit_applied), 0)::numeric AS total
       FROM payments WHERE user_id = $1 AND status IN ('pending', 'approved')`,
      [id]
    );

    /* Downline counts grouped by depth. */
    const treeCountsResult = await query(
      `SELECT depth, COUNT(*)::int AS count
       FROM referral_tree
       WHERE ancestor_id = $1
       GROUP BY depth`,
      [id]
    );

    const treeCounts = { level1: 0, level2: 0, level3: 0, level4: 0, total: 0 };
    for (const row of treeCountsResult.rows) {
      treeCounts[`level${row.depth}`] = row.count;
      treeCounts.total += row.count;
    }

    /* Recent commissions. */
    const commissionsResult = await query(
      `SELECT c.id, c.level, c.commission_amount, c.sale_amount, c.status,
              c.created_at, c.unlock_at, c.reversed_at, c.reversal_reason,
              u.full_name AS source_user_name
       FROM affiliate_commissions c
       LEFT JOIN users u ON u.id = c.source_user_id
       WHERE c.earning_user_id = $1
       ORDER BY c.created_at DESC
       LIMIT 20`,
      [id]
    );

    /* Recent bonuses. */
    const bonusesResult = await query(
      `SELECT id, bonus_category, bonus_name, requirement_met, amount, period, awarded_at
       FROM referral_bonuses
       WHERE user_id = $1
       ORDER BY awarded_at DESC
       LIMIT 20`,
      [id]
    );

    /* Referrer name (if user was referred). */
    let referrerName = null;
    if (user.referred_by_user_id) {
      const referrerResult = await query(
        `SELECT full_name FROM users WHERE id = $1`,
        [user.referred_by_user_id]
      );
      if (referrerResult.rows[0]) {
        referrerName = referrerResult.rows[0].full_name;
      }
    }

    const wallet = walletResult.rows[0] || null;
    const unlocked = parseFloat(unlockedResult.rows[0]?.total || 0);
    const locked = parseFloat(lockedResult.rows[0]?.total || 0);
    const bonusEarned = parseFloat(bonusEarnedResult.rows[0]?.total || 0);
    const creditUsed = parseFloat(creditUsedResult.rows[0]?.total || 0);
    const availableCredit = Math.max(0, bonusEarned - creditUsed);

    res.status(200).json({
      success: true,
      data: {
        user,
        enrollment: enrollmentResult.rows[0] || null,
        payments: paymentsResult.rows,
        progress: {
          overall: parseFloat(progressResult.rows[0]?.overall || 0),
          completedLessons: parseInt(completedResult.rows[0]?.count || 0, 10),
        },
        mlm: {
          referralCode: referralCodeResult.rows[0]?.code || null,
          referralCodeActive: referralCodeResult.rows[0]?.is_active || false,
          referrerName,
          wallet: wallet
            ? {
                totalEarned: parseFloat(wallet.total_earned),
                totalWithdrawn: parseFloat(wallet.total_withdrawn),
                currentBalance: parseFloat(wallet.current_balance),
                pendingWithdrawal: parseFloat(wallet.pending_withdrawal),
                debtBalance: parseFloat(wallet.debt_balance),
              }
            : {
                totalEarned: 0,
                totalWithdrawn: 0,
                currentBalance: 0,
                pendingWithdrawal: 0,
                debtBalance: 0,
              },
          balances: {
            unlocked,
            locked,
            bonusEarned,
            creditUsed,
            availableCredit,
          },
          team: treeCounts,
          recentCommissions: commissionsResult.rows.map((row) => ({
            id: row.id,
            level: row.level,
            commissionAmount: parseFloat(row.commission_amount),
            saleAmount: parseFloat(row.sale_amount),
            status: row.status,
            sourceUserName: row.source_user_name || 'Unknown',
            createdAt: row.created_at,
            unlockAt: row.unlock_at,
            reversedAt: row.reversed_at,
            reversalReason: row.reversal_reason,
          })),
          recentBonuses: bonusesResult.rows.map((row) => ({
            id: row.id,
            category: row.bonus_category,
            name: row.bonus_name,
            requirementMet: row.requirement_met,
            amount: parseFloat(row.amount),
            period: row.period,
            awardedAt: row.awarded_at,
          })),
        },
      },
    });
  } catch (error) {
    console.error('Admin user detail error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load user details.',
    });
  }
}