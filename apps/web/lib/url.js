/**
 * @fileoverview URL Utility — Zero-config domain auto-detection
 * Detects the current platform URL at runtime so you NEVER change
 * anything when switching between localhost, Vercel preview, or production.
 * 
 * How it works:
 * - Browser (client-side): reads window.location.origin
 * - Server (API routes): reads the request Host header
 * - Server (fallback): VERCEL_URL env (auto-set by Vercel)
 * 
 * Result: deploy to any domain, everything just works.
 * 
 * Path: apps/web/lib/url.js
 */

/**
 * Extract the base URL from a request object (server-side API routes).
 * Reads the Host header from the incoming HTTP request — always correct
 * for the domain the user is actually visiting.
 * 
 * @param {object} [req] - Next.js API request object (optional)
 * @returns {string} Base URL with no trailing slash
 */
const getBaseUrlFromRequest = (req) => {
  if (!req || !req.headers) return null;

  const host = req.headers.host || req.headers['x-forwarded-host'];
  const proto = req.headers['x-forwarded-proto'] || 'https';

  if (!host) return null;

  return `${proto}://${host}`;
};

/**
 * Get the current platform base URL — fully auto-detected.
 * 
 * Priority:
 * 1. Server-side: request Host header (always correct for the visitor's domain)
 * 2. Server-side: VERCEL_URL env (auto-set by Vercel, no config needed)
 * 3. Browser: window.location.origin (always correct)
 * 4. Fallback: http://localhost:3000
 * 
 * @param {object} [req] - Next.js API request object (server-side only)
 * @returns {string} Base URL with no trailing slash
 */
export const getBaseUrl = (req) => {
  /*
   * Server-side: try the request host header first
   */
  if (req) {
    const fromRequest = getBaseUrlFromRequest(req);
    if (fromRequest) return fromRequest;
  }

  /*
   * Server-side: Vercel auto-sets this on every deployment
   */
  if (typeof window === 'undefined') {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
  }

  /*
   * Browser: always correct for the current domain
   */
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  /*
   * Ultimate fallback — local development
   */
  return 'http://localhost:3000';
};

/**
 * Build a full absolute URL for the current platform.
 * Pass the `req` object when calling from API routes for accurate domain detection.
 * 
 * @param {string} path - Path starting with / (e.g., '/auth/register')
 * @param {object} [params] - Query parameters as key-value pairs
 * @param {object} [req] - API request object (pass when server-side)
 * @returns {string} Full absolute URL
 */
export const buildUrl = (path = '/', params = {}, req) => {
  const base = getBaseUrl(req);
  const url = new URL(path, base);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

/**
 * Build a referral registration link — auto-detects domain.
 * Pass the `req` object when calling from API routes.
 * 
 * @param {string} referralCode - The user's referral code
 * @param {object} [req] - API request object
 * @returns {string} Full referral URL
 */
export const buildReferralUrl = (referralCode, req) => {
  return buildUrl('/auth/register', { ref: referralCode }, req);
};

/**
 * Get just the domain name without protocol.
 * 
 * @param {object} [req] - API request object
 * @returns {string} Domain (e.g., "abyssiniaacademy.com")
 */
export const getDomain = (req) => {
  const base = getBaseUrl(req);
  return base.replace(/^https?:\/\//, '');
};