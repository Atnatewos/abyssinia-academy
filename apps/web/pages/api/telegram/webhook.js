/**
 * @fileoverview Telegram Bot Webhook Handler
 * Receives messages from Telegram, verifies admin, routes commands.
 * Every response includes inline keyboard buttons for navigation.
 * Persistent reply keyboard below text input for quick access.
 * Shows full payment details: transaction reference, purchase type,
 * date/time, and screenshot link with clickable button.
 * 
 * Path: apps/web/pages/api/telegram/webhook.js
 */

import { Pool } from 'pg';
import {
  sendMessage,
  sendMessageWithKeyboard,
  sendMessageWithReplyKeyboard,
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
 * Set via TELEGRAM_ADMIN_ID in environment variables
 */
const ADMIN_TELEGRAM_ID = process.env.TELEGRAM_ADMIN_ID;

/*
 * ── MAIN NAVIGATION BUTTONS ──
 */

const MAIN_INLINE_BUTTONS = [
  [
    { text: '📊 Dashboard', callback_data: 'cmd_dashboard' },
    { text: '⏳ Pending', callback_data: 'cmd_pending' },
  ],
  [
    { text: '🆕 Recent Users', callback_data: 'cmd_recent' },
    { text: '❓ Help', callback_data: 'cmd_help' },
  ],
];

const REPLY_KEYBOARD = [
  ['📊 Dashboard', '⏳ Pending'],
  ['🆕 Recent Users', '❓ Help'],
];

/*
 * ── COMMAND HANDLERS ──
 */

/**
 * /start — Welcome message with inline buttons and persistent reply keyboard
 */
const handleStart = async (chatId) => {
  const message = [
    '🤖 <b>Abyssinia Admin Bot</b>',
    '',
    'Welcome! What would you like to do?',
    '',
    'Use the buttons below the text input for quick navigation.',
  ].join('\n');

  await sendMessageWithKeyboard(chatId, message, MAIN_INLINE_BUTTONS);
  await sendMessageWithReplyKeyboard(chatId, 'Quick access:', REPLY_KEYBOARD);
};

/**
 * /dashboard — Quick stats overview with navigation buttons
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

  const buttons = [
    [
      { text: '⏳ View Pending', callback_data: 'cmd_pending' },
    ],
    [
      { text: '🔄 Refresh Stats', callback_data: 'cmd_dashboard' },
    ],
    [
      { text: '🏠 Main Menu', callback_data: 'cmd_start' },
    ],
  ];

  await sendMessageWithKeyboard(chatId, message, buttons);
};

/**
 * /pending — List pending payments with full details and approve/reject buttons
 */
const handlePending = async (chatId) => {
  const result = await pool.query(
    `SELECT p.id, p.amount, p.method, p.reference, p.transaction_id, p.created_at,
            p.purchase_mode, p.selected_phases,
            u.full_name, u.phone
     FROM payments p
     JOIN users u ON u.id = p.user_id
     WHERE p.status = 'pending'
     ORDER BY p.created_at DESC
     LIMIT 10`
  );

  if (result.rows.length === 0) {
    const buttons = [
      [
        { text: '📊 Dashboard', callback_data: 'cmd_dashboard' },
        { text: '🔄 Refresh', callback_data: 'cmd_pending' },
      ],
      [
        { text: '🏠 Main Menu', callback_data: 'cmd_start' },
      ],
    ];
    await sendMessageWithKeyboard(chatId, '✅ No pending payments.', buttons);
    return;
  }

  await sendMessage(chatId, `⏳ <b>Pending Payments (${result.rows.length})</b>`);

  for (const payment of result.rows) {
    const shortId = payment.id.substring(0, 8);
    const date = new Date(payment.created_at).toLocaleDateString();
    const time = new Date(payment.created_at).toLocaleTimeString();

    /*
     * Build purchase type description
     */
    let purchaseType = 'Full Course';
    if (payment.purchase_mode === 'individual-phases' && payment.selected_phases) {
      const phases = payment.selected_phases
        .map((p) => p.replace('phase-', 'P'))
        .join(', ');
      purchaseType = `Phases: ${phases}`;
    }

    /*
     * Build the message with all payment details
     */
    const message = [
      `🆔 <code>${shortId}</code>`,
      `👤 <b>${escapeHtml(payment.full_name)}</b>`,
      `📱 ${escapeHtml(payment.phone)}`,
      `💳 ${payment.method} · <b>${formatCurrency(payment.amount)}</b>`,
      `📦 ${purchaseType}`,
      `📅 ${date} at ${time}`,
      `🔖 <b>Transaction Ref:</b> ${escapeHtml(payment.reference || 'N/A')}`,
    ];

    /*
     * Add screenshot link if available
     */
    if (payment.transaction_id) {
      message.push('');
      message.push(`📸 <a href="${escapeHtml(payment.transaction_id)}">View Payment Screenshot</a>`);
    }

    const fullMessage = message.join('\n');

    /*
     * Build inline buttons: Approve/Reject + optional Screenshot button
     */
    const buttons = [[
      { text: '✅ Approve', callback_data: `approve_${payment.id}` },
      { text: '❌ Reject', callback_data: `reject_${payment.id}` },
    ]];

    if (payment.transaction_id) {
      buttons.push([
        { text: '📸 View Screenshot', url: payment.transaction_id },
      ]);
    }

    await sendMessageWithKeyboard(chatId, fullMessage, buttons);
  }

  /*
   * After listing all payments, send a navigation footer
   */
  const footerButtons = [
    [
      { text: '📊 Dashboard', callback_data: 'cmd_dashboard' },
      { text: '🔄 Refresh', callback_data: 'cmd_pending' },
    ],
    [
      { text: '🏠 Main Menu', callback_data: 'cmd_start' },
    ],
  ];
  await sendMessageWithKeyboard(chatId, '⬆️ End of pending list. What\'s next?', footerButtons);
};

/**
 * /recent — Last 5 registered users with navigation buttons
 */
const handleRecent = async (chatId) => {
  const result = await pool.query(
    `SELECT full_name, phone, is_enrolled, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT 5`
  );

  if (result.rows.length === 0) {
    const buttons = [
      [{ text: '📊 Dashboard', callback_data: 'cmd_dashboard' }],
      [{ text: '🏠 Main Menu', callback_data: 'cmd_start' }],
    ];
    await sendMessageWithKeyboard(chatId, 'No users registered yet.', buttons);
    return;
  }

  const lines = result.rows.map((user) => {
    const status = user.is_enrolled ? '✅' : '🆕';
    const date = new Date(user.created_at).toLocaleDateString();
    return `${status} ${escapeHtml(user.full_name)} · ${escapeHtml(user.phone)} · ${date}`;
  });

  const message = ['🆕 <b>Recent Users</b>', '', ...lines].join('\n');

  const buttons = [
    [
      { text: '📊 Dashboard', callback_data: 'cmd_dashboard' },
      { text: '⏳ Pending', callback_data: 'cmd_pending' },
    ],
    [
      { text: '🔄 Refresh', callback_data: 'cmd_recent' },
    ],
    [
      { text: '🏠 Main Menu', callback_data: 'cmd_start' },
    ],
  ];

  await sendMessageWithKeyboard(chatId, message, buttons);
};

/**
 * /help — Show all available commands with navigation buttons
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
    '',
    'You can also use the buttons below the text input.',
  ].join('\n');

  await sendMessageWithKeyboard(chatId, message, MAIN_INLINE_BUTTONS);
};

/**
 * Handle unknown commands — show help with buttons
 */
const handleUnknown = async (chatId) => {
  const message = [
    '❓ Unknown command.',
    '',
    'Use the buttons below or type /help.',
  ].join('\n');

  await sendMessageWithKeyboard(chatId, message, MAIN_INLINE_BUTTONS);
};

/**
 * Approve a payment by ID.
 * Creates enrollment record and marks user as enrolled.
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
     * Create enrollment record with correct purchase mode and phases
     */
    const paymentData = await pool.query('SELECT * FROM payments WHERE id = $1', [paymentId]);

    if (paymentData.rows.length > 0) {
      const p = paymentData.rows[0];
      const purchaseMode = p.purchase_mode || 'full-course';
      const selectedPhases = purchaseMode === 'full-course'
        ? null
        : (p.selected_phases || null);

      await pool.query('DELETE FROM enrollments WHERE user_id = $1', [p.user_id]);

      await pool.query(
        `INSERT INTO enrollments (user_id, purchase_mode, selected_phases, purchase_amount, payment_id, enrolled_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [p.user_id, purchaseMode, selectedPhases, p.amount, paymentId]
      );
    }

    const confirmButtons = [
      [
        { text: '📊 Dashboard', callback_data: 'cmd_dashboard' },
        { text: '⏳ More Pending', callback_data: 'cmd_pending' },
      ],
      [
        { text: '🏠 Main Menu', callback_data: 'cmd_start' },
      ],
    ];

    await sendMessageWithKeyboard(
      chatId,
      `✅ Payment <code>${paymentId.substring(0, 8)}</code> approved! (${formatCurrency(payment.amount)})`,
      confirmButtons
    );
  } catch (error) {
    console.error('Approve error:', error.message);
    await sendMessage(chatId, '❌ Failed to approve payment.');
  }
};

/**
 * Reject a payment by ID.
 * Marks payment and user as rejected.
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

    const confirmButtons = [
      [
        { text: '📊 Dashboard', callback_data: 'cmd_dashboard' },
        { text: '⏳ More Pending', callback_data: 'cmd_pending' },
      ],
      [
        { text: '🏠 Main Menu', callback_data: 'cmd_start' },
      ],
    ];

    await sendMessageWithKeyboard(
      chatId,
      `❌ Payment <code>${paymentId.substring(0, 8)}</code> rejected.`,
      confirmButtons
    );
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
     * Handle inline button callbacks (approve, reject, dashboard, etc.)
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

      if (data === 'cmd_start') {
        await handleStart(chatId);
      } else if (data === 'cmd_dashboard') {
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
     * Handle text messages (commands and reply keyboard buttons)
     */
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const senderId = String(body.message.from.id);
      const text = body.message.text.trim();

      if (ADMIN_TELEGRAM_ID && senderId !== ADMIN_TELEGRAM_ID) {
        await sendMessage(chatId, '⛔ Unauthorized. This bot is private.');
        return res.status(200).json({ ok: true });
      }

      /*
       * Handle reply keyboard button presses
       */
      if (text === '📊 Dashboard') {
        await handleDashboard(chatId);
        return res.status(200).json({ ok: true });
      }
      if (text === '⏳ Pending') {
        await handlePending(chatId);
        return res.status(200).json({ ok: true });
      }
      if (text === '🆕 Recent Users') {
        await handleRecent(chatId);
        return res.status(200).json({ ok: true });
      }
      if (text === '❓ Help') {
        await handleHelp(chatId);
        return res.status(200).json({ ok: true });
      }

      /*
       * Handle slash commands
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
        await handleUnknown(chatId);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error.message);
    return res.status(200).json({ ok: true });
  }
}