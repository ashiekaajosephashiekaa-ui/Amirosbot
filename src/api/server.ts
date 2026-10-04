import path from 'node:path';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { apiRouter } from './routes';
import { errorHandler, notFoundHandler, publicRateLimiter } from './middleware';

export function createServer() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false, // Telegram Mini App iframe requires permissive CSP
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.use(
    cors({
      origin: true,
      credentials: false,
    }),
  );

  app.use(express.json({ limit: '64kb' }));

  // Health check (Railway uses this)
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Amiros Football Analytics' });
  });

  // Public API
  app.use('/api', publicRateLimiter, apiRouter);

  // Serve the Mini App (static files)
  const webDir = path.resolve(process.cwd(), 'web');
  app.use(express.static(webDir, { index: 'index.html', maxAge: '1h' }));

  // SPA fallback — any non-API GET goes to index.html
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(webDir, 'index.html'));
  });

  // API 404 + errors
  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
