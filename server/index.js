require('module-alias/register');

const app = require('./app');
const connectDatabase = require('./config/database');
const { env } = require('./config/env');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    // Start listening first so Render health checks (/health) pass immediately
    const server = app.listen(env.PORT, () => {
      logger.info('Server started', { port: env.PORT, environment: env.NODE_ENV });
    });

    // Connect to MongoDB
    try {
      await connectDatabase();
    } catch (dbError) {
      logger.error('MongoDB initial connection error', { error: dbError.message });
    }

    const shutdown = async (signal) => {
      logger.info('Shutdown signal received', { signal });
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

startServer();
