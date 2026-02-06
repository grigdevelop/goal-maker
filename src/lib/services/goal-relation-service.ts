import prisma from "@/lib/prisma";

// Get skills for a goal

export async function getGoalSkills(goalId: number) {
    const relations = await prisma.goalSkill.findMany({
        where: { goalId },
        include: { skill: true },
    });
    return relations.map((r) => r.skill);
}

export type GetGoalSkillsResponse = Awaited<ReturnType<typeof getGoalSkills>>;

// Add skill to goal

export async function addSkillToGoal(goalId: number, skillId: number) {
    return prisma.goalSkill.create({
        data: { goalId, skillId },
    });
}

// Create new skill and add to goal

export async function createSkillForGoal(goalId: number, userId: string, data: { title: string; description?: string | null }) {
    const skill = await prisma.skill.create({
        data: { title: data.title, description: data.description, userId },
    });
    await prisma.goalSkill.create({
        data: { goalId, skillId: skill.id },
    });
    return skill;
}

// Remove skill from goal

export async function removeSkillFromGoal(goalId: number, skillId: number) {
    return prisma.goalSkill.delete({
        where: { goalId_skillId: { goalId, skillId } },
    });
}

// Get tasks for a goal

export async function getGoalTasks(goalId: number) {
    const relations = await prisma.goalTask.findMany({
        where: { goalId },
        include: { task: true },
    });
    return relations.map((r) => r.task);
}

export type GetGoalTasksResponse = Awaited<ReturnType<typeof getGoalTasks>>;

// Add task to goal

export async function addTaskToGoal(goalId: number, taskId: number) {
    return prisma.goalTask.create({
        data: { goalId, taskId },
    });
}

// Create new task and add to goal

export async function createTaskForGoal(goalId: number, userId: string, data: { title: string; description?: string | null }) {
    const task = await prisma.task.create({
        data: { title: data.title, description: data.description, userId },
    });
    await prisma.goalTask.create({
        data: { goalId, taskId: task.id },
    });
    return task;
}

// Remove task from goal

export async function removeTaskFromGoal(goalId: number, taskId: number) {
    return prisma.goalTask.delete({
        where: { goalId_taskId: { goalId, taskId } },
    });
}
