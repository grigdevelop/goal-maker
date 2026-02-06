import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testPrisma, createTestUser } from './setup';

vi.mock('@/lib/prisma', () => ({
    default: testPrisma,
}));

import { createTask } from '@/lib/services/task-service';
import { changeStatus, getLatestHistory } from '@/lib/services/task-history-service';
import {
    shouldActivate,
    parseScheduleConfig,
    evaluateTask,
    evaluateAll,
    upsertSchedule,
    deleteSchedule,
} from '@/lib/services/schedule-evaluator-service';
import { TaskStatus, TaskType, ScheduleType, ChangeReason } from '@/lib/constants/task';

describe('Schedule Evaluator Service', () => {
    let userId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        userId = user.id;
    });

    // ── shouldActivate ──────────────────────────────────────

    describe('shouldActivate', () => {
        it('should match DAILY schedule', () => {
            expect(shouldActivate(ScheduleType.DAILY, { enabled: true })).toBe(true);
        });

        it('should not match DAILY when disabled', () => {
            expect(shouldActivate(ScheduleType.DAILY, { enabled: false } as any)).toBe(false);
        });

        it('should match WEEKLY on correct day', () => {
            // Create a known Wednesday (day 3)
            const wednesday = new Date('2025-01-08'); // Jan 8, 2025 is a Wednesday
            expect(shouldActivate(ScheduleType.WEEKLY, { daysOfWeek: [3] }, wednesday)).toBe(true);
        });

        it('should not match WEEKLY on wrong day', () => {
            const wednesday = new Date('2025-01-08');
            expect(shouldActivate(ScheduleType.WEEKLY, { daysOfWeek: [1, 5] }, wednesday)).toBe(false);
        });

        it('should match WEEKLY with multiple days', () => {
            const wednesday = new Date('2025-01-08');
            expect(shouldActivate(ScheduleType.WEEKLY, { daysOfWeek: [1, 3, 5] }, wednesday)).toBe(true);
        });

        it('should match MONTHLY on correct day', () => {
            const jan15 = new Date('2025-01-15');
            expect(shouldActivate(ScheduleType.MONTHLY, { daysOfMonth: [15] }, jan15)).toBe(true);
        });

        it('should not match MONTHLY on wrong day', () => {
            const jan15 = new Date('2025-01-15');
            expect(shouldActivate(ScheduleType.MONTHLY, { daysOfMonth: [1, 30] }, jan15)).toBe(false);
        });

        it('should match CUSTOM on correct date', () => {
            const date = new Date('2025-01-15');
            expect(shouldActivate(ScheduleType.CUSTOM, { dates: ['2025-01-15', '2025-02-20'] }, date)).toBe(true);
        });

        it('should not match CUSTOM on wrong date', () => {
            const date = new Date('2025-01-16');
            expect(shouldActivate(ScheduleType.CUSTOM, { dates: ['2025-01-15', '2025-02-20'] }, date)).toBe(false);
        });

        it('should return false for unknown schedule type', () => {
            expect(shouldActivate('UNKNOWN', { enabled: true } as any)).toBe(false);
        });
    });

    // ── parseScheduleConfig ─────────────────────────────────

    describe('parseScheduleConfig', () => {
        it('should parse daily config', () => {
            const config = parseScheduleConfig('{"enabled":true}');
            expect(config).toEqual({ enabled: true });
        });

        it('should parse weekly config', () => {
            const config = parseScheduleConfig('{"daysOfWeek":[1,3,5]}');
            expect(config).toEqual({ daysOfWeek: [1, 3, 5] });
        });

        it('should parse monthly config', () => {
            const config = parseScheduleConfig('{"daysOfMonth":[1,15,30]}');
            expect(config).toEqual({ daysOfMonth: [1, 15, 30] });
        });

        it('should parse custom config', () => {
            const config = parseScheduleConfig('{"dates":["2025-01-15"]}');
            expect(config).toEqual({ dates: ['2025-01-15'] });
        });
    });

    // ── upsertSchedule ──────────────────────────────────────

    describe('upsertSchedule', () => {
        it('should create a new schedule', async () => {
            const task = await createTask({ userId, title: 'Task', type: TaskType.REPEATABLE });

            const schedule = await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.WEEKLY,
                config: { daysOfWeek: [1, 3, 5] },
            });

            expect(schedule.taskId).toBe(task.id);
            expect(schedule.scheduleType).toBe(ScheduleType.WEEKLY);
            expect(JSON.parse(schedule.config)).toEqual({ daysOfWeek: [1, 3, 5] });
        });

        it('should update existing schedule', async () => {
            const task = await createTask({ userId, title: 'Task', type: TaskType.REPEATABLE });

            await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.WEEKLY,
                config: { daysOfWeek: [1, 3, 5] },
            });

            const updated = await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.DAILY,
                config: { enabled: true },
            });

            expect(updated.scheduleType).toBe(ScheduleType.DAILY);
            expect(JSON.parse(updated.config)).toEqual({ enabled: true });
        });
    });

    // ── deleteSchedule ──────────────────────────────────────

    describe('deleteSchedule', () => {
        it('should delete a schedule', async () => {
            const task = await createTask({ userId, title: 'Task', type: TaskType.REPEATABLE });
            await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.DAILY,
                config: { enabled: true },
            });

            await deleteSchedule(task.id);

            const schedule = await testPrisma.taskSchedule.findUnique({
                where: { taskId: task.id },
            });
            expect(schedule).toBeNull();
        });

        it('should throw when schedule does not exist', async () => {
            await expect(deleteSchedule(99999)).rejects.toThrow();
        });
    });

    // ── evaluateTask ────────────────────────────────────────

    describe('evaluateTask', () => {
        it('should skip REGULAR tasks', async () => {
            const task = await createTask({ userId, title: 'Regular' });

            const result = await evaluateTask(task.id);
            expect(result).toBeNull();
        });

        it('should skip tasks without schedule', async () => {
            const task = await createTask({ userId, title: 'No Schedule', type: TaskType.REPEATABLE });

            const result = await evaluateTask(task.id);
            expect(result).toBeNull();
        });

        it('should set TODO task to IN_PROGRESS on schedule match', async () => {
            const task = await createTask({ userId, title: 'Daily Task', type: TaskType.REPEATABLE });
            await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.DAILY,
                config: { enabled: true },
            });

            const result = await evaluateTask(task.id);

            expect(result).toBeDefined();
            expect(result!.status).toBe(TaskStatus.IN_PROGRESS);
            expect(result!.changeReason).toBe(ChangeReason.SCHEDULE_MATCH);
            expect(result!.changedBy).toBeNull();
        });

        it('should not change IN_PROGRESS task on schedule match', async () => {
            const task = await createTask({ userId, title: 'Task', type: TaskType.REPEATABLE });
            await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.DAILY,
                config: { enabled: true },
            });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            const result = await evaluateTask(task.id);
            expect(result).toBeNull();
        });

        it('should reset DONE repeatable task to TODO', async () => {
            const task = await createTask({ userId, title: 'Task', type: TaskType.REPEATABLE });
            await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.DAILY,
                config: { enabled: true },
            });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.DONE, userId });

            const result = await evaluateTask(task.id);

            expect(result).toBeDefined();
            expect(result!.status).toBe(TaskStatus.TODO);
            expect(result!.changeReason).toBe(ChangeReason.SCHEDULE_RESET);
        });

        it('should NOT reset DONE custom task to TODO', async () => {
            const today = new Date();
            const dateStr = today.toISOString().split('T')[0];
            const task = await createTask({ userId, title: 'Task', type: TaskType.CUSTOM });
            await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.CUSTOM,
                config: { dates: [dateStr] },
            });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.DONE, userId });

            const result = await evaluateTask(task.id);

            // Custom tasks don't auto-reset
            expect(result).toBeNull();
        });

        it('should skip if already evaluated today', async () => {
            const task = await createTask({ userId, title: 'Task', type: TaskType.REPEATABLE });
            await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.DAILY,
                config: { enabled: true },
            });

            // First evaluation
            await evaluateTask(task.id);

            // Second evaluation same day - should skip
            const result = await evaluateTask(task.id);
            expect(result).toBeNull();
        });

        it('should update lastEvaluatedAt after evaluation', async () => {
            const task = await createTask({ userId, title: 'Task', type: TaskType.REPEATABLE });
            await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.DAILY,
                config: { enabled: true },
            });

            await evaluateTask(task.id);

            const schedule = await testPrisma.taskSchedule.findUnique({
                where: { taskId: task.id },
            });
            expect(schedule!.lastEvaluatedAt).toBeDefined();
        });

        it('should not activate on non-matching day for weekly schedule', async () => {
            const task = await createTask({ userId, title: 'Task', type: TaskType.REPEATABLE });
            await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.WEEKLY,
                config: { daysOfWeek: [0] }, // Sunday only
            });

            // Use a known Monday
            const monday = new Date('2025-01-06');
            const result = await evaluateTask(task.id, monday);
            expect(result).toBeNull();
        });

        it('should activate on matching day for weekly schedule', async () => {
            const task = await createTask({ userId, title: 'Task', type: TaskType.REPEATABLE });
            await upsertSchedule({
                taskId: task.id,
                scheduleType: ScheduleType.WEEKLY,
                config: { daysOfWeek: [3] }, // Wednesday
            });

            const wednesday = new Date('2025-01-08');
            const result = await evaluateTask(task.id, wednesday);

            expect(result).toBeDefined();
            expect(result!.status).toBe(TaskStatus.IN_PROGRESS);
        });

        it('should return null for non-existent task', async () => {
            const result = await evaluateTask(99999);
            expect(result).toBeNull();
        });
    });

    // ── evaluateAll ─────────────────────────────────────────

    describe('evaluateAll', () => {
        it('should evaluate all scheduled tasks', async () => {
            const task1 = await createTask({ userId, title: 'Task 1', type: TaskType.REPEATABLE });
            const task2 = await createTask({ userId, title: 'Task 2', type: TaskType.REPEATABLE });
            await upsertSchedule({
                taskId: task1.id,
                scheduleType: ScheduleType.DAILY,
                config: { enabled: true },
            });
            await upsertSchedule({
                taskId: task2.id,
                scheduleType: ScheduleType.DAILY,
                config: { enabled: true },
            });

            const result = await evaluateAll();

            expect(result.evaluated).toBe(2);
            expect(result.updated).toBe(2);
        });

        it('should skip regular tasks', async () => {
            await createTask({ userId, title: 'Regular Task' });
            const repeatable = await createTask({ userId, title: 'Repeatable', type: TaskType.REPEATABLE });
            await upsertSchedule({
                taskId: repeatable.id,
                scheduleType: ScheduleType.DAILY,
                config: { enabled: true },
            });

            const result = await evaluateAll();

            expect(result.evaluated).toBe(1);
            expect(result.updated).toBe(1);
        });

        it('should return zero counts when no scheduled tasks', async () => {
            await createTask({ userId, title: 'Regular Task' });

            const result = await evaluateAll();

            expect(result.evaluated).toBe(0);
            expect(result.updated).toBe(0);
        });

        it('should handle mix of matching and non-matching schedules', async () => {
            const task1 = await createTask({ userId, title: 'Daily', type: TaskType.REPEATABLE });
            const task2 = await createTask({ userId, title: 'Sunday Only', type: TaskType.REPEATABLE });
            await upsertSchedule({
                taskId: task1.id,
                scheduleType: ScheduleType.DAILY,
                config: { enabled: true },
            });
            await upsertSchedule({
                taskId: task2.id,
                scheduleType: ScheduleType.WEEKLY,
                config: { daysOfWeek: [0] }, // Sunday only
            });

            // Evaluate on a Monday
            const monday = new Date('2025-01-06');
            const result = await evaluateAll(monday);

            expect(result.evaluated).toBe(2);
            expect(result.updated).toBe(1); // Only daily task updated
        });
    });
});
