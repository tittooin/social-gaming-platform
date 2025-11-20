import { pool, withTransaction } from '../../db/index.js';
import { startRace as engineStart, validateRaceFinish, calculatePosition, saveReplay } from '../racing/racingEngine.js';
import { getTrack } from '../racing/trackData.js';
import { awardChips } from '../../services/walletService.js';
import { recordTransaction } from '../../services/transactionService.js';
import { addXP } from './rewardService.js';

export async function startRaceService({ userId, gameType, trackId }) {
  const { raceId, seed } = await engineStart(userId, gameType, trackId);
  return { raceId, seed };
}

function chipsForPosition(pos) {
  if (pos === 1) return 100;
  if (pos === 2) return 60;
  if (pos === 3) return 30;
  return 0;
}

export async function submitRaceResultService({ userId, raceId, gameType, trackId, payload }) {
  const track = getTrack(trackId);
  const validation = await validateRaceFinish({ raceId, userId, gameType, trackId, payload });

  const reward = await withTransaction(async (trx) => {
    const res = await trx.query(`SELECT * FROM races WHERE id=$1 FOR UPDATE`, [raceId]);
    if (res.rowCount === 0) throw new Error('Race not found');
    const race = res.rows[0];
    if (race.user_id !== userId) throw new Error('Unauthorized race');
    if (race.status !== 'started') throw new Error('Race already finished');

    const finishTimeMs = payload.finishTimeMs;
    const rivalsTimesMs = payload.rivalsTimesMs || [];
    const position = calculatePosition(finishTimeMs, rivalsTimesMs);
    const baseChips = validation.valid ? chipsForPosition(position) : 0;

    await trx.query(
      `UPDATE races SET status=$2 WHERE id=$1`,
      [raceId, validation.valid ? 'finished' : 'invalid']
    );
    await trx.query(
      `INSERT INTO race_results (race_id, user_id, track_id, finish_time_ms, position, checkpoints_hit, nitro_used, valid, validation_reason)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [raceId, userId, trackId, finishTimeMs, position, (payload.checkpointsHit||[]).length, payload.nitroUsed||0, validation.valid, validation.reason]
    );

    // Save replay if provided
    if (payload.positions && Array.isArray(payload.positions)) {
      await trx.query(
        `INSERT INTO race_replays (race_id, user_id, track_id, replay_json) VALUES ($1,$2,$3,$4)`,
        [raceId, userId, trackId, { positions: payload.positions }]
      );
    }

    // Award chips & XP (earned)
    if (baseChips > 0 && validation.valid) {
      await awardChips({ userId, chips: baseChips, kind: 'earned', client: trx });
      await recordTransaction({ client: trx, userId, walletId: null, chips: baseChips, type: 'earned', source: `racing:${trackId}` });
      await addXP(userId, Math.max(1, Math.floor(baseChips / 10)));
    }

    return { position, baseChips, validation };
  });

  // Leaderboard upsert: keep best time per track by period
  if (validation.valid) {
    const finishTimeMs = payload.finishTimeMs;
    await pool.query(
      `INSERT INTO leaderboards_racing (user_id, track_id, period, best_time_ms)
       VALUES ($1,$2,'all_time',$3)
       ON CONFLICT (user_id, track_id, period) DO UPDATE SET best_time_ms = LEAST(leaderboards_racing.best_time_ms, EXCLUDED.best_time_ms)`,
      [userId, trackId, finishTimeMs]
    );
    // daily & weekly (UTC date-based)
    const dayKey = 'daily';
    const weekKey = 'weekly';
    await pool.query(
      `INSERT INTO leaderboards_racing (user_id, track_id, period, best_time_ms)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, track_id, period) DO UPDATE SET best_time_ms = LEAST(leaderboards_racing.best_time_ms, EXCLUDED.best_time_ms)`,
      [userId, trackId, dayKey, finishTimeMs]
    );
    await pool.query(
      `INSERT INTO leaderboards_racing (user_id, track_id, period, best_time_ms)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id, track_id, period) DO UPDATE SET best_time_ms = LEAST(leaderboards_racing.best_time_ms, EXCLUDED.best_time_ms)`,
      [userId, trackId, weekKey, finishTimeMs]
    );
  }

  return reward;
}

export async function getRacingLeaderboard(trackId, period = 'daily') {
  const { rows } = await pool.query(
    `SELECT l.user_id, u.username, l.track_id, l.best_time_ms
     FROM leaderboards_racing l
     LEFT JOIN users u ON u.id = l.user_id
     WHERE l.track_id = $1 AND l.period = $2
     ORDER BY l.best_time_ms ASC
     LIMIT 50`,
    [trackId, period]
  );
  return rows;
}