import express from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { startRace, submitRaceResult, getLeaderboardRacing } from '../controllers/racingController.js';

const router = express.Router();

router.post('/start', requireAuth, startRace);
router.post('/finish', requireAuth, submitRaceResult);
router.get('/leaderboard', getLeaderboardRacing);

export default router;