export type Confidence = 'Low' | 'Medium' | 'High';

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Match {
  id: number;
  league: string;
  homeTeam: string;
  awayTeam: string;
  /** ISO date, format YYYY-MM-DD */
  matchDate: string;
  /** 24h time, format HH:MM */
  matchTime: string;
  status: string;
  featured: boolean;
  createdAt: string;
}

export interface Prediction {
  id: number;
  matchId: number;
  market: string;
  selection: string;
  confidence: Confidence;
  reason: string;
  createdAt: string;
}

export interface PredictionWithMatch extends Prediction {
  match: Match | null;
}

export interface MatchStatistics {
  id: number;
  matchId: number;
  homeForm: string;
  awayForm: string;
  homeGoals: number;
  awayGoals: number;
  homePossession: number;
  awayPossession: number;
  homeXg: number;
  awayXg: number;
}

export interface MatchWithDetails extends Match {
  prediction: Prediction | null;
  statistics: MatchStatistics | null;
}

export interface PremiumContent {
  id: number;
  title: string;
  content: string;
  active: boolean;
  createdAt: string;
}

export interface UserRecord {
  id: number;
  telegramId: number;
  username: string | null;
  firstName: string | null;
  createdAt: string;
  lastActive: string;
}

/** Subset of the Telegram Web App `initDataUnsafe.user` object. */
export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Populated by `attachTelegramUser` middleware ONLY after server-side initData verification. */
      telegramUser?: TelegramWebAppUser;
    }
  }
}
