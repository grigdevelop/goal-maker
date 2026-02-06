export const TaskStatus = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskType = {
    REGULAR: 'REGULAR',
    REPEATABLE: 'REPEATABLE',
    CUSTOM: 'CUSTOM',
} as const;

export type TaskType = (typeof TaskType)[keyof typeof TaskType];

export const ScheduleType = {
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY',
    CUSTOM: 'CUSTOM',
} as const;

export type ScheduleType = (typeof ScheduleType)[keyof typeof ScheduleType];

export const ChangeReason = {
    INITIAL_CREATION: 'INITIAL_CREATION',
    STATUS_CHANGE: 'STATUS_CHANGE',
    SCHEDULE_MATCH: 'SCHEDULE_MATCH',
    SCHEDULE_RESET: 'SCHEDULE_RESET',
    DEADLINE_UPDATE: 'DEADLINE_UPDATE',
    TYPE_CHANGE: 'TYPE_CHANGE',
    PROGRESS_UPDATE: 'PROGRESS_UPDATE',
} as const;

export type ChangeReason = (typeof ChangeReason)[keyof typeof ChangeReason];

// Valid status transitions
export const VALID_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.DONE],
    [TaskStatus.DONE]: [TaskStatus.TODO],
};

export function isValidStatusTransition(from: TaskStatus, to: TaskStatus): boolean {
    return VALID_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

// Schedule config types
export type DailyConfig = { enabled: true };
export type WeeklyConfig = { daysOfWeek: number[] };
export type MonthlyConfig = { daysOfMonth: number[] };
export type CustomConfig = { dates: string[] };

export type ScheduleConfig = DailyConfig | WeeklyConfig | MonthlyConfig | CustomConfig;
