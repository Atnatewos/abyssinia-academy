/**
 * @fileoverview Student MLM Withdrawals API
 *
 * GET  — paginated withdrawal history for the authenticated user
 * POST — create a withdrawal request validated against the unified
 *        Money Model v2 withdrawable balance:
 *          withdrawable = current_balance − locked commissions − locked bonuses
 *
 * All limits and methods are read from shared referral config —
 * zero hardcoded values.
 *
 * Path: apps/web/pages/api/referrals/mlm/withdrawals.js
 */

import { pool, query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';
import { getWithdrawalConfig } from '../../../../lib/config';

/**
 * Compute the unified withdrawable balance (Money Model v2).
 * Locked commissions and locked bonuses are subtracted from the
 * wallet's current balance; the result is floored at zero.
 *
 * @param {string} userId - User UUID
 * @returns {Promise<number>} Withdrawable amount in ETB
 */
const getWithdrawableBalance = async (userId) => {
  const result = await query(
    `SELECT
       COALESCE(w.current_balance, 0)::numeric AS current_balance,
       COALESCE((
         SELECT SUM(commission_amount)
         FROM affiliate_commissions
         WHERE earning_user_id = $1
           AND status = 'credited'
           AND unlock_at > NOW()
       ), 0)::numeric AS locked_commissions,
       COALESCE((
         SELECT SUM(amount)
         FROM referral_bonuses
         WHERE user_id = $1
           AND status = 'credited'
           AND unlock_at > NOW()
       ), 0)::numeric AS locked_bonuses
     FROM affiliate_wallets w
     WHERE w.user_id = $1`,
    [userId]
  );

  if (result.rows.length === 0) return 0;

  const { current_balance, locked_commissions, locked_bonuses } = result.rows[0];
  return Math.max(
    0,
    parseFloat(current_balance) - parseFloat(locked_commissions) - parseFloat(locked_bonuses)
  );
};

export default async function handler(req, res) {
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
  const withdrawalConfig = getWithdrawalConfig();
  const minimumAmount = withdrawalConfig.minimumAmountETB;
  const maximumAmount = withdrawalConfig.maximumAmountETB;
  const allowedMethods = withdrawalConfig.methods;

  /* ── GET: paginated history ── */
  if (req.method === 'GET') {
    try {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
      const offset = (page - 1) * limit;

      const rowsResult = await query(
        `SELECT id, amount, method, account_number, account_name, bank_name,
                status, admin_note, transaction_ref, created_at, processed_at
         FROM withdrawal_requests
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const countResult = await query(
        'SELECT COUNT(*)::int AS count FROM withdrawal_requests WHERE user_id = $1',
        [userId]
      );

      const total = countResult.rows[0].count;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        data: {
          withdrawals: rowsResult.rows.map((row) => ({
            id: row.id,
            amount: parseFloat(row.amount),
            method: row.method,
            accountNumber: row.account_number,
            accountName: row.account_name,
            bankName: row.bank_name,
            status: row.status,
            adminNote: row.admin_note,
            transactionRef: row.transaction_ref,
            createdAt: row.created_at,
            processedAt: row.processed_at,
          })),
          pagination: { page, limit, total, totalPages },
        },
      });
    } catch (error) {
      console.error('MLM withdrawals list error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to load withdrawals.' });
    }
  }

  /* ── POST: create request ── */
  if (req.method === 'POST') {
    try {
      const { amount, method, accountNumber, accountName, bankName } = req.body;

      if (!amount || !method || !accountNumber || !accountName) {
        return res.status(400).json({
          success: false,
          message: 'amount, method, accountNumber, and accountName are required.',
        });
      }

      const numericAmount = Number(amount);
      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid amount.' });
      }
      if (numericAmount < minimumAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum withdrawal is ${minimumAmount} ETB.`,
        });
      }
      if (numericAmount > maximumAmount) {
        return res.status(400).json({
          success: false,
          message: `Maximum single withdrawal is ${maximumAmount} ETB.`,
        });
      }
      if (!allowedMethods.includes(method)) {
        return res.status(400).json({ success: false, message: 'Invalid withdrawal method.' });
      }
      if (method === 'bank-transfer' && !bankName) {
        return res.status(400).json({
          success: false,
          message: 'Bank name is required for bank transfers.',
        });
      }

      const txClient = await pool.connect();
      try {
        await txClient.query('BEGIN');

        /* One open request at a time (mirrors the partial unique index). */
        const openCheck = await txClient.query(
          `SELECT 1 FROM withdrawal_requests
           WHERE user_id = $1 AND status IN ('pending', 'approved')
           LIMIT 1`,
          [userId]
        );
        if (openCheck.rows.length > 0) {
          await txClient.query('ROLLBACK');
          return res.status(409).json({
            success: false,
            message: 'You already have a pending withdrawal request.',
          });
        }

        /* Lock wallet and validate debt + withdrawable balance. */
        const walletResult = await txClient.query(
          `SELECT current_balance, debt_balance FROM affiliate_wallets
           WHERE user_id = $1 FOR UPDATE`,
          [userId]
        );
        if (walletResult.rows.length === 0) {
          await txClient.query('ROLLBACK');
          return res.status(400).json({ success: false, message: 'Wallet not found.' });
        }

        const debt = parseFloat(walletResult.rows[0].debt_balance);
        if (debt > 0) {
          await txClient.query('ROLLBACK');
          return res.status(403).json({
            success: false,
            message: 'You have an outstanding debt. Contact support.',
          });
        }

        const withdrawable = await getWithdrawableBalance(userId);
        if (numericAmount > withdrawable) {
          await txClient.query('ROLLBACK');
          return res.status(400).json({
            success: false,
            message: `Insufficient withdrawable balance. Available: ${withdrawable} ETB.`,
          });
        }

        /* Reserve the funds. */
        await txClient.query(
          `UPDATE affiliate_wallets
           SET current_balance = current_balance - $1,
               pending_withdrawal = pending_withdrawal + $1,
               updated_at = NOW()
           WHERE user_id = $2`,
          [numericAmount, userId]
        );

        const insertResult = await txClient.query(
          `INSERT INTO withdrawal_requests
             (user_id, amount, method, account_number, account_name, bank_name, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending')
           RETURNING id, user_id, amount, method, account_number, account_name,
                     bank_name, status, created_at`,
          [userId, numericAmount, method, accountNumber, accountName, method === 'bank-transfer' ? bankName : null]
        );

        await txClient.query('COMMIT');

        return res.status(201).json({
          success: true,
          message: 'Withdrawal request submitted. Admin will process shortly.',
          data: { withdrawal: insertResult.rows[0] },
        });
      } catch (txError) {
        await txClient.query('ROLLBACK');
        throw txError;
      } finally {
        txClient.release();
      }
    } catch (error) {
      console.error('MLM withdrawal create error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to create withdrawal.' });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}