import { pool } from '../db/index.js';

export async function followUser(followerId, followeeId) {
  if (followerId === followeeId) throw new Error('Cannot follow yourself');
  const sql = `
    INSERT INTO followers (follower_id, followee_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING *;
  `;
  const { rows } = await pool.query(sql, [followerId, followeeId]);
  return rows[0] || null;
}

export async function unfollowUser(followerId, followeeId) {
  const { rowCount } = await pool.query('DELETE FROM followers WHERE follower_id = $1 AND followee_id = $2', [followerId, followeeId]);
  return rowCount > 0;
}

export async function listFollowers(userId) {
  const { rows } = await pool.query(
    'SELECT f.*, u.username, u.phone FROM followers f JOIN users u ON f.follower_id = u.id WHERE f.followee_id = $1 ORDER BY f.created_at DESC',
    [userId],
  );
  return rows;
}

export async function listFollowing(userId) {
  const { rows } = await pool.query(
    'SELECT f.*, u.username, u.phone FROM followers f JOIN users u ON f.followee_id = u.id WHERE f.follower_id = $1 ORDER BY f.created_at DESC',
    [userId],
  );
  return rows;
}