/**
 * @fileoverview Route Aggregator
 * Mounts all route modules onto the Express app
 * Path: apps/api/src/routes/index.js
 */

const authRoutes = require('./auth.routes');
const coursesRoutes = require('./courses.routes');
const paymentRoutes = require('./payment.routes');
const progressRoutes = require('./progress.routes');
const adminRoutes = require('./admin.routes');

/**
 * Mount all routes on the Express app
 * @param {object} app - Express application instance
 */
const mountRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/courses', coursesRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/admin', adminRoutes);
};

module.exports = { mountRoutes };