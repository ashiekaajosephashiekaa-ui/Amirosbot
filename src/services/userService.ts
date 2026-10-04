import { getDb } from '../database/database';
import type { TelegramWebAppUser, UserRecord } from '../types';
import { mapUser } from './mappers';

export function upsertUser(user: TelegramWebAppUser): UserRecord {
  const db = getDb();
  const username = user.username ?? null;
  const firstName = user.first_name ?? null;

  db.prepare(
    `INSERT INTO users (telegram_id, username, first_name, created_at, last_active)
     VALUES (@telegramId, @username, @firstName, datetime('now'), datetime('now'))
     ON CONFLICT(telegram_id) DO UPDATE SET
       username    = excluded.username,
       first_name  = excluded.first_name,
       last_active = datetime('now')`,
  ).run({ telegramId: user.id, username, firstName });

  const row = db
    .prepare('SELECT * FROM users WHERE telegram_id = ?')
    .get(user.id) as Parameters<typeof mapUser>[0];

  return mapUser(row);
}

export function getUserByTelegramId(telegramId: number): UserRecord | null {
  const row = getDb()
    .prepare('SELECT * FROM users WHERE telegram_id = ?')
    .get(telegramId) as Parameters<typeof mapUser>[0] | undefined;
  return row ? mapUser(row) : null;
}
