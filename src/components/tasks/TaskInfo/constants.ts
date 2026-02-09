import { TaskStatus, TaskType, ChangeReason } from '@/lib/constants/task';

export const STATUS_BADGE: Record<string, string> = {
    [TaskStatus.TODO]: 'badge-ghost',
    [TaskStatus.IN_PROGRESS]: 'badge-warning',
    [TaskStatus.DONE]: 'badge-success',
};

export const STATUS_LABEL: Record<string, string> = {
    [TaskStatus.TODO]: 'To Do',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.DONE]: 'Done',
};

export const TYPE_LABEL: Record<string, string> = {
    [TaskType.REGULAR]: 'Regular',
    [TaskType.REPEATABLE]: 'Repeatable',
    [TaskType.CUSTOM]: 'Custom',
};

export const REASON_LABEL: Record<string, string> = {
    [ChangeReason.INITIAL_CREATION]: 'Created',
    [ChangeReason.STATUS_CHANGE]: 'Status changed',
    [ChangeReason.SCHEDULE_MATCH]: 'Schedule activated',
    [ChangeReason.SCHEDULE_RESET]: 'Schedule reset',
    [ChangeReason.DEADLINE_UPDATE]: 'Deadline updated',
    [ChangeReason.TYPE_CHANGE]: 'Type changed',
    [ChangeReason.PROGRESS_UPDATE]: 'Progress updated',
};
