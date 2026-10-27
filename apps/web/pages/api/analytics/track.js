/**
 * @fileoverview Page View Tracking API
 * Records anonymous page views. No cookies, no personal data.
 * Creates a hash from IP + User-Agent for unique visitor counting.
 * Path: apps/web/pages/api/analytics/track.js
 */

import { Pool } from 'pg';
import crypto from 'crypto';

const isNeon = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false });
  }

  try {
    const { path } = req.body;

    if (!path) {
      return res.status(400).json({ success: false });
    }

    /*
     * Create anonymous visitor hash from IP + User-Agent
     * Same visitor within 24h = same hash = counted once
     */
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const ua = req.headers['user-agent'] || 'unknown';
    const visitorHash = crypto
      .createHash('sha256')
      .update(`${ip}:${ua}`)
      .digest('hex');

    /*
     * Record the page view
     */
    await pool.query(
      'INSERT INTO page_views (path, visitor_hash) VALUES ($1, $2)',
      [path, visitorHash]
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Track error:', error.message);
    return res.status(500).json({ success: false });
  }
}