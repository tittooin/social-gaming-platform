import 'dotenv/config';
import { pool } from '../db/index.js';
import { recordTransaction } from '../services/transactionService.js';

async function main() {
  const username = process.argv[2] || 'tester2';
  const { rows } = await pool.query('SELECT id FROM users WHERE username=$1', [username]);
  console.log('user rows:', rows);
  const userId = rows[0]?.id;
  if (!userId) throw new Error('user not found');
  const id = await recordTransaction({ userId, walletId: null, chips: 5, type: 'earned', source: 'TEST' });
  console.log('inserted tx id:', id);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });