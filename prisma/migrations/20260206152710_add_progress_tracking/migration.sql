-- AlterTable
ALTER TABLE "task" ADD COLUMN "targetCount" INTEGER;

-- AlterTable
ALTER TABLE "task_history" ADD COLUMN "currentCount" INTEGER;
ALTER TABLE "task_history" ADD COLUMN "note" TEXT;
ALTER TABLE "task_history" ADD COLUMN "progressIncrement" INTEGER;
