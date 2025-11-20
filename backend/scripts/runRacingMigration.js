import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { pool } from '../db/index.js';

async function main() {
  const file = path.join(process.cwd(), 'migrations', '201_create_racing_tables.sql');
  const sql = fs.readFileSync(file, 'utf8');
  console.log('Executing racing migration 201...');
  await pool.query(sql);
  console.log('Racing migration completed.');
  await pool.end();
}

main().catch((e) => { console.error('Racing migration failed:', e); process.exit(1); });