import prisma from "@/lib/prisma";

// get goals

export type GetGoalsRequest = {
    userId?: string;
};

export async function getGoals(options: GetGoalsRequest) {
    return prisma.goal.findMany({
        where: {
            userId: options.userId,
        },
    });
};

export type GetGoalsResponse = Awaited<ReturnType<typeof getGoals>>;

// get goal by id

export type GetGoalByIdRequest = {
    id: number;
};

export async function getGoalById(options: GetGoalByIdRequest) {
    return prisma.goal.findUnique({
        where: {
            id: options.id,
        },
    });
};

export type GetGoalByIdResponse = Awaited<ReturnType<typeof getGoalById>>;


// create goal

export type CreateGoalRequest = {
    userId: string;
    title: string;
    description?: string;
};

export async function createGoal(options: CreateGoalRequest) {
    return prisma.goal.create({
        data: options,
    });
};

export type CreateGoalResponse = Awaited<ReturnType<typeof createGoal>>;

// update goal

export type UpdateGoalRequest = Partial<Omit<CreateGoalRequest, 'userId' | 'id'>>;

export async function updateGoal(id: number, options: UpdateGoalRequest) {
    return prisma.goal.update({
        where: {
            id,
        },
        data: options,
    });
};

export type UpdateGoalResponse = Awaited<ReturnType<typeof updateGoal>>;

// delete goal

export type DeleteGoalRequest = {
    id: number;
};

export async function deleteGoal(options: DeleteGoalRequest) {
    return prisma.goal.delete({
        where: {
            id: options.id,
        },
    });
};

export type DeleteGoalResponse = Awaited<ReturnType<typeof deleteGoal>>;
