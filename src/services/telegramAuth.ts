import crypto from 'node:crypto';
import { config } from '../config/config';
import type { TelegramWebAppUser } from '../types';

export interface InitDataValidationResult {
  ok: boolean;
  reason?: string;
  user?: TelegramWebAppUser;
  authDate?: number;
}

interface ParsedInitData {
  hash: string;
  authDate: number | null;
  user: TelegramWebAppUser | null;
  dataCheckString: string;
}

function parseInitData(raw: string): ParsedInitData | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;

  const params = new URLSearchParams(raw);
  const hash = params.get('hash');
  if (!hash) return null;

  const entries: Array<[string, string]> = [];
  let authDate: number | null = null;
  let user: TelegramWebAppUser | null = null;

  for (const [key, value] of params.entries()) {
    if (key === 'hash') continue;
    entries.push([key, value]);

    if (key === 'auth_date') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) authDate = parsed;
    }

    if (key === 'user') {
      try {
        const parsedUser = JSON.parse(value) as TelegramWebAppUser;
        if (parsedUser && typeof parsedUser.id === 'number') {
          user = parsedUser;
        }
      } catch {
        // Ignore malformed JSON; the user field is optional for validation.
      }
    }
  }

  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

  return { hash, authDate, user, dataCheckString };
}

/**
 * Verifies Telegram Web App `initData` server-side per Telegram's official
 * HMAC-SHA256 approach. Never trust user information from the frontend.
 */
export function validateInitData(rawInitData: string): InitDataValidationResult {
  if (!config.botToken) {
    return { ok: false, reason: 'BOT_TOKEN is not configured on the server.' };
  }

  const parsed = parseInitData(rawInitData);
  if (!parsed) {
    return { ok: false, reason: 'Malformed initData.' };
  }

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(config.botToken)
    .digest();

  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(parsed.dataCheckString)
    .digest('hex');

  const provided = Buffer.from(parsed.hash, 'hex');
  const expected = Buffer.from(computedHash, 'hex');

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    return { ok: false, reason: 'Invalid initData hash.' };
  }

  if (parsed.authDate !== null) {
    const ageSeconds = Math.floor(Date.now() / 1000) - parsed.authDate;
    if (ageSeconds > config.initDataMaxAgeSeconds) {
      return { ok: false, reason: 'initData expired.' };
    }
  }

  if (!parsed.user) {
    return { ok: false, reason: 'initData is missing the user object.' };
  }

  return { ok: true, user: parsed.user, authDate: parsed.authDate ?? undefined };
}
