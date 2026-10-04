import { getDb } from '../database/database';
import type { Match, MatchStatistics, MatchWithDetails, Prediction } from '../types';
import { mapMatch, mapPrediction, mapStatistics } from './mappers';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getMatchesForDate(date: string): Match[] {
  const rows = getDb()
    .prepare('SELECT * FROM matches WHERE match_date = ? ORDER BY match_time ASC, id ASC')
    .all(date) as Parameters<typeof mapMatch>[0][];
  return rows.map(mapMatch);
}

export function getTodayMatches(): Match[] {
  return getMatchesForDate(todayIso());
}

export function getFeaturedMatches(): Match[] {
  const rows = getDb()
    .prepare('SELECT * FROM matches WHERE featured = 1 ORDER BY match_date ASC, match_time ASC, id ASC LIMIT 12')
    .all() as Parameters<typeof mapMatch>[0][];
  return rows.map(mapMatch);
}

export function getMatchById(id: number): Match | null {
  const row = getDb()
    .prepare('SELECT * FROM matches WHERE id = ?')
    .get(id) as Parameters<typeof mapMatch>[0] | undefined;
  return row ? mapMatch(row) : null;
}

export function getMatchPrediction(matchId: number): Prediction | null {
  const row = getDb()
    .prepare('SELECT * FROM predictions WHERE match_id = ? ORDER BY id ASC LIMIT 1')
    .get(matchId) as Parameters<typeof mapPrediction>[0] | undefined;
  return row ? mapPrediction(row) : null;
}

export function getMatchStatistics(matchId: number): MatchStatistics | null {
  const row = getDb()
    .prepare('SELECT * FROM statistics WHERE match_id = ? LIMIT 1')
    .get(matchId) as Parameters<typeof mapStatistics>[0] | undefined;
  return row ? mapStatistics(row) : null;
}

export function getMatchWithDetails(id: number): MatchWithDetails | null {
  const match = getMatchById(id);
  if (!match) return null;
  return {
    ...match,
    prediction: getMatchPrediction(id),
    statistics: getMatchStatistics(id),
  };
}

export interface MatchInput {
  league: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  matchTime: string;
  status?: string;
  featured?: boolean;
}

export function createMatch(input: MatchInput): Match {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO matches (league, home_team, away_team, match_date, match_time, status, featured)
       VALUES (@league, @homeTeam, @awayTeam, @matchDate, @matchTime, @status, @featured)`,
    )
    .run({
      league: input.league,
      homeTeam: input.homeTeam,
      awayTeam: input.awayTeam,
      matchDate: input.matchDate,
      matchTime: input.matchTime,
      status: input.status ?? 'scheduled',
      featured: input.featured ? 1 : 0,
    });
  const created = getMatchById(Number(result.lastInsertRowid));
  if (!created) throw new Error('Failed to create match');
  return created;
}

export function updateMatch(id: number, input: Partial<MatchInput>): Match | null {
  const existing = getMatchById(id);
  if (!existing) return null;

  const db = getDb();
  db.prepare(
    `UPDATE matches
       SET league      = @league,
           home_team   = @homeTeam,
           away_team   = @awayTeam,
           match_date  = @matchDate,
           match_time  = @matchTime,
           status      = @status,
           featured    = @featured
     WHERE id = @id`,
  ).run({
    id,
    league: input.league ?? existing.league,
    homeTeam: input.homeTeam ?? existing.homeTeam,
    awayTeam: input.awayTeam ?? existing.awayTeam,
    matchDate: input.matchDate ?? existing.matchDate,
    matchTime: input.matchTime ?? existing.matchTime,
    status: input.status ?? existing.status,
    featured:
      input.featured === undefined ? (existing.featured ? 1 : 0) : input.featured ? 1 : 0,
  });

  return getMatchById(id);
}

export function deleteMatch(id: number): boolean {
  const result = getDb().prepare('DELETE FROM matches WHERE id = ?').run(id);
  return result.changes > 0;
}
