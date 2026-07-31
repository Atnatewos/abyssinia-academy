/**
 * @fileoverview Express Application Setup
 * Middleware configuration and route mounting
 * Path: apps/api/src/app.js
 */

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { platform } = require('../../../packages/shared/config');
const { corsMiddleware } = require('./config/cors');
const { notFoundHandler, globalErrorHandler } = require('./middleware/error.middleware');
const { mountRoutes } = require('./routes/index');

const app = express();

app.use(helmet());
app.use(corsMiddleware);

if (platform.env === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: platform.rateLimit.windowMs,
  max: platform.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Abyssinia Academy API is running',
    timestamp: new Date().toISOString(),
    environment: platform.env,
  });
});

// Debug middleware to log request body
if (platform.env === 'development') {
  app.use('/api/auth', (req, res, next) => {
    console.log('📝 Auth Request:', {
      method: req.method,
      path: req.path,
      body: req.body,
      headers: {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
      },
    });
    next();
  });
}

mountRoutes(app);

app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;