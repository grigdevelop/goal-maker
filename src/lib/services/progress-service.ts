import prisma from "@/lib/prisma";
import { TaskStatus } from "@/lib/constants/task";

// ── Task Progress ────────────────────────────────────────────

export function calcTaskProgress(task: {
    targetCount?: number | null;
    currentCount?: number | null;
    currentStatus?: string;
    status?: string;
}): number {
    if (task.targetCount != null && task.targetCount > 0) {
        const current = task.currentCount ?? 0;
        return Math.min(100, Math.round((current / task.targetCount) * 100));
    }
    const status = task.currentStatus ?? task.status;
    return status === TaskStatus.DONE ? 100 : 0;
}

// ── Skill Progress (average of related tasks) ────────────────

export type SkillWithProgress = {
    id: number;
    title: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    progress: number;
    taskCount: number;
};

export async function getSkillWithProgress(skillId: number): Promise<SkillWithProgress | null> {
    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) return null;

    const progress = await calcSkillProgressById(skillId);
    return { ...skill, ...progress };
}

export async function getSkillsWithProgress(userId: string): Promise<SkillWithProgress[]> {
    const skills = await prisma.skill.findMany({ where: { userId } });

    return Promise.all(
        skills.map(async (skill) => {
            const progress = await calcSkillProgressById(skill.id);
            return { ...skill, ...progress };
        })
    );
}

async function calcSkillProgressById(skillId: number): Promise<{ progress: number; taskCount: number }> {
    const relations = await prisma.skillTask.findMany({
        where: { skillId },
        include: {
            task: {
                include: {
                    history: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            },
        },
    });

    if (relations.length === 0) return { progress: 0, taskCount: 0 };

    const total = relations.reduce((sum, rel) => {
        const latest = rel.task.history[0];
        return sum + calcTaskProgress({
            targetCount: rel.task.targetCount,
            currentCount: latest?.currentCount ?? 0,
            status: latest?.status ?? TaskStatus.TODO,
        });
    }, 0);

    return {
        progress: Math.round(total / relations.length),
        taskCount: relations.length,
    };
}

// ── Goal Progress (average of tasks + skills) ────────────────

export type GoalWithProgress = {
    id: number;
    title: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    progress: number;
    taskCount: number;
    skillCount: number;
};

export async function getGoalWithProgress(goalId: number): Promise<GoalWithProgress | null> {
    const goal = await prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) return null;

    const progress = await calcGoalProgressById(goalId);
    return { ...goal, ...progress };
}

export async function getGoalsWithProgress(userId: string): Promise<GoalWithProgress[]> {
    const goals = await prisma.goal.findMany({ where: { userId } });

    return Promise.all(
        goals.map(async (goal) => {
            const progress = await calcGoalProgressById(goal.id);
            return { ...goal, ...progress };
        })
    );
}

async function calcGoalProgressById(goalId: number): Promise<{ progress: number; taskCount: number; skillCount: number }> {
    // Get related tasks with latest history
    const taskRelations = await prisma.goalTask.findMany({
        where: { goalId },
        include: {
            task: {
                include: {
                    history: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            },
        },
    });

    // Get related skills
    const skillRelations = await prisma.goalSkill.findMany({
        where: { goalId },
        include: { skill: true },
    });

    const taskCount = taskRelations.length;
    const skillCount = skillRelations.length;

    if (taskCount === 0 && skillCount === 0) {
        return { progress: 0, taskCount: 0, skillCount: 0 };
    }

    // Calculate task progress average
    let taskProgress = 0;
    if (taskCount > 0) {
        const total = taskRelations.reduce((sum, rel) => {
            const latest = rel.task.history[0];
            return sum + calcTaskProgress({
                targetCount: rel.task.targetCount,
                currentCount: latest?.currentCount ?? 0,
                status: latest?.status ?? TaskStatus.TODO,
            });
        }, 0);
        taskProgress = total / taskCount;
    }

    // Calculate skill progress average
    let skillProgress = 0;
    if (skillCount > 0) {
        const skillProgressValues = await Promise.all(
            skillRelations.map((rel) => calcSkillProgressById(rel.skillId))
        );
        const total = skillProgressValues.reduce((sum, sp) => sum + sp.progress, 0);
        skillProgress = total / skillCount;
    }

    // Combine: if only one category exists, use it as 100%
    let progress: number;
    if (taskCount > 0 && skillCount > 0) {
        progress = Math.round((taskProgress + skillProgress) / 2);
    } else if (taskCount > 0) {
        progress = Math.round(taskProgress);
    } else {
        progress = Math.round(skillProgress);
    }

    return { progress, taskCount, skillCount };
}
