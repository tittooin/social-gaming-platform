import { getWalletByUserId } from '../services/walletService.js';
import { listTransactionsForUser } from '../services/transactionService.js';

export async function getWallet(req, res, next) {
  try {
    const wallet = await getWalletByUserId(req.user.id);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    return res.json({ wallet });
  } catch (err) {
    return next(err);
  }
}

export async function getWalletHistory(req, res, next) {
  try {
    const list = await listTransactionsForUser(req.user.id);
    return res.json({ transactions: list });
  } catch (err) {
    return next(err);
  }
}