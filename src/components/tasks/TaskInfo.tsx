'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { TaskWithState } from '@/hooks/api/use-tasks';
import { useTaskHistory, useProgressHistory } from '@/hooks/api/use-tasks';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { InlineEdit } from '@/components/ui/inline-edit';
import { useToast } from '@/components/ui/toast';
import { TaskStatus, TaskType, ScheduleType, VALID_STATUS_TRANSITIONS, ChangeReason } from '@/lib/constants/task';
import type { TaskStatus as TaskStatusType, TaskType as TaskTypeType, ScheduleType as ScheduleTypeType } from '@/lib/constants/task';
import {
    ScheduleConfigFields,
    parseScheduleToFormData,
    getDefaultScheduleFormData,
    scheduleFormDataToConfig,
    validateScheduleFormData,
} from './ScheduleConfigFields';
import type { ScheduleFormData } from './ScheduleConfigFields';
import { Trash } from 'lucide-react';

type Props = {
    task: TaskWithState;
}

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

const TYPE_LABEL: Record<string, string> = {
    [TaskType.REGULAR]: 'Regular',
    [TaskType.REPEATABLE]: 'Repeatable',
    [TaskType.CUSTOM]: 'Custom',
};

const REASON_LABEL: Record<string, string> = {
    [ChangeReason.INITIAL_CREATION]: 'Created',
    [ChangeReason.STATUS_CHANGE]: 'Status changed',
    [ChangeReason.SCHEDULE_MATCH]: 'Schedule activated',
    [ChangeReason.SCHEDULE_RESET]: 'Schedule reset',
    [ChangeReason.DEADLINE_UPDATE]: 'Deadline updated',
    [ChangeReason.TYPE_CHANGE]: 'Type changed',
    [ChangeReason.PROGRESS_UPDATE]: 'Progress updated',
};

export function TaskInfo({ task }: Props) {
    const router = useRouter();
    const { updateMutation, deleteMutation, statusMutation, deadlineMutation, scheduleMutation, deleteScheduleMutation, progressMutation } = useTaskMutations();
    const { data: history = [] } = useTaskHistory(task.id, 20);
    const { data: progressHistory = [] } = useProgressHistory(task.id, 10);
    const [showConfirm, setShowConfirm] = useState(false);
    const { success, error } = useToast();

    // Progress tracking state
    const progressDialogRef = useRef<HTMLDialogElement>(null);
    const [progressIncrement, setProgressIncrement] = useState<string>('1');
    const [progressNote, setProgressNote] = useState<string>('');
    const hasProgress = task.targetCount != null && task.targetCount > 0;
    const currentCount = task.currentCount ?? 0;
    const percentComplete = hasProgress ? Math.min(100, Math.round((currentCount / task.targetCount!) * 100)) : 0;
    const isCompleted = task.currentStatus === TaskStatus.DONE;

    const currentStatus = task.currentStatus as TaskStatusType;
    const nextStatuses = VALID_STATUS_TRANSITIONS[currentStatus] ?? [];
    const showDeadline = task.type !== TaskType.CUSTOM;
    const showSchedule = task.type === TaskType.REPEATABLE || task.type === TaskType.CUSTOM;

    const initialScheduleData = task.schedule
        ? parseScheduleToFormData(task.schedule.scheduleType, task.schedule.config)
        : getDefaultScheduleFormData(task.type === TaskType.CUSTOM ? ScheduleType.CUSTOM : undefined);

    const [scheduleData, setScheduleData] = useState<ScheduleFormData>(initialScheduleData);
    const [scheduleError, setScheduleError] = useState<string | null>(null);

    const handleSaveSchedule = () => {
        const dataToValidate = task.type === TaskType.CUSTOM
            ? { ...scheduleData, scheduleType: ScheduleType.CUSTOM as ScheduleTypeType }
            : scheduleData;
        const validationError = validateScheduleFormData(dataToValidate);
        if (validationError) {
            setScheduleError(validationError);
            return;
        }
        setScheduleError(null);
        const config = scheduleFormDataToConfig(dataToValidate);
        scheduleMutation.mutate(
            { id: task.id, scheduleType: dataToValidate.scheduleType as ScheduleTypeType, config },
            {
                onSuccess: () => success('Schedule saved'),
                onError: (err) => error(err.message),
            }
        );
    };

    const handleDeleteSchedule = () => {
        deleteScheduleMutation.mutate(task.id, {
            onSuccess: () => {
                success('Schedule removed');
                setScheduleData(getDefaultScheduleFormData(task.type === TaskType.CUSTOM ? ScheduleType.CUSTOM : undefined));
            },
            onError: (err) => error(err.message),
        });
    };

    const handleDelete = () => {
        if (!task) return;
        deleteMutation.mutate(String(task.id), {
            onSuccess: () => {
                success('Task deleted successfully');
                router.push('/tasks');
            },
            onError: () => {
                error('Failed to delete task');
                setShowConfirm(false);
            },
        });
    };

    const handleStatusChange = (newStatus: TaskStatusType) => {
        statusMutation.mutate(
            { id: task.id, status: newStatus },
            {
                onSuccess: () => success(`Status changed to ${STATUS_LABEL[newStatus]}`),
                onError: (err) => error(err.message),
            }
        );
    };

    const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        deadlineMutation.mutate(
            { id: task.id, endTime: value ? new Date(value).toISOString() : null },
            {
                onSuccess: () => success(value ? 'Deadline updated' : 'Deadline removed'),
                onError: (err) => error(err.message),
            }
        );
    };

    const handleAddProgress = () => {
        const inc = parseInt(progressIncrement, 10);
        if (isNaN(inc) || inc <= 0) return;
        progressMutation.mutate(
            { id: task.id, increment: inc, note: progressNote.trim() || null },
            {
                onSuccess: (result) => {
                    progressDialogRef.current?.close();
                    setProgressIncrement('1');
                    setProgressNote('');
                    if (result.statusChanged) {
                        success('Goal reached! Task marked as complete.');
                    } else {
                        success(`Progress updated: ${result.currentCount}/${result.targetCount}`);
                    }
                },
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

    const handleSaveTitle = useCallback(async (newTitle: string) => {
        if (!task) return;
        return new Promise<void>((resolve, reject) => {
            updateMutation.mutate(
                { id: String(task.id), data: { title: newTitle, description: task.description } },
                {
                    onSuccess: () => { success('Title updated'); resolve(); },
                    onError: () => { error('Failed to update title'); reject(new Error('Failed to update title')); },
                }
            );
        });
    }, [task, updateMutation, success, error]);

    const handleSaveDescription = useCallback(async (newDescription: string) => {
        if (!task) return;
        return new Promise<void>((resolve, reject) => {
            updateMutation.mutate(
                { id: String(task.id), data: { title: task.title, description: newDescription || null } },
                {
                    onSuccess: () => { success('Description updated'); resolve(); },
                    onError: () => { error('Failed to update description'); reject(new Error('Failed to update description')); },
                }
            );
        });
    }, [task, updateMutation, success, error]);

    const deadlineValue = task.currentEndTime
        ? new Date(task.currentEndTime).toISOString().split('T')[0]
        : '';

    return (
        <>
            {/* Main card */}
            <div className="card card-border">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`badge ${STATUS_BADGE[currentStatus] ?? 'badge-ghost'}`}>
                                    {STATUS_LABEL[currentStatus] ?? currentStatus}
                                </span>
                                <span className="badge badge-outline badge-sm">
                                    {TYPE_LABEL[task.type] ?? task.type}
                                </span>
                            </div>
                            <InlineEdit
                                value={task?.title ?? ''}
                                onSave={handleSaveTitle}
                                as="h1"
                                className="card-title text-2xl"
                            />
                            <div className="mt-2">
                                <InlineEdit
                                    value={task?.description ?? ''}
                                    onSave={handleSaveDescription}
                                    as="p"
                                    className="text-base"
                                    multiline
                                    required={false}
                                    placeholder="Add a description..."
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-error btn-sm"
                            onClick={() => setShowConfirm(true)}
                            disabled={deleteMutation.isPending}
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress tracking section */}
            {hasProgress && (
                <div className="card card-border mt-4">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm">Progress</h3>
                            <span className="text-sm font-mono">{currentCount} / {task.targetCount}</span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-4 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${percentComplete >= 100 ? 'bg-success' : percentComplete >= 50 ? 'bg-info' : 'bg-primary'
                                    }`}
                                style={{ width: `${percentComplete}%` }}
                            ></div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-60">{percentComplete}% complete</span>
                            {!isCompleted && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => progressDialogRef.current?.showModal()}
                                    disabled={progressMutation.isPending}
                                >
                                    Add Progress
                                </button>
                            )}
                            {isCompleted && percentComplete >= 100 && (
                                <span className="badge badge-success badge-sm">Goal reached!</span>
                            )}
                        </div>

                        {/* Recent progress entries */}
                        {progressHistory.length > 0 && (
                            <div className="mt-3 border-t border-base-300 pt-3">
                                <h4 className="text-xs font-semibold opacity-60 mb-2">Recent Updates</h4>
                                <div className="space-y-1.5">
                                    {progressHistory.slice(0, 5).map((entry) => (
                                        <div key={entry.id} className="flex items-start justify-between text-xs">
                                            <div className="flex-1">
                                                <span className="font-mono font-semibold">+{entry.progressIncrement}</span>
                                                <span className="opacity-50 ml-1">
                                                    (total: {entry.currentCount})
                                                </span>
                                                {entry.note && (
                                                    <p className="opacity-70 mt-0.5">{entry.note}</p>
                                                )}
                                            </div>
                                            <span className="opacity-40 ml-2 whitespace-nowrap">
                                                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Controls row */}
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
                            <input
                                type="date"
                                className="input input-sm input-bordered w-full"
                                value={deadlineValue}
                                onChange={handleDeadlineChange}
                                disabled={deadlineMutation.isPending}
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

            {/* Schedule config — shown for REPEATABLE and CUSTOM tasks */}
            {showSchedule && (
                <div className="card card-border mt-4">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-sm">
                                {task.type === TaskType.CUSTOM ? 'Custom Dates' : 'Schedule Configuration'}
                            </h3>
                            <div className="flex gap-2">
                                {task.schedule && (
                                    <button
                                        className="btn btn-ghost btn-xs text-error"
                                        onClick={handleDeleteSchedule}
                                        disabled={deleteScheduleMutation.isPending}
                                    >
                                        Remove
                                    </button>
                                )}
                                <button
                                    className="btn btn-primary btn-xs"
                                    onClick={handleSaveSchedule}
                                    disabled={scheduleMutation.isPending}
                                >
                                    {scheduleMutation.isPending && <span className="loading loading-spinner loading-xs"></span>}
                                    Save Schedule
                                </button>
                            </div>
                        </div>
                        <ScheduleConfigFields
                            value={task.type === TaskType.CUSTOM
                                ? { ...scheduleData, scheduleType: ScheduleType.CUSTOM }
                                : scheduleData
                            }
                            onChange={(data) => { setScheduleData(data); setScheduleError(null); }}
                            showScheduleTypeSelector={task.type === TaskType.REPEATABLE}
                            error={scheduleError}
                        />
                    </div>
                </div>
            )}

            {/* History timeline */}
            {history.length > 0 && (
                <div className="card card-border mt-4">
                    <div className="card-body p-4">
                        <h3 className="font-semibold text-sm mb-3">History</h3>
                        <ul className="timeline timeline-vertical timeline-compact">
                            {history.map((entry, i) => (
                                <li key={entry.id}>
                                    {i !== 0 && <hr />}
                                    <div className="timeline-start text-xs opacity-50">
                                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                        })}
                                    </div>
                                    <div className="timeline-middle">
                                        <div className={`w-2.5 h-2.5 rounded-full ${entry.status === TaskStatus.DONE ? 'bg-success' :
                                            entry.status === TaskStatus.IN_PROGRESS ? 'bg-warning' :
                                                'bg-base-300'
                                            }`}></div>
                                    </div>
                                    <div className="timeline-end timeline-box py-1.5 px-3">
                                        <span className={`badge badge-xs mr-1 ${STATUS_BADGE[entry.status] ?? ''}`}>
                                            {STATUS_LABEL[entry.status] ?? entry.status}
                                        </span>
                                        <span className="text-xs opacity-70">
                                            {REASON_LABEL[entry.changeReason ?? ''] ?? entry.changeReason ?? ''}
                                        </span>
                                    </div>
                                    {i !== history.length - 1 && <hr />}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Progress update dialog */}
            <dialog ref={progressDialogRef} className="modal" onClick={(e) => {
                if (e.target === progressDialogRef.current) progressDialogRef.current?.close();
            }}>
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Add Progress</h3>
                    <div className="space-y-3">
                        <fieldset className="fieldset">
                            <label className="label">How many did you complete?</label>
                            <input
                                type="number"
                                className="input input-sm input-bordered w-full"
                                min={1}
                                value={progressIncrement}
                                onChange={(e) => setProgressIncrement(e.target.value)}
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <label className="label">Note (optional)</label>
                            <textarea
                                className="textarea textarea-sm textarea-bordered w-full"
                                placeholder="e.g., Watched episodes 45-50"
                                value={progressNote}
                                onChange={(e) => setProgressNote(e.target.value)}
                            />
                        </fieldset>
                        {hasProgress && (
                            <div className="text-sm opacity-70 bg-base-200 rounded-lg p-2">
                                This will update progress to{' '}
                                <span className="font-semibold">
                                    {currentCount + (parseInt(progressIncrement, 10) || 0)}/{task.targetCount}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => progressDialogRef.current?.close()}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleAddProgress}
                                disabled={progressMutation.isPending || !progressIncrement || parseInt(progressIncrement, 10) <= 0}
                            >
                                {progressMutation.isPending && <span className="loading loading-spinner loading-xs"></span>}
                                Add Progress
                            </button>
                        </div>
                    </div>
                </div>
            </dialog>

            <ConfirmDialog
                open={showConfirm}
                title="Delete Task"
                message={`Are you sure you want to delete "${task?.title}"? This action cannot be undone.`}
                loading={deleteMutation.isPending}
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    )
}

export function TaskInfoLoading() {
    return (
        <div className="card card-border">
            <div className="card-body">
                <div className="skeleton h-8 w-3/4 mb-4"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-2/3"></div>
            </div>
        </div>
    )
}
