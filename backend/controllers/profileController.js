import { upsertProfile, getProfileByUserId } from '../services/profileService.js';

export async function updateProfile(req, res, next) {
  try {
    const profile = await upsertProfile(req.user.id, req.body || {});
    res.json({ profile });
  } catch (e) { next(e); }
}

export async function getProfile(req, res, next) {
  try {
    const profile = await getProfileByUserId(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ profile });
  } catch (e) { next(e); }
}