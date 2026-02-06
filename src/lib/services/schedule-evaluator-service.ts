import prisma from "@/lib/prisma";
import {
    TaskStatus,
    TaskType,
    ScheduleType,
    ChangeReason,
} from "@/lib/constants/task";
import type {
    TaskStatus as TaskStatusType,
    ScheduleConfig,
    DailyConfig,
    WeeklyConfig,
    MonthlyConfig,
    CustomConfig,
} from "@/lib/constants/task";
import { getLatestHistory } from "@/lib/services/task-history-service";

// Check if a date matches a schedule config

export function shouldActivate(
    scheduleType: string,
    config: ScheduleConfig,
    date: Date = new Date()
): boolean {
    switch (scheduleType) {
        case ScheduleType.DAILY:
            return (config as DailyConfig).enabled === true;

        case ScheduleType.WEEKLY: {
            const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
            return (config as WeeklyConfig).daysOfWeek.includes(dayOfWeek);
        }

        case ScheduleType.MONTHLY: {
            const dayOfMonth = date.getDate(); // 1-31
            return (config as MonthlyConfig).daysOfMonth.includes(dayOfMonth);
        }

        case ScheduleType.CUSTOM: {
            const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
            return (config as CustomConfig).dates.includes(dateStr);
        }

        default:
            return false;
    }
}

// Parse schedule config from stored JSON string

export function parseScheduleConfig(configStr: string): ScheduleConfig {
    return JSON.parse(configStr) as ScheduleConfig;
}

// Evaluate a single task's schedule

export async function evaluateTask(taskId: number, date: Date = new Date()) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { schedule: true },
    });

    if (!task || !task.schedule) return null;
    if (task.type === TaskType.REGULAR) return null;

    const schedule = task.schedule;

    // Check if already evaluated today
    if (schedule.lastEvaluatedAt) {
        const lastDate = new Date(schedule.lastEvaluatedAt).toISOString().split('T')[0];
        const today = date.toISOString().split('T')[0];
        if (lastDate === today) return null;
    }

    const latest = await getLatestHistory(taskId);
    if (!latest) return null;

    const currentStatus = latest.status as TaskStatusType;
    const config = parseScheduleConfig(schedule.config);
    const isMatch = shouldActivate(schedule.scheduleType, config, date);

    let newHistory = null;

    if (currentStatus === TaskStatus.DONE) {
        if (task.type === TaskType.REPEATABLE) {
            // Repeatable task completed: reset to TODO on next occurrence
            newHistory = await prisma.taskHistory.create({
                data: {
                    taskId,
                    status: TaskStatus.TODO,
                    endTime: latest.endTime,
                    changedBy: null,
                    changeReason: ChangeReason.SCHEDULE_RESET,
                },
            });
        }
        // Custom DONE tasks do NOT auto-reset
    } else if (isMatch && currentStatus !== TaskStatus.IN_PROGRESS) {
        // Schedule match: set to IN_PROGRESS
        newHistory = await prisma.taskHistory.create({
            data: {
                taskId,
                status: TaskStatus.IN_PROGRESS,
                endTime: latest.endTime,
                changedBy: null,
                changeReason: ChangeReason.SCHEDULE_MATCH,
            },
        });
    }

    // Update lastEvaluatedAt
    await prisma.taskSchedule.update({
        where: { id: schedule.id },
        data: { lastEvaluatedAt: date },
    });

    return newHistory;
}

// Evaluate all scheduled tasks

export async function evaluateAll(date: Date = new Date()) {
    const scheduledTasks = await prisma.task.findMany({
        where: {
            type: { in: [TaskType.REPEATABLE, TaskType.CUSTOM] },
            schedule: { isNot: null },
        },
        select: { id: true },
    });

    let updatedCount = 0;

    for (const task of scheduledTasks) {
        const result = await evaluateTask(task.id, date);
        if (result) updatedCount++;
    }

    return { evaluated: scheduledTasks.length, updated: updatedCount };
}

// Create or update a task schedule

export type UpsertScheduleRequest = {
    taskId: number;
    scheduleType: string;
    config: ScheduleConfig;
};

export async function upsertSchedule(options: UpsertScheduleRequest) {
    const configStr = JSON.stringify(options.config);

    return prisma.taskSchedule.upsert({
        where: { taskId: options.taskId },
        create: {
            taskId: options.taskId,
            scheduleType: options.scheduleType,
            config: configStr,
        },
        update: {
            scheduleType: options.scheduleType,
            config: configStr,
            updatedAt: new Date(),
        },
    });
}

export type UpsertScheduleResponse = Awaited<ReturnType<typeof upsertSchedule>>;

// Delete a task schedule

export async function deleteSchedule(taskId: number) {
    return prisma.taskSchedule.delete({
        where: { taskId },
    });
}
