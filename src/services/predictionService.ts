import { getDb } from '../database/database';
import type { Confidence, Prediction, PredictionWithMatch } from '../types';
import { mapMatch, mapPrediction } from './mappers';

export function getPredictionsForDate(date: string): PredictionWithMatch[] {
  const rows = getDb()
    .prepare(
      `SELECT p.* FROM predictions p
       INNER JOIN matches m ON m.id = p.match_id
       WHERE m.match_date = ?
       ORDER BY m.match_time ASC, p.id ASC`,
    )
    .all(date) as Parameters<typeof mapPrediction>[0][];

  return rows.map((row) => {
    const prediction = mapPrediction(row);
    const matchRow = getDb()
      .prepare('SELECT * FROM matches WHERE id = ?')
      .get(prediction.matchId) as Parameters<typeof mapMatch>[0] | undefined;
    return {
      ...prediction,
      match: matchRow ? mapMatch(matchRow) : null,
    };
  });
}

export function getTodayPredictions(): PredictionWithMatch[] {
  return getPredictionsForDate(new Date().toISOString().slice(0, 10));
}

export function getPredictionById(id: number): Prediction | null {
  const row = getDb()
    .prepare('SELECT * FROM predictions WHERE id = ?')
    .get(id) as Parameters<typeof mapPrediction>[0] | undefined;
  return row ? mapPrediction(row) : null;
}

export interface PredictionInput {
  matchId: number;
  market: string;
  selection: string;
  confidence: Confidence;
  reason?: string;
}

export function createPrediction(input: PredictionInput): Prediction {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO predictions (match_id, market, selection, confidence, reason)
       VALUES (@matchId, @market, @selection, @confidence, @reason)`,
    )
    .run({
      matchId: input.matchId,
      market: input.market,
      selection: input.selection,
      confidence: input.confidence,
      reason: input.reason ?? '',
    });
  const created = getPredictionById(Number(result.lastInsertRowid));
  if (!created) throw new Error('Failed to create prediction');
  return created;
}

export function updatePrediction(
  id: number,
  input: Partial<PredictionInput>,
): Prediction | null {
  const existing = getPredictionById(id);
  if (!existing) return null;

  getDb()
    .prepare(
      `UPDATE predictions
         SET match_id   = @matchId,
             market     = @market,
             selection  = @selection,
             confidence = @confidence,
             reason     = @reason
       WHERE id = @id`,
    )
    .run({
      id,
      matchId: input.matchId ?? existing.matchId,
      market: input.market ?? existing.market,
      selection: input.selection ?? existing.selection,
      confidence: input.confidence ?? existing.confidence,
      reason: input.reason ?? existing.reason,
    });

  return getPredictionById(id);
}

export function deletePrediction(id: number): boolean {
  const result = getDb().prepare('DELETE FROM predictions WHERE id = ?').run(id);
  return result.changes > 0;
}
