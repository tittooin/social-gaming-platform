import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getGames, getStaticGames } from '../controllers/gamesController.js';

export const router = express.Router();

// Public for authenticated users: list available games
router.get('/', requireAuth, getGames);
// Public: list static integrated games served under /games
router.get('/static', getStaticGames);