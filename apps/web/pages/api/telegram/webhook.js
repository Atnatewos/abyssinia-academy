/**
 * @fileoverview Telegram Bot Webhook Handler
 * Receives messages from Telegram, verifies admin, routes commands.
 * Path: apps/web/pages/api/telegram/webhook.js
 */

import { Pool } from 'pg';
import {
  sendMessage,
  sendMessageWithKeyboard,
  answerCallback,
  formatCurrency,
  escapeHtml,
} from '../../../lib/telegram';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});

/*
 * Only this Telegram user ID can use the bot
 * Get your ID from @userinfobot on Telegram
 */
const ADMIN_TELEGRAM_ID = process.env.TELEGRAM_ADMIN_ID;

/*
 * ── COMMAND HANDLERS ──
 */

/**
 * /start — Welcome message
 */
const handleStart = async (chatId) => {
  const message = [
    '🤖 <b>Abyssinia Admin Bot</b>',
    '',
    'Welcome! Quick commands:',
    '',
    '/dashboard — Quick stats overview',
    '/pending — Pending payments list',
    '/recent — Last 5 registered users',
    '/help — All commands',
    '',
    'Use inline buttons below each payment to approve or reject.',
  ].join('\n');

  const buttons = [
    [
      { text: '📊 Dashboard', callback_data: 'cmd_dashboard' },
      { text: '⏳ Pending', callback_data: 'cmd_pending' },
    ],
    [
      { text: '🆕 Recent Users', callback_data: 'cmd_recent' },
      { text: '❓ Help', callback_data: 'cmd_help' },
    ],
  ];

  await sendMessageWithKeyboard(chatId, message, buttons);
};

/**
 * /dashboard — Quick stats
 */
const handleDashboard = async (chatId) => {
  const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
  const pendingPayments = await pool.query("SELECT COUNT(*) FROM payments WHERE status = 'pending'");
  const approvedPayments = await pool.query("SELECT COUNT(*) FROM payments WHERE status = 'approved'");
  const revenue = await pool.query("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'approved'");
  const todayVisitors = await pool.query(
    'SELECT COUNT(DISTINCT visitor_hash) FROM page_views WHERE created_at >= CURRENT_DATE'
  );

  const message = [
    '📊 <b>Dashboard</b>',
    '',
    `👥 Total Users: <b>${totalUsers.rows[0].count}</b>`,
    `⏳ Pending Payments: <b>${pendingPayments.rows[0].count}</b>`,
    `✅ Approved Payments: <b>${approvedPayments.rows[0].count}</b>`,
    `💰 Total Revenue: <b>${formatCurrency(revenue.rows[0].coalesce)}</b>`,
    `👁️ Today\'s Visitors: <b>${todayVisitors.rows[0].count}</b>`,
  ].join('\n');

  await sendMessage(chatId, message);
};

/**
 * /pending — List pending payments with approve/reject buttons
 */
const handlePending = async (chatId) => {
  const result = await pool.query(
    `SELECT p.id, p.amount, p.method, p.reference, p.created_at,
            u.full_name, u.phone
     FROM payments p
     JOIN users u ON u.id = p.user_id
     WHERE p.status = 'pending'
     ORDER BY p.created_at DESC
     LIMIT 10`
  );

  if (result.rows.length === 0) {
    await sendMessage(chatId, '✅ No pending payments.');
    return;
  }

  await sendMessage(chatId, `⏳ <b>Pending Payments (${result.rows.length})</b>`);

  for (const payment of result.rows) {
    const shortId = payment.id.substring(0, 8);
    const date = new Date(payment.created_at).toLocaleDateString();

    const message = [
      `🆔 <code>${shortId}</code>`,
      `👤 ${escapeHtml(payment.full_name)}`,
      `📱 ${escapeHtml(payment.phone)}`,
      `💳 ${payment.method} · ${formatCurrency(payment.amount)}`,
      `📅 ${date}`,
      `🔖 Ref: ${escapeHtml(payment.reference || 'N/A')}`,
    ].join('\n');

    const buttons = [[
      { text: '✅ Approve', callback_data: `approve_${payment.id}` },
      { text: '❌ Reject', callback_data: `reject_${payment.id}` },
    ]];

    await sendMessageWithKeyboard(chatId, message, buttons);
  }
};

/**
 * /recent — Last 5 registered users
 */
const handleRecent = async (chatId) => {
  const result = await pool.query(
    `SELECT full_name, phone, is_enrolled, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 5`
  );

  if (result.rows.length === 0) {
    await sendMessage(chatId, 'No users registered yet.');
    return;
  }

  const lines = result.rows.map((user, i) => {
    const status = user.is_enrolled ? '✅' : '🆕';
    const date = new Date(user.created_at).toLocaleDateString();
    return `${status} ${escapeHtml(user.full_name)} · ${escapeHtml(user.phone)} · ${date}`;
  });

  await sendMessage(chatId, ['🆕 <b>Recent Users</b>', '', ...lines].join('\n'));
};

/**
 * /help — Show all commands
 */
const handleHelp = async (chatId) => {
  const message = [
    '❓ <b>Available Commands</b>',
    '',
    '/start — Welcome menu with quick buttons',
    '/dashboard — Users, payments, revenue, visitors',
    '/pending — Pending payments with approve/reject',
    '/approve (id) — Approve a payment by short ID',
    '/recent — Last 5 registered users',
    '/stats — Same as dashboard',
    '/help — This message',
  ].join('\n');

  await sendMessage(chatId, message);
};

/**
 * Approve a payment by ID
 */
const handleApprove = async (chatId, paymentId) => {
  try {
    const result = await pool.query(
      `UPDATE payments SET status = 'approved', paid_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND status = 'pending'
       RETURNING id, amount`,
      [paymentId]
    );

    if (result.rows.length === 0) {
      await sendMessage(chatId, '⚠️ Payment not found or already processed.');
      return;
    }

    const payment = result.rows[0];

    /*
     * Mark user as enrolled
     */
    await pool.query(
      `UPDATE users SET is_enrolled = true, payment_status = 'approved',
       enrolled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = (SELECT user_id FROM payments WHERE id = $1)`,
      [paymentId]
    );

    /*
     * Create enrollment record
     */
    const paymentData = await pool.query('SELECT * FROM payments WHERE id = $1', [paymentId]);

    if (paymentData.rows.length > 0) {
      const p = paymentData.rows[0];
      const purchaseMode = p.purchase_mode || 'full-course';
      const selectedPhases = purchaseMode === 'full-course' ? null : (p.selected_phases || null);

      await pool.query('DELETE FROM enrollments WHERE user_id = $1', [p.user_id]);

      await pool.query(
        `INSERT INTO enrollments (user_id, purchase_mode, selected_phases, purchase_amount, payment_id, enrolled_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [p.user_id, purchaseMode, selectedPhases, p.amount, paymentId]
      );
    }

    await sendMessage(chatId, `✅ Payment <code>${paymentId.substring(0, 8)}</code> approved! (${formatCurrency(payment.amount)})`);
  } catch (error) {
    console.error('Approve error:', error.message);
    await sendMessage(chatId, '❌ Failed to approve payment.');
  }
};

/**
 * Reject a payment by ID
 */
const handleReject = async (chatId, paymentId) => {
  try {
    const result = await pool.query(
      `UPDATE payments SET status = 'rejected'
       WHERE id = $1 AND status = 'pending'
       RETURNING id, amount`,
      [paymentId]
    );

    if (result.rows.length === 0) {
      await sendMessage(chatId, '⚠️ Payment not found or already processed.');
      return;
    }

    await pool.query(
      `UPDATE users SET payment_status = 'rejected', updated_at = CURRENT_TIMESTAMP
       WHERE id = (SELECT user_id FROM payments WHERE id = $1)`,
      [paymentId]
    );

    await sendMessage(chatId, `❌ Payment <code>${paymentId.substring(0, 8)}</code> rejected.`);
  } catch (error) {
    console.error('Reject error:', error.message);
    await sendMessage(chatId, '❌ Failed to reject payment.');
  }
};

/*
 * ── MAIN HANDLER ──
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true });
  }

  try {
    const body = req.body;
    console.log('📩 Telegram webhook:', JSON.stringify(body).substring(0, 500));

    /*
     * Handle inline button callbacks
     */
    if (body.callback_query) {
      const callback = body.callback_query;
      const chatId = callback.message.chat.id;
      const senderId = String(callback.from.id);
      const data = callback.data;

      if (ADMIN_TELEGRAM_ID && senderId !== ADMIN_TELEGRAM_ID) {
        await answerCallback(callback.id, 'Unauthorized');
        return res.status(200).json({ ok: true });
      }

      if (data === 'cmd_dashboard') {
        await handleDashboard(chatId);
      } else if (data === 'cmd_pending') {
        await handlePending(chatId);
      } else if (data === 'cmd_recent') {
        await handleRecent(chatId);
      } else if (data === 'cmd_help') {
        await handleHelp(chatId);
      } else if (data.startsWith('approve_')) {
        const paymentId = data.replace('approve_', '');
        await handleApprove(chatId, paymentId);
        await answerCallback(callback.id, 'Approved!');
      } else if (data.startsWith('reject_')) {
        const paymentId = data.replace('reject_', '');
        await handleReject(chatId, paymentId);
        await answerCallback(callback.id, 'Rejected!');
      }

      return res.status(200).json({ ok: true });
    }

    /*
     * Handle text messages
     */
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const senderId = String(body.message.from.id);
      const text = body.message.text.trim();

      /*
       * Verify sender is the admin
       */
      if (ADMIN_TELEGRAM_ID && senderId !== ADMIN_TELEGRAM_ID) {
        await sendMessage(chatId, '⛔ Unauthorized. This bot is private.');
        return res.status(200).json({ ok: true });
      }

      /*
       * Route commands
       */
      if (text === '/start') {
        await handleStart(chatId);
      } else if (text === '/dashboard' || text === '/stats') {
        await handleDashboard(chatId);
      } else if (text === '/pending') {
        await handlePending(chatId);
      } else if (text === '/recent') {
        await handleRecent(chatId);
      } else if (text === '/help') {
        await handleHelp(chatId);
      } else if (text.startsWith('/approve')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
          await handleApprove(chatId, parts[1]);
        } else {
          await sendMessage(chatId, 'Usage: /approve <payment_id>');
        }
      } else {
        await sendMessage(chatId, 'Unknown command. Type /help for available commands.');
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error.message);
    return res.status(200).json({ ok: true });
  }
}
