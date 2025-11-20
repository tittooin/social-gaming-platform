import { pool } from '../db/index.js';

export async function createPost(userId, { content, image_url, video_url }) {
  const sql = `
    INSERT INTO posts (user_id, content, image_url, video_url)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await pool.query(sql, [userId, content || null, image_url || null, video_url || null]);
  return rows[0];
}

export async function getPostById(id) {
  const { rows } = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
  return rows[0] || null;
}

export async function getFeed(userId) {
  // Simple feed: latest posts from followed users + self, not hidden
  const sql = `
    SELECT p.* FROM posts p
    WHERE p.is_hidden = false AND (
      p.user_id = $1 OR p.user_id IN (
        SELECT followee_id FROM followers WHERE follower_id = $1
      )
    )
    ORDER BY p.created_at DESC
    LIMIT 100;
  `;
  const { rows } = await pool.query(sql, [userId]);
  return rows;
}

export async function likePost(userId, postId) {
  const sql = `
    INSERT INTO post_likes (post_id, user_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING *;
  `;
  const { rows } = await pool.query(sql, [postId, userId]);
  return rows[0] || null;
}

export async function commentPost(userId, postId, content) {
  const sql = `
    INSERT INTO post_comments (post_id, user_id, content)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const { rows } = await pool.query(sql, [postId, userId, content]);
  return rows[0];
}

export async function hidePost(postId) {
  const { rows } = await pool.query('UPDATE posts SET is_hidden = true WHERE id = $1 RETURNING *', [postId]);
  return rows[0] || null;
}

export async function deletePostHard(postId) {
  const { rowCount } = await pool.query('DELETE FROM posts WHERE id = $1', [postId]);
  return rowCount > 0;
}