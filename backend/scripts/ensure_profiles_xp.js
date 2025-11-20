import 'dotenv/config';
import { pool } from '../db/index.js';

async function main() {
  await pool.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0');
  console.log('profiles.xp ensured');
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });