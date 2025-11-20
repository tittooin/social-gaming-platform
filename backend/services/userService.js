import { pool } from '../db/index.js';

export async function ensureUser({ id, phone, deviceId }) {
  const existing = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
  if (existing.rowCount > 0) return existing.rows[0];

  await pool.query(
    `INSERT INTO users (id, phone, device_id) VALUES ($1, $2, $3)`,
    [id, phone || null, deviceId || null],
  );
  await pool.query(
    `INSERT INTO wallets (user_id, earned_chips, purchased_chips, diamonds) VALUES ($1, 0, 0, 0)`,
    [id],
  );
  return { id };
}

export async function getUserById(id) {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
}