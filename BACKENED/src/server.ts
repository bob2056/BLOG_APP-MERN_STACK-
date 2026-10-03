import app from './app';
import { connectDB, disconnectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';

let server: ReturnType<typeof app.listen>;

const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start HTTP Listener
    server = app.listen(env.PORT, () => {
      logger.info(`Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
      logger.info(`API Base URL: http://localhost:${env.PORT}/api`);
      logger.info(`Uploads Directory: http://localhost:${env.PORT}/uploads`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Gracefully shutting down...`);

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await disconnectDB();
        logger.info('Database connection closed.');
        process.exit(0);
      } catch (err) {
        logger.error('Error during database disconnect:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }

  // Force close after 10s timeout
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

startServer();
