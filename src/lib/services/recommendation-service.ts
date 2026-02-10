import prisma from "@/lib/prisma";
import { TaskStatus } from "@/lib/constants/task";
import { getGoalsWithProgress, getSkillsWithProgress, calcTaskProgress } from "@/lib/services/progress-service";
import { getTasksWithCurrentState } from "@/lib/services/task-history-service";

// ── Types ────────────────────────────────────────────────────

export interface Recommendation {
    type: 'create' | 'link' | 'complete';
    priority: 'high' | 'medium' | 'low';
    message: string;
    action: string;
    targetId?: string;
    targetType?: 'goal' | 'skill' | 'task';
}

export interface RecommendationsResponse {
    recommendations: Recommendation[];
    highlights: {
        topGoals: Awaited<ReturnType<typeof getGoalsWithProgress>>;
        topSkills: Awaited<ReturnType<typeof getSkillsWithProgress>>;
        topTasks: Awaited<ReturnType<typeof getTasksWithCurrentState>>;
    };
}

// ── Main Function ────────────────────────────────────────────

export async function getRecommendations(userId: string): Promise<RecommendationsResponse> {
    const [
        emptyStateRecs,
        orphanedGoalRecs,
        orphanedSkillRecs,
        todayTaskRecs,
        topGoals,
        topSkills,
        topTasks,
    ] = await Promise.all([
        checkEmptyStates(userId),
        findOrphanedGoals(userId),
        findOrphanedSkills(userId),
        findTodayInProgressTasks(userId),
        getTopGoalsByProgress(userId, 3),
        getTopSkillsByProgress(userId, 3),
        getTopTasksByProgress(userId, 3),
    ]);

    const recommendations = [
        ...emptyStateRecs,
        ...orphanedGoalRecs,
        ...orphanedSkillRecs,
        ...todayTaskRecs,
    ];

    return {
        recommendations,
        highlights: {
            topGoals,
            topSkills,
            topTasks,
        },
    };
}

// ── Empty State Detection ────────────────────────────────────

export async function checkEmptyStates(userId: string): Promise<Recommendation[]> {
    const [taskCount, goalCount, skillCount] = await Promise.all([
        prisma.task.count({ where: { userId } }),
        prisma.goal.count({ where: { userId } }),
        prisma.skill.count({ where: { userId } }),
    ]);

    const recommendations: Recommendation[] = [];

    if (taskCount === 0) {
        recommendations.push({
            type: 'create',
            priority: 'high',
            message: 'Create your first task',
            action: 'create_task',
        });
    }

    if (goalCount === 0) {
        recommendations.push({
            type: 'create',
            priority: 'high',
            message: 'Create your first goal',
            action: 'create_goal',
        });
    }

    if (skillCount === 0) {
        recommendations.push({
            type: 'create',
            priority: 'high',
            message: 'Create your first skill',
            action: 'create_skill',
        });
    }

    return recommendations;
}

// ── Orphaned Goals (no tasks and no skills) ──────────────────

export async function findOrphanedGoals(userId: string): Promise<Recommendation[]> {
    const goals = await prisma.goal.findMany({
        where: { userId },
        include: {
            goalTasks: { take: 1 },
            goalSkills: { take: 1 },
        },
    });

    const recommendations: Recommendation[] = [];

    for (const goal of goals) {
        if (goal.goalTasks.length === 0 && goal.goalSkills.length === 0) {
            recommendations.push({
                type: 'link',
                priority: 'medium',
                message: `Add tasks to goal '${goal.title}'`,
                action: 'link_tasks_to_goal',
                targetId: String(goal.id),
                targetType: 'goal',
            });
        }
    }

    return recommendations;
}

// ── Orphaned Skills (no goals / no tasks) ────────────────────

export async function findOrphanedSkills(userId: string): Promise<Recommendation[]> {
    const skills = await prisma.skill.findMany({
        where: { userId },
        include: {
            goalSkills: { take: 1 },
            skillTasks: { take: 1 },
        },
    });

    const recommendations: Recommendation[] = [];

    for (const skill of skills) {
        if (skill.goalSkills.length === 0) {
            recommendations.push({
                type: 'link',
                priority: 'medium',
                message: `Connect skill '${skill.title}' to a goal`,
                action: 'link_skill_to_goal',
                targetId: String(skill.id),
                targetType: 'skill',
            });
        }

        if (skill.skillTasks.length === 0) {
            recommendations.push({
                type: 'link',
                priority: 'medium',
                message: `Add practice tasks for skill '${skill.title}'`,
                action: 'link_tasks_to_skill',
                targetId: String(skill.id),
                targetType: 'skill',
            });
        }
    }

    return recommendations;
}

// ── Today's In-Progress Tasks ────────────────────────────────

export async function findTodayInProgressTasks(userId: string): Promise<Recommendation[]> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const tasks = await getTasksWithCurrentState(userId);

    const recommendations: Recommendation[] = [];

    for (const task of tasks) {
        if (
            task.currentStatus === TaskStatus.IN_PROGRESS &&
            task.currentEndTime &&
            new Date(task.currentEndTime) >= startOfDay &&
            new Date(task.currentEndTime) <= endOfDay
        ) {
            recommendations.push({
                type: 'complete',
                priority: 'high',
                message: `Complete task '${task.title}' - due today!`,
                action: 'complete_task',
                targetId: String(task.id),
                targetType: 'task',
            });
        }
    }

    return recommendations;
}

// ── Top Goals by Progress ────────────────────────────────────

export async function getTopGoalsByProgress(userId: string, limit: number = 3) {
    const goals = await getGoalsWithProgress(userId);
    return goals
        .sort((a, b) => b.progress - a.progress)
        .slice(0, limit);
}

// ── Top Skills by Progress ───────────────────────────────────

export async function getTopSkillsByProgress(userId: string, limit: number = 3) {
    const skills = await getSkillsWithProgress(userId);
    return skills
        .sort((a, b) => b.progress - a.progress)
        .slice(0, limit);
}

// ── Top Tasks by Progress ────────────────────────────────────

export async function getTopTasksByProgress(userId: string, limit: number = 3) {
    const tasks = await getTasksWithCurrentState(userId);

    const tasksWithProgress = tasks.map((task) => ({
        ...task,
        progress: calcTaskProgress({
            targetCount: task.targetCount,
            currentCount: task.currentCount,
            status: task.currentStatus,
        }),
    }));

    return tasksWithProgress
        .sort((a, b) => b.progress - a.progress)
        .slice(0, limit);
}
