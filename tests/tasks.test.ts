import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testPrisma, createTestUser } from './setup';

// Mock the prisma module to use our in-memory test database
vi.mock('@/lib/prisma', () => ({
    default: testPrisma,
}));

import {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from '@/lib/services/task-service';

import {
    addTaskToGoal,
    removeTaskFromGoal,
    getGoalTasks,
    createTaskForGoal,
} from '@/lib/services/goal-relation-service';

import {
    addTaskToSkill,
    removeTaskFromSkill,
    getSkillTasks,
    createTaskForSkill,
} from '@/lib/services/skill-relation-service';

describe('Task Service', () => {
    let userId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        userId = user.id;
    });

    // ── CREATE ──────────────────────────────────────────────

    describe('createTask', () => {
        it('should create a task with title only', async () => {
            const task = await createTask({ userId, title: 'My Task' });

            expect(task).toBeDefined();
            expect(task.id).toBeTypeOf('number');
            expect(task.title).toBe('My Task');
            expect(task.description).toBeNull();
            expect(task.userId).toBe(userId);
        });

        it('should create a task with title and description', async () => {
            const task = await createTask({
                userId,
                title: 'My Task',
                description: 'A detailed description',
            });

            expect(task.title).toBe('My Task');
            expect(task.description).toBe('A detailed description');
        });

        it('should create multiple tasks for the same user', async () => {
            await createTask({ userId, title: 'Task 1' });
            await createTask({ userId, title: 'Task 2' });
            await createTask({ userId, title: 'Task 3' });

            const tasks = await getTasks({ userId });
            expect(tasks).toHaveLength(3);
        });

        it('should auto-increment task IDs', async () => {
            const task1 = await createTask({ userId, title: 'Task 1' });
            const task2 = await createTask({ userId, title: 'Task 2' });

            expect(task2.id).toBeGreaterThan(task1.id);
        });

        it('should set createdAt and updatedAt timestamps', async () => {
            const before = new Date();
            const task = await createTask({ userId, title: 'Timed Task' });
            const after = new Date();

            expect(new Date(task.createdAt).getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
            expect(new Date(task.createdAt).getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
        });
    });

    // ── READ ────────────────────────────────────────────────

    describe('getTasks', () => {
        it('should return empty array when no tasks exist', async () => {
            const tasks = await getTasks({ userId });
            expect(tasks).toEqual([]);
        });

        it('should return only tasks for the specified user', async () => {
            const user2 = await createTestUser('test-user-2');
            await createTask({ userId, title: 'User 1 Task' });
            await createTask({ userId: user2.id, title: 'User 2 Task' });

            const tasks = await getTasks({ userId });
            expect(tasks).toHaveLength(1);
            expect(tasks[0].title).toBe('User 1 Task');
        });

        it('should return all tasks when no userId filter', async () => {
            const user2 = await createTestUser('test-user-2');
            await createTask({ userId, title: 'Task A' });
            await createTask({ userId: user2.id, title: 'Task B' });

            const tasks = await getTasks({});
            expect(tasks).toHaveLength(2);
        });
    });

    describe('getTaskById', () => {
        it('should return a task by ID', async () => {
            const created = await createTask({ userId, title: 'Find Me' });
            const found = await getTaskById({ id: created.id });

            expect(found).toBeDefined();
            expect(found!.title).toBe('Find Me');
            expect(found!.id).toBe(created.id);
        });

        it('should return null for non-existent ID', async () => {
            const found = await getTaskById({ id: 99999 });
            expect(found).toBeNull();
        });

        it('should filter by userId when provided', async () => {
            const user2 = await createTestUser('test-user-2');
            const task = await createTask({ userId, title: 'Owned Task' });

            const found = await getTaskById({ id: task.id, userId: user2.id });
            expect(found).toBeNull();

            const foundOwner = await getTaskById({ id: task.id, userId });
            expect(foundOwner).toBeDefined();
            expect(foundOwner!.title).toBe('Owned Task');
        });
    });

    // ── UPDATE ──────────────────────────────────────────────

    describe('updateTask', () => {
        it('should update task title', async () => {
            const task = await createTask({ userId, title: 'Old Title' });
            const updated = await updateTask(task.id, { title: 'New Title' });

            expect(updated.title).toBe('New Title');
            expect(updated.id).toBe(task.id);
        });

        it('should update task description', async () => {
            const task = await createTask({ userId, title: 'Task', description: 'Old' });
            const updated = await updateTask(task.id, { description: 'New Description' });

            expect(updated.description).toBe('New Description');
            expect(updated.title).toBe('Task');
        });

        it('should update both title and description', async () => {
            const task = await createTask({ userId, title: 'Old', description: 'Old Desc' });
            const updated = await updateTask(task.id, {
                title: 'New Title',
                description: 'New Desc',
            });

            expect(updated.title).toBe('New Title');
            expect(updated.description).toBe('New Desc');
        });

        it('should clear description when set to undefined', async () => {
            const task = await createTask({ userId, title: 'Task', description: 'Has desc' });
            const updated = await updateTask(task.id, { description: undefined });

            // undefined means "don't update", so description should remain
            expect(updated.description).toBe('Has desc');
        });

        it('should throw for non-existent task ID', async () => {
            await expect(
                updateTask(99999, { title: 'Nope' })
            ).rejects.toThrow();
        });

        it('should not modify other fields when partially updating', async () => {
            const task = await createTask({ userId, title: 'Original', description: 'Keep me' });
            const updated = await updateTask(task.id, { title: 'Changed' });

            expect(updated.title).toBe('Changed');
            expect(updated.description).toBe('Keep me');
        });
    });

    // ── DELETE ───────────────────────────────────────────────

    describe('deleteTask', () => {
        it('should delete a task', async () => {
            const task = await createTask({ userId, title: 'Delete Me' });
            await deleteTask({ id: task.id });

            const found = await getTaskById({ id: task.id });
            expect(found).toBeNull();
        });

        it('should throw for non-existent task ID', async () => {
            await expect(
                deleteTask({ id: 99999 })
            ).rejects.toThrow();
        });

        it('should not affect other tasks when deleting', async () => {
            const task1 = await createTask({ userId, title: 'Keep' });
            const task2 = await createTask({ userId, title: 'Delete' });

            await deleteTask({ id: task2.id });

            const remaining = await getTasks({ userId });
            expect(remaining).toHaveLength(1);
            expect(remaining[0].id).toBe(task1.id);
        });
    });

    // ── EDGE CASES ──────────────────────────────────────────

    describe('edge cases', () => {
        it('should handle empty string title', async () => {
            const task = await createTask({ userId, title: '' });
            expect(task.title).toBe('');
        });

        it('should handle very long title', async () => {
            const longTitle = 'A'.repeat(1000);
            const task = await createTask({ userId, title: longTitle });
            expect(task.title).toBe(longTitle);
        });

        it('should handle special characters in title', async () => {
            const specialTitle = 'Task with "quotes" & <html> and émojis 🎯';
            const task = await createTask({ userId, title: specialTitle });
            expect(task.title).toBe(specialTitle);
        });

        it('should handle unicode in description', async () => {
            const unicodeDesc = '日本語テスト 中文测试 한국어시험';
            const task = await createTask({ userId, title: 'Unicode', description: unicodeDesc });
            expect(task.description).toBe(unicodeDesc);
        });

        it('should handle empty string description', async () => {
            const task = await createTask({ userId, title: 'Task', description: '' });
            expect(task.description).toBe('');
        });

        it('should handle undefined description as null', async () => {
            const task = await createTask({ userId, title: 'Task' });
            expect(task.description).toBeNull();
        });
    });

    // ── RELATIONSHIPS ───────────────────────────────────────

    describe('task-goal relationships', () => {
        it('should add a task to a goal', async () => {
            const goal = await testPrisma.goal.create({
                data: { title: 'Goal', userId },
            });
            const task = await createTask({ userId, title: 'Task' });

            await addTaskToGoal(goal.id, task.id);

            const goalTasks = await getGoalTasks(goal.id);
            expect(goalTasks).toHaveLength(1);
            expect(goalTasks[0].id).toBe(task.id);
        });

        it('should create a new task and add to goal', async () => {
            const goal = await testPrisma.goal.create({
                data: { title: 'Goal', userId },
            });

            const task = await createTaskForGoal(goal.id, userId, {
                title: 'New Task',
                description: 'Created for goal',
            });

            expect(task.title).toBe('New Task');

            const goalTasks = await getGoalTasks(goal.id);
            expect(goalTasks).toHaveLength(1);
            expect(goalTasks[0].id).toBe(task.id);
        });

        it('should remove a task from a goal', async () => {
            const goal = await testPrisma.goal.create({
                data: { title: 'Goal', userId },
            });
            const task = await createTask({ userId, title: 'Task' });
            await addTaskToGoal(goal.id, task.id);

            await removeTaskFromGoal(goal.id, task.id);

            const goalTasks = await getGoalTasks(goal.id);
            expect(goalTasks).toHaveLength(0);
        });

        it('should not delete the task when removing from goal', async () => {
            const goal = await testPrisma.goal.create({
                data: { title: 'Goal', userId },
            });
            const task = await createTask({ userId, title: 'Task' });
            await addTaskToGoal(goal.id, task.id);

            await removeTaskFromGoal(goal.id, task.id);

            const found = await getTaskById({ id: task.id });
            expect(found).toBeDefined();
            expect(found!.title).toBe('Task');
        });

        it('should allow a task to be in multiple goals', async () => {
            const goal1 = await testPrisma.goal.create({
                data: { title: 'Goal 1', userId },
            });
            const goal2 = await testPrisma.goal.create({
                data: { title: 'Goal 2', userId },
            });
            const task = await createTask({ userId, title: 'Shared Task' });

            await addTaskToGoal(goal1.id, task.id);
            await addTaskToGoal(goal2.id, task.id);

            const goal1Tasks = await getGoalTasks(goal1.id);
            const goal2Tasks = await getGoalTasks(goal2.id);
            expect(goal1Tasks).toHaveLength(1);
            expect(goal2Tasks).toHaveLength(1);
        });

        it('should throw when adding duplicate task-goal relation', async () => {
            const goal = await testPrisma.goal.create({
                data: { title: 'Goal', userId },
            });
            const task = await createTask({ userId, title: 'Task' });
            await addTaskToGoal(goal.id, task.id);

            await expect(
                addTaskToGoal(goal.id, task.id)
            ).rejects.toThrow();
        });

        it('should cascade delete task relations when task is deleted', async () => {
            const goal = await testPrisma.goal.create({
                data: { title: 'Goal', userId },
            });
            const task = await createTask({ userId, title: 'Task' });
            await addTaskToGoal(goal.id, task.id);

            await deleteTask({ id: task.id });

            const goalTasks = await getGoalTasks(goal.id);
            expect(goalTasks).toHaveLength(0);
        });
    });

    describe('task-skill relationships', () => {
        it('should add a task to a skill', async () => {
            const skill = await testPrisma.skill.create({
                data: { title: 'Skill', userId },
            });
            const task = await createTask({ userId, title: 'Task' });

            await addTaskToSkill(skill.id, task.id);

            const skillTasks = await getSkillTasks(skill.id);
            expect(skillTasks).toHaveLength(1);
            expect(skillTasks[0].id).toBe(task.id);
        });

        it('should create a new task and add to skill', async () => {
            const skill = await testPrisma.skill.create({
                data: { title: 'Skill', userId },
            });

            const task = await createTaskForSkill(skill.id, userId, {
                title: 'Skill Task',
            });

            expect(task.title).toBe('Skill Task');

            const skillTasks = await getSkillTasks(skill.id);
            expect(skillTasks).toHaveLength(1);
        });

        it('should remove a task from a skill', async () => {
            const skill = await testPrisma.skill.create({
                data: { title: 'Skill', userId },
            });
            const task = await createTask({ userId, title: 'Task' });
            await addTaskToSkill(skill.id, task.id);

            await removeTaskFromSkill(skill.id, task.id);

            const skillTasks = await getSkillTasks(skill.id);
            expect(skillTasks).toHaveLength(0);
        });

        it('should allow a task to be in both a goal and a skill', async () => {
            const goal = await testPrisma.goal.create({
                data: { title: 'Goal', userId },
            });
            const skill = await testPrisma.skill.create({
                data: { title: 'Skill', userId },
            });
            const task = await createTask({ userId, title: 'Shared Task' });

            await addTaskToGoal(goal.id, task.id);
            await addTaskToSkill(skill.id, task.id);

            const goalTasks = await getGoalTasks(goal.id);
            const skillTasks = await getSkillTasks(skill.id);
            expect(goalTasks).toHaveLength(1);
            expect(skillTasks).toHaveLength(1);
            expect(goalTasks[0].id).toBe(task.id);
            expect(skillTasks[0].id).toBe(task.id);
        });

        it('should cascade delete skill-task relations when task is deleted', async () => {
            const skill = await testPrisma.skill.create({
                data: { title: 'Skill', userId },
            });
            const task = await createTask({ userId, title: 'Task' });
            await addTaskToSkill(skill.id, task.id);

            await deleteTask({ id: task.id });

            const skillTasks = await getSkillTasks(skill.id);
            expect(skillTasks).toHaveLength(0);
        });
    });
});
