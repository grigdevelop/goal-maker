import Link from 'next/link';
import type { TaskListItem } from '@/hooks/api/use-tasks';
import { TaskStatus, TaskType } from '@/lib/constants/task';
import { EntityCard } from '../shared/EntityCard';

type Props = {
    task: TaskListItem;
};

const STATUS_BADGE: Record<string, string> = {
    [TaskStatus.TODO]: 'badge-ghost',
    [TaskStatus.IN_PROGRESS]: 'badge-warning',
    [TaskStatus.DONE]: 'badge-success',
};

const STATUS_LABEL: Record<string, string> = {
    [TaskStatus.TODO]: 'To Do',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.DONE]: 'Done',
};

const TYPE_BADGE: Record<string, string> = {
    [TaskType.REGULAR]: 'badge-outline',
    [TaskType.REPEATABLE]: 'badge-info badge-outline',
    [TaskType.CUSTOM]: 'badge-secondary badge-outline',
};

function formatDeadline(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (diffDays < 0) return `Overdue (${formatted})`;
    if (diffDays === 0) return `Due today`;
    if (diffDays === 1) return `Due tomorrow`;
    return `Due ${formatted}`;
}

export const TaskCard = ({ task }: Props) => {
    const deadlineText = formatDeadline(task.currentEndTime as string | null);
    const isOverdue = deadlineText?.startsWith('Overdue');

    return (
        <EntityCard
            id={task.id}
            entityType="tasks"
            aria-label={`Open task: ${task.title}`}
        >
            <div className="card-body">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge badge-sm ${STATUS_BADGE[task.currentStatus] ?? 'badge-ghost'}`}>
                        {STATUS_LABEL[task.currentStatus] ?? task.currentStatus}
                    </span>
                    {task.type !== TaskType.REGULAR && (
                        <span className={`badge badge-sm ${TYPE_BADGE[task.type] ?? ''}`}>
                            {task.type.charAt(0) + task.type.slice(1).toLowerCase()}
                        </span>
                    )}
                </div>
                <h2 className="card-title">{task.title}</h2>
                {task.description && <p className="text-sm opacity-70 line-clamp-2">{task.description}</p>}
                {task.targetCount != null && task.targetCount > 0 && (
                    <div className="mt-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                            <span className="opacity-60">Progress</span>
                            <span className="font-mono">{task.currentCount ?? 0}/{task.targetCount}</span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-300 ${(task.currentCount ?? 0) >= task.targetCount ? 'bg-success' : 'bg-primary'
                                    }`}
                                style={{ width: `${Math.min(100, Math.round(((task.currentCount ?? 0) / task.targetCount) * 100))}%` }}
                            ></div>
                        </div>
                    </div>
                )}
                {deadlineText && (
                    <p className={`text-xs ${isOverdue ? 'text-error' : 'opacity-60'}`}>
                        {deadlineText}
                    </p>
                )}
            </div>
        </EntityCard>
    );
};
