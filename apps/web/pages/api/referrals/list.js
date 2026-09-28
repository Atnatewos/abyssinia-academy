/**
 * Referral List API
 * 
 * Provides paginated list of user's referrals with:
 * - Referral details (name, status, join date)
 * - Commission earned from each referral
 * - Filtering by status and level
 * - Search functionality
 * 
 * Security: JWT authentication, user-scoped data
 * Performance: Cursor-based pagination, indexed queries
 */

import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';

/**
 * Build dynamic WHERE clause for filtering
 * @param {Object} filters - Filter parameters
 * @returns {Object} SQL WHERE clause and parameters
 */
const buildFilterClause = (filters) => {
  const conditions = ['rt.ancestor_id = $1'];
  const params = [filters.userId];
  let paramIndex = 2;
  
  // Filter by status
  if (filters.status && filters.status !== 'all') {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (validStatuses.includes(filters.status)) {
      conditions.push(`p.status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }
  }
  
  // Filter by level
  if (filters.level && filters.level !== 'all') {
    const level = parseInt(filters.level);
    if (level >= 1 && level <= 4) {
      conditions.push(`rt.depth = $${paramIndex}`);
      params.push(level);
      paramIndex++;
    }
  }
  
  // Search by name or phone
  if (filters.search && filters.search.trim()) {
    const searchTerm = `%${filters.search.trim()}%`;
    conditions.push(`(u.full_name ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex})`);
    params.push(searchTerm);
    paramIndex++;
  }
  
  return {
    where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
};

/**
 * Get paginated referral list
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated referrals
 */
const getReferralList = async (options) => {
  const { where, params } = buildFilterClause(options);
  
  // Calculate offset for pagination
  const offset = (options.page - 1) * options.limit;
  
  // Get total count
  const countResult = await query(
    `SELECT COUNT(DISTINCT rt.descendant_id) as total
    FROM referral_tree rt
    JOIN users u ON u.id = rt.descendant_id
    LEFT JOIN payments p ON p.user_id = rt.descendant_id
    ${where}`,
    params
  );
  
  const total = parseInt(countResult.rows[0]?.total || 0);
  
  // Get paginated results
  const result = await query(
    `SELECT DISTINCT
      rt.descendant_id as user_id,
      rt.depth as level,
      u.full_name,
      u.phone,
      u.email,
      u.created_at as joined_at,
      COALESCE(p.status, 'no_payment') as payment_status,
      COALESCE(p.amount, 0) as payment_amount,
      p.paid_at,
      COALESCE(
        (SELECT SUM(commission_amount) 
         FROM affiliate_commissions 
         WHERE source_user_id = rt.descendant_id 
           AND earning_user_id = $1
           AND status = 'credited'), 
        0
      ) as commission_earned,
      COALESCE(
        (SELECT COUNT(*) 
         FROM affiliate_commissions 
         WHERE source_user_id = rt.descendant_id 
           AND earning_user_id = $1
           AND status = 'credited'), 
        0
      ) as commission_count
    FROM referral_tree rt
    JOIN users u ON u.id = rt.descendant_id
    LEFT JOIN payments p ON p.user_id = rt.descendant_id
    ${where}
    ORDER BY 
      CASE 
        WHEN p.status = 'approved' THEN 1
        WHEN p.status = 'pending' THEN 2
        ELSE 3
      END,
      rt.depth ASC,
      u.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, options.limit, offset]
  );
  
  return {
    referrals: result.rows.map(row => ({
      userId: row.user_id,
      level: parseInt(row.level),
      fullName: row.full_name,
      phone: row.phone,
      email: row.email,
      joinedAt: row.joined_at,
      paymentStatus: row.payment_status,
      paymentAmount: parseFloat(row.payment_amount),
      paidAt: row.paid_at,
      commissionEarned: parseFloat(row.commission_earned),
      commissionCount: parseInt(row.commission_count)
    })),
    pagination: {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
      hasNext: options.page * options.limit < total,
      hasPrev: options.page > 1
    }
  };
};

/**
 * Get referral statistics summary
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Statistics summary
 */
const getReferralStats = async (userId) => {
  const result = await query(
    `SELECT 
      rt.depth as level,
      COUNT(DISTINCT rt.descendant_id) as total_referrals,
      COUNT(DISTINCT CASE WHEN p.status = 'approved' THEN rt.descendant_id END) as paying_referrals,
      COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.amount ELSE 0 END), 0) as total_sales
    FROM referral_tree rt
    LEFT JOIN payments p ON p.user_id = rt.descendant_id AND p.status = 'approved'
    WHERE rt.ancestor_id = $1
    GROUP BY rt.depth
    ORDER BY rt.depth`,
    [userId]
  );
  
  const stats = {
    level1: { total: 0, paying: 0, sales: 0 },
    level2: { total: 0, paying: 0, sales: 0 },
    level3: { total: 0, paying: 0, sales: 0 },
    level4: { total: 0, paying: 0, sales: 0 }
  };
  
  let totalReferrals = 0;
  let totalPaying = 0;
  let totalSales = 0;
  
  result.rows.forEach(row => {
    const levelKey = `level${row.level}`;
    if (stats[levelKey]) {
      stats[levelKey] = {
        total: parseInt(row.total_referrals),
        paying: parseInt(row.paying_referrals),
        sales: parseFloat(row.total_sales)
      };
      totalReferrals += parseInt(row.total_referrals);
      totalPaying += parseInt(row.paying_referrals);
      totalSales += parseFloat(row.total_sales);
    }
  });
  
  return {
    byLevel: stats,
    totals: {
      referrals: totalReferrals,
      paying: totalPaying,
      sales: totalSales,
      conversionRate: totalReferrals > 0 
        ? ((totalPaying / totalReferrals) * 100).toFixed(2)
        : '0.00'
    }
  };
};

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
  
  // Authenticate user
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  let decoded;
  try {
    const token = authHeader.split(' ')[1];
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
  
  const userId = decoded.userId;
  
  try {
    // Parse and validate query parameters
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20')));
    const status = req.query.status || 'all';
    const level = req.query.level || 'all';
    const search = req.query.search || '';
    
    // Get referral list and stats in parallel
    const [listData, statsData] = await Promise.all([
      getReferralList({
        userId,
        page,
        limit,
        status,
        level,
        search
      }),
      getReferralStats(userId)
    ]);
    
    return res.status(200).json({
      success: true,
      data: {
        referrals: listData.referrals,
        pagination: listData.pagination,
        statistics: statsData,
        filters: {
          status,
          level,
          search: search || null
        },
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Referral list API error:', {
      userId,
      query: req.query,
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to load referral list',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}