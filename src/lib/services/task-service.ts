import prisma from "@/lib/prisma";

// get tasks

export type GetTasksRequest = {
    userId?: string;
};

export async function getTasks(options: GetTasksRequest) {
    return prisma.task.findMany({
        where: {
            userId: options.userId,
        },
    });
}

export type GetTasksResponse = Awaited<ReturnType<typeof getTasks>>;

// get task by id

export type GetTaskByIdRequest = {
    id: number;
    userId?: string;
};

export async function getTaskById(options: GetTaskByIdRequest) {
    return prisma.task.findUnique({
        where: {
            id: options.id,
            userId: options.userId,
        },
    });
}

export type GetTaskByIdResponse = Awaited<ReturnType<typeof getTaskById>>;

// create task

export type CreateTaskRequest = {
    userId: string;
    title: string;
    description?: string;
};

export async function createTask(options: CreateTaskRequest) {
    return prisma.task.create({
        data: options,
    });
}

export type CreateTaskResponse = Awaited<ReturnType<typeof createTask>>;

// update task

export type UpdateTaskRequest = Partial<Omit<CreateTaskRequest, 'userId' | 'id'>>;

export async function updateTask(id: number, options: UpdateTaskRequest) {
    return prisma.task.update({
        where: {
            id,
        },
        data: options,
    });
}

export type UpdateTaskResponse = Awaited<ReturnType<typeof updateTask>>;

// delete task

export type DeleteTaskRequest = {
    id: number;
};

export async function deleteTask(options: DeleteTaskRequest) {
    return prisma.task.delete({
        where: {
            id: options.id,
        },
    });
}

export type DeleteTaskResponse = Awaited<ReturnType<typeof deleteTask>>;
