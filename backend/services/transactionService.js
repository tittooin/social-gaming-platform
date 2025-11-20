import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/index.js';

export async function recordTransaction({ client, userId, walletId, chips, diamonds = 0, type = 'earned', source = 'match', meta = {} }) {
  const id = uuidv4();
  const exec = client || pool;
  await exec.query(
    `INSERT INTO transactions (id, user_id, wallet_id, type, amount_chips, amount_diamonds, source, meta)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, userId, walletId, type, chips, diamonds, source, meta],
  );
  return id;
}

export async function listTransactionsForUser(userId, limit = 50) {
  const { rows } = await pool.query(
    `SELECT id, type, amount_chips, amount_diamonds, source, meta, created_at
     FROM transactions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows;
}