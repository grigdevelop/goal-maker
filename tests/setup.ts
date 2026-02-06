import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const TEST_DB_PATH = path.join(__dirname, '..', 'prisma', 'test.db');
const TEST_DB_URL = `file:${TEST_DB_PATH}`;

// Clean up any previous test database
if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
}

const adapter = new PrismaBetterSqlite3({ url: TEST_DB_URL });
export const testPrisma = new PrismaClient({ adapter });

beforeAll(async () => {
    // Push schema to test database
    execSync('npx prisma db push', {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, DATABASE_URL: TEST_DB_URL },
        stdio: 'pipe',
    });
});

beforeEach(async () => {
    // Clean tables in correct order (dependent tables first)
    await testPrisma.$executeRawUnsafe('DELETE FROM "task_history"');
    await testPrisma.$executeRawUnsafe('DELETE FROM "task_schedule"');
    await testPrisma.$executeRawUnsafe('DELETE FROM "goal_skill"');
    await testPrisma.$executeRawUnsafe('DELETE FROM "goal_task"');
    await testPrisma.$executeRawUnsafe('DELETE FROM "skill_task"');
    await testPrisma.$executeRawUnsafe('DELETE FROM "task"');
    await testPrisma.$executeRawUnsafe('DELETE FROM "skill"');
    await testPrisma.$executeRawUnsafe('DELETE FROM "goal"');
    await testPrisma.$executeRawUnsafe('DELETE FROM "user"');
});

afterAll(async () => {
    await testPrisma.$disconnect();
});

export async function createTestUser(id = 'test-user-1') {
    return testPrisma.user.create({
        data: {
            id,
            name: 'Test User',
            email: `${id}@test.com`,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
}
