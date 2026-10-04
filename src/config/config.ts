import 'dotenv/config';
import path from 'node:path';

function parseAdminTelegramId(raw: string | undefined): number | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!/^-?\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isSafeInteger(value) ? value : null;
}

function normalizeUsername(raw: string | undefined, fallback: string): string {
  const value = (raw ?? '').trim().replace(/^@+/, '');
  return value.length > 0 ? value : fallback;
}

function parsePort(raw: string | undefined): number {
  const value = Number((raw ?? '').trim());
  if (!Number.isInteger(value) || value <= 0 || value > 65535) return 3000;
  return value;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const value = Number((raw ?? '').trim());
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.floor(value);
}

const nodeEnv = (process.env.NODE_ENV ?? 'development').trim() || 'development';
const isProduction = nodeEnv === 'production';

const rawWebAppUrl = (process.env.WEB_APP_URL ?? '').trim().replace(/\/+$/, '');
const rawDatabasePath = (process.env.DATABASE_PATH ?? './data/amiros.sqlite').trim();

const adminUsername = normalizeUsername(process.env.ADMIN_USERNAME, 'Amiros10');
const channelUsername = normalizeUsername(process.env.CHANNEL_USERNAME, 'Amiros_1');

export const config = {
  nodeEnv,
  isProduction,

  /** Telegram bot token. NEVER hard-coded. NEVER exposed to the frontend. */
  botToken: (process.env.BOT_TOKEN ?? '').trim(),

  /** Numeric Telegram ID of the administrator. NEVER exposed to the frontend. */
  adminTelegramId: parseAdminTelegramId(process.env.ADMIN_TELEGRAM_ID),

  /** Public administrator username (without "@"). Safe to expose. */
  adminUsername,

  /** Public Telegram channel username (without "@"). Safe to expose. */
  channelUsername,

  /** Public HTTPS URL of the Mini App. Safe to expose. */
  webAppUrl: rawWebAppUrl,

  /** HTTP port. Railway injects PORT — always read from the environment. */
  port: parsePort(process.env.PORT),

  /** Absolute path to the SQLite database file. */
  databasePath: path.resolve(process.cwd(), rawDatabasePath),

  /** Maximum accepted age of Telegram Web App initData, in seconds. */
  initDataMaxAgeSeconds: parsePositiveInt(process.env.INIT_DATA_MAX_AGE_SECONDS, 86400),
} as const;

export const isBotConfigured = config.botToken.length > 0;
export const isMiniAppUrlConfigured = /^https:\/\//i.test(config.webAppUrl);

/** Public Telegram chat URL of the administrator. */
export const adminChatUrl = `https://t.me/${config.adminUsername}`;

/** Public Telegram channel URL. */
export const channelUrl = `https://t.me/${config.channelUsername}`;

export function logConfigWarnings(): void {
  const warnings: string[] = [];

  if (!isBotConfigured) {
    warnings.push('BOT_TOKEN is missing — the Telegram bot will NOT start (Mini App + API still work).');
  }
  if (config.adminTelegramId === null) {
    warnings.push('ADMIN_TELEGRAM_ID is missing or invalid — all /api/admin/* routes will return HTTP 503.');
  }
  if (!isMiniAppUrlConfigured) {
    warnings.push('WEB_APP_URL is missing or not HTTPS — the "Open Mini App" button will be hidden.');
  }
  if (config.isProduction && !isMiniAppUrlConfigured) {
    warnings.push('NODE_ENV=production but WEB_APP_URL is not a valid HTTPS URL.');
  }

  for (const warning of warnings) {
    console.warn(`[config] ${warning}`);
  }
}
