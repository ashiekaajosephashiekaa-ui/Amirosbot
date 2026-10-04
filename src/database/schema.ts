/**
 * SQLite schema for Amiros Football Analytics.
 *
 * The SQL is intentionally written in a portable subset so that the data layer
 * can later be migrated to PostgreSQL with minimal changes:
 *   - INTEGER PRIMARY KEY AUTOINCREMENT  -> SERIAL / IDENTITY
 *   - TEXT                                -> TEXT / TIMESTAMPTZ
 *   - datetime('now')                     -> now()
 *
 * All access goes through the service layer (`src/services/*`), never directly
 * from route handlers, so the storage engine can be swapped in one place.
 */
export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  telegram_id  INTEGER NOT NULL UNIQUE,
  username     TEXT,
  first_name   TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  last_active  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS matches (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  league      TEXT NOT NULL,
  home_team   TEXT NOT NULL,
  away_team   TEXT NOT NULL,
  match_date  TEXT NOT NULL,
  match_time  TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'scheduled',
  featured    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS predictions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id    INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  market      TEXT NOT NULL,
  selection   TEXT NOT NULL,
  confidence  TEXT NOT NULL DEFAULT 'Medium',
  reason      TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS statistics (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id         INTEGER NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
  home_form        TEXT NOT NULL DEFAULT '',
  away_form        TEXT NOT NULL DEFAULT '',
  home_goals       INTEGER NOT NULL DEFAULT 0,
  away_goals       INTEGER NOT NULL DEFAULT 0,
  home_possession  INTEGER NOT NULL DEFAULT 50,
  away_possession  INTEGER NOT NULL DEFAULT 50,
  home_xg          REAL NOT NULL DEFAULT 0,
  away_xg          REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS premium_content (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS app_meta (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_matches_date        ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_featured    ON matches(featured);
CREATE INDEX IF NOT EXISTS idx_predictions_match   ON predictions(match_id);
CREATE INDEX IF NOT EXISTS idx_statistics_match    ON statistics(match_id);
`;
