/**
 * @fileoverview Referral MLM Tree API
 *
 * GET /api/referrals/mlm/tree
 *
 * Returns the authenticated user's downline as a properly nested tree.
 * Node contract (camelCase) consumed by MLMTreeView:
 *   { userId, fullName, phone, joinedAt, depth, earningsFromUser, children }
 *
 * Parent links are resolved with a single lateral join against the
 * closure table (each node's depth-1 ancestor), avoiding N+1 queries.
 *
 * Path: apps/web/pages/api/referrals/mlm/tree.js
 */

import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';

/**
 * Assemble a nested tree from flat descendant rows.
 * Depth-1 rows attach to the root; deeper rows attach to their
 * direct parent resolved via the lateral join (parent_id).
 *
 * @param {Array} rows - Flat normalized descendant rows
 * @param {string} rootUserId - The authenticated user's id
 * @returns {Array} Nested tree roots
 */
const buildNestedTree = (rows, rootUserId) => {
  const nodeMap = new Map();
  const roots = [];

  for (const row of rows) {
    nodeMap.set(row.userId, {
      userId: row.userId,
      fullName: row.fullName,
      phone: row.phone,
      joinedAt: row.joinedAt,
      depth: row.depth,
      earningsFromUser: row.earningsFromUser,
      children: [],
    });
  }

  for (const row of rows) {
    const node = nodeMap.get(row.userId);
    if (!node) continue;

    if (row.depth === 1 || !row.parentId || row.parentId === rootUserId) {
      roots.push(node);
      continue;
    }

    const parent = nodeMap.get(row.parentId);
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

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

  try {
    /*
     * One query fetches: descendant identity, depth, join date, lifetime
     * credited earnings from this descendant, and the direct parent id
     * (depth-1 ancestor) used for nesting.
     */
    const result = await query(
      `SELECT
         rt.descendant_id AS user_id,
         rt.depth,
         u.full_name,
         u.phone,
         u.created_at AS joined_at,
         COALESCE(earn.total, 0)::numeric AS earnings_from_user,
         parent.ancestor_id AS parent_id
       FROM referral_tree rt
       JOIN users u ON u.id = rt.descendant_id
       LEFT JOIN LATERAL (
         SELECT SUM(cc.commission_amount) AS total
         FROM affiliate_commissions cc
         WHERE cc.earning_user_id = $1
           AND cc.source_user_id = rt.descendant_id
           AND cc.status = 'credited'
       ) earn ON true
       LEFT JOIN LATERAL (
         SELECT pa.ancestor_id
         FROM referral_tree pa
         WHERE pa.descendant_id = rt.descendant_id AND pa.depth = 1
         LIMIT 1
       ) parent ON true
       WHERE rt.ancestor_id = $1
       ORDER BY rt.depth ASC, u.full_name ASC`,
      [userId]
    );

    const rows = result.rows.map((row) => ({
      userId: row.user_id,
      fullName: row.full_name,
      phone: row.phone,
      joinedAt: row.joined_at,
      depth: row.depth,
      earningsFromUser: parseFloat(row.earnings_from_user),
      parentId: row.parent_id,
    }));

    res.status(200).json({
      success: true,
      data: {
        tree: buildNestedTree(rows, userId),
        totalDescendants: rows.length,
      },
    });
  } catch (error) {
    console.error('MLM tree error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load tree.' });
  }
}