'use client';

import type { TaskWithState } from '@/hooks/api/use-tasks';
import { useProgressHistory } from '@/hooks/api/use-tasks';
import { useTaskMutations } from '@/hooks/api/use-task-mutations';
import { TaskStatus } from '@/lib/constants/task';

type Props = {
    task: TaskWithState;
    onAddProgress: () => void;
};

export function TaskProgressCard({ task, onAddProgress }: Props) {
    const { progressMutation } = useTaskMutations();
    const { data: progressHistory = [] } = useProgressHistory(task.id, 10);

    const hasProgress = task.targetCount != null && task.targetCount > 0;
    if (!hasProgress) return null;

    const currentCount = task.currentCount ?? 0;
    const percentComplete = Math.min(100, Math.round((currentCount / task.targetCount!) * 100));
    const isCompleted = task.currentStatus === TaskStatus.DONE;

    return (
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
                            onClick={onAddProgress}
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
    );
}
