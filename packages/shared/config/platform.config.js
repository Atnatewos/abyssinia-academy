/**
 * @fileoverview Platform Core Configuration
 * Controls all platform-wide settings, brand identity, and environment variables
 * Path: packages/shared/config/platform.config.js
 */

const platformConfig = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:5000/api',

  // Database - Supports both Neon and local PostgreSQL
  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'abyssinia_academy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS, 10) || 10,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 10000,
  },

  // JWT Authentication
  jwt: {
    secret: process.env.JWT_SECRET || 'abyssinia-jwt-secret-change-in-production',
    adminSecret: process.env.JWT_ADMIN_SECRET || 'abyssinia-admin-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRE || '30d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '90d',
    issuer: 'abyssinia-academy',
  },

  // Cloudinary
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    uploadFolder: 'abyssinia-academy',
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'zip'],
    maxFileSize: 10 * 1024 * 1024,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    authMax: 10,
  },

  // CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token'],
  },

  // Pagination defaults
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  // Brand Identity
  brand: {
    name: 'ABYSSiNIA',
    suffix: 'Tech Academy',
    tagline: 'Master Full-Stack Engineering from Ethiopia to the World',
    established: '2026',
    contactPhone: '+251 911 234 567',
    telegramSupport: '@AbyssiniaAcademySupport',
    email: 'support@abyssinia.academy',
    location: 'Addis Ababa, Ethiopia',
    website: 'https://abyssinia.academy',
    socialLinks: {
      telegram: 'https://t.me/AbyssiniaAcademy',
      youtube: 'https://youtube.com/@AbyssiniaAcademy',
      github: 'https://github.com/AbyssiniaAcademy',
    },
  },

  // Course Structure
  course: {
    phasesPerCourse: 5,
    defaultThumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    youtubeEmbedBase: 'https://www.youtube.com/embed',
    youtubeOptions: 'autoplay=0&rel=0&modestbranding=1',
  },

  // Admin Defaults
  admin: {
    defaultRole: 'admin',
    superAdminRole: 'superadmin',
    defaultUsername: 'admin',
    defaultEmail: 'admin@abyssinia.academy',
    defaultPassword: 'admin2026',
  },
};

module.exports = platformConfig;