/**
 * @fileoverview Referral MLM Dashboard API (Money Model v2)
 *
 * Returns the aggregated MLM dashboard payload for the authenticated user.
 * Includes v2 wallet fields: availableNow, lockedTotal, nextUnlockAt.
 *
 * Self-healing behavior:
 *   If the user does not yet have a referral code, this endpoint auto-generates
 *   one on first call using config-driven settings.
 *
 * Path: apps/web/pages/api/referrals/mlm/dashboard.js
 */

import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';
import { getReferralCodeGenConfig } from '../../../../lib/config';
import { buildReferralUrl } from '../../../../lib/url';

/* ============================================================================
 * REFERRAL CODE GENERATION (config-driven)
 * ========================================================================== */

/**
 * Generate a random referral code based on config.
 *
 * @param {object} config
 * @returns {string}
 */
const generateReferralCode = (config) => {
  const prefix = config.prefix || '';
  const length = config.length || 8;
  let chars = config.charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  if (config.excludeSimilar) {
    chars = chars.replace(/[0O1IL]/g, '');
  }

  const randomLength = Math.max(0, length - prefix.length);
  let result = prefix;

  for (let i = 0; i < randomLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }

  return result;
};

/**
 * Generate a unique code that doesn't collide with an existing one.
 *
 * @param {object} config
 * @returns {Promise<string>}
 */
const generateUniqueCode = async (config) => {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateReferralCode(config);

    const existing = await query(
      'SELECT id FROM referral_codes WHERE code = $1 LIMIT 1',
      [code]
    );

    if (existing.rows.length === 0) {
      return code;
    }
  }

  throw new Error(`Failed to generate a unique referral code after ${maxAttempts} attempts.`);
};

/**
 * Ensure the user has a referral code row.
 *
 * @param {string} userId
 * @returns {Promise<object>}
 */
const ensureReferralCode = async (userId) => {
  const existing = await query(
    'SELECT code, is_active, created_at FROM referral_codes WHERE user_id = $1',
    [userId]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  try {
    const codeConfig = getReferralCodeGenConfig();
    const newCode = await generateUniqueCode(codeConfig);

    await query(
      'INSERT INTO referral_codes (user_id, code) VALUES ($1, $2)',
      [userId, newCode]
    );

    const inserted = await query(
      'SELECT code, is_active, created_at FROM referral_codes WHERE user_id = $1',
      [userId]
    );

    return inserted.rows[0] || { code: newCode, is_active: true, created_at: new Date() };
  } catch (genError) {
    console.error('Referral code auto-generation failed:', genError.message);
    return { code: null, is_active: false, created_at: null };
  }
};

/**
 * Ensure the user has an affiliate_wallets row.
 *
 * @param {string} userId
 */
const ensureWallet = async (userId) => {
  await query(
    `INSERT INTO affiliate_wallets (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
};

/* ============================================================================
 * MAIN HANDLER
 * ========================================================================== */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

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
    /* Self-healing: wallet + referral code exist before stats load */
    await ensureWallet(userId);
    const referralCodeRow = await ensureReferralCode(userId);

    /* Domain auto-detected from request Host header */
    const referralLink = referralCodeRow.code
      ? buildReferralUrl(referralCodeRow.code, req)
      : null;

    /*
     * Fetch all dashboard data in parallel.
     * Money Model v2: includes locked commissions and locked bonuses
     * to compute availableNow and lockedTotal.
     */
    const [
      walletResult,
      treeCounts,
      commissionsResult,
      bonusesResult,
      withdrawalsResult,
      userResult,
      creditEarnedResult,
      creditUsedResult,
      lockedCommissionsResult,
      lockedBonusesResult,
      nextUnlockResult,
    ] = await Promise.all([
      query(
        `SELECT total_earned, total_withdrawn, current_balance,
                pending_withdrawal, debt_balance
         FROM affiliate_wallets WHERE user_id = $1`,
        [userId]
      ),
      query(
        `SELECT depth, COUNT(*)::int AS count
         FROM referral_tree WHERE ancestor_id = $1 GROUP BY depth`,
        [userId]
      ),
      query(
        `SELECT c.id, c.source_user_id, c.level, c.commission_amount,
                c.status, c.created_at, c.unlock_at,
                u.full_name AS source_user_name
         FROM affiliate_commissions c
         LEFT JOIN users u ON u.id = c.source_user_id
         WHERE c.earning_user_id = $1
         ORDER BY c.created_at DESC
         LIMIT 5`,
        [userId]
      ),
      query(
        `SELECT id, bonus_category, bonus_name, requirement_met, amount, period, awarded_at, unlock_at, status
         FROM referral_bonuses WHERE user_id = $1
         ORDER BY awarded_at DESC LIMIT 10`,
        [userId]
      ),
      query(
        `SELECT id, amount, method, status, created_at
         FROM withdrawal_requests WHERE user_id = $1
         ORDER BY created_at DESC LIMIT 5`,
        [userId]
      ),
      query(
        `SELECT id, full_name, phone, email FROM users WHERE id = $1`,
        [userId]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0)::numeric AS total
         FROM referral_bonuses WHERE user_id = $1 AND status = 'credited'`,
        [userId]
      ),
      query(
        `SELECT COALESCE(SUM(credit_applied), 0)::numeric AS total
         FROM payments WHERE user_id = $1 AND status IN ('pending', 'approved')`,
        [userId]
      ),
      query(
        `SELECT COALESCE(SUM(commission_amount), 0)::numeric AS balance
         FROM affiliate_commissions
         WHERE earning_user_id = $1 AND status = 'credited' AND unlock_at > NOW()`,
        [userId]
      ),
      query(
        `SELECT COALESCE(SUM(amount), 0)::numeric AS balance
         FROM referral_bonuses
         WHERE user_id = $1 AND status = 'credited' AND unlock_at > NOW()`,
        [userId]
      ),
      query(
        `SELECT MIN(unlock_at) AS next_unlock
         FROM (
           SELECT unlock_at FROM affiliate_commissions
           WHERE earning_user_id = $1 AND status = 'credited' AND unlock_at > NOW()
           UNION ALL
           SELECT unlock_at FROM referral_bonuses
           WHERE user_id = $1 AND status = 'credited' AND unlock_at > NOW()
         ) AS all_locked`,
        [userId]
      ),
    ]);

    const team = {
      level1: 0,
      level2: 0,
      level3: 0,
      level4: 0,
      total: 0,
      directReferralCount: 0,
      totalTeamSize: 0,
      payingDirectCount: 0,
      payingTeamSize: 0,
    };

    for (const row of treeCounts.rows) {
      team[`level${row.depth}`] = row.count;
      team.total += row.count;
    }
    team.directReferralCount = team.level1;
    team.totalTeamSize = team.total;

    /* Fetch paying counters from users table */
    const payingCountersResult = await query(
      `SELECT paying_direct_count, paying_team_size FROM users WHERE id = $1`,
      [userId]
    );
    if (payingCountersResult.rows.length > 0) {
      team.payingDirectCount = payingCountersResult.rows[0].paying_direct_count || 0;
      team.payingTeamSize = payingCountersResult.rows[0].paying_team_size || 0;
    }

    const wallet = walletResult.rows[0] || {
      total_earned: 0,
      total_withdrawn: 0,
      current_balance: 0,
      pending_withdrawal: 0,
      debt_balance: 0,
    };

    const currentBalance = parseFloat(wallet.current_balance || 0);
    const lockedCommissions = parseFloat(lockedCommissionsResult.rows[0]?.balance || 0);
    const lockedBonuses = parseFloat(lockedBonusesResult.rows[0]?.balance || 0);
    const lockedTotal = lockedCommissions + lockedBonuses;
    const availableNow = Math.max(0, currentBalance - lockedTotal);

    const totalBonusEarned = parseFloat(creditEarnedResult.rows[0]?.total || 0);
    const totalCommissionEarned = parseFloat(wallet.total_earned || 0) - totalBonusEarned;

    const nextUnlockAt = nextUnlockResult.rows[0]?.next_unlock || null;

    res.status(200).json({
      success: true,
      data: {
        code: referralCodeRow.code,
        link: referralLink,
        isActive: referralCodeRow.is_active,

        user: userResult.rows[0] || null,

        /* Money Model v2 wallet fields */
        wallet: {
          availableNow,
          lockedTotal,
          lockedCommissions,
          lockedBonuses,
          nextUnlockAt,
          currentBalance,
          pendingWithdrawal: parseFloat(wallet.pending_withdrawal || 0),
          totalEarned: parseFloat(wallet.total_earned || 0),
          totalWithdrawn: parseFloat(wallet.total_withdrawn || 0),
          totalCommissionEarned,
          totalBonusEarned,
          debtBalance: parseFloat(wallet.debt_balance || 0),
        },

        /* Legacy shape for backward compatibility */
        balances: {
          unlocked: availableNow,
          locked: lockedTotal,
        },

        team,
        recentCommissions: commissionsResult.rows,
        recentBonuses: bonusesResult.rows,
        recentWithdrawals: withdrawalsResult.rows,
      },
    });
  } catch (error) {
    console.error('MLM dashboard error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard.' });
  }
}