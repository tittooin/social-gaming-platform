import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getGames } from '../controllers/gamesController.js';

export const router = express.Router();

// Public for authenticated users: list available games
router.get('/', requireAuth, getGames);