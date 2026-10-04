import { config } from '../config/config';
import {
  closeDb,
  getDb,
  isMatchTableEmpty,
  isPremiumTableEmpty,
  markDemoData,
} from './database';

/* ------------------------------------------------------------------ */
/* DEMO / DEVELOPMENT DATA ONLY                                        */
/* ------------------------------------------------------------------ */
/* Everything below is fictional sample content used to demonstrate    */
/* the interface. It is NOT live football data and must be replaced    */
/* by the administrator before public use. The Mini App shows a        */
/* visible notice while demo data is present.                          */
/* ------------------------------------------------------------------ */

interface SeedMatch {
  league: string;
  homeTeam: string;
  awayTeam: string;
  matchTime: string;
  featured: boolean;
  prediction: {
    market: string;
    selection: string;
    confidence: 'Low' | 'Medium' | 'High';
    reason: string;
  };
  statistics: {
    homeForm: string;
    awayForm: string;
    homeGoals: number;
    awayGoals: number;
    homePossession: number;
    awayPossession: number;
    homeXg: number;
    awayXg: number;
  };
}

const DEMO_MATCHES: SeedMatch[] = [
  {
    league: 'Premier League (Demo)',
    homeTeam: 'Arsenal',
    awayTeam: 'Chelsea',
    matchTime: '19:30',
    featured: true,
    prediction: {
      market: 'Match Result',
      selection: 'Home Win',
      confidence: 'High',
      reason:
        "Arsenal's recent home form and overall performance indicators provide a stronger statistical profile entering this fixture.",
    },
    statistics: {
      homeForm: 'W W D W L',
      awayForm: 'W D W L W',
      homeGoals: 12,
      awayGoals: 9,
      homePossession: 58,
      awayPossession: 42,
      homeXg: 11.4,
      awayXg: 8.1,
    },
  },
  {
    league: 'La Liga (Demo)',
    homeTeam: 'Real Madrid',
    awayTeam: 'Sevilla',
    matchTime: '21:00',
    featured: true,
    prediction: {
      market: 'Over / Under',
      selection: 'Over 2.5 Goals',
      confidence: 'Medium',
      reason:
        'Both sides show a consistent trend of high combined goal involvement across recent fixtures.',
    },
    statistics: {
      homeForm: 'W W W D W',
      awayForm: 'L D W L D',
      homeGoals: 15,
      awayGoals: 7,
      homePossession: 61,
      awayPossession: 39,
      homeXg: 13.9,
      awayXg: 6.2,
    },
  },
  {
    league: 'Serie A (Demo)',
    homeTeam: 'Inter',
    awayTeam: 'Napoli',
    matchTime: '20:45',
    featured: false,
    prediction: {
      market: 'Both Teams To Score',
      selection: 'Yes',
      confidence: 'Medium',
      reason:
        'Both teams have recorded scoring contributions in the majority of their recent matches.',
    },
    statistics: {
      homeForm: 'W D W W D',
      awayForm: 'W W L D W',
      homeGoals: 13,
      awayGoals: 11,
      homePossession: 53,
      awayPossession: 47,
      homeXg: 10.8,
      awayXg: 9.7,
    },
  },
  {
    league: 'Bundesliga (Demo)',
    homeTeam: 'Bayern Munich',
    awayTeam: 'Borussia Dortmund',
    matchTime: '18:30',
    featured: true,
    prediction: {
      market: 'Over / Under',
      selection: 'Over 3.5 Goals',
      confidence: 'High',
      reason:
        'Historical goal volume between these two profiles, combined with current attacking output, points to a high-scoring profile.',
    },
    statistics: {
      homeForm: 'W W W W D',
      awayForm: 'W L W W L',
      homeGoals: 18,
      awayGoals: 12,
      homePossession: 59,
      awayPossession: 41,
      homeXg: 16.1,
      awayXg: 10.4,
    },
  },
  {
    league: 'Ligue 1 (Demo)',
    homeTeam: 'Paris Saint-Germain',
    awayTeam: 'Lyon',
    matchTime: '21:00',
    featured: false,
    prediction: {
      market: 'Double Chance',
      selection: 'Home Win or Draw',
      confidence: 'High',
      reason:
        'The home side shows a strong defensive and possession profile across its recent match sample.',
    },
    statistics: {
      homeForm: 'W W D W W',
      awayForm: 'D L D W L',
      homeGoals: 16,
      awayGoals: 8,
      homePossession: 63,
      awayPossession: 37,
      homeXg: 14.2,
      awayXg: 7.0,
    },
  },
  {
    league: 'Premier League (Demo)',
    homeTeam: 'Liverpool',
    awayTeam: 'Manchester City',
    matchTime: '17:30',
    featured: true,
    prediction: {
      market: 'Both Teams To Score',
      selection: 'Yes',
      confidence: 'Medium',
      reason:
        'Recent scoring trends indicate that both sides have consistently created scoring opportunities.',
    },
    statistics: {
      homeForm: 'W D W W L',
      awayForm: 'W W D W W',
      homeGoals: 14,
      awayGoals: 16,
      homePossession: 52,
      awayPossession: 48,
      homeXg: 12.6,
      awayXg: 13.8,
    },
  },
  {
    league: 'Eredivisie (Demo)',
    homeTeam: 'Ajax',
    awayTeam: 'PSV',
    matchTime: '16:45',
    featured: false,
    prediction: {
      market: 'Match Result',
      selection: 'Away Win',
      confidence: 'Low',
      reason:
        'The away side carries a marginally stronger recent attacking output, though variance in this fixture profile is high.',
    },
    statistics: {
      homeForm: 'D W L D W',
      awayForm: 'W W W D W',
      homeGoals: 10,
      awayGoals: 17,
      homePossession: 49,
      awayPossession: 51,
      homeXg: 9.3,
      awayXg: 14.5,
    },
  },
  {
    league: 'Primeira Liga (Demo)',
    homeTeam: 'Benfica',
    awayTeam: 'Porto',
    matchTime: '20:15',
    featured: false,
    prediction: {
      market: 'Over / Under',
      selection: 'Under 2.5 Goals',
      confidence: 'Medium',
      reason:
        'Both sides display low combined goal concession rates in their recent match samples.',
    },
    statistics: {
      homeForm: 'W D W D W',
      awayForm: 'D W D W D',
      homeGoals: 9,
      awayGoals: 8,
      homePossession: 55,
      awayPossession: 45,
      homeXg: 8.4,
      awayXg: 7.6,
    },
  },
  {
    league: 'Süper Lig (Demo)',
    homeTeam: 'Galatasaray',
    awayTeam: 'Fenerbahçe',
    matchTime: '19:00',
    featured: false,
    prediction: {
      market: 'Double Chance',
      selection: 'Draw or Away Win',
      confidence: 'Low',
      reason:
        'The statistical margins between these two profiles are narrow, which increases uncertainty in the outcome.',
    },
    statistics: {
      homeForm: 'W L D W D',
      awayForm: 'W W D L W',
      homeGoals: 11,
      awayGoals: 12,
      homePossession: 51,
      awayPossession: 49,
      homeXg: 10.1,
      awayXg: 10.9,
    },
  },
  {
    league: 'Championship (Demo)',
    homeTeam: 'Leeds United',
    awayTeam: 'Norwich City',
    matchTime: '15:00',
    featured: false,
    prediction: {
      market: 'Both Teams To Score',
      selection: 'No',
      confidence: 'Low',
      reason:
        'The sample size for both sides is limited and defensive records are inconsistent, so confidence is reduced.',
    },
    statistics: {
      homeForm: 'D W D L W',
      awayForm: 'L D L W D',
      homeGoals: 8,
      awayGoals: 6,
      homePossession: 54,
      awayPossession: 46,
      homeXg: 7.9,
      awayXg: 6.4,
    },
  },
];

const DEMO_PREMIUM = [
  {
    title: 'Premium Analysis — Overview',
    content:
      'Premium analysis provides deeper match breakdowns, extended statistical context and additional prediction content. Contact the administrator for access.',
  },
  {
    title: 'Statistical Deep Dive',
    content:
      'Extended metrics including expected goals trends, possession-adjusted performance and recent form weighting across selected fixtures.',
  },
  {
    title: 'Daily Premium Insights',
    content:
      'A short daily summary of selected fixtures with supporting statistical reasoning. Analysis only — no outcome is guaranteed.',
  },
];

/** Returns today's date (UTC) shifted by `offsetDays`, formatted YYYY-MM-DD. */
function isoDateWithOffset(offsetDays: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export interface SeedOptions {
  /** When true, existing matches/predictions/statistics/premium rows are removed first. */
  reset?: boolean;
}

/**
 * Inserts the demo/development dataset.
 * Returns the number of matches inserted.
 */
export function seedDemoData(options: SeedOptions = {}): number {
  const db = getDb();
  const today = isoDateWithOffset(0);

  const run = db.transaction((): number => {
    if (options.reset) {
      db.prepare('DELETE FROM statistics').run();
      db.prepare('DELETE FROM predictions').run();
      db.prepare('DELETE FROM matches').run();
      db.prepare('DELETE FROM premium_content').run();
    }

    const insertMatch = db.prepare(
      `INSERT INTO matches (league, home_team, away_team, match_date, match_time, status, featured)
       VALUES (@league, @homeTeam, @awayTeam, @matchDate, @matchTime, 'scheduled', @featured)`,
    );
    const insertPrediction = db.prepare(
      `INSERT INTO predictions (match_id, market, selection, confidence, reason)
       VALUES (@matchId, @market, @selection, @confidence, @reason)`,
    );
    const insertStatistics = db.prepare(
      `INSERT INTO statistics
         (match_id, home_form, away_form, home_goals, away_goals,
          home_possession, away_possession, home_xg, away_xg)
       VALUES
         (@matchId, @homeForm, @awayForm, @homeGoals, @awayGoals,
          @homePossession, @awayPossession, @homeXg, @awayXg)`,
    );

    let inserted = 0;

    for (const demo of DEMO_MATCHES) {
      const result = insertMatch.run({
        league: demo.league,
        homeTeam: demo.homeTeam,
        awayTeam: demo.awayTeam,
        matchDate: today,
        matchTime: demo.matchTime,
        featured: demo.featured ? 1 : 0,
      });

      const matchId = Number(result.lastInsertRowid);

      insertPrediction.run({
        matchId,
        market: demo.prediction.market,
        selection: demo.prediction.selection,
        confidence: demo.prediction.confidence,
        reason: demo.prediction.reason,
      });

      insertStatistics.run({
        matchId,
        homeForm: demo.statistics.homeForm,
        awayForm: demo.statistics.awayForm,
        homeGoals: demo.statistics.homeGoals,
        awayGoals: demo.statistics.awayGoals,
        homePossession: demo.statistics.homePossession,
        awayPossession: demo.statistics.awayPossession,
        homeXg: demo.statistics.homeXg,
        awayXg: demo.statistics.awayXg,
      });

      inserted += 1;
    }

    const insertPremium = db.prepare(
      `INSERT INTO premium_content (title, content, active) VALUES (@title, @content, 1)`,
    );
    for (const item of DEMO_PREMIUM) {
      insertPremium.run({ title: item.title, content: item.content });
    }

    markDemoData();
    return inserted;
  });

  return run();
}

/** Inserts only the premium demo rows (used when matches already exist). */
export function seedPremiumContent(): void {
  const db = getDb();
  const insertPremium = db.prepare(
    `INSERT INTO premium_content (title, content, active) VALUES (@title, @content, 1)`,
  );
  const run = db.transaction(() => {
    for (const item of DEMO_PREMIUM) {
      insertPremium.run({ title: item.title, content: item.content });
    }
  });
  run();
}

/**
 * Called on startup. Ensures the app is never empty on a fresh deployment.
 * Returns true when demo content was inserted.
 */
export function seedIfEmpty(): boolean {
  let seeded = false;

  if (isMatchTableEmpty())
