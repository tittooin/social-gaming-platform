import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getWallet, getWalletHistory } from '../controllers/walletController.js';

export const router = express.Router();

router.get('/', requireAuth, getWallet);
router.get('/history', requireAuth, getWalletHistory);