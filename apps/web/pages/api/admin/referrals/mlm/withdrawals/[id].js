/**
 * @fileoverview Admin MLM Withdrawal Processing API
 *
 * PATCH /api/admin/referrals/mlm/withdrawals/[id]
 *
 * Approve (mark paid) or reject a pending withdrawal request inside a
 * single transaction so the request status and the wallet settlement
 * always move together. Accepts `note` or legacy `adminNote` field.
 *
 * Path: apps/web/pages/api/admin/referrals/mlm/withdrawals/[id].js
 */

import { pool } from '../../../../../../lib/db';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  const { id } = req.query;
  const { action, note, adminNote, transactionRef } = req.body || {};
  const resolvedNote = note || adminNote || null;

  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: 'action must be "approve" or "reject".' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    /* Lock the withdrawal row to prevent concurrent processing. */
    const withdrawalResult = await client.query(
      `SELECT id, user_id, amount, status FROM withdrawal_requests
       WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (withdrawalResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Withdrawal not found.' });
    }

    const withdrawal = withdrawalResult.rows[0];

    if (withdrawal.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Withdrawal is already ${withdrawal.status}.`,
      });
    }

    const amount = parseFloat(withdrawal.amount);

    if (action === 'approve') {
      /* Settle: reserved funds leave the platform as paid-out. */
      await client.query(
        `UPDATE affiliate_wallets
         SET pending_withdrawal = pending_withdrawal - $1,
             total_withdrawn = total_withdrawn + $1,
             updated_at = NOW()
         WHERE user_id = $2`,
        [amount, withdrawal.user_id]
      );

      await client.query(
        `UPDATE withdrawal_requests
         SET status = 'paid',
             processed_by_admin = $1,
             processed_at = NOW(),
             admin_note = $2,
             transaction_ref = $3
         WHERE id = $4`,
        [decoded.adminId, resolvedNote, transactionRef || null, id]
      );
    } else {
      /* Release: reserved funds return to the withdrawable balance. */
      await client.query(
        `UPDATE affiliate_wallets
         SET pending_withdrawal = pending_withdrawal - $1,
             current_balance = current_balance + $1,
             updated_at = NOW()
         WHERE user_id = $2`,
        [amount, withdrawal.user_id]
      );

      await client.query(
        `UPDATE withdrawal_requests
         SET status = 'rejected',
             processed_by_admin = $1,
             processed_at = NOW(),
             admin_note = $2
         WHERE id = $3`,
        [decoded.adminId, resolvedNote, id]
      );
    }

    /* Immutable audit trail for every admin payout decision. */
    await client.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, $2, 'withdrawal', $3, $4, $5, $6)`,
      [
        decoded.adminId,
        action === 'approve' ? 'withdrawal.approve' : 'withdrawal.reject',
        id,
        JSON.stringify({ amount, method: withdrawal.method || null }),
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        req.headers['user-agent'] || null,
      ]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: action === 'approve' ? 'Withdrawal marked as paid.' : 'Withdrawal rejected.',
      data: { withdrawalId: id, status: action === 'approve' ? 'paid' : 'rejected' },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Admin MLM withdrawal processing error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to process withdrawal.' });
  } finally {
    client.release();
  }
}