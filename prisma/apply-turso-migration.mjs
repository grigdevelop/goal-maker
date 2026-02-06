import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const statements = [
  'ALTER TABLE "task" ADD COLUMN "targetCount" INTEGER',
  'ALTER TABLE "task_history" ADD COLUMN "currentCount" INTEGER',
  'ALTER TABLE "task_history" ADD COLUMN "note" TEXT',
  'ALTER TABLE "task_history" ADD COLUMN "progressIncrement" INTEGER',
];

for (const stmt of statements) {
  try {
    await client.execute(stmt);
    console.log('OK:', stmt);
  } catch (e) {
    console.log('SKIP:', e.message);
  }
}
console.log('Done!');
