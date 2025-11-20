import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { pool } from '../db/index.js';

async function run() {
  const dir = path.resolve(process.cwd(), 'migrations');
  const files = fs.readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  console.log('Running migrations:', files);

  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    console.log(`\n--- Executing ${file} ---`);
    await pool.query(sql);
    console.log(`--- Completed ${file} ---`);
  }
  console.log('All migrations complete.');
  await pool.end();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});