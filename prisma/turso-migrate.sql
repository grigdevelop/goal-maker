-- Full schema migration for Turso (combined from all Prisma migrations)

-- Auth tables
CREATE TABLE IF NOT EXISTS "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "username" TEXT
);

CREATE TABLE IF NOT EXISTS "session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expiresAt" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" DATETIME,
    "refreshTokenExpiresAt" DATETIME,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME
);

-- Domain tables
CREATE TABLE IF NOT EXISTS "goal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "skill" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'REGULAR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "task_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "endTime" DATETIME,
    "changedBy" TEXT,
    "changeReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_history_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "task_schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "scheduleType" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "lastEvaluatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_schedule_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Relation tables
CREATE TABLE IF NOT EXISTS "goal_skill" (
    "goalId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    PRIMARY KEY ("goalId", "skillId"),
    CONSTRAINT "goal_skill_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "goal_skill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "goal_task" (
    "goalId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    PRIMARY KEY ("goalId", "taskId"),
    CONSTRAINT "goal_task_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "goal_task_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "skill_task" (
    "skillId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    PRIMARY KEY ("skillId", "taskId"),
    CONSTRAINT "skill_task_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "skill_task_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "user_email_key" ON "user"("email");
CREATE INDEX IF NOT EXISTS "session_userId_idx" ON "session"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "session_token_key" ON "session"("token");
CREATE INDEX IF NOT EXISTS "account_userId_idx" ON "account"("userId");
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");
CREATE INDEX IF NOT EXISTS "goal_userId_idx" ON "goal"("userId");
CREATE INDEX IF NOT EXISTS "skill_userId_idx" ON "skill"("userId");
CREATE INDEX IF NOT EXISTS "task_userId_idx" ON "task"("userId");
CREATE INDEX IF NOT EXISTS "task_type_idx" ON "task"("type");
CREATE INDEX IF NOT EXISTS "task_history_taskId_createdAt_idx" ON "task_history"("taskId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "task_history_taskId_idx" ON "task_history"("taskId");
CREATE UNIQUE INDEX IF NOT EXISTS "task_schedule_taskId_key" ON "task_schedule"("taskId");
CREATE INDEX IF NOT EXISTS "task_schedule_taskId_idx" ON "task_schedule"("taskId");
CREATE INDEX IF NOT EXISTS "goal_skill_goalId_idx" ON "goal_skill"("goalId");
CREATE INDEX IF NOT EXISTS "goal_skill_skillId_idx" ON "goal_skill"("skillId");
CREATE INDEX IF NOT EXISTS "goal_task_goalId_idx" ON "goal_task"("goalId");
CREATE INDEX IF NOT EXISTS "goal_task_taskId_idx" ON "goal_task"("taskId");
CREATE INDEX IF NOT EXISTS "skill_task_skillId_idx" ON "skill_task"("skillId");
CREATE INDEX IF NOT EXISTS "skill_task_taskId_idx" ON "skill_task"("taskId");
