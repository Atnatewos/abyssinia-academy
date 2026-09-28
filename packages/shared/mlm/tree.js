/**
 * @fileoverview MLM Referral Tree Builder
 *
 * Creates the ancestor-descendant entries in the closure table
 * (referral_tree) for a newly registered user, and updates the cached
 * counters on each ancestor (direct_referral_count, total_team_size).
 *
 * All database access flows through the injected `db` object.
 *
 * Path: packages/shared/mlm/tree.js
 */

const {
  BadRequestError,
  NotFoundError,
} = require('./errors');

/**
 * Build the referral tree entries for a newly registered user.
 *
 * Creates depth-1 through depth-N (N = maxLevels) entries by copying
 * the referrer's ancestors one level deeper. Also:
 *   - Sets referred_by_user_id on the new user
 *   - Increments direct_referral_count on the direct referrer
 *   - Increments total_team_size on every ancestor (deduped)
 *   - Ensures the new user has a wallet row
 *
 * Idempotent: ON CONFLICT DO NOTHING on tree inserts.
 *
 * @param {object} db - { query, getClient }
 * @param {object} config - The referrals config object
 * @param {string} newUserId - UUID of the newly registered user
 * @param {string} referrerId - UUID of the direct referrer
 * @returns {Promise<{depth: number, ancestorsUpdated: number}>}
 */
const buildReferralTree = async (db, config, newUserId, referrerId) => {
  if (!db || typeof db.query !== 'function' || typeof db.getClient !== 'function') {
    throw new BadRequestError('A valid db object with query and getClient is required.');
  }
  if (!config || !config.commissionStructure) {
    throw new BadRequestError('Referrals config is missing commissionStructure.');
  }
  if (!newUserId || !referrerId) {
    throw new BadRequestError('Both newUserId and referrerId are required.');
  }
  if (newUserId === referrerId) {
    throw new BadRequestError('A user cannot refer themselves.');
  }

  const maxLevels = config.commissionStructure.maxLevels || 4;

  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    /* Confirm referrer exists. */
    const referrerResult = await client.query(
      'SELECT id, full_name, phone FROM users WHERE id = $1',
      [referrerId]
    );
    if (referrerResult.rows.length === 0) {
      throw new NotFoundError('Referrer not found.');
    }

    /* Set direct referrer on the new user. */
    await client.query(
      `UPDATE users SET referred_by_user_id = $2, updated_at = NOW() WHERE id = $1`,
      [newUserId, referrerId]
    );

    /* Depth 1: direct referrer. */
    await client.query(
      `INSERT INTO referral_tree (ancestor_id, descendant_id, depth)
       VALUES ($1, $2, 1)
       ON CONFLICT (ancestor_id, descendant_id) DO NOTHING`,
      [referrerId, newUserId]
    );

    /* Fetch referrer's ancestors up to maxLevels - 1. */
    const ancestorsResult = await client.query(
      `SELECT ancestor_id, depth FROM referral_tree
       WHERE descendant_id = $1 AND depth <= $2
       ORDER BY depth ASC`,
      [referrerId, maxLevels - 1]
    );

    for (const ancestor of ancestorsResult.rows) {
      const newDepth = ancestor.depth + 1;
      if (newDepth > maxLevels) continue;

      await client.query(
        `INSERT INTO referral_tree (ancestor_id, descendant_id, depth)
         VALUES ($1, $2, $3)
         ON CONFLICT (ancestor_id, descendant_id) DO NOTHING`,
        [ancestor.ancestor_id, newUserId, newDepth]
      );
    }

    /* Increment direct referral count on the direct referrer. */
    await client.query(
      `UPDATE users
       SET direct_referral_count = direct_referral_count + 1, updated_at = NOW()
       WHERE id = $1`,
      [referrerId]
    );

    /* Increment team size on every ancestor (deduped). */
    const uniqueAncestorIds = new Set([
      referrerId,
      ...ancestorsResult.rows.map((a) => a.ancestor_id),
    ]);

    for (const ancestorId of uniqueAncestorIds) {
      await client.query(
        `UPDATE users
         SET total_team_size = total_team_size + 1, updated_at = NOW()
         WHERE id = $1`,
        [ancestorId]
      );
    }

    /* Ensure the new user has a wallet. */
    await client.query(
      `INSERT INTO affiliate_wallets (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [newUserId]
    );

    await client.query('COMMIT');

    return {
      depth: 1 + ancestorsResult.rows.length,
      ancestorsUpdated: uniqueAncestorIds.size,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { buildReferralTree };