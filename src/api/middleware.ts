import type { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { config } from '../config/config';
import { validateInitData } from '../services/telegramAuth';

/**
 * Reads the raw initData value from the request.
 * Prefers the `x-telegram-init-data` header, falls back to `body.initData`.
 */
function extractInitData(req: Request): string | null {
  const fromHeader = req.header('x-telegram-init-data');
  if (typeof fromHeader === 'string' && fromHeader.length > 0) return fromHeader;

  const fromBody = (req.body as { initData?: unknown } | undefined)?.initData;
  if (typeof fromBody === 'string' && fromBody.length > 0) return fromBody;

  return null;
}

/**
 * Validates Telegram Web App initData server-side.
 * On success, populates `req.telegramUser` and calls next().
 * On failure, responds 401.
 */
export function requireTelegramUser(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const raw = extractInitData(req);
  if (!raw) {
    res.status(401).json({ error: 'Missing Telegram initData.' });
    return;
  }

  const result = validateInitData(raw);
  if (!result.ok || !result.user) {
    res.status(401).json({ error: result.reason ?? 'Invalid Telegram initData.' });
    return;
  }

  req.telegramUser = result.user;
  next();
}

/**
 * Requires the verified Telegram user to be the configured administrator.
 * Must be applied AFTER requireTelegramUser.
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (config.adminTelegramId === null) {
    res
      .status(503)
      .json({ error: 'Admin authentication is not configured on the server.' });
    return;
  }

  const user = req.telegramUser;
  if (!user || user.id !== config.adminTelegramId) {
    res.status(403).json({ error: 'Forbidden.' });
    return;
  }

  next();
}

/** Rate limiter for public API endpoints. */
export const publicRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

/** Stricter rate limiter for write endpoints and auth attempts. */
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

/** Centralised error handler. Never leaks stack traces to the client. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[api] unhandled error:', err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error.' });
}

/** 404 handler for unmatched API routes. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found.' });
}
