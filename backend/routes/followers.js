import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { follow, unfollow, followers, following } from '../controllers/followerController.js';

export const router = express.Router();

router.post('/follow', requireAuth, follow);
router.post('/unfollow', requireAuth, unfollow);
router.get('/followers/:id', requireAuth, followers);
router.get('/following/:id', requireAuth, following);