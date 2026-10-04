import type {
  Match,
  MatchStatistics,
  MatchWithDetails,
  PremiumContent,
  Prediction,
  PredictionWithMatch,
  UserRecord,
  Confidence,
} from '../types';

interface MatchRow {
  id: number;
  league: string;
  home_team: string;
  away_team: string;
  match_date: string;
  match_time: string;
  status: string;
  featured: number;
  created_at: string;
}

interface PredictionRow {
  id: number;
  match_id: number;
  market: string;
  selection: string;
  confidence: string;
  reason: string;
  created_at: string;
}

interface StatisticsRow {
  id: number;
  match_id: number;
  home_form: string;
  away_form: string;
  home_goals: number;
  away_goals: number;
  home_possession: number;
  away_possession: number;
  home_xg: number;
  away_xg: number;
}

interface PremiumRow {
  id: number;
  title: string;
  content: string;
  active: number;
  created_at: string;
}

interface UserRow {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string | null;
  created_at: string;
  last_active: string;
}

function toConfidence(value: string): Confidence {
  if (value === 'Low' || value === 'Medium' || value === 'High') return value;
  return 'Medium';
}

export function mapMatch(row: MatchRow): Match {
  return {
    id: row.id,
    league: row.league,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    matchDate: row.match_date,
    matchTime: row.match_time,
    status: row.status,
    featured: row.featured === 1,
    createdAt: row.created_at,
  };
}

export function mapPrediction(row: PredictionRow): Prediction {
  return {
    id: row.id,
    matchId: row.match_id,
    market: row.market,
    selection: row.selection,
    confidence: toConfidence(row.confidence),
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export function mapStatistics(row: StatisticsRow): MatchStatistics {
  return {
    id: row.id,
    matchId: row.match_id,
    homeForm: row.home_form,
    awayForm: row.away_form,
    homeGoals: row.home_goals,
    awayGoals: row.away_goals,
    homePossession: row.home_possession,
    awayPossession: row.away_possession,
    homeXg: row.home_xg,
    awayXg: row.away_xg,
  };
}

export function mapPremium(row: PremiumRow): PremiumContent {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    active: row.active === 1,
    createdAt: row.created_at,
  };
}

export function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    telegramId: row.telegram_id,
    username: row.username,
    firstName: row.first_name,
    createdAt: row.created_at,
    lastActive: row.last_active,
  };
}

export function buildMatchWithDetails(
  match: Match,
  prediction: Prediction | null,
  statistics: MatchStatistics | null,
): MatchWithDetails {
  return { ...match, prediction, statistics };
}

export function buildPredictionWithMatch(
  prediction: Prediction,
  match: Match | null,
): PredictionWithMatch {
  return { ...prediction, match };
}
