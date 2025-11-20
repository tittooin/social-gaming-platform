import { followUser, unfollowUser, listFollowers, listFollowing } from '../services/followerService.js';

export async function follow(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(422).json({ error: 'userId required' });
    const row = await followUser(req.user.id, userId);
    res.json({ followed: !!row });
  } catch (e) { next(e); }
}

export async function unfollow(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(422).json({ error: 'userId required' });
    const ok = await unfollowUser(req.user.id, userId);
    res.json({ unfollowed: ok });
  } catch (e) { next(e); }
}

export async function followers(req, res, next) {
  try {
    const list = await listFollowers(req.params.id);
    res.json({ followers: list });
  } catch (e) { next(e); }
}

export async function following(req, res, next) {
  try {
    const list = await listFollowing(req.params.id);
    res.json({ following: list });
  } catch (e) { next(e); }
}