/**
 * @fileoverview CORS Configuration
 * Cross-Origin Resource Sharing setup
 * Path: apps/api/src/config/cors.js
 */

const cors = require('cors');
const { platform } = require('../../../../packages/shared/config');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = platform.cors.origin.split(',').map(o => o.trim());
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: platform.cors.credentials,
  methods: platform.cors.methods,
  allowedHeaders: platform.cors.allowedHeaders,
  maxAge: 86400, // 24 hours
};

module.exports = {
  corsMiddleware: cors(corsOptions),
  corsOptions,
};