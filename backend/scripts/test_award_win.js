import 'dotenv/config';
import { pool } from '../db/index.js';
import { awardWin } from '../src/services/rewardService.js';

async function main() {
  const username = process.argv[2] || 'tester2';
  const { rows } = await pool.query('SELECT id FROM users WHERE username=$1', [username]);
  const userId = rows[0]?.id;
  if (!userId) throw new Error('user not found');
  await awardWin(userId, 5);
  console.log('awardWin succeeded');
  await pool.end();
}

main().catch(e => { console.error('awardWin error:', e); process.exit(1); });