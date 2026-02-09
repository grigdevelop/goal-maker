'use client';

import type { TaskWithState } from '@/hooks/api/use-tasks';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';
import { useToast } from '@/components/ui/toast';
import { TaskStatus, TaskType, VALID_STATUS_TRANSITIONS } from '@/lib/constants/task';
import type { TaskStatus as TaskStatusType, TaskType as TaskTypeType } from '@/lib/constants/task';
import { STATUS_LABEL, TYPE_LABEL } from './constants';
import { DatePicker } from '@/components/ui/date-picker';

type Props = {
    task: TaskWithState;
};

export function TaskControls({ task }: Props) {
    const { updateMutation, statusMutation, deadlineMutation } = useTaskMutations();
    const { success, error } = useToast();

    const currentStatus = task.currentStatus as TaskStatusType;
    const nextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] ?? [];
    const showDeadline = task.type !== TaskType.CUSTOM;

    const deadlineValue = task.currentEndTime
        ? new Date(task.currentEndTime).toISOString().split('T')[0]
        : '';

    const handleStatusChange = (newStatus: TaskStatusType) => {
        statusMutation.mutate(
            { id: task.id, status: newStatus },
            {
                onSuccess: () => success(`Status changed to ${STATUS_LABEL[newStatus]}`),
                onError: (err) => error(err.message),
            }
        );
    };

    const handleDeadlineChange = (dateValue: string) => {
        deadlineMutation.mutate(
            { id: task.id, endTime: dateValue ? new Date(dateValue).toISOString() : null },
            {
                onSuccess: () => success(dateValue ? 'Deadline updated' : 'Deadline removed'),
                onError: (err) => error(err.message),
            }
        );
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as TaskTypeType;
        updateMutation.mutate(
            { id: String(task.id), data: { title: task.title, description: task.description, type: newType } },
            {
                onSuccess: () => success(`Type changed to ${TYPE_LABEL[newType]}`),
                onError: () => error('Failed to change type'),
            }
        );
    };

    return (
        <div className={`grid grid-cols-1 ${showDeadline ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4 mt-4`}>
            {/* Status control */}
            <div className="card card-border">
                <div className="card-body p-4">
                    <h3 className="font-semibold text-sm mb-2">Status</h3>
                    <div className="flex flex-wrap gap-2">
                        {nextStatuses.map((status) => (
                            <button
                                key={status}
                                className={`btn btn-sm ${status === TaskStatus.DONE ? 'btn-success' : status === TaskStatus.IN_PROGRESS ? 'btn-warning' : 'btn-ghost'}`}
                                onClick={() => handleStatusChange(status)}
                                disabled={statusMutation.isPending}
                            >
                                {statusMutation.isPending && <span className="loading loading-spinner loading-xs"></span>}
                                {STATUS_LABEL[status]}
                            </button>
                        ))}
                        {nextStatuses.length === 0 && (
                            <span className="text-sm opacity-50">No transitions available</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Deadline control — hidden for CUSTOM tasks */}
            {showDeadline && (
                <div className="card card-border">
                    <div className="card-body p-4">
                        <h3 className="font-semibold text-sm mb-2">Deadline</h3>
                        <DatePicker
                            value={deadlineValue || undefined}
                            onChange={handleDeadlineChange}
                            disabled={deadlineMutation.isPending}
                            placeholder="Set deadline"
                        />
                        {deadlineValue && (
                            <button
                                className="btn btn-ghost btn-xs mt-1"
                                onClick={() => deadlineMutation.mutate(
                                    { id: task.id, endTime: null },
                                    {
                                        onSuccess: () => success('Deadline removed'),
                                        onError: (err) => error(err.message),
                                    }
                                )}
                                disabled={deadlineMutation.isPending}
                            >
                                Clear deadline
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Type control */}
            <div className="card card-border">
                <div className="card-body p-4">
                    <h3 className="font-semibold text-sm mb-2">Type</h3>
                    <select
                        className="select select-sm select-bordered w-full"
                        value={task.type}
                        onChange={handleTypeChange}
                        disabled={updateMutation.isPending}
                    >
                        {Object.entries(TaskType).map(([key, value]) => (
                            <option key={key} value={value}>
                                {TYPE_LABEL[value]}
                            </option>
                        ))}
                    </select>
                    <span className="text-xs opacity-50 mt-1">
                        {task.type === TaskType.REGULAR && 'Simple task with optional deadline'}
                        {task.type === TaskType.REPEATABLE && 'Repeats on a schedule'}
                        {task.type === TaskType.CUSTOM && 'Active on specific dates'}
                    </span>
                </div>
            </div>
        </div>
    );
}
