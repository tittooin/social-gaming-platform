import { startRaceService, submitRaceResultService, getRacingLeaderboard } from '../services/racingService.js';
import { getTrack } from '../racing/trackData.js';

function requireAuthBasic(req) {
  if (!req.user) throw new Error('Unauthorized');
}

export async function startRace(req, res) {
  try {
    requireAuthBasic(req);
    const { game_type, track_id } = req.body;
    if (!game_type || !track_id) return res.status(400).json({ error: 'Missing game_type or track_id' });
    getTrack(track_id); // throws if unknown
    const { raceId, seed } = await startRaceService({ userId: req.user.id, gameType: game_type, trackId: track_id });
    res.json({ race_id: raceId, seed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function submitRaceResult(req, res) {
  try {
    requireAuthBasic(req);
    const { race_id, game_type, track_id, payload } = req.body;
    if (!race_id || !game_type || !track_id || !payload) return res.status(400).json({ error: 'Missing fields' });
    const result = await submitRaceResultService({ userId: req.user.id, raceId: race_id, gameType: game_type, trackId: track_id, payload });
    res.json({ position: result.position, chips: result.baseChips, validation: result.validation });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function getLeaderboardRacing(req, res) {
  try {
    const { track } = req.query;
    const period = req.query.period || 'daily';
    if (!track) return res.status(400).json({ error: 'Missing track' });
    getTrack(track);
    const rows = await getRacingLeaderboard(track, period);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}