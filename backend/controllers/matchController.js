import { startMatch as startMatchService, endMatch as endMatchService, listMatchesForUser } from '../services/matchService.js';

export async function startMatch(req, res, next) {
  try {
    const { id: userId } = req.user;
    const result = await startMatchService({ userId });
    return res.json({ matchId: result.id, serverSeed: result.server_seed });
  } catch (err) {
    return next(err);
  }
}

export async function endMatch(req, res, next) {
  try {
    const { id: userId } = req.user;
    const { matchId, winner, score, rewards } = req.body;
    const result = await endMatchService({ userId, matchId, winner, score, rewards });
    return res.json({ reward: result.reward, wallet: result.wallet });
  } catch (err) {
    return next(err);
  }
}

export async function listMatches(req, res, next) {
  try {
    const { id: userId } = req.user;
    const matches = await listMatchesForUser(userId);
    // Normalize keys for frontend: opponent_id, status, created_at
    return res.json({ matches });
  } catch (err) {
    return next(err);
  }
}