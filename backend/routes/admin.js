import express from 'express';
import { requireAdmin } from '../middlewares/admin.js';
import { requireAuth } from '../middleware/auth.js';
import { reportPost, reportUser, moderateHidePost, moderateBanUser } from '../controllers/adminController.js';
import { adminAddGame, adminRemoveGame } from '../controllers/gamesController.js';

export const router = express.Router();

// Reports
router.post('/report/post', requireAuth, reportPost);
router.post('/report/user', requireAuth, reportUser);

// Moderation
router.post('/moderate/hidePost', requireAdmin, moderateHidePost);
router.post('/moderate/banUser', requireAdmin, moderateBanUser);

// Games management
router.post('/games/add', requireAdmin, adminAddGame);
router.post('/games/remove', requireAdmin, adminRemoveGame);