// /**
//  * @fileoverview Platform Core Configuration
//  * Controls all platform-wide settings, brand identity, and environment variables
//  * Path: packages/shared/config/platform.config.js
//  */

// const platformConfig = {
//   // Environment
//   env: process.env.NODE_ENV || 'development',
//   isProduction: process.env.NODE_ENV === 'production',
//   port: parseInt(process.env.PORT, 10) || 5000,
//   frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
//   apiUrl: process.env.API_URL || 'http://localhost:5000/api',

//   // Database - Supports both Neon and local PostgreSQL
//   database: {
//     url: process.env.DATABASE_URL || '',
//     host: process.env.DB_HOST || 'localhost',
//     port: parseInt(process.env.DB_PORT, 10) || 5432,
//     name: process.env.DB_NAME || 'abyssinia_academy',
//     user: process.env.DB_USER || 'postgres',
//     password: process.env.DB_PASSWORD || '',
//     maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 10,
//     idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
//     connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 10000,
//   },

//   // JWT Authentication
//   jwt: {
//     secret: process.env.JWT_SECRET || 'abyssinia-jwt-secret-change-in-production',
//     adminSecret: process.env.JWT_ADMIN_SECRET || 'abyssinia-admin-jwt-secret-change-in-production',
//     expiresIn: process.env.JWT_EXPIRE || '30d',
//     refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '90d',
//     issuer: 'abyssinia-academy',
//   },

//   // Cloudinary
//   cloudinary: {
//     cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
//     apiKey: process.env.CLOUDINARY_API_KEY || '',
//     apiSecret: process.env.CLOUDINARY_API_SECRET || '',
//     uploadFolder: 'abyssinia-academy',
//     allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'zip'],
//     maxFileSize: 10 * 1024 * 1024,
//   },

//   // Rate Limiting
//   rateLimit: {
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//     authMax: 10,
//   },

//   // CORS
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token'],
//   },

//   // Pagination defaults
//   pagination: {
//     defaultPageSize: 20,
//     maxPageSize: 100,
//   },

//   // Brand Identity
//   brand: {
//     name: 'ABYSSiNIA',
//     suffix: 'Tech Academy',
//     tagline: 'Master Full-Stack Engineering from Ethiopia to the World',
//     established: '2026',
//     contactPhone: '+251 911 234 567',
//     telegramSupport: '@AbyssiniaAcademySupport',
//     email: 'support@abyssinia.academy',
//     location: 'Addis Ababa, Ethiopia',
//     website: 'https://abyssinia.academy',
//     socialLinks: {
//       telegram: 'https://t.me/AbyssiniaAcademy',
//       youtube: 'https://youtube.com/@AbyssiniaAcademy',
//       github: 'https://github.com/AbyssiniaAcademy',
//     },
//   },

//   // Course Structure
//   course: {
//     phasesPerCourse: 5,
//     defaultThumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
//     youtubeEmbedBase: 'https://www.youtube.com/embed',
//     youtubeOptions: 'autoplay=0&rel=0&modestbranding=1',
//   },

//   // Admin Defaults
//   admin: {
//     defaultRole: 'admin',
//     superAdminRole: 'superadmin',
//     defaultUsername: 'admin',
//     defaultEmail: 'admin@abyssinia.academy',
//     defaultPassword: 'admin2026',
//   },
// };

// module.exports = platformConfig;


/**
 * @fileoverview Platform Core Configuration
 *
 * Single source of truth for platform-wide settings, environment variables,
 * brand identity, and default admin provisioning.
 *
 * Every credential-bearing value resolves from an environment variable.
 * The `requireEnv` helper enforces this in production — a missing critical
 * secret throws at boot instead of silently falling back to a demo default.
 *
 * Path: packages/shared/config/platform.config.js
 */

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isDevelopment = nodeEnv === 'development';

/**
 * Read a required environment variable.
 *
 * In production, a missing value is a hard error — the platform refuses to
 * boot with a default secret because that would silently compromise every
 * authenticated surface.
 *
 * In development, a fallback is allowed only when explicitly passed, and a
 * warning is logged so the developer knows the fallback is in use.
 *
 * @param {string} name - Environment variable name
 * @param {string} [developmentFallback] - Fallback allowed only in development
 * @returns {string} Resolved value
 * @throws {Error} When required in production and missing
 */
const requireEnv = (name, developmentFallback) => {
  const value = process.env[name];
  if (value && value.length > 0) return value;

  if (isProduction) {
    throw new Error(
      `[platform.config] Missing required environment variable: ${name}. ` +
        'Production refuses to boot with a fallback value.'
    );
  }

  if (developmentFallback !== undefined) {
    // eslint-disable-next-line no-console
    console.warn(
      `[platform.config] ${name} is not set. Using development fallback. ` +
        'Set this in .env for parity with production.'
    );
    return developmentFallback;
  }

  return '';
};

/**
 * Parse an integer environment variable with a safe default.
 * @param {string} name - Variable name
 * @param {number} fallback - Default used when unset or invalid
 * @returns {number}
 */
const parseIntEnv = (name, fallback) => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Parse a boolean environment variable (accepts 'true'/'false'/'1'/'0').
 * @param {string} name
 * @param {boolean} fallback
 * @returns {boolean}
 */
const parseBoolEnv = (name, fallback) => {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const normalized = String(raw).trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  return fallback;
};

const platformConfig = {
  /* ── Environment ─────────────────────────────────────────────────────── */
  env: nodeEnv,
  isProduction,
  isDevelopment,
  port: parseIntEnv('PORT', 5000),
  frontendUrl: requireEnv('FRONTEND_URL', 'http://localhost:3000'),
  apiUrl: requireEnv('API_URL', 'http://localhost:5000/api'),

  /* ── Database ─────────────────────────────────────────────────────────
   * DATABASE_URL takes precedence. Individual DB_* vars support local
   * PostgreSQL installs where a connection string is not convenient.
   * The connection string is required in production — the platform
   * cannot function without a database.
   * -------------------------------------------------------------------- */
  database: {
    url: requireEnv('DATABASE_URL', ''),
    host: process.env.DB_HOST || 'localhost',
    port: parseIntEnv('DB_PORT', 5432),
    name: process.env.DB_NAME || 'abyssinia_academy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    maxConnections: parseIntEnv('DB_MAX_CONNECTIONS', 10),
    idleTimeoutMillis: parseIntEnv('DB_IDLE_TIMEOUT', 30000),
    connectionTimeoutMillis: parseIntEnv('DB_CONNECTION_TIMEOUT', 10000),
  },

  /* ── JWT ──────────────────────────────────────────────────────────────
   * Two distinct secrets: one for students, one for admins. Both are
   * required in production. Development fallbacks exist only to unblock
   * local bootstrap — they are never accepted in production.
   * -------------------------------------------------------------------- */
  jwt: {
    secret: requireEnv(
      'JWT_SECRET',
      isDevelopment ? 'abyssinia-dev-user-secret-DO-NOT-USE-IN-PROD' : ''
    ),
    adminSecret: requireEnv(
      'JWT_ADMIN_SECRET',
      isDevelopment ? 'abyssinia-dev-admin-secret-DO-NOT-USE-IN-PROD' : ''
    ),
    expiresIn: process.env.JWT_EXPIRE || '30d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '90d',
    issuer: process.env.JWT_ISSUER || 'abyssinia-academy',
  },

  /* ── Cloudinary ─────────────────────────────────────────────────────── */
  cloudinary: {
    cloudName: requireEnv(
      'CLOUDINARY_CLOUD_NAME',
      isDevelopment ? 'dev-cloud' : ''
    ),
    apiKey: requireEnv('CLOUDINARY_API_KEY', isDevelopment ? 'dev-key' : ''),
    apiSecret: requireEnv(
      'CLOUDINARY_API_SECRET',
      isDevelopment ? 'dev-secret' : ''
    ),
    uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'abyssinia-academy',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'zip'],
    maxFileSize: parseIntEnv('CLOUDINARY_MAX_FILE_SIZE', 10 * 1024 * 1024),
  },

  /* ── Rate Limiting ──────────────────────────────────────────────────── */
  rateLimit: {
    windowMs: parseIntEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    max: parseIntEnv('RATE_LIMIT_MAX', 100),
    authMax: parseIntEnv('RATE_LIMIT_AUTH_MAX', 10),
  },

  /* ── CORS ─────────────────────────────────────────────────────────────
   * FRONTEND_URL is the single allowed origin. For multi-origin
   * deployments, set CORS_ORIGINS to a comma-separated list.
   * -------------------------------------------------------------------- */
  cors: {
    origin: requireEnv('FRONTEND_URL', 'http://localhost:3000'),
    extraOrigins: (process.env.CORS_ORIGINS || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  /* ── Pagination ─────────────────────────────────────────────────────── */
  pagination: {
    defaultPageSize: parseIntEnv('PAGINATION_DEFAULT', 20),
    maxPageSize: parseIntEnv('PAGINATION_MAX', 100),
  },

  /* ── Feature Flags ──────────────────────────────────────────────────── */
  features: {
    agentsEnabled: parseBoolEnv('AGENTS_ENABLED', true),
    scholarshipsEnabled: parseBoolEnv('SCHOLARSHIPS_ENABLED', true),
    resellersEnabled: parseBoolEnv('RESELLERS_ENABLED', true),
  },

  /* ── Brand Identity ───────────────────────────────────────────────────
   * These are display-only constants. They do NOT belong in env because
   * they are product identity, not deployment configuration.
   * -------------------------------------------------------------------- */
  brand: {
    name: process.env.BRAND_NAME || 'ABYSSiNIA',
    suffix: process.env.BRAND_SUFFIX || 'Tech Academy',
    tagline:
      process.env.BRAND_TAGLINE ||
      'Master Full-Stack Engineering from Ethiopia to the World',
    established: process.env.BRAND_ESTABLISHED || '2026',
    contactPhone: process.env.BRAND_CONTACT_PHONE || '+251 911 234 567',
    telegramSupport:
      process.env.BRAND_TELEGRAM_SUPPORT || '@AbyssiniaAcademySupport',
    email: process.env.BRAND_EMAIL || 'support@abyssinia.academy',
    location: process.env.BRAND_LOCATION || 'Addis Ababa, Ethiopia',
    website: process.env.BRAND_WEBSITE || 'https://abyssinia.academy',
    socialLinks: {
      telegram:
        process.env.BRAND_TELEGRAM || 'https://t.me/AbyssiniaAcademy',
      youtube:
        process.env.BRAND_YOUTUBE ||
        'https://youtube.com/@AbyssiniaAcademy',
      github:
        process.env.BRAND_GITHUB || 'https://github.com/AbyssiniaAcademy',
    },
  },

  /* ── Course Defaults ──────────────────────────────────────────────────
   * Structural defaults. Business rules that vary per course live in the
   * DB, not here — this block only defines shape, not pricing.
   * -------------------------------------------------------------------- */
  course: {
    phasesPerCourse: parseIntEnv('COURSE_PHASES_PER_COURSE', 5),
    defaultThumbnail:
      process.env.COURSE_DEFAULT_THUMBNAIL ||
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    youtubeEmbedBase:
      process.env.COURSE_YOUTUBE_EMBED_BASE ||
      'https://www.youtube.com/embed',
    youtubeOptions:
      process.env.COURSE_YOUTUBE_OPTIONS ||
      'autoplay=0&rel=0&modestbranding=1',
  },

  /* ── Admin Defaults ───────────────────────────────────────────────────
   * Default admin credentials for the initial seed only.
   *
   * SECURITY: The password MUST come from ADMIN_DEFAULT_PASSWORD. The seed
   * script refuses to create a production admin without it. In development
   * a placeholder is allowed so a fresh clone boots — but the seed logs a
   * loud warning and the value is rejected in production.
   * -------------------------------------------------------------------- */
  admin: {
    defaultRole: 'admin',
    superAdminRole: 'superadmin',
    defaultUsername: process.env.ADMIN_DEFAULT_USERNAME || 'admin',
    defaultEmail:
      process.env.ADMIN_DEFAULT_EMAIL || 'admin@abyssinia.academy',
    defaultPassword: requireEnv(
      'ADMIN_DEFAULT_PASSWORD',
      isDevelopment ? 'CHANGE_ME_IN_DEV' : ''
    ),
  },
};

module.exports = platformConfig;