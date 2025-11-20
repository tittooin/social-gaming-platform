import { pool } from '../db/index.js';

export async function upsertProfile(userId, { display_name, bio, avatar_url }) {
  const sql = `
    INSERT INTO profiles (user_id, display_name, bio, avatar_url)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET display_name = EXCLUDED.display_name,
                  bio = EXCLUDED.bio,
                  avatar_url = EXCLUDED.avatar_url,
                  updated_at = now()
    RETURNING *;
  `;
  const { rows } = await pool.query(sql, [userId, display_name || null, bio || null, avatar_url || null]);
  return rows[0];
}

export async function getProfileByUserId(userId) {
  const { rows } = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
  return rows[0] || null;
}