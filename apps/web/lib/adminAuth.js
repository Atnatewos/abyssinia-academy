/**
 * @fileoverview Admin JWT Verification (Next.js API routes only)
 *
 * Single source of truth for admin token verification across every
 * `pages/api/admin/*` handler. Server-only: imports `jsonwebtoken`,
 * which must never reach the client bundle.
 *
 * The signing secret is shared with the Express API (`JWT_ADMIN_SECRET`)
 * so an admin token issued by either backend verifies on both.
 *
 * Path: apps/web/lib/adminAuth.js
 */

import jwt from 'jsonwebtoken';

/**
 * Algorithm pinned explicitly to prevent algorithm-confusion attacks
 * (e.g. a forged token claiming `alg: none` or an asymmetric algorithm).
 */
const ADMIN_TOKEN_ALGORITHMS = ['HS256'];

/**
 * Authentication error carrying an HTTP status for clean routing
 * in API handler catch blocks.
 */
export class AdminAuthError extends Error {
  /**
   * @param {string} message - Client-safe error description
   * @param {number} [status=401] - HTTP status code
   */
  constructor(message, status = 401) {
    super(message);
    this.name = 'AdminAuthError';
    this.status = status;
  }
}

/**
 * Validate and decode an admin JWT from the Authorization header.
 *
 * @param {string|undefined} authHeader - Raw Authorization header value
 * @returns {{ adminId: string, role: string, iat: number, exp: number }}
 * @throws {AdminAuthError} With `.status` set for the handler catch block
 */
export const verifyAdminToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AdminAuthError('Missing or malformed Authorization header', 401);
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new AdminAuthError('Missing admin token', 401);
  }

  const adminSecret = process.env.JWT_ADMIN_SECRET;
  if (!adminSecret) {
    throw new AdminAuthError('JWT_ADMIN_SECRET is not configured on the server', 500);
  }

  let payload;
  try {
    payload = jwt.verify(token, adminSecret, {
      algorithms: ADMIN_TOKEN_ALGORITHMS,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AdminAuthError('Admin token expired', 401);
    }
    throw new AdminAuthError('Invalid admin token', 401);
  }

  if (!payload || typeof payload !== 'object' || !payload.adminId) {
    throw new AdminAuthError('Invalid admin token payload', 401);
  }

  return payload;
};