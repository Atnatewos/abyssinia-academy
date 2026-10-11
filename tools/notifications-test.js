/**
 * @fileoverview Notifications End-to-End Test Harness
 *
 * Exercises the full notification stack against the real database:
 *   notify() → unreadCount() → list() → markRead() → cleanup
 *
 * Modes:
 *   node tools/notifications-test.js          full cycle + cleanup
 *   node tools/notifications-test.js --keep   leaves 1 unread row for UI check
 *   node tools/notifications-test.js --clean  deletes all test-user notifications
 *
 * Test user resolved by phone from env (falls back to MLM seed user).
 *
 * Path: tools/notifications-test.js
 */
require('dotenv').config({
  path: require('path').join(__dirname, '..', 'apps', 'api', '.env'),
});

const { Pool } = require('pg');
const service = require('../packages/shared/notifications');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const query = (text, params) => pool.query(text, params);
const TEST_PHONE = process.env.NOTIFICATIONS_TEST_PHONE || '9990000001';
const keepRow = process.argv.includes('--keep');
const cleanOnly = process.argv.includes('--clean');

const main = async () => {
  const userResult = await query(
    'SELECT id, full_name FROM users WHERE phone = $1 LIMIT 1',
    [TEST_PHONE]
  );
  if (userResult.rows.length === 0) {
    throw new Error(`Test user with phone ${TEST_PHONE} not found`);
  }
  const userId = userResult.rows[0].id;
  console.log(`👤 Test user: ${userResult.rows[0].full_name}`);

  if (cleanOnly) {
    const deleted = await query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    console.log(`🧹 Removed ${deleted.rowCount} notification(s)`);
    return;
  }

  const inserted = await service.notify(
    query,
    userId,
    'payment_approved',
    { amount: 1000, method: 'Telebirr' },
    '/profile/payments'
  );
  console.log(`✅ notify() inserted: ${inserted.id}`);

  const unread = await service.unreadCount(query, userId);
  console.log(`✅ unreadCount(): ${unread}`);

  const listed = await service.list(query, userId, { page: 1, pageSize: 5 });
  const first = listed.notifications[0];
  console.log(
    `✅ list(): ${listed.notifications.length} row(s) | icon=${first?.icon} | severity=${first?.severity} | title_key=${first?.title_key}`
  );

  await service.markRead(query, userId, inserted.id);
  const unreadAfter = await service.unreadCount(query, userId);
  console.log(`✅ markRead(): unread now ${unreadAfter}`);

  if (keepRow) {
    await service.notify(
      query,
      userId,
      'bonus_awarded',
      { bonusName: 'Direct Referral — 5', amount: 1000 },
      '/profile/referrals'
    );
    console.log('📬 Left 1 unread notification — check the bell in your browser!');
  } else {
    await query('DELETE FROM notifications WHERE user_id = $1', [userId]);
    console.log('🧹 Cleaned up test rows');
  }
};

main()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error.message);
    pool.end();
    process.exit(1);
  });
