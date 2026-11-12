/**
 * @fileoverview Express Application Setup
 *
 * Middleware configuration, security hardening, rate limiting, route
 * mounting, and error handling for the Abyssinia Academy API.
 *
 * Behavior is driven by platform.config, which reads from environment
 * variables — no hardcoded values anywhere in this file.
 *
 * Rate limiting strategy:
 *   - Development: high limit (5000 req/15min) so hot-reload loops and
 *     local automation never trigger 429s
 *   - Production: configured limit (default 100 req/15min per IP)
 *   - Health checks and the CORS preflight are excluded from counting
 *   - Localhost requests skip the limiter entirely in development
 *
 * Proxy trust:
 *   On Neon / Vercel / any reverse proxy deployment, Express must trust
 *   the `X-Forwarded-For` header or rate-limit bucketing will treat all
 *   clients as a single IP. The `trust proxy` setting below enables
 *   correct client-IP resolution in production.
 *
 * Path: apps/api/src/app.js
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { platform } = require('../../../packages/shared/config');
const { corsMiddleware } = require('./config/cors');
const {
  notFoundHandler,
  globalErrorHandler,
} = require('./middleware/error.middleware');
const { mountRoutes } = require('./routes/index');

const app = express();

/* ============================================================================
 * SECURITY HEADERS
 * ============================================================================
 * helmet sets CSP, HSTS, X-Content-Type-Options, X-Frame-Options, and the
 * rest of the modern browser security headers. The default configuration
 * is production-appropriate; `crossOriginResourcePolicy` is set to
 * cross-origin because uploads (images, screenshots) are served from
 * Cloudinary and must be viewable from the app domain.
 * ============================================================================ */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: platform.isProduction ? undefined : false,
  })
);

/* ============================================================================
 * PROXY TRUST
 * ============================================================================
 * Required when the API sits behind a reverse proxy (Neon/Vercel/nginx).
 * Without this, `req.ip` returns the proxy's IP for every request, breaking
 * rate limiting and IP-based fraud detection.
 * ============================================================================ */
if (platform.isProduction) {
  app.set('trust proxy', 1);
}

/* ============================================================================
 * CORS
 * ============================================================================ */
app.use(corsMiddleware);

/* ============================================================================
 * HTTP LOGGING
 * ============================================================================
 * `dev` format in development, `combined` (Apache-style) in production.
 * Both go to stdout so container logs capture them automatically.
 * ============================================================================ */
app.use(morgan(platform.isProduction ? 'combined' : 'dev'));

/* ============================================================================
 * RATE LIMITING
 * ============================================================================
 * Two configurations:
 *   - Development: 5000 req/15min so hot-reload loops and local automation
 *     never trigger 429s. Localhost is exempted entirely.
 *   - Production:  the configured limit (default 100 req/15min per IP).
 *
 * Health checks are exempt so uptime monitors don't consume the bucket.
 * ============================================================================ */
const limiter = rateLimit({
  windowMs: platform.rateLimit.windowMs,
  max: platform.isProduction
    ? platform.rateLimit.max
    : platform.rateLimit.max * 50, // 50× in dev = comfortable for hot reloads
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
  // Skip the health check and localhost in development
  skip: (req) => {
    if (req.path === '/api/health') return true;
    if (!platform.isProduction) {
      const ip = req.ip || '';
      if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
        return true;
      }
    }
    return false;
  },
});

app.use('/api', limiter);

/* ============================================================================
 * BODY PARSERS
 * ============================================================================
 * 10MB limit accommodates payment screenshots and base64-encoded payloads.
 * Multipart uploads (multer) are handled separately by the upload middleware
 * on specific routes, so this JSON/urlencoded limit does not apply to them.
 * ============================================================================ */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ============================================================================
 * HEALTH CHECK
 * ============================================================================
 * Excluded from the rate limiter. Used by uptime monitors, Vercel, and
 * container orchestration to verify the API is alive.
 * ============================================================================ */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Abyssinia Academy API is running',
    timestamp: new Date().toISOString(),
    environment: platform.env,
  });
});

/* ============================================================================
 * DEVELOPMENT DIAGNOSTICS
 * ============================================================================
 * Auth request logging helps debug login/register failures locally. Only
 * enabled in development; disabled entirely in production to avoid leaking
 * credentials into logs.
 * ============================================================================ */
if (!platform.isProduction) {
  app.use('/api/auth', (req, res, next) => {
    // eslint-disable-next-line no-console
    console.log('[auth] Incoming request', {
      method: req.method,
      path: req.path,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
    });
    next();
  });
}

/* ============================================================================
 * ROUTES
 * ============================================================================
 * All feature routes are mounted under /api by the routes aggregator.
 * Any route not matching a mounted path falls through to `notFoundHandler`.
 * ============================================================================ */
mountRoutes(app);

/* ============================================================================
 * 404 + GLOBAL ERROR HANDLER
 * ============================================================================
 * Order matters: 404 must come before the error handler, so a missing route
 * is caught as a 404 rather than a generic 500 from the error handler.
 * ============================================================================ */
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;