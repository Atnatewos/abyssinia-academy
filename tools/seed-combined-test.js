/**
 * @fileoverview Seed Combined Test Data
 * Auto-detects a valid user to inject one MLM commission and one Agent commission.
 * 
 * Usage: node tools/seed-combined-test.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', 'apps', 'web', '.env.local') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    /* 1. Find the most recently registered user with a referral code */
    const userRes = await client.query(`
      SELECT u.id, u.full_name, u.phone 
      FROM users u 
      JOIN referral_codes rc ON rc.user_id = u.id 
      ORDER BY u.created_at DESC 
      LIMIT 1
    `);
    
    if (userRes.rows.length === 0) {
      throw new Error('No users with referral codes found. Please register an account on the UI first.');
    }
    const user = userRes.rows[0];
    console.log(`✅ Target User: ${user.full_name} (${user.phone}) - ID: ${user.id}`);

    /* 2. Find a random other user to be the "buyer" */
    const buyerRes = await client.query('SELECT id FROM users WHERE id != $1 LIMIT 1', [user.id]);
    if (buyerRes.rows.length === 0) throw new Error('Need at least one other user in the DB.');
    const buyerId = buyerRes.rows[0].id;

    /* 3. Ensure target has an agent code (Phase 3 does this, but just in case) */
    await client.query(
      `INSERT INTO agent_codes (user_id, code, is_active) 
       VALUES ($1, 'AGT-TEST-' || LEFT(REPLACE($1::text, '-', ''), 4), true) 
       ON CONFLICT (user_id) DO NOTHING`, 
      [user.id]
    );

    /* 4. Generate an Agent Payment (Buyer buys using Target's agent code) */
    const agentPaymentRes = await client.query(
      `INSERT INTO payments (user_id, amount, method, status, reference, agent_id)
       VALUES ($1, 1000, 'telebirr', 'pending', 'TEST-AGENT-123', $2)
       RETURNING id`,
      [buyerId, user.id]
    );
    const agentPaymentId = agentPaymentRes.rows[0].id;
    console.log(`✅ Created Agent Payment: ${agentPaymentId} (Status: pending)`);

    /* 5. Generate an MLM Payment (Buyer buys using Target's referral code) */
    const mlmPaymentRes = await client.query(
      `INSERT INTO payments (user_id, amount, method, status, reference)
       VALUES ($1, 1000, 'telebirr', 'pending', 'TEST-MLM-123')
       RETURNING id`,
      [buyerId]
    );
    const mlmPaymentId = mlmPaymentRes.rows[0].id;
    console.log(`✅ Created MLM Payment: ${mlmPaymentId} (Status: pending)`);

    /* 6. Link the MLM Payment to the Target user in the referral tree */
    await client.query(
      `INSERT INTO referral_tree (ancestor_id, descendant_id, depth) 
       VALUES ($1, $2, 1) 
       ON CONFLICT DO NOTHING`,
      [user.id, buyerId]
    );

    await client.query('COMMIT');
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ Test data seeded successfully!');
    console.log('Copy the IDs below to run the approval command:');
    console.log(`  AGENT_ID=${agentPaymentId}`);
    console.log(`  MLM_ID=${mlmPaymentId}`);
    console.log('═══════════════════════════════════════════════════════════════');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    pool.end();
  }
})();