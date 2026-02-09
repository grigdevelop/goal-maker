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

// Add progress to a task with targetCount

export type AddProgressRequest = {
    taskId: number;
    increment: number;
    note?: string | null;
    userId: string;
};

export type AddProgressResponse = {
    currentCount: number;
    targetCount: number;
    percentComplete: number;
    statusChanged: boolean;
};

export async function addProgress(options: AddProgressRequest): Promise<AddProgressResponse> {
    const task = await prisma.task.findUnique({ where: { id: options.taskId } });
    if (!task) throw new Error(`Task ${options.taskId} not found`);
    if (!task.targetCount) throw new Error(`Task ${options.taskId} does not have progress tracking enabled`);

    if (options.increment <= 0) throw new Error('Increment must be a positive integer');

    const latest = await getLatestHistory(options.taskId);
    if (!latest) throw new Error(`No history found for task ${options.taskId}`);

    if (latest.status === TaskStatus.DONE) {
        throw new Error('Cannot add progress to a completed task');
    }

    const previousCount = latest.currentCount ?? 0;
    const remaining = task.targetCount - previousCount;

    if (options.increment > remaining) {
        throw new Error(`Increment ${options.increment} exceeds remaining ${remaining}`);
    }

    const newCount = previousCount + options.increment;
    const reachedTarget = newCount >= task.targetCount;

    // should change status to IN_PROGRESS when adding progress to TODO task
    let newStatus = latest.status;
    if (latest.status === TaskStatus.TODO && options.increment > 0) {
        newStatus = TaskStatus.IN_PROGRESS;
    }

    if (reachedTarget) {
        newStatus = TaskStatus.DONE;
    }

    // Create progress history entry
    await prisma.taskHistory.create({
        data: {
            taskId: options.taskId,
            status: newStatus,
            endTime: latest.endTime,
            changedBy: options.userId,
            changeReason: ChangeReason.PROGRESS_UPDATE,
            progressIncrement: options.increment,
            currentCount: newCount,
            note: options.note ?? null,
        },
    });

    // If target reached and status wasn't already DONE, create a status change entry
    let statusChanged = false;
    if (latest.status !== newStatus) {
        statusChanged = true;
    }

    return {
        currentCount: newCount,
        targetCount: task.targetCount,
        percentComplete: Math.min(100, Math.round((newCount / task.targetCount) * 100)),
        statusChanged,
    };
}


// Get progress history for a task

export type GetProgressHistoryRequest = {
    taskId: number;
    limit?: number;
};

export async function getProgressHistory(options: GetProgressHistoryRequest) {
    return prisma.taskHistory.findMany({
        where: {
            taskId: options.taskId,
            changeReason: ChangeReason.PROGRESS_UPDATE,
        },
        orderBy: { createdAt: 'desc' },
        take: options.limit,
        select: {
            id: true,
            progressIncrement: true,
            currentCount: true,
            note: true,
            createdAt: true,
        },
    });
}

export type GetProgressHistoryResponse = Awaited<ReturnType<typeof getProgressHistory>>;

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
        currentCount: latest?.currentCount ?? 0,
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
                currentCount: latest?.currentCount ?? 0,
                lastUpdated: latest?.createdAt ?? task.createdAt,
            };
        })
    );

    return tasksWithState;
}

export type GetTasksWithCurrentStateResponse = Awaited<ReturnType<typeof getTasksWithCurrentState>>;
