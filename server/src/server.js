import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { createExpressApp } from './app.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  try {
    await connectDatabase();
    const app = createExpressApp();

    const server = app.listen(env.port, '0.0.0.0', () => {
      logger.info(`PhytoGuard Express API listening on http://localhost:${env.port}`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}; shutting down Express server gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    logger.error('Failed to start PhytoGuard Express server', { message: err?.message });
    process.exit(1);
  }
}

bootstrap();
