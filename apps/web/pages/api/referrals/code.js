/**
 * Referral Code API
 * 
 * Generates and retrieves user's referral code with:
 * - Automatic code generation on first access
 * - Referral link building with domain detection
 * - Basic stats for quick display
 * 
 * Security: JWT authentication, rate limiting
 * Performance: Cached code lookup, parallel stat queries
 */

import { query } from '../../../lib/db';
import jwt from 'jsonwebtoken';
import { getReferralConfig } from '../../../lib/config';
import { buildReferralUrl } from '../../../lib/url';
import { checkRateLimit } from '../../../lib/rateLimiter';

/**
 * Generate cryptographically secure referral code
 * @param {Object} config - Code generation config
 * @returns {string} Generated referral code
 */
const generateReferralCode = (config) => {
  const { length = 8, prefix = 'ABY', charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', excludeSimilar = true } = config;
  
  // Remove similar characters to prevent confusion
  let chars = charset;
  if (excludeSimilar) {
    chars = chars.replace(/[0O1IL]/g, '');
  }
  
  const randomLength = Math.max(0, length - prefix.length);
  let result = prefix;
  
  // Use crypto for secure random generation
  const crypto = require('crypto');
  for (let i = 0; i < randomLength; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    result += chars[randomIndex];
  }
  
  return result;
};

/**
 * Generate unique referral code with collision detection
 * @param {Object} config - Code generation config
 * @param {number} maxAttempts - Maximum generation attempts
 * @returns {Promise<string>} Unique referral code
 * @throws {Error} If unable to generate unique code
 */
const generateUniqueCode = async (config, maxAttempts = 10) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateReferralCode(config);
    
    const existing = await query(
      'SELECT id FROM referral_codes WHERE code = $1 LIMIT 1',
      [code]
    );
    
    if (existing.rows.length === 0) {
      return code;
    }
  }
  
  throw new Error(`Failed to generate unique referral code after ${maxAttempts} attempts`);
};

/**
 * Ensure user has a referral code (create if missing)
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Referral code record
 */
const ensureReferralCode = async (userId) => {
  // Check if code exists
  const existing = await query(
    'SELECT code, is_active, created_at FROM referral_codes WHERE user_id = $1',
    [userId]
  );
  
  if (existing.rows.length > 0) {
    return existing.rows[0];
  }
  
  // Generate new code
  try {
    const config = getReferralConfig();
    const codeConfig = config.codeGeneration || {};
    const newCode = await generateUniqueCode(codeConfig);
    
    await query(
      'INSERT INTO referral_codes (user_id, code) VALUES ($1, $2)',
      [userId, newCode]
    );
    
    const inserted = await query(
      'SELECT code, is_active, created_at FROM referral_codes WHERE user_id = $1',
      [userId]
    );
    
    return inserted.rows[0] || { 
      code: newCode, 
      is_active: true, 
      created_at: new Date() 
    };
    
  } catch (error) {
    console.error('Referral code generation failed:', {
      userId,
      error: error.message
    });
    
    return { code: null, is_active: false, created_at: null };
  }
};

/**
 * Get basic referral statistics
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Basic stats
 */
const getBasicStats = async (userId) => {
  const [walletResult, treeResult, bonusResult] = await Promise.all([
    query(
      `SELECT 
        COALESCE(current_balance, 0) as current_balance,
        COALESCE(pending_withdrawal, 0) as pending_withdrawal
      FROM affiliate_wallets
      WHERE user_id = $1`,
      [userId]
    ),
    query(
      `SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN depth = 1 THEN 1 END) as direct_referrals
      FROM referral_tree
      WHERE ancestor_id = $1`,
      [userId]
    ),
    query(
      `SELECT COALESCE(SUM(amount), 0) as total_bonuses
      FROM referral_bonuses
      WHERE user_id = $1`,
      [userId]
    )
  ]);
  
  const wallet = walletResult.rows[0] || {};
  const tree = treeResult.rows[0] || {};
  const bonuses = bonusResult.rows[0] || {};
  
  return {
    currentBalance: parseFloat(wallet.current_balance || 0),
    pendingWithdrawal: parseFloat(wallet.pending_withdrawal || 0),
    totalReferrals: parseInt(tree.total_referrals || 0),
    directReferrals: parseInt(tree.direct_referrals || 0),
    totalBonuses: parseFloat(bonuses.total_bonuses || 0)
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
  
  // Rate limiting: 10 requests per minute per user
  const rateLimitKey = `referral_code:${userId}`;
  const rateLimited = await checkRateLimit(rateLimitKey, 10, 60);
  
  if (rateLimited) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.'
    });
  }
  
  try {
    // Ensure referral code exists
    const referralCode = await ensureReferralCode(userId);
    
    if (!referralCode.code) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate referral code'
      });
    }
    
    // Build referral URL with domain detection
    const referralLink = buildReferralUrl(referralCode.code, req);
    
    // Get basic stats
    const stats = await getBasicStats(userId);
    
    return res.status(200).json({
      success: true,
      data: {
        code: referralCode.code,
        link: referralLink,
        isActive: referralCode.is_active,
        createdAt: referralCode.created_at,
        stats,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Referral code API error:', {
      userId,
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      message: 'Failed to load referral code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}