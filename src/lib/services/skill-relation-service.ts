import prisma from "@/lib/prisma";

// Get tasks for a skill

export async function getSkillTasks(skillId: number) {
    const relations = await prisma.skillTask.findMany({
        where: { skillId },
        include: { task: true },
    });
    return relations.map((r) => r.task);
}

export type GetSkillTasksResponse = Awaited<ReturnType<typeof getSkillTasks>>;

// Add task to skill

export async function addTaskToSkill(skillId: number, taskId: number) {
    return prisma.skillTask.create({
        data: { skillId, taskId },
    });
}

// Create new task and add to skill

export async function createTaskForSkill(skillId: number, userId: string, data: { title: string; description?: string | null }) {
    const task = await prisma.task.create({
        data: { title: data.title, description: data.description, userId },
    });
    await prisma.skillTask.create({
        data: { skillId, taskId: task.id },
    });
    return task;
}

// Remove task from skill

export async function removeTaskFromSkill(skillId: number, taskId: number) {
    return prisma.skillTask.delete({
        where: { skillId_taskId: { skillId, taskId } },
    });
}

// Get goals for a skill (read-only)

export async function getSkillGoals(skillId: number) {
    const relations = await prisma.goalSkill.findMany({
        where: { skillId },
        include: { goal: true },
    });
    return relations.map((r) => r.goal);
}

export type GetSkillGoalsResponse = Awaited<ReturnType<typeof getSkillGoals>>;
