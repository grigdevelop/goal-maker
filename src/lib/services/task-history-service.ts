import prisma from "@/lib/prisma";
import {
    TaskStatus,
    ChangeReason,
    isValidStatusTransition,
} from "@/lib/constants/task";
import type { TaskStatus as TaskStatusType, ChangeReason as ChangeReasonType } from "@/lib/constants/task";

// Get latest history entry for a task

export async function getLatestHistory(taskId: number) {
    return prisma.taskHistory.findFirst({
        where: { taskId },
        orderBy: { createdAt: 'desc' },
    });
}

export type GetLatestHistoryResponse = Awaited<ReturnType<typeof getLatestHistory>>;

// Get history entries for a task

export type GetHistoryRequest = {
    taskId: number;
    limit?: number;
};

export async function getHistory(options: GetHistoryRequest) {
    return prisma.taskHistory.findMany({
        where: { taskId: options.taskId },
        orderBy: { createdAt: 'desc' },
        take: options.limit,
    });
}

export type GetHistoryResponse = Awaited<ReturnType<typeof getHistory>>;

// Create initial history entry when task is created

export type CreateInitialHistoryRequest = {
    taskId: number;
    userId: string;
    endTime?: Date | null;
};

export async function createInitialHistory(options: CreateInitialHistoryRequest) {
    return prisma.taskHistory.create({
        data: {
            taskId: options.taskId,
            status: TaskStatus.TODO,
            endTime: options.endTime ?? null,
            changedBy: options.userId,
            changeReason: ChangeReason.INITIAL_CREATION,
        },
    });
}

export type CreateInitialHistoryResponse = Awaited<ReturnType<typeof createInitialHistory>>;

// Change task status with transition validation

export type ChangeStatusRequest = {
    taskId: number;
    newStatus: TaskStatusType;
    userId?: string | null;
    changeReason?: ChangeReasonType;
};

export async function changeStatus(options: ChangeStatusRequest) {
    const latest = await getLatestHistory(options.taskId);

    if (!latest) {
        throw new Error(`No history found for task ${options.taskId}`);
    }

    const currentStatus = latest.status as TaskStatusType;

    if (!isValidStatusTransition(currentStatus, options.newStatus)) {
        throw new Error(
            `Invalid status transition: ${currentStatus} → ${options.newStatus}`
        );
    }

    return prisma.taskHistory.create({
        data: {
            taskId: options.taskId,
            status: options.newStatus,
            endTime: latest.endTime,
            changedBy: options.userId ?? null,
            changeReason: options.changeReason ?? ChangeReason.STATUS_CHANGE,
        },
    });
}

export type ChangeStatusResponse = Awaited<ReturnType<typeof changeStatus>>;

// Update deadline (endTime)

export type UpdateDeadlineRequest = {
    taskId: number;
    endTime: Date | null;
    userId: string;
};

export async function updateDeadline(options: UpdateDeadlineRequest) {
    const latest = await getLatestHistory(options.taskId);

    if (!latest) {
        throw new Error(`No history found for task ${options.taskId}`);
    }

    const ONE_HOUR = 60 * 60 * 1000;
    const isRecent = Date.now() - new Date(latest.createdAt).getTime() < ONE_HOUR;

    if (isRecent) {
        // Update existing entry
        return prisma.taskHistory.update({
            where: { id: latest.id },
            data: { endTime: options.endTime },
        });
    }

    // Create new entry
    return prisma.taskHistory.create({
        data: {
            taskId: options.taskId,
            status: latest.status,
            endTime: options.endTime,
            changedBy: options.userId,
            changeReason: ChangeReason.DEADLINE_UPDATE,
        },
    });
}

export type UpdateDeadlineResponse = Awaited<ReturnType<typeof updateDeadline>>;

// Record type change

export type RecordTypeChangeRequest = {
    taskId: number;
    userId: string;
};

export async function recordTypeChange(options: RecordTypeChangeRequest) {
    const latest = await getLatestHistory(options.taskId);

    if (!latest) {
        throw new Error(`No history found for task ${options.taskId}`);
    }

    return prisma.taskHistory.create({
        data: {
            taskId: options.taskId,
            status: latest.status,
            endTime: latest.endTime,
            changedBy: options.userId,
            changeReason: ChangeReason.TYPE_CHANGE,
        },
    });
}

export type RecordTypeChangeResponse = Awaited<ReturnType<typeof recordTypeChange>>;

// Get task with current state (latest history merged)

export async function getTaskWithCurrentState(taskId: number) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            schedule: true,
        },
    });

    if (!task) return null;

    const latest = await getLatestHistory(taskId);

    return {
        ...task,
        currentStatus: (latest?.status as TaskStatusType) ?? TaskStatus.TODO,
        currentEndTime: latest?.endTime ?? null,
        lastUpdated: latest?.createdAt ?? task.createdAt,
    };
}

export type GetTaskWithCurrentStateResponse = Awaited<ReturnType<typeof getTaskWithCurrentState>>;

// Get multiple tasks with current state

export async function getTasksWithCurrentState(userId: string) {
    const tasks = await prisma.task.findMany({
        where: { userId },
        include: { schedule: true },
    });

    const tasksWithState = await Promise.all(
        tasks.map(async (task) => {
            const latest = await getLatestHistory(task.id);
            return {
                ...task,
                currentStatus: (latest?.status as TaskStatusType) ?? TaskStatus.TODO,
                currentEndTime: latest?.endTime ?? null,
                lastUpdated: latest?.createdAt ?? task.createdAt,
            };
        })
    );

    return tasksWithState;
}

export type GetTasksWithCurrentStateResponse = Awaited<ReturnType<typeof getTasksWithCurrentState>>;
