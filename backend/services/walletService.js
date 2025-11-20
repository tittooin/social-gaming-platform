import { withTransaction, pool } from '../db/index.js';

export async function getWalletByUserId(userId) {
  const res = await pool.query('SELECT * FROM wallets WHERE user_id = $1', [userId]);
  return res.rows[0] || null;
}

// Awards chips into earned or purchased buckets and updates diamonds if needed
export async function awardChips({ userId, chips, source = 'match', kind = 'earned', client }) {
  const exec = client || pool;
  const walletRes = await exec.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
  if (walletRes.rowCount === 0) throw new Error('Wallet not found');
  const wallet = walletRes.rows[0];

  let earned = Number(wallet.earned_chips);
  let purchased = Number(wallet.purchased_chips);
  let diamonds = Number(wallet.diamonds);

  if (kind === 'earned') earned += chips; else purchased += chips;

  // Conversion rules: 1000 chips = 1 diamond; 100 diamonds = ₹10
  const totalChips = earned + purchased;
  const newDiamonds = Math.floor(totalChips / 1000);
  diamonds = newDiamonds;

  await exec.query(
    'UPDATE wallets SET earned_chips = $1, purchased_chips = $2, diamonds = $3, updated_at = now() WHERE user_id = $4',
    [earned, purchased, diamonds, userId],
  );

  return { earned_chips: earned, purchased_chips: purchased, diamonds };
}

// Deduct chips safely: spend from earned first, then purchased
export async function deductChips({ userId, chips, client }) {
  return withTransaction(async (trx) => {
    const exec = client || trx;
    const walletRes = await exec.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
    if (walletRes.rowCount === 0) throw new Error('Wallet not found');
    const wallet = walletRes.rows[0];

    let earned = Number(wallet.earned_chips);
    let purchased = Number(wallet.purchased_chips);
    let diamonds = Number(wallet.diamonds);

    let remaining = chips;
    const fromEarned = Math.min(earned, remaining);
    earned -= fromEarned;
    remaining -= fromEarned;

    const fromPurchased = Math.min(purchased, remaining);
    purchased -= fromPurchased;
    remaining -= fromPurchased;

    if (remaining > 0) throw new Error('Insufficient chips');

    // Update diamonds after deduction
    const totalChips = earned + purchased;
    const newDiamonds = Math.floor(totalChips / 1000);
    diamonds = newDiamonds;

    await exec.query(
      'UPDATE wallets SET earned_chips = $1, purchased_chips = $2, diamonds = $3, updated_at = now() WHERE user_id = $4',
      [earned, purchased, diamonds, userId],
    );

    return { earned_chips: earned, purchased_chips: purchased, diamonds };
  });
}