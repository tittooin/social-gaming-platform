import crypto from 'crypto';
import { withTransaction, pool } from '../db/index.js';
import { awardChips, getWalletByUserId } from './walletService.js';
import { recordTransaction } from './transactionService.js';

export function generateServerSeed() {
  return crypto.randomBytes(16).toString('hex');
}

export async function startMatch({ userId }) {
  const serverSeed = generateServerSeed();
  const res = await pool.query(
    `INSERT INTO matches (user_id, server_seed, status) VALUES ($1, $2, 'started') RETURNING id, server_seed`,
    [userId, serverSeed],
  );
  return res.rows[0];
}

function computeServerRoll(matchId, serverSeed) {
  const hash = crypto.createHash('sha256').update(`${serverSeed}:${matchId}`).digest('hex');
  // Map first byte to 1..6
  const firstByte = parseInt(hash.slice(0, 2), 16);
  return (firstByte % 6) + 1;
}

export async function endMatch({ userId, matchId, winner = null, score = null, rewards }) {
  return withTransaction(async (trx) => {
    const matchRes = await trx.query('SELECT * FROM matches WHERE id = $1 FOR UPDATE', [matchId]);
    if (matchRes.rowCount === 0) throw new Error('Match not found');
    const match = matchRes.rows[0];
    if (match.user_id !== userId) throw new Error('Unauthorized match');
    if (match.status !== 'started') throw new Error('Match already ended');
    // Reward: use provided rewards value from RN
    const reward = Number.isFinite(rewards) ? Number(rewards) : 0;

    // Minimal update: mark ended and store reward; keep roll columns nullable
    await trx.query(
      `UPDATE matches SET status = 'ended', reward_chips = $1, ended_at = now() WHERE id = $2`,
      [reward, matchId],
    );

    const wallet = await getWalletByUserId(userId);
    await awardChips({ userId, chips: reward, kind: 'earned', client: trx });
    await recordTransaction({ client: trx, userId, walletId: wallet?.id || null, chips: reward, type: 'earned', source: `match:${matchId}`, meta: { winner, score } });

    const updatedWalletRes = await trx.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
    return { reward, wallet: updatedWalletRes.rows[0] };
  });
}

export async function listMatchesForUser(userId, limit = 50) {
  const { rows } = await pool.query(
    `
    SELECT m.id,
           m.status,
           m.created_at,
           CASE
             WHEN m.user_id = $1 THEN (
               SELECT mm.user_id FROM match_moves mm
               WHERE mm.match_id = m.id AND mm.user_id <> $1
               ORDER BY mm.created_at ASC
               LIMIT 1
             )
             ELSE m.user_id
           END AS opponent_id
    FROM matches m
    WHERE m.user_id = $1
       OR EXISTS (
         SELECT 1 FROM match_moves mm2
         WHERE mm2.match_id = m.id AND mm2.user_id = $1
       )
    ORDER BY m.created_at DESC
    LIMIT $2
    `,
    [userId, limit]
  );
  return rows;
}