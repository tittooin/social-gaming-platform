import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { listTournaments, joinTournament, leaderboard, getRules } from '../controllers/tournamentController.js';

export const router = express.Router();

router.get('/', requireAuth, listTournaments);
router.post('/join', requireAuth, joinTournament);
router.get('/:id/leaderboard', requireAuth, leaderboard);
router.get('/rules', requireAuth, getRules);