import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testPrisma, createTestUser } from './setup';

vi.mock('@/lib/prisma', () => ({
    default: testPrisma,
}));

import { createTask } from '@/lib/services/task-service';
import {
    getLatestHistory,
    getHistory,
    createInitialHistory,
    changeStatus,
    updateDeadline,
    recordTypeChange,
    getTaskWithCurrentState,
    getTasksWithCurrentState,
} from '@/lib/services/task-history-service';
import { TaskStatus, TaskType, ChangeReason } from '@/lib/constants/task';

describe('Task History Service', () => {
    let userId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        userId = user.id;
    });

    // ── INITIAL HISTORY ─────────────────────────────────────

    describe('initial history creation', () => {
        it('should create initial history when task is created', async () => {
            const task = await createTask({ userId, title: 'New Task' });
            const history = await getLatestHistory(task.id);

            expect(history).toBeDefined();
            expect(history!.taskId).toBe(task.id);
            expect(history!.status).toBe(TaskStatus.TODO);
            expect(history!.changedBy).toBe(userId);
            expect(history!.changeReason).toBe(ChangeReason.INITIAL_CREATION);
        });

        it('should store endTime in initial history', async () => {
            const deadline = new Date('2025-12-31');
            const task = await createTask({ userId, title: 'Deadline Task', endTime: deadline });
            const history = await getLatestHistory(task.id);

            expect(history).toBeDefined();
            expect(new Date(history!.endTime!).toISOString().split('T')[0]).toBe('2025-12-31');
        });

        it('should set endTime to null when not provided', async () => {
            const task = await createTask({ userId, title: 'No Deadline' });
            const history = await getLatestHistory(task.id);

            expect(history!.endTime).toBeNull();
        });

        it('should create task with specified type', async () => {
            const task = await createTask({ userId, title: 'Repeatable', type: TaskType.REPEATABLE });

            expect(task.type).toBe(TaskType.REPEATABLE);
        });

        it('should default task type to REGULAR', async () => {
            const task = await createTask({ userId, title: 'Default Type' });

            expect(task.type).toBe(TaskType.REGULAR);
        });
    });

    // ── STATUS TRANSITIONS ──────────────────────────────────

    describe('status transitions', () => {
        it('should transition TODO → IN_PROGRESS', async () => {
            const task = await createTask({ userId, title: 'Task' });

            const history = await changeStatus({
                taskId: task.id,
                newStatus: TaskStatus.IN_PROGRESS,
                userId,
            });

            expect(history.status).toBe(TaskStatus.IN_PROGRESS);
            expect(history.changeReason).toBe(ChangeReason.STATUS_CHANGE);
            expect(history.changedBy).toBe(userId);
        });

        it('should transition IN_PROGRESS → DONE', async () => {
            const task = await createTask({ userId, title: 'Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            const history = await changeStatus({
                taskId: task.id,
                newStatus: TaskStatus.DONE,
                userId,
            });

            expect(history.status).toBe(TaskStatus.DONE);
        });

        it('should transition DONE → TODO', async () => {
            const task = await createTask({ userId, title: 'Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.DONE, userId });

            const history = await changeStatus({
                taskId: task.id,
                newStatus: TaskStatus.TODO,
                userId,
            });

            expect(history.status).toBe(TaskStatus.TODO);
        });

        it('should reject TODO → DONE (invalid)', async () => {
            const task = await createTask({ userId, title: 'Task' });

            await expect(
                changeStatus({ taskId: task.id, newStatus: TaskStatus.DONE, userId })
            ).rejects.toThrow('Invalid status transition: TODO → DONE');
        });

        it('should reject IN_PROGRESS → TODO (invalid)', async () => {
            const task = await createTask({ userId, title: 'Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            await expect(
                changeStatus({ taskId: task.id, newStatus: TaskStatus.TODO, userId })
            ).rejects.toThrow('Invalid status transition: IN_PROGRESS → TODO');
        });

        it('should reject DONE → IN_PROGRESS (invalid)', async () => {
            const task = await createTask({ userId, title: 'Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.DONE, userId });

            await expect(
                changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId })
            ).rejects.toThrow('Invalid status transition: DONE → IN_PROGRESS');
        });

        it('should reject same status transition', async () => {
            const task = await createTask({ userId, title: 'Task' });

            await expect(
                changeStatus({ taskId: task.id, newStatus: TaskStatus.TODO, userId })
            ).rejects.toThrow('Invalid status transition: TODO → TODO');
        });

        it('should reject when changing status to DONE while targetCount not reached', async () => {
            const task = await createTask({ userId, title: 'Task', targetCount: 10 });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            await expect(
                changeStatus({ taskId: task.id, newStatus: TaskStatus.DONE, userId })
            ).rejects.toThrow();
        });


        it('should inherit endTime from previous history on status change', async () => {
            const deadline = new Date('2025-06-15');
            const task = await createTask({ userId, title: 'Task', endTime: deadline });

            const history = await changeStatus({
                taskId: task.id,
                newStatus: TaskStatus.IN_PROGRESS,
                userId,
            });

            expect(new Date(history.endTime!).toISOString().split('T')[0]).toBe('2025-06-15');
        });

        it('should allow null changedBy for system-generated changes', async () => {
            const task = await createTask({ userId, title: 'Task' });

            const history = await changeStatus({
                taskId: task.id,
                newStatus: TaskStatus.IN_PROGRESS,
                userId: null,
                changeReason: ChangeReason.SCHEDULE_MATCH,
            });

            expect(history.changedBy).toBeNull();
            expect(history.changeReason).toBe(ChangeReason.SCHEDULE_MATCH);
        });

        it('should throw when no history exists for task', async () => {
            // Create task directly without history (bypassing createTask)
            const task = await testPrisma.task.create({
                data: { title: 'Raw Task', userId },
            });

            await expect(
                changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId })
            ).rejects.toThrow(`No history found for task ${task.id}`);
        });
    });

    // ── HISTORY RETRIEVAL ───────────────────────────────────

    describe('history retrieval', () => {
        it('should return latest history entry', async () => {
            const task = await createTask({ userId, title: 'Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            const latest = await getLatestHistory(task.id);

            expect(latest!.status).toBe(TaskStatus.IN_PROGRESS);
        });

        it('should return null for task with no history', async () => {
            const latest = await getLatestHistory(99999);
            expect(latest).toBeNull();
        });

        it('should return history entries in descending order', async () => {
            const task = await createTask({ userId, title: 'Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.DONE, userId });

            const history = await getHistory({ taskId: task.id });

            expect(history).toHaveLength(3);
            expect(history[0].status).toBe(TaskStatus.DONE);
            expect(history[1].status).toBe(TaskStatus.IN_PROGRESS);
            expect(history[2].status).toBe(TaskStatus.TODO);
        });

        it('should respect limit parameter', async () => {
            const task = await createTask({ userId, title: 'Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.DONE, userId });

            const history = await getHistory({ taskId: task.id, limit: 2 });

            expect(history).toHaveLength(2);
            expect(history[0].status).toBe(TaskStatus.DONE);
            expect(history[1].status).toBe(TaskStatus.IN_PROGRESS);
        });

        it('should return all history when no limit', async () => {
            const task = await createTask({ userId, title: 'Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            const history = await getHistory({ taskId: task.id });

            expect(history).toHaveLength(2);
        });
    });

    // ── DEADLINE UPDATES ────────────────────────────────────

    describe('deadline updates', () => {
        it('should update existing entry if less than 1 hour old', async () => {
            const task = await createTask({ userId, title: 'Task' });
            const deadline = new Date('2025-12-31');

            await updateDeadline({ taskId: task.id, endTime: deadline, userId });

            const history = await getHistory({ taskId: task.id });
            // Should still be 1 entry (updated in place)
            expect(history).toHaveLength(1);
            expect(new Date(history[0].endTime!).toISOString().split('T')[0]).toBe('2025-12-31');
        });

        it('should create new entry if latest is older than 1 hour', async () => {
            const task = await createTask({ userId, title: 'Task' });

            // Manually backdate the initial history
            const latest = await getLatestHistory(task.id);
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
            await testPrisma.taskHistory.update({
                where: { id: latest!.id },
                data: { createdAt: twoHoursAgo },
            });

            const deadline = new Date('2025-12-31');
            await updateDeadline({ taskId: task.id, endTime: deadline, userId });

            const history = await getHistory({ taskId: task.id });
            expect(history).toHaveLength(2);
            expect(history[0].changeReason).toBe(ChangeReason.DEADLINE_UPDATE);
        });

        it('should clear deadline by setting endTime to null', async () => {
            const task = await createTask({ userId, title: 'Task', endTime: new Date('2025-12-31') });

            await updateDeadline({ taskId: task.id, endTime: null, userId });

            const latest = await getLatestHistory(task.id);
            expect(latest!.endTime).toBeNull();
        });

        it('should throw when no history exists', async () => {
            await expect(
                updateDeadline({ taskId: 99999, endTime: new Date(), userId })
            ).rejects.toThrow('No history found for task 99999');
        });
    });

    // ── TYPE CHANGE ─────────────────────────────────────────

    describe('type change tracking', () => {
        it('should create history entry on type change', async () => {
            const task = await createTask({ userId, title: 'Task' });

            await recordTypeChange({ taskId: task.id, userId });

            const history = await getHistory({ taskId: task.id });
            expect(history).toHaveLength(2);
            expect(history[0].changeReason).toBe(ChangeReason.TYPE_CHANGE);
        });

        it('should inherit status and endTime from latest history', async () => {
            const task = await createTask({ userId, title: 'Task', endTime: new Date('2025-06-15') });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            await recordTypeChange({ taskId: task.id, userId });

            const latest = await getLatestHistory(task.id);
            expect(latest!.status).toBe(TaskStatus.IN_PROGRESS);
            expect(new Date(latest!.endTime!).toISOString().split('T')[0]).toBe('2025-06-15');
            expect(latest!.changeReason).toBe(ChangeReason.TYPE_CHANGE);
        });
    });

    // ── TASK WITH CURRENT STATE ─────────────────────────────

    describe('getTaskWithCurrentState', () => {
        it('should return task with current status from history', async () => {
            const task = await createTask({ userId, title: 'Stateful Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            const result = await getTaskWithCurrentState(task.id);

            expect(result).toBeDefined();
            expect(result!.title).toBe('Stateful Task');
            expect(result!.currentStatus).toBe(TaskStatus.IN_PROGRESS);
        });

        it('should return current endTime from latest history', async () => {
            const task = await createTask({ userId, title: 'Task', endTime: new Date('2025-12-31') });

            const result = await getTaskWithCurrentState(task.id);

            expect(result!.currentEndTime).toBeDefined();
            expect(new Date(result!.currentEndTime!).toISOString().split('T')[0]).toBe('2025-12-31');
        });

        it('should default to TODO when no history exists', async () => {
            const task = await testPrisma.task.create({
                data: { title: 'Raw Task', userId },
            });

            const result = await getTaskWithCurrentState(task.id);

            expect(result!.currentStatus).toBe(TaskStatus.TODO);
            expect(result!.currentEndTime).toBeNull();
        });

        it('should return null for non-existent task', async () => {
            const result = await getTaskWithCurrentState(99999);
            expect(result).toBeNull();
        });

        it('should include schedule when present', async () => {
            const task = await createTask({ userId, title: 'Scheduled', type: TaskType.REPEATABLE });
            await testPrisma.taskSchedule.create({
                data: {
                    taskId: task.id,
                    scheduleType: 'WEEKLY',
                    config: JSON.stringify({ daysOfWeek: [1, 3, 5] }),
                },
            });

            const result = await getTaskWithCurrentState(task.id);

            expect(result!.schedule).toBeDefined();
            expect(result!.schedule!.scheduleType).toBe('WEEKLY');
        });
    });

    // ── TASKS LIST WITH STATE ───────────────────────────────

    describe('getTasksWithCurrentState', () => {
        it('should return all tasks with current state', async () => {
            const task1 = await createTask({ userId, title: 'Task 1' });
            const task2 = await createTask({ userId, title: 'Task 2' });
            await changeStatus({ taskId: task2.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            const tasks = await getTasksWithCurrentState(userId);

            expect(tasks).toHaveLength(2);

            const t1 = tasks.find(t => t.id === task1.id);
            const t2 = tasks.find(t => t.id === task2.id);
            expect(t1!.currentStatus).toBe(TaskStatus.TODO);
            expect(t2!.currentStatus).toBe(TaskStatus.IN_PROGRESS);
        });

        it('should return empty array for user with no tasks', async () => {
            const tasks = await getTasksWithCurrentState(userId);
            expect(tasks).toEqual([]);
        });

        it('should only return tasks for specified user', async () => {
            const user2 = await createTestUser('test-user-2');
            await createTask({ userId, title: 'User 1 Task' });
            await createTask({ userId: user2.id, title: 'User 2 Task' });

            const tasks = await getTasksWithCurrentState(userId);
            expect(tasks).toHaveLength(1);
            expect(tasks[0].title).toBe('User 1 Task');
        });
    });

    // ── CASCADE BEHAVIOR ────────────────────────────────────

    describe('cascade behavior', () => {
        it('should delete history when task is deleted', async () => {
            const task = await createTask({ userId, title: 'Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            await testPrisma.task.delete({ where: { id: task.id } });

            const history = await getHistory({ taskId: task.id });
            expect(history).toHaveLength(0);
        });

        it('should delete schedule when task is deleted', async () => {
            const task = await createTask({ userId, title: 'Task', type: TaskType.REPEATABLE });
            await testPrisma.taskSchedule.create({
                data: {
                    taskId: task.id,
                    scheduleType: 'DAILY',
                    config: JSON.stringify({ enabled: true }),
                },
            });

            await testPrisma.task.delete({ where: { id: task.id } });

            const schedule = await testPrisma.taskSchedule.findUnique({
                where: { taskId: task.id },
            });
            expect(schedule).toBeNull();
        });
    });
});
