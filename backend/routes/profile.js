import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { updateProfile, getProfile } from '../controllers/profileController.js';

export const router = express.Router();

router.post('/update', requireAuth, updateProfile);
router.get('/:id', requireAuth, getProfile);