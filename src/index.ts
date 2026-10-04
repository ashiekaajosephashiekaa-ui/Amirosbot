import 'dotenv/config';
import { config, logConfigWarnings } from './config/config';
import { createServer } from './api/server';
import { getDb, closeDb } from './database/database';
import { seedIfEmpty } from './database/seed';
import { startBot, stopBot } from './bot/bot';

async function main(): Promise<void> {
  logConfigWarnings();

  // Initialise the database and seed demo data when empty.
  getDb();
  seedIfEmpty();

  // HTTP server
  const app = createServer();
  const server = app.listen(config.port, () => {
    console.log(`[api] Amiros Football Analytics listening on port ${config.port}`);
    console.log(`[api] Health: http://localhost:${config.port}/api/health`);
  });

  // Telegram bot (long polling)
  await startBot();

  // Graceful shutdown
  const shutdown = (signal: string) => {
    console.log(`[app] ${signal} received — shutting down...`);
    stopBot();
    server.close(() => {
      closeDb();
      process.exit(0);
    });
    // Fallback hard exit
    setTimeout(() => process.exit(0), 5000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('[app] fatal startup error:', error);
  process.exit(1);
});
