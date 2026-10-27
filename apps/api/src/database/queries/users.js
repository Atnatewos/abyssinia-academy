/**
 * @fileoverview User Database Queries
 * All user-related PostgreSQL queries with parameterized statements
 * Path: apps/api/src/database/queries/users.js
 */

const { query } = require('../pool');

/**
 * Create a new user
 * @param {object} userData - User registration data
 * @returns {object} Created user
 */
const createUser = async ({ fullName, phone, email, password }) => {
  const result = await query(
    `INSERT INTO users (full_name, phone, email, password)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, phone, email, is_enrolled, payment_status, created_at`,
    [fullName, phone, email, password]
  );
  return result.rows[0];
};

/**
 * Find user by phone number
 * @param {string} phone - User phone number
 * @returns {object|null} User object or null
 */
const findUserByPhone = async (phone) => {
  const result = await query(
    'SELECT * FROM users WHERE phone = $1',
    [phone]
  );
  return result.rows[0] || null;
};

/**
 * Find user by ID
 * @param {string} id - User UUID
 * @returns {object|null} User object or null
 */
const findUserById = async (id) => {
  const result = await query(
    'SELECT id, full_name, phone, email, is_enrolled, payment_status, enrolled_at, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Find user by email
 * @param {string} email - User email
 * @returns {object|null} User object or null
 */
const findUserByEmail = async (email) => {
  if (!email) return null;
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
};

/**
 * Update user enrollment status
 * @param {string} id - User UUID
 * @param {boolean} isEnrolled - Enrollment status
 * @returns {object} Updated user
 */
const updateEnrollmentStatus = async (id, isEnrolled) => {
  const result = await query(
    `UPDATE users 
     SET is_enrolled = $2, enrolled_at = CASE WHEN $2 = true THEN NOW() ELSE enrolled_at END, updated_at = NOW()
     WHERE id = $1
     RETURNING id, full_name, phone, email, is_enrolled, payment_status, enrolled_at`,
    [id, isEnrolled]
  );
  return result.rows[0];
};

/**
 * Update user payment status
 * @param {string} id - User UUID
 * @param {string} status - Payment status
 * @returns {object} Updated user
 */
const updatePaymentStatus = async (id, status) => {
  const result = await query(
    `UPDATE users 
     SET payment_status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, full_name, phone, email, is_enrolled, payment_status`,
    [id, status]
  );
  return result.rows[0];
};

/**
 * Get all users with pagination
 * @param {number} limit - Items per page
 * @param {number} offset - Offset for pagination
 * @returns {object} Users list and total count
 */
const getAllUsers = async (limit, offset) => {
  const result = await query(
    `SELECT id, full_name, phone, email, is_enrolled, payment_status, enrolled_at, created_at
     FROM users
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  
  const countResult = await query('SELECT COUNT(*) FROM users');
  
  return {
    users: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
};

/**
 * Search users by name or phone
 * @param {string} searchTerm - Search query
 * @param {number} limit - Items per page
 * @param {number} offset - Offset for pagination
 * @returns {object} Users list and total count
 */
const searchUsers = async (searchTerm, limit, offset) => {
  const searchPattern = `%${searchTerm}%`;
  const result = await query(
    `SELECT id, full_name, phone, email, is_enrolled, payment_status, enrolled_at, created_at
     FROM users
     WHERE full_name ILIKE $1 OR phone ILIKE $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [searchPattern, limit, offset]
  );
  
  const countResult = await query(
    'SELECT COUNT(*) FROM users WHERE full_name ILIKE $1 OR phone ILIKE $1',
    [searchPattern]
  );
  
  return {
    users: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
};

/**
 * Get user enrollment counts
 * @returns {object} Enrollment statistics
 */
const getUserStats = async () => {
  const result = await query(
    `SELECT 
      COUNT(*) as total_users,
      COUNT(CASE WHEN is_enrolled = true THEN 1 END) as enrolled_users,
      COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
      COUNT(CASE WHEN payment_status = 'approved' THEN 1 END) as approved_payments,
      COUNT(CASE WHEN payment_status = 'rejected' THEN 1 END) as rejected_payments
     FROM users`
  );
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByPhone,
  findUserById,
  findUserByEmail,
  updateEnrollmentStatus,
  updatePaymentStatus,
  getAllUsers,
  searchUsers,
  getUserStats,
};