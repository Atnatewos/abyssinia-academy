/**
 * Rate Limiter Utility
 * 
 * Simple in-memory rate limiter for API endpoints.
 * Uses Map with TTL for automatic cleanup.
 * 
 * Note: For production with multiple instances, use Redis
 */

const rateLimitStore = new Map();

/**
 * Check if request exceeds rate limit
 * @param {string} key - Unique identifier (e.g., userId:endpoint)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowSeconds - Time window in seconds
 * @returns {Promise<boolean>} True if rate limited
 */
export const checkRateLimit = async (key, maxRequests = 10, windowSeconds = 60) => {
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);
  
  // Get or create request log for this key
  let requests = rateLimitStore.get(key) || [];
  
  // Remove expired requests
  requests = requests.filter(timestamp => timestamp > windowStart);
  
  // Check if limit exceeded
  if (requests.length >= maxRequests) {
    return true; // Rate limited
  }
  
  // Add current request
  requests.push(now);
  rateLimitStore.set(key, requests);
  
  // Cleanup old entries periodically (every 100 requests)
  if (rateLimitStore.size > 1000) {
    for (const [k, timestamps] of rateLimitStore.entries()) {
      const validTimestamps = timestamps.filter(t => t > windowStart);
      if (validTimestamps.length === 0) {
        rateLimitStore.delete(k);
      } else {
        rateLimitStore.set(k, validTimestamps);
      }
    }
  }
  
  return false; // Not rate limited
};

/**
 * Reset rate limit for a specific key
 * @param {string} key - Rate limit key to reset
 */
export const resetRateLimit = (key) => {
  rateLimitStore.delete(key);
};

/**
 * Get current request count for a key
 * @param {string} key - Rate limit key
 * @param {number} windowSeconds - Time window in seconds
 * @returns {number} Current request count
 */
export const getRequestCount = (key, windowSeconds = 60) => {
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);
  const requests = rateLimitStore.get(key) || [];
  
  return requests.filter(timestamp => timestamp > windowStart).length;
};