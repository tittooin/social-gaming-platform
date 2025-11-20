import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { create, feed, getOne, like, comment, remove } from '../controllers/postController.js';

export const router = express.Router();

router.post('/post', requireAuth, create);
router.get('/feed', requireAuth, feed);
router.get('/post/:id', requireAuth, getOne);
router.post('/post/:id/like', requireAuth, like);
router.post('/post/:id/comment', requireAuth, comment);
router.delete('/post/:id', requireAuth, remove);