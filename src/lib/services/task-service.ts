import prisma from "@/lib/prisma";
import { TaskType } from "@/lib/constants/task";
import type { TaskType as TaskTypeType } from "@/lib/constants/task";
import { createInitialHistory, recordTypeChange } from "@/lib/services/task-history-service";

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
    type?: TaskTypeType;
    endTime?: Date | null;
};

export async function createTask(options: CreateTaskRequest) {
    const { endTime, ...taskData } = options;
    const task = await prisma.task.create({
        data: {
            title: taskData.title,
            description: taskData.description,
            type: taskData.type ?? TaskType.REGULAR,
            userId: taskData.userId,
        },
    });

    await createInitialHistory({
        taskId: task.id,
        userId: options.userId,
        endTime: endTime ?? null,
    });

    return task;
}

export type CreateTaskResponse = Awaited<ReturnType<typeof createTask>>;

// update task

export type UpdateTaskRequest = Partial<Omit<CreateTaskRequest, 'userId' | 'id' | 'endTime'>>;

export async function updateTask(id: number, options: UpdateTaskRequest, userId?: string) {
    const oldTask = await prisma.task.findUnique({ where: { id } });
    const typeChanged = options.type && oldTask && oldTask.type !== options.type;

    const task = await prisma.task.update({
        where: { id },
        data: options,
    });

    if (typeChanged && userId) {
        await recordTypeChange({ taskId: id, userId });
    }

    return task;
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
