/**
 * @fileoverview Public Earn Stats API
 *
 * GET /api/public/earn-stats
 *
 * Powers the landing-page social proof strip. No auth required, but:
 *   - Gated by referrals.publicListing.enabled
 *   - Rate limited per IP (config-driven)
 *   - CDN-cached (s-maxage) to protect the serverless DB
 *   - Names masked SERVER-side ("Athanasius Getasew" → "A*** G***")
 *   - Hide-when-weak: returns enabled=false until totals are meaningful
 *
 * Path: apps/web/pages/api/public/earn-stats.js
 */
import { query } from '../../../lib/db';
import { getReferralPublicListingConfig } from '../../../lib/config';

/* In-memory per-IP sliding window (single-instance safe, config-driven limit) */
const rateLimitStore = new Map();

/**
 * Simple sliding-window rate limit per IP.
 * @param {string} key - Client IP
 * @param {number} maxPerMinute - Config limit
 * @returns {boolean} True when limited
 */
const isRateLimited = (key, maxPerMinute) => {
  const now = Date.now();
  const windowStart = now - 60000;
  const hits = (rateLimitStore.get(key) || []).filter((stamp) => stamp > windowStart);

  if (hits.length >= maxPerMinute) {
    rateLimitStore.set(key, hits);
    return true;
  }

  hits.push(now);
  rateLimitStore.set(key, hits);
  return false;
};

/**
 * Mask a full name to first-initial + *** per word.
 * @param {string} fullName
 * @returns {string}
 */
const maskName = (fullName) => {
  return String(fullName || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0)}***`)
    .join(' ');
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  const listingConfig = getReferralPublicListingConfig();

  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${listingConfig.cacheSeconds}, stale-while-revalidate=${listingConfig.cacheSeconds * 2}`
  );

  if (!listingConfig.enabled) {
    return res.status(200).json({ success: true, data: { enabled: false } });
  }

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  if (isRateLimited(clientIp, listingConfig.rateLimitPerMinute)) {
    return res.status(429).json({ success: false, message: 'Too many requests.' });
  }

  try {
    const [totalResult, referrersResult, topResult] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(total_payout), 0)::numeric AS total
         FROM referral_platform_monthly`
      ),
      query(
        `SELECT COUNT(*)::int AS count
         FROM users
         WHERE direct_referral_count > 0`
      ),
      query(
        `SELECT full_name, direct_referral_count, lifetime_referral_earnings
         FROM users
         WHERE direct_referral_count >= $1
         ORDER BY lifetime_referral_earnings DESC
         LIMIT $2`,
        [listingConfig.minReferralsToShow, listingConfig.topCount]
      ),
    ]);

    const totalPaidETB = parseFloat(totalResult.rows[0]?.total || 0);
    const activeReferrers = referrersResult.rows[0]?.count || 0;
    const topReferrers = topResult.rows.map((row) => ({
      maskedName: maskName(row.full_name),
      referrals: row.direct_referral_count,
      earnedETB: parseFloat(row.lifetime_referral_earnings || 0),
    }));

    /* Hide-when-weak: never show unimpressive numbers publicly */
    const isStrongEnough =
      totalPaidETB >= listingConfig.minTotalPaidETB && topReferrers.length >= listingConfig.topCount;

    if (!isStrongEnough) {
      return res.status(200).json({ success: true, data: { enabled: false } });
    }

    return res.status(200).json({
      success: true,
      data: {
        enabled: true,
        totalPaidETB,
        activeReferrers,
        topReferrers,
      },
    });
  } catch (error) {
    console.error('Public earn-stats error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to load stats.' });
  }
}