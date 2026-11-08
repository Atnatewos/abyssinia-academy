/**
 * @fileoverview Reseller Dashboard API
 *
 * GET — returns aggregated stats for the authenticated reseller.
 *
 * Includes:
 *   - Wallet balance (from affiliate_wallets — includes MLM + reseller earnings)
 *   - Sales totals (lifetime, this month)
 *   - Locked amount (funds within 7-day window)
 *   - Sub-reseller count
 *
 * Path: apps/web/pages/api/reseller/dashboard.js
 */

import {
  requireReseller,
  sendSuccess,
  sendError,
  getConfig,
} from '../../../lib/reseller-api';
import { query } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 405, 'Method not allowed.');
  }

  let context;
  try {
    context = await requireReseller(req);
  } catch (err) {
    return sendError(res, err.status || 401, err.message);
  }

  const { userId, profile } = context;

  try {
    const [
      walletResult,
      salesTotalResult,
      salesThisMonthResult,
      lockedResult,
      subResellersCountResult,
      recentSalesResult,
    ] = await Promise.all([
      query(
        `SELECT total_earned, current_balance, pending_withdrawal, debt_balance
         FROM affiliate_wallets WHERE user_id = $1`,
        [userId]
      ),
      query(
        `SELECT COUNT(*)::int AS count, COALESCE(SUM(sub_reseller_payout), 0)::numeric AS total
         FROM reseller_sales
         WHERE reseller_id = $1 AND status IN ('approved', 'paid')`,
        [profile.id]
      ),
      query(
        `SELECT COUNT(*)::int AS count, COALESCE(SUM(sub_reseller_payout), 0)::numeric AS total
         FROM reseller_sales
         WHERE reseller_id = $1
           AND status IN ('approved', 'paid')
           AND TO_CHAR(created_at, 'YYYY-MM') = TO_CHAR(NOW(), 'YYYY-MM')`,
        [profile.id]
      ),
      query(
        `SELECT COALESCE(SUM(sub_reseller_payout), 0)::numeric AS locked
         FROM reseller_sales
         WHERE reseller_id = $1
           AND status = 'approved'
           AND unlock_at > NOW()`,
        [profile.id]
      ),
      query(
        `SELECT COUNT(*)::int AS count FROM reseller_profiles WHERE parent_reseller_id = $1`,
        [profile.id]
      ),
      query(
        `SELECT id, retail_price, sub_reseller_payout, status, created_at, unlock_at
         FROM reseller_sales
         WHERE reseller_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [profile.id]
      ),
    ]);

    const wallet = walletResult.rows[0] || {
      total_earned: 0, current_balance: 0, pending_withdrawal: 0, debt_balance: 0,
    };
    const locked = parseFloat(lockedResult.rows[0]?.locked || 0);
    const currentBalance = parseFloat(wallet.current_balance);
    const available = Math.max(0, currentBalance - locked);

    return sendSuccess(res, {
      wallet: {
        totalEarned: parseFloat(wallet.total_earned),
        currentBalance,
        availableNow: available,
        lockedAmount: locked,
        pendingWithdrawal: parseFloat(wallet.pending_withdrawal),
        debtBalance: parseFloat(wallet.debt_balance),
      },
      sales: {
        totalCount: salesTotalResult.rows[0].count,
        totalEarned: parseFloat(salesTotalResult.rows[0].total),
        thisMonthCount: salesThisMonthResult.rows[0].count,
        thisMonthEarned: parseFloat(salesThisMonthResult.rows[0].total),
      },
      subResellers: {
        count: subResellersCountResult.rows[0].count,
      },
      recentSales: recentSalesResult.rows.map((r) => ({
        id: r.id,
        retailPrice: parseFloat(r.retail_price),
        yourEarnings: parseFloat(r.sub_reseller_payout),
        status: r.status,
        createdAt: r.created_at,
        unlockAt: r.unlock_at,
        isLocked: new Date(r.unlock_at) > new Date(),
      })),
    });
  } catch (err) {
    console.error('[reseller/dashboard]', err.message);
    return sendError(res, 500, 'Failed to load dashboard.');
  }
}