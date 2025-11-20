import { pool } from '../../db/index.js';

export async function submitScore({ gameType, userId, score, when = new Date() }) {
  const dayStart = new Date(when); dayStart.setHours(0,0,0,0);
  const weekStart = new Date(when); const day = weekStart.getDay(); const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
  weekStart.setDate(diff); weekStart.setHours(0,0,0,0);

  await pool.query(
    `INSERT INTO leaderboards (game_type,user_id,period,period_start,score)
     VALUES ($1,$2,'daily',$3,$4)
     ON CONFLICT (game_type,user_id,period,period_start)
     DO UPDATE SET score = GREATEST(leaderboards.score, EXCLUDED.score)`,
    [gameType, userId, dayStart, score]
  );
  await pool.query(
    `INSERT INTO leaderboards (game_type,user_id,period,period_start,score)
     VALUES ($1,$2,'weekly',$3,$4)
     ON CONFLICT (game_type,user_id,period,period_start)
     DO UPDATE SET score = GREATEST(leaderboards.score, EXCLUDED.score)`,
    [gameType, userId, weekStart, score]
  );
}

export async function getLeaderboard(gameType, period = 'daily', periodStart = null, limit = 50) {
  if (!periodStart) {
    const now = new Date();
    if (period === 'daily') { now.setHours(0,0,0,0); periodStart = now; }
    else {
      const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      now.setDate(diff); now.setHours(0,0,0,0); periodStart = now;
    }
  }
  const { rows } = await pool.query(
    `SELECT user_id, score FROM leaderboards WHERE game_type=$1 AND period=$2 AND period_start=$3 ORDER BY score DESC LIMIT $4`,
    [gameType, period, periodStart, limit]
  );
  return rows;
}