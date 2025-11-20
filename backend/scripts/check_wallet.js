import 'dotenv/config';
import { pool } from '../db/index.js';

async function main() {
  const username = process.argv[2] || 'tester2';
  const u = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  console.log('users:', u.rows);
  if (u.rows.length) {
    const wid = await pool.query('SELECT * FROM wallets WHERE user_id = $1', [u.rows[0].id]);
    console.log('wallets:', wid.rows);
  }
  await pool.end();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});