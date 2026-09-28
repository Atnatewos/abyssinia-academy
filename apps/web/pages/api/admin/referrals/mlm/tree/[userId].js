/**
 * @fileoverview Admin MLM Tree API
 *
 * GET /api/admin/referrals/mlm/tree/[userId]
 *
 * Returns the complete downline referral tree for a specific user.
 * Includes user profile info and nested tree structure.
 *
 * Requires admin JWT authentication.
 *
 * Path: apps/web/pages/api/admin/referrals/mlm/tree/[userId].js
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech')
    ? { rejectUnauthorized: false }
    : false,
});

/**
 * Verifies the admin JWT from the Authorization header.
 * @param {object} req - Next.js request object
 * @returns {object|null} Decoded token or null
 */
const verifyAdminToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  try {
    return jwt.verify(authHeader.split(' ')[1], process.env.JWT_ADMIN_SECRET);
  } catch {
    return null;
  }
};

/**
 * Builds a nested tree structure from flat descendant rows.
 * @param {Array} rows - Flat descendant rows with depth
 * @returns {Array} Nested tree array
 */
const buildNestedTree = (rows) => {
  const nodeMap = new Map();
  const roots = [];

  rows.forEach((row) => {
    nodeMap.set(row.descendant_id, {
      userId: row.descendant_id,
      fullName: row.full_name,
      phone: row.phone,
      depth: row.depth,
      joinedAt: row.created_at,
      earningsFromUser: parseFloat(row.total_earnings || 0),
      children: [],
    });
  });

  rows.forEach((row) => {
    const node = nodeMap.get(row.descendant_id);
    if (!node) return;

    if (row.depth === 1) {
      roots.push(node);
    } else {
      const parentId = row.parent_id;
      const parent = nodeMap.get(parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  return roots;
};

export default async function handler(req, res) {

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const admin = verifyAdminToken(req);
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID is required.' });
  }

  try {
    /*
     * Verify the target user exists
     */
    const userResult = await pool.query(
      `SELECT id, full_name, phone, email, direct_referral_count, total_team_size
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = userResult.rows[0];

    /*
     * Fetch all descendants with their profile info and earnings
     */
    const descendantsResult = await pool.query(
      `SELECT
         rt.descendant_id,
         rt.depth,
         rt.created_at,
         u.full_name,
         u.phone,
         COALESCE(
           (SELECT SUM(commission_amount)
            FROM affiliate_commissions ac
            WHERE ac.source_user_id = rt.descendant_id
              AND ac.earning_user_id = $1
              AND ac.status IN ('credited', 'unlocked', 'paid')), 0
         )::numeric AS total_earnings,
         LAG(rt.descendant_id) OVER (PARTITION BY rt.depth ORDER BY rt.created_at) AS parent_id
       FROM referral_tree rt
       JOIN users u ON u.id = rt.descendant_id
       WHERE rt.ancestor_id = $1
       ORDER BY rt.depth ASC, rt.created_at ASC`,
      [userId]
    );

    const tree = buildNestedTree(descendantsResult.rows);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: targetUser.id,
          fullName: targetUser.full_name,
          phone: targetUser.phone,
          email: targetUser.email,
          directReferralCount: targetUser.direct_referral_count || 0,
          totalTeamSize: targetUser.total_team_size || 0,
        },
        tree,
        totalDescendants: descendantsResult.rows.length,
      },
    });

  } catch (error) {
    console.error('Admin MLM tree error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to load referral tree.',
    });
  }
}