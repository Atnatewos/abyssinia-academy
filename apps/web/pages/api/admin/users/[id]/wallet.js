/**
 * @fileoverview Admin Manual Wallet Adjustment API
 * 
 * Path: apps/web/pages/api/admin/users/[id]/wallet.js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import godmodeConfig from '../../../../../../../packages/shared/config/godmode.config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' });

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'No token provided.' });

  let admin;
  try {
    admin = jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }

  if (admin.role !== 'superadmin') return res.status(403).json({ success: false, message: 'Superadmin privileges required.' });

  const userId = req.query.id;
  const { amount, reason } = req.body;
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount === 0) return res.status(400).json({ success: false, message: 'Valid non-zero amount required.' });
  if (numAmount > godmodeConfig.walletAdjustment.maxPerActionETB) return res.status(400).json({ success: false, message: `Max adjustment is ${godmodeConfig.walletAdjustment.maxPerActionETB} ETB.` });
  if (!reason || reason.trim().length < godmodeConfig.walletAdjustment.reasonMinLength) return res.status(400).json({ success: false, message: `Reason must be at least ${godmodeConfig.walletAdjustment.reasonMinLength} characters.` });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    /* Lock wallet for update */
    const walletRes = await client.query('SELECT current_balance FROM affiliate_wallets WHERE user_id = $1 FOR UPDATE', [userId]);
    if (walletRes.rows.length === 0) throw new Error('Wallet not found.');

    const currentBalance = parseFloat(walletRes.rows[0].current_balance);
    const newBalance = currentBalance + numAmount;

    if (newBalance < 0) throw new Error('Adjustment would result in a negative balance.');

    /* Apply adjustment */
    await client.query(
      'UPDATE affiliate_wallets SET current_balance = $1, updated_at = NOW() WHERE user_id = $2',
      [newBalance, userId]
    );

    /* Audit log */
    await client.query(
      `INSERT INTO admin_audit_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, 'user.wallet_adjust', 'user', $2, $3, $4, $5)`,
      [admin.adminId, userId, JSON.stringify({ amount: numAmount, reason, newBalance }), req.headers['x-forwarded-for'] || req.socket.remoteAddress || null, req.headers['user-agent'] || null]
    );

    await client.query('COMMIT');
    return res.status(200).json({ success: true, message: `Wallet adjusted by ${numAmount} ETB.`, data: { newBalance } });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(400).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
}