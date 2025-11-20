import 'dotenv/config';
import { pool } from '../db/index.js';

async function main() {
  try {
    await pool.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS uniq_rewards_mux ON game_rewards (match_id, user_id, game_type);'
    );
    console.log('unique index ensured');
  } catch (err) {
    console.error('Failed to ensure unique index:', err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();