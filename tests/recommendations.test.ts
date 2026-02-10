import { describe, it, expect, vi, beforeEach } from 'vitest';
import { testPrisma, createTestUser } from './setup';

vi.mock('@/lib/prisma', () => ({
    default: testPrisma,
}));

import { createTask } from '@/lib/services/task-service';
import { createGoal } from '@/lib/services/goal-service';
import { createSkill } from '@/lib/services/skill-service';
import { addTaskToGoal } from '@/lib/services/goal-relation-service';
import { addSkillToGoal } from '@/lib/services/goal-relation-service';
import { addTaskToSkill } from '@/lib/services/skill-relation-service';
import { changeStatus, addProgress } from '@/lib/services/task-history-service';
import { updateDeadline } from '@/lib/services/task-history-service';
import { TaskStatus } from '@/lib/constants/task';

import {
    getRecommendations,
    checkEmptyStates,
    findOrphanedGoals,
    findOrphanedSkills,
    findTodayInProgressTasks,
    getTopGoalsByProgress,
    getTopSkillsByProgress,
    getTopTasksByProgress,
} from '@/lib/services/recommendation-service';

describe('Recommendation Service', () => {
    let userId: string;

    beforeEach(async () => {
        const user = await createTestUser();
        userId = user.id;
    });

    // ── EMPTY STATE DETECTION ────────────────────────────────

    describe('checkEmptyStates', () => {
        it('should recommend creating tasks when none exist', async () => {
            const recs = await checkEmptyStates(userId);
            const taskRec = recs.find(r => r.action === 'create_task');

            expect(taskRec).toBeDefined();
            expect(taskRec!.type).toBe('create');
            expect(taskRec!.priority).toBe('high');
            expect(taskRec!.message).toBe('Create your first task');
        });

        it('should recommend creating goals when none exist', async () => {
            const recs = await checkEmptyStates(userId);
            const goalRec = recs.find(r => r.action === 'create_goal');

            expect(goalRec).toBeDefined();
            expect(goalRec!.type).toBe('create');
            expect(goalRec!.priority).toBe('high');
            expect(goalRec!.message).toBe('Create your first goal');
        });

        it('should recommend creating skills when none exist', async () => {
            const recs = await checkEmptyStates(userId);
            const skillRec = recs.find(r => r.action === 'create_skill');

            expect(skillRec).toBeDefined();
            expect(skillRec!.type).toBe('create');
            expect(skillRec!.priority).toBe('high');
            expect(skillRec!.message).toBe('Create your first skill');
        });

        it('should return all three recommendations when everything is empty', async () => {
            const recs = await checkEmptyStates(userId);
            expect(recs).toHaveLength(3);
        });

        it('should not recommend creating tasks when tasks exist', async () => {
            await createTask({ userId, title: 'Existing task' });

            const recs = await checkEmptyStates(userId);
            const taskRec = recs.find(r => r.action === 'create_task');
            expect(taskRec).toBeUndefined();
        });

        it('should not recommend creating goals when goals exist', async () => {
            await createGoal({ userId, title: 'Existing goal' });

            const recs = await checkEmptyStates(userId);
            const goalRec = recs.find(r => r.action === 'create_goal');
            expect(goalRec).toBeUndefined();
        });

        it('should not recommend creating skills when skills exist', async () => {
            await createSkill({ userId, title: 'Existing skill' });

            const recs = await checkEmptyStates(userId);
            const skillRec = recs.find(r => r.action === 'create_skill');
            expect(skillRec).toBeUndefined();
        });

        it('should return empty array when all entities exist', async () => {
            await createTask({ userId, title: 'Task' });
            await createGoal({ userId, title: 'Goal' });
            await createSkill({ userId, title: 'Skill' });

            const recs = await checkEmptyStates(userId);
            expect(recs).toHaveLength(0);
        });

        it('should only recommend missing entity types', async () => {
            await createTask({ userId, title: 'Task' });
            // no goals or skills

            const recs = await checkEmptyStates(userId);
            expect(recs).toHaveLength(2);
            expect(recs.find(r => r.action === 'create_task')).toBeUndefined();
            expect(recs.find(r => r.action === 'create_goal')).toBeDefined();
            expect(recs.find(r => r.action === 'create_skill')).toBeDefined();
        });
    });

    // ── ORPHANED GOALS ───────────────────────────────────────

    describe('findOrphanedGoals', () => {
        it('should recommend linking tasks to a goal without tasks or skills', async () => {
            const goal = await createGoal({ userId, title: 'Lonely Goal' });

            const recs = await findOrphanedGoals(userId);

            expect(recs).toHaveLength(1);
            expect(recs[0].type).toBe('link');
            expect(recs[0].priority).toBe('medium');
            expect(recs[0].message).toBe("Add tasks to goal 'Lonely Goal'");
            expect(recs[0].targetId).toBe(String(goal.id));
            expect(recs[0].targetType).toBe('goal');
        });

        it('should not recommend for a goal with tasks', async () => {
            const goal = await createGoal({ userId, title: 'Goal with tasks' });
            const task = await createTask({ userId, title: 'Task' });
            await addTaskToGoal(goal.id, task.id);

            const recs = await findOrphanedGoals(userId);
            expect(recs).toHaveLength(0);
        });

        it('should not recommend for a goal with skills', async () => {
            const goal = await createGoal({ userId, title: 'Goal with skills' });
            const skill = await createSkill({ userId, title: 'Skill' });
            await addSkillToGoal(goal.id, skill.id);

            const recs = await findOrphanedGoals(userId);
            expect(recs).toHaveLength(0);
        });

        it('should return multiple recommendations for multiple orphaned goals', async () => {
            await createGoal({ userId, title: 'Orphan 1' });
            await createGoal({ userId, title: 'Orphan 2' });
            await createGoal({ userId, title: 'Orphan 3' });

            const recs = await findOrphanedGoals(userId);
            expect(recs).toHaveLength(3);
        });

        it('should return empty array when no goals exist', async () => {
            const recs = await findOrphanedGoals(userId);
            expect(recs).toHaveLength(0);
        });
    });

    // ── ORPHANED SKILLS ──────────────────────────────────────

    describe('findOrphanedSkills', () => {
        it('should recommend connecting skill to goal when skill has no goals', async () => {
            const skill = await createSkill({ userId, title: 'Lonely Skill' });

            const recs = await findOrphanedSkills(userId);
            const goalRec = recs.find(r => r.action === 'link_skill_to_goal');

            expect(goalRec).toBeDefined();
            expect(goalRec!.type).toBe('link');
            expect(goalRec!.priority).toBe('medium');
            expect(goalRec!.message).toBe("Connect skill 'Lonely Skill' to a goal");
            expect(goalRec!.targetId).toBe(String(skill.id));
            expect(goalRec!.targetType).toBe('skill');
        });

        it('should recommend adding tasks when skill has no tasks', async () => {
            const skill = await createSkill({ userId, title: 'Taskless Skill' });

            const recs = await findOrphanedSkills(userId);
            const taskRec = recs.find(r => r.action === 'link_tasks_to_skill');

            expect(taskRec).toBeDefined();
            expect(taskRec!.message).toBe("Add practice tasks for skill 'Taskless Skill'");
            expect(taskRec!.targetId).toBe(String(skill.id));
        });

        it('should return two recommendations for a fully orphaned skill', async () => {
            await createSkill({ userId, title: 'Fully Orphaned' });

            const recs = await findOrphanedSkills(userId);
            expect(recs).toHaveLength(2);
        });

        it('should not recommend goal link when skill has a goal', async () => {
            const goal = await createGoal({ userId, title: 'Goal' });
            const skill = await createSkill({ userId, title: 'Linked Skill' });
            await addSkillToGoal(goal.id, skill.id);

            const recs = await findOrphanedSkills(userId);
            const goalRec = recs.find(r => r.action === 'link_skill_to_goal');
            expect(goalRec).toBeUndefined();
        });

        it('should not recommend task link when skill has tasks', async () => {
            const skill = await createSkill({ userId, title: 'Skilled Skill' });
            const task = await createTask({ userId, title: 'Practice' });
            await addTaskToSkill(skill.id, task.id);

            const recs = await findOrphanedSkills(userId);
            const taskRec = recs.find(r => r.action === 'link_tasks_to_skill');
            expect(taskRec).toBeUndefined();
        });

        it('should return empty array when no skills exist', async () => {
            const recs = await findOrphanedSkills(userId);
            expect(recs).toHaveLength(0);
        });

        it('should return no recommendations when skill has both goals and tasks', async () => {
            const goal = await createGoal({ userId, title: 'Goal' });
            const skill = await createSkill({ userId, title: 'Complete Skill' });
            const task = await createTask({ userId, title: 'Task' });
            await addSkillToGoal(goal.id, skill.id);
            await addTaskToSkill(skill.id, task.id);

            const recs = await findOrphanedSkills(userId);
            expect(recs).toHaveLength(0);
        });
    });

    // ── TODAY'S IN-PROGRESS TASKS ────────────────────────────

    describe('findTodayInProgressTasks', () => {
        it('should recommend completing an in-progress task due today', async () => {
            const task = await createTask({ userId, title: 'Due Today Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            const today = new Date();
            today.setHours(18, 0, 0, 0);
            await updateDeadline({ taskId: task.id, endTime: today, userId });

            const recs = await findTodayInProgressTasks(userId);

            expect(recs).toHaveLength(1);
            expect(recs[0].type).toBe('complete');
            expect(recs[0].priority).toBe('high');
            expect(recs[0].message).toBe("Complete task 'Due Today Task' - due today!");
            expect(recs[0].targetId).toBe(String(task.id));
            expect(recs[0].targetType).toBe('task');
        });

        it('should not recommend a TODO task due today', async () => {
            const task = await createTask({ userId, title: 'Todo Task' });

            const today = new Date();
            today.setHours(18, 0, 0, 0);
            await updateDeadline({ taskId: task.id, endTime: today, userId });

            const recs = await findTodayInProgressTasks(userId);
            expect(recs).toHaveLength(0);
        });

        it('should not recommend an in-progress task due tomorrow', async () => {
            const task = await createTask({ userId, title: 'Tomorrow Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(12, 0, 0, 0);
            await updateDeadline({ taskId: task.id, endTime: tomorrow, userId });

            const recs = await findTodayInProgressTasks(userId);
            expect(recs).toHaveLength(0);
        });

        it('should not recommend an in-progress task due yesterday', async () => {
            const task = await createTask({ userId, title: 'Yesterday Task' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(12, 0, 0, 0);
            await updateDeadline({ taskId: task.id, endTime: yesterday, userId });

            const recs = await findTodayInProgressTasks(userId);
            expect(recs).toHaveLength(0);
        });

        it('should not recommend an in-progress task with no deadline', async () => {
            await createTask({ userId, title: 'No Deadline' });

            const recs = await findTodayInProgressTasks(userId);
            expect(recs).toHaveLength(0);
        });

        it('should return multiple recommendations for multiple qualifying tasks', async () => {
            const today = new Date();
            today.setHours(15, 0, 0, 0);

            const task1 = await createTask({ userId, title: 'Task A' });
            await changeStatus({ taskId: task1.id, newStatus: TaskStatus.IN_PROGRESS, userId });
            await updateDeadline({ taskId: task1.id, endTime: today, userId });

            const task2 = await createTask({ userId, title: 'Task B' });
            await changeStatus({ taskId: task2.id, newStatus: TaskStatus.IN_PROGRESS, userId });
            await updateDeadline({ taskId: task2.id, endTime: today, userId });

            const recs = await findTodayInProgressTasks(userId);
            expect(recs).toHaveLength(2);
        });
    });

    // ── TOP GOALS BY PROGRESS ────────────────────────────────

    describe('getTopGoalsByProgress', () => {
        it('should return top 3 goals sorted by progress descending', async () => {
            const goal1 = await createGoal({ userId, title: 'Goal 10%' });
            const goal2 = await createGoal({ userId, title: 'Goal 50%' });
            const goal3 = await createGoal({ userId, title: 'Goal 80%' });
            const goal4 = await createGoal({ userId, title: 'Goal 30%' });

            // Create tasks with targetCount and add progress to control goal progress
            const t1 = await createTask({ userId, title: 'T1', targetCount: 100 });
            await addTaskToGoal(goal1.id, t1.id);
            await addProgress({ taskId: t1.id, increment: 10, userId });

            const t2 = await createTask({ userId, title: 'T2', targetCount: 100 });
            await addTaskToGoal(goal2.id, t2.id);
            await addProgress({ taskId: t2.id, increment: 50, userId });

            const t3 = await createTask({ userId, title: 'T3', targetCount: 100 });
            await addTaskToGoal(goal3.id, t3.id);
            await addProgress({ taskId: t3.id, increment: 80, userId });

            const t4 = await createTask({ userId, title: 'T4', targetCount: 100 });
            await addTaskToGoal(goal4.id, t4.id);
            await addProgress({ taskId: t4.id, increment: 30, userId });

            const top = await getTopGoalsByProgress(userId, 3);

            expect(top).toHaveLength(3);
            expect(top[0].title).toBe('Goal 80%');
            expect(top[1].title).toBe('Goal 50%');
            expect(top[2].title).toBe('Goal 30%');
        });

        it('should return all goals when fewer than limit exist', async () => {
            await createGoal({ userId, title: 'Only Goal' });

            const top = await getTopGoalsByProgress(userId, 3);
            expect(top).toHaveLength(1);
        });

        it('should return empty array when no goals exist', async () => {
            const top = await getTopGoalsByProgress(userId, 3);
            expect(top).toHaveLength(0);
        });
    });

    // ── TOP SKILLS BY PROGRESS ───────────────────────────────

    describe('getTopSkillsByProgress', () => {
        it('should return top 3 skills sorted by progress descending', async () => {
            const skill1 = await createSkill({ userId, title: 'Skill 20%' });
            const skill2 = await createSkill({ userId, title: 'Skill 60%' });
            const skill3 = await createSkill({ userId, title: 'Skill 90%' });
            const skill4 = await createSkill({ userId, title: 'Skill 40%' });

            const t1 = await createTask({ userId, title: 'T1', targetCount: 100 });
            await addTaskToSkill(skill1.id, t1.id);
            await addProgress({ taskId: t1.id, increment: 20, userId });

            const t2 = await createTask({ userId, title: 'T2', targetCount: 100 });
            await addTaskToSkill(skill2.id, t2.id);
            await addProgress({ taskId: t2.id, increment: 60, userId });

            const t3 = await createTask({ userId, title: 'T3', targetCount: 100 });
            await addTaskToSkill(skill3.id, t3.id);
            await addProgress({ taskId: t3.id, increment: 90, userId });

            const t4 = await createTask({ userId, title: 'T4', targetCount: 100 });
            await addTaskToSkill(skill4.id, t4.id);
            await addProgress({ taskId: t4.id, increment: 40, userId });

            const top = await getTopSkillsByProgress(userId, 3);

            expect(top).toHaveLength(3);
            expect(top[0].title).toBe('Skill 90%');
            expect(top[1].title).toBe('Skill 60%');
            expect(top[2].title).toBe('Skill 40%');
        });

        it('should return all skills when fewer than limit exist', async () => {
            await createSkill({ userId, title: 'Only Skill' });

            const top = await getTopSkillsByProgress(userId, 3);
            expect(top).toHaveLength(1);
        });

        it('should return empty array when no skills exist', async () => {
            const top = await getTopSkillsByProgress(userId, 3);
            expect(top).toHaveLength(0);
        });
    });

    // ── TOP TASKS BY PROGRESS ────────────────────────────────

    describe('getTopTasksByProgress', () => {
        it('should return top 3 tasks sorted by progress descending', async () => {
            const t1 = await createTask({ userId, title: 'Task 15%', targetCount: 100 });
            await addProgress({ taskId: t1.id, increment: 15, userId });

            const t2 = await createTask({ userId, title: 'Task 70%', targetCount: 100 });
            await addProgress({ taskId: t2.id, increment: 70, userId });

            const t3 = await createTask({ userId, title: 'Task 45%', targetCount: 100 });
            await addProgress({ taskId: t3.id, increment: 45, userId });

            const t4 = await createTask({ userId, title: 'Task 25%', targetCount: 100 });
            await addProgress({ taskId: t4.id, increment: 25, userId });

            const top = await getTopTasksByProgress(userId, 3);

            expect(top).toHaveLength(3);
            expect(top[0].title).toBe('Task 70%');
            expect(top[1].title).toBe('Task 45%');
            expect(top[2].title).toBe('Task 25%');
        });

        it('should return all tasks when fewer than limit exist', async () => {
            await createTask({ userId, title: 'Only Task' });

            const top = await getTopTasksByProgress(userId, 3);
            expect(top).toHaveLength(1);
        });

        it('should return empty array when no tasks exist', async () => {
            const top = await getTopTasksByProgress(userId, 3);
            expect(top).toHaveLength(0);
        });

        it('should include progress field on returned tasks', async () => {
            const t = await createTask({ userId, title: 'Task', targetCount: 50 });
            await addProgress({ taskId: t.id, increment: 25, userId });

            const top = await getTopTasksByProgress(userId, 3);
            expect(top[0].progress).toBe(50);
        });
    });

    // ── FULL RESPONSE STRUCTURE ──────────────────────────────

    describe('getRecommendations', () => {
        it('should return correct response structure', async () => {
            const result = await getRecommendations(userId);

            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('highlights');
            expect(result.highlights).toHaveProperty('topGoals');
            expect(result.highlights).toHaveProperty('topSkills');
            expect(result.highlights).toHaveProperty('topTasks');
            expect(Array.isArray(result.recommendations)).toBe(true);
            expect(Array.isArray(result.highlights.topGoals)).toBe(true);
            expect(Array.isArray(result.highlights.topSkills)).toBe(true);
            expect(Array.isArray(result.highlights.topTasks)).toBe(true);
        });

        it('should include empty state recommendations for a new user', async () => {
            const result = await getRecommendations(userId);

            expect(result.recommendations).toHaveLength(3);
            expect(result.recommendations.every(r => r.type === 'create')).toBe(true);
        });

        it('should combine all recommendation types', async () => {
            // Create a goal without tasks (orphaned)
            await createGoal({ userId, title: 'Orphan Goal' });

            // Create a skill without goals or tasks (orphaned)
            await createSkill({ userId, title: 'Orphan Skill' });

            // Create an in-progress task due today
            const task = await createTask({ userId, title: 'Due Today' });
            await changeStatus({ taskId: task.id, newStatus: TaskStatus.IN_PROGRESS, userId });
            const today = new Date();
            today.setHours(18, 0, 0, 0);
            await updateDeadline({ taskId: task.id, endTime: today, userId });

            const result = await getRecommendations(userId);

            // Should NOT have empty state recs (entities exist)
            const createRecs = result.recommendations.filter(r => r.type === 'create');
            expect(createRecs).toHaveLength(0);

            // Should have orphaned goal rec
            const linkGoalRecs = result.recommendations.filter(r => r.action === 'link_tasks_to_goal');
            expect(linkGoalRecs).toHaveLength(1);

            // Should have orphaned skill recs (no goal + no tasks = 2 recs)
            const linkSkillRecs = result.recommendations.filter(
                r => r.action === 'link_skill_to_goal' || r.action === 'link_tasks_to_skill'
            );
            expect(linkSkillRecs).toHaveLength(2);

            // Should have today's task rec
            const completeRecs = result.recommendations.filter(r => r.type === 'complete');
            expect(completeRecs).toHaveLength(1);
        });

        it('should populate highlights with top entities', async () => {
            const goal = await createGoal({ userId, title: 'Goal' });
            const skill = await createSkill({ userId, title: 'Skill' });

            const t1 = await createTask({ userId, title: 'Task', targetCount: 100 });
            await addTaskToGoal(goal.id, t1.id);
            await addTaskToSkill(skill.id, t1.id);
            await addProgress({ taskId: t1.id, increment: 50, userId });

            const result = await getRecommendations(userId);

            expect(result.highlights.topGoals).toHaveLength(1);
            expect(result.highlights.topGoals[0].title).toBe('Goal');
            expect(result.highlights.topSkills).toHaveLength(1);
            expect(result.highlights.topSkills[0].title).toBe('Skill');
            expect(result.highlights.topTasks).toHaveLength(1);
            expect(result.highlights.topTasks[0].title).toBe('Task');
        });

        it('should not include recommendations from other users', async () => {
            const user2 = await createTestUser('test-user-2');
            await createGoal({ userId: user2.id, title: 'Other User Goal' });
            await createTask({ userId: user2.id, title: 'Other User Task' });

            const result = await getRecommendations(userId);

            // Should still get empty state recs for userId (not user2)
            expect(result.recommendations).toHaveLength(3);
            expect(result.highlights.topGoals).toHaveLength(0);
            expect(result.highlights.topTasks).toHaveLength(0);
        });
    });
});
