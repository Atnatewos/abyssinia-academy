/**
 * @fileoverview Admin Database Queries
 * Admin authentication and management queries
 * Path: apps/api/src/database/queries/admins.js
 */

const { query } = require('../pool');

/**
 * Find admin by username
 * @param {string} username - Admin username
 * @returns {object|null} Admin object
 */
const findAdminByUsername = async (username) => {
  const result = await query(
    'SELECT * FROM admins WHERE username = $1',
    [username]
  );
  return result.rows[0] || null;
};

/**
 * Find admin by ID
 * @param {string} id - Admin UUID
 * @returns {object|null} Admin object
 */
const findAdminById = async (id) => {
  const result = await query(
    'SELECT id, username, email, role, created_at FROM admins WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Update admin last login timestamp
 * @param {string} id - Admin UUID
 * @returns {object} Updated admin
 */
const updateAdminLastLogin = async (id) => {
  await query(
    'UPDATE admins SET last_login = NOW() WHERE id = $1',
    [id]
  );
};

/**
 * Create a new admin (superadmin only)
 * @param {object} adminData - Admin data
 * @returns {object} Created admin
 */
const createAdmin = async ({ username, email, password, role }) => {
  const result = await query(
    `INSERT INTO admins (username, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, role, created_at`,
    [username, email, password, role]
  );
  return result.rows[0];
};

module.exports = {
  findAdminByUsername,
  findAdminById,
  updateAdminLastLogin,
  createAdmin,
};