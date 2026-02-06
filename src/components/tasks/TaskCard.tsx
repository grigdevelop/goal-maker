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
                {deadlineText && (
                    <p className={`text-xs ${isOverdue ? 'text-error' : 'opacity-60'}`}>
                        {deadlineText}
                    </p>
                )}
            </div>
        </EntityCard>
    );
};
