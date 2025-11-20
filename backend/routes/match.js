import express from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { handleValidation } from '../middleware/validation.js';
import { startMatch, endMatch, listMatches } from '../controllers/matchController.js';

export const router = express.Router();

router.post('/start', requireAuth, startMatch);

router.post('/end',
  requireAuth,
  body('matchId').isUUID(),
  body('winner').isString().optional(),
  body('score').isInt({ min: 0 }).optional(),
  body('rewards').isInt({ min: 0 }),
  handleValidation,
  endMatch,
);

router.get('/list', requireAuth, listMatches);