import { awardChips } from '../../services/walletService.js';
import { recordTransaction } from '../../services/transactionService.js';
import { pool } from '../../db/index.js';

export async function recordMatch({ matchId, userId, gameType, outcome }) {
  await pool.query(
    `INSERT INTO game_rewards (match_id, user_id, game_type, outcome, fee_chips, win_chips, net_chips)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (match_id, user_id, game_type) DO NOTHING`,
    [matchId, userId, gameType, outcome, 10, outcome === 'win' ? 100 : 0, outcome === 'win' ? 90 : -10]
  );
}

export async function awardWin(userId, chips = 90) {
  await awardChips({ userId, chips });
  await recordTransaction({ userId, walletId: null, chips, type: 'earned', source: 'WIN_REWARD' });
}

export async function addXP(userId, amount) {
  await pool.query(
    `UPDATE profiles SET xp = COALESCE(xp,0) + $2 WHERE user_id = $1`,
    [userId, amount]
  );
}