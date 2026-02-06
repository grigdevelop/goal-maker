-- CreateTable
CREATE TABLE "task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'REGULAR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "endTime" DATETIME,
    "changedBy" TEXT,
    "changeReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_history_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taskId" INTEGER NOT NULL,
    "scheduleType" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "lastEvaluatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "task_schedule_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goal_skill" (
    "goalId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,

    PRIMARY KEY ("goalId", "skillId"),
    CONSTRAINT "goal_skill_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "goal_skill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goal_task" (
    "goalId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,

    PRIMARY KEY ("goalId", "taskId"),
    CONSTRAINT "goal_task_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "goal_task_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "skill_task" (
    "skillId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,

    PRIMARY KEY ("skillId", "taskId"),
    CONSTRAINT "skill_task_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skill" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "skill_task_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "task" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "task_userId_idx" ON "task"("userId");

-- CreateIndex
CREATE INDEX "task_type_idx" ON "task"("type");

-- CreateIndex
CREATE INDEX "task_history_taskId_createdAt_idx" ON "task_history"("taskId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "task_history_taskId_idx" ON "task_history"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "task_schedule_taskId_key" ON "task_schedule"("taskId");

-- CreateIndex
CREATE INDEX "task_schedule_taskId_idx" ON "task_schedule"("taskId");

-- CreateIndex
CREATE INDEX "goal_skill_goalId_idx" ON "goal_skill"("goalId");

-- CreateIndex
CREATE INDEX "goal_skill_skillId_idx" ON "goal_skill"("skillId");

-- CreateIndex
CREATE INDEX "goal_task_goalId_idx" ON "goal_task"("goalId");

-- CreateIndex
CREATE INDEX "goal_task_taskId_idx" ON "goal_task"("taskId");

-- CreateIndex
CREATE INDEX "skill_task_skillId_idx" ON "skill_task"("skillId");

-- CreateIndex
CREATE INDEX "skill_task_taskId_idx" ON "skill_task"("taskId");
