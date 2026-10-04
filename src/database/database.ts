import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { config } from '../config/config';
import { SCHEMA_SQL } from './schema';

let instance: Database.Database | null = null;

/**
 * Returns the singleton SQLite connection, creating the file, the parent
 * directory and the schema on first use.
 */
export function getDb(): Database.Database {
  if (instance) return instance;

  const directory = path.dirname(config.databasePath);
  fs.mkdirSync(directory, { recursive: true });

  const db = new Database(config.databasePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA_SQL);

  instance = db;
  console.log(`[db] SQLite ready at ${config.databasePath}`);
  return instance;
}

export function closeDb(): void {
  if (!instance) return;
  try {
    instance.close();
  } catch (error) {
    console.error('[db] failed to close cleanly:', error);
  } finally {
    instance = null;
  }
}

/** True when the matches table contains no rows. */
export function isMatchTableEmpty(): boolean {
  const row = getDb().prepare('SELECT COUNT(*) AS count FROM matches').get() as { count: number };
  return row.count === 0;
}

/** True when the premium_content table contains no rows. */
export function isPremiumTableEmpty(): boolean {
  const row = getDb().prepare('SELECT COUNT(*) AS count FROM premium_content').get() as { count: number };
  return row.count === 0;
}

export function getMeta(key: string): string | null {
  const row = getDb()
    .prepare('SELECT value FROM app_meta WHERE key = ?')
    .get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setMeta(key: string, value: string): void {
  getDb()
    .prepare(
      `INSERT INTO app_meta (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    )
    .run(key, value);
}

/**
 * True while the database still contains the shipped demo/development data.
 * The Mini App shows a visible "demo data" notice while this is true.
 */
export function isDemoData(): boolean {
  return getMeta('demo_data') === '1';
}

export function markDemoData(): void {
  setMeta('demo_data', '1');
}

export function clearDemoDataFlag(): void {
  setMeta('demo_data', '0');
}
