/**
 * @fileoverview API Server Entry Point
 * Starts the Express server and connects to database
 * Path: apps/api/src/server.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const app = require('./app');
const { testConnection } = require('./database/pool');
const { platform } = require('../../../packages/shared/config');

const startServer = async () => {
  try {
    // Test database connection with retries
    const dbConnected = await testConnection(3);
    
    if (!dbConnected) {
      console.log('⚠️  Starting server without database connection...');
      console.log('💡 Some features may not work until the database is available.');
    }

    // Start Express server
    app.listen(platform.port, () => {
      console.log(`🚀 Abyssinia Academy API running on port ${platform.port}`);
      console.log(`📡 Environment: ${platform.env}`);
      console.log(`🌐 Frontend URL: ${platform.frontendUrl}`);
      console.log(`📋 API Health: http://localhost:${platform.port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

startServer();