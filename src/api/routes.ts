import { Router } from 'express';
import { z } from 'zod';
import { config, adminChatUrl, channelUrl } from '../config/config';
import { isDemoData } from '../database/database';
import {
  createMatch,
  deleteMatch,
  getFeaturedMatches,
  getMatchWithDetails,
  getTodayMatches,
  updateMatch,
} from '../services/matchService';
import {
  createPrediction,
  deletePrediction,
  getTodayPredictions,
  updatePrediction,
} from '../services/predictionService';
import { getActivePremiumContent } from '../services/premiumService';
import { getMatchStatistics } from '../services/matchService';
import { upsertUser } from '../services/userService';
import {
  requireAdmin,
  requireTelegramUser,
  strictRateLimiter,
} from './middleware';

export const apiRouter = Router();

/* ------------------------------------------------------------------ */
/* Public configuration (no secrets)                                   */
/* ------------------------------------------------------------------ */

apiRouter.get('/config', (_req, res) => {
  res.json({
    service: 'Amiros Football Analytics',
    adminUsername: config.adminUsername,
    adminChatUrl,
    channelUsername: config.channelUsername,
    channelUrl,
    webAppUrl: config.webAppUrl,
    demoData: isDemoData(),
  });
});

/* ------------------------------------------------------------------ */
/* Matches                                                             */
/* ------------------------------------------------------------------ */

apiRouter.get('/matches', (_req, res) => {
  const today = getTodayMatches();
  const featured = getFeaturedMatches();
  res.json({
    demoData: isDemoData(),
    today,
    featured,
  });
});

apiRouter.get('/matches/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid match id.' });
    return;
  }
  const match = getMatchWithDetails(id);
  if (!match) {
    res.status(404).json({ error: 'Match not found.' });
    return;
  }
  res.json({ demoData: isDemoData(), match });
});

/* ------------------------------------------------------------------ */
/* Predictions                                                         */
/* ------------------------------------------------------------------ */

apiRouter.get('/predictions', (_req, res) => {
  res.json({
    demoData: isDemoData(),
    predictions: getTodayPredictions(),
  });
});

/* ------------------------------------------------------------------ */
/* Statistics                                                          */
/* ------------------------------------------------------------------ */

apiRouter.get('/statistics/:matchId', (req, res) => {
  const matchId = Number(req.params.matchId);
  if (!Number.isInteger(matchId) || matchId <= 0) {
    res.status(400).json({ error: 'Invalid match id.' });
    return;
  }
  const statistics = getMatchStatistics(matchId);
  if (!statistics) {
    res.status(404).json({ error: 'Statistics not found for this match.' });
    return;
  }
  res.json({ demoData: isDemoData(), statistics });
});

/* ------------------------------------------------------------------ */
/* Premium                                                             */
/* ------------------------------------------------------------------ */

apiRouter.get('/premium', (_req, res) => {
  res.json({
    demoData: isDemoData(),
    items: getActivePremiumContent(),
  });
});

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

const userSchema = z.object({
  initData: z.string().min(10),
});

apiRouter.post('/users', strictRateLimiter, requireTelegramUser, (req, res) => {
  const parsed = userSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body.' });
    return;
  }
  const user = req.telegramUser!;
  const record = upsertUser(user);
  res.json({
    user: {
      telegramId: record.telegramId,
      username: record.username,
      firstName: record.firstName,
      isAdmin: config.adminTelegramId !== null && record.telegramId === config.adminTelegramId,
    },
  });
});

/* ------------------------------------------------------------------ */
/* Admin — matches                                                     */
/* ------------------------------------------------------------------ */

const matchSchema = z.object({
  league: z.string().min(1).max(120),
  homeTeam: z.string().min(1).max(120),
  awayTeam: z.string().min(1).max(120),
  matchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  matchTime: z.string().regex(/^\d{2}:\d{2}$/),
  status: z.enum(['scheduled', 'live', 'finished']).optional(),
  featured: z.boolean().optional(),
});

apiRouter.post(
  '/admin/matches',
  strictRateLimiter,
  requireTelegramUser,
  requireAdmin,
  (req, res) => {
    const parsed = matchSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid match payload.', details: parsed.error.flatten() });
      return;
    }
    const match = createMatch(parsed.data);
    res.status(201).json({ match });
  },
);

apiRouter.put(
  '/admin/matches/:id',
  strictRateLimiter,
  requireTelegramUser,
  requireAdmin,
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid match id.' });
      return;
    }
    const parsed = matchSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid match payload.', details: parsed.error.flatten() });
      return;
    }
    const match = updateMatch(id, parsed.data);
    if (!match) {
      res.status(404).json({ error: 'Match not found.' });
      return;
    }
    res.json({ match });
  },
);

apiRouter.delete(
  '/admin/matches/:id',
  strictRateLimiter,
  requireTelegramUser,
  requireAdmin,
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid match id.' });
      return;
    }
    const ok = deleteMatch(id);
    if (!ok) {
      res.status(404).json({ error: 'Match not found.' });
      return;
    }
    res.json({ ok: true });
  },
);

/* ------------------------------------------------------------------ */
/* Admin — predictions                                                 */
/* ------------------------------------------------------------------ */

const predictionSchema = z.object({
  matchId: z.number().int().positive(),
  market: z.string().min(1).max(80),
  selection: z.string().min(1).max(120),
  confidence: z.enum(['Low', 'Medium', 'High']),
  reason: z.string().max(500).optional(),
});

apiRouter.post(
  '/admin/predictions',
  strictRateLimiter,
  requireTelegramUser,
  requireAdmin,
  (req, res) => {
    const parsed = predictionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid prediction payload.', details: parsed.error.flatten() });
      return;
    }
    const prediction = createPrediction(parsed.data);
    res.status(201).json({ prediction });
  },
);

apiRouter.put(
  '/admin/predictions/:id',
  strictRateLimiter,
  requireTelegramUser,
  requireAdmin,
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid prediction id.' });
      return;
    }
    const parsed = predictionSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid prediction payload.', details: parsed.error.flatten() });
      return;
    }
    const prediction = updatePrediction(id, parsed.data);
    if (!prediction) {
      res.status(404).json({ error: 'Prediction not found.' });
      return;
    }
    res.json({ prediction });
  },
);

apiRouter.delete(
  '/admin/predictions/:id',
  strictRateLimiter,
  requireTelegramUser,
  requireAdmin,
  (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid prediction id.' });
      return;
    }
    const ok = deletePrediction(id);
    if (!ok) {
      res.status(404).json({ error: 'Prediction not found.' });
      return;
    }
    res.json({ ok: true });
  },
);
