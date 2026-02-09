import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testPrisma, createTestUser } from './setup';

vi.mock('@/lib/prisma', () => ({
    default: testPrisma,
}));

import { createTask } from '@/lib/services/task-service';
import {
    addProgress,
    getProgressHistory,
    getLatestHistory,
    changeStatus,
    getTaskWithCurrentState,
    getTasksWithCurrentState,
} from '@/lib/services/task-history-service';
import { TaskStatus, ChangeReason } from '@/lib/constants/task';

describe('Progress Tracking', () => {
    let userId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        userId = user.id;
    });

    // ── TASK CREATION WITH TARGET COUNT ──────────────────────

    describe('task creation with targetCount', () => {
        it('should create task with targetCount', async () => {
            const task = await createTask({ userId, title: 'Watch 100 episodes', targetCount: 100 });
            expect(task.targetCount).toBe(100);
        });

        it('should create task without targetCount (null)', async () => {
            const task = await createTask({ userId, title: 'Regular task' });
            expect(task.targetCount).toBeNull();
        });

        it('should create task with explicit null targetCount', async () => {
            const task = await createTask({ userId, title: 'No progress', targetCount: null });
            expect(task.targetCount).toBeNull();
        });
    });

    // ── ADD PROGRESS ─────────────────────────────────────────

    describe('addProgress', () => {
        it('should add progress and return updated counts', async () => {
            const task = await createTask({ userId, title: 'Solve 50 problems', targetCount: 50 });

            const result = await addProgress({ taskId: task.id, increment: 5, userId });

            expect(result.currentCount).toBe(5);
            expect(result.targetCount).toBe(50);
            expect(result.percentComplete).toBe(10);
            expect(result.statusChanged).toBe(true); // should change status to IN_PROGRESS
        });

        it('should accumulate progress across multiple updates', async () => {
            const task = await createTask({ userId, title: 'Read 10 books', targetCount: 10 });

            await addProgress({ taskId: task.id, increment: 3, userId });
            await addProgress({ taskId: task.id, increment: 2, userId });
            const result = await addProgress({ taskId: task.id, increment: 1, userId });

            expect(result.currentCount).toBe(6);
            expect(result.percentComplete).toBe(60);
        });

        it('should store note with progress entry', async () => {
            const task = await createTask({ userId, title: 'Watch anime', targetCount: 100 });

            await addProgress({ taskId: task.id, increment: 5, note: 'Episodes 1-5', userId });

            const history = await getProgressHistory({ taskId: task.id });
            expect(history).toHaveLength(1);
            expect(history[0].note).toBe('Episodes 1-5');
            expect(history[0].progressIncrement).toBe(5);
            expect(history[0].currentCount).toBe(5);
        });

        it('should store null note when not provided', async () => {
            const task = await createTask({ userId, title: 'Watch anime', targetCount: 100 });

            await addProgress({ taskId: task.id, increment: 5, userId });

            const history = await getProgressHistory({ taskId: task.id });
            expect(history[0].note).toBeNull();
        });

        it('should auto-complete task when target is reached', async () => {
            const task = await createTask({ userId, title: 'Do 5 pushups', targetCount: 5 });

            // Move to IN_PROGRESS first
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            const result = await addProgress({ taskId: task.id, increment: 5, userId });

            expect(result.currentCount).toBe(5);
            expect(result.percentComplete).toBe(100);
            expect(result.statusChanged).toBe(true);

            // Verify status is DONE in history
            const latest = await getLatestHistory(task.id);
            expect(latest!.status).toBe(TaskStatus.DONE);
        });

        it('should throw error for task without targetCount', async () => {
            const task = await createTask({ userId, title: 'Regular task' });

            await expect(
                addProgress({ taskId: task.id, increment: 1, userId })
            ).rejects.toThrow('does not have progress tracking enabled');
        });

        it('should throw error for non-existent task', async () => {
            await expect(
                addProgress({ taskId: 99999, increment: 1, userId })
            ).rejects.toThrow('not found');
        });

        it('should throw error for zero increment', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 10 });

            await expect(
                addProgress({ taskId: task.id, increment: 0, userId })
            ).rejects.toThrow('positive integer');
        });

        it('should throw error for negative increment', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 10 });

            await expect(
                addProgress({ taskId: task.id, increment: -3, userId })
            ).rejects.toThrow('positive integer');
        });

        it('should throw error when adding progress to DONE task', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 10 });

            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.DONE, userId });

            await expect(
                addProgress({ taskId: task.id, increment: 1, userId })
            ).rejects.toThrow('Cannot add progress to a completed task');
        });

        it('should use PROGRESS_UPDATE as changeReason', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 10 });

            await addProgress({ taskId: task.id, increment: 2, userId });

            const latest = await getLatestHistory(task.id);
            expect(latest!.changeReason).toBe(ChangeReason.PROGRESS_UPDATE);
        });

        it('should reject with error when increment exceeds remaining', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 10 });

            await expect(
                addProgress({ taskId: task.id, increment: 15, userId })
            ).rejects.toThrow('exceeds remaining');
        });

        it('should change status to IN_PROGRESS when adding progress to TODO task', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 10 });

            const result = await addProgress({ taskId: task.id, increment: 2, userId });

            const latest = await getLatestHistory(task.id);
            expect(latest!.status).toBe(TaskStatus.IN_PROGRESS);
            expect(result.statusChanged).toBe(true);
        });

    });

    // ── GET PROGRESS HISTORY ─────────────────────────────────

    describe('getProgressHistory', () => {
        it('should return only progress entries', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 100 });

            // Status change (not progress)
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            // Progress updates
            await addProgress({ taskId: task.id, increment: 10, note: 'First batch', userId });
            await addProgress({ taskId: task.id, increment: 20, note: 'Second batch', userId });

            const progressEntries = await getProgressHistory({ taskId: task.id });

            expect(progressEntries).toHaveLength(2);
            expect(progressEntries[0].progressIncrement).toBe(20); // Most recent first
            expect(progressEntries[1].progressIncrement).toBe(10);
        });

        it('should respect limit parameter', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 100 });

            await addProgress({ taskId: task.id, increment: 1, userId });
            await addProgress({ taskId: task.id, increment: 2, userId });
            await addProgress({ taskId: task.id, increment: 3, userId });

            const limited = await getProgressHistory({ taskId: task.id, limit: 2 });
            expect(limited).toHaveLength(2);
            expect(limited[0].progressIncrement).toBe(3); // Most recent
        });

        it('should return empty array for task with no progress', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 100 });

            const entries = await getProgressHistory({ taskId: task.id });
            expect(entries).toHaveLength(0);
        });
    });

    // ── CURRENT STATE WITH PROGRESS ──────────────────────────

    describe('current state includes progress', () => {
        it('should include currentCount in getTaskWithCurrentState', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 50 });

            await addProgress({ taskId: task.id, increment: 15, userId });

            const state = await getTaskWithCurrentState(task.id);
            expect(state).toBeDefined();
            expect(state!.currentCount).toBe(15);
            expect(state!.targetCount).toBe(50);
        });

        it('should include currentCount in getTasksWithCurrentState', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 20 });

            await addProgress({ taskId: task.id, increment: 7, userId });

            const tasks = await getTasksWithCurrentState(userId);
            const found = tasks.find(t => t.id === task.id);
            expect(found).toBeDefined();
            expect(found!.currentCount).toBe(7);
        });

        it('should return 0 currentCount for task without progress updates', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 10 });

            const state = await getTaskWithCurrentState(task.id);
            expect(state!.currentCount).toBe(0);
        });

        it('should return 0 currentCount for task without targetCount', async () => {
            const task = await createTask({ userId, title: 'Regular task' });

            const state = await getTaskWithCurrentState(task.id);
            expect(state!.currentCount).toBe(0);
        });
    });
});
