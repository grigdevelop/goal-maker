import 'dotenv/config';
import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const sql = readFileSync('prisma/turso-migrate.sql', 'utf8');

// Split on semicolons, filter out empty and comment-only lines
const statements = sql
  .split(';')
  .map(s => s.replace(/--[^\n]*/g, '').trim())
  .filter(s => s.length > 0);

let ok = 0;
let errors = 0;

for (const stmt of statements) {
  try {
    await client.execute(stmt);
    const preview = stmt.replace(/\s+/g, ' ').substring(0, 70);
    console.log(`OK: ${preview}...`);
    ok++;
  } catch (e) {
    const preview = stmt.replace(/\s+/g, ' ').substring(0, 70);
    console.error(`ERR: ${e.message} | ${preview}`);
    errors++;
  }
}

console.log(`\nDone! ${ok} succeeded, ${errors} failed out of ${statements.length} statements.`);
