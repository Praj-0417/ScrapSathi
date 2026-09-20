require('module-alias/register');

const app = require('./app');
const connectDatabase = require('./config/database');
const { env } = require('./config/env');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info('Server started', { port: env.PORT, environment: env.NODE_ENV });
    });

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
