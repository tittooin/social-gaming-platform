import { pool } from '../db/index.js';
import { getGameUrlForType } from '../services/gamesService.js';
import { getAvailableRules } from '../services/tournamentRulesService.js';

// Simple sample tournaments for Phase-1; replace with real DB later
const sampleTournaments = [
  { id: 'ludo-001', name: 'Ludo Daily Cup', game: 'ludo', rule: 'knockout', slots: 128, joined: false },
  { id: 'carrom-001', name: 'Carrom Classic Arena', game: 'carrom', rule: 'league', slots: 64, joined: false },
  { id: 'snake-001', name: 'Snake Sprint Open', game: 'snake', rule: 'highscore', slots: 128, joined: false },
  { id: 'solitaire-001', name: 'Solitaire Marathon', game: 'solitaire', rule: 'timeattack', slots: 256, joined: false },
  { id: 'chess-001', name: 'Chess Blitz Arena', game: 'chess', rule: 'knockout', slots: 64, joined: false },
  { id: 'word-001', name: 'Word Scramble Open', game: 'word', rule: 'highscore', slots: 256, joined: false },
];

export async function listTournaments(req, res, next) {
  try {
    const enriched = sampleTournaments.map((t) => ({
      ...t,
      url: getGameUrlForType(t.game) || null,
    }));
    return res.json({ tournaments: enriched });
  } catch (e) { return next(e); }
}

export async function joinTournament(req, res, next) {
  try {
    const { tournamentId } = req.body;
    if (!tournamentId) return res.status(422).json({ error: 'tournamentId required' });
    // TODO: Persist join in DB; for now acknowledge
    return res.json({ joined: true, tournamentId });
  } catch (e) { return next(e); }
}

export async function leaderboard(req, res, next) {
  try {
    const { id } = req.params;
    // If a real leaderboard table exists, query top entries by tournament id
    // Fallback: synthesize sample rows
    const sample = [
      { rank: 1, user_id: 'user-2001', points: 120 },
      { rank: 2, user_id: 'user-2002', points: 95 },
      { rank: 3, user_id: 'user-2003', points: 80 },
    ];
    return res.json({ leaderboard: sample, tournamentId: id });
  } catch (e) { return next(e); }
}

export async function getRules(req, res, next) {
  try {
    const rules = getAvailableRules();
    return res.json({ rules });
  } catch (e) { return next(e); }
}