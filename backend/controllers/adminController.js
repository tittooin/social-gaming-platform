import { hidePost } from '../services/postService.js';
import { pool } from '../db/index.js';

export async function reportPost(req, res, next) {
  try {
    const { postId, reason } = req.body;
    if (!postId) return res.status(422).json({ error: 'postId required' });
    const sql = `INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES ($1,'post',$2,$3) RETURNING *`;
    const { rows } = await pool.query(sql, [req.user.id, postId, reason || null]);
    res.json({ report: rows[0] });
  } catch (e) { next(e); }
}

export async function reportUser(req, res, next) {
  try {
    const { userId, reason } = req.body;
    if (!userId) return res.status(422).json({ error: 'userId required' });
    const sql = `INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES ($1,'user',$2,$3) RETURNING *`;
    const { rows } = await pool.query(sql, [req.user.id, userId, reason || null]);
    res.json({ report: rows[0] });
  } catch (e) { next(e); }
}

export async function moderateHidePost(req, res, next) {
  try {
    const { postId } = req.body;
    if (!postId) return res.status(422).json({ error: 'postId required' });
    const post = await hidePost(postId);
    res.json({ post });
  } catch (e) { next(e); }
}

export async function moderateBanUser(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(422).json({ error: 'userId required' });
    const { rows } = await pool.query('UPDATE users SET banned = true WHERE id = $1 RETURNING *', [userId]);
    res.json({ user: rows[0] });
  } catch (e) { next(e); }
}