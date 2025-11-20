import express from 'express';
import { startGame, applyGameMove, endGame, getLeaderboard } from '../controllers/gameController.js';
import { requireAuth } from '../../middleware/auth.js';

const router = express.Router();

router.post('/start', requireAuth, startGame);
router.post('/move', requireAuth, applyGameMove);
router.post('/end', requireAuth, endGame);
router.get('/leaderboard/:game', getLeaderboard);

export default router;