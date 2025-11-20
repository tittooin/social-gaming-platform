import 'dotenv/config';
import { pool } from '../db/index.js';

async function main() {
  const res = await pool.query(
    `SELECT indexname, indexdef
     FROM pg_indexes
     WHERE schemaname = 'public' AND tablename = 'game_rewards'
     ORDER BY indexname;`
  );
  console.log('Indexes on game_rewards:');
  for (const row of res.rows) {
    console.log('-', row.indexname, '\n ', row.indexdef);
  }
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });